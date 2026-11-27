"use client";

import Link from "next/link";
import { ChevronRight, Home, MessageCircle } from "lucide-react";
import { PricingSection } from "@/components/pricing-section";
import { COLLECTIONS } from "@/lib/collections";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

const t: { home: string; crumb: string; h1: string; intro: string } = {
  home: "Home",
  crumb: "Pricing",
  h1: "PrintShubh Pricing — Land Document Service Rates",
  intro:
    "Starting prices for 7/12, 8A, village maps, DP/TP, property card and land-report services across Maharashtra. Know the price first — no hidden fees.",
};

const collectionsHeading: string = "Print Collections — Priced by Size & Design";
const collectionsSub: string = "Wallpaper, canvas, wall art, rexine/PU leatherette, satin fabric, framed prints and vinyl — these seven collections don't carry a fixed price upfront, since cost depends on your size, material and design. Ask for a free WhatsApp quote for any collection.";
const quoteCta: string = "Get a quote";

export function PricingPageBody() {
  const tx = t;

  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Link href="/" className="inline-flex items-center gap-1 py-3.5 -my-3.5 transition hover:text-brand-navy">
          <Home className="size-3.5" />
          {tx.home}
        </Link>
        <ChevronRight className="size-3 text-slate-400" />
        <span className="text-slate-700">{tx.crumb}</span>
      </nav>

      <h1 className="text-3xl font-black leading-tight text-slate-950 sm:text-4xl">{tx.h1}</h1>
      <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">{tx.intro}</p>

      <div className="mt-6">
        <PricingSection />
      </div>

      <section
        aria-label={collectionsHeading}
        className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9"
      >
        <h2 className="text-2xl font-black leading-tight text-slate-950 sm:text-3xl">
          {collectionsHeading}
        </h2>
        <p className="mt-2 max-w-2xl text-[15px] leading-7 text-slate-600">
          {collectionsSub}
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {COLLECTIONS.map((c) => {
            const href = buildWhatsAppUrl({
              message: c.whatsappMessage.en,
              campaign: "pricing-collections",
              content: c.slug,
            });
            return (
              <a
                key={c.slug}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3.5 transition hover:border-green-300 hover:bg-green-50"
              >
                <span className="text-[15px] font-semibold text-slate-800">
                  {c.title.en}
                </span>
                <span className="inline-flex shrink-0 items-center gap-1.5 text-[13px] font-bold text-green-700">
                  <MessageCircle className="size-4" />
                  {quoteCta}
                </span>
              </a>
            );
          })}
        </div>
      </section>
    </>
  );
}
