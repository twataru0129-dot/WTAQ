import React from "react";
import { AbsoluteFill } from "remotion";
import { prog } from "../anim";
import { useScene } from "../SceneContext";
import { C, FONT, SAFE } from "../theme";

/** 画面上部の見出し（キーワード 64〜88px） */
export const Keyword: React.FC<{ text: string; at?: number; size?: number; eyebrow?: string; out?: number }> = ({
  text,
  at = 0.15,
  size = 72,
  eyebrow,
  out,
}) => {
  const { t } = useScene();
  const p = prog(t, at, 0.6);
  const q = out !== undefined ? 1 - prog(t, out, 0.4) : 1;
  return (
    <div
      style={{
        position: "absolute",
        left: SAFE.x,
        top: SAFE.top,
        right: SAFE.x,
        opacity: p * q,
        transform: `translateY(${(1 - p) * 18}px)`,
        fontFamily: FONT,
        color: C.navy,
      }}
    >
      {eyebrow && (
        <div style={{ fontSize: 30, fontWeight: 700, color: C.teal, letterSpacing: 2, marginBottom: 4 }}>{eyebrow}</div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        <div style={{ width: 10, height: size * 1.05, borderRadius: 5, background: C.teal }} />
        <div style={{ fontSize: size, fontWeight: 800, lineHeight: 1.15, letterSpacing: 1 }}>{text}</div>
      </div>
    </div>
  );
};

export const Bg: React.FC<{ color?: string }> = ({ color = C.bg }) => {
  return (
    <AbsoluteFill style={{ background: color }}>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <defs>
          <radialGradient id="bgGlow" cx="70%" cy="20%" r="80%">
            <stop offset="0" stopColor={C.tealPale} />
            <stop offset="1" stopColor={color} stopOpacity={0} />
          </radialGradient>
        </defs>
        <rect width={1920} height={1080} fill="url(#bgGlow)" />
      </svg>
    </AbsoluteFill>
  );
};

/** SVG内のテキスト */
export const Txt: React.FC<{
  x: number; y: number; size?: number; weight?: number; color?: string; anchor?: "start" | "middle" | "end"; o?: number; children: React.ReactNode;
}> = ({ x, y, size = 36, weight = 700, color = C.navy, anchor = "middle", o = 1, children }) => (
  <text x={x} y={y} fontSize={size} fontWeight={weight} fill={color} textAnchor={anchor} fontFamily={FONT} opacity={o} dominantBaseline="middle">
    {children}
  </text>
);

/** 角丸ラベル（SVG）。幅は文字数から概算 */
export const Pill: React.FC<{
  x: number; y: number; text: string; size?: number; bg?: string; color?: string; o?: number; s?: number; stroke?: string; dashed?: boolean;
}> = ({ x, y, text, size = 34, bg = C.white, color = C.navy, o = 1, s = 1, stroke = C.navy, dashed }) => {
  const w = textWidth(text, size) + size * 1.3;
  const h = size * 1.75;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill={bg} stroke={stroke} strokeWidth={3} strokeDasharray={dashed ? "10 8" : undefined} />
      <text x={0} y={2} fontSize={size} fontWeight={700} fill={color} textAnchor="middle" dominantBaseline="middle" fontFamily={FONT}>
        {text}
      </text>
    </g>
  );
};

/** 全角=1em、半角=0.6em として幅を概算 */
export const textWidth = (s: string, size: number) =>
  [...s].reduce((a, ch) => a + (/[\x20-\x7e]/.test(ch) ? 0.6 : 1), 0) * size;

/** 「仕組みのイメージ」等の注記 */
export const Note: React.FC<{ text: string; x?: number; y?: number; o?: number; anchor?: "start" | "end" }> = ({
  text,
  x = 1820,
  y = 822,
  o = 1,
  anchor = "end",
}) => (
  <text x={x} y={y} fontSize={26} fontWeight={500} fill={C.sub} textAnchor={anchor} fontFamily={FONT} opacity={o}>
    {text}
  </text>
);
