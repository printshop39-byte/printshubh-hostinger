/**
 * Bulk-load wallpaper designs from a folder of production masters.
 *
 *   # 1. Look first. Writes NOTHING, uploads NOTHING:
 *   node scripts/wallpaper-ingest.mjs --source "D:/path/to/masters" --category luxury-premium
 *
 *   # 2. Do it: creates DRAFT designs (nothing goes public until you publish them in /admin/wallpapers)
 *   node scripts/wallpaper-ingest.mjs --source "D:/path/to/masters" --category luxury-premium --apply
 *
 * Options
 *   --source <dir>      folder holding the masters (read-only; never modified)
 *   --category <slug>   category every new design is filed under (change it later in admin)
 *   --limit <n>         only the first n candidates (good for a trial run)
 *   --skip a,b,c        sub-folders to ignore (default: _wall_graphic_previews, "canvas painting", gourmet-lifestyle)
 *   --apply             actually upload + create drafts (otherwise dry run)
 *
 * What it does for each master: shrinks it to three small WebP previews (400 / 900 / 1600 px
 * wide), uploads ONLY those to the preview bucket, and creates a draft row with the next free
 * Design ID. The full-resolution master is read from disk and never copied anywhere.
 * Already-loaded files are remembered in .catalogue-ingest/ledger.json, so re-running is safe.
 *
 * Needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (read from the environment, else .env.local).
 * Run it on your own computer — the service-role key must never be put anywhere public.
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";

const argv = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : fallback;
};
const flag = (name) => argv.includes(`--${name}`);

const SOURCE = arg("source");
const CATEGORY = arg("category");
const LIMIT = Number(arg("limit", "0")) || 0;
const APPLY = flag("apply");
const SKIP = new Set(
  (arg("skip", "_wall_graphic_previews,canvas painting,gourmet-lifestyle") ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean),
);
const WIDTHS = [400, 900, 1600];
const MIN_WIDTH = 1600;
const BUCKET = "wallpaper-previews";
const LEDGER_DIR = path.resolve(".catalogue-ingest");
const LEDGER = path.join(LEDGER_DIR, "ledger.json");

if (!SOURCE || !CATEGORY) {
  console.error('Usage: node scripts/wallpaper-ingest.mjs --source "<folder>" --category <slug> [--limit n] [--apply]');
  process.exit(1);
}
if (!existsSync(SOURCE)) {
  console.error(`Source folder not found: ${SOURCE}`);
  process.exit(1);
}

/* ── credentials (only needed with --apply) ────────────────────────────── */
function env(name) {
  if (process.env[name] !== undefined) return process.env[name];
  const f = path.resolve(".env.local");
  if (!existsSync(f)) return "";
  const m = readFileSync(f, "utf8").match(new RegExp(`^${name}=(.*)$`, "m"));
  return m ? m[1].trim().replace(/^["']|["']$/g, "") : "";
}

/* ── find candidate masters ────────────────────────────────────────────── */
const EXCLUDE = /(PU_Leather|Dual_Surface|Mockup|CloseUp|Interior|Presentation|preview|prev\.|Gallery_Wall|_tmp|Thumbs|Seamless_Tile|HorizontalRepeat|Realistic|Upscaled)/i;
const isJpg = (f) => /\.jpe?g$/i.test(f);
const sizeOf = (p) => statSync(p).size;

function candidates() {
  const out = [];
  const root = readdirSync(SOURCE, { withFileTypes: true });
  for (const e of root) {
    if (e.isFile() && isJpg(e.name) && !EXCLUDE.test(e.name)) out.push(path.join(SOURCE, e.name));
  }
  for (const d of root.filter((e) => e.isDirectory() && !SKIP.has(e.name.toLowerCase()))) {
    const dir = path.join(SOURCE, d.name);
    const files = readdirSync(dir).filter((f) => isJpg(f) && !EXCLUDE.test(f)).map((f) => path.join(dir, f));
    if (files.length === 0) continue;
    // One design per folder: prefer a file named Wallpaper / Master / Panoramic, else the largest.
    const preferred = files.filter((f) => /wallpaper|master|panoramic/i.test(path.basename(f)));
    const pool = preferred.length ? preferred : files;
    out.push(pool.sort((a, b) => sizeOf(b) - sizeOf(a))[0]);
  }
  return out.sort();
}

function titleFrom(file) {
  const base = path
    .basename(file)
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/\b\d{3,5}\s?x\s?\d{3,5}\b/gi, " ")
    .replace(/\b(8k|4k|300dpi|100ppi|master|wallpaper|panoramic|final|copy)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return (base || path.basename(file)).replace(/\b\w/g, (c) => c.toUpperCase()).slice(0, 120);
}

async function makePreviews(file) {
  const meta = await sharp(file, { limitInputPixels: false }).metadata();
  if (!meta.width || meta.width < MIN_WIDTH) return { error: `only ${meta.width ?? "?"} px wide (need ${MIN_WIDTH}+)` };
  const buffers = {};
  for (const w of WIDTHS) {
    buffers[w] = await sharp(file, { limitInputPixels: false })
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: 76, effort: 5 })
      .toBuffer();
  }
  const big = await sharp(buffers[1600]).metadata();
  return { buffers, width: big.width, height: big.height, master: `${meta.width}x${meta.height}` };
}

