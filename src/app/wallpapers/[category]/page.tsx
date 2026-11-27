import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BreadcrumbJsonLd, Breadcrumbs, CatalogueFrame } from "@/components/wallpapers/catalogue-frame";
import { CatalogueSearch, Pagination, TagChips, withParams } from "@/components/wallpapers/catalogue-controls";
import { DesignGrid } from "@/components/wallpapers/design-card";
import { DesignImg } from "@/components/wallpapers/design-image";
import {
  catalogueUrl,
  categoryUrl,
  getCategories,
  getCategory,
  getDesign,
  getDesigns,
} from "@/lib/wallpapers/catalogue";

type Params = Promise<{ category: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;

/** Pre-render every active category; a category added later renders on demand. */
export async function generateStaticParams() {
  return (await getCategories()).map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await getCategory(slug);
  if (!category) return { title: "Wallpaper category not found", robots: { index: false, follow: false } };

  const sp = await searchParams;
  const searching = Boolean(first(sp.q) || first(sp.tag));
  const page = Number(first(sp.page) ?? 1);
  const cover = await getDesign(category.coverDesignId);
  const title = `${category.name} Wallpaper Designs`;
  const description = `${category.description} Browse ${category.name} wallpaper designs by PRINTSHUBH and enquire on WhatsApp.`;
  const path = categoryUrl(category.slug);
  return {
    title,
    description,
    alternates: { canonical: page > 1 ? withParams(path, { page }) : path },
    robots: searching ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "website",
      url: path,
      siteName: "PRINTSHUBH",
      title: `${title} | PRINTSHUBH`,
      description,
      images: cover
        ? [{ url: cover.image.src1600, width: cover.image.width, height: cover.image.height }]
        : undefined,
    },
    twitter: { card: "summary_large_image", title: `${title} | PRINTSHUBH`, description },
  };
}

export default async function WallpaperCategoryPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { category: slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();

  const sp = await searchParams;
  const q = first(sp.q);
  const tag = first(sp.tag)?.toLowerCase();
  const pageNo = Number(first(sp.page) ?? 1) || 1;
  const path = categoryUrl(category.slug);

  const [categories, cover, results, allInCategory] = await Promise.all([
    getCategories(),
    getDesign(category.coverDesignId),
    getDesigns({ categorySlug: category.slug, q, tag, page: pageNo }),
    getDesigns({ categorySlug: category.slug, pageSize: 200 }),
  ]);
  // Tags offered as filters: those that exist in THIS category.
  const tagCounts = new Map<string, number>();
  for (const d of allInCategory.designs) for (const t of d.tags) tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
  const tags = [...tagCounts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([t]) => t);
  const others = categories.filter((c) => c.slug !== category.slug);

  return (
    <CatalogueFrame>
      <BreadcrumbJsonLd
        items={[
          { name: "Wallpaper Designs", path: catalogueUrl() },
          { name: category.name, path },
        ]}
      />

      {/* Header with the category cover */}
      <section className="relative isolate overflow-hidden bg-brand-navy text-white">
        {cover && (
          /* sizes="50vw": the cover is a decorative background under a dark
             gradient, so a smaller file (mobile: 400 px, ~28 KB instead of
             ~141 KB) is enough and it is this page's LCP image. */
          <DesignImg
            image={cover.image}
            alt=""
            sizes="50vw"
            priority
            className="absolute inset-0 -z-20 h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-navy-dark/95 via-brand-navy/80 to-brand-navy/30" />
        <div className="mx-auto max-w-6xl px-5 pb-10 pt-10 sm:px-8 sm:pb-14 sm:pt-12">
          <Breadcrumbs
            tone="dark"
            items={[{ label: "Wallpaper Designs", href: catalogueUrl() }, { label: category.name }]}
          />
          <p className="text-[12px] font-black uppercase tracking-[0.2em] text-brand-gold-light">
            {allInCategory.total} {allInCategory.total === 1 ? "design" : "designs"}
          </p>
          <h1 className="mt-2 max-w-2xl text-4xl font-black leading-[1.05] tracking-[-0.03em] sm:text-5xl">
            {category.name}
          </h1>
          {/* Reserved height = the longest category description: 3 lines on
              phones, 2 from sm up (28 px line height). Without it the text
              loses a line when the Geist font replaces the wider fallback,
              and the whole page below jumps (CLS 0.188 on mobile). */}
          <p className="mt-3 min-h-[84px] max-w-xl text-base leading-7 text-white/90 sm:min-h-[56px] sm:text-lg">
            {category.description}
          </p>
          <div className="mt-6">
            <CatalogueSearch
              action={path}
              q={q}
              tag={tag}
              tone="dark"
            />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <section className="pt-8" aria-labelledby="wp-cat-designs">
          {/* Keeps the heading order H1 > H2 > H3 (design cards use H3). */}
          <h2 id="wp-cat-designs" className="sr-only">
            {category.name} designs
          </h2>
          {(tags.length > 1 || tag) && (
            <div className="mb-6">
              <TagChips tags={tags} basePath={path} activeTag={tag} q={q} />
            </div>
          )}
          {(q || tag) && (
            <p className="mb-4 text-sm font-semibold text-slate-600">
              {results.total} {results.total === 1 ? "design" : "designs"}
              {q && <> for &ldquo;{q}&rdquo;</>}
              {tag && <> tagged <span className="capitalize">{tag}</span></>}
            </p>
          )}
          {/* eagerCount 0: the cards come from another host and would share
              bandwidth with the cover (LCP); lazy cards near the viewport
              still load right after layout. */}
          {results.designs.length > 0 ? (
            <DesignGrid designs={results.designs} categories={categories} eagerCount={0} />
          ) : (
            <p className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-700">
              No designs here match your search.{" "}
              <Link href={path} className="font-bold text-brand-navy underline">
                Show all {category.name}
              </Link>
              .
            </p>
          )}
          <Pagination basePath={path} page={results.page} totalPages={results.totalPages} params={{ q, tag }} />
        </section>

        {/* Other categories */}
        {others.length > 0 && (
          <section className="py-14" aria-labelledby="wp-more">
            <h2 id="wp-more" className="text-sm font-black uppercase tracking-[0.12em] text-slate-500">
              More categories
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {others.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={categoryUrl(c.slug)}
                    className="inline-flex min-h-[44px] items-center rounded-full border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-brand-gold hover:text-brand-navy"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={catalogueUrl()}
                  className="inline-flex min-h-[44px] items-center rounded-full bg-brand-navy px-4 text-sm font-bold text-white transition hover:bg-brand-navy-dark"
                >
                  All designs
                </Link>
              </li>
            </ul>
          </section>
        )}
      </div>
    </CatalogueFrame>
  );
}
