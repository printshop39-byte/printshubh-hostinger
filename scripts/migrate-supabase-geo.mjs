/**
 * migrate-supabase-geo.mjs
 *
 * Bulk-loads Maharashtra districts → talukas → villages into Supabase from the
 * app's own dropdown JSON, enriching Marathi names (name_mr) directly from the
 * authoritative LGD dataset (public/data/lgd-master.json) via LGD-code joins —
 * NO fuzzy name matching, so what lands in the DB matches what the app shows.
 *
 * Source of truth (all already in the repo):
 *   public/data/dropdowns/districts.json
 *   public/data/dropdowns/talukas/<district_id>.json
 *   public/data/dropdowns/villages/<district_id>/<taluka_id>.json
 *   public/data/lgd-master.json  (.villages keyed by LGD village code →
 *                                  {nameMr, talukaMr, districtMr, ...})
 *
 * Keys written (text slugs, matching the app):
 *   districts.district_id   = "kolh-pur"
 *   talukas (district_id, taluka_id) = ("kolh-pur", "shirol")   ← composite
 *   villages.village_id     = "v-567322"  (deduped; 104 dup rows collapse)
 *
 * Referential integrity: any (district_id) / (district_id, taluka_id) that is
 * referenced by a child row but missing from the parent JSON is auto-synthesized
 * from the LGD record, so no foreign key can dangle.
 *
 * Prereqs:
 *   1. Run scripts/supabase-geo-schema.sql once in the Supabase SQL Editor.
 *   2. Set these env vars (in .env.local or the shell):
 *        SUPABASE_URL=https://<project-ref>.supabase.co
 *        SUPABASE_SERVICE_ROLE_KEY=<service role key — NOT the anon key>
 *      (NEXT_PUBLIC_SUPABASE_URL is accepted as a fallback for the URL.)
 *
 * Run:
 *   node scripts/migrate-supabase-geo.mjs           # load everything
 *   node scripts/migrate-supabase-geo.mjs --dry-run # build + report, no writes
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DATA = join(ROOT, "public", "data");
const DROP = join(DATA, "dropdowns");
const DRY_RUN = process.argv.includes("--dry-run");
const CHUNK = 500;

/* ── Minimal .env.local loader (no dotenv dependency) ───────────────────── */
function loadEnvLocal() {
  const p = join(ROOT, ".env.local");
  if (!existsSync(p)) return;
  for (const raw of readFileSync(p, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}
loadEnvLocal();

const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!DRY_RUN && (!SUPABASE_URL || !SERVICE_KEY)) {
  console.error(
    "\n✖ Missing env. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY " +
      "(in .env.local or the shell).\n" +
      "  Tip: run with --dry-run to validate the data without any DB writes.\n",
  );
  process.exit(1);
}

const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));

/* ── Load authoritative LGD maps ────────────────────────────────────────
 * .villages : code            → { nameMr, talukaMr, districtMr, ... }
 * .talukas  : "DIST|talukaEn" → { nameEn, nameMr }   (fallback for taluka MR)
 * .districts: "DISTRICTEN"    → "Marathi"            (fallback for district MR) */
console.log("Loading lgd-master.json …");
const LGD_MASTER = readJson(join(DATA, "lgd-master.json"));
const LGD_VILLAGES = LGD_MASTER.villages;
const LGD_TALUKAS = LGD_MASTER.talukas || {};
const LGD_DISTRICTS = LGD_MASTER.districts || {};
const lgdVil = (code) => (code != null ? LGD_VILLAGES[String(code)] : undefined);

/* Name normalisers — mirror src/lib/maharashtra-local-names.ts so the fallback
 * keys line up with how lgd-master.json was built. */
