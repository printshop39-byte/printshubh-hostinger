"use client";

/**
 * PremiumServiceTabs
 *
 * Premium "service marketplace" homepage section + the primary conversion
 * flow: service card → short form → WhatsApp.
 *
 * Two category tabs (Digital Documents / Maps · Plans) auto-switch every 5s
 * (pause on hover/focus, 15s pause after a manual tab click, 5s progress
 * underline — see globals.css `.ps-tab-progress`). Each card shows a category
 * badge, icon, title, short description, a compact required-details checklist,
 * a top-right price badge, an optional time estimate, and a "माहिती भरा / Fill
 * details" CTA.
 *
 * Clicking a card CTA selects that service and smooth-scrolls to a compact
 * short form rendered directly after the cards (no duplicate service tabs).
 * The form collects only the fields that service needs and hands off to
 * WhatsApp (918625801907) with a prefilled message.
 *
 * Prices/services are the current PrintShubh set and match
 * src/components/pricing-section.tsx. Brand/standard terms (PrintShubh, Google
 * Map, Index II, CTS, DP/TP) stay as-is in both languages. Marathi is the SSR
 * default for SEO.
 */

import { useEffect, useRef, useState } from "react";
import {
  Building2,
  Clock,
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
  time?: Bilingual;
  needs: Record<Lang, string[]>;
  /* Extra form fields this service requires */
  needsMapLink?: boolean;
  needsOverlayType?: boolean;
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

/* Common required-details sets reused across services. */
const NEEDS = {
  village: {
    mr: ["जिल्हा / तालुका / गाव", "गट / सर्वे नंबर"],
    en: ["District / Taluka / Village", "Gat / Survey number"],
  },
  villageOnly: {
    mr: ["जिल्हा / तालुका / गाव"],
    en: ["District / Taluka / Village"],
  },
  cts: {
    mr: ["जिल्हा / शहर", "CTS / प्लॉट नंबर"],
    en: ["District / City", "CTS / Plot number"],
  },
} satisfies Record<string, Record<Lang, string[]>>;

const TIME_FAST: Bilingual = { mr: "10–30 मिनिटे", en: "10–30 min" };
const TIME_MED: Bilingual = { mr: "30 मिनिटे+", en: "30 min+" };

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
        time: TIME_FAST,
        needs: NEEDS.village,
      },
      {
        icon: ClipboardList,
        name: { mr: "8A उतारा", en: "8A Extract" },
        desc: {
          mr: "खाते, जमीनधारक आणि संबंधित नोंदींसाठी.",
          en: "For account, land-holder and related records.",
        },
        price: { mr: "₹30 पासून", en: "From ₹30" },
        time: TIME_FAST,
        needs: NEEDS.village,
      },
      {
        icon: RefreshCw,
        name: { mr: "फेरफार", en: "Mutation / Ferfar" },
        desc: {
          mr: "जमीन/नोंद बदल आणि फेरफार माहिती तपासण्यासाठी.",
          en: "To check land/record changes and mutation details.",
        },
        price: ASK,
        needs: {
          mr: ["जिल्हा / तालुका / गाव", "गट / सर्वे नंबर", "फेरफार नंबर (माहीत असल्यास)"],
          en: ["District / Taluka / Village", "Gat / Survey number", "Mutation no. (if known)"],
        },
      },
      {
        icon: Building2,
        name: { mr: "मिळकत पत्रिका", en: "Property Card" },
        desc: {
          mr: "शहरी मालमत्ता नोंद आणि कार्ड संदर्भासाठी.",
          en: "For urban property records and card reference.",
        },
        price: { mr: "₹100 पासून", en: "From ₹100" },
        time: TIME_MED,
        needs: NEEDS.cts,
      },
      {
        icon: RefreshCw,
        name: { mr: "मिळकत पत्रिका फेरफार", en: "Property Card Mutation" },
        desc: {
          mr: "Property card बदल / फेरफार माहितीसाठी.",
          en: "For property card change / mutation details.",
        },
        price: ASK,
        needs: NEEDS.cts,
      },
      {
        icon: Building2,
        name: { mr: "मुंबई प्रॉपर्टी कार्ड", en: "Mumbai Property Card" },
        desc: {
          mr: "मुंबई शहरातील property card / CTS माहिती.",
          en: "Property card / CTS information for Mumbai city.",
        },
        price: ASK,
        needs: {
          mr: ["विभाग / वॉर्ड", "CTS नंबर"],
          en: ["Division / Ward", "CTS number"],
        },
      },
      {
        icon: Layers,
        name: { mr: "Index II", en: "Index II" },
        desc: {
          mr: "जुने जमीन रेकॉर्ड आणि दस्त नोंद शोधण्यासाठी.",
          en: "To search old land records and deed entries.",
        },
        price: ASK,
        needs: {
          mr: ["दस्त नंबर व वर्ष", "किंवा पक्षकाराचे नाव"],
          en: ["Document no. & year", "or party name"],
        },
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
        needs: NEEDS.villageOnly,
      },
      {
        icon: MapPinned,
        name: { mr: "स्वामित्व नकाशा", en: "Swamitva Map" },
        desc: {
          mr: "स्वामित्व/मोजणी नकाशा संदर्भासाठी.",
          en: "For Swamitva / measurement map reference.",
        },
        price: ASK,
        needs: NEEDS.village,
      },
      {
        icon: MapPinned,
        name: { mr: "लोकेशन नकाशा", en: "Location Map" },
        desc: {
          mr: "प्लॉट/जमिनीचे location map तयार करण्यासाठी.",
          en: "To prepare a location map of plot/land.",
        },
        price: ASK,
        needs: NEEDS.village,
      },
      {
        icon: Layers,
        name: { mr: "नकाशा ओव्हरले", en: "Map Overlay" },
        desc: {
          mr: "जमीन boundary, satellite किंवा plan overlay साठी.",
          en: "For land boundary, satellite or plan overlay.",
        },
        price: ASK,
        needs: {
          mr: ["जिल्हा / गाव / शहर", "गट / सर्वे / Plot / CTS", "Google Map link", "Overlay प्रकार"],
          en: ["District / Village / City", "Gat / Survey / Plot / CTS", "Google Map link", "Overlay type"],
        },
        needsMapLink: true,
        needsOverlayType: true,
      },
      {
        icon: Map,
        name: { mr: "नगर रचना नकाशा", en: "Town Planning Map" },
        desc: {
          mr: "TP / town planning map संदर्भासाठी.",
          en: "For TP / town planning map reference.",
        },
        price: { mr: "₹200 पासून", en: "From ₹200" },
        needs: {
          mr: ["शहर / क्षेत्र", "सर्वे / प्लॉट नंबर"],
          en: ["City / Area", "Survey / Plot number"],
        },
      },
      {
        icon: Map,
        name: { mr: "विकास आराखडा", en: "Development Plan" },
        desc: {
          mr: "Development Plan तपासणीसाठी.",
          en: "For Development Plan checking.",
        },
        price: { mr: "₹200 पासून", en: "From ₹200" },
        needs: {
          mr: ["शहर / क्षेत्र"],
          en: ["City / Area"],
        },
      },
      {
        icon: Map,
        name: { mr: "प्रादेशिक आराखडा", en: "Regional Plan" },
        desc: {
          mr: "Regional Plan / zone संदर्भासाठी.",
          en: "For Regional Plan / zone reference.",
        },
        price: { mr: "₹200 पासून", en: "From ₹200" },
        needs: {
          mr: ["जिल्हा / क्षेत्र"],
          en: ["District / Region"],
        },
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
        needs: {
          mr: ["Google Map link / location", "गाव (माहीत असल्यास)"],
          en: ["Google Map link / location", "Village (if known)"],
        },
        needsMapLink: true,
      },
      {
        icon: Layers,
        name: { mr: "संपूर्ण नकाशा विकास अहवाल", en: "Full Map Development Report" },
        desc: {
          mr: "map + planning + zone combined report साठी.",
          en: "For a combined map + planning + zone report.",
        },
        price: { mr: "₹200 पासून", en: "From ₹200" },
        needs: NEEDS.village,
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
  mr: "सेवा निवडा, खाली माहिती भरा आणि WhatsApp वर पाठवा — किंमत आधी कळेल.",
  en: "Pick a service, fill the details below and send on WhatsApp — know the price first.",
};
const ctaLabel: Bilingual = { mr: "माहिती भरा", en: "Fill details" };
const needsLabel: Bilingual = { mr: "लागणारी माहिती", en: "Required details" };

