// 統一スタイルのSVGアイコン群。どれも原点中心・おおよそ ±100 の範囲で描く。
// 親の <svg> 内で <g transform="translate(x,y) scale(s)"> として配置する。
import React from "react";
import { C } from "../theme";

const S = { stroke: C.navy, strokeWidth: 6, strokeLinecap: "round", strokeLinejoin: "round" } as const;

type P = { x?: number; y?: number; s?: number; o?: number; r?: number; children?: React.ReactNode };
export const At: React.FC<P> = ({ x = 0, y = 0, s = 1, o = 1, r = 0, children }) => (
  <g transform={`translate(${x},${y}) rotate(${r}) scale(${s})`} opacity={o}>
    {children}
  </g>
);

/** たたんだシーツ */
export const Sheet: React.FC<{ fill?: string }> = ({ fill = C.white }) => (
  <g {...S}>
    <rect x={-80} y={-40} width={160} height={80} rx={14} fill={fill} />
    <path d="M-80 -6 H80" fill="none" strokeWidth={4} opacity={0.5} />
    <path d="M-60 22 H20" fill="none" strokeWidth={4} opacity={0.35} />
  </g>
);

/** 病室のベッド（横から） */
export const Bed: React.FC<{ sheet?: string }> = ({ sheet = C.white }) => (
  <g {...S}>
    <path d="M-190 -80 V90 M190 -30 V90" fill="none" strokeWidth={10} />
    <rect x={-190} y={0} width={380} height={34} rx={8} fill={C.grayLight} />
    <rect x={-170} y={-36} width={88} height={34} rx={16} fill={C.white} />
    <path d="M-80 -30 Q30 -46 180 -30 L184 6 L-82 6 Z" fill={sheet} />
    <path d="M-150 90 h0 M160 90 h0" strokeWidth={22} />
  </g>
);

/** 回収袋 */
export const Bag: React.FC<{ fill?: string }> = ({ fill = C.orangeLight }) => (
  <g {...S}>
    <path d="M-62 -40 Q-80 80 -50 82 H50 Q80 80 62 -40 Z" fill={fill} />
    <path d="M-50 -40 Q0 -64 50 -40" fill="none" />
    <path d="M-20 -58 L0 -80 L20 -58" fill="none" />
    <path d="M-36 20 H36" opacity={0.4} strokeWidth={4} />
  </g>
);

/** 業務用洗濯機（spin: ドラム内の回転角） */
export const Washer: React.FC<{ spin?: number; hot?: boolean }> = ({ spin = 0, hot }) => (
  <g {...S}>
    <rect x={-80} y={-90} width={160} height={180} rx={18} fill={C.white} />
    <path d="M-80 -54 H80" />
    <circle cx={-52} cy={-72} r={5} fill={C.navy} stroke="none" />
    <circle cx={-34} cy={-72} r={5} fill={hot ? C.orange : C.teal} stroke="none" />
    <circle cx={0} cy={18} r={54} fill={C.blueLight} />
    <g transform={`translate(0,18) rotate(${spin})`}>
      <path d="M-34 0 Q-17 -18 0 0 T34 0" fill="none" stroke={C.blue} strokeWidth={6} />
      <path d="M-22 -26 Q-6 -36 10 -26" fill="none" stroke={C.blue} strokeWidth={5} opacity={0.6} />
      <path d="M-10 26 Q6 36 22 26" fill="none" stroke={C.blue} strokeWidth={5} opacity={0.6} />
    </g>
  </g>
);

/** 検査（虫めがね＋チェック） */
export const Inspect: React.FC<{ check?: number }> = ({ check = 1 }) => (
  <g {...S}>
    <rect x={-80} y={-30} width={130} height={70} rx={12} fill={C.white} />
    <circle cx={20} cy={-10} r={46} fill={C.tealPale} />
    <path d="M52 22 L86 56" strokeWidth={14} />
    <path
      d="M-2 -10 L14 6 L44 -26"
      fill="none"
      stroke={C.teal}
      strokeWidth={10}
      strokeDasharray={80}
      strokeDashoffset={80 * (1 - check)}
    />
  </g>
);

/** 配送トラック */
export const Truck: React.FC<{ wheel?: number }> = ({ wheel = 0 }) => (
  <g {...S}>
    <rect x={-96} y={-56} width={120} height={90} rx={10} fill={C.white} />
    <path d="M24 -26 H62 L88 6 V34 H24 Z" fill={C.tealLight} />
    <path d="M34 -18 H58 L74 2 H34 Z" fill={C.white} strokeWidth={4} />
    <path d="M-78 -28 H6" opacity={0.35} strokeWidth={4} />
    {[-58, 56].map((cx) => (
      <g key={cx} transform={`translate(${cx},40) rotate(${wheel})`}>
        <circle r={18} fill={C.navy2} />
        <path d="M0 -10 V10" stroke={C.white} strokeWidth={4} />
      </g>
    ))}
  </g>
);

