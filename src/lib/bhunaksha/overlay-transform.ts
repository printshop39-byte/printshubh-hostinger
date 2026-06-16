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

/* ── Four-corner overlay model ────────────────────────────────────────────────
 *
 * The overlay is rendered from four explicit corner coordinates (MapLibre
 * `image` source). A clean rotated rectangle is built from params
 * (center / width / height / rotation); corner & edge dragging then edits the
 * corners freely, which allows skew/perspective-like manual fitting. `deriveParams`
 * recovers approximate center / rotation / scaleX / scaleY from an edited quad
 * so the numeric panel stays roughly in sync. */
export type Corners = {
  topLeft: LngLat;
  topRight: LngLat;
  bottomRight: LngLat;
  bottomLeft: LngLat;
};

export function cornersFromParams(
  center: LngLat,
  widthMeters: number,
  heightMeters: number,
  rotationDeg: number,
): Corners {
  const [tl, tr, br, bl] = computeImageCorners(center, widthMeters, heightMeters, rotationDeg);
  return { topLeft: tl, topRight: tr, bottomRight: br, bottomLeft: bl };
}

export function cornersToCoords(c: Corners): [LngLat, LngLat, LngLat, LngLat] {
  return [c.topLeft, c.topRight, c.bottomRight, c.bottomLeft];
}

export function cornersCentroid(c: Corners): LngLat {
  const pts = [c.topLeft, c.topRight, c.bottomRight, c.bottomLeft];
  return [
    pts.reduce((s, p) => s + p[0], 0) / 4,
    pts.reduce((s, p) => s + p[1], 0) / 4,
  ];
}

export function midpointLngLat(a: LngLat, b: LngLat): LngLat {
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
}

export function translateCorners(c: Corners, dLng: number, dLat: number): Corners {
  const t = (p: LngLat): LngLat => [p[0] + dLng, p[1] + dLat];
  return { topLeft: t(c.topLeft), topRight: t(c.topRight), bottomRight: t(c.bottomRight), bottomLeft: t(c.bottomLeft) };
}

