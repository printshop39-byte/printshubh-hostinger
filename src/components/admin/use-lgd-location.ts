"use client";

/**
 * useLgdLocation — shared District → Taluka → Village resolver.
 *
 * Reuses the SAME public LGD datasets the customer map uses
 * (`/data/dropdowns/*.json`, `/data/boundaries/villages/*.geojson`) and the
 * same display-name helpers — no datasets are duplicated. Returns dropdown
 * rows, cascading selection setters, the matched village boundary feature, and
 * a fly-to extent (exact when the village boundary matches, otherwise the
 * taluka extent flagged `approximate`).
 */

import { useEffect, useState } from "react";
import type { Lang } from "@/components/language-context";
import {
  DISTRICT_ID_FALLBACK_EN,
  DISTRICT_MR_MAP,
  KNOWN_NAME_FIXES,
} from "@/lib/maharashtra-name-map";
import {
  ensureLgdNames,
  ensureVillageNames,
  getTalukaDisplayNameRow,
  getVillageDisplayNameRow,
  lgdNamesReady,
  villageNamesReady,
} from "@/lib/maharashtra-local-names";

export interface DistrictRow { district_id: string; name_en: string; name_mr: string; lgd?: string | null }
export interface TalukaRow { taluka_id: string; district_id: string; name_en: string; name_mr: string; lgd?: string | null }
export interface VillageRow { village_id: string; district_id: string; taluka_id: string; name_en: string; name_mr: string; code?: string | null; boundary_file?: string }
export interface BoundaryFeature {
  type: "Feature";
  properties: { village_id: string; name_en?: string; name_mr?: string; [k: string]: unknown };
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
}
interface BoundaryFC { type: "FeatureCollection"; features: BoundaryFeature[] }

export interface LgdExtent {
  bbox: [number, number, number, number];
  center: [number, number];
  approximate: boolean;
  villageMatched: boolean;
}

function titleCaseName(raw?: string): string {
  if (!raw) return "";
  const fixed = (KNOWN_NAME_FIXES[raw] ?? raw).replace(/\s+/g, " ").trim();
  if (!fixed) return "";
  const PRESERVE = new Set(["CB", "CT", "M", "MC", "NP", "NA", "OG", "BK", "KH", "PH", "NO"]);
  return fixed.toLowerCase().replace(/\b([a-z]+)\b/g, (w) => {
    const u = w.toUpperCase();
    return PRESERVE.has(u) ? u : w.charAt(0).toUpperCase() + w.slice(1);
  });
}

function displayDistrictName(row: DistrictRow | undefined, lang: Lang): string {
  if (!row) return "—";
  const rawEn = row.name_en?.trim() || DISTRICT_ID_FALLBACK_EN[row.district_id] || "";
  const cleanedEn = titleCaseName(rawEn);
  const mrFromRow = row.name_mr?.trim();
  const mrFromMap = cleanedEn ? DISTRICT_MR_MAP[cleanedEn] : undefined;
  if (lang === "mr") return mrFromRow || mrFromMap || cleanedEn || "—";
  return cleanedEn || mrFromRow || "—";
}

function bboxOf(geom: BoundaryFeature["geometry"]): [number, number, number, number] {
  let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
  const rings: number[][][] = geom.type === "Polygon" ? geom.coordinates : geom.coordinates.flat();
  for (const ring of rings) {
    for (const [lng, lat] of ring) {
      if (lng < minLng) minLng = lng;
      if (lat < minLat) minLat = lat;
      if (lng > maxLng) maxLng = lng;
      if (lat > maxLat) maxLat = lat;
    }
  }
  return [minLng, minLat, maxLng, maxLat];
}

function unionBbox(features: BoundaryFeature[]): [number, number, number, number] | null {
  let b: [number, number, number, number] | null = null;
  for (const f of features) {
    const [a, c, d, e] = bboxOf(f.geometry);
    b = b ? [Math.min(b[0], a), Math.min(b[1], c), Math.max(b[2], d), Math.max(b[3], e)] : [a, c, d, e];
  }
  return b;
}

