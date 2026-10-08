import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import { lerp, prog } from "../anim";
import { At, Bag, Hospital, Inspect, Person, Truck, Washer } from "../components/icons";
import { Bg, Txt } from "../components/ui";
import { useScene } from "../SceneContext";
import { C, FONT } from "../theme";
import { Room } from "./S01";
import { Credits } from "./Credits";

const ROLES = [
  { label: "回収", icon: <Bag />, x: 600, y: 600 },
  { label: "洗濯", icon: <Washer />, x: 640, y: 330 },
  { label: "検査", icon: <Inspect />, x: 1280, y: 330 },
  { label: "配送", icon: <Truck />, x: 1320, y: 600 },
];
const SKIN = ["#F1D3B8", "#C99A70", "#E8C09A", "#B98A62"];

export const S08: React.FC<{ version: "main" | "full" }> = ({ version }) => {
  const { t, cue, sc } = useScene();
  const narrEnd = sc.chunks[sc.chunks.length - 1].end;
  // 前半：人が病院を囲む → 後半：最初のベッドへ
  const toBed = prog(t, cue(1, 0.15), 1.4, Easing.inOut(Easing.cubic));
  const title = prog(t, cue(1, 0.6), 0.8);
  const credits = version === "main" ? prog(t, narrEnd + 0.4, 0.6) : 0;
  const ring = prog(t, 0.2, 0.8);
  return (
    <AbsoluteFill>
      <Bg />
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <g opacity={1 - toBed} transform={`translate(960 500) scale(${lerp(1, 2.2, toBed)}) translate(-960 -500)`}>
          <circle cx={960} cy={500} r={230} fill="none" stroke={C.teal} strokeWidth={5} strokeDasharray="3 16" strokeLinecap="round" opacity={ring} transform={`rotate(${t * 12} 960 500)`} />
          <At x={960} y={500} s={1.2} o={ring}>
            <Hospital />
          </At>
          {ROLES.map((r, i) => {
            const { x, y } = r;
            const p = prog(t, 0.3 + i * 0.25, 0.5);
            return (
              <g key={r.label} opacity={p}>
                <At x={x} y={y} s={0.9}>
                  <Person color={i % 2 ? C.navy2 : C.teal} cap={i === 1 || i === 2} skin={SKIN[i]} />
                </At>
                <At x={x + (x < 960 ? -120 : 120)} y={y - 40} s={0.45}>
                  {r.icon}
                </At>
                <Txt x={x} y={y + 135} size={36} weight={800}>
                  {r.label}
                </Txt>
              </g>
            );
          })}
        </g>
        {/* 最初のベッドに戻る */}
        <g opacity={toBed}>
          <g transform={`translate(960 540) scale(${lerp(1.6, 1, toBed)}) translate(-960 -540)`}>
            <Room glow={0.8} />
          </g>
          <rect width={1920} height={1080} fill={C.bg} opacity={0.5 * title + 0.35 * credits} />
        </g>
      </svg>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: lerp(170, 150, credits),
          textAlign: "center",
          fontFamily: FONT,
          color: C.navy,
          opacity: title,
          transform: `translateY(${(1 - title) * 20}px)`,
        }}
      >
        <div style={{ fontSize: 88, fontWeight: 900, letterSpacing: 4 }}>一枚のシーツから世界へ</div>
        <div style={{ marginTop: 14, fontSize: 40, fontWeight: 700, color: C.teal }}>ワタキューセイモアの海外での挑戦</div>
      </div>
      {version === "main" && <Credits o={credits} variant="main" top={430} />}
    </AbsoluteFill>
  );
};
