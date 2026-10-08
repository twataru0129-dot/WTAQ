import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import { lerp, prog } from "../anim";
import { At, Bed, Sheet } from "../components/icons";
import { Keyword } from "../components/ui";
import { useScene } from "../SceneContext";
import { C } from "../theme";

/** 病室の背景（S01/S08で共用） */
export const Room: React.FC<{ glow?: number }> = ({ glow = 0 }) => (
  <g>
    <rect width={1920} height={1080} fill="#EEF5F8" />
    <rect y={760} width={1920} height={320} fill="#E1EAF0" />
    <path d="M0 760 H1920" stroke="#C9D6E0" strokeWidth={4} />
    {/* 窓 */}
    <g transform="translate(1300,200)">
      <rect width={380} height={300} rx={16} fill="#DCEEFB" stroke="#B9CCDA" strokeWidth={6} />
      <path d="M190 0 V300 M0 150 H380" stroke="#B9CCDA" strokeWidth={6} />
      <circle cx={300} cy={80} r={34} fill="#FFFFFF" opacity={0.8} />
    </g>
    {/* カーテンレールとカーテン */}
    <path d="M140 150 H700" stroke="#B9CCDA" strokeWidth={6} strokeLinecap="round" />
    <path d="M160 156 q30 300 0 600 h120 q-30 -300 0 -600 Z" fill="#D7F0EC" opacity={0.9} />
    {/* 点滴スタンド（シルエット） */}
    <g stroke="#B9CCDA" strokeWidth={6} fill="none" strokeLinecap="round">
      <path d="M520 280 V760 M480 760 H560 M500 280 H540" />
      <rect x={498} y={300} width={44} height={70} rx={12} fill="#FFFFFF" />
    </g>
    {/* ベッド */}
    <At x={960} y={620} s={1.7}>
      <Bed />
    </At>
    {/* シーツの清潔感（控えめな光） */}
    <g opacity={glow}>
      {[
        [1010, 548, 1],
        [1130, 556, 0.7],
        [900, 560, 0.6],
      ].map(([x, y, s], i) => (
        <g key={i} transform={`translate(${x},${y}) scale(${s})`}>
          <path d="M0 -22 L5 -5 L22 0 L5 5 L0 22 L-5 5 L-22 0 L-5 -5 Z" fill={C.teal} opacity={0.7} />
        </g>
      ))}
    </g>
  </g>
);

export const S01: React.FC = () => {
  const { t, cue, dur } = useScene();
  // ゆっくり寄ってから、問いかけの後にシーツへズーム
  const zIn = prog(t, cue(1, 0.2), dur - cue(1, 0.2) - 0.9, Easing.inOut(Easing.cubic));
  const z = lerp(1.0, 1.06, prog(t, 0, cue(1, 0.2), Easing.linear)) * lerp(1, 3.0, zIn);
  const fx = 1010;
  const fy = 560;
  const sheetMorph = prog(t, dur - 1.1, 0.7);
  const glow = prog(t, cue(0, 0.5), 0.8) * (1 - zIn * 0.8);
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080}>
        <g transform={`translate(${960 - fx * z + (fx - 960) * 0} ${540 - fy * z}) scale(${z})`} opacity={1 - sheetMorph * 0.9}>
          <Room glow={glow} />
        </g>
        {/* ズームしたシーツが1枚の図形になる */}
        <rect width={1920} height={1080} fill={C.bg} opacity={sheetMorph} />
        <At x={960} y={500} s={lerp(3.2, 1.4, sheetMorph)} o={sheetMorph}>
          <Sheet />
        </At>
      </svg>
      <Keyword text="清潔を支える仕事" at={cue(1, 0.75)} />
    </AbsoluteFill>
  );
};
