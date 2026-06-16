"use client";

/**
 * Admin — Location Navigator (Section 10).
 * District → Taluka → Village resolver (shared public LGD data) + lat/long
 * go-to + Google Map link + map zoom / fit controls + "add as reference point".
 * Presentational: all map actions are delegated via callbacks.
 */

import { useState } from "react";
import { Crosshair, Locate, Maximize, MinusSquare, Navigation, PlusSquare } from "lucide-react";
import type { Lang } from "@/components/language-context";
import type { DistrictRow, TalukaRow, VillageRow, LgdExtent } from "@/components/admin/use-lgd-location";

const L = {
  heading: { mr: "स्थान नेव्हिगेटर", en: "Location Navigator" },
  selectChain: { mr: "जिल्हा → तालुका → गाव निवडा", en: "Select District → Taluka → Village" },
  district: { mr: "जिल्हा निवडा", en: "Choose district" },
  taluka: { mr: "तालुका निवडा", en: "Choose taluka" },
  village: { mr: "गाव निवडा", en: "Choose village" },
  lat: { mr: "Latitude", en: "Latitude" },
  lng: { mr: "Longitude", en: "Longitude" },
  goLatLng: { mr: "Lat/Long वर जा", en: "Go to Lat/Long" },
  goGoogle: { mr: "Google Map link वर जा", en: "Go to Google Map link" },
  zoomIn: { mr: "Zoom +", en: "Zoom +" },
  zoomOut: { mr: "Zoom -", en: "Zoom -" },
  resetNorth: { mr: "उत्तर reset", en: "Reset north" },
  zoomLevel: { mr: "Zoom पातळी", en: "Zoom level" },
  goVillage: { mr: "निवडलेल्या गावावर जा", en: "Go to selected village" },
  fitBoundary: { mr: "Boundary वर fit करा", en: "Fit to boundary" },
  fitOverlay: { mr: "Overlay वर fit करा", en: "Fit to overlay" },
  addRef: { mr: "संदर्भ बिंदू म्हणून जोडा", en: "Add as reference point" },
  approxNote: { mr: "नेमकी गाव सीमा उपलब्ध नाही — तालुका extent (अंदाजे) दाखवले.", en: "Exact village boundary not available — showing taluka extent (approximate)." },
  accuracy: {
    mr: "गाव/lat-long location अंदाजे असू शकते. अंतिम हद्द आणि मोजणी अधिकृत मोजणी/महसूल विभागाकडून पडताळावी.",
    en: "Village/lat-long location may be approximate. Final boundary and measurement must be verified by the official survey/revenue department.",
  },
  noGoogle: { mr: "केसमध्ये Google Map link नाही.", en: "No Google Map link on the case." },
} satisfies Record<string, Record<Lang, string>>;

export interface LocationNavigatorProps {
  lang: Lang;
  districts: DistrictRow[];
  talukas: TalukaRow[];
  villages: VillageRow[];
  districtId: string;
  talukaId: string;
  villageId: string;
  selectDistrict: (id: string) => void;
  selectTaluka: (id: string) => void;
  selectVillage: (id: string) => void;
  districtLabel: (d: DistrictRow) => string;
  talukaLabel: (t: TalukaRow) => string;
  villageLabel: (v: VillageRow) => string;
  extent: LgdExtent | null;
  currentZoom: number;
  hasGoogleLink: boolean;
  googleMsg: string | null;
  hasBoundary: boolean;
  hasOverlay: boolean;
  canAddRef: boolean;
  onGoLatLng: (lat: number, lng: number) => void;
  onGoGoogle: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetNorth: () => void;
  onGoVillage: () => void;
  onFitBoundary: () => void;
  onFitOverlay: () => void;
  onAddRef: () => void;
}