/** 工場（洗濯工場） */
export const Factory: React.FC = () => (
  <g {...S}>
    <path d="M-90 80 V-10 L-50 -40 V-10 L-10 -40 V-10 L30 -40 V-10 L90 -40 V80 Z" fill={C.white} />
    <rect x={-70} y={20} width={30} height={26} rx={4} fill={C.blueLight} strokeWidth={4} />
    <rect x={-20} y={20} width={30} height={26} rx={4} fill={C.blueLight} strokeWidth={4} />
    <rect x={40} y={30} width={32} height={50} rx={4} fill={C.tealLight} strokeWidth={4} />
  </g>
);

/** 病院（十字は赤十字標章と混同しないよう青緑） */
export const Hospital: React.FC<{ dashed?: boolean; fill?: string }> = ({ dashed, fill = C.white }) => (
  <g {...S} strokeDasharray={dashed ? "14 12" : undefined}>
    <rect x={-80} y={-60} width={160} height={140} rx={10} fill={fill} />
    <rect x={-34} y={-96} width={68} height={40} rx={8} fill={fill} />
    <path d="M0 -88 V-64 M-12 -76 H12" stroke={C.teal} strokeWidth={7} strokeDasharray="none" />
    {[-48, 0, 48].map((x) => (
      <rect key={x} x={x - 14} y={-30} width={28} height={24} rx={4} fill={C.blueLight} strokeWidth={4} />
    ))}
    {[-48, 48].map((x) => (
      <rect key={x} x={x - 14} y={14} width={28} height={24} rx={4} fill={C.blueLight} strokeWidth={4} />
    ))}
    <path d="M-16 80 V44 H16 V80" fill={C.tealLight} strokeWidth={5} />
  </g>
);

/** 電子タグ（RFID）：チップとアンテナ */
export const Tag: React.FC = () => (
  <g {...S}>
    <rect x={-46} y={-30} width={92} height={60} rx={10} fill={C.white} />
    <rect x={-12} y={-10} width={24} height={20} rx={3} fill={C.navy} />
    <path d="M-34 -18 H34 V18 H-34 Z M-26 -10 H26 V10 H-26" fill="none" strokeWidth={3} stroke={C.teal} />
  </g>
);

/** 読み取り機 */
export const Reader: React.FC<{ wave?: number }> = ({ wave = 0 }) => (
  <g {...S}>
    <rect x={-30} y={-60} width={60} height={110} rx={14} fill={C.white} />
    <rect x={-18} y={-44} width={36} height={30} rx={4} fill={C.tealLight} strokeWidth={4} />
    <path d="M-10 70 V50 H10 V70 Z" fill={C.navy2} />
    {[0, 1, 2].map((i) => (
      <path
        key={i}
        d={`M${-22 - i * 16} ${-74 - i * 14} Q0 ${-96 - i * 22} ${22 + i * 16} ${-74 - i * 14}`}
        fill="none"
        stroke={C.teal}
        strokeWidth={5}
        opacity={Math.max(0, Math.min(1, wave * 3 - i))}
      />
    ))}
  </g>
);

/** 温度計（数値なし） */
export const Thermo: React.FC<{ level?: number }> = ({ level = 1 }) => (
  <g {...S}>
    <path d="M-16 40 V-70 A16 16 0 0 1 16 -70 V40" fill={C.white} />
    <circle cx={0} cy={58} r={28} fill={C.orange} />
    <rect x={-7} y={50 - 110 * level} width={14} height={110 * level} fill={C.orange} stroke="none" />
    <path d="M24 -50 H36 M24 -20 H36 M24 10 H36" strokeWidth={4} />
  </g>
);

/** 手洗い */
export const HandWash: React.FC<{ drop?: number }> = ({ drop = 0 }) => (
  <g {...S}>
    <path d="M-60 -80 H10 V-56 H-10 V-46" fill="none" />
    <path d="M-50 60 Q-70 10 -30 0 L40 -10 Q60 -8 56 8 L10 16 L66 22 Q78 30 64 40 L-6 48 Q-20 66 -50 60 Z" fill={C.white} />
    {[0, 1, 2].map((i) => {
      const p = (drop + i / 3) % 1;
      return <circle key={i} cx={-10 + (i - 1) * 8} cy={-34 + p * 40} r={5} fill={C.blue} stroke="none" opacity={1 - p} />;
    })}
  </g>
);

/** 手袋でリネンを扱う */
export const Gloves: React.FC = () => (
  <g {...S}>
    <rect x={-70} y={-10} width={140} height={60} rx={12} fill={C.white} />
    <path d="M-92 40 Q-100 -10 -70 -30 L-50 -10 L-56 30 Z" fill={C.blueLight} />
    <path d="M92 40 Q100 -10 70 -30 L50 -10 L56 30 Z" fill={C.blueLight} />
    <path d="M-40 18 H40" opacity={0.4} strokeWidth={4} />
  </g>
);

