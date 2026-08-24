"use client";

/**
 * SampleProcessSection — homepage trust block shown after the enquiry form.
 *
 * Purpose: reassure visitors before they enquire by showing (1) illustrative
 * "what you'll get" sample cards, (2) the 3-step enquiry process, and (3) the
 * key trust assurances. All copy is aligned with the FAQ / pricing / privacy /
 * disclaimer already on the site — no new claims.
 *
 * PRIVACY & IMPERSONATION SAFETY (important):
 *   The sample cards use an ABSTRACT, clearly-labelled placeholder built only
 *   from neutral blocks / generic map-like geometry plus a "नमुना / SAMPLE"
 *   watermark. There is NO real document, government emblem, seal, QR code,
 *   signature, real survey number, owner name, document ID, or official
 *   formatting. The placeholder visual is decorative (aria-hidden); the visible
 *   "नमुना — प्रत्यक्ष सरकारी नोंद नाही" ribbon conveys the same in text (not
 *   colour alone). No downloadable asset, no modal, no new route.
 */

import { useRef } from "react";
import Image from "next/image";
import { Check, FileText, Info, Map as MapIcon, MessageCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLang, type Lang } from "@/components/language-context";
import { useFunnelViewEvent } from "@/lib/analytics";
import { WORK_SAMPLES, hasWorkSamples } from "@/lib/shop-profile";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

const t: Record<
  Lang,
  {
    heading: string;
    sub: string;
    watermark: string;
    ribbon: string;
    askSample: string;
    cards: { title: string; desc: string }[];
    steps: string[];
    assurances: string[];
  }
> = {
  mr: {
    heading: "काम सुरू करण्यापूर्वी काय मिळेल ते पाहा",
    sub: "नमुना कागदपत्रे आणि सोपी ३-पायरी प्रक्रिया — पारदर्शक आणि सुरक्षित.",
    watermark: "नमुना",
    ribbon: "नमुना — प्रत्यक्ष सरकारी नोंद नाही",
    askSample: "WhatsApp वर नमुना मागवा",
    cards: [
      {
        title: "7/12 उतारा — नमुना",
        desc: "गट क्रमांक, क्षेत्र, पीक व हक्क नोंदी दाखवणारा नमुना.",
      },
      {
        title: "गाव नकाशा — नमुना",
        desc: "गाव सीमा आणि गट सीमारेषा दाखवणारा नमुना.",
      },
    ],
    steps: [
      "सेवा आणि गावाची माहिती द्या",
      "किंमत आणि उपलब्धता कळवली जाईल",
      "मंजुरीनंतर PDF WhatsApp वर पाठवली जाईल",
    ],
    assurances: [
      "किंमत आधी कळवली जाईल",
      "उपलब्धता तपासल्यानंतरच काम सुरू",
      "आम्ही सरकारी संकेतस्थळ नाही",
      "माहिती सुरक्षितपणे हाताळली जाते",
    ],
  },
  en: {
    heading: "See what you'll get before you start",
    sub: "Sample documents and a simple 3-step process — transparent and secure.",
    watermark: "SAMPLE",
    ribbon: "Sample — not an actual government record",
    askSample: "Ask for a sample on WhatsApp",
    cards: [
      {
        title: "7/12 Extract — sample",
        desc: "A sample showing survey number, area, crop and rights entries.",
      },
      {
        title: "Village map — sample",
        desc: "A sample showing village and plot boundaries.",
      },
    ],
    steps: [
      "Share the service and village details",
      "We share the price and availability",
      "After approval, the PDF is sent on WhatsApp",
    ],
    assurances: [
      "Price shared upfront",
      "Work starts only after an availability check",
      "We are not a government website",
      "Your information is handled securely",
    ],
  },
};

/* Language-neutral per-card metadata (icon + placeholder variant). */
const cardMeta: { icon: LucideIcon; variant: "doc" | "map" }[] = [
  { icon: FileText, variant: "doc" },
  { icon: MapIcon, variant: "map" },
];

/* Fixed Tailwind widths for the abstract "text rows" (no inline styles). */
const rowWidths = ["w-11/12", "w-3/4", "w-5/6", "w-2/3", "w-4/5", "w-1/2"];

/**
 * Purely decorative, abstract document/map placeholder with a SAMPLE / नमुना
 * watermark. Never resembles a real government form. aria-hidden — the visible
 * "नमुना …" ribbon carries the meaning for assistive tech.
 */
function SamplePlaceholder({
  variant,
  watermark,
}: {
  variant: "doc" | "map";
  watermark: string;
}) {
  return (
    <div
      aria-hidden="true"
      className="relative h-44 w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-50 sm:h-52"
    >
      {variant === "doc" ? (
        <div className="flex h-full flex-col gap-2 p-3">
          <div className="flex items-center gap-2">
            <div className="size-7 shrink-0 rounded bg-slate-200" />
            <div className="flex flex-1 flex-col gap-1">
              <div className="h-2 w-3/4 rounded bg-slate-200" />
              <div className="h-2 w-1/2 rounded bg-slate-200" />
            </div>
          </div>
          <div className="mt-1 flex flex-1 flex-col justify-center gap-1.5">
            {rowWidths.map((w, i) => (
              <div key={i} className={`h-2 rounded bg-slate-200 ${w}`} />
            ))}
          </div>
        </div>
      ) : (
        <svg
          viewBox="0 0 160 120"
          preserveAspectRatio="xMidYMid slice"
          className="h-full w-full"
        >
          <rect x="0" y="0" width="160" height="120" fill="#f1f5f9" />
          <path d="M18 24 L70 14 L82 52 L28 62 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
          <path d="M82 52 L70 14 L128 24 L134 66 Z" fill="#eef2f7" stroke="#94a3b8" strokeWidth="1" />
          <path d="M28 62 L82 52 L92 100 L38 108 Z" fill="#eef2f7" stroke="#94a3b8" strokeWidth="1" />
          <path d="M92 100 L82 52 L134 66 L142 108 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
          <path d="M8 74 Q80 66 152 82" fill="none" stroke="#cbd5e1" strokeWidth="2" />
        </svg>
      )}

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className="-rotate-12 select-none rounded-md border-2 border-blue-300/70 bg-white/40 px-4 py-1 text-lg font-black uppercase tracking-[0.2em] text-blue-500/70 backdrop-blur-[1px]">
          {watermark}
        </span>
      </div>
    </div>
  );
}

