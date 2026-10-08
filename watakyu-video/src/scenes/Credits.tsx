import React from "react";
import { meta } from "../timeline";
import { C, FONT } from "../theme";

const SOURCES = {
  main: "VIETJO、ワタキューベトナム公式サイト",
  full: "VIETJO、ワタキューベトナム、ワタキューグループ スポーツサイト、日清医療食品",
};

/** 終了画面の表記（学習用である旨・情報時点・出典・音声クレジット） */
export const Credits: React.FC<{ o: number; variant: "main" | "full"; top: number }> = ({ o, variant, top }) => (
  <div
    style={{
      position: "absolute",
      left: 100,
      right: 100,
      top,
      textAlign: "center",
      fontFamily: FONT,
      color: C.navy,
      opacity: o,
    }}
  >
    <div style={{ display: "inline-block", padding: "8px 28px", borderRadius: 14, background: C.navy, color: C.white, fontSize: 36, fontWeight: 800 }}>
      {meta.label}
    </div>
    <div style={{ marginTop: 18, fontSize: 32, fontWeight: 700 }}>情報：{meta.infoDate}</div>
    <div style={{ marginTop: 10, fontSize: 30, fontWeight: 600 }}>出典：{SOURCES[variant]}</div>
    <div style={{ marginTop: 10, fontSize: 24, fontWeight: 500, color: C.sub }}>
      ナレーション：VOICEVOX:玄野武宏 ／ BGM・効果音：自作 ／ 地図：Natural Earth ／ 図解はイメージです
    </div>
    <div style={{ marginTop: 4, fontSize: 24, fontWeight: 500, color: C.sub }}>
      本動画は企業の公式広告ではありません。会社名はテキストで表記しています。
    </div>
  </div>
);
