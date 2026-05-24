"use client";

/**
 * MapReferenceSection — patched (display-name cleanup + base-layer switcher)
 *
 * What changed in this patch:
 *  - Added displayName()/displayDistrictName() — handles `>` byte-corruption,
 *    title-cases UPPERCASE English, and shows Marathi via DISTRICT_MR_MAP.
 *  - Sorted dropdowns by the *displayed* name, not the raw uppercase string.
 *  - Added a floating base-layer switcher: OSM / Satellite / Hybrid /
 *    Terrain / Topo. Switching swaps the raster `tiles` array in-place — the
 *    map instance, center/zoom, village layer and drawn polygon all survive.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  Eraser,
  Info,
  Layers,
  Locate,
  MapPin,
  MessageCircle,
  Pencil,
} from "lucide-react";
import { useLang, type Lang } from "@/components/language-context";
import {
  DISTRICT_ID_FALLBACK_EN,
  DISTRICT_MR_MAP,
  KNOWN_NAME_FIXES,
  TALUKA_MR_MAP,
  VILLAGE_MR_MAP,
} from "@/lib/maharashtra-name-map";

/* ── Types ─────────────────────────────────────────────────────────────────── */

/**
 * Service tab IDs — modeled on Maharashtra Digital Satbara navigation.
 * Picking a tab changes which input fields are shown AND which lines the
 * WhatsApp message includes.
 */
type ServiceTab =
  | "7_12"
  | "8a"
  | "eferfar"
  | "property_card"
  | "property_card_ferfar"
  | "mumbai_property_card"
  | "swamitva_map";

interface FormData {
  district: string;
  taluka: string;
  village: string;
  district_id: string;
  taluka_id: string;
  village_id: string;
  /* 7/12 + Swamitva Map fields */
  gutNumber: string;
  surveyNumber: string;
  /* 8A field */
  khataNumber: string;
  /* eFerfar / Property Card Ferfar field */
  ferfarNumber: string;
  /* Property Card + Mumbai City Property Card */
  ctsNumber: string;
  /* Property Card / Property Card Ferfar */
  region: string;
  office: string;
  peth: string;
  /* Mumbai City Property Card */
  citySurveyOffice: string;
  divisionWard: string;
  /* Property Card + Mumbai City Property Card — "all" | "live" */
  entryType: "all" | "live" | "";
  /* legacy free-text service label (kept for back-compat in the WA msg fallback) */
  serviceType: string;
}

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

type LngLat = [number, number];

/* ── Display-name helpers ──────────────────────────────────────────────────── */

/**
 * Title-case a name while preserving common land-record abbreviations
 * ("Kh." / "Bk." / "(M Corp)" / "(CT)" / "(CB)" / "Ph." / "No.").
 */
function titleCaseName(raw?: string): string {
  if (!raw) return "";
  // Replace known byte-corruption first (KOLH>PUR → KOLHAPUR), then collapse
  // whitespace.
  const fixed = (KNOWN_NAME_FIXES[raw] ?? raw).replace(/\s+/g, " ").trim();
  if (!fixed) return "";
  // Preserve all-caps acronyms in parens like "(M Corp)" or "(CT)".
  const PRESERVE = new Set([
    "CB", "CT", "M", "MC", "NP", "NA", "OG", "BK", "KH", "PH", "NO",
  ]);
  return fixed
    .toLowerCase()
    .replace(/\b([a-z]+)\b/g, (word) => {
      const upper = word.toUpperCase();
      if (PRESERVE.has(upper)) return upper;
      return word.charAt(0).toUpperCase() + word.slice(1);
    });
}

/** Display name for any row that may have name_mr / name_en — taluka, village, etc. */
function displayName(
  row: { name_en?: string; name_mr?: string } | undefined,
  lang: Lang,
): string {
  if (!row) return "—";
  const mr = row.name_mr?.trim();
  const cleanedEn = titleCaseName(row.name_en);
  if (lang === "mr") {
    return mr || cleanedEn || "—";
  }
  return cleanedEn || mr || "—";
}

/** Districts get extra care: empty name_en fallback + DISTRICT_MR_MAP. */
function displayDistrictName(row: DistrictRow | undefined, lang: Lang): string {
  if (!row) return "—";
  // Recover empty name_en via district_id (e.g. d-503 → "AMRAVATI").
  const rawEn = row.name_en?.trim() || DISTRICT_ID_FALLBACK_EN[row.district_id] || "";
  const cleanedEn = titleCaseName(rawEn);
  const mrFromRow = row.name_mr?.trim();
  const mrFromMap = cleanedEn ? DISTRICT_MR_MAP[cleanedEn] : undefined;
  if (lang === "mr") {
    return mrFromRow || mrFromMap || cleanedEn || "—";
  }
  return cleanedEn || mrFromRow || "—";
}

/** Same logic but with optional explicit lookup maps for talukas / villages. */
function displayWithMap(
  row: { name_en?: string; name_mr?: string } | undefined,
  lang: Lang,
  mrMap: Record<string, string>,
): string {
  if (!row) return "—";
  const cleanedEn = titleCaseName(row.name_en);
  const mrFromRow = row.name_mr?.trim();
  const mrFromMap = cleanedEn ? mrMap[cleanedEn] : undefined;
  if (lang === "mr") {
    return mrFromRow || mrFromMap || cleanedEn || "—";
  }
  return cleanedEn || mrFromRow || "—";
}

function bboxOfGeom(geom: BoundaryFeature["geometry"]): [number, number, number, number] {
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

function centroidOf(coords: LngLat[]): { lat: number; lng: number } | null {
  if (coords.length === 0) return null;
  let sx = 0, sy = 0;
  for (const [lng, lat] of coords) { sx += lng; sy += lat; }
  return { lat: sy / coords.length, lng: sx / coords.length };
}

function approxAreaSqMeters(coords: LngLat[]): number {
  if (coords.length < 3) return 0;
  const meanLatDeg = coords.reduce((s, [, lat]) => s + lat, 0) / coords.length;
  const meanLatRad = (meanLatDeg * Math.PI) / 180;
  const mPerDegLat = 111_320;
  const mPerDegLng = 111_320 * Math.cos(meanLatRad);
  let sum = 0;
  for (let i = 0; i < coords.length; i++) {
    const [lng1, lat1] = coords[i];
    const [lng2, lat2] = coords[(i + 1) % coords.length];
    const x1 = lng1 * mPerDegLng, y1 = lat1 * mPerDegLat;
    const x2 = lng2 * mPerDegLng, y2 = lat2 * mPerDegLat;
    sum += x1 * y2 - x2 * y1;
  }
  return Math.abs(sum) / 2;
}

function formatAreaPair(sqm: number, lang: Lang): string {
  const acre = sqm / 4046.8564224;
  const guntha = sqm / 101.171;
  if (lang === "mr") {
    return `${sqm.toFixed(0)} वर्ग मीटर · ${acre.toFixed(3)} एकर · ${guntha.toFixed(2)} गुंठा`;
  }
  return `${sqm.toFixed(0)} sq.m · ${acre.toFixed(3)} acre · ${guntha.toFixed(2)} guntha`;
}

/* ── Base-layer definitions ──────────────────────────────────────────────────
 *
 * All sources below are anonymous, no-API-key raster XYZ tiles:
 *   - OpenStreetMap (street map): {s}.tile.openstreetmap.org subdomain pool
 *   - Esri ArcGIS Online — World_Imagery (HD satellite, sub-metre in metros),
 *     World_Shaded_Relief (terrain), Reference/World_Transportation (roads,
 *     railways), Reference/World_Boundaries_and_Places (places, admin lines).
 *     Esri's terms allow non-commercial / attribution-required use of the
 *     public services. Maxzoom = 23 for Imagery — they really do serve that
 *     deep in major Indian cities.
 *   - OpenTopoMap — best free source for sharp contour lines (CC-BY-SA).
 *
 * Bhuvan (ISRO) note: Bhuvan WMS / WMTS services require a token that
 * expires daily, so they are NOT usable from an anonymous browser fetch.
 * If you obtain a token, you can plug it in via the BHUVAN_TOKEN const at
 * the bottom of this block and uncomment the "bhuvan" entry — the rest of
 * the switcher already supports it.
 */

type BaseLayerId = "osm" | "satellite" | "hybrid" | "terrain" | "topo";

interface OverlayDef {
  id: string;
  tiles: string[];
  attribution: string;
  maxzoom?: number;
  /** Optional minzoom — useful for label overlays that look noisy at z<5. */
  minzoom?: number;
}

interface BaseLayerDef {
  id: BaseLayerId;
  tiles: string[];
  attribution: string;
  maxzoom?: number;
  /**
   * Zero or more raster overlays to render ABOVE the base tiles but BELOW
   * the village + plot vector layers. Used for label/transport reference
   * layers on Hybrid and Terrain.
   */
  overlays?: OverlayDef[];
}

/* Esri reference tile URLs reused across hybrid / terrain. */
const ESRI_TRANSPORTATION =
  "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}";
const ESRI_BOUNDARIES_PLACES =
  "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}";

const BASE_LAYERS: Record<BaseLayerId, BaseLayerDef> = {
  osm: {
    id: "osm",
    tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
    attribution: "© OpenStreetMap contributors",
    maxzoom: 19,
  },

  /* HD imagery — Esri's best public service, ~30 cm in Indian metros, 1 m
     elsewhere. We push maxzoom to 23 so it never blurs out on plot-level
     zoom. */
  satellite: {
    id: "satellite",
    tiles: [
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    ],
    attribution: "Imagery © Esri, Maxar, Earthstar Geographics, USGS, IGN, GIS Community",
    maxzoom: 23,
  },

  /* Imagery + two reference overlays for richer labels:
       1. World_Transportation → roads, railways, ferry routes
       2. World_Boundaries_and_Places → admin lines, settlements, place names
     The OSM base also implicitly carries rivers/lakes, but for sat-imagery
     hybrid we depend on the imagery itself showing water bodies. */
  hybrid: {
    id: "hybrid",
    tiles: [
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    ],
    attribution:
      "Imagery © Esri, Maxar · Labels & Transportation © Esri",
    maxzoom: 23,
    overlays: [
      {
        id: "overlay-transportation",
        tiles: [ESRI_TRANSPORTATION],
        attribution: "Transportation © Esri",
        maxzoom: 19,
      },
      {
        id: "overlay-boundaries-places",
        tiles: [ESRI_BOUNDARIES_PLACES],
        attribution: "Places © Esri",
        maxzoom: 19,
      },
    ],
  },

  /* Shaded relief base + place labels overlay. World_Shaded_Relief gives a
     clean hillshade with rivers/water bodies visible through transparency
     and pairs well with the places overlay. */
  terrain: {
    id: "terrain",
    tiles: [
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}",
    ],
    attribution: "Relief © Esri · Labels © Esri",
    maxzoom: 13, // Esri's shaded relief tops out at z13; we let MapLibre overzoom.
    overlays: [
      {
        id: "overlay-boundaries-places",
        tiles: [ESRI_BOUNDARIES_PLACES],
        attribution: "Places © Esri",
        maxzoom: 19,
      },
    ],
  },

  /* OpenTopoMap gives the sharpest free contour-line rendering globally.
     It carries its own labels and water features so no overlay needed. */
  topo: {
    id: "topo",
    tiles: [
      "https://a.tile.opentopomap.org/{z}/{x}/{y}.png",
      "https://b.tile.opentopomap.org/{z}/{x}/{y}.png",
      "https://c.tile.opentopomap.org/{z}/{x}/{y}.png",
    ],
    attribution:
      "Map data © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap (CC-BY-SA)",
    maxzoom: 17,
  },

  /* ── Bhuvan (commented — needs a daily token from bhuvan.nrsc.gov.in) ──
   *
   * If you generate a token, paste it below and add an entry to BASE_LAYERS:
   *
   *   const BHUVAN_TOKEN = "your-token-here";
   *   bhuvan: {
   *     id: "bhuvan",
   *     tiles: [
   *       `https://bhuvan-vec1.nrsc.gov.in/bhuvan/wms?service=WMS&request=GetMap&...&token=${BHUVAN_TOKEN}`,
   *     ],
   *     attribution: "Bhuvan © ISRO / NRSC",
   *     maxzoom: 18,
   *   },
   *
   * Then add "bhuvan" to BaseLayerId and BASE_LAYER_ORDER, and add a Marathi
   * label "भुवन" in the ui[lang].baseLayers object below. The switcher,
   * tile-swap logic and Hybrid-overlay handling all already support it.
   */
};

