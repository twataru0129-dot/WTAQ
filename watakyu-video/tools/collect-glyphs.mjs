// フォント事前読み込み用に、ソースと台本に出てくる全文字を集めて src/data/glyphs.json に書き出す
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const root = new URL("..", import.meta.url).pathname;
const files = [];
const walk = (d) => {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(tsx?|json)$/.test(f) && !f.startsWith("glyphs")) files.push(p);
  }
};
walk(join(root, "src"));
const set = new Set();
for (const f of files) for (const ch of readFileSync(f, "utf8")) if (ch.charCodeAt(0) > 0x20) set.add(ch);
for (let c = 0x20; c < 0x7f; c++) set.add(String.fromCharCode(c));
writeFileSync(join(root, "src/data/glyphs.json"), JSON.stringify([...set].sort().join("")));
console.log("glyphs:", set.size);