const normName = (s) => (s || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
const DISTRICT_ALIASES = {
  AHMADNAGAR: "AHMEDNAGAR",
  AHILYANAGAR: "AHMEDNAGAR",
  CHHATRAPATISAMBHAJINAGAR: "AURANGABAD",
  DHARASHIV: "OSMANABAD",
  KOLHPUR: "KOLHAPUR",
  NNDED: "NANDED",
  NANDURBR: "NANDURBAR",
  NSHIK: "NASHIK",
  STRA: "SATARA",
};
function normDistrict(raw) {
  if (!raw) return "";
  const upper = String(raw).toUpperCase().replace(/[^A-Z]+/g, "");
  return DISTRICT_ALIASES[upper] ?? upper;
}
/** Marathi taluka name from the LGD talukas map, given a district English key
 * and the taluka English name. */
function lgdTalukaMr(districtEn, talukaEn) {
  const d = normDistrict(districtEn);
  if (!d || !talukaEn) return "";
  const hit = LGD_TALUKAS[`${d}|${normName(talukaEn)}`];
  return (hit && hit.nameMr && hit.nameMr.trim()) || "";
}

/* ── MAHA taluka Marathi (tier-3 fallback) ──────────────────────────────
 * LGD is missing Marathi for ~99 talukas (e.g. Sangamner, Akot, Beed). The
 * app falls back to the MAHA_TALUKAS map inlined in
 * src/lib/maharashtra-local-names.ts, so we extract the same map here to keep
 * DB names consistent with what the UI shows. */
function loadMahaTalukaMr() {
  const map = new Map(); // "NORMDIST|normName(taluka)" → Marathi
  try {
    const src = readFileSync(
      join(ROOT, "src", "lib", "maharashtra-local-names.ts"),
      "utf8",
    );
    const start = src.indexOf("export const MAHA_TALUKAS");
    const open = src.indexOf("{", start);
    let depth = 0;
    let close = -1;
    for (let j = open; j < src.length; j++) {
      const c = src[j];
      if (c === "{") depth++;
      else if (c === "}" && --depth === 0) {
        close = j;
        break;
      }
    }
    const obj = JSON.parse(src.slice(open, close + 1));
    for (const [dist, list] of Object.entries(obj)) {
      for (const t of list) {
        if (t.local && t.local.trim()) {
          map.set(`${normDistrict(dist)}|${normName(t.name)}`, t.local.trim());
        }
      }
    }
  } catch (e) {
    console.warn("  (MAHA taluka fallback unavailable:", e.message, ")");
  }
  return map;
}
const MAHA_TALUKA_MR = loadMahaTalukaMr();
function mahaTalukaMr(districtEn, talukaEn) {
  const d = normDistrict(districtEn);
  if (!d || !talukaEn) return "";
  return MAHA_TALUKA_MR.get(`${d}|${normName(talukaEn)}`) || "";
}

/* ── MAHA village Marathi (village-level fallback) ───────────────────────
 * The app's village fallback: maha-village-names.json is keyed by TALUKA LGD
 * code → [{ n: englishName, l: marathiName }]. For villages whose own code
 * isn't in lgd-master (~1,987), this recovers ~521 authoritative names. We
 * resolve a village's taluka code from the taluka JSON's `lgd` field. */
const MAHA_VILLAGES = readJson(join(DATA, "maha-village-names.json"));
/** (district_id|taluka_id) → taluka LGD code (int), from the taluka JSON. */
const TALUKA_CODE = new Map();
for (const f of readdirSync(join(DROP, "talukas"))) {
  if (!f.endsWith(".json")) continue;
  for (const t of readJson(join(DROP, "talukas", f))) {
    if (t.lgd != null && String(t.lgd).trim()) {
      const n = parseInt(String(t.lgd), 10);
      if (Number.isFinite(n)) TALUKA_CODE.set(`${t.district_id}|${t.taluka_id}`, n);
    }
  }
}
/** Collapse only provably-same variants (Bk./Budruk, Kh./Khurd) + strip
 * non-alphanumerics — mirrors normNameRelaxed() in maharashtra-local-names.ts. */
function normNameRelaxed(s) {
  return (s || "")
    .toLowerCase()
    .replace(/\b(bk\.?|budruk)\b/g, "bk")
    .replace(/\b(kh\.?|khurd)\b/g, "kh")
    .replace(/[^a-z0-9]+/g, "");
}
function mahaVillageMr(districtId, talukaId, nameEn) {
  const code = TALUKA_CODE.get(`${districtId}|${talukaId}`);
  if (!code || !nameEn) return "";
  const list = MAHA_VILLAGES[String(code)];
  if (!list) return "";
  const ws = normName(nameEn);
  const wr = normNameRelaxed(nameEn);
  const hit =
    list.find((x) => normName(x.n) === ws) ||
    list.find((x) => normNameRelaxed(x.n) === wr);
  return (hit && hit.l && hit.l.trim()) || "";
}

/* ── 1. Villages: dedup by village_id, enrich name_mr, capture parent MR ── */
const districtMr = new Map(); // district_id            → name_mr (from a village)
const talukaMr = new Map(); //   "district_id|taluka_id"→ name_mr (from a village)
const talukaEnFromVil = new Map(); // "d|t"              → taluka name_en (LGD)
const districtEnFromVil = new Map(); // district_id      → district name_en (LGD)

const villageById = new Map();
let villageRowCount = 0;
let dupVillage = 0;
let villagesMissingMr = 0;

function walkVillages(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      walkVillages(p);
    } else if (e.name.endsWith(".json")) {
      for (const v of readJson(p)) {
        villageRowCount++;
        const rec = lgdVil(v.code);
        // name_mr with provenance: lgd (authoritative code join) → maha
        // (authoritative name join) → "" (English fallback; the translit
        // script fills these later and stamps source='translit').
        let name_mr = "";
        let name_mr_source = "";
        if (rec && rec.nameMr && rec.nameMr.trim()) {
          name_mr = rec.nameMr.trim();
          name_mr_source = "lgd";
        } else {
          const m = mahaVillageMr(v.district_id, v.taluka_id, v.name_en);
          if (m) {
            name_mr = m;
            name_mr_source = "maha";
          }
        }
        if (!name_mr) villagesMissingMr++;

        // Capture parent Marathi/English from the LGD village record so we can
        // fill talukas/districts (and synthesize any missing parents) later.
        const tKey = `${v.district_id}|${v.taluka_id}`;
        if (rec) {
          if (rec.talukaMr && !talukaMr.has(tKey)) talukaMr.set(tKey, rec.talukaMr);
          if (rec.talukaEn && !talukaEnFromVil.has(tKey))
            talukaEnFromVil.set(tKey, rec.talukaEn);
          if (rec.districtMr && !districtMr.has(v.district_id))
            districtMr.set(v.district_id, rec.districtMr);
          if (rec.districtEn && !districtEnFromVil.has(v.district_id))
            districtEnFromVil.set(v.district_id, rec.districtEn);
        }

        if (villageById.has(v.village_id)) {
          dupVillage++;
          continue; // first occurrence wins
        }
        villageById.set(v.village_id, {
          village_id: v.village_id,
          district_id: v.district_id,
          taluka_id: v.taluka_id,
          name_en: (v.name_en || "").trim(),
          name_mr,
          name_mr_source,
          code: v.code != null ? String(v.code) : null,
          boundary_file: v.boundary_file || null,
        });
      }
    }
  }
}
walkVillages(join(DROP, "villages"));
const villages = [...villageById.values()];

