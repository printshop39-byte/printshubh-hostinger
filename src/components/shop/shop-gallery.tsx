"use client";

/**
 * ShopGallery — proof that PrintShubh is a place, not just a phone number.
 *
 * RENDERS NOTHING until real photographs are listed in SHOP_PHOTOS
 * (src/lib/shop-profile.ts). That is deliberate. A "we have a real shop"
 * section illustrated with stock photography of somebody else's shop would
 * undo exactly the trust it is meant to build, so the section stays absent
 * rather than fake. Drop the photos in /public/shop/, list them, and it
 * appears.
 *
 * Layout is a horizontal scroller at every width — it holds a variable
 * number of photos without the grid going ragged, and it reads as a
 * deliberate strip rather than a gap when there are only three or four.
 */

import Image from "next/image";
import { Camera, MapPin } from "lucide-react";
import { useLang, type Lang } from "@/components/language-context";
import { SHOP_PHOTOS, hasShopPhotos } from "@/lib/shop-profile";
import { Reveal } from "@/components/shop/motion";

const t: Record<Lang, { eyebrow: string; heading: string; sub: string }> = {
  mr: {
    eyebrow: "आमचे दुकान",
    heading: "फक्त Online नाही — आमचे प्रत्यक्ष दुकान आहे.",
    sub: "काउंटर, मशीन आणि तयार झालेले काम — जसे आहे तसे.",
  },
  en: {
    eyebrow: "Our shop",
    heading: "Not just online — there is a real counter.",
    sub: "The counter, the machines and finished work — exactly as they are.",
  },
};

export function ShopGallery() {
  const { lang } = useLang();
  const tx = t[lang];

  if (!hasShopPhotos()) return null;

  return (
    <section
      aria-labelledby="shop-gallery-heading"
      className="overflow-hidden bg-white px-5 py-16 sm:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <p className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-[11.5px] font-black uppercase tracking-[0.18em] text-blue-800">
            <MapPin className="size-3.5" aria-hidden="true" />
            {tx.eyebrow}
          </p>
          <h2
            id="shop-gallery-heading"
            className="mt-5 max-w-3xl text-3xl font-black leading-[1.12] tracking-tight text-slate-950 sm:text-4xl"
          >
            {tx.heading}
          </h2>
          <p className="mt-3 max-w-xl text-lg leading-8 text-slate-600">{tx.sub}</p>
        </Reveal>
      </div>

      {/* Full-bleed scroller: the strip runs to the viewport edge so it reads
          as continuing past the fold rather than stopping at the container. */}
      <Reveal delay={0.1}>
        <ul className="ps-scroll-x mt-10 flex gap-4 px-5 pb-4 sm:px-8 lg:mx-auto lg:max-w-[100rem]">
          {SHOP_PHOTOS.map((photo) => (
            <li
              key={photo.src}
              className="ps-snap group relative w-[78vw] shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm sm:w-[46vw] lg:w-[26rem]"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <Image
                  src={photo.src}
                  alt={photo.alt[lang]}
                  width={photo.width}
                  height={photo.height}
                  loading="lazy"
                  sizes="(max-width: 640px) 78vw, (max-width: 1024px) 46vw, 26rem"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04] motion-reduce:transform-none motion-reduce:transition-none"
                />
              </div>
              {/* Caption sits over a gradient scrim so it stays legible on
                  both a bright shopfront and a dark machine close-up. */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 via-slate-950/45 to-transparent px-4 pb-4 pt-10">
                <p className="flex items-center gap-2 text-[13.5px] font-bold text-white">
                  <Camera className="size-3.5 shrink-0 opacity-70" aria-hidden="true" />
                  {photo.caption[lang]}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
