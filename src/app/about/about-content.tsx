"use client";

/**
 * About PRINTSHUBH — Premium Print & Visual Studio.
 *
 * A printing-first company introduction. Everything stated here is something
 * the site already states elsewhere or the owner has confirmed: in business
 * since 1996 (the Google Business Profile opening date), the Shahupuri
 * counter, the seven print collections plus wall murals and custom visual
 * products, CAD / AutoCAD plan printing, an 11-colour large-format printing
 * system, print consultation, and the order process shown on the homepage.
 *
 * Deliberately NOT said here: any government-sector identity, land-record
 * service list, "private assistance service" statement, official-source
 * branding, printer make or model, prices, turnaround times, delivery, or
 * certifications. The legal notices about the land-document services live on
 * those service pages, /disclaimer, /terms and the footer.
 *
 * Address and hours come from shop-profile.ts (the single source of truth).
 * The public site is English-only.
 */

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import {
  LegalList,
  LegalPageShell,
  LegalSection,
} from "@/components/legal-page-shell";
import { SITE_CONTACT } from "@/components/site-footer";
import { OPENING_HOURS, SHOP_ADDRESS } from "@/lib/shop-profile";

type Copy = {
  intro: string;
  trustLine: string;
  whoHeading: string;
  whoBody: string;
  printHeading: string;
  printItems: string[];
  cadHeading: string;
  cadBody: string;
  orderHeading: string;
  orderItems: string[];
  studioHeading: string;
  studioBody: string;
  counterHeading: string;
  counterLead: string;
  counterLinks: { href: string; label: string }[];
  visitHeading: string;
  visitLead: string;
  contactLabel: string;
};

const copy: Copy = {
  intro:
    "PRINTSHUBH — Premium Print & Visual Studio. A print studio in Shahupuri, Kolhapur, serving customers since 1996.",
  trustLine:
    "Premium large-format printing for homes, offices and shops. Serving Kolhapur since 1996.",
  whoHeading: "Who we are",
  whoBody:
    "PRINTSHUBH is a print and visual studio in Shahupuri, Kolhapur. We have served customers since 1996, and today we focus on premium large-format printing for interiors and on CAD plan printing for architects, engineers and builders.",
  printHeading: "What we print",
  printItems: [
    "Wallpaper and wall murals",
    "Canvas prints and wall art",
    "PU leatherette / rexine printing",
    "Satin fabric printing",
    "Framed prints",
    "Vinyl printing",
    "Custom visual products, made to your size and design",
  ],
  cadHeading: "CAD and technical plotting",
  cadBody:
    "AutoCAD architectural and structural plans, printed large. Send your file, the size and the number of copies on WhatsApp, and we confirm what works before any work starts.",
  orderHeading: "How an order works",
  orderItems: [
    "Choose a collection, or tell us what you need.",
    "Send your file, size and copies on WhatsApp.",
    "Size, material and price are confirmed before work starts.",
    "Your order is printed at the studio.",
    "When it is ready, collect it from the studio in Kolhapur.",
  ],
  studioHeading: "Our studio",
  studioBody:
    "Our interior prints are made on an 11-colour, large-format printing system. Print consultation is available: we help you choose the size and material that suit your space.",
  counterHeading: "Also at the counter",
  counterLead:
    "Print services and photo services are available at our studio.",
  counterLinks: [
    { href: "/printing-xerox", label: "Prints" },
    { href: "/photo-services", label: "Photo Services" },
  ],
  visitHeading: "Visit or message us",
  visitLead: "Send your file on WhatsApp for a quote, or visit the studio:",
  contactLabel: "Contact us",
};

export function AboutContent() {
  return (
    <LegalPageShell
      title="About PRINTSHUBH"
      breadcrumb="About Us"
      intro={copy.intro}
      updatedAt="November 2026"
      showServiceDisclaimer={false}
      content={<AboutBody />}
    />
  );
}

function AboutBody() {
  const c = copy;

  return (
    <>
      <div className="mb-6 flex items-start gap-3 rounded-lg border border-brand-gold-light bg-brand-cream p-4 text-[14px] font-semibold leading-7 text-brand-navy">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-brand-navy" />
        <p>{c.trustLine}</p>
      </div>

      <LegalSection heading={c.whoHeading}>
        <p>{c.whoBody}</p>
      </LegalSection>

      <LegalSection heading={c.printHeading}>
        <LegalList items={c.printItems} />
      </LegalSection>

      <LegalSection heading={c.cadHeading}>
        <p>{c.cadBody}</p>
      </LegalSection>

      <LegalSection heading={c.orderHeading}>
        <LegalList items={c.orderItems} />
      </LegalSection>

      <LegalSection heading={c.studioHeading}>
        <p>{c.studioBody}</p>
      </LegalSection>

      <LegalSection heading={c.counterHeading}>
        <p>{c.counterLead}</p>
        <ul className="flex flex-wrap gap-x-5">
          {c.counterLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="inline-flex min-h-[44px] items-center font-bold text-brand-navy underline decoration-brand-gold underline-offset-4 hover:text-brand-navy-dark"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </LegalSection>

      <LegalSection heading={c.visitHeading}>
        <p>{c.visitLead}</p>
        {SHOP_ADDRESS ? (
          <p>
            {SHOP_ADDRESS.lines.en.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
        ) : null}
        {OPENING_HOURS ? (
          <p>
            {OPENING_HOURS.rows.map((row) => (
              <span key={row.days.en} className="block">
                {row.days.en}: {row.time.en}
              </span>
            ))}
          </p>
        ) : null}
        <p>
          <a
            href={`tel:${SITE_CONTACT.phoneTel}`}
            className="inline-flex min-h-[44px] items-center font-bold text-brand-navy underline decoration-brand-gold underline-offset-4 hover:text-brand-navy-dark"
          >
            {SITE_CONTACT.phone}
          </a>
          {" · "}
          <Link
            href="/contact"
            className="inline-flex min-h-[44px] items-center font-bold text-brand-navy underline decoration-brand-gold underline-offset-4 hover:text-brand-navy-dark"
          >
            {c.contactLabel}
          </Link>
        </p>
      </LegalSection>
    </>
  );
}
