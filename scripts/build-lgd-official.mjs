#!/usr/bin/env node
// scripts/build-lgd-official.mjs
//
// Purpose-built importer for the official LGD "Specific State" Excel exports
// (district + village) whose layout is KNOWN and fixed:
//
//   District file (sheet "Report"):
//     col3 = District Name (In English)   col4 = District Name (In Local)
//     data rows start where col3 is non-empty.
//
//   Village file (sheet "Report"), header on row 3 / sub-header row 4,
//   data from row 5 (zero-indexed). Columns:
//     1 District Code     2 District Name (En)
//     3 Sub-District Code 4 Sub-District Name (En)
//     5 Village Code      6 Village Version
//     7 Village Name (En) 8 Village Name (In Local) ← Marathi
//     10 Census 2001 Code 11 Census 2011 Code
//
// IMPORTANT: this file has NO taluka-local / district-local column in the
// village sheet — only the village local name. So:
//   • village Marathi  ← village file, col 8 (by village code + by name)
//   • district Marathi ← district file, col 4 (by normalized name)
//   • taluka Marathi   ← DERIVED from the HQ village (the village whose
//                        English name equals the taluka's English name);
//                        if none, left blank and counted in the report.
//
// Output: public/data/lgd-local-names.json — SAME schema the runtime
// resolver (src/lib/maharashtra-local-names.ts) reads:
//   { byVillageCode: {<code>: {nameEn,nameMr,talukaEn,talukaMr,districtEn,
//                              districtMr,villageVersion,census2001Code,
//                              census2011Code,districtCode,subDistrictCode}},
//     byName:  {"<dKey>|<talukaNorm>|<villageNorm>": {nameEn,nameMr}},
//     talukas: {"<dKey>|<talukaNorm>": {nameEn,nameMr}} }
//
// Usage:
//   node scripts/build-lgd-official.mjs "<folder with the two .xls files>"
//   npm run build-lgd-official -- "../lgp dat a name dist village"

import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");

const SRC = process.argv.slice(2).filter((a) => !a.startsWith("--"))[0]
  || process.env.LGD_SRC
  || path.resolve(PROJECT_ROOT, "..", "lgp dat a name dist village");

const OUT_PATH = path.resolve(PROJECT_ROOT, "public", "data", "lgd-local-names.json");
const REPORT_PATH = path.resolve(PROJECT_ROOT, "public", "data", "lgd-import-report.txt");

let XLSX;
try {
  XLSX = (await import("xlsx")).default ?? (await import("xlsx"));
} catch {
  console.error("[build-lgd-official] missing 'xlsx'. Run: npm i -D xlsx");
  process.exit(1);
}

// ── Normalisers — MUST mirror src/lib/maharashtra-local-names.ts ──────
function normName(raw) {
  if (!raw) return "";
  return String(raw).toLowerCase().replace(/[^a-z0-9]+/g, "");
}
function normNameRelaxed(raw) {
  if (!raw) return "";
  return String(raw)
    .toLowerCase()
    .replace(
      /\((?:ct|mcorp|m\s*corp|mc|m\.?\s*c\.?|np|n\.?\s*p\.?|na|n\.?\s*a\.?|og|o\.?\s*g\.?|cb|c\.?\s*b\.?|m|ph|nv|n\.?\s*v\.?|cantt|out\s*growth|outgrowth|notified\s*village)\)/gi,
      "",
    )
    .replace(/\b(?:no\.?|number)\s*(\d+)/gi, "no$1")
    .replace(/नं\.?\s*(\d+)/g, "no$1")
    .replace(/क्र\.?\s*(\d+)/g, "no$1")
    .replace(/\b(bk\.?|budruk)\b/gi, "bk")
    .replace(/बु\.?/g, "bk")
    .replace(/\b(kh\.?|khurd)\b/gi, "kh")
    .replace(/खु\.?/g, "kh")
    .replace(/vadi\b/gi, "wadi")
    .replace(/[^a-z0-9ऀ-ॿ]+/g, "");
}
function normDistrict(raw) {
  if (!raw) return "";
  const upper = String(raw).toUpperCase().replace(/[^A-Z]+/g, "");
  const aliases = {
    AHMADNAGAR: "AHMEDNAGAR", AHILYANAGAR: "AHMEDNAGAR",
    CHHATRAPATISAMBHAJINAGAR: "AURANGABAD", CHSAMBHAJINAGAR: "AURANGABAD",
    SAMBHAJINAGAR: "AURANGABAD",
    DHARASHIV: "OSMANABAD", DHARSHIV: "OSMANABAD",
    KOLHPUR: "KOLHAPUR", NNDED: "NANDED", NANDURBR: "NANDURBAR",
    NSHIK: "NASHIK", STRA: "SATARA",
    GONDIYA: "GONDIA", SANGALI: "SANGLI", AMARAWATI: "AMRAVATI",
    RAIGADH: "RAIGAD", SINDHUDURGA: "SINDHUDURG", JALANA: "JALNA",
  };
  return aliases[upper] ?? upper;
}

