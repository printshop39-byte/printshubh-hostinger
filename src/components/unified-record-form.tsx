"use client";

/**
 * UnifiedRecordForm — gov-site-style single-screen flow:
 *   pick a record type → fill district/taluka/village + survey/mobile →
 *   send a prefilled WhatsApp message. No captcha/login/payment — just
 *   "collect details → WhatsApp".
 *
 * Data reuse (no duplication):
 *   - Service list + prices come from src/lib/pricing-data.ts (same source
 *     as the PricingSection table).
 *   - District→Taluka→Village dropdowns fetch the SAME static files the map
 *     page uses: /data/dropdowns/{districts,talukas,villages}.json. We do NOT
 *     load the heavy 7 MB name-resolution files — the dropdown rows already
 *     carry name_mr / name_en — so this stays light on the homepage.
 *
 * Single-color rule: blue accent + green WhatsApp; everything else neutral.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { FileText, Map as MapIcon, MessageCircle } from "lucide-react";
import { useLang, type Lang } from "@/components/language-context";
import { PRICING_GROUPS, type PriceRow } from "@/lib/pricing-data";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import {
  DISTRICT_ID_FALLBACK_EN,
  DISTRICT_MR_MAP,
  KNOWN_NAME_FIXES,
} from "@/lib/maharashtra-name-map";
import {
  ensureVillageNames,
  getTalukaDisplayNameRow,
  getVillageDisplayNameRow,
} from "@/lib/maharashtra-local-names";
import { trackWhatsAppLead } from "@/components/meta-pixel";
import { trackFunnelEvent, useFunnelViewEvent } from "@/lib/analytics";

interface Row {
  district_id?: string;
  taluka_id?: string;
  village_id?: string;
  name_en?: string;
  name_mr?: string;
}

const ui: Record<
  Lang,
  {
    step1: string;
    step2: string;
    category: string;
    chooseService: string;
    district: string;
    taluka: string;
    village: string;
    survey: string;
    mobile: string;
    note: string;
    cta: string;
    ctaHint: string;
    heading: string;
    sub: string;
    catDoc: string;
    catMap: string;
  }
> = {
  mr: {
    step1: "पायरी १ — सेवा प्रकार निवडा",
    step2: "पायरी २ — माहिती भरा",
    category: "प्रकार",
    chooseService: "सेवा निवडा",
    district: "जिल्हा निवडा",
    taluka: "तालुका निवडा",
    village: "गाव निवडा",
    survey: "सर्वे / गट नंबर (उदा. १२३/अ)",
    mobile: "मोबाईल नंबर",
    note: "अंतिम किंमत निवडलेल्या गाव / गट नंबरनुसार WhatsApp वर आधी सांगितली जाईल.",
    cta: "WhatsApp वर मागवा",
    ctaHint: "गाव आणि १० अंकी मोबाईल नंबर आवश्यक",
    heading: "तुमचा रेकॉर्ड निवडा — WhatsApp वर मागवा",
    sub: "रेकॉर्ड प्रकार निवडा, जिल्हा-तालुका-गाव भरा आणि एका क्लिकवर WhatsApp वर पाठवा.",
    catDoc: "डिजिटल दस्तऐवज",
    catMap: "नकाशे / प्लॅन",
  },
  en: {
    step1: "Step 1 — choose a service type",
    step2: "Step 2 — enter details",
    category: "Type",
    chooseService: "Choose a service",
    district: "Choose district",
    taluka: "Choose taluka",
    village: "Choose village",
    survey: "Survey / Gat number (e.g. 123/A)",
    mobile: "Mobile number",
    note: "The final price (based on the chosen village / gat number) is shared on WhatsApp first.",
    cta: "Request on WhatsApp",
    ctaHint: "Village and a 10-digit mobile number are required",
    heading: "Pick your record — request on WhatsApp",
    sub: "Choose a record type, fill district-taluka-village, and send on WhatsApp in one click.",
    catDoc: "Digital Documents",
    catMap: "Maps / Plans",
  },
};

function titleCase(s?: string): string {
  if (!s) return "";
  return s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}
/** Districts carry empty name_mr + UPPERCASE name_en (or are junk rows).
 *  Resolve a clean English name (with id fallback + byte-fix) and look up
 *  the Marathi name from the small DISTRICT_MR_MAP. */
