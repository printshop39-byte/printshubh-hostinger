"use client";

import { BadgeCheck, Landmark, ScanLine } from "lucide-react";
import { useLang, type Lang } from "@/components/language-context";

/* ── i18n for the illustration card ───────────────────────────────────
 *
 * Card-local strings live here (not in hero-content) so this component
 * can be dropped onto district landing pages later without dragging the
 * full hero copy along. Anything visible inside the card — title,
 * subtitle, region labels, pills, disclaimer, footer chips — sits in
 * this single source of truth. */
const t: Record<Lang, {
  cardLabel: string;
  cardMH: string;
  visualTitle: string;
  visualSubtitle: string;
  pillDistrict: string;
  pillTaluka: string;
  pillVillage: string;
  pillSatbara: string;
  pill8A: string;
  pillFerfar: string;
  visualDisclaimer: string;
  regionWestMH: string;
  regionNorthMH: string;
  regionMarathwada: string;
  regionVidarbha: string;
  regionKonkan: string;
  footerSourceVerify: string;
  footerDocGuidance: string;
  footerMapRef: string;
  highlightPune: string;
  highlightKolhapur: string;
  highlightNashik: string;
}> = {
  mr: {
    cardLabel: "जमीन कागदपत्र प्रक्रिया",
    cardMH: "MH",
    visualTitle: "महाराष्ट्र जिल्हानुसार जमीन सहाय्य",
    visualSubtitle: "जिल्हा → तालुका → गाव निवडा",
    pillDistrict: "जिल्हा",
    pillTaluka: "तालुका",
    pillVillage: "गाव",
    pillSatbara: "7/12",
    pill8A: "8A",
    pillFerfar: "फेरफार",
    visualDisclaimer: "हे दृश्य केवळ संदर्भासाठी आहे.",
    regionWestMH: "प. महाराष्ट्र",
    regionNorthMH: "उत्तर महाराष्ट्र",
    regionMarathwada: "मराठवाडा",
    regionVidarbha: "विदर्भ",
    regionKonkan: "कोकण",
    footerSourceVerify: "स्रोत पडताळणी",
    footerDocGuidance: "दस्तऐवज दिशा",
    footerMapRef: "नकाशा संदर्भ",
    highlightPune: "पुणे",
    highlightKolhapur: "कोल्हापूर",
    highlightNashik: "नाशिक",
  },
  en: {
    cardLabel: "Land Record Flow",
    cardMH: "MH",
    visualTitle: "Maharashtra district-wise land assistance",
    visualSubtitle: "Select district → taluka → village",
    pillDistrict: "जिल्हा",
    pillTaluka: "तालुका",
    pillVillage: "गाव",
    pillSatbara: "7/12",
    pill8A: "8A",
    pillFerfar: "फेरफार",
    visualDisclaimer: "Illustration for reference only.",
    regionWestMH: "W. Maharashtra",
    regionNorthMH: "N. Maharashtra",
    regionMarathwada: "Marathwada",
    regionVidarbha: "Vidarbha",
    regionKonkan: "Konkan",
    footerSourceVerify: "Source Verification",
    footerDocGuidance: "Document Guidance",
    footerMapRef: "Map Reference",
    highlightPune: "Pune",
    highlightKolhapur: "Kolhapur",
    highlightNashik: "Nashik",
  },
};

/**
 * MaharashtraIllustration — decorative, non-cadastral hero visual.
 *
 * What this is:
 *   • A custom-drawn SVG silhouette of Maharashtra with five soft regional
 *     fills (Konkan / North MH / W. MH / Marathwada / Vidarbha) and a
 *     handful of decorative district dots. Three districts are highlighted
 *     with a pulsing ring + label (Pune, Kolhapur, Nashik).
 *   • The card chrome — rounded-3xl, shadow-xl, glass background and a
 *     subtle 3D perspective tilt — gives the visual a raised feel.
 *
 * What this is NOT:
 *   • Not a Survey-of-India trace.
 *   • Not a cadastral or official boundary.
 *   • Not derived from any copyrighted map image.
 *
 * The illustration is intentionally stylised so it stays clearly
 * decorative; the live district / taluka / village picker (MapLibre with
 * real village GeoJSON) lives separately in MapReferenceSection.
 */
