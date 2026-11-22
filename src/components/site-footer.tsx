"use client";

/**
 * SiteFooter — dark, four-column footer rendered below every page.
 *
 * It is also the site's link safety net. The desktop header only carries the
 * four service categories plus About/Contact; the other information pages
 * (FAQ, support and all the policy pages) are listed here, on every route.
 * Nothing became unreachable when the header was slimmed down.
 *
 * On the homepage ("/") only, the footer is the premium-storefront version: the
 * PrintShubh.in tools block is left out, and the collections and services
 * links (already on the page above) fold into one native <details> on phones.
 * Every other route renders the footer exactly as before.
 *
 * The address block shows a real address only once SHOP_ADDRESS is filled in
 * (src/lib/shop-profile.ts); until then it states the service area, which is
 * what the site has always accurately claimed.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { inquiryCtaClick } from "@/lib/inquiry-form-bus";
import { buildWhatsAppUrl, WHATSAPP_DISPLAY, WHATSAPP_NUMBER } from "@/lib/whatsapp";
import { ESTABLISHED, OPENING_HOURS, SHOP_ADDRESS } from "@/lib/shop-profile";
import { COLLECTIONS } from "@/lib/collections";

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

const tx: {
  tagline: string;
  collectionsTitle: string;
  servicesTitle: string;
  usefulTitle: string;
  contactTitle: string;
  badges: string[];
  services: { label: string; href: string }[];
  useful: { label: string; href: string }[];
  waMsg: string;
  waCta: string;
  rights: string;
  builtFor: string;
  directions: string;
  hours: string;
  toolsTitle: string;
  toolsBody: string;
  toolsCta: string;
  browse: string;
  /** Homepage only: label before the printshubh.in link. */
  crossSite: string;
} = {
  tagline:
    "Premium Print & Visual Studio — wallpaper, canvas, wall art and more.",
  collectionsTitle: "Collections",
  servicesTitle: "Services",
  usefulTitle: "Useful",
  contactTitle: "Contact",
  badges: [`Since ${ESTABLISHED.slice(0, 4)}`],
  services: [
    { label: "Prints", href: "/printing-xerox" },
    { label: "Photo Services", href: "/photo-services" },
  ],
  useful: [
    { label: "About Us", href: "/about" },
    { label: "FAQ", href: "/faq" },
    { label: "Support", href: "/support" },
    { label: "Contact", href: "/contact" },
    { label: "Terms & Conditions", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Refund Policy", href: "/refund" },
    { label: "Disclaimer", href: "/disclaimer" },
  ],
  waMsg: "Hello, I would like to know about PrintShubh services.",
  waCta: "Chat on WhatsApp",
  rights: "All rights reserved.",
  builtFor: "For Maharashtra.",
  toolsTitle: "Free tools — PrintShubh.in",
  toolsBody:
    "Photo compressor, PDF tools and a resume builder — free, in your own browser.",
  toolsCta: "Open the tools",
  browse: "Collections & services",
  crossSite: "Free online tools:",
  directions: "Directions",
  hours: "Hours",
};

export function SiteFooter() {
  const t = tx;
  const pathname = usePathname();
  const isHome = pathname === "/";
  // Every page shows the same single "Since …" badge. The land-document trust
  // badges ("Based on official sources", "PDF on WhatsApp", "Not a government
  // body") and the per-route logic that chose them were removed in the Phase 1
  // rebrand cleanup.
  const badges = t.badges;
  const year = new Date().getFullYear();
  const waHref = buildWhatsAppUrl({ message: t.waMsg, campaign: "footer" });

  // The two link lists are built once: the homepage shows them in the grid
  // columns from `md` up and inside the phone <details>; other routes only
  // in the columns.
  const collectionLinks = (
    <ul className="space-y-1">
      {COLLECTIONS.map((c) => (
        <li key={c.key}>
          <Link
            href={`/collections/${c.slug}/`}
            className="flex min-h-[44px] items-center text-[14px] font-semibold text-slate-400 transition hover:text-white"
          >
            {c.shortTitle.en}
          </Link>
        </li>
      ))}
    </ul>
  );
  const serviceLinks = (
    <ul className="space-y-1">
      {t.services.map((l) => (
        <li key={l.href + l.label}>
          <Link
            href={l.href}
            className="flex min-h-[44px] items-center text-[14px] font-semibold text-slate-400 transition hover:text-white"
          >
            {l.label}
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <footer className="bg-brand-navy px-5 pb-10 pt-16 text-slate-300 sm:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Trust badges */}
        <ul className="mb-8 flex flex-wrap gap-2">
          {badges.map((b) => (
            <li
              key={b}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-[11.5px] font-bold text-slate-300 ring-1 ring-inset ring-white/10"
            >
              <ShieldCheck className="size-3.5 text-brand-gold" aria-hidden="true" />
              {b}
            </li>
          ))}
        </ul>

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.2fr_0.9fr_0.9fr_0.9fr_1fr]">
          {/* Brand */}
          <div>
            <div className="flex items-center">
              {/* Same official logo as the header (see SiteHeader). */}
              {/* eslint-disable-next-line @next/next/no-img-element -- fixed brand asset with three pre-rendered densities */}
              <img
                src="/brand/header-lockup.png"
                srcSet="/brand/header-lockup.png 1x, /brand/header-lockup@2x.png 2x, /brand/header-lockup@3x.png 3x"
                width={237}
                height={44}
                alt="PRINTSHUBH"
                loading="lazy"
                decoding="async"
                className="h-9 w-auto max-w-none shrink-0 rounded-md xl:h-11"
              />
            </div>
            <p className="mt-4 max-w-sm text-[14px] leading-7 text-slate-400">{t.tagline}</p>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={inquiryCtaClick}
              className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-green-600 px-4 text-sm font-black text-white shadow-sm transition hover:bg-green-500"
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              {t.waCta}
            </a>
          </div>

          {/* Homepage, phones only: collections and services in one fold. The
              same links are in the columns below from `md` up. */}
          {isHome && (
            <details className="group border-y border-white/10 md:hidden">
              <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between text-[11px] font-black uppercase tracking-[0.18em] text-slate-300 [&::-webkit-details-marker]:hidden">
                {t.browse}
                <ChevronDown
                  className="size-4 transition group-open:rotate-180 motion-reduce:transition-none"
                  aria-hidden="true"
                />
              </summary>
              <div className="grid gap-6 pb-4 pt-2">
                <div>
                  <h4 className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                    {t.collectionsTitle}
                  </h4>
                  {collectionLinks}
                </div>
                <div>
                  <h4 className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                    {t.servicesTitle}
                  </h4>
                  {serviceLinks}
                </div>
              </div>
            </details>
          )}

          {/* Collections — generated from lib/collections.ts, the single
              source of truth for the 7 premium-print routes, so this list
              can never drift from the pages it links to. */}
          <div className={isHome ? "hidden md:block" : undefined}>
            <h4 className="mb-4 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
              {t.collectionsTitle}
            </h4>
            {collectionLinks}
          </div>

          {/* Services */}
          <div className={isHome ? "hidden md:block" : undefined}>
            <h4 className="mb-4 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
              {t.servicesTitle}
            </h4>
            {serviceLinks}
          </div>

          {/* Useful */}
          <div>
            <h4 className="mb-4 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
              {t.usefulTitle}
            </h4>
            <ul className="space-y-1">
              {t.useful.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="flex min-h-[44px] items-center text-[14px] font-semibold text-slate-400 transition hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
              {t.contactTitle}
            </h4>
            <ul className="space-y-3.5 text-[14px]">
              <li className="flex items-start gap-2.5">
                <Phone className="mt-1 size-4 shrink-0 text-brand-gold" aria-hidden="true" />
                <a
                  href={`tel:${SITE_CONTACT.phoneTel}`}
                  className="inline-flex min-h-[44px] items-center font-bold text-slate-300 transition hover:text-white"
                >
                  {SITE_CONTACT.phone}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="mt-1 size-4 shrink-0 text-brand-gold" aria-hidden="true" />
                <a
                  href={`mailto:${SITE_CONTACT.email}`}
                  className="inline-flex min-h-[44px] items-center font-bold text-slate-300 transition hover:text-white"
                >
                  {SITE_CONTACT.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-1 size-4 shrink-0 text-brand-gold" aria-hidden="true" />
                {SHOP_ADDRESS ? (
                  <address className="not-italic font-semibold leading-6 text-slate-400">
                    {SHOP_ADDRESS.lines.en.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                    <a
                      href={SHOP_ADDRESS.directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex min-h-[44px] items-center gap-1.5 font-black text-brand-gold transition hover:text-brand-gold"
                    >
                      <Navigation className="size-3.5" aria-hidden="true" />
                      {t.directions}
                    </a>
                  </address>
                ) : (
                  <span className="font-semibold leading-6 text-slate-400">
                    {SITE_CONTACT.serviceArea_en}
                  </span>
                )}
              </li>
              {OPENING_HOURS && (
                <li className="flex items-start gap-2.5">
                  <Clock className="mt-1 size-4 shrink-0 text-brand-gold" aria-hidden="true" />
                  <div>
                    <p className="font-black text-slate-300">{t.hours}</p>
                    <dl className="mt-1 space-y-0.5 text-[13.5px] text-slate-400">
                      {OPENING_HOURS.rows.map((row) => (
                        <div key={row.days.en} className="flex gap-2">
                          <dt className="font-bold">{row.days.en}</dt>
                          <dd className="font-semibold">{row.time.en}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/*
          The free-tools site, linked from every page here.
          The two sites are the same business but were strangers to each
          other: nothing on .shop pointed at .in, which is one reason the
          newer site does not show up in search at all. A plain, followed
          link in a site-wide footer is the cheapest way to fix that, and
          it is useful to a reader too — someone who came for a 7/12 often
          also needs a photo compressed to 50KB.
        */}
        {!isHome && (
        <div className="mt-12 rounded-xl bg-white/5 p-5 ring-1 ring-inset ring-white/10 sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div>
            <p className="text-[14px] font-black text-slate-100">{t.toolsTitle}</p>
            <p className="mt-1 max-w-2xl text-[13.5px] leading-6 text-slate-400">{t.toolsBody}</p>
          </div>
          <a
            href="https://www.printshubh.in"
            className="mt-4 inline-flex h-11 shrink-0 items-center justify-center rounded-md bg-white/10 px-5 text-[13.5px] font-bold text-white ring-1 ring-inset ring-white/15 transition hover:bg-white/15 sm:mt-0"
          >
            {t.toolsCta}
          </a>
        </div>
        )}

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-[12px] font-semibold text-slate-500 sm:flex-row sm:items-center">
          <p>
            © {year} PRINTSHUBH · {t.rights}
          </p>
          {/* Homepage only: the one plain, followed link to the free-tools site
              (the larger block above is kept for every other route). */}
          {isHome && (
            <p className="flex flex-wrap items-center gap-x-1.5">
              {t.crossSite}
              <a
                href="https://www.printshubh.in"
                className="inline-flex min-h-[44px] items-center font-bold text-slate-300 underline decoration-white/30 underline-offset-4 transition hover:text-white"
              >
                printshubh.in
              </a>
            </p>
          )}
          <p>{t.builtFor}</p>
        </div>
      </div>
    </footer>
  );
}
