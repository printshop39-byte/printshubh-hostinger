"use client";

/**
 * HeroMaharashtraMapSlider — interactive 2-slide Maharashtra map for the hero
 * card.
 *
 * Slide 1: administrative DIVISIONS (6 विभाग), each in a soft pastel.
 * Slide 2: DISTRICTS (35), single light-yellow fill.
 *
 * Data: /public/data/mh-hero-shapes.json — original SVG path strings + label
 * centroids (viewBox 720×600), derived offline from the uploaded Maharashtra
 * village GeoJSON (mh1/mh2): villages dissolved by DISTRICT, districts grouped
 * into the 6 revenue divisions, simplified and Mercator-projected. No Leaflet,
 * no map library at runtime, no copyrighted image, no watermark.
 *
 * Interactivity:
 *  - Click a shape → zoom the SVG viewBox to that shape's bounding box,
 *    highlight it, show its name in a pill, and pause the auto-carousel.
 *  - Reset button ("पूर्ण नकाशा") restores the full-state view.
 *  - Hover (desktop) brightens the fill + strengthens the border.
 *  - Switching slides clears the selection.
 *  - Borders: thin red internal, slightly thicker red outer. Labels dark navy.
 *  - Respects prefers-reduced-motion (no auto-advance).
 */

import { useEffect, useMemo, useState } from "react";
import { useLang, type Lang } from "@/components/language-context";

/* ── Style tokens ── */
const FILL = "#FEF3C7";          // light yellow (district slide single fill)
const FILL_HOVER = "#FDE68A";    // slightly stronger yellow on hover/active
const STROKE_INNER = "#DC2626";  // red internal boundaries
const STROKE_OUTER = "#B91C1C";  // slightly thicker red outer boundary
const LABEL = "#0F172A";         // dark navy

/* Border weights tuned for the 720×600 viewBox (reduced ~35% from before). */
const INNER_W = 1.3;
const INNER_W_ACTIVE = 2.2;
const OUTER_W = 2.3;