export function MaharashtraIllustration() {
  const { lang } = useLang();
  const tx = t[lang];

  /* Highlight points (Pune, Kolhapur, Nashik) — coordinates are
   * decorative, hand-tuned to sit visually inside the matching regions
   * on the stylised outline below. */
  const highlights = [
    { cx: 134, cy: 168, label: tx.highlightPune, anchor: "start" as const, dx: 8, dy: 4 },
    { cx: 116, cy: 196, label: tx.highlightKolhapur, anchor: "start" as const, dx: 8, dy: 4 },
    { cx: 122, cy: 110, label: tx.highlightNashik, anchor: "end" as const, dx: -8, dy: 4 },
  ];

  return (
    <div
      className="relative min-h-[420px] sm:min-h-[480px] lg:min-h-[580px]"
      data-reveal
    >
      <div
        className="relative h-full overflow-hidden rounded-3xl border border-white/60 bg-white/70 shadow-xl shadow-blue-900/15 backdrop-blur-md [transform:perspective(1000px)_rotateY(-2deg)_rotateX(1deg)]"
      >
        {/* Soft blue/green gradient wash */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(219,234,254,0.85),transparent_42%,rgba(220,252,231,0.65))]" />

        <div className="relative z-10 flex h-full flex-col gap-4 p-4 sm:gap-5 sm:p-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                {tx.cardLabel}
              </p>
              <h2 className="mt-1 text-lg font-black leading-snug text-slate-900 sm:text-xl">
                {tx.visualTitle}
              </h2>
              <p className="mt-1 text-xs font-semibold text-slate-600 sm:text-sm">
                {tx.visualSubtitle}
              </p>
            </div>
            <span className="shrink-0 rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-800">
              {tx.cardMH}
            </span>
          </div>

          {/* Floating workflow pills */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {[
              { label: tx.pillDistrict, cls: "border-blue-200 bg-blue-50 text-blue-800" },
              { label: tx.pillTaluka, cls: "border-indigo-200 bg-indigo-50 text-indigo-800" },
              { label: tx.pillVillage, cls: "border-emerald-200 bg-emerald-50 text-emerald-800" },
              { label: tx.pillSatbara, cls: "border-amber-200 bg-amber-50 text-amber-800" },
              { label: tx.pill8A, cls: "border-rose-200 bg-rose-50 text-rose-800" },
              { label: tx.pillFerfar, cls: "border-sky-200 bg-sky-50 text-sky-800" },
            ].map((p) => (
              <span
                key={p.label}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold shadow-sm sm:text-xs ${p.cls}`}
              >
                {p.label}
              </span>
            ))}
          </div>

          {/* District-map style SVG illustration */}
          <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-2xl border border-white/70 bg-gradient-to-br from-blue-50/70 via-white/40 to-emerald-50/70 p-3 sm:p-4">
            <svg
              viewBox="0 0 360 260"
              className="h-auto w-full max-w-[460px]"
              aria-label={
                lang === "mr"
                  ? "महाराष्ट्र जिल्हा-नकाशा शैलीतील दृश्य"
                  : "Maharashtra district-map style illustration"
              }
              role="img"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <pattern id="hero-mh-grid" width="18" height="18" patternUnits="userSpaceOnUse">
                  <path d="M 18 0 L 0 0 0 18" fill="none" stroke="rgba(37,99,235,0.10)" strokeWidth="0.5" />
                </pattern>
                <linearGradient id="hero-mh-fill" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="rgba(219,234,254,0.95)" />
                  <stop offset="100%" stopColor="rgba(220,252,231,0.85)" />
                </linearGradient>
                {/* Pulse animation scoped to this SVG. We animate via a
                    scale transform on the wrapper <g> rather than the
                    SVG `r` attribute so older Safari versions and SVG
                    serialisers handle it cleanly. */}
                <style>
                  {`
                    @keyframes mhPulse {
                      0%   { transform: scale(1);   opacity: 0.7; }
                      70%  { transform: scale(2.6); opacity: 0;   }
                      100% { transform: scale(2.6); opacity: 0;   }
                    }
                    .mh-pulse {
                      transform-box: fill-box;
                      transform-origin: center;
                      animation: mhPulse 2.2s ease-out infinite;
                    }
                    @media (prefers-reduced-motion: reduce) {
                      .mh-pulse { animation: none; opacity: 0.35; }
                    }
                  `}
                </style>
              </defs>

              {/* background grid */}
              <rect width="360" height="260" fill="url(#hero-mh-grid)" />

              {/* Maharashtra outer outline (stylised — not a real boundary) */}
              <path
                d="M 36 132 L 60 92 L 96 70 L 138 64 L 184 60 L 230 64 L 274 76 L 310 96 L 326 130 L 320 162 L 304 192 L 272 214 L 232 224 L 188 226 L 146 222 L 108 210 L 76 188 L 52 162 Z"
                fill="url(#hero-mh-fill)"
                stroke="rgba(37,99,235,0.55)"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />

              {/* Konkan */}
              <path
                d="M 36 132 L 60 92 L 80 100 L 88 138 L 80 178 L 64 178 L 52 162 Z"
                fill="rgba(56,189,248,0.20)"
                stroke="rgba(14,116,144,0.45)"
                strokeWidth="0.9"
              />
              {/* North Maharashtra */}
              <path
                d="M 80 100 L 96 70 L 138 64 L 168 78 L 156 118 L 122 124 L 88 138 Z"
                fill="rgba(167,243,208,0.30)"
                stroke="rgba(5,150,105,0.45)"
                strokeWidth="0.9"
              />
              {/* West Maharashtra (Pune/Kolhapur belt) */}
              <path
                d="M 88 138 L 122 124 L 156 118 L 168 156 L 152 192 L 120 200 L 92 188 L 80 178 Z"
                fill="rgba(191,219,254,0.50)"
                stroke="rgba(37,99,235,0.55)"
                strokeWidth="1.1"
              />
              {/* Marathwada */}
              <path
                d="M 156 118 L 168 78 L 230 64 L 250 96 L 234 138 L 200 148 L 168 156 Z"
                fill="rgba(254,215,170,0.35)"
                stroke="rgba(217,119,6,0.45)"
                strokeWidth="0.9"
              />
              {/* Vidarbha */}
              <path
                d="M 230 64 L 274 76 L 310 96 L 326 130 L 320 162 L 288 178 L 250 170 L 234 138 L 250 96 Z"
                fill="rgba(252,165,165,0.28)"
                stroke="rgba(190,18,60,0.45)"
                strokeWidth="0.9"
              />
              {/* South-east filler */}
              <path
                d="M 168 156 L 200 148 L 234 138 L 250 170 L 232 200 L 200 214 L 168 210 L 152 192 Z"
                fill="rgba(221,214,254,0.30)"
                stroke="rgba(91,33,182,0.40)"
                strokeWidth="0.9"
              />

              {/* Region labels */}
              <text x="64" y="146" fontSize="8" fontWeight="700" fill="#0e7490">{tx.regionKonkan}</text>
              <text x="106" y="96" fontSize="8" fontWeight="700" fill="#047857">{tx.regionNorthMH}</text>
              <text x="100" y="170" fontSize="8.5" fontWeight="800" fill="#1e40af">{tx.regionWestMH}</text>
              <text x="186" y="116" fontSize="8" fontWeight="700" fill="#b45309">{tx.regionMarathwada}</text>
              <text x="262" y="124" fontSize="8" fontWeight="700" fill="#9f1239">{tx.regionVidarbha}</text>

              {/* District dots (decorative) */}
              <g>
                {[
                  { cx: 72, cy: 138 },
                  { cx: 112, cy: 156 },
                  { cx: 148, cy: 102 },
                  { cx: 186, cy: 134 },
                  { cx: 226, cy: 110 },
                  { cx: 270, cy: 132 },
                  { cx: 252, cy: 178 },
                  { cx: 196, cy: 190 },
                  { cx: 132, cy: 188 },
                ].map((d, i) => (
                  <circle
                    key={i}
                    cx={d.cx}
                    cy={d.cy}
                    r="2.4"
                    fill="#2563eb"
                    opacity="0.55"
                  />
                ))}
              </g>

              {/* Highlighted districts — Pune, Kolhapur, Nashik */}
              {highlights.map((h) => (
                <g key={h.label}>
                  <circle
                    className="mh-pulse"
                    cx={h.cx}
                    cy={h.cy}
                    r="5"
                    fill="none"
                    stroke="#16a34a"
                    strokeWidth="1.6"
                  />
                  <circle
                    cx={h.cx}
                    cy={h.cy}
                    r="4.2"
                    fill="#16a34a"
                    stroke="#fff"
                    strokeWidth="1.4"
                  />
                  <text
                    x={h.cx + h.dx}
                    y={h.cy + h.dy}
                    fontSize="8.5"
                    fontWeight="800"
                    fill="#064e3b"
                    textAnchor={h.anchor}
                  >
                    {h.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* Disclaimer */}
          <p className="text-center text-[11px] font-semibold italic text-slate-500 sm:text-xs">
            {tx.visualDisclaimer}
          </p>

          {/* Footer trust strip */}
          <div className="grid gap-2 border-t border-slate-200/70 pt-3 text-xs font-semibold text-slate-600 sm:grid-cols-3 sm:gap-3 sm:pt-4 sm:text-sm">
            <div className="flex items-center gap-2">
              <BadgeCheck className="size-4 shrink-0 text-green-600" />
              <span className="truncate">{tx.footerSourceVerify}</span>
            </div>
            <div className="flex items-center gap-2">
              <Landmark className="size-4 shrink-0 text-blue-700" />
              <span className="truncate">{tx.footerDocGuidance}</span>
            </div>
            <div className="flex items-center gap-2">
              <ScanLine className="size-4 shrink-0 text-sky-600" />
              <span className="truncate">{tx.footerMapRef}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
