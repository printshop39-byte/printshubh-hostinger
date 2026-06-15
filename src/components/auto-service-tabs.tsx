"use client";

/**
 * AutoServiceTabs
 *
 * Dynamic, auto-switching services section for the homepage. Two category
 * tabs — Digital Documents / Maps · Plans — each showing PrintShubh's current
 * service cards (icon, name, short description, starting price / ask, and a
 * WhatsApp CTA).
 *
 * Behaviour
 *   - Auto-switch between tabs every 5s.
 *   - Pause while the pointer is over the section (hover) or keyboard focus is
 *     inside it.
 *   - Pause for at least 15s after a manual tab click.
 *   - Active tab has a 5s progress underline (synced to the switch window;
 *     freezes while paused). Under prefers-reduced-motion the underline is
 *     shown full and the entrance animation is skipped, but auto-switch
 *     (a content change, not motion) still works.
 *   - Cards: subtle staggered entrance on each switch; mobile = horizontal
 *     snap-scroll, sm+ = grid (no layout shift on switch).
 *
 * Pricing/services are the current PrintShubh set and match
 * src/components/pricing-section.tsx. Brand/standard terms (PrintShubh, Google
 * Map, Index II, CTS) stay as-is in both languages.
 */

import { useEffect, useRef, useState } from "react";
import {
  Building2,
  ClipboardList,
  FileText,
  Layers,
  Map,
  MapPinned,
  MessageCircle,
  RefreshCw,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLang, type Lang } from "@/components/language-context";
import { whatsappHref } from "@/lib/whatsapp";

type Bilingual = Record<Lang, string>;
type Service = {
  icon: LucideIcon;
  name: Bilingual;
  desc: Bilingual;
  price: Bilingual;
};
type TabGroup = {
  id: string;
  label: Bilingual;
  icon: LucideIcon;
  services: Service[];
};

const ASK: Bilingual = {
  mr: "WhatsApp वर किंमत विचारा",
  en: "Ask price on WhatsApp",
};

