# Supabase setup (customer leads + wallpaper catalogue + admin)

One Supabase project serves three things on printshubh.shop:

| Feature | What it needs |
| --- | --- |
| Customer leads (WhatsApp enquiries saved for the admin) | table `printshubh_inquiries` |
| Wallpaper catalogue admin | tables `printshubh_wallpaper_*` + the `wallpaper-previews` storage bucket |
| Admin sign-in | Supabase Auth (email + password, **sign-ups disabled**) **and** the `ADMIN_EMAILS` allowlist |

Until this is done the site keeps working: the public wallpaper catalogue shows its built-in
sample designs, the admin pages say "database not configured", and lead saving fails quietly
(WhatsApp still opens, as always).

## 0. Before creating anything: look for the OLD project

The project the site was using (reference starting `qehn…`) no longer resolves. Free Supabase
projects are **paused after about a week without activity**, and a paused project can usually be
**restored from the dashboard for a while** — with its data (old leads) intact.

1. Sign in at <https://supabase.com/dashboard> and look for a paused or inactive project.
2. If it is there, use **Restore project** and skip step 1 below (still do steps 2 to 6).
3. If it is gone, create a new one (step 1).

To stop this recurring: upgrade the project to Pro, or accept that a quiet month will pause it.

## 1. Create the project

- Name: `printshubh`. Region: **Mumbai (ap-south-1)** (closest to your customers).
- Set a strong database password and keep it in your password manager. The app does not use it.

## 2. Create the tables (SQL editor -> New query -> paste -> Run)

Run these in order. Each is safe to run twice.

1. `scripts/supabase-inquiries-schema.sql` — customer leads.
2. `scripts/supabase-wallpapers-schema.sql` — wallpaper tables, the preview bucket and 8 starter categories.
3. *(optional)* `scripts/supabase-wallpapers-seed-sample.sql` — the 19 sample designs, so the public catalogue is not empty when the database goes live.

Row-level security is on for every table with no policies. That means the public keys can read and write nothing; only the server can.

## 3. Admin sign-in (Authentication)

1. **Sign In / Providers -> Email**: keep Email enabled and turn **OFF "Allow new users to sign up"**.
   If this stays on, anyone could register and become an admin.
2. **Users -> Add user -> Create new user**: your admin email and a strong password, and tick **Auto Confirm User**.
   Adding a user here does **not** make them an admin: only addresses listed in `ADMIN_EMAILS` (step 4/5) can
   open any admin page. This project also holds accounts and data from other apps, which is exactly why.

## 4. Copy the keys (Project Settings -> API)

| You copy | Becomes | Secret? |
| --- | --- | --- |
| Project URL | `SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_URL` (same value) | no |
| `anon` `public` key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | no, public by design |
| `service_role` key | `SUPABASE_SERVICE_ROLE_KEY` | **YES. Never put it in code, chat, email or a `NEXT_PUBLIC_` variable.** |
| *(you choose)* admin emails | `ADMIN_EMAILS`, e.g. `owner@example.com, helper@example.com` | server-only; no `NEXT_PUBLIC_` prefix |

`ADMIN_EMAILS` ignores case and spaces. **If it is missing or empty, nobody can sign in to any admin page**
(the gate fails closed), so set it before testing.

If the service_role key is ever exposed, use **Project Settings -> API -> Reset** right away.

## 5. Set the variables

**On your computer** (for local testing): put the five values in `.env.local` (this file is git-ignored).

**On Vercel** (Project -> Settings -> Environment Variables): add the same five, for **Preview** first
(test there), then **Production**. Mark `SUPABASE_SERVICE_ROLE_KEY` as **Sensitive**.
The `NEXT_PUBLIC_` ones are baked in at build time, so **redeploy** after adding or changing them.

## 6. Check it

```powershell
node scripts/verify-supabase-setup.mjs
```

It is read-only (it changes nothing and never prints a key). It checks the variables, that the
project exists, the three tables, that the public key cannot read your data, the preview bucket
settings, that **public sign-ups are disabled**, and that `ADMIN_EMAILS` is set. Fix any `FAIL` line, run it again, and carry on
only when it says `All checks passed.`

Then, on the Preview deployment, sign in at `/admin/land-reports` and open `/admin/wallpapers`:
upload a test image (it becomes a **draft**), check the preview, publish it, confirm it appears on
`/wallpapers`, unpublish it, delete it.

## 7. Loading your real designs

- A few at a time: `/admin/wallpapers` -> choose files (JPG/PNG masters, at least 1600 px wide).
  They are shrunk in your browser; the originals never leave your computer.
- Many at once from the NAS folder: first `node scripts/wallpaper-ingest.mjs --source "<folder>" --category <slug>`
  (a dry run that writes nothing), then add `--apply` to create them as **drafts**.
- Nothing is public until you press **Publish**.
