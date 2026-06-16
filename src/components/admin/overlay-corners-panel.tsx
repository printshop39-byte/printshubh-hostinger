"use client";

/**
 * Admin — numeric Overlay Corners editor.
 * Lets the admin type exact lat/lng for each of the four overlay corners when
 * dragging the handles is awkward. Edits update the overlay's cornerLngLats
 * live; Copy puts all four "lat, lng" pairs on the clipboard; Reset rebuilds a
 * clean rectangle from the current center/scale/rotation.
 */

import { Copy, RotateCcw } from "lucide-react";
import type { Lang } from "@/components/language-context";

type LL = [number, number]; // [lng, lat]
export type CornerKey = "topLeft" | "topRight" | "bottomRight" | "bottomLeft";

const L = {
  heading: { mr: "Overlay कोपरे (lat/lng)", en: "Overlay corners (lat/lng)" },
  tl: { mr: "वर-डावा", en: "Top-left" },
  tr: { mr: "वर-उजवा", en: "Top-right" },
  br: { mr: "खाली-उजवा", en: "Bottom-right" },
  bl: { mr: "खाली-डावा", en: "Bottom-left" },
  copy: { mr: "Coordinates कॉपी", en: "Copy coordinates" },
  reset: { mr: "कोपरे reset", en: "Reset corners" },
  none: { mr: "आधी भूनकाशा फाइल अपलोड करा.", en: "Upload a BhuNaksha file first." },
  copied: { mr: "कॉपी झाले", en: "Copied" },
} satisfies Record<string, Record<Lang, string>>;

const ROWS: { key: CornerKey; lk: keyof typeof L }[] = [
  { key: "topLeft", lk: "tl" },
  { key: "topRight", lk: "tr" },
  { key: "bottomRight", lk: "br" },
  { key: "bottomLeft", lk: "bl" },
];

export function OverlayCornersPanel({
  lang,
  corners,
  onChange,
  onCopy,
  onReset,
  copied,
}: {
  lang: Lang;
  corners: Record<CornerKey, LL> | null;
  onChange: (key: CornerKey, lngLat: LL) => void;
  onCopy: () => void;
  onReset: () => void;
  copied: boolean;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-black text-slate-900">{L.heading[lang]}</h3>
      {!corners && <p className="text-[12px] font-semibold text-amber-700">{L.none[lang]}</p>}
      {corners && (
        <>
          <div className="space-y-2">
            {ROWS.map(({ key, lk }) => (
              <div key={key} className="grid grid-cols-[auto_1fr_1fr] items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-500">{L[lk][lang]}</span>
                <input
                  type="number" step="0.000001" value={corners[key][1]}
                  aria-label={`${L[lk][lang]} lat`}
                  onChange={(e) => onChange(key, [corners[key][0], Number(e.target.value)])}
                  className="h-8 w-full rounded-md border border-slate-300 px-1.5 text-[11.5px] text-slate-800"
                />
                <input
                  type="number" step="0.000001" value={corners[key][0]}
                  aria-label={`${L[lk][lang]} lng`}
                  onChange={(e) => onChange(key, [Number(e.target.value), corners[key][1]])}
                  className="h-8 w-full rounded-md border border-slate-300 px-1.5 text-[11.5px] text-slate-800"
                />
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={onCopy} className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-2.5 py-1.5 text-[12px] font-bold text-slate-700 transition hover:bg-slate-50">
              <Copy className="size-3.5" /> {copied ? L.copied[lang] : L.copy[lang]}
            </button>
            <button type="button" onClick={onReset} className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-2.5 py-1.5 text-[12px] font-bold text-slate-700 transition hover:bg-slate-50">
              <RotateCcw className="size-3.5" /> {L.reset[lang]}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
