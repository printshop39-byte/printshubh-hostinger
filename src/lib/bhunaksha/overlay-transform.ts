/**
 * BhuNaksha manual overlay — geometry + transform helpers.
 *
 * Phase 1 is MANUAL placement: the overlay image is anchored to the map via a
 * MapLibre `image` source whose four corner coordinates we recompute from a
 * centre point + width/height (metres) + rotation. This keeps the overlay
 * aligned while the admin pans / zooms / rotates the map.
 *
 * TODO(phase2): replace manual placement with control-point georeferencing —
 *   - collect 3–4 image↔map point pairs,
 *   - solve an affine transform (3 pts) or perspective/homography (4 pts),
 *   - support GeoTIFF / KML / SHP import and automatic survey-boundary
 *     extraction. The schema already carries `controlPoints` for this.
 */

export type LngLat = [number, number];

const M_PER_DEG_LAT = 111_320;

/** Geodesic (haversine) distance in metres between two [lng,lat] points. */
export function haversineMeters(a: LngLat, b: LngLat): number {
  const R = 6371008.8;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[1] - a[1]);
  const dLng = toRad(b[0] - a[0]);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[1])) * Math.cos(toRad(b[1])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

export interface PolygonEdge {
  index: number;
  mid: LngLat;
  lengthM: number;
}

export function polygonEdges(coords: LngLat[], closed: boolean): PolygonEdge[] {
  const n = coords.length;
  if (n < 2) return [];
  const edges: PolygonEdge[] = [];
  const count = closed ? n : n - 1;
  for (let i = 0; i < count; i++) {
    const from = coords[i];
    const to = coords[(i + 1) % n];
    edges.push({
      index: i,
      mid: [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2],
      lengthM: haversineMeters(from, to),
    });
  }
  return edges;
}

export function perimeterMeters(edges: PolygonEdge[]): number {
  return edges.reduce((sum, e) => sum + e.lengthM, 0);
}

/** Planar shoelace area (m²) — accurate enough at plot scale. */
export function approxAreaSqMeters(coords: LngLat[]): number {
  if (coords.length < 3) return 0;
  const meanLat = coords.reduce((s, [, lat]) => s + lat, 0) / coords.length;
  const mPerLng = M_PER_DEG_LAT * Math.cos((meanLat * Math.PI) / 180);
  let sum = 0;
  for (let i = 0; i < coords.length; i++) {
    const [lng1, lat1] = coords[i];
    const [lng2, lat2] = coords[(i + 1) % coords.length];
    sum += lng1 * mPerLng * (lat2 * M_PER_DEG_LAT) - lng2 * mPerLng * (lat1 * M_PER_DEG_LAT);
  }
  return Math.abs(sum) / 2;
}

/**
 * Four corner coordinates for a MapLibre `image` source, in the required order
 * [top-left, top-right, bottom-right, bottom-left], for an image of
 * `widthMeters` × `heightMeters` centred at `center` and rotated `rotationDeg`
 * clockwise.
 */
export function computeImageCorners(
  center: LngLat,
  widthMeters: number,
  heightMeters: number,
  rotationDeg: number,
): [LngLat, LngLat, LngLat, LngLat] {
  const [lng, lat] = center;
  const halfW = widthMeters / 2;
  const halfH = heightMeters / 2;
  const rad = (rotationDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const mPerLng = M_PER_DEG_LAT * Math.cos((lat * Math.PI) / 180) || M_PER_DEG_LAT;

  // local metre offsets (x east, y north) before rotation
  const local: Array<[number, number]> = [
    [-halfW, halfH], // TL
    [halfW, halfH], // TR
    [halfW, -halfH], // BR
    [-halfW, -halfH], // BL
  ];

  const corners = local.map(([x, y]) => {
    // clockwise rotation in screen terms (north-up): rotate the offset vector
    const rx = x * cos + y * sin;
    const ry = -x * sin + y * cos;
    const dLng = rx / mPerLng;
    const dLat = ry / M_PER_DEG_LAT;
    return [lng + dLng, lat + dLat] as LngLat;
  });

  return [corners[0], corners[1], corners[2], corners[3]];
}

/** Approximate representative-fraction scale denominator at the map centre. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function approxScaleDenominator(map: any): number {
  const lat = map.getCenter().lat as number;
  const zoom = map.getZoom() as number;
  const metersPerPixel = (156543.03392 * Math.cos((lat * Math.PI) / 180)) / Math.pow(2, zoom);
  return metersPerPixel / (0.0254 / 96);
}

export function niceScaleDenominator(n: number): number {
  if (!isFinite(n) || n <= 0) return 0;
  const pow = Math.pow(10, Math.floor(Math.log10(n)));
  const f = n / pow;
  const nice = f < 1.5 ? 1 : f < 3 ? 2 : f < 4 ? 2.5 : f < 7.5 ? 5 : 10;
  return Math.round(nice * pow);
}

/** Approximate width (metres) currently spanned by the map viewport. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function viewportWidthMeters(map: any): number {
  const b = map.getBounds();
  const lat = map.getCenter().lat as number;
  return haversineMeters([b.getWest(), lat], [b.getEast(), lat]);
}

export function formatTodayDate(): string {
  try {
    return new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}
