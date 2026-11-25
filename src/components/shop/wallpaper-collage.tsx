/**
 * WallpaperCollage — a 2 x 2 collage of real, published wallpaper design
 * previews, used in place of the generic icon box on the Wallpaper Printing page
 * (server component, passed to CollectionPageShell as its `heroVisual`).
 *
 * These are PREVIEWS from the PRINTSHUBH catalogue, not photographs of finished
 * walls; the caption says so. Tiles are decorative, so a controlled 16:10 crop
 * is accepted (it trims a 16:9 design by under 6% top and bottom). Each tile
 * links to the design's own page.
 */
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DesignImg } from "@/components/wallpapers/design-image";
import { catalogueUrl, designUrl } from "@/lib/wallpapers/catalogue";
import { showcaseAlt } from "@/lib/wallpapers/showcase";
import type { PublicDesign } from "@/lib/wallpapers/types";

export function WallpaperCollage({ designs }: { designs: PublicDesign[] }) {
  if (designs.length === 0) return null;

  return (
    <div>
      <ul className="grid grid-cols-2 gap-2.5 sm:gap-3">
        {designs.slice(0, 4).map((design, i) => (
          <li key={design.id}>
            <Link
              href={designUrl(design.categorySlug, design.id)}
              className="group block overflow-hidden rounded-xl border border-brand-gold-light bg-brand-gold-light shadow-sm transition hover:border-brand-gold hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
            >
              <div className="aspect-[16/10]">
                <DesignImg
                  image={design.image}
                  alt={showcaseAlt(design)}
                  sizes="(min-width:1024px) 22vw, (min-width:640px) 40vw, 46vw"
                  eager={i < 2}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
                />
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 text-[12px] font-semibold leading-5 text-slate-600">
        <span>Design previews from the PRINTSHUBH catalogue, including Madhubani-inspired and Pichwai-inspired designs.</span>
        <Link
          href={catalogueUrl()}
          className="inline-flex shrink-0 items-center gap-1.5 font-black text-brand-navy transition hover:underline"
        >
          Browse all designs
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </p>
    </div>
  );
}
