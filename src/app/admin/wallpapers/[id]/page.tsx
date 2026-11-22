import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isAuthed } from "@/app/admin/land-reports/auth";
import { ConfirmButton } from "@/components/admin/wallpapers/confirm-button";
import { ReplaceImage } from "@/components/admin/wallpapers/replace-image";
import { StatusSaveButton } from "@/components/admin/wallpapers/status-save-button";
import { DesignDetail } from "@/components/wallpapers/design-detail";
import { VISIBILITY_CLASS, VISIBILITY_LABEL, listHref, parseListState, returnValue, visibilityOf } from "@/lib/wallpapers/admin-ui";
import { buildDesignEnquiryUrl, getRelatedDesigns } from "@/lib/wallpapers/catalogue";
import { adminGetDesign, adminLoad } from "@/lib/wallpapers/store";
import { wallpaperDbConfigured } from "@/lib/wallpapers/supabase";
import { DESIGN_ID_RE, normalizeId } from "@/lib/wallpapers/validation";
import type { PublicDesign } from "@/lib/wallpapers/types";
import { deleteDesignAction, updateDesignAction } from "../actions";

export const metadata: Metadata = {
  title: "Edit wallpaper design — Admin",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;
const input = "h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold outline-none focus:border-blue-500";

export default async function AdminWallpaperEditPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const { id: rawId } = await params;
  const id = normalizeId(decodeURIComponent(rawId));
  if (!DESIGN_ID_RE.test(id)) notFound();

  const shell = (body: React.ReactNode) => (
    <div className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-5xl">{body}</div>
    </div>
  );
  if (!wallpaperDbConfigured()) return shell(<p className="text-sm text-slate-600">The database is not configured on this server.</p>);
  if (!(await isAuthed())) {
    return shell(
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
        <h1 className="text-lg font-black text-slate-900">Sign in required</h1>
        <p className="mt-2">
          <Link href="/admin/land-reports" className="font-bold text-blue-700 underline">Sign in on the admin page</Link>, then come back.
        </p>
      </div>,
    );
  }

  const [found, all, sp] = await Promise.all([adminGetDesign(id), adminLoad(), searchParams]);
  if (!found) notFound();
  const { design } = found;
  const saved = first(sp.saved);
  const error = first(sp.error);
  const category = all.categories.find((c) => c.slug === design.categorySlug);
  const live = design.status === "published";
  // "Live" in the database is not the same as "customers can see it": a hidden category hides its designs.
  const vis = visibilityOf(design.status, category?.active);
  // Where the admin came from (search / filter / page), so "All designs" and the actions return there.
  const backState = parseListState(first(sp.back));
  const backValue = returnValue(backState);

  // The preview is the real public layout. For a draft it is only visible here.
  const previewable = design.image && category ? ({ ...design, image: design.image, status: "published" } as PublicDesign) : null;
  const related = previewable ? await getRelatedDesigns(previewable, 4) : [];

  return shell(
    <div className="space-y-6">
      <p className="text-sm font-bold">
        <Link href={listHref(backState, {}, `d-${design.id}`)} className="inline-flex min-h-[44px] items-center text-blue-700 underline">← All designs</Link>
      </p>
      <header className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-black">{design.id} — {design.title}</h1>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${VISIBILITY_CLASS[vis]}`}>{VISIBILITY_LABEL[vis]}</span>
      </header>
      {vis === "live-hidden" && (
        <p className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm font-bold text-orange-900">
          This design is published, but its category{category ? ` "${category.name}"` : ""} is hidden, so customers cannot see it.
          Make the category visible on the main admin page to show it.
        </p>
      )}

      {saved && <p role="status" className="sticky top-2 z-30 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-bold text-green-800 shadow-sm">{saved}</p>}
      {error && <p role="alert" className="sticky top-2 z-30 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-800 shadow-sm">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <form action={updateDesignAction} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <input type="hidden" name="id" value={design.id} />
          <input type="hidden" name="returnTo" value={backValue} />
          <label className="block text-[12px] font-bold text-slate-600">Title
            <input name="title" defaultValue={design.title} required maxLength={120} className={`${input} mt-1`} />
          </label>
          <label className="block text-[12px] font-bold text-slate-600">Category
            <select name="categorySlug" defaultValue={design.categorySlug} className={`${input} mt-1`}>
              {all.categories.map((c) => (<option key={c.slug} value={c.slug}>{c.name}{c.active ? "" : " (hidden)"}</option>))}
            </select>
          </label>
          <label className="block text-[12px] font-bold text-slate-600">Tags (comma separated)
            <input name="tags" defaultValue={design.tags.join(", ")} placeholder="premium, floral" className={`${input} mt-1`} />
          </label>
          <label className="block text-[12px] font-bold text-slate-600">Short description (optional)
            <textarea name="description" defaultValue={design.description ?? ""} maxLength={600} rows={3} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500" />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-[12px] font-bold text-slate-600">Status
              <select name="status" defaultValue={design.status} className={`${input} mt-1`}>
                <option value="draft">Draft (not public)</option>
                <option value="published">Live (public)</option>
              </select>
            </label>
            <label className="flex min-h-[44px] items-center gap-2 self-end text-[13px] font-bold text-slate-700">
              <input type="checkbox" name="featured" defaultChecked={design.featured} className="size-5" /> Featured
            </label>
          </div>
          <StatusSaveButton
            id={design.id}
            title={design.title}
            initialStatus={design.status}
            categoryHidden={category?.active !== true}
            className="inline-flex min-h-[44px] items-center rounded-lg bg-blue-600 px-5 text-sm font-black text-white"
          >
            Save changes
          </StatusSaveButton>
          <p className="text-[12px] text-slate-500">Design ID <b className="font-mono">{design.id}</b> is permanent — it is what customers quote on WhatsApp.</p>
        </form>

        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-black">Image</h2>
            {design.image && (
              // eslint-disable-next-line @next/next/no-img-element -- admin preview of the stored preview
              <img src={design.image.src900} alt={design.title} width={design.image.width} height={design.image.height} className="mt-3 h-auto w-full rounded-lg border border-slate-200" />
            )}
            <div className="mt-3">
              <ReplaceImage id={design.id} live={live} currentSrc={design.image?.src900 ?? null} currentAlt={`Current image of ${design.title}`} />
            </div>
            <p className="mt-2 text-[12px] text-slate-500">
              Choosing a file only shows a preview. Nothing changes until you confirm. Only small previews are stored; your full-resolution master stays on your computer.
            </p>
          </section>

          <section className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-black text-red-800">Delete this design</h2>
            <p className="mt-1 text-[13px] leading-5 text-slate-600">
              {live ? "This design is live, so it cannot be deleted. Set it to Draft first." : "This removes the design and its stored previews permanently."}
            </p>
            <form action={deleteDesignAction} className="mt-3">
              <input type="hidden" name="id" value={design.id} />
              <input type="hidden" name="returnTo" value={backValue} />
              <ConfirmButton message={`Delete ${design.id} permanently? This cannot be undone.`} className={`inline-flex min-h-[44px] items-center rounded-lg px-4 text-[13px] font-bold text-white ${live ? "bg-slate-300" : "bg-red-600"}`}>
                Delete {design.id}
              </ConfirmButton>
            </form>
          </section>
        </div>
      </div>

      <section aria-labelledby="wp-preview">
        <h2 id="wp-preview" className="text-base font-black">
          Preview — exactly what customers {live ? "see" : "will see once you publish"}
        </h2>
        {previewable && category ? (
          <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-[#f6f1ea]">
            <DesignDetail design={previewable} category={category} categories={all.categories} related={related} enquiryUrl={buildDesignEnquiryUrl(previewable, category)} />
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-600">A preview needs an image and a category.</p>
        )}
      </section>
    </div>,
  );
}
