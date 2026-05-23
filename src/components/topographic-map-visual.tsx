"use client";

/**
 * TopographicMapVisual
 * ─────────────────────────────────────────────────────────────────────────────
 * Original GIS-inspired map panel — no Three.js, no external textures, no
 * runtime dependencies that can fail.  100% pure React + inline SVG.
 *
 * Visual language: Bhuvan / ArcGIS topographic style
 *   • Off-white terrain base with soft blue/green wash
 *   • Subtle contour rings and grid lines
 *   • Maharashtra filled polygon (simplified original path)
 *   • India reference silhouette (simplified)
 *   • Animated route line: भारत → महाराष्ट्र → जिल्हा
 *   • Clickable district markers with pulse animation
 *   • Tooltip card showing selected district / taluka / village
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useState } from "react";
import { useLang } from "@/components/language-context";

/* ── District configuration ─────────────────────────────────────────────── */
export type TopoDistrictKey = "Pune" | "Nashik" | "Nagpur" | "Kolhapur" | "Mumbai";

interface DistrictPin {
  id: TopoDistrictKey;
  label: string;
  /** SVG viewBox coords (0–400 × 0–440) */
  cx: number;
  cy: number;
  color: string;
}

const DISTRICT_PINS: DistrictPin[] = [
  { id: "Mumbai",   label: "मुंबई",    cx: 88,  cy: 148, color: "#1d4ed8" },
  { id: "Nashik",   label: "नाशिक",   cx: 142, cy: 112, color: "#0369a1" },
  { id: "Pune",     label: "पुणे",    cx: 158, cy: 215, color: "#1e40af" },
  { id: "Kolhapur", label: "कोल्हापूर", cx: 128, cy: 308, color: "#0c4a6e" },
  { id: "Nagpur",   label: "नागपूर",  cx: 308, cy: 118, color: "#1e3a8a" },
];

const DISTRICT_LABELS_EN: Record<TopoDistrictKey, string> = {
  Mumbai:   "Mumbai",
  Nashik:   "Nashik",
  Pune:     "Pune",
  Kolhapur: "Kolhapur",
  Nagpur:   "Nagpur",
};

/* ── Maharashtra SVG path (original simplified outline, not copied) ──────── */
// Handcrafted approximate Maharashtra silhouette — clockwise from NW corner
// viewBox 0 0 400 440
const MH_PATH =
  "M 88 60 L 120 48 L 162 44 L 200 46 L 240 42 L 280 48 L 320 58 " +
  "L 352 72 L 370 92 L 372 118 L 362 140 L 340 152 L 316 148 L 300 162 " +
  "L 288 178 L 282 200 L 290 220 L 280 240 L 262 258 L 244 274 L 232 292 " +
  "L 216 310 L 200 328 L 186 344 L 170 360 L 156 374 L 140 384 " +
  "L 122 376 L 108 362 L 96 344 L 86 322 L 80 300 L 76 278 " +
  "L 72 254 L 68 228 L 64 202 L 62 176 L 64 152 L 70 128 L 78 100 L 88 60 Z";

/* ── India reference silhouette (very simplified, original shape) ─────────
   Tiny India outline in the top-right corner as a reference marker         */
const INDIA_MINI_PATH =
  "M 340 18 L 348 16 L 358 20 L 364 28 L 362 36 L 356 42 " +
  "L 350 50 L 346 58 L 342 54 L 338 46 L 334 38 L 334 28 Z";

/* ── Contour lines (closed ellipses in SVG, terrain-style) ──────────────── */
const CONTOUR_ELLIPSES = [
  { cx: 200, cy: 210, rx: 220, ry: 195, opacity: 0.08 },
  { cx: 195, cy: 215, rx: 175, ry: 155, opacity: 0.09 },
  { cx: 190, cy: 218, rx: 130, ry: 115, opacity: 0.10 },
  { cx: 185, cy: 222, rx:  88, ry:  75, opacity: 0.11 },
  { cx: 180, cy: 226, rx:  48, ry:  40, opacity: 0.13 },
];

