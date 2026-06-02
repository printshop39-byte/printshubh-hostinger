"use client";

import { useEffect, useState } from "react";
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
  /* Carousel slide captions */
  slideDivisionTitle: string;
  slideDistrictTitle: string;
  /* Six administrative divisions (विभाग) */
  divKonkan: string;
  divPune: string;
  divNashik: string;
  divSambhajinagar: string;
  divAmravati: string;
  divNagpur: string;
}> = {
  mr: {
    cardLabel: "जमीन कागदपत्र प्रक्रिया",
    cardMH: "MH",
    visualTitle: "महाराष्ट्र जिल्हानुसार जमीन डिजिटल सेवा",
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
    slideDivisionTitle: "महाराष्ट्र विभाग नकाशा",
    slideDistrictTitle: "महाराष्ट्र जिल्हा नकाशा",
    divKonkan: "कोकण विभाग",
    divPune: "पुणे विभाग",
    divNashik: "नाशिक विभाग",
    divSambhajinagar: "छत्रपती संभाजीनगर विभाग",
    divAmravati: "अमरावती विभाग",
    divNagpur: "नागपूर विभाग",
  },
  en: {
    cardLabel: "Land Record Flow",
    cardMH: "MH",
    visualTitle: "Maharashtra district-wise land digital service",
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
    slideDivisionTitle: "Maharashtra Division Map",
    slideDistrictTitle: "Maharashtra District Map",
    divKonkan: "कोकण विभाग",
    divPune: "पुणे विभाग",
    divNashik: "नाशिक विभाग",
    divSambhajinagar: "छत्रपती संभाजीनगर विभाग",
    divAmravati: "अमरावती विभाग",
    divNagpur: "नागपूर विभाग",
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

  /* ── 2-slide carousel: 0 = division map, 1 = district map ──
   * Lightweight — pure React state + a single interval. Auto-advances every
   * 4s. Respects prefers-reduced-motion (no auto-advance, dots still work).
   * No map library; both slides are hand-drawn stylised SVG (not traced
   * from any real/copyrighted map). */
  const slideCount = 2;
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const id = window.setInterval(() => {
      setSlide((s) => (s + 1) % slideCount);
    }, 4000);
    return () => window.clearInterval(id);
  }, []);

  const slideTitles = [tx.slideDivisionTitle, tx.slideDistrictTitle];

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

          {/* ── Map carousel: Slide 1 = divisions, Slide 2 = districts ── */}
          <div className="relative flex flex-1 flex-col">
            <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-2xl border border-white/70 bg-gradient-to-br from-amber-50/40 via-white/50 to-amber-50/30 p-3 sm:p-4">
              {/* caption */}
              <span className="absolute left-3 top-3 z-10 rounded-md border border-amber-200 bg-white/85 px-2 py-0.5 text-[10px] font-bold text-slate-700 shadow-sm backdrop-blur-sm sm:text-[11px]">
                {slideTitles[slide]}
              </span>

              {/* track — translates between the two slides */}
              <div className="w-full max-w-[460px] overflow-hidden">
                <div
                  className="flex w-full transition-transform duration-700 ease-in-out"
                  style={{ transform: `translateX(-${slide * 100}%)` }}
                >
                  <div className="w-full shrink-0">
                    <DivisionMap tx={tx} lang={lang} />
                  </div>
                  <div className="w-full shrink-0">
                    <DistrictMap tx={tx} lang={lang} />
                  </div>
                </div>
              </div>
            </div>

            {/* dot indicators */}
            <div className="mt-3 flex items-center justify-center gap-2">
              {Array.from({ length: slideCount }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSlide(i)}
                  aria-label={`${slideTitles[i]}`}
                  aria-current={slide === i}
                  className={`h-2 rounded-full transition-all ${
                    slide === i ? "w-5 bg-blue-700" : "w-2 bg-slate-300 hover:bg-slate-400"
                  }`}
                />
              ))}
            </div>
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

