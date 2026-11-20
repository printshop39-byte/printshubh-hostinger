"use client";

/**
 * CollectionsGrid — the homepage's index of the seven premium collections.
 *
 * An editorial index, not a card grid: a numbered list set in type, one hairline
 * between rows, each row one link to its collection page. On a phone it is a
 * single column of tall rows (every one a comfortable tap target); from the
 * `lg` breakpoint the heading stays in view on the left while the list runs
 * down the right.
 *
 * WHY THERE ARE NO PICTURES
 *   No photograph of the studio's own work exists yet (see collections.ts and
 *   shop-profile.ts: no stock photos, no fabricated samples), and an icon in a
 *   box says nothing about a wallpaper or a canvas. So the page is typography
 *   and space. The names and one-line descriptions are read from
 *   collections.ts unchanged, so a collection's name or route cannot drift
 *   between surfaces.
 *
 *   When real photos are added to a collection (Collection.photos), the row
 *   shows the first one as a small thumbnail; nothing here needs to change.
 *
 * NOTHING WAITS FOR AN ANIMATION
 *   There is no Reveal / Stagger here. The list is ordinary server-rendered
 *   markup with no opacity-zero first state, so it is readable even if the
 *   scripts never arrive. The only motion is a hover/focus transition on the
 *   row and its arrow, switched off under prefers-reduced-motion.
 *
 * `id="collections"` is load-bearing: the header, the bottom nav, the hero and
 * every collection page's breadcrumb link to `/#collections`.
 */

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { useFunnelViewEvent } from "@/lib/analytics";
import { COLLECTIONS, hasCollectionPhotos } from "@/lib/collections";

const t: { eyebrow: string; heading: string; sub: string } = {
  eyebrow: "Collections",
  heading: "What we print.",
  sub: "Seven collections, each available in your size.",
};

export function CollectionsGrid() {
  const tx = t;

  const sectionRef = useRef<HTMLElement>(null);
  useFunnelViewEvent(sectionRef, "collections_grid_view", { lang: "en", surface: "collections-grid" });

  return (
    <section
      id="collections"
      ref={sectionRef}
      aria-labelledby="collections-grid-heading"
      className="scroll-mt-20 bg-brand-cream px-5 py-14 sm:px-8 lg:py-24"
    >
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.8fr_1.2fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="flex items-center gap-3 text-[12px] font-black uppercase tracking-[0.2em] text-brand-navy">
            <span aria-hidden="true" className="h-px w-8 bg-brand-gold" />
            {tx.eyebrow}
          </p>
          <h2
            id="collections-grid-heading"
            className="mt-4 max-w-md text-balance text-[2.2rem] font-black leading-[1.1] tracking-tight text-brand-navy sm:text-5xl"
          >
            {tx.heading}
          </h2>
          <p className="mt-4 max-w-md text-balance text-lg leading-8 text-slate-600">{tx.sub}</p>
        </div>

        <ol className="border-b border-brand-gold/40">
          {COLLECTIONS.map((collection, i) => {
            const photo = hasCollectionPhotos(collection) ? collection.photos[0] : null;
            return (
              <li key={collection.key} className="border-t border-brand-gold/40">
                <Link
                  href={`/collections/${collection.slug}/`}
                  className="group -mx-3 grid min-h-[88px] grid-cols-[auto_1fr_auto] items-center gap-4 rounded-lg px-3 py-5 transition-colors hover:bg-white/70 focus-visible:bg-white/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy motion-reduce:transition-none sm:gap-6 sm:py-6 lg:py-8"
                >
                  <span
                    aria-hidden="true"
                    className="w-9 text-xl font-black tabular-nums text-brand-gold sm:w-14 sm:text-3xl lg:text-4xl"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <span className="min-w-0">
                    <span className="block text-xl font-black leading-tight tracking-tight text-brand-navy sm:text-2xl lg:text-3xl">
                      {collection.title.en}
                    </span>
                    <span className="mt-1.5 block text-[14px] leading-6 text-slate-600 sm:text-base">
                      {collection.tagline.en}
                    </span>
                  </span>

                  <span className="flex items-center gap-4">
                    {photo ? (
                      <Image
                        src={photo.src}
                        width={photo.width}
                        height={photo.height}
                        alt={photo.alt.en}
                        sizes="112px"
                        className="hidden h-20 w-28 rounded-lg object-cover sm:block"
                      />
                    ) : null}
                    <span
                      aria-hidden="true"
                      className="grid size-11 shrink-0 place-items-center rounded-full border border-brand-navy/25 text-brand-navy transition group-hover:border-brand-navy group-hover:bg-brand-navy group-hover:text-white motion-reduce:transition-none"
                    >
                      <ArrowRight className="size-4 transition group-hover:translate-x-0.5 motion-reduce:transform-none" />
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
