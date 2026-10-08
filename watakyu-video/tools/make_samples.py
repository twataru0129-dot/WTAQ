#!/usr/bin/env python3
"""ナレーション修正前後（v1 / v2）の比較用サンプルを作る。

  VOICEVOX_DIR=/opt/vv python3 tools/make_samples.py

出力 samples/:
  <n>_<名前>_v1_before.wav / _v2_after.wav   同じ箇所の修正前・修正後（どちらも -23 LUFS にそろえる）
  <n>_<名前>_compare.wav                      修正前 →（1秒）→ 修正後 を続けて再生
  pitch_compare.png                           声の高さ（F0）の比較グラフ
v1 は public/audio/<scene>.wav から該当範囲を切り出し、v2 は tools/tts.py と同じ設定で合成する。
"""
import json
import sys
import wave
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
import tts  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "samples"
SR = tts.SR
SAMPLES = [
    # (番号, 名前, シーン, v1 の字幕チャンク範囲, v2 の文番号)
    ("1", "question", "scene01", (1, 1), [2]),
    ("2", "company", "scene02", (0, 1), [0]),
    ("3", "numbers", "scene05", (0, 1), [0, 1]),
]


def read(p):
    with wave.open(str(p)) as w:
        return np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768


def level(x, lufs=-23.0):
    return x * 10 ** ((lufs - tts.loudness(x)) / 20)


def main():
    OUT.mkdir(exist_ok=True)
    script = json.loads((ROOT / "src/data/script.json").read_text())
    v = script["voiceV2"]
    t1 = json.loads((ROOT / "src/data/timing.json").read_text())
    syn = tts.load_synth(v["styleId"])
    pairs = []
    for n, name, sid, (c0, c1), sents in SAMPLES:
        sc = next(s for s in script["scenes"] if s["id"] == sid)
        old = read(ROOT / "public" / t1[sid]["audio"])
        a = t1[sid]["chunks"][c0]["start"] - 0.05
        b = t1[sid]["chunks"][c1]["end"] + 0.15
        v1 = level(old[int(max(0, a) * SR): int(b * SR)])
        pieces = []
        for i in sents:
            x, _, kana = tts.synth_sentence(syn, sc["speech"][i], v)
            print(f"{n} {name}: {kana}")
            pieces += [x, np.zeros(int(sc["speech"][i]["pause"] * SR), np.float32)]
        v2 = level(np.concatenate(pieces[:-1]))
        gap = np.zeros(SR, np.float32)
        tts.write_wav(OUT / f"{n}_{name}_v1_before.wav", v1)
        tts.write_wav(OUT / f"{n}_{name}_v2_after.wav", v2)
        tts.write_wav(OUT / f"{n}_{name}_compare.wav", np.concatenate([v1, gap, v2]))
        pairs.append((f"{n} {name}", v1, v2))
        print(f"   v1 {len(v1)/SR:.2f}s → v2 {len(v2)/SR:.2f}s")
    plot(pairs)


def plot(pairs):
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    import parselmouth

    fig, axes = plt.subplots(len(pairs), 1, figsize=(12, 3.2 * len(pairs)))
    for ax, (title, v1, v2) in zip(axes, pairs):
        for x, lab, col in ((v1, "v1 before", "#EE8A2E"), (v2, "v2 after", "#159A8C")):
            p = parselmouth.Sound(x.astype(np.float64), SR).to_pitch(time_step=0.01, pitch_floor=60, pitch_ceiling=300)
            f = p.selected_array["frequency"]
            f[f == 0] = np.nan
            ax.plot(p.xs(), f, label=lab, color=col, lw=2)
        ax.set_title(title)
        ax.set_ylabel("F0 [Hz]")
        ax.set_ylim(70, 230)
        ax.legend(loc="upper right")
    axes[-1].set_xlabel("time [s]")
    fig.tight_layout()
    fig.savefig(OUT / "pitch_compare.png", dpi=110)


if __name__ == "__main__":
    main()
