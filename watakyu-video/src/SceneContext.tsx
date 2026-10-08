import React, { createContext, useContext } from "react";
import { useCurrentFrame } from "remotion";
import type { SceneTiming } from "./timeline";
import { FPS } from "./theme";

const Ctx = createContext<SceneTiming | null>(null);
export const SceneProvider: React.FC<{ value: SceneTiming; children: React.ReactNode }> = ({ value, children }) => (
  <Ctx.Provider value={value}>{children}</Ctx.Provider>
);

/** シーン内の秒数と、ナレーションのキュー（字幕チャンク・区切りの開始秒） */
export const useScene = () => {
  const sc = useContext(Ctx)!;
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const dur = sc.durationInFrames / FPS;
  /** チャンク i の開始秒（frac: 0〜1 でチャンク内の位置） */
  const cue = (i: number, frac = 0) => {
    const c = sc.chunks[Math.min(i, sc.chunks.length - 1)];
    if (!c) return 0;
    return c.start + (c.end - c.start) * frac;
  };
  /** チャンク i の区切り j の開始秒 */
  const seg = (i: number, j: number, which: "start" | "end" = "start") => sc.chunks[i].segments[j][which];
  return { t, frame, dur, sc, cue, seg };
};
