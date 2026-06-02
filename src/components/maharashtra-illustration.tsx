"use client";

import { BadgeCheck, Landmark, ScanLine } from "lucide-react";
import { useLang, type Lang } from "@/components/language-context";
import { HeroMaharashtraMapSlider } from "@/components/hero-maharashtra-map-slider";

/* ── i18n for the illustration card ───────────────────────────────────
 *
 * Card-local strings live here (not in hero-content) so this component
 * can be dropped onto district landing pages later without dragging the
 * full hero copy along. The map visual itself (divisions + districts) is
 * a separate component, HeroMaharashtraMapSlider, with its own labels. */
const t: Record<Lang, {
  cardLabel: string;
  cardMH: string;
  visualTitle: string;
  visualSubtitle: string;
  pillDistrict: string;
  pillTaluka: string;
  pillVillage: string;
  pillSatbara: string;
  pill8A: string;
  pillFerfar: string;
  visualDisclaimer: string;
  footerSourceVerify: string;
  footerDocGuidance: string;
  footerMapRef: string;
}> = {
  mr: {
    cardLabel: "जमीन कागदपत्र प्रक्रिया",
    cardMH: "MH",
    visualTitle: "महाराष्ट्र जिल्हानुसार जमीन डिजिटल सेवा",
    visualSubtitle: "जिल्हा → तालुका → गाव निवडा",
    pillDistrict: "जिल्हा",
    pillTaluka: "तालुका",
    pillVillage: "गाव",
    pillSatbara: "7/12",
    pill8A: "8A",
    pillFerfar: "फेरफार",
    visualDisclaimer: "हे दृश्य केवळ संदर्भासाठी आहे.",
    footerSourceVerify: "स्रोत पडताळणी",
    footerDocGuidance: "दस्तऐवज दिशा",
    footerMapRef: "नकाशा संदर्भ",
  },
  en: {
    cardLabel: "Land Record Flow",
    cardMH: "MH",
    visualTitle: "Maharashtra district-wise land digital service",
    visualSubtitle: "Select district → taluka → village",
    pillDistrict: "जिल्हा",
    pillTaluka: "तालुका",
    pillVillage: "गाव",
    pillSatbara: "7/12",
    pill8A: "8A",
    pillFerfar: "फेरफार",
    visualDisclaimer: "Illustration for reference only.",
    footerSourceVerify: "Source Verification",
    footerDocGuidance: "Document Guidance",
    footerMapRef: "Map Reference",
  },
};

/**
 * MaharashtraIllustration — hero visual card.
 *
 * Card chrome (rounded-3xl, glass background, subtle 3D tilt) plus a header,
 * workflow pills, the Maharashtra map slider (HeroMaharashtraMapSlider:
 * division + district slides), a reference disclaimer and a footer trust
 * strip. The live district/taluka/village picker lives separately in
 * MapReferenceSection.
 */
export function MaharashtraIllustration() {
  const { lang } = useLang();
  const tx = t[lang];

  return (
    <div
      className="relative min-h-[420px] sm:min-h-[480px] lg:min-h-[580px]"
      data-reveal
    >
      <div className="relative h-full overflow-hidden rounded-3xl border border-white/60 bg-white/70 shadow-xl shadow-blue-900/15 backdrop-blur-md [transform:perspective(1000px)_rotateY(-2deg)_rotateX(1deg)]">
        {/* Soft blue/green gradient wash */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(219,234,254,0.85),transparent_42%,rgba(220,252,231,0.65))]" />

        <div className="relative z-10 flex h-full flex-col gap-4 p-4 sm:gap-5 sm:p-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                {tx.cardLabel}
              </p>
              <h2 className="mt-1 text-lg font-black leading-snug text-slate-900 sm:text-xl">
                {tx.visualTitle}
              </h2>
              <p className="mt-1 text-xs font-semibold text-slate-600 sm:text-sm">
                {tx.visualSubtitle}
              </p>
            </div>
            <span className="shrink-0 rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-800">
              {tx.cardMH}
            </span>
          </div>

          {/* Floating workflow pills */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {[
              { label: tx.pillDistrict, cls: "border-blue-200 bg-blue-50 text-blue-800" },
              { label: tx.pillTaluka, cls: "border-indigo-200 bg-indigo-50 text-indigo-800" },
              { label: tx.pillVillage, cls: "border-emerald-200 bg-emerald-50 text-emerald-800" },
              { label: tx.pillSatbara, cls: "border-amber-200 bg-amber-50 text-amber-800" },
              { label: tx.pill8A, cls: "border-rose-200 bg-rose-50 text-rose-800" },
              { label: tx.pillFerfar, cls: "border-sky-200 bg-sky-50 text-sky-800" },
            ].map((p) => (
              <span
                key={p.label}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold shadow-sm sm:text-xs ${p.cls}`}
              >
                {p.label}
              </span>
            ))}
          </div>

          {/* ── Real Maharashtra map slider (divisions + districts) ── */}
          <div className="flex flex-1 items-center justify-center">
            <HeroMaharashtraMapSlider />
          </div>

          {/* Disclaimer */}
          <p className="text-center text-[11px] font-semibold italic text-slate-500 sm:text-xs">
            {tx.visualDisclaimer}
          </p>

          {/* Footer trust strip */}
          <div className="grid gap-2 border-t border-slate-200/70 pt-3 text-xs font-semibold text-slate-600 sm:grid-cols-3 sm:gap-3 sm:pt-4 sm:text-sm">
            <div className="flex items-center gap-2">
              <BadgeCheck className="size-4 shrink-0 text-green-600" />
              <span className="truncate">{tx.footerSourceVerify}</span>
            </div>
            <div className="flex items-center gap-2">
              <Landmark className="size-4 shrink-0 text-blue-700" />
              <span className="truncate">{tx.footerDocGuidance}</span>
            </div>
            <div className="flex items-center gap-2">
              <ScanLine className="size-4 shrink-0 text-sky-600" />
              <span className="truncate">{tx.footerMapRef}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
