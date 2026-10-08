// 確定台本と実際のタイミング（本編・全編）を script.md に書き出す
import { readFileSync, writeFileSync } from "node:fs";
const root = new URL("..", import.meta.url).pathname;
const script = JSON.parse(readFileSync(root + "src/data/script.json", "utf8"));
const timing = JSON.parse(readFileSync(root + "src/data/timing.json", "utf8"));
const f = (s) => `${Math.floor(s / 60)}:${(s % 60).toFixed(2).padStart(5, "0")}`;
const L = [];
L.push(`# 確定台本と実際のタイミング\n`);
L.push(`「${script.title} ― ${script.subtitle}」　${script.label}（情報：${script.infoDate}）\n`);
L.push(`- 音声：${script.voice.engine}／${script.voice.speaker}（${script.voice.style}, styleId ${script.voice.styleId}）／話速 ${script.voice.speedScale}・抑揚 ${script.voice.intonationScale}・間 ${script.voice.pauseLengthScale}（全シーン同一設定）`);
L.push(`- 各場面 = 音声前の余白 ${script.timing.leadIn}秒 + ナレーション実測 + 余白 ${script.timing.tail}秒。場面転換 0.6秒のクロスフェード`);
L.push(`- 本編のみ版は最終場面に出典表示のため 3.0秒、追加パート付き版は 1.2秒の静止を追加。APPENDIX 03（終了・出典）は 5.5秒`);
L.push(`- 時刻は「動画内の絶対時刻」。字幕の切り替え時刻は deliverables/ の SRT と同一\n`);
for (const v of ["main", "full"]) {
  let from = 0;
  L.push(`## ${v === "main" ? "本編のみ版（watakyu_main.mp4）" : "追加パート付き版（watakyu_full.mp4）"}\n`);
  L.push(`| 場面 | 開始 | 長さ | 画面キーワード |\n|---|---|---|---|`);
  const rows = [];
  for (const sc of script.scenes.filter((s) => v === "full" || s.part === "main")) {
    const t = timing[sc.id];
    let d = script.timing.leadIn + t.duration + script.timing.tail;
    if (sc.id === "scene08") d += v === "main" ? 3.0 : 1.2;
    const n = Math.round(d * 30);
    L.push(`| ${sc.id} | ${f(from / 30)} | ${(n / 30).toFixed(2)}秒 | ${sc.keyword} |`);
    rows.push({ sc, t, start: from / 30 });
    from += n;
  }
  if (v === "full") { L.push(`| appendix03 | ${f(from / 30)} | 5.50秒 | 終了・出典（ナレーションなし） |`); from += 165; }
  L.push(`\n総尺：${(from / 30).toFixed(2)}秒（${from}フレーム @30fps）\n`);
  if (v === "full") {
    L.push(`### ナレーション全文と字幕タイミング（全編）\n`);
    for (const { sc, t, start } of rows) {
      L.push(`#### ${sc.id}（音声ファイル public/${t.audio}・${t.duration.toFixed(2)}秒）\n`);
      L.push(`| 字幕 | 発話開始 | 発話終了 | 読み上げ用テキスト（TTS入力） |\n|---|---|---|---|`);
      for (const c of t.chunks) {
        const a = start + script.timing.leadIn + c.start, b = start + script.timing.leadIn + c.end;
        L.push(`| ${c.text} | ${f(a)} | ${f(b)} | ${c.segments.map((s) => s.tts).join(" ／ ")} |`);
      }
      L.push("");
    }
  }
}
writeFileSync(root + "script.md", L.join("\n") + "\n");
console.log("script.md written");
