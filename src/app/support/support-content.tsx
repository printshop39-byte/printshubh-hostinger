"use client";

import Link from "next/link";
import {
  FileText,
  Frame,
  Landmark,
  MapPinned,
  MessageCircle,
  Phone,
  Receipt,
  Scroll,
} from "lucide-react";
import {
  LegalPageShell,
  LegalSection,
} from "@/components/legal-page-shell";
import { SITE_CONTACT } from "@/components/site-footer";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

interface Topic {
  icon: React.ReactNode;
  title: string;
  desc: string;
  waMsg: string;
}

const topics: Topic[] = [
  {
    icon: <FileText className="size-5" />,
    title: "7/12 Extract",
    desc: "Share district, taluka, village and Gut / Survey number — we'll deliver the PDF on WhatsApp.",
    waMsg: "Hello, I need a 7/12 extract.",
  },
  {
    icon: <MapPinned className="size-5" />,
    title: "Village Map",
    desc: "Village map, gut map, survey map — for reference and planning.",
    waMsg: "Hello, I need a village / gut map.",
  },
  {
    icon: <Landmark className="size-5" />,
    title: "DP / TP Map",
    desc: "Zoning, reservations, road widths — DP / TP information for your plot.",
    waMsg: "Hello, I need DP / TP information for my plot.",
  },
  {
    icon: <Scroll className="size-5" />,
    title: "Land Documents",
    desc: "8A, Property Card, Mutation, Svamitva maps and other documents.",
    waMsg: "Hello, I need help with land document services.",
  },
  {
    icon: <Frame className="size-5" />,
    title: "Print Collections enquiry",
    desc: "Wallpaper, canvas, wall art, rexine, satin fabric, framed prints, vinyl — info or a custom-size quote for any collection.",
    waMsg: "Hello, I'd like to know about one of the Print Collections.",
  },
  {
    icon: <Receipt className="size-5" />,
    title: "Payment / Refund",
    desc: "Payment via UPI / QR. Refunds are possible if the report cannot be retrieved.",
    waMsg: "Hello, I need help with payment / refund.",
  },
];

const tx: {
  intro: string;
  fastestTitle: string;
  fastestBody: string;
  fastestCta: string;
  phoneLabel: string;
  topicsHeading: string;
  topicCta: string;
  hoursTitle: string;
  hoursBody: string;
  policyTitle: string;
  policyBody: string;
  whatsappGenericMsg: string;
} = {
  intro:
    "Pick a topic below based on what you need. WhatsApp is the fastest way to reach us.",
  fastestTitle: "Fastest way — WhatsApp",
  fastestBody:
    "Send your question on WhatsApp. We typically reply within 30 minutes.",
  fastestCta: "Chat on WhatsApp",
  phoneLabel: "Direct phone",
  topicsHeading: "Help topics",
  topicCta: "Start on WhatsApp",
  hoursTitle: "Availability",
  hoursBody:
    "Monday to Saturday · 9:00 AM to 9:00 PM. Closed on Sundays.",
  policyTitle: "Service policy",
  policyBody:
    "PrintShubh is not a government body. We provide private assistance based on official public sources. Final verification must be done on the relevant government portal.",
  whatsappGenericMsg: "Hello, I need help with PrintShubh services.",
};

export function SupportContent() {
  return (
    <LegalPageShell
      title="Support Centre"
      breadcrumb="Support"
      intro={tx.intro}
      updatedAt="May 2026"
      content={<SupportBody />}
    />
  );
}

function SupportBody() {
  const t = tx;
  const list = topics;
  const genericWa = buildWhatsAppUrl({ message: t.whatsappGenericMsg, campaign: "support" });

  return (
    <>
      {/* Hero CTA — WhatsApp + Phone side by side */}
      <div className="mb-8 grid gap-3 sm:grid-cols-[1.4fr_1fr]">
        <a
          href={genericWa}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-3 rounded-xl border-2 border-green-300 bg-green-50 p-5 text-green-900 shadow-sm transition hover:bg-green-100"
        >
          <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-green-600 text-white">
            <MessageCircle className="size-6" />
          </span>
          <div>
            <p className="text-sm font-black">{t.fastestTitle}</p>
            <p className="mt-1 text-xs leading-5 opacity-90">{t.fastestBody}</p>
            <p className="mt-2 text-xs font-bold underline-offset-2 group-hover:underline">
              {t.fastestCta} →
            </p>
          </div>
        </a>

        <a
          href={`tel:${SITE_CONTACT.phoneTel}`}
          className="flex items-start gap-3 rounded-xl border border-brand-gold-light bg-brand-cream p-5 text-brand-navy shadow-sm transition hover:bg-brand-gold-light"
        >
          <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-brand-navy text-white">
            <Phone className="size-6" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.14em] opacity-75">
              {t.phoneLabel}
            </p>
            <p className="mt-1 break-words text-base font-black">{SITE_CONTACT.phone}</p>
          </div>
        </a>
      </div>

      {/* Topic grid */}
      <LegalSection heading={t.topicsHeading}>
        <div className="-mx-1 grid gap-3 sm:grid-cols-2">
          {list.map((tp) => {
            const href = buildWhatsAppUrl({ message: tp.waMsg, campaign: "support" });
            return (
              <a
                key={tp.title}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-brand-gold hover:bg-brand-cream"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-brand-gold-light text-brand-navy">
                  {tp.icon}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-black text-slate-950">{tp.title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-600">{tp.desc}</p>
                  <p className="mt-1.5 text-[11px] font-bold text-green-700">
                    {t.topicCta} →
                  </p>
                </div>
              </a>
            );
          })}
        </div>
      </LegalSection>

      <LegalSection heading={t.hoursTitle}>
        <p>{t.hoursBody}</p>
      </LegalSection>

      <LegalSection heading={t.policyTitle}>
        <p>{t.policyBody}</p>
        <p className="text-[13px] text-slate-500">
          <Link href="/disclaimer" className="font-bold text-brand-navy hover:underline">
            Read full disclaimer →
          </Link>
        </p>
      </LegalSection>
    </>
  );
}
