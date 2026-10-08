import React from "react";
import { AbsoluteFill } from "remotion";
import { pop, prog } from "../anim";
import { Arrow, At, Hospital } from "../components/icons";
import { Bg, Keyword, Note, Pill, Txt } from "../components/ui";
import { useScene } from "../SceneContext";
import { C } from "../theme";

// 今後の展開先（イメージ）。実在の病院の位置を示すものではない
const FUTURE = [
  [1300, 345],
  [1300, 485],
  [1300, 625],
  [1300, 765],
];

export const S07: React.FC = () => {
  const { t, cue } = useScene();
  const done = cue(0, 0.0);
  const goal = cue(1, 0.0);
  return (
    <AbsoluteFill>
      <Bg />
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {/* 実証完了（チェックマークは使わない） */}
        <g opacity={prog(t, done, 0.5)} transform={`translate(520,270) scale(${pop(t, done)})`}>
          <rect x={-300} y={-52} width={600} height={104} rx={52} fill={C.navy} />
          <Txt x={0} y={2} size={44} weight={800} color={C.white}>2026年10月　実証完了</Txt>
        </g>
        <At x={520} y={560} s={1.45} o={prog(t, 0.2, 0.5)}>
          <Hospital fill={C.tealPale} />
        </At>
        <Txt x={520} y={720} size={34} weight={800} o={prog(t, 0.2, 0.5)}>実証を行った病院</Txt>
        {/* 今後の目標：点線で示す */}
        <g opacity={prog(t, goal, 0.5)}>
          <rect x={1120} y={270} width={700} height={545} rx={32} fill="none" stroke={C.teal} strokeWidth={4} strokeDasharray="14 12" />
          <Pill x={1470} y={270} text="今後の目標" size={38} bg={C.white} color={C.teal} stroke={C.teal} dashed />
        </g>
        {FUTURE.map(([x, y], i) => {
          const a = goal + 0.3 + i * 0.35;
          return (
            <g key={i}>
              <Arrow x1={660} y1={560} x2={x - 70} y2={y + 10} p={prog(t, a, 0.7)} color={C.teal} w={5} dash="2 14" />
              <At x={x} y={y} s={0.55 * pop(t, a + 0.5)} o={prog(t, a + 0.5, 0.3) * 0.85}>
                <Hospital dashed fill="rgba(255,255,255,0.6)" />
              </At>
            </g>
          );
        })}
        <Txt x={1600} y={520} size={40} weight={800} color={C.teal} o={prog(t, goal + 1.2, 0.5)}>
          ホーチミン市の
        </Txt>
        <Txt x={1600} y={580} size={40} weight={800} color={C.teal} o={prog(t, goal + 1.2, 0.5)}>
          公立病院へ
        </Txt>
        <Note text="※今後の目標を示すイメージです（導入済みではありません）" y={846} o={prog(t, goal + 1.2, 0.5)} />
      </svg>
      <Keyword text="実証から、事業化へ" />
    </AbsoluteFill>
  );
};
