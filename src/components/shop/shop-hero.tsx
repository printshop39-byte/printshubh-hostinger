"use client";

/**
 * ShopHero — the first screen: who PRINTSHUBH is and what to do next.
 *
 * Premium Print & Visual Studio, in type. No photograph is used because none
 * of the studio's own work has been photographed yet (see collections.ts and
 * shop-profile.ts: no stock images, no fabricated samples). The composition
 * is typographic: a large H1, one line of promise, two actions, and a column
 * of three plain facts.
 *
 * Every fact in the right-hand column is checked against something real:
 *   - "1996": the Google Business Profile opening date (ESTABLISHED).
 *   - "07":   the number of collections in collections.ts (COLLECTIONS).
 *   - "CAD":  AutoCAD architectural and structural plan printing, as stated
 *             by the owner.
 *
 * The H1 text ("Premium Print & Visual Studio.") is unchanged on purpose: it
 * is the page's existing on-page heading and part of its SEO.
 *
 * Nothing here waits for an animation. `.ps-enter` is a lift only (no
 * opacity), so the text is readable from the first paint.
 */

import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { useLang, type Lang } from "@/components/language-context";
import { trackWhatsAppLead } from "@/components/meta-pixel";
import { trackFunnelEvent } from "@/lib/analytics";
import { COLLECTIONS } from "@/lib/collections";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { ESTABLISHED } from "@/lib/shop-profile";

type Fact = { kicker: string; value: string; note: string };

const copy: Record<
  Lang,
  {
    eyebrow: string;
    headlineStart: string;
    headlineAccent: string;
    tagline: string;
    support: string;
    primary: string;
    secondary: string;
    enquiry: string;
    facts: Fact[];
  }
> = {
  mr: {
    eyebrow: "PRINTSHUBH · कोल्हापूर",
    headlineStart: "प्रीमियम प्रिंट",
    headlineAccent: "व्हिज्युअल स्टुडिओ.",
    tagline: "तुमच्या भिंती. तुमचे प्लॅन. मोठ्या आकारात.",
    support:
      "इंटिरियरसाठी वॉलपेपर, कॅनव्हास, वॉल आर्ट, विनाइल आणि बरंच काही — तसेच AutoCAD चे आर्किटेक्चरल व स्ट्रक्चरल प्लॅन मोठ्या आकारात. फाइल WhatsApp वर पाठवा; काम सुरू करण्यापूर्वी किंमत कळवली जाते.",
    primary: "Collections पहा",
    secondary: "WhatsApp वर चौकशी",
    enquiry:
      "नमस्कार PrintShubh, मला कस्टम प्रिंटबद्दल चौकशी करायची आहे. काय हवं आहे / आकार: ",
    facts: [
      { kicker: "सुरू", value: ESTABLISHED.slice(0, 4), note: "शाहूपुरी, कोल्हापूर" },
      { kicker: "कलेक्शन्स", value: String(COLLECTIONS.length).padStart(2, "0"), note: "तुमच्या मापात" },
      { kicker: "CAD प्रिंट", value: "CAD", note: "AutoCAD प्लॅन" },
    ],
  },
  en: {
    eyebrow: "PRINTSHUBH · Kolhapur",
    headlineStart: "Premium Print",
    headlineAccent: "& Visual Studio.",
    tagline: "Your walls. Your plans. Printed large.",
    support:
      "Wallpaper, canvas, wall art, vinyl and more for interiors — and AutoCAD architectural and structural plans, printed large. Send your file on WhatsApp; the price is confirmed before work starts.",
    primary: "Explore Collections",
    secondary: "Custom print enquiry",
    enquiry:
      "Hello PrintShubh, I would like to enquire about a custom print. What I need / size: ",
    facts: [
      { kicker: "Since", value: ESTABLISHED.slice(0, 4), note: "Shahupuri, Kolhapur" },
      { kicker: "Collections", value: String(COLLECTIONS.length).padStart(2, "0"), note: "each in your size" },
      { kicker: "CAD prints", value: "CAD", note: "AutoCAD plans" },
    ],
  },
};

const PRIMARY =
  "ps-enter inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-brand-cream px-6 text-base font-black text-brand-navy transition hover:bg-white sm:w-auto motion-reduce:transform-none";
const SECONDARY =
  "ps-enter inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl border border-white/30 px-6 text-base font-black text-white transition hover:bg-white/10 sm:w-auto motion-reduce:transform-none";

export function ShopHero() {
  const { lang } = useLang();
  const tx = copy[lang];

  const enquiryHref = buildWhatsAppUrl({
    message: tx.enquiry,
    campaign: "hero-s1",
    content: "custom-print",
  });

  const track = (key: "collections" | "enquiry", whatsapp = false) => {
    if (whatsapp) trackWhatsAppLead();
    trackFunnelEvent("hero_intent_click", {
      lang,
      surface: "hero-s1",
      service_key: key,
    });
  };

  return (
    <section id="top" className="relative isolate overflow-hidden bg-brand-navy text-white">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-brand-gold/60" />

      <div className="relative mx-auto grid max-w-7xl gap-10 px-5 pb-12 pt-10 sm:px-8 sm:pb-16 sm:pt-14 lg:grid-cols-[1.3fr_.7fr] lg:gap-16 lg:py-24">
        <div>
          <p className="ps-enter flex items-center gap-3 text-[12px] font-black uppercase tracking-[0.2em] text-brand-gold-light">
            <span aria-hidden="true" className="h-px w-8 bg-brand-gold" />
            {tx.eyebrow}
          </p>

          <h1
            className="ps-enter mt-5 max-w-3xl text-[2.6rem] font-black leading-[1.05] tracking-[-0.035em] sm:text-6xl lg:text-[4.4rem]"
            style={{ "--ps-delay": "60ms" } as React.CSSProperties}
          >
            {tx.headlineStart}
            <span className="mt-1 block text-brand-gold">{tx.headlineAccent}</span>
          </h1>

          <p
            className="ps-enter mt-6 max-w-2xl text-balance text-2xl font-extrabold leading-snug text-white sm:text-3xl"
            style={{ "--ps-delay": "110ms" } as React.CSSProperties}
          >
            {tx.tagline}
          </p>

          <p
            className="ps-enter mt-4 max-w-xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8"
            style={{ "--ps-delay": "160ms" } as React.CSSProperties}
          >
            {tx.support}
          </p>

          <div
            className="mt-8 flex flex-col gap-3 sm:flex-row"
            style={{ "--ps-delay": "210ms" } as React.CSSProperties}
          >
            <Link href="/#collections" onClick={() => track("collections")} className={PRIMARY}>
              {tx.primary}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <a
              href={enquiryHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("enquiry", true)}
              className={SECONDARY}
            >
              <MessageCircle className="size-5 text-green-400" aria-hidden="true" />
              {tx.secondary}
            </a>
          </div>
        </div>

        <dl className="grid grid-cols-3 border-t border-white/15 pt-6 lg:grid-cols-1 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
          {tx.facts.map((fact, i) => (
            <div
              key={fact.kicker}
              className={`pr-3 lg:pr-0 ${i > 0 ? "lg:border-t lg:border-white/15" : ""} lg:py-7`}
            >
              <dt className="text-[11px] font-black uppercase tracking-[0.16em] text-brand-gold-light">
                {fact.kicker}
              </dt>
              <dd className="mt-1">
                <span className="block text-[2rem] font-black leading-none tracking-tight text-white sm:text-4xl lg:text-6xl">
                  {fact.value}
                </span>
                <span className="mt-2 block text-[12px] font-semibold leading-4 text-slate-300 sm:text-sm">
                  {fact.note}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
