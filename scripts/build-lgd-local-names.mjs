#!/usr/bin/env node
// scripts/build-lgd-local-names.mjs
//
// Reads every .xlsx file under the LGD source folder (configurable via
// LGD_SRC env var or the first CLI argument) and writes the consolidated
// lookup JSON to public/data/lgd-local-names.json.
//
// LGD portal exports for Maharashtra ship in a positional layout
// (the header row is sometimes missing or merged). Each data row is:
//
//   [ srNo, villageCode, villageEn, villageMr, hierarchy, longCode, "N"/"Y", …blanks… ]
//
// where `hierarchy` is a single cell of the form
//     "<TalukaEn>(Sub-District) / <DistrictEn>(District) / <StateEn>(State)"
//
// We try two strategies per sheet:
//   1) Header-driven: if we can detect "Village Name (In English)" /
//      "Sub-District Name (In English)" / etc. columns, use those.
//   2) Positional fallback: assume the LGD layout above and parse the
//      hierarchy cell with a regex.
//
// Output shape:
//   {
//     byVillageCode: { "<lgdCode>": { nameEn, nameMr, talukaEn, talukaMr,
//                                     districtEn, districtMr } },
//     byName:        { "district|taluka|village-norm": { nameEn, nameMr } },
//     talukas:       { "district|taluka-norm": { nameEn, nameMr } }
//   }
//
// Usage:
//   npm run build-lgd
//   npm run build-lgd -- "R:\\my jobs\\18 nmay codex 3d site\\all maharshtra lgp sheet data"
//   npm run build-lgd -- --inspect       # dump headers + sample rows per sheet
//
// Dependency: `xlsx` (SheetJS). Install once:
//   npm i -D xlsx

import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");

const args = process.argv.slice(2);
const INSPECT_ONLY = args.includes("--inspect");
const positional = args.filter((a) => !a.startsWith("--"));

const LGD_SRC =
  positional[0] ||
  process.env.LGD_SRC ||
  path.resolve(PROJECT_ROOT, "all maharshtra lgp sheet data");

const OUT_PATH = path.resolve(
  PROJECT_ROOT,
  "public",
  "data",
  "lgd-local-names.json",
);

let XLSX;
try {
  XLSX = (await import("xlsx")).default ?? (await import("xlsx"));
} catch {
  console.error(
    "[build-lgd] Missing dependency 'xlsx'. Install once with:\n" +
      "    npm install --save-dev xlsx",
  );
  process.exit(1);
}

// ── Helpers ─────────────────────────────────────────────────────────