function districtName(row: Row | undefined, lang: Lang): string {
  if (!row) return "";
  const rawEn = (row.name_en ?? "").trim() || DISTRICT_ID_FALLBACK_EN[row.district_id ?? ""] || "";
  const cleanedEn = titleCase((KNOWN_NAME_FIXES[rawEn] ?? rawEn).trim());
  const mr = (row.name_mr ?? "").trim() || (cleanedEn ? DISTRICT_MR_MAP[cleanedEn] : "");
  return lang === "mr" ? mr || cleanedEn : cleanedEn || mr;
}
/** districts.json has known duplicate rows — keep one per district_id. */
function dedupeById<T extends { district_id?: string }>(rows: T[]): T[] {
  const seen = new Set<string>();
  return rows.filter((r) => {
    const id = r.district_id ?? "";
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

/* Analytics service_key — a FIXED allowlist keyed on the stable internal
 * English service name (`name.en`, which is the <select> value and never
 * changes with language). We never send a translated label or dynamically
 * normalise display text: each value is a curated lowercase slug matching the
 * analytics validator (^[a-z0-9_-]+$) and stays constant across mr/en. An
 * unmapped row simply omits service_key (the sanitizer drops undefined).
 *
 *   UI service (mr / en)                     name.en (internal)                  service_key
 *   ───────────────────────────────────────────────────────────────────────────────────────
 *   7/12 उतारा / 7/12 Extract                "7/12 Extract"                      satbara
 *   8A उतारा / 8A Extract                    "8A Extract"                        8a
 *   फेरफार / Mutation / Ferfar               "Mutation / Ferfar"                 ferfar
 *   मिळकत पत्रिका / Property Card              "Property Card"                     property-card
 *   मिळकत पत्रिका फेरफार / Property Card Mut.   "Property Card Mutation"            property-card-mutation
 *   मुंबई प्रॉपर्टी कार्ड / Mumbai Property Card "Mumbai Property Card"              mumbai-property-card
 *   Index II                                 "Index II"                          index-2
 *   गाव नकाशा / Village Map                   "Village Map"                       village-map
 *   स्वामित्व नकाशा / Swamitva Map             "Swamitva Map"                      swamitva-map
 *   लोकेशन नकाशा / Location Map                "Location Map"                      location-map
 *   नकाशा ओव्हरले / Map Overlay                "Map Overlay"                       map-overlay
 *   नगर रचना नकाशा / Town Planning Map         "Town Planning Map"                 town-planning-map
 *   विकास आराखडा / Development Plan            "Development Plan"                  development-plan
 *   प्रादेशिक आराखडा / Regional Plan           "Regional Plan"                     regional-plan
 *   …Zone-wise Land Report                   "Google Map Zone-wise Land Report"  zone-land-report
 *   संपूर्ण नकाशा विकास अहवाल / Full Map Report  "Full Map Development Report"       full-map-report
 */
const SERVICE_KEY_BY_EN: Record<string, string> = {
  "7/12 Extract": "satbara",
  "8A Extract": "8a",
  "Mutation / Ferfar": "ferfar",
  "Property Card": "property-card",
  "Property Card Mutation": "property-card-mutation",
  "Mumbai Property Card": "mumbai-property-card",
  "Index II": "index-2",
  "Village Map": "village-map",
  "Swamitva Map": "swamitva-map",
  "Location Map": "location-map",
  "Map Overlay": "map-overlay",
  "Town Planning Map": "town-planning-map",
  "Development Plan": "development-plan",
  "Regional Plan": "regional-plan",
  "Google Map Zone-wise Land Report": "zone-land-report",
  "Full Map Development Report": "full-map-report",
};

function serviceKeyOf(row: PriceRow): string | undefined {
  return SERVICE_KEY_BY_EN[row.name.en];
}

export function UnifiedRecordForm() {
  const { lang } = useLang();
  const tx = ui[lang];

  // Fire "enquiry_form_view" once when the form scrolls ~50% into view.
  const sectionRef = useRef<HTMLElement>(null);
  useFunnelViewEvent(sectionRef, "enquiry_form_view", { lang, surface: "unified-form" });

  const [category, setCategory] = useState<"doc" | "map">("doc");
  const group = PRICING_GROUPS.find((g) => g.key === category) ?? PRICING_GROUPS[0];
  // Starts unselected so the form is genuinely "service-first": the select
  // shows the placeholder, not a pre-filled default, and every field below
  // stays hidden until the visitor actually picks something.
  const [service, setService] = useState<PriceRow | null>(null);

  const [districts, setDistricts] = useState<Row[]>([]);
  const [talukas, setTalukas] = useState<Row[]>([]);
  const [villages, setVillages] = useState<Row[]>([]);
  const [districtId, setDistrictId] = useState("");
  const [talukaId, setTalukaId] = useState("");
  const [villageId, setVillageId] = useState("");
  const [survey, setSurvey] = useState("");
  const [mobile, setMobile] = useState("");

  const selectedDistrictRow = districts.find((d) => d.district_id === districtId);
  const selectedTalukaRow = talukas.find((t) => t.taluka_id === talukaId);

  // Load districts once.
  useEffect(() => {
    let alive = true;
    fetch("/data/dropdowns/districts.json")
      .then((r) => (r.ok ? r.json() : []))
      .then((rows: Row[]) => alive && setDistricts(dedupeById(Array.isArray(rows) ? rows : [])))
      .catch(() => alive && setDistricts([]));
    return () => {
      alive = false;
    };
  }, []);

  // Load talukas when the district changes. The dependent taluka/village state
  // is cleared synchronously in handleDistrictChange (a user action), so this
  // effect only fetches. The `alive` flag drops a stale response if the
  // district changes again before this one resolves.
  useEffect(() => {
    if (!districtId) return;
    let alive = true;
    fetch(`/data/dropdowns/talukas/${encodeURIComponent(districtId)}.json`)
      .then((r) => (r.ok ? r.json() : []))
      .then((rows: Row[]) => alive && setTalukas(Array.isArray(rows) ? rows : []))
      .catch(() => alive && setTalukas([]));
    return () => {
      alive = false;
    };
  }, [districtId]);

  // Load villages when the taluka changes. The old village options/selection
  // are cleared synchronously in handleTalukaChange / handleDistrictChange, so
  // this effect only fetches. The `alive` flag drops a stale response — or a
  // late Marathi-name refresh — if the taluka changes again first.
  useEffect(() => {
    if (!districtId || !talukaId) return;
    let alive = true;
    fetch(`/data/dropdowns/villages/${encodeURIComponent(districtId)}/${encodeURIComponent(talukaId)}.json`)
      .then((r) => (r.ok ? r.json() : []))
      .then((rows: Row[]) => alive && setVillages(Array.isArray(rows) ? rows : []))
      .catch(() => alive && setVillages([]));
    // Lazy-load the Marathi village-name file (MAHA, ~1.3 MB, cached) only now
    // — i.e. only once the user has drilled down to a taluka. We deliberately
    // do NOT load the 7 MB LGD file; MAHA covers the village names here. When it
    // resolves, bump the villages array reference so the option labels + the
    // WhatsApp message re-derive with their Marathi names — this reuses the real
    // `villages` dependency instead of a separate re-render counter.
    ensureVillageNames()
      .then(() => alive && setVillages((prev) => [...prev]))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [districtId, talukaId]);

  // Switching category re-asks for a service (the two groups' lists differ),
  // which also collapses every step below back to "not started".
  function pickCategory(key: "doc" | "map") {
    setCategory(key);
    setService(null);
  }

  // Dependent resets live in the change handlers (user actions), not in the
  // load effects. Clearing the old options + selections synchronously here
  // makes the cascade update immediately and keeps the effects focused on
  // fetching the new options.
  function handleDistrictChange(id: string) {
    setTalukas([]);
    setTalukaId("");
    setVillages([]);
    setVillageId("");
    setDistrictId(id);
    // Only a real, non-empty selection counts; the taluka/village resets above
    // are state writes (not their user handlers) so they raise no false events.
    if (id) {
      trackFunnelEvent("enquiry_district_selected", {
        lang,
        surface: "unified-form",
        has_value: true,
        step: 2,
      });
    }
  }
  function handleTalukaChange(id: string) {
    setVillages([]);
    setVillageId("");
    setTalukaId(id);
    if (id) {
      trackFunnelEvent("enquiry_taluka_selected", {
        lang,
        surface: "unified-form",
        has_value: true,
        step: 3,
      });
    }
  }
  function handleVillageChange(id: string) {
    setVillageId(id);
    if (id) {
      trackFunnelEvent("enquiry_village_selected", {
        lang,
        surface: "unified-form",
        has_value: true,
        step: 4,
      });
    }
  }

  const sortedDistricts = useMemo(
    () =>
      districts
        .filter((d) => districtName(d, lang) !== "")
        .sort((a, b) => districtName(a, lang).localeCompare(districtName(b, lang))),
    [districts, lang],
  );
  const sortedTalukas = useMemo(
    () =>
      [...talukas].sort((a, b) =>
        getTalukaDisplayNameRow(a, selectedDistrictRow, lang).localeCompare(
          getTalukaDisplayNameRow(b, selectedDistrictRow, lang),
        ),
      ),
    [talukas, selectedDistrictRow, lang],
  );
  const sortedVillages = useMemo(
    () =>
      [...villages].sort((a, b) =>
        getVillageDisplayNameRow(a, selectedTalukaRow, selectedDistrictRow, lang).localeCompare(
          getVillageDisplayNameRow(b, selectedTalukaRow, selectedDistrictRow, lang),
        ),
      ),
    // Re-sorts once the lazy Marathi names land: that resolution bumps the
    // `villages` reference (see the village effect), which is already listed here.
    [villages, selectedTalukaRow, selectedDistrictRow, lang],
  );

  const waHref = useMemo(() => {
    if (!service) return "";
    const dName = districtName(selectedDistrictRow, lang);
    const tName = talukaId
      ? getTalukaDisplayNameRow(selectedTalukaRow, selectedDistrictRow, lang)
      : "";
    const vName = villageId
      ? getVillageDisplayNameRow(
          villages.find((v) => v.village_id === villageId),
          selectedTalukaRow,
          selectedDistrictRow,
          lang,
        )
      : "";
    const lines =
      lang === "mr"
        ? [
            `नमस्कार PrintShubh, मला ${service.name.mr} हवे आहे.`,
            `जिल्हा: ${dName}`,
            `तालुका: ${tName}`,
            `गाव: ${vName}`,
            `सर्वे / गट नंबर: ${survey}`,
            `मोबाईल: ${mobile}`,
            `कृपया किंमत व वेळ सांगा.`,
          ]
        : [
            `Hello PrintShubh, I need ${service.name.en}.`,
            `District: ${dName}`,
            `Taluka: ${tName}`,
            `Village: ${vName}`,
            `Survey / Gat no.: ${survey}`,
            `Mobile: ${mobile}`,
            `Please share price and time.`,
          ];
    return buildWhatsAppUrl({ message: lines.join("\n"), campaign: "unified-form" });
  }, [service, talukaId, villageId, survey, mobile, villages, selectedDistrictRow, selectedTalukaRow, lang]);

  // Strict gate: a village and a plausible 10-digit mobile number are both
  // required before the WhatsApp CTA activates — the shop wants complete
  // leads over never dead-ending an edge-case visitor.
  const canSubmit = villageId !== "" && /^\d{10}$/.test(mobile);

  // No font-size here: <select>s add text-sm at each usage, but the two
  // free-text <input>s below need text-base (16px) on mobile — a focused
  // input under 16px triggers an unwanted auto-zoom in iOS Safari.
  const fieldClass =
    "h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400";
  const selectClass = `${fieldClass} text-sm`;
  const inputClass = `${fieldClass} text-base sm:text-sm`;

  return (
    <section
      ref={sectionRef}
      id="unified-form"
      className="scroll-mt-20 bg-[#f8fbff] px-4 py-9 sm:px-8 sm:py-12 lg:py-16"
    >
      <div className="mx-auto max-w-3xl">
        <h2 className="text-2xl font-black leading-tight text-slate-950 sm:text-3xl">{tx.heading}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-[15px] sm:leading-7">{tx.sub}</p>

        {/* Step 1 — category + service */}
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{tx.step1}</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {(["doc", "map"] as const).map((key) => {
            const active = category === key;
            const Icon = key === "doc" ? FileText : MapIcon;
            return (
              <button
                key={key}
                type="button"
                onClick={() => pickCategory(key)}
                aria-pressed={active}
                className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-bold transition ${
                  active
                    ? "border-2 border-blue-600 bg-blue-50 text-blue-800"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon className="size-4" />
                {key === "doc" ? tx.catDoc : tx.catMap}
              </button>
            );
          })}
        </div>

        {/* Step 2 — details card. Each field group below only renders once the
            one before it is filled in — "service-first" progressive disclosure.
            Editing an earlier <select> re-collapses everything after it, so
            there's no separate "back" control: changing a choice IS going back. */}
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{tx.step2}</p>
            {service && (
              <span className="rounded-md bg-green-50 px-3 py-1.5 text-sm font-black text-green-700">
                {service.price[lang]}
              </span>
            )}
          </div>

          <label className="mb-3 block">
            <span className="mb-1 block text-[12px] font-bold text-slate-600">{tx.category}</span>
            <select
              className={selectClass}
              value={service?.name.en ?? ""}
              onChange={(e) => {
                const next = group.rows.find((r) => r.name.en === e.target.value) ?? null;
                setService(next);
                if (next) {
                  trackFunnelEvent("enquiry_service_selected", {
                    lang,
                    service_key: serviceKeyOf(next),
                    surface: "unified-form",
                    has_value: true,
                    step: 1,
                  });
                }
              }}
            >
              <option value="">{tx.chooseService}</option>
              {group.rows.map((r) => (
                <option key={r.name.en} value={r.name.en}>
                  {r.name[lang]} · {r.price[lang]}
                </option>
              ))}
            </select>
          </label>

          {service && (
            <div className="ps-enter grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              <select
                className={selectClass}
                value={districtId}
                onChange={(e) => handleDistrictChange(e.target.value)}
              >
                <option value="">{tx.district}</option>
                {sortedDistricts.map((d) => (
                  <option key={d.district_id} value={d.district_id}>
                    {districtName(d, lang)}
                  </option>
                ))}
              </select>

              {districtId && (
                <select
                  className={`${selectClass} ps-enter`}
                  value={talukaId}
                  onChange={(e) => handleTalukaChange(e.target.value)}
                  // Redundant now that the select is only rendered once
                  // districtId is set — kept as a zero-cost safety net.
                  disabled={!districtId}
                >
                  <option value="">{tx.taluka}</option>
                  {sortedTalukas.map((t) => (
                    <option key={t.taluka_id} value={t.taluka_id}>
                      {getTalukaDisplayNameRow(t, selectedDistrictRow, lang)}
                    </option>
                  ))}
                </select>
              )}

              {talukaId && (
                <select
                  className={`${selectClass} ps-enter`}
                  value={villageId}
                  onChange={(e) => handleVillageChange(e.target.value)}
                  disabled={!talukaId}
                >
                  <option value="">{tx.village}</option>
                  {sortedVillages.map((v) => (
                    <option key={v.village_id} value={v.village_id}>
                      {getVillageDisplayNameRow(v, selectedTalukaRow, selectedDistrictRow, lang)}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {service && villageId && (
            <>
              <div className="ps-enter mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <input
                  className={inputClass}
                  placeholder={tx.survey}
                  value={survey}
                  onChange={(e) => setSurvey(e.target.value)}
                />
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  autoComplete="tel"
                  className={inputClass}
                  placeholder={tx.mobile}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                />
              </div>

              <div className="ps-enter mt-4 flex flex-col items-stretch gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
                {canSubmit ? (
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      // Preserve the existing Meta "Contact"; funnel event carries no
                      // message/URL/number — just the stable service_key + step.
                      trackWhatsAppLead();
                      trackFunnelEvent("enquiry_whatsapp_generated", {
                        lang,
                        service_key: serviceKeyOf(service),
                        surface: "unified-form",
                        has_value: true,
                        step: 5,
                      });
                    }}
                    className="order-1 inline-flex h-12 w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-green-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-green-700 sm:order-2 sm:w-auto"
                  >
                    <MessageCircle className="size-4" />
                    {tx.cta}
                  </a>
                ) : (
                  <span
                    aria-disabled="true"
                    className="order-1 inline-flex h-12 w-full shrink-0 cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-green-600 px-5 text-sm font-bold text-white opacity-60 shadow-sm sm:order-2 sm:w-auto"
                  >
                    <MessageCircle className="size-4" />
                    {tx.cta}
                  </span>
                )}
                <p className="order-2 max-w-sm text-xs leading-6 text-slate-500 sm:order-1">
                  {canSubmit ? tx.note : tx.ctaHint}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
