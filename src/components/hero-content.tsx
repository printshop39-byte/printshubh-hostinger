"use client";

import { useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  FileCheck2,
  FileText,
  Landmark,
  MapPinned,
  MessageCircle,
  ScanLine,
  ShieldCheck,
} from "lucide-react";
import { useLang, type Lang } from "@/components/language-context";
import { HeroMotionBackground } from "@/components/hero-motion-background";
import {
  LocationAutocomplete,
  type LocationSelection,
} from "@/components/location-autocomplete";

/* ── Translations ── */
const t: Record<Lang, {
  badge: string;
  h1Line1: string;
  h1Line2: string;
  subheadline: string;
  cta1: string;
  cta2: string;
  trustLine: string;
  trustItems: string[];
  processItems: Array<{ title: string; detail: string }>;
  quickSteps: Array<{ step: string; label: string }>;
  quickDocs: string[];
  cardLabel: string;
  cardMH: string;
  quickPreview: string;
  svgPune: string;
  svgIndia: string;
  footerSourceVerify: string;
  footerDocGuidance: string;
  footerMapRef: string;
  whatsappMessage: string;
  cta1Href: string;
  cta2Message: string;
}> = {
  mr: {
    badge: "महाराष्ट्रासाठी मराठी-प्रथम जमीन सहाय्य",
    h1Line1: "गाव नकाशा, DP Map आणि जमीन",
    h1Line2: "कागदपत्रांसाठी जिल्हानुसार सहाय्य",
    subheadline:
      "नकाशावर pin टाका, अक्षांश/रेखांश मिळवा — 7/12, 8A, गाव नकाशा, फेरफार, मिळकत पत्रिका आणि जमीन अहवालासाठी WhatsApp सहाय्य.",
    cta1: "सेवा निवडा",
    cta2: "WhatsApp वर विचारा",
    trustLine:
      "मागील ३० वर्षांपासून नकाशे, जमीन अभिलेख आणि सरकारी कागदपत्र प्रक्रियेचा अनुभव असलेल्या टीमकडून महाराष्ट्रासाठी विश्वासार्ह सहाय्य.",
    trustItems: [
      "सोपी प्रक्रिया",
      "WhatsApp वर PDF",
      "महाराष्ट्रभर सेवा",
      "अधिकृत स्रोतांवर आधारित सहाय्य",
    ],
    processItems: [
      {
        title: "स्थान निवडा",
        detail: "जिल्हा, तालुका आणि गावाचा संदर्भ व्यवस्थित नोंदवा.",
      },
      {
        title: "सेवा ठरवा",
        detail: "7/12 उतारा, 8A उतारा, नकाशा, मिळकत पत्रिका किंवा जमीन अहवाल निवडा.",
      },
      {
        title: "WhatsApp वर पाठवा",
        detail: "तुमच्या विनंतीनुसार पुढील सहाय्याची दिशा मिळवा.",
      },
    ],
    quickSteps: [
      { step: "01", label: "जिल्हा निवडा" },
      { step: "02", label: "सेवा निवडा" },
      { step: "03", label: "WhatsApp वर मागवा" },
    ],
    quickDocs: ["7/12 उतारा", "8A उतारा", "मिळकत पत्रिका"],
    cardLabel: "जमीन कागदपत्र प्रक्रिया",
    cardMH: "MH",
    quickPreview: "झटपट झलक",
    svgPune: "पुणे",
    svgIndia: "भारत",
    footerSourceVerify: "स्रोत पडताळणी",
    footerDocGuidance: "दस्तऐवज दिशा",
    footerMapRef: "नकाशा संदर्भ",
    whatsappMessage: "मला जमीन कागदपत्र सेवेसाठी मदत हवी आहे",
    cta1Href: "#map-reference",
    cta2Message: "मला 7%2F12 किंवा जमीन कागदपत्रांसाठी मदत हवी आहे",
  },
  en: {
    badge: "Marathi-first Land Assistance for Maharashtra",
    h1Line1: "District-wise assistance for Village Map,",
    h1Line2: "DP Map and Land Documents",
    subheadline:
      "Drop a pin on the map, get latitude/longitude — get assistance for 7/12, 8A, Village Map, Mutation, Property Card and Land Report via WhatsApp.",
    cta1: "Choose Service",
    cta2: "Ask on WhatsApp",
    trustLine:
      "Trusted assistance for Maharashtra, backed by 30 years of experience in maps, land records, and government document workflows.",
    trustItems: [
      "Simple Process",
      "PDF on WhatsApp",
      "Service Across Maharashtra",
      "Assistance Based on Official Sources",
    ],
    processItems: [
      {
        title: "Select Location",
        detail: "Enter district, taluka and village reference correctly.",
      },
      {
        title: "Choose Service",
        detail: "Select 7/12 Extract, 8A Extract, Map, Property Card or Land Report.",
      },
      {
        title: "Send on WhatsApp",
        detail: "Get guidance on next steps as per your request.",
      },
    ],
    quickSteps: [
      { step: "01", label: "Select District" },
      { step: "02", label: "Select Service" },
      { step: "03", label: "Request on WhatsApp" },
    ],
    quickDocs: ["7/12 Extract", "8A Extract", "Property Card"],
    cardLabel: "Land Record Flow",
    cardMH: "MH",
    quickPreview: "Quick Preview",
    svgPune: "Pune",
    svgIndia: "India",
    footerSourceVerify: "Source Verification",
    footerDocGuidance: "Document Guidance",
    footerMapRef: "Map Reference",
    whatsappMessage: "I need help with land document services",
    cta1Href: "#map-reference",
    cta2Message: "I need help with 7%2F12 or land documents",
  },
};