export function useLgdLocation(lang: Lang) {
  const [districts, setDistricts] = useState<DistrictRow[]>([]);
  const [talukas, setTalukas] = useState<TalukaRow[]>([]);
  const [villages, setVillages] = useState<VillageRow[]>([]);
  const [districtId, setDistrictId] = useState("");
  const [talukaId, setTalukaId] = useState("");
  const [villageId, setVillageId] = useState("");
  const [boundaryFeature, setBoundaryFeature] = useState<BoundaryFeature | null>(null);
  const [extent, setExtent] = useState<LgdExtent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    let c = false;
    if (!lgdNamesReady()) ensureLgdNames().then(() => { if (!c) setTick((t) => t + 1); });
    if (!villageNamesReady()) ensureVillageNames().then(() => { if (!c) setTick((t) => t + 1); });
    return () => { c = true; };
  }, []);

  useEffect(() => {
    let c = false;
    fetch("/data/dropdowns/districts.json")
      .then((r) => r.json())
      .then((rows: DistrictRow[]) => {
        if (c) return;
        rows.sort((a, b) => displayDistrictName(a, lang).localeCompare(displayDistrictName(b, lang)));
        setDistricts(rows);
      })
      .catch(() => { if (!c) setDistricts([]); });
    return () => { c = true; };
  }, [lang]);

  useEffect(() => {
    let c = false;
    void (async () => {
      if (!districtId) { if (!c) setTalukas([]); return; }
      const distRow = districts.find((d) => d.district_id === districtId);
      try {
        const r = await fetch(`/data/dropdowns/talukas/${encodeURIComponent(districtId)}.json`);
        if (!r.ok) throw new Error("HTTP " + r.status);
        const rows = (await r.json()) as TalukaRow[];
        if (c) return;
        rows.sort((a, b) => getTalukaDisplayNameRow(a, distRow, lang).localeCompare(getTalukaDisplayNameRow(b, distRow, lang)));
        setTalukas(rows);
      } catch { if (!c) setTalukas([]); }
    })();
    return () => { c = true; };
  }, [districtId, lang, districts]);

  useEffect(() => {
    let c = false;
    void (async () => {
      if (!districtId || !talukaId) { if (!c) setVillages([]); return; }
      const distRow = districts.find((d) => d.district_id === districtId);
      const talRow = talukas.find((t) => t.taluka_id === talukaId);
      try {
        const r = await fetch(`/data/dropdowns/villages/${encodeURIComponent(districtId)}/${encodeURIComponent(talukaId)}.json`);
        if (!r.ok) throw new Error("HTTP " + r.status);
        const rows = (await r.json()) as VillageRow[];
        if (c) return;
        rows.sort((a, b) => getVillageDisplayNameRow(a, talRow, distRow, lang).localeCompare(getVillageDisplayNameRow(b, talRow, distRow, lang)));
        setVillages(rows);
      } catch { if (!c) setVillages([]); }
    })();
    return () => { c = true; };
  }, [districtId, talukaId, lang, districts, talukas]);

  useEffect(() => {
    let c = false;
    void (async () => {
      if (!districtId || !talukaId || !villageId) {
        if (!c) { setBoundaryFeature(null); setExtent(null); setError(null); }
        return;
      }
      const v = villages.find((x) => x.village_id === villageId);
      const url = v?.boundary_file || `/data/boundaries/villages/${encodeURIComponent(districtId)}/${encodeURIComponent(talukaId)}.geojson`;
      if (!c) { setLoading(true); setError(null); }
      try {
        const r = await fetch(url);
        if (!r.ok) throw new Error("HTTP " + r.status);
        const fc = (await r.json()) as BoundaryFC;
        if (c) return;
        const match = (fc.features || []).find((f) => f.properties.village_id === villageId);
        if (match) {
          const bb = bboxOf(match.geometry);
          setBoundaryFeature(match);
          setExtent({ bbox: bb, center: [(bb[0] + bb[2]) / 2, (bb[1] + bb[3]) / 2], approximate: false, villageMatched: true });
        } else {
          const bb = unionBbox(fc.features || []);
          setBoundaryFeature(null);
          setExtent(bb ? { bbox: bb, center: [(bb[0] + bb[2]) / 2, (bb[1] + bb[3]) / 2], approximate: true, villageMatched: false } : null);
        }
        setLoading(false);
      } catch {
        if (c) return;
        setBoundaryFeature(null);
        setExtent(null);
        setError("boundary");
        setLoading(false);
      }
    })();
    return () => { c = true; };
  }, [districtId, talukaId, villageId, villages]);

  const selectDistrict = (id: string) => { setDistrictId(id); setTalukaId(""); setVillageId(""); setTalukas([]); setVillages([]); };
  const selectTaluka = (id: string) => { setTalukaId(id); setVillageId(""); setVillages([]); };
  const selectVillage = (id: string) => { setVillageId(id); };

  const districtLabel = (d: DistrictRow) => displayDistrictName(d, lang);
  const talukaLabel = (t: TalukaRow) => getTalukaDisplayNameRow(t, districts.find((d) => d.district_id === districtId), lang);
  const villageLabel = (v: VillageRow) =>
    getVillageDisplayNameRow(v, talukas.find((t) => t.taluka_id === talukaId), districts.find((d) => d.district_id === districtId), lang);

  const selectedNames = () => ({
    district: districts.find((d) => d.district_id === districtId),
    taluka: talukas.find((t) => t.taluka_id === talukaId),
    village: villages.find((v) => v.village_id === villageId),
  });

  return {
    districts, talukas, villages,
    districtId, talukaId, villageId,
    selectDistrict, selectTaluka, selectVillage,
    districtLabel, talukaLabel, villageLabel, selectedNames,
    boundaryFeature, extent, loading, error,
  };
}
