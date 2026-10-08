#!/usr/bin/env python3
"""書き出したMP4の音声から各シーンのナレーション位置を相互相関で探し、
タイムライン（＝字幕）の想定位置とのずれ、および音声末尾が切れていないかを確認する。
使い方: python3 tools/verify_sync.py deliverables/watakyu_full_v2.mp4 full [v2|v1]
"""
import json, subprocess, sys, wave
from pathlib import Path
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SR = 8000
mp4, version = sys.argv[1], sys.argv[2]
voice = sys.argv[3] if len(sys.argv) > 3 else "v2"
script = json.loads((ROOT / "src/data/script.json").read_text())
timing = json.loads((ROOT / ("src/data/timing.json" if voice == "v1" else "src/data/timing_v2.json")).read_text())
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", mp4, "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"], capture_output=True).stdout
mix = np.frombuffer(raw, np.int16).astype(np.float32) / 32768

def load(p):
    r = subprocess.run(["ffmpeg", "-v", "error", "-i", str(p), "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"], capture_output=True).stdout
    return np.frombuffer(r, np.int16).astype(np.float32) / 32768

frm = 0
worst = 0.0
for sc in [s for s in script["scenes"] if version == "full" or s["part"] == "main"]:
    t = timing[sc["id"]]
    expect = frm / 30 + script["timing"]["leadIn"]
    x = load(ROOT / "public" / t["audio"])
    # 想定位置の前後1秒を探索
    a = int((expect - 1) * SR)
    seg = mix[max(0, a): a + len(x) + 2 * SR]
    n = 1 << (len(seg) + len(x)).bit_length()
    c = np.fft.irfft(np.fft.rfft(seg, n) * np.conj(np.fft.rfft(x, n)), n)[: len(seg) - len(x) + 1]
    k = int(np.argmax(c))
    found = (max(0, a) + k) / SR
    # 相関係数（同じ音声がそのまま入っているかの目安）
    y = seg[k: k + len(x)]
    r = float(np.dot(x, y) / (np.linalg.norm(x) * np.linalg.norm(y) + 1e-9))
    end_ok = found + t["duration"] <= len(mix) / SR
    d = (found - expect) * 1000
    worst = max(worst, abs(d))
    print(f"{sc['id']:11s} expected {expect:7.3f}s  found {found:7.3f}s  diff {d:+6.1f} ms  corr {r:.2f}  ends_in_video {end_ok}")
    d_scene = script["timing"]["leadIn"] + t["duration"] + script["timing"]["tail"]
    if sc["id"] == "scene08":
        d_scene += 3.0 if version == "main" else 1.2
    frm += round(d_scene * 30)
print(f"max |diff| = {worst:.1f} ms")