const quickStepColors = [
  "text-blue-700 bg-blue-50 border-blue-200",
  "text-indigo-700 bg-indigo-50 border-indigo-200",
  "text-green-700 bg-green-50 border-green-200",
];

const quickStepIcons = [MapPinned, FileText, MessageCircle];

const quickDocColors = [
  "border-blue-200 bg-blue-50 text-blue-800",
  "border-indigo-200 bg-indigo-50 text-indigo-800",
  "border-green-200 bg-green-50 text-green-800",
];

export function HeroContent() {
  const { lang } = useLang();
  const tx = t[lang];

  /* Hero quick-preview searchable location selection */
  const [heroSelection, setHeroSelection] = useState<LocationSelection | null>(null);

  const selectionLabel = heroSelection
    ? heroSelection.kind === "village" && heroSelection.village
      ? `${heroSelection.village[lang]}, ${heroSelection.taluka![lang]}, ${heroSelection.district[lang]}`
      : heroSelection.kind === "taluka" && heroSelection.taluka
        ? `${heroSelection.taluka[lang]}, ${heroSelection.district[lang]}`
        : heroSelection.district[lang]
    : null;

  const whatsappMessageWithSelection = selectionLabel
    ? lang === "mr"
      ? `नमस्कार, मला ${selectionLabel} साठी जमीन कागदपत्र सेवा हवी आहे.`
      : `Hello, I need land document service for ${selectionLabel}.`
    : tx.whatsappMessage;

  const whatsappCta2Href = `https://wa.me/918625801907?text=${encodeURIComponent(whatsappMessageWithSelection)}`;

  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden border-b border-slate-200 bg-[#f8fbff]">
      {/* Premium Welta.ai-inspired animated background */}
      <HeroMotionBackground />

      <div
        id="top"
        className="relative z-10 mx-auto grid w-full max-w-7xl gap-10 px-5 pb-14 pt-8 sm:px-8 lg:grid-cols-[0.98fr_1.02fr] lg:items-center lg:pb-22 lg:pt-14"
      >
        {/* Left — hero text: no data-reveal so LCP element renders immediately */}
        <div className="max-w-3xl">
          <p className="mb-5 inline-flex items-center gap-2 rounded-md border border-blue-200 bg-white px-3 py-2 text-sm font-bold text-blue-800 shadow-sm">
            <MapPinned className="size-4" />
            {tx.badge}
          </p>
          <h1 className="text-4xl font-black leading-[1.12] tracking-normal text-slate-950 sm:text-6xl lg:text-7xl">
            {tx.h1Line1}
            <br />
            {tx.h1Line2}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700 sm:text-xl">
            {tx.subheadline}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={tx.cta1Href}
              className="pointer-events-auto inline-flex h-[52px] items-center justify-center gap-2 rounded-md bg-blue-700 px-5 text-base font-bold text-white shadow-sm transition hover:bg-blue-800"
            >
              {tx.cta1}
              <ArrowRight className="size-4" />
            </a>
            <a
              href={whatsappCta2Href}
              className="pointer-events-auto inline-flex h-[52px] items-center justify-center gap-2 rounded-md bg-green-600 px-5 text-base font-bold text-white shadow-sm transition hover:bg-green-700"
            >
              <MessageCircle className="size-4" />
              {tx.cta2}
            </a>
          </div>

          <div
            data-reveal
            className="mt-8 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3.5 shadow-sm"
          >
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-blue-700" />
            <p className="text-[15px] font-semibold leading-7 text-blue-900">
              {tx.trustLine}
            </p>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {tx.trustItems.map((item) => (
              <div
                data-reveal
                key={item}
                className="flex min-h-16 items-center gap-3 rounded-md border border-slate-200 bg-white px-4 py-3 shadow-sm"
              >
                <ShieldCheck className="size-5 shrink-0 text-green-600" />
                <p className="text-base font-semibold leading-6 text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right — hero card */}
        <div data-reveal className="relative min-h-[480px] lg:min-h-[580px]">
          <div className="relative h-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg shadow-blue-900/8">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(219,234,254,0.8),transparent_42%,rgba(220,252,231,0.55))]" />

            <div className="relative z-10 flex h-full flex-col justify-between p-5 sm:p-7">
              <div className="flex items-center justify-between gap-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                <span>{tx.cardLabel}</span>
                <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-blue-800">{tx.cardMH}</span>
              </div>

              <div className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
                {/* Process steps */}
                <div className="space-y-4">
                  {tx.processItems.map((item, index) => (
                    <div
                      data-reveal
                      key={item.title}
                      className="rounded-md border border-slate-200 bg-white px-4 py-4 shadow-sm transition hover:border-blue-300"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-3 text-base font-bold text-slate-900">
                          <span className="grid size-8 place-items-center rounded-md bg-blue-100 text-sm font-black text-blue-800">
                            {index + 1}
                          </span>
                          {item.title}
                        </span>
                        <FileCheck2 className="size-4 text-green-600" />
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-600">{item.detail}</p>
                    </div>
                  ))}
                </div>

                {/* Quick Preview */}
                <div className="relative min-h-72 overflow-hidden rounded-lg border border-slate-200 bg-white p-5">
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(219,234,254,0.55),transparent_50%,rgba(220,252,231,0.35))]" />
                  <div className="relative flex h-full flex-col gap-4">

                    {/* Header */}
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                      <span>{tx.quickPreview}</span>
                      <BadgeCheck className="size-4 text-green-600" />
                    </div>

                    {/* Searchable location autocomplete */}
                    <LocationAutocomplete
                      size="sm"
                      onSelect={setHeroSelection}
                    />
                    {selectionLabel && (
                      <div className="flex items-start gap-2 rounded-md border border-blue-200 bg-blue-50/70 px-2.5 py-2 text-[11px] font-bold text-blue-900">
                        <MapPinned className="mt-0.5 size-3.5 shrink-0" />
                        <span className="line-clamp-2">{selectionLabel}</span>
                      </div>
                    )}

                    {/* Maharashtra mini-map SVG */}
                    <div className="flex justify-center">
                      <svg
                        viewBox="0 0 200 160"
                        className="h-28 w-auto"
                        aria-label="Maharashtra map preview"
                        role="img"
                      >
                        <defs>
                          <pattern id="mh-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(37,99,235,0.12)" strokeWidth="0.5" />
                          </pattern>
                        </defs>
                        <rect width="200" height="160" fill="url(#mh-grid)" />
                        {/* Maharashtra outline */}
                        <polygon
                          points="38,50 72,34 112,40 144,28 172,46 158,72 182,98 144,113 132,137 92,126 62,139 46,112 20,99 40,77"
                          fill="rgba(219,234,254,0.85)"
                          stroke="rgba(37,99,235,0.45)"
                          strokeWidth="1.5"
                          strokeLinejoin="round"
                        />
                        {/* Inner tint */}
                        <polygon
                          points="52,62 82,50 112,54 138,44 158,60 146,78 166,96 142,107 130,124 96,116 68,126 54,104 34,93 50,75"
                          fill="rgba(147,197,253,0.22)"
                        />
                        {/* District dots */}
                        <circle cx="64" cy="78" r="3" fill="#2563eb" opacity="0.7" />
                        <circle cx="104" cy="68" r="3" fill="#2563eb" opacity="0.7" />
                        <circle cx="118" cy="100" r="3.5" fill="#16a34a" stroke="#fff" strokeWidth="1.2" />
                        <circle cx="92" cy="130" r="3" fill="#2563eb" opacity="0.7" />
                        <circle cx="148" cy="72" r="3" fill="#2563eb" opacity="0.7" />
                        {/* Pune label */}
                        <rect x="121" y="93" width="28" height="13" rx="3" fill="rgba(255,255,255,0.95)" stroke="rgba(37,99,235,0.3)" strokeWidth="0.8" />
                        <text x="135" y="103" textAnchor="middle" fontSize="7" fontWeight="700" fill="#1e40af">{tx.svgPune}</text>
                        {/* Route line India → MH */}
                        <line x1="10" y1="10" x2="64" y2="78" stroke="rgba(37,99,235,0.35)" strokeWidth="1" strokeDasharray="3,3" />
                        <circle cx="10" cy="10" r="2.5" fill="#f59e0b" stroke="#fff" strokeWidth="1" />
                        <text x="16" y="14" fontSize="6" fontWeight="700" fill="#92400e">{tx.svgIndia}</text>
                      </svg>
                    </div>

                    {/* 3-step flow */}
                    <div className="flex flex-col gap-1.5">
                      {tx.quickSteps.map((s, i) => {
                        const Icon = quickStepIcons[i];
                        return (
                          <div
                            key={s.step}
                            className={`flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-bold ${quickStepColors[i]}`}
                          >
                            <span className="shrink-0 font-black opacity-60">{s.step}</span>
                            <Icon className="size-3.5 shrink-0" />
                            <span>{s.label}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Document chips */}
                    <div className="flex flex-wrap gap-1.5">
                      {tx.quickDocs.map((label, i) => (
                        <span
                          key={label}
                          className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[10px] font-bold ${quickDocColors[i]}`}
                        >
                          <FileText className="size-3 shrink-0" />
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 border-t border-slate-200 pt-5 sm:grid-cols-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                  <BadgeCheck className="size-4 text-green-600" />
                  {tx.footerSourceVerify}
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                  <Landmark className="size-4 text-blue-700" />
                  {tx.footerDocGuidance}
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                  <ScanLine className="size-4 text-sky-600" />
                  {tx.footerMapRef}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
