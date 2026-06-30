"use client";

/**
 * Testimonials — real customer quotes.
 *
 * IMPORTANT — do NOT invent reviews. The `testimonials` array is empty by
 * design, and this component renders NOTHING while it is empty, so no
 * placeholder or fake review can ever reach production.
 *
 * To switch the section on, add real, consented quotes:
 *
 *   const testimonials: Testimonial[] = [
 *     { name: "…", place: "कोल्हापूर", rating: 5,
 *       quote: { mr: "…", en: "…" } },
 *   ];
 *
 * If you'd rather embed live Google reviews instead, replace the grid
 * with your Google Business Profile reviews widget.
 */

import { Quote, Star } from "lucide-react";
import { useLang, type Lang } from "@/components/language-context";

interface Testimonial {
  name: string;
  place: string;
  rating: number; // 1–5
  quote: Record<Lang, string>;
}

/* ── Add real customer quotes here to enable this section ── */
const testimonials: Testimonial[] = [];

const heading: Record<Lang, string> = {
  mr: "ग्राहकांचे अनुभव",
  en: "What our customers say",
};

export function Testimonials() {
  const { lang } = useLang();

  // Nothing real to show yet → render nothing (never a fake placeholder).
  if (testimonials.length === 0) return null;

  return (
    <section className="bg-white px-5 py-16 sm:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
          {heading[lang]}
        </h2>
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <li
              data-reveal
              key={i}
              className="flex flex-col rounded-xl border border-slate-200 bg-[#f8fbff] p-6 shadow-sm"
            >
              <Quote className="size-7 text-blue-200" aria-hidden="true" />
              <div className="mt-2 flex gap-0.5" aria-label={`${t.rating} / 5`}>
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star
                    key={s}
                    className={`size-4 ${
                      s < t.rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-300"
                    }`}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <p className="mt-3 flex-1 text-[15px] leading-7 text-slate-700">
                {t.quote[lang]}
              </p>
              <p className="mt-4 text-sm font-bold text-slate-900">
                {t.name}
                <span className="font-semibold text-slate-500"> · {t.place}</span>
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