export function SampleProcessSection() {
  const { lang } = useLang();
  const tx = t[lang];

  // Fire "sample_section_view" once when this trust block scrolls ~50% into view.
  const sectionRef = useRef<HTMLElement>(null);
  useFunnelViewEvent(sectionRef, "sample_section_view", { lang, surface: "sample-process" });

  const sampleWaHref = buildWhatsAppUrl({
    message:
      lang === "mr"
        ? "नमस्कार PrintShubh, कृपया कागदपत्राचा नमुना पाठवाल का?"
        : "Hello PrintShubh, could you share a sample of the document?",
    campaign: "sample-process",
    content: "ask-sample",
  });

  return (
    <section
      ref={sectionRef}
      aria-labelledby="sample-process-heading"
      className="scroll-mt-20 bg-[#f8fbff] px-5 py-12 sm:px-8 lg:py-16"
    >
      <div className="mx-auto max-w-5xl">
        <h2
          id="sample-process-heading"
          className="text-2xl font-black leading-tight text-slate-950 sm:text-3xl"
        >
          {tx.heading}
        </h2>
        <p className="mt-2 max-w-2xl text-base leading-7 text-slate-600">{tx.sub}</p>

        {/* Sample previews.
         *
         * Two modes, and neither of them is a "coming soon" placeholder —
         * that used to be the weakest thing on this page, because it
         * promised proof and then withheld it.
         *
         *   WORK_SAMPLES filled in → the real, redacted previews render.
         *   WORK_SAMPLES empty     → the abstract labelled illustration
         *                            renders, and the card ends in a live
         *                            WhatsApp CTA instead of a dead status
         *                            chip, so the visitor can always ask.
         *
         * Every entry in WORK_SAMPLES is typed `redacted: true`, which is a
         * deliberate speed bump: you cannot add a sample without stating
         * that a human checked it carries no owner name, survey number or
         * document ID. */}
        {hasWorkSamples() ? (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {WORK_SAMPLES.map((sample) => (
              <li
                key={sample.src}
                className="flex flex-col rounded-2xl border border-blue-200 bg-white p-4 shadow-sm"
              >
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                  <Image
                    src={sample.src}
                    alt={sample.alt[lang]}
                    width={sample.width}
                    height={sample.height}
                    loading="lazy"
                    sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
                    className="h-auto w-full object-cover"
                  />
                </div>
                <p className="mt-3 inline-flex items-start gap-1.5 rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-[12px] font-bold leading-5 text-amber-900">
                  <Info className="mt-0.5 size-3.5 shrink-0 text-amber-700" aria-hidden="true" />
                  {tx.ribbon}
                </p>
                <h3 className="mt-3 text-base font-black text-slate-900">
                  {sample.label[lang]}
                </h3>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {tx.cards.map((card, i) => {
              const { icon: Icon, variant } = cardMeta[i];
              return (
                <article
                  key={card.title}
                  className="flex flex-col rounded-2xl border border-blue-200 bg-white p-4 shadow-sm"
                >
                  <SamplePlaceholder variant={variant} watermark={tx.watermark} />

                  {/* Text label — not colour alone; readable by screen readers */}
                  <p className="mt-3 inline-flex items-start gap-1.5 rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-[12px] font-bold leading-5 text-amber-900">
                    <Info className="mt-0.5 size-3.5 shrink-0 text-amber-700" aria-hidden="true" />
                    {tx.ribbon}
                  </p>

                  <h3 className="mt-3 flex items-center gap-2 text-base font-black text-slate-900">
                    <Icon className="size-4 shrink-0 text-blue-700" aria-hidden="true" />
                    {card.title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{card.desc}</p>

                  <a
                    href={sampleWaHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex min-h-[44px] w-fit items-center gap-1.5 rounded-md bg-green-600 px-4 py-2 text-xs font-black text-white transition hover:bg-green-700"
                  >
                    <MessageCircle className="size-3.5" aria-hidden="true" />
                    {tx.askSample}
                  </a>
                </article>
              );
            })}
          </div>
        )}

        {/* Three-step process — vertical on mobile, one row on desktop */}
        <ol className="mt-8 grid gap-3 sm:grid-cols-3">
          {tx.steps.map((step, i) => (
            <li
              key={step}
              className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5"
            >
              <span
                aria-hidden="true"
                className="grid size-8 shrink-0 place-items-center rounded-full bg-blue-600 text-sm font-black text-white"
              >
                {i + 1}
              </span>
              <span className="text-[14.5px] font-semibold leading-6 text-slate-700">
                {step}
              </span>
            </li>
          ))}
        </ol>

        {/* Assurance strip — 2×2 on mobile, single row on desktop */}
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {tx.assurances.map((a) => (
            <li
              key={a}
              className="flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50/60 px-3 py-2.5"
            >
              <Check className="mt-0.5 size-4 shrink-0 text-green-600" aria-hidden="true" />
              <span className="text-[13px] font-semibold leading-5 text-slate-700">{a}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
