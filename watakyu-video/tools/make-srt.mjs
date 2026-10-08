// 字幕キュー（src/data/timing.json＝初版 v1、timing_v2.json＝修正版 v2）から本編・全編の SRT を書き出す
// タイミング計算は src/timeline.ts / Subtitles.tsx と同じ規則（leadIn・tail・最終場面の静止時間）
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
const root = new URL("..", import.meta.url).pathname;
const script = JSON.parse(readFileSync(root + "src/data/script.json", "utf8"));
const timings = {
  v1: JSON.parse(readFileSync(root + "src/data/timing.json", "utf8")),
  v2: JSON.parse(readFileSync(root + "src/data/timing_v2.json", "utf8")),
};
const FPS = 30;
const holds = { main: 3.0, full: 1.2 }; // timeline.ts の MAIN_END_HOLD / FULL_SCENE08_HOLD と一致させる
const ts = (s) => {
  const ms = Math.round(s * 1000);
  const p = (n, w = 2) => String(n).padStart(w, "0");
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`;
};
mkdirSync(root + "deliverables", { recursive: true });
for (const [voice, timing] of Object.entries(timings)) for (const v of ["main", "full"]) {
  let from = 0;
  const raw = [];
  for (const sc of script.scenes.filter((s) => v === "full" || s.part === "main")) {
    const t = timing[sc.id];
    for (const c of t.chunks) raw.push({ text: c.text, start: from / FPS + script.timing.leadIn + c.start, end: from / FPS + script.timing.leadIn + c.end });
    let d = script.timing.leadIn + t.duration + script.timing.tail;
    if (sc.id === "scene08") d += holds[v];
    from += Math.round(d * FPS);
  }
  const cues = raw.map((c, i) => {
    const next = raw[i + 1];
    return { text: c.text, start: Math.max(0, c.start - 0.08), end: next ? Math.min(c.end + 0.6, next.start - 0.08) : c.end + 0.6 };
  });
  const srt = cues.map((c, i) => `${i + 1}\n${ts(c.start)} --> ${ts(c.end)}\n${c.text}\n`).join("\n");
  const name = `watakyu_${v}${voice === "v1" ? "" : "_" + voice}.srt`; // v1 は初版のファイル名のまま
  writeFileSync(root + `deliverables/${name}`, srt);
  console.log(name, cues.length, "cues");
}
