"use client";

/**
 * Admin — Reference Points / Neighbor Survey Numbers panel (Phase 2 prep).
 *
 * Admin marks surrounding survey/gat numbers + known reference points on the
 * live map (lat/lng captured on click, manually correctable). Any point can be
 * flagged as a control point used to suggest the BhuNaksha overlay's centre /
 * rotation / scale. Admin-only — never shown on the public site.
 */

import { Copy, Crosshair, MapPin, Trash2 } from "lucide-react";
import type { Lang } from "@/components/language-context";
import {
  REFERENCE_POINT_TYPES,
  REFERENCE_TYPE_COLORS,
  REFERENCE_TYPE_LABELS,
  type ReferencePoint,
  type ReferencePointType,
} from "@/lib/bhunaksha/report-schema";

const L = {
  heading: { mr: "संदर्भ बिंदू / शेजारी गट नंबर", en: "Reference Points / Neighbor Survey Numbers" },
  markPoint: { mr: "बिंदू mark करा", en: "Mark point" },
  marking: { mr: "नकाशावर क्लिक करा…", en: "Click on the map…" },
  newPointType: { mr: "नवीन बिंदू प्रकार", en: "New point type" },
  hint: {
    mr: "“बिंदू mark करा” दाबा, मग नकाशावर क्लिक करा. lat/lng आपोआप घेतले जाईल.",
    en: "Tap “Mark point”, then click on the map. Lat/lng is captured automatically.",
  },
  empty: { mr: "अजून संदर्भ बिंदू नाहीत.", en: "No reference points yet." },
  label: { mr: "लेबल", en: "Label" },
  type: { mr: "प्रकार", en: "Type" },
  lat: { mr: "Lat", en: "Lat" },
  lng: { mr: "Lng", en: "Lng" },
  note: { mr: "टीप", en: "Note" },
  useForAlign: { mr: "Overlay alignment साठी वापरा", en: "Use for overlay alignment" },
  copy: { mr: "lat-long कॉपी", en: "Copy lat-long" },
  del: { mr: "हटवा", en: "Delete" },
  align: { mr: "Control points वरून align करा", en: "Align from control points" },
  controlCount: { mr: "Control points", en: "Control points" },
  guidance: {
    mr: "किमान 2 (ढोबळ) · 3 (scale/rotation) · 4 (उत्तम manual alignment).",
    en: "Min 2 (rough) · 3 (scale/rotation) · 4 (best manual alignment).",
  },
  disclaimer: {
    mr: "Control points वापरून केलेला BhuNaksha overlay अंदाजे संदर्भासाठी आहे. अचूक मोजणी/हद्द/मालकी पडताळणी अधिकृत मोजणी किंवा महसूल विभागाकडून करावी.",
    en: "BhuNaksha overlay aligned using control points is for approximate reference only. Exact measurement, boundary and ownership must be verified through the official survey/revenue department.",
  },
  needOverlay: { mr: "(आधी overlay अपलोड करा)", en: "(upload an overlay first)" },
} satisfies Record<string, Record<Lang, string>>;

