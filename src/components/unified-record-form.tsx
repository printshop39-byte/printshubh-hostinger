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

import { useEffect, useMemo, useState } from "react";
import { FileText, Map as MapIcon, MessageCircle } from "lucide-react";
import { useLang, type Lang } from "@/components/language-context";
import { PRICING_GROUPS, type PriceRow } from "@/lib/pricing-data";
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

interface Row {
  district_id?: string;
  taluka_id?: string;
  village_id?: string;
  name_en?: string;
  name_mr?: string;
}

const WA_NUMBER = "918625801907";

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

export function UnifiedRecordForm() {
  const { lang } = useLang();
  const tx = ui[lang];

  const [category, setCategory] = useState<"doc" | "map">("doc");
  const group = PRICING_GROUPS.find((g) => g.key === category) ?? PRICING_GROUPS[0];
  const [service, setService] = useState<PriceRow>(PRICING_GROUPS[0].rows[0]);

  const [districts, setDistricts] = useState<Row[]>([]);
  const [talukas, setTalukas] = useState<Row[]>([]);
  const [villages, setVillages] = useState<Row[]>([]);
  const [districtId, setDistrictId] = useState("");
  const [talukaId, setTalukaId] = useState("");
  const [villageId, setVillageId] = useState("");
  const [survey, setSurvey] = useState("");
  const [mobile, setMobile] = useState("");
  // Bumped once the lazy Marathi village-name file resolves, to re-render
  // the village options + WhatsApp message with their Marathi labels.
  const [namesTick, setNamesTick] = useState(0);

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

  // Load talukas when district changes.
  useEffect(() => {
    setTalukas([]);
    setTalukaId("");
    setVillages([]);
    setVillageId("");
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

  // Load villages when taluka changes.
  useEffect(() => {
    setVillages([]);
    setVillageId("");
    if (!districtId || !talukaId) return;
    let alive = true;
    fetch(`/data/dropdowns/villages/${encodeURIComponent(districtId)}/${encodeURIComponent(talukaId)}.json`)
      .then((r) => (r.ok ? r.json() : []))
      .then((rows: Row[]) => alive && setVillages(Array.isArray(rows) ? rows : []))
      .catch(() => alive && setVillages([]));
    // Lazy-load the Marathi village-name file (MAHA, ~1.3 MB, cached) only now
    // — i.e. only once the user has drilled down to a taluka. We deliberately
    // do NOT load the 7 MB LGD file; MAHA covers the village names here.
    ensureVillageNames()
      .then(() => alive && setNamesTick((t) => t + 1))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [districtId, talukaId]);

  // Switching category resets the selected service to that group's first item.
  function pickCategory(key: "doc" | "map") {
    setCategory(key);
    const g = PRICING_GROUPS.find((x) => x.key === key);
    if (g) setService(g.rows[0]);
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
    // namesTick: re-sort once Marathi names finish loading.
    [villages, selectedTalukaRow, selectedDistrictRow, lang, namesTick],
  );

  const waHref = useMemo(() => {
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
    const msg = encodeURIComponent(lines.join("\n"));
    return `https://wa.me/${WA_NUMBER}?text=${msg}&utm_source=printshubh&utm_medium=whatsapp&utm_campaign=unified-form`;
  }, [service, talukaId, villageId, survey, mobile, villages, selectedDistrictRow, selectedTalukaRow, lang, namesTick]);

  const selectClass =
    "h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400";

  return (
    <section className="bg-[#f8fbff] px-5 py-12 sm:px-8 lg:py-16">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-2xl font-black leading-tight text-slate-950 sm:text-3xl">{tx.heading}</h2>
        <p className="mt-2 text-[15px] leading-7 text-slate-600">{tx.sub}</p>

        {/* Step 1 — category + service */}
        <p className="mt-7 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{tx.step1}</p>
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

        {/* Step 2 — details card */}
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{tx.step2}</p>
            <span className="rounded-md bg-green-50 px-3 py-1.5 text-sm font-black text-green-700">
              {service.price[lang]}
            </span>
          </div>

          <label className="mb-3 block">
            <span className="mb-1 block text-[12px] font-bold text-slate-600">{tx.category}</span>
            <select
              className={selectClass}
              value={service.name.en}
              onChange={(e) => {
                const next = group.rows.find((r) => r.name.en === e.target.value);
                if (next) setService(next);
              }}
            >
              {group.rows.map((r) => (
                <option key={r.name.en} value={r.name.en}>
                  {r.name[lang]} · {r.price[lang]}
                </option>
              ))}
            </select>
          </label>

          {/* Cascading location selects — stacked on mobile, row on desktop */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <select className={selectClass} value={districtId} onChange={(e) => setDistrictId(e.target.value)}>
              <option value="">{tx.district}</option>
              {sortedDistricts.map((d) => (
                <option key={d.district_id} value={d.district_id}>
                  {districtName(d, lang)}
                </option>
              ))}
            </select>
            <select
              className={selectClass}
              value={talukaId}
              onChange={(e) => setTalukaId(e.target.value)}
              disabled={!districtId}
            >
              <option value="">{tx.taluka}</option>
              {sortedTalukas.map((t) => (
                <option key={t.taluka_id} value={t.taluka_id}>
                  {getTalukaDisplayNameRow(t, selectedDistrictRow, lang)}
                </option>
              ))}
            </select>
            <select
              className={selectClass}
              value={villageId}
              onChange={(e) => setVillageId(e.target.value)}
              disabled={!talukaId}
            >
              <option value="">{tx.village}</option>
              {sortedVillages.map((v) => (
                <option key={v.village_id} value={v.village_id}>
                  {getVillageDisplayNameRow(v, selectedTalukaRow, selectedDistrictRow, lang)}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              className={selectClass}
              placeholder={tx.survey}
              value={survey}
              onChange={(e) => setSurvey(e.target.value)}
            />
            <input
              type="tel"
              inputMode="numeric"
              className={selectClass}
              placeholder={tx.mobile}
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
            />
          </div>

          <div className="mt-4 flex flex-col items-stretch justify-between gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center">
            <p className="max-w-sm text-xs leading-6 text-slate-500">{tx.note}</p>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppLead()}
              className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-green-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-green-700"
            >
              <MessageCircle className="size-4" />
              {tx.cta}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
