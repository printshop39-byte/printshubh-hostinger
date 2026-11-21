import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CategoryCard } from "@/components/wallpapers/category-card";
import { BreadcrumbJsonLd, Breadcrumbs, CatalogueFrame } from "@/components/wallpapers/catalogue-frame";
import { CatalogueSearch, Pagination, TagChips, withParams } from "@/components/wallpapers/catalogue-controls";
import { DesignGrid } from "@/components/wallpapers/design-card";
import { DesignImg } from "@/components/wallpapers/design-image";
import {
  catalogueUrl,
  designUrl,
  getCategories,
  getCategoryCards,
  getDesign,
  getDesigns,
  getFeaturedDesigns,
  getNewArrivals,
  getPopularTags,
} from "@/lib/wallpapers/catalogue";

/** Design whose preview is the hero image. */
const HERO_DESIGN_ID = "WP-011";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;

const TITLE = "Wallpaper Designs — Explore Our Premium Wallpaper Collection";
const DESCRIPTION =
  "Browse PRINTSHUBH's curated wallpaper design library by category — luxury, floral, Indian traditional art, abstract, landscapes, kids and more — and enquire about any design on WhatsApp.";

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const sp = await searchParams;
  const searching = Boolean(first(sp.q) || first(sp.tag));
  const page = Number(first(sp.page) ?? 1);
  const hero = await getDesign(HERO_DESIGN_ID);
  const images = hero ? [{ url: hero.image.src1600, width: hero.image.width, height: hero.image.height }] : undefined;
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: page > 1 ? withParams("/wallpapers", { page }) : "/wallpapers" },
    // Search and filter result pages are not landing pages: keep them out of the index.
    robots: searching ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "website",
      url: "/wallpapers",
      siteName: "PRINTSHUBH",
      title: "Wallpaper Designs | PRINTSHUBH",
      description: DESCRIPTION,
      images,
    },
    twitter: { card: "summary_large_image", title: "Wallpaper Designs | PRINTSHUBH", description: DESCRIPTION },
  };
}