const groups: TabGroup[] = [
  {
    id: "digital",
    label: { mr: "डिजिटल दस्तऐवज", en: "Digital Documents" },
    icon: FileText,
    services: [
      {
        icon: FileText,
        name: { mr: "7/12 उतारा", en: "7/12 Extract" },
        desc: {
          mr: "जमीन गट, धारक, क्षेत्र आणि पीक नोंदी तपासण्यासाठी.",
          en: "To check land plot, holder, area and crop records.",
        },
        price: { mr: "₹30 पासून", en: "From ₹30" },
      },
      {
        icon: ClipboardList,
        name: { mr: "8A उतारा", en: "8A Extract" },
        desc: {
          mr: "खाते, जमीनधारक आणि संबंधित नोंदींसाठी.",
          en: "For account, land-holder and related records.",
        },
        price: { mr: "₹30 पासून", en: "From ₹30" },
      },
      {
        icon: RefreshCw,
        name: { mr: "फेरफार", en: "Mutation / Ferfar" },
        desc: {
          mr: "जमीन/नोंद बदल आणि फेरफार माहिती तपासण्यासाठी.",
          en: "To check land/record changes and mutation details.",
        },
        price: ASK,
      },
      {
        icon: Building2,
        name: { mr: "मिळकत पत्रिका", en: "Property Card" },
        desc: {
          mr: "शहरी मालमत्ता नोंद आणि कार्ड संदर्भासाठी.",
          en: "For urban property records and card reference.",
        },
        price: { mr: "₹100 पासून", en: "From ₹100" },
      },
      {
        icon: RefreshCw,
        name: { mr: "मिळकत पत्रिका फेरफार", en: "Property Card Mutation" },
        desc: {
          mr: "Property card बदल / फेरफार माहितीसाठी.",
          en: "For property card change / mutation details.",
        },
        price: ASK,
      },
      {
        icon: Building2,
        name: { mr: "मुंबई प्रॉपर्टी कार्ड", en: "Mumbai Property Card" },
        desc: {
          mr: "मुंबई शहरातील property card / CTS माहिती.",
          en: "Property card / CTS information for Mumbai city.",
        },
        price: ASK,
      },
      {
        icon: Layers,
        name: { mr: "Index II", en: "Index II" },
        desc: {
          mr: "जुने जमीन रेकॉर्ड आणि दस्त नोंद शोधण्यासाठी.",
          en: "To search old land records and deed entries.",
        },
        price: ASK,
      },
    ],
  },
  {
    id: "maps",
    label: { mr: "नकाशे / प्लॅन", en: "Maps / Plans" },
    icon: Map,
    services: [
      {
        icon: Map,
        name: { mr: "गाव नकाशा", en: "Village Map" },
        desc: {
          mr: "गाव/शिवार नकाशा संदर्भ तपासण्यासाठी.",
          en: "To check village/shivar map reference.",
        },
        price: { mr: "₹300 पासून", en: "From ₹300" },
      },
      {
        icon: MapPinned,
        name: { mr: "स्वामित्व नकाशा", en: "Swamitva Map" },
        desc: {
          mr: "स्वामित्व/मोजणी नकाशा संदर्भासाठी.",
          en: "For Swamitva / measurement map reference.",
        },
        price: ASK,
      },
      {
        icon: MapPinned,
        name: { mr: "लोकेशन नकाशा", en: "Location Map" },
        desc: {
          mr: "प्लॉट/जमिनीचे location map तयार करण्यासाठी.",
          en: "To prepare a location map of plot/land.",
        },
        price: ASK,
      },
      {
        icon: Layers,
        name: { mr: "नकाशा ओव्हरले", en: "Map Overlay" },
        desc: {
          mr: "जमीन boundary, satellite किंवा plan overlay साठी.",
          en: "For land boundary, satellite or plan overlay.",
        },
        price: ASK,
      },
      {
        icon: Map,
        name: { mr: "नगर रचना नकाशा", en: "Town Planning Map" },
        desc: {
          mr: "TP / town planning map संदर्भासाठी.",
          en: "For TP / town planning map reference.",
        },
        price: { mr: "₹200 पासून", en: "From ₹200" },
      },
      {
        icon: Map,
        name: { mr: "विकास आराखडा", en: "Development Plan" },
        desc: {
          mr: "Development Plan तपासणीसाठी.",
          en: "For Development Plan checking.",
        },
        price: { mr: "₹200 पासून", en: "From ₹200" },
      },
      {
        icon: Map,
        name: { mr: "प्रादेशिक आराखडा", en: "Regional Plan" },
        desc: {
          mr: "Regional Plan / zone संदर्भासाठी.",
          en: "For Regional Plan / zone reference.",
        },
        price: { mr: "₹200 पासून", en: "From ₹200" },
      },
      {
        icon: MapPinned,
        name: {
          mr: "Google Map नुसार झोन-निहाय जमीन अहवाल",
          en: "Google Map Zone-wise Land Report",
        },
        desc: {
          mr: "Google location वरून zone report साठी.",
          en: "For a zone report from a Google location.",
        },
        price: { mr: "₹200 पासून", en: "From ₹200" },
      },
      {
        icon: Layers,
        name: { mr: "संपूर्ण नकाशा विकास अहवाल", en: "Full Map Development Report" },
        desc: {
          mr: "map + planning + zone combined report साठी.",
          en: "For a combined map + planning + zone report.",
        },
        price: { mr: "₹200 पासून", en: "From ₹200" },
      },
    ],
  },
];

const sectionLabel: Bilingual = { mr: "सेवा", en: "Services" };
const sectionHeading: Bilingual = {
  mr: "जमीन कागदपत्रांसाठी आवश्यक सेवा एका ठिकाणी.",
  en: "All essential services for land documents in one place.",
};
const sectionSubtext: Bilingual = {
  mr: "प्रत्येक विनंतीसाठी योग्य स्रोत, दस्तऐवज प्रकार आणि पुढील कृती स्पष्ट करून दिली जाते.",
  en: "For each request, the right source, document type and next steps are clearly explained.",
};
const ctaLabel: Bilingual = { mr: "WhatsApp वर विचारा", en: "Ask on WhatsApp" };

const AUTO_SWITCH_MS = 5000;
const MANUAL_PAUSE_MS = 15000;

