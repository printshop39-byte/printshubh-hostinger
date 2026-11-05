"use client";

/**
 * CollectionsGrid — homepage showcase of the 7 premium print collections.
 *
 * Sits right after PrintingTechnology on purpose: that section explains the
 * "how" (11-colour Epson SureColor SC-S9130), this one shows the "what"
 * (the seven things printed on it) — one cohesive premium-studio story,
 * not two unrelated sections.
 *
 * Cards are typography-first (CollectionVisual) — no stock photos, no
 * fabricated samples. See collections.ts for the full rationale.
 */

import Link from "next/link";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { useLang, type Lang } from "@/components/language-context";
import { useFunnelViewEvent } from "@/lib/analytics";
import { COLLECTIONS } from "@/lib/collections";
import { CollectionVisual } from "@/components/shop/collection-visual";
import { Reveal, Stagger, StaggerItem } from "@/components/shop/motion";

const t: Record<Lang, { eyebrow: string; heading: string; sub: string; viewLabel: string }> = {
  mr: {
    eyebrow: "Premium Collections",
    heading: "सात प्रीमियम प्रिंट कलेक्शन्स.",
    sub: "वॉलपेपर, कॅनव्हास, वॉल आर्ट आणि बरेच काही — Epson SureColor SC-S9130 च्या 11-रंगी तंत्रज्ञानाने प्रिंट केलेले.",
    viewLabel: "पहा",
  },
  en: {
    eyebrow: "Premium Collections",
    heading: "Seven premium print collections.",
    sub: "Wallpaper, canvas, wall art and more — printed on the Epson SureColor SC-S9130's 11-colour technology.",
    viewLabel: "View",
  },
};

export function CollectionsGrid() {
  const { lang } = useLang();
  const tx = t[lang];

  const sectionRef = useRef<HTMLElement>(null);
  useFunnelViewEvent(sectionRef, "collections_grid_view", { lang, surface: "collections-grid" });

  return (
    <section
      id="collections"
      ref={sectionRef}
      aria-labelledby="collections-grid-heading"
      className="scroll-mt-20 bg-white px-5 py-16 sm:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <p className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-[11.5px] font-black uppercase tracking-[0.18em] text-blue-800">
            {tx.eyebrow}
          </p>
          <h2
            id="collections-grid-heading"
            className="mt-5 max-w-3xl text-3xl font-black leading-[1.12] tracking-tight text-slate-950 sm:text-4xl"
          >
            {tx.heading}
          </h2>
          <p className="mt-3 max-w-2xl text-lg leading-8 text-slate-600">{tx.sub}</p>
        </Reveal>

        <Stagger as="ul" className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {COLLECTIONS.map((collection) => (
            <StaggerItem as="li" key={collection.key}>
              <Link
                href={`/collections/${collection.slug}/`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_45px_-30px_rgba(15,23,42,.4)] transition duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-[0_22px_50px_-24px_rgba(37,99,235,.3)] motion-reduce:transform-none motion-reduce:transition-none"
              >
                <div className="aspect-[4/3]">
                  <CollectionVisual
                    collectionKey={collection.key}
                    shortTitle={collection.shortTitle[lang]}
                    className="rounded-none border-0 border-b border-slate-200"
                  />
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="text-base font-black leading-tight text-slate-950">
                    {collection.shortTitle[lang]}
                  </h3>
                  <p className="mt-1.5 flex-1 text-[13px] leading-5 text-slate-600">
                    {collection.tagline[lang]}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-black uppercase tracking-wide text-blue-700">
                    {tx.viewLabel}
                    <ArrowRight
                      className="size-3.5 transition duration-300 group-hover:translate-x-1 motion-reduce:transform-none"
                      aria-hidden="true"
                    />
                  </span>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
