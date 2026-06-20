"use client";

/**
 * QGIS-style layer panel for the BhuNaksha tool. Each layer is an eye-toggle
 * row (visible / hidden); the overlay row adds an opacity slider and Z-index
 * reorder. A base-map switch (satellite / OSM) sits on top. Presentational —
 * all state lives in the parent.
 */

import { ChevronDown, ChevronUp, Eye, EyeOff, Layers as LayersIcon } from "lucide-react";
import type { Lang } from "@/components/language-context";

type BaseLayer = "satellite" | "osm";
type LayerKey = "overlay" | "boundary" | "dimensions" | "refPoints";
type LayerVisibility = Record<LayerKey, boolean>;

const L = {
  title: { mr: "नकाशा थर", en: "Map layers" },
  baseMap: { mr: "बेस नकाशा", en: "Base map" },
  satellite: { mr: "सॅटेलाइट", en: "Satellite" },
  osm: { mr: "OSM", en: "OSM" },
  overlay: { mr: "भूनकाशा overlay", en: "BhuNaksha overlay" },
  boundary: { mr: "प्लॉट सीमा", en: "Plot boundary" },
  dimensions: { mr: "सीमा परिमाणे", en: "Boundary dimensions" },
  refPoints: { mr: "संदर्भ बिंदू / Labels", en: "Reference points / labels" },
  opacity: { mr: "पारदर्शकता", en: "Opacity" },
  forward: { mr: "पुढे आणा", en: "Bring forward" },
  back: { mr: "मागे पाठवा", en: "Send back" },
} satisfies Record<string, Record<Lang, string>>;

const ROWS: { key: LayerKey; label: keyof typeof L }[] = [
  { key: "overlay", label: "overlay" },
  { key: "boundary", label: "boundary" },
  { key: "dimensions", label: "dimensions" },
  { key: "refPoints", label: "refPoints" },
];

export interface LayerPanelProps {
  lang: Lang;
  baseLayer: BaseLayer;
  layers: LayerVisibility;
  hasOverlay: boolean;
  opacity: number; // 0..1
  onBaseLayer: (b: BaseLayer) => void;
  onToggle: (key: LayerKey) => void;
  onOpacity: (v: number) => void;
  onOverlayUp: () => void;
  onOverlayDown: () => void;
}

export function LayerPanel(p: LayerPanelProps) {
  const pct = Math.round(p.opacity * 100);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 flex items-center gap-1.5 text-sm font-black text-slate-900">
        <LayersIcon className="size-4" /> {L.title[p.lang]}
      </h3>

      {/* Base map switch */}
      <div className="mb-2 flex items-center gap-2">
        <span className="w-20 shrink-0 text-[11px] font-bold uppercase tracking-wide text-slate-400">{L.baseMap[p.lang]}</span>
        <div className="inline-flex overflow-hidden rounded-md border border-slate-300 text-[12px] font-bold">
          <button
            type="button"
            onClick={() => p.onBaseLayer("satellite")}
            aria-pressed={p.baseLayer === "satellite"}
            className={`px-2.5 py-1 ${p.baseLayer === "satellite" ? "bg-blue-600 text-white" : "bg-white text-slate-700 hover:bg-slate-50"}`}
          >
            {L.satellite[p.lang]}
          </button>
          <button
            type="button"
            onClick={() => p.onBaseLayer("osm")}
            aria-pressed={p.baseLayer === "osm"}
            className={`border-l border-slate-300 px-2.5 py-1 ${p.baseLayer === "osm" ? "bg-blue-600 text-white" : "bg-white text-slate-700 hover:bg-slate-50"}`}
          >
            {L.osm[p.lang]}
          </button>
        </div>
      </div>

      {/* Layer rows */}
      <div className="divide-y divide-slate-100 border-t border-slate-100">
        {ROWS.map(({ key, label }) => {
          const visible = p.layers[key];
          const isOverlay = key === "overlay";
          const dim = isOverlay && !p.hasOverlay;
          return (
            <div key={key} className={dim ? "opacity-40" : ""}>
              <div className="flex items-center gap-2 py-2">
                <button
                  type="button"
                  onClick={() => p.onToggle(key)}
                  disabled={dim}
                  aria-pressed={visible}
                  title={visible ? "👁" : "—"}
                  className="rounded p-0.5 text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed"
                >
                  {visible ? <Eye className="size-[18px] text-blue-600" /> : <EyeOff className="size-[18px] text-slate-400" />}
                </button>
                <span className={`flex-1 text-[13px] font-semibold ${visible ? "text-slate-800" : "text-slate-400"}`}>{L[label][p.lang]}</span>
                {isOverlay && (
                  <span className="flex shrink-0 items-center gap-0.5">
                    <button type="button" onClick={p.onOverlayUp} disabled={dim} title={L.forward[p.lang]} className="rounded border border-slate-200 p-1 text-slate-500 hover:bg-slate-50 disabled:opacity-40">
                      <ChevronUp className="size-3.5" />
                    </button>
                    <button type="button" onClick={p.onOverlayDown} disabled={dim} title={L.back[p.lang]} className="rounded border border-slate-200 p-1 text-slate-500 hover:bg-slate-50 disabled:opacity-40">
                      <ChevronDown className="size-3.5" />
                    </button>
                  </span>
                )}
              </div>
              {/* Overlay opacity */}
              {isOverlay && (
                <div className="flex items-center gap-2 pb-2 pl-7 pr-1">
                  <span className="text-[11px] font-bold text-slate-500">{L.opacity[p.lang]}</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={pct}
                    disabled={dim}
                    onChange={(e) => p.onOpacity(Number(e.target.value) / 100)}
                    aria-label={`${L.opacity[p.lang]} ${pct}%`}
                    className="h-1.5 flex-1 accent-blue-600"
                  />
                  <span className="w-9 text-right text-[11px] font-bold text-slate-600">{pct}%</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
