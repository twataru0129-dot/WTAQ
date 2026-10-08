import "@fontsource/noto-sans-jp/400.css";
import "@fontsource/noto-sans-jp/500.css";
import "@fontsource/noto-sans-jp/600.css";
import "@fontsource/noto-sans-jp/700.css";
import "@fontsource/noto-sans-jp/800.css";
import "@fontsource/noto-sans-jp/900.css";
import { continueRender, delayRender } from "remotion";
import glyphs from "./data/glyphs.json";

// 使用する全文字のサブセットを、全ウェイトで読み込み終えるまでレンダリングを待つ
const handle = delayRender("Noto Sans JP の読み込み");
Promise.all(
  [400, 500, 600, 700, 800, 900].map((w) => document.fonts.load(`${w} 40px "Noto Sans JP"`, glyphs as string)),
)
  .then(() => document.fonts.ready)
  .then(() => continueRender(handle))
  .catch((e) => {
    console.error(e);
    continueRender(handle);
  });
