"use client";

/**
 * VillageMap (patched v5 — handler-driven resets)
 *
 * - No imports of @/lib/village-data, node:fs, or node:path.
 * - All data fetched via browser fetch() from /data/* static JSON.
 * - Uses each selectedVillage.boundary_file directly — no path construction.
 * - WhatsApp button enabled as soon as district + taluka + village picked.
 * - Map layer add waits for MapLibre "load" event.
 * - Marathi-first name fallback ensures dropdowns are never blank.
 *
 * Why this version (v5):
 *   The previous version cleared downstream state (talukas/villages/feature)
 *   synchronously *inside* the effect that fetched the next layer. ESLint's
 *   react-hooks/set-state-in-effect rule flags that pattern because it
 *   creates avoidable re-renders and obscures the data-flow.
 *
 *   The fix: every "user picked something" reset is now performed inside the
 *   `handleSelect*` callbacks (where the change actually originates), and
 *   effects do nothing but FETCH + STORE the data they own. If the parent
 *   inputs are missing, the effect simply does not run (or fetches nothing
 *   and stores nothing) — no other state is touched.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Info, MapPin, MessageCircle } from "lucide-react";
import { useLang, type Lang } from "@/components/language-context";

interface DistrictRow {
  district_id: string;
  name_en: string;
  name_mr: string;
  lgd?: string | null;
}
interface TalukaRow {
  taluka_id: string;
  district_id: string;
  name_en: string;
  name_mr: string;
  lgd?: string | null;
}
interface VillageRow {
  village_id: string;
  district_id: string;
  taluka_id: string;
  name_en: string;
  name_mr: string;
  code?: string | null;
  boundary_file?: string;
}
interface BoundaryFeature {
  type: "Feature";
  properties: {
    district_id: string;
    taluka_id: string;
    village_id: string;
    name_en: string;
    name_mr: string;
    taluka_en: string;
    taluka_mr: string;
    district_en: string;
    district_mr: string;
    code?: string | null;
  };
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
}
interface BoundaryFC {
  type: "FeatureCollection";
  features: BoundaryFeature[];
}

function nameOf(
  row: { name_en?: string; name_mr?: string } | undefined,
  lang: Lang,
): string {
  if (!row) return "—";
  if (lang === "mr") {
    return (row.name_mr && row.name_mr.trim()) || (row.name_en && row.name_en.trim()) || "—";
  }
  return (row.name_en && row.name_en.trim()) || (row.name_mr && row.name_mr.trim()) || "—";
}

function bboxOf(geom: BoundaryFeature["geometry"]): [number, number, number, number] {
  let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
  const rings: number[][][] =
    geom.type === "Polygon" ? geom.coordinates : geom.coordinates.flat();
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

const ui = {
  mr: {
    heading: "गाव नकाशा शोधक",
    sub: "जिल्हा → तालुका → गाव निवडा. निवडलेल्या गावाची सीमा नकाशावर हायलाइट होईल.",
    district: "जिल्हा",
    taluka: "तालुका",
    village: "गाव",
    chooseDistrict: "जिल्हा निवडा",
    chooseTaluka: "तालुका निवडा",
    chooseVillage: "गाव निवडा",
    waCta: "WhatsApp वर मागणी करा",
    disclaimer:
      "ही सुविधा प्राथमिक नकाशा संदर्भासाठी आहे. अंतिम जमीन नोंदी अधिकृत पोर्टलवरून पडताळाव्यात.",
    loading: "गावाची सीमा लोड होत आहे...",
    fetchError: "गावाची सीमा लोड झाली नाही. कृपया पुन्हा प्रयत्न करा.",
    selected: "निवडलेले",
    coords: "मध्यबिंदू",
    buildMsg: (d: string, t: string, v: string, c: string) =>
      `नमस्कार, मला ${v} (तालुका ${t}, जिल्हा ${d}) गावाच्या नकाशा/जमीन सेवेसाठी मदत हवी आहे. केंद्र: ${c}`,
  },
  en: {
    heading: "Village Map Finder",
    sub: "Pick District → Taluka → Village. The selected village boundary is highlighted on the map.",
    district: "District",
    taluka: "Taluka",
    village: "Village",
    chooseDistrict: "Choose district",
    chooseTaluka: "Choose taluka",
    chooseVillage: "Choose village",
    waCta: "Request on WhatsApp",
    disclaimer:
      "This tool is for preliminary map reference only. Final land records must be verified from official portals.",
    loading: "Loading village boundary...",
    fetchError: "Could not load the village boundary. Please try again.",
    selected: "Selected",
    coords: "Centroid",
    buildMsg: (d: string, t: string, v: string, c: string) =>
      `Hello, I need village map / land service help for ${v} (Taluka ${t}, District ${d}). Centroid: ${c}`,
  },
} as const;

export function VillageMap() {
  const { lang } = useLang();
  const tx = ui[lang];

  const mapContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  const mapReadyRef = useRef(false);

  const [districts, setDistricts] = useState<DistrictRow[]>([]);
  const [talukas, setTalukas] = useState<TalukaRow[]>([]);
  const [villages, setVillages] = useState<VillageRow[]>([]);

  const [districtId, setDistrictId] = useState<string>("");
  const [talukaId, setTalukaId] = useState<string>("");
  const [villageId, setVillageId] = useState<string>("");

  const [feature, setFeature] = useState<BoundaryFeature | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  /* ── Districts: load once per language change ───────────────────────── */
  useEffect(() => {
    let cancelled = false;
    fetch("/data/dropdowns/districts.json")
      .then((r) => r.json())
      .then((rows: DistrictRow[]) => {
        if (cancelled) return;
        rows.sort((a, b) => nameOf(a, lang).localeCompare(nameOf(b, lang)));
        setDistricts(rows);
        console.debug("[VillageMap] districts loaded:", rows.length);
      })
      .catch((e) => {
        if (cancelled) return;
        console.error("[VillageMap] districts fetch failed:", e);
        setDistricts([]);
      });
    return () => {
      cancelled = true;
    };
  }, [lang]);

  /* ── Talukas: fetch when districtId changes ─────────────────────────
   *
   * IMPORTANT: this effect only WRITES `talukas` (and only when a fetch
   * succeeds). Resets of `talukaId`/`villages`/`villageId`/`feature` live
   * in handleSelectDistrict(), not here — that keeps the effect free of
   * downstream-state mutations and satisfies react-hooks/set-state-in-
   * effect. */
  useEffect(() => {
    if (!districtId) return;
    let cancelled = false;
    const url = `/data/dropdowns/talukas/${encodeURIComponent(districtId)}.json`;
    fetch(url)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("HTTP " + r.status))))
      .then((rows: TalukaRow[]) => {
        if (cancelled) return;
        rows.sort((a, b) => nameOf(a, lang).localeCompare(nameOf(b, lang)));
        setTalukas(rows);
        console.debug("[VillageMap] talukas loaded:", rows.length, "from", url);
      })
      .catch((e) => {
        if (cancelled) return;
        console.error("[VillageMap] talukas fetch failed:", url, e);
        setTalukas([]);
      });
    return () => {
      cancelled = true;
    };
  }, [districtId, lang]);

  /* ── Villages: fetch when (districtId, talukaId) change.
   * Same handler-driven reset rule as above. */
  useEffect(() => {
    if (!districtId || !talukaId) return;
    let cancelled = false;
    const url = `/data/dropdowns/villages/${encodeURIComponent(districtId)}/${encodeURIComponent(talukaId)}.json`;
    fetch(url)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("HTTP " + r.status))))
      .then((rows: VillageRow[]) => {
        if (cancelled) return;
        rows.sort((a, b) => nameOf(a, lang).localeCompare(nameOf(b, lang)));
        setVillages(rows);
        console.debug("[VillageMap] villages loaded:", rows.length, "from", url);
      })
      .catch((e) => {
        if (cancelled) return;
        console.error("[VillageMap] villages fetch failed:", url, e);
        setVillages([]);
      });
    return () => {
      cancelled = true;
    };
  }, [districtId, talukaId, lang]);

  /* ── Boundary feature: fetch when (districtId, talukaId, villageId, villages) change.
   *
   * Reset of `feature` to null when a parent id is missing happens in
   * handleSelectDistrict() / handleSelectTaluka() / handleSelectVillage()
   * — not here. The pre-fetch loading-flag and error-clear also live in
   * handleSelectVillage(): that's the user-action moment when the fetch
   * is conceptually starting, and ESLint's react-hooks/set-state-in-
   * effect rule (correctly) doesn't want loading/error toggles
   * synchronously inside the effect body.
   *
   * What's left in this effect: kick off the fetch, then resolve
   * loading/feature/fetchError inside the async .then/.catch — those
   * callbacks run in a later microtask, so the rule allows them. */
  useEffect(() => {
    if (!districtId || !talukaId || !villageId) return;
    const selected = villages.find((v) => v.village_id === villageId);
    if (!selected) {
      console.warn("[VillageMap] selected village_id not in villages list:", villageId);
      return;
    }
    let cancelled = false;
    const url =
      selected.boundary_file ||
      `/data/boundaries/villages/${encodeURIComponent(districtId)}/${encodeURIComponent(talukaId)}.geojson`;

    console.debug("[VillageMap] fetching boundary:", {
      districtId,
      talukaId,
      villageId,
      url,
    });

    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error("HTTP " + r.status + " from " + url);
        return r.json() as Promise<BoundaryFC>;
      })
      .then((fc) => {
        if (cancelled) return;
        console.debug("[VillageMap] taluka feature count:", fc.features?.length);
        const match = (fc.features || []).find(
          (f) => f.properties.village_id === villageId,
        );
        if (!match) {
          console.error(
            "[VillageMap] no feature matched village_id",
            villageId,
            "in",
            url,
          );
          setFeature(null);
          setFetchError(tx.fetchError);
          setLoading(false);
          return;
        }
        setFeature(match);
        setLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        console.error("[VillageMap] boundary fetch failed:", url, e);
        setFeature(null);
        setFetchError(tx.fetchError);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [districtId, talukaId, villageId, villages, tx.fetchError]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let mapInstance: any;
    async function init() {
      if (!mapContainerRef.current) return;
      const mgl = await import("maplibre-gl");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ML: any = mgl.default ?? mgl;

      mapInstance = new ML.Map({
        container: mapContainerRef.current,
        style: {
          version: 8,
          sources: {
            osm: {
              type: "raster",
              tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
              tileSize: 256,
              attribution: "© OpenStreetMap contributors",
            },
          },
          layers: [{ id: "osm", type: "raster", source: "osm" }],
        },
        center: [75.7139, 19.7515],
        zoom: 5.8,
      });
      mapRef.current = mapInstance;
      mapInstance.on("load", () => {
        mapReadyRef.current = true;
        console.debug("[VillageMap] map ready");
      });
    }
    init();
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        mapReadyRef.current = false;
      }
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const renderOnce = () => {
      try {
        if (map.getLayer("village-fill")) map.removeLayer("village-fill");
        if (map.getLayer("village-outline")) map.removeLayer("village-outline");
        if (map.getSource("village")) map.removeSource("village");
      } catch (e) {
        console.warn("[VillageMap] layer cleanup warning:", e);
      }

      if (!feature) return;

      map.addSource("village", { type: "geojson", data: feature });
      map.addLayer({
        id: "village-fill",
        type: "fill",
        source: "village",
        paint: { "fill-color": "#facc15", "fill-opacity": 0.35 },
      });
      map.addLayer({
        id: "village-outline",
        type: "line",
        source: "village",
        paint: { "line-color": "#dc2626", "line-width": 3 },
      });

      const [minLng, minLat, maxLng, maxLat] = bboxOf(feature.geometry);
      map.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        { padding: 40, duration: 1100, maxZoom: 15 },
      );
    };

    if (mapReadyRef.current) {
      renderOnce();
    } else {
      map.once("load", renderOnce);
    }
  }, [feature]);

  const district = useMemo(
    () => districts.find((d) => d.district_id === districtId),
    [districts, districtId],
  );
  const taluka = useMemo(
    () => talukas.find((t) => t.taluka_id === talukaId),
    [talukas, talukaId],
  );
  const village = useMemo(
    () => villages.find((v) => v.village_id === villageId),
    [villages, villageId],
  );

  const centroid: [number, number] | null = useMemo(() => {
    if (!feature) return null;
    const [minLng, minLat, maxLng, maxLat] = bboxOf(feature.geometry);
    return [(minLng + maxLng) / 2, (minLat + maxLat) / 2];
  }, [feature]);

  const waEnabled = Boolean(
    districtId && talukaId && villageId && district && taluka && village,
  );
  const waHref = useMemo(() => {
    if (!waEnabled) return "https://wa.me/918625801907";
    const coordStr = centroid
      ? `${centroid[1].toFixed(5)}, ${centroid[0].toFixed(5)}`
      : "—";
    const msg = tx.buildMsg(
      nameOf(district, lang),
      nameOf(taluka, lang),
      nameOf(village, lang),
      coordStr,
    );
    return `https://wa.me/918625801907?text=${encodeURIComponent(msg)}`;
  }, [waEnabled, district, taluka, village, centroid, lang, tx]);

  /* ── Handler-driven resets ───────────────────────────────────────────
   *
   * Each select handler is the single point where we clear downstream
   * state. This pulls the reset logic OUT of the data-fetching effects
   * (which previously violated react-hooks/set-state-in-effect) and into
   * the change-event source — easier to read, easier to test, lint-clean.
   */
  const handleSelectDistrict = useCallback((id: string) => {
    console.debug("[VillageMap] selected district:", id);
    setDistrictId(id);
    // Picking a new district invalidates everything downstream.
    setTalukas([]);
    setTalukaId("");
    setVillages([]);
    setVillageId("");
    setFeature(null);
    setFetchError(null);
  }, []);
  const handleSelectTaluka = useCallback((id: string) => {
    console.debug("[VillageMap] selected taluka:", id);
    setTalukaId(id);
    // Picking a new taluka invalidates villages + feature only.
    setVillages([]);
    setVillageId("");
    setFeature(null);
    setFetchError(null);
  }, []);
  const handleSelectVillage = useCallback((id: string) => {
    console.debug("[VillageMap] selected village:", id);
    setVillageId(id);
    if (!id) {
      // User cleared the village picker (chose the "—" option) — drop the
      // currently highlighted boundary so the map matches the form.
      setFeature(null);
      setFetchError(null);
      setLoading(false);
      return;
    }
    // Kick off the loading UX here, in the user-action source — the
    // boundary-fetch effect (driven by [districtId, talukaId, villageId])
    // will resolve loading/feature in its async .then. Doing the
    // pre-fetch flip in the handler keeps the effect body free of
    // synchronous setState calls (react-hooks/set-state-in-effect).
    setLoading(true);
    setFetchError(null);
  }, []);

  return (
    <section
      id="village-map"
      className="bg-[#f0f7ff] px-5 py-16 sm:px-8 lg:py-20"
    >
      <div className="mx-auto max-w-7xl">
        <div data-reveal className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">
            {lang === "mr" ? "गाव नकाशा" : "Village Map"}
          </p>
          <h2 className="mt-2 text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
            {tx.heading}
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            {tx.sub}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div>
              <label className="mb-1.5 block text-sm font-bold text-slate-700">
                {tx.district}
              </label>
              <select
                value={districtId}
                onChange={(e) => handleSelectDistrict(e.target.value)}
                className="h-12 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">— {tx.chooseDistrict} —</option>
                {districts.map((d) => (
                  <option key={d.district_id} value={d.district_id}>
                    {nameOf(d, lang)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-bold text-slate-700">
                {tx.taluka}
              </label>
              <select
                value={talukaId}
                onChange={(e) => handleSelectTaluka(e.target.value)}
                disabled={!districtId}
                className="h-12 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">— {tx.chooseTaluka} —</option>
                {talukas.map((t) => (
                  <option key={t.taluka_id} value={t.taluka_id}>
                    {nameOf(t, lang)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-bold text-slate-700">
                {tx.village}
              </label>
              <select
                value={villageId}
                onChange={(e) => handleSelectVillage(e.target.value)}
                disabled={!talukaId}
                className="h-12 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">— {tx.chooseVillage} —</option>
                {villages.map((v) => (
                  <option key={v.village_id} value={v.village_id}>
                    {nameOf(v, lang)}
                  </option>
                ))}
              </select>
            </div>

            {loading && (
              <div className="flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-900">
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-blue-500" />
                {tx.loading}
              </div>
            )}

            {fetchError && !loading && (
              <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                {fetchError}
              </div>
            )}

            {feature && (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                <p className="flex items-center gap-2 text-sm font-black text-yellow-900">
                  <MapPin className="size-4" />
                  {tx.selected}: {nameOf(village, lang)}
                </p>
                <p className="mt-1 text-xs text-yellow-800">
                  {nameOf(taluka, lang)} / {nameOf(district, lang)}
                </p>
                {centroid && (
                  <p className="mt-1 text-xs text-yellow-800">
                    {tx.coords}: {centroid[1].toFixed(5)}, {centroid[0].toFixed(5)}
                  </p>
                )}
              </div>
            )}


            <a
              href={waEnabled ? waHref : undefined}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={!waEnabled}
              tabIndex={waEnabled ? 0 : -1}
              className={`inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white shadow-sm transition ${
                waEnabled
                  ? "bg-green-600 hover:bg-green-700"
                  : "pointer-events-none bg-slate-300"
              }`}
            >
              <MessageCircle className="size-4" />
              {tx.waCta}
            </a>

            <p className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
              <Info className="mt-0.5 size-3.5 shrink-0" />
              {tx.disclaimer}
            </p>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div ref={mapContainerRef} className="h-[480px] w-full sm:h-[540px]" />
            {loading && (
              <div className="pointer-events-none absolute left-3 top-3 rounded-md border border-blue-200 bg-white/90 px-3 py-1.5 text-xs font-bold text-blue-800 shadow-sm">
                {tx.loading}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
