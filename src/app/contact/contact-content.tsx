"use client";

import { Mail, MapPin, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import {
  LegalPageShell,
  LegalSection,
} from "@/components/legal-page-shell";
import { SITE_CONTACT } from "@/components/site-footer";
import { useLang, type Lang } from "@/components/language-context";

const tx: Record<Lang, {
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
}> = {
  mr: {
    intro:
      "WhatsApp हा सर्वात जलद मार्ग आहे. फोन किंवा ईमेलवरही संपर्क करता येतो — आम्ही मराठीतून उत्तर देऊ.",
    cardPhoneTitle: "फोन",
    cardPhoneSub: "थेट कॉल करा",
    cardWaTitle: "WhatsApp",
    cardWaSub: "तत्काळ उत्तर",
    cardWaCta: "WhatsApp उघडा",
    cardEmailTitle: "ईमेल",
    cardEmailSub: "दीर्घ चौकशीसाठी",
    cardServiceAreaTitle: "सेवा क्षेत्र",
    cardServiceAreaBody: "महाराष्ट्रभर ऑनलाइन / WhatsApp सहाय्य",
    trustLine:
      "मागील ३० वर्षांपासून नकाशे, जमीन अभिलेख आणि सरकारी कागदपत्र प्रक्रियेचा अनुभव असलेल्या टीमकडून महाराष्ट्रासाठी विश्वासार्ह सहाय्य.",
    hoursTitle: "कामकाजाचे तास",
    hours: "सोमवार ते शनिवार · सकाळी 9:00 ते रात्री 9:00 · रविवारी मर्यादित सेवा",
    waMsg: "नमस्कार, मला PrintShubh सेवेबद्दल माहिती हवी आहे.",
    whenToCallTitle: "कधी संपर्क करावा",
    whenToCallBody:
      "7/12 / 8A / गाव नकाशा / DP / TP / मिळकत पत्रिका / फेरफार यापैकी कोणत्याही दस्तऐवजासाठी, सेवा शुल्क विचारणा करण्यासाठी, किंवा वेबसाइट वापरताना अडचण आल्यास.",
    responseTitle: "उत्तराचा वेळ",
    responseBody:
      "WhatsApp वर साधारणतः 30 मिनिटांत प्रतिसाद. कधी अधिक वेळ लागल्यास सहन करा — आम्ही प्रत्येक चौकशीला नक्की उत्तर देतो.",
  },
  en: {
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
      "Trusted assistance for Maharashtra, backed by 30 years of experience in maps, land records, and government document workflows.",
    hoursTitle: "Working hours",
    hours: "Monday to Saturday · 9:00 AM to 9:00 PM · Limited service on Sundays",
    waMsg: "Hello, I would like to know about PrintShubh services.",
    whenToCallTitle: "When to contact",
    whenToCallBody:
      "For any 7/12, 8A, village map, DP/TP, Property Card or Mutation request, to ask about service fees, or if you face trouble using the website.",
    responseTitle: "Response time",
    responseBody:
      "Typical WhatsApp reply within 30 minutes. If we take longer, please bear with us — every query is answered.",
  },
};

export function ContactContent() {
  const { lang } = useLang();
  const t = tx[lang];
  const waHref = `https://wa.me/${SITE_CONTACT.whatsapp}?text=${encodeURIComponent(t.waMsg)}`;

  return (
    <LegalPageShell
      title={{ mr: "संपर्क करा", en: "Contact PrintShubh" }}
      breadcrumb={{ mr: "संपर्क", en: "Contact" }}
      intro={{ mr: t.intro, en: tx.en.intro }}
      updatedAt="May 2026"
      contentMr={<ContactBody t={t} waHref={waHref} />}
      contentEn={<ContactBody t={tx.en} waHref={waHref} />}
    />
  );
}

function ContactBody({
  t,
  waHref,
}: {
  t: (typeof tx)["mr"];
  waHref: string;
}) {
  return (
    <>
      {/* Trust line — 30 years experience */}
      <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-[14px] font-semibold leading-7 text-blue-900">
        <ShieldCheck className="mr-1.5 inline size-4 text-blue-700" />
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
        ? "border-blue-200 bg-blue-50 text-blue-900"
        : "border-slate-200 bg-slate-50 text-slate-800";
  const iconBg =
    accent === "green"
      ? "bg-green-600 text-white"
      : accent === "blue"
        ? "bg-blue-600 text-white"
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