/* English district name per slug — used to key the LGD taluka fallback. */
const rawDistricts = readJson(join(DROP, "districts.json"));
const districtEnBySlug = new Map();
for (const d of rawDistricts) {
  const en = (d.name_en || "").trim() || districtEnFromVil.get(d.district_id) || "";
  if (en) districtEnBySlug.set(d.district_id, en);
}
for (const [slug, en] of districtEnFromVil) {
  if (!districtEnBySlug.has(slug)) districtEnBySlug.set(slug, en);
}

/* ── 2. Talukas: union of taluka files + any (d,t) referenced by villages ── */
const talukaByKey = new Map();
for (const f of readdirSync(join(DROP, "talukas"))) {
  if (!f.endsWith(".json")) continue;
  for (const t of readJson(join(DROP, "talukas", f))) {
    const key = `${t.district_id}|${t.taluka_id}`;
    const districtEn = districtEnBySlug.get(t.district_id) || t.district_id;
    talukaByKey.set(key, {
      district_id: t.district_id,
      taluka_id: t.taluka_id,
      name_en: (t.name_en || "").trim(),
      name_mr:
        talukaMr.get(key) ||
        (t.name_mr || "").trim() ||
        lgdTalukaMr(districtEn, t.name_en) ||
        mahaTalukaMr(districtEn, t.name_en) ||
        "",
      lgd: t.lgd != null ? String(t.lgd) : null,
    });
  }
}
let synthTalukas = 0;
for (const v of villages) {
  const key = `${v.district_id}|${v.taluka_id}`;
  if (talukaByKey.has(key)) continue;
  synthTalukas++;
  talukaByKey.set(key, {
    district_id: v.district_id,
    taluka_id: v.taluka_id,
    name_en: talukaEnFromVil.get(key) || v.taluka_id,
    name_mr:
      talukaMr.get(key) ||
      lgdTalukaMr(
        districtEnBySlug.get(v.district_id) || v.district_id,
        talukaEnFromVil.get(key),
      ) ||
      mahaTalukaMr(
        districtEnBySlug.get(v.district_id) || v.district_id,
        talukaEnFromVil.get(key),
      ) ||
      "",
    lgd: null,
  });
}
const talukas = [...talukaByKey.values()];

