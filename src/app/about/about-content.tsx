"use client";

/**
 * About PRINTSHUBH — Premium Print & Visual Studio.
 *
 * A printing-first company introduction. Everything stated here is something
 * the site already states elsewhere or the owner has confirmed: in business
 * since 1996 (the Google Business Profile opening date), the Shahupuri
 * counter, the seven print collections plus wall murals and custom visual
 * products, CAD / AutoCAD plan printing, an 11-colour large-format printing
 * system, print consultation, and the order process shown on the homepage.
 *
 * Deliberately NOT said here: any government-sector identity, land-record
 * service list, "private assistance service" statement, official-source
 * branding, printer make or model, prices, turnaround times, delivery, or
 * certifications. The legal notices about the land-document services live on
 * those service pages, /disclaimer, /terms and the footer.
 *
 * Address and hours come from shop-profile.ts (the single source of truth).
 * English and Marathi are both kept until the English-only phase.
 */

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import {
  LegalList,
  LegalPageShell,
  LegalSection,
} from "@/components/legal-page-shell";
import { SITE_CONTACT } from "@/components/site-footer";
import { type Lang } from "@/components/language-context";
import { OPENING_HOURS, SHOP_ADDRESS } from "@/lib/shop-profile";

type Copy = {
  intro: string;
  trustLine: string;
  whoHeading: string;
  whoBody: string;
  printHeading: string;
  printItems: string[];
  cadHeading: string;
  cadBody: string;
  orderHeading: string;
  orderItems: string[];
  studioHeading: string;
  studioBody: string;
  counterHeading: string;
  counterLead: string;
  counterLinks: { href: string; label: string }[];
  visitHeading: string;
  visitLead: string;
  contactLabel: string;
};

const copy: Record<Lang, Copy> = {
  mr: {
    intro:
      "PRINTSHUBH — Premium Print & Visual Studio. कोल्हापूरमधील शाहूपुरी येथील प्रिंट स्टुडिओ, १९९६ पासून ग्राहकांच्या सेवेत.",
    trustLine:
      "घर, ऑफिस आणि दुकानांसाठी प्रीमियम लार्ज-फॉरमॅट प्रिंटिंग. १९९६ पासून कोल्हापुरात सेवेत.",
    whoHeading: "आम्ही कोण आहोत",
    whoBody:
      "PRINTSHUBH हा कोल्हापूरमधील शाहूपुरी येथील प्रिंट आणि व्हिज्युअल स्टुडिओ आहे. आम्ही १९९६ पासून ग्राहकांना सेवा देत आहोत, आणि आज इंटिरियरसाठी प्रीमियम लार्ज-फॉरमॅट प्रिंटिंग तसेच आर्किटेक्ट, इंजिनिअर आणि बिल्डरसाठी CAD प्लॅन प्रिंटिंगवर आमचा भर आहे.",
    printHeading: "आम्ही काय प्रिंट करतो",
    printItems: [
      "वॉलपेपर आणि वॉल म्युरल्स",
      "कॅनव्हास प्रिंट आणि वॉल आर्ट",
      "PU लेदरेट / रेक्झिन प्रिंटिंग",
      "साटीन फॅब्रिक प्रिंटिंग",
      "फ्रेम्ड प्रिंट्स",
      "व्हिनाइल प्रिंटिंग",
      "तुमच्या मापानुसार आणि डिझाइननुसार सानुकूल व्हिज्युअल उत्पादने",
    ],
    cadHeading: "CAD आणि टेक्निकल प्लॉटिंग",
    cadBody:
      "AutoCAD चे आर्किटेक्चरल व स्ट्रक्चरल प्लॅन मोठ्या आकारात प्रिंट. फाइल, आकार आणि प्रती WhatsApp वर पाठवा; काम सुरू करण्यापूर्वी काय जमेल ते आम्ही कळवतो.",
    orderHeading: "ऑर्डर कशी चालते",
    orderItems: [
      "कलेक्शन निवडा, किंवा काय हवं ते सांगा.",
      "फाइल, आकार आणि प्रती WhatsApp वर पाठवा.",
      "काम सुरू करण्यापूर्वी आकार, मटेरियल आणि किंमत निश्चित केली जाते.",
      "तुमची ऑर्डर स्टुडिओमध्ये प्रिंट होते.",
      "प्रिंट तयार झाल्यावर कोल्हापूर स्टुडिओमधून घ्या.",
    ],
    studioHeading: "आमचा स्टुडिओ",
    studioBody:
      "आमचे इंटिरियर प्रिंट 11-रंगी लार्ज-फॉरमॅट प्रिंटिंग प्रणालीवर केले जातात. प्रिंट सल्ला उपलब्ध आहे: तुमच्या जागेला साजेसा आकार आणि मटेरियल निवडायला आम्ही मदत करतो.",
    counterHeading: "काउंटरवर आणखी",
    counterLead:
      "जंबो झेरॉक्स, फोटो सेवा आणि ऑनलाइन सेवा काउंटरवर अजूनही उपलब्ध आहेत.",
    counterLinks: [
      { href: "/printing-xerox", label: "प्रिंटिंग व झेरॉक्स" },
      { href: "/photo-services", label: "फोटो सेवा" },
      { href: "/digital-services", label: "ऑनलाइन सेवा" },
    ],
    visitHeading: "भेट द्या किंवा संदेश पाठवा",
    visitLead:
      "किंमत जाणून घेण्यासाठी फाइल WhatsApp वर पाठवा, किंवा स्टुडिओला भेट द्या:",
    contactLabel: "संपर्क करा",
  },
  en: {
    intro:
      "PRINTSHUBH — Premium Print & Visual Studio. A print studio in Shahupuri, Kolhapur, serving customers since 1996.",
    trustLine:
      "Premium large-format printing for homes, offices and shops. Serving Kolhapur since 1996.",
    whoHeading: "Who we are",
    whoBody:
      "PRINTSHUBH is a print and visual studio in Shahupuri, Kolhapur. We have served customers since 1996, and today we focus on premium large-format printing for interiors and on CAD plan printing for architects, engineers and builders.",
    printHeading: "What we print",
    printItems: [
      "Wallpaper and wall murals",
      "Canvas prints and wall art",
      "PU leatherette / rexine printing",
      "Satin fabric printing",
      "Framed prints",
      "Vinyl printing",
      "Custom visual products, made to your size and design",
    ],
    cadHeading: "CAD and technical plotting",
    cadBody:
      "AutoCAD architectural and structural plans, printed large. Send your file, the size and the number of copies on WhatsApp, and we confirm what works before any work starts.",
    orderHeading: "How an order works",
    orderItems: [
      "Choose a collection, or tell us what you need.",
      "Send your file, size and copies on WhatsApp.",
      "Size, material and price are confirmed before work starts.",
      "Your order is printed at the studio.",
      "When it is ready, collect it from the studio in Kolhapur.",
    ],
    studioHeading: "Our studio",
    studioBody:
      "Our interior prints are made on an 11-colour, large-format printing system. Print consultation is available: we help you choose the size and material that suit your space.",
    counterHeading: "Also at the counter",
    counterLead:
      "Jumbo xerox, photo services and online services are still available at the counter.",
    counterLinks: [
      { href: "/printing-xerox", label: "Printing & Xerox" },
      { href: "/photo-services", label: "Photo services" },
      { href: "/digital-services", label: "Online services" },
    ],
    visitHeading: "Visit or message us",
    visitLead: "Send your file on WhatsApp for a quote, or visit the studio:",
    contactLabel: "Contact us",
  },
};

