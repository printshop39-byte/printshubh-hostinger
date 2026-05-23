"use client";

/**
 * SiteFooter
 * - Brand + tagline
 * - Quick links (services), Legal links, Support
 * - Trust badges row
 * - Contact placeholders (phone / email / address) — edit later
 *
 * Renders below every page. Marathi-first, switches with the language toggle.
 */

import Link from "next/link";
import {
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { useLang, type Lang } from "@/components/language-context";

/* ── Official PrintShubh contact details ──────────────────────────────────
 * Single source of truth — every component that needs the phone / WhatsApp
 * number imports SITE_CONTACT from this file. Update here, the whole site
 * updates. */
export const SITE_CONTACT = {
  phone: "+91 86258 01907",            // shown to the user
  phoneTel: "+918625801907",            // used in tel: links
  email: "support@printshubh.shop",
  whatsapp: "918625801907",             // used in wa.me/ links
  // No physical address shown publicly. The site advertises a service
  // area instead — see SiteFooter and /contact for the rendered string.
  serviceArea_mr: "महाराष्ट्रभर ऑनलाइन / WhatsApp सहाय्य",
  serviceArea_en: "Online / WhatsApp assistance across Maharashtra",
};

const tx: Record<
  Lang,
  {
    tagline: string;
    quickLinksTitle: string;
    legalTitle: string;
    contactTitle: string;
    badges: string[];
    quick: { label: string; href: string }[];
    legal: { label: string; href: string }[];
    waMsg: string;
    waCta: string;
    rights: string;
    builtFor: string;
  }
> = {
  mr: {
    tagline:
      "महाराष्ट्रातील जमीन कागदपत्र, 7/12, गाव नकाशा आणि TP/DP संदर्भासाठी मराठी-प्रथम सहाय्य. अधिकृत स्रोतांवर आधारित खाजगी सेवा.",
    quickLinksTitle: "मुख्य सेवा",
    legalTitle: "धोरण व माहिती",
    contactTitle: "संपर्क",
    badges: [
      "अधिकृत स्रोतांवर आधारित",
      "सरकारी संस्था नाही",
      "WhatsApp वर PDF",
      "पेमेंटपूर्वी माहिती तपासणी",
      "३० वर्षांचा अनुभव",
    ],
    quick: [
      { label: "7/12 उतारा", href: "/#services" },
      { label: "8A उतारा", href: "/#services" },
      { label: "गाव नकाशा", href: "/#map-reference" },
      { label: "TP / DP नकाशा", href: "/#services" },
      { label: "मिळकत पत्रिका", href: "/#services" },
      { label: "ई-फेरफार", href: "/#services" },
    ],
    legal: [
      { label: "आमच्याबद्दल", href: "/about" },
      { label: "संपर्क", href: "/contact" },
      { label: "अटी व शर्ती", href: "/terms" },
      { label: "गोपनीयता धोरण", href: "/privacy" },
      { label: "परतावा धोरण", href: "/refund" },
      { label: "अस्वीकरण", href: "/disclaimer" },
      { label: "FAQ", href: "/faq" },
      { label: "मदत केंद्र", href: "/support" },
    ],
    waMsg: "नमस्कार, मला PrintShubh सेवेबद्दल माहिती हवी आहे.",
    waCta: "WhatsApp वर बोला",
    rights: "सर्व हक्क राखीव.",
    builtFor: "महाराष्ट्रासाठी.",
  },
  en: {
    tagline:
      "Marathi-first private assistance for Maharashtra land documents — 7/12, village maps, TP/DP references. Built on official public sources.",
    quickLinksTitle: "Key Services",
    legalTitle: "Policies & Info",
    contactTitle: "Contact",
    badges: [
      "Based on official sources",
      "Not a government body",
      "PDF on WhatsApp",
      "Details verified before payment",
      "30 years of experience",
    ],
    quick: [
      { label: "7/12 Extract", href: "/#services" },
      { label: "8A Extract", href: "/#services" },
      { label: "Village Map", href: "/#map-reference" },
      { label: "TP / DP Map", href: "/#services" },
      { label: "Property Card", href: "/#services" },
      { label: "eFerfar / Mutation", href: "/#services" },
    ],
    legal: [
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Refund Policy", href: "/refund" },
      { label: "Disclaimer", href: "/disclaimer" },
      { label: "FAQ", href: "/faq" },
      { label: "Support", href: "/support" },
    ],
    waMsg: "Hello, I would like to know about PrintShubh services.",
    waCta: "Chat on WhatsApp",
    rights: "All rights reserved.",
    builtFor: "For Maharashtra.",
  },
};

export function SiteFooter() {
  const { lang } = useLang();
  const t = tx[lang];
  const year = new Date().getFullYear();
  const waHref = `https://wa.me/${SITE_CONTACT.whatsapp}?text=${encodeURIComponent(
    t.waMsg,
  )}`;
  const serviceArea =
    lang === "mr"
      ? "महाराष्ट्रभर ऑनलाइन / WhatsApp सहाय्य"
      : "Online / WhatsApp assistance across Maharashtra";

  return (
    <footer className="border-t border-slate-200 bg-slate-50 px-5 pb-10 pt-14 sm:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Trust badges */}
        <div className="mb-10 flex flex-wrap gap-2">
          {t.badges.map((b) => (
            <span
              key={b}
              className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-800"
            >
              <ShieldCheck className="size-3.5" />
              {b}
            </span>
          ))}
        </div>

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand + tagline */}
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-base font-black text-white shadow-sm">
                P
              </span>
              <span className="text-lg font-black tracking-tight text-slate-900">
                PrintShubh<span className="text-blue-600">.shop</span>
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{t.tagline}</p>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-green-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-green-700"
            >
              <MessageCircle className="size-4" />
              {t.waCta}
            </a>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-slate-500">
              {t.quickLinksTitle}
            </h4>
            <ul className="space-y-2">
              {t.quick.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm font-semibold text-slate-700 transition hover:text-blue-700"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <h4 className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-slate-500">
              {t.legalTitle}
            </h4>
            <ul className="space-y-2">
              {t.legal.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm font-semibold text-slate-700 transition hover:text-blue-700"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-slate-500">
              {t.contactTitle}
            </h4>
            <ul className="space-y-3 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 size-4 shrink-0 text-blue-700" />
                <a
                  href={`tel:${SITE_CONTACT.phoneTel}`}
                  className="font-semibold hover:text-blue-700"
                >
                  {SITE_CONTACT.phone}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 size-4 shrink-0 text-blue-700" />
                <a
                  href={`mailto:${SITE_CONTACT.email}`}
                  className="font-semibold hover:text-blue-700"
                >
                  {SITE_CONTACT.email}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-blue-700" />
                <span className="font-semibold">{serviceArea}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-slate-200 pt-6 text-xs font-semibold text-slate-500 sm:flex-row sm:items-center">
          <p>
            © {year} PrintShubh.shop · {t.rights}
          </p>
          <p>{t.builtFor}</p>
        </div>
      </div>
    </footer>
  );
}
