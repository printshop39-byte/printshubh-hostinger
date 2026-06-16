"use client";

/**
 * Admin — Overlay Controls panel (numeric / fit controls).
 * The transform-mode toolbar (Move / Corners / Width / Height / Rotate / Lock)
 * lives above the map; this right-side panel holds the numeric inputs:
 * opacity, non-uniform scaleX / scaleY (with uniform toggle), rotation, fit
 * helpers, reset and lock, plus a live read-out of the current transform.
 */

import { Lock, Maximize, RotateCcw, RotateCw, Unlock } from "lucide-react";
import type { Lang } from "@/components/language-context";

const L = {
  heading: { mr: "Overlay नियंत्रण", en: "Overlay Controls" },
  none: { mr: "आधी भूनकाशा फाइल अपलोड करा.", en: "Upload a BhuNaksha file first." },
  opacity: { mr: "पारदर्शकता", en: "Opacity" },
  widthScale: { mr: "रुंदी scale (X)", en: "Width scale (X)" },
  heightScale: { mr: "उंची scale (Y)", en: "Height scale (Y)" },
  uniform: { mr: "समान scale (X=Y)", en: "Uniform scale (X=Y)" },
  rotate: { mr: "फिरवा", en: "Rotate" },
  lock: { mr: "Lock", en: "Lock" },
  reset: { mr: "Reset", en: "Reset" },
  fitMap: { mr: "Map view मध्ये fit", en: "Fit to map view" },
  fitBoundary: { mr: "काढलेल्या सीमेत fit करा", en: "Fit to drawn boundary" },
  fitPlot: { mr: "निवडलेल्या प्लॉटवर fit", en: "Fit to selected plot" },
  current: { mr: "सध्याचे", en: "Current" },
  warning: {
    mr: "Overlay manual आहे. Scale, stretch आणि rotation अंदाजे आहेत. अंतिम हद्द/मोजणी अधिकृत मोजणी विभागाकडून पडताळावी.",
    en: "Overlay is manual. Scale, stretch and rotation are approximate. Final boundary/measurement must be verified by the official survey department.",
  },
} satisfies Record<string, Record<Lang, string>>;

export interface OverlayControlsProps {
  lang: Lang;
  hasOverlay: boolean;
  locked: boolean;
  opacity: number;
  scaleX: number;
  scaleY: number;
  rotationDeg: number;
  uniform: boolean;
  hasBoundary: boolean;
  hasSelectedPlot: boolean;
  onOpacity: (v: number) => void;
  onScaleX: (v: number) => void;
  onScaleY: (v: number) => void;
  onRotation: (deg: number) => void;
  onToggleUniform: () => void;
  onFitMapView: () => void;
  onFitBoundary: () => void;
  onFitSelectedPlot: () => void;
  onReset: () => void;
  onToggleLock: () => void;
}