/* Soft, landing-page-friendly pastels — one per विभाग. Muted, no neon. */
const DIVISION_FILL: Record<string, string> = {
  Konkan: "#dcfce7",                   // light green
  Pune: "#ccfbf1",                     // light mint / teal
  Nashik: "#ffedd5",                   // light orange
  ChhatrapatiSambhajinagar: "#cffafe", // light cyan / blue
  Amravati: "#fce7f3",                 // light pink
  Nagpur: "#fef9c3",                   // light yellow
};
/* A touch deeper version of each pastel for hover/active. */
const DIVISION_FILL_HOVER: Record<string, string> = {
  Konkan: "#bbf7d0",
  Pune: "#99f6e4",
  Nashik: "#fed7aa",
  ChhatrapatiSambhajinagar: "#a5f3fc",
  Amravati: "#fbcfe8",
  Nagpur: "#fef08a",
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

/* All 35 districts in Marathi (data ids are the older spellings). */
const DISTRICT_LABEL_MR: Record<string, string> = {
  Mumbai: "मुंबई",
  Thane: "ठाणे",
  Palghar: "पालघर",
  Raigad: "रायगड",
  Ratnagiri: "रत्नागिरी",
  Sindhudurg: "सिंधुदुर्ग",
  Pune: "पुणे",
  Satara: "सातारा",
  Sangali: "सांगली",
  Solapur: "सोलापूर",
  Kolhapur: "कोल्हापूर",
  Nasik: "नाशिक",
  Dhule: "धुळे",
  Nandurbar: "नंदुरबार",
  Jalgaon: "जळगाव",
  Ahmadnagar: "अहिल्यानगर",
  Aurangabad: "छ. संभाजीनगर",
  Jalna: "जालना",
  Beed: "बीड",
  Latur: "लातूर",
  Osmanabad: "धाराशिव",
  Nanded: "नांदेड",
  Parbhani: "परभणी",
  Hingoli: "हिंगोली",
  Amravati: "अमरावती",
  Akola: "अकोला",
  Washim: "वाशिम",
  Buldana: "बुलढाणा",
  Yavatmal: "यवतमाळ",
  Nagpur: "नागपूर",
  Wardha: "वर्धा",
  Bhandara: "भंडारा",
  Gondia: "गोंदिया",
  Chandrapur: "चंद्रपूर",
  Gadchiroli: "गडचिरोली",
};
const DISTRICT_LABEL_EN: Record<string, string> = {
  Mumbai: "Mumbai",
  Thane: "Thane",
  Palghar: "Palghar",
  Raigad: "Raigad",
  Ratnagiri: "Ratnagiri",
  Sindhudurg: "Sindhudurg",
  Pune: "Pune",
  Satara: "Satara",
  Sangali: "Sangli",
  Solapur: "Solapur",
  Kolhapur: "Kolhapur",
  Nasik: "Nashik",
  Dhule: "Dhule",
  Nandurbar: "Nandurbar",
  Jalgaon: "Jalgaon",
  Ahmadnagar: "Ahilyanagar",
  Aurangabad: "Ch. Sambhajinagar",
  Jalna: "Jalna",
  Beed: "Beed",
  Latur: "Latur",
  Osmanabad: "Dharashiv",
  Nanded: "Nanded",
  Parbhani: "Parbhani",
  Hingoli: "Hingoli",
  Amravati: "Amravati",
  Akola: "Akola",
  Washim: "Washim",
  Buldana: "Buldhana",
  Yavatmal: "Yavatmal",
  Nagpur: "Nagpur",
  Wardha: "Wardha",
  Bhandara: "Bhandara",
  Gondia: "Gondia",
  Chandrapur: "Chandrapur",
  Gadchiroli: "Gadchiroli",
};

/* On narrow screens we label only the larger / well-known districts to avoid
 * clutter; the rest get a label only when selected (via the pill). */
const DISTRICT_PRIORITY = new Set([
  "Mumbai", "Pune", "Nasik", "Nagpur", "Aurangabad", "Kolhapur", "Solapur",
  "Amravati", "Nanded", "Thane", "Ratnagiri", "Jalgaon", "Ahmadnagar",
  "Latur", "Chandrapur", "Satara",
]);

const SLIDE_TITLE: Record<Lang, [string, string]> = {
  mr: ["महाराष्ट्र विभाग नकाशा", "महाराष्ट्र जिल्हा नकाशा"],
  en: ["Maharashtra Division Map", "Maharashtra District Map"],
};
const RESET_LABEL: Record<Lang, string> = {
  mr: "पूर्ण नकाशा",
  en: "Full map",
};

/* Parse a bounding box [minX, minY, w, h] from an SVG path's M/L coordinates. */
function bboxOf(d: string): [number, number, number, number] {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const re = /[ML](-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(d)) !== null) {
    const x = parseFloat(m[1]);
    const y = parseFloat(m[2]);
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  if (!isFinite(minX)) return [0, 0, 0, 0];
  return [minX, minY, maxX - minX, maxY - minY];
}

export function HeroMaharashtraMapSlider() {
  const { lang } = useLang();
  const [data, setData] = useState<ShapeData | null>(null);
  const [slide, setSlide] = useState(0);
  // Selected shape id, tracked per slide so switching slides clears it.
  const [selected, setSelected] = useState<string | null>(null);
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

  /* Auto-advance every 4s — but PAUSE while a shape is selected/zoomed, and
   * never run under reduced-motion. */
  useEffect(() => {
    if (selected) return;
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
  }, [selected]);

  const titles = SLIDE_TITLE[lang];
  const W = data?.W ?? 720;
  const H = data?.H ?? 600;

  const divisionLabels = lang === "mr" ? DIVISION_LABEL_MR : DIVISION_LABEL_EN;
  const districtLabels = lang === "mr" ? DISTRICT_LABEL_MR : DISTRICT_LABEL_EN;

  const goToSlide = (i: number) => {
    setSelected(null); // switching slides clears the selection
    setSlide(i);
  };
  const handleSelect = (id: string) => {
    setSelected((cur) => (cur === id ? null : id));
  };

  const activeLabels = slide === 0 ? divisionLabels : districtLabels;
  const selectedName = selected ? activeLabels[selected] : null;

  return (
    <div className="relative flex w-full max-w-full flex-col">
      {/* Selection pill + reset, above the map */}
      <div className="mb-2 flex items-center justify-center gap-2">
        <span className="rounded-md border border-amber-200 bg-white/85 px-2.5 py-1 text-[11px] font-bold text-slate-700 shadow-sm sm:text-xs">
          {selectedName ?? titles[slide]}
        </span>
        {selected && (
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-700 transition hover:bg-red-100 sm:text-xs"
          >
            {RESET_LABEL[lang]}
          </button>
        )}
      </div>

      <div className="relative w-full max-w-full overflow-hidden rounded-2xl border border-white/70 bg-gradient-to-br from-amber-50/40 via-white/50 to-amber-50/30 p-3 sm:p-4">
        {/* sliding track */}
        <div className="w-full overflow-hidden">
          <div
            className="flex w-full transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${slide * 100}%)` }}
          >
            <div className="w-full shrink-0">
              <MapSvg
                W={W}
                H={H}
                shapes={data?.divisions ?? []}
                labelMap={divisionLabels}
                fillMap={DIVISION_FILL}
                fillHoverMap={DIVISION_FILL_HOVER}
                fontSize={14}
                active={slide === 0}
                selected={slide === 0 ? selected : null}
                onSelect={handleSelect}
                ariaLabel={titles[0]}
                labelAll
              />
            </div>
            <div className="w-full shrink-0">
              <MapSvg
                W={W}
                H={H}
                shapes={data?.districts ?? []}
                labelMap={districtLabels}
                fontSize={11}
                active={slide === 1}
                selected={slide === 1 ? selected : null}
                onSelect={handleSelect}
                ariaLabel={titles[1]}
                priority={DISTRICT_PRIORITY}
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
            onClick={() => goToSlide(i)}
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
  W,
  H,
  shapes,
  labelMap,
  fillMap,
  fillHoverMap,
  fontSize,
  active,
  selected,
  onSelect,
  ariaLabel,
  labelAll = false,
  priority,
}: {
  W: number;
  H: number;
  shapes: Shape[];
  labelMap: Record<string, string>;
  fillMap?: Record<string, string>;
  fillHoverMap?: Record<string, string>;
  fontSize: number;
  active: boolean;
  selected: string | null;
  onSelect: (id: string) => void;
  ariaLabel: string;
  /** Label every shape (division slide). */
  labelAll?: boolean;
  /** District slide: only label ids in this set unless selected. */
  priority?: Set<string>;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  const combinedD = useMemo(() => shapes.map((s) => s.d).join(" "), [shapes]);

  // Precompute bounding boxes once per shape set.
  const bboxes = useMemo(() => {
    const map: Record<string, [number, number, number, number]> = {};
    for (const s of shapes) map[s.id] = bboxOf(s.d);
    return map;
  }, [shapes]);

  // Zoom the viewBox to the selected shape (with padding), else full state.
  const viewBox = useMemo(() => {
    if (selected && bboxes[selected]) {
      const [x, y, w, h] = bboxes[selected];
      const pad = Math.max(w, h) * 0.35 + 12;
      return `${x - pad} ${y - pad} ${w + pad * 2} ${h + pad * 2}`;
    }
    return `0 0 ${W} ${H}`;
  }, [selected, bboxes, W, H]);

  return (
    <svg
      viewBox={viewBox}
      className="h-auto w-full"
      role="img"
      aria-label={ariaLabel}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* fills + internal borders (interactive) */}
      {shapes.map((s) => {
        const isSel = selected === s.id;
        const isHover = hovered === s.id;
        const baseFill = fillMap?.[s.id] ?? FILL;
        const hoverFill = fillHoverMap?.[s.id] ?? FILL_HOVER;
        const fill = isSel || isHover ? hoverFill : baseFill;
        return (
          <path
            key={s.id}
            d={s.d}
            fill={fill}
            stroke={STROKE_INNER}
            strokeWidth={isSel || isHover ? INNER_W_ACTIVE : INNER_W}
            strokeLinejoin="round"
            tabIndex={active ? 0 : -1}
            role="button"
            aria-label={labelMap[s.id] ?? s.id}
            aria-pressed={isSel}
            style={{ cursor: "pointer", outline: "none" }}
            onClick={() => onSelect(s.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(s.id);
              }
            }}
            onMouseEnter={() => setHovered(s.id)}
            onMouseLeave={() => setHovered((h) => (h === s.id ? null : h))}
          />
        );
      })}

      {/* thicker red outer outline (non-interactive, drawn above fills) */}
      <path
        d={combinedD}
        fill="none"
        stroke={STROKE_OUTER}
        strokeWidth={OUTER_W}
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity={0.9}
        pointerEvents="none"
      />

      {/* labels */}
      {shapes.map((s) => {
        const label = labelMap[s.id];
        if (!label) return null;
        const isSel = selected === s.id;
        // District slide: when nothing is selected, only show priority labels
        // (keeps the map readable). When a shape is selected we zoom in, so we
        // show its label larger and hide the rest.
        if (!labelAll && priority) {
          if (selected) {
            if (!isSel) return null;
          } else if (!priority.has(s.id)) {
            return null;
          }
        }
        return (
          <text
            key={`l-${s.id}`}
            x={s.cx}
            y={s.cy}
            fontSize={isSel ? fontSize * 1.4 : fontSize}
            fontWeight={isSel ? 800 : 700}
            fill={LABEL}
            textAnchor="middle"
            dominantBaseline="middle"
            pointerEvents="none"
            paintOrder="stroke"
            stroke="#ffffff"
            strokeWidth={isSel ? 3 : 2}
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}
