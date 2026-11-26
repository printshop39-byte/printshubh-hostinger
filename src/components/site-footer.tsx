"use client";

/**
 * SiteFooter — forest-green footer rendered below every page: brand, then
 * Studio / Collections / Services / Reach Us, and a quiet legal row.
 *
 * It is also the site's link safety net. The desktop header only carries
 * Collections, About and Contact; the other information pages (FAQ, support
 * and the policy pages) are listed here, on every route.
 *
 * The address and opening hours live in the "Visit the Studio" panel on the
 * homepage, so the footer repeats them only on routes that have no such panel.
 * The address block shows a real address only once SHOP_ADDRESS is filled in
 * (src/lib/shop-profile.ts); until then it states the service area, which is
 * what the site has always accurately claimed.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock, Mail, MapPin, MessageCircle, Navigation, Phone } from "lucide-react";
import { inquiryCtaClick } from "@/lib/inquiry-form-bus";
import { buildWhatsAppUrl, WHATSAPP_DISPLAY, WHATSAPP_NUMBER } from "@/lib/whatsapp";
import { OPENING_HOURS, SHOP_ADDRESS } from "@/lib/shop-profile";
import { COLLECTIONS } from "@/lib/collections";
import { isHomePath } from "@/lib/home-path";

/* ── Official PrintShubh contact details ──────────────────────────────────
 * Single source of truth for the *display* forms — every component that needs
 * the phone / WhatsApp number imports SITE_CONTACT from this file. The digits
 * themselves come from the canonical WhatsApp helper so the number literal
 * lives in exactly one place. */
export const SITE_CONTACT = {
  phone: WHATSAPP_DISPLAY,               // display form — shown to the user
  phoneTel: `+${WHATSAPP_NUMBER}`,       // E.164 form — used in tel: links
  email: "support@printshubh.shop",
  whatsapp: WHATSAPP_NUMBER,             // used in wa.me/ links
  // Street address is NOT hard-coded here. It comes from SHOP_ADDRESS in
  // src/lib/shop-profile.ts, and while that is null the site advertises a
  // service area instead — see the address block below and /contact.
  serviceArea_en: "Online / WhatsApp assistance across Maharashtra",
};

const tx = {
  tagline: "Premium Print & Visual Studio — wallpaper, canvas, wall art and more.",
  studioTitle: "Studio",
  collectionsTitle: "Collections",
  servicesTitle: "Services",
  reachTitle: "Reach Us",
  studio: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "FAQ", href: "/faq" },
    { label: "Support", href: "/support" },
  ],
  services: [
    { label: "Prints", href: "/printing-xerox" },
    { label: "Photo Services", href: "/photo-services" },
    { label: "Online Services", href: "/digital-services" },
  ],
  legal: [
    { label: "Terms", href: "/terms" },
    { label: "Privacy", href: "/privacy" },
    { label: "Refunds", href: "/refund" },
    { label: "Wallpaper Terms", href: "/wallpaper-terms" },
    { label: "Disclaimer", href: "/disclaimer" },
  ],
  waMsg: "Hello, I would like to know about PrintShubh services.",
  waCta: "Chat on WhatsApp",
  rights: "All rights reserved.",
  directions: "Directions",
  crossSite: "Free online tools:",
};

const linkCls =
  "flex min-h-[44px] items-center text-[15px] text-ivory/80 transition hover:text-brand-gold lg:min-h-9";
const headingCls =
  "mb-1 text-[12px] font-semibold uppercase tracking-[0.18em] text-brand-gold";

