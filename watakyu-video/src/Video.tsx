import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { buildCues, Subtitles } from "./components/Subtitles";
import { SceneProvider } from "./SceneContext";
import { A01 } from "./scenes/A01";
import { A02 } from "./scenes/A02";
import { A03 } from "./scenes/A03";
import { S01 } from "./scenes/S01";
import { S02 } from "./scenes/S02";
import { S03 } from "./scenes/S03";
import { S04 } from "./scenes/S04";
import { S05 } from "./scenes/S05";
import { S06 } from "./scenes/S06";
import { S07 } from "./scenes/S07";
import { S08 } from "./scenes/S08";
import { buildTimeline, totalFrames, type SceneId } from "./timeline";
import { C, FPS } from "./theme";

export const OVERLAP = 18; // 場面転換 0.6秒（次の場面がフェードインで重なる）

const SCENES: Record<SceneId, React.FC<{ version: "main" | "full" }>> = {
  scene01: S01, scene02: S02, scene03: S03, scene04: S04, scene05: S05, scene06: S06, scene07: S07,
  scene08: S08, appendix01: A01, appendix02: A02, appendix03: A03,
};


export const Video: React.FC<{ version: "main" | "full" }> = ({ version }) => {
  const tl = buildTimeline(version);
  const total = totalFrames(tl);
  const cues = buildCues(tl);
  const lastNarr = cues[cues.length - 1].end;
  // BGM：ナレーション中は下げる（ダッキング）、最後はフェードアウト
  const bgmVol = (f: number) => {
    const t = f / FPS;
    let duck = 0;
    for (const c of cues) {
      const d = interpolate(t, [c.start - 0.35, c.start, c.end, c.end + 0.5], [0, 1, 1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      duck = Math.max(duck, d);
    }
    const fadeIn = interpolate(t, [0, 1.5], [0, 1], { extrapolateRight: "clamp" });
    const fadeOut = interpolate(t, [total / FPS - 3.2, total / FPS - 0.2], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return 0.18 * (1 - 0.65 * duck) * fadeIn * fadeOut;
  };
  const se: { at: number; src: string; vol: number }[] = [];
  tl.forEach((s, i) => {
    if (i > 0) se.push({ at: s.from - 6, src: "se/whoosh.wav", vol: 0.16 });
  });
  const find = (id: SceneId) => tl.find((s) => s.id === id)!;
  const s02 = find("scene02");
  se.push({ at: s02.from + Math.round((s02.chunks[1].start + (s02.chunks[1].end - s02.chunks[1].start) * 0.3 + 0.35) * FPS), src: "se/chime.wav", vol: 0.12 });
  const s04 = find("scene04");
  se.push({ at: s04.from + Math.round((s04.chunks[4].start + 0.5) * FPS), src: "se/tick.wav", vol: 0.16 });
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {tl.map((s, i) => {
        const Comp = SCENES[s.id];
        const isLast = i === tl.length - 1;
        return (
          <Sequence key={s.id} from={s.from} durationInFrames={s.durationInFrames + (isLast ? 0 : OVERLAP)} name={s.id}>
            <SceneFade first={i === 0}>
              <SceneProvider value={s}>
                <Comp version={version} />
              </SceneProvider>
            </SceneFade>
            {s.audio && (
              <Sequence from={Math.round(s.audioOffset * FPS)} name={`${s.id} narration`}>
                <Audio src={staticFile(s.audio)} />
              </Sequence>
            )}
          </Sequence>
        );
      })}
      <Subtitles cues={cues} bandUntil={lastNarr} />
      <Audio src={staticFile("music/bgm.m4a")} volume={bgmVol} />
      {se.map((e, i) => (
        <Sequence key={i} from={Math.max(0, e.at)} durationInFrames={60} name="se">
          <Audio src={staticFile(e.src)} volume={e.vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

const SceneFade: React.FC<{ children: React.ReactNode; first: boolean }> = ({ children, first }) => {
  const f = useCurrentFrame();
  const o = first ? 1 : interpolate(f, [0, OVERLAP], [0, 1], { extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};
