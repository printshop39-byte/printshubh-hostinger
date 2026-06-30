"use client";

import {
  ArrowRight,
  Info,
  MapPinned,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import { useLang, type Lang } from "@/components/language-context";
import { HeroMotionBackground } from "@/components/hero-motion-background";
import { MaharashtraIllustration } from "@/components/maharashtra-illustration";
import { InquiryButton } from "@/components/inquiry-button";

/* ── Translations ── */
const t: Record<Lang, {
  badge: string;
  h1: string;
  subheadline: string;
  cta1: string;
  cta2: string;
  trustLine: string;
  trustItems: string[];
  whatsappMessage: string;
  cta1Href: string;
  govDisclaimer: string;
}> = {
  mr: {
    badge: "महाराष्ट्रासाठी जमीन कागदपत्र — डिजिटल सहाय्य सेवा",
    h1: "महाराष्ट्रातील 7/12, 8A, गाव नकाशा — WhatsApp वर जलद मिळवा",
    subheadline:
      "जिल्हा, तालुका, गाव आणि गट नंबर सांगा — 7/12, 8A, गाव नकाशा, फेरफार व जमीन अहवालाची PDF थेट WhatsApp वर मिळवा. किंमत आधी कळेल, छुपी फी नाही, बहुतेक सेवा त्याच दिवशी.",
    cta1: "सेवा निवडा",
    cta2: "WhatsApp वर विचारा",
    trustLine:
      "मागील ३० वर्षांपासून नकाशे, जमीन अभिलेख आणि सरकारी कागदपत्र प्रक्रियेचा अनुभव असलेल्या टीमकडून महाराष्ट्रासाठी विश्वासार्ह डिजिटल सेवा.",
    trustItems: [
      "सोपी प्रक्रिया",
      "WhatsApp वर PDF",
      "महाराष्ट्रभर डिजिटल सेवा",
      "अधिकृत स्रोतांवर आधारित डिजिटल सेवा",
    ],
    whatsappMessage: "मला जमीन कागदपत्र सेवेसाठी मदत हवी आहे",
    cta1Href: "#services",
    govDisclaimer:
      "PrintShubh हे सरकारी संकेतस्थळ नाही. आम्ही अधिकृत स्रोतांवर आधारित खाजगी सहाय्य सेवा प्रदान करतो.",
  },
  en: {
    badge: "Maharashtra Land Documents — Digital Assistance Service",
    h1: "Get 7/12, 8A & village maps for Maharashtra — fast, on WhatsApp",
    subheadline:
      "Share district, taluka, village and Gut number — get the 7/12, 8A, village map, mutation or land-report PDF straight on WhatsApp. Price upfront, no hidden fees, most services same day.",
    cta1: "Choose Service",
    cta2: "Ask on WhatsApp",
    trustLine:
      "Trusted digital service for Maharashtra, backed by 30 years of experience in maps, land records, and government document workflows.",
    trustItems: [
      "Simple Process",
      "PDF on WhatsApp",
      "Service Across Maharashtra",
      "Digital Service Based on Official Sources",
    ],
    whatsappMessage: "I need help with land document services",
    cta1Href: "#services",
    govDisclaimer:
      "PrintShubh is not a government website. We provide private assistance based on official/public sources.",
  },
};

export function HeroContent() {
  const { lang } = useLang();
  const tx = t[lang];

  /* WhatsApp CTA (logic preserved — only message text + UTM are tweaked). */
  const whatsappCta2Href = `https://wa.me/918625801907?text=${encodeURIComponent(
    tx.whatsappMessage,
  )}&utm_source=printshubh&utm_medium=whatsapp&utm_campaign=hero`;

  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden border-b border-slate-200 bg-[#f8fbff]">
      {/* Premium Welta.ai-inspired animated background */}
      <HeroMotionBackground />

      <div
        id="top"
        className="relative z-10 mx-auto grid w-full max-w-7xl gap-10 px-5 pb-14 pt-8 sm:px-8 lg:grid-cols-[0.98fr_1.02fr] lg:items-center lg:pb-22 lg:pt-14"
      >
        {/* Left — hero text: no data-reveal so LCP element renders immediately */}
        <div className="max-w-3xl">
          <p className="mb-5 inline-flex items-center gap-2 rounded-md border border-blue-200 bg-white px-3 py-2 text-sm font-bold text-blue-800 shadow-sm">
            <MapPinned className="size-4" />
            {tx.badge}
          </p>
          <h1 className="text-4xl font-black leading-[1.12] tracking-normal text-slate-950 sm:text-6xl lg:text-7xl">
            {tx.h1}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700 sm:text-xl">
            {tx.subheadline}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={tx.cta1Href}
              className="pointer-events-auto inline-flex h-[52px] items-center justify-center gap-2 rounded-md bg-blue-700 px-5 text-base font-bold text-white shadow-sm transition hover:bg-blue-800"
            >
              {tx.cta1}
              <ArrowRight className="size-4" />
            </a>
            <a
              href={whatsappCta2Href}
              className="pointer-events-auto inline-flex h-[52px] items-center justify-center gap-2 rounded-md bg-green-600 px-5 text-base font-bold text-white shadow-sm transition hover:bg-green-700"
            >
              <MessageCircle className="size-4" />
              {tx.cta2}
            </a>
          </div>

          {/* No-WhatsApp alternative — opens a short form that saves a lead */}
          <InquiryButton variant="link" className="pointer-events-auto mt-3 text-blue-800" />

          {/* Government-disclaimer strip — sits directly under the primary
              CTAs so visitors see it before scrolling to the live picker. */}
          <p
            data-reveal
            className="mt-4 flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-[13px] font-semibold leading-6 text-amber-900"
          >
            <Info className="mt-0.5 size-4 shrink-0 text-amber-700" />
            <span>{tx.govDisclaimer}</span>
          </p>

          <div
            data-reveal
            className="mt-4 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3.5 shadow-sm"
          >
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-blue-700" />
            <p className="text-[15px] font-semibold leading-7 text-blue-900">
              {tx.trustLine}
            </p>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {tx.trustItems.map((item) => (
              <div
                data-reveal
                key={item}
                className="flex min-h-16 items-center gap-3 rounded-md border border-slate-200 bg-white px-4 py-3 shadow-sm"
              >
                <ShieldCheck className="size-5 shrink-0 text-green-600" />
                <p className="text-base font-semibold leading-6 text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right — hero visual: now extracted into its own component so it
            can be reused on district landing pages without dragging the
            full hero copy along. */}
        <MaharashtraIllustration />
      </div>
    </section>
  );
}
