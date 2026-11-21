import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { Breadcrumbs, CatalogueFrame } from "@/components/wallpapers/catalogue-frame";
import { DesignEnquiryCta } from "@/components/wallpapers/design-enquiry-cta";
import { DesignGrid } from "@/components/wallpapers/design-card";
import { DesignImg } from "@/components/wallpapers/design-image";
import { withParams } from "@/components/wallpapers/catalogue-controls";
import {
  buildDesignEnquiryUrl,
  catalogueUrl,
  categoryUrl,
  designUrl,
  getCategories,
  getCategory,
  getDesign,
  getRelatedDesigns,
} from "@/lib/wallpapers/catalogue";

type Params = Promise<{ category: string; designId: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { designId } = await params;
  const design = await getDesign(designId);
  const category = design ? await getCategory(design.categorySlug) : undefined;
  if (!design || !category) return { title: "Wallpaper design not found", robots: { index: false, follow: false } };

  const path = designUrl(design.categorySlug, design.id);
  const title = `${design.title} — Wallpaper Design ${design.id}`;
  const description = `${design.title} (${design.id}), a ${category.name.toLowerCase()} wallpaper design by PRINTSHUBH. Enquire about pricing, material options and printing on WhatsApp.`;
  return {
    title,
    description,
    alternates: { canonical: path },
    // Individual design pages start as noindex,follow: they become indexable
    // once each design carries real descriptive content (see Phase A, D5).
    robots: { index: false, follow: true },
    openGraph: {
      type: "website",
      url: path,
      siteName: "PRINTSHUBH",
      title: `${title} | PRINTSHUBH`,
      description,
      images: [{ url: design.image.src1600, width: design.image.width, height: design.image.height, alt: design.title }],
    },
    twitter: { card: "summary_large_image", title: `${title} | PRINTSHUBH`, description },
  };
}

export default async function WallpaperDesignPage({ params }: { params: Params }) {
  const { category: slug, designId } = await params;
  const design = await getDesign(designId);
  if (!design) notFound(); // unknown, draft, or no preview yet

  // One canonical URL per design: /wallpapers/<its category>/<id in lower case>.
  const canonical = designUrl(design.categorySlug, design.id);
  if (slug !== design.categorySlug || designId !== design.id.toLowerCase()) permanentRedirect(canonical);

  const category = await getCategory(design.categorySlug);
  if (!category) notFound();
  const [categories, related] = await Promise.all([getCategories(), getRelatedDesigns(design, 4)]);
  const enquiryUrl = buildDesignEnquiryUrl(design, category);

  return (
    <CatalogueFrame hideButtonNear={["#design-enquiry", "footer"]}>
      <div className="mx-auto max-w-6xl px-5 pt-10 sm:px-8 sm:pt-12">
        <Breadcrumbs
          items={[
            { label: "Wallpaper Designs", href: catalogueUrl() },
            { label: category.name, href: categoryUrl(category.slug) },
            { label: design.id },
          ]}
        />

        <div className="mt-4 grid gap-8 lg:grid-cols-[1.45fr_1fr] lg:items-start">
          {/* Large preview */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <DesignImg
              image={design.image}
              alt={`${design.title} — wallpaper design ${design.id}`}
              sizes="(min-width:1024px) 60vw, 100vw"
              eager
              className="h-auto w-full"
            />
          </div>

          {/* Details + enquiry */}
          <div>
            <p className="inline-flex rounded-md bg-brand-gold-light px-2.5 py-1 font-mono text-xs font-bold tracking-[0.14em] text-brand-navy">
              {design.id}
            </p>
            <h1 className="mt-3 text-3xl font-black leading-tight tracking-[-0.02em] text-slate-950 sm:text-4xl">
              {design.title}
            </h1>
            <p className="mt-2 text-sm font-semibold text-slate-600">
              Category:{" "}
              <Link href={categoryUrl(category.slug)} className="font-bold text-brand-navy underline underline-offset-4">
                {category.name}
              </Link>
            </p>

            {design.description && (
              <p className="mt-4 text-base leading-7 text-slate-700">{design.description}</p>
            )}

            {design.tags.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-2" aria-label="Tags">
                {design.tags.map((t) => (
                  <li key={t}>
                    <Link
                      href={withParams(catalogueUrl(), { tag: t })}
                      className="inline-flex min-h-[44px] items-center rounded-full border border-slate-300 bg-white px-4 text-sm font-bold capitalize text-slate-700 transition hover:border-brand-gold hover:text-brand-navy"
                    >
                      {t}
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            <div id="design-enquiry" className="mt-7 rounded-2xl border border-brand-gold-light bg-white p-5 shadow-sm">
              <h2 className="text-lg font-black text-brand-navy">Interested in this design?</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Send us a WhatsApp message — it already includes this design&apos;s name and ID, so we know exactly
                which one you mean.
              </p>
              <div className="mt-4">
                <DesignEnquiryCta href={enquiryUrl} label={`Enquire about ${design.id} on WhatsApp`} />
              </div>
              <p className="mt-3 text-xs font-semibold leading-5 text-slate-500">
                This is a preview image. Final colours, size and material are confirmed with you on WhatsApp before
                printing.
              </p>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="pb-14 pt-14" aria-labelledby="wp-related">
            <h2 id="wp-related" className="text-2xl font-black text-slate-950">
              More in {category.name}
            </h2>
            <div className="mt-6">
              <DesignGrid designs={related} categories={categories} />
            </div>
          </section>
        )}
      </div>
    </CatalogueFrame>
  );
}