/* ── Short-form copy ── */
const formTitle: Bilingual = { mr: "जमीन माहिती भरा", en: "Fill land information" };
const selectedLabel: Bilingual = { mr: "निवडलेली सेवा:", en: "Selected service:" };
const formSend: Bilingual = { mr: "WhatsApp वर पाठवा", en: "Send on WhatsApp" };
const fieldLabels = {
  district: { mr: "जिल्हा", en: "District" },
  taluka: { mr: "तालुका", en: "Taluka" },
  village: { mr: "गाव / शहर", en: "Village / City" },
  ref: { mr: "गट / सर्वे / Plot / CTS", en: "Gat / Survey / Plot / CTS" },
  mapLink: { mr: "Google Map link", en: "Google Map link" },
  overlay: { mr: "Overlay प्रकार", en: "Overlay type" },
  note: { mr: "टीप (ऐच्छिक)", en: "Note (optional)" },
} satisfies Record<string, Bilingual>;
const overlayPlaceholder: Bilingual = {
  mr: "उदा. satellite / plan / boundary",
  en: "e.g. satellite / plan / boundary",
};

const AUTO_SWITCH_MS = 5000;
const MANUAL_PAUSE_MS = 15000;

type FormState = {
  district: string;
  taluka: string;
  village: string;
  ref: string;
  mapLink: string;
  overlay: string;
  note: string;
};

