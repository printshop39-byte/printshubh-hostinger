import Link from "next/link";
import { DesignImg } from "@/components/wallpapers/design-image";
import { categoryUrl } from "@/lib/wallpapers/catalogue";
import type { PublicDesign, WallpaperCategory } from "@/lib/wallpapers/types";

export function CategoryCard({
  category,
  cover,
  count,
}: {
  category: WallpaperCategory;
  cover: PublicDesign | undefined;
  count: number;
}) {
  return (
    <Link
      href={categoryUrl(category.slug)}
      className="group relative isolate block aspect-[4/3] overflow-hidden rounded-2xl bg-brand-navy shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
    >
      {cover && (
        <DesignImg
          image={cover.image}
          alt=""
          sizes="(min-width:1280px) 25vw, (min-width:1024px) 33vw, (min-width:520px) 50vw, 100vw"
          className="absolute inset-0 -z-10 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transition-none"
        />
      )}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-brand-navy-dark/90 via-brand-navy/30 to-transparent" />
      <div className="flex h-full flex-col justify-end p-5 text-white">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-brand-gold-light">
          {count} {count === 1 ? "design" : "designs"}
        </p>
        <h3 className="mt-1 text-xl font-black leading-tight">{category.name}</h3>
      </div>
    </Link>
  );
}
