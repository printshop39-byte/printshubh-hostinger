import Link from "next/link";
import { Breadcrumbs } from "@/components/wallpapers/catalogue-frame";
import { DesignEnquiryCta } from "@/components/wallpapers/design-enquiry-cta";
import { DesignGrid } from "@/components/wallpapers/design-card";
import { DesignImg } from "@/components/wallpapers/design-image";
import { withParams } from "@/components/wallpapers/catalogue-controls";
import { catalogueUrl, categoryUrl } from "@/lib/wallpapers/catalogue";
import type { PublicDesign, WallpaperCategory } from "@/lib/wallpapers/types";

/**
 * The body of a design page: large preview, ID, details, WhatsApp enquiry and
 * related designs. Shared by the public page and the admin preview, so what an
 * admin previews before publishing is exactly what customers will see.
 */
export function DesignDetail({
  design,
  category,
  categories,
  related,
  enquiryUrl,
}: {
  design: PublicDesign;
  category: WallpaperCategory;
  categories: WallpaperCategory[];
  related: PublicDesign[];
  enquiryUrl: string;
}) {
  return (
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
            priority
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
              printing.{" "}
              <Link href="/wallpaper-terms" className="text-brand-navy underline underline-offset-2">
                Wallpaper order terms
              </Link>
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
  );
}
