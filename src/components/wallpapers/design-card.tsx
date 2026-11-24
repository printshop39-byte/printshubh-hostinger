import Link from "next/link";
import { DesignImg } from "@/components/wallpapers/design-image";
import { designUrl } from "@/lib/wallpapers/catalogue";
import type { PublicDesign, WallpaperCategory } from "@/lib/wallpapers/types";

/** Grid sizes: 1 column on phones, 2 on small tablets, 3-4 on desktop. */
const CARD_SIZES = "(min-width:1280px) 25vw, (min-width:1024px) 33vw, (min-width:520px) 50vw, 100vw";

export function DesignCard({
  design,
  category,
  eager = false,
}: {
  design: PublicDesign;
  category: Pick<WallpaperCategory, "name"> | undefined;
  /** First row of a grid: load eagerly; later rows lazy-load. */
  eager?: boolean;
}) {
  return (
    <Link
      href={designUrl(design.categorySlug, design.id)}
      className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-brand-gold hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
    >
      {/* Fixed 16:10 frame with the artwork shown in full (never cropped) on a warm mat, so the
          grid stays even for 16:9, 3:2, square and portrait designs alike. */}
      <div className="relative aspect-[16/10] overflow-hidden bg-brand-gold-light p-2.5">
        <DesignImg
          image={design.image}
          alt={`${design.title} — wallpaper design ${design.id}`}
          sizes={CARD_SIZES}
          eager={eager}
          className="h-full w-full object-contain drop-shadow-[0_2px_6px_rgba(15,23,42,0.22)] transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
        />
      </div>
      <div className="p-4">
        <p className="font-mono text-[11px] font-bold tracking-[0.14em] text-slate-500">{design.id}</p>
        <h3 className="mt-1 text-base font-black leading-snug text-brand-navy">{design.title}</h3>
        {category && <p className="mt-0.5 text-sm text-slate-600">{category.name}</p>}
      </div>
    </Link>
  );
}

export function DesignGrid({
  designs,
  categories,
  eagerCount = 0,
}: {
  designs: PublicDesign[];
  categories: WallpaperCategory[];
  /** How many leading cards load eagerly (above the fold). */
  eagerCount?: number;
}) {
  const bySlug = new Map(categories.map((c) => [c.slug, c]));
  return (
    <ul className="grid grid-cols-1 gap-4 min-[520px]:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
      {designs.map((d, i) => (
        <li key={d.id}>
          <DesignCard design={d} category={bySlug.get(d.categorySlug)} eager={i < eagerCount} />
        </li>
      ))}
    </ul>
  );
}
