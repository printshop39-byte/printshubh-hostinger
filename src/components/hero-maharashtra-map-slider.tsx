"use client";

/**
 * HeroMaharashtraMapSlider — 2-slide Maharashtra map for the hero card.
 *
 * Slide 1: administrative DIVISIONS (6 विभाग)
 * Slide 2: DISTRICTS (35)
 *
 * Data: /public/data/mh-hero-shapes.json — pre-projected SVG path strings
 * (viewBox 360×300) generated offline from the uploaded Maharashtra village
 * GeoJSON (mh1/mh2): villages were dissolved by DISTRICT, then districts
 * grouped into the 6 revenue divisions, simplified, and projected with a
 * Mercator fit. This is original, derived geometry — no Leaflet at runtime,
 * no copyrighted image, no map library shipped to the browser.
 *
 * Style: single light-yellow fill, thin red internal borders, thicker red
 * outer outline, dark-navy labels. Auto-advances every 4s; dot indicators;
 * fully responsive; respects prefers-reduced-motion.
 */

import { useEffect, useMemo, useState } from "react";
import { useLang, type Lang } from "@/components/language-context";

/* ── Style tokens (per spec) ── */
const FILL = "#FEF3C7";      // light yellow (district slide — single fill)
const STROKE_INNER = "#DC2626"; // red internal boundaries
const STROKE_OUTER = "#B91C1C"; // thicker red outer boundary
const LABEL = "#0F172A";        // dark navy

/* Soft, landing-page-friendly pastels — one per विभाग so divisions are easy
 * to tell apart. Deliberately muted (no neon/bright). */
const DIVISION_FILL: Record<string, string> = {
  Konkan: "#dcfce7",                  // light green
  Pune: "#ccfbf1",                    // light mint / teal
  Nashik: "#ffedd5",                  // light orange
  ChhatrapatiSambhajinagar: "#cffafe",// light cyan / blue
  Amravati: "#fce7f3",                // light pink
  Nagpur: "#fef9c3",                  // light yellow
};

interface Shape {
  id: string;
  d: string;
  cx: number;
  cy: number;
}
interface ShapeData {
  W: number;
  H: number;
  divisions: Shape[];
  districts: Shape[];
}

/* English DIVISION id (from the data) → Marathi विभाग label.
 * Strictly "विभाग" — never "मंडळ". */
const DIVISION_LABEL_MR: Record<string, string> = {
  Konkan: "कोकण विभाग",
  Pune: "पुणे विभाग",
  Nashik: "नाशिक विभाग",
  ChhatrapatiSambhajinagar: "छत्रपती संभाजीनगर विभाग",
  Amravati: "अमरावती विभाग",
  Nagpur: "नागपूर विभाग",
};
const DIVISION_LABEL_EN: Record<string, string> = {
  Konkan: "Konkan",
  Pune: "Pune",
  Nashik: "Nashik",
  ChhatrapatiSambhajinagar: "Chh. Sambhajinagar",
  Amravati: "Amravati",
  Nagpur: "Nagpur",
};

/* English DISTRICT id → Marathi name. Only "major" districts get a visible
 * label on the district slide to avoid clutter; the rest still render as
 * shapes. */
const DISTRICT_LABEL_MR: Record<string, string> = {
  Mumbai: "मुंबई",
  Thane: "ठाणे",
  Pune: "पुणे",
  Nasik: "नाशिक",
  Nagpur: "नागपूर",
  Aurangabad: "छ. संभाजीनगर",
  Kolhapur: "कोल्हापूर",
  Solapur: "सोलापूर",
  Amravati: "अमरावती",
  Nanded: "नांदेड",
  Satara: "सातारा",
  Ratnagiri: "रत्नागिरी",
  Ahmadnagar: "अहिल्यानगर",
  Jalgaon: "जळगाव",
  Latur: "लातूर",
};
const DISTRICT_LABEL_EN: Record<string, string> = {
  Mumbai: "Mumbai",
  Thane: "Thane",
  Pune: "Pune",
  Nasik: "Nashik",
  Nagpur: "Nagpur",
  Aurangabad: "Ch. Sambhajinagar",
  Kolhapur: "Kolhapur",
  Solapur: "Solapur",
  Amravati: "Amravati",
  Nanded: "Nanded",
  Satara: "Satara",
  Ratnagiri: "Ratnagiri",
  Ahmadnagar: "Ahilyanagar",
  Jalgaon: "Jalgaon",
  Latur: "Latur",
};

