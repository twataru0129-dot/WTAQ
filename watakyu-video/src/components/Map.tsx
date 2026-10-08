// Natural Earth（world-atlas）の国境データを d3-geo のメルカトル図法で描く。
// 位置関係は実データどおり。描画は「場所を示す図」であり、行政区画の境界は描かない。
import { geoArea, geoBounds, geoMercator, geoNaturalEarth1, geoPath, type GeoProjection } from "d3-geo";
import React, { useMemo } from "react";
import { feature } from "topojson-client";
import type { FeatureCollection, Geometry } from "geojson";
import w50 from "world-atlas/countries-50m.json";
import w10 from "world-atlas/countries-10m.json";
import w110 from "world-atlas/countries-110m.json";
import { C } from "../theme";

type Feat = FeatureCollection<Geometry, { name: string }>["features"][number] & { bbox4?: number[] };

const toFeats = (topo: unknown): Feat[] => {
  const fc = feature(topo as never, (topo as { objects: { countries: never } }).objects.countries) as unknown as FeatureCollection<
    Geometry,
    { name: string }
  >;
  return fc.features.map((f) => {
    // 巻き方向が逆の多角形（10m データのモルディブの一部の島）は地球全体を塗ってしまうので、多角形ごとに反転して修正
    const g = f.geometry as { type: string; coordinates: number[][][] | number[][][][] };
    const polys = g.type === "Polygon" ? [g.coordinates as number[][][]] : g.type === "MultiPolygon" ? (g.coordinates as number[][][][]) : [];
    for (const poly of polys) {
      if (geoArea({ type: "Polygon", coordinates: poly } as never) > 2 * Math.PI) poly.forEach((r) => r.reverse());
    }
    const b = geoBounds(f as never);
    return Object.assign(f, { bbox4: [b[0][0], b[0][1], b[1][0], b[1][1]] });
  });
};

let cache: Record<string, Feat[]> = {};
const feats = (res: "10m" | "50m" | "110m") => {
  if (!cache[res]) cache[res] = toFeats(res === "10m" ? w10 : res === "50m" ? w50 : w110);
  return cache[res];
};

// ISO 3166-1 数値コード
export const ISO = {
  japan: "392",
  vietnam: "704",
  myanmar: "104",
  indonesia: "360",
  italy: "380",
  usa: "840",
  poland: "616",
  germany: "276",
  brazil: "076",
};

export type MapView = { lon: number; lat: number; scale: number };

export const MapLayer: React.FC<{
  x: number; y: number; w: number; h: number;
  view: MapView;
  res?: "10m" | "50m" | "110m";
  world?: boolean; // true: 世界全図（Natural Earth 図法）
  highlight?: Record<string, { fill: string; o?: number }>;
  radius?: number;
  children?: (proj: (lonlat: [number, number]) => [number, number]) => React.ReactNode;
}> = ({ x, y, w, h, view, res = "50m", world = false, highlight = {}, radius = 24, children }) => {
  const id = useMemo(() => `clip${Math.round(x)}_${Math.round(y)}_${Math.round(w)}`, [x, y, w]);
  const projection: GeoProjection = (world ? geoNaturalEarth1() : geoMercator())
    .center([view.lon, view.lat])
    .scale(view.scale)
    .translate([x + w / 2, y + h / 2]);
  const path = geoPath(projection);
  // 画面に入る範囲の国だけ描く
  const inv = (px: number, py: number) => projection.invert!([px, py]) ?? [0, 0];
  const [lonA, latA] = inv(x, y + h);
  const [lonB, latB] = inv(x + w, y);
  const list = world
    ? feats(res)
    : feats(res).filter((f) => {
        const b = f.bbox4!;
        if (b[0] > b[2]) return true; // 日付変更線をまたぐ国
        return b[2] >= lonA - 2 && b[0] <= lonB + 2 && b[3] >= latA - 2 && b[1] <= latB + 2;
      });
  const proj = (ll: [number, number]) => projection(ll) as [number, number];
  return (
    <g>
      <defs>
        <clipPath id={id}>
          <rect x={x} y={y} width={w} height={h} rx={radius} />
        </clipPath>
      </defs>
      <rect x={x} y={y} width={w} height={h} rx={radius} fill="#EAF4F8" />
      <g clipPath={`url(#${id})`}>
        {list.map((f, i) => {
          const hl = highlight[String(f.id)];
          return (
            <path
              key={`${f.id}-${i}`}
              d={path(f as never) ?? ""}
              fill={hl ? hl.fill : "#FFFFFF"}
              fillOpacity={hl?.o ?? 1}
              stroke="#B9C7D4"
              strokeWidth={1.2}
              strokeLinejoin="round"
            />
          );
        })}
        {children?.(proj)}
      </g>
      <rect x={x} y={y} width={w} height={h} rx={radius} fill="none" stroke={C.grayLight} strokeWidth={2} />
    </g>
  );
};

/** 2点を結ぶ弧（p で伸びる、流れる破線） */
export const ArcLine: React.FC<{
  a: [number, number]; b: [number, number]; p: number; bend?: number; color?: string; w?: number; flow?: number; dashed?: boolean;
}> = ({ a, b, p, bend = 0.25, color = C.teal, w = 6, flow = 0, dashed = true }) => {
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2;
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const cx = mx - dy * bend;
  const cy = my + dx * bend;
  const len = Math.hypot(dx, dy) * 1.15;
  return (
    <g>
      <path
        d={`M${a[0]} ${a[1]} Q${cx} ${cy} ${b[0]} ${b[1]}`}
        fill="none"
        stroke={color}
        strokeWidth={w}
        strokeLinecap="round"
        strokeDasharray={`${len}`}
        strokeDashoffset={len * (1 - p)}
        opacity={0.25}
      />
      <path
        d={`M${a[0]} ${a[1]} Q${cx} ${cy} ${b[0]} ${b[1]}`}
        fill="none"
        stroke={color}
        strokeWidth={w}
        strokeLinecap="round"
        strokeDasharray={dashed ? "2 18" : undefined}
        strokeDashoffset={-flow}
        mask={undefined}
        opacity={p >= 1 ? 1 : 0}
      />
    </g>
  );
};

/** 地点マーカー */
export const Dot: React.FC<{ at: [number, number]; color?: string; r?: number; ring?: string; o?: number; pulse?: number }> = ({
  at,
  color = C.navy,
  r = 10,
  ring = C.white,
  o = 1,
  pulse = 0,
}) => (
  <g opacity={o}>
    {pulse > 0 && <circle cx={at[0]} cy={at[1]} r={r + 26 * pulse} fill="none" stroke={color} strokeWidth={3} opacity={1 - pulse} />}
    <circle cx={at[0]} cy={at[1]} r={r + 4} fill={ring} />
    <circle cx={at[0]} cy={at[1]} r={r} fill={color} />
  </g>
);

export const mercScaleFor = (lonSpanDeg: number, widthPx: number) => widthPx / ((lonSpanDeg * Math.PI) / 180);
