"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  Info,
  Layers,
  MapPin,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { useLang, type Lang } from "@/components/language-context";

/* ── District key type ── */
type DistrictKey = "Mumbai" | "Pune" | "Nashik" | "Nagpur" | "Kolhapur";

/* ── District data ── */
interface DistrictInfo {
  id: DistrictKey;
  nameMr: string;
  nameEn: string;
  talukas: number;
  villages: number;
  services: { mr: string; en: string }[];
  /* Position on the Maharashtra SVG viewBox (0..1000 x 0..700) */
  cx: number;
  cy: number;
  /* Label offset to avoid overlap with marker */
  labelDx: number;
  labelDy: number;
}

const DISTRICTS: DistrictInfo[] = [
  {
    id: "Mumbai",
    nameMr: "मुंबई",
    nameEn: "Mumbai",
    talukas: 3,
    villages: 120,
    services: [
      { mr: "मिळकत पत्रिका", en: "Property Card" },
      { mr: "मुंबई शहर मिळकत पत्रिका", en: "Mumbai City Property Card" },
      { mr: "DP Map", en: "DP Map" },
      { mr: "CTS सहाय्य", en: "CTS Help" },
    ],
    cx: 180,
    cy: 380,
    labelDx: -14,
    labelDy: 22,
  },
  {
    id: "Pune",
    nameMr: "पुणे",
    nameEn: "Pune",
    talukas: 14,
    villages: 1900,
    services: [
      { mr: "7/12 उतारा", en: "7/12 Extract" },
      { mr: "8A उतारा", en: "8A Extract" },
      { mr: "गाव नकाशा", en: "Village Map" },
      { mr: "DP Map", en: "DP Map" },
      { mr: "फेरफार", en: "Mutation" },
    ],
    cx: 320,
    cy: 410,
    labelDx: 18,
    labelDy: 6,
  },
  {
    id: "Nashik",
    nameMr: "नाशिक",
    nameEn: "Nashik",
    talukas: 15,
    villages: 1900,
    services: [
      { mr: "7/12 उतारा", en: "7/12 Extract" },
      { mr: "8A उतारा", en: "8A Extract" },
      { mr: "गाव नकाशा", en: "Village Map" },
      { mr: "जमीन अहवाल", en: "Land Report" },
    ],
    cx: 280,
    cy: 270,
    labelDx: -8,
    labelDy: -16,
  },
  {
    id: "Nagpur",
    nameMr: "नागपूर",
    nameEn: "Nagpur",
    talukas: 14,
    villages: 1800,
    services: [
      { mr: "7/12 उतारा", en: "7/12 Extract" },
      { mr: "8A उतारा", en: "8A Extract" },
      { mr: "मिळकत पत्रिका", en: "Property Card" },
      { mr: "DP Map", en: "DP Map" },
    ],
    cx: 720,
    cy: 290,
    labelDx: 14,
    labelDy: 6,
  },
  {
    id: "Kolhapur",
    nameMr: "कोल्हापूर",
    nameEn: "Kolhapur",
    talukas: 12,
    villages: 1200,
    services: [
      { mr: "7/12 उतारा", en: "7/12 Extract" },
      { mr: "8A उतारा", en: "8A Extract" },
      { mr: "गाव नकाशा", en: "Village Map" },
      { mr: "फेरफार", en: "Mutation" },
    ],
    cx: 290,
    cy: 560,
    labelDx: -8,
    labelDy: 28,
  },
];

