"use client";

/**
 * Admin — Overlay Controls panel (Section C).
 * Move / rotate / scale / opacity / lock / reset / fit / z-order for the
 * manually-placed BhuNaksha overlay.
 */

import {
  ArrowDownToLine,
  ArrowUpToLine,
  Eye,
  EyeOff,
  Lock,
  Maximize,
  Move,
  RotateCcw,
  RotateCw,
  Unlock,
} from "lucide-react";
import type { Lang } from "@/components/language-context";

const L = {
  heading: { mr: "Overlay नियंत्रण", en: "Overlay Controls" },
  show: { mr: "भूनकाशा overlay दाखवा", en: "Show BhuNaksha overlay" },
  opacity: { mr: "पारदर्शकता", en: "Opacity" },
  rotate: { mr: "फिरवा", en: "Rotate" },
  scale: { mr: "Scale करा", en: "Scale" },
  move: { mr: "Overlay हलवा", en: "Move overlay" },
  lock: { mr: "Overlay lock करा", en: "Lock overlay" },
  reset: { mr: "Reset करा", en: "Reset" },
  fit: { mr: "Map view मध्ये fit करा", en: "Fit to map view" },
  above: { mr: "Boundary वर", en: "Above boundary" },
  below: { mr: "Boundary खाली", en: "Below boundary" },
  none: { mr: "आधी भूनकाशा फाइल अपलोड करा.", en: "Upload a BhuNaksha file first." },
} satisfies Record<string, Record<Lang, string>>;

export interface OverlayControlsProps {
  lang: Lang;
  hasOverlay: boolean;
  visible: boolean;
  opacity: number;
  rotationDeg: number;
  scale: number;
  locked: boolean;
  moveMode: boolean;
  onToggleVisible: () => void;
  onOpacity: (v: number) => void;
  onSetRotation: (deg: number) => void;
  onScale: (v: number) => void;
  onToggleLock: () => void;
  onToggleMove: () => void;
  onReset: () => void;
  onFit: () => void;
  onBringAbove: () => void;
  onBringBelow: () => void;
}

export function OverlayControlsPanel(props: OverlayControlsProps) {
  const { lang, hasOverlay, locked } = props;
  const disabled = !hasOverlay || locked;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-black text-slate-900">{L.heading[lang]}</h3>

      {!hasOverlay && <p className="mb-3 text-[12px] font-semibold text-amber-700">{L.none[lang]}</p>}

      {/* Show / hide + lock */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={props.onToggleVisible}
          disabled={!hasOverlay}
          aria-pressed={props.visible}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-2.5 py-1.5 text-[12px] font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
        >
          {props.visible ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
          {L.show[lang]}
        </button>
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

      {/* Opacity */}
      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between text-[12px] font-bold text-slate-600">
          <span>{L.opacity[lang]}</span>
          <span className="text-slate-500">{Math.round(props.opacity * 100)}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={props.opacity}
          disabled={!hasOverlay}
          onChange={(e) => props.onOpacity(Number(e.target.value))}
          className="w-full accent-blue-600 disabled:opacity-40"
        />
      </div>

      {/* Scale */}
      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between text-[12px] font-bold text-slate-600">
          <span>{L.scale[lang]}</span>
          <span className="text-slate-500">{props.scale.toFixed(2)}×</span>
        </div>
        <input
          type="range"
          min={0.2}
          max={4}
          step={0.05}
          value={props.scale}
          disabled={disabled}
          onChange={(e) => props.onScale(Number(e.target.value))}
          className="w-full accent-blue-600 disabled:opacity-40"
        />
      </div>

      {/* Rotate */}
      <div className="mt-3">
        <div className="mb-1 text-[12px] font-bold text-slate-600">{L.rotate[lang]}</div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => props.onSetRotation(props.rotationDeg - 5)}
            disabled={disabled}
            aria-label="Rotate left"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
          >
            <RotateCcw className="size-4" />
          </button>
          <input
            type="number"
            value={Math.round(props.rotationDeg)}
            disabled={disabled}
            onChange={(e) => props.onSetRotation(Number(e.target.value) || 0)}
            className="h-8 w-20 rounded-md border border-slate-300 px-2 text-center text-[13px] font-bold text-slate-800 disabled:opacity-40"
          />
          <span className="text-[12px] text-slate-500">°</span>
          <button
            type="button"
            onClick={() => props.onSetRotation(props.rotationDeg + 5)}
            disabled={disabled}
            aria-label="Rotate right"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
          >
            <RotateCw className="size-4" />
          </button>
        </div>
      </div>

      {/* Move / fit / reset */}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={props.onToggleMove}
          disabled={disabled}
          aria-pressed={props.moveMode}
          className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[12px] font-bold transition disabled:opacity-40 ${
            props.moveMode ? "border-blue-500 bg-blue-600 text-white" : "border-slate-300 text-slate-700 hover:bg-slate-50"
          }`}
        >
          <Move className="size-3.5" />
          {L.move[lang]}
        </button>
        <button
          type="button"
          onClick={props.onFit}
          disabled={!props.hasOverlay}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-2.5 py-1.5 text-[12px] font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
        >
          <Maximize className="size-3.5" />
          {L.fit[lang]}
        </button>
        <button
          type="button"
          onClick={props.onReset}
          disabled={!props.hasOverlay}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-2.5 py-1.5 text-[12px] font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
        >
          <RotateCcw className="size-3.5" />
          {L.reset[lang]}
        </button>
      </div>

      {/* Z-order */}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={props.onBringAbove}
          disabled={!props.hasOverlay}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-2.5 py-1.5 text-[12px] font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
        >
          <ArrowUpToLine className="size-3.5" />
          {L.above[lang]}
        </button>
        <button
          type="button"
          onClick={props.onBringBelow}
          disabled={!props.hasOverlay}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-2.5 py-1.5 text-[12px] font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
        >
          <ArrowDownToLine className="size-3.5" />
          {L.below[lang]}
        </button>
      </div>
    </section>
  );
}