const EMPTY_FORM: FormState = {
  district: "",
  taluka: "",
  village: "",
  ref: "",
  mapLink: "",
  overlay: "",
  note: "",
};

function buildFormMessage(service: Service, f: FormState, lang: Lang): string {
  const lines: string[] = [];
  if (lang === "mr") {
    lines.push(`नमस्कार PrintShubh, मला ${service.name.mr} हवी आहे.`);
    if (f.district.trim()) lines.push(`जिल्हा: ${f.district.trim()}`);
    if (f.taluka.trim()) lines.push(`तालुका: ${f.taluka.trim()}`);
    if (f.village.trim()) lines.push(`गाव/शहर: ${f.village.trim()}`);
    if (f.ref.trim()) lines.push(`गट/सर्वे/Plot/CTS: ${f.ref.trim()}`);
    if (service.needsMapLink && f.mapLink.trim()) lines.push(`Google Map link: ${f.mapLink.trim()}`);
    if (service.needsOverlayType && f.overlay.trim()) lines.push(`Overlay प्रकार: ${f.overlay.trim()}`);
    if (f.note.trim()) lines.push(`टीप: ${f.note.trim()}`);
    lines.push("कृपया किंमत आणि वेळ सांगा.");
  } else {
    lines.push(`Hello PrintShubh, I need ${service.name.en}.`);
    if (f.district.trim()) lines.push(`District: ${f.district.trim()}`);
    if (f.taluka.trim()) lines.push(`Taluka: ${f.taluka.trim()}`);
    if (f.village.trim()) lines.push(`Village/City: ${f.village.trim()}`);
    if (f.ref.trim()) lines.push(`Gat/Survey/Plot/CTS: ${f.ref.trim()}`);
    if (service.needsMapLink && f.mapLink.trim()) lines.push(`Google Map link: ${f.mapLink.trim()}`);
    if (service.needsOverlayType && f.overlay.trim()) lines.push(`Overlay type: ${f.overlay.trim()}`);
    if (f.note.trim()) lines.push(`Note: ${f.note.trim()}`);
    lines.push("Please share price and time.");
  }
  return lines.join("\n");
}