function normHeader(h) {
  return String(h ?? "")
    .replace(/[   ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normName(raw) {
  if (!raw) return "";
  return String(raw).toLowerCase().replace(/[^a-z0-9]+/g, "");
}
function normNameRelaxed(raw) {
  if (!raw) return "";
  return String(raw)
    .toLowerCase()
    .replace(/\((?:ct|mcorp|m corp|mc|np|na|og|cb|m|ph)\)/gi, "")
    .replace(/\b(bk\.?|budruk)\b/gi, "bk")
    .replace(/\b(kh\.?|khurd)\b/gi, "kh")
    .replace(/[^a-z0-9]+/g, "");
}
function normDistrict(raw) {
  if (!raw) return "";
  const upper = String(raw).toUpperCase().replace(/[^A-Z]+/g, "");
  const aliases = {
    AHMADNAGAR: "AHMEDNAGAR",
    AHILYANAGAR: "AHMEDNAGAR",
    CHHATRAPATISAMBHAJINAGAR: "AURANGABAD",
    CHSAMBHAJINAGAR: "AURANGABAD",
    DHARASHIV: "OSMANABAD",
    DHARSHIV: "OSMANABAD",
    SANGALI: "SANGLI",
    GONDIYA: "GONDIA",
    NADURBAR: "NANDURBAR",
    RAIGADH: "RAIGAD",
    SINDHUDURGA: "SINDHUDURG",
    AMARAWATI: "AMRAVATI",
    JALANA: "JALNA",
  };
  return aliases[upper] ?? upper;
}

// ── Header-driven detection (Strategy 1) ────────────────────────────

const HEADER_PATTERNS = {
  districtEn: [
    /^district\s*name\s*\(\s*in\s*english\s*\)/i,
    /^district\s*name$/i,
    /^district$/i,
  ],
  districtMr: [
    /^district\s*name\s*\(\s*in\s*local\s*\)/i,
    /^district\s*\(\s*local\s*\)/i,
  ],
  talukaEn: [
    /^(sub[_ \-]?district|tehsil|taluka|block)\s*name\s*\(\s*in\s*english\s*\)/i,
    /^(sub[_ \-]?district|tehsil|taluka|block)\s*name$/i,
    /^(sub[_ \-]?district|tehsil|taluka|block)$/i,
  ],
  talukaMr: [
    /^(sub[_ \-]?district|tehsil|taluka|block)\s*name\s*\(\s*in\s*local\s*\)/i,
  ],
  villageEn: [
    /^village\s*name\s*\(\s*in\s*english\s*\)/i,
    /^village\s*name$/i,
    /^village$/i,
  ],
  villageMr: [
    /^village\s*name\s*\(\s*in\s*local\s*\)/i,
    /^village\s*\(\s*local\s*\)/i,
  ],
  villageCode: [
    /^village\s*code\s*\(\s*census/i,
    /^village\s*code$/i,
    /^village[_ ]lgd[_ ]code/i,
    /^lgd[_ ]code$/i,
  ],
  hierarchy: [
    /^(hierarchy|location|administrative\s*unit)/i,
    /^village\s*name\s*\(.*sub[_ \-]?district.*\)/i, // some exports name the hierarchy column oddly
  ],
};

function pickColumn(headers, patterns) {
  const cleaned = headers.map(normHeader);
  for (const pattern of patterns) {
    const idx = cleaned.findIndex((h) => h && pattern.test(h));
    if (idx !== -1) return idx;
  }
  return -1;
}
function detectColumns(headers) {
  const cols = {};
  for (const key of Object.keys(HEADER_PATTERNS)) {
    cols[key] = pickColumn(headers, HEADER_PATTERNS[key]);
  }
  return cols;
}

function findHeaderRow(rows) {
  let best = 0, bestScore = -1;
  for (let i = 0; i < Math.min(10, rows.length); i++) {
    const r = (rows[i] || []).map(normHeader);
    let score = 0;
    for (const key of Object.keys(HEADER_PATTERNS)) {
      const idx = pickColumn(r, HEADER_PATTERNS[key]);
      if (idx !== -1) score++;
    }
    if (score > bestScore) { bestScore = score; best = i; }
  }
  return { idx: best, score: bestScore };
}

// ── Hierarchy cell parser ───────────────────────────────────────────
//
// Parses strings like:
//   "Karvir(Sub-District) / Kolhapur(District) / Maharashtra(State)"
//   "Karvir (Sub-District)/Kolhapur (District)/Maharashtra (State)"
// Returns { talukaEn, districtEn, stateEn } with whitespace trimmed.
const TAG_RE = /([^(]+?)\s*\(\s*([^)]+?)\s*\)/g;
function parseHierarchy(text) {
  if (!text) return null;
  const out = { talukaEn: "", districtEn: "", stateEn: "" };
  let m;
  TAG_RE.lastIndex = 0;
  while ((m = TAG_RE.exec(text)) !== null) {
    const label = m[1].trim();
    const tag = m[2].trim().toLowerCase();
    if (/sub[\s\-]?district|taluka|tehsil|block/.test(tag)) out.talukaEn ||= label;
    else if (/^district/.test(tag)) out.districtEn ||= label;
    else if (/^state/.test(tag)) out.stateEn ||= label;
  }
  return (out.talukaEn || out.districtEn) ? out : null;
}

// ── Positional layout detector ──────────────────────────────────────
//
// LGD Maharashtra export layout (zero-indexed):
//   0  Sr.No / Serial
//   1  Village LGD Code (numeric, ~6 digits)
//   2  Village name (English)
//   3  Village name (Local / Marathi)
//   4  Hierarchy "X(Sub-District) / Y(District) / Z(State)"
//   5  Longer LGD code or alt code
//   6  Y/N flag
//
// We confirm a row matches the layout by checking col 1 is digits, col 2
// is non-empty text, and col 4 contains "(Sub-District)" or "(District)".

function looksPositional(row) {
  if (!row || row.length < 5) return false;
  const c1 = row[1], c4 = row[4];
  if (!/^\d{3,}$/.test(String(c1).trim())) return false;
  if (!/\((?:Sub-?District|District)\)/i.test(String(c4))) return false;
  return true;
}

// ── File walk ───────────────────────────────────────────────────────
function listXlsxFiles(root) {
  const out = [];
  const stack = [root];
  while (stack.length) {
    const dir = stack.pop();
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch (e) {
      console.warn(`[build-lgd] skipping unreadable dir: ${dir}: ${e.message}`);
      continue;
    }
    for (const ent of entries) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) stack.push(full);
      else if (
        ent.isFile() &&
        /\.xlsx?$/i.test(ent.name) &&
        !ent.name.startsWith("~$")
      ) {
        out.push(full);
      }
    }
  }
  return out;
}

function districtHintFromFilename(filename) {
  const base = path.basename(filename, path.extname(filename));
  const cleaned = base
    .replace(/\s*LGD\s*-.*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.toUpperCase();
}

// ── Per-file ingestion ──────────────────────────────────────────────
function ingestFile(file, accumulator, fileDistrictHint) {
  let wb;
  try {
    wb = XLSX.readFile(file, { cellDates: false });
  } catch (e) {
    console.warn(`[build-lgd] could not parse ${file}: ${e.message}`);
    return { rowsIn: 0, rowsKept: 0 };
  }

  let rowsIn = 0, rowsKept = 0;

  for (const sheetName of wb.SheetNames) {
    const sheet = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, {
      header: 1, defval: "", raw: true,
    });
    if (rows.length < 2) continue;

    // ── Strategy probe ──
    const hdr = findHeaderRow(rows);
    const headers = (rows[hdr.idx] || []).map(normHeader);
    const cols = detectColumns(headers);

    // Did header detection actually find an English village column?
    const headerOK = cols.villageEn !== -1 || cols.villageMr !== -1;

    // Scan for the first positional-looking row.
    let positionalStart = -1;
    for (let i = 0; i < Math.min(30, rows.length); i++) {
      if (looksPositional(rows[i])) { positionalStart = i; break; }
    }
    const usePositional = !headerOK && positionalStart !== -1;

    console.log(
      `[build-lgd]   sheet "${sheetName}" — strategy=${
        usePositional ? "positional" : (headerOK ? "header" : "none")
      } headerRow=${hdr.idx} score=${hdr.score}`,
    );
    if (headerOK) console.log(`[build-lgd]     detected columns:`, cols);
    if (usePositional)
      console.log(`[build-lgd]     positional start row = ${positionalStart}`);

    const startIdx = usePositional ? positionalStart : hdr.idx + 1;

    if (!headerOK && !usePositional) {
      console.warn(`[build-lgd]     no recognisable layout — skipping sheet`);
      continue;
    }

    for (let i = startIdx; i < rows.length; i++) {
      const r = rows[i];
      if (!r) continue;
      rowsIn++;

      let districtEn, districtMr, talukaEn, talukaMr, villageEn, villageMr, villageCode;

      if (usePositional) {
        if (!looksPositional(r)) continue;
        villageCode = String(r[1] ?? "").trim();
        villageEn = String(r[2] ?? "").trim();
        villageMr = String(r[3] ?? "").trim();
        const hier = parseHierarchy(String(r[4] ?? ""));
        if (!hier) continue;
        talukaEn = hier.talukaEn;
        districtEn = hier.districtEn || fileDistrictHint || "";
        districtMr = "";
        talukaMr = "";
      } else {
        const cell = (k) => {
          const idx = cols[k];
          if (idx === -1) return "";
          const v = r[idx];
          return v == null ? "" : String(v).trim();
        };
        districtEn = cell("districtEn") || fileDistrictHint || "";
        districtMr = cell("districtMr");
        talukaEn = cell("talukaEn");
        talukaMr = cell("talukaMr");
        villageEn = cell("villageEn");
        villageMr = cell("villageMr");
        villageCode = cell("villageCode");
        // If header layout has a hierarchy column, parse it as fallback.
        if (!talukaEn && cols.hierarchy !== -1) {
          const h = parseHierarchy(cell("hierarchy"));
          if (h) {
            talukaEn ||= h.talukaEn;
            districtEn = districtEn || h.districtEn || fileDistrictHint || "";
          }
        }
      }

      if (!villageEn && !villageMr) continue;
      if (!districtEn) continue;

      const dKey = normDistrict(districtEn);
      if (!dKey) continue;

      rowsKept++;

      // byVillageCode
      if (villageCode && /^\d+$/.test(villageCode)) {
        accumulator.byVillageCode[villageCode] = {
          nameEn: villageEn,
          nameMr: villageMr,
          talukaEn,
          talukaMr,
          districtEn,
          districtMr,
        };
      }

      // byName — strict + relaxed keys
      if (talukaEn && villageEn) {
        const tStrict = normName(talukaEn);
        const tRelaxed = normNameRelaxed(talukaEn);
        const vStrict = normName(villageEn);
        const vRelaxed = normNameRelaxed(villageEn);
        for (const t of new Set([tStrict, tRelaxed])) {
          for (const v of new Set([vStrict, vRelaxed])) {
            const k = `${dKey}|${t}|${v}`;
            const prev = accumulator.byName[k];
            if (!prev || (!prev.nameMr && villageMr)) {
              accumulator.byName[k] = { nameEn: villageEn, nameMr: villageMr };
            }
          }
        }
      }

      // talukas
      if (talukaEn) {
        const tStrict = normName(talukaEn);
        const tRelaxed = normNameRelaxed(talukaEn);
        for (const t of new Set([tStrict, tRelaxed])) {
          const k = `${dKey}|${t}`;
          const prev = accumulator.talukas[k];
          if (!prev || (!prev.nameMr && talukaMr)) {
            accumulator.talukas[k] = { nameEn: talukaEn, nameMr: talukaMr };
          }
        }
      }
    }
  }
  return { rowsIn, rowsKept };
}

// ── Diagnostic inspector ────────────────────────────────────────────
function inspectFile(file) {
  console.log("\n==", path.basename(file), "==");
  let wb;
  try {
    wb = XLSX.readFile(file, { cellDates: false });
  } catch (e) {
    console.warn(`  could not parse: ${e.message}`);
    return;
  }
  for (const sheetName of wb.SheetNames) {
    const sheet = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, {
      header: 1, defval: "", raw: true,
    });
    if (rows.length === 0) { console.log(`  sheet "${sheetName}" empty`); continue; }
    const hdr = findHeaderRow(rows);
    const headers = (rows[hdr.idx] || []).map(normHeader);
    const cols = detectColumns(headers);
    let posIdx = -1;
    for (let i = 0; i < Math.min(30, rows.length); i++) {
      if (looksPositional(rows[i])) { posIdx = i; break; }
    }
    console.log(
      `  sheet "${sheetName}" — ${rows.length} rows · headerRow ${hdr.idx} (score ${hdr.score}) · positionalStart=${posIdx}`,
    );
    console.log("  headers :", headers.filter(Boolean));
    console.log("  detected:", cols);
    console.log("  sample  :");
    const from = posIdx !== -1 ? posIdx : hdr.idx + 1;
    for (let i = from; i < Math.min(from + 3, rows.length); i++) {
      console.log("    ", rows[i]);
    }
  }
}

// ── Main ────────────────────────────────────────────────────────────
function main() {
  console.log(`[build-lgd] source: ${LGD_SRC}`);
  if (!fs.existsSync(LGD_SRC)) {
    console.error(`[build-lgd] source folder does not exist: ${LGD_SRC}`);
    process.exit(1);
  }
  const files = listXlsxFiles(LGD_SRC);
  console.log(`[build-lgd] found ${files.length} .xlsx file(s)`);
  if (files.length === 0) { process.exit(1); }

  if (INSPECT_ONLY) {
    console.log("[build-lgd] --inspect mode — not writing JSON\n");
    for (const f of files) inspectFile(f);
    return;
  }

  const acc = { byVillageCode: {}, byName: {}, talukas: {} };
  let totalIn = 0, totalKept = 0;
  for (const f of files) {
    const hint = districtHintFromFilename(f);
    console.log(`\n[build-lgd] file ${path.basename(f)} (district hint: ${hint})`);
    const { rowsIn, rowsKept } = ingestFile(f, acc, hint);
    totalIn += rowsIn; totalKept += rowsKept;
    console.log(`[build-lgd] file totals: rowsIn=${rowsIn} kept=${rowsKept}`);
  }

  const stats = {
    villageCodes: Object.keys(acc.byVillageCode).length,
    nameKeys: Object.keys(acc.byName).length,
    talukaKeys: Object.keys(acc.talukas).length,
    rowsIn: totalIn,
    rowsKept: totalKept,
  };
  console.log("\n[build-lgd] stats:", stats);

  if (stats.nameKeys === 0) {
    console.error(
      "\n[build-lgd] WARNING: zero name keys produced. Re-run with --inspect to " +
        "print the actual layout and adjust HEADER_PATTERNS or the positional " +
        "fallback in scripts/build-lgd-local-names.mjs.",
    );
    process.exit(2);
  }

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(acc));
  const sz = fs.statSync(OUT_PATH).size;
  console.log(`[build-lgd] wrote ${OUT_PATH} (${(sz / 1024).toFixed(0)} KB)`);
}

main();
