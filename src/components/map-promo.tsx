"use client";

/**
 * MapPromo — homepage promotional strip for the official map services
 * (DP / TPS / Regional Plan), priced from ₹200, delivered as PDF on WhatsApp.
 * Sits above the services grid. Bilingual via the shared language toggle.
 *
 * The WhatsApp CTA carries a UTM + fires the Meta "Contact" event (no-op
 * until the pixel is enabled), and there's a secondary link to the full
 * DP-map page for SEO / deeper info.
 */

import Link from "next/link";
import { ArrowRight, Globe2, LayoutGrid, MapPinned, MessageCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLang, type Lang } from "@/components/language-context";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { trackWhatsAppLead } from "@/components/meta-pixel";
import { trackFunnelEvent } from "@/lib/analytics";

const WHATSAPP_MESSAGE: Record<Lang, string> = {
  mr: "नमस्कार PrintShubh, मला नकाशा हवा आहे (DP / TPS / Regional Plan). गाव/शहर: ",
  en: "Hello PrintShubh, I need a map (DP / TPS / Regional Plan). Village/City: ",
};

const t: Record<
  Lang,
  {
    eyebrow: string;
    heading: string;
    priceLead: string;
    price: string;
    items: { icon: LucideIcon; title: string; sub: string }[];
    metaLine: string;
    cta: string;
    subCta: string;
    moreLink: string;
  }
> = {
  mr: {
    eyebrow: "नकाशा सेवा",
    heading: "महाराष्ट्रातील DP, TP आणि प्रादेशिक योजना नकाशे",
    priceLead: "फक्त",
    price: "₹200 पासून",
    items: [
      { icon: LayoutGrid, title: "विकास योजना (DP) नकाशे", sub: "Development Plan" },
      { icon: MapPinned, title: "टाउन प्लॅनिंग (TPS) नकाशे", sub: "Town Planning Scheme" },
      { icon: Globe2, title: "प्रादेशिक योजना नकाशे", sub: "Regional Plan" },
    ],
    metaLine: "अधिकृत संदर्भ नकाशे • PDF स्वरूपात • WhatsApp वर सेवा",
    cta: "WhatsApp वर नकाशा मागवा",
    subCta: "गाव नकाशा ₹300 पासून उपलब्ध. तुमच्या गाव, शहर किंवा जमिनीचा नकाशा आजच मागवा.",
    moreLink: "DP / TP नकाशाबद्दल अधिक वाचा",
  },
  en: {
    eyebrow: "Map Services",
    heading: "DP, TP and Regional Plan maps for Maharashtra",
    priceLead: "From just",
    price: "₹200",
    items: [
      { icon: LayoutGrid, title: "Development Plan (DP) maps", sub: "विकास योजना" },
      { icon: MapPinned, title: "Town Planning (TPS) maps", sub: "टाउन प्लॅनिंग" },
      { icon: Globe2, title: "Regional Plan maps", sub: "प्रादेशिक योजना" },
    ],
    metaLine: "Official reference maps • PDF format • served on WhatsApp",
    cta: "Request a map on WhatsApp",
    subCta: "Village Maps available from ₹300. Get the map for your village, city or land today.",
    moreLink: "Read more about DP / TP maps",
  },
};

export function MapPromo() {
  const { lang } = useLang();
  const tx = t[lang];

  const waHref = buildWhatsAppUrl({ message: WHATSAPP_MESSAGE[lang], campaign: "map-promo" });

  return (
    <section className="px-5 py-12 sm:px-8 lg:py-16">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-700 via-blue-700 to-blue-800 px-6 py-10 text-white shadow-sm sm:px-10 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          {/* Left — copy + CTA */}
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-blue-50">
              <MapPinned className="size-3.5" />
              {tx.eyebrow}
            </p>
            <h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">
              {tx.heading}
            </h2>
            <p className="mt-3 flex items-baseline gap-2">
              <span className="text-base font-semibold text-blue-100">{tx.priceLead}</span>
              <span className="text-3xl font-black text-green-300">{tx.price}</span>
            </p>
            <p className="mt-4 text-sm font-semibold text-blue-100">{tx.metaLine}</p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  trackWhatsAppLead();
                  trackFunnelEvent("map_promo_whatsapp_click", { lang, surface: "map-promo" });
                }}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-green-500 px-5 text-sm font-black text-white shadow-sm transition hover:bg-green-600"
              >
                <MessageCircle className="size-4" />
                {tx.cta}
              </a>
              <Link
                href="/dp-map-maharashtra/"
                className="inline-flex h-12 items-center justify-center gap-1.5 rounded-md border border-white/40 px-4 text-sm font-bold text-white transition hover:bg-white/10"
              >
                {tx.moreLink}
                <ArrowRight className="size-4" />
              </Link>
            </div>
            <p className="mt-3 text-sm text-blue-100">{tx.subCta}</p>
          </div>

          {/* Right — service cards */}
          <ul className="grid gap-3">
            {tx.items.map((it) => {
              const Icon = it.icon;
              return (
                <li
                  key={it.title}
                  className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3.5 ring-1 ring-white/15"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-white/15 text-green-200">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-[15px] font-bold leading-tight">{it.title}</p>
                    <p className="text-xs font-semibold text-blue-200">{it.sub}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