export function PremiumServiceTabs() {
  const { lang } = useLang();
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [manualPaused, setManualPaused] = useState(false);
  const manualTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Short-form state: default to the first service so the form is usable even
   * before a card CTA is clicked (e.g. on desktop). */
  const [selected, setSelected] = useState<Service>(groups[0].services[0]);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const formRef = useRef<HTMLDivElement | null>(null);

  const paused = hovered || manualPaused;
  const count = groups.length;

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

  function pauseAuto() {
    setManualPaused(true);
    if (manualTimer.current) clearTimeout(manualTimer.current);
    manualTimer.current = setTimeout(() => setManualPaused(false), MANUAL_PAUSE_MS);
  }

  function selectTab(index: number) {
    setActive(index);
    pauseAuto();
  }

  /* Card CTA → pick service, pause auto-switch, smooth-scroll to the form. */
  function openForm(service: Service) {
    setSelected(service);
    pauseAuto();
    requestAnimationFrame(() => {
      const reduce =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      formRef.current?.scrollIntoView({
        behavior: reduce ? "auto" : "smooth",
        block: "start",
      });
    });
  }

  function setField(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const activeGroup = groups[active];
  const waHref = whatsappHref(buildFormMessage(selected, form, lang));

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
                className={`relative shrink-0 overflow-hidden rounded-xl border px-5 py-3 text-sm font-bold transition ${
                  isActive
                    ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-700"
                }`}
              >
                <span className="flex items-center gap-2">
                  <TabIcon className="size-4" aria-hidden="true" />
                  {g.label[lang]}
                </span>
                {isActive && (
                  <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1 bg-white/30">
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

        {/* Active panel — mobile: horizontal snap-scroll; sm+: grid (no shift) */}
        <div
          key={active}
          id={`service-panel-${activeGroup.id}`}
          role="tabpanel"
          aria-labelledby={`service-tab-${activeGroup.id}`}
          className="mt-6 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3"
          style={{ scrollbarWidth: "none" }}
        >
          {activeGroup.services.map((service, i) => {
            const Icon = service.icon;
            const isSelected = service === selected;
            return (
              <article
                key={service.name.en}
                className={`ps-card-in relative flex w-[82%] shrink-0 snap-start flex-col rounded-3xl border bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-900/10 sm:w-auto ${
                  isSelected ? "border-blue-500 ring-1 ring-blue-200" : "border-slate-200 hover:border-blue-300"
                }`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {/* Price badge — top-right */}
                <span className="absolute right-4 top-4 max-w-[45%] rounded-full border border-green-200 bg-green-50 px-3 py-1 text-right text-xs font-black leading-tight text-green-700">
                  {service.price[lang]}
                </span>

                <div className="grid size-12 place-items-center rounded-2xl bg-blue-50 text-blue-700">
                  <Icon className="size-6" aria-hidden="true" />
                </div>

                {/* Category badge */}
                <span className="mt-4 inline-flex w-fit items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  {activeGroup.label[lang]}
                </span>

                <h3 className="mt-2 pr-16 text-lg font-bold text-slate-950">{service.name[lang]}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{service.desc[lang]}</p>

                {service.time && (
                  <p className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">
                    <Clock className="size-3.5" aria-hidden="true" />
                    {service.time[lang]}
                  </p>
                )}

                {/* Required-details checklist (inside the card) */}
                <div className="mt-4">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                    {needsLabel[lang]}
                  </p>
                  <ul className="mt-1.5 space-y-1">
                    {service.needs[lang].map((n) => (
                      <li key={n} className="flex items-start gap-2 text-[13px] leading-5 text-slate-600">
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-blue-400" aria-hidden="true" />
                        {n}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => openForm(service)}
                  className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-green-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-green-700 sm:mt-auto"
                >
                  <MessageCircle className="size-4" aria-hidden="true" />
                  {ctaLabel[lang]}
                </button>
              </article>
            );
          })}
        </div>

        {/* ── Short form (primary conversion path) ── */}
        <div ref={formRef} className="mt-10 scroll-mt-24">
          <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            {/* Compact header with selected-service badge */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-xl font-black text-slate-950">{formTitle[lang]}</h3>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800">
                {selectedLabel[lang]} {selected.name[lang]}
              </span>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field
                label={fieldLabels.district[lang]}
                value={form.district}
                onChange={(v) => setField("district", v)}
              />
              <Field
                label={fieldLabels.taluka[lang]}
                value={form.taluka}
                onChange={(v) => setField("taluka", v)}
              />
              <Field
                label={fieldLabels.village[lang]}
                value={form.village}
                onChange={(v) => setField("village", v)}
              />
              <Field
                label={fieldLabels.ref[lang]}
                value={form.ref}
                onChange={(v) => setField("ref", v)}
              />
              {selected.needsMapLink && (
                <Field
                  label={fieldLabels.mapLink[lang]}
                  value={form.mapLink}
                  onChange={(v) => setField("mapLink", v)}
                  className="sm:col-span-2"
                  type="url"
                  placeholder="https://maps.app.goo.gl/..."
                />
              )}
              {selected.needsOverlayType && (
                <Field
                  label={fieldLabels.overlay[lang]}
                  value={form.overlay}
                  onChange={(v) => setField("overlay", v)}
                  placeholder={overlayPlaceholder[lang]}
                />
              )}
              <Field
                label={fieldLabels.note[lang]}
                value={form.note}
                onChange={(v) => setField("note", v)}
                className="sm:col-span-2"
              />
            </div>

            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 text-[15px] font-bold text-white shadow-sm transition hover:bg-green-700"
            >
              <MessageCircle className="size-5" aria-hidden="true" />
              {formSend[lang]}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  className = "",
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-[13px] font-bold text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-[15px] text-slate-800 placeholder:text-slate-400 transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}
