#!/usr/bin/env python3
"""初版（v1）と修正版（v2）のナレーションが実際に違うことを確認する。

  python3 tools/compare_voices.py                       # シーン別 WAV の比較
  python3 tools/compare_voices.py deliverables/watakyu_main_v2.mp4 main   # 完成MP4にどちらの音声が入っているか

WAV 比較：ファイルのハッシュ、長さ、同じ位置で重ねたときの相関（1.0 に近いほど同じ音声）。
MP4 判定：各シーンの位置で v1 / v2 それぞれの WAV と相互相関をとり、どちらと一致するかを表示する。
"""
import hashlib
import json
import subprocess
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SR = 8000


def load(p) -> np.ndarray:
    r = subprocess.run(["ffmpeg", "-v", "error", "-i", str(p), "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"], capture_output=True).stdout
    return np.frombuffer(r, np.int16).astype(np.float32) / 32768


def best_corr(seg: np.ndarray, x: np.ndarray) -> float:
    """seg の中で x がいちばんよく一致する位置の相関係数"""
    if len(seg) < len(x):
        seg = np.pad(seg, (0, len(x) - len(seg)))
    n = 1 << (len(seg) + len(x)).bit_length()
    c = np.fft.irfft(np.fft.rfft(seg, n) * np.conj(np.fft.rfft(x, n)), n)[: len(seg) - len(x) + 1]
    k = int(np.argmax(c))
    y = seg[k: k + len(x)]
    return float(np.dot(x, y) / (np.linalg.norm(x) * np.linalg.norm(y) + 1e-9))


def compare_wavs():
    t1 = json.loads((ROOT / "src/data/timing.json").read_text())
    t2 = json.loads((ROOT / "src/data/timing_v2.json").read_text())
    print(f"{'scene':11s} {'v1 sec':>7s} {'v2 sec':>7s}  same_file  corr(v1,v2)")
    same_any = False
    for sid in t1:
        p1, p2 = ROOT / "public" / t1[sid]["audio"], ROOT / "public" / t2[sid]["audio"]
        h1, h2 = hashlib.md5(p1.read_bytes()).hexdigest(), hashlib.md5(p2.read_bytes()).hexdigest()
        a, b = load(p1), load(p2)
        r = best_corr(np.pad(b, (SR, SR)), a[: min(len(a), len(b))])
        same_any |= h1 == h2
        print(f"{sid:11s} {t1[sid]['duration']:7.2f} {t2[sid]['duration']:7.2f}  {str(h1 == h2):9s}  {r:.2f}")
    print("v1 と同一のファイル:", "あり" if same_any else "なし")


def which_voice(mp4: str, version: str):
    script = json.loads((ROOT / "src/data/script.json").read_text())
    t1 = json.loads((ROOT / "src/data/timing.json").read_text())
    t2 = json.loads((ROOT / "src/data/timing_v2.json").read_text())
    mix = load(mp4)
    hold = {"main": 3.0, "full": 1.2}[version]
    # v2 のタイムラインで各シーンの位置を求め、その付近で v1 / v2 の音声との一致度を見る
    frm, verdict = 0, []
    for sc in [s for s in script["scenes"] if version == "full" or s["part"] == "main"]:
        sid = sc["id"]
        tv = t2
        start = frm / 30 + script["timing"]["leadIn"]
        seg = mix[int(max(0, start - 8) * SR): int((start + max(t1[sid]["duration"], t2[sid]["duration"]) + 2) * SR)]  # v1 とは位置がずれるので前方 8 秒まで探す
        r1 = best_corr(seg, load(ROOT / "public" / t1[sid]["audio"]))
        r2 = best_corr(seg, load(ROOT / "public" / t2[sid]["audio"]))
        verdict.append("v2" if r2 > r1 else "v1")
        print(f"{sid:11s} corr v1 {r1:.2f}  v2 {r2:.2f}  → {verdict[-1]}")
        d = script["timing"]["leadIn"] + tv[sid]["duration"] + script["timing"]["tail"] + (hold if sid == "scene08" else 0)
        frm += round(d * 30)
    print("判定:", "全シーン v2" if all(v == "v2" for v in verdict) else "v1 が含まれる")


if __name__ == "__main__":
    if len(sys.argv) > 2:
        which_voice(sys.argv[1], sys.argv[2])
    else:
        compare_wavs()
