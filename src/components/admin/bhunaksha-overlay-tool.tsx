"use client";

/**
 * Admin — Manual BhuNaksha Overlay tool (Phase 1).
 *
 * Lets an admin upload a BhuNaksha PDF/image, render page 1 to an image,
 * manually place it on a satellite/base map (move / rotate / scale / opacity /
 * lock / reset / fit / z-order), optionally draw the plot boundary (with live
 * dimensions / perimeter / area / approx. scale), and generate a report draft +
 * WhatsApp summary + map screenshot.
 *
 * Phase 1 = MANUAL placement only. The schema + TODOs are ready for Phase 2
 * control-point georeferencing (see overlay-transform.ts / report-schema.ts).
 *
 * No backend exists yet, so the case is persisted to localStorage. This is an
 * admin-only component rendered behind a feature flag / protected route.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Eraser, FileUp, Info, Layers as LayersIcon, MapPin, Pencil } from "lucide-react";
import { useLang } from "@/components/language-context";
import { LandReportCasePanel } from "@/components/admin/land-report-case-panel";
import { OverlayControlsPanel } from "@/components/admin/overlay-controls-panel";
import { ReportOutputPanel } from "@/components/admin/report-output-panel";
import { fileToRaster } from "@/lib/bhunaksha/pdf-to-image";
import {
  approxAreaSqMeters,
  approxScaleDenominator,
  computeImageCorners,
  formatTodayDate,
  niceScaleDenominator,
  perimeterMeters,
  polygonEdges,
  viewportWidthMeters,
  type LngLat,
} from "@/lib/bhunaksha/overlay-transform";
import {
  createEmptyCase,
  FEATURE_NAME,
  OVERLAY_DISCLAIMER,
  type BhuNakshaOverlayConfig,
  type LandReportCase,
} from "@/lib/bhunaksha/report-schema";

const STORAGE_KEY = "printshubh_admin_bhunaksha_case_v1";

type BaseLayer = "satellite" | "osm";
type DrawMode = "idle" | "drawing" | "done";

interface LayerVisibility {
  overlay: boolean;
  boundary: boolean;
  dimensions: boolean;
}

const ESRI_IMAGERY =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

const T = {
  title: { mr: "भूनकाशा Manual Overlay", en: "Manual BhuNaksha Overlay" },
  adminBadge: { mr: "फक्त admin", en: "Admin only" },
  upload: { mr: "भूनकाशा अपलोड", en: "BhuNaksha Upload" },
  chooseFile: { mr: "PDF / image निवडा", en: "Choose PDF / image" },
  fileType: { mr: "फाइल प्रकार", en: "File type" },
  pageNo: { mr: "पृष्ठ क्रमांक (PDF)", en: "Page number (PDF)" },
  preview: { mr: "Preview", en: "Preview" },
  extracted: { mr: "Extract केलेला मजकूर (admin)", en: "Extracted text (admin)" },
  owner: { mr: "मालक नाव (admin)", en: "Owner name (admin)" },
  khata: { mr: "खाता / Survey No (admin)", en: "Khata / Survey No (admin)" },
  adminNote: { mr: "Admin टीप", en: "Admin note" },
  privacy: {
    mr: "मालक नाव, खाता व वैयक्तिक तपशील फक्त admin साठी. अहवालात समाविष्ट करायचे असल्यासच चालू करा.",
    en: "Owner name, Khata and personal details are admin-only. Include in the report only if explicitly enabled.",
  },
  busy: { mr: "फाइल वाचत आहे...", en: "Reading file..." },
  pdfError: {
    mr: "PDF render होऊ शकले नाही. कृपया त्याऐवजी image (screenshot) अपलोड करा.",
    en: "Could not render the PDF. Please upload an image (screenshot) instead.",
  },
  layers: { mr: "नकाशा थर", en: "Map Layers" },
  satellite: { mr: "सॅटेलाइट", en: "Satellite" },
  baseMap: { mr: "बेस नकाशा (OSM)", en: "Base map (OSM)" },
  overlayLayer: { mr: "भूनकाशा overlay", en: "BhuNaksha overlay" },
  boundaryLayer: { mr: "निवडलेली प्लॉट सीमा", en: "Selected plot boundary" },
  dimsLayer: { mr: "सीमा परिमाणे", en: "Boundary dimensions" },
  surveyLabels: { mr: "Survey / Gat labels (Phase 2)", en: "Survey / Gat labels (Phase 2)" },
  notesMarkers: { mr: "Notes / Markers (Phase 2)", en: "Notes / Markers (Phase 2)" },
  drawStart: { mr: "प्लॉट सीमा मार्क करा", en: "Mark plot boundary" },
  drawFinish: { mr: "पूर्ण करा", en: "Finish" },
  drawClear: { mr: "साफ करा", en: "Clear" },
  drawHint: {
    mr: "✏️ दाबा, नकाशावर points क्लिक करा, double-click ने पूर्ण करा.",
    en: "Tap ✏️, click points on the map, double-click to finish.",
  },
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

  // Initialized synchronously (deterministic for SSR/hydration); the load
  // effect below replaces it with the persisted case on the client. Keeping it
  // non-null means the map container is always mounted, so the map can init.
  const [caseData, setCaseData] = useState<LandReportCase>(() =>
    createEmptyCase("case-local", ""),
  );
  const [baseLayer, setBaseLayer] = useState<BaseLayer>("satellite");
  const [drawMode, setDrawMode] = useState<DrawMode>("idle");
  const [drawnCoords, setDrawnCoords] = useState<LngLat[]>([]);
  const [moveMode, setMoveMode] = useState(false);
  const [layers, setLayers] = useState<LayerVisibility>({ overlay: true, boundary: true, dimensions: true });
  const [scaleText, setScaleText] = useState("");
  const [uploadBusy, setUploadBusy] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mglRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapReadyRef = useRef(false);
  const drawnCoordsRef = useRef<LngLat[]>([]);
  const drawModeRef = useRef<DrawMode>("idle");
  const moveModeRef = useRef(false);
  const lockedRef = useRef(false);
  const layersRef = useRef<LayerVisibility>(layers);
  const caseRef = useRef<LandReportCase | null>(null);
  const overlayUrlRef = useRef<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const edgeMarkersRef = useRef<any[]>([]);
  const dragRef = useRef<{ active: boolean; start: LngLat; startCenter: LngLat; last: LngLat } | null>(null);

  const overlay = caseData?.bhunakshaOverlay;

  /* ── Load / persist case (localStorage placeholder for a real backend) ── */
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
    /* Intentional load-on-mount hydration from localStorage (client-only). */
    /* eslint-disable react-hooks/set-state-in-effect */
    setCaseData(c);
    if (c.drawnBoundary?.coordinates?.length) {
      setDrawnCoords(c.drawnBoundary.coordinates as LngLat[]);
      setDrawMode("done");
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (!caseData) return;
    caseRef.current = caseData;
    lockedRef.current = !!caseData.bhunakshaOverlay?.locked;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(caseData));
    } catch {
      /* storage full / blocked — ignore in Phase 1 */
    }
  }, [caseData]);

  useEffect(() => { drawnCoordsRef.current = drawnCoords; }, [drawnCoords]);
  useEffect(() => { drawModeRef.current = drawMode; }, [drawMode]);
  useEffect(() => { moveModeRef.current = moveMode; }, [moveMode]);
  useEffect(() => { layersRef.current = layers; }, [layers]);

  const patchCase = useCallback((patch: Partial<LandReportCase>) => {
    setCaseData((prev) => (prev ? { ...prev, ...patch, updatedAt: new Date().toISOString() } : prev));
  }, []);

  const patchOverlay = useCallback((patch: Partial<BhuNakshaOverlayConfig>) => {
    setCaseData((prev) => {
      if (!prev?.bhunakshaOverlay) return prev;
      return {
        ...prev,
        bhunakshaOverlay: { ...prev.bhunakshaOverlay, ...patch, updatedAt: new Date().toISOString() },
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  /* ── Map init ───────────────────────────────────────────────────────── */
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let map: any;
    async function init() {
      if (!mapContainerRef.current) return;
      const mgl = await import("maplibre-gl");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ML: any = mgl.default ?? mgl;
      mglRef.current = ML;

      map = new ML.Map({
        container: mapContainerRef.current,
        preserveDrawingBuffer: true, // needed for screenshot toDataURL
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
        map.addLayer({ id: "plot-fill", type: "fill", source: "plot", paint: { "fill-color": "#fb923c", "fill-opacity": 0.35 } });
        map.addLayer({ id: "plot-outline", type: "line", source: "plot", paint: { "line-color": "#dc2626", "line-width": 3 } });
        map.addLayer({ id: "plot-vertex-dots", type: "circle", source: "plot-vertices", paint: { "circle-radius": 5, "circle-color": "#dc2626", "circle-stroke-color": "#fff", "circle-stroke-width": 2 } });

        const updateScale = () => {
          const den = niceScaleDenominator(approxScaleDenominator(map));
          setScaleText(den > 0 ? `1:${den}` : "");
        };
        updateScale();
        map.on("zoomend", updateScale);
        map.on("moveend", updateScale);

        renderPlot();
        renderEdgeLabels();
        applyOverlay(caseRef.current?.bhunakshaOverlay);
      });

      // Boundary drawing
      map.on("click", (e: { lngLat: { lng: number; lat: number } }) => {
        if (drawModeRef.current !== "drawing") return;
        setDrawnCoords((prev) => [...prev, [e.lngLat.lng, e.lngLat.lat] as LngLat]);
      });
      map.on("dblclick", (e: { preventDefault: () => void }) => {
        if (drawModeRef.current !== "drawing") return;
        e.preventDefault();
        if (drawnCoordsRef.current.length >= 3) setDrawMode("done");
      });

      // Overlay move-drag
      map.on("mousedown", (e: { lngLat: { lng: number; lat: number } }) => {
        const ov = caseRef.current?.bhunakshaOverlay;
        if (!moveModeRef.current || !ov?.dataUrl || lockedRef.current) return;
        map.dragPan.disable();
        dragRef.current = {
          active: true,
          start: [e.lngLat.lng, e.lngLat.lat],
          startCenter: [...ov.centerLngLat] as LngLat,
          last: [...ov.centerLngLat] as LngLat,
        };
      });
      map.on("mousemove", (e: { lngLat: { lng: number; lat: number } }) => {
        const d = dragRef.current;
        const ov = caseRef.current?.bhunakshaOverlay;
        if (!d?.active || !ov) return;
        const next: LngLat = [d.startCenter[0] + (e.lngLat.lng - d.start[0]), d.startCenter[1] + (e.lngLat.lat - d.start[1])];
        d.last = next;
        const src = map.getSource("bhunaksha-src");
        if (src) {
          const w = (ov.widthMeters ?? 500) * ov.scale;
          const h = (ov.heightMeters ?? 500) * ov.scale;
          src.setCoordinates(computeImageCorners(next, w, h, ov.rotationDeg));
        }
      });
      const endDrag = () => {
        const d = dragRef.current;
        if (d?.active) {
          patchOverlay({ centerLngLat: d.last });
          dragRef.current = null;
          map.dragPan.enable();
        }
      };
      map.on("mouseup", endDrag);

      // Base layer visibility on init reflects state
    }
    init();
    return () => {
      edgeMarkersRef.current.forEach((m) => m.remove());
      edgeMarkersRef.current = [];
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        mapReadyRef.current = false;
      }
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

  /* ── Plot + edge labels ── */
  function renderPlot() {
    const map = mapRef.current;
    if (!map || !mapReadyRef.current) return;
    const coords = drawnCoordsRef.current;
    const showBoundary = layersRef.current.boundary;
    if (showBoundary && coords.length >= 3 && drawModeRef.current === "done") {
      const ring = [...coords, coords[0]];
      map.getSource("plot")?.setData({ type: "FeatureCollection", features: [{ type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [ring] } }] });
    } else {
      map.getSource("plot")?.setData({ type: "FeatureCollection", features: [] });
    }
    map.getSource("plot-vertices")?.setData({
      type: "FeatureCollection",
      features: showBoundary ? coords.map((c) => ({ type: "Feature", properties: {}, geometry: { type: "Point", coordinates: c } })) : [],
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

  useEffect(() => {
    if (!mapReadyRef.current) return;
    renderPlot();
    renderEdgeLabels();
  }, [drawnCoords, drawMode, layers.boundary, layers.dimensions]);

  /* ── Apply overlay image source ── */
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
    const w = (ov.widthMeters ?? 500) * ov.scale;
    const h = (ov.heightMeters ?? 500) * ov.scale;
    const corners = computeImageCorners(ov.centerLngLat, w, h, ov.rotationDeg);
    if (overlayUrlRef.current !== ov.dataUrl || !map.getSource(SRC)) {
      if (map.getLayer(LYR)) map.removeLayer(LYR);
      if (map.getSource(SRC)) map.removeSource(SRC);
      map.addSource(SRC, { type: "image", url: ov.dataUrl, coordinates: corners });
      const before = map.getLayer("plot-vertex-dots") ? "plot-vertex-dots" : undefined;
      map.addLayer({ id: LYR, type: "raster", source: SRC, paint: { "raster-opacity": ov.opacity, "raster-fade-duration": 0 } }, before);
      overlayUrlRef.current = ov.dataUrl;
    } else {
      map.getSource(SRC).setCoordinates(corners);
      map.setPaintProperty(LYR, "raster-opacity", ov.opacity);
    }
    map.setLayoutProperty(LYR, "visibility", ov.visible && layersRef.current.overlay ? "visible" : "none");
  }, []);

  useEffect(() => {
    applyOverlay(overlay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overlay, layers.overlay]);

  /* ── Persist drawn boundary into the case (for the report) ── */
  const plotEdges = useMemo(
    () => (drawMode === "done" ? polygonEdges(drawnCoords, drawnCoords.length >= 3) : []),
    [drawnCoords, drawMode],
  );
  const plotPerimeter = useMemo(() => perimeterMeters(plotEdges), [plotEdges]);
  const plotArea = useMemo(() => (drawMode === "done" ? approxAreaSqMeters(drawnCoords) : 0), [drawnCoords, drawMode]);

  useEffect(() => {
    if (!caseData) return;
    if (drawMode === "done" && drawnCoords.length >= 3) {
      /* eslint-disable-next-line react-hooks/set-state-in-effect */
      patchCase({
        drawnBoundary: {
          coordinates: drawnCoords,
          areaSqm: plotArea,
          perimeterMeters: plotPerimeter,
          sideLengthsMeters: plotEdges.map((e) => e.lengthM),
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawMode, drawnCoords, plotArea, plotPerimeter]);

  /* ── File upload → raster → overlay config ── */
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
        centerLngLat: [center.lng, center.lat],
        widthMeters,
        heightMeters,
        locked: false,
        createdAt: now,
        updatedAt: now,
      };
      patchCase({ bhunakshaOverlay: config, status: "in_review" });
      if (raster.textPreview) patchCase({ adminNote: raster.textPreview });
    } catch (err) {
      console.error("[BhuNaksha] file render failed", err);
      setUploadError(T.pdfError[lang]);
    } finally {
      setUploadBusy(false);
    }
  }

  /* ── Overlay control handlers ── */
  const fitToView = useCallback(() => {
    const map = mapRef.current;
    const ov = caseRef.current?.bhunakshaOverlay;
    if (!map || !ov) return;
    const aspect = (ov.naturalWidthPx ?? 1) / Math.max(1, ov.naturalHeightPx ?? 1);
    const widthMeters = Math.max(50, viewportWidthMeters(map) * 0.6);
    const center = map.getCenter();
    patchOverlay({ widthMeters, heightMeters: widthMeters / aspect, scale: 1, centerLngLat: [center.lng, center.lat] });
  }, [patchOverlay]);

  const resetOverlay = useCallback(() => {
    const map = mapRef.current;
    const ov = caseRef.current?.bhunakshaOverlay;
    if (!map || !ov) return;
    const aspect = (ov.naturalWidthPx ?? 1) / Math.max(1, ov.naturalHeightPx ?? 1);
    const widthMeters = Math.max(50, viewportWidthMeters(map) * 0.6);
    const center = map.getCenter();
    patchOverlay({ opacity: 0.6, rotationDeg: 0, scale: 1, visible: true, locked: false, widthMeters, heightMeters: widthMeters / aspect, centerLngLat: [center.lng, center.lat] });
    setMoveMode(false);
  }, [patchOverlay]);

  const bringOverlay = useCallback((above: boolean) => {
    const map = mapRef.current;
    if (!map || !map.getLayer("bhunaksha-img")) return;
    if (above) map.moveLayer("bhunaksha-img"); // to top
    else if (map.getLayer("plot-fill")) map.moveLayer("bhunaksha-img", "plot-fill"); // below boundary
  }, []);

  const startDraw = () => { setMoveMode(false); setDrawnCoords([]); setDrawMode("drawing"); };
  const finishDraw = () => { if (drawnCoords.length >= 3) setDrawMode("done"); };
  const clearDraw = () => { setDrawnCoords([]); setDrawMode("idle"); patchCase({ drawnBoundary: undefined }); };

  const takeScreenshot = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    try {
      const url = map.getCanvas().toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `printshubh-bhunaksha-${Date.now()}.png`;
      a.click();
    } catch (e) {
      console.error("[BhuNaksha] screenshot failed", e);
    }
  }, []);

  const isImagery = baseLayer === "satellite";
  const overlayUsed = !!overlay?.dataUrl;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <header className="mb-4 flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-black text-slate-900">{T.title[lang]}</h1>
        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wide text-amber-800">
          {T.adminBadge[lang]}
        </span>
        <span className="text-[11px] font-semibold text-slate-400">{FEATURE_NAME[lang === "mr" ? "en" : "mr"]}</span>
        <div className="ml-auto inline-flex overflow-hidden rounded-md border border-slate-300 text-xs font-bold">
          <button type="button" onClick={() => setLang("mr")} className={`px-2.5 py-1 ${lang === "mr" ? "bg-blue-600 text-white" : "bg-white text-slate-700"}`}>मराठी</button>
          <button type="button" onClick={() => setLang("en")} className={`px-2.5 py-1 ${lang === "en" ? "bg-blue-600 text-white" : "bg-white text-slate-700"}`}>EN</button>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        {/* ── Map column ── */}
        <div className="space-y-3">
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
              {scaleText && (
                <span className="rounded-full border border-slate-200 bg-white/90 px-2.5 py-1 text-[10px] font-bold text-slate-700 shadow-sm backdrop-blur-sm">
                  {T.approxScale[lang]}: {scaleText}
                </span>
              )}
              <span className="rounded-full border border-slate-200 bg-white/90 px-2.5 py-1 text-[10px] font-bold text-slate-700 shadow-sm backdrop-blur-sm">
                {isImagery ? `${T.imageryDate[lang]}: ${T.notAvailable[lang]}` : `${T.viewDate[lang]}: ${formatTodayDate()}`}
              </span>
            </div>

            {/* Hint */}
            <div className="pointer-events-none absolute bottom-3 left-3 z-10 max-w-[58%] rounded-md border border-blue-200 bg-white/90 px-3 py-2 text-[11px] font-semibold text-blue-900 shadow-sm backdrop-blur-sm">
              <MapPin className="mr-1 inline size-3.5" />
              {moveMode ? (lang === "mr" ? "Overlay drag करा." : "Drag to move the overlay.") : T.drawHint[lang]}
            </div>
          </div>

          {/* Boundary summary */}
          {drawMode === "done" && drawnCoords.length >= 3 && (
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

          <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[11.5px] leading-5 text-amber-900">
            {OVERLAY_DISCLAIMER[lang]}
          </p>
        </div>

        {/* ── Panels column ── */}
        <div className="space-y-4 lg:max-h-[82vh] lg:overflow-y-auto lg:pr-1">
          <LandReportCasePanel value={caseData} onChange={patchCase} lang={lang} />

          {/* B. Upload panel */}
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-black text-slate-900">
              <FileUp className="size-4" /> {T.upload[lang]}
            </h3>
            <p className="mb-2 flex items-start gap-1.5 rounded-md bg-slate-50 px-2 py-1.5 text-[11px] font-semibold leading-4 text-slate-500">
              <Info className="mt-0.5 size-3 shrink-0 text-blue-500" /> {T.privacy[lang]}
            </p>
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="application/pdf,image/*"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }}
                className="block w-full text-[12px] text-slate-600 file:mr-2 file:rounded-md file:border-0 file:bg-blue-700 file:px-3 file:py-1.5 file:text-[12px] file:font-bold file:text-white hover:file:bg-blue-800"
              />
            </div>
            <label className="mt-2 flex items-center gap-2 text-[12px] font-bold text-slate-600">
              {T.pageNo[lang]}
              <input type="number" min={1} value={pageNumber} onChange={(e) => setPageNumber(Math.max(1, Number(e.target.value) || 1))} className="h-8 w-16 rounded-md border border-slate-300 px-2 text-center text-[13px]" />
            </label>
            {uploadBusy && <p className="mt-2 text-[12px] font-bold text-blue-700">{T.busy[lang]}</p>}
            {uploadError && <p className="mt-2 text-[12px] font-bold text-red-700">{uploadError}</p>}
            {overlay?.dataUrl && (
              <div className="mt-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={overlay.dataUrl} alt={T.preview[lang]} className="max-h-36 w-auto rounded-md border border-slate-200" />
                <p className="mt-1 text-[11px] text-slate-500">
                  {T.fileType[lang]}: <b>{overlay.fileType.toUpperCase()}</b> · {overlay.fileName}
                </p>
              </div>
            )}
            <div className="mt-3 grid grid-cols-1 gap-2">
              <label className="block">
                <span className="mb-1 block text-[12px] font-bold text-slate-600">{T.owner[lang]}</span>
                <input type="text" value={caseData.ownerName ?? ""} onChange={(e) => patchCase({ ownerName: e.target.value })} className="h-8 w-full rounded-md border border-slate-300 px-2 text-[13px]" />
              </label>
              <label className="block">
                <span className="mb-1 block text-[12px] font-bold text-slate-600">{T.khata[lang]}</span>
                <input type="text" value={caseData.khataNumber ?? ""} onChange={(e) => patchCase({ khataNumber: e.target.value })} className="h-8 w-full rounded-md border border-slate-300 px-2 text-[13px]" />
              </label>
              <label className="block">
                <span className="mb-1 block text-[12px] font-bold text-slate-600">{T.extracted[lang]}</span>
                <textarea readOnly value={caseData.adminNote ?? ""} rows={2} className="w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-[11.5px] text-slate-600" />
              </label>
            </div>
          </section>

          <OverlayControlsPanel
            lang={lang}
            hasOverlay={overlayUsed}
            visible={overlay?.visible ?? true}
            opacity={overlay?.opacity ?? 0.6}
            rotationDeg={overlay?.rotationDeg ?? 0}
            scale={overlay?.scale ?? 1}
            locked={overlay?.locked ?? false}
            moveMode={moveMode}
            onToggleVisible={() => patchOverlay({ visible: !overlay?.visible })}
            onOpacity={(v) => patchOverlay({ opacity: v })}
            onSetRotation={(deg) => patchOverlay({ rotationDeg: deg })}
            onScale={(v) => patchOverlay({ scale: v })}
            onToggleLock={() => patchOverlay({ locked: !overlay?.locked })}
            onToggleMove={() => setMoveMode((m) => !m)}
            onReset={resetOverlay}
            onFit={fitToView}
            onBringAbove={() => bringOverlay(true)}
            onBringBelow={() => bringOverlay(false)}
          />

          {/* D. Layers panel */}
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 flex items-center gap-1.5 text-sm font-black text-slate-900">
              <LayersIcon className="size-4" /> {T.layers[lang]}
            </h3>
            <div className="flex flex-wrap gap-2 text-[12px] font-bold">
              <button type="button" onClick={() => setBaseLayer("satellite")} aria-pressed={baseLayer === "satellite"} className={`rounded-md border px-2.5 py-1.5 ${baseLayer === "satellite" ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 text-slate-700 hover:bg-slate-50"}`}>{T.satellite[lang]}</button>
              <button type="button" onClick={() => setBaseLayer("osm")} aria-pressed={baseLayer === "osm"} className={`rounded-md border px-2.5 py-1.5 ${baseLayer === "osm" ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 text-slate-700 hover:bg-slate-50"}`}>{T.baseMap[lang]}</button>
            </div>
            <div className="mt-2 space-y-1.5 text-[12px] font-semibold text-slate-700">
              <label className="flex items-center gap-2"><input type="checkbox" checked={layers.overlay} onChange={(e) => setLayers((l) => ({ ...l, overlay: e.target.checked }))} className="size-4 accent-blue-600" /> {T.overlayLayer[lang]}</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={layers.boundary} onChange={(e) => setLayers((l) => ({ ...l, boundary: e.target.checked }))} className="size-4 accent-blue-600" /> {T.boundaryLayer[lang]}</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={layers.dimensions} onChange={(e) => setLayers((l) => ({ ...l, dimensions: e.target.checked }))} className="size-4 accent-blue-600" /> {T.dimsLayer[lang]}</label>
              <label className="flex items-center gap-2 opacity-40"><input type="checkbox" disabled className="size-4" /> {T.surveyLabels[lang]}</label>
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