/* ── Route path from India pin → Maharashtra centroid → district ─────────── */
function routePath(fromX: number, fromY: number, toX: number, toY: number): string {
  const mx = (fromX + toX) / 2;
  const my = Math.min(fromY, toY) - 30;
  return `M ${fromX} ${fromY} Q ${mx} ${my} ${toX} ${toY}`;
}

/* ── Animated dash offset for route line ────────────────────────────────── */
function useAnimatedDash(length = 300) {
  const [offset, setOffset] = useState(length);
  useEffect(() => {
    let frame: number;
    let start: number | null = null;
    const duration = 1400;
    function tick(ts: number) {
      if (!start) start = ts;
      const elapsed = ts - start;
      const progress = Math.min(elapsed / duration, 1);
      setOffset(length * (1 - progress));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [length]);
  return offset;
}

/* ── Props ───────────────────────────────────────────────────────────────── */
interface TopographicMapVisualProps {
  district: TopoDistrictKey;
  onDistrictChange: (d: TopoDistrictKey) => void;
  taluka: string;
  village: string;
  className?: string;
}

/* ── Main component ──────────────────────────────────────────────────────── */
export function TopographicMapVisual({
  district,
  onDistrictChange,
  taluka,
  village,
  className = "",
}: TopographicMapVisualProps) {
  const { lang } = useLang();
  const dashOffset = useAnimatedDash(300);
  const activePin = DISTRICT_PINS.find((p) => p.id === district) ?? DISTRICT_PINS[2];
  const activePinLabel = lang === "en" ? DISTRICT_LABELS_EN[activePin.id] : activePin.label;

  // India reference pin (top-right corner label)
  const indiaPinX = 352;
  const indiaPinY = 38;
  const indiaLabel = lang === "en" ? "India" : "भारत";
  const mhLabel = lang === "en" ? "Maharashtra" : "महाराष्ट्र";
  const gisBarLabel = lang === "en" ? "PrintShubh · GIS Map View" : "PrintShubh · GIS नकाशा दृश्य";
  const selectedLabel = lang === "en" ? "Selected" : "निवडले आहे";
  const breadcrumb = lang === "en"
    ? `India → Maharashtra → ${activePinLabel}`
    : `भारत → महाराष्ट्र → ${activePinLabel}`;

  // Route: India pin → Maharashtra centroid (185, 210) → active district
  const mhCx = 185;
  const mhCy = 210;

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-blue-200 bg-white shadow-lg ${className}`}
      style={{ minHeight: 420 }}
    >
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-blue-50 to-slate-50 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="inline-flex size-2 rounded-full bg-blue-500" />
          <span className="text-xs font-black uppercase tracking-widest text-blue-700">
            {gisBarLabel}
          </span>
        </div>
        <span className="rounded border border-blue-200 bg-white px-2 py-0.5 text-[10px] font-bold text-blue-600">
          {lang === "en" ? "Original · Not Bhuvan" : "मूळ दृश्य - Bhuvan नाही"}
        </span>
      </div>

      {/* ── SVG Map ── */}
      <svg
        viewBox="0 0 400 440"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full"
        style={{ display: "block", maxHeight: 520 }}
        aria-label="Maharashtra topographic map"
      >
        {/* ── Terrain base gradient ── */}
        <defs>
          <radialGradient id="terrainGrad" cx="45%" cy="48%" r="60%">
            <stop offset="0%"   stopColor="#e0f2fe" stopOpacity="0.6" />
            <stop offset="50%"  stopColor="#f0fdf4" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#f8fafc" stopOpacity="0.3" />
          </radialGradient>
          <radialGradient id="mhGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#bfdbfe" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#dbeafe" stopOpacity="0.10" />
          </radialGradient>
          <filter id="pinShadow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#1e3a8a" floodOpacity="0.22" />
          </filter>
          <filter id="activePinGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#3b82f6" floodOpacity="0.6" />
          </filter>
          <marker id="arrowBlue" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
            <polygon points="0 0, 7 3.5, 0 7" fill="#3b82f6" opacity="0.7" />
          </marker>
        </defs>

        {/* ── Background fill ── */}
        <rect width="400" height="440" fill="url(#terrainGrad)" />

        {/* ── Grid lines ── */}
        {Array.from({ length: 10 }).map((_, i) => (
          <line
            key={`v${i}`}
            x1={i * 44} y1="0" x2={i * 44} y2="440"
            stroke="#94a3b8" strokeWidth="0.4" opacity="0.25"
          />
        ))}
        {Array.from({ length: 11 }).map((_, i) => (
          <line
            key={`h${i}`}
            x1="0" y1={i * 44} x2="400" y2={i * 44}
            stroke="#94a3b8" strokeWidth="0.4" opacity="0.25"
          />
        ))}

        {/* ── Contour rings ── */}
        {CONTOUR_ELLIPSES.map((c, i) => (
          <ellipse
            key={i}
            cx={c.cx} cy={c.cy} rx={c.rx} ry={c.ry}
            fill="none"
            stroke="#0ea5e9"
            strokeWidth="0.8"
            opacity={c.opacity}
            strokeDasharray="6 4"
          />
        ))}

        {/* ── Maharashtra fill ── */}
        <path
          d={MH_PATH}
          fill="url(#mhGlow)"
          stroke="#2563eb"
          strokeWidth="1.8"
          opacity="0.9"
        />

        {/* ── Terrain shading — western ghats suggestion ── */}
        <path
          d="M 88 60 L 78 100 L 70 128 L 64 152 L 64 202 L 68 228 L 72 254 L 76 278 L 80 300 L 86 322 L 96 344 L 108 362"
          fill="none"
          stroke="#1d4ed8"
          strokeWidth="3"
          opacity="0.08"
          strokeLinecap="round"
        />

        {/* ── India mini silhouette (top right) ── */}
        <path
          d={INDIA_MINI_PATH}
          fill="#dbeafe"
          stroke="#3b82f6"
          strokeWidth="0.8"
          opacity="0.7"
        />
        <text x={indiaPinX - 8} y={indiaPinY + 18} fontSize="7" fontWeight="800" fill="#1e40af" opacity="0.8" textAnchor="middle">
          {indiaLabel}
        </text>

        {/* ── Route line: India → MH centroid ── */}
        <path
          d={routePath(indiaPinX, indiaPinY, mhCx, mhCy)}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="1.4"
          strokeDasharray="5 3"
          opacity="0.5"
          markerEnd="url(#arrowBlue)"
        />

        {/* ── Animated route line: MH centroid → active district ── */}
        <path
          d={routePath(mhCx, mhCy, activePin.cx, activePin.cy)}
          fill="none"
          stroke="#2563eb"
          strokeWidth="2"
          strokeDasharray="300"
          strokeDashoffset={dashOffset}
          opacity="0.75"
          strokeLinecap="round"
          markerEnd="url(#arrowBlue)"
        />

        {/* ── Maharashtra label ── */}
        <text x="185" y="205" fontSize="9" fontWeight="800" fill="#1e3a8a" textAnchor="middle" opacity="0.55" letterSpacing="1">
          {mhLabel}
        </text>

        {/* ── Coordinate ticks ── */}
        {[0, 100, 200, 300, 400].map((x) => (
          <text key={x} x={x + 2} y="436" fontSize="6" fill="#94a3b8" opacity="0.6">{x}</text>
        ))}
        {[44, 132, 220, 308, 396].map((y) => (
          <text key={y} x="2" y={y} fontSize="6" fill="#94a3b8" opacity="0.6">{y}</text>
        ))}

        {/* ── District markers ── */}
        {DISTRICT_PINS.map((pin) => {
          const isActive = pin.id === district;
          const pinLabel = lang === "en" ? DISTRICT_LABELS_EN[pin.id] : pin.label;
          const pinAriaLabel = lang === "en"
            ? `Select ${pinLabel} district`
            : `${pinLabel} जिल्हा निवडा`;
          return (
            <g
              key={pin.id}
              style={{ cursor: "pointer" }}
              onClick={() => onDistrictChange(pin.id)}
              role="button"
              aria-label={pinAriaLabel}
            >
              {/* Pulse ring (active only) */}
              {isActive && (
                <>
                  <circle cx={pin.cx} cy={pin.cy} r="20" fill="none" stroke="#3b82f6" strokeWidth="1.5" opacity="0.3">
                    <animate attributeName="r" values="12;22;12" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={pin.cx} cy={pin.cy} r="14" fill="#dbeafe" opacity="0.4" />
                </>
              )}

              {/* Inactive halo */}
              {!isActive && (
                <circle cx={pin.cx} cy={pin.cy} r="10" fill="#f0f9ff" opacity="0.7" />
              )}

              {/* Main dot */}
              <circle
                cx={pin.cx} cy={pin.cy}
                r={isActive ? 7 : 5}
                fill={isActive ? "#1d4ed8" : "#60a5fa"}
                stroke="white"
                strokeWidth={isActive ? 2.5 : 1.5}
                filter={isActive ? "url(#activePinGlow)" : "url(#pinShadow)"}
                style={{ transition: "r 0.2s" }}
              />

              {/* Label */}
              <text
                x={pin.cx}
                y={pin.cy - (isActive ? 12 : 10)}
                fontSize={isActive ? "9.5" : "8"}
                fontWeight={isActive ? "900" : "700"}
                fill={isActive ? "#1e3a8a" : "#334155"}
                textAnchor="middle"
                style={{ pointerEvents: "none", userSelect: "none" }}
              >
                {pinLabel}
              </text>
            </g>
          );
        })}

        {/* ── Scale bar ── */}
        <rect x="14" y="418" width="60" height="3" rx="1.5" fill="#64748b" opacity="0.35" />
        <text x="14" y="414" fontSize="6.5" fill="#64748b" opacity="0.6">0</text>
        <text x="70" y="414" fontSize="6.5" fill="#64748b" opacity="0.6">~200km</text>

        {/* ── North arrow ── */}
        <text x="380" y="418" fontSize="10" fontWeight="900" fill="#475569" opacity="0.5" textAnchor="middle">N</text>
        <line x1="380" y1="424" x2="380" y2="432" stroke="#475569" strokeWidth="1" opacity="0.4" />
        <polygon points="380,416 377,424 383,424" fill="#475569" opacity="0.35" />
      </svg>

      {/* ── Tooltip card (outside SVG, positioned absolute) ── */}
      <div className="pointer-events-none absolute bottom-3 left-3 right-3 z-10 flex items-start gap-3 rounded-lg border border-blue-200 bg-white/96 px-4 py-3 shadow-md backdrop-blur-sm">
        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-blue-600 text-white">
          <svg viewBox="0 0 16 16" fill="currentColor" className="size-4">
            <path d="M8 2a4 4 0 1 0 0 8A4 4 0 0 0 8 2zM2 8a6 6 0 1 1 12 0A6 6 0 0 1 2 8z"/>
            <path d="M8 7a1 1 0 0 1 1 1v3a1 1 0 1 1-2 0V8a1 1 0 0 1 1-1zM8 4.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-black text-blue-900">
              {activePinLabel} {selectedLabel}
            </p>
            <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">
              {breadcrumb}
            </span>
          </div>
          <p className="mt-0.5 truncate text-xs text-slate-500">
            {taluka} / {village}
          </p>
        </div>
      </div>
    </div>
  );
}