/* ── UI translations ── */
const ui: Record<Lang, {
  eyebrow: string;
  heading: string;
  subhead: string;
  selectDistrict: string;
  talukas: string;
  villages: string;
  availableServices: string;
  whatsappCta: string;
  disclaimer: string;
  servicesFocus: string;
  serviceTagline: string;
  focusList: { label: string }[];
  buildWhatsappMsg: (district: string, services: string) => string;
}> = {
  mr: {
    eyebrow: "महाराष्ट्र सेवा कव्हरेज",
    heading: "गाव नकाशा, DP Map आणि जमीन कागदपत्रांसाठी जिल्हानुसार सहाय्य.",
    subhead:
      "जिल्ह्यावर क्लिक करा — तालुके, गावे आणि उपलब्ध सेवा एका क्षणात पाहा.",
    selectDistrict: "जिल्हा निवडा",
    talukas: "तालुके",
    villages: "गावे",
    availableServices: "उपलब्ध सेवा",
    whatsappCta: "WhatsApp वर मागणी करा",
    disclaimer:
      "तालुका/गाव संख्या प्राथमिक संदर्भासाठी आहे. अंतिम माहिती अधिकृत स्रोतांवर अवलंबून असते.",
    servicesFocus: "मुख्य सेवा",
    serviceTagline: "WhatsApp वर सोपी मागणी",
    focusList: [
      { label: "गाव नकाशा" },
      { label: "DP Map" },
      { label: "TP Map" },
      { label: "7/12 उतारा" },
      { label: "8A उतारा" },
      { label: "मिळकत पत्रिका" },
      { label: "जमीन अहवाल" },
    ],
    buildWhatsappMsg: (district, services) =>
      `मला ${district} जिल्ह्यासाठी ${services} सेवा हवी आहे.`,
  },
  en: {
    eyebrow: "Maharashtra Service Coverage",
    heading: "District-wise assistance for Village Map, DP Map and Land Documents.",
    subhead:
      "Click a district to see talukas, villages and available services instantly.",
    selectDistrict: "Select District",
    talukas: "Talukas",
    villages: "Villages",
    availableServices: "Available Services",
    whatsappCta: "Request on WhatsApp",
    disclaimer:
      "Taluka/village counts are indicative. Final information depends on official sources.",
    servicesFocus: "Focus Services",
    serviceTagline: "Simple request on WhatsApp",
    focusList: [
      { label: "Village Map" },
      { label: "DP Map" },
      { label: "TP Map" },
      { label: "7/12 Extract" },
      { label: "8A Extract" },
      { label: "Property Card" },
      { label: "Land Report" },
    ],
    buildWhatsappMsg: (district, services) =>
      `I need ${services} service for ${district} district.`,
  },
};

/* ── Simplified Maharashtra district outline path (decorative SVG, original) ── */
const MAHARASHTRA_OUTLINE =
  "M 120 360 L 150 300 L 200 250 L 260 215 L 320 200 L 380 200 L 440 215 L 520 220 L 600 240 L 680 260 L 760 285 L 820 320 L 870 365 L 890 420 L 880 470 L 850 520 L 810 555 L 760 580 L 700 595 L 640 605 L 580 610 L 520 605 L 460 600 L 400 600 L 340 595 L 290 580 L 240 555 L 200 520 L 165 480 L 140 435 L 125 395 Z";

/* Internal smaller region paths for visual depth (purely decorative) */
const INNER_REGIONS = [
  "M 165 345 L 220 305 L 285 285 L 280 360 L 230 395 L 180 385 Z",
  "M 290 250 L 380 230 L 450 245 L 460 320 L 380 340 L 305 320 Z",
  "M 470 240 L 580 255 L 650 285 L 640 345 L 540 360 L 470 320 Z",
  "M 660 290 L 750 305 L 820 345 L 800 410 L 720 415 L 670 380 Z",
  "M 290 365 L 380 360 L 460 380 L 460 470 L 380 490 L 310 470 Z",
  "M 470 380 L 590 380 L 670 410 L 650 490 L 560 500 L 480 480 Z",
  "M 250 480 L 360 500 L 430 520 L 410 595 L 320 595 L 240 565 Z",
  "M 440 500 L 560 510 L 640 530 L 620 595 L 530 605 L 460 590 Z",
];

