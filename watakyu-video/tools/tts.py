#!/usr/bin/env python3
"""シーン別ナレーションを VOICEVOX Core で生成し、字幕タイミングを書き出す。

使い方:
  VOICEVOX_DIR=/opt/vv python3 tools/tts.py            # 全シーン
  VOICEVOX_DIR=/opt/vv python3 tools/tts.py scene05    # 指定シーンのみ再生成

入力:  src/data/script.json   （字幕文 text と読み上げ用 tts を分けて管理）
出力:  public/audio/<scene>.wav, src/data/timing.json, tools/readings.txt（読みの確認用）

VOICEVOX_DIR 以下に次がある前提（README 参照）:
  voicevox_onnxruntime-linux-x64-1.17.3/lib/libvoicevox_onnxruntime.so.1.17.3
  open_jtalk_dic_utf_8-1.11/
  vvms/4.vvm  （玄野武宏 ノーマル styleId 11 を含むモデル）
APIキー等の認証情報は不要（ローカル推論）。
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
TARGET_LUFS = -24.0  # シーン間の音量差をなくすため、各シーンをこの値にそろえる（最終ミックスで -16 LUFS に正規化）


def load_synth(style_id: int):
    from voicevox_core.blocking import Onnxruntime, OpenJtalk, Synthesizer, VoiceModelFile

    ort = Onnxruntime.load_once(
        filename=str(VV / "voicevox_onnxruntime-linux-x64-1.17.3/lib/libvoicevox_onnxruntime.so.1.17.3")
    )
    syn = Synthesizer(ort, OpenJtalk(str(VV / "open_jtalk_dic_utf_8-1.11")))
    for f in sorted((VV / "vvms").glob("*.vvm")):
        with VoiceModelFile.open(str(f)) as m:
            if any(s.id == style_id for c in m.metas for s in c.styles):
                syn.load_voice_model(m)
                return syn
    raise SystemExit(f"styleId {style_id} を含む .vvm が {VV/'vvms'} に見つかりません")


def wav_to_np(b: bytes) -> np.ndarray:
    with wave.open(io.BytesIO(b)) as w:
        assert w.getframerate() == SR and w.getnchannels() == 1
        return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768


def trim(x: np.ndarray, thr=0.004) -> np.ndarray:
    """前後の無音を除去（発話の頭・末尾は削らないよう 30ms 余裕を残す）。"""
    idx = np.where(np.abs(x) > thr)[0]
    if len(idx) == 0:
        return x
    pad = int(0.03 * SR)
    return x[max(0, idx[0] - pad): min(len(x), idx[-1] + pad)]


def loudness(x: np.ndarray) -> float:
    """ffmpeg の ebur128 で統合ラウドネス（LUFS）を測る"""
    raw = (np.clip(x, -1, 1) * 32767).astype("<i2").tobytes()
    r = subprocess.run(
        ["ffmpeg", "-hide_banner", "-nostats", "-f", "s16le", "-ar", str(SR), "-ac", "1", "-i", "-",
         "-af", "ebur128=framelog=quiet", "-f", "null", "-"],
        input=raw, capture_output=True,
    )
    return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", r.stderr.decode())[-1])


def kana_of(q) -> str:
    out = []
    for ap in q.accent_phrases:
        out.append("".join(m.text for m in ap.moras) + ("？" if ap.is_interrogative else ""))
        if ap.pause_mora:
            out.append("、")
    return "/".join(out)


def main():
    script = json.loads((ROOT / "src/data/script.json").read_text())
    v = script["voice"]
    only = set(sys.argv[1:])
    syn = load_synth(v["styleId"])
    timing_path = ROOT / "src/data/timing.json"
    timing = json.loads(timing_path.read_text()) if timing_path.exists() else {}
    readings = []
    for sc in script["scenes"]:
        if only and sc["id"] not in only:
            continue
        pieces, chunks_t, t = [], [], 0.0
        for ch in sc["chunks"]:
            start = t
            segs = []
            for text, pause in ch["tts"]:
                q = syn.create_audio_query(text, v["styleId"])
                q.speed_scale = v["speedScale"]
                q.pitch_scale = v["pitchScale"]
                q.intonation_scale = v["intonationScale"]
                q.volume_scale = v["volumeScale"]
                q.pause_length_scale = v["pauseLengthScale"]
                q.pre_phoneme_length = 0.05
                q.post_phoneme_length = 0.05
                q.output_sampling_rate = SR
                readings.append(f"{sc['id']}\t{text}\t{kana_of(q)}")
                x = trim(wav_to_np(syn.synthesis(q, v["styleId"])))
                pieces.append(x)
                segs.append({"tts": text, "start": round(t, 3), "end": round(t + len(x) / SR, 3)})
                t += len(x) / SR
                end = t
                pieces.append(np.zeros(int(pause * SR), dtype=np.float32))
                t += pause
            chunks_t.append({"text": ch["text"], "start": round(start, 3), "end": round(end, 3), "segments": segs})
        audio = np.concatenate(pieces)
        gain = 10 ** ((TARGET_LUFS - loudness(audio)) / 20)
        gain = min(gain, 0.89 / np.abs(audio).max())  # ピークは -1 dBFS 以下
        audio = audio * gain
        # 末尾の無音（最後の pause）は timing 側で tail として扱うので残す
        out = ROOT / "public/audio" / f"{sc['id']}.wav"
        with wave.open(str(out), "wb") as w:
            w.setnchannels(1)
            w.setsampwidth(2)
            w.setframerate(SR)
            w.writeframes((np.clip(audio, -1, 1) * 32767).astype(np.int16).tobytes())
        timing[sc["id"]] = {"audio": f"audio/{sc['id']}.wav", "duration": round(len(audio) / SR, 3), "chunks": chunks_t}
        print(f"{sc['id']}: {len(audio)/SR:.2f}s  peak={np.abs(audio).max():.2f}")
    timing_path.write_text(json.dumps(timing, ensure_ascii=False, indent=2))
    if not only:
        (ROOT / "tools/readings.txt").write_text("\n".join(readings) + "\n")


if __name__ == "__main__":
    main()