export default async function WallpapersPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const q = first(sp.q);
  const tag = first(sp.tag)?.toLowerCase();
  const pageNo = Number(first(sp.page) ?? 1) || 1;
  const searching = Boolean(q || tag);

  const [categories, cards, tags, hero, results, featured, arrivals] = await Promise.all([
    getCategories(),
    getCategoryCards(),
    getPopularTags(),
    getDesign(HERO_DESIGN_ID),
    searching ? getDesigns({ q, tag, page: pageNo }) : Promise.resolve(undefined),
    searching ? Promise.resolve([]) : getFeaturedDesigns(8),
    searching ? Promise.resolve([]) : getNewArrivals(4),
  ]);
  const totalDesigns = cards.reduce((n, c) => n + c.count, 0);

  return (
    <CatalogueFrame>
      <BreadcrumbJsonLd items={[{ name: "Wallpaper Designs", path: catalogueUrl() }]} />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden bg-brand-navy text-white">
        {hero && (
          <DesignImg
            image={hero.image}
            alt=""
            sizes="100vw"
            eager
            className="absolute inset-0 -z-20 h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-navy-dark/95 via-brand-navy/80 to-brand-navy/25" />
        <div className="mx-auto max-w-6xl px-5 pb-12 pt-10 sm:px-8 sm:pb-16 sm:pt-14 lg:pb-20 lg:pt-16">
          <Breadcrumbs tone="dark" items={[{ label: "Wallpaper Designs" }]} />
          <p className="text-[12px] font-black uppercase tracking-[0.2em] text-brand-gold-light">
            PRINTSHUBH Design Library
          </p>
          <h1 className="mt-3 max-w-2xl text-[2.4rem] font-black leading-[1.05] tracking-[-0.03em] sm:text-5xl lg:text-6xl">
            Explore Wallpaper Designs
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-white/90 sm:text-lg">
            Browse our curated wallpaper collection and find a design for your space.
          </p>
          <div className="mt-7">
            <CatalogueSearch action={catalogueUrl()} q={q} tag={tag} tone="dark" />
          </div>
          <p className="mt-5 text-sm font-semibold text-white/80">
            {totalDesigns} designs · {categories.length} categories
            {hero && (
              <>
                {" · "}
                <Link
                  href={designUrl(hero.categorySlug, hero.id)}
                  className="underline decoration-brand-gold underline-offset-4 hover:text-white"
                >
                  Featured: {hero.title}
                </Link>
              </>
            )}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        {/* ── Search / filter results ─────────────────────────────────────── */}
        {searching && results && (
          <section className="pt-10" aria-labelledby="wp-results">
            <h2 id="wp-results" className="text-2xl font-black text-brand-navy sm:text-3xl">
              {results.total} {results.total === 1 ? "design" : "designs"}
              {q && <> for &ldquo;{q}&rdquo;</>}
              {tag && <> tagged <span className="capitalize">{tag}</span></>}
            </h2>
            <div className="mt-4">
              <TagChips tags={tags} basePath={catalogueUrl()} activeTag={tag} q={q} />
            </div>
            <div className="mt-6">
              {results.designs.length > 0 ? (
                <DesignGrid designs={results.designs} categories={categories} eagerCount={4} />
              ) : (
                <p className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-700">
                  No designs match your search. Try a different word, or{" "}
                  <Link href={catalogueUrl()} className="font-bold text-brand-navy underline">
                    browse all categories
                  </Link>
                  .
                </p>
              )}
            </div>
            <Pagination
              basePath={catalogueUrl()}
              page={results.page}
              totalPages={results.totalPages}
              params={{ q, tag }}
            />
          </section>
        )}

        {/* ── Categories ──────────────────────────────────────────────────── */}
        <section className="pt-12" aria-labelledby="wp-categories">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-navy">Browse by category</p>
          <h2 id="wp-categories" className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">
            Find your style
          </h2>
          <ul className="mt-6 grid grid-cols-1 gap-4 min-[520px]:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {cards.map(({ category, cover, count }) => (
              <li key={category.slug}>
                <CategoryCard category={category} cover={cover} count={count} />
              </li>
            ))}
          </ul>
        </section>

        {!searching && (
          <>
            {/* ── Styles ────────────────────────────────────────────────── */}
            <section className="pt-10" aria-labelledby="wp-styles">
              <h2 id="wp-styles" className="text-sm font-black uppercase tracking-[0.12em] text-slate-500">
                Browse by style
              </h2>
              <div className="mt-3">
                <TagChips tags={tags} basePath={catalogueUrl()} />
              </div>
            </section>

            {/* ── Featured ──────────────────────────────────────────────── */}
            {featured.length > 0 && (
              <section className="pt-14" aria-labelledby="wp-featured">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-navy">Handpicked</p>
                <h2 id="wp-featured" className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">
                  Featured designs
                </h2>
                <div className="mt-6">
                  <DesignGrid designs={featured} categories={categories} />
                </div>
              </section>
            )}

            {/* ── New arrivals ──────────────────────────────────────────── */}
            {arrivals.length > 0 && (
              <section className="pt-14" aria-labelledby="wp-new">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-navy">Just added</p>
                <h2 id="wp-new" className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">
                  New arrivals
                </h2>
                <div className="mt-6">
                  <DesignGrid designs={arrivals} categories={categories} />
                </div>
              </section>
            )}
          </>
        )}

        {/* ── Closing CTA ─────────────────────────────────────────────────── */}
        <section className="py-14">
          <div className="flex flex-col gap-4 rounded-2xl border border-brand-gold-light bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <h2 className="text-xl font-black text-brand-navy">Want it printed to your wall&apos;s size?</h2>
              <p className="mt-1 max-w-xl text-[15px] leading-7 text-slate-600">
                Every design is printed to your exact wall measurements. Open a design and enquire on WhatsApp — we
                confirm size, material and price before any work starts.
              </p>
            </div>
            <Link
              href="/collections/premium-wallpaper-printing"
              className="inline-flex min-h-[48px] shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-navy px-5 text-sm font-black text-white transition hover:bg-brand-navy-dark"
            >
              About wallpaper printing
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </div>
    </CatalogueFrame>
  );
}
