#!/usr/bin/env python3
"""ナレーション v2：アクセント・句切り・文末抑揚を調整して VOICEVOX Core で生成する。

使い方:
  VOICEVOX_DIR=/opt/vv python3 tools/tts.py              # 全シーン
  VOICEVOX_DIR=/opt/vv python3 tools/tts.py scene05      # 指定シーンのみ
  VOICEVOX_DIR=/opt/vv python3 tools/tts.py --check      # 読み・アクセントの一覧だけ出力（合成しない）

入力:
  src/data/script.json        scenes[].speech（文ごとの読み上げ）と voiceV2（声と抑揚補正の設定）
                              字幕は scenes[].chunks[].text。読み上げ用カナは字幕に出ない
  src/data/pronunciation.json 固有名詞のユーザー辞書（毎回 OpenJTalk に登録）
出力:
  public/audio/v2/<scene>.wav, src/data/timing_v2.json, tools/readings_v2.txt

調整のしくみ
  1. 文（speech[]）を合成の単位にする。文の中の parts は「、」でつなぎ、1回で合成するので
     字幕の切り替えごとに音声をつながない（つなぎ目は文と文の間の無音だけ）。
  2. parts[].kana があれば AquesTalk 風記法で読みとアクセントを直接指定する
       '  アクセント核（その直後で下がる。句末に置くと平板）
       /  アクセント句の区切り（息継ぎなし）   、 区切り＋短い間   _ 無声化
     kana が無い場合は parts[].text をユーザー辞書つきで自動解析する。
     kana 中の | は合成には使わない目印で、アニメーションのきっかけ（segments）の区切りになる。
  3. 合成前に抑揚を補正する（voiceV2）
       peakKnee/Ratio 文の中央値より高すぎる山を圧縮し、単語ごとの大きな上下を抑える
       sentenceDecl   文の後ろの句ほどわずかに低くする（上限 sentenceDeclMax）
       phraseDecl     句の中でモーラごとにわずかに下げ、長い数字などで高い平坦が続かないようにする
       particleClamp  平板の句の末尾の助詞が前の音より高く跳ねないようにそろえる
       endFall        説明文の文末2モーラを少し下げて穏やかに収める（自然対数の高さで指定）
       endStretch     文末モーラをわずかに伸ばす
       question       疑問文だけ最後のモーラを questionRise だけ上げて伸ばす（エンジンの上昇調付加は使わない）
  4. 字幕の切り替え時刻は、各 part の最後のモーラの終わり／次の part の最初のモーラの始まりを
     AudioQuery の音素長から計算する。
"""
import io
import json
import os
import re
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
VV = Path(os.environ.get("VOICEVOX_DIR", "/opt/vv"))
SR = 48000
TARGET_LUFS = -24.0  # シーン間の音量をそろえる（最終ミックスで -16 LUFS に正規化）
OUT_DIR = ROOT / "public/audio/v2"
PARTICLES = set("ワガオニデノモトエヤ")


def load_synth(style_id: int):
    from voicevox_core import UserDictWord
    from voicevox_core.blocking import Onnxruntime, OpenJtalk, Synthesizer, UserDict, VoiceModelFile

    ort = Onnxruntime.load_once(
        filename=str(VV / "voicevox_onnxruntime-linux-x64-1.17.3/lib/libvoicevox_onnxruntime.so.1.17.3")
    )
    ojt = OpenJtalk(str(VV / "open_jtalk_dic_utf_8-1.11"))
    ud = UserDict()
    for w in json.loads((ROOT / "src/data/pronunciation.json").read_text())["words"]:
        ud.add_word(UserDictWord(w["surface"], w["pronunciation"], w["accent_type"], w["word_type"], w.get("priority", 8)))
    ojt.use_user_dict(ud)
    syn = Synthesizer(ort, ojt)
    for f in sorted((VV / "vvms").glob("*.vvm")):
        with VoiceModelFile.open(str(f)) as m:
            if any(s.id == style_id for c in m.metas for s in c.styles):
                syn.load_voice_model(m)
                return syn
    raise SystemExit(f"styleId {style_id} を含む .vvm が {VV/'vvms'} に見つかりません")


def to_kana(phrases) -> str:
    """AccentPhrase 列を AquesTalk 風記法に戻す（確認表示用）"""
    out = ""
    for i, a in enumerate(phrases):
        for j, m in enumerate(a.moras):
            out += ("_" if m.vowel in "AIUEO" else "") + m.text + ("'" if j + 1 == a.accent else "")
        if i < len(phrases) - 1:
            out += "、" if a.pause_mora else "/"
    return out


def n_phrases(kana: str) -> int:
    return len(re.split(r"[/、]", kana.replace("|", "").strip("/、")))


