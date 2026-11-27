/**
 * FeaturedDesignsStrip — four real, published wallpaper designs near the top of
 * the homepage, each linking to its own page (server component).
 *
 * The WHOLE artwork is shown on a warm mat (same frame as the catalogue cards:
 * 16:10, object-contain), never cropped. It has its own small card, rather than
 * reusing DesignCard, only so that `sizes` matches this strip's two-column phone
 * layout; otherwise a phone would download the 1600 px preview for a 160 px card.
 *
 * Renders nothing when fewer than two of the requested designs are public, so
 * the homepage never shows an empty shell.
 */
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DesignImg } from "@/components/wallpapers/design-image";
import { catalogueUrl, designUrl, getCategories } from "@/lib/wallpapers/catalogue";
import { STYLE_NOTE, showcaseAlt } from "@/lib/wallpapers/showcase";
import type { PublicDesign } from "@/lib/wallpapers/types";

const SIZES = "(min-width:1280px) 22vw, (min-width:1024px) 24vw, 46vw";

export async function FeaturedDesignsStrip({ designs }: { designs: PublicDesign[] }) {
  if (designs.length < 2) return null;
  const categories = await getCategories();
  const nameBySlug = new Map(categories.map((c) => [c.slug, c.name]));

  return (
    <section
      id="featured-designs"
      aria-labelledby="featured-designs-heading"
      className="scroll-mt-20 bg-brand-cream px-5 pb-2 pt-12 sm:px-8 lg:pt-16"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <div>
            <p className="flex items-center gap-3 text-[12px] font-black uppercase tracking-[0.2em] text-brand-navy">
              <span aria-hidden="true" className="h-px w-8 bg-brand-gold" />
              Featured designs
            </p>
            <h2
              id="featured-designs-heading"
              className="mt-3 text-balance text-[1.9rem] font-black leading-[1.1] tracking-tight text-brand-navy sm:text-4xl"
            >
              From the wallpaper library.
            </h2>
          </div>
          <Link
            href={catalogueUrl()}
            className="inline-flex min-h-[44px] items-center gap-2 text-sm font-black text-brand-navy underline decoration-brand-gold decoration-2 underline-offset-4 transition hover:text-brand-navy-dark"
          >
            View all designs
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {designs.map((design) => {
            const note = STYLE_NOTE[design.id];
            return (
              <li key={design.id}>
                <Link
                  href={designUrl(design.categorySlug, design.id)}
                  className="group block h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-brand-gold hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-brand-gold-light p-2">
                    <DesignImg
                      image={design.image}
                      alt={showcaseAlt(design)}
                      sizes={SIZES}
                      className="h-full w-full object-contain drop-shadow-[0_2px_6px_rgba(15,23,42,0.22)] transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
                    />
                  </div>
                  <div className="p-3 sm:p-4">
                    <p className="font-mono text-[11px] font-bold tracking-[0.14em] text-slate-500">{design.id}</p>
                    <h3 className="mt-1 text-[15px] font-black leading-snug text-brand-navy sm:text-base">{design.title}</h3>
                    <p className="mt-0.5 text-[13px] text-slate-600 sm:text-sm">
                      {nameBySlug.get(design.categorySlug)}
                      {note ? <span className="block text-[12px] font-semibold italic text-slate-500">{note}</span> : null}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-xs font-semibold leading-5 text-slate-500">
          Design previews from the PRINTSHUBH collection. Final colours, size and material are confirmed on WhatsApp
          before printing.
        </p>
      </div>
    </section>
  );
}
