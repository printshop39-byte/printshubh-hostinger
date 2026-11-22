"use client";

/**
 * CounterServicesRow — the quiet "Also at the counter" strip at the bottom of
 * the homepage.
 *
 * The homepage is about the premium print studio. The everyday counter
 * services (xerox, photo, online forms) are still live and still linked from
 * the header and the footer; this row is the one homepage place that keeps
 * them one tap away without competing with the collections. Plain text links
 * only: no cards, no icons, no promotion.
 *
 * The `services` id is load-bearing: `/#services` (the "all services" link on
 * the service pages) points at it. The old "Free tools" column and its
 * `#tools` anchor (home-loan / stamp-duty / ready-reckoner / land-unit tools)
 * were removed in the Phase 1 rebrand cleanup, together with every link to
 * that anchor.
 */

import Link from "next/link";

type Item = { href: string; label: string };

const SERVICES: Item[] = [
  { href: "/printing-xerox", label: "Printing & Xerox" },
  { href: "/photo-services", label: "Photo services" },
  { href: "/digital-services", label: "Online services" },
];

const t: { heading: string; services: string } = { heading: "Also at the counter", services: "Services" };

const LINK =
  "inline-flex min-h-[44px] items-center rounded-lg px-3 text-[14px] font-bold text-slate-700 underline decoration-brand-gold decoration-1 underline-offset-4 transition hover:text-brand-navy";

function LinkRow({ items }: { items: Item[] }) {
  return (
    <ul className="mt-1 flex flex-wrap gap-x-1">
      {items.map((item) => (
        <li key={item.href}>
          <Link href={item.href} className={LINK}>
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function CounterServicesRow() {
  const tx = t;

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

        <div className="mt-4">
          <div id="services" className="scroll-mt-20">
            <p className="text-[12px] font-bold text-slate-500">{tx.services}</p>
            <LinkRow items={SERVICES} />
          </div>
        </div>
      </div>
    </section>
  );
}
