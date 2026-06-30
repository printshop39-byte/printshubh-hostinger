"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { useLang, type Lang } from "@/components/language-context";
import { PricingSection } from "@/components/pricing-section";

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
    </>
  );
}
