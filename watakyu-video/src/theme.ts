export const W = 1920;
export const H = 1080;
export const FPS = 30;

// 安全余白（左右100 / 上70 / 下80）と字幕帯
export const SAFE = { x: 100, top: 70, bottom: 80 };
export const SUB_BAND = { top: 862, height: 218 }; // 字幕帯（画面下端まで）。文字は下80pxの余白内に収める
export const CONTENT = { top: 200, bottom: 836 }; // 図解を置く領域（字幕帯に重ねない）

export const C = {
  bg: "#F6FAFB",
  white: "#FFFFFF",
  navy: "#0B2545",
  navy2: "#13315C",
  teal: "#159A8C",
  tealLight: "#D7F0EC",
  tealPale: "#ECF8F6",
  blue: "#2E7FD8", // 清潔
  blueLight: "#DCEBFB",
  orange: "#EE8A2E", // 使用済み
  orangeLight: "#FCE9D6",
  gray: "#8A9BAE",
  grayLight: "#DCE4EC",
  land: "#E3EAF0",
  sea: "#F6FAFB",
  vnRed: "#DA251D",
  vnYellow: "#FFCD00",
  text: "#0B2545",
  sub: "#4A5D73",
};

export const FONT = '"Noto Sans JP", sans-serif';