const DEVA = /[ऀ-ॿ]/;
const cell = (r, i) => (r[i] == null ? "" : String(r[i]).trim());
function mr(v) {
  const s = String(v ?? "").trim();
  return DEVA.test(s) ? s : ""; // only accept real Devanagari as a Marathi name
}

function findFiles(dir) {
  const out = { district: null, village: null };
  for (const name of fs.readdirSync(dir)) {
    if (!/\.xlsx?$/i.test(name) || name.startsWith("~$")) continue;
    const full = path.join(dir, name);
    if (/district/i.test(name)) out.district = full;
    else if (/village/i.test(name)) out.village = full;
  }
  return out;
}

function rowsOf(file) {
  const wb = XLSX.readFile(file, { cellDates: false });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "", raw: true });
}

// ── Main ─────────────────────────────────────────────────────────────
console.log(`[build-lgd-official] source: ${SRC}`);
if (!fs.existsSync(SRC)) {
  console.error(`[build-lgd-official] folder not found: ${SRC}`);
  process.exit(1);
}
const files = findFiles(SRC);
console.log(`[build-lgd-official] district file: ${files.district ? path.basename(files.district) : "(none)"}`);
console.log(`[build-lgd-official] village  file: ${files.village ? path.basename(files.village) : "(none)"}`);
if (!files.village) {
  console.error("[build-lgd-official] village file is required.");
  process.exit(1);
}

// 1) District Marathi by normalized English name
const districtMrByKey = {};
let districtCount = 0, districtMissingMr = 0;
if (files.district) {
  for (const r of rowsOf(files.district)) {
    const en = cell(r, 3);
    if (!en || /district\s*name/i.test(en) || /in\s*english/i.test(en)) continue;
    const local = mr(cell(r, 4));
    const k = normDistrict(en);
    if (!k) continue;
    districtCount++;
    if (local) districtMrByKey[k] = local;
    else districtMissingMr++;
  }
}
console.log(`[build-lgd-official] districts: ${districtCount} (with Marathi: ${Object.keys(districtMrByKey).length})`);

// 2) Villages
const byVillageCode = {};
const byName = {};
const talukas = {}; // key -> {nameEn,nameMr, _villages:[{en,mr}]}
let villageRows = 0, villageMissingMr = 0;

const vrows = rowsOf(files.village);
for (const r of vrows) {
  const villageCode = cell(r, 5);
  if (!/^\d+$/.test(villageCode)) continue; // data rows only
  const districtEn = cell(r, 2);
  const talukaEn = cell(r, 4);
  const villageEn = cell(r, 7);
  if (!districtEn || !villageEn) continue;
  const villageMr = mr(cell(r, 8));
  const dKey = normDistrict(districtEn);
  if (!dKey) continue;

  villageRows++;
  if (!villageMr) villageMissingMr++;

  const districtMr = districtMrByKey[dKey] ?? "";

  byVillageCode[villageCode] = {
    nameEn: villageEn,
    nameMr: villageMr,
    talukaEn,
    talukaMr: "", // filled below from HQ-village derivation
    districtEn,
    districtMr,
    villageVersion: cell(r, 6) || null,
    census2001Code: cell(r, 10) || null,
    census2011Code: cell(r, 11) || null,
    districtCode: cell(r, 1) || null,
    subDistrictCode: cell(r, 3) || null,
  };

  if (talukaEn) {
    const tKeys = new Set([normName(talukaEn), normNameRelaxed(talukaEn)]);
    const vKeys = new Set([normName(villageEn), normNameRelaxed(villageEn)]);
    for (const t of tKeys) {
      for (const v of vKeys) {
        if (!t || !v) continue;
        const k = `${dKey}|${t}|${v}`;
        const prev = byName[k];
        if (!prev || (!prev.nameMr && villageMr)) byName[k] = { nameEn: villageEn, nameMr: villageMr };
      }
      // taluka bucket
      if (t) {
        const tk = `${dKey}|${t}`;
        (talukas[tk] ??= { nameEn: talukaEn, nameMr: "", _villages: [] });
        talukas[tk]._villages.push({ en: villageEn, mr: villageMr });
      }
    }
  }
}
console.log(`[build-lgd-official] village rows: ${villageRows} (with Marathi: ${villageRows - villageMissingMr}, missing: ${villageMissingMr})`);

