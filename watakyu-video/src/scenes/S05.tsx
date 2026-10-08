import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import { lerp, pop, prog } from "../anim";
import { At, Hospital, Truck } from "../components/icons";
import { Bg, Keyword, Pill, Txt } from "../components/ui";
import { useScene } from "../SceneContext";
import { C, FONT } from "../theme";

const fmt1 = (v: number) => v.toFixed(1);
const fmtInt = (v: number) => Math.round(v).toLocaleString("en-US");

const Card: React.FC<{
  x: number; label: string; value: string; unit: string; show: number; o: number;
}> = ({ x, label, value, unit, show, o }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: 300,
      width: 740,
      height: 300,
      borderRadius: 32,
      background: C.white,
      border: `4px solid ${C.navy}`,
      boxShadow: "0 18px 40px rgba(11,37,69,0.10)",
      fontFamily: FONT,
      color: C.navy,
      opacity: o,
      transform: `translateY(${(1 - show) * 30}px)`,
    }}
  >
    <div style={{ position: "absolute", left: 40, top: 30, fontSize: 40, fontWeight: 800 }}>{label}</div>
    <div style={{ position: "absolute", right: 30, top: 30, padding: "4px 16px", borderRadius: 10, background: C.tealLight, fontSize: 24, fontWeight: 700 }}>
      病院での実証実績
    </div>
    <div style={{ position: "absolute", left: 40, right: 40, bottom: 34, display: "flex", alignItems: "baseline", justifyContent: "center", gap: 12 }}>
      <span style={{ fontSize: 150, fontWeight: 900, color: C.teal, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{value}</span>
      <span style={{ fontSize: 64, fontWeight: 800 }}>{unit}</span>
    </div>
  </div>
);

export const S05: React.FC = () => {
  const { t, cue, seg } = useScene();
  // 数字は読み上げの直前0.8秒でカウントアップし、読み上げ時は最終値で静止
  const n1At = seg(0, 2) - 0.8;
  const n2At = seg(1, 1) - 0.8;
  const v1 = lerp(0, 72.6, prog(t, n1At, 0.8, Easing.out(Easing.cubic)));
  const v2 = lerp(0, 3170, prog(t, n2At, 0.8, Easing.out(Easing.cubic)));
  const c1 = seg(0, 1) - 0.3;
  const c2 = cue(1) - 0.2;
  const route = cue(2, 0.05);
  const rp = prog(t, route, 0.6);
  // トラックの往復（回収と配送）
  const cyc = Math.max(0, t - route - 0.4) / 2.6;
  const ph = cyc % 1;
  const tx = lerp(700, 1220, ph < 0.5 ? Easing.inOut(Easing.quad)(ph * 2) : 1 - Easing.inOut(Easing.quad)((ph - 0.5) * 2));
  const dir = ph < 0.5 ? 1 : -1;
  return (
    <AbsoluteFill>
      <Bg />
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <Pill x={960} y={240} text="実証期間 約1年4か月" size={38} bg={C.navy} color={C.white} stroke={C.navy} o={prog(t, cue(0) - 0.1, 0.5)} s={pop(t, cue(0) - 0.1)} />
      </svg>
      <Card x={140} label="処理したリネン" value={`約${fmt1(v1)}`} unit="トン" show={prog(t, c1, 0.6)} o={prog(t, c1, 0.5)} />
      <Card x={1040} label="洗濯の回数" value={fmtInt(v2)} unit="回以上" show={prog(t, c2, 0.6)} o={prog(t, c2, 0.5)} />
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <g opacity={rp}>
          <path d="M600 760 H1320" stroke={C.teal} strokeWidth={6} strokeDasharray="3 16" strokeLinecap="round" />
          <At x={520} y={730} s={0.62}>
            <Hospital fill={C.tealPale} />
          </At>
          <Txt x={520} y={812} size={26} weight={700}>実証センター</Txt>
          <At x={1400} y={730} s={0.62}>
            <Hospital />
          </At>
          <Txt x={1400} y={812} size={26} weight={700}>近くの別の病院</Txt>
          <g transform={`translate(${tx},728) scale(${dir * 0.55},0.55)`}>
            <Truck wheel={t * 400} />
          </g>
          <Txt x={960} y={812} size={28} weight={800} color={C.teal}>回収・配送も試行</Txt>
        </g>
      </svg>
      <Keyword text="病院での実証実績" />
    </AbsoluteFill>
  );
};
