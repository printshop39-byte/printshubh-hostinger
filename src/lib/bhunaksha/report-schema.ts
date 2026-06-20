/**
 * BhuNaksha admin — land-report case + overlay config schema, plus the
 * report-draft / WhatsApp / disclaimer builders.
 *
 * This is an ADMIN-ONLY module used inside the protected land-report workflow.
 * Nothing here is rendered on the public site. Owner / Khata / personal land
 * details are admin-only and only appear in the final report when the admin
 * explicitly enables `includeOwnerDetailsInReport`.
 */

import type { Lang } from "@/components/language-context";
import { bearingDistance, lngLatToUTM, quadrantBearing } from "./projection";

/* ── Overlay configuration (saved per case) ─────────────────────────────────── */
export type BhuNakshaOverlayConfig = {
  fileId: string;
  fileName: string;
  fileType: "pdf" | "image";
  pageNumber?: number;

  /** Raster data URL of the (rendered) overlay image. */
  dataUrl?: string;
  /** Natural pixel size of the source image — used to keep aspect ratio. */
  naturalWidthPx?: number;
  naturalHeightPx?: number;

  visible: boolean;
  opacity: number; // 0.1 to 1
  rotationDeg: number; // -180 to 180

  scale: number; // legacy uniform scale (kept for back-compat)
  scaleX?: number; // 0.05 to 10 (non-uniform width)
  scaleY?: number; // 0.05 to 10 (non-uniform height)

  // Manual placement (map-anchored)
  centerLngLat: [number, number];
  widthMeters?: number; // base width before scaleX
  heightMeters?: number; // base height before scaleY

  /**
   * Four rendered corner coordinates (the rendering source of truth). Built
   * from the params above, then freely editable by corner/edge dragging — which
   * is what lets the admin fit irregular plots (skew/perspective-like).
   */
  cornerLngLats?: {
    topLeft: [number, number];
    topRight: [number, number];
    bottomRight: [number, number];
    bottomLeft: [number, number];
  };

  /** Active transform tool: drag-move / corner-drag / edge-stretch / rotate. */
  transformMode?: "move" | "corner" | "scale" | "rotate";

  // Screen/map transform fallback (Phase 1 fallback only — currently unused)
  translateX?: number;
  translateY?: number;

  locked: boolean;

  // ── Control points used to assist manual alignment (Phase 2 prep) ──
  // `mapLngLat` is captured now (admin marks the feature on the live map).
  // `imagePoint` (pixel on the BhuNaksha image) is reserved for Phase 2, where
  // image↔map pairs solve an affine (3 pts) / perspective (4 pts) transform.
  // TODO(phase2): collect imagePoint pairs + solve a full georeference.
  controlPoints?: {
    id: string;
    imagePoint?: [number, number];
    mapLngLat: [number, number];
    label?: string;
    type?: string;
  }[];

  // ── Alignment quality (Priority 2 — multi-reference georeferencing) ──
  /** How the current corners were produced. */
  alignmentMethod?: "manual" | "similarity" | "affine" | "projective";
  /** RMS residual of the control-point fit, in metres (lower = tighter). */
  alignmentRmsMeters?: number;
  /** Derived accuracy score 0–100 (see `accuracyScore`). */
  accuracyScore?: number;

  createdAt: string;
  updatedAt: string;
  createdBy?: string;
};

/* ── Reference / control points (admin marks surrounding survey numbers etc.) ── */
export type ReferencePointType =
  | "selected_plot"
  | "neighbor_survey"
  | "plot_corner"
  | "road_access"
  | "nala_stream"
  | "village_boundary"
  | "landmark"
  | "other";

export type ReferencePoint = {
  id: string;
  label: string;
  type: ReferencePointType;
  lngLat: [number, number];
  useForOverlayAlignment: boolean;
  note?: string;
  createdAt: string;
  updatedAt: string;
};

export const REFERENCE_POINT_TYPES: ReferencePointType[] = [
  "selected_plot",
  "neighbor_survey",
  "plot_corner",
  "road_access",
  "nala_stream",
  "village_boundary",
  "landmark",
  "other",
];

