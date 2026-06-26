#!/usr/bin/env node
/**
 * build-ready-reckoner.mjs — turn an easy-to-edit CSV of Ready Reckoner
 * (ASR) rates into the zone-aware JSON the /ready-reckoner page reads.
 *
 *   Source : data-source/ready-reckoner-<district>.csv   (edit in Excel)
 *   Output : public/data/rates/ready-reckoner-<district>.json
 *
 * Why a CSV: the official ASR is large and changes every 1 April. Editing a
 * spreadsheet (or pasting rows looked up on the e-ASR portal) is far easier
 * than hand-editing JSON, and a flat yearly % hike becomes one command.
 *
 * CSV columns (header row required, this exact order):
 *   taluka_en, taluka_mr, zone_en, zone_mr, survey,
 *   agricultural, residentialPlot, residentialBuiltup, commercialBuiltup
 *
 * Usage:
 *   npm run build-asr                       # rebuild JSON from the CSV
 *   npm run build-asr -- --bump 5           # +5% to every rate, rewrites CSV too
 *   npm run build-asr -- --effective 2026-04
 *   npm run build-asr -- --official         # drop the "sample" flag (real data in)
 *   npm run build-asr -- --district kolhapur
 *
 * The --bump path rewrites the CSV so the bumped values become next year's base.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

/* ── args ─────────────────────────────────────────────────────────────── */
const args = {};
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (a.startsWith("--")) {
    const key = a.replace(/^--/, "");
    const next = process.argv[i + 1];
    if (next && !next.startsWith("--")) { args[key] = next; i++; }
    else { args[key] = "true"; }
  }
}

const district = (args.district || "kolhapur").toLowerCase();
const bumpPct = args.bump ? Number(args.bump) : 0;
const isOfficial = args.official === "true";
const ROOT = resolve(process.cwd());
const csvPath = resolve(ROOT, "data-source", `ready-reckoner-${district}.csv`);
const jsonPath = resolve(ROOT, "public", "data", "rates", `ready-reckoner-${district}.json`);

if (!existsSync(csvPath)) {
  console.error(`✗ CSV not found: ${csvPath}`);
  console.error(`  Create it with the header row, or run with --district <name>.`);
  process.exit(1);
}
if (bumpPct && !Number.isFinite(bumpPct)) {
  console.error(`✗ --bump must be a number, got: ${args.bump}`);
  process.exit(1);
}

/* ── tiny CSV parser (handles quoted fields + embedded commas/quotes) ───── */
function parseCsv(text) {
  const rows = [];
  let row = [], field = "", inQuotes = false;
  const pushField = () => { row.push(field); field = ""; };
  const pushRow = () => { rows.push(row); row = []; };
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") pushField();
    else if (c === "\n") { pushField(); pushRow(); }
    else if (c === "\r") { /* ignore */ }
    else field += c;
  }
  if (field.length > 0 || row.length > 0) { pushField(); pushRow(); }
  return rows.filter((r) => r.some((v) => v.trim() !== ""));
}

