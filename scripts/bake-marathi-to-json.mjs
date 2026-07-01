/**
 * bake-marathi-to-json.mjs
 *
 * Exports the enriched Marathi names (name_mr) from Supabase back INTO the
 * static dropdown JSON the public site reads, so the Nakasha Shodh page shows
 * full Marathi instantly — without connecting to Supabase and without the
 * ~8.7 MB runtime download of lgd-local-names.json + maha-village-names.json.
 *
 * Supabase stays the "editing" source of truth: correct a name in the DB, then
 * re-run this script to refresh the static files, then deploy.
 *
 * Writes name_mr into:
 *   public/data/dropdowns/districts.json
 *   public/data/dropdowns/talukas/<district_id>.json
 *   public/data/dropdowns/villages/<district_id>/<taluka_id>.json
 *
 * Only NON-EMPTY DB values overwrite; every other field (code, boundary_file,
 * lgd, ids) is preserved byte-for-byte. Rows with no DB Marathi keep whatever
 * they had (usually "").
 *
 * Run:
 *   node scripts/bake-marathi-to-json.mjs            # write the files
 *   node scripts/bake-marathi-to-json.mjs --dry-run  # report only, no writes
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DROP = join(ROOT, "public", "data", "dropdowns");
const DRY_RUN = process.argv.includes("--dry-run");

/* ── env ─────────────────────────────────────────────────────────────────── */
function loadEnvLocal() {
  const p = join(ROOT, ".env.local");
  if (!existsSync(p)) return;
  for (const raw of readFileSync(p, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const k = line.slice(0, eq).trim();
    const v = line.slice(eq + 1).trim().replace(/^['"]|['"]$/g, "");
    if (!(k in process.env)) process.env[k] = v;
  }
}
loadEnvLocal();
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("✖ Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

/* ── Page through a table, collecting selected columns ─────────────────── */
async function fetchAll(table, columns) {
  const rows = [];
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .neq("name_mr", "")
      .order(table === "villages" ? "village_id" : "district_id", { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) {
      console.error(`✖ fetch ${table} failed:`, error.message);
      process.exit(1);
    }
    rows.push(...data);
    if (data.length < PAGE) break;
  }
  return rows;
}

console.log("Reading Marathi names from Supabase …");
const dRows = await fetchAll("districts", "district_id,name_mr");
const tRows = await fetchAll("talukas", "district_id,taluka_id,name_mr");
const vRows = await fetchAll("villages", "village_id,name_mr");

const districtMr = new Map(dRows.map((r) => [r.district_id, r.name_mr]));
const talukaMr = new Map(tRows.map((r) => [`${r.district_id}|${r.taluka_id}`, r.name_mr]));
const villageMr = new Map(vRows.map((r) => [r.village_id, r.name_mr]));
console.log(`  districts: ${districtMr.size}  talukas: ${talukaMr.size}  villages: ${villageMr.size}`);

/* ── Apply to the JSON files ─────────────────────────────────────────────── */
let filesChanged = 0;
let rowsChanged = 0;

/** Update `name_mr` on rows via keyFn→Map lookup; write file only if changed. */
function applyFile(path, rows, lookup) {
  let changed = 0;
  for (const row of rows) {
    const mr = lookup(row);
    if (mr && mr !== row.name_mr) {
      row.name_mr = mr;
      changed++;
    }
  }
  if (changed > 0) {
    rowsChanged += changed;
    filesChanged++;
    if (!DRY_RUN) writeFileSync(path, JSON.stringify(rows, null, 2) + "\n");
  }
  return changed;
}

// districts.json
{
  const path = join(DROP, "districts.json");
  const rows = JSON.parse(readFileSync(path, "utf8"));
  applyFile(path, rows, (r) => districtMr.get(r.district_id));
}

// talukas/*.json
for (const f of readdirSync(join(DROP, "talukas"))) {
  if (!f.endsWith(".json")) continue;
  const path = join(DROP, "talukas", f);
  const rows = JSON.parse(readFileSync(path, "utf8"));
  applyFile(path, rows, (r) => talukaMr.get(`${r.district_id}|${r.taluka_id}`));
}

// villages/<district>/<taluka>.json
function walkVillages(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walkVillages(p);
    else if (e.name.endsWith(".json")) {
      const rows = JSON.parse(readFileSync(p, "utf8"));
      applyFile(p, rows, (r) => villageMr.get(r.village_id));
    }
  }
}
walkVillages(join(DROP, "villages"));

console.log(
  `\n${DRY_RUN ? "[dry-run] would update" : "Updated"} ${rowsChanged} name_mr values across ${filesChanged} files.`,
);
if (DRY_RUN) console.log("No files written (--dry-run).");
