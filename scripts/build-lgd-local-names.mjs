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

// ── CP437 mojibake decoder ──────────────────────────────────────────
//
// LGD Maharashtra .xlsx exports store Marathi (Devanagari) cells as
// UTF-8 bytes that were saved through a CP437 (DOS OEM) round-trip,
// so the cell shows up as e.g. "αñàαñ¼αÑìαñªαÑüαñ▓ αñ▓αñ╛αñƒ"
// instead of "अब्दुल लाट".
//
// To recover, we map each visible char back to its CP437 byte (the
// table below covers every code point CP437 assigns to 0x80–0xFF),
// then decode the resulting bytes as UTF-8.
const CP437 = {
  "Ç":0x80,"ü":0x81,"é":0x82,"â":0x83,"ä":0x84,"à":0x85,"å":0x86,"ç":0x87,
  "ê":0x88,"ë":0x89,"è":0x8A,"ï":0x8B,"î":0x8C,"ì":0x8D,"Ä":0x8E,"Å":0x8F,
  "É":0x90,"æ":0x91,"Æ":0x92,"ô":0x93,"ö":0x94,"ò":0x95,"û":0x96,"ù":0x97,
  "ÿ":0x98,"Ö":0x99,"Ü":0x9A,"¢":0x9B,"£":0x9C,"¥":0x9D,"₧":0x9E,"ƒ":0x9F,
  "á":0xA0,"í":0xA1,"ó":0xA2,"ú":0xA3,"ñ":0xA4,"Ñ":0xA5,"ª":0xA6,"º":0xA7,
  "¿":0xA8,"⌐":0xA9,"¬":0xAA,"½":0xAB,"¼":0xAC,"¡":0xAD,"«":0xAE,"»":0xAF,
  "░":0xB0,"▒":0xB1,"▓":0xB2,"│":0xB3,"┤":0xB4,"╡":0xB5,"╢":0xB6,"╖":0xB7,
  "╕":0xB8,"╣":0xB9,"║":0xBA,"╗":0xBB,"╝":0xBC,"╜":0xBD,"╛":0xBE,"┐":0xBF,
  "└":0xC0,"┴":0xC1,"┬":0xC2,"├":0xC3,"─":0xC4,"┼":0xC5,"╞":0xC6,"╟":0xC7,
  "╚":0xC8,"╔":0xC9,"╩":0xCA,"╦":0xCB,"╠":0xCC,"═":0xCD,"╬":0xCE,"╧":0xCF,
  "╨":0xD0,"╤":0xD1,"╥":0xD2,"╙":0xD3,"╘":0xD4,"╒":0xD5,"╓":0xD6,"╫":0xD7,
  "╪":0xD8,"┘":0xD9,"┌":0xDA,"█":0xDB,"▄":0xDC,"▌":0xDD,"▐":0xDE,"▀":0xDF,
  "α":0xE0,"ß":0xE1,"Γ":0xE2,"π":0xE3,"Σ":0xE4,"σ":0xE5,"µ":0xE6,"τ":0xE7,
  "Φ":0xE8,"Θ":0xE9,"Ω":0xEA,"δ":0xEB,"∞":0xEC,"φ":0xED,"ε":0xEE,"∩":0xEF,
  "≡":0xF0,"±":0xF1,"≥":0xF2,"≤":0xF3,"⌠":0xF4,"⌡":0xF5,"÷":0xF6,"≈":0xF7,
  "°":0xF8,"∙":0xF9,"·":0xFA,"√":0xFB,"ⁿ":0xFC,"²":0xFD,"■":0xFE," ":0xFF,
};

const DEVA_RANGE = /[ऀ-ॿ]/;

/** Decode a CP437-mojibake string back to its original UTF-8 text.
 * Returns the original string unchanged if:
 *   • the input is empty / null
 *   • the input already contains real Devanagari (no decoding needed)
 *   • any character isn't in the CP437 map (we'd lose data) */
function decodeMojibakeIfNeeded(raw) {
  if (!raw) return "";
  const s = String(raw);
  if (DEVA_RANGE.test(s)) return s; // already valid Devanagari, leave alone
  // Heuristic: only attempt decode if the string contains chars typical of
  // the mojibake pattern (α, ñ, Ñ, à, ì, etc.). Saves us from mangling
  // genuine English values.
  if (!/[αñÑàìª▓╛ƒ¼]/.test(s)) return s;
  const bytes = [];
  for (const ch of s) {
    const code = ch.charCodeAt(0);
    if (code < 0x80) {
      bytes.push(code);
    } else if (CP437[ch] !== undefined) {
      bytes.push(CP437[ch]);
    } else {
      // unknown high-bit char — bail out, return original
      return s;
    }
  }
  try {
    const decoded = Buffer.from(bytes).toString("utf8");
    // Sanity check: decoded result must contain Devanagari, otherwise it's
    // not the kind of mojibake we expected and we'd be returning garbage.
    if (!DEVA_RANGE.test(decoded)) return s;
    return decoded;
  } catch {
    return s;
  }
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
    /^district\s*name\s*\(\s*in\s*local(?:\s*language)?\s*\)/i,
    /^district\s*\(\s*local(?:\s*language)?\s*\)/i,
  ],
  talukaEn: [
    /^(sub[_ \-]?district|tehsil|taluka|block)\s*name\s*\(\s*in\s*english\s*\)/i,
    /^(sub[_ \-]?district|tehsil|taluka|block)\s*name$/i,
    /^(sub[_ \-]?district|tehsil|taluka|block)$/i,
  ],
  talukaMr: [
    /^(sub[_ \-]?district|tehsil|taluka|block)\s*name\s*\(\s*in\s*local(?:\s*language)?\s*\)/i,
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
        // CP437-mojibake → real Devanagari. No-op if already valid UTF-8
        // or pure ASCII.
        villageMr = decodeMojibakeIfNeeded(String(r[3] ?? "").trim());
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
        districtMr = decodeMojibakeIfNeeded(cell("districtMr"));
        talukaEn = cell("talukaEn");
        talukaMr = decodeMojibakeIfNeeded(cell("talukaMr"));
        villageEn = cell("villageEn");
        villageMr = decodeMojibakeIfNeeded(cell("villageMr"));
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
