"use client";

/**
 * SiteFooter — dark, four-column footer rendered below every page.
 *
 * It is also the site's link safety net. The desktop header only carries the
 * four service categories plus About/Contact; every other page that used to
 * be in the old nav (tools, map finder, pricing, FAQ, support, and all the
 * policy pages) is listed here, on every route. Nothing became unreachable
 * when the header was slimmed down.
 *
 * The address block shows a real address only once SHOP_ADDRESS is filled in
 * (src/lib/shop-profile.ts); until then it states the service area, which is
 * what the site has always accurately claimed.
 */

import Link from "next/link";
import {
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { useLang, type Lang } from "@/components/language-context";
import { inquiryCtaClick } from "@/lib/inquiry-form-bus";
import { buildWhatsAppUrl, WHATSAPP_DISPLAY, WHATSAPP_NUMBER } from "@/lib/whatsapp";
import { OPENING_HOURS, SHOP_ADDRESS, YEARS_EXPERIENCE } from "@/lib/shop-profile";

/* ── Official PrintShubh contact details ──────────────────────────────────
 * Single source of truth for the *display* forms — every component that needs
 * the phone / WhatsApp number imports SITE_CONTACT from this file. The digits
 * themselves come from the canonical WhatsApp helper so the number literal
 * lives in exactly one place. */
export const SITE_CONTACT = {
  phone: WHATSAPP_DISPLAY,               // display form — shown to the user
  phoneTel: `+${WHATSAPP_NUMBER}`,       // E.164 form — used in tel: links
  email: "support@printshubh.shop",
  whatsapp: WHATSAPP_NUMBER,             // used in wa.me/ links
  // Street address is NOT hard-coded here. It comes from SHOP_ADDRESS in
  // src/lib/shop-profile.ts, and while that is null the site advertises a
  // service area instead — see the address block below and /contact.
  serviceArea_mr: "महाराष्ट्रभर ऑनलाइन / WhatsApp सहाय्य",
  serviceArea_en: "Online / WhatsApp assistance across Maharashtra",
};

const tx: Record<
  Lang,
  {
    tagline: string;
    servicesTitle: string;
    usefulTitle: string;
    contactTitle: string;
    badges: string[];
    services: { label: string; href: string }[];
    useful: { label: string; href: string }[];
    waMsg: string;
    waCta: string;
    rights: string;
    builtFor: string;
    directions: string;
    hours: string;
  }
> = {
  mr: {
    tagline:
      "Jumbo Xerox • Printing • Photo • Digital Services. रोजच्या प्रिंटिंगपासून जमीन कागदपत्रांपर्यंत — मराठी-प्रथम सेवा.",
    servicesTitle: "सेवा",
    usefulTitle: "उपयुक्त",
    contactTitle: "संपर्क",
    badges: [
      "अधिकृत स्रोतांवर आधारित",
      "सरकारी संस्था नाही",
      "WhatsApp वर PDF",
      "पेमेंटपूर्वी माहिती तपासणी",
      `${YEARS_EXPERIENCE}+ वर्षांचा अनुभव`,
    ],
    services: [
      { label: "प्रिंटिंग व झेरॉक्स", href: "/printing-xerox" },
      { label: "फोटो सेवा", href: "/photo-services" },
      { label: "डिजिटल सेवा", href: "/digital-services" },
      { label: "7/12 उतारा", href: "/satbara-utara-maharashtra/" },
      { label: "8A उतारा", href: "/8a-utara-maharashtra/" },
      { label: "गाव नकाशा", href: "/gav-nakasha-maharashtra/" },
      { label: "TP / DP नकाशा", href: "/dp-map-maharashtra/" },
      { label: "मिळकत पत्रिका", href: "/milkat-patrika-maharashtra/" },
      { label: "ई-फेरफार", href: "/e-ferfar-maharashtra/" },
    ],
    useful: [
      { label: "आमच्याबद्दल", href: "/about" },
      { label: "किंमत", href: "/pricing" },
      { label: "मोफत साधने", href: "/#tools" },
      { label: "नकाशा शोध", href: "/nakasha-shodh" },
      { label: "FAQ", href: "/faq" },
      { label: "मदत केंद्र", href: "/support" },
      { label: "संपर्क", href: "/contact" },
      { label: "अटी व शर्ती", href: "/terms" },
      { label: "गोपनीयता धोरण", href: "/privacy" },
      { label: "परतावा धोरण", href: "/refund" },
      { label: "अस्वीकरण", href: "/disclaimer" },
    ],
    waMsg: "नमस्कार, मला PrintShubh सेवेबद्दल माहिती हवी आहे.",
    waCta: "WhatsApp वर बोला",
    rights: "सर्व हक्क राखीव.",
    builtFor: "महाराष्ट्रासाठी.",
    directions: "दिशा दाखवा",
    hours: "वेळ",
  },
  en: {
    tagline:
      "Jumbo Xerox • Printing • Photo • Digital Services. From an everyday photocopy to a land document — Marathi-first.",
    servicesTitle: "Services",
    usefulTitle: "Useful",
    contactTitle: "Contact",
    badges: [
      "Based on official sources",
      "Not a government body",
      "PDF on WhatsApp",
      "Details verified before payment",
      `${YEARS_EXPERIENCE}+ years of experience`,
    ],
    services: [
      { label: "Printing & Xerox", href: "/printing-xerox" },
      { label: "Photo Services", href: "/photo-services" },
      { label: "Digital Services", href: "/digital-services" },
      { label: "7/12 Extract", href: "/satbara-utara-maharashtra/" },
      { label: "8A Extract", href: "/8a-utara-maharashtra/" },
      { label: "Village Map", href: "/gav-nakasha-maharashtra/" },
      { label: "TP / DP Map", href: "/dp-map-maharashtra/" },
      { label: "Property Card", href: "/milkat-patrika-maharashtra/" },
      { label: "eFerfar / Mutation", href: "/e-ferfar-maharashtra/" },
    ],
    useful: [
      { label: "About Us", href: "/about" },
      { label: "Pricing", href: "/pricing" },
      { label: "Free Tools", href: "/#tools" },
      { label: "Map Search", href: "/nakasha-shodh" },
      { label: "FAQ", href: "/faq" },
      { label: "Support", href: "/support" },
      { label: "Contact", href: "/contact" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Refund Policy", href: "/refund" },
      { label: "Disclaimer", href: "/disclaimer" },
    ],
    waMsg: "Hello, I would like to know about PrintShubh services.",
    waCta: "Chat on WhatsApp",
    rights: "All rights reserved.",
    builtFor: "For Maharashtra.",
    directions: "Directions",
    hours: "Hours",
  },
};

export function SiteFooter() {
  const { lang } = useLang();
  const t = tx[lang];
  const year = new Date().getFullYear();
  const waHref = buildWhatsAppUrl({ message: t.waMsg, campaign: "footer" });

  return (
    <footer className="bg-slate-950 px-5 pb-10 pt-16 text-slate-300 sm:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Trust badges */}
        <ul className="mb-12 flex flex-wrap gap-2">
          {t.badges.map((b) => (
            <li
              key={b}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-[11.5px] font-bold text-slate-300 ring-1 ring-inset ring-white/10"
            >
              <ShieldCheck className="size-3.5 text-blue-400" aria-hidden="true" />
              {b}
            </li>
          ))}
        </ul>

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.1fr]">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 text-lg font-black text-white">
                P
              </span>
              <span className="leading-none">
                <span className="block text-lg font-black tracking-tight text-white">
                  PRINTSHUBH
                </span>
                <span className="mt-1 block text-[10px] font-black uppercase tracking-[0.18em] text-blue-400">
                  Jumbo Xerox
                </span>
              </span>
            </div>
            <p className="mt-4 max-w-sm text-[14px] leading-7 text-slate-400">{t.tagline}</p>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={inquiryCtaClick}
              className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-green-600 px-4 text-sm font-black text-white shadow-sm transition hover:bg-green-500"
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              {t.waCta}
            </a>
          </div>

          {/* Services */}
          <div>
            <h4 className="mb-4 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
              {t.servicesTitle}
            </h4>
            <ul className="space-y-1">
              {t.services.map((l) => (
                <li key={l.href + l.label}>
                  <Link
                    href={l.href}
                    className="flex min-h-[44px] items-center text-[14px] font-semibold text-slate-400 transition hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Useful */}
          <div>
            <h4 className="mb-4 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
              {t.usefulTitle}
            </h4>
            <ul className="space-y-1">
              {t.useful.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="flex min-h-[44px] items-center text-[14px] font-semibold text-slate-400 transition hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
              {t.contactTitle}
            </h4>
            <ul className="space-y-3.5 text-[14px]">
              <li className="flex items-start gap-2.5">
                <Phone className="mt-1 size-4 shrink-0 text-blue-400" aria-hidden="true" />
                <a
                  href={`tel:${SITE_CONTACT.phoneTel}`}
                  className="inline-flex min-h-[44px] items-center font-bold text-slate-300 transition hover:text-white"
                >
                  {SITE_CONTACT.phone}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="mt-1 size-4 shrink-0 text-blue-400" aria-hidden="true" />
                <a
                  href={`mailto:${SITE_CONTACT.email}`}
                  className="inline-flex min-h-[44px] items-center font-bold text-slate-300 transition hover:text-white"
                >
                  {SITE_CONTACT.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-1 size-4 shrink-0 text-blue-400" aria-hidden="true" />
                {SHOP_ADDRESS ? (
                  <address className="not-italic font-semibold leading-6 text-slate-400">
                    {SHOP_ADDRESS.lines[lang].map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                    <a
                      href={SHOP_ADDRESS.directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 font-black text-blue-400 transition hover:text-blue-300"
                    >
                      <Navigation className="size-3.5" aria-hidden="true" />
                      {t.directions}
                    </a>
                  </address>
                ) : (
                  <span className="font-semibold leading-6 text-slate-400">
                    {lang === "mr"
                      ? SITE_CONTACT.serviceArea_mr
                      : SITE_CONTACT.serviceArea_en}
                  </span>
                )}
              </li>
              {OPENING_HOURS && (
                <li className="flex items-start gap-2.5">
                  <Clock className="mt-1 size-4 shrink-0 text-blue-400" aria-hidden="true" />
                  <div>
                    <p className="font-black text-slate-300">{t.hours}</p>
                    <dl className="mt-1 space-y-0.5 text-[13.5px] text-slate-400">
                      {OPENING_HOURS.rows.map((row) => (
                        <div key={row.days.en} className="flex gap-2">
                          <dt className="font-bold">{row.days[lang]}</dt>
                          <dd className="font-semibold">{row.time[lang]}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-[12px] font-semibold text-slate-500 sm:flex-row sm:items-center">
          <p>
            © {year} PRINTSHUBH · {t.rights}
          </p>
          <p>{t.builtFor}</p>
        </div>
      </div>
    </footer>
  );
}
