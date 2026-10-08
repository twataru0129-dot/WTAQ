#!/usr/bin/env python3
"""BGM と効果音を numpy で合成する（外部音源・サンプル不使用、自作）。

出力: public/music/bgm.wav（約130秒。README の手順で bgm.m4a に変換して使用）, public/se/{whoosh,chime,tick}.wav
軽いピアノ風アルペジオ + 柔らかいパッド + 控えめなシェイカー。歌詞なし。
乱数シード固定なので、何度実行しても同じ音になる。
"""
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SR = 48000
rng = np.random.default_rng(7)


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def piano(freq, dur, vel=1.0):
    t = np.arange(int(dur * SR)) / SR
    env = np.exp(-t * 2.2) * (1 - np.exp(-t * 400))
    x = sum(a * np.sin(2 * np.pi * freq * k * t * (1 + 0.0004 * k)) for k, a in [(1, 1), (2, 0.35), (3, 0.12), (4, 0.05)])
    return x * env * vel


def pad(freqs, dur):
    t = np.arange(int(dur * SR)) / SR
    att = np.minimum(1, t / 1.2) * np.minimum(1, (dur - t) / 1.2)
    x = np.zeros_like(t)
    for f in freqs:
        for d in (-0.15, 0.15):
            ph = 2 * np.pi * (f + d) * t
            x += np.sin(ph) + 0.18 * np.sin(2 * ph) + 0.06 * np.sin(3 * ph)
    return x * att / len(freqs)


def lowpass(x, a):
    y = np.empty_like(x)
    acc = 0.0
    for i, v in enumerate(x):  # 一次IIR（短いバッファにのみ使用）
        acc += a * (v - acc)
        y[i] = acc
    return y


def reverb(x, secs=1.8, mix=0.25):
    n = int(secs * SR)
    ir = rng.standard_normal(n) * np.exp(-np.arange(n) / SR * 3.5)
    ir /= np.sqrt((ir ** 2).sum())
    L = len(x) + n
    nfft = 1 << (L - 1).bit_length()
    wet = np.fft.irfft(np.fft.rfft(x, nfft) * np.fft.rfft(ir, nfft), nfft)[: len(x)]
    return (1 - mix) * x + mix * wet


def write(path, x):
    path.parent.mkdir(parents=True, exist_ok=True)
    if x.ndim == 1:
        x = np.stack([x, x], 1)
    x = x / max(1e-9, np.abs(x).max()) * 0.89  # -1 dBFS ピーク
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())


def bgm(total=130.0, bpm=84):
    beat = 60 / bpm
    bar = beat * 4
    # Fmaj7 - Am7 - Dm7 - B♭maj7 / Fmaj7 - C/E - Dm7 - Gm7-C
    prog = [
        [53, 57, 60, 64], [57, 60, 64, 67], [50, 53, 57, 60], [46, 50, 53, 57],
        [53, 57, 60, 64], [52, 55, 60, 64], [50, 53, 57, 60], [55, 58, 62, 65],
    ]
    n = int(total * SR)
    L = np.zeros(n)
    R = np.zeros(n)
    nbars = int(total / bar) + 1
    for b in range(nbars):
        ch = prog[b % len(prog)]
        t0 = b * bar
        i0 = int(t0 * SR)
        if i0 >= n:
            break
        p = pad([midi(m) for m in ch], bar + 0.6) * 0.16
        e = min(n, i0 + len(p))
        L[i0:e] += p[: e - i0]
        R[i0:e] += p[: e - i0]
        bass = piano(midi(ch[0] - 12), bar, 0.42)
        e = min(n, i0 + len(bass))
        L[i0:e] += bass[: e - i0]
        R[i0:e] += bass[: e - i0]
        # 8分音符のアルペジオ（曲の頭16小節は音数を減らす）
        pattern = [0, 2, 1, 3, 2, 1, 3, 2] if b >= 2 else [0, None, 2, None, 1, None, 3, None]
        for k, idx in enumerate(pattern):
            if idx is None:
                continue
            f = midi(ch[idx] + 12)
            ts = t0 + k * beat / 2 + rng.uniform(-0.006, 0.006)
            v = 0.22 * (1.0 if k % 2 == 0 else 0.75) * rng.uniform(0.85, 1.0)
            note = piano(f, 1.6, v)
            j = int(ts * SR)
            if j >= n:
                continue
            e = min(n, j + len(note))
            pan = 0.5 + 0.25 * np.sin(k)
            L[j:e] += note[: e - j] * (1 - pan) * 2
            R[j:e] += note[: e - j] * pan * 2
        # 控えめなシェイカー（裏拍）
        if b >= 2:
            for k in range(4):
                ts = t0 + (k + 0.5) * beat
                m = int(0.07 * SR)
                s = rng.standard_normal(m) * np.exp(-np.arange(m) / SR * 60)
                s = np.diff(s, prepend=0) * 0.05
                j = int(ts * SR)
                if j >= n:
                    continue
                e = min(n, j + m)
                L[j:e] += s[: e - j]
                R[j:e] += s[: e - j] * 0.8
    L = reverb(L)
    R = reverb(R)
    return np.stack([L, R], 1)


def whoosh(d=0.6):
    m = int(d * SR)
    t = np.arange(m) / SR
    x = rng.standard_normal(m)
    a = 0.02 + 0.25 * np.sin(np.pi * t / d) ** 2
    y = np.empty(m)
    acc = 0.0
    for i in range(m):
        acc += a[i] * (x[i] - acc)
        y[i] = acc
    return y * np.sin(np.pi * t / d) ** 2


def chime():
    a = piano(midi(84), 1.4, 0.8) + np.pad(piano(midi(91), 1.31, 0.6), (int(0.09 * SR), 0))[: int(1.4 * SR)]
    return reverb(a, 1.2, 0.3)


def tick():
    m = int(0.09 * SR)
    t = np.arange(m) / SR
    return np.sin(2 * np.pi * 1400 * t) * np.exp(-t * 70) + 0.3 * np.sin(2 * np.pi * 2800 * t) * np.exp(-t * 90)


if __name__ == "__main__":
    write(ROOT / "public/music/bgm.wav", bgm())
    write(ROOT / "public/se/whoosh.wav", whoosh())
    write(ROOT / "public/se/chime.wav", chime())
    write(ROOT / "public/se/tick.wav", tick())
    print("ok")