/** Rigidly rotate all corners clockwise by `deltaDeg` around `center`. */
export function rotateCornersAround(c: Corners, center: LngLat, deltaDeg: number): Corners {
  const rad = (deltaDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const mPerLng = M_PER_DEG_LAT * Math.cos((center[1] * Math.PI) / 180) || M_PER_DEG_LAT;
  const rot = (p: LngLat): LngLat => {
    const x = (p[0] - center[0]) * mPerLng;
    const y = (p[1] - center[1]) * M_PER_DEG_LAT;
    const rx = x * cos + y * sin;
    const ry = -x * sin + y * cos;
    return [center[0] + rx / mPerLng, center[1] + ry / M_PER_DEG_LAT];
  };
  return { topLeft: rot(c.topLeft), topRight: rot(c.topRight), bottomRight: rot(c.bottomRight), bottomLeft: rot(c.bottomLeft) };
}

/** Approximate center / rotation / scaleX / scaleY of a (possibly skewed) quad. */
export function deriveParams(
  c: Corners,
  baseWidthMeters: number,
  baseHeightMeters: number,
): { center: LngLat; rotationDeg: number; scaleX: number; scaleY: number; widthMeters: number; heightMeters: number } {
  const center = cornersCentroid(c);
  const widthEff = (haversineMeters(c.topLeft, c.topRight) + haversineMeters(c.bottomLeft, c.bottomRight)) / 2;
  const heightEff = (haversineMeters(c.topLeft, c.bottomLeft) + haversineMeters(c.topRight, c.bottomRight)) / 2;
  const mPerLng = M_PER_DEG_LAT * Math.cos((center[1] * Math.PI) / 180) || M_PER_DEG_LAT;
  const dx = (c.topRight[0] - c.topLeft[0]) * mPerLng;
  const dy = (c.topRight[1] - c.topLeft[1]) * M_PER_DEG_LAT;
  const rotationDeg = -(Math.atan2(dy, dx) * 180) / Math.PI;
  return {
    center,
    rotationDeg,
    scaleX: baseWidthMeters > 0 ? widthEff / baseWidthMeters : 1,
    scaleY: baseHeightMeters > 0 ? heightEff / baseHeightMeters : 1,
    widthMeters: widthEff,
    heightMeters: heightEff,
  };
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

/**
 * Suggest an overlay placement (centre / size / rotation) from the control
 * points the admin has marked on the live map. This is a PRACTICAL Phase-2
 * heuristic — NOT a true georeference:
 *   - centre  = centroid of the control points,
 *   - size    = the points' spread (bounding diagonal) padded ~30 %, keeping
 *               the image aspect ratio,
 *   - rotation= the bearing of the first → second control point.
 * With ≥2 points this gives translate + scale + rotation; the admin then
 * fine-tunes. Returns null for <2 points.
 *
 * TODO(phase2): when imagePoint pairs are available, replace this with an
 * affine (3 pts) / perspective (4 pts) solve for a real georeference.
 */
export function suggestOverlayPlacement(
  points: LngLat[],
  aspect: number,
): { center: LngLat; widthMeters: number; heightMeters: number; rotationDeg: number } | null {
  if (points.length < 2) return null;
  const lng = points.reduce((s, p) => s + p[0], 0) / points.length;
  const lat = points.reduce((s, p) => s + p[1], 0) / points.length;
  const mPerLng = M_PER_DEG_LAT * Math.cos((lat * Math.PI) / 180) || M_PER_DEG_LAT;

  const xs = points.map((p) => (p[0] - lng) * mPerLng);
  const ys = points.map((p) => (p[1] - lat) * M_PER_DEG_LAT);
  const spanX = Math.max(...xs) - Math.min(...xs);
  const spanY = Math.max(...ys) - Math.min(...ys);
  const diag = Math.hypot(spanX, spanY) || 100;
  const safeAspect = aspect > 0 ? aspect : 1;
  const widthMeters = Math.max(50, diag * 1.3);

  const dx = (points[1][0] - points[0][0]) * mPerLng;
  const dy = (points[1][1] - points[0][1]) * M_PER_DEG_LAT;
  const rotationDeg = -(Math.atan2(dy, dx) * 180) / Math.PI;

  return { center: [lng, lat], widthMeters, heightMeters: widthMeters / safeAspect, rotationDeg };
}

/**
 * Best-effort lat/lng extraction from a Google Maps URL. Handles the common
 * `@lat,lng`, `q=lat,lng`, `!3dlat!4dlng` and bare "lat, lng" forms. Returns
 * null for shortlinks (maps.app.goo.gl / goo.gl/maps) that need a network
 * redirect to resolve — the caller should then ask for manual lat/lng.
 */
export function parseLatLngFromGoogleMapsUrl(input: string): LngLat | null {
  if (!input) return null;
  const s = input.trim();
  const valid = (lat: number, lng: number) =>
    Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
  const patterns = [
    /@(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)/,
    /[?&]q=(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)/,
    /[?&](?:ll|center|destination)=(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)/,
    /!3d(-?\d{1,3}\.\d+)!4d(-?\d{1,3}\.\d+)/,
    /geo:(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)/,
    /(-?\d{1,3}\.\d{3,}),\s*(-?\d{1,3}\.\d{3,})/,
  ];
  for (const re of patterns) {
    const m = s.match(re);
    if (m) {
      const lat = parseFloat(m[1]);
      const lng = parseFloat(m[2]);
      if (valid(lat, lng)) return [lng, lat];
    }
  }
  return null;
}

/* ── Control-point georeferencing (Priority 2 — multi-reference alignment) ─────
 *
 * Given ≥2 ground-control points (image pixel ↔ map lng/lat), solve a planar
 * transform that maps the BhuNaksha image into map space, then project the four
 * image corners through it to get the overlay's corner coordinates:
 *   - 2 points → similarity (translate + uniform scale + rotation),
 *   - 3+ points → affine (adds shear/aspect; least-squares over all points).
 * The RMS of the residuals (predicted vs. actual map position, in metres) feeds
 * the alignment accuracy score. This is a real least-squares georeference — not
 * the earlier centroid heuristic in `suggestOverlayPlacement`.
 *
 * 4-point perspective/homography is intentionally left for a later pass. */

export type GroundControlPoint = { imagePoint: LngLat; mapLngLat: LngLat };
export type AlignMethod = "similarity" | "affine";

/** Local east/north metres relative to an origin lng/lat (small-area planar). */
function lngLatToLocalMeters(p: LngLat, origin: LngLat): [number, number] {
  const mPerLng = M_PER_DEG_LAT * Math.cos((origin[1] * Math.PI) / 180) || M_PER_DEG_LAT;
  return [(p[0] - origin[0]) * mPerLng, (p[1] - origin[1]) * M_PER_DEG_LAT];
}
function localMetersToLngLat(m: [number, number], origin: LngLat): LngLat {
  const mPerLng = M_PER_DEG_LAT * Math.cos((origin[1] * Math.PI) / 180) || M_PER_DEG_LAT;
  return [origin[0] + m[0] / mPerLng, origin[1] + m[1] / M_PER_DEG_LAT];
}

/** Solve a dense n×n linear system (Gaussian elimination with partial pivot). */
function solveLinearSystem(A: number[][], b: number[]): number[] | null {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    let piv = col;
    for (let r = col + 1; r < n; r++) if (Math.abs(M[r][col]) > Math.abs(M[piv][col])) piv = r;
    if (Math.abs(M[piv][col]) < 1e-12) return null; // singular / collinear
    [M[col], M[piv]] = [M[piv], M[col]];
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const f = M[r][col] / M[col][col];
      for (let c = col; c <= n; c++) M[r][c] -= f * M[col][c];
    }
  }
  return M.map((row, i) => row[n] / row[i]);
}

/** Apply the image-pixel convention used by the solver (flip Y to north-up). */
function srcConv(px: LngLat): [number, number] {
  return [px[0], -px[1]];
}

type Transform = (pt: [number, number]) => [number, number];