const BASE_LAYER_ORDER: BaseLayerId[] = [
  "osm",
  "satellite",
  "hybrid",
  "terrain",
  "topo",
];

/* ── Pre-loaded layer registry ───────────────────────────────────────────────
 *
 * We add every raster source + layer once when the map loads, with
 * `layout.visibility` controlling which is on screen. Switching layers is
 * then just a setLayoutProperty('visibility') call — no source swap, no
 * cache clear, no repaint storm. Tiles for layers the user hasn't picked
 * yet are NOT fetched (MapLibre lazily loads tiles based on viewport ∩
 * visible layers), so initial load stays cheap.
 *
 * Layer ids:
 *   base-osm                  – OSM street map
 *   base-satellite            – Esri imagery (used by Satellite mode)
 *   base-hybrid-imagery       – Esri imagery (used by Hybrid mode, separate
 *                                source so switching Sat ↔ Hybrid doesn't
 *                                trigger any reload of the imagery itself)
 *   base-hybrid-transport     – Esri roads/rails labels
 *   base-hybrid-labels        – Esri places/admin labels
 *   base-terrain              – Esri shaded relief
 *   base-terrain-labels       – Esri places labels (terrain mode)
 *   base-topo                 – OpenTopoMap with subdomain rotation
 *
 * The render order below is BOTTOM → TOP. All base layers sit under the
 * village + plot vector layers, which are added later at the top.
 */
const PRELOADED_LAYERS: Array<{
  id: string;
  tiles: string[];
  attribution: string;
  maxzoom?: number;
}> = [
  {
    id: "base-osm",
    tiles: BASE_LAYERS.osm.tiles,
    attribution: BASE_LAYERS.osm.attribution,
    maxzoom: BASE_LAYERS.osm.maxzoom,
  },
  {
    id: "base-satellite",
    tiles: BASE_LAYERS.satellite.tiles,
    attribution: BASE_LAYERS.satellite.attribution,
    maxzoom: BASE_LAYERS.satellite.maxzoom,
  },
  {
    id: "base-hybrid-imagery",
    tiles: BASE_LAYERS.hybrid.tiles,
    attribution: BASE_LAYERS.hybrid.attribution,
    maxzoom: BASE_LAYERS.hybrid.maxzoom,
  },
  {
    id: "base-hybrid-transport",
    tiles: [ESRI_TRANSPORTATION],
    attribution: "Transportation © Esri",
    maxzoom: 19,
  },
  {
    id: "base-hybrid-labels",
    tiles: [ESRI_BOUNDARIES_PLACES],
    attribution: "Places © Esri",
    maxzoom: 19,
  },
  {
    id: "base-terrain",
    tiles: BASE_LAYERS.terrain.tiles,
    attribution: BASE_LAYERS.terrain.attribution,
    maxzoom: BASE_LAYERS.terrain.maxzoom,
  },
  {
    id: "base-terrain-labels",
    tiles: [ESRI_BOUNDARIES_PLACES],
    attribution: "Places © Esri",
    maxzoom: 19,
  },
  {
    id: "base-topo",
    tiles: BASE_LAYERS.topo.tiles,
    attribution: BASE_LAYERS.topo.attribution,
    maxzoom: BASE_LAYERS.topo.maxzoom,
  },
];

/** Which preloaded layer ids should be VISIBLE for each base-layer mode. */
const LAYER_VISIBILITY: Record<BaseLayerId, string[]> = {
  osm:       ["base-osm"],
  satellite: ["base-satellite"],
  hybrid:    ["base-hybrid-imagery", "base-hybrid-transport", "base-hybrid-labels"],
  terrain:   ["base-terrain", "base-terrain-labels"],
  topo:      ["base-topo"],
};

const ALL_BASE_LAYER_IDS = PRELOADED_LAYERS.map((l) => l.id);

/* ── Service tabs ──────────────────────────────────────────────────────────── */

const SERVICE_TAB_ORDER: ServiceTab[] = [
  "7_12",
  "8a",
  "eferfar",
  "property_card",
  "property_card_ferfar",
  "mumbai_property_card",
  "swamitva_map",
];

const SERVICE_LABELS: Record<Lang, Record<ServiceTab, string>> = {
  mr: {
    "7_12": "7/12",
    "8a": "8A",
    eferfar: "फेरफार",
    property_card: "प्रॉपर्टी कार्ड",
    property_card_ferfar: "प्रॉपर्टी कार्ड फेरफार",
    mumbai_property_card: "मुंबई प्रॉपर्टी कार्ड",
    swamitva_map: "स्वामित्व नकाशा",
  },
  en: {
    "7_12": "7/12",
    "8a": "8A",
    eferfar: "eFerfar",
    property_card: "Property Card",
    property_card_ferfar: "Property Card Ferfar",
    mumbai_property_card: "Mumbai Property Card",
    swamitva_map: "Swamitva Map",
  },
};

/** Long-form service label for the WhatsApp message body. */
const SERVICE_FULL_LABELS: Record<Lang, Record<ServiceTab, string>> = {
  mr: {
    "7_12": "7/12 उतारा",
    "8a": "8A उतारा",
    eferfar: "ई-फेरफार (Mutation)",
    property_card: "मिळकत पत्रिका (Property Card)",
    property_card_ferfar: "मिळकत पत्रिका फेरफार",
    mumbai_property_card: "मुंबई शहर मिळकत पत्रिका",
    swamitva_map: "स्वामित्व नकाशा",
  },
  en: {
    "7_12": "7/12 Extract",
    "8a": "8A Extract",
    eferfar: "eFerfar (Mutation)",
    property_card: "Property Card",
    property_card_ferfar: "Property Card Mutation",
    mumbai_property_card: "Property Card — Mumbai City",
    swamitva_map: "Swamitva Map",
  },
};

/* ── Translations ──────────────────────────────────────────────────────────── */