export function OverlayControlsPanel(props: OverlayControlsProps) {
  const { lang, hasOverlay, locked } = props;
  const disabled = !hasOverlay || locked;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-black text-slate-900">{L.heading[lang]}</h3>
        <button
          type="button"
          onClick={props.onToggleLock}
          disabled={!hasOverlay}
          aria-pressed={locked}
          className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[12px] font-bold transition disabled:opacity-40 ${
            locked ? "border-amber-400 bg-amber-50 text-amber-800" : "border-slate-300 text-slate-700 hover:bg-slate-50"
          }`}
        >
          {locked ? <Lock className="size-3.5" /> : <Unlock className="size-3.5" />}
          {L.lock[lang]}
        </button>
      </div>

      {!hasOverlay && <p className="mb-3 text-[12px] font-semibold text-amber-700">{L.none[lang]}</p>}

      {/* Opacity */}
      <Slider label={L.opacity[lang]} value={props.opacity} min={0.1} max={1} step={0.05}
        display={`${Math.round(props.opacity * 100)}%`} disabled={!hasOverlay} onChange={props.onOpacity} />

      {/* Width / Height scale */}
      <Slider label={L.widthScale[lang]} value={props.scaleX} min={0.05} max={10} step={0.05}
        display={`${props.scaleX.toFixed(2)}×`} disabled={disabled} onChange={props.onScaleX} />
      <Slider label={L.heightScale[lang]} value={props.scaleY} min={0.05} max={10} step={0.05}
        display={`${props.scaleY.toFixed(2)}×`} disabled={disabled || props.uniform} onChange={props.onScaleY} />

      <label className="mt-1 flex items-center gap-2 text-[12px] font-semibold text-slate-700">
        <input type="checkbox" checked={props.uniform} disabled={disabled} onChange={props.onToggleUniform} className="size-4 accent-blue-600" />
        {L.uniform[lang]}
      </label>

      {/* Rotation */}
      <div className="mt-3">
        <div className="mb-1 text-[12px] font-bold text-slate-600">{L.rotate[lang]}</div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => props.onRotation(props.rotationDeg - 5)} disabled={disabled} aria-label="Rotate left"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 text-slate-700 transition hover:bg-slate-50 disabled:opacity-40">
            <RotateCcw className="size-4" />
          </button>
          <input type="range" min={-180} max={180} step={1} value={props.rotationDeg} disabled={disabled}
            onChange={(e) => props.onRotation(Number(e.target.value))} className="flex-1 accent-blue-600 disabled:opacity-40" />
          <input type="number" min={-180} max={180} value={Math.round(props.rotationDeg)} disabled={disabled}
            onChange={(e) => props.onRotation(Number(e.target.value) || 0)}
            className="h-8 w-16 rounded-md border border-slate-300 px-2 text-center text-[13px] font-bold text-slate-800 disabled:opacity-40" />
          <button type="button" onClick={() => props.onRotation(props.rotationDeg + 5)} disabled={disabled} aria-label="Rotate right"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 text-slate-700 transition hover:bg-slate-50 disabled:opacity-40">
            <RotateCw className="size-4" />
          </button>
        </div>
      </div>

      {/* Fit + reset */}
      <div className="mt-3 flex flex-wrap gap-2">
        <FitBtn label={L.fitMap[lang]} onClick={props.onFitMapView} disabled={!hasOverlay} />
        <FitBtn label={L.fitBoundary[lang]} onClick={props.onFitBoundary} disabled={!hasOverlay || !props.hasBoundary} />
        <FitBtn label={L.fitPlot[lang]} onClick={props.onFitSelectedPlot} disabled={!hasOverlay || !props.hasSelectedPlot} />
        <button type="button" onClick={props.onReset} disabled={!hasOverlay}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-2.5 py-1.5 text-[12px] font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40">
          <RotateCcw className="size-3.5" /> {L.reset[lang]}
        </button>
      </div>

      {/* Current read-out */}
      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 rounded-md bg-slate-50 px-3 py-2 text-[11.5px] font-semibold text-slate-600">
        <span>scaleX: <b className="text-slate-900">{props.scaleX.toFixed(2)}</b></span>
        <span>scaleY: <b className="text-slate-900">{props.scaleY.toFixed(2)}</b></span>
        <span>rotation: <b className="text-slate-900">{Math.round(props.rotationDeg)}°</b></span>
        <span>opacity: <b className="text-slate-900">{Math.round(props.opacity * 100)}%</b></span>
      </div>

      <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] leading-4 text-amber-900">
        {L.warning[lang]}
      </p>
    </section>
  );
}

function Slider({
  label, value, min, max, step, display, disabled, onChange,
}: {
  label: string; value: number; min: number; max: number; step: number; display: string; disabled: boolean; onChange: (v: number) => void;
}) {
  return (
    <div className="mt-3">
      <div className="mb-1 flex items-center justify-between text-[12px] font-bold text-slate-600">
        <span>{label}</span>
        <span className="text-slate-500">{display}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-blue-600 disabled:opacity-40" />
    </div>
  );
}

function FitBtn({ label, onClick, disabled }: { label: string; onClick: () => void; disabled: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-2.5 py-1.5 text-[12px] font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40">
      <Maximize className="size-3.5" /> {label}
    </button>
  );
}