const SLIDE_TITLE: Record<Lang, [string, string]> = {
  mr: ["महाराष्ट्र विभाग नकाशा", "महाराष्ट्र जिल्हा नकाशा"],
  en: ["Maharashtra Division Map", "Maharashtra District Map"],
};

export function HeroMaharashtraMapSlider() {
  const { lang } = useLang();
  const [data, setData] = useState<ShapeData | null>(null);
  const [slide, setSlide] = useState(0);
  const slideCount = 2;

  /* Load the pre-projected shapes once. */
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const r = await fetch("/data/mh-hero-shapes.json");
        if (!r.ok) throw new Error("HTTP " + r.status);
        const json = (await r.json()) as ShapeData;
        if (!cancelled) setData(json);
      } catch (e) {
        console.error("[HeroMap] shapes load failed:", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /* Auto-advance every 4s, unless reduced motion is requested. */
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const id = window.setInterval(() => {
      setSlide((s) => (s + 1) % slideCount);
    }, 4000);
    return () => window.clearInterval(id);
  }, []);

  const titles = SLIDE_TITLE[lang];
  const vb = data ? `0 0 ${data.W} ${data.H}` : "0 0 720 600";

  return (
    <div className="relative flex w-full max-w-full flex-col">
      <div className="relative w-full max-w-full overflow-hidden rounded-2xl border border-white/70 bg-gradient-to-br from-amber-50/40 via-white/50 to-amber-50/30 p-3 sm:p-4">
        {/* slide caption */}
        <span className="absolute left-3 top-3 z-10 rounded-md border border-amber-200 bg-white/85 px-2 py-0.5 text-[10px] font-bold text-slate-700 shadow-sm backdrop-blur-sm sm:text-[11px]">
          {titles[slide]}
        </span>

        {/* sliding track */}
        <div className="w-full overflow-hidden">
          <div
            className="flex w-full transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${slide * 100}%)` }}
          >
            <div className="w-full shrink-0">
              <MapSvg
                viewBox={vb}
                shapes={data?.divisions ?? []}
                labelMap={lang === "mr" ? DIVISION_LABEL_MR : DIVISION_LABEL_EN}
                fillMap={DIVISION_FILL}
                outerWidth={4}
                innerWidth={1.4}
                fontSize={13}
                ariaLabel={titles[0]}
              />
            </div>
            <div className="w-full shrink-0">
              <MapSvg
                viewBox={vb}
                shapes={data?.districts ?? []}
                labelMap={lang === "mr" ? DISTRICT_LABEL_MR : DISTRICT_LABEL_EN}
                outerWidth={4}
                innerWidth={1.1}
                fontSize={11}
                ariaLabel={titles[1]}
              />
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
            aria-label={titles[i]}
            aria-current={slide === i}
            className={`h-2 rounded-full transition-all ${
              slide === i ? "w-5 bg-red-600" : "w-2 bg-slate-300 hover:bg-slate-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function MapSvg({
  viewBox,
  shapes,
  labelMap,
  fillMap,
  outerWidth,
  innerWidth,
  fontSize,
  ariaLabel,
}: {
  viewBox: string;
  shapes: Shape[];
  labelMap: Record<string, string>;
  /** Optional per-id fill (division slide). Falls back to the single yellow. */
  fillMap?: Record<string, string>;
  outerWidth: number;
  innerWidth: number;
  fontSize: number;
  ariaLabel: string;
}) {
  // Combined outline path = union look: we draw every cell filled with the
  // thin inner border, then redraw all cells' outlines once more with the
  // thicker outer stroke and no fill so the silhouette reads as one state.
  const combinedD = useMemo(() => shapes.map((s) => s.d).join(" "), [shapes]);

  return (
    <svg
      viewBox={viewBox}
      className="h-auto w-full"
      role="img"
      aria-label={ariaLabel}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* fills + internal borders */}
      {shapes.map((s) => (
        <path
          key={s.id}
          d={s.d}
          fill={fillMap?.[s.id] ?? FILL}
          stroke={STROKE_INNER}
          strokeWidth={innerWidth}
          strokeLinejoin="round"
        />
      ))}

      {/* thicker red outer outline (drawn over the whole set, no fill) */}
      <path
        d={combinedD}
        fill="none"
        stroke={STROKE_OUTER}
        strokeWidth={outerWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity={0.9}
      />

      {/* labels */}
      {shapes.map((s) => {
        const label = labelMap[s.id];
        if (!label) return null;
        return (
          <text
            key={`l-${s.id}`}
            x={s.cx}
            y={s.cy}
            fontSize={fontSize}
            fontWeight={700}
            fill={LABEL}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}
