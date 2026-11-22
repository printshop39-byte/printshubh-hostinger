import type { Metadata } from "next";
import Link from "next/link";
import { isAuthed } from "@/app/admin/land-reports/auth";
import { logoutAction } from "@/app/admin/land-reports/actions";
import { UploadPanel } from "@/components/admin/wallpapers/upload-panel";
import { ConfirmButton } from "@/components/admin/wallpapers/confirm-button";
import { CategorySaveButton } from "@/components/admin/wallpapers/category-save-button";
import { wallpaperDbConfigured } from "@/lib/wallpapers/supabase";
import { adminLoad } from "@/lib/wallpapers/store";
import {
  LIST_PATH,
  VISIBILITY_CLASS,
  VISIBILITY_LABEL,
  returnValue,
  visibilityOf,
} from "@/lib/wallpapers/admin-ui";
import {
  deleteCategoryAction,
  saveCategoryAction,
  setFeaturedAction,
  setStatusAction,
} from "./actions";

export const metadata: Metadata = {
  title: "Wallpaper catalogue — Admin",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;
const PAGE_SIZE = 40;

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-8">{children}</div>;
}

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Shell>
      <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-black">{title}</h1>
        <div className="mt-2 space-y-2 text-sm leading-6 text-slate-600">{children}</div>
      </div>
    </Shell>
  );
}

/* Every control is at least 44 px tall (touch-friendly on phones and tablets). */
const input = "h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold outline-none focus:border-blue-500";
const btn = "inline-flex min-h-[44px] items-center justify-center rounded-lg px-3 text-[13px] font-bold";
const bannerBase = "sticky top-2 z-30 rounded-lg border px-4 py-2.5 text-sm font-bold shadow-sm";

