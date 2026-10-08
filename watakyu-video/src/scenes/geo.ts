// 地図で使う地点（経度, 緯度）。いずれも市・省レベルのおおよその位置。
export const P = {
  japan: [137.6, 36.0] as [number, number], // 本州中部（国を示す代表点）
  dongNai: [106.86, 10.95] as [number, number], // ドンナイ省ビエンホア付近（工場のある省）
  hcmc: [106.70, 10.78] as [number, number], // ホーチミン市
  myanmar: [96.1, 19.75] as [number, number], // ミャンマー（ネピドー付近）
  indonesia: [113.9, -0.8] as [number, number],
  italy: [12.5, 42.8] as [number, number],
  usa: [-98.5, 39.5] as [number, number],
  poland: [19.4, 52.1] as [number, number],
  germany: [10.4, 51.1] as [number, number],
  brazil: [-51.9, -10.8] as [number, number],
};

// S03 の広域図（東アジア〜東南アジア）
export const MAP_BOX = { x: 100, y: 200, w: 1130, h: 636 };
export const VIEW_ASIA = { lon: 118, lat: 26.2, scale: 838 };
// S04 の拡大図（ベトナム南部）
export const VIEW_SOUTH_VN = { lon: 106.8, lat: 10.75, scale: 15500 };