/** 2D similarity (conformal) least-squares: [[a,-b],[b,a]]·x + [tx,ty]. */
function solveSimilarity(src: [number, number][], dst: [number, number][]): Transform | null {
  // Unknowns u = [a, b, tx, ty]; two equations per point.
  const ATA = Array.from({ length: 4 }, () => new Array(4).fill(0));
  const ATb = new Array(4).fill(0);
  const addRow = (coef: number[], rhs: number) => {
    for (let i = 0; i < 4; i++) {
      ATb[i] += coef[i] * rhs;
      for (let j = 0; j < 4; j++) ATA[i][j] += coef[i] * coef[j];
    }
  };
  for (let k = 0; k < src.length; k++) {
    const [sx, sy] = src[k];
    addRow([sx, -sy, 1, 0], dst[k][0]); // dst.x
    addRow([sy, sx, 0, 1], dst[k][1]); // dst.y
  }
  const u = solveLinearSystem(ATA, ATb);
  if (!u) return null;
  const [a, b, tx, ty] = u;
  return ([x, y]) => [a * x - b * y + tx, b * x + a * y + ty];
}

/** 6-parameter affine least-squares (two independent 3-var solves). */
function solveAffine(src: [number, number][], dst: [number, number][]): Transform | null {
  const build = (axis: 0 | 1): number[] | null => {
    const ATA = Array.from({ length: 3 }, () => new Array(3).fill(0));
    const ATb = new Array(3).fill(0);
    for (let k = 0; k < src.length; k++) {
      const coef = [src[k][0], src[k][1], 1];
      const rhs = dst[k][axis];
      for (let i = 0; i < 3; i++) {
        ATb[i] += coef[i] * rhs;
        for (let j = 0; j < 3; j++) ATA[i][j] += coef[i] * coef[j];
      }
    }
    return solveLinearSystem(ATA, ATb);
  };
  const px = build(0);
  const py = build(1);
  if (!px || !py) return null;
  return ([x, y]) => [px[0] * x + px[1] * y + px[2], py[0] * x + py[1] * y + py[2]];
}

export type GeorefResult = {
  corners: Corners;
  method: AlignMethod;
  rmsMeters: number;
  pointCount: number;
};

/**
 * Georeference an `imgW × imgH` image from ground-control points and return the
 * four map corners + fit quality. Returns null for <2 points or a degenerate
 * (collinear) configuration.
 */
export function georeferenceImage(
  gcps: GroundControlPoint[],
  imgW: number,
  imgH: number,
): GeorefResult | null {
  if (gcps.length < 2 || imgW <= 0 || imgH <= 0) return null;
  const origin: LngLat = [
    gcps.reduce((s, g) => s + g.mapLngLat[0], 0) / gcps.length,
    gcps.reduce((s, g) => s + g.mapLngLat[1], 0) / gcps.length,
  ];
  const src = gcps.map((g) => srcConv(g.imagePoint));
  const dst = gcps.map((g) => lngLatToLocalMeters(g.mapLngLat, origin));
  const method: AlignMethod = gcps.length >= 3 ? "affine" : "similarity";
  const tf = method === "affine" ? solveAffine(src, dst) : solveSimilarity(src, dst);
  if (!tf) {
    // Collinear points break affine — fall back to similarity.
    const sim = solveSimilarity(src, dst);
    if (!sim) return null;
    return finishGeoref(sim, "similarity", gcps, src, dst, origin, imgW, imgH);
  }
  return finishGeoref(tf, method, gcps, src, dst, origin, imgW, imgH);
}

function finishGeoref(
  tf: Transform,
  method: AlignMethod,
  gcps: GroundControlPoint[],
  src: [number, number][],
  dst: [number, number][],
  origin: LngLat,
  imgW: number,
  imgH: number,
): GeorefResult {
  // Residual RMS in metres.
  let sumSq = 0;
  for (let k = 0; k < src.length; k++) {
    const p = tf(src[k]);
    sumSq += (p[0] - dst[k][0]) ** 2 + (p[1] - dst[k][1]) ** 2;
  }
  const rmsMeters = Math.sqrt(sumSq / src.length);

  // Image corners (TL, TR, BR, BL) through the transform → lng/lat.
  const cornerPx: LngLat[] = [
    [0, 0],
    [imgW, 0],
    [imgW, imgH],
    [0, imgH],
  ];
  const [tl, tr, br, bl] = cornerPx.map((px) => localMetersToLngLat(tf(srcConv(px)), origin)) as [
    LngLat,
    LngLat,
    LngLat,
    LngLat,
  ];
  return {
    corners: { topLeft: tl, topRight: tr, bottomRight: br, bottomLeft: bl },
    method,
    rmsMeters,
    pointCount: gcps.length,
  };
}

/**
 * Alignment accuracy score (0–100) from the fit residual + redundancy. Two
 * points always fit exactly (rms≈0) but carry no redundancy, so the score is
 * capped by point count. Higher = tighter, better-checked alignment.
 */
export function accuracyScore(rmsMeters: number, pointCount: number): number {
  const base = 100 - rmsMeters * 6; // ~5 m → 70, ~10 m → 40
  const cap = pointCount >= 4 ? 99 : pointCount === 3 ? 85 : 70;
  return Math.max(5, Math.min(cap, Math.round(base)));
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
