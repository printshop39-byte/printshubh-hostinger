"use client";

/**
 * VisitShop — "Visit the Studio": address, hours, map and the three ways to
 * reach the counter, in one ivory panel.
 *
 * RENDERS NOTHING until SHOP_ADDRESS is filled in (src/lib/shop-profile.ts).
 * Publishing an address the owner has not confirmed would be worse than
 * publishing none: local search ranks on name/address/phone matching the
 * Google Business Profile exactly, and a wrong address actively damages
 * that. Until then the site keeps describing itself as a service-area
 * business, which is what it has always accurately claimed.
 *
 * NOTHING WAITS FOR AN ANIMATION
 *   Everything is plain markup, visible from the first paint and under
 *   prefers-reduced-motion alike.
 *
 * The map is an iframe framed as part of the panel. `loading="lazy"` keeps
 * Google Maps entirely out of the initial page cost; it is well below the
 * fold, so it never competes with the hero.
 *
 * The panel sits above the footer (z-10); the footer is pulled up beneath its
 * lower edge by `body:has(#visit) footer[data-site-footer]` in globals.css.
 */

import { Clock, MapPin, MessageCircle, Navigation, Phone } from "lucide-react";
import { OPENING_HOURS, SHOP_ADDRESS } from "@/lib/shop-profile";
import { SITE_CONTACT } from "@/components/site-footer";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { trackWhatsAppLead } from "@/components/meta-pixel";

const t: {
  eyebrow: string;
  heading: string;
  sub: string;
  addressLabel: string;
  hoursLabel: string;
  call: string;
  whatsapp: string;
  directions: string;
  mapTitle: string;
  waMessage: string;
} = {
  eyebrow: "Find us",
  heading: "Visit the Studio",
  sub: "Big job or small — come to the counter, or ask on WhatsApp first.",
  addressLabel: "Address",
  hoursLabel: "Hours",
  call: "Call",
  whatsapp: "WhatsApp",
  directions: "Directions",
  mapTitle: "PrintShubh studio location on Google Maps",
  waMessage: "Hello PrintShubh, I would like to ask about the shop.",
};

export function VisitShop() {
  const tx = t;

  const address = SHOP_ADDRESS;
  if (!address) return null;

  const waHref = buildWhatsAppUrl({ message: tx.waMessage, campaign: "visit-shop" });

  return (
    <section
      id="visit"
      aria-labelledby="visit-heading"
      className="scroll-mt-24 bg-ivory px-5 pb-8 pt-12 sm:px-8 lg:pt-16"
    >
      <div className="relative z-10 mx-auto max-w-7xl overflow-hidden rounded-[20px] border border-forest/15 bg-ivory-soft shadow-[0_18px_40px_-20px_rgba(14,59,46,0.35)] lg:grid lg:grid-cols-[0.85fr_1.15fr]">
        {/* Details column */}
        <div className="p-6 sm:p-9">
          <p className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-brand-gold">
            <MapPin className="size-3.5" aria-hidden="true" />
            {tx.eyebrow}
          </p>
          <h2 id="visit-heading" className="mt-3 text-3xl leading-[1.1] text-forest sm:text-4xl">
            {tx.heading}
          </h2>
          <p className="mt-2 max-w-md text-[16px] leading-7 text-ink-muted">{tx.sub}</p>

          <h3 className="mt-6 text-[12px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
            {tx.addressLabel}
          </h3>
          <address className="mt-1.5 not-italic text-[16px] font-medium leading-7 text-ink">
            {address.lines.en.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </address>

          {OPENING_HOURS && (
            <>
              <h3 className="mt-5 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
                <Clock className="size-3.5" aria-hidden="true" />
                {tx.hoursLabel}
              </h3>
              <dl className="mt-1.5 space-y-1">
                {OPENING_HOURS.rows.map((row) => (
                  <div key={row.days.en} className="flex justify-between gap-4 text-[15px]">
                    <dt className="font-medium text-ink">{row.days.en}</dt>
                    <dd className="whitespace-nowrap text-ink-muted">{row.time.en}</dd>
                  </div>
                ))}
              </dl>
            </>
          )}

          <div className="mt-6 flex flex-wrap gap-2.5">
            <a
              href={address.directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-forest btn-lg"
            >
              <Navigation className="size-4" aria-hidden="true" />
              {tx.directions}
            </a>
            <a href={`tel:${SITE_CONTACT.phoneTel}`} className="btn btn-secondary btn-lg">
              <Phone className="size-4" aria-hidden="true" />
              {tx.call}
            </a>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppLead()}
              className="btn btn-secondary btn-lg"
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              {tx.whatsapp}
            </a>
          </div>
        </div>

        {/* Map column — lazy, titled, and never the LCP element. */}
        <div className="min-h-[300px] bg-ivory lg:min-h-[400px]">
          <iframe
            src={address.mapsEmbedUrl}
            title={tx.mapTitle}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-full min-h-[300px] w-full border-0 lg:min-h-[400px]"
          />
        </div>
      </div>
    </section>
  );
}