/* Shared shape of the card-local i18n strings. */
type CardStrings = (typeof t)[Lang];

/* ──────────────────────────────────────────────────────────────────────
 * Slide 1 — Maharashtra DIVISION map (6 administrative विभाग).
 *
 * Original stylised shapes (NOT traced from any real/copyrighted map).
 * Style: single light-yellow state fill, thin red internal boundaries,
 * thicker red outer outline, dark-navy labels.
 * ────────────────────────────────────────────────────────────────────── */
const YELLOW = "#fef3c7";        // light yellow fill
const RED_INNER = "#dc2626";     // internal division/district boundary
const RED_OUTER = "#b91c1c";     // thicker state outline
const NAVY = "#0f172a";          // labels

function DivisionMap({ tx, lang }: { tx: CardStrings; lang: Lang }) {
  /* Six original cells, hand-placed to read as N/W/central/E divisions. */
  const divisions: Array<{ d: string; label: string; lx: number; ly: number }> = [
    // Konkan — west coastal strip
    { d: "M 40 120 L 60 96 L 78 104 L 84 150 L 78 196 L 60 196 L 50 168 Z", label: tx.divKonkan, lx: 50, ly: 152 },
    // Nashik — north-west
    { d: "M 60 96 L 100 72 L 150 70 L 152 110 L 110 120 L 84 116 L 78 104 Z", label: tx.divNashik, lx: 96, ly: 96 },
    // Pune — west-central / south
    { d: "M 78 104 L 84 116 L 110 120 L 152 110 L 158 158 L 134 196 L 100 200 L 84 178 L 84 150 Z", label: tx.divPune, lx: 104, ly: 158 },
    // Chhatrapati Sambhajinagar (Marathwada) — central
    { d: "M 152 110 L 150 70 L 214 66 L 232 104 L 214 150 L 176 156 L 158 158 Z", label: tx.divSambhajinagar, lx: 168, ly: 120 },
    // Amravati — north-east
    { d: "M 214 66 L 268 72 L 300 92 L 290 128 L 250 130 L 232 104 Z", label: tx.divAmravati, lx: 246, ly: 100 },
    // Nagpur — far east
    { d: "M 290 128 L 300 92 L 320 110 L 326 148 L 306 184 L 268 184 L 250 162 L 250 130 Z", label: tx.divNagpur, lx: 282, ly: 156 },
  ];

  return (
    <svg
      viewBox="0 0 360 240"
      className="h-auto w-full"
      role="img"
      aria-label={lang === "mr" ? "महाराष्ट्र विभाग नकाशा" : "Maharashtra division map"}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Division cells — single yellow fill, thin red inner borders */}
      {divisions.map((dv) => (
        <path key={dv.label} d={dv.d} fill={YELLOW} stroke={RED_INNER} strokeWidth="1" strokeLinejoin="round" />
      ))}

      {/* Thicker red outer state outline traced around the union of cells */}
      <path
        d="M 40 120 L 60 96 L 100 72 L 150 70 L 214 66 L 268 72 L 300 92 L 320 110 L 326 148 L 306 184 L 268 184 L 250 162 L 134 196 L 100 200 L 84 178 L 78 196 L 60 196 L 50 168 Z"
        fill="none"
        stroke={RED_OUTER}
        strokeWidth="2.6"
        strokeLinejoin="round"
      />

      {/* Division labels (दार्क navy) — kept compact to avoid clutter */}
      {divisions.map((dv) => (
        <text
          key={`l-${dv.label}`}
          x={dv.lx}
          y={dv.ly}
          fontSize="7"
          fontWeight="700"
          fill={NAVY}
          textAnchor="middle"
        >
          {dv.label}
        </text>
      ))}
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Slide 2 — Maharashtra DISTRICT map (stylised district grid).
 *
 * A readable, non-cluttered grid of original district cells with a few
 * representative names placed where space allows. Same yellow/red/navy
 * style as the division slide.
 * ────────────────────────────────────────────────────────────────────── */
function DistrictMap({ lang }: { tx: CardStrings; lang: Lang }) {
  /* Representative district names (Marathi) placed on a tidy cell grid.
   * Decorative — not a survey trace. A subset is labelled to stay legible. */
  const districts: Array<{ d: string; label?: string; lx?: number; ly?: number }> = [
    { d: "M 44 116 L 70 100 L 80 150 L 66 192 L 50 168 Z", label: "रत्नागिरी", lx: 60, ly: 150 },
    { d: "M 70 100 L 104 80 L 110 118 L 80 150 Z", label: "ठाणे", lx: 90, ly: 110 },
    { d: "M 104 80 L 150 74 L 152 110 L 110 118 Z", label: "नाशिक", lx: 128, ly: 98 },
    { d: "M 80 150 L 110 118 L 152 110 L 150 156 L 120 188 L 90 178 Z", label: "पुणे", lx: 116, ly: 150 },
    { d: "M 90 178 L 120 188 L 132 210 L 100 206 Z", label: "सातारा", lx: 110, ly: 198 },
    { d: "M 150 156 L 152 110 L 196 108 L 200 152 L 172 168 Z", label: "अहिल्यानगर", lx: 176, ly: 138 },
    { d: "M 152 110 L 150 74 L 200 72 L 204 106 L 196 108 Z", label: "जळगाव", lx: 178, ly: 92 },
    { d: "M 196 108 L 204 106 L 244 110 L 240 150 L 200 152 Z", label: "छ. संभाजीनगर", lx: 222, ly: 132 },
    { d: "M 204 106 L 200 72 L 256 74 L 268 104 L 244 110 Z", label: "अमरावती", lx: 232, ly: 92 },
    { d: "M 256 74 L 300 86 L 312 118 L 280 124 L 268 104 Z", label: "अकोला", lx: 286, ly: 104 },
    { d: "M 280 124 L 312 118 L 320 152 L 300 178 L 270 168 L 264 138 Z", label: "नागपूर", lx: 292, ly: 150 },
    { d: "M 240 150 L 244 110 L 268 104 L 264 138 L 270 168 L 244 184 L 218 174 Z", label: "यवतमाळ", lx: 248, ly: 158 },
    { d: "M 200 152 L 240 150 L 218 174 L 188 184 L 172 168 Z", label: "लातूर", lx: 206, ly: 170 },
    { d: "M 120 188 L 150 156 L 172 168 L 188 184 L 160 206 L 132 210 Z", label: "सोलापूर", lx: 156, ly: 192 },
  ];

  return (
    <svg
      viewBox="0 0 360 240"
      className="h-auto w-full"
      role="img"
      aria-label={lang === "mr" ? "महाराष्ट्र जिल्हा नकाशा" : "Maharashtra district map"}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* District cells — yellow fill, thin red inner borders */}
      {districts.map((ds, i) => (
        <path key={i} d={ds.d} fill={YELLOW} stroke={RED_INNER} strokeWidth="0.9" strokeLinejoin="round" />
      ))}

      {/* Thicker red outer state outline */}
      <path
        d="M 44 116 L 70 100 L 104 80 L 150 74 L 200 72 L 256 74 L 300 86 L 312 118 L 320 152 L 300 178 L 270 168 L 244 184 L 160 206 L 132 210 L 100 206 L 66 192 L 50 168 Z"
        fill="none"
        stroke={RED_OUTER}
        strokeWidth="2.6"
        strokeLinejoin="round"
      />

      {/* District names where space allows (navy, compact) */}
      {districts.map((ds, i) =>
        ds.label && ds.lx != null && ds.ly != null ? (
          <text
            key={`l-${i}`}
            x={ds.lx}
            y={ds.ly}
            fontSize="6"
            fontWeight="700"
            fill={NAVY}
            textAnchor="middle"
          >
            {ds.label}
          </text>
        ) : null,
      )}
    </svg>
  );
}
