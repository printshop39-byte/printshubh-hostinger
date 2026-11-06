"use client";

import Link from "next/link";
import { ChevronRight, Home, MessageCircle } from "lucide-react";
import { useLang, type Lang } from "@/components/language-context";
import { PricingSection } from "@/components/pricing-section";
import { COLLECTIONS } from "@/lib/collections";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

const t: Record<Lang, { home: string; crumb: string; h1: string; intro: string }> = {
  mr: {
    home: "मुख्यपृष्ठ",
    crumb: "किंमत",
    h1: "PrintShubh सेवा किंमत — जमीन कागदपत्र दर",
    intro:
      "महाराष्ट्रातील 7/12, 8A, गाव नकाशा, DP/TP, मिळकत पत्रिका व जमीन अहवाल सेवांचे सुरुवातीचे दर. किंमत आधी कळेल — छुपी फी नाही.",
  },
  en: {
    home: "Home",
    crumb: "Pricing",
    h1: "PrintShubh Pricing — Land Document Service Rates",
    intro:
      "Starting prices for 7/12, 8A, village maps, DP/TP, property card and land-report services across Maharashtra. Know the price first — no hidden fees.",
  },
};

const collectionsHeading: Record<Lang, string> = {
  mr: "Print Collections — किंमत माप व डिझाइननुसार",
  en: "Print Collections — Priced by Size & Design",
};
const collectionsSub: Record<Lang, string> = {
  mr: "वॉलपेपर, कॅनव्हास, वॉल आर्ट, रेक्झिन/PU लेदरेट, साटीन फॅब्रिक, फ्रेम्ड प्रिंट्स आणि व्हिनाइल — या सात Collections साठी निश्चित किंमत आधीच दाखवलेली नाही, कारण ती तुमच्या मापावर, मटेरियलवर आणि डिझाइनवर अवलंबून असते. प्रत्येक Collection साठी WhatsApp वर मोफत कोट मागवा.",
  en: "Wallpaper, canvas, wall art, rexine/PU leatherette, satin fabric, framed prints and vinyl — these seven collections don't carry a fixed price upfront, since cost depends on your size, material and design. Ask for a free WhatsApp quote for any collection.",
};
const quoteCta: Record<Lang, string> = { mr: "कोट मागवा", en: "Get a quote" };

export function PricingPageBody() {
  const { lang } = useLang();
  const tx = t[lang];

  return (
    <>
      <nav className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Link href="/" className="inline-flex items-center gap-1 transition hover:text-blue-700">
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
        aria-label={collectionsHeading[lang]}
        className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9"
      >
        <h2 className="text-2xl font-black leading-tight text-slate-950 sm:text-3xl">
          {collectionsHeading[lang]}
        </h2>
        <p className="mt-2 max-w-2xl text-[15px] leading-7 text-slate-600">
          {collectionsSub[lang]}
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {COLLECTIONS.map((c) => {
            const href = buildWhatsAppUrl({
              message: c.whatsappMessage[lang],
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
                  {c.title[lang]}
                </span>
                <span className="inline-flex shrink-0 items-center gap-1.5 text-[13px] font-bold text-green-700">
                  <MessageCircle className="size-4" />
                  {quoteCta[lang]}
                </span>
              </a>
            );
          })}
        </div>
      </section>
    </>
  );
}
