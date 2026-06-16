# Admin GIS — Production Rollout Checklist

> Status: code is on `main` (merge `b8a490a`). **Not deployed.** Do each step in order; env vars must exist **before** the prod deploy.

## 1. Required Vercel env vars (Project → Settings → Environment Variables, scope = **Production**)

| Var | Value | Notes |
|---|---|---|
| `ENABLE_ADMIN_BHUNAKSHA_OVERLAY` | `true` | Server-only. Without it the route 404s. |
| `ADMIN_PANEL_SECRET` | `<strong-secret>` | Server-only. Gate for `/admin/*`. |

- Both are **server-only** (no `NEXT_PUBLIC_` prefix) — never exposed to the client bundle.
- Env changes only take effect on a **new deployment** — set them first, then deploy.
- Optionally also set them on **Preview** scope if you want gated preview builds.

## 2. Secret generation & rotation

- Generate a strong value: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` (or `openssl rand -hex 32`).
- Never commit it (no `.env` in git; it's only in Vercel settings).
- **To rotate:** update `ADMIN_PANEL_SECRET` in Vercel → redeploy. The cookie stores a SHA-256 token of the secret, so rotating **instantly invalidates existing admin sessions**; admins re-authenticate via `?key=<new-secret>` (cookie also self-expires after 8h).

## 3. Production deploy command

```bash
# from printshubh-hostinger-live/, with prod env vars already set in Vercel:
vercel deploy --prod
# (or, if main is auto-deployed, promote the verified preview instead:)
# vercel promote <preview-deployment-url>
```

## 4. Live verification (on the production URL)

- `/admin/land-reports` (no key) → **404**
- `/admin/land-reports?key=<secret>` → tool loads, URL redirects to clean `/admin/land-reports`, cookie set; reload still works
- `/admin/land-reports?key=wrong` → **404**
- `/` (homepage) → loads normally, **price-assistant chatbot present**
- On `/admin/*` → **chatbot hidden**
- Admin page source → `meta robots noindex`; `/sitemap.xml` → **no** `/admin` entry
- Smoke-test one flow: upload overlay → georeference → export GeoJSON + PDF
- Confirm secret not in client (DevTools → no `ADMIN_PANEL_SECRET` / secret value in JS or network)

## 5. Rollback

- **Fastest disable (no code change):** set `ENABLE_ADMIN_BHUNAKSHA_OVERLAY` to anything ≠ `true` (or delete it) → redeploy → admin route 404s; public site unaffected.
- **Instant deploy rollback:** Vercel dashboard → previous Production deployment → **Promote/Instant Rollback** (or `vercel promote <previous-prod-url>`).
- **Full code revert:** `git revert -m 1 b8a490a` on `main` → push → redeploy (admin work is isolated; public pages unchanged).
