"use client";

/**
 * Admin — Manual BhuNaksha Overlay tool.
 *
 * Upload a BhuNaksha PDF/image, render page 1, and manually align it on a
 * satellite/base map. Alignment is a four-corner MapLibre `image` source:
 *   - Move      — drag the whole overlay (translate all corners)
 *   - Corners   — drag each of the 4 corner handles (skew/perspective-like fit)
 *   - Width/Height stretch — drag edge handles (move two corners of an edge)
 *   - Rotate    — drag a rotate handle (rigid rotation about the centroid)
 *   - Numeric   — non-uniform scaleX / scaleY, rotation, opacity + fit helpers
 * Plus boundary drawing (live dimensions/perimeter/area), reference/control
 * points, report output, and a map screenshot. Admin-only, flag-gated.
 *
 * No backend yet — the case persists to localStorage.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  Eraser,
  FileUp,
  Frame,
  Hand,
  Info,
  Layers as LayersIcon,
  Lock,
  MapPin,
  Move,
  MoveHorizontal,
  Pencil,
  Trash2,
  RotateCw,
  Unlock,
} from "lucide-react";
import { useLang } from "@/components/language-context";
import { LandReportCasePanel } from "@/components/admin/land-report-case-panel";
import { LocationNavigatorPanel } from "@/components/admin/location-navigator-panel";
import { OverlayControlsPanel } from "@/components/admin/overlay-controls-panel";
import { OverlayCornersPanel, type CornerKey } from "@/components/admin/overlay-corners-panel";
import { ReferencePointsPanel } from "@/components/admin/reference-points-panel";
import { ReportOutputPanel } from "@/components/admin/report-output-panel";
import { useLgdLocation } from "@/components/admin/use-lgd-location";
import { fileToRaster } from "@/lib/bhunaksha/pdf-to-image";
import {
  approxAreaSqMeters,
  approxScaleDenominator,
  cornersCentroid,
  cornersFromParams,
  cornersToCoords,
  deriveParams,
  formatTodayDate,
  haversineMeters,
  midpointLngLat,
  niceScaleDenominator,
  parseLatLngFromGoogleMapsUrl,
  perimeterMeters,
  polygonEdges,
  rotateCornersAround,
  suggestOverlayPlacement,
  translateCorners,
  viewportWidthMeters,
  type Corners,
  type LngLat,
} from "@/lib/bhunaksha/overlay-transform";
import {
  createEmptyCase,
  FEATURE_NAME,
  OVERLAY_DISCLAIMER,
  REFERENCE_TYPE_COLORS,
  type BhuNakshaOverlayConfig,
  type LandReportCase,
  type ReferencePoint,
} from "@/lib/bhunaksha/report-schema";

const STORAGE_KEY = "printshubh_admin_bhunaksha_case_v1";

type BaseLayer = "satellite" | "osm";
type DrawMode = "idle" | "drawing" | "done";
type TransformMode = "pan" | "move" | "corner" | "sides" | "rotate";

interface LayerVisibility {
  overlay: boolean;
  boundary: boolean;
  dimensions: boolean;
  refPoints: boolean;
}

const ESRI_IMAGERY =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function ovToCorners(ov: BhuNakshaOverlayConfig): Corners {
  if (ov.cornerLngLats) {
    return {
      topLeft: ov.cornerLngLats.topLeft,
      topRight: ov.cornerLngLats.topRight,
      bottomRight: ov.cornerLngLats.bottomRight,
      bottomLeft: ov.cornerLngLats.bottomLeft,
    };
  }
  const w = (ov.widthMeters ?? 500) * (ov.scaleX ?? ov.scale ?? 1);
  const h = (ov.heightMeters ?? 500) * (ov.scaleY ?? ov.scale ?? 1);
  return cornersFromParams(ov.centerLngLat, w, h, ov.rotationDeg);
}

const T = {
  title: { mr: "भूनकाशा Manual Overlay", en: "Manual BhuNaksha Overlay" },
  adminBadge: { mr: "फक्त admin", en: "Admin only" },
  upload: { mr: "भूनकाशा अपलोड", en: "BhuNaksha Upload" },
  fileType: { mr: "फाइल प्रकार", en: "File type" },
  pageNo: { mr: "पृष्ठ क्रमांक (PDF)", en: "Page number (PDF)" },
  preview: { mr: "Preview", en: "Preview" },
  extracted: { mr: "Extract केलेला मजकूर (admin)", en: "Extracted text (admin)" },
  owner: { mr: "मालक नाव (admin)", en: "Owner name (admin)" },
  khata: { mr: "खाता / Survey No (admin)", en: "Khata / Survey No (admin)" },
  privacy: {
    mr: "मालक नाव, खाता व वैयक्तिक तपशील फक्त admin साठी. अहवालात समाविष्ट करायचे असल्यासच चालू करा.",
    en: "Owner name, Khata and personal details are admin-only. Include in the report only if explicitly enabled.",
  },
  busy: { mr: "फाइल वाचत आहे...", en: "Reading file..." },
  pdfError: {
    mr: "PDF render होऊ शकले नाही. कृपया त्याऐवजी image (screenshot) अपलोड करा.",
    en: "Could not render the PDF. Please upload an image (screenshot) instead.",
  },
  transform: { mr: "Overlay transform", en: "Overlay transform" },
  modePan: { mr: "नकाशा हलवा", en: "Pan map" },
  modeMove: { mr: "Overlay हलवा", en: "Move overlay" },
  modeCorner: { mr: "कोपरे adjust करा", en: "Adjust corners" },
  modeSides: { mr: "बाजू stretch करा", en: "Stretch sides" },
  modeRotate: { mr: "फिरवा", en: "Rotate" },
  lock: { mr: "Lock", en: "Lock" },
  resetBtn: { mr: "Reset", en: "Reset" },
  fitMapBtn: { mr: "Fit to map", en: "Fit to map" },
  fitBoundaryBtn: { mr: "Fit to boundary", en: "Fit to boundary" },
  removeFile: { mr: "फाईल काढा", en: "Remove file" },
  removeConfirm: {
    mr: "भूनकाशा फाईल आणि overlay काढायचे? (केस तपशील राहतील)",
    en: "Remove the BhuNaksha file and overlay? (Case details are kept)",
  },
  layers: { mr: "नकाशा थर", en: "Map Layers" },
  satellite: { mr: "सॅटेलाइट", en: "Satellite" },
  baseMap: { mr: "बेस नकाशा (OSM)", en: "Base map (OSM)" },
  overlayLayer: { mr: "भूनकाशा overlay", en: "BhuNaksha overlay" },
  boundaryLayer: { mr: "निवडलेली प्लॉट सीमा", en: "Selected plot boundary" },
  dimsLayer: { mr: "सीमा परिमाणे", en: "Boundary dimensions" },
  refPointsLayer: { mr: "संदर्भ बिंदू / Survey labels", en: "Reference points / Survey labels" },
  notesMarkers: { mr: "Notes / Markers (Phase 2)", en: "Notes / Markers (Phase 2)" },
  drawStart: { mr: "प्लॉट सीमा मार्क करा", en: "Mark plot boundary" },
  drawFinish: { mr: "पूर्ण करा", en: "Finish" },
  drawClear: { mr: "साफ करा", en: "Clear" },
  drawHint: { mr: "✏️ दाबा, points क्लिक करा, double-click ने पूर्ण.", en: "Tap ✏️, click points, double-click to finish." },
  hintPan: { mr: "नकाशा drag करून हलवा (zoom/pan चालू).", en: "Drag to pan the map (zoom/pan stay active)." },
  hintMove: { mr: "Overlay drag करा.", en: "Drag to move the overlay." },
  hintCorner: { mr: "कोपरे drag करा; केंद्र handle ने संपूर्ण overlay हलवा.", en: "Drag corners; use the center handle to move the whole overlay." },
  hintSides: { mr: "बाजूचे handle drag करून stretch करा.", en: "Drag a side handle to stretch that edge." },
  hintRotate: { mr: "Rotate handle drag करा.", en: "Drag the rotate handle." },
  hintMark: { mr: "नकाशावर क्लिक करून संदर्भ बिंदू जोडा.", en: "Click on the map to add reference points." },
  approxScale: { mr: "अंदाजे स्केल", en: "Approx. Scale" },
  imageryDate: { mr: "प्रतिमा दिनांक", en: "Imagery date" },
  notAvailable: { mr: "उपलब्ध नाही", en: "Not available" },
  viewDate: { mr: "दृश्य दिनांक", en: "View date" },
  sideLengths: { mr: "बाजूंची लांबी", en: "Side lengths" },
  side: { mr: "बाजू", en: "Side" },
  area: { mr: "अंदाजे क्षेत्रफळ", en: "Approx. area" },
  perimeter: { mr: "परिमिती", en: "Perimeter" },
  saved: { mr: "Case localStorage मध्ये सेव्ह होते (Phase 1).", en: "Case is saved to localStorage (Phase 1)." },
};

export function BhuNakshaOverlayTool() {
  const { lang, setLang } = useLang();

  const [caseData, setCaseData] = useState<LandReportCase>(() => createEmptyCase("case-local", ""));
  const [baseLayer, setBaseLayer] = useState<BaseLayer>("satellite");
  const [drawMode, setDrawMode] = useState<DrawMode>("idle");
  const [drawnCoords, setDrawnCoords] = useState<LngLat[]>([]);
  const [transformMode, setTransformMode] = useState<TransformMode>("pan");
  const [uniform, setUniform] = useState(true);
  const [markMode, setMarkMode] = useState(false);
  const [layers, setLayers] = useState<LayerVisibility>({ overlay: true, boundary: true, dimensions: true, refPoints: true });
  const [scaleText, setScaleText] = useState("");
  const [currentZoom, setCurrentZoom] = useState(6.5);
  const [navTarget, setNavTarget] = useState<{ lng: number; lat: number; label: string; type: ReferencePoint["type"] } | null>(null);
  const [googleMsg, setGoogleMsg] = useState<string | null>(null);
  const [cornersCopied, setCornersCopied] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);

  const lgd = useLgdLocation(lang);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mglRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mapReadyRef = useRef(false);
  const drawnCoordsRef = useRef<LngLat[]>([]);
  const drawModeRef = useRef<DrawMode>("idle");
  const transformModeRef = useRef<TransformMode>("move");
  const uniformRef = useRef(true);
  const markModeRef = useRef(false);
  const lockedRef = useRef(false);
  const layersRef = useRef<LayerVisibility>(layers);
  const caseRef = useRef<LandReportCase | null>(null);
  const overlayUrlRef = useRef<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const edgeMarkersRef = useRef<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const refMarkersRef = useRef<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleMarkersRef = useRef<any[]>([]);
  const draggingHandleRef = useRef(false);
  const workingCornersRef = useRef<Corners | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const navMarkerRef = useRef<any>(null);
  const navTargetRef = useRef<{ lng: number; lat: number; label: string; type: ReferencePoint["type"] } | null>(null);
  const dragRef = useRef<{ active: boolean; start: LngLat; startCorners: Corners; lastCorners: Corners } | null>(null);

  const overlay = caseData?.bhunakshaOverlay;

  /* ── Load / persist case ── */
  useEffect(() => {
    let loaded: LandReportCase | null = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) loaded = JSON.parse(raw) as LandReportCase;
    } catch {
      loaded = null;
    }
    const now = new Date().toISOString();
    const c = loaded ?? createEmptyCase("case-local", now);
    /* eslint-disable react-hooks/set-state-in-effect */
    setCaseData(c);
    if (c.drawnBoundary?.coordinates?.length) {
      setDrawnCoords(c.drawnBoundary.coordinates as LngLat[]);
      setDrawMode("done");
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    caseRef.current = caseData;
    lockedRef.current = !!caseData.bhunakshaOverlay?.locked;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(caseData));
    } catch {
      /* storage blocked — ignore in Phase 1 */
    }
  }, [caseData]);

  useEffect(() => { drawnCoordsRef.current = drawnCoords; }, [drawnCoords]);
  useEffect(() => { drawModeRef.current = drawMode; }, [drawMode]);
  useEffect(() => { transformModeRef.current = transformMode; }, [transformMode]);
  useEffect(() => { uniformRef.current = uniform; }, [uniform]);
  useEffect(() => { markModeRef.current = markMode; }, [markMode]);
  useEffect(() => { layersRef.current = layers; }, [layers]);
  useEffect(() => { navTargetRef.current = navTarget; }, [navTarget]);

  const patchCase = useCallback((patch: Partial<LandReportCase>) => {
    setCaseData((prev) => ({ ...prev, ...patch, updatedAt: new Date().toISOString() }));
  }, []);

  const patchOverlay = useCallback((patch: Partial<BhuNakshaOverlayConfig>) => {
    setCaseData((prev) => {
      if (!prev.bhunakshaOverlay) return prev;
      const now = new Date().toISOString();
      return { ...prev, bhunakshaOverlay: { ...prev.bhunakshaOverlay, ...patch, updatedAt: now }, updatedAt: now };
    });
  }, []);

  /* ── Render helpers (function declarations so init's load callback can use them) ── */
  function renderPlot() {
    const map = mapRef.current;
    if (!map || !mapReadyRef.current) return;
    const coords = drawnCoordsRef.current;
    const show = layersRef.current.boundary;
    if (show && coords.length >= 3 && drawModeRef.current === "done") {
      const ring = [...coords, coords[0]];
      map.getSource("plot")?.setData({ type: "FeatureCollection", features: [{ type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [ring] } }] });
    } else {
      map.getSource("plot")?.setData({ type: "FeatureCollection", features: [] });
    }
    map.getSource("plot-vertices")?.setData({
      type: "FeatureCollection",
      features: show ? coords.map((c) => ({ type: "Feature", properties: {}, geometry: { type: "Point", coordinates: c } })) : [],
    });
  }

  function renderEdgeLabels() {
    const map = mapRef.current;
    const ML = mglRef.current;
    edgeMarkersRef.current.forEach((m) => m.remove());
    edgeMarkersRef.current = [];
    if (!map || !ML || !mapReadyRef.current) return;
    if (!layersRef.current.dimensions || !layersRef.current.boundary) return;
    const coords = drawnCoordsRef.current;
    if (coords.length < 2) return;
    const closed = drawModeRef.current === "done" && coords.length >= 3;
    for (const edge of polygonEdges(coords, closed)) {
      const el = document.createElement("div");
      el.className = "ps-edge-label";
      el.textContent = `${edge.lengthM.toFixed(1)} m`;
      edgeMarkersRef.current.push(new ML.Marker({ element: el, anchor: "center" }).setLngLat(edge.mid).addTo(map));
    }
  }

  function renderRefMarkers(pts: ReferencePoint[]) {
    const map = mapRef.current;
    const ML = mglRef.current;
    refMarkersRef.current.forEach((m) => m.remove());
    refMarkersRef.current = [];
    if (!map || !ML || !mapReadyRef.current || !layersRef.current.refPoints) return;
    for (const p of pts) {
      const el = document.createElement("div");
      el.className = `ps-ref-marker${p.useForOverlayAlignment ? " is-control" : ""}`;
      el.style.backgroundColor = REFERENCE_TYPE_COLORS[p.type];
      el.textContent = p.label?.trim() || "•";
      refMarkersRef.current.push(new ML.Marker({ element: el, anchor: "center" }).setLngLat(p.lngLat).addTo(map));
    }
  }

  function applyCornersLive() {
    const map = mapRef.current;
    const wc = workingCornersRef.current;
    if (!map || !wc) return;
    map.getSource("bhunaksha-src")?.setCoordinates(cornersToCoords(wc));
  }

  function commitCorners() {
    const ov = caseRef.current?.bhunakshaOverlay;
    const c = workingCornersRef.current;
    if (!ov || !c) return;
    const d = deriveParams(c, ov.widthMeters ?? 500, ov.heightMeters ?? 500);
    patchOverlay({
      cornerLngLats: { topLeft: c.topLeft, topRight: c.topRight, bottomRight: c.bottomRight, bottomLeft: c.bottomLeft },
      centerLngLat: d.center,
      rotationDeg: clamp(d.rotationDeg, -180, 180),
      scaleX: clamp(d.scaleX, 0.05, 10),
      scaleY: clamp(d.scaleY, 0.05, 10),
    });
  }

  /* Rebuild the drag handles for the current transform mode. */
  function rebuildHandles() {
    const map = mapRef.current;
    const ML = mglRef.current;
    handleMarkersRef.current.forEach((m) => m.remove());
    handleMarkersRef.current = [];
    if (!map || !ML || !mapReadyRef.current) return;
    const ov = caseRef.current?.bhunakshaOverlay;
    if (!ov?.dataUrl || ov.locked || !ov.visible || !layersRef.current.overlay) return;
    const mode = transformModeRef.current;
    if (mode === "pan" || mode === "move") return; // pan = map; move = drag the image
    const corners = ovToCorners(ov);
    workingCornersRef.current = corners;

    const cornerHandle = (key: keyof Corners) => {
      const el = document.createElement("div");
      el.className = "ps-overlay-handle";
      const m = new ML.Marker({ element: el, draggable: true, anchor: "center" }).setLngLat(corners[key]).addTo(map);
      m.on("dragstart", () => { draggingHandleRef.current = true; });
      m.on("drag", () => {
        const ll = m.getLngLat();
        const wc = workingCornersRef.current;
        if (wc) { workingCornersRef.current = { ...wc, [key]: [ll.lng, ll.lat] }; applyCornersLive(); }
      });
      m.on("dragend", () => { draggingHandleRef.current = false; commitCorners(); });
      return m;
    };

    const edgeHandle = (pair: [keyof Corners, keyof Corners]) => {
      const mid = midpointLngLat(corners[pair[0]], corners[pair[1]]);
      const el = document.createElement("div");
      el.className = "ps-overlay-handle is-edge";
      const m = new ML.Marker({ element: el, draggable: true, anchor: "center" }).setLngLat(mid).addTo(map);
      let last = m.getLngLat();
      m.on("dragstart", () => { draggingHandleRef.current = true; last = m.getLngLat(); });
      m.on("drag", () => {
        const cur = m.getLngLat();
        const dLng = cur.lng - last.lng;
        const dLat = cur.lat - last.lat;
        last = cur;
        const wc = workingCornersRef.current;
        if (!wc) return;
        const next = { ...wc };
        for (const k of pair) next[k] = [wc[k][0] + dLng, wc[k][1] + dLat];
        workingCornersRef.current = next;
        applyCornersLive();
      });
      m.on("dragend", () => { draggingHandleRef.current = false; commitCorners(); });
      return m;
    };

    // Center handle — drag to move the whole overlay (shown in corner & sides).
    const centerHandle = () => {
      const el = document.createElement("div");
      el.className = "ps-overlay-handle is-center";
      const m = new ML.Marker({ element: el, draggable: true, anchor: "center" }).setLngLat(cornersCentroid(corners)).addTo(map);
      let last = m.getLngLat();
      m.on("dragstart", () => { draggingHandleRef.current = true; last = m.getLngLat(); });
      m.on("drag", () => {
        const cur = m.getLngLat();
        const wc = workingCornersRef.current;
        if (wc) { workingCornersRef.current = translateCorners(wc, cur.lng - last.lng, cur.lat - last.lat); applyCornersLive(); }
        last = cur;
      });
      m.on("dragend", () => { draggingHandleRef.current = false; commitCorners(); });
      return m;
    };

    if (mode === "corner") {
      handleMarkersRef.current.push(cornerHandle("topLeft"), cornerHandle("topRight"), cornerHandle("bottomRight"), cornerHandle("bottomLeft"), centerHandle());
    } else if (mode === "sides") {
      handleMarkersRef.current.push(
        edgeHandle(["topLeft", "topRight"]),
        edgeHandle(["topRight", "bottomRight"]),
        edgeHandle(["bottomLeft", "bottomRight"]),
        edgeHandle(["topLeft", "bottomLeft"]),
        centerHandle(),
      );
    } else if (mode === "rotate") {
      const center = cornersCentroid(corners);
      const topMid = midpointLngLat(corners.topLeft, corners.topRight);
      const handlePos: LngLat = [topMid[0] + (topMid[0] - center[0]) * 0.3, topMid[1] + (topMid[1] - center[1]) * 0.3];
      const angleOf = (p: LngLat) => {
        const mPerLng = 111320 * Math.cos((center[1] * Math.PI) / 180) || 111320;
        return -(Math.atan2((p[1] - center[1]) * 111320, (p[0] - center[0]) * mPerLng) * 180) / Math.PI;
      };
      const el = document.createElement("div");
      el.className = "ps-overlay-handle is-rotate";
      const m = new ML.Marker({ element: el, draggable: true, anchor: "center" }).setLngLat(handlePos).addTo(map);
      let start = corners;
      let startAngle = angleOf(handlePos);
      m.on("dragstart", () => { draggingHandleRef.current = true; start = workingCornersRef.current ?? corners; const ll = m.getLngLat(); startAngle = angleOf([ll.lng, ll.lat]); });
      m.on("drag", () => { const ll = m.getLngLat(); const delta = angleOf([ll.lng, ll.lat]) - startAngle; workingCornersRef.current = rotateCornersAround(start, center, delta); applyCornersLive(); });
      m.on("dragend", () => { draggingHandleRef.current = false; commitCorners(); });
      handleMarkersRef.current.push(m);
    }
  }

  /* ── Apply overlay image (rendered from corners) ── */
  const applyOverlay = useCallback((ov: BhuNakshaOverlayConfig | undefined) => {
    const map = mapRef.current;
    if (!map || !mapReadyRef.current) return;
    const SRC = "bhunaksha-src";
    const LYR = "bhunaksha-img";
    if (!ov?.dataUrl) {
      if (map.getLayer(LYR)) map.removeLayer(LYR);
      if (map.getSource(SRC)) map.removeSource(SRC);
      overlayUrlRef.current = null;
      return;
    }
    const coords = cornersToCoords(ovToCorners(ov));
    if (overlayUrlRef.current !== ov.dataUrl || !map.getSource(SRC)) {
      if (map.getLayer(LYR)) map.removeLayer(LYR);
      if (map.getSource(SRC)) map.removeSource(SRC);
      map.addSource(SRC, { type: "image", url: ov.dataUrl, coordinates: coords });
      const before = map.getLayer("plot-vertex-dots") ? "plot-vertex-dots" : undefined;
      map.addLayer({ id: LYR, type: "raster", source: SRC, paint: { "raster-opacity": ov.opacity, "raster-fade-duration": 0 } }, before);
      overlayUrlRef.current = ov.dataUrl;
    } else {
      map.getSource(SRC).setCoordinates(coords);
      map.setPaintProperty(LYR, "raster-opacity", ov.opacity);
    }
    map.setLayoutProperty(LYR, "visibility", ov.visible && layersRef.current.overlay ? "visible" : "none");
  }, []);

  /* ── Map init ── */
  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let map: any;
    async function init() {
      // Guard against StrictMode's dev double-invoke + async race: never create
      // a second map, and bail if the effect was cleaned up during `await`.
      if (mapRef.current || !mapContainerRef.current) return;
      const mgl = await import("maplibre-gl");
      if (cancelled || mapRef.current || !mapContainerRef.current) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ML: any = mgl.default ?? mgl;
      mglRef.current = ML;

      map = new ML.Map({
        container: mapContainerRef.current,
        preserveDrawingBuffer: true,
        style: {
          version: 8,
          sources: {
            "base-satellite": { type: "raster", tiles: [ESRI_IMAGERY], tileSize: 256, maxzoom: 22, attribution: "Imagery © Esri" },
            "base-osm": { type: "raster", tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"], tileSize: 256, maxzoom: 19, attribution: "© OpenStreetMap contributors" },
          },
          layers: [
            { id: "base-satellite", type: "raster", source: "base-satellite", layout: { visibility: "visible" } },
            { id: "base-osm", type: "raster", source: "base-osm", layout: { visibility: "none" } },
          ],
        },
        center: [75.7139, 19.7515],
        zoom: 6.5,
      });
      mapRef.current = map;

      map.on("load", () => {
        mapReadyRef.current = true;
        map.addSource("plot", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
        map.addSource("plot-vertices", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
        map.addLayer({ id: "plot-fill", type: "fill", source: "plot", paint: { "fill-color": "#fb923c", "fill-opacity": 0.3 } });
        map.addLayer({ id: "plot-outline", type: "line", source: "plot", paint: { "line-color": "#dc2626", "line-width": 3 } });
        map.addLayer({ id: "plot-vertex-dots", type: "circle", source: "plot-vertices", paint: { "circle-radius": 5, "circle-color": "#dc2626", "circle-stroke-color": "#fff", "circle-stroke-width": 2 } });

        const updateScale = () => {
          const den = niceScaleDenominator(approxScaleDenominator(map));
          setScaleText(den > 0 ? `1:${den}` : "");
        };
        updateScale();
        setCurrentZoom(map.getZoom());
        map.on("zoom", () => setCurrentZoom(map.getZoom()));
        map.on("zoomend", updateScale);
        map.on("moveend", updateScale);

        renderPlot();
        renderEdgeLabels();
        renderRefMarkers(caseRef.current?.referencePoints ?? []);
        applyOverlay(caseRef.current?.bhunakshaOverlay);
        rebuildHandles();
      });

      map.on("click", (e: { lngLat: { lng: number; lat: number } }) => {
        if (markModeRef.current) {
          const now = new Date().toISOString();
          const pt: ReferencePoint = {
            id: globalThis.crypto?.randomUUID?.() ?? `rp-${Date.now()}`,
            label: "", type: "neighbor_survey", lngLat: [e.lngLat.lng, e.lngLat.lat],
            useForOverlayAlignment: false, createdAt: now, updatedAt: now,
          };
          setCaseData((prev) => ({ ...prev, referencePoints: [...(prev.referencePoints ?? []), pt], updatedAt: now }));
          return;
        }
        if (drawModeRef.current !== "drawing") return;
        setDrawnCoords((prev) => [...prev, [e.lngLat.lng, e.lngLat.lat] as LngLat]);
      });
      map.on("dblclick", (e: { preventDefault: () => void }) => {
        if (drawModeRef.current !== "drawing") return;
        e.preventDefault();
        if (drawnCoordsRef.current.length >= 3) setDrawMode("done");
      });

      // Overlay move-drag (translate corners)
      map.on("mousedown", (e: { lngLat: { lng: number; lat: number } }) => {
        const ov = caseRef.current?.bhunakshaOverlay;
        if (transformModeRef.current !== "move" || !ov?.dataUrl || lockedRef.current) return;
        const start = ovToCorners(ov);
        map.dragPan.disable();
        dragRef.current = { active: true, start: [e.lngLat.lng, e.lngLat.lat], startCorners: start, lastCorners: start };
      });
      map.on("mousemove", (e: { lngLat: { lng: number; lat: number } }) => {
        const d = dragRef.current;
        if (!d?.active) return;
        const nc = translateCorners(d.startCorners, e.lngLat.lng - d.start[0], e.lngLat.lat - d.start[1]);
        d.lastCorners = nc;
        map.getSource("bhunaksha-src")?.setCoordinates(cornersToCoords(nc));
      });
      const endDrag = () => {
        const d = dragRef.current;
        if (d?.active) {
          const c = d.lastCorners;
          patchOverlay({ cornerLngLats: { topLeft: c.topLeft, topRight: c.topRight, bottomRight: c.bottomRight, bottomLeft: c.bottomLeft }, centerLngLat: cornersCentroid(c) });
          dragRef.current = null;
          map.dragPan.enable();
        }
      };
      map.on("mouseup", endDrag);
    }
    init();
    return () => {
      cancelled = true;
      [...edgeMarkersRef.current, ...refMarkersRef.current, ...handleMarkersRef.current].forEach((m) => m.remove());
      edgeMarkersRef.current = []; refMarkersRef.current = []; handleMarkersRef.current = [];
      if (navMarkerRef.current) { navMarkerRef.current.remove(); navMarkerRef.current = null; }
      const live = map ?? mapRef.current;
      if (live) { live.remove(); }
      mapRef.current = null;
      mapReadyRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Base layer switch ── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReadyRef.current) return;
    map.setLayoutProperty("base-satellite", "visibility", baseLayer === "satellite" ? "visible" : "none");
    map.setLayoutProperty("base-osm", "visibility", baseLayer === "osm" ? "visible" : "none");
  }, [baseLayer]);

  useEffect(() => {
    if (!mapReadyRef.current) return;
    renderPlot();
    renderEdgeLabels();
  }, [drawnCoords, drawMode, layers.boundary, layers.dimensions]);

  useEffect(() => {
    if (!mapReadyRef.current) return;
    renderRefMarkers(caseData.referencePoints ?? []);
  }, [caseData.referencePoints, layers.refPoints]);

  useEffect(() => {
    applyOverlay(overlay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overlay, layers.overlay]);

  /* Rebuild handles when overlay / mode / overlay-layer changes (not mid-drag). */
  useEffect(() => {
    if (!mapReadyRef.current || draggingHandleRef.current) return;
    rebuildHandles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overlay, transformMode, layers.overlay]);

  /* Fly to the resolved village/taluka extent + set it as the nav target. */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReadyRef.current || !lgd.extent) return;
    const [minLng, minLat, maxLng, maxLat] = lgd.extent.bbox;
    map.fitBounds([[minLng, minLat], [maxLng, maxLat]], { padding: 60, maxZoom: lgd.extent.villageMatched ? 17 : 13, duration: 1000 });
    const v = lgd.selectedNames().village;
    setNavTarget({ lng: lgd.extent.center[0], lat: lgd.extent.center[1], label: v ? lgd.villageLabel(v) : "", type: "selected_plot" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lgd.extent]);

  /* Show the selected village boundary (below the overlay). */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReadyRef.current) return;
    const SRC = "village-admin", FILL = "village-admin-fill", LINE = "village-admin-line";
    if (map.getLayer(FILL)) map.removeLayer(FILL);
    if (map.getLayer(LINE)) map.removeLayer(LINE);
    if (map.getSource(SRC)) map.removeSource(SRC);
    if (!lgd.boundaryFeature) return;
    map.addSource(SRC, { type: "geojson", data: lgd.boundaryFeature });
    const before = map.getLayer("bhunaksha-img") ? "bhunaksha-img" : map.getLayer("plot-fill") ? "plot-fill" : undefined;
    map.addLayer({ id: FILL, type: "fill", source: SRC, paint: { "fill-color": "#facc15", "fill-opacity": 0.15 } }, before);
    map.addLayer({ id: LINE, type: "line", source: SRC, paint: { "line-color": "#ca8a04", "line-width": 2 } }, before);
  }, [lgd.boundaryFeature]);

  /* Temporary navigation marker for lat/long / Google-link / village center. */
  useEffect(() => {
    const map = mapRef.current;
    const ML = mglRef.current;
    if (!map || !ML || !mapReadyRef.current) return;
    if (navMarkerRef.current) { navMarkerRef.current.remove(); navMarkerRef.current = null; }
    if (!navTarget) return;
    const el = document.createElement("div");
    el.className = "ps-nav-marker";
    navMarkerRef.current = new ML.Marker({ element: el, anchor: "bottom" }).setLngLat([navTarget.lng, navTarget.lat]).addTo(map);
  }, [navTarget]);

  /* ── Boundary derived + persistence ── */
  const plotEdges = useMemo(() => (drawMode === "done" ? polygonEdges(drawnCoords, drawnCoords.length >= 3) : []), [drawnCoords, drawMode]);
  const plotPerimeter = useMemo(() => perimeterMeters(plotEdges), [plotEdges]);
  const plotArea = useMemo(() => (drawMode === "done" ? approxAreaSqMeters(drawnCoords) : 0), [drawnCoords, drawMode]);

  useEffect(() => {
    if (drawMode === "done" && drawnCoords.length >= 3) {
      /* eslint-disable-next-line react-hooks/set-state-in-effect */
      patchCase({ drawnBoundary: { coordinates: drawnCoords, areaSqm: plotArea, perimeterMeters: plotPerimeter, sideLengthsMeters: plotEdges.map((e) => e.lengthM) } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawMode, drawnCoords, plotArea, plotPerimeter]);

  /* ── File upload ── */
  async function onFile(file: File) {
    if (!file || !mapRef.current) return;
    setUploadBusy(true);
    setUploadError(null);
    try {
      const { raster, fileType } = await fileToRaster(file, pageNumber);
      const map = mapRef.current;
      const aspect = raster.widthPx / Math.max(1, raster.heightPx);
      const widthMeters = Math.max(50, viewportWidthMeters(map) * 0.6);
      const heightMeters = widthMeters / aspect;
      const center = map.getCenter();
      const c0: LngLat = [center.lng, center.lat];
      const corners = cornersFromParams(c0, widthMeters, heightMeters, 0);
      const now = new Date().toISOString();
      const config: BhuNakshaOverlayConfig = {
        fileId: globalThis.crypto?.randomUUID?.() ?? `f-${Date.now()}`,
        fileName: file.name,
        fileType,
        pageNumber: fileType === "pdf" ? pageNumber : undefined,
        dataUrl: raster.dataUrl,
        naturalWidthPx: raster.widthPx,
        naturalHeightPx: raster.heightPx,
        visible: true,
        opacity: 0.6,
        rotationDeg: 0,
        scale: 1,
        scaleX: 1,
        scaleY: 1,
        centerLngLat: c0,
        widthMeters,
        heightMeters,
        cornerLngLats: { topLeft: corners.topLeft, topRight: corners.topRight, bottomRight: corners.bottomRight, bottomLeft: corners.bottomLeft },
        transformMode: "move",
        locked: false,
        createdAt: now,
        updatedAt: now,
      };
      patchCase({ bhunakshaOverlay: config, status: "in_review", ...(raster.textPreview ? { adminNote: raster.textPreview } : {}) });
    } catch (err) {
      console.error("[BhuNaksha] file render failed", err);
      setUploadError(T.pdfError[lang]);
    } finally {
      setUploadBusy(false);
    }
  }

  /* ── Numeric / fit handlers ── */
  const rebuildFromParams = useCallback(
    (patch: Partial<BhuNakshaOverlayConfig>, center: LngLat, wEff: number, hEff: number, rot: number) => {
      const corners = cornersFromParams(center, wEff, hEff, rot);
      patchOverlay({ ...patch, cornerLngLats: { topLeft: corners.topLeft, topRight: corners.topRight, bottomRight: corners.bottomRight, bottomLeft: corners.bottomLeft } });
    },
    [patchOverlay],
  );

  const onScaleX = useCallback((v: number) => {
    const ov = caseRef.current?.bhunakshaOverlay;
    if (!ov) return;
    const sx = clamp(v, 0.05, 10);
    const sy = uniformRef.current ? sx : ov.scaleY ?? ov.scale ?? 1;
    const baseW = ov.widthMeters ?? 500;
    const baseH = ov.heightMeters ?? 500;
    rebuildFromParams({ scaleX: sx, scaleY: sy }, ov.centerLngLat, baseW * sx, baseH * sy, ov.rotationDeg);
  }, [rebuildFromParams]);

  const onScaleY = useCallback((v: number) => {
    const ov = caseRef.current?.bhunakshaOverlay;
    if (!ov) return;
    const sy = clamp(v, 0.05, 10);
    const sx = ov.scaleX ?? ov.scale ?? 1;
    const baseW = ov.widthMeters ?? 500;
    const baseH = ov.heightMeters ?? 500;
    rebuildFromParams({ scaleX: sx, scaleY: sy }, ov.centerLngLat, baseW * sx, baseH * sy, ov.rotationDeg);
  }, [rebuildFromParams]);

  const onRotation = useCallback((deg: number) => {
    const ov = caseRef.current?.bhunakshaOverlay;
    if (!ov) return;
    const rot = clamp(deg, -180, 180);
    const sx = ov.scaleX ?? ov.scale ?? 1;
    const sy = ov.scaleY ?? ov.scale ?? 1;
    rebuildFromParams({ rotationDeg: rot }, ov.centerLngLat, (ov.widthMeters ?? 500) * sx, (ov.heightMeters ?? 500) * sy, rot);
  }, [rebuildFromParams]);

  const toggleUniform = useCallback(() => {
    setUniform((u) => {
      const next = !u;
      if (next) {
        const ov = caseRef.current?.bhunakshaOverlay;
        if (ov) {
          const sx = ov.scaleX ?? ov.scale ?? 1;
          rebuildFromParams({ scaleY: sx }, ov.centerLngLat, (ov.widthMeters ?? 500) * sx, (ov.heightMeters ?? 500) * sx, ov.rotationDeg);
        }
      }
      return next;
    });
  }, [rebuildFromParams]);

  const fitMapView = useCallback(() => {
    const map = mapRef.current;
    const ov = caseRef.current?.bhunakshaOverlay;
    if (!map || !ov) return;
    const aspect = (ov.naturalWidthPx ?? 1) / Math.max(1, ov.naturalHeightPx ?? 1);
    const w = Math.max(50, viewportWidthMeters(map) * 0.6);
    const center = map.getCenter();
    rebuildFromParams({ scaleX: 1, scaleY: 1, widthMeters: w, heightMeters: w / aspect }, [center.lng, center.lat], w, w / aspect, ov.rotationDeg);
  }, [rebuildFromParams]);

  const fitBoundary = useCallback(() => {
    const ov = caseRef.current?.bhunakshaOverlay;
    const coords = drawnCoordsRef.current;
    if (!ov || coords.length < 3) return;
    const lngs = coords.map((c) => c[0]);
    const lats = coords.map((c) => c[1]);
    const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats), maxLat = Math.max(...lats);
    const center: LngLat = [(minLng + maxLng) / 2, (minLat + maxLat) / 2];
    const w = Math.max(20, haversineMeters([minLng, center[1]], [maxLng, center[1]]) * 1.1);
    const h = Math.max(20, haversineMeters([center[0], minLat], [center[0], maxLat]) * 1.1);
    rebuildFromParams({ scaleX: 1, scaleY: 1, widthMeters: w, heightMeters: h }, center, w, h, ov.rotationDeg);
  }, [rebuildFromParams]);

  const fitSelectedPlot = useCallback(() => {
    const ov = caseRef.current?.bhunakshaOverlay;
    if (!ov) return;
    const sel = (caseRef.current?.referencePoints ?? []).find((p) => p.type === "selected_plot");
    if (sel) {
      const sx = ov.scaleX ?? ov.scale ?? 1;
      const sy = ov.scaleY ?? ov.scale ?? 1;
      rebuildFromParams({ centerLngLat: sel.lngLat }, sel.lngLat, (ov.widthMeters ?? 500) * sx, (ov.heightMeters ?? 500) * sy, ov.rotationDeg);
    } else {
      fitBoundary();
    }
  }, [rebuildFromParams, fitBoundary]);

  const resetOverlay = useCallback(() => {
    const map = mapRef.current;
    const ov = caseRef.current?.bhunakshaOverlay;
    if (!map || !ov) return;
    const aspect = (ov.naturalWidthPx ?? 1) / Math.max(1, ov.naturalHeightPx ?? 1);
    const w = Math.max(50, viewportWidthMeters(map) * 0.6);
    const center = map.getCenter();
    rebuildFromParams(
      { opacity: 0.6, rotationDeg: 0, scale: 1, scaleX: 1, scaleY: 1, visible: true, locked: false, widthMeters: w, heightMeters: w / aspect },
      [center.lng, center.lat], w, w / aspect, 0,
    );
    setTransformMode("move");
    setUniform(true);
  }, [rebuildFromParams]);

  const setMode = useCallback((m: TransformMode) => {
    setTransformMode(m);
    setMarkMode(false);
    if (drawModeRef.current === "drawing") setDrawMode("idle");
    if (m !== "pan" && caseRef.current?.bhunakshaOverlay) {
      patchOverlay({ transformMode: m === "sides" ? "scale" : m });
    }
  }, [patchOverlay]);

  /* ── Location Navigator handlers ── */
  const upsertRefByLabel = useCallback((label: string, type: ReferencePoint["type"], lng: number, lat: number) => {
    const now = new Date().toISOString();
    setCaseData((prev) => {
      const list = prev.referencePoints ?? [];
      const idx = list.findIndex((p) => p.label === label);
      let next: ReferencePoint[];
      if (idx >= 0) {
        next = list.slice();
        next[idx] = { ...next[idx], lngLat: [lng, lat], type, updatedAt: now };
      } else {
        next = [...list, { id: globalThis.crypto?.randomUUID?.() ?? `rp-${Date.now()}`, label, type, lngLat: [lng, lat], useForOverlayAlignment: false, createdAt: now, updatedAt: now }];
      }
      return { ...prev, referencePoints: next, updatedAt: now };
    });
  }, []);

  const goLatLng = useCallback((lat: number, lng: number) => {
    const map = mapRef.current;
    if (!map) return;
    map.flyTo({ center: [lng, lat], zoom: Math.max(map.getZoom(), 17), duration: 1000 });
    setNavTarget({ lng, lat, label: `${lat.toFixed(6)}, ${lng.toFixed(6)}`, type: "landmark" });
    setGoogleMsg(null);
    upsertRefByLabel(lang === "mr" ? "Lat/Long स्थान" : "Lat/Long location", "landmark", lng, lat);
  }, [upsertRefByLabel, lang]);

  const goGoogle = useCallback(() => {
    const ll = parseLatLngFromGoogleMapsUrl(caseRef.current?.googleMapLink ?? "");
    if (ll) {
      const [lng, lat] = ll;
      mapRef.current?.flyTo({ center: [lng, lat], zoom: 18, duration: 1000 });
      setNavTarget({ lng, lat, label: "Google Map location", type: "landmark" });
      setGoogleMsg(null);
      upsertRefByLabel("Google Map location", "landmark", lng, lat);
    } else {
      setGoogleMsg(lang === "mr" ? "या link मधून lat/long मिळाले नाही. कृपया coordinates paste करा." : "Could not read lat/long from this link. Please paste coordinates.");
    }
  }, [upsertRefByLabel, lang]);

  /* ── Remove file + numeric corner editing ── */
  const removeFile = useCallback(() => {
    if (typeof window !== "undefined" && !window.confirm(T.removeConfirm[lang])) return;
    setCaseData((prev) => ({ ...prev, bhunakshaOverlay: undefined, adminNote: undefined, updatedAt: new Date().toISOString() }));
    setTransformMode("pan");
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [lang]);

  const setCorner = useCallback((key: CornerKey, lngLat: LngLat) => {
    const ov = caseRef.current?.bhunakshaOverlay;
    if (!ov?.cornerLngLats) return;
    const c = { ...ovToCorners(ov), [key]: lngLat };
    const d = deriveParams(c, ov.widthMeters ?? 500, ov.heightMeters ?? 500);
    patchOverlay({
      cornerLngLats: { topLeft: c.topLeft, topRight: c.topRight, bottomRight: c.bottomRight, bottomLeft: c.bottomLeft },
      centerLngLat: d.center, rotationDeg: clamp(d.rotationDeg, -180, 180), scaleX: clamp(d.scaleX, 0.05, 10), scaleY: clamp(d.scaleY, 0.05, 10),
    });
  }, [patchOverlay]);

  const resetCorners = useCallback(() => {
    const ov = caseRef.current?.bhunakshaOverlay;
    if (!ov) return;
    const sx = ov.scaleX ?? ov.scale ?? 1;
    const sy = ov.scaleY ?? ov.scale ?? 1;
    const c = cornersFromParams(ov.centerLngLat, (ov.widthMeters ?? 500) * sx, (ov.heightMeters ?? 500) * sy, ov.rotationDeg);
    patchOverlay({ cornerLngLats: { topLeft: c.topLeft, topRight: c.topRight, bottomRight: c.bottomRight, bottomLeft: c.bottomLeft } });
  }, [patchOverlay]);

  const copyCorners = useCallback(() => {
    const c = caseRef.current?.bhunakshaOverlay?.cornerLngLats;
    if (!c) return;
    const fmt = (p: [number, number]) => `${p[1].toFixed(6)}, ${p[0].toFixed(6)}`;
    try {
      navigator.clipboard.writeText(`TL: ${fmt(c.topLeft)}\nTR: ${fmt(c.topRight)}\nBR: ${fmt(c.bottomRight)}\nBL: ${fmt(c.bottomLeft)}`);
      setCornersCopied(true);
      setTimeout(() => setCornersCopied(false), 1500);
    } catch {
      /* clipboard blocked */
    }
  }, []);

  const zoomIn = useCallback(() => mapRef.current?.zoomIn(), []);
  const zoomOut = useCallback(() => mapRef.current?.zoomOut(), []);
  const resetNorth = useCallback(() => mapRef.current?.resetNorth?.(), []);

  const goVillage = useCallback(() => {
    const map = mapRef.current;
    if (!map || !lgd.extent) return;
    const [a, b, c, d] = lgd.extent.bbox;
    map.fitBounds([[a, b], [c, d]], { padding: 60, maxZoom: lgd.extent.villageMatched ? 17 : 13, duration: 800 });
  }, [lgd.extent]);

  const fitBoundaryMap = useCallback(() => {
    const map = mapRef.current;
    const coords = drawnCoordsRef.current;
    if (!map || coords.length < 2) return;
    const lngs = coords.map((c) => c[0]);
    const lats = coords.map((c) => c[1]);
    map.fitBounds([[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]], { padding: 80, maxZoom: 19, duration: 800 });
  }, []);

  const fitOverlayMap = useCallback(() => {
    const map = mapRef.current;
    const ov = caseRef.current?.bhunakshaOverlay;
    if (!map || !ov?.dataUrl) return;
    const cs = cornersToCoords(ovToCorners(ov));
    const lngs = cs.map((c) => c[0]);
    const lats = cs.map((c) => c[1]);
    map.fitBounds([[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]], { padding: 60, maxZoom: 19, duration: 800 });
  }, []);

  const addNavRefPoint = useCallback(() => {
    const t = navTargetRef.current;
    if (!t) return;
    const now = new Date().toISOString();
    const pt: ReferencePoint = {
      id: globalThis.crypto?.randomUUID?.() ?? `rp-${Date.now()}`,
      label: t.label || "", type: t.type, lngLat: [t.lng, t.lat], useForOverlayAlignment: false, createdAt: now, updatedAt: now,
    };
    setCaseData((prev) => ({ ...prev, referencePoints: [...(prev.referencePoints ?? []), pt], updatedAt: now }));
  }, []);

  /* ── Reference-point handlers ── */
  const updateRefPoint = useCallback((id: string, patch: Partial<ReferencePoint>) => {
    const now = new Date().toISOString();
    setCaseData((prev) => ({ ...prev, referencePoints: (prev.referencePoints ?? []).map((p) => (p.id === id ? { ...p, ...patch, updatedAt: now } : p)), updatedAt: now }));
  }, []);

  const deleteRefPoint = useCallback((id: string) => {
    setCaseData((prev) => ({ ...prev, referencePoints: (prev.referencePoints ?? []).filter((p) => p.id !== id), updatedAt: new Date().toISOString() }));
  }, []);

  const toggleMarkMode = useCallback(() => {
    setMarkMode((m) => !m);
    if (drawModeRef.current === "drawing") setDrawMode("idle");
  }, []);

  const alignFromControlPoints = useCallback(() => {
    const ov = caseRef.current?.bhunakshaOverlay;
    const pts = (caseRef.current?.referencePoints ?? []).filter((p) => p.useForOverlayAlignment);
    if (!ov || pts.length < 2) return;
    const aspect = (ov.naturalWidthPx ?? 1) / Math.max(1, ov.naturalHeightPx ?? 1);
    const sug = suggestOverlayPlacement(pts.map((p) => p.lngLat), aspect);
    if (!sug) return;
    rebuildFromParams(
      { scaleX: 1, scaleY: 1, widthMeters: sug.widthMeters, heightMeters: sug.heightMeters, rotationDeg: sug.rotationDeg, controlPoints: pts.map((p) => ({ id: p.id, mapLngLat: p.lngLat, label: p.label, type: p.type })) },
      sug.center, sug.widthMeters, sug.heightMeters, sug.rotationDeg,
    );
    patchCase({ status: "overlay_done" });
  }, [rebuildFromParams, patchCase]);

  const startDraw = () => { setMarkMode(false); setDrawnCoords([]); setDrawMode("drawing"); };
  const finishDraw = () => { if (drawnCoords.length >= 3) setDrawMode("done"); };
  const clearDraw = () => { setDrawnCoords([]); setDrawMode("idle"); patchCase({ drawnBoundary: undefined }); };

  const takeScreenshot = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    try {
      const a = document.createElement("a");
      a.href = map.getCanvas().toDataURL("image/png");
      a.download = `printshubh-bhunaksha-${Date.now()}.png`;
      a.click();
    } catch (e) {
      console.error("[BhuNaksha] screenshot failed", e);
    }
  }, []);

  const isImagery = baseLayer === "satellite";
  const overlayUsed = !!overlay?.dataUrl;
  const hasBoundary = drawMode === "done" && drawnCoords.length >= 3;
  const hasSelectedPlot = hasBoundary || (caseData.referencePoints ?? []).some((p) => p.type === "selected_plot");

  const MODE_BUTTONS: { mode: TransformMode; label: string; Icon: typeof Move }[] = [
    { mode: "pan", label: T.modePan[lang], Icon: Hand },
    { mode: "move", label: T.modeMove[lang], Icon: Move },
    { mode: "corner", label: T.modeCorner[lang], Icon: Frame },
    { mode: "sides", label: T.modeSides[lang], Icon: MoveHorizontal },
    { mode: "rotate", label: T.modeRotate[lang], Icon: RotateCw },
  ];

  const hint = markMode
    ? T.hintMark[lang]
    : transformMode === "pan"
      ? T.hintPan[lang]
      : transformMode === "move"
        ? T.hintMove[lang]
        : transformMode === "corner"
          ? T.hintCorner[lang]
          : transformMode === "rotate"
            ? T.hintRotate[lang]
            : T.hintSides[lang];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <header className="mb-4 flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-black text-slate-900">{T.title[lang]}</h1>
        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wide text-amber-800">{T.adminBadge[lang]}</span>
        <span className="text-[11px] font-semibold text-slate-400">{FEATURE_NAME[lang === "mr" ? "en" : "mr"]}</span>
        <div className="ml-auto inline-flex overflow-hidden rounded-md border border-slate-300 text-xs font-bold">
          <button type="button" onClick={() => setLang("mr")} className={`px-2.5 py-1 ${lang === "mr" ? "bg-blue-600 text-white" : "bg-white text-slate-700"}`}>मराठी</button>
          <button type="button" onClick={() => setLang("en")} className={`px-2.5 py-1 ${lang === "en" ? "bg-blue-600 text-white" : "bg-white text-slate-700"}`}>EN</button>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        {/* ── Map column ── */}
        <div className="space-y-3">
          {/* Transform toolbar (directly above map) */}
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
            <span className="px-1 text-[11px] font-black uppercase tracking-wide text-slate-400">{T.transform[lang]}</span>
            {MODE_BUTTONS.map(({ mode, label, Icon }) => {
              const overlayMode = mode !== "pan";
              const isDisabled = overlayMode && (!overlayUsed || overlay?.locked);
              const isActive = transformMode === mode && (!overlayMode || (overlayUsed && !overlay?.locked));
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setMode(mode)}
                  disabled={isDisabled}
                  aria-pressed={transformMode === mode}
                  className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[12px] font-bold transition disabled:opacity-40 ${
                    isActive ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="size-3.5" /> {label}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => patchOverlay({ locked: !overlay?.locked })}
              disabled={!overlayUsed}
              aria-pressed={overlay?.locked}
              className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[12px] font-bold transition disabled:opacity-40 ${
                overlay?.locked ? "border-amber-400 bg-amber-50 text-amber-800" : "border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {overlay?.locked ? <Lock className="size-3.5" /> : <Unlock className="size-3.5" />} {T.lock[lang]}
            </button>
            <span className="mx-0.5 h-5 w-px bg-slate-200" aria-hidden="true" />
            <button type="button" onClick={resetOverlay} disabled={!overlayUsed} className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-2.5 py-1.5 text-[12px] font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40">{T.resetBtn[lang]}</button>
            <button type="button" onClick={fitMapView} disabled={!overlayUsed} className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-2.5 py-1.5 text-[12px] font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40">{T.fitMapBtn[lang]}</button>
            <button type="button" onClick={fitBoundary} disabled={!overlayUsed || !hasBoundary} className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-2.5 py-1.5 text-[12px] font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40">{T.fitBoundaryBtn[lang]}</button>
          </div>

          <div className="relative h-[420px] w-full overflow-hidden rounded-xl border border-slate-200 shadow-sm sm:h-[520px] lg:h-[600px]">
            <div ref={mapContainerRef} className="h-full w-full" />

            {/* Draw toolbar */}
            <div className="absolute left-3 top-3 z-10 flex overflow-hidden rounded-lg border border-slate-300 bg-white shadow-md">
              <button type="button" onClick={startDraw} aria-pressed={drawMode === "drawing"} className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold transition ${drawMode === "drawing" ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-slate-50"}`}>
                <Pencil className="size-3.5" /> {T.drawStart[lang]}
              </button>
              <button type="button" onClick={finishDraw} disabled={!(drawMode === "drawing" && drawnCoords.length >= 3)} className="inline-flex items-center gap-1.5 border-l border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:text-slate-300">
                <Check className="size-3.5" /> {T.drawFinish[lang]}
              </button>
              <button type="button" onClick={clearDraw} disabled={drawnCoords.length === 0 && drawMode === "idle"} className="inline-flex items-center gap-1.5 border-l border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:text-slate-300">
                <Eraser className="size-3.5" /> {T.drawClear[lang]}
              </button>
            </div>

            {/* Scale + date badges */}
            <div className="pointer-events-none absolute bottom-3 right-3 z-10 flex flex-col items-end gap-1.5">
              {scaleText && <span className="rounded-full border border-slate-200 bg-white/90 px-2.5 py-1 text-[10px] font-bold text-slate-700 shadow-sm backdrop-blur-sm">{T.approxScale[lang]}: {scaleText}</span>}
              <span className="rounded-full border border-slate-200 bg-white/90 px-2.5 py-1 text-[10px] font-bold text-slate-700 shadow-sm backdrop-blur-sm">
                {isImagery ? `${T.imageryDate[lang]}: ${T.notAvailable[lang]}` : `${T.viewDate[lang]}: ${formatTodayDate()}`}
              </span>
            </div>

            {/* Hint */}
            <div className="pointer-events-none absolute bottom-3 left-3 z-10 max-w-[58%] rounded-md border border-blue-200 bg-white/90 px-3 py-2 text-[11px] font-semibold text-blue-900 shadow-sm backdrop-blur-sm">
              <MapPin className="mr-1 inline size-3.5" /> {hint}
            </div>
          </div>

          {/* Boundary summary */}
          {hasBoundary && (
            <div className="rounded-xl border-2 border-orange-300 bg-orange-50 p-4 text-xs font-semibold text-slate-700">
              <p className="mb-2 text-sm font-black text-orange-900">{T.sideLengths[lang]}</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3">
                {plotEdges.map((e) => (
                  <div key={e.index} className="flex justify-between gap-2">
                    <span className="text-slate-500">{T.side[lang]} {e.index + 1}</span>
                    <span className="font-black text-orange-900">{e.lengthM.toFixed(1)} m</span>
                  </div>
                ))}
              </div>
              <p className="mt-2">{T.area[lang]}: <b className="text-orange-900">{plotArea.toFixed(0)} {lang === "mr" ? "वर्ग मीटर" : "sq.m"}</b> · {T.perimeter[lang]}: <b className="text-orange-900">{plotPerimeter.toFixed(1)} m</b></p>
            </div>
          )}

          <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[11.5px] leading-5 text-amber-900">{OVERLAY_DISCLAIMER[lang]}</p>
        </div>

        {/* ── Panels column ── */}
        <div className="space-y-4 lg:max-h-[84vh] lg:overflow-y-auto lg:pr-1">
          <LocationNavigatorPanel
            lang={lang}
            districts={lgd.districts}
            talukas={lgd.talukas}
            villages={lgd.villages}
            districtId={lgd.districtId}
            talukaId={lgd.talukaId}
            villageId={lgd.villageId}
            selectDistrict={lgd.selectDistrict}
            selectTaluka={lgd.selectTaluka}
            selectVillage={lgd.selectVillage}
            districtLabel={lgd.districtLabel}
            talukaLabel={lgd.talukaLabel}
            villageLabel={lgd.villageLabel}
            extent={lgd.extent}
            currentZoom={currentZoom}
            hasGoogleLink={!!caseData.googleMapLink}
            googleMsg={googleMsg}
            hasBoundary={hasBoundary}
            hasOverlay={overlayUsed}
            canAddRef={!!navTarget}
            onGoLatLng={goLatLng}
            onGoGoogle={goGoogle}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onResetNorth={resetNorth}
            onGoVillage={goVillage}
            onFitBoundary={fitBoundaryMap}
            onFitOverlay={fitOverlayMap}
            onAddRef={addNavRefPoint}
          />

          <LandReportCasePanel value={caseData} onChange={patchCase} lang={lang} onGoGoogle={goGoogle} onGoLatLng={goLatLng} googleMsg={googleMsg} />

          {/* Upload panel */}
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-black text-slate-900"><FileUp className="size-4" /> {T.upload[lang]}</h3>
            <p className="mb-2 flex items-start gap-1.5 rounded-md bg-slate-50 px-2 py-1.5 text-[11px] font-semibold leading-4 text-slate-500"><Info className="mt-0.5 size-3 shrink-0 text-blue-500" /> {T.privacy[lang]}</p>
            <input ref={fileInputRef} type="file" accept="application/pdf,image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }} className="block w-full text-[12px] text-slate-600 file:mr-2 file:rounded-md file:border-0 file:bg-blue-700 file:px-3 file:py-1.5 file:text-[12px] file:font-bold file:text-white hover:file:bg-blue-800" />
            <label className="mt-2 flex items-center gap-2 text-[12px] font-bold text-slate-600">{T.pageNo[lang]}
              <input type="number" min={1} value={pageNumber} onChange={(e) => setPageNumber(Math.max(1, Number(e.target.value) || 1))} className="h-8 w-16 rounded-md border border-slate-300 px-2 text-center text-[13px]" />
            </label>
            {uploadBusy && <p className="mt-2 text-[12px] font-bold text-blue-700">{T.busy[lang]}</p>}
            {uploadError && <p className="mt-2 text-[12px] font-bold text-red-700">{uploadError}</p>}
            {overlay?.dataUrl && (
              <div className="mt-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={overlay.dataUrl} alt={T.preview[lang]} className="max-h-36 w-auto rounded-md border border-slate-200" />
                <p className="mt-1 text-[11px] text-slate-500">{T.fileType[lang]}: <b>{overlay.fileType.toUpperCase()}</b> · {overlay.fileName}</p>
                <button type="button" onClick={removeFile} className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-red-200 px-2.5 py-1.5 text-[12px] font-bold text-red-700 transition hover:bg-red-50">
                  <Trash2 className="size-3.5" /> {T.removeFile[lang]}
                </button>
              </div>
            )}
            <div className="mt-3 grid grid-cols-1 gap-2">
              <label className="block"><span className="mb-1 block text-[12px] font-bold text-slate-600">{T.owner[lang]}</span>
                <input type="text" value={caseData.ownerName ?? ""} onChange={(e) => patchCase({ ownerName: e.target.value })} className="h-8 w-full rounded-md border border-slate-300 px-2 text-[13px]" /></label>
              <label className="block"><span className="mb-1 block text-[12px] font-bold text-slate-600">{T.khata[lang]}</span>
                <input type="text" value={caseData.khataNumber ?? ""} onChange={(e) => patchCase({ khataNumber: e.target.value })} className="h-8 w-full rounded-md border border-slate-300 px-2 text-[13px]" /></label>
              <label className="block"><span className="mb-1 block text-[12px] font-bold text-slate-600">{T.extracted[lang]}</span>
                <textarea readOnly value={caseData.adminNote ?? ""} rows={2} className="w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-[11.5px] text-slate-600" /></label>
            </div>
          </section>

          <OverlayControlsPanel
            lang={lang}
            hasOverlay={overlayUsed}
            locked={overlay?.locked ?? false}
            opacity={overlay?.opacity ?? 0.6}
            scaleX={overlay?.scaleX ?? overlay?.scale ?? 1}
            scaleY={overlay?.scaleY ?? overlay?.scale ?? 1}
            rotationDeg={overlay?.rotationDeg ?? 0}
            uniform={uniform}
            hasBoundary={hasBoundary}
            hasSelectedPlot={hasSelectedPlot}
            onOpacity={(v) => patchOverlay({ opacity: clamp(v, 0.1, 1) })}
            onScaleX={onScaleX}
            onScaleY={onScaleY}
            onRotation={onRotation}
            onToggleUniform={toggleUniform}
            onFitMapView={fitMapView}
            onFitBoundary={fitBoundary}
            onFitSelectedPlot={fitSelectedPlot}
            onReset={resetOverlay}
            onToggleLock={() => patchOverlay({ locked: !overlay?.locked })}
          />

          <OverlayCornersPanel
            lang={lang}
            corners={overlay?.cornerLngLats ?? null}
            onChange={setCorner}
            onCopy={copyCorners}
            onReset={resetCorners}
            copied={cornersCopied}
          />

          <ReferencePointsPanel
            lang={lang}
            points={caseData.referencePoints ?? []}
            markMode={markMode}
            hasOverlay={overlayUsed}
            onToggleMarkMode={toggleMarkMode}
            onUpdate={updateRefPoint}
            onDelete={deleteRefPoint}
            onAlign={alignFromControlPoints}
          />

          {/* Layers panel */}
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 flex items-center gap-1.5 text-sm font-black text-slate-900"><LayersIcon className="size-4" /> {T.layers[lang]}</h3>
            <div className="flex flex-wrap gap-2 text-[12px] font-bold">
              <button type="button" onClick={() => setBaseLayer("satellite")} aria-pressed={baseLayer === "satellite"} className={`rounded-md border px-2.5 py-1.5 ${baseLayer === "satellite" ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 text-slate-700 hover:bg-slate-50"}`}>{T.satellite[lang]}</button>
              <button type="button" onClick={() => setBaseLayer("osm")} aria-pressed={baseLayer === "osm"} className={`rounded-md border px-2.5 py-1.5 ${baseLayer === "osm" ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 text-slate-700 hover:bg-slate-50"}`}>{T.baseMap[lang]}</button>
            </div>
            <div className="mt-2 space-y-1.5 text-[12px] font-semibold text-slate-700">
              <label className="flex items-center gap-2"><input type="checkbox" checked={layers.overlay} onChange={(e) => setLayers((l) => ({ ...l, overlay: e.target.checked }))} className="size-4 accent-blue-600" /> {T.overlayLayer[lang]}</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={layers.boundary} onChange={(e) => setLayers((l) => ({ ...l, boundary: e.target.checked }))} className="size-4 accent-blue-600" /> {T.boundaryLayer[lang]}</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={layers.dimensions} onChange={(e) => setLayers((l) => ({ ...l, dimensions: e.target.checked }))} className="size-4 accent-blue-600" /> {T.dimsLayer[lang]}</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={layers.refPoints} onChange={(e) => setLayers((l) => ({ ...l, refPoints: e.target.checked }))} className="size-4 accent-blue-600" /> {T.refPointsLayer[lang]}</label>
              <label className="flex items-center gap-2 opacity-40"><input type="checkbox" disabled className="size-4" /> {T.notesMarkers[lang]}</label>
            </div>
          </section>

          <ReportOutputPanel lang={lang} value={caseData} overlayUsed={overlayUsed} scaleText={scaleText} onScreenshot={takeScreenshot} onChange={patchCase} />

          <p className="text-[11px] font-semibold text-slate-400">{T.saved[lang]}</p>
        </div>
      </div>
    </div>
  );
}
