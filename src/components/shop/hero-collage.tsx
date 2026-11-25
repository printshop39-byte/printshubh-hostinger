/**
 * HeroCollage — a small collage of real, published wallpaper design previews for
 * the homepage hero (server component; the hero itself is a client component and
 * receives this as a slot).
 *
 * WHAT IT IS AND IS NOT
 *   These are PREVIEWS of designs in the PRINTSHUBH catalogue. They are not
 *   photographs of finished walls or of installed prints, and the caption says
 *   so. Nothing here implies otherwise.
 *
 * CROP
 *   The tiles are decorative, so a controlled crop is accepted: each tile is
 *   16:10, which trims a 16:9 design by under 6% top and bottom. Cards in the
 *   catalogue itself still show the whole artwork.
 *
 * Designs come from getShowcase() (published only). Each tile links to the
 * design's own page. Tile sizes are fixed by aspect-ratio, so nothing shifts
 * while images load.
 */
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DesignImg } from "@/components/wallpapers/design-image";
import { catalogueUrl, designUrl } from "@/lib/wallpapers/catalogue";
import { showcaseAlt } from "@/lib/wallpapers/showcase";
import type { PublicDesign } from "@/lib/wallpapers/types";

function Tile({
  design,
  sizes,
  eager = false,
  className = "",
}: {
  design: PublicDesign;
  sizes: string;
  eager?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={designUrl(design.categorySlug, design.id)}
      className={`group relative block overflow-hidden rounded-xl bg-brand-gold-light shadow-lg shadow-black/30 ring-1 ring-brand-gold/50 transition hover:ring-brand-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold ${className}`}
    >
      <div className="aspect-[16/10]">
        <DesignImg
          image={design.image}
          alt={showcaseAlt(design)}
          sizes={sizes}
          eager={eager}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
        />
      </div>
    </Link>
  );
}

export function HeroCollage({ designs }: { designs: PublicDesign[] }) {
  const [a, b, c] = designs;
  if (!a) return null;

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <Tile design={a} className="col-span-2" sizes="(min-width:1024px) 45vw, 100vw" eager />
        {b && <Tile design={b} sizes="(min-width:1024px) 22vw, 50vw" />}
        {c && <Tile design={c} sizes="(min-width:1024px) 22vw, 50vw" />}
      </div>
      <p className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 text-[12px] font-semibold leading-5 text-slate-300">
        <span>Design previews from the PRINTSHUBH catalogue, including Madhubani-inspired and Pichwai-inspired designs.</span>
        <Link
          href={catalogueUrl()}
          className="inline-flex shrink-0 items-center gap-1.5 font-black text-brand-gold-light transition hover:text-white"
        >
          Browse all designs
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </p>
    </div>
  );
}
