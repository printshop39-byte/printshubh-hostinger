"use client";

/**
 * CounterServicesRow — the quiet "Also at the counter" strip at the bottom of
 * the homepage.
 *
 * The homepage is about the premium print studio. The everyday counter
 * services (xerox, photo, online forms) and the free calculators are still
 * live and still linked from the header and the footer; this row is the one
 * homepage place that keeps them one tap away without competing with the
 * collections. Plain text links only: no cards, no icons, no promotion.
 *
 * The two ids are load-bearing. `/#services` (the "all services" link on the
 * service pages) and `/#tools` (header "Free Tools", footer, twice) point at
 * this page, and they used to land on ServicePillars and ToolsSection. Those
 * sections are no longer on the homepage, so the ids live here.
 */

import Link from "next/link";
import { useLang, type Lang } from "@/components/language-context";

type Item = { href: string; label: Record<Lang, string> };

const SERVICES: Item[] = [
  { href: "/printing-xerox", label: { mr: "प्रिंटिंग व झेरॉक्स", en: "Printing & Xerox" } },
  { href: "/photo-services", label: { mr: "फोटो सेवा", en: "Photo services" } },
  { href: "/digital-services", label: { mr: "ऑनलाइन सेवा", en: "Online services" } },
];

/* Same four destinations the old ToolsSection linked to (trailing slash
 * included, as it was there). */
const TOOLS: Item[] = [
  { href: "/home-loan-emi/", label: { mr: "गृहकर्ज EMI", en: "Home-loan EMI" } },
  { href: "/stamp-duty/", label: { mr: "मुद्रांक शुल्क", en: "Stamp duty" } },
  { href: "/ready-reckoner/", label: { mr: "रेडी रेकनर दर", en: "Ready Reckoner" } },
  { href: "/land-unit-converter/", label: { mr: "जमीन क्षेत्र रूपांतरक", en: "Land unit converter" } },
];

const t: Record<Lang, { heading: string; services: string; tools: string }> = {
  mr: { heading: "काउंटरवर आणखी", services: "सेवा", tools: "मोफत साधने" },
  en: { heading: "Also at the counter", services: "Services", tools: "Free tools" },
};

const LINK =
  "inline-flex min-h-[44px] items-center rounded-lg px-3 text-[14px] font-bold text-slate-700 underline decoration-brand-gold decoration-1 underline-offset-4 transition hover:text-brand-navy";

function LinkRow({ items, lang }: { items: Item[]; lang: Lang }) {
  return (
    <ul className="mt-1 flex flex-wrap gap-x-1">
      {items.map((item) => (
        <li key={item.href}>
          <Link href={item.href} className={LINK}>
            {item.label[lang]}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function CounterServicesRow() {
  const { lang } = useLang();
  const tx = t[lang];

  return (
    <section
      aria-labelledby="counter-services-heading"
      className="border-t border-brand-gold/30 bg-brand-cream px-5 py-10 sm:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <h2
          id="counter-services-heading"
          className="text-xs font-black uppercase tracking-[0.18em] text-brand-navy"
        >
          {tx.heading}
        </h2>

        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <div id="services" className="scroll-mt-20">
            <p className="text-[12px] font-bold text-slate-500">{tx.services}</p>
            <LinkRow items={SERVICES} lang={lang} />
          </div>
          <div id="tools" className="scroll-mt-20">
            <p className="text-[12px] font-bold text-slate-500">{tx.tools}</p>
            <LinkRow items={TOOLS} lang={lang} />
          </div>
        </div>
      </div>
    </section>
  );
}
