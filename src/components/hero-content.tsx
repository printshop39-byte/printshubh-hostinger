"use client";

import {
  ArrowRight,
  Info,
  MapPinned,
  MessageCircle,
} from "lucide-react";
import { useLang, type Lang } from "@/components/language-context";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { trackWhatsAppLead } from "@/components/meta-pixel";
import { trackFunnelEvent } from "@/lib/analytics";

/* ── Translations ── */
const t: Record<Lang, {
  badge: string;
  h1: string;
  subheadline: string;
  cta1: string;
  cta2: string;
  whatsappMessage: string;
  cta1Href: string;
  govDisclaimer: string;
}> = {
  mr: {
    badge: "महाराष्ट्रासाठी जमीन कागदपत्र — डिजिटल सहाय्य सेवा",
    h1: "7/12, 8A व गाव नकाशा — WhatsApp वर",
    subheadline:
      "जिल्हा, तालुका व गाव निवडा आणि कागदपत्राची PDF WhatsApp वर मागवा. किंमत आधी कळेल.",
    cta1: "सेवा निवडा",
    cta2: "WhatsApp वर विचारा",
    whatsappMessage: "मला जमीन कागदपत्र सेवेसाठी मदत हवी आहे",
    cta1Href: "#unified-form",
    govDisclaimer:
      "PrintShubh हे सरकारी संकेतस्थळ नाही. आम्ही अधिकृत स्रोतांवर आधारित खाजगी सहाय्य सेवा प्रदान करतो.",
  },
  en: {
    badge: "Maharashtra Land Documents — Digital Assistance Service",
    h1: "7/12, 8A & village maps — on WhatsApp",
    subheadline:
      "Pick district, taluka and village, and request the document PDF on WhatsApp. Know the price first.",
    cta1: "Choose Service",
    cta2: "Ask on WhatsApp",
    whatsappMessage: "I need help with land document services",
    cta1Href: "#unified-form",
    govDisclaimer:
      "PrintShubh is not a government website. We provide private assistance based on official/public sources.",
  },
};

export function HeroContent() {
  const { lang } = useLang();
  const tx = t[lang];

  /* WhatsApp CTA — canonical helper keeps the number + UTM consistent. */
  const whatsappCta2Href = buildWhatsAppUrl({
    message: tx.whatsappMessage,
    campaign: "hero",
  });

  return (
    <section className="relative isolate overflow-hidden border-b border-slate-200 bg-[#f8fbff]">
      <div
        id="top"
        className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-6 pt-6 sm:px-8 lg:pb-8 lg:pt-10"
      >
        {/* Hero text: no data-reveal so the LCP element renders immediately */}
        <div className="max-w-3xl">
          <p className="mb-4 inline-flex items-center gap-2 rounded-md border border-blue-200 bg-white px-3 py-2 text-sm font-bold text-blue-800 shadow-sm">
            <MapPinned className="size-4" />
            {tx.badge}
          </p>
          <h1 className="text-3xl font-black leading-[1.1] tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
            {tx.h1}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-700 sm:text-xl">
            {tx.subheadline}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              href={tx.cta1Href}
              onClick={() =>
                trackFunnelEvent("hero_primary_cta_click", { lang, surface: "hero" })
              }
              className="pointer-events-auto inline-flex h-[52px] items-center justify-center gap-2 rounded-md bg-blue-700 px-5 text-base font-bold text-white shadow-sm transition hover:bg-blue-800"
            >
              {tx.cta1}
              <ArrowRight className="size-4" />
            </a>
            <a
              href={whatsappCta2Href}
              onClick={() => {
                // Meta "Contact" — matches every other direct WhatsApp CTA
                // (map-promo, bottom-nav, floating support); closes the hero gap.
                trackWhatsAppLead();
                trackFunnelEvent("hero_whatsapp_click", { lang, surface: "hero" });
              }}
              className="pointer-events-auto inline-flex h-[52px] items-center justify-center gap-2 rounded-md bg-green-600 px-5 text-base font-bold text-white shadow-sm transition hover:bg-green-700"
            >
              <MessageCircle className="size-4" />
              {tx.cta2}
            </a>
          </div>

          {/* Government-disclaimer strip — kept compact, directly under the
              primary CTAs so visitors see it before scrolling to the live
              picker. Trust signals (experience, coverage) live in TrustBar. */}
          <p
            data-reveal
            className="mt-4 flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-[13px] font-semibold leading-6 text-amber-900"
          >
            <Info className="mt-0.5 size-4 shrink-0 text-amber-700" />
            <span>{tx.govDisclaimer}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