export const REFERENCE_TYPE_LABELS: Record<ReferencePointType, Record<Lang, string>> = {
  selected_plot: { mr: "निवडलेला गट", en: "Selected plot" },
  neighbor_survey: { mr: "शेजारी गट नंबर", en: "Neighbor survey number" },
  plot_corner: { mr: "प्लॉट कोपरा", en: "Plot corner" },
  road_access: { mr: "रस्ता / प्रवेश", en: "Road / access" },
  nala_stream: { mr: "नाला / ओढा", en: "Nala / stream" },
  village_boundary: { mr: "गाव सीमा", en: "Village boundary" },
  landmark: { mr: "ओळख बिंदू", en: "Landmark" },
  other: { mr: "इतर", en: "Other" },
};

/** Map marker colour per reference-point type. */
export const REFERENCE_TYPE_COLORS: Record<ReferencePointType, string> = {
  selected_plot: "#dc2626", // strong red
  neighbor_survey: "#2563eb", // blue
  plot_corner: "#16a34a", // green
  road_access: "#d97706", // amber
  nala_stream: "#0891b2", // cyan
  village_boundary: "#7c3aed", // purple
  landmark: "#db2777", // pink
  other: "#64748b", // slate
};

/* ── Land report case ───────────────────────────────────────────────────────── */
export type LandReportCaseStatus =
  | "new"
  | "in_review"
  | "overlay_done"
  | "report_ready"
  | "sent";

export type LandReportCase = {
  id: string;
  status: LandReportCaseStatus;

  customerName?: string;
  mobile?: string;

  serviceType: string;
  district?: string;
  taluka?: string;
  villageOrCity?: string;
  gatSurveyPlotCts?: string;
  googleMapLink?: string;
  customerNote?: string;

  // Admin-only extracted fields (never shown publicly).
  ownerName?: string;
  khataNumber?: string;
  adminNote?: string;

  bhunakshaOverlay?: BhuNakshaOverlayConfig;

  referencePoints?: ReferencePoint[];

  drawnBoundary?: {
    coordinates: [number, number][];
    areaSqm?: number;
    perimeterMeters?: number;
    sideLengthsMeters?: number[];
  };

  reportNotes?: string;
  includeOwnerDetailsInReport?: boolean;

  baseMapLayer?: string;

  createdAt: string;
  updatedAt: string;
};

/* ── Mandatory accuracy disclaimer ──────────────────────────────────────────── */
export const OVERLAY_DISCLAIMER: Record<Lang, string> = {
  mr: "हा भूनकाशा overlay फक्त अंदाजे संदर्भासाठी आहे. अंतिम जमीन मोजणी, हद्द, मालकी व कायदेशीर पडताळणी अधिकृत सरकारी पोर्टल किंवा संबंधित मोजणी/महसूल विभागाकडून करावी.",
  en: "This BhuNaksha overlay is for approximate reference only. Final land measurement, boundary, ownership and legal verification must be confirmed through the official government portal or the concerned survey/revenue department.",
};

export const FEATURE_NAME: Record<Lang, string> = {
  mr: "भूनकाशा Manual Overlay",
  en: "Manual BhuNaksha Overlay",
};

/** Qualitative accuracy band for a 0–100 alignment score. */
export function accuracyBand(score: number): "high" | "medium" | "low" {
  return score >= 80 ? "high" : score >= 55 ? "medium" : "low";
}

export const ACCURACY_BAND_LABELS: Record<"high" | "medium" | "low", Record<Lang, string>> = {
  high: { mr: "उच्च", en: "High" },
  medium: { mr: "मध्यम", en: "Medium" },
  low: { mr: "कमी", en: "Low" },
};

/** Human-readable accuracy summary, e.g. "82% (High, RMS 1.4 m)". */
export function accuracyText(ov: BhuNakshaOverlayConfig | undefined, lang: Lang): string {
  if (!ov || typeof ov.accuracyScore !== "number") {
    return lang === "mr" ? "अंदाजे (manual)" : "Approximate (manual)";
  }
  const band = ACCURACY_BAND_LABELS[accuracyBand(ov.accuracyScore)][lang];
  const rms = typeof ov.alignmentRmsMeters === "number" ? `, RMS ${ov.alignmentRmsMeters.toFixed(1)} m` : "";
  return `${ov.accuracyScore}% (${band}${rms})`;
}

