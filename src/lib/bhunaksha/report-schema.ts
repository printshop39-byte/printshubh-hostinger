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
  opacity: number; // 0 to 1
  rotationDeg: number;
  scale: number; // multiplier applied to width/height meters

  // Manual placement (map-anchored)
  centerLngLat: [number, number];
  widthMeters?: number;
  heightMeters?: number;

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

function line(label: string, value?: string): string {
  return `${label}: ${value && value.trim() ? value.trim() : "—"}`;
}

/** Draft WhatsApp reply for the admin to send to the customer. */
export function buildAdminWhatsAppMessage(c: LandReportCase, lang: Lang): string {
  const aligned = !!c.bhunakshaOverlay?.controlPoints?.length;
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
  lines.push(`${mr ? "Overlay अचूकता" : "Overlay accuracy"}: ${approx}`);
  lines.push(`${mr ? "Scale" : "Scale"}: ${opts.scaleText ? opts.scaleText + " (" + approx + ")" : approx}`);

  // Reference / control points + alignment method
  const refs = c.referencePoints ?? [];
  const selectedPlot = refs.find((r) => r.type === "selected_plot")?.label || c.gatSurveyPlotCts;
  const neighbors = refs.filter((r) => r.type === "neighbor_survey").map((r) => r.label).filter(Boolean);
  const controlPts = refs.filter((r) => r.useForOverlayAlignment);
  const alignedByCp = !!c.bhunakshaOverlay?.controlPoints?.length;
  const method = alignedByCp
    ? mr ? "Control-point assisted (Manual)" : "Control-point assisted (manual)"
    : refs.length
      ? mr ? "Manual + reference points" : "Manual + reference points"
      : "Manual";
  lines.push(line(mr ? "निवडलेला गट / प्लॉट" : "Selected plot number", selectedPlot));
  if (neighbors.length)
    lines.push(`${mr ? "शेजारी गट नंबर" : "Neighbor survey numbers"}: ${neighbors.join(", ")}`);
  lines.push(`${mr ? "Overlay alignment पद्धत" : "Overlay alignment method"}: ${method}`);
  if (controlPts.length) {
    lines.push(mr ? "Control point निर्देशांक:" : "Control point coordinates:");
    controlPts.forEach((p, i) =>
      lines.push(`  ${i + 1}. ${p.label || (mr ? "बिंदू" : "Point")} — ${p.lngLat[1].toFixed(6)}, ${p.lngLat[0].toFixed(6)}`),
    );
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
