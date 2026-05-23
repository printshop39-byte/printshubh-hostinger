# Deploying PrintShubh to Hostinger (Node.js / Next.js)

PrintShubh is a **Next.js 16 App Router** project. It needs a Node.js
runtime — not plain `public_html` shared hosting — so every dynamic
feature (Marathi/English toggle, map dropdowns, village boundary fetch,
MapLibre layer switcher, plot drawing, WhatsApp message builder, the
`/about` `/contact` `/faq` `/support` routes, app icon) keeps working
in production exactly like it does in `npm run dev`.

> **Do not deploy a static `out/` build.** PrintShubh is intentionally
> configured for a Node server. A static export would freeze the site at
> build time and block every future feature in the roadmap — admin
> dashboard, customer orders, payment gateway callbacks, WhatsApp / SMS
> webhooks, and any private API endpoint. See the **"About static
> exports"** section at the bottom of this file for the long version.

---

## 1. What Hostinger plan to choose

| Plan                              | Verdict for PrintShubh                                  |
| --------------------------------- | ------------------------------------------------------- |
| **Hostinger VPS — KVM 2 or KVM 4** | ✅ **Recommended.** Full root, Node 20/22, PM2, Nginx.  |
| Hostinger Cloud Hosting (Business+) | ✅ Works — has built-in Node.js + Git deploy.            |
| Hostinger Premium Web Hosting     | ❌ PHP-only. Cannot run Node.js / Next.js.              |
| Static `public_html` upload       | ❌ Loses all dynamic features. See bottom of file.       |

KVM 1 (1 GB RAM) is tight for a `next build` on a project this size — it
peaks around 1.1–1.4 GB during compilation. Either temporarily add swap,
or build locally and rsync the result up. KVM 2 (2 GB RAM) builds
comfortably with room to spare.

---

## 2. What goes up, what stays behind

### ✅ Ship to the server

```
src/                       — all TypeScript source
public/                    — including the full public/data/ folder (~100+ MB)
package.json
package-lock.json
next.config.ts
tsconfig.json
postcss.config.mjs
eslint.config.mjs
HOSTINGER-DEPLOY.md        — this file
```

### ❌ Do NOT upload

| Folder / file       | Why skip                                                  |
| ------------------- | --------------------------------------------------------- |
| `node_modules/`     | Server reinstalls cleanly from `package-lock.json`.       |
| `.next/`            | Server rebuilds. Local cache breaks across architectures. |
| `.env*`             | Secrets — paste them into Hostinger's env-vars UI instead. |
| `out/` `build/`     | Only exists if you ran a static export. Not used.         |
| `*.tsbuildinfo`     | TS incremental-build cache. Local only.                   |
| Editor caches       | `.vscode/`, `.idea/`, `.DS_Store`, etc.                    |

The project's `.gitignore` already lists every one of these — if you
deploy via Git, you're safe by default.

### About `public/data/`

This folder holds the 44,659-village dropdown JSONs and the per-taluka
GeoJSON boundary files (~100 MB total). It **must** travel with the
deployment. Two options:

- **Git LFS** — clean, but requires Git LFS support on both ends.
- **Plain Git** — works, but inflates the repo. Acceptable for
  PrintShubh because the data rarely changes.
- **rsync the folder separately** — keep the data **out of Git** (add
  `/public/data/` to `.gitignore`) and `rsync -avz ./public/data/
  user@server:/var/www/printshubh/public/data/` whenever the GIS
  pipeline regenerates it. Cleanest if you have SSH access.

---

## 3. Local build first — every time before you deploy

Run this from `R:\my jobs\18 nmay codex 3d site` on Windows:

```powershell
# Clear stale caches
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue

# Clean install — lockfile must match package.json exactly
npm ci

# Production build — type checks, optimisation, route table
npm run build

# Boot the production server on localhost:3000
npm run start
```

If `npm run start` boots cleanly and you can browse `/`, `/about`,
`/contact`, `/faq`, `/support` plus drive the map (dropdowns → boundary
→ layer switcher → plot drawing → WhatsApp message), you're ready to
push to Hostinger. If anything errors locally, fix it locally — never
debug a fresh build on the server.

---

## 4. Deploy path A — Hostinger VPS (recommended)

### 4.1. One-time server prep (run via SSH as the user Hostinger gave you)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Node 22 LTS via NodeSource (Node 20 also works)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs git nginx
node --version    # → v22.x.x
npm --version

# PM2 keeps the Next.js server running, restarts on crash and on boot
sudo npm install -g pm2

