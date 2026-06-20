/**
 * Coordinate projection helpers for the survey report (Proj4js).
 *
 * MapLibre works in WGS84 lng/lat (EPSG:4326); surveyors want projected metres.
 * We convert to the appropriate UTM zone (north hemisphere — India) so node
 * coordinates, bearings and distances are in a metric Cartesian frame.
 *
 * NOTE: the projection math is exact. Real-world accuracy is still bounded by how
 * well the scanned map was georeferenced against the satellite base — see the
 * report disclaimer. This is a preliminary reference, not a legal survey.
 */

import proj4 from "proj4";

export interface UTMCoord {
  zone: number;
  epsg: number; // 326xx for the northern hemisphere
  easting: number;
  northing: number;
}

/** UTM zone number for a longitude (1–60). */
export function utmZoneForLng(lng: number): number {
  return Math.floor((lng + 180) / 6) + 1;
}

/** WGS84 lng/lat → UTM easting/northing metres (auto zone, north hemisphere). */
export function lngLatToUTM(lng: number, lat: number): UTMCoord {
  const zone = utmZoneForLng(lng);
  const dst = `+proj=utm +zone=${zone} +datum=WGS84 +units=m +no_defs`;
  const [easting, northing] = proj4("WGS84", dst, [lng, lat]) as [number, number];
  return { zone, epsg: 32600 + zone, easting, northing };
}

/**
 * Survey traverse leg between two UTM points (same zone): planar distance in
 * metres and azimuth (bearing from grid north, clockwise, 0–360°).
 */
export function bearingDistance(a: UTMCoord, b: UTMCoord): { bearingDeg: number; distanceM: number } {
  const dE = b.easting - a.easting;
  const dN = b.northing - a.northing;
  const distanceM = Math.hypot(dE, dN);
  let bearingDeg = (Math.atan2(dE, dN) * 180) / Math.PI;
  if (bearingDeg < 0) bearingDeg += 360;
  return { bearingDeg, distanceM };
}

/** Azimuth degrees → surveyor quadrant bearing, e.g. "N 45.2° E". */
export function quadrantBearing(deg: number): string {
  const ns = deg <= 90 || deg >= 270 ? "N" : "S";
  const ew = deg <= 180 ? "E" : "W";
  let a = deg;
  if (deg > 90 && deg <= 180) a = 180 - deg;
  else if (deg > 180 && deg < 270) a = deg - 180;
  else if (deg >= 270) a = 360 - deg;
  return `${ns} ${a.toFixed(1)}° ${ew}`;
}
