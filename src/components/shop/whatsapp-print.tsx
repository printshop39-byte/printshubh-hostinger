"use client";

/**
 * WhatsAppPrint — the headline conversion block: send a file, collect the
 * print. Four steps, one button.
 *
 * It is deliberately the most visually assertive section on the page (dark
 * panel against an otherwise white site) because it is the single action we
 * most want a visitor to take, and because it is the thing a local print
 * shop can offer that a website alone cannot.
 *
 * The step connectors point down on mobile and right on desktop; they are
 * aria-hidden because the <ol> already conveys the order.
 */

import { ArrowRight, CheckCircle2, FileText, MessageCircle, Printer } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLang, type Lang } from "@/components/language-context";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { trackWhatsAppLead } from "@/components/meta-pixel";
import { Magnetic, Reveal, Stagger, StaggerItem } from "@/components/shop/motion";

const t: Record<
  Lang,
  {
    eyebrow: string;
    heading: string;
    sub: string;
    steps: { title: string; note: string }[];
    cta: string;
    fineprint: string;
    whatsapp: string;
  }
> = {
  mr: {
    eyebrow: "WhatsApp प्रिंटिंग",
    heading: "PDF पाठवा. Print तयार.",
    sub: "घरून PDF किंवा फोटो पाठवा आणि दुकानातून तयार प्रिंट घ्या.",
    steps: [
      { title: "PDF / फोटो", note: "फाइल तयार ठेवा" },
      { title: "WhatsApp", note: "आम्हाला पाठवा" },
      { title: "PRINTSHUBH", note: "किंमत कळवून प्रिंट" },
      { title: "तयार", note: "दुकानातून घेऊन जा" },
    ],
    cta: "WhatsApp वर फाइल पाठवा",
    fineprint:
      "काम सुरू करण्यापूर्वी किंमत आणि वेळ WhatsApp वरच कळवली जाते — छुपी फी नाही.",
    whatsapp:
      "नमस्कार PrintShubh, मी प्रिंटसाठी फाइल पाठवत आहे. प्रती / आकार / रंग: ",
  },
  en: {
    eyebrow: "WhatsApp printing",
    heading: "Send the PDF. Collect the print.",
    sub: "Send a PDF or photo from home and pick the finished print up at the counter.",
    steps: [
      { title: "PDF / photo", note: "have the file ready" },
      { title: "WhatsApp", note: "send it to us" },
      { title: "PRINTSHUBH", note: "we quote, then print" },
      { title: "Ready", note: "collect at the shop" },
    ],
    cta: "Send your file on WhatsApp",
    fineprint:
      "Price and turnaround are confirmed on WhatsApp before any work starts — no hidden fees.",
    whatsapp:
      "Hello PrintShubh, I am sending a file for printing. Copies / size / colour: ",
  },
};

const stepIcons: LucideIcon[] = [FileText, MessageCircle, Printer, CheckCircle2];

export function WhatsAppPrint() {
  const { lang } = useLang();
  const tx = t[lang];

  const waHref = buildWhatsAppUrl({
    message: tx.whatsapp,
    campaign: "whatsapp-print",
  });

  return (
    <section className="px-5 py-16 sm:px-8 lg:py-24">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[28px] bg-slate-950 px-6 py-14 text-white shadow-2xl sm:px-10 lg:px-14 lg:py-20">
        {/* Brand wash — pure CSS, no image payload. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_15%_0%,rgba(37,99,235,0.35),transparent_65%),radial-gradient(50%_60%_at_92%_100%,rgba(22,163,74,0.22),transparent_65%)]"
        />

        <div className="relative">
          <Reveal>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[11.5px] font-black uppercase tracking-[0.18em] text-blue-100 ring-1 ring-inset ring-white/15">
              <MessageCircle className="size-3.5" aria-hidden="true" />
              {tx.eyebrow}
            </p>
            <h2 className="mt-5 max-w-2xl text-3xl font-black leading-[1.08] tracking-tight sm:text-5xl">
              {tx.heading}
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-8 text-slate-300">{tx.sub}</p>
          </Reveal>

          <Stagger
            as="ol"
            className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4"
          >
            {tx.steps.map((step, i) => {
              const Icon = stepIcons[i];
              const isLast = i === tx.steps.length - 1;

              return (
                <StaggerItem as="li" key={step.title}>
                  <div className="relative h-full rounded-2xl bg-white/[0.07] p-5 ring-1 ring-inset ring-white/10 backdrop-blur-sm">
                    <span
                      aria-hidden="true"
                      className={`grid size-11 place-items-center rounded-xl ${
                        isLast ? "bg-green-500/20 text-green-300" : "bg-blue-500/20 text-blue-200"
                      }`}
                    >
                      <Icon className="size-5" />
                    </span>
                    <p className="mt-4 text-lg font-black leading-tight">{step.title}</p>
                    <p className="mt-1 text-[13.5px] font-semibold text-slate-400">
                      {step.note}
                    </p>

                    {/* Connector: down between stacked cards, right between
                        cards in a row. Decorative — the <ol> carries order. */}
                    {!isLast && (
                      <ArrowRight
                        aria-hidden="true"
                        className="absolute -bottom-[26px] left-1/2 size-5 -translate-x-1/2 rotate-90 text-white/25 sm:hidden lg:-right-[26px] lg:bottom-auto lg:left-auto lg:top-1/2 lg:block lg:-translate-y-1/2 lg:translate-x-0 lg:rotate-0"
                      />
                    )}
                  </div>
                </StaggerItem>
              );
            })}
          </Stagger>

          <Reveal delay={0.1}>
            <div className="mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <Magnetic>
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackWhatsAppLead()}
                  className="inline-flex h-[54px] items-center justify-center gap-2.5 rounded-xl bg-green-500 px-7 text-base font-black text-slate-950 shadow-lg shadow-green-500/25 transition hover:bg-green-400"
                >
                  <MessageCircle className="size-5" aria-hidden="true" />
                  {tx.cta}
                </a>
              </Magnetic>
              <p className="max-w-sm text-[13.5px] font-semibold leading-6 text-slate-400">
                {tx.fineprint}
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