# Project location
sudo mkdir -p /var/www
sudo chown -R "$USER:$USER" /var/www
```

### 4.2. Project upload

**Option 4.2a — via Git (preferred)**

```bash
cd /var/www
git clone <YOUR-REPO-URL> printshubh
cd printshubh
```

**Option 4.2b — via SFTP (no Git)**

Use FileZilla / WinSCP from your Windows machine. Upload everything
under `R:\my jobs\18 nmay codex 3d site\` to `/var/www/printshubh/`
**except** `node_modules/`, `.next/`, `.env*`, `out/`, `build/`. The
list matches the ❌ table in section 2.

### 4.3. Install + build on the server

```bash
cd /var/www/printshubh

# Production install (skips devDependencies — mapshaper, ESLint, etc.)
npm ci --omit=dev

# Wait — we DO need full deps for `next build`. Override:
npm ci

# Build
npm run build
```

> The `--omit=dev` shortcut is tempting but won't work here — `next build`
> needs TypeScript and the Tailwind PostCSS plugin, both of which sit in
> `devDependencies`. After a successful build you can prune with
> `npm prune --omit=dev` to shrink `node_modules` on disk.

### 4.4. Launch under PM2

```bash
# Boot the Next.js production server on localhost:3000
pm2 start npm --name "printshubh" -- start

# Make it survive reboots
pm2 startup            # follow the printed command, paste, run
pm2 save

# Tail logs
pm2 logs printshubh
```

### 4.5. Nginx reverse proxy + HTTPS

Create `/etc/nginx/sites-available/printshubh.shop`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name printshubh.shop www.printshubh.shop;

    client_max_body_size 50M;     # allow up to 50 MB user uploads later

    location / {
        proxy_pass         http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade           $http_upgrade;
        proxy_set_header   Connection        'upgrade';
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable + test + reload + add HTTPS:

```bash
sudo ln -s /etc/nginx/sites-available/printshubh.shop /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Free Let's Encrypt cert (auto-renews)
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d printshubh.shop -d www.printshubh.shop
```

Point your domain's A records (in the Hostinger DNS panel) to the VPS
IP, wait for propagation (5 min – 2 h), then open
`https://printshubh.shop`. The browser tab should show the PrintShubh
favicon, the header should be the single sticky `SiteHeader`, the map
section should fully work.

### 4.6. Updating after future code changes

```bash
cd /var/www/printshubh
git pull                # OR SFTP fresh files in
npm ci                  # only if package-lock.json changed
npm run build
pm2 restart printshubh
```

---

## 5. Deploy path B — Hostinger Cloud Hosting (Node.js panel)

Hostinger Cloud Hosting supports Node.js via the hPanel "Website → Node.js"
page. The settings to enter are:

| Field                  | Value                                  |
| ---------------------- | -------------------------------------- |
| **Node.js version**    | **20.x** or **22.x** (project uses Next 16, requires Node ≥ 18.18) |
| **Application mode**   | Production                             |
| **Application root**   | `printshubh` (or wherever you upload)  |
| **Application URL**    | your domain                            |
| **Application startup file** | (leave blank — npm scripts cover it) |
| **Install command**    | `npm install`                          |
| **Build command**      | `npm run build`                        |
| **Start command**      | `npm run start`                        |
| **Environment variables** | None required today. Add later as `KEY=value` rows. |

Upload steps:

1. Compress the project locally **excluding** `node_modules/`, `.next/`,
   and `.env*`:

   ```powershell
   cd "R:\my jobs\18 nmay codex 3d site"
   Compress-Archive -Path src,public,package.json,package-lock.json,next.config.ts,tsconfig.json,postcss.config.mjs,eslint.config.mjs,HOSTINGER-DEPLOY.md -DestinationPath ..\printshubh-deploy.zip
   ```

2. Upload `printshubh-deploy.zip` via hPanel File Manager and extract
   into the application root.
3. In the Node.js panel click **Run NPM Install** → wait → **Run NPM
   Build** → wait → **Start App**.
4. The panel will show a green "Running" indicator and a public URL.

If `public/data/` is too large for a single zip, upload the rest first,
then sync `public/data/` separately via SFTP into the same folder.

---

## 6. Feature-by-feature compatibility (every current feature stays)