export function SiteFooter() {
  const t = tx;
  const pathname = usePathname();
  const isHome = isHomePath(pathname);
  const year = new Date().getFullYear();
  const waHref = buildWhatsAppUrl({ message: t.waMsg, campaign: "footer" });

  const column = (title: string, links: { label: string; href: string }[]) => (
    <nav aria-label={title}>
      <h2 className={headingCls}>{title}</h2>
      <ul>
        {links.map((l) => (
          <li key={l.href + l.label}>
            <Link href={l.href} className={linkCls}>
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );

  return (
    <footer
      data-site-footer=""
      data-surface="dark"
      className="relative bg-forest px-5 pb-6 pt-14 text-ivory sm:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-x-8 gap-y-6 lg:grid-cols-[1.3fr_0.8fr_1fr_1fr_1.2fr] lg:gap-x-10 lg:gap-y-8">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            {/* Same official logo as the header (see SiteHeader). Its backing
                is the footer's own forest green, so it sits flush. */}
            {/* eslint-disable-next-line @next/next/no-img-element -- fixed brand asset with three pre-rendered densities */}
            <img
              src="/brand/header-lockup.png"
              srcSet="/brand/header-lockup.png 1x, /brand/header-lockup@2x.png 2x, /brand/header-lockup@3x.png 3x"
              width={237}
              height={44}
              alt="PRINTSHUBH"
              loading="lazy"
              decoding="async"
              className="h-9 w-auto max-w-none shrink-0 xl:h-11"
            />
            <p className="mt-4 max-w-xs text-[15px] leading-7 text-ivory/80">{t.tagline}</p>
          </div>

          {column(t.studioTitle, t.studio)}

          <nav aria-label={t.collectionsTitle} className="col-span-2 lg:col-span-1">
            <h2 className={headingCls}>{t.collectionsTitle}</h2>
            <ul className="grid grid-cols-2 gap-x-8 lg:block">
              {COLLECTIONS.map((c) => (
                <li key={c.key}>
                  <Link href={`/collections/${c.slug}/`} className={linkCls}>
                    {c.shortTitle.en}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {column(t.servicesTitle, t.services)}

          {/* Reach Us. Address and hours live in the Visit the Studio panel on
              the homepage, so they are only repeated here on pages without it. */}
          <div className="col-span-2 lg:col-span-1">
            <h2 className={headingCls}>{t.reachTitle}</h2>
            <ul className="text-[15px]">
              <li className="flex items-center gap-2.5">
                <Phone className="size-4 shrink-0 text-brand-gold" aria-hidden="true" />
                <a
                  href={`tel:${SITE_CONTACT.phoneTel}`}
                  className="inline-flex min-h-[44px] items-center text-ivory/90 transition hover:text-brand-gold"
                >
                  {SITE_CONTACT.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="size-4 shrink-0 text-brand-gold" aria-hidden="true" />
                <a
                  href={`mailto:${SITE_CONTACT.email}`}
                  className="inline-flex min-h-[44px] items-center break-all text-ivory/90 transition hover:text-brand-gold"
                >
                  {SITE_CONTACT.email}
                </a>
              </li>
              {!isHome && (
                <li className="flex items-start gap-2.5 py-2">
                  <MapPin className="mt-1 size-4 shrink-0 text-brand-gold" aria-hidden="true" />
                  {SHOP_ADDRESS ? (
                    <address className="not-italic leading-6 text-ivory/80">
                      {SHOP_ADDRESS.lines.en.map((line) => (
                        <span key={line} className="block">
                          {line}
                        </span>
                      ))}
                      <a
                        href={SHOP_ADDRESS.directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-[44px] items-center gap-1.5 font-semibold text-brand-gold transition hover:text-ivory"
                      >
                        <Navigation className="size-3.5" aria-hidden="true" />
                        {t.directions}
                      </a>
                    </address>
                  ) : (
                    <span className="leading-6 text-ivory/80">{SITE_CONTACT.serviceArea_en}</span>
                  )}
                </li>
              )}
              {!isHome && OPENING_HOURS && (
                <li className="flex items-start gap-2.5 pb-2">
                  <Clock className="mt-1 size-4 shrink-0 text-brand-gold" aria-hidden="true" />
                  {/* One row per entry, label above value, never wrapped mid-phrase. */}
                  <dl className="space-y-2 text-[14px] leading-5">
                    {OPENING_HOURS.rows.map((row) => (
                      <div key={row.days.en}>
                        <dt className="whitespace-nowrap font-semibold text-ivory/90">{row.days.en}</dt>
                        <dd className="whitespace-nowrap text-ivory/80">{row.time.en}</dd>
                      </div>
                    ))}
                  </dl>
                </li>
              )}
            </ul>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={inquiryCtaClick}
              className="btn btn-on-dark mt-2"
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              {t.waCta}
            </a>
          </div>
        </div>

        {/* Legal row */}
        <div className="mt-10 flex flex-col gap-x-6 gap-y-1 border-t border-brand-gold/25 pt-4 text-[13px] text-ivory/75 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} PRINTSHUBH · {t.rights}
          </p>
          <ul className="flex flex-wrap gap-x-5">
            {t.legal.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="inline-flex min-h-[44px] items-center transition hover:text-brand-gold"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            {/* The one plain, followed link to the free-tools site. */}
            <li>
              <a
                href="https://www.printshubh.in"
                className="inline-flex min-h-[44px] items-center transition hover:text-brand-gold"
              >
                {t.crossSite} printshubh.in
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