def seg_counts(kana: str) -> list[int]:
    """| で区切った各区間のアクセント句数"""
    return [n_phrases(k) for k in kana.split("|")]


def adjust(phrases, v, question: bool):
    """抑揚の補正（AccentPhrase の pitch / vowel_length を直接編集）。pitch は自然対数の高さ"""
    voiced_p = [m.pitch for a in phrases for m in a.moras if m.pitch > 0]
    med = float(np.median(voiced_p)) if voiced_p else 0.0
    knee, ratio = v["peakKnee"], v["peakRatio"]
    for i, a in enumerate(phrases):
        drift = min(v["sentenceDeclMax"], v["sentenceDecl"] * i)  # 文の後半ほど少し低く（自然な下降）
        for j, m in enumerate(a.moras):
            if m.pitch <= 0:
                continue
            d = m.pitch - med
            if d > knee:  # 単語ごとの大きな山を穏やかに（中央値より knee 以上高い部分を ratio 倍に圧縮）
                d = knee + (d - knee) * ratio
            m.pitch = med + d - drift - v["phraseDecl"] * j  # 句の中でも少しずつ下げ、高い平坦が続かないように
    if v.get("particleClamp"):
        for a in phrases:
            ms = a.moras
            if len(ms) >= 2 and a.accent == len(ms) and ms[-1].text in PARTICLES and ms[-1].pitch > 0 and ms[-2].pitch > 0:
                ms[-1].pitch = min(ms[-1].pitch, ms[-2].pitch)
    last = phrases[-1].moras
    vs = [m for m in last if m.pitch > 0]
    if question:
        if len(vs) >= 2:
            vs[-1].pitch = max(vs[-1].pitch, vs[-2].pitch) + v["questionRise"]
            vs[-1].vowel_length *= v["questionStretch"]
    else:
        f1, f2 = v["endFall"]
        if len(vs) >= 2:
            vs[-2].pitch -= f1
        if vs:
            vs[-1].pitch -= f2
        last[-1].vowel_length *= v["endStretch"]
    return phrases


def pause_len(a) -> float:
    """句末の間の長さ（pause_mora は dict で返る場合がある）"""
    pm = a.pause_mora
    if not pm:
        return 0.0
    return pm["vowel_length"] if isinstance(pm, dict) else pm.vowel_length


def scale_pause(a, k: float):
    pm = a.pause_mora
    if isinstance(pm, dict):
        pm["vowel_length"] *= k
    elif pm:
        pm.vowel_length *= k


def phrase_times(q):
    """各アクセント句の（開始, 終了, 次の句の開始）秒を返す（speed_scale を反映）"""
    t = q.pre_phoneme_length
    out = []
    for a in q.accent_phrases:
        s = t
        for m in a.moras:
            t += (m.consonant_length or 0) + m.vowel_length
        e = t
        t += pause_len(a)
        out.append((s / q.speed_scale, e / q.speed_scale, t / q.speed_scale))
    return out


def loudness(x: np.ndarray) -> float:
    raw = (np.clip(x, -1, 1) * 32767).astype("<i2").tobytes()
    r = subprocess.run(
        ["ffmpeg", "-hide_banner", "-nostats", "-f", "s16le", "-ar", str(SR), "-ac", "1", "-i", "-",
         "-af", "ebur128=framelog=quiet", "-f", "null", "-"],
        input=raw, capture_output=True,
    )
    return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", r.stderr.decode())[-1])


def wav_to_np(b: bytes) -> np.ndarray:
    with wave.open(io.BytesIO(b)) as w:
        assert w.getframerate() == SR and w.getnchannels() == 1
        return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768


def make_query(syn, sentence, v):
    sid = v["styleId"]
    parts = sentence["parts"]
    if all("kana" in p for p in parts):
        kana = "、".join(p["kana"].replace("|", "") for p in parts)
        q = syn.create_audio_query_from_kana(kana, sid)
        counts = [n_phrases(p["kana"]) for p in parts]
    else:  # 辞書つき自動解析（part ごとの句数は個別解析で求める）
        q = syn.create_audio_query("、".join(p["text"].rstrip("。？") for p in parts), sid)
        counts = [len(syn.create_accent_phrases(p["text"], sid)) for p in parts]
    q.speed_scale = v["speedScale"]
    q.pitch_scale = v["pitchScale"]
    q.intonation_scale = v["intonationScale"]
    q.volume_scale = v["volumeScale"]
    q.pause_length_scale = v["pauseLengthScale"]
    q.pre_phoneme_length = v["prePhonemeLength"]
    q.post_phoneme_length = v["postPhonemeLength"]
    q.output_sampling_rate = SR
    q.accent_phrases = adjust(q.accent_phrases, v, sentence.get("question", False))
    assert sum(counts) == len(q.accent_phrases), (sentence, counts, len(q.accent_phrases))
    return q, counts


