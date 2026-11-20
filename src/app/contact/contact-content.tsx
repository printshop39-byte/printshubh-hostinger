"use client";

import { Mail, MapPin, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import {
  LegalPageShell,
  LegalSection,
} from "@/components/legal-page-shell";
import { SITE_CONTACT } from "@/components/site-footer";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

const tx: {
  intro: string;
  cardPhoneTitle: string;
  cardPhoneSub: string;
  cardWaTitle: string;
  cardWaSub: string;
  cardWaCta: string;
  cardEmailTitle: string;
  cardEmailSub: string;
  cardServiceAreaTitle: string;
  cardServiceAreaBody: string;
  trustLine: string;
  hoursTitle: string;
  hours: string;
  waMsg: string;
  whenToCallTitle: string;
  whenToCallBody: string;
  responseTitle: string;
  responseBody: string;
} = {
  intro:
    "WhatsApp is the fastest way. You can also reach us by phone or email — we reply in Marathi or English.",
  cardPhoneTitle: "Phone",
  cardPhoneSub: "Direct call",
  cardWaTitle: "WhatsApp",
  cardWaSub: "Instant reply",
  cardWaCta: "Open WhatsApp",
  cardEmailTitle: "Email",
  cardEmailSub: "For longer queries",
  cardServiceAreaTitle: "Service Area",
  cardServiceAreaBody: "Online / WhatsApp assistance across Maharashtra",
  trustLine:
    "Premium printing for Maharashtra. PRINTSHUBH has served customers in Kolhapur since 1996.",
  hoursTitle: "Working hours",
  hours: "Monday to Saturday · 9:00 AM to 9:00 PM · Closed on Sundays",
  waMsg: "Hello, I would like to know about PrintShubh services.",
  whenToCallTitle: "When to contact",
  whenToCallBody:
    "For any Wallpaper, Canvas, Wall Art, Rexine, Satin Fabric, Framed Prints or Vinyl Print Collection enquiry, to ask about service fees, if you face trouble using the website, or for any 7/12, 8A, village map, DP/TP, Property Card or Mutation request.",
  responseTitle: "Response time",
  responseBody:
    "Typical WhatsApp reply within 30 minutes. If we take longer, please bear with us — every query is answered.",
};

export function ContactContent() {
  const t = tx;
  const waHref = buildWhatsAppUrl({ message: t.waMsg, campaign: "contact" });

  return (
    <LegalPageShell
      title="Contact PrintShubh"
      breadcrumb="Contact"
      intro={t.intro}
      updatedAt="May 2026"
      showServiceDisclaimer={false}
      contentEn={<ContactBody t={t} waHref={waHref} />}
    />
  );
}

function ContactBody({
  t,
  waHref,
}: {
  t: typeof tx;
  waHref: string;
}) {
  return (
    <>
      {/* Trust line — in business since 1996 */}
      <div className="mb-6 rounded-lg border border-brand-gold-light bg-brand-cream p-4 text-[14px] font-semibold leading-7 text-brand-navy">
        <ShieldCheck className="mr-1.5 inline size-4 text-brand-navy" />
        {t.trustLine}
      </div>

      {/* 4 contact cards */}
      <div className="mb-8 grid gap-3 sm:grid-cols-2">
        <ContactCard
          icon={<Phone className="size-5" />}
          title={t.cardPhoneTitle}
          subtitle={t.cardPhoneSub}
          primary={SITE_CONTACT.phone}
          href={`tel:${SITE_CONTACT.phoneTel}`}
          accent="blue"
        />
        <ContactCard
          icon={<MessageCircle className="size-5" />}
          title={t.cardWaTitle}
          subtitle={t.cardWaSub}
          primary={SITE_CONTACT.phone}
          href={waHref}
          accent="green"
          external
          cta={t.cardWaCta}
        />
        <ContactCard
          icon={<Mail className="size-5" />}
          title={t.cardEmailTitle}
          subtitle={t.cardEmailSub}
          primary={SITE_CONTACT.email}
          href={`mailto:${SITE_CONTACT.email}`}
          accent="slate"
        />
        <ContactCard
          icon={<MapPin className="size-5" />}
          title={t.cardServiceAreaTitle}
          subtitle={""}
          primary={t.cardServiceAreaBody}
          accent="slate"
        />
      </div>

      <LegalSection heading={t.whenToCallTitle}>
        <p>{t.whenToCallBody}</p>
      </LegalSection>

      <LegalSection heading={t.responseTitle}>
        <p>{t.responseBody}</p>
      </LegalSection>

      <LegalSection heading={t.hoursTitle}>
        <p>{t.hours}</p>
      </LegalSection>
    </>
  );
}

function ContactCard({
  icon,
  title,
  subtitle,
  primary,
  href,
  accent,
  external,
  cta,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  primary: string;
  href?: string;
  accent: "blue" | "green" | "slate";
  external?: boolean;
  cta?: string;
}) {
  const accentClasses =
    accent === "green"
      ? "border-green-200 bg-green-50 text-green-900"
      : accent === "blue"
        ? "border-brand-gold-light bg-brand-cream text-brand-navy"
        : "border-slate-200 bg-slate-50 text-slate-800";
  const iconBg =
    accent === "green"
      ? "bg-green-600 text-white"
      : accent === "blue"
        ? "bg-brand-navy text-white"
        : "bg-slate-200 text-slate-700";

  const content = (
    <div className={`flex items-start gap-3 rounded-lg border p-4 ${accentClasses}`}>
      <span className={`flex size-10 shrink-0 items-center justify-center rounded-md ${iconBg}`}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-black uppercase tracking-[0.14em] opacity-70">{title}</p>
        {subtitle && <p className="mt-0.5 text-xs font-semibold opacity-70">{subtitle}</p>}
        <p className="mt-1 break-words text-sm font-black">{primary}</p>
        {cta && <p className="mt-1.5 text-xs font-bold underline-offset-2 hover:underline">{cta} →</p>}
      </div>
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className="block transition hover:opacity-90"
      >
        {content}
      </a>
    );
  }
  return content;
}
