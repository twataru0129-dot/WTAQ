import React from "react";
import { AbsoluteFill } from "remotion";
import { prog } from "../anim";
import { Bg } from "../components/ui";
import { useScene } from "../SceneContext";
import { C, FONT } from "../theme";
import { Credits } from "./Credits";

export const A03: React.FC = () => {
  const { t } = useScene();
  const o = prog(t, 0.1, 0.6);
  return (
    <AbsoluteFill>
      <Bg />
      <div style={{ position: "absolute", left: 0, right: 0, top: 220, textAlign: "center", fontFamily: FONT, color: C.navy, opacity: o }}>
        <div style={{ fontSize: 88, fontWeight: 900, letterSpacing: 4 }}>一枚のシーツから世界へ</div>
        <div style={{ marginTop: 14, fontSize: 40, fontWeight: 700, color: C.teal }}>ワタキューセイモアの海外での挑戦</div>
      </div>
      <Credits o={o} variant="full" top={500} />
    </AbsoluteFill>
  );
};