export default async function AdminWallpapersPage({ searchParams }: { searchParams: SearchParams }) {
  if (!wallpaperDbConfigured()) {
    return (
      <Notice title="Wallpaper catalogue admin">
        <p>The database is not configured on this server (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY).</p>
        <p>The public catalogue is showing the built-in sample designs until it is.</p>
      </Notice>
    );
  }
  if (!(await isAuthed())) {
    return (
      <Notice title="Sign in required">
        <p>This page is for administrators only.</p>
        <p>
          <Link href="/admin/land-reports" className="font-bold text-blue-700 underline">
            Sign in on the admin page
          </Link>
          , then come back here.
        </p>
      </Notice>
    );
  }

  const sp = await searchParams;
  const rawStatus = first(sp.status);
  const statusFilter: "draft" | "published" | undefined = rawStatus === "draft" || rawStatus === "published" ? rawStatus : undefined;
  const q = first(sp.q)?.toLowerCase();
  const page = Math.max(1, Number(first(sp.page) ?? 1) || 1);
  const saved = first(sp.saved);
  const error = first(sp.error);

  const data = await adminLoad();
  if (!data.ok) {
    return (
      <Notice title="Catalogue tables not found">
        <p>
          The database is reachable but the wallpaper tables are missing (or the connection failed). Run{" "}
          <code className="rounded bg-slate-100 px-1">scripts/supabase-wallpapers-schema.sql</code> in the Supabase SQL
          editor, then reload this page.
        </p>
        <p>The public catalogue keeps showing the built-in sample designs meanwhile.</p>
      </Notice>
    );
  }

  const catName = new Map(data.categories.map((c) => [c.slug, c.name]));
  const catActive = new Map(data.categories.map((c) => [c.slug, c.active]));
  // Live / draft design counts per category (drives the "hide category" warning).
  const catCounts = new Map<string, { live: number; draft: number }>();
  for (const d of data.designs) {
    const n = catCounts.get(d.categorySlug) ?? { live: 0, draft: 0 };
    if (d.status === "published") n.live += 1;
    else n.draft += 1;
    catCounts.set(d.categorySlug, n);
  }

  const filtered = data.designs.filter(
    (d) =>
      (!statusFilter || d.status === statusFilter) &&
      (!q || `${d.id} ${d.title} ${d.tags.join(" ")} ${catName.get(d.categorySlug) ?? ""}`.toLowerCase().includes(q)),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageNo = Math.min(page, totalPages);
  const rows = filtered.slice((pageNo - 1) * PAGE_SIZE, pageNo * PAGE_SIZE);
  const live = data.designs.filter((d) => d.status === "published").length;
  const liveHidden = data.designs.filter(
    (d) => d.status === "published" && visibilityOf(d.status, catActive.get(d.categorySlug)) === "live-hidden",
  ).length;

  /** Where this list is right now — sent with every action so you land back here. */
  const here = returnValue({ status: statusFilter, q: first(sp.q), page: pageNo });
  const editHref = (id: string) =>
    here === LIST_PATH ? `${LIST_PATH}/${id}` : `${LIST_PATH}/${id}?back=${encodeURIComponent(here)}`;
  const qs = (extra: Record<string, string | number | undefined>) => {
    const p = new URLSearchParams();
    const all = { status: statusFilter, q: first(sp.q), ...extra };
    for (const [k, v] of Object.entries(all)) if (v !== undefined && v !== "") p.set(k, String(v));
    const s = p.toString();
    return s ? `${LIST_PATH}?${s}` : LIST_PATH;
  };

  return (
    <Shell>
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-black">Wallpaper catalogue</h1>
            <p className="text-[13px] font-semibold text-slate-500">
              {data.designs.length} designs · {live} live
              {liveHidden > 0 && <span className="text-orange-800"> ({liveHidden} hidden by their category)</span>} ·{" "}
              {data.designs.length - live} drafts
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/wallpapers" target="_blank" className={`${btn} border border-slate-300 bg-white text-slate-700`}>
              View public catalogue
            </Link>
            <form action={logoutAction}>
              <button type="submit" className={`${btn} border border-slate-300 bg-white text-slate-700`}>
                Sign out
              </button>
            </form>
          </div>
        </header>

        {saved && (
          <p role="status" className={`${bannerBase} border-green-200 bg-green-50 text-green-800`}>
            {saved}
          </p>
        )}
        {error && (
          <p role="alert" className={`${bannerBase} border-red-200 bg-red-50 text-red-800`}>
            {error}
          </p>
        )}

        <UploadPanel categories={data.categories.filter((c) => c.active).map((c) => ({ slug: c.slug, name: c.name }))} />

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="wp-designs">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 id="wp-designs" className="text-base font-black">
              Designs
            </h2>
            <form method="get" action={LIST_PATH} className="flex flex-wrap items-center gap-2">
              <input name="q" defaultValue={first(sp.q) ?? ""} placeholder="Search ID, title, tag" className={`${input} w-52`} aria-label="Search designs" />
              <select name="status" defaultValue={statusFilter ?? ""} className={`${input} w-36`} aria-label="Filter by status">
                <option value="">All statuses</option>
                <option value="published">Live</option>
                <option value="draft">Draft</option>
              </select>
              <button type="submit" className={`${btn} bg-slate-800 text-white`}>
                Filter
              </button>
            </form>
          </div>

          {rows.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600">No designs match. Upload some above.</p>
          ) : (
            <ul className="mt-4 divide-y divide-slate-100">
              {rows.map((d) => {
                const vis = visibilityOf(d.status, catActive.get(d.categorySlug));
                const publishing = d.status !== "published";
                const categoryHidden = catActive.get(d.categorySlug) !== true;
                const confirmMessage = publishing
                  ? `Publish ${d.id} "${d.title}"?\n\nIt will appear on the public catalogue immediately.` +
                    (categoryHidden ? "\n\nIts category is hidden, so customers still will not see it until the category is made visible." : "")
                  : `Unpublish ${d.id} "${d.title}"?\n\nIt will disappear from the public catalogue immediately. You can publish it again later.`;
                return (
                  <li key={d.id} id={`d-${d.id}`} className="flex scroll-mt-20 flex-wrap items-center gap-3 py-3">
                    {d.image ? (
                      // eslint-disable-next-line @next/next/no-img-element -- small admin thumbnail
                      <img src={d.image.src400} alt="" width={96} height={54} loading="lazy" className="h-14 w-24 shrink-0 rounded-md border border-slate-200 object-cover" />
                    ) : (
                      <span className="grid h-14 w-24 shrink-0 place-items-center rounded-md bg-slate-100 text-[11px] font-bold text-slate-400">no image</span>
                    )}
                    <div className="min-w-0 flex-1 basis-48">
                      <p className="font-mono text-[11px] font-bold tracking-wider text-slate-500">{d.id}</p>
                      <p className="truncate text-sm font-black">{d.title}</p>
                      <p className="truncate text-[12px] text-slate-500">{catName.get(d.categorySlug) ?? d.categorySlug}</p>
                      {vis === "live-hidden" && (
                        <p className="text-[11px] font-bold leading-4 text-orange-800">Its category is hidden, so customers cannot see this design.</p>
                      )}
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-black ${VISIBILITY_CLASS[vis]}`}
                      title={vis === "live-hidden" ? "Published, but its category is hidden — not visible to customers" : undefined}
                    >
                      {VISIBILITY_LABEL[vis]}
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <form action={setFeaturedAction}>
                        <input type="hidden" name="id" value={d.id} />
                        <input type="hidden" name="returnTo" value={here} />
                        <input type="hidden" name="featured" value={d.featured ? "false" : "true"} />
                        <button type="submit" className={`${btn} border border-slate-300 bg-white ${d.featured ? "text-brand-gold" : "text-slate-600"}`} aria-pressed={d.featured} title="Show in Featured designs">
                          {d.featured ? "★ Featured" : "☆ Feature"}
                        </button>
                      </form>
                      <form action={setStatusAction}>
                        <input type="hidden" name="id" value={d.id} />
                        <input type="hidden" name="returnTo" value={here} />
                        <input type="hidden" name="status" value={publishing ? "published" : "draft"} />
                        <ConfirmButton
                          message={confirmMessage}
                          className={`${btn} ${publishing ? "bg-green-600 text-white" : "border border-slate-300 bg-white text-slate-700"}`}
                        >
                          {publishing ? "Publish" : "Unpublish"}
                        </ConfirmButton>
                      </form>
                      <Link href={editHref(d.id)} className={`${btn} bg-blue-600 text-white`}>
                        Edit &amp; preview
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {totalPages > 1 && (
            <nav className="mt-4 flex items-center justify-between text-sm font-bold" aria-label="Pagination">
              {pageNo > 1 ? <Link href={qs({ page: pageNo - 1 })} className="inline-flex min-h-[44px] items-center px-2 text-blue-700 underline">← Previous</Link> : <span />}
              <span className="text-slate-500">Page {pageNo} of {totalPages}</span>
              {pageNo < totalPages ? <Link href={qs({ page: pageNo + 1 })} className="inline-flex min-h-[44px] items-center px-2 text-blue-700 underline">Next →</Link> : <span />}
            </nav>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="wp-cats">
          <h2 id="wp-cats" className="text-base font-black">Categories</h2>
          <p className="mt-1 text-[13px] text-slate-600">
            Rename, reorder, hide or add categories any time. Hiding a category hides all its designs from customers
            (you will be asked to confirm). A category can only be deleted when it has no designs.
          </p>
          <ul className="mt-4 space-y-3">
            {data.categories.map((c) => {
              const n = catCounts.get(c.slug) ?? { live: 0, draft: 0 };
              return (
                <li key={c.slug} id={`cat-${c.slug}`} className="scroll-mt-20 rounded-xl border border-slate-200 p-3">
                  <form action={saveCategoryAction} className="grid gap-2 sm:grid-cols-[1.2fr_2fr_80px_110px_auto] sm:items-end">
                    <input type="hidden" name="slug" value={c.slug} />
                    <input type="hidden" name="returnTo" value={here} />
                    <input type="hidden" name="confirmHide" defaultValue="" />
                    <label className="text-[11px] font-bold text-slate-500">Name<input name="name" defaultValue={c.name} required maxLength={80} className={`${input} mt-0.5`} /></label>
                    <label className="text-[11px] font-bold text-slate-500">Description<input name="description" defaultValue={c.description} maxLength={400} className={`${input} mt-0.5`} /></label>
                    <label className="text-[11px] font-bold text-slate-500">Order<input name="sortOrder" type="number" defaultValue={c.sortOrder} className={`${input} mt-0.5`} /></label>
                    <label className="text-[11px] font-bold text-slate-500">Cover ID<input name="coverDesignId" defaultValue={c.coverDesignId} placeholder="WP-001" className={`${input} mt-0.5`} /></label>
                    <div className="flex items-center gap-3">
                      <label className="flex min-h-[44px] items-center gap-2 text-[12px] font-bold text-slate-600">
                        <input type="checkbox" name="active" defaultChecked={c.active} className="size-5" /> Visible
                      </label>
                      <CategorySaveButton name={c.name} wasActive={c.active} live={n.live} draft={n.draft} className={`${btn} bg-slate-800 text-white`}>
                        Save
                      </CategorySaveButton>
                    </div>
                  </form>
                  <p className="mt-1 text-[11px] text-slate-500">
                    /wallpapers/{c.slug} · {n.live} live · {n.draft} draft
                    {!c.active && <b className="ml-2 rounded bg-orange-100 px-1.5 py-0.5 text-orange-900">Hidden{n.live > 0 ? ` — ${n.live} live design${n.live === 1 ? " is" : "s are"} not visible to customers` : ""}</b>}
                  </p>
                  <form action={deleteCategoryAction} className="mt-1">
                    <input type="hidden" name="slug" value={c.slug} />
                    <input type="hidden" name="returnTo" value={here} />
                    <ConfirmButton message={`Delete the category "${c.name}"? This cannot be undone.`} className="inline-flex min-h-[44px] items-center text-[12px] font-bold text-red-700 underline">
                      Delete category
                    </ConfirmButton>
                  </form>
                </li>
              );
            })}
          </ul>

          <form action={saveCategoryAction} className="mt-5 grid gap-2 rounded-xl border border-dashed border-slate-300 p-3 sm:grid-cols-[1.2fr_2fr_80px_auto] sm:items-end">
            <input type="hidden" name="mode" value="create" />
            <input type="hidden" name="returnTo" value={here} />
            <label className="text-[11px] font-bold text-slate-500">New category name<input name="name" required maxLength={80} className={`${input} mt-0.5`} /></label>
            <label className="text-[11px] font-bold text-slate-500">Description<input name="description" maxLength={400} className={`${input} mt-0.5`} /></label>
            <label className="text-[11px] font-bold text-slate-500">Order<input name="sortOrder" type="number" defaultValue={100} className={`${input} mt-0.5`} /></label>
            <div className="flex items-center gap-3">
              <label className="flex min-h-[44px] items-center gap-2 text-[12px] font-bold text-slate-600"><input type="checkbox" name="active" defaultChecked className="size-5" /> Visible</label>
              <button type="submit" className={`${btn} bg-blue-600 text-white`}>Add category</button>
            </div>
          </form>
        </section>
      </div>
    </Shell>
  );
}
