import { Easing, interpolate } from "remotion";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** t が t0 から dur 秒かけて 0→1（イーズ付き） */
export const prog = (t: number, t0: number, dur = 0.6, ease = Easing.bezier(0.33, 0, 0.2, 1)) =>
  interpolate(t, [t0, t0 + dur], [0, 1], { ...clamp, easing: ease });

/** 0→1→0（in と out の区間） */
export const window = (t: number, tin: number, tout: number, fade = 0.4) =>
  Math.min(prog(t, tin, fade), 1 - prog(t, tout - fade, fade));

export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

export const pop = (t: number, t0: number, dur = 0.5) =>
  interpolate(t, [t0, t0 + dur * 0.6, t0 + dur], [0, 1.06, 1], {
    ...clamp,
    easing: Easing.out(Easing.quad),
  });
