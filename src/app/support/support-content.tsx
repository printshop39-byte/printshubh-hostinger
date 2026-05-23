"use client";

import Link from "next/link";
import {
  FileText,
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
import { useLang, type Lang } from "@/components/language-context";

interface Topic {
  icon: React.ReactNode;
  title: string;
  desc: string;
  waMsg: string;
}

const topics = (lang: Lang): Topic[] => {
  if (lang === "mr") {
    return [
      {
        icon: <FileText className="size-5" />,
        title: "7/12 उतारा",
        desc: "जिल्हा, तालुका, गाव, गट / सर्वे नंबर सांगा — आम्ही PDF WhatsApp वर पाठवू.",
        waMsg: "नमस्कार, मला 7/12 उतारा हवा आहे.",
      },
      {
        icon: <MapPinned className="size-5" />,
        title: "गाव नकाशा",
        desc: "गाव नकाशा, गट नकाशा, सर्वे नकाशा — संदर्भासाठी हवा असल्यास.",
        waMsg: "नमस्कार, मला गाव नकाशा / गट नकाशा हवा आहे.",
      },
      {
        icon: <Landmark className="size-5" />,
        title: "DP / TP Map",
        desc: "झोन, आरक्षण, रस्ता रुंदी इत्यादी DP / TP माहिती हवी असल्यास.",
        waMsg: "नमस्कार, माझ्या प्लॉटची DP / TP माहिती हवी आहे.",
      },
      {
        icon: <Scroll className="size-5" />,
        title: "जमीन कागदपत्र",
        desc: "8A, मिळकत पत्रिका, फेरफार, स्वामित्व नकाशे आणि इतर कागदपत्रे.",
        waMsg: "नमस्कार, मला जमीन कागदपत्र सेवेबद्दल माहिती हवी आहे.",
      },
      {
        icon: <Receipt className="size-5" />,
        title: "पेमेंट / रिफंड",
        desc: "पेमेंट UPI / QR ने. अहवाल मिळाला नाही तर परतावा शक्य.",
        waMsg: "नमस्कार, मला पेमेंट / रिफंडसंदर्भात मदत हवी आहे.",
      },
    ];
  }
  return [
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
      icon: <Receipt className="size-5" />,
      title: "Payment / Refund",
      desc: "Payment via UPI / QR. Refunds are possible if the report cannot be retrieved.",
      waMsg: "Hello, I need help with payment / refund.",
    },
  ];
};

const tx: Record<Lang, {
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
}> = {
  mr: {
    intro:
      "तुमच्या अडचणीनुसार खालील विषय निवडा. WhatsApp वर बोलल्यास सर्वात जलद उत्तर मिळेल.",
    fastestTitle: "सर्वात जलद मार्ग — WhatsApp",
    fastestBody:
      "तुमचा प्रश्न WhatsApp वर पाठवा. आम्ही साधारणतः 30 मिनिटांत प्रतिसाद देतो.",
    fastestCta: "WhatsApp वर बोला",
    phoneLabel: "थेट फोन",
    topicsHeading: "मदत विषय",
    topicCta: "WhatsApp वर सुरू करा",
    hoursTitle: "उपलब्धता",
    hoursBody:
      "सोमवार ते शनिवार · सकाळी 9:00 ते रात्री 9:00. रविवारी आणि सुट्टीच्या दिवशी मर्यादित सेवा.",
    policyTitle: "सेवा संदर्भ धोरण",
    policyBody:
      "PrintShubh ही सरकारी संस्था नाही. आम्ही अधिकृत सार्वजनिक स्रोतांवर आधारित खाजगी सहाय्य सेवा देतो. अंतिम पडताळणी संबंधित सरकारी पोर्टलवर करावी.",
    whatsappGenericMsg: "नमस्कार, मला PrintShubh सेवेबद्दल मदत हवी आहे.",
  },
  en: {
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
      "Monday to Saturday · 9:00 AM to 9:00 PM. Limited service on Sundays and holidays.",
    policyTitle: "Service policy",
    policyBody:
      "PrintShubh is not a government body. We provide private assistance based on official public sources. Final verification must be done on the relevant government portal.",
    whatsappGenericMsg: "Hello, I need help with PrintShubh services.",
  },
};

export function SupportContent() {
  const { lang } = useLang();
  const t = tx[lang];

  return (
    <LegalPageShell
      title={{ mr: "मदत केंद्र", en: "Support Centre" }}
      breadcrumb={{ mr: "मदत", en: "Support" }}
      intro={{ mr: t.intro, en: tx.en.intro }}
      updatedAt="May 2026"
      contentMr={<SupportBody lang="mr" />}
      contentEn={<SupportBody lang="en" />}
    />
  );
}

function SupportBody({ lang }: { lang: Lang }) {
  const t = tx[lang];
  const list = topics(lang);
  const genericWa = `https://wa.me/${SITE_CONTACT.whatsapp}?text=${encodeURIComponent(t.whatsappGenericMsg)}`;

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
          className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-5 text-blue-900 shadow-sm transition hover:bg-blue-100"
        >
          <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
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
            const href = `https://wa.me/${SITE_CONTACT.whatsapp}?text=${encodeURIComponent(tp.waMsg)}`;
            return (
              <a
                key={tp.title}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-300 hover:bg-blue-50"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-blue-100 text-blue-700">
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
          <Link href="/disclaimer" className="font-bold text-blue-700 hover:underline">
            {lang === "mr" ? "पूर्ण अस्वीकरण वाचा →" : "Read full disclaimer →"}
          </Link>
        </p>
      </LegalSection>
    </>
  );
}
