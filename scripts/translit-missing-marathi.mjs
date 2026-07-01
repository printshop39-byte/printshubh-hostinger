/**
 * translit-missing-marathi.mjs
 *
 * Fills Marathi (name_mr) for villages that have NO authoritative name — the
 * ~1,466 rows where name_mr is still empty after the LGD + MAHA joins in
 * scripts/migrate-supabase-geo.mjs.
 *
 * Source: Google Input Tools transliteration (English → Devanagari). This is a
 * PHONETIC GUESS, not an official name, so every row it writes is stamped
 * name_mr_source='translit' — distinguishable from 'lgd'/'maha' so real names
 * can safely overwrite these later.
 *
 * Safe to re-run: it only processes rows where name_mr = '' (i.e. it resumes
 * where it left off, and re-does the set after any migration re-run).
 *
 * Prereqs:
 *   - scripts/migrate-supabase-geo.mjs already run (villages loaded, with the
 *     name_mr_source column present — see the ALTER in the chat / schema.sql).
 *   - SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local.
 *
 * Run:
 *   node scripts/translit-missing-marathi.mjs            # transliterate + write
 *   node scripts/translit-missing-marathi.mjs --dry-run  # preview 40, no writes
 */

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DRY_RUN = process.argv.includes("--dry-run");
const THROTTLE_MS = 120; // be gentle with the public endpoint
const UPDATE_CHUNK = 200;

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
    let v = line.slice(eq + 1).trim().replace(/^['"]|['"]$/g, "");
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
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

/* ── Name cleaning ───────────────────────────────────────────────────────
 * Strip admin-status tags in parens — (M Corp), (CT), (NP), (M CI), (N.V.),
 * (CB) … — so we transliterate just the place name. */
function coreName(nameEn) {
  return (nameEn || "").replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+/g, " ").trim();
}
/* English status words that are NOT names — skip these (leave English). */
const SKIP_WORDS = new Set([
  "submerged", "uninhabited", "forest", "unknown", "na", "n.a.", "-",
]);
function isTransliterable(core) {
  if (!core || core.length < 2) return false;
  if (SKIP_WORDS.has(core.toLowerCase())) return false;
  return true;
}

/* ── Google Input Tools transliteration (mr) ───────────────────────────── */
async function transliterate(core) {
  const url =
    "https://inputtools.google.com/request?text=" +
    encodeURIComponent(core) +
    "&itc=mr-t-i0-und&num=1&cp=0&cs=1&ie=utf-8&oe=utf-8";
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await fetch(url);
      const j = await r.json();
      if (j[0] === "SUCCESS" && j[1]?.[0]?.[1]?.[0]) {
        const out = j[1][0][1][0];
        // Only accept a result that actually contains Devanagari.
        if (/[ऀ-ॿ]/.test(out)) return out.trim();
      }
      return "";
    } catch {
      await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
    }
  }
  return "";
}

/* ── Fetch all villages still missing name_mr (paged) ───────────────────── */
async function fetchMissing() {
  const rows = [];
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from("villages")
      // district_id + taluka_id are NOT NULL (FK) — upsert needs them in the
      // payload or the INSERT arm of ON CONFLICT rejects the row.
      .select("village_id,name_en,district_id,taluka_id")
      .eq("name_mr", "")
      .order("village_id", { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) {
      console.error("✖ fetch failed:", error.message);
      process.exit(1);
    }
    rows.push(...data);
    if (data.length < PAGE) break;
  }
  return rows;
}

/* ── Main ────────────────────────────────────────────────────────────────── */
const missing = await fetchMissing();
console.log(`Villages still missing name_mr: ${missing.length}`);

const updates = [];
let skipped = 0;
let done = 0;
for (const row of missing) {
  const core = coreName(row.name_en);
  if (!isTransliterable(core)) {
    skipped++;
    continue;
  }
  const mr = await transliterate(core);
  if (mr) {
    updates.push({
      village_id: row.village_id,
      district_id: row.district_id,
      taluka_id: row.taluka_id,
      name_mr: mr,
      name_mr_source: "translit",
    });
    if (DRY_RUN && updates.length <= 40) {
      console.log(`  ${row.name_en.padEnd(28)} → ${mr}`);
    }
  } else {
    skipped++;
  }
  if (++done % 100 === 0) process.stdout.write(`\r  transliterated ${done}/${missing.length}`);
  await new Promise((r) => setTimeout(r, THROTTLE_MS));
}
process.stdout.write("\n");
console.log(`Transliterated: ${updates.length}  |  skipped (non-name / no result): ${skipped}`);

if (DRY_RUN) {
  console.log("\n--dry-run: no database writes. (Showed up to 40 samples above.)");
  process.exit(0);
}

/* Write back in chunks. upsert on village_id updates only these rows. */
let written = 0;
for (let i = 0; i < updates.length; i += UPDATE_CHUNK) {
  const chunk = updates.slice(i, i + UPDATE_CHUNK);
  const { error } = await supabase
    .from("villages")
    .upsert(chunk, { onConflict: "village_id", defaultToNull: false });
  if (error) {
    console.error("\n✖ update batch failed:", error.message);
    process.exit(1);
  }
  written += chunk.length;
  process.stdout.write(`\r  wrote ${written}/${updates.length}`);
}
process.stdout.write("\n");
console.log("✓ Transliteration pass complete. These rows now carry name_mr_source='translit'.");
