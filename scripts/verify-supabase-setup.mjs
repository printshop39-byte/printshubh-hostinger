/**
 * Checks that a Supabase project is set up correctly for PRINTSHUBH. READ-ONLY:
 * it only reads settings and lists; it never inserts, updates or deletes anything,
 * and it never prints a key.
 *
 *   node scripts/verify-supabase-setup.mjs
 *
 * Reads these from the environment, else from .env.local:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, ADMIN_EMAILS
 *
 * Exit code 0 = every check passed, 1 = something needs fixing.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import dns from "node:dns/promises";

function env(name) {
  if (process.env[name] !== undefined) return process.env[name].trim();
  const f = path.resolve(".env.local");
  if (!existsSync(f)) return "";
  const m = readFileSync(f, "utf8").match(new RegExp(`^${name}=(.*)$`, "m"));
  return m ? m[1].trim().replace(/^["']|["']$/g, "") : "";
}

const URL_ = env("SUPABASE_URL").replace(/\/$/, "");
const SERVICE = env("SUPABASE_SERVICE_ROLE_KEY");
const PUB_URL = env("NEXT_PUBLIC_SUPABASE_URL").replace(/\/$/, "");
const ANON = env("NEXT_PUBLIC_SUPABASE_ANON_KEY");

let failed = 0;
const pass = (m) => console.log(`  PASS  ${m}`);
const fail = (m, fix) => {
  failed++;
  console.log(`  FAIL  ${m}${fix ? `\n        -> ${fix}` : ""}`);
};
const warn = (m) => console.log(`  NOTE  ${m}`);
const head = (t) => console.log(`\n${t}`);

async function call(base, p, key, init = {}) {
  try {
    const res = await fetch(`${base}${p}`, { ...init, headers: { apikey: key, Authorization: `Bearer ${key}`, ...(init.headers ?? {}) } });
    let body = null;
    try {
      body = await res.json();
    } catch {
      /* empty */
    }
    return { ok: res.ok, status: res.status, body };
  } catch (e) {
    return { ok: false, status: 0, body: null, error: e?.cause?.code ?? e.message };
  }
}

