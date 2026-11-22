"use client";

/**
 * GoogleReviews — customer trust, sourced only from the real Google
 * Business Profile.
 *
 * THREE STATES, NO INVENTED ONE
 *   1. Reviews configured        → the review cards render.
 *   2. Only a profile URL        → a single "read our reviews on Google"
 *                                  card renders, which is honest and still
 *                                  useful.
 *   3. Neither configured        → nothing renders.
 *
 * Review text is quoted verbatim and never translated: a translated review
 * is a paraphrase, and a paraphrased review is no longer the customer's
 * words. Only the surrounding chrome switches language.
 *
 * NOTHING WAITS FOR AN ANIMATION
 *   The section used to fade in on scroll (Reveal / Stagger), which left every
 *   heading, card and link at opacity 0 in the server HTML until the scripts
 *   ran. It is now plain markup, visible from the first paint and under
 *   prefers-reduced-motion alike.
 *
 * The star row is labelled for assistive tech; the stars themselves are
 * decorative so a screen reader hears "4 out of 5", not five icons.
 */

import { ExternalLink, Quote, Star } from "lucide-react";
import {
  GOOGLE_PROFILE_URL,
  GOOGLE_RATING,
  GOOGLE_REVIEWS,
  GOOGLE_REVIEW_COUNT,
  hasAggregateRating,
  hasReviews,
} from "@/lib/shop-profile";

const t: { heading: string; sub: string; cta: string; empty: string; ratingLabel: (r: number) => string } = {
  heading: "What our customers say",
  sub: "Reviews left on Google, quoted exactly as written.",
  cta: "Read all reviews on Google",
  empty: "Read what customers say about the shop on our Google Business Profile.",
  ratingLabel: (r) => `${r} out of 5 stars`,
};

function Stars({ rating, label }: { rating: number; label: string }) {
  return (
    <div className="flex gap-0.5" role="img" aria-label={label}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          aria-hidden="true"
          className={`size-4 ${
            i < Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-slate-300"
          }`}
        />
      ))}
    </div>
  );
}

export function GoogleReviews() {
  const tx = t;

  const showReviews = hasReviews();
  const showLinkOnly = !showReviews && GOOGLE_PROFILE_URL !== null;

  // Nothing verified to show → the section does not exist.
  if (!showReviews && !showLinkOnly) return null;

  return (
    <section
      aria-labelledby="reviews-heading"
      className="bg-ivory-soft px-5 py-16 sm:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <div>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <h2
                id="reviews-heading"
                className="text-3xl font-black leading-[1.12] tracking-tight text-slate-950 sm:text-4xl"
              >
                {tx.heading}
              </h2>
              <p className="mt-3 max-w-xl text-lg leading-8 text-slate-600">
                {showReviews ? tx.sub : tx.empty}
              </p>
            </div>

            {/* Aggregate figure — shown only when BOTH the rating and the
                count are filled in, because a rating without a count is a
                number with no weight behind it. */}
            {hasAggregateRating() && (
              <div className="ps-glass flex items-center gap-3 rounded-2xl px-5 py-3.5">
                <p className="text-3xl font-black leading-none text-slate-950">
                  {GOOGLE_RATING}
                </p>
                <div>
                  <Stars
                    rating={GOOGLE_RATING as number}
                    label={tx.ratingLabel(GOOGLE_RATING as number)}
                  />
                  <p className="mt-1 text-[12.5px] font-bold text-slate-500">
                    {GOOGLE_REVIEW_COUNT} Google reviews
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {showReviews && (
          <ul className="mt-11 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {GOOGLE_REVIEWS.map((review, i) => (
              <li key={`${review.author}-${i}`}>
                <figure className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <Quote className="size-7 text-brand-gold-light" aria-hidden="true" />
                  <Stars rating={review.rating} label={tx.ratingLabel(review.rating)} />
                  <blockquote className="mt-3 flex-1 text-[15px] leading-7 text-slate-700">
                    {review.text}
                  </blockquote>
                  <figcaption className="mt-4 text-sm font-black text-slate-900">
                    {review.author}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        )}

        {GOOGLE_PROFILE_URL && (
          <div>
            <a
              href={GOOGLE_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-9 inline-flex h-12 items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-sm font-black text-slate-800 shadow-sm transition hover:border-brand-gold hover:text-brand-navy"
            >
              {tx.cta}
              <ExternalLink className="size-4" aria-hidden="true" />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