/** チェックリスト／手順書 */
export const Checklist: React.FC<{ n?: number }> = ({ n = 3 }) => (
  <g {...S}>
    <rect x={-64} y={-86} width={128} height={172} rx={12} fill={C.white} />
    <rect x={-28} y={-98} width={56} height={24} rx={6} fill={C.tealLight} />
    {[0, 1, 2].map((i) => (
      <g key={i} transform={`translate(0,${-40 + i * 44})`}>
        <rect x={-44} y={-12} width={24} height={24} rx={4} fill={C.white} strokeWidth={4} />
        {i < n && <path d="M-40 0 L-33 7 L-22 -7" fill="none" stroke={C.teal} strokeWidth={5} />}
        <path d="M-6 0 H44" strokeWidth={5} opacity={0.5} />
      </g>
    ))}
  </g>
);

/** 手順書（本） */
export const Manual: React.FC = () => (
  <g {...S}>
    <path d="M0 -60 Q-40 -76 -86 -64 V70 Q-40 58 0 74 Q40 58 86 70 V-64 Q40 -76 0 -60 Z" fill={C.white} />
    <path d="M0 -60 V74" />
    <path d="M-66 -34 H-20 M-66 -6 H-20 M20 -34 H66 M20 -6 H66 M20 22 H56" strokeWidth={4} opacity={0.5} />
  </g>
);

/** 人物（シンプル・ステレオタイプのない表現） */
export const Person: React.FC<{ color?: string; cap?: boolean; arm?: number; skin?: string }> = ({
  color = C.teal,
  cap = false,
  arm = 0,
  skin = "#F1D3B8",
}) => (
  <g {...S} strokeWidth={5}>
    <path d="M-46 100 V40 Q-46 0 0 0 Q46 0 46 40 V100 Z" fill={color} />
    <path d="M-20 4 L0 30 L20 4" fill="none" stroke={C.white} strokeWidth={5} />
    <circle cx={0} cy={-34} r={30} fill={skin} />
    {cap && <path d="M-32 -42 Q0 -86 32 -42 Z" fill={C.white} />}
    <path d={`M42 34 L${70 + arm * 6} ${60 - arm * 50}`} fill="none" strokeWidth={10} stroke={color} />
  </g>
);

/** ホワイトボード（研修） */
export const Board: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <g {...S}>
    <rect x={-120} y={-80} width={240} height={150} rx={10} fill={C.white} />
    <path d="M-60 70 L-80 110 M60 70 L80 110" />
    {children}
  </g>
);

/** 調理（鍋） */
export const Pot: React.FC<{ steam?: number }> = ({ steam = 0 }) => (
  <g {...S}>
    <path d="M-70 -10 H70 V40 Q70 70 40 70 H-40 Q-70 70 -70 40 Z" fill={C.white} />
    <path d="M-90 0 H-70 M70 0 H90" strokeWidth={8} />
    <path d="M-76 -10 H76" strokeWidth={8} />
    {[-30, 0, 30].map((x, i) => (
      <path
        key={x}
        d={`M${x} -30 q-10 -14 0 -28 q10 -14 0 -28`}
        fill="none"
        stroke={C.gray}
        strokeWidth={4}
        opacity={0.3 + 0.5 * Math.abs(Math.sin(steam * 3 + i))}
      />
    ))}
  </g>
);

/** ソフトテニスのラケットとボール */
export const Racket: React.FC = () => (
  <g {...S}>
    <g transform="rotate(-30)">
      <ellipse cx={0} cy={-40} rx={52} ry={66} fill={C.white} strokeWidth={8} />
      <path d="M-30 -90 V10 M-10 -104 V24 M10 -104 V24 M30 -90 V10 M-48 -70 H48 M-52 -40 H52 M-48 -10 H48" strokeWidth={2} opacity={0.5} />
      <path d="M0 26 V110" strokeWidth={14} />
    </g>
  </g>
);
export const Ball: React.FC = () => (
  <g {...S}>
    <circle r={20} fill={C.white} />
    <path d="M-14 -14 Q0 0 -14 14 M14 -14 Q0 0 14 14" fill="none" strokeWidth={3} opacity={0.5} />
  </g>
);

/** 矢印（a→b, 進捗p で伸びる） */
export const Arrow: React.FC<{
  x1: number; y1: number; x2: number; y2: number; p?: number; color?: string; w?: number; dash?: string; head?: boolean;
}> = ({ x1, y1, x2, y2, p = 1, color = C.navy, w = 6, dash, head = true }) => {
  const x = x1 + (x2 - x1) * p;
  const y = y1 + (y2 - y1) * p;
  const ang = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  return (
    <g opacity={p > 0 ? 1 : 0}>
      <path d={`M${x1} ${y1} L${x} ${y}`} stroke={color} strokeWidth={w} strokeLinecap="round" strokeDasharray={dash} fill="none" />
      {head && p > 0.15 && (
        <path
          d={`M${-w * 2.6} ${-w * 2} L0 0 L${-w * 2.6} ${w * 2}`}
          transform={`translate(${x},${y}) rotate(${ang})`}
          stroke={color}
          strokeWidth={w}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </g>
  );
};