const ui: Record<Lang, {
  sectionBadge: string;
  heading: string;
  subtext: string;
  formHeading: string;
  tabsHelper: string;
  district: string;
  taluka: string;
  village: string;
  region: string;
  office: string;
  peth: string;
  citySurveyOffice: string;
  divisionWard: string;
  gutNo: string;
  surveyNo: string;
  ctsNo: string;
  ctsNoSelectHint: string;
  khataNo: string;
  khataHolderHint: string;
  ferfarNo: string;
  entryTypeLabel: string;
  entryAll: string;
  entryLive: string;
  whatsappBtn: string;
  disclaimer: string;
  locateMe: string;
  optionalNote: string;
  chooseDistrict: string;
  chooseTaluka: string;
  chooseVillage: string;
  chooseRegion: string;
  chooseOffice: string;
  choosePeth: string;
  chooseCitySurveyOffice: string;
  chooseDivisionWard: string;
  boundaryLoading: string;
  boundaryError: string;
  boundarySelected: string;
  drawStart: string;
  drawFinish: string;
  drawClear: string;
  drawHintIdle: string;
  drawHintActive: string;
  plotMarked: string;
  centroid: string;
  area: string;
  areaNote: string;
  plotVertices: string;
  notReadyForWa: string;
  baseLayerLabel: string;
  baseLayers: Record<BaseLayerId, string>;
  changingMapType: string;
}> = {
  mr: {
    sectionBadge: "नकाशा संदर्भ",
    heading: "जमीन / सर्वे नकाशा संदर्भ शोधा",
    subtext: "जिल्हा → तालुका → गाव निवडा. गावाची सीमा हायलाइट होईल. नंतर नकाशावर तुमची प्लॉट सीमा मार्क करा.",
    formHeading: "जमीन माहिती भरा",
    tabsHelper: "कागदपत्र प्रकार निवडा. निवडीनुसार आवश्यक माहिती खाली भरा.",
    district: "जिल्हा",
    taluka: "तालुका",
    village: "गाव",
    region: "विभाग",
    office: "कार्यालय",
    peth: "पेठ / गाव",
    citySurveyOffice: "सिटी सर्व्हे कार्यालय",
    divisionWard: "विभाग / वॉर्ड",
    gutNo: "गट नंबर (माहीत असल्यास)",
    surveyNo: "सर्वे नंबर (माहीत असल्यास)",
    ctsNo: "CTS नंबर",
    ctsNoSelectHint: "CTS नंबर निवडा",
    khataNo: "खाता नंबर",
    khataHolderHint: "खाता नंबर / पहिले नाव / मधले नाव / आडनाव — यापैकी काहीही",
    ferfarNo: "फेरफार नंबर / Mutation No.",
    entryTypeLabel: "नोंद प्रकार",
    entryAll: "सर्व नोंदी (All Entry)",
    entryLive: "चालू नोंद (Live Entry)",
    whatsappBtn: "WhatsApp वर पाठवा",
    disclaimer:
      "ही सुविधा प्राथमिक नकाशा संदर्भासाठी आहे. अंतिम जमीन नोंदी अधिकृत पोर्टलवरून पडताळाव्यात.",
    locateMe: "माझे स्थान",
    optionalNote:
      "नोंद: गट / सर्वे / CTS नंबर माहीत नसल्यास रिकामे सोडा — अधिकृत पोर्टलवर तपासा.",
    chooseDistrict: "जिल्हा निवडा",
    chooseTaluka: "तालुका निवडा",
    chooseVillage: "गाव निवडा",
    chooseRegion: "विभाग निवडा",
    chooseOffice: "कार्यालय निवडा",
    choosePeth: "पेठ / गाव निवडा",
    chooseCitySurveyOffice: "सिटी सर्व्हे कार्यालय निवडा",
    chooseDivisionWard: "विभाग / वॉर्ड निवडा",
    boundaryLoading: "गावाची सीमा लोड होत आहे...",
    boundaryError: "गावाची सीमा लोड झाली नाही. कृपया पुन्हा प्रयत्न करा.",
    boundarySelected: "निवडलेले गाव",
    drawStart: "प्लॉट सीमा मार्क करा",
    drawFinish: "पूर्ण करा",
    drawClear: "मार्किंग साफ करा",
    drawHintIdle: "गाव निवडल्यानंतर ✏️ बटण दाबा आणि नकाशावर प्लॉट सीमा मार्क करा.",
    drawHintActive: "सीमा मार्क करण्यासाठी नकाशावर point क्लिक करा. दोनदा क्लिक केल्यावर polygon पूर्ण होईल.",
    plotMarked: "मार्क केलेली प्लॉट सीमा",
    centroid: "मध्यबिंदू",
    area: "अंदाजे क्षेत्रफळ",
    areaNote: "हे अंदाजे मोजमाप आहे. अंतिम पडताळणी अधिकृत नकाशा/मोजणीवर करावी.",
    plotVertices: "वर्टीसेस",
    notReadyForWa:
      "जिल्हा, तालुका आणि गाव निवडल्यानंतर WhatsApp बटण active होईल. plot सीमा मार्क करणे ऐच्छिक आहे.",
    baseLayerLabel: "नकाशा प्रकार",
    baseLayers: {
      osm: "नकाशा",
      satellite: "सॅटेलाइट",
      hybrid: "हायब्रिड",
      terrain: "भूभाग",
      topo: "टोपो",
    },
    changingMapType: "नकाशा प्रकार बदलत आहे...",
  },
  en: {
    sectionBadge: "Map Reference",
    heading: "Find Land / Survey Map Reference",
    subtext: "Pick District → Taluka → Village. The village boundary lights up. Then mark your plot boundary on the map.",
    formHeading: "Enter Land Details",
    tabsHelper: "Select document type. Required fields will change based on your selection.",
    district: "District",
    taluka: "Taluka",
    village: "Village",
    region: "Region",
    office: "Office",
    peth: "Peth / Village",
    citySurveyOffice: "City Survey Office",
    divisionWard: "Division / Ward",
    gutNo: "Gut Number (if known)",
    surveyNo: "Survey Number (if known)",
    ctsNo: "CTS Number",
    ctsNoSelectHint: "Select CTS No.",
    khataNo: "Khata Number",
    khataHolderHint: "Khata No. / First name / Middle name / Last name — any of these",
    ferfarNo: "Ferfar Number / Mutation No.",
    entryTypeLabel: "Entry type",
    entryAll: "All Entry",
    entryLive: "Live Entry",
    whatsappBtn: "Send via WhatsApp",
    disclaimer:
      "This tool is for preliminary map reference only. Final land records must be verified from official portals.",
    locateMe: "My Location",
    optionalNote:
      "Note: Leave Gut / Survey / CTS number blank if unknown — verify from official portals.",
    chooseDistrict: "Choose district",
    chooseTaluka: "Choose taluka",
    chooseVillage: "Choose village",
    chooseRegion: "Choose region",
    chooseOffice: "Choose office",
    choosePeth: "Choose peth / village",
    chooseCitySurveyOffice: "Choose city survey office",
    chooseDivisionWard: "Choose division / ward",
    boundaryLoading: "Loading village boundary...",
    boundaryError: "Could not load the village boundary. Please try again.",
    boundarySelected: "Selected village",
    drawStart: "Mark Plot Boundary",
    drawFinish: "Finish",
    drawClear: "Clear Marking",
    drawHintIdle: "After picking a village, tap the ✏️ button and click points on the map to mark your plot.",
    drawHintActive: "Click points on the map to mark the boundary. Double-click to finish the polygon.",
    plotMarked: "Plot boundary marked",
    centroid: "Centroid",
    area: "Approx. area",
    areaNote: "This is an approximate measurement. Final verification must be on the official map / survey.",
    plotVertices: "Vertices",
    notReadyForWa:
      "WhatsApp activates after district, taluka and village are picked. Marking the plot is optional.",
    baseLayerLabel: "Map type",
    baseLayers: {
      osm: "OSM",
      satellite: "Satellite",
      hybrid: "Hybrid",
      terrain: "Terrain",
      topo: "Topo",
    },
    changingMapType: "Changing map type...",
  },
};

/* ── Service-specific field map ────────────────────────────────────────────────
 *
 * For each ServiceTab we declare:
 *   - which location fields apply (always include district where applicable)
 *   - which service-specific fields appear under the location selectors
 *   - which field is the "primary" one (label is visually stronger)
 *
 * The WhatsApp builder below reads this same shape to know which lines to emit,
 * so visible UI and outgoing message stay in lockstep — no risk of sending a
 * CTS number when the user filled in a Khata number.
 */
interface ServiceFieldConfig {
  // Location section
  showRegion: boolean;          // Property Card / Property Card Ferfar
  showDistrict: boolean;        // every service
  showOffice: boolean;          // Property Card / Property Card Ferfar
  showTaluka: boolean;          // 7/12 / 8A / eFerfar / Swamitva Map
  showVillage: boolean;         // most services (but labelled "गाव / पेठ" for PC)
  showPeth: boolean;            // Property Card / Property Card Ferfar (replaces village select label)
  showCitySurveyOffice: boolean; // Mumbai Property Card
  showDivisionWard: boolean;    // Mumbai Property Card

  // Service-specific section
  showGutNumber: boolean;
  showSurveyNumber: boolean;
  showCtsNumber: boolean;
  showKhataNumber: boolean;
  showFerfarNumber: boolean;
  showEntryType: boolean;

  primaryField: "gut" | "survey" | "cts" | "khata" | "ferfar" | null;
}

