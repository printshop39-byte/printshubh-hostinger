"use client";

/**
 * ServiceStrip — the horizontal band of counter services directly under the
 * hero. It exists so a visitor who reads nothing else still learns, in one
 * glance, that this is a print/xerox/photo shop.
 *
 * Two behaviours from one markup (see `.ps-strip` / `.ps-scroll-x` in
 * globals.css):
 *   - md and up : a slow seamless marquee, paused on hover/focus.
 *   - phones    : a plain swipeable chip row, no animation at all.
 *
 * The duplicate track that makes the marquee loop is aria-hidden, so screen
 * readers and search engines see each service exactly once.
 */

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLang, type Lang } from "@/components/language-context";
import { QUICK_SERVICES } from "@/lib/shop-services";

const label: Record<Lang, string> = {
  mr: "आमच्या सेवा",
  en: "Our services",
};

function Chips({ lang, ariaHidden }: { lang: Lang; ariaHidden?: boolean }) {
  return (
    <ul
      className="flex shrink-0 items-center gap-2.5 px-2.5"
      aria-hidden={ariaHidden ? "true" : undefined}
    >
      {QUICK_SERVICES.map((service, i) => {
        const text = service.label[lang];
        const chip = (
          <span className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-[13.5px] font-bold text-slate-800 shadow-sm transition group-hover:border-blue-300 group-hover:text-blue-800">
            {text}
            <ArrowRight
              className="size-3.5 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-blue-600"
              aria-hidden="true"
            />
          </span>
        );

        return (
          <li key={`${text}-${i}`} className="ps-snap flex shrink-0 items-center gap-2.5">
            {service.href ? (
              <Link
                href={service.href}
                tabIndex={ariaHidden ? -1 : undefined}
                className="group"
              >
                {chip}
              </Link>
            ) : (
              <span className="group">{chip}</span>
            )}
            <span aria-hidden="true" className="text-slate-300">
              •
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export function ServiceStrip() {
  const { lang } = useLang();

  return (
    <section
      aria-label={label[lang]}
      className="ps-strip border-b border-slate-200 bg-slate-50/80 py-3.5 md:overflow-hidden"
    >
      {/* Three behaviours from one markup:
            phones            → plain swipeable chip row (this element scrolls)
            desktop           → marquee; the track is transformed by ps-strip
            reduced motion    → marquee off, track becomes a normal scroller
                                and the duplicate copy is removed

          That last case matters: with the animation off, an inline-flex track
          wider than its clipped parent would strand the trailing chips
          off-screen with no way to reach them. See the
          `prefers-reduced-motion` rules for .ps-strip-track / .ps-strip-dupe
          in globals.css. */}
      <div className="ps-strip-track ps-scroll-x flex px-3 md:px-0">
        <Chips lang={lang} />
        {/* Duplicate copy completes the seamless -50% loop on desktop. It is
            hidden from a11y and untabbable so it never doubles the content,
            and it is removed entirely under reduced motion. */}
        <div className="ps-strip-dupe hidden md:flex">
          <Chips lang={lang} ariaHidden />
        </div>
      </div>
    </section>
  );
}
