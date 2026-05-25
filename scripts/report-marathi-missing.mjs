#!/usr/bin/env node
// scripts/report-marathi-missing.mjs
//
// Walk every village in public/data/dropdowns/, try to resolve a Marathi
// label using the same MAHA + LGD ladder as src/lib/maharashtra-local-names.ts,
// and write a CSV of misses to public/data/marathi-missing-report.csv.
//
// Output columns: district,taluka,village,village_id,reason,candidates
//   - district : English district name (or district_id slug if name_en blank)
//   - taluka   : English taluka name
//   - village  : English village name
//   - village_id : "v-<lgd>"
//   - reason   : why no Marathi was found
//                  ("no-lgd-byCode", "no-name-keys", "maha-empty-marathi", etc.)
//   - candidates : up to 5 same-taluka sibling English names, ;-separated
//
// Console summary:
//   - total villages scanned
//   - Marathi-matched count + percentage
//   - fallback-en count + percentage
//   - first 200 fallback rows are written to the CSV
//
// Usage:
//   npm run report-marathi
//   node scripts/report-marathi-missing.mjs

import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const DROPDOWNS = path.resolve(PROJECT_ROOT, "public", "data", "dropdowns");
const MAHA_JSON = path.resolve(PROJECT_ROOT, "public", "data", "maha-village-names.json");
const LGD_JSON  = path.resolve(PROJECT_ROOT, "public", "data", "lgd-local-names.json");
const OUT_CSV   = path.resolve(PROJECT_ROOT, "public", "data", "marathi-missing-report.csv");

// ── Normalisers (must mirror src/lib/maharashtra-local-names.ts) ─────
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
  const KNOWN = { "KOLH>PUR": "KOLHAPUR", "N>NDED": "NANDED", "NANDURB>R": "NANDURBAR", "N>SHIK": "NASHIK", "S>T>RA": "SATARA" };
  const fixed = KNOWN[raw] ?? raw;
  const upper = String(fixed).toUpperCase().replace(/[^A-Z]+/g, "");
  const aliases = {
    AHMADNAGAR: "AHMEDNAGAR", AHILYANAGAR: "AHMEDNAGAR",
    CHHATRAPATISAMBHAJINAGAR: "AURANGABAD",
    CHSAMBHAJINAGAR: "AURANGABAD",
    DHARASHIV: "OSMANABAD",
    KOLHPUR: "KOLHAPUR", NNDED: "NANDED", NANDURBR: "NANDURBAR",
    NSHIK: "NASHIK", STRA: "SATARA",
  };
  return aliases[upper] ?? upper;
}

const DISTRICT_ID_FALLBACK_EN = {
  "d-503": "AMRAVATI",
  "kolh-pur": "KOLHAPUR",
  "n-nded": "NANDED",
  "nandurb-r": "NANDURBAR",
  "n-shik": "NASHIK",
  "s-t-ra": "SATARA",
};

// ── Load datasets ───────────────────────────────────────────────────
let MAHA = {};
try {
  MAHA = JSON.parse(fs.readFileSync(MAHA_JSON, "utf-8"));
  console.log(`Loaded MAHA: ${Object.keys(MAHA).length} taluka codes`);
} catch (e) {
  console.warn(`[report-marathi] MAHA missing (${e.message}) — fallback-en rate will be 100%`);
}
let LGD = null;
try {
  LGD = JSON.parse(fs.readFileSync(LGD_JSON, "utf-8"));
  console.log(`Loaded LGD: ${Object.keys(LGD.byVillageCode ?? {}).length} byVillageCode entries, ${Object.keys(LGD.byName ?? {}).length} byName entries`);
} catch (e) {
  console.warn(`[report-marathi] LGD missing or malformed (${e.message}) — only MAHA path will be tried`);
}

// ── Load dropdowns ──────────────────────────────────────────────────
const districts = JSON.parse(fs.readFileSync(path.join(DROPDOWNS, "districts.json"), "utf-8"));
function distEn(row) {
  return (row.name_en?.trim() || DISTRICT_ID_FALLBACK_EN[row.district_id] || row.district_id || "").trim();
}