| Feature | What it depends on | Survives Node deploy? |
| --- | --- | --- |
| **Marathi/English toggle** | React Context in `language-context.tsx` at the root layout — runs in the browser. | ✅ Yes. |
| **Map dropdowns** (district → taluka → village) | Browser `fetch('/data/dropdowns/...json')` against static files in `public/`. | ✅ Yes. |
| **Village boundary highlight** | Browser fetch of `/data/boundaries/.../*.geojson`. | ✅ Yes. |
| **MapLibre layer switcher** (OSM / Sat / Hybrid / Terrain / Topo) | Pre-loaded raster sources, `setLayoutProperty('visibility')`. Tiles served from third-party CDNs. | ✅ Yes. |
| **Plot drawing tool** | Pure client-side MapLibre `click` / `dblclick` / `mousemove` handlers. | ✅ Yes. |
| **WhatsApp message generation** | All client-side string concat → `wa.me/918625801907`. | ✅ Yes. |
| **`/about` `/contact` `/faq` `/support`** | App Router pages with `metadata` exports + client content. Need Node SSR for metadata. | ✅ Yes — and the routes specifically REQUIRE a Node deploy. |
| **Favicon / app icon** | `src/app/icon.png` + `src/app/apple-icon.png` + `public/favicon.png` — Next.js App Router auto-serves these. | ✅ Yes — once you add the logo files. |
| **API route** (`/api/boundary`, if reintroduced later) | `runtime = "nodejs"` + `dynamic = "force-dynamic"`. | ✅ Yes — on Node deploy. Would break on static export. |
| **30-years trust line** | Static string in translation tables. | ✅ Yes. |
| **`server-only` boundary** in `src/lib/village-data.ts` | Prevents accidental browser bundling of fs/path. Build-time check. | ✅ Yes. |

Conclusion of the audit: **zero changes needed**. The codebase is
already production-Node-ready. Just don't switch the build mode.

---

## 7. Sanity checks after first deploy

Open the site in an incognito window and tick off:

- [ ] Tab title shows the PrintShubh wordmark + favicon (once `icon.png`
      is added).
- [ ] One header — no duplicate stacked headers, no "जमीन कागदपत्र
      सहाय्य" subtitle.
- [ ] Footer shows "महाराष्ट्रासाठी." and the "३० वर्षांचा अनुभव" badge,
      no Kolhapur in any visible text.
- [ ] `/about`, `/contact`, `/faq`, `/support` all open with 200 OK
      (no 404).
- [ ] Map: pick a district → taluka → village → village boundary
      lights up → layer switcher swaps tiles instantly (no source
      reload flash) → plot drawing works → WhatsApp button is enabled
      and the message includes selected district/taluka/village +
      Google Maps link.
- [ ] Browser DevTools Console has no red errors.
- [ ] DevTools Network shows tiles loading from `tile.openstreetmap.org`
      (default), `server.arcgisonline.com` (Sat/Hybrid/Terrain/Topo),
      and `*.tile.opentopomap.org` (Topo).

---

## 8. About static exports — **do not use unless you're certain**

A "static export" (`next.config.ts` set to `output: "export"` and
`npm run build` then uploading the generated `out/` folder to plain
`public_html`) freezes the site at build time. Every visitor gets the
**same** HTML, served as a flat file.

That sounds harmless, until you want any of the things below — at
which point you'd have to rebuild and redeploy the entire site, and
some features can never be added at all without a real server:

- **Admin / dashboard** — there's no per-user state when the site is
  flat HTML. Login, role-gated views, draft orders all need a server
  to authenticate and serve different HTML per user.
- **Customer orders** — accepting an order means writing to a database.
  Static hosting has no place to write to.
- **Payment integration** — UPI / Razorpay / Stripe send their result
  to a *webhook URL* on your domain. Without a server, that webhook
  cannot be served.
- **WhatsApp Business API / SMS callbacks** — same problem: providers
  POST to your URL. Static hosting refuses POSTs.
- **Private APIs** — quotes, lead capture, contact form
  submissions, internal analytics, anything that returns JSON.
- **Per-request data freshness** — DP/TP zoning updates, real-time
  pricing, "available today" badges.
- **Server-side i18n routing** — proper SEO-friendly `/mr/about`
  vs `/en/about` URLs (currently the Marathi/English toggle stays
  client-side, which is fine, but a future redesign might want this).

**For PrintShubh today**, the map and dropdowns are technically
*served* from static `public/data/` files — so in theory a static
export would render them. But the App Router metadata, the `LegalPageShell`
SSR shape, and the Marathi/English defaulting depend on a real Next.js
runtime. Static export would also block every roadmap item above.

**Use Node deployment.** It's the same upload effort and keeps every
door open.

---

*Last updated: May 2026. Maintained alongside `src/app/`,
`next.config.ts`, and `package.json`. Update this file whenever any
build command or deploy command changes.*