head("1. Configuration");
if (!URL_) fail("SUPABASE_URL is not set");
else pass(`SUPABASE_URL is set (${new URL(URL_).host.slice(0, 4)}…${new URL(URL_).host.slice(-14)})`);
if (SERVICE) pass("SUPABASE_SERVICE_ROLE_KEY is set");
else fail("SUPABASE_SERVICE_ROLE_KEY is not set");
if (PUB_URL) pass("NEXT_PUBLIC_SUPABASE_URL is set");
else fail("NEXT_PUBLIC_SUPABASE_URL is not set", "The admin sign-in needs it (it is not a secret).");
if (ANON) pass("NEXT_PUBLIC_SUPABASE_ANON_KEY is set");
else fail("NEXT_PUBLIC_SUPABASE_ANON_KEY is not set", "The admin sign-in needs it (the anon key is public by design).");
if (URL_ && PUB_URL && URL_ !== PUB_URL) fail("SUPABASE_URL and NEXT_PUBLIC_SUPABASE_URL differ", "They must point at the SAME project.");
if (SERVICE && SERVICE === ANON) fail("The service-role key equals the anon key", "Use the secret service_role key for SUPABASE_SERVICE_ROLE_KEY.");
if (!URL_ || !SERVICE) {
  console.log("\nCannot continue without SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

head("2. The project is reachable");
const host = new URL(URL_).hostname;
try {
  await dns.lookup(host);
  pass(`${host} resolves`);
} catch {
  fail(`${host} does not exist`, "This project was deleted or the URL is wrong. Check Project Settings -> API in the dashboard.");
  console.log("\nStopping: nothing else can be checked.");
  process.exit(1);
}
const ping = await call(URL_, "/rest/v1/", SERVICE);
if (ping.status === 0 || ping.status === 401 || ping.status === 403) {
  fail(`The service-role key was not accepted (HTTP ${ping.status})`, "Copy the service_role secret from Project Settings -> API.");
} else pass("The service-role key is accepted");

head("3. Tables");
const tables = {
  printshubh_inquiries: "scripts/supabase-inquiries-schema.sql",
  printshubh_wallpaper_categories: "scripts/supabase-wallpapers-schema.sql",
  printshubh_wallpaper_designs: "scripts/supabase-wallpapers-schema.sql",
};
const counts = {};
for (const [t, file] of Object.entries(tables)) {
  const r = await call(URL_, `/rest/v1/${t}?select=*&limit=1`, SERVICE, { headers: { Prefer: "count=exact" } });
  if (r.ok) {
    pass(`${t} exists`);
    counts[t] = Array.isArray(r.body) ? r.body.length : 0;
  } else fail(`${t} is missing (HTTP ${r.status})`, `Run ${file} in the SQL editor.`);
}
if (counts.printshubh_wallpaper_categories === 0) warn("No categories yet — the schema script inserts 8 starter categories; re-run it if you expected them.");

head("4. Row-level security (public keys must see nothing)");
if (!ANON || !PUB_URL) warn("Skipped: the anon key is not set.");
else {
  for (const t of Object.keys(tables)) {
    if (!(t in counts)) continue;
    const r = await call(PUB_URL, `/rest/v1/${t}?select=*&limit=1`, ANON);
    const leaks = r.ok && Array.isArray(r.body) && r.body.length > 0;
    if (leaks) fail(`${t} is readable with the PUBLIC key`, "Run: alter table public." + t + " enable row level security;");
    else if (counts[t] > 0 || r.status === 401 || r.status === 403) pass(`${t}: the public key reads nothing`);
    else warn(`${t}: empty table, so a leak cannot be ruled out yet — re-run this script after the first row exists.`);
  }
}

head("5. Preview storage bucket");
const bucket = await call(URL_, "/storage/v1/bucket/wallpaper-previews", SERVICE);
if (!bucket.ok || !bucket.body) fail("Bucket 'wallpaper-previews' is missing", "Run scripts/supabase-wallpapers-schema.sql (it creates the bucket).");
else {
  const b = bucket.body;
  if (b.public === true) pass("The bucket is public-read (previews load straight from the CDN)");
  else fail("The bucket is not public", "Previews would not load for visitors. Re-run the schema script.");
  const limit = Number(b.file_size_limit);
  if (limit && limit <= 1048576) pass(`File size limit is ${Math.round(limit / 1024)} KB`);
  else fail("The bucket has no 1 MB file size limit", "Re-run the schema script.");
  const mimes = b.allowed_mime_types ?? [];
  if (mimes.length === 1 && mimes[0] === "image/webp") pass("Only image/webp is accepted");
  else fail(`Allowed types are ${JSON.stringify(mimes)}`, "Should be exactly image/webp. Re-run the schema script.");
}

head("6. Admin sign-in");
if (!ANON || !PUB_URL) warn("Skipped: the anon key is not set.");
else {
  const s = await call(PUB_URL, "/auth/v1/settings", ANON);
  if (!s.ok || !s.body) fail(`Could not read the auth settings (HTTP ${s.status})`, "Check the anon key.");
  else {
    if (s.body.disable_signup === true) pass("Public sign-ups are DISABLED (only invited admins can exist)");
    else fail("Public sign-ups are ENABLED — anyone could create an account and become an admin", "Authentication -> Sign In / Providers -> Email -> turn OFF 'Allow new users to sign up'.");
    if (s.body.external?.email === false) fail("Email sign-in is switched off", "Authentication -> Providers -> Email -> enable it (the admin signs in with email + password).");
    else pass("Email + password sign-in is available");
  }
  warn("Create the admin user yourself: Authentication -> Users -> Add user (tick 'Auto Confirm User').");
}

head("7. Admin allowlist (ADMIN_EMAILS)");
{
  const list = [];
  for (const part of env("ADMIN_EMAILS").split(/[,;\s]+/)) {
    const e = part.trim().replace(/^["']+|["']+$/g, "").toLowerCase();
    if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e) && !list.includes(e)) list.push(e);
  }
  if (list.length === 0) {
    fail("ADMIN_EMAILS is missing or empty — nobody can sign in to any admin page", 'Set ADMIN_EMAILS="you@example.com" (comma-separated for several admins). It is server-only: do NOT prefix it with NEXT_PUBLIC_.');
  } else {
    pass(`ADMIN_EMAILS lists ${list.length} admin address${list.length === 1 ? "" : "es"}`);
    const users = await call(URL_, "/auth/v1/admin/users?per_page=1000&page=1", SERVICE);
    if (users.ok && Array.isArray(users.body?.users)) {
      const confirmed = users.body.users.filter((u) => (u.email_confirmed_at || u.confirmed_at) && list.includes(String(u.email ?? "").toLowerCase()));
      if (confirmed.length === list.length) pass("Every allowlisted address has a confirmed account");
      else warn(`${confirmed.length} of ${list.length} allowlisted addresses have a confirmed account yet — create the rest under Authentication -> Users (tick Auto Confirm).`);
    } else warn("Could not list auth users to cross-check the allowlist.");
  }
}

console.log(failed === 0 ? "\nAll checks passed." : `\n${failed} check(s) need fixing (see the FAIL lines above).`);
process.exitCode = failed === 0 ? 0 : 1;