// ── Resolver (mirrors getVillageDisplayNameRow) ─────────────────────
function resolveMarathi({ districtRow, talukaRow, villageRow }) {
  const attempted = [];
  const dKey = normDistrict(distEn(districtRow));

  // a) LGD byVillageCode
  const vCodeRaw = villageRow.code ?? null;
  const vCodeFromId = /(\d{3,})$/.exec(villageRow.village_id || "")?.[1] ?? null;
  const vCode = (vCodeRaw && String(vCodeRaw).trim()) || vCodeFromId || null;
  if (LGD && vCode) {
    attempted.push(`lgd-byVillageCode:${vCode}`);
    const rec = LGD.byVillageCode?.[vCode];
    if (rec?.nameMr?.trim()) return { source: "lgd-byCode", marathi: rec.nameMr, attempted };
  }

  // b) LGD byName
  if (LGD && dKey && talukaRow?.name_en && villageRow.name_en) {
    const tS = normName(talukaRow.name_en);
    const tR = normNameRelaxed(talukaRow.name_en);
    const vS = normName(villageRow.name_en);
    const vR = normNameRelaxed(villageRow.name_en);
    const keys = [`${dKey}|${tS}|${vS}`, `${dKey}|${tS}|${vR}`, `${dKey}|${tR}|${vS}`, `${dKey}|${tR}|${vR}`];
    attempted.push(...keys.map((k) => `lgd-byName:${k}`));
    for (const k of keys) {
      const rec = LGD.byName?.[k];
      if (rec?.nameMr?.trim()) return { source: "lgd-byName", marathi: rec.nameMr, attempted };
    }
  }

  // c) row.name_mr (rare in our data — most rows have it blank)
  if (villageRow.name_mr?.trim()) {
    return { source: "row.name_mr", marathi: villageRow.name_mr, attempted };
  }

  // d) MAHA by taluka code
  let tCode = null;
  const lgdRaw = talukaRow?.lgd;
  if (lgdRaw && String(lgdRaw).trim()) {
    const n = parseInt(String(lgdRaw), 10);
    if (Number.isFinite(n) && n > 0) tCode = n;
  }
  if (tCode != null && MAHA) {
    const list = MAHA[String(tCode)] ?? [];
    if (list.length === 0) {
      attempted.push(`maha-talukaCode:${tCode}:empty`);
      return { source: "fallback-en", reason: "maha-taluka-empty", attempted, candidates: [] };
    }
    const vS = normName(villageRow.name_en ?? "");
    const vR = normNameRelaxed(villageRow.name_en ?? "");
    attempted.push(`maha-strict:${vS}`, `maha-relaxed:${vR}`);

    // strict
    let match = list.find((v) => normName(v.n) === vS);
    let source = "maha";
    if (!match) {
      match = list.find((v) => normNameRelaxed(v.n) === vR);
      if (match) source = "maha-relaxed";
    }
    if (!match && vR.length >= 4) {
      const cands = list.filter((v) => {
        const c = normNameRelaxed(v.n);
        if (c.length < 4) return false;
        if (Math.abs(c.length - vR.length) > 4) return false;
        return c.startsWith(vR) || vR.startsWith(c);
      });
      if (cands.length === 1) {
        match = cands[0];
        source = "maha-prefix-1of1";
      }
    }
    if (match?.l?.trim()) return { source, marathi: match.l, attempted };

    // miss — collect candidate sample
    const sample = list.slice(0, 200).map((v) => v.n).filter(Boolean).slice(0, 5);
    return {
      source: "fallback-en",
      reason: match ? "maha-empty-marathi" : "maha-no-name-match",
      attempted,
      candidates: sample,
    };
  }

  return {
    source: "fallback-en",
    reason: tCode == null ? "no-taluka-code" : "no-maha-data",
    attempted,
    candidates: [],
  };
}

// ── Walk every village ──────────────────────────────────────────────
let total = 0, matched = 0;
const matchedBySource = {};
const fallbacks = [];

for (const districtRow of districts) {
  const dSlug = districtRow.district_id;
  const talukasPath = path.join(DROPDOWNS, "talukas", `${dSlug}.json`);
  if (!fs.existsSync(talukasPath)) continue;
  const talukas = JSON.parse(fs.readFileSync(talukasPath, "utf-8"));

  for (const talukaRow of talukas) {
    const tSlug = talukaRow.taluka_id;
    const villagesPath = path.join(DROPDOWNS, "villages", dSlug, `${tSlug}.json`);
    if (!fs.existsSync(villagesPath)) continue;
    const villages = JSON.parse(fs.readFileSync(villagesPath, "utf-8"));

    for (const villageRow of villages) {
      total++;
      const res = resolveMarathi({ districtRow, talukaRow, villageRow });
      if (res.source !== "fallback-en") {
        matched++;
        matchedBySource[res.source] = (matchedBySource[res.source] ?? 0) + 1;
      } else {
        fallbacks.push({
          district: distEn(districtRow),
          taluka: talukaRow.name_en ?? "",
          village: villageRow.name_en ?? "",
          village_id: villageRow.village_id ?? "",
          reason: res.reason,
          candidates: (res.candidates ?? []).join(";"),
        });
      }
    }
  }
}

// ── Print summary ───────────────────────────────────────────────────
const pct = (n) => total ? ((n / total) * 100).toFixed(1) + "%" : "0%";
console.log("\n── Marathi resolution summary ──");
console.log(`total villages scanned : ${total}`);
console.log(`Marathi matched        : ${matched}  (${pct(matched)})`);
console.log(`fallback-en (English)  : ${fallbacks.length}  (${pct(fallbacks.length)})`);
console.log("\nmatched by source:");
for (const [src, n] of Object.entries(matchedBySource).sort((a,b) => b[1]-a[1])) {
  console.log(`  ${src.padEnd(22)} ${n}`);
}

// ── Write CSV (first 200 fallback rows) ─────────────────────────────
function csvCell(s) {
  const t = String(s ?? "");
  if (/[",\n]/.test(t)) return `"${t.replace(/"/g, '""')}"`;
  return t;
}
const header = "district,taluka,village,village_id,reason,candidates";
const rows = fallbacks.slice(0, 200).map((r) =>
  [r.district, r.taluka, r.village, r.village_id, r.reason, r.candidates].map(csvCell).join(",")
);
fs.mkdirSync(path.dirname(OUT_CSV), { recursive: true });
fs.writeFileSync(OUT_CSV, [header, ...rows].join("\n") + "\n", "utf-8");
console.log(`\nWrote first 200 fallback rows to: ${OUT_CSV}`);
console.log(`(total fallback rows: ${fallbacks.length})`);