/* ── 3. Districts: union of districts.json + any referenced by children ── */
const districtById = new Map();
for (const d of rawDistricts) {
  const en = (d.name_en || "").trim();
  districtById.set(d.district_id, {
    district_id: d.district_id,
    name_en: en,
    name_mr:
      districtMr.get(d.district_id) ||
      (d.name_mr || "").trim() ||
      LGD_DISTRICTS[normDistrict(en)] ||
      "",
    lgd: d.lgd != null ? String(d.lgd) : null,
  });
}
let synthDistricts = 0;
for (const t of talukas) {
  if (districtById.has(t.district_id)) continue;
  synthDistricts++;
  districtById.set(t.district_id, {
    district_id: t.district_id,
    name_en: districtEnFromVil.get(t.district_id) || t.district_id,
    name_mr: districtMr.get(t.district_id) || "",
    lgd: null,
  });
}
const districts = [...districtById.values()];

/* ── Report ─────────────────────────────────────────────────────────────── */
const talukasMissingMr = talukas.filter((t) => !t.name_mr).length;
const districtsMissingMr = districts.filter((d) => !d.name_mr).length;
console.log("\n── Prepared ──────────────────────────────────────────────");
console.log(`districts : ${districts.length}  (synthesized ${synthDistricts}, no name_mr ${districtsMissingMr})`);
console.log(`talukas   : ${talukas.length}  (synthesized ${synthTalukas}, no name_mr ${talukasMissingMr})`);
console.log(`villages  : ${villages.length}  (from ${villageRowCount} rows, ${dupVillage} dup village_id dropped)`);
console.log(`            villages without a Marathi name (LGD miss): ${villagesMissingMr} (${((villagesMissingMr / villages.length) * 100).toFixed(1)}%)`);
console.log("──────────────────────────────────────────────────────────\n");

if (DRY_RUN) {
  console.log("--dry-run: no database writes performed.");
  process.exit(0);
}

/* ── Upsert in FK-safe order: districts → talukas → villages ────────────── */
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

async function upsertAll(table, rows, onConflict) {
  let done = 0;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const { error } = await supabase
      .from(table)
      .upsert(chunk, { onConflict, defaultToNull: false });
    if (error) {
      console.error(`\n✖ ${table}: batch at row ${i} failed:`, error.message);
      process.exit(1);
    }
    done += chunk.length;
    process.stdout.write(`\r  ${table}: ${done}/${rows.length}`);
  }
  process.stdout.write("\n");
}

console.log("Writing to Supabase …");
await upsertAll("districts", districts, "district_id");
await upsertAll("talukas", talukas, "district_id,taluka_id");
await upsertAll("villages", villages, "village_id");
console.log("\n✓ Migration complete.");