function line(label: string, value?: string): string {
  return `${label}: ${value && value.trim() ? value.trim() : "—"}`;
}

/** Draft WhatsApp reply for the admin to send to the customer. */
export function buildAdminWhatsAppMessage(c: LandReportCase, lang: Lang): string {
  const aligned = !!c.bhunakshaOverlay?.controlPoints?.length;
  const hasScore = typeof c.bhunakshaOverlay?.accuracyScore === "number";
  if (lang === "mr") {
    return [
      "नमस्कार, आपल्या जमीन/नकाशा संदर्भाची प्राथमिक तपासणी पूर्ण झाली आहे.",
      "",
      line("सेवा", c.serviceType),
      line("जिल्हा", c.district),
      line("तालुका", c.taluka),
      line("गाव / शहर", c.villageOrCity),
      line("गट / सर्वे / Plot / CTS", c.gatSurveyPlotCts),
      "Overlay प्रकार: भूनकाशा Manual Overlay",
      "Scale: अंदाजे",
      ...(hasScore ? [line("Overlay अचूकता", accuracyText(c.bhunakshaOverlay, lang))] : []),
      ...(aligned ? ["Overlay alignment: Control points वापरून अंदाजे align केले."] : []),
      "",
      "टीप: हा अहवाल प्राथमिक संदर्भासाठी आहे. अंतिम पडताळणी अधिकृत सरकारी पोर्टल/मोजणी विभागाकडून करावी.",
    ].join("\n");
  }
  return [
    "Hello, Your land/map reference has been initially reviewed.",
    "",
    line("Service", c.serviceType),
    line("District", c.district),
    line("Taluka", c.taluka),
    line("Village / City", c.villageOrCity),
    line("Gat / Survey / Plot / CTS", c.gatSurveyPlotCts),
    "Overlay type: Manual BhuNaksha Overlay",
    "Scale: Approximate",
    ...(hasScore ? [line("Overlay accuracy", accuracyText(c.bhunakshaOverlay, lang))] : []),
    ...(aligned ? ["Overlay alignment: Approximately aligned using control points."] : []),
    "",
    "Note: This report is for preliminary reference only. Final verification must be done through the official government portal/survey department.",
  ].join("\n");
}