export function AboutContent() {
  return (
    <LegalPageShell
      title={{ mr: "आमच्याबद्दल", en: "About PRINTSHUBH" }}
      breadcrumb={{ mr: "आमच्याबद्दल", en: "About Us" }}
      intro={{ mr: copy.mr.intro, en: copy.en.intro }}
      updatedAt="November 2026"
      showServiceDisclaimer={false}
      contentMr={<AboutBody lang="mr" />}
      contentEn={<AboutBody lang="en" />}
    />
  );
}

function AboutBody({ lang }: { lang: Lang }) {
  const c = copy[lang];

  return (
    <>
      <div className="mb-6 flex items-start gap-3 rounded-lg border border-brand-gold-light bg-brand-cream p-4 text-[14px] font-semibold leading-7 text-brand-navy">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-brand-navy" />
        <p>{c.trustLine}</p>
      </div>

      <LegalSection heading={c.whoHeading}>
        <p>{c.whoBody}</p>
      </LegalSection>

      <LegalSection heading={c.printHeading}>
        <LegalList items={c.printItems} />
      </LegalSection>

      <LegalSection heading={c.cadHeading}>
        <p>{c.cadBody}</p>
      </LegalSection>

      <LegalSection heading={c.orderHeading}>
        <LegalList items={c.orderItems} />
      </LegalSection>

      <LegalSection heading={c.studioHeading}>
        <p>{c.studioBody}</p>
      </LegalSection>

      <LegalSection heading={c.counterHeading}>
        <p>{c.counterLead}</p>
        <ul className="flex flex-wrap gap-x-5">
          {c.counterLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="inline-flex min-h-[44px] items-center font-bold text-brand-navy underline decoration-brand-gold underline-offset-4 hover:text-brand-navy-dark"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </LegalSection>

      <LegalSection heading={c.visitHeading}>
        <p>{c.visitLead}</p>
        {SHOP_ADDRESS ? (
          <p>
            {SHOP_ADDRESS.lines[lang].map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
        ) : null}
        {OPENING_HOURS ? (
          <p>
            {OPENING_HOURS.rows.map((row) => (
              <span key={row.days.en} className="block">
                {row.days[lang]}: {row.time[lang]}
              </span>
            ))}
          </p>
        ) : null}
        <p>
          <a
            href={`tel:${SITE_CONTACT.phoneTel}`}
            className="inline-flex min-h-[44px] items-center font-bold text-brand-navy underline decoration-brand-gold underline-offset-4 hover:text-brand-navy-dark"
          >
            {SITE_CONTACT.phone}
          </a>
          {" · "}
          <Link
            href="/contact"
            className="inline-flex min-h-[44px] items-center font-bold text-brand-navy underline decoration-brand-gold underline-offset-4 hover:text-brand-navy-dark"
          >
            {c.contactLabel}
          </Link>
        </p>
      </LegalSection>
    </>
  );
}
