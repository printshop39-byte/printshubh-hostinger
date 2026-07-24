"use client";

/**
 * Small shared input/output primitives for the calculator tools. Kept
 * deliberately minimal — labelled number field, a range slider, and a
 * result stat card — so every calculator looks and behaves the same.
 */

import type { ReactNode } from "react";

export function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
  prefix,
}: {
  label: ReactNode;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  prefix?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-bold text-slate-700">{label}</span>
      <div className="flex min-h-[44px] items-center rounded-md border border-slate-300 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
        {prefix && <span className="pl-3 text-sm font-bold text-slate-500">{prefix}</span>}
        <input
          type="number"
          inputMode="decimal"
          value={Number.isFinite(value) ? value : ""}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
          className="w-full bg-transparent px-3 py-2.5 text-[15px] font-semibold text-slate-900 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        />
        {suffix && <span className="pr-3 text-sm font-bold text-slate-500">{suffix}</span>}
      </div>
    </label>
  );
}

export function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  display,
}: {
  label: ReactNode;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  display: ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-[13px] font-bold text-slate-700">{label}</span>
        <span className="text-[13px] font-black text-blue-700">{display}</span>
      </div>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-blue-600"
      />
    </div>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: ReactNode;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: ReactNode }>;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-bold text-slate-700">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[44px] w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-[15px] font-semibold text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
  hint,
}: {
  label: ReactNode;
  checked: boolean;
  onChange: (v: boolean) => void;
  hint?: ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-md border border-slate-200 bg-slate-50 p-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-4 shrink-0 cursor-pointer accent-blue-600"
      />
      <span>
        <span className="block text-[13.5px] font-bold text-slate-800">{label}</span>
        {hint && <span className="mt-0.5 block text-[12px] leading-5 text-slate-500">{hint}</span>}
      </span>
    </label>
  );
}

export function ResultStat({
  label,
  value,
  emphasis,
}: {
  label: ReactNode;
  value: ReactNode;
  emphasis?: boolean;
}) {
  return (
    <div
      className={
        emphasis
          ? "rounded-xl border border-blue-200 bg-blue-50 p-4"
          : "rounded-xl border border-slate-200 bg-white p-4"
      }
    >
      <div className="text-[12px] font-bold uppercase tracking-wide text-slate-500">{label}</div>
      <div
        className={
          emphasis
            ? "mt-1 text-2xl font-black text-blue-800"
            : "mt-1 text-xl font-black text-slate-900"
        }
      >
        {value}
      </div>
    </div>
  );
}