/** Internal land-report draft text. */
export function buildReportDraft(
  c: LandReportCase,
  opts: { overlayUsed: boolean; scaleText?: string; generatedAt: string },
  lang: Lang,
): string {
  const b = c.drawnBoundary;
  const mr = lang === "mr";
  const yes = mr ? "होय" : "Yes";
  const no = mr ? "नाही" : "No";
  const approx = mr ? "अंदाजे" : "Approximate";

  const lines: string[] = [];
  lines.push(mr ? "=== प्राथमिक जमीन अहवाल (PrintShubh) ===" : "=== Preliminary Land Report (PrintShubh) ===");
  lines.push("");
  lines.push(line(mr ? "जिल्हा" : "District", c.district));
  lines.push(line(mr ? "तालुका" : "Taluka", c.taluka));
  lines.push(line(mr ? "गाव / शहर" : "Village / City", c.villageOrCity));
  lines.push(line(mr ? "गट / सर्वे / Plot / CTS" : "Gat / Survey / Plot / CTS", c.gatSurveyPlotCts));
  lines.push(line(mr ? "सेवा" : "Service type", c.serviceType));
  lines.push(line(mr ? "वापरलेला बेस नकाशा" : "Base map layer used", c.baseMapLayer));
  lines.push(`${mr ? "Overlay वापरला" : "Overlay used"}: ${opts.overlayUsed ? yes : no}`);
  lines.push(`${mr ? "Overlay प्रकार" : "Overlay type"}: ${FEATURE_NAME[lang]}`);
  lines.push(`${mr ? "Overlay अचूकता" : "Overlay accuracy"}: ${accuracyText(c.bhunakshaOverlay, lang)}`);
  lines.push(`${mr ? "Scale" : "Scale"}: ${opts.scaleText ? opts.scaleText + " (" + approx + ")" : approx}`);

  // Reference / control points + alignment method
  const refs = c.referencePoints ?? [];
  const selectedPlot = refs.find((r) => r.type === "selected_plot")?.label || c.gatSurveyPlotCts;
  const neighbors = refs.filter((r) => r.type === "neighbor_survey").map((r) => r.label).filter(Boolean);
  const controlPts = refs.filter((r) => r.useForOverlayAlignment);
  const alignedByCp = !!c.bhunakshaOverlay?.controlPoints?.length;
  const gref = refs.find((r) => /google map location/i.test(r.label));
  const corners = c.bhunakshaOverlay?.cornerLngLats;
  const fmtLatLng = (p: [number, number]) => `${p[1].toFixed(6)}, ${p[0].toFixed(6)}`;
  const method = alignedByCp
    ? mr ? "Control-point assisted (Manual overlay)" : "Control-point assisted (manual overlay)"
    : gref
      ? "Manual overlay + Google Map reference"
      : corners
        ? "Manual overlay + corner adjustment"
        : "Manual overlay";
  lines.push(line(mr ? "निवडलेला गट / प्लॉट" : "Selected plot number", selectedPlot));
  if (neighbors.length)
    lines.push(`${mr ? "शेजारी गट नंबर" : "Neighbor survey numbers"}: ${neighbors.join(", ")}`);
  if (gref) lines.push(`${mr ? "Google Map निर्देशांक" : "Google Map coordinates"}: ${fmtLatLng(gref.lngLat)}`);
  lines.push(`${mr ? "Overlay alignment पद्धत" : "Overlay alignment method"}: ${method}`);
  if (controlPts.length) {
    lines.push(mr ? "Control point निर्देशांक:" : "Control point coordinates:");
    controlPts.forEach((p, i) =>
      lines.push(`  ${i + 1}. ${p.label || (mr ? "बिंदू" : "Point")} — ${fmtLatLng(p.lngLat)}`),
    );
  }
  if (corners) {
    lines.push(mr ? "Overlay कोपरे (lat, lng):" : "Overlay corners (lat, lng):");
    lines.push(`  TL ${fmtLatLng(corners.topLeft)} · TR ${fmtLatLng(corners.topRight)}`);
    lines.push(`  BR ${fmtLatLng(corners.bottomRight)} · BL ${fmtLatLng(corners.bottomLeft)}`);
  }

  if (b && b.coordinates.length >= 3) {
    if (typeof b.areaSqm === "number")
      lines.push(`${mr ? "अंदाजे क्षेत्रफळ" : "Approx. area"}: ${b.areaSqm.toFixed(0)} ${mr ? "वर्ग मीटर" : "sq.m"}`);
    if (typeof b.perimeterMeters === "number")
      lines.push(`${mr ? "परिमिती" : "Perimeter"}: ${b.perimeterMeters.toFixed(1)} m`);
    if (b.sideLengthsMeters && b.sideLengthsMeters.length)
      lines.push(
        `${mr ? "बाजूंची लांबी" : "Side lengths"}: ` +
          b.sideLengthsMeters.map((s, i) => `${mr ? "बाजू" : "Side"} ${i + 1}: ${s.toFixed(1)} m`).join(" · "),
      );
  }

  // Owner details are admin-only — included ONLY when explicitly enabled.
  if (c.includeOwnerDetailsInReport) {
    if (c.ownerName) lines.push(line(mr ? "मालक" : "Owner", c.ownerName));
    if (c.khataNumber) lines.push(line(mr ? "खाता नंबर" : "Khata No.", c.khataNumber));
  }

  if (c.reportNotes && c.reportNotes.trim())
    lines.push(line(mr ? "Admin टीप" : "Admin notes", c.reportNotes));

  lines.push(line(mr ? "तयार दिनांक" : "Date generated", opts.generatedAt));
  lines.push("");
  lines.push(OVERLAY_DISCLAIMER[lang]);
  return lines.join("\n");
}