const SERVICE_FIELDS: Record<ServiceTab, ServiceFieldConfig> = {
  "7_12": {
    showRegion: false, showDistrict: true, showOffice: false,
    showTaluka: true, showVillage: true, showPeth: false,
    showCitySurveyOffice: false, showDivisionWard: false,
    showGutNumber: true, showSurveyNumber: true, showCtsNumber: false,
    showKhataNumber: false, showFerfarNumber: false, showEntryType: false,
    primaryField: "gut",
  },
  "8a": {
    showRegion: false, showDistrict: true, showOffice: false,
    showTaluka: true, showVillage: true, showPeth: false,
    showCitySurveyOffice: false, showDivisionWard: false,
    showGutNumber: false, showSurveyNumber: false, showCtsNumber: false,
    showKhataNumber: true, showFerfarNumber: false, showEntryType: false,
    primaryField: "khata",
  },
  eferfar: {
    showRegion: false, showDistrict: true, showOffice: false,
    showTaluka: true, showVillage: true, showPeth: false,
    showCitySurveyOffice: false, showDivisionWard: false,
    showGutNumber: false, showSurveyNumber: false, showCtsNumber: false,
    showKhataNumber: false, showFerfarNumber: true, showEntryType: false,
    primaryField: "ferfar",
  },
  property_card: {
    showRegion: true, showDistrict: true, showOffice: true,
    showTaluka: false, showVillage: false, showPeth: true,
    showCitySurveyOffice: false, showDivisionWard: false,
    showGutNumber: false, showSurveyNumber: false, showCtsNumber: true,
    showKhataNumber: false, showFerfarNumber: false, showEntryType: true,
    primaryField: "cts",
  },
  property_card_ferfar: {
    showRegion: true, showDistrict: true, showOffice: true,
    showTaluka: false, showVillage: false, showPeth: true,
    showCitySurveyOffice: false, showDivisionWard: false,
    showGutNumber: false, showSurveyNumber: false, showCtsNumber: false,
    showKhataNumber: false, showFerfarNumber: true, showEntryType: false,
    primaryField: "ferfar",
  },
  mumbai_property_card: {
    showRegion: false, showDistrict: false, showOffice: false,
    showTaluka: false, showVillage: false, showPeth: false,
    showCitySurveyOffice: true, showDivisionWard: true,
    showGutNumber: false, showSurveyNumber: false, showCtsNumber: true,
    showKhataNumber: false, showFerfarNumber: false, showEntryType: true,
    primaryField: "cts",
  },
  swamitva_map: {
    showRegion: false, showDistrict: true, showOffice: false,
    showTaluka: true, showVillage: true, showPeth: false,
    showCitySurveyOffice: false, showDivisionWard: false,
    showGutNumber: true, showSurveyNumber: true, showCtsNumber: false,
    showKhataNumber: false, showFerfarNumber: false, showEntryType: false,
    primaryField: null,
  },
};

/* ── WhatsApp message builder ──────────────────────────────────────────────── */