function buildWaMessage(name: Bilingual, lang: Lang): string {
  return lang === "mr"
    ? `नमस्कार PrintShubh, मला ${name.mr} हवी आहे.\nजिल्हा: \nतालुका: \nगाव: \nगट/सर्वे नंबर: \nकृपया किंमत आणि वेळ सांगा.`
    : `Hello PrintShubh, I need ${name.en}.\nDistrict: \nTaluka: \nVillage: \nGut/Survey no.: \nPlease share price and time.`;
}

export function AutoServiceTabs() {
  const { lang } = useLang();
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [manualPaused, setManualPaused] = useState(false);
  const manualTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const paused = hovered || manualPaused;
  const count = groups.length;

  /* Auto-switch timer. Recreated whenever `active` or `paused` changes:
   * pausing clears it; resuming starts a fresh full window, which the
   * progress underline mirrors via its `${active}-${paused}` key. */
  useEffect(() => {
    if (paused) return;
    const id = setTimeout(() => {
      setActive((a) => (a + 1) % count);
    }, AUTO_SWITCH_MS);
    return () => clearTimeout(id);
  }, [active, paused, count]);

  useEffect(() => {
    return () => {
      if (manualTimer.current) clearTimeout(manualTimer.current);
    };
  }, []);

  function selectTab(index: number) {
    setActive(index);
    setManualPaused(true);
    if (manualTimer.current) clearTimeout(manualTimer.current);
    manualTimer.current = setTimeout(() => setManualPaused(false), MANUAL_PAUSE_MS);
  }

  const activeGroup = groups[active];

  return (
    <section
      id="services"
      className="bg-[#f8fbff] px-5 py-20 sm:px-8 lg:py-24"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={() => setHovered(false)}
    >
      <div className="mx-auto max-w-7xl">
        <div data-reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">
              {sectionLabel[lang]}
            </p>
            <h2 className="mt-3 max-w-3xl text-3xl font-black leading-tight text-slate-950 sm:text-5xl">
              {sectionHeading[lang]}
            </h2>
          </div>
          <p className="max-w-md text-base leading-7 text-slate-600">{sectionSubtext[lang]}</p>
        </div>

        {/* Tab bar */}
        <div
          role="tablist"
          aria-label={sectionLabel[lang]}
          className="mt-10 flex gap-3 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none" }}
        >
          {groups.map((g, i) => {
            const TabIcon = g.icon;
            const isActive = i === active;
            return (
              <button
                key={g.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`service-panel-${g.id}`}
                id={`service-tab-${g.id}`}
                onClick={() => selectTab(i)}
                className={`relative shrink-0 overflow-hidden rounded-lg border px-5 py-3 text-sm font-bold transition ${
                  isActive
                    ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-700"
                }`}
              >
                <span className="flex items-center gap-2">
                  <TabIcon className="size-4" aria-hidden="true" />
                  {g.label[lang]}
                </span>
                {/* 5s progress underline on the active tab */}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-1 bg-white/30"
                  >
                    <span
                      key={`${active}-${paused}`}
                      className="ps-tab-progress block h-full w-full bg-white"
                      style={{ animationPlayState: paused ? "paused" : "running" }}
                    />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active panel. `key={active}` remounts the grid so the staggered
            entrance animation replays on each switch. */}
        <div
          key={active}
          id={`service-panel-${activeGroup.id}`}
          role="tabpanel"
          aria-labelledby={`service-tab-${activeGroup.id}`}
          className="mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3"
          style={{ scrollbarWidth: "none" }}
        >
          {activeGroup.services.map((service, i) => {
            const Icon = service.icon;
            const waHref = whatsappHref(buildWaMessage(service.name, lang));
            return (
              <article
                key={service.name.en}
                className="ps-card-in flex min-h-56 w-[80%] shrink-0 snap-start flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md sm:w-auto"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="grid size-11 place-items-center rounded-md bg-blue-50 text-blue-700">
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-slate-950">{service.name[lang]}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{service.desc[lang]}</p>
                <div className="mt-auto pt-3">
                  <p className="text-sm font-black text-green-700">{service.price[lang]}</p>
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-green-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-green-700"
                  >
                    <MessageCircle className="size-4" aria-hidden="true" />
                    {ctaLabel[lang]}
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