/**
 * Portable overlay-configuration export (Report Builder — "Overlay configuration
 * JSON export"). Captures everything needed to reproduce / re-import the manual
 * alignment EXCEPT the raster `dataUrl` (kept out so the file stays small and
 * carries no embedded image). Owner / Khata personal details are intentionally
 * omitted — this config is a geometry record, not a report.
 */
export function buildOverlayConfigExport(c: LandReportCase, opts: { generatedAt: string }) {
  const ov = c.bhunakshaOverlay;
  return {
    schema: "printshubh.bhunaksha.overlay-config",
    version: 1,
    generatedAt: opts.generatedAt,
    case: {
      id: c.id,
      status: c.status,
      serviceType: c.serviceType,
      district: c.district,
      taluka: c.taluka,
      villageOrCity: c.villageOrCity,
      gatSurveyPlotCts: c.gatSurveyPlotCts,
      googleMapLink: c.googleMapLink,
    },
    baseMapLayer: c.baseMapLayer,
    overlay: ov
      ? {
          fileName: ov.fileName,
          fileType: ov.fileType,
          pageNumber: ov.pageNumber,
          naturalWidthPx: ov.naturalWidthPx,
          naturalHeightPx: ov.naturalHeightPx,
          opacity: ov.opacity,
          rotationDeg: ov.rotationDeg,
          scaleX: ov.scaleX ?? ov.scale,
          scaleY: ov.scaleY ?? ov.scale,
          centerLngLat: ov.centerLngLat,
          widthMeters: ov.widthMeters,
          heightMeters: ov.heightMeters,
          cornerLngLats: ov.cornerLngLats,
          controlPoints: ov.controlPoints ?? [],
        }
      : null,
    drawnBoundary: c.drawnBoundary ?? null,
    referencePoints: (c.referencePoints ?? []).map((p) => ({
      id: p.id,
      label: p.label,
      type: p.type,
      lngLat: p.lngLat,
      useForOverlayAlignment: p.useForOverlayAlignment,
      note: p.note,
    })),
  };
}

/**
 * Standards-compliant GeoJSON FeatureCollection of the case geometry — the
 * drawn plot boundary, all reference / neighbor-survey points, and the overlay
 * footprint. Coordinates are [lng, lat] (WGS84) per the GeoJSON spec. Owner /
 * Khata personal fields are never included.
 */
export function buildGeoJsonExport(c: LandReportCase) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const features: any[] = [];

  if (c.drawnBoundary && c.drawnBoundary.coordinates.length >= 3) {
    const ring = [...c.drawnBoundary.coordinates, c.drawnBoundary.coordinates[0]];
    features.push({
      type: "Feature",
      properties: {
        kind: "plot_boundary",
        gatSurveyPlotCts: c.gatSurveyPlotCts ?? null,
        areaSqm: c.drawnBoundary.areaSqm ?? null,
        perimeterMeters: c.drawnBoundary.perimeterMeters ?? null,
      },
      geometry: { type: "Polygon", coordinates: [ring] },
    });
  }

  const ov = c.bhunakshaOverlay;
  if (ov?.cornerLngLats) {
    const k = ov.cornerLngLats;
    features.push({
      type: "Feature",
      properties: {
        kind: "overlay_footprint",
        fileName: ov.fileName,
        accuracyScore: ov.accuracyScore ?? null,
        alignmentMethod: ov.alignmentMethod ?? null,
      },
      geometry: {
        type: "Polygon",
        coordinates: [[k.topLeft, k.topRight, k.bottomRight, k.bottomLeft, k.topLeft]],
      },
    });
  }

  for (const p of c.referencePoints ?? []) {
    features.push({
      type: "Feature",
      properties: { kind: "reference_point", label: p.label, type: p.type, note: p.note ?? null, useForOverlayAlignment: p.useForOverlayAlignment },
      geometry: { type: "Point", coordinates: p.lngLat },
    });
  }

  return { type: "FeatureCollection", features };
}

