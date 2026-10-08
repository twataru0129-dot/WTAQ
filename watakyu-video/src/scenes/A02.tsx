import React from "react";
import { AbsoluteFill } from "remotion";
import { lerp, pop, prog } from "../anim";
import { At, Board, HandWash, Pot } from "../components/icons";
import { ArcLine, Dot, ISO, MapLayer } from "../components/Map";
import { Bg, Keyword, Note, Pill, Txt } from "../components/ui";
import { useScene } from "../SceneContext";
import { C, FONT } from "../theme";
import { P } from "./geo";

const BOX = { x: 100, y: 240, w: 780, h: 590 };

export const A02: React.FC = () => {
  const { t, cue } = useScene();
  // 冒頭：グループ会社の取り組みであることを大きく示す
  const banner = 1 - prog(t, 1.5, 0.5);
  const body = prog(t, 1.6, 0.6);
  const arc = prog(t, cue(1, 0.1), 1.4);
  const steps = [
    { label: "教室で", at: cue(1, 0.1), icon: (tt: number) => <Board><text x={0} y={18} fontSize={64} fontWeight={800} textAnchor="middle" fill={C.navy} fontFamily={FONT}>あ い う</text></Board> },
    { label: "日本語", at: cue(2, 0.0), icon: () => <g><rect x={-125} y={-60} width={250} height={120} rx={20} fill={C.white} stroke={C.navy} strokeWidth={6} /><text x={0} y={20} fontSize={60} fontWeight={900} textAnchor="middle" fill={C.teal} fontFamily={FONT}>日本語</text></g> },
    { label: "衛生管理", at: cue(2, 0.3), icon: (tt: number) => <HandWash drop={tt} /> },
    { label: "調理の基礎", at: cue(2, 0.62), icon: (tt: number) => <Pot steam={tt} /> },
  ];
  return (
    <AbsoluteFill>
      <Bg />
      {/* 冒頭バナー */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 380,
          textAlign: "center",
          fontFamily: FONT,
          opacity: banner * prog(t, 0.1, 0.4),
        }}
      >
        <div style={{ display: "inline-block", padding: "26px 60px", borderRadius: 24, background: C.navy, color: C.white, fontSize: 64, fontWeight: 800 }}>
          ここからはグループ会社の取り組み
        </div>
      </div>
      <div style={{ position: "absolute", inset: 0, opacity: body }}>
        <svg width={1920} height={1080} style={{ position: "absolute" }}>
          <MapLayer {...BOX} view={{ lon: 117, lat: 27, scale: 820 }} highlight={{ [ISO.myanmar]: { fill: C.tealLight }, [ISO.japan]: { fill: C.blueLight } }}>
            {(proj) => {
              const mm = proj(P.myanmar);
              const jp = proj(P.japan);
              return (
                <g>
                  <ArcLine a={mm} b={jp} p={arc} bend={-0.25} color={C.teal} w={7} flow={t * 40} />
                  <Dot at={mm} color={C.teal} r={10} />
                  <Dot at={jp} color={C.navy} r={10} />
                  <Txt x={mm[0]} y={mm[1] + 50} size={36} weight={800}>ミャンマー</Txt>
                  <Txt x={jp[0] - 10} y={jp[1] + 52} size={36} weight={800}>日本</Txt>
                  <g opacity={prog(t, cue(1, 0.6), 0.5)}>
                    <rect x={lerp(mm[0], jp[0], 0.5) - 150} y={lerp(mm[1], jp[1], 0.5) - 200} width={300} height={64} rx={32} fill={C.white} stroke={C.teal} strokeWidth={3} />
                    <Txt x={lerp(mm[0], jp[0], 0.5)} y={lerp(mm[1], jp[1], 0.5) - 166} size={32} weight={800} color={C.teal}>来日前の研修</Txt>
                  </g>
                </g>
              );
            }}
          </MapLayer>
          {steps.map((s, i) => {
            const cx = 1150 + (i % 2) * 420;
            const cy = 445 + Math.floor(i / 2) * 250;
            const p = prog(t, s.at, 0.5);
            return (
              <g key={s.label} opacity={p}>
                <rect x={cx - 190} y={cy - 115} width={380} height={230} rx={26} fill={C.white} stroke={C.navy} strokeWidth={3} />
                <At x={cx} y={cy - 22} s={0.62 * pop(t, s.at)}>
                  {s.icon(t * 0.8)}
                </At>
                <Txt x={cx} y={cy + 78} size={36} weight={800}>{s.label}</Txt>
              </g>
            );
          })}
          <Pill x={1360} y={268} text="日本で働く人に向けて" size={32} bg={C.tealLight} stroke={C.teal} o={prog(t, cue(1, 0.3), 0.5)} />
          <Note text="インドネシアでも受け入れ準備（2025年6月発表時点）" x={1820} y={826} o={prog(t, cue(2, 0.8), 0.5)} />
        </svg>
      </div>
      <Keyword eyebrow="ワタキューグループ ｜ グループ会社の取り組み" text="日清医療食品の取り組み" at={1.6} />
    </AbsoluteFill>
  );
};
