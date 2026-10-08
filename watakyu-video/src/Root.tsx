import React from "react";
import { Composition } from "remotion";
import "./fonts";
import { buildTimeline, totalFrames } from "./timeline";
import { FPS, H, W } from "./theme";
import { Video } from "./Video";

export const Root: React.FC = () => (
  <>
    <Composition id="Main" component={Video} durationInFrames={totalFrames(buildTimeline("main"))} fps={FPS} width={W} height={H} defaultProps={{ version: "main" as const }} />
    <Composition id="Full" component={Video} durationInFrames={totalFrames(buildTimeline("full"))} fps={FPS} width={W} height={H} defaultProps={{ version: "full" as const }} />
  </>
);
