# Fixing `/_next/static/*` 404 on production

## Diagnosis

Browser DevTools is showing:

```
GET https://www.printshubh.shop/_next/static/chunks/main-app-XXXX.js   404
GET https://www.printshubh.shop/_next/static/css/XXXX.css              404
```

The HTML loads (so DNS, domain, and the basic web server are fine), but
Next.js's compiled assets are missing. That means **the Next.js Node
server is not running** — the host is serving the raw HTML files like a
plain static site, while the JavaScript/CSS chunks that live under
`/_next/static/*` are only served when a `next start` process is alive
and a reverse proxy points at it.

## Project intent (confirmed)

| Signal | Value |
|---|---|
| `next.config.ts` → `output` | not set → **Node runtime** (default) |
| `package.json` → `start` | `next start -p ${PORT:-3000}` → **Node runtime** |
| Routes that need a server | sitemap.ts (App Router metadata) + all `"use client"` components |
| `out/` static-export folder | **none** — we never run `next export` |

**Verdict — this app must be deployed on Node.js hosting**, not plain
`public_html`. There is no static-export build in this project and the
roadmap (admin dashboard, payment callbacks, WhatsApp webhooks) makes
that the correct choice.

## What's currently wrong on the server

One of these is true:

1. **You uploaded the project to `public_html/`** as if it were a PHP /
   plain-HTML site. Hostinger's Apache/LiteSpeed is now serving whatever
   files are there, but `next start` was never launched, so the `.next/`
   build (or no build) is unreachable.
2. **A previous `next build` was run, but no process is listening on the
   port Hostinger expects.** Without `next start` running on the right
   port, the reverse-proxy returns the host's default 404.
3. **You used Hostinger's "Premium Web Hosting" plan** — PHP only, no
   Node runtime. Apps don't actually run there; only static files served.

## Fix (Hostinger Cloud / VPS — Node hosting)

The exact paths depend on which Hostinger plan you have. There are two
clean fixes — pick the one that matches the panel you see.

### Fix A — Hostinger Cloud Hosting (hPanel "Node.js" page)

This is the most common Hostinger setup that supports Node. Steps:

1. **Open hPanel → Website → Advanced → Node.js**.
2. **Create a new application** (or edit the existing one). Fill:

   | Field | Value |
   |---|---|
   | Node.js version | **22.x** (or 20.x) |
   | Application mode | **Production** |
   | Application root | the folder you upload to (e.g. `printshubh`) |
   | Application URL | `printshubh.shop` |
   | Application startup file | *(leave blank)* |
   | Install command | `npm ci` |
   | Build command | `npm run build` |
   | Start command | `npm run start` |
   | Environment variables | none required |

3. **Upload the project** to the application root. Include:
   - `src/` — all source
   - `public/` — including `public/data/` (the dropdown JSONs + GeoJSONs)
   - `package.json`
   - `package-lock.json`
   - `next.config.ts`
   - `tsconfig.json`
   - `postcss.config.mjs`
   - `eslint.config.mjs`

   **Do NOT upload:** `node_modules/`, `.next/`, `out/`, `.env*`,
   `*.tsbuildinfo`, editor caches.

4. Click **Run NPM Install** → wait → **Run NPM Build** → wait →
   **Start App**.
5. hPanel will show "Running" with a green badge. Click the application
   URL — the site should now load with full CSS/JS.

> The single-most-common mistake: uploading the project to `public_html/`
> *instead of* the Node application root. `public_html` is the Apache
> document root used for static HTML/PHP. For Node apps, use the path the
> Node.js panel asks for — it's a different folder.

### Fix B — Hostinger VPS (full SSH access)

If you have a KVM/VPS plan with root SSH:

```bash
# One-time prep
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs git nginx
sudo npm install -g pm2

# Project location
sudo mkdir -p /var/www/printshubh
sudo chown -R "$USER:$USER" /var/www/printshubh
cd /var/www/printshubh
# … upload via git clone OR rsync, then:
npm ci
npm run build
pm2 start npm --name printshubh -- start
pm2 save && pm2 startup
```

Nginx reverse-proxy `/etc/nginx/sites-available/printshubh.shop`:

```nginx
server {
    listen 80;
    server_name printshubh.shop www.printshubh.shop;
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

```bash
sudo ln -s /etc/nginx/sites-available/printshubh.shop /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d printshubh.shop -d www.printshubh.shop
```

`pm2 logs printshubh` shows the Next.js server output. The `/_next/static/*`
URLs will resolve as soon as PM2 is running and Nginx is proxying to
port 3000.

## Verifying the fix

After deploy:

```bash
# From any machine
curl -I https://www.printshubh.shop/
# Expect: HTTP/2 200, content-type: text/html

# Pull one of the chunk URLs the browser was 404-ing on
curl -I https://www.printshubh.shop/_next/static/chunks/main-app-XXXX.js
# Expect: HTTP/2 200, content-type: application/javascript
# NOT: 404
```

In the browser:

1. **Ctrl+Shift+R** (hard refresh; bust the CDN/browser cache).
2. DevTools → Network → reload. Filter by `_next/static`. Every row
   should be **200**, not 404.
3. The page should render with the styled hero, working dropdowns, and
   the MapLibre map.

## What I changed in the repo to lock this in

| File | Change |
|---|---|
| `package.json` | Added `"engines": { "node": ">=18.18.0" }` so Hostinger picks the right Node version automatically. Changed `start` to `next start -p ${PORT:-3000}` so the Node app binds to whichever port Hostinger injects (otherwise it stays on 3000 forever and the proxy can't reach it — the most common cause of `/_next/static/*` 404 in shared-Node setups). |
| `DEPLOYMENT-FIX.md` | This file. |

**Not changed:** `next.config.ts`, any page, any component, MapLibre,
dropdowns, GeoJSON, sitemap.ts, robots.txt, JSON-LD, all SEO metadata.

## Plain-language summary

PrintShubh is a Node.js site, not a static-HTML site. The 404s are
because Hostinger isn't running `next start` — either the app isn't
configured in the Node.js panel, or the start command is binding to the
wrong port. Fix the Node panel settings (Section "Fix A" above), make
sure the start command is `npm run start`, ensure the build step ran
successfully, and the `/_next/static/*` URLs will start serving the
JS/CSS chunks the browser is asking for.