/** Minimal HTML escape for report text interpolation. */
function esc(s: string | undefined | null): string {
  return String(s ?? "").replace(/[&<>"]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[m] as string);
}

/**
 * Self-contained printable HTML report (A4) for browser "Save as PDF" — no PDF
 * dependency. Embeds the map screenshot (PNG data URL) inline. Owner / Khata
 * details appear only when `includeOwnerDetailsInReport` is enabled.
 */
export function buildReportHtml(
  c: LandReportCase,
  opts: { screenshotDataUrl?: string; scaleText?: string; generatedAt: string },
  lang: Lang,
): string {
  const mr = lang === "mr";
  const t = (m: string, e: string) => (mr ? m : e);
  const ov = c.bhunakshaOverlay;
  const b = c.drawnBoundary;
  const refs = c.referencePoints ?? [];
  const neighbors = refs.filter((r) => r.type === "neighbor_survey");

  const row = (label: string, value?: string) =>
    `<tr><th>${esc(label)}</th><td>${esc(value && value.trim() ? value : "—")}</td></tr>`;

  const detailRows = [
    row(t("सेवा", "Service"), c.serviceType),
    row(t("जिल्हा", "District"), c.district),
    row(t("तालुका", "Taluka"), c.taluka),
    row(t("गाव / शहर", "Village / City"), c.villageOrCity),
    row(t("गट / सर्वे / Plot / CTS", "Gat / Survey / Plot / CTS"), c.gatSurveyPlotCts),
    row(t("बेस नकाशा", "Base map"), c.baseMapLayer),
    row(t("Overlay प्रकार", "Overlay type"), FEATURE_NAME[lang]),
    row(t("Overlay अचूकता", "Overlay accuracy"), accuracyText(ov, lang)),
    row(t("अंदाजे स्केल", "Approx. scale"), opts.scaleText),
  ].join("");

  const dimRows =
    b && b.coordinates.length >= 3
      ? [
          row(t("अंदाजे क्षेत्रफळ", "Approx. area"), typeof b.areaSqm === "number" ? `${b.areaSqm.toFixed(0)} ${t("वर्ग मीटर", "sq.m")}` : undefined),
          row(t("परिमिती", "Perimeter"), typeof b.perimeterMeters === "number" ? `${b.perimeterMeters.toFixed(1)} m` : undefined),
          row(
            t("बाजूंची लांबी", "Side lengths"),
            (b.sideLengthsMeters ?? []).map((s, i) => `${t("बाजू", "Side")} ${i + 1}: ${s.toFixed(1)} m`).join(" · "),
          ),
        ].join("")
      : "";

  const neighborList = neighbors.length
    ? `<tr><th>${esc(t("शेजारी गट नंबर", "Neighbor survey numbers"))}</th><td>${neighbors.map((n) => esc(n.label || "—")).join(", ")}</td></tr>`
    : "";

  // CAD-style survey traverse: per-node lat/long + UTM, plus bearing & distance
  // to the next node (closed polygon, last → first).
  let nodeSection = "";
  if (b && b.coordinates.length >= 3) {
    const pts = b.coordinates as [number, number][];
    const utm = pts.map(([lng, lat]) => lngLatToUTM(lng, lat));
    const zone = utm[0]?.zone;
    const nodeRows = pts
      .map(([lng, lat], i) => {
        const u = utm[i];
        const next = utm[(i + 1) % utm.length];
        const leg = bearingDistance(u, next);
        return `<tr><td>P${i + 1}</td><td>${lat.toFixed(6)}</td><td>${lng.toFixed(6)}</td><td>${u.easting.toFixed(
          2,
        )}</td><td>${u.northing.toFixed(2)}</td><td>${quadrantBearing(leg.bearingDeg)}</td><td>${leg.distanceM.toFixed(
          2,
        )}</td></tr>`;
      })
      .join("");
    nodeSection =
      `<div class="section">${esc(t("सर्वेक्षण निर्देशांक (UTM)", "Survey coordinates (UTM)"))}` +
      `<span class="muted"> — ${esc(t("झोन", "Zone"))} ${zone}N · WGS84</span></div>` +
      `<table class="nodes"><thead><tr>` +
      `<th>${esc(t("बिंदू", "Node"))}</th><th>Lat</th><th>Long</th>` +
      `<th>${esc(t("पूर्व (m)", "Easting (m)"))}</th><th>${esc(t("उत्तर (m)", "Northing (m)"))}</th>` +
      `<th>${esc(t("दिशा→पुढील", "Bearing→next"))}</th><th>${esc(t("अंतर (m)", "Dist (m)"))}</th>` +
      `</tr></thead><tbody>${nodeRows}</tbody></table>`;
  }

  const ownerRows =
    c.includeOwnerDetailsInReport && (c.ownerName || c.khataNumber)
      ? row(t("मालक", "Owner"), c.ownerName) + row(t("खाता नंबर", "Khata No."), c.khataNumber)
      : "";

  const img = opts.screenshotDataUrl
    ? `<img class="map" src="${opts.screenshotDataUrl}" alt="${esc(t("नकाशा", "Map"))}" />`
    : `<p class="muted">${esc(t("नकाशा स्क्रीनशॉट उपलब्ध नाही.", "Map screenshot not available."))}</p>`;

  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8" />
<title>${esc(t("प्राथमिक जमीन अहवाल", "Preliminary Land Report"))} — ${esc(c.gatSurveyPlotCts || c.id)}</title>
<style>
  @page { size: A4; margin: 14mm; }
  * { box-sizing: border-box; }
  body { font-family: system-ui, "Segoe UI", Arial, sans-serif; color: #0f172a; margin: 0; }
  h1 { font-size: 18px; margin: 0 0 2px; }
  .sub { color: #64748b; font-size: 11px; margin: 0 0 12px; }
  .badge { display:inline-block; background:#fef3c7; color:#92400e; font-size:10px; font-weight:800; padding:2px 8px; border-radius:9999px; text-transform:uppercase; letter-spacing:.04em; }
  table { width: 100%; border-collapse: collapse; margin: 8px 0 14px; }
  th, td { text-align: left; vertical-align: top; padding: 5px 8px; border: 1px solid #e2e8f0; font-size: 12px; }
  th { width: 38%; background: #f8fafc; font-weight: 700; color: #334155; }
  table.nodes th, table.nodes td { width: auto; font-size: 10.5px; padding: 3px 6px; text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; }
  table.nodes th { text-align: right; background: #f1f5f9; }
  table.nodes td:first-child, table.nodes th:first-child { text-align: left; font-weight: 700; }
  .map { width: 100%; max-height: 360px; object-fit: contain; border: 1px solid #cbd5e1; border-radius: 6px; }
  .muted { color:#94a3b8; font-size:12px; }
  .section { font-size: 13px; font-weight: 800; margin: 12px 0 4px; color:#1e293b; }
  .disclaimer { margin-top: 14px; border: 1px solid #fde68a; background: #fffbeb; color: #92400e; font-size: 11px; line-height: 1.5; padding: 8px 10px; border-radius: 6px; }
  .foot { margin-top: 10px; color:#94a3b8; font-size: 10px; }
</style></head>
<body>
  <h1>${esc(t("प्राथमिक जमीन अहवाल — PrintShubh", "Preliminary Land Report — PrintShubh"))} <span class="badge">${esc(t("प्राथमिक", "Preliminary"))}</span></h1>
  <p class="sub">${esc(t("तयार दिनांक", "Generated"))}: ${esc(opts.generatedAt)}</p>
  <div class="section">${esc(t("तपशील", "Details"))}</div>
  <table>${detailRows}${neighborList}${ownerRows}</table>
  ${dimRows ? `<div class="section">${esc(t("सीमा परिमाणे", "Boundary dimensions"))}</div><table>${dimRows}</table>` : ""}
  ${nodeSection}
  <div class="section">${esc(t("नकाशा", "Map"))}</div>
  ${img}
  <div class="disclaimer">${esc(OVERLAY_DISCLAIMER[lang])}</div>
  <p class="foot">PrintShubh.shop — ${esc(t("अंतर्गत प्राथमिक अहवाल", "internal preliminary report"))}</p>
</body></html>`;
}

/** A blank case with sensible defaults. `now` is passed in (caller stamps it). */
export function createEmptyCase(id: string, now: string): LandReportCase {
  return {
    id,
    status: "new",
    serviceType: "",
    includeOwnerDetailsInReport: false,
    createdAt: now,
    updatedAt: now,
  };
}