function buildWhatsAppMsg(args: {
  lang: Lang;
  service: ServiceTab;
  form: FormData;
  villageCentroid: { lat: number; lng: number } | null;
  plotCoords: LngLat[];
  plotCentroid: { lat: number; lng: number } | null;
  plotAreaSqm: number;
}): string {
  const { lang, service, form, villageCentroid, plotCoords, plotCentroid, plotAreaSqm } = args;
  const cfg = SERVICE_FIELDS[service];
  const gmap = (lat: number, lng: number) =>
    `https://maps.google.com/?q=${lat.toFixed(6)},${lng.toFixed(6)}`;

  const entryLabel = (lang === "mr"
    ? { all: "सर्व नोंदी", live: "चालू नोंद" }
    : { all: "All Entry",  live: "Live Entry" })[form.entryType || "all"] ?? "";

  if (lang === "mr") {
    const lines: string[] = [
      "नमस्कार PrintShubh,",
      "मला खालील कागदपत्रासाठी मदत हवी आहे.",
      "",
      `सेवा: ${SERVICE_FULL_LABELS.mr[service]}`,
    ];
    if (cfg.showRegion && form.region) lines.push(`विभाग: ${form.region}`);
    if (cfg.showDistrict && form.district) lines.push(`जिल्हा: ${form.district}`);
    if (cfg.showOffice && form.office) lines.push(`कार्यालय: ${form.office}`);
    if (cfg.showTaluka && form.taluka) lines.push(`तालुका: ${form.taluka}`);
    if (cfg.showVillage && form.village) lines.push(`गाव: ${form.village}`);
    if (cfg.showPeth && form.peth) lines.push(`गाव / पेठ: ${form.peth}`);
    if (cfg.showCitySurveyOffice && form.citySurveyOffice)
      lines.push(`सिटी सर्व्हे कार्यालय: ${form.citySurveyOffice}`);
    if (cfg.showDivisionWard && form.divisionWard)
      lines.push(`विभाग / वॉर्ड: ${form.divisionWard}`);

    if (cfg.showGutNumber && form.gutNumber) lines.push(`गट नंबर: ${form.gutNumber}`);
    if (cfg.showSurveyNumber && form.surveyNumber) lines.push(`सर्वे नंबर: ${form.surveyNumber}`);
    if (cfg.showCtsNumber && form.ctsNumber) lines.push(`CTS नंबर: ${form.ctsNumber}`);
    if (cfg.showKhataNumber && form.khataNumber) lines.push(`खाता नंबर: ${form.khataNumber}`);
    if (cfg.showFerfarNumber && form.ferfarNumber) lines.push(`फेरफार नंबर: ${form.ferfarNumber}`);
    if (cfg.showEntryType && form.entryType) lines.push(`नोंद प्रकार: ${entryLabel}`);

    if (villageCentroid) {
      lines.push("");
      lines.push(`गाव मध्यबिंदू: ${villageCentroid.lat.toFixed(6)}, ${villageCentroid.lng.toFixed(6)}`);
      lines.push(`Google Maps: ${gmap(villageCentroid.lat, villageCentroid.lng)}`);
    }
    if (plotCoords.length >= 3 && plotCentroid) {
      lines.push("");
      lines.push("मी नकाशावर plot boundary मार्क केली आहे.");
      lines.push(`प्लॉट मध्यबिंदू: ${plotCentroid.lat.toFixed(6)}, ${plotCentroid.lng.toFixed(6)}`);
      lines.push(`Google Maps: ${gmap(plotCentroid.lat, plotCentroid.lng)}`);
      lines.push(`अंदाजे क्षेत्रफळ: ${plotAreaSqm.toFixed(0)} वर्ग मीटर`);
      lines.push("Plot polygon coordinates:");
      plotCoords.forEach(([lng, lat], i) => {
        lines.push(`${i + 1}. ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      });
    }
    lines.push("");
    lines.push("कृपया पुढील प्रक्रिया सांगा.");
    return lines.join("\n");
  }

  const lines: string[] = [
    "Hello PrintShubh,",
    "I need help with the following document.",
    "",
    `Service: ${SERVICE_FULL_LABELS.en[service]}`,
  ];
  if (cfg.showRegion && form.region) lines.push(`Region: ${form.region}`);
  if (cfg.showDistrict && form.district) lines.push(`District: ${form.district}`);
  if (cfg.showOffice && form.office) lines.push(`Office: ${form.office}`);
  if (cfg.showTaluka && form.taluka) lines.push(`Taluka: ${form.taluka}`);
  if (cfg.showVillage && form.village) lines.push(`Village: ${form.village}`);
  if (cfg.showPeth && form.peth) lines.push(`Peth / Village: ${form.peth}`);
  if (cfg.showCitySurveyOffice && form.citySurveyOffice)
    lines.push(`City Survey Office: ${form.citySurveyOffice}`);
  if (cfg.showDivisionWard && form.divisionWard)
    lines.push(`Division / Ward: ${form.divisionWard}`);

  if (cfg.showGutNumber && form.gutNumber) lines.push(`Gut No.: ${form.gutNumber}`);
  if (cfg.showSurveyNumber && form.surveyNumber) lines.push(`Survey No.: ${form.surveyNumber}`);
  if (cfg.showCtsNumber && form.ctsNumber) lines.push(`CTS No.: ${form.ctsNumber}`);
  if (cfg.showKhataNumber && form.khataNumber) lines.push(`Khata No.: ${form.khataNumber}`);
  if (cfg.showFerfarNumber && form.ferfarNumber) lines.push(`Ferfar / Mutation No.: ${form.ferfarNumber}`);
  if (cfg.showEntryType && form.entryType) lines.push(`Entry type: ${entryLabel}`);

  if (villageCentroid) {
    lines.push("");
    lines.push(`Village centroid: ${villageCentroid.lat.toFixed(6)}, ${villageCentroid.lng.toFixed(6)}`);
    lines.push(`Google Maps: ${gmap(villageCentroid.lat, villageCentroid.lng)}`);
  }
  if (plotCoords.length >= 3 && plotCentroid) {
    lines.push("");
    lines.push("I have marked a plot boundary on the map.");
    lines.push(`Plot centroid: ${plotCentroid.lat.toFixed(6)}, ${plotCentroid.lng.toFixed(6)}`);
    lines.push(`Google Maps: ${gmap(plotCentroid.lat, plotCentroid.lng)}`);
    lines.push(`Approx. area: ${plotAreaSqm.toFixed(0)} sq.m`);
    lines.push("Plot polygon coordinates:");
    plotCoords.forEach(([lng, lat], i) => {
      lines.push(`${i + 1}. ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    });
  }
  lines.push("");
  lines.push("Please advise next steps.");
  return lines.join("\n");
}

/* ── Map panel ─────────────────────────────────────────────────────────────── */

type DrawMode = "idle" | "drawing" | "done";

function MapPanel({
  lang,
  boundaryFeature,
  drawMode,
  setDrawMode,
  drawnCoords,
  setDrawnCoords,
  baseLayerId,
  setBaseLayerId,
}: {
  lang: Lang;
  boundaryFeature: BoundaryFeature | null;
  drawMode: DrawMode;
  setDrawMode: (m: DrawMode) => void;
  drawnCoords: LngLat[];
  setDrawnCoords: (next: LngLat[] | ((prev: LngLat[]) => LngLat[])) => void;
  baseLayerId: BaseLayerId;
  setBaseLayerId: (id: BaseLayerId) => void;
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  const mapReadyRef = useRef(false);
  const drawModeRef = useRef<DrawMode>(drawMode);
  const drawnCoordsRef = useRef<LngLat[]>(drawnCoords);
  const cursorLngLatRef = useRef<LngLat | null>(null);

  /* Loading indicator: counts in-flight tile requests for whichever base
   * sources are currently visible. Driven by MapLibre's sourcedataloading
   * + sourcedata + idle events. */
  const [tilesLoading, setTilesLoading] = useState(false);
  const visibleSourceIdsRef = useRef<Set<string>>(
    new Set(LAYER_VISIBILITY[baseLayerId]),
  );
  useEffect(() => {
    visibleSourceIdsRef.current = new Set(LAYER_VISIBILITY[baseLayerId]);
  }, [baseLayerId]);

  useEffect(() => { drawModeRef.current = drawMode; }, [drawMode]);
  useEffect(() => { drawnCoordsRef.current = drawnCoords; }, [drawnCoords]);

  const tx = ui[lang];

  /* ── Initialize map once with the default OSM layer ────────────────────── */
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let mapInstance: any;

    async function init() {
      if (!mapContainerRef.current) return;
      const mgl = await import("maplibre-gl");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ML: any = mgl.default ?? mgl;

      // Build sources + layers for ALL base layers up front.
      // Only the currently selected ones start visible.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sources: Record<string, any> = {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const layers: any[] = [];
      const initiallyVisible = new Set(LAYER_VISIBILITY[baseLayerId]);
      for (const def of PRELOADED_LAYERS) {
        sources[def.id] = {
          type: "raster",
          tiles: def.tiles,
          tileSize: 256,
          attribution: def.attribution,
          maxzoom: def.maxzoom ?? 19,
        };
        layers.push({
          id: def.id,
          type: "raster",
          source: def.id,
          layout: {
            visibility: initiallyVisible.has(def.id) ? "visible" : "none",
          },
        });
      }

      mapInstance = new ML.Map({
        container: mapContainerRef.current,
        style: { version: 8, sources, layers },
        center: [75.7139, 19.7515],
        zoom: 6.5,
      });

      mapRef.current = mapInstance;

      mapInstance.on("load", () => {
        mapReadyRef.current = true;

        // Plot drawing sources / layers
        mapInstance.addSource("plot", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });
        mapInstance.addSource("plot-vertices", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });
        mapInstance.addSource("plot-progress", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });
        mapInstance.addLayer({
          id: "plot-fill",
          type: "fill",
          source: "plot",
          paint: { "fill-color": "#fb923c", "fill-opacity": 0.45 },
        });
        mapInstance.addLayer({
          id: "plot-outline",
          type: "line",
          source: "plot",
          paint: { "line-color": "#dc2626", "line-width": 3 },
        });
        mapInstance.addLayer({
          id: "plot-progress-line",
          type: "line",
          source: "plot-progress",
          paint: {
            "line-color": "#dc2626",
            "line-width": 2,
            "line-dasharray": [2, 2],
          },
        });
        mapInstance.addLayer({
          id: "plot-vertex-dots",
          type: "circle",
          source: "plot-vertices",
          paint: {
            "circle-radius": 5,
            "circle-color": "#dc2626",
            "circle-stroke-color": "#ffffff",
            "circle-stroke-width": 2,
          },
        });

        console.debug("[MapReference] map ready, draw layers installed");
      });

      mapInstance.on("click", (e: { lngLat: { lng: number; lat: number } }) => {
        if (drawModeRef.current !== "drawing") return;
        setDrawnCoords((prev) => [...prev, [e.lngLat.lng, e.lngLat.lat] as LngLat]);
      });

      mapInstance.on("dblclick", (e: { preventDefault: () => void }) => {
        if (drawModeRef.current !== "drawing") return;
        e.preventDefault();
        if (drawnCoordsRef.current.length >= 3) setDrawMode("done");
      });

      mapInstance.on("mousemove", (e: { lngLat: { lng: number; lat: number } }) => {
        if (drawModeRef.current !== "drawing") return;
        cursorLngLatRef.current = [e.lngLat.lng, e.lngLat.lat];
        renderProgressLine();
      });

      /* ── Loading indicator ─────────────────────────────────────────────
       * sourcedataloading fires when a tile request goes out for a source.
       * sourcedata + isSourceLoaded fires when that source becomes idle.
       * `idle` covers the all-finished case as a belt-and-braces fallback.
       * We only care about the sources that map to the *visible* base layer
       * — overlay-* and village tiles are not part of the user's intent
       * when they click a base-layer button. */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const isInterestingSource = (sid: any) =>
        typeof sid === "string" && visibleSourceIdsRef.current.has(sid);

      mapInstance.on("sourcedataloading", (e: { sourceId?: string }) => {
        if (isInterestingSource(e.sourceId)) setTilesLoading(true);
      });
      mapInstance.on("sourcedata", (e: { sourceId?: string; isSourceLoaded?: boolean }) => {
        if (!isInterestingSource(e.sourceId)) return;
        if (e.isSourceLoaded) {
          // Check if every other visible source is also loaded.
          const allLoaded = [...visibleSourceIdsRef.current].every((sid) =>
            mapInstance.isSourceLoaded?.(sid),
          );
          if (allLoaded) setTilesLoading(false);
        }
      });
      mapInstance.on("idle", () => setTilesLoading(false));
    }

    init();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        mapReadyRef.current = false;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Fast base-layer switch ────────────────────────────────────────────
   *
   * All base raster sources/layers are already on the map (added at init).
   * Switching is just `setLayoutProperty('visibility')` on each — no source
   * swap, no tile cache clear, no fitBounds, no zoom reset. The active
   * button highlights instantly via React state; the map repaints on the
   * next frame as MapLibre flips visibility. If tiles for the newly-shown
   * layer still need to download, the `tilesLoading` state (driven by
   * sourcedata events) shows a small banner — but the button is already
   * blue and the click is never blocked.
   */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const apply = () => {
      const visible = new Set(LAYER_VISIBILITY[baseLayerId]);
      for (const id of ALL_BASE_LAYER_IDS) {
        if (!map.getLayer(id)) continue;
        const want = visible.has(id) ? "visible" : "none";
        const have = map.getLayoutProperty(id, "visibility") ?? "visible";
        if (want !== have) {
          map.setLayoutProperty(id, "visibility", want);
        }
      }
      // If the newly visible layers already have their tiles cached, the
      // sourcedata events will not refire — clear the loading flag so the
      // banner doesn't get stuck. If they DO need to load, the listeners
      // in the init effect will re-set tilesLoading to true.
      const allLoaded = [...visible].every((sid) => map.isSourceLoaded?.(sid));
      if (allLoaded) setTilesLoading(false);
      else setTilesLoading(true);
    };
    if (mapReadyRef.current) apply();
    else map.once("load", apply);
  }, [baseLayerId]);

  /* ── Village boundary highlight ────────────────────────────────────────── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const renderOnce = () => {
      try {
        if (map.getLayer("village-fill")) map.removeLayer("village-fill");
        if (map.getLayer("village-outline")) map.removeLayer("village-outline");
        if (map.getSource("village")) map.removeSource("village");
      } catch (e) {
        console.warn("[MapReference] village layer cleanup warning:", e);
      }
      if (!boundaryFeature) return;

      map.addSource("village", { type: "geojson", data: boundaryFeature });
      const beforeId = map.getLayer("plot-fill") ? "plot-fill" : undefined;
      map.addLayer(
        {
          id: "village-fill",
          type: "fill",
          source: "village",
          paint: { "fill-color": "#facc15", "fill-opacity": 0.18 },
        },
        beforeId,
      );
      map.addLayer(
        {
          id: "village-outline",
          type: "line",
          source: "village",
          paint: { "line-color": "#dc2626", "line-width": 2, "line-opacity": 0.75 },
        },
        beforeId,
      );

      const [minLng, minLat, maxLng, maxLat] = bboxOfGeom(boundaryFeature.geometry);
      map.fitBounds(
        [[minLng, minLat], [maxLng, maxLat]],
        { padding: 40, duration: 1100, maxZoom: 15 },
      );
    };
    if (mapReadyRef.current) renderOnce();
    else map.once("load", renderOnce);
  }, [boundaryFeature]);

  /* ── Render polygon + vertices on coord/mode changes ───────────────────── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReadyRef.current) return;
    renderCommitted();
    renderProgressLine();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawnCoords, drawMode]);

  function renderCommitted() {
    const map = mapRef.current;
    if (!map || !mapReadyRef.current) return;
    const coords = drawnCoordsRef.current;
    if (coords.length >= 3 && drawModeRef.current === "done") {
      const ring: LngLat[] = [...coords, coords[0]];
      map.getSource("plot")?.setData({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {},
            geometry: { type: "Polygon", coordinates: [ring] },
          },
        ],
      });
    } else {
      map.getSource("plot")?.setData({ type: "FeatureCollection", features: [] });
    }
    map.getSource("plot-vertices")?.setData({
      type: "FeatureCollection",
      features: coords.map((c, i) => ({
        type: "Feature",
        properties: { idx: i },
        geometry: { type: "Point", coordinates: c },
      })),
    });
  }

  function renderProgressLine() {
    const map = mapRef.current;
    if (!map || !mapReadyRef.current) return;
    const coords = drawnCoordsRef.current;
    const cursor = cursorLngLatRef.current;
    if (drawModeRef.current !== "drawing" || coords.length === 0) {
      map.getSource("plot-progress")?.setData({ type: "FeatureCollection", features: [] });
      return;
    }
    const line: LngLat[] = cursor ? [...coords, cursor] : [...coords];
    map.getSource("plot-progress")?.setData({
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: { type: "LineString", coordinates: line },
        },
      ],
    });
  }

  /* ── Cursor + dblclick-zoom gating ─────────────────────────────────────── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReadyRef.current) return;
    const canvas = map.getCanvas();
    if (drawMode === "drawing") {
      canvas.style.cursor = "crosshair";
      map.doubleClickZoom?.disable?.();
    } else {
      canvas.style.cursor = "";
      map.doubleClickZoom?.enable?.();
    }
  }, [drawMode]);

  const handleLocateMe = () => {
    if (!navigator.geolocation || !mapRef.current) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      mapRef.current.flyTo({
        center: [pos.coords.longitude, pos.coords.latitude],
        zoom: 15,
        duration: 1000,
      });
    });
  };

  return (
    <div
      className="relative overflow-hidden rounded-lg border border-slate-200 shadow-sm"
      style={{ height: 420 }}
    >
      <div ref={mapContainerRef} className="h-full w-full" />

      {/* Loading indicator — shown only while the currently-visible base
          source has in-flight tile requests. Does not block the buttons. */}
      {tilesLoading && (
        <div
          className="pointer-events-none absolute left-1/2 top-3 z-20 -translate-x-1/2 rounded-full border border-blue-200 bg-white/95 px-3 py-1.5 text-[11px] font-bold text-blue-800 shadow-md backdrop-blur-sm"
          aria-live="polite"
        >
          <span className="mr-1.5 inline-block h-2 w-2 animate-pulse rounded-full bg-blue-500 align-middle" />
          {tx.changingMapType}
        </div>
      )}

      {/* Draw toolbar — top-left */}
      <div className="absolute left-3 top-3 z-10 flex items-stretch overflow-hidden rounded-lg border border-slate-300 bg-white shadow-md">
        <button
          type="button"
          onClick={() => {
            if (drawMode === "drawing") return;
            setDrawnCoords([]);
            setDrawMode("drawing");
            console.debug("[MapReference] draw mode → drawing");
          }}
          aria-pressed={drawMode === "drawing"}
          className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold transition ${
            drawMode === "drawing"
              ? "bg-blue-600 text-white"
              : "text-slate-700 hover:bg-slate-50"
          }`}
        >
          <Pencil className="size-3.5" />
          {tx.drawStart}
        </button>
        <button
          type="button"
          onClick={() => {
            if (drawMode === "drawing" && drawnCoords.length >= 3) {
              setDrawMode("done");
            }
          }}
          disabled={!(drawMode === "drawing" && drawnCoords.length >= 3)}
          className="inline-flex items-center gap-1.5 border-l border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
        >
          <Check className="size-3.5" />
          {tx.drawFinish}
        </button>
        <button
          type="button"
          onClick={() => {
            setDrawnCoords([]);
            setDrawMode("idle");
            cursorLngLatRef.current = null;
          }}
          disabled={drawnCoords.length === 0 && drawMode === "idle"}
          className="inline-flex items-center gap-1.5 border-l border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
        >
          <Eraser className="size-3.5" />
          {tx.drawClear}
        </button>
      </div>

      {/* Base-layer switcher — top-right */}
      <div
        className="absolute right-3 top-3 z-10 flex items-stretch overflow-hidden rounded-lg border border-slate-300 bg-white shadow-md"
        role="group"
        aria-label={tx.baseLayerLabel}
      >
        <span className="hidden items-center gap-1 border-r border-slate-200 bg-slate-50 px-2.5 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500 sm:inline-flex">
          <Layers className="size-3" />
          {tx.baseLayerLabel}
        </span>
        {BASE_LAYER_ORDER.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setBaseLayerId(id)}
            aria-pressed={baseLayerId === id}
            className={`border-l border-slate-200 px-2.5 py-2 text-[11px] font-bold transition first:border-l-0 ${
              baseLayerId === id
                ? "bg-blue-600 text-white"
                : "text-slate-700 hover:bg-slate-50"
            }`}
          >
            {tx.baseLayers[id]}
          </button>
        ))}
      </div>

      {/* My location — small overlay button bottom-right (moved to avoid colliding with switcher) */}
      <button
        type="button"
        onClick={handleLocateMe}
        title={tx.locateMe}
        className="absolute bottom-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white shadow-sm transition hover:bg-slate-50"
      >
        <Locate className="size-4 text-slate-600" />
      </button>

      {/* Hint banner — bottom-left */}
      <div className="pointer-events-none absolute bottom-3 left-3 z-10 max-w-[60%] rounded-md border border-blue-200 bg-white/90 px-3 py-2 text-xs font-semibold text-blue-900 shadow-sm backdrop-blur-sm">
        <MapPin className="mr-1 inline size-3.5" />
        {drawMode === "drawing" ? tx.drawHintActive : tx.drawHintIdle}
      </div>
    </div>
  );
}

/* ── Main section ──────────────────────────────────────────────────────────── */

export function MapReferenceSection() {
  const { lang } = useLang();
  const tx = ui[lang];

  const [form, setForm] = useState<FormData>({
    district: "", taluka: "", village: "",
    district_id: "", taluka_id: "", village_id: "",
    gutNumber: "", surveyNumber: "",
    khataNumber: "", ferfarNumber: "", ctsNumber: "",
    region: "", office: "", peth: "",
    citySurveyOffice: "", divisionWard: "",
    entryType: "all",
    serviceType: "",
  });

  /* Selected service tab — drives which fields are visible and which lines the
   * WhatsApp message includes. Defaults to 7/12 since that's the most common
   * request volume for PrintShubh. Switching tabs preserves all already-typed
   * values so the user can toggle without losing work. */
  const [activeService, setActiveService] = useState<ServiceTab>("7_12");
  const fieldCfg = SERVICE_FIELDS[activeService];

  const [districts, setDistricts] = useState<DistrictRow[]>([]);
  const [talukas, setTalukas] = useState<TalukaRow[]>([]);
  const [villages, setVillages] = useState<VillageRow[]>([]);

  const [boundaryFeature, setBoundaryFeature] = useState<BoundaryFeature | null>(null);
  const [boundaryLoading, setBoundaryLoading] = useState(false);
  const [boundaryError, setBoundaryError] = useState<string | null>(null);

  const [drawMode, setDrawMode] = useState<DrawMode>("idle");
  const [drawnCoords, setDrawnCoordsRaw] = useState<LngLat[]>([]);
  const setDrawnCoords = useCallback(
    (next: LngLat[] | ((prev: LngLat[]) => LngLat[])) => {
      setDrawnCoordsRaw(next as LngLat[]);
    },
    [],
  );

  const [baseLayerId, setBaseLayerId] = useState<BaseLayerId>("osm");

  /* Mobile-only anchors. Used by the Form↔Map pill toggle AND by the
   * auto-scroll-to-map effect that fires after a village is selected.
   * Desktop ignores these refs — scroll only triggers below Tailwind's
   * lg breakpoint (1024 px). */
  const mobileMapAnchorRef = useRef<HTMLDivElement | null>(null);
  const mobileFormAnchorRef = useRef<HTMLDivElement | null>(null);

  /* ── Load districts ────────────────────────────────────────────────────── */
  useEffect(() => {
    fetch("/data/dropdowns/districts.json")
      .then((r) => r.json())
      .then((rows: DistrictRow[]) => {
        rows.sort((a, b) =>
          displayDistrictName(a, lang).localeCompare(displayDistrictName(b, lang)),
        );
        setDistricts(rows);
        console.debug("[MapReference] districts loaded:", rows.length);
      })
      .catch((e) => {
        console.error("[MapReference] districts fetch failed:", e);
        setDistricts([]);
      });
  }, [lang]);

  useEffect(() => {
    if (!form.district_id) {
      setTalukas([]);
      return;
    }
    const url = `/data/dropdowns/talukas/${encodeURIComponent(form.district_id)}.json`;
    fetch(url)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("HTTP " + r.status))))
      .then((rows: TalukaRow[]) => {
        rows.sort((a, b) =>
          displayWithMap(a, lang, TALUKA_MR_MAP).localeCompare(
            displayWithMap(b, lang, TALUKA_MR_MAP),
          ),
        );
        setTalukas(rows);
        console.debug("[MapReference] talukas loaded:", rows.length, "from", url);
      })
      .catch((e) => {
        console.error("[MapReference] talukas fetch failed:", url, e);
        setTalukas([]);
      });
  }, [form.district_id, lang]);

  useEffect(() => {
    if (!form.district_id || !form.taluka_id) {
      setVillages([]);
      return;
    }
    const url = `/data/dropdowns/villages/${encodeURIComponent(form.district_id)}/${encodeURIComponent(form.taluka_id)}.json`;
    fetch(url)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("HTTP " + r.status))))
      .then((rows: VillageRow[]) => {
        rows.sort((a, b) =>
          displayWithMap(a, lang, VILLAGE_MR_MAP).localeCompare(
            displayWithMap(b, lang, VILLAGE_MR_MAP),
          ),
        );
        setVillages(rows);
        console.debug("[MapReference] villages loaded:", rows.length, "from", url);
      })
      .catch((e) => {
        console.error("[MapReference] villages fetch failed:", url, e);
        setVillages([]);
      });
  }, [form.district_id, form.taluka_id, lang]);

  useEffect(() => {
    if (!form.district_id || !form.taluka_id || !form.village_id) {
      setBoundaryFeature(null);
      setBoundaryError(null);
      return;
    }
    const selectedVillage = villages.find((v) => v.village_id === form.village_id);
    if (!selectedVillage) {
      console.warn("[MapReference] selected village_id not in villages list:", form.village_id);
      setBoundaryFeature(null);
      return;
    }
    const url =
      selectedVillage.boundary_file ||
      `/data/boundaries/villages/${encodeURIComponent(form.district_id)}/${encodeURIComponent(form.taluka_id)}.geojson`;

    console.debug("[MapReference] fetching boundary:", {
      district_id: form.district_id,
      taluka_id: form.taluka_id,
      village_id: form.village_id,
      boundary_file: url,
    });

    setBoundaryLoading(true);
    setBoundaryError(null);
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error("HTTP " + r.status + " from " + url);
        return r.json() as Promise<BoundaryFC>;
      })
      .then((fc) => {
        console.debug("[MapReference] taluka feature count:", fc.features?.length);
        const match = (fc.features || []).find(
          (f) => f.properties.village_id === form.village_id,
        );
        if (!match) {
          console.error("[MapReference] no feature matched village_id", form.village_id, "in", url);
          setBoundaryFeature(null);
          setBoundaryError(tx.boundaryError);
          setBoundaryLoading(false);
          return;
        }
        setBoundaryFeature(match);
        setBoundaryLoading(false);
      })
      .catch((e) => {
        console.error("[MapReference] boundary fetch failed:", url, e);
        setBoundaryFeature(null);
        setBoundaryError(tx.boundaryError);
        setBoundaryLoading(false);
      });
  }, [form.district_id, form.taluka_id, form.village_id, villages, tx.boundaryError]);

  useEffect(() => {
    setDrawnCoordsRaw([]);
    setDrawMode("idle");
  }, [form.village_id]);

  /* Mobile auto-scroll: as soon as the village boundary is ready, slide the
   * map container into view on phones/tablets. Desktop users already see
   * both columns side-by-side, so we skip scrolling there. The viewport
   * check uses Tailwind's lg breakpoint (1024 px) — same one that drives
   * the column layout above. */
  useEffect(() => {
    if (!boundaryFeature) return;
    if (typeof window === "undefined") return;
    const isMobile = window.matchMedia("(max-width: 1023.99px)").matches;
    if (!isMobile) return;
    mobileMapAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [boundaryFeature]);

  /* ── Dropdown handlers — store the *display* name into form.{district…} ── */
  const handleSelectDistrict = useCallback(
    (id: string) => {
      const row = districts.find((d) => d.district_id === id);
      console.debug("[MapReference] selected district:", id, row);
      setForm((prev) => ({
        ...prev,
        district_id: id,
        district: row ? displayDistrictName(row, lang) : "",
        taluka_id: "", taluka: "",
        village_id: "", village: "",
      }));
      setTalukas([]);
      setVillages([]);
      setBoundaryFeature(null);
      setBoundaryError(null);
    },
    [districts, lang],
  );

  const handleSelectTaluka = useCallback(
    (id: string) => {
      const row = talukas.find((t) => t.taluka_id === id);
      console.debug("[MapReference] selected taluka:", id, row);
      setForm((prev) => ({
        ...prev,
        taluka_id: id,
        taluka: row ? displayWithMap(row, lang, TALUKA_MR_MAP) : "",
        village_id: "", village: "",
      }));
      setVillages([]);
      setBoundaryFeature(null);
      setBoundaryError(null);
    },
    [talukas, lang],
  );

  const handleSelectVillage = useCallback(
    (id: string) => {
      const row = villages.find((v) => v.village_id === id);
      console.debug("[MapReference] selected village:", id, row);
      setForm((prev) => ({
        ...prev,
        village_id: id,
        village: row ? displayWithMap(row, lang, VILLAGE_MR_MAP) : "",
      }));
    },
    [villages, lang],
  );

  /* ── If user toggles language AFTER a selection, refresh the stored
   *    display names so the WhatsApp message and the on-screen "Selected
   *    village" banner stay in sync. */
  useEffect(() => {
    setForm((prev) => {
      const distRow = districts.find((d) => d.district_id === prev.district_id);
      const talRow = talukas.find((t) => t.taluka_id === prev.taluka_id);
      const vilRow = villages.find((v) => v.village_id === prev.village_id);
      return {
        ...prev,
        district: distRow ? displayDistrictName(distRow, lang) : prev.district,
        taluka:   talRow  ? displayWithMap(talRow, lang, TALUKA_MR_MAP) : prev.taluka,
        village:  vilRow  ? displayWithMap(vilRow, lang, VILLAGE_MR_MAP) : prev.village,
      };
    });
    // We want this to fire only on lang change — including the rest causes a loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  /* ── Derivations ───────────────────────────────────────────────────────── */
  const villageCentroid = useMemo(() => {
    if (!boundaryFeature) return null;
    const [minLng, minLat, maxLng, maxLat] = bboxOfGeom(boundaryFeature.geometry);
    return { lat: (minLat + maxLat) / 2, lng: (minLng + maxLng) / 2 };
  }, [boundaryFeature]);

  const plotCentroid = useMemo(() => centroidOf(drawnCoords), [drawnCoords]);
  const plotAreaSqm = useMemo(
    () => (drawMode === "done" ? approxAreaSqMeters(drawnCoords) : 0),
    [drawnCoords, drawMode],
  );

  /* Enable WhatsApp once the user has filled the *required* fields for the
   * currently active service. Different services have different "minimum
   * to send" requirements — taluka/village services need the dropdown chain,
   * Property Card needs CTS, Mumbai PC needs City Survey + CTS, etc. */
  const waEnabled = useMemo(() => {
    const cfg = fieldCfg;
    // For taluka/village-driven services we still require the full chain so
    // the boundary fit + village name go into the WA message.
    if (cfg.showVillage && (!form.district_id || !form.taluka_id || !form.village_id)) {
      return false;
    }
    if (cfg.showDistrict && !cfg.showVillage && !form.district) {
      return false;
    }
    if (cfg.showCitySurveyOffice && !form.citySurveyOffice) return false;
    if (cfg.primaryField === "khata" && !form.khataNumber) return false;
    if (cfg.primaryField === "ferfar" && !form.ferfarNumber) return false;
    if (cfg.primaryField === "cts" && !form.ctsNumber) return false;
    return true;
  }, [fieldCfg, form]);

  const waHref = useMemo(() => {
    const msg = buildWhatsAppMsg({
      lang,
      service: activeService,
      form,
      villageCentroid,
      plotCoords: drawMode === "done" ? drawnCoords : [],
      plotCentroid: drawMode === "done" ? plotCentroid : null,
      plotAreaSqm,
    });
    return `https://wa.me/918625801907?text=${encodeURIComponent(msg)}`;
  }, [lang, activeService, form, villageCentroid, drawnCoords, drawMode, plotCentroid, plotAreaSqm]);

  /**
   * Generic form updater. We cast the resulting object back to FormData
   * because `entryType` is a literal union ("all" | "live" | "") that a
   * plain `string` would widen. The radio inputs only ever emit "all" or
   * "live", so the cast is sound in practice.
   */
  const updateForm = (key: keyof FormData, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value } as FormData));

  const selectedVillageDisplay = useMemo(() => {
    const vilRow = villages.find((v) => v.village_id === form.village_id);
    return vilRow ? displayWithMap(vilRow, lang, VILLAGE_MR_MAP) : "";
  }, [villages, form.village_id, lang]);

  /* ── Render ────────────────────────────────────────────────────────────── */
  return (
    <section id="map-reference" className="bg-[#f0f7ff] px-5 py-20 sm:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div data-reveal className="mb-10">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">{tx.sectionBadge}</p>
          <h2 className="mt-3 text-3xl font-black leading-tight text-slate-950 sm:text-5xl">{tx.heading}</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">{tx.subtext}</p>
        </div>

        {/* Mobile-only Form ↔ Map quick toggle. Hidden on lg+. */}
        <div className="mb-5 flex gap-2 rounded-lg border border-slate-200 bg-white p-1 shadow-sm lg:hidden">
          <button
            type="button"
            onClick={() => mobileFormAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
            className="flex-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-black text-white transition active:scale-[0.98]"
          >
            {lang === "mr" ? "फॉर्म" : "Form"}
          </button>
          <button
            type="button"
            onClick={() => mobileMapAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
            className="flex-1 rounded-md bg-slate-100 px-3 py-2 text-sm font-black text-slate-800 transition hover:bg-slate-200 active:scale-[0.98]"
          >
            {lang === "mr" ? "नकाशा पहा" : "Show map"}
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          {/*
           * Mobile: form column (order-1) renders FIRST, so the user lands
           * on the dropdowns. Map column (order-2) sits below. Desktop keeps
           * the original side-by-side layout via lg:order-* overrides.
           */}
          <div ref={mobileMapAnchorRef} className="order-2 space-y-4 lg:order-1">
            <MapPanel
              lang={lang}
              boundaryFeature={boundaryFeature}
              drawMode={drawMode}
              setDrawMode={setDrawMode}
              drawnCoords={drawnCoords}
              setDrawnCoords={setDrawnCoords}
              baseLayerId={baseLayerId}
              setBaseLayerId={setBaseLayerId}
            />

            {boundaryLoading && (
              <div className="flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-900">
                <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                {tx.boundaryLoading}
              </div>
            )}
            {boundaryError && !boundaryLoading && (
              <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-800">
                <Info className="mt-0.5 size-3.5 shrink-0" />
                {boundaryError}
              </div>
            )}
            {boundaryFeature && !boundaryLoading && selectedVillageDisplay && (
              <div className="rounded-md border border-yellow-300 bg-yellow-50 px-3 py-2 text-xs font-bold text-yellow-900">
                <MapPin className="mr-1 inline size-3.5" />
                {tx.boundarySelected}: {selectedVillageDisplay}
              </div>
            )}

            {drawMode === "done" && plotCentroid && drawnCoords.length >= 3 && (
              <div className="rounded-lg border-2 border-orange-300 bg-orange-50 p-4 shadow-sm">
                <p className="flex items-center gap-2 text-sm font-black text-orange-900">
                  <Pencil className="size-4" />
                  {tx.plotMarked}
                </p>
                <div className="mt-3 grid gap-2 text-xs font-semibold text-slate-700 sm:grid-cols-2">
                  <div>
                    <span className="text-slate-500">{tx.centroid}: </span>
                    <span className="font-black text-orange-900">
                      {plotCentroid.lat.toFixed(6)}, {plotCentroid.lng.toFixed(6)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">{tx.plotVertices}: </span>
                    <span className="font-black text-orange-900">{drawnCoords.length}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-500">{tx.area}: </span>
                    <span className="font-black text-orange-900">
                      {formatAreaPair(plotAreaSqm, lang)}
                    </span>
                  </div>
                </div>
                <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-5 text-orange-800">
                  <Info className="mt-0.5 size-3 shrink-0" />
                  {tx.areaNote}
                </p>
              </div>
            )}
          </div>

          <div ref={mobileFormAnchorRef} className="order-1 space-y-4 lg:order-2">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="mb-3 text-lg font-black text-slate-950">{tx.formHeading}</h3>

              {/* ── Service tabs ────────────────────────────────────────────
               * Horizontal pill bar. Scrolls horizontally on small screens so
               * the 7 tabs never wrap awkwardly. -mx-* + px-* lets the row
               * bleed to the card edges and gives the rightmost pill some
               * breathing room when scrolled to the end. */}
              <div
                role="tablist"
                aria-label={lang === "mr" ? "कागदपत्र प्रकार" : "Document type"}
                className="-mx-1 mb-2 flex gap-1.5 overflow-x-auto px-1 pb-2 [scrollbar-width:thin]"
              >
                {SERVICE_TAB_ORDER.map((id) => {
                  const isActive = activeService === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActiveService(id)}
                      className={`shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-bold transition focus:outline-none focus:ring-2 focus:ring-blue-200 sm:text-sm ${
                        isActive
                          ? "border-blue-700 bg-blue-700 text-white shadow-sm"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white"
                      }`}
                    >
                      {SERVICE_LABELS[lang][id]}
                    </button>
                  );
                })}
              </div>
              <p className="mb-5 flex items-start gap-1.5 text-[11px] leading-5 text-slate-500">
                <Info className="mt-0.5 size-3.5 shrink-0 text-blue-500" />
                {tx.tabsHelper}
              </p>

              <div className="space-y-4">
                {/* ── Location section ──────────────────────────────────── */}
                {fieldCfg.showRegion && (
                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-slate-700">{tx.region}</label>
                    <input
                      type="text"
                      value={form.region}
                      onChange={(e) => updateForm("region", e.target.value)}
                      placeholder={tx.chooseRegion}
                      className="h-12 lg:h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-base lg:text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                )}

                {fieldCfg.showDistrict && (
                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-slate-700">{tx.district}</label>
                    <select
                      value={form.district_id}
                      onChange={(e) => handleSelectDistrict(e.target.value)}
                      className="h-12 lg:h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-base lg:text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="">— {tx.chooseDistrict} —</option>
                      {districts.map((d) => (
                        <option key={d.district_id} value={d.district_id}>
                          {displayDistrictName(d, lang)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {fieldCfg.showOffice && (
                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-slate-700">{tx.office}</label>
                    <input
                      type="text"
                      value={form.office}
                      onChange={(e) => updateForm("office", e.target.value)}
                      placeholder={tx.chooseOffice}
                      className="h-12 lg:h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-base lg:text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                )}

                {fieldCfg.showTaluka && (
                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-slate-700">{tx.taluka}</label>
                    <select
                      value={form.taluka_id}
                      onChange={(e) => handleSelectTaluka(e.target.value)}
                      disabled={!form.district_id}
                      className="h-12 lg:h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-base lg:text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400"
                    >
                      <option value="">— {tx.chooseTaluka} —</option>
                      {talukas.map((t) => (
                        <option key={t.taluka_id} value={t.taluka_id}>
                          {displayWithMap(t, lang, TALUKA_MR_MAP)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {fieldCfg.showVillage && (
                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-slate-700">{tx.village}</label>
                    <select
                      value={form.village_id}
                      onChange={(e) => handleSelectVillage(e.target.value)}
                      disabled={!form.taluka_id}
                      className="h-12 lg:h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-base lg:text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400"
                    >
                      <option value="">— {tx.chooseVillage} —</option>
                      {villages.map((v) => (
                        <option key={v.village_id} value={v.village_id}>
                          {displayWithMap(v, lang, VILLAGE_MR_MAP)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {fieldCfg.showPeth && (
                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-slate-700">{tx.peth}</label>
                    <input
                      type="text"
                      value={form.peth}
                      onChange={(e) => updateForm("peth", e.target.value)}
                      placeholder={tx.choosePeth}
                      className="h-12 lg:h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-base lg:text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                )}

                {fieldCfg.showCitySurveyOffice && (
                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-slate-700">{tx.citySurveyOffice}</label>
                    <input
                      type="text"
                      value={form.citySurveyOffice}
                      onChange={(e) => updateForm("citySurveyOffice", e.target.value)}
                      placeholder={tx.chooseCitySurveyOffice}
                      className="h-12 lg:h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-base lg:text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                )}

                {fieldCfg.showDivisionWard && (
                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-slate-700">{tx.divisionWard}</label>
                    <input
                      type="text"
                      value={form.divisionWard}
                      onChange={(e) => updateForm("divisionWard", e.target.value)}
                      placeholder={tx.chooseDivisionWard}
                      className="h-12 lg:h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-base lg:text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                )}

                {fieldCfg.showDistrict && form.district_id && !form.taluka_id && fieldCfg.showTaluka && (
                  <p className="flex items-start gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs leading-5 text-blue-900">
                    <Info className="mt-0.5 size-3.5 shrink-0" />
                    {lang === "mr" ? "आता तालुका निवडा." : "Now choose a taluka."}
                  </p>
                )}

                {/* ── Service-specific fields ───────────────────────────── */}
                {fieldCfg.showKhataNumber && (
                  <div>
                    <label className="mb-1.5 block text-sm font-black text-blue-900">
                      {tx.khataNo}
                    </label>
                    <input
                      type="text"
                      value={form.khataNumber}
                      onChange={(e) => updateForm("khataNumber", e.target.value)}
                      placeholder="—"
                      className="h-12 lg:h-11 w-full rounded-md border-2 border-blue-200 bg-blue-50/40 px-3 text-base lg:text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />
                    <p className="mt-1 text-[11px] leading-5 text-slate-500">{tx.khataHolderHint}</p>
                  </div>
                )}

                {fieldCfg.showFerfarNumber && (
                  <div>
                    <label className="mb-1.5 block text-sm font-black text-blue-900">
                      {tx.ferfarNo}
                    </label>
                    <input
                      type="text"
                      value={form.ferfarNumber}
                      onChange={(e) => updateForm("ferfarNumber", e.target.value)}
                      placeholder="—"
                      className="h-12 lg:h-11 w-full rounded-md border-2 border-blue-200 bg-blue-50/40 px-3 text-base lg:text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                )}

                {fieldCfg.showCtsNumber && (
                  <div>
                    <label className="mb-1.5 block text-sm font-black text-blue-900">
                      {tx.ctsNo}
                    </label>
                    <input
                      type="text"
                      value={form.ctsNumber}
                      onChange={(e) => updateForm("ctsNumber", e.target.value)}
                      placeholder={tx.ctsNoSelectHint}
                      className="h-12 lg:h-11 w-full rounded-md border-2 border-blue-200 bg-blue-50/40 px-3 text-base lg:text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                )}

                {(fieldCfg.showGutNumber || fieldCfg.showSurveyNumber) && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {fieldCfg.showGutNumber && (
                      <div>
                        <label className="mb-1.5 block text-xs font-bold text-slate-600">{tx.gutNo}</label>
                        <input
                          type="text"
                          value={form.gutNumber}
                          onChange={(e) => updateForm("gutNumber", e.target.value)}
                          placeholder="—"
                          className="h-11 lg:h-10 w-full rounded-md border border-slate-300 bg-slate-50 px-3 text-base lg:text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
                        />
                      </div>
                    )}
                    {fieldCfg.showSurveyNumber && (
                      <div>
                        <label className="mb-1.5 block text-xs font-bold text-slate-600">{tx.surveyNo}</label>
                        <input
                          type="text"
                          value={form.surveyNumber}
                          onChange={(e) => updateForm("surveyNumber", e.target.value)}
                          placeholder="—"
                          className="h-11 lg:h-10 w-full rounded-md border border-slate-300 bg-slate-50 px-3 text-base lg:text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
                        />
                      </div>
                    )}
                  </div>
                )}

                {fieldCfg.showEntryType && (
                  <div>
                    <span className="mb-1.5 block text-sm font-bold text-slate-700">{tx.entryTypeLabel}</span>
                    <div className="flex flex-wrap gap-2">
                      {(["all", "live"] as const).map((opt) => {
                        const checked = form.entryType === opt;
                        return (
                          <label
                            key={opt}
                            className={`inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-xs font-bold transition sm:text-sm ${
                              checked
                                ? "border-blue-600 bg-blue-50 text-blue-900"
                                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <input
                              type="radio"
                              name="entryType"
                              value={opt}
                              checked={checked}
                              onChange={() => updateForm("entryType", opt)}
                              className="accent-blue-600"
                            />
                            {opt === "all" ? tx.entryAll : tx.entryLive}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                <p className="text-xs leading-5 text-slate-500">
                  <Info className="mr-1 inline size-3.5 text-amber-500" />
                  {tx.optionalNote}
                </p>
              </div>

              {!waEnabled && (
                <p className="mt-4 flex items-start gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-600">
                  <Info className="mt-0.5 size-3.5 shrink-0 text-slate-400" />
                  {tx.notReadyForWa}
                </p>
              )}

              {waEnabled ? (
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-green-600 text-base font-black text-white shadow-sm transition hover:bg-green-700"
                >
                  <MessageCircle className="size-5" />
                  {tx.whatsappBtn}
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="mt-6 inline-flex h-12 w-full cursor-not-allowed items-center justify-center gap-2 rounded-md bg-slate-300 text-base font-black text-white shadow-sm"
                >
                  <MessageCircle className="size-5" />
                  {tx.whatsappBtn}
                </button>
              )}
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-4 text-sm font-semibold leading-6 text-amber-900">
              <Info className="mt-0.5 size-5 shrink-0 text-amber-600" />
              {tx.disclaimer}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
