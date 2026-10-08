import React from "react";
import { AbsoluteFill } from "remotion";
import { pop, prog } from "../anim";
import { At, Factory } from "../components/icons";
import { ArcLine, Dot, ISO, MapLayer } from "../components/Map";
import { Bg, Keyword, Txt } from "../components/ui";
import { useScene } from "../SceneContext";
import { C, FONT } from "../theme";
import { MAP_BOX, P, VIEW_ASIA } from "./geo";

export const S03: React.FC = () => {
  const { t, cue } = useScene();
  const arc = prog(t, cue(0, 0.1), 1.6);
  const fac = cue(1, 0.2);
  const y1 = cue(1, 0.05);
  const y2 = cue(2, 0.05);
  return (
    <AbsoluteFill>
      <Bg />
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <MapLayer {...MAP_BOX} view={VIEW_ASIA} highlight={{ [ISO.japan]: { fill: C.blueLight }, [ISO.vietnam]: { fill: C.tealLight } }}>
          {(proj) => {
            const jp = proj(P.japan);
            const dn = proj(P.dongNai);
            return (
              <g>
                <ArcLine a={jp} b={dn} p={arc} bend={-0.22} color={C.teal} w={7} flow={t * 40} />
                <Dot at={jp} color={C.navy} r={11} o={prog(t, 0.3, 0.4)} />
                <Txt x={jp[0] + 10} y={jp[1] + 52} size={40} weight={800} o={prog(t, 0.3, 0.4)}>
                  日本
                </Txt>
                <Txt x={dn[0] + 80} y={dn[1] - 210} size={40} weight={800} o={prog(t, 0.6, 0.4)}>
                  ベトナム
                </Txt>
                <Dot at={dn} color={C.vnRed} ring={C.vnYellow} r={10} o={prog(t, cue(0, 0.6), 0.4)} pulse={(t * 0.8) % 1 * prog(t, fac, 0.3)} />
                {/* 工場アイコンとラベル（左側の余白へ引き出し線） */}
                <g opacity={prog(t, fac, 0.5)}>
                  <path d={`M${dn[0]} ${dn[1]} L${dn[0] + 70} ${dn[1] - 60}`} stroke={C.navy} strokeWidth={3} />
                  <path d={`M${dn[0]} ${dn[1]} L${dn[0] - 90} ${dn[1] - 40}`} stroke={C.navy} strokeWidth={3} opacity={prog(t, fac + 0.15, 0.5)} />
                  <At x={dn[0] + 130} y={dn[1] - 100} s={0.55 * pop(t, fac)}>
                    <Factory />
                  </At>
                </g>
              </g>
            );
          }}
        </MapLayer>
      </svg>
      {/* ラベルカード */}
      <div
        style={{
          position: "absolute",
          left: 116,
          top: 560,
          width: 340,
          padding: "16px 22px",
          borderRadius: 18,
          background: "rgba(255,255,255,0.96)",
          border: `3px solid ${C.navy}`,
          fontFamily: FONT,
          color: C.navy,
          opacity: prog(t, fac + 0.15, 0.5),
        }}
      >
        <div style={{ fontSize: 31, fontWeight: 800, whiteSpace: "nowrap" }}>ワタキューベトナム</div>
        <div style={{ fontSize: 26, fontWeight: 600, color: C.sub }}>現地法人・洗濯工場</div>
        <div style={{ marginTop: 6, fontSize: 30, fontWeight: 800, color: C.teal }}>ドンナイ省</div>
      </div>
      {/* 年表 */}
      <div style={{ position: "absolute", left: 1290, top: 250, width: 530, fontFamily: FONT, color: C.navy }}>
        <div style={{ fontSize: 30, fontWeight: 700, color: C.sub, opacity: prog(t, y1 - 0.3, 0.5) }}>ワタキューベトナムのあゆみ</div>
        <div style={{ position: "relative", marginTop: 26, paddingLeft: 60 }}>
          <div style={{ position: "absolute", left: 18, top: 20, width: 6, height: 250 * prog(t, y1, y2 - y1 + 0.4), background: C.teal, borderRadius: 3 }} />
          {[
            { at: y1, year: "2019年", text: "現地法人 設立" },
            { at: y2, year: "2024年4月", text: "工場 稼働" },
          ].map((e, i) => {
            const p = prog(t, e.at, 0.5);
            return (
              <div key={i} style={{ position: "relative", height: 250, opacity: 0.25 + 0.75 * p }}>
                <div style={{ position: "absolute", left: -56, top: 12, width: 36, height: 36, borderRadius: 18, background: p > 0.5 ? C.teal : C.grayLight, border: `5px solid ${C.white}`, boxShadow: `0 0 0 3px ${C.teal}` }} />
                <div style={{ fontSize: 64, fontWeight: 900, lineHeight: 1.1 }}>{e.year}</div>
                <div style={{ fontSize: 44, fontWeight: 700, marginTop: 8 }}>{e.text}</div>
              </div>
            );
          })}
        </div>
      </div>
      <Keyword text="日本からベトナムへ" />
    </AbsoluteFill>
  );
};
