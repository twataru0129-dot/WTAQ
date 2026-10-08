import React from "react";
import { AbsoluteFill } from "remotion";
import { pop, prog } from "../anim";
import { At, Board, Checklist, Gloves, HandWash, Person } from "../components/icons";
import { Bg, Txt } from "../components/ui";
import { useScene } from "../SceneContext";
import { C, FONT, SAFE } from "../theme";

const SKIN = ["#F1D3B8", "#D9A97E", "#E8C09A", "#B98A62"];

export const S06: React.FC = () => {
  const { t, cue, seg } = useScene();
  const people = cue(0, 0.0);
  const steps = [
    { label: "手洗い", at: seg(0, 1) + 0.2, icon: (tt: number) => <HandWash drop={tt} /> },
    { label: "リネンの扱い", at: cue(1, 0.0), icon: () => <Gloves /> },
    { label: "手順を確認", at: cue(1, 0.55), icon: () => <Checklist n={Math.floor(prog(t, cue(1, 0.55) + 0.3, 1.2) * 3.99)} /> },
  ];
  const kw = [
    { text: "設備", at: 0.15 },
    { text: "＋ 研修", at: seg(0, 1) },
    { text: "＋ 手順書", at: cue(1, 0.0) },
  ];
  const safe = prog(t, cue(2, 0.1), 0.6);
  return (
    <AbsoluteFill>
      <Bg />
      {/* 見出し（設備 ＋ 研修 ＋ 手順書 を順に） */}
      <div style={{ position: "absolute", left: SAFE.x, top: SAFE.top, display: "flex", alignItems: "center", gap: 22, fontFamily: FONT, color: C.navy }}>
        <div style={{ width: 10, height: 76, borderRadius: 5, background: C.teal }} />
        {kw.map((k, i) => (
          <div key={i} style={{ fontSize: 72, fontWeight: 800, opacity: prog(t, k.at, 0.5), transform: `translateY(${(1 - prog(t, k.at, 0.5)) * 16}px)` }}>
            {k.text}
          </div>
        ))}
      </div>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {/* 研修の様子：説明する人と受ける人たち */}
        <g opacity={prog(t, people, 0.6)}>
          <rect x={120} y={230} width={900} height={590} rx={32} fill={C.white} stroke={C.grayLight} strokeWidth={3} />
          <At x={430} y={400} s={1.0}>
            <Board>
              <g transform="translate(-50,-6) scale(0.45)">
                <HandWash drop={t * 0.8} />
              </g>
              <g transform="translate(52,-6) scale(0.4)">
                <Checklist n={3} />
              </g>
            </Board>
          </At>
          <At x={700} y={430} s={1.05}>
            <Person color={C.navy2} arm={Math.sin(t * 2.2) * 0.5 + 0.5} skin={SKIN[1]} />
          </At>
          {[0, 1, 2].map((i) => (
            <At key={i} x={300 + i * 210} y={640} s={0.9} o={prog(t, people + 0.2 + i * 0.15, 0.4)}>
              <Person color={C.teal} cap skin={SKIN[(i * 2) % 4]} />
            </At>
          ))}
          <rect x={124} y={734} width={892} height={82} rx={28} fill={C.white} />
          <Txt x={570} y={778} size={34} weight={800}>働く人への研修</Txt>
        </g>
        {/* 研修の内容を順に */}
        {steps.map((s, i) => {
          const y = 300 + i * 172;
          const p = prog(t, s.at, 0.5);
          return (
            <g key={s.label} opacity={p} transform={`translate(${(1 - p) * 40},0)`}>
              <rect x={1090} y={y - 70} width={710} height={145} rx={24} fill={C.white} stroke={C.navy} strokeWidth={3} />
              <circle cx={1180} cy={y + 2} r={56} fill={C.tealPale} />
              <At x={1180} y={y + 2} s={0.5 * pop(t, s.at)}>
                {s.icon(t * 0.8)}
              </At>
              <Txt x={1270} y={y + 2} size={44} weight={800} anchor="start">
                {s.label}
              </Txt>
            </g>
          );
        })}
        <g opacity={safe}>
          <Txt x={1445} y={800} size={38} weight={800} color={C.teal}>安全に仕事を続けられるように</Txt>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