/* ── Supabase REST (service role) ──────────────────────────────────────── */
const URL_ = (env("SUPABASE_URL") || "").replace(/\/$/, "");
const KEY = env("SUPABASE_SERVICE_ROLE_KEY");
const hdr = (extra = {}) => ({ apikey: KEY, Authorization: `Bearer ${KEY}`, ...extra });
async function api(p, init = {}) {
  const res = await fetch(`${URL_}${p}`, { ...init, headers: hdr(init.headers) });
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* empty */
  }
  return { ok: res.ok, status: res.status, data };
}

function loadLedger() {
  try {
    return JSON.parse(readFileSync(LEDGER, "utf8"));
  } catch {
    return {};
  }
}
function saveLedger(l) {
  mkdirSync(LEDGER_DIR, { recursive: true });
  writeFileSync(LEDGER, JSON.stringify(l, null, 2));
}

/* ── main ──────────────────────────────────────────────────────────────── */
const ledger = loadLedger();
let list = candidates().filter((f) => !ledger[path.relative(SOURCE, f)]);
const alreadyDone = candidates().length - list.length;
if (LIMIT) list = list.slice(0, LIMIT);

console.log(`${APPLY ? "APPLY" : "DRY RUN (nothing is written or uploaded)"} — source: ${SOURCE}`);
console.log(`category: ${CATEGORY} | candidates: ${list.length}${alreadyDone ? ` (+${alreadyDone} already loaded, skipped)` : ""}\n`);

let nextNum = 0;
if (APPLY) {
  if (!URL_ || !KEY) {
    console.error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set (environment or .env.local).");
    process.exit(1);
  }
  const cat = await api(`/rest/v1/printshubh_wallpaper_categories?select=slug&slug=eq.${encodeURIComponent(CATEGORY)}`);
  if (!cat.ok) {
    console.error(`Cannot reach the catalogue tables (HTTP ${cat.status}). Run scripts/supabase-wallpapers-schema.sql first.`);
    process.exit(1);
  }
  if (!Array.isArray(cat.data) || cat.data.length === 0) {
    console.error(`Category "${CATEGORY}" does not exist. Create it in /admin/wallpapers first.`);
    process.exit(1);
  }
  const ids = await api("/rest/v1/printshubh_wallpaper_designs?select=id&limit=100000");
  nextNum = (Array.isArray(ids.data) ? ids.data : []).reduce((m, r) => Math.max(m, Number(r.id.slice(3)) || 0), 0) + 1;
}

let ok = 0, skipped = 0, totalKb = 0;
for (const file of list) {
  const rel = path.relative(SOURCE, file);
  const title = titleFrom(file);
  const p = await makePreviews(file);
  if (p.error) {
    console.log(`SKIP  ${rel}  — ${p.error}`);
    skipped++;
    continue;
  }
  const kb = Math.round(WIDTHS.reduce((s, w) => s + p.buffers[w].length, 0) / 1024);
  totalKb += kb;
  if (!APPLY) {
    console.log(`would add  "${title}"  (master ${p.master}, previews ${kb} KB)   <- ${rel}`);
    ok++;
    continue;
  }
  const id = `WP-${String(nextNum).padStart(3, "0")}`;
  const key = `${id.toLowerCase()}-${crypto.randomBytes(4).toString("hex")}`;
  let uploaded = true;
  for (const w of WIDTHS) {
    const r = await api(`/storage/v1/object/${BUCKET}/${key}-${w}.webp`, {
      method: "POST",
      headers: { "Content-Type": "image/webp", "Cache-Control": "max-age=31536000" },
      body: p.buffers[w],
    });
    if (!r.ok) uploaded = false;
  }
  const cleanup = () =>
    api(`/storage/v1/object/${BUCKET}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prefixes: WIDTHS.map((w) => `${key}-${w}.webp`) }) });
  if (!uploaded) {
    await cleanup();
    console.log(`FAIL  ${rel} — storage rejected the upload`);
    skipped++;
    continue;
  }
  const ins = await api("/rest/v1/printshubh_wallpaper_designs", {
    method: "POST",
    headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify({ id, title, category_slug: CATEGORY, tags: [], description: "", featured: false, status: "draft", preview_base: `storage:${key}`, width: p.width, height: p.height }),
  });
  if (!ins.ok) {
    await cleanup(); // never leave orphaned previews behind
    console.log(`FAIL  ${rel} — could not create ${id} (HTTP ${ins.status})`);
    skipped++;
    continue;
  }
  ledger[rel] = { id, at: new Date().toISOString() };
  saveLedger(ledger);
  nextNum++;
  console.log(`added ${id}  "${title}"  (${kb} KB of previews, draft)`);
  ok++;
}
console.log(`\n${APPLY ? "created" : "would create"} ${ok} design(s)${skipped ? `, ${skipped} skipped/failed` : ""}; ${(totalKb / 1024).toFixed(1)} MB of previews.`);
if (!APPLY) console.log("Dry run only. Add --apply to create them as drafts.");
else console.log("They are DRAFTS: review each in /admin/wallpapers, set category/tags, then publish.");
