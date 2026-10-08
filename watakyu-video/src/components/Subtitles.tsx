import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import type { SceneTiming } from "../timeline";
import { C, FONT, FPS, SAFE, SUB_BAND } from "../theme";

export type Cue = { text: string; start: number; end: number };

/** タイムライン全体から字幕キュー（絶対秒）を作る。表示は次のキュー開始 or 発話終了+0.6秒まで */
export const buildCues = (tl: SceneTiming[]): Cue[] => {
  const raw: Cue[] = [];
  for (const s of tl) {
    for (const c of s.chunks) raw.push({ text: c.text, start: s.from / FPS + c.start, end: s.from / FPS + c.end });
  }
  return raw.map((c, i) => {
    const next = raw[i + 1];
    const hold = c.end + 0.6;
    return { text: c.text, start: Math.max(0, c.start - 0.08), end: next ? Math.min(hold, next.start - 0.08) : hold };
  });
};

export const Subtitles: React.FC<{ cues: Cue[]; bandUntil: number }> = ({ cues, bandUntil }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const cue = cues.find((c) => t >= c.start && t < c.end);
  const first = cues[0]?.start ?? 0;
  const band = interpolate(t, [first - 0.6, first - 0.2, bandUntil, bandUntil + 0.5], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fade = cue ? Math.min(1, (t - cue.start) / 0.12, (cue.end - t) / 0.12) : 0;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: SUB_BAND.top,
        height: SUB_BAND.height,
        background: "rgba(11,37,69,0.9)",
        opacity: band,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: SAFE.x,
          right: SAFE.x,
          top: 10,
          height: SUB_BAND.height - 10 - SAFE.bottom,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          color: C.white,
          fontFamily: FONT,
          fontWeight: 500,
          fontSize: 52,
          lineHeight: 1.22,
          letterSpacing: 1,
          whiteSpace: "pre-line",
          opacity: fade,
        }}
      >
        {cue?.text}
      </div>
    </div>
  );
};
