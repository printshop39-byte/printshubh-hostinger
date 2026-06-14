# Connect GitHub → existing Vercel project (auto-deploy guide)

Connect GitHub `printshop39-byte/printshubh-hostinger` (`main`) to the **existing**
Vercel project `printshubh-hostinger` so that pushing to `main` auto-deploys to
production (`https://www.printshubh.shop`).

**Today:** the project is deployed manually via `vercel --prod` and is **not** Git-connected.

**Reference IDs**
- Vercel project: `printshubh-hostinger` · `prj_dqxaPgR6CQQPgqkAEqn8z5V0578H`
- Team: `my-first-projects-projects-8dca0185` · `team_zAgJQbO3OKg0ncAllKFMj7NP`
- Repo: `printshop39-byte/printshubh-hostinger` · production branch `main`
- Current production deployment: `dpl_EPjmcaYcauCNbuFWf6TBZaA8wwUg`
- Previous good deployment (rollback target): `dpl_2eQmbm2V6gLvV65FhVJA2cTBvQ88`

---

## 1. Vercel UI steps
1. <https://vercel.com/dashboard> → team **my-first-project's projects**.
2. Open the **existing** project **`printshubh-hostinger`** (do **not** click "Add New… → Project").
3. **Settings → Git** → **Connect Git Repository**.
4. Choose **GitHub**, authorize if prompted, select **`printshop39-byte/printshubh-hostinger`**.
   - If the repo isn't listed: **Adjust GitHub App permissions** and grant Vercel access to it.
5. Save — the repo is now linked to this project.

## 2. What settings to choose
- **Production Branch:** `main` (Settings → Git → Production Branch).
- **Framework Preset:** Next.js · **Root Directory:** `./` · **Build Command:** `npm run build` ·
  **Install Command:** `npm install` — already correct; just confirm unchanged.
- **Node.js version:** keep **22.x or 24.x** (current prod built on 24.x; `engines: >=18.18.0`).
- **Preview Deployments:** leave **on** (every branch/PR gets a preview URL — safety net for step 4).
- **Environment Variables:** leave as-is (none required for this project).

## 3. How to avoid creating a duplicate Vercel project ⚠️
- **Connect from *inside* the existing project** (Settings → Git). This keeps the same project,
  domain alias (`www.printshubh.shop`), and project ID `prj_dqxaPgR6CQQPgqkAEqn8z5V0578H`.
- **Do NOT** use the dashboard's **"Add New… → Project / Import Git Repository"** — that creates a
  *second* project that would fight over the domain. If a `printshubh-hostinger-1` (or similar)
  appears, you imported instead of connected — delete the duplicate.
- After connecting, verify `www.printshubh.shop` still sits under **this** project's
  **Settings → Domains**.

## 4. How to test the first auto-deploy safely
Connecting does **not** redeploy by itself; the next push does. Test on a branch first, not `main`:
1. `git checkout -b test/auto-deploy && git commit --allow-empty -m "test vercel auto-deploy" && git push -u origin test/auto-deploy`
2. Vercel → **Deployments**: confirm a **Preview** build appears and goes **Ready**. Open its
   preview URL (a Vercel preview login prompt is expected — that's deployment protection).
3. When happy, merge to `main` (directly or via PR) → triggers a **Production** deploy aliased to
   `www.printshubh.shop`.
4. Verify live: `curl -s -o /dev/null -w "%{http_code}" https://www.printshubh.shop/` → `200`,
   then spot-check the homepage.
5. Delete the throwaway branch: `git push origin --delete test/auto-deploy`.

> GitHub `main` currently equals what's live (`bc435f5`), so the first production auto-deploy
> after connecting rebuilds the *same* code — a safe no-op.

## 5. Rollback steps
- **Instant revert:** Vercel → project `printshubh-hostinger` → **Deployments** → pick the
  last-known-good deployment → **⋯ → Promote to Production** (a.k.a. Rollback).
  Current good prod: `dpl_EPjmcaYcauCNbuFWf6TBZaA8wwUg`; prior: `dpl_2eQmbm2V6gLvV65FhVJA2cTBvQ88`.
- **Fix forward via Git:** `git revert <bad commit> && git push origin main` → auto-deploys the revert.
- **Emergency disconnect:** Settings → Git → **Disconnect** — stops auto-deploys; fall back to
  manual `vercel --prod`.
