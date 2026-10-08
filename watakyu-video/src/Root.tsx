import React from "react";
import { Composition } from "remotion";
import "./fonts";
import { buildTimeline, totalFrames } from "./timeline";
import { FPS, H, W } from "./theme";
import { Video } from "./Video";

// Main / Full：修正版ナレーション（v2）。MainV1 / FullV1：初版ナレーション（比較用）
export const Root: React.FC = () => (
  <>
    <Composition id="Main" component={Video} durationInFrames={totalFrames(buildTimeline("main", "v2"))} fps={FPS} width={W} height={H} defaultProps={{ version: "main" as const, voice: "v2" as const }} />
    <Composition id="Full" component={Video} durationInFrames={totalFrames(buildTimeline("full", "v2"))} fps={FPS} width={W} height={H} defaultProps={{ version: "full" as const, voice: "v2" as const }} />
    <Composition id="MainV1" component={Video} durationInFrames={totalFrames(buildTimeline("main", "v1"))} fps={FPS} width={W} height={H} defaultProps={{ version: "main" as const, voice: "v1" as const }} />
    <Composition id="FullV1" component={Video} durationInFrames={totalFrames(buildTimeline("full", "v1"))} fps={FPS} width={W} height={H} defaultProps={{ version: "full" as const, voice: "v1" as const }} />
  </>
);
