"use client";

/**
 * Admin — Control-point georeferencing panel (Priority 2: multi-reference
 * alignment + accuracy).
 *
 * Workflow per control point: click the FEATURE on the BhuNaksha image (captures
 * a pixel point), then click the SAME feature on the live map (captures a
 * lng/lat). With ≥2 complete pairs the overlay is fitted by a least-squares
 * similarity (2 pts) / affine (3+ pts) transform; the fit's RMS residual drives
 * an accuracy score. Admin-only.
 */

import { Crosshair, MapPinned, Trash2 } from "lucide-react";
import type { Lang } from "@/components/language-context";

export type Gcp = {
  id: string;
  imagePoint: [number, number]; // natural pixels
  mapLngLat?: [number, number];
  label?: string;
};

const L = {
  heading: { mr: "Control-point Georeference (multi-reference)", en: "Control-point Georeference (multi-reference)" },
  noOverlay: { mr: "आधी भूनकाशा फाइल अपलोड करा.", en: "Upload a BhuNaksha file first." },
  step: {
    mr: "1) प्रतिमेवर खूण क्लिक करा  2) नकाशावर तीच खूण क्लिक करा.",
    en: "1) Click a feature on the image  2) click the same feature on the map.",
  },
  imgHint: { mr: "प्रतिमेवर बिंदू क्लिक करा", en: "Click a point on the image" },
  armMap: { mr: "नकाशावर क्लिक करा…", en: "Click the map…" },
  setMap: { mr: "नकाशा बिंदू सेट करा", en: "Set map point" },
  pending: { mr: "नकाशा बाकी", en: "map pending" },
  done: { mr: "पूर्ण", en: "set" },
  label: { mr: "लेबल", en: "Label" },
  del: { mr: "हटवा", en: "Delete" },
  empty: { mr: "अजून control points नाहीत.", en: "No control points yet." },
  pairs: { mr: "पूर्ण pairs", en: "Complete pairs" },
  apply: { mr: "Georeference apply करा", en: "Apply georeference" },
  guidance: { mr: "2 = similarity · 3+ = affine (least-squares).", en: "2 = similarity · 3+ = affine (least-squares)." },
  accuracy: { mr: "अचूकता", en: "Accuracy" },
  method: { mr: "पद्धत", en: "Method" },
  rms: { mr: "RMS त्रुटी", en: "RMS error" },
} satisfies Record<string, Record<Lang, string>>;

export function GeoreferencePanel({
  lang,
  imageDataUrl,
  naturalWidthPx,
  naturalHeightPx,
  gcps,
  armId,
  accuracyScore,
  alignmentMethod,
  alignmentRmsMeters,
  onAddImagePoint,
  onArmMap,
  onUpdateLabel,
  onDelete,
  onApply,
}: {
  lang: Lang;
  imageDataUrl?: string;
  naturalWidthPx?: number;
  naturalHeightPx?: number;
  gcps: Gcp[];
  armId: string | null;
  accuracyScore?: number;
  alignmentMethod?: string;
  alignmentRmsMeters?: number;
  onAddImagePoint: (px: [number, number]) => void;
  onArmMap: (id: string) => void;
  onUpdateLabel: (id: string, label: string) => void;
  onDelete: (id: string) => void;
  onApply: () => void;
}) {
  const completeCount = gcps.filter((g) => g.mapLngLat).length;
  const canApply = completeCount >= 2;
  const natW = naturalWidthPx || 1;
  const natH = naturalHeightPx || 1;

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const px = ((e.clientX - rect.left) / rect.width) * natW;
    const py = ((e.clientY - rect.top) / rect.height) * natH;
    onAddImagePoint([Math.round(px), Math.round(py)]);
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-2 flex items-center gap-1.5 text-sm font-black text-slate-900">
        <MapPinned className="size-4" /> {L.heading[lang]}
      </h3>

      {!imageDataUrl && <p className="text-[12px] font-semibold text-amber-700">{L.noOverlay[lang]}</p>}

      {imageDataUrl && (
        <>
          <p className="mb-2 text-[11px] leading-4 text-slate-500">{L.step[lang]}</p>

          {/* Clickable image with existing image-point dots */}
          <div className="relative inline-block w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageDataUrl}
              alt={L.imgHint[lang]}
              onClick={handleImageClick}
              className="block max-h-56 w-full cursor-crosshair rounded-md border border-slate-300 object-contain"
            />
            <div className="pointer-events-none absolute inset-0">
              {gcps.map((g, i) => (
                <span
                  key={g.id}
                  className={`absolute -ml-2 -mt-2 flex size-4 items-center justify-center rounded-full text-[9px] font-black text-white ${
                    g.id === armId ? "bg-amber-500" : g.mapLngLat ? "bg-emerald-600" : "bg-blue-600"
                  }`}
                  style={{ left: `${(g.imagePoint[0] / natW) * 100}%`, top: `${(g.imagePoint[1] / natH) * 100}%` }}
                >
                  {i + 1}
                </span>
              ))}
            </div>
          </div>

          {/* Pairs list */}
          <div className="mt-3 space-y-2">
            {gcps.length === 0 && <p className="text-[12px] font-semibold text-slate-400">{L.empty[lang]}</p>}
            {gcps.map((g, i) => (
              <div key={g.id} className="flex items-center gap-2 rounded-lg border border-slate-200 p-2">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[10px] font-black text-white">{i + 1}</span>
                <input
                  type="text"
                  value={g.label ?? ""}
                  placeholder={L.label[lang]}
                  onChange={(e) => onUpdateLabel(g.id, e.target.value)}
                  className="h-7 min-w-0 flex-1 rounded-md border border-slate-300 px-2 text-[12px] text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => onArmMap(g.id)}
                  className={`shrink-0 rounded-md border px-2 py-1 text-[11px] font-bold transition ${
                    g.id === armId
                      ? "border-amber-500 bg-amber-500 text-white"
                      : g.mapLngLat
                        ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                        : "border-slate-300 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {g.id === armId ? L.armMap[lang] : g.mapLngLat ? `✓ ${L.done[lang]}` : L.setMap[lang]}
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(g.id)}
                  className="shrink-0 rounded-md border border-red-200 px-1.5 py-1 text-red-700 transition hover:bg-red-50"
                  aria-label={L.del[lang]}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-3 border-t border-slate-200 pt-3">
            <p className="text-[12px] font-bold text-slate-600">
              {L.pairs[lang]}: <span className="text-emerald-700">{completeCount}</span>
            </p>
            <p className="mt-0.5 text-[11px] text-slate-500">{L.guidance[lang]}</p>
            <button
              type="button"
              onClick={onApply}
              disabled={!canApply}
              className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-blue-700 px-3 py-2 text-[12px] font-bold text-white transition hover:bg-blue-800 disabled:opacity-40"
            >
              <Crosshair className="size-3.5" /> {L.apply[lang]}
            </button>

            {typeof accuracyScore === "number" && (
              <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-2.5 text-[12px] font-semibold text-slate-700">
                <div className="flex items-center justify-between">
                  <span>{L.accuracy[lang]}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-black text-white ${
                      accuracyScore >= 80 ? "bg-emerald-600" : accuracyScore >= 55 ? "bg-amber-500" : "bg-red-500"
                    }`}
                  >
                    {accuracyScore}%
                  </span>
                </div>
                <div className="mt-1 flex justify-between text-[11px] text-slate-500">
                  <span>{L.method[lang]}: {alignmentMethod ?? "—"}</span>
                  {typeof alignmentRmsMeters === "number" && <span>{L.rms[lang]}: {alignmentRmsMeters.toFixed(2)} m</span>}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
