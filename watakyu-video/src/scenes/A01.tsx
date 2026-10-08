import React from "react";
import { AbsoluteFill } from "remotion";
import { pop, prog } from "../anim";
import { At, Ball, Racket } from "../components/icons";
import { Dot, ISO, MapLayer } from "../components/Map";
import { Bg, Keyword, Pill, Txt } from "../components/ui";
import { useScene } from "../SceneContext";
import { C } from "../theme";
import { P } from "./geo";

const BOX = { x: 560, y: 230, w: 1260, h: 600 };
// 表示順と、ラベルの置き方（ヨーロッパは近いので引き出し線で離す）
const COUNTRIES: { key: keyof typeof P; iso: string; name: string; dx: number; dy: number }[] = [
  { key: "italy", iso: ISO.italy, name: "イタリア", dx: 90, dy: 80 },
  { key: "usa", iso: ISO.usa, name: "アメリカ", dx: 0, dy: -70 },
  { key: "poland", iso: ISO.poland, name: "ポーランド", dx: 120, dy: -70 },
  { key: "germany", iso: ISO.germany, name: "ドイツ", dx: -110, dy: -80 },
  { key: "brazil", iso: ISO.brazil, name: "ブラジル", dx: 0, dy: 70 },
];

export const A01: React.FC = () => {
  const { t, cue } = useScene();
  const start = cue(1, 0.05);
  const span = cue(2, 1) - start;
  const ats = COUNTRIES.map((_, i) => start + (span * i) / COUNTRIES.length);
  const bounce = Math.abs(Math.sin(t * 3.2));
  const hl: Record<string, { fill: string }> = {};
  COUNTRIES.forEach((c, i) => {
    if (t >= ats[i]) hl[c.iso] = { fill: C.tealLight };
  });
  return (
    <AbsoluteFill>
      <Bg />
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {/* ラケットとボール */}
        <g opacity={prog(t, 0.2, 0.5)}>
          <At x={300} y={520} s={1.5 * pop(t, 0.2)}>
            <Racket />
          </At>
          <At x={380} y={300 + bounce * 120} s={1.2}>
            <Ball />
          </At>
          <Txt x={320} y={790} size={36} weight={800}>ソフトテニス部</Txt>
        </g>
        <g opacity={prog(t, cue(0, 0.4), 0.6)}>
          <MapLayer {...BOX} world res="110m" view={{ lon: -10, lat: 8, scale: 232 }} highlight={hl}>
            {(proj) => (
              <g>
                {COUNTRIES.map((c, i) => {
                  const p = proj(P[c.key]);
                  const o = prog(t, ats[i], 0.4);
                  const lx = p[0] + c.dx;
                  const ly = p[1] + c.dy;
                  return (
                    <g key={c.key} opacity={o}>
                      <path d={`M${p[0]} ${p[1]} L${lx} ${ly}`} stroke={C.navy} strokeWidth={2.5} />
                      <Dot at={p} color={C.teal} r={8} />
                      <Pill x={lx} y={ly} text={c.name} size={28} s={pop(t, ats[i])} />
                    </g>
                  );
                })}
              </g>
            )}
          </MapLayer>
          <Pill x={BOX.x + 250} y={BOX.y + BOX.h - 40} text="大会の開催実績（過去）" size={30} bg={C.navy} color={C.white} stroke={C.navy} />
        </g>
      </svg>
      <Keyword text="スポーツを通じた国際交流" />
    </AbsoluteFill>
  );
};