export function ReferencePointsPanel({
  lang,
  points,
  markMode,
  markType,
  hasOverlay,
  onToggleMarkMode,
  onMarkTypeChange,
  onUpdate,
  onDelete,
  onAlign,
}: {
  lang: Lang;
  points: ReferencePoint[];
  markMode: boolean;
  markType: ReferencePointType;
  hasOverlay: boolean;
  onToggleMarkMode: () => void;
  onMarkTypeChange: (t: ReferencePointType) => void;
  onUpdate: (id: string, patch: Partial<ReferencePoint>) => void;
  onDelete: (id: string) => void;
  onAlign: () => void;
}) {
  const controlCount = points.filter((p) => p.useForOverlayAlignment).length;
  const canAlign = hasOverlay && controlCount >= 2;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-2 flex items-center gap-1.5 text-sm font-black text-slate-900">
        <Crosshair className="size-4" /> {L.heading[lang]}
      </h3>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onToggleMarkMode}
          aria-pressed={markMode}
          className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[12px] font-bold transition ${
            markMode ? "border-blue-500 bg-blue-600 text-white" : "border-slate-300 text-slate-700 hover:bg-slate-50"
          }`}
        >
          <MapPin className="size-3.5" />
          {markMode ? L.marking[lang] : L.markPoint[lang]}
        </button>
        <select
          value={markType}
          onChange={(e) => onMarkTypeChange(e.target.value as ReferencePointType)}
          aria-label={L.newPointType[lang]}
          className="h-8 rounded-md border border-slate-300 px-1.5 text-[11px] font-semibold text-slate-700"
        >
          {REFERENCE_POINT_TYPES.map((t) => (
            <option key={t} value={t}>
              {REFERENCE_TYPE_LABELS[t][lang]}
            </option>
          ))}
        </select>
      </div>
      <p className="mt-2 text-[11px] leading-4 text-slate-500">{L.hint[lang]}</p>

      {/* Points list */}
      <div className="mt-3 space-y-2.5">
        {points.length === 0 && <p className="text-[12px] font-semibold text-slate-400">{L.empty[lang]}</p>}
        {points.map((p) => (
          <div key={p.id} className="rounded-lg border border-slate-200 p-2.5">
            <div className="flex items-center gap-2">
              <span className="size-3 shrink-0 rounded-full" style={{ background: REFERENCE_TYPE_COLORS[p.type] }} aria-hidden="true" />
              <input
                type="text"
                value={p.label}
                placeholder={L.label[lang]}
                onChange={(e) => onUpdate(p.id, { label: e.target.value })}
                className="h-8 min-w-0 flex-1 rounded-md border border-slate-300 px-2 text-[13px] font-bold text-slate-800"
              />
              <select
                value={p.type}
                onChange={(e) => onUpdate(p.id, { type: e.target.value as ReferencePointType })}
                className="h-8 rounded-md border border-slate-300 px-1.5 text-[11px] font-semibold text-slate-700"
                aria-label={L.type[lang]}
              >
                {REFERENCE_POINT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {REFERENCE_TYPE_LABELS[t][lang]}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2">
              <label className="block">
                <span className="text-[10px] font-bold text-slate-500">{L.lat[lang]}</span>
                <input
                  type="number"
                  step="0.000001"
                  value={p.lngLat[1]}
                  onChange={(e) => onUpdate(p.id, { lngLat: [p.lngLat[0], Number(e.target.value)] })}
                  className="h-8 w-full rounded-md border border-slate-300 px-2 text-[12px] text-slate-800"
                />
              </label>
              <label className="block">
                <span className="text-[10px] font-bold text-slate-500">{L.lng[lang]}</span>
                <input
                  type="number"
                  step="0.000001"
                  value={p.lngLat[0]}
                  onChange={(e) => onUpdate(p.id, { lngLat: [Number(e.target.value), p.lngLat[1]] })}
                  className="h-8 w-full rounded-md border border-slate-300 px-2 text-[12px] text-slate-800"
                />
              </label>
            </div>

            <label className="mt-2 flex items-center gap-2 text-[12px] font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={p.useForOverlayAlignment}
                onChange={(e) => onUpdate(p.id, { useForOverlayAlignment: e.target.checked })}
                className="size-4 accent-amber-500"
              />
              {L.useForAlign[lang]}
            </label>

            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  try {
                    navigator.clipboard.writeText(`${p.lngLat[1].toFixed(6)}, ${p.lngLat[0].toFixed(6)}`);
                  } catch {
                    /* clipboard blocked — ignore */
                  }
                }}
                className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-[11px] font-bold text-slate-700 transition hover:bg-slate-50"
              >
                <Copy className="size-3" /> {L.copy[lang]}
              </button>
              <button
                type="button"
                onClick={() => onDelete(p.id)}
                className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2 py-1 text-[11px] font-bold text-red-700 transition hover:bg-red-50"
              >
                <Trash2 className="size-3" /> {L.del[lang]}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Alignment */}
      <div className="mt-3 border-t border-slate-200 pt-3">
        <p className="text-[12px] font-bold text-slate-600">
          {L.controlCount[lang]}: <span className="text-amber-700">{controlCount}</span>
          {!hasOverlay && <span className="ml-1 font-semibold text-slate-400">{L.needOverlay[lang]}</span>}
        </p>
        <p className="mt-0.5 text-[11px] text-slate-500">{L.guidance[lang]}</p>
        <button
          type="button"
          onClick={onAlign}
          disabled={!canAlign}
          className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-blue-700 px-3 py-2 text-[12px] font-bold text-white transition hover:bg-blue-800 disabled:opacity-40"
        >
          <Crosshair className="size-3.5" /> {L.align[lang]}
        </button>
        <p className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-2 text-[11px] leading-4 text-amber-900">
          {L.disclaimer[lang]}
        </p>
      </div>
    </section>
  );
}
