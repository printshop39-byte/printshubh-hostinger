"use client";

/**
 * ShopServicePage — shared shell for the three counter-service routes
 * (/printing-xerox/, /photo-services/, /digital-services/).
 *
 * These are new pages. They do not replace, redirect or compete with any of
 * the existing land-document routes — those keep their URLs, their metadata
 * and their content exactly as they were. This shell only adds surface for
 * the half of the business the site never described.
 *
 * NO PRICES. Counter pricing depends on paper, size, colour and quantity,
 * and has never been published, so every card routes to WhatsApp for a
 * quote instead of printing a number nobody has confirmed. Published
 * land-document prices continue to live in src/lib/pricing-data.ts.
 */

import Link from "next/link";
import { ChevronRight, Home, MessageCircle } from "lucide-react";
import { useLang, type Lang } from "@/components/language-context";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppSupportButton } from "@/components/whatsapp-support-button";
import { serviceGroup, type ServiceGroupKey } from "@/lib/shop-services";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { trackWhatsAppLead } from "@/components/meta-pixel";
import { ShopGallery } from "@/components/shop/shop-gallery";
import { VisitShop } from "@/components/shop/visit-shop";
import { Magnetic, Reveal, Stagger, StaggerItem } from "@/components/shop/motion";

const chrome: Record<
  Lang,
  { home: string; services: string; whatIs: string; askPrice: string; faqHeading: string }
> = {
  mr: {
    home: "मुख्यपृष्ठ",
    services: "सेवा",
    whatIs: "काय काय मिळेल",
    askPrice: "WhatsApp वर किंमत विचारा",
    faqHeading: "नेहमी विचारले जाणारे प्रश्न",
  },
  en: {
    home: "Home",
    services: "Services",
    whatIs: "What you can get",
    askPrice: "Ask the price on WhatsApp",
    faqHeading: "Frequently asked questions",
  },
};

export interface ShopServicePageProps {
  groupKey: ServiceGroupKey;
  /** H1. Marathi-first, matching the page metadata. */
  title: Record<Lang, string>;
  /** Lead paragraph under the H1 — two or three sentences, no claims. */
  intro: Record<Lang, string>;
  /** Short "how it works" steps, in order. */
  steps: Record<Lang, string[]>;
  /** FAQ shown on-page. The same pairs feed FAQPage JSON-LD from the
   *  server component, so the two never drift apart. */
  faq: Record<Lang, { q: string; a: string }[]>;
}

export function ShopServicePage({
  groupKey,
  title,
  intro,
  steps,
  faq,
}: ShopServicePageProps) {
  const { lang } = useLang();
  const c = chrome[lang];
  const group = serviceGroup(groupKey);

  const waHref = buildWhatsAppUrl({
    message: group.whatsapp[lang],
    campaign: groupKey,
  });

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen overflow-x-hidden bg-white text-slate-900">
        {/* ── Header block ── */}
        <section className="ps-hero-wash border-b border-slate-200 px-5 pb-14 pt-10 sm:px-8 lg:pb-20 lg:pt-14">
          <div className="mx-auto max-w-5xl">
            <nav
              aria-label={c.services}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500"
            >
              <Link
                href="/"
                className="inline-flex items-center gap-1 transition hover:text-blue-700"
              >
                <Home className="size-3.5" aria-hidden="true" />
                {c.home}
              </Link>
              <ChevronRight className="size-3 text-slate-400" aria-hidden="true" />
              <Link href="/#services" className="transition hover:text-blue-700">
                {c.services}
              </Link>
              <ChevronRight className="size-3 text-slate-400" aria-hidden="true" />
              <span className="text-slate-700">{group.title[lang]}</span>
            </nav>

            <p className="ps-enter mt-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3.5 py-1.5 text-[12.5px] font-black text-blue-800 shadow-sm">
              <span aria-hidden="true">{group.emoji}</span>
              {group.title[lang]}
            </p>

            <h1
              className="ps-enter mt-5 max-w-3xl text-4xl font-black leading-[1.06] tracking-[-0.02em] text-slate-950 sm:text-5xl"
              style={{ "--ps-delay": "70ms" } as React.CSSProperties}
            >
              {title[lang]}
            </h1>

            <p
              className="ps-enter mt-5 max-w-2xl text-lg leading-8 text-slate-700"
              style={{ "--ps-delay": "140ms" } as React.CSSProperties}
            >
              {intro[lang]}
            </p>

            <div
              className="ps-enter mt-7"
              style={{ "--ps-delay": "200ms" } as React.CSSProperties}
            >
              <Magnetic>
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackWhatsAppLead()}
                  className="inline-flex h-[54px] items-center justify-center gap-2.5 rounded-xl bg-green-600 px-6 text-base font-black text-white shadow-lg shadow-green-600/25 transition hover:bg-green-700"
                >
                  <MessageCircle className="size-5" aria-hidden="true" />
                  {c.askPrice}
                </a>
              </Magnetic>
            </div>
          </div>
        </section>

        {/* ── What you get ── */}
        <section className="px-5 py-16 sm:px-8 lg:py-20">
          <div className="mx-auto max-w-5xl">
            <Reveal>
              <h2 className="text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-4xl">
                {c.whatIs}
              </h2>
            </Reveal>

            <Stagger as="ul" className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((item) => (
                <StaggerItem as="li" key={item.label.en}>
                  <div className="h-full rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition hover:border-blue-300">
                    {item.href ? (
                      <Link
                        href={item.href}
                        className="text-[15.5px] font-black text-slate-900 underline-offset-4 transition hover:text-blue-700 hover:underline"
                      >
                        {item.label[lang]}
                      </Link>
                    ) : (
                      <p className="text-[15.5px] font-black text-slate-900">
                        {item.label[lang]}
                      </p>
                    )}
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="border-y border-slate-200 bg-[#f6faff] px-5 py-16 sm:px-8 lg:py-20">
          <div className="mx-auto max-w-5xl">
            <Stagger as="ol" className="grid gap-3 sm:grid-cols-3">
              {steps[lang].map((step, i) => (
                <StaggerItem as="li" key={step}>
                  <div className="flex h-full items-start gap-3.5 rounded-2xl border border-slate-200 bg-white px-5 py-5">
                    <span
                      aria-hidden="true"
                      className="grid size-9 shrink-0 place-items-center rounded-full bg-blue-600 text-sm font-black text-white"
                    >
                      {i + 1}
                    </span>
                    <span className="text-[15px] font-bold leading-6 text-slate-700">
                      {step}
                    </span>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* ── FAQ (mirrored into FAQPage JSON-LD by the page component) ── */}
        <section className="px-5 py-16 sm:px-8 lg:py-20">
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <h2 className="text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-4xl">
                {c.faqHeading}
              </h2>
            </Reveal>
            <dl className="mt-8 divide-y divide-slate-200 border-y border-slate-200">
              {faq[lang].map((pair) => (
                <div key={pair.q} className="py-5">
                  <dt className="text-[16.5px] font-black text-slate-950">{pair.q}</dt>
                  <dd className="mt-2 text-[15px] leading-7 text-slate-600">{pair.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Real shop photos and the address block — both self-hide until the
            underlying data exists, so these pages degrade cleanly. */}
        <ShopGallery />
        <VisitShop />
      </main>
      <WhatsAppSupportButton />
      <SiteFooter />
    </>
  );
}