function csvCell(v) {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const CATEGORY_KEYS = ["agricultural", "residentialPlot", "residentialBuiltup", "commercialBuiltup"];
const CATEGORIES = [
  { key: "agricultural", labelEn: "Agricultural land", labelMr: "शेतजमीन" },
  { key: "residentialPlot", labelEn: "Residential open plot", labelMr: "निवासी खुला भूखंड" },
  { key: "residentialBuiltup", labelEn: "Residential built-up", labelMr: "निवासी बांधकाम" },
  { key: "commercialBuiltup", labelEn: "Commercial built-up", labelMr: "व्यापारी बांधकाम" },
];
const HEADER = ["taluka_en", "taluka_mr", "zone_en", "zone_mr", "survey", ...CATEGORY_KEYS];

/* ── read + validate ──────────────────────────────────────────────────── */
const rows = parseCsv(readFileSync(csvPath, "utf8"));
const header = rows.shift()?.map((h) => h.trim());
if (!header || HEADER.some((h, i) => header[i] !== h)) {
  console.error(`✗ CSV header must be exactly:\n  ${HEADER.join(",")}`);
  console.error(`  got:\n  ${header?.join(",")}`);
  process.exit(1);
}

const bump = (n) => (bumpPct ? Math.round(n * (1 + bumpPct / 100)) : n);

const talukaOrder = [];
const talukaMap = new Map();
let zoneCount = 0;
rows.forEach((r, idx) => {
  const [tEn, tMr, zEn, zMr, survey, ...rateStrs] = r.map((v) => v.trim());
  if (!tEn || !zEn) {
    console.error(`✗ row ${idx + 2}: taluka_en and zone_en are required`);
    process.exit(1);
  }
  const rates = {};
  CATEGORY_KEYS.forEach((k, i) => {
    const n = Number(rateStrs[i]);
    if (!Number.isFinite(n) || n < 0) {
      console.error(`✗ row ${idx + 2}: ${k} = "${rateStrs[i]}" is not a valid rate`);
      process.exit(1);
    }
    rates[k] = bump(n);
  });
  if (!talukaMap.has(tEn)) {
    talukaMap.set(tEn, { en: tEn, mr: tMr || tEn, zones: [] });
    talukaOrder.push(tEn);
  }
  const zone = { en: zEn, mr: zMr || zEn };
  if (survey) zone.survey = survey;
  zone.rates = rates;
  talukaMap.get(tEn).zones.push(zone);
  zoneCount++;
});

/* ── build JSON (shape consumed by ready-reckoner-content.tsx) ─────────── */
const sample = !isOfficial;
const districtNames = { kolhapur: { en: "Kolhapur", mr: "कोल्हापूर" } };
const dName = districtNames[district] || { en: district, mr: district };
const effective =
  args.effective ||
  (sample ? `${new Date().getFullYear()}-04 (SAMPLE — not official ASR)` : "");

const out = {
  sample,
  effectiveFrom: effective,
  district: dName,
  note: sample
    ? "SAMPLE / PLACEHOLDER rates per square metre. Real ASR rates are zone-wise (village + survey/CTS range) on the IGR e-ASR portal. Edit data-source CSV and run `npm run build-asr` to update; pass --official once real rates are in."
    : "Rates per square metre compiled from the IGR e-ASR portal for PrintShubh's service area. Verify the current rate at the official e-ASR portal before any transaction.",
  noteMr: sample
    ? "ही नमुना आकडेवारी आहे (प्रति चौरस मीटर). खरे ASR दर झोननिहाय असतात — IGR e-ASR portal वर. CSV संपादित करून `npm run build-asr` चालवा."
    : "IGR e-ASR वरून संकलित दर (प्रति चौरस मीटर), PrintShubh सेवा-भागासाठी. व्यवहारापूर्वी अधिकृत e-ASR portal वर पडताळा.",
  source: "https://easr.igrmaharashtra.gov.in/",
  categories: CATEGORIES,
  talukas: talukaOrder.map((t) => talukaMap.get(t)),
};

writeFileSync(jsonPath, JSON.stringify(out, null, 2) + "\n", "utf8");

/* ── if we bumped, rewrite the CSV so the new values are next year's base ─ */
if (bumpPct) {
  const lines = [HEADER.join(",")];
  for (const t of talukaOrder) {
    for (const z of talukaMap.get(t).zones) {
      lines.push(
        [t, talukaMap.get(t).mr, z.en, z.mr, z.survey || "", ...CATEGORY_KEYS.map((k) => z.rates[k])]
          .map(csvCell)
          .join(","),
      );
    }
  }
  writeFileSync(csvPath, lines.join("\n") + "\n", "utf8");
}

console.log(`✓ ${district}: ${talukaOrder.length} talukas, ${zoneCount} zones`);
console.log(`  effectiveFrom: ${effective || "(unset)"}  | sample: ${sample}` + (bumpPct ? `  | bumped +${bumpPct}% (CSV rewritten)` : ""));
console.log(`  → ${jsonPath}`);
