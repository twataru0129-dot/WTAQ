// 確定台本と実際のタイミング（本編・全編）を書き出す: node tools/make-script-md.mjs [v2|v1]
import { readFileSync, writeFileSync } from "node:fs";
const root = new URL("..", import.meta.url).pathname;
const script = JSON.parse(readFileSync(root + "src/data/script.json", "utf8"));
const voice = process.argv[2] || "v2"; // v2＝修正版（script.md）、v1＝初版（script_v1.md）
const timing = JSON.parse(readFileSync(root + (voice === "v1" ? "src/data/timing.json" : "src/data/timing_v2.json"), "utf8"));
const V = voice === "v1" ? script.voice : script.voiceV2;
const sfx = voice === "v1" ? "" : "_v2";
const f = (s) => `${Math.floor(s / 60)}:${(s % 60).toFixed(2).padStart(5, "0")}`;
const L = [];
L.push(`# 確定台本と実際のタイミング（ナレーション ${voice === "v1" ? "初版 v1・比較用" : "修正版 v2"}）\n`);
L.push(`「${script.title} ― ${script.subtitle}」　${script.label}（情報：${script.infoDate}）\n`);
L.push(`- 音声：${V.engine}／${V.speaker}（${V.style}, styleId ${V.styleId}）／話速 ${V.speedScale}・抑揚 ${V.intonationScale}・間 ${V.pauseLengthScale}（全シーン同一設定）`);
if (voice !== "v1") L.push(`- 読みとアクセントは文ごとに指定（下表の「読み上げ用カナ」。' はアクセント核、/ は句の区切り、、は間、_ は無声化、| はアニメーションのきっかけの目印で発音しない）。固有名詞は src/data/pronunciation.json に辞書登録`);
L.push(`- 各場面 = 音声前の余白 ${script.timing.leadIn}秒 + ナレーション実測 + 余白 ${script.timing.tail}秒。場面転換 0.6秒のクロスフェード`);
L.push(`- 本編のみ版は最終場面に出典表示のため 3.0秒、追加パート付き版は 1.2秒の静止を追加。APPENDIX 03（終了・出典）は 5.5秒`);
L.push(`- 時刻は「動画内の絶対時刻」。字幕の切り替え時刻は deliverables/ の SRT と同一\n`);
for (const v of ["main", "full"]) {
  let from = 0;
  L.push(`## ${v === "main" ? `本編のみ版（watakyu_main${sfx}.mp4）` : `追加パート付き版（watakyu_full${sfx}.mp4）`}\n`);
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
      L.push(`| 字幕 | 発話開始 | 発話終了 | 読み上げ用${voice === "v1" ? "テキスト" : "カナ"}（TTS入力） |\n|---|---|---|---|`);
      t.chunks.forEach((c, ci) => {
        const a = start + script.timing.leadIn + c.start, b = start + script.timing.leadIn + c.end;
        const said = voice === "v1" ? c.segments.map((s) => s.tts).join(" ／ ")
          : sc.speech.flatMap((se) => se.parts).filter((p) => p.chunk === ci).map((p) => p.kana).join(" ／ ");
        L.push(`| ${c.text} | ${f(a)} | ${f(b)} | ${said} |`);
      });
      L.push("");
    }
  }
}
const out = voice === "v1" ? "script_v1.md" : "script.md";
writeFileSync(root + out, L.join("\n") + "\n");
console.log(out, "written");