// 3) Derive taluka Marathi from the HQ village (village name == taluka name).
//    Ladder: strict → relaxed → bounded edit-distance (≤2) but ONLY when
//    exactly one village in the taluka is that close (e.g. taluka "Bhamragad"
//    ↔ HQ village "Bhamaragad"). The uniqueness gate keeps it safe.
function editWithin(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return false;
  const dp = Array.from({ length: a.length + 1 }, (_, i) => i);
  for (let j = 1; j <= b.length; j++) {
    let prev = dp[0];
    dp[0] = j;
    let rowMin = dp[0];
    for (let i = 1; i <= a.length; i++) {
      const tmp = dp[i];
      dp[i] = a[i - 1] === b[j - 1] ? prev : 1 + Math.min(prev, dp[i], dp[i - 1]);
      prev = tmp;
      if (dp[i] < rowMin) rowMin = dp[i];
    }
    if (rowMin > max) return false; // whole row already exceeds budget
  }
  return dp[a.length] <= max;
}
let talukaCount = 0, talukaMissingMr = 0, talukaFuzzy = 0;
for (const t of Object.values(talukas)) {
  talukaCount++;
  const tStrict = normName(t.nameEn);
  const tRelaxed = normNameRelaxed(t.nameEn);
  let hq = t._villages.find((v) => normName(v.en) === tStrict && v.mr);
  if (!hq) hq = t._villages.find((v) => normNameRelaxed(v.en) === tRelaxed && v.mr);
  if (!hq && tRelaxed.length >= 4) {
    const close = t._villages.filter(
      (v) => v.mr && editWithin(normNameRelaxed(v.en), tRelaxed, 2),
    );
    if (close.length === 1) { hq = close[0]; talukaFuzzy++; }
  }
  if (hq) t.nameMr = hq.mr;
  else talukaMissingMr++;
  delete t._villages;
}
console.log(`[build-lgd-official] taluka fuzzy-matched (edit≤2, unique): ${talukaFuzzy}`);
// backfill talukaMr into byVillageCode records
for (const rec of Object.values(byVillageCode)) {
  if (rec.talukaEn) {
    const dKey = normDistrict(rec.districtEn);
    const tk = `${dKey}|${normName(rec.talukaEn)}`;
    rec.talukaMr = talukas[tk]?.nameMr ?? "";
  }
}
console.log(`[build-lgd-official] talukas: ${talukaCount} (with Marathi: ${talukaCount - talukaMissingMr}, missing: ${talukaMissingMr})`);

// 4) Write JSON + report
//    a) SLIM runtime file (resolver only reads nameMr/nameEn) — keeps the
//       lazy client fetch lean.
//    b) MASTER file preserving ALL official LGD codes (requirement 2).
const MASTER_PATH = path.resolve(PROJECT_ROOT, "public", "data", "lgd-master.json");

const slimByVillageCode = {};
for (const [code, r] of Object.entries(byVillageCode)) {
  slimByVillageCode[code] = { nameEn: r.nameEn, nameMr: r.nameMr };
}
const slim = { byVillageCode: slimByVillageCode, byName, talukas };
fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
fs.writeFileSync(OUT_PATH, JSON.stringify(slim));
const sz = fs.statSync(OUT_PATH).size;
console.log(`[build-lgd-official] wrote ${OUT_PATH} (runtime, slim) (${(sz / 1024 / 1024).toFixed(1)} MB)`);

const master = {
  generatedFrom: {
    district: files.district ? path.basename(files.district) : null,
    village: path.basename(files.village),
  },
  districts: districtMrByKey, // dKey -> Marathi
  talukas, // key -> {nameEn,nameMr}
  villages: byVillageCode, // villageCode -> full record incl. all codes
};
fs.writeFileSync(MASTER_PATH, JSON.stringify(master));
const msz = fs.statSync(MASTER_PATH).size;
console.log(`[build-lgd-official] wrote ${MASTER_PATH} (full codes) (${(msz / 1024 / 1024).toFixed(1)} MB)`);

const report = [
  `LGD official import report — ${new Date().toISOString().slice(0, 10)}`,
  ``,
  `Districts imported : ${districtCount} (Marathi: ${Object.keys(districtMrByKey).length}, missing: ${districtMissingMr})`,
  `Talukas imported   : ${talukaCount} (Marathi: ${talukaCount - talukaMissingMr}, missing: ${talukaMissingMr})`,
  `Villages imported  : ${villageRows} (Marathi: ${villageRows - villageMissingMr}, missing: ${villageMissingMr})`,
  ``,
  `Output: public/data/lgd-local-names.json (${(sz / 1024 / 1024).toFixed(1)} MB)`,
  `Keys: byVillageCode=${Object.keys(byVillageCode).length} byName=${Object.keys(byName).length} talukas=${Object.keys(talukas).length}`,
  ``,
  `Note: village file carries no taluka-local column; taluka Marathi is`,
  `derived from the HQ village (village whose English name == taluka name).`,
  `Districts/talukas/villages with blank Marathi fall back to English in the UI.`,
  ``,
].join("\n");
fs.writeFileSync(REPORT_PATH, report, "utf-8");
console.log(`[build-lgd-official] wrote report ${REPORT_PATH}`);