export function MaharashtraCoverageMotion() {
  const { lang } = useLang();
  const tx = ui[lang];

  const [activeId, setActiveId] = useState<DistrictKey>("Pune");
  const [autoCycle, setAutoCycle] = useState(true);
  const intervalRef = useRef<number | null>(null);

  const active = useMemo(
    () => DISTRICTS.find((d) => d.id === activeId) ?? DISTRICTS[0],
    [activeId],
  );
  const activeName = lang === "en" ? active.nameEn : active.nameMr;
  const activeServicesList = active.services
    .map((s) => (lang === "en" ? s.en : s.mr))
    .join(", ");
  const whatsappText = encodeURIComponent(
    tx.buildWhatsappMsg(activeName, activeServicesList),
  );
  const whatsappHref = `https://wa.me/918625801907?text=${whatsappText}`;

  /* Auto-cycle */
  useEffect(() => {
    if (!autoCycle) return;
    if (typeof window === "undefined") return;
    intervalRef.current = window.setInterval(() => {
      setActiveId((cur) => {
        const idx = DISTRICTS.findIndex((d) => d.id === cur);
        const next = DISTRICTS[(idx + 1) % DISTRICTS.length];
        return next.id;
      });
    }, 3000);
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [autoCycle]);

  const handleSelect = useCallback((id: DistrictKey) => {
    setAutoCycle(false);
    setActiveId(id);
  }, []);

  return (
    <section
      id="coverage"
      aria-labelledby="coverage-heading"
      className="relative overflow-hidden px-5 py-20 sm:px-8 lg:py-24"
    >
      {/* Soft gradient background — light, premium */}
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[linear-gradient(180deg,#ffffff_0%,#eef6ff_46%,#f1fbf5_100%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_20%,rgba(37,99,235,0.10),transparent_30%),radial-gradient(circle_at_88%_18%,rgba(14,165,233,0.10),transparent_28%),radial-gradient(circle_at_70%_85%,rgba(34,197,94,0.10),transparent_32%)]" />

      <div className="relative mx-auto w-full max-w-7xl">
        <div data-reveal className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-blue-800 shadow-sm backdrop-blur">
            <Sparkles className="size-3.5 text-green-600" />
            {tx.eyebrow}
          </p>
          <h2
            id="coverage-heading"
            className="mt-5 text-3xl font-black leading-tight text-slate-950 sm:text-4xl lg:text-5xl"
          >
            {tx.heading}
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
            {tx.subhead}
          </p>
        </div>

        <div className="mt-12 grid items-start gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          {/* Map column */}
          <div
            data-reveal
            className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-[0_30px_60px_-30px_rgba(15,23,42,0.18)] backdrop-blur sm:p-6"
          >
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(219,234,254,0.55),transparent_45%,rgba(220,252,231,0.45))]" />
            {/* Subtle grid */}
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(37,99,235,0.05)_1px,transparent_1px),linear-gradient(0deg,rgba(37,99,235,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-60" />

            <div className="relative">
              <div className="mb-3 flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                <span className="inline-flex items-center gap-2">
                  <Layers className="size-3.5 text-blue-700" />
                  {lang === "en" ? "Maharashtra" : "महाराष्ट्र"}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-[10px] font-bold text-green-700">
                  <span className="size-1.5 animate-pulse rounded-full bg-green-500" />
                  {autoCycle
                    ? lang === "en"
                      ? "Live"
                      : "Live"
                    : lang === "en"
                      ? "Paused"
                      : "थांबवले"}
                </span>
              </div>

              <div className="relative aspect-[10/7] w-full">
                <svg
                  viewBox="0 0 1000 700"
                  className="absolute inset-0 h-full w-full"
                  role="img"
                  aria-label={
                    lang === "en"
                      ? "Maharashtra district coverage map"
                      : "महाराष्ट्र जिल्हा कव्हरेज नकाशा"
                  }
                >
                  <defs>
                    <linearGradient id="mh-fill" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#dbeafe" />
                      <stop offset="55%" stopColor="#eff6ff" />
                      <stop offset="100%" stopColor="#dcfce7" />
                    </linearGradient>
                    <linearGradient id="mh-stroke" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity="0.55" />
                      <stop offset="100%" stopColor="#16a34a" stopOpacity="0.45" />
                    </linearGradient>
                    <radialGradient id="active-ring" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity="0.55" />
                      <stop offset="55%" stopColor="#22c55e" stopOpacity="0.18" />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  {/* State outline */}
                  <path
                    d={MAHARASHTRA_OUTLINE}
                    fill="url(#mh-fill)"
                    stroke="url(#mh-stroke)"
                    strokeWidth={3}
                    strokeLinejoin="round"
                  />
                  {/* Inner decorative regions */}
                  {INNER_REGIONS.map((d, i) => (
                    <path
                      key={i}
                      d={d}
                      fill="rgba(147,197,253,0.10)"
                      stroke="rgba(37,99,235,0.20)"
                      strokeWidth={1}
                      strokeDasharray="2 3"
                    />
                  ))}

                  {/* District markers */}
                  {DISTRICTS.map((d) => {
                    const isActive = d.id === activeId;
                    return (
                      <g
                        key={d.id}
                        className="cursor-pointer"
                        onClick={() => handleSelect(d.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleSelect(d.id);
                          }
                        }}
                        tabIndex={0}
                        role="button"
                        aria-label={lang === "en" ? d.nameEn : d.nameMr}
                      >
                        {/* Pulse ring (active only) */}
                        {isActive && (
                          <>
                            <circle
                              cx={d.cx}
                              cy={d.cy}
                              r={48}
                              fill="url(#active-ring)"
                            >
                              <animate
                                attributeName="r"
                                values="32;58;32"
                                dur="2.4s"
                                repeatCount="indefinite"
                              />
                              <animate
                                attributeName="opacity"
                                values="0.85;0.15;0.85"
                                dur="2.4s"
                                repeatCount="indefinite"
                              />
                            </circle>
                            <circle
                              cx={d.cx}
                              cy={d.cy}
                              r={22}
                              fill="none"
                              stroke="#16a34a"
                              strokeWidth={1.5}
                              opacity={0.55}
                            >
                              <animate
                                attributeName="r"
                                values="14;30;14"
                                dur="2.4s"
                                repeatCount="indefinite"
                              />
                            </circle>
                          </>
                        )}
                        {/* Marker dot */}
                        <circle
                          cx={d.cx}
                          cy={d.cy}
                          r={isActive ? 10 : 7}
                          fill={isActive ? "#16a34a" : "#2563eb"}
                          stroke="#ffffff"
                          strokeWidth={3}
                          className="transition-all duration-300"
                        />
                        {/* Label chip */}
                        <g
                          transform={`translate(${d.cx + d.labelDx}, ${d.cy + d.labelDy})`}
                        >
                          <rect
                            x={-2}
                            y={4}
                            rx={6}
                            ry={6}
                            width={(lang === "en" ? d.nameEn.length : d.nameMr.length) * 12 + 16}
                            height={22}
                            fill="rgba(255,255,255,0.95)"
                            stroke={isActive ? "#16a34a" : "#bfdbfe"}
                            strokeWidth={isActive ? 1.5 : 1}
                          />
                          <text
                            x={6}
                            y={20}
                            fontSize={14}
                            fontWeight={800}
                            fill={isActive ? "#15803d" : "#1e40af"}
                          >
                            {lang === "en" ? d.nameEn : d.nameMr}
                          </text>
                        </g>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <p className="mt-3 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50/80 px-3 py-2 text-xs leading-5 text-amber-900">
                <Info className="mt-0.5 size-3.5 shrink-0" />
                {tx.disclaimer}
              </p>
            </div>
          </div>

          {/* Pop-up card column */}
          <div className="relative">
            <div
              data-reveal
              key={active.id}
              className="floating-card relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_25px_50px_-25px_rgba(15,23,42,0.20)] sm:p-7"
            >
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(219,234,254,0.55),transparent_50%,rgba(220,252,231,0.45))]" />
              <div className="relative">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
                  <MapPin className="size-3.5" />
                  {tx.selectDistrict}
                </p>
                <h3 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">
                  {activeName}
                </h3>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-700">
                      {tx.talukas}
                    </p>
                    <p className="mt-1 text-2xl font-black text-blue-900 tabular-nums">
                      {active.talukas}
                    </p>
                  </div>
                  <div className="rounded-xl border border-green-100 bg-green-50/70 px-4 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-green-700">
                      {tx.villages}
                    </p>
                    <p className="mt-1 text-2xl font-black text-green-900 tabular-nums">
                      {active.villages.toLocaleString(
                        lang === "en" ? "en-IN" : "mr-IN",
                      )}
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                    {tx.availableServices}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {active.services.map((s) => (
                      <span
                        key={s.en}
                        className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-white px-3 py-1.5 text-xs font-bold text-blue-800 shadow-sm"
                      >
                        <CheckCircle2 className="size-3.5 text-green-600" />
                        {lang === "en" ? s.en : s.mr}
                      </span>
                    ))}
                  </div>
                </div>

                <a
                  href={whatsappHref}
                  className="pointer-events-auto mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 text-base font-black text-white shadow-sm transition hover:bg-green-700"
                >
                  <MessageCircle className="size-5" />
                  {tx.whatsappCta}
                </a>
                <p className="mt-2 text-center text-xs text-slate-500">
                  {tx.serviceTagline}
                </p>
              </div>
            </div>

            {/* Focus services list */}
            <div
              data-reveal
              className="mt-5 rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur"
            >
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                {tx.servicesFocus}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {tx.focusList.map((f) => (
                  <span
                    key={f.label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700"
                  >
                    <Sparkles className="size-3 text-blue-600" />
                    {f.label}
                  </span>
                ))}
              </div>
            </div>

            {/* District quick chips */}
            <div data-reveal className="mt-5 flex flex-wrap gap-2">
              {DISTRICTS.map((d) => {
                const isActive = d.id === activeId;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => handleSelect(d.id)}
                    aria-pressed={isActive}
                    className={`pointer-events-auto inline-flex h-10 items-center gap-1.5 rounded-full border px-4 text-sm font-bold transition ${
                      isActive
                        ? "border-green-500 bg-green-600 text-white shadow-sm"
                        : "border-slate-300 bg-white text-slate-700 hover:border-blue-400 hover:bg-blue-50"
                    }`}
                  >
                    <MapPin className="size-3.5" />
                    {lang === "en" ? d.nameEn : d.nameMr}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .floating-card {
          animation: floatCard 0.55s cubic-bezier(0.22, 1, 0.36, 1);
        }
        @keyframes floatCard {
          0% {
            opacity: 0;
            transform: translateY(10px) scale(0.985);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </section>
  );
}
