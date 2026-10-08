import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import { lerp, pop, prog } from "../anim";
import { Arrow, At, Bag, Factory, Hospital, Reader, Sheet, Tag, Thermo, Washer } from "../components/icons";
import { Dot, ISO, MapLayer } from "../components/Map";
import { Bg, Keyword, Note, Pill, Txt } from "../components/ui";
import { useScene } from "../SceneContext";
import { C, FONT } from "../theme";
import { MAP_BOX, P, VIEW_ASIA, VIEW_SOUTH_VN } from "./geo";

export const S04: React.FC = () => {
  const { t, cue, seg } = useScene();
  // 地図ズーム（広域 → ベトナム南部）
  const z = prog(t, 0.1, 1.8, Easing.inOut(Easing.cubic));
  const scale = Math.exp(lerp(Math.log(VIEW_ASIA.scale), Math.log(VIEW_SOUTH_VN.scale), z));
  const lon = lerp(VIEW_ASIA.lon, VIEW_SOUTH_VN.lon, Math.min(1, z * 1.4));
  const lat = lerp(VIEW_ASIA.lat, VIEW_SOUTH_VN.lat, Math.min(1, z * 1.4));
  const hosp = cue(0, 0.35);
  const jica = cue(1, 0.0);
  const run = cue(2, 0.1);
  // 図解へ切り替え
  const toDiagram = prog(t, cue(3) - 0.5, 0.7);
  const zone = seg(3, 0);
  const hot = seg(3, 1);
  const rfid = cue(4, 0.0);
  const chips = [
    { text: "場所を分ける", at: zone },
    { text: "高温で洗う", at: hot },
    { text: "一枚ずつ管理", at: rfid },
  ];
  return (
    <AbsoluteFill>
      <Bg />
      {/* ===== 前半：地図 ===== */}
      <div style={{ position: "absolute", inset: 0, opacity: 1 - toDiagram, transform: `translateX(${-toDiagram * 80}px)` }}>
        <svg width={1920} height={1080} style={{ position: "absolute" }}>
          <MapLayer {...MAP_BOX} view={{ lon, lat, scale }} res={z > 0.3 ? "10m" : "50m"} highlight={{ [ISO.vietnam]: { fill: C.tealPale } }}>
            {(proj) => {
              const dn = proj(P.dongNai);
              const hc = proj(P.hcmc);
              const on = prog(t, 1.4, 0.5);
              return (
                <g opacity={on}>
                  <path d={`M${dn[0]} ${dn[1]} L${dn[0] + 120} ${dn[1] - 130}`} stroke={C.gray} strokeWidth={3} />
                  <Dot at={dn} color={C.gray} r={9} />
                  <At x={dn[0] + 170} y={dn[1] - 190} s={0.5} o={0.8}>
                    <Factory />
                  </At>
                  <Txt x={dn[0] + 225} y={dn[1] - 210} size={30} weight={700} color={C.sub} anchor="start">
                    ドンナイ省
                  </Txt>
                  <Txt x={dn[0] + 225} y={dn[1] - 172} size={26} weight={500} color={C.sub} anchor="start">
                    ワタキューベトナムの工場
                  </Txt>
                  <g opacity={prog(t, hosp, 0.4)}>
                    <path d={`M${hc[0]} ${hc[1]} L${hc[0] - 150} ${hc[1] + 90}`} stroke={C.navy} strokeWidth={3} />
                    <At x={hc[0] - 230} y={hc[1] + 150} s={0.62 * pop(t, hosp)}>
                      <Hospital />
                    </At>
                    <Txt x={hc[0] - 230} y={hc[1] + 230} size={30} weight={800} color={C.navy}>
                      ホーチミン市
                    </Txt>
                  </g>
                  <Dot at={hc} color={C.vnRed} ring={C.vnYellow} r={11} o={prog(t, hosp, 0.4)} pulse={((t * 0.8) % 1) * prog(t, hosp, 0.4)} />
                </g>
              );
            }}
          </MapLayer>
          <Note text="※地図上の位置はおおよそです" x={MAP_BOX.x + 20} y={MAP_BOX.y + MAP_BOX.h - 22} anchor="start" o={prog(t, 1.4, 0.5)} />
        </svg>
        {/* 病院ラベル */}
        <div style={{ position: "absolute", left: 1270, top: 250, width: 550, fontFamily: FONT, color: C.navy }}>
          <div style={{ opacity: prog(t, hosp, 0.5) }}>
            <div style={{ fontSize: 34, fontWeight: 700, color: C.teal }}>ホーチミン市</div>
            <div style={{ fontSize: 56, fontWeight: 900, lineHeight: 1.15 }}>レバンティン病院</div>
            <div style={{ marginTop: 10, display: "inline-block", padding: "6px 18px", borderRadius: 12, background: C.tealLight, fontSize: 30, fontWeight: 700 }}>
              病院内の実証用洗濯センター
            </div>
            <div style={{ marginTop: 6, fontSize: 24, fontWeight: 500, color: C.sub }}>※工場とは別の拠点</div>
          </div>
          <div style={{ marginTop: 34, opacity: prog(t, jica, 0.5), transform: `scale(${pop(t, jica)})`, transformOrigin: "left center" }}>
            <div style={{ padding: "16px 22px", borderRadius: 18, border: `3px solid ${C.navy}`, background: C.white }}>
              <div style={{ fontSize: 26, fontWeight: 600, color: C.sub }}>支援</div>
              <div style={{ fontSize: 36, fontWeight: 800 }}>日本の国際協力機構</div>
              <div style={{ fontSize: 30, fontWeight: 700, color: C.teal }}>（JICA）</div>
            </div>
          </div>
          <div style={{ marginTop: 24, fontSize: 38, fontWeight: 800, opacity: prog(t, run, 0.5) }}>
            日本式の仕組みを<span style={{ color: C.teal }}>実際に運用</span>
          </div>
        </div>
      </div>

      {/* ===== 後半：仕組みの図解 ===== */}
      <div style={{ position: "absolute", inset: 0, opacity: toDiagram }}>
        <svg width={1920} height={1080} style={{ position: "absolute" }}>
          {chips.map((c, i) => (
            <Pill
              key={c.text}
              x={500 + i * 460}
              y={262}
              text={`${i + 1}  ${c.text}`}
              size={36}
              bg={t >= c.at ? C.navy : C.white}
              color={t >= c.at ? C.white : C.gray}
              stroke={t >= c.at ? C.navy : C.grayLight}
              s={t >= c.at ? pop(t, c.at) : 1}
            />
          ))}
          {/* ゾーン（使用済み／清潔）。中央の壁で区切り、交差しない一方通行 */}
          <g opacity={prog(t, zone - 0.2, 0.5)}>
            <rect x={150} y={330} width={760} height={430} rx={28} fill={C.orangeLight} />
            <rect x={1010} y={330} width={760} height={430} rx={28} fill={C.blueLight} />
            <Txt x={190} y={372} size={36} weight={800} color={C.orange} anchor="start">使用済みの物</Txt>
            <Txt x={1730} y={372} size={36} weight={800} color={C.blue} anchor="end">清潔な物</Txt>
            <path d="M960 320 V770" stroke={C.navy} strokeWidth={8} strokeDasharray="4 16" strokeLinecap="round" />
          </g>
          <At x={320} y={560} s={1.0} o={prog(t, zone, 0.4)}>
            <Bag />
          </At>
          <Arrow x1={410} y1={560} x2={850} y2={560} p={prog(t, zone + 0.3, 0.7)} color={C.orange} w={9} />
          <At x={960} y={560} s={1.05} o={prog(t, zone, 0.4)}>
            <Washer spin={(t - zone) * 300} hot={t > hot} />
          </At>
          <Arrow x1={1070} y1={560} x2={1430} y2={560} p={prog(t, zone + 0.8, 0.7)} color={C.blue} w={9} />
          <At x={1560} y={560} s={0.9} o={prog(t, zone + 1.2, 0.4)}>
            <Sheet fill={C.white} />
          </At>
          {/* 高温洗浄（数値は出さない） */}
          <g opacity={prog(t, hot, 0.4)}>
            <At x={1082} y={420} s={0.62 * pop(t, hot)}>
              <Thermo level={prog(t, hot + 0.2, 0.9)} />
            </At>
            <Pill x={960} y={700} text="高温で洗う" size={32} bg={C.white} color={C.orange} stroke={C.orange} />
          </g>
          {/* 電子タグ：読み取ると情報が表示される（洗浄はしない） */}
          <g opacity={prog(t, rfid, 0.4)}>
            <At x={1560} y={520} s={0.45 * pop(t, rfid)}>
              <Tag />
            </At>
            <At x={1700} y={540} s={0.62} r={-20}>
              <Reader wave={prog(t, rfid + 0.4, 0.8)} />
            </At>
          </g>
          <g opacity={prog(t, rfid + 0.9, 0.4)}>
            <rect x={1290} y={630} width={440} height={110} rx={16} fill={C.white} stroke={C.navy} strokeWidth={3} />
            <Txt x={1320} y={664} size={28} weight={700} anchor="start">識別番号</Txt>
            <Txt x={1700} y={664} size={28} weight={700} anchor="end" color={C.gray}>– – – –</Txt>
            <Txt x={1320} y={708} size={28} weight={700} anchor="start">使用回数</Txt>
            <Txt x={1700} y={708} size={28} weight={700} anchor="end" color={C.gray}>– – –</Txt>
          </g>
          <Note text="※仕組みのイメージ図です（実際の院内配置ではありません）" y={812} />
        </svg>
      </div>
      <Keyword text="病院での実証" />
    </AbsoluteFill>
  );
};