def synth_sentence(syn, sentence, v):
    q, counts = make_query(syn, sentence, v)
    # pause_length_scale は句間の無音に効くので、時刻計算にも反映する
    for a in q.accent_phrases:
        scale_pause(a, q.pause_length_scale)
    q.pause_length_scale = 1.0
    x = wav_to_np(syn.synthesis(q, v["styleId"], enable_interrogative_upspeak=False))
    pt = phrase_times(q)
    spans, k = [], 0
    for p, n in zip(sentence["parts"], counts):
        segs, kk = [], k
        for m in seg_counts(p["kana"]) if "kana" in p else [n]:
            segs.append((pt[kk][0], pt[kk + m - 1][1]))
            kk += m
        spans.append((pt[k][0], pt[k + n - 1][1], segs))
        k += n
    return x, spans, to_kana(q.accent_phrases)


def build_scene(syn, sc, v, readings=None):
    """シーン1つ分：文を合成して無音でつなぎ、字幕チャンクの時刻を返す"""
    pieces, t = [], 0.0
    ch_t: dict[int, list[float]] = {}
    ch_seg: dict[int, list[dict]] = {}
    for sent in sc["speech"]:
        x, spans, kana = synth_sentence(syn, sent, v)
        for p, (s, e, segs) in zip(sent["parts"], spans):
            c = ch_t.setdefault(p["chunk"], [t + s, t + e])
            c[0] = min(c[0], t + s)
            c[1] = max(c[1], t + e)
            texts = p.get("kana", p["text"]).split("|")
            for (a, b), tx in zip(segs, texts):
                ch_seg.setdefault(p["chunk"], []).append({"tts": tx.strip("/、"), "start": round(t + a, 3), "end": round(t + b, 3)})
        if readings is not None:
            readings.append(f"{sc['id']}\t{''.join(p['text'] for p in sent['parts'])}\t{kana}")
        pieces += [x, np.zeros(int(sent["pause"] * SR), np.float32)]
        t += len(x) / SR + sent["pause"]
    audio = np.concatenate(pieces)
    chunks = [{"text": c["text"], "start": round(ch_t[i][0], 3), "end": round(ch_t[i][1], 3), "segments": ch_seg[i]}
              for i, c in enumerate(sc["chunks"])]
    return audio, chunks


def normalize(audio):
    g = 10 ** ((TARGET_LUFS - loudness(audio)) / 20)
    return audio * min(g, 0.89 / np.abs(audio).max())


def write_wav(path: Path, audio):
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(audio, -1, 1) * 32767).astype(np.int16).tobytes())


def check(syn, script):
    """辞書登録した語の読み・アクセントと、各文の最終的な読みを確認する"""
    v = script["voiceV2"]
    print("== ユーザー辞書の確認（自動解析の結果 → 期待値）")
    for w in json.loads((ROOT / "src/data/pronunciation.json").read_text())["words"]:
        got = to_kana(syn.create_accent_phrases(w["surface"], v["styleId"]))
        print(f"  {'OK ' if got == w['check_kana'] else 'NG '} {w['surface']}: {got}  (期待 {w['check_kana']})")
    print("== 各文の読みとアクセント")
    for sc in script["scenes"]:
        for sent in sc["speech"]:
            q, _ = make_query(syn, sent, v)
            print(f"  {sc['id']}: {to_kana(q.accent_phrases)}")


def main():
    script = json.loads((ROOT / "src/data/script.json").read_text())
    v = script["voiceV2"]
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    syn = load_synth(v["styleId"])
    if "--check" in sys.argv:
        check(syn, script)
        return
    timing_path = ROOT / "src/data/timing_v2.json"
    timing = json.loads(timing_path.read_text()) if timing_path.exists() else {}
    readings = []
    for sc in script["scenes"]:
        if args and sc["id"] not in args:
            continue
        audio, chunks = build_scene(syn, sc, v, readings)
        audio = normalize(audio)
        write_wav(OUT_DIR / f"{sc['id']}.wav", audio)
        timing[sc["id"]] = {"audio": f"audio/v2/{sc['id']}.wav", "duration": round(len(audio) / SR, 3), "chunks": chunks}
        print(f"{sc['id']}: {len(audio)/SR:.2f}s")
    timing_path.write_text(json.dumps(timing, ensure_ascii=False, indent=2))
    if not args:
        (ROOT / "tools/readings_v2.txt").write_text("\n".join(readings) + "\n")


if __name__ == "__main__":
    main()