export function LocationNavigatorPanel(props: LocationNavigatorProps) {
  const { lang } = props;
  const [latText, setLatText] = useState("");
  const [lngText, setLngText] = useState("");

  function handleGo() {
    // Accept a pasted "lat, lng" in the lat field too.
    let latStr = latText.trim();
    let lngStr = lngText.trim();
    if (latStr.includes(",") && !lngStr) {
      const [a, b] = latStr.split(",");
      latStr = a.trim();
      lngStr = (b ?? "").trim();
    }
    if (!latStr || !lngStr) return;
    const lat = Number(latStr);
    const lng = Number(lngStr);
    if (Number.isFinite(lat) && Number.isFinite(lng)) props.onGoLatLng(lat, lng);
  }

  return (
    <section className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 shadow-sm">
      <h3 className="mb-2 flex items-center gap-1.5 text-sm font-black text-slate-900">
        <Navigation className="size-4 text-blue-700" /> {L.heading[lang]}
      </h3>

      {/* District → Taluka → Village */}
      <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-blue-700">{L.selectChain[lang]}</p>
      <div className="grid grid-cols-1 gap-2">
        <select value={props.districtId} onChange={(e) => props.selectDistrict(e.target.value)}
          className="h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-[13px] font-semibold text-slate-800">
          <option value="">{L.district[lang]}</option>
          {props.districts.map((d) => <option key={d.district_id} value={d.district_id}>{props.districtLabel(d)}</option>)}
        </select>
        <select value={props.talukaId} onChange={(e) => props.selectTaluka(e.target.value)} disabled={!props.districtId}
          className="h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-[13px] font-semibold text-slate-800 disabled:opacity-50">
          <option value="">{L.taluka[lang]}</option>
          {props.talukas.map((t) => <option key={t.taluka_id} value={t.taluka_id}>{props.talukaLabel(t)}</option>)}
        </select>
        <select value={props.villageId} onChange={(e) => props.selectVillage(e.target.value)} disabled={!props.talukaId}
          className="h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-[13px] font-semibold text-slate-800 disabled:opacity-50">
          <option value="">{L.village[lang]}</option>
          {props.villages.map((v) => <option key={v.village_id} value={v.village_id}>{props.villageLabel(v)}</option>)}
        </select>
      </div>

      {props.extent?.approximate && <p className="mt-1.5 text-[11px] font-semibold text-amber-700">{L.approxNote[lang]}</p>}

      {/* Lat / Long */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <label className="block"><span className="text-[10px] font-bold text-slate-500">{L.lat[lang]}</span>
          <input type="text" inputMode="decimal" value={latText} placeholder="16.704798" onChange={(e) => setLatText(e.target.value)} className="h-8 w-full rounded-md border border-slate-300 px-2 text-[12px]" /></label>
        <label className="block"><span className="text-[10px] font-bold text-slate-500">{L.lng[lang]}</span>
          <input type="text" inputMode="decimal" value={lngText} placeholder="74.105401" onChange={(e) => setLngText(e.target.value)} className="h-8 w-full rounded-md border border-slate-300 px-2 text-[12px]" /></label>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" onClick={handleGo} className="inline-flex items-center gap-1.5 rounded-md bg-blue-700 px-2.5 py-1.5 text-[12px] font-bold text-white transition hover:bg-blue-800">
          <Locate className="size-3.5" /> {L.goLatLng[lang]}
        </button>
        <button type="button" onClick={props.onGoGoogle} disabled={!props.hasGoogleLink} className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-2.5 py-1.5 text-[12px] font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40">
          {L.goGoogle[lang]}
        </button>
        <button type="button" onClick={props.onAddRef} disabled={!props.canAddRef} className="inline-flex items-center gap-1.5 rounded-md border border-emerald-300 px-2.5 py-1.5 text-[12px] font-bold text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-40">
          <Crosshair className="size-3.5" /> {L.addRef[lang]}
        </button>
      </div>
      {!props.hasGoogleLink && <p className="mt-1 text-[11px] text-slate-400">{L.noGoogle[lang]}</p>}
      {props.googleMsg && <p className="mt-1 text-[11px] font-semibold text-amber-700">{props.googleMsg}</p>}

      {/* Zoom + fit controls */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button type="button" onClick={props.onZoomIn} className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1.5 text-[12px] font-bold text-slate-700 hover:bg-slate-50"><PlusSquare className="size-3.5" /> {L.zoomIn[lang]}</button>
        <button type="button" onClick={props.onZoomOut} className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1.5 text-[12px] font-bold text-slate-700 hover:bg-slate-50"><MinusSquare className="size-3.5" /> {L.zoomOut[lang]}</button>
        <button type="button" onClick={props.onResetNorth} className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1.5 text-[12px] font-bold text-slate-700 hover:bg-slate-50">{L.resetNorth[lang]}</button>
        <span className="rounded-md bg-slate-100 px-2 py-1.5 text-[12px] font-bold text-slate-600">{L.zoomLevel[lang]}: {props.currentZoom.toFixed(1)}</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" onClick={props.onGoVillage} disabled={!props.extent} className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2.5 py-1.5 text-[12px] font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"><Maximize className="size-3.5" /> {L.goVillage[lang]}</button>
        <button type="button" onClick={props.onFitBoundary} disabled={!props.hasBoundary} className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2.5 py-1.5 text-[12px] font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"><Maximize className="size-3.5" /> {L.fitBoundary[lang]}</button>
        <button type="button" onClick={props.onFitOverlay} disabled={!props.hasOverlay} className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2.5 py-1.5 text-[12px] font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"><Maximize className="size-3.5" /> {L.fitOverlay[lang]}</button>
      </div>

      <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-2 text-[11px] leading-4 text-amber-900">{L.accuracy[lang]}</p>
    </section>
  );
}
