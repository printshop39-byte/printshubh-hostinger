"use client";

/**
 * Admin — floating overlay layer control, docked in the map's top-right corner
 * (Google Earth-style). Presentational only: every action is delegated to the
 * parent via callbacks. Composes the existing overlay handlers (opacity,
 * visibility, lock, Z-index reorder, fit-to-boundary) into one compact panel so
 * the admin never has to leave the map to fine-tune the overlay.
 */

import { ChevronDown, ChevronUp, Crop, Eye, EyeOff, Lock, Unlock } from "lucide-react";
import type { Lang } from "@/components/language-context";

const L = {
  title: { mr: "भूनकाशा थर", en: "BhuNaksha layer" },
  visibility: { mr: "दिसणे चालू/बंद", en: "Toggle visibility" },
  lock: { mr: "लॉक — चुकून हलणे टाळा", en: "Lock — prevent accidental dragging" },
  opacity: { mr: "पारदर्शकता", en: "Opacity" },
  bringForward: { mr: "पुढे आणा", en: "Bring forward" },
  sendBack: { mr: "मागे पाठवा", en: "Send back" },
  fit: { mr: "Boundary वर fit", en: "Fit to boundary" },
} satisfies Record<string, Record<Lang, string>>;

export interface MapOverlayControlProps {
  lang: Lang;
  hasOverlay: boolean;
  opacity: number; // 0..1
  visible: boolean;
  locked: boolean;
  hasBoundary: boolean;
  onOpacity: (v: number) => void;
  onToggleVisible: () => void;
  onToggleLock: () => void;
  onFitBoundary: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export function MapOverlayControl(p: MapOverlayControlProps) {
  if (!p.hasOverlay) return null;
  const pct = Math.round(p.opacity * 100);

  return (
    <div className="absolute right-3 top-3 z-20 w-56 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-[10px] font-black uppercase tracking-wide text-slate-400">{L.title[p.lang]}</span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={p.onToggleVisible}
            title={L.visibility[p.lang]}
            aria-pressed={p.visible}
            className="rounded-md p-1 text-slate-600 transition hover:bg-slate-100"
          >
            {p.visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
          </button>
          <button
            type="button"
            onClick={p.onToggleLock}
            title={L.lock[p.lang]}
            aria-pressed={p.locked}
            className={`rounded-md p-1 transition ${
              p.locked ? "bg-amber-100 text-amber-700" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {p.locked ? <Lock className="size-4" /> : <Unlock className="size-4" />}
          </button>
        </div>
      </div>

      {/* Opacity 0–100% */}
      <label className="block text-[11px] font-bold text-slate-600">
        {L.opacity[p.lang]}: {pct}%
        <input
          type="range"
          min={0}
          max={100}
          value={pct}
          onChange={(e) => p.onOpacity(Number(e.target.value) / 100)}
          aria-label={`${L.opacity[p.lang]} ${pct}%`}
          className="mt-1 w-full accent-blue-600"
        />
      </label>

      {/* Z-index reorder + fit-to-boundary */}
      <div className="mt-2 flex items-center gap-1.5">
        <button
          type="button"
          onClick={p.onMoveUp}
          title={L.bringForward[p.lang]}
          className="rounded-md border border-slate-300 p-1.5 text-slate-700 transition hover:bg-slate-50"
        >
          <ChevronUp className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={p.onMoveDown}
          title={L.sendBack[p.lang]}
          className="rounded-md border border-slate-300 p-1.5 text-slate-700 transition hover:bg-slate-50"
        >
          <ChevronDown className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={p.onFitBoundary}
          disabled={!p.hasBoundary}
          className="ml-auto inline-flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1.5 text-[11px] font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
        >
          <Crop className="size-3.5" /> {L.fit[p.lang]}
        </button>
      </div>
    </div>
  );
}
