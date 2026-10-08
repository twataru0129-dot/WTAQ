import React from "react";
import { AbsoluteFill } from "remotion";
import { lerp, pop, prog } from "../anim";
import { Arrow, At, Bag, Inspect, Sheet, Truck, Washer } from "../components/icons";
import { Bg, Keyword, Note, Pill, Txt } from "../components/ui";
import { useScene } from "../SceneContext";
import { C } from "../theme";

const XS = [330, 750, 1170, 1590];
const Y = 480;
const LABELS = ["回収", "洗濯", "検査", "お届け"];

export const S02: React.FC = () => {
  const { t, cue, seg } = useScene();
  const steps = [seg(0, 1), cue(1, 0.02), cue(1, 0.3), cue(1, 0.62)];
  const active = steps.reduce((a, s, i) => (t >= s ? i : a), -1);
  const supply = cue(2, 0.35);
  const allOn = prog(t, supply, 0.6);
  // シーツの位置：中央 → 各工程の上へ
  let sx = 960;
  let sy = 500;
  let ss = 1.4;
  if (active >= 0) {
    const p = prog(t, steps[active], 0.55);
    const prevX = active === 0 ? 960 : XS[active - 1];
    const prevY = active === 0 ? 500 : Y - 190;
    sx = lerp(prevX, XS[active], p);
    sy = lerp(prevY, Y - 190, p);
    ss = active === 0 ? lerp(1.4, 0.55, p) : 0.55;
  }
  const washed = active >= 1 && t > steps[1] + 0.6;
  const spin = (t - steps[1]) * 360;
  return (
    <AbsoluteFill>
      <Bg />
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <Pill x={960} y={262} text="ワタキューセイモア" size={40} bg={C.navy} color={C.white} stroke={C.navy} o={prog(t, cue(0) - 0.1, 0.5)} s={pop(t, cue(0) - 0.1)} />
        {XS.slice(0, 3).map((x, i) => (
          <Arrow key={x} x1={x + 130} y1={Y} x2={XS[i + 1] - 130} y2={Y} p={prog(t, steps[i + 1] - 0.2, 0.4)} color={C.teal} w={6} />
        ))}
        {XS.map((x, i) => {
          const on = t >= steps[i];
          const isActive = active === i && allOn < 1;
          const s = pop(t, steps[i], 0.5) * (isActive ? 1.18 : lerp(0.9, 1.0, allOn));
          const o = on ? (isActive ? 1 : lerp(0.75, 1, allOn)) : 0.0;
          return (
            <g key={x} transform={`translate(${x},${Y})`} opacity={o}>
              <g transform={`scale(${s})`}>
                <circle r={120} fill={isActive ? C.tealLight : C.white} stroke={isActive ? C.teal : C.grayLight} strokeWidth={6} />
                <g transform="scale(0.85)">
                  {i === 0 && <Bag />}
                  {i === 1 && <Washer spin={on ? spin : 0} />}
                  {i === 2 && <Inspect check={prog(t, steps[2] + 0.2, 0.5)} />}
                  {i === 3 && <Truck wheel={on ? (t - steps[3]) * 300 : 0} />}
                </g>
              </g>
              <Txt x={0} y={180} size={isActive ? 50 : 44} weight={800} color={isActive ? C.teal : C.navy}>
                {LABELS[i]}
              </Txt>
            </g>
          );
        })}
        <At x={sx} y={sy} s={ss} o={1 - allOn}>
          <Sheet fill={active < 0 || washed ? C.white : C.orangeLight} />
        </At>
        {/* リネンサプライ：工程全体をまとめる */}
        <g opacity={allOn}>
          <rect x={XS[0] - 170} y={Y - 160} width={XS[3] - XS[0] + 340} height={420} rx={40} fill="none" stroke={C.teal} strokeWidth={4} strokeDasharray="14 12" />
        </g>
        <Pill x={960} y={772} text="リネンサプライ" size={52} bg={C.teal} color={C.white} stroke={C.teal} o={allOn} s={pop(t, supply)} />
        <Note text="※会社の業務の一部をイメージ化しています" o={prog(t, 0.5, 0.6)} y={826} />
      </svg>
      <Keyword text="回収 → 洗濯 → 検査 → お届け" />
    </AbsoluteFill>
  );
};
