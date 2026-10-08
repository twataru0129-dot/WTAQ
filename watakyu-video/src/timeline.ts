import script from "./data/script.json";
import timing from "./data/timing.json";
import { FPS } from "./theme";

export type Segment = { tts: string; start: number; end: number };
export type Chunk = { text: string; start: number; end: number; segments: Segment[] };
export type SceneId =
  | "scene01" | "scene02" | "scene03" | "scene04" | "scene05" | "scene06" | "scene07" | "scene08"
  | "appendix01" | "appendix02" | "appendix03";

export type SceneTiming = {
  id: SceneId;
  keyword: string;
  from: number; // 開始フレーム（作品全体）
  durationInFrames: number;
  audioOffset: number; // シーン内で音声が始まる秒
  audio?: string;
  audioDuration: number;
  chunks: Chunk[]; // シーン内秒（audioOffset 加算済み）
};

const T = script.timing;
// 本編のみ版：最終場面に出典を読む時間を追加
export const MAIN_END_HOLD = 3.0;
// 追加パート付き版：最終場面のタイトル静止
export const FULL_SCENE08_HOLD = 1.2;
export const APPENDIX03_SEC = 5.5;

const sec2f = (s: number) => Math.round(s * FPS);

export const buildTimeline = (version: "main" | "full"): SceneTiming[] => {
  const tm = timing as Record<string, { audio: string; duration: number; chunks: Chunk[] }>;
  const ids = script.scenes
    .filter((s) => version === "full" || s.part === "main")
    .map((s) => s.id);
  let cursor = 0;
  const out: SceneTiming[] = [];
  for (const id of ids) {
    const sc = script.scenes.find((s) => s.id === id)!;
    const t = tm[id];
    let dur = T.leadIn + t.duration + T.tail;
    if (id === "scene08") dur += version === "main" ? MAIN_END_HOLD : FULL_SCENE08_HOLD;
    const frames = sec2f(dur);
    out.push({
      id: id as SceneId,
      keyword: sc.keyword,
      from: cursor,
      durationInFrames: frames,
      audioOffset: T.leadIn,
      audio: t.audio,
      audioDuration: t.duration,
      chunks: t.chunks.map((c) => ({
        ...c,
        start: c.start + T.leadIn,
        end: c.end + T.leadIn,
        segments: c.segments.map((g) => ({ ...g, start: g.start + T.leadIn, end: g.end + T.leadIn })),
      })),
    });
    cursor += frames;
  }
  if (version === "full") {
    const frames = sec2f(APPENDIX03_SEC);
    out.push({
      id: "appendix03", keyword: "", from: cursor, durationInFrames: frames,
      audioOffset: 0, audioDuration: 0, chunks: [],
    });
    cursor += frames;
  }
  return out;
};

export const totalFrames = (tl: SceneTiming[]) =>
  tl.reduce((a, s) => a + s.durationInFrames, 0);

export const meta = script;
