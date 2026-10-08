// 各シーンの開始フレームと長さを表示（静止画確認用）
import script from "../src/data/script.json" with { type: "json" };
import timing from "../src/data/timing.json" with { type: "json" };
const v = process.argv[2] || "full";
let f = 0;
for (const s of script.scenes.filter((s) => v === "full" || s.part === "main")) {
  let d = script.timing.leadIn + timing[s.id].duration + script.timing.tail;
  if (s.id === "scene08") d += v === "main" ? 3.0 : 1.2;
  const n = Math.round(d * 30);
  console.log(s.id, f, n);
  f += n;
}
console.log("appendix03", f, v === "full" ? 165 : 0);
