#!/usr/bin/env node
// scripts/inspect-lgd-cell.mjs
//
// Diagnostic helper. Reads one LGD XLSX file and prints:
//   1. The first 20 rows as plain JS arrays (so we can see the data flow).
//   2. The raw cell objects (t / v / w) for columns A–G of every row
//      whose village-name cell matches one of the target names below.
//
// Useful for confirming whether the Marathi column carries real Devanagari
// text or CP437-mojibake (the LGD Maharashtra exports use mojibake).
//
// Usage:
//   node scripts/inspect-lgd-cell.mjs "R:\\my jobs\\18 nmay codex 3d site\\all maharshtra lgp sheet data\\KOLHAPUR.xlsx"
//   node scripts/inspect-lgd-cell.mjs "<path-to-xlsx>" "Adur,Ambavane,Alabadevi"  # custom target list

import path from "node:path";

const XLSX = (await import("xlsx")).default ?? (await import("xlsx"));

const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/inspect-lgd-cell.mjs <path-to-xlsx> [comma,separated,targets]");
  process.exit(1);
}

const TARGETS = (process.argv[3] || "Adur,Ambavane,Alabadevi")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

console.log("Reading:", path.basename(file));
console.log("Targeting villages:", TARGETS);

const wb = XLSX.readFile(file, { cellDates: false, cellText: true });

for (const sheetName of wb.SheetNames) {
  console.log(`\n=== Sheet: ${sheetName} ===`);
  const sheet = wb.Sheets[sheetName];

  // ── 1) First 20 rows as plain arrays ───────────────────────────────
  const rows = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: "",
    raw: true,
  });
  console.log(`\n-- First 20 rows (as arrays) --`);
  for (let i = 0; i < Math.min(20, rows.length); i++) {
    console.log(`row ${i}:`, rows[i]);
  }

  // ── 2) Raw cell dumps for any row whose col C (village English name)
  //       matches one of the TARGETS ──────────────────────────────────
  console.log(`\n-- Raw cell objects for target villages (cols A–G) --`);
  const ref = sheet["!ref"];
  if (!ref) { console.log("  no !ref, skipping"); continue; }
  const range = XLSX.utils.decode_range(ref);
  let hits = 0;
  for (let r = range.s.r; r <= range.e.r; r++) {
    // Read col C value for this row.
    const colC = sheet[XLSX.utils.encode_cell({ r, c: 2 })];
    const nameC = colC ? String(colC.v ?? "").trim().toLowerCase() : "";
    if (!TARGETS.includes(nameC)) continue;

    hits++;
    const dump = {};
    for (let c = 0; c <= 6; c++) {
      const addr = XLSX.utils.encode_cell({ r, c });
      const cell = sheet[addr];
      if (cell) {
        dump[addr] = { t: cell.t, v: cell.v, w: cell.w };
      }
    }
    console.log(`row ${r} (col C = "${colC?.v ?? ""}")`);
    console.log("  ", JSON.stringify(dump));
  }
  if (hits === 0) {
    console.log(`  (no rows matched the target list in this sheet)`);
  }
}
