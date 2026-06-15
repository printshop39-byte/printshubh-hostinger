"use client";

/**
 * AnnouncementMarquee
 *
 * Top scrolling updates bar shown directly below the SiteHeader and above
 * the hero. Smooth horizontal marquee that:
 *   - loops seamlessly (the message list is rendered twice and the track is
 *     translated -50%; see `.ps-marquee` rules in globals.css),
 *   - pauses on hover / keyboard focus,
 *   - respects prefers-reduced-motion (animation disabled — the first copy
 *     stays statically readable).
 *
 * SSR note: default lang is "mr" (LanguageProvider), so the Marathi messages
 * ship in the server HTML for SEO. Brand/standard terms (PrintShubh, WhatsApp,
 * PDF) are kept as-is in both languages.
 */

import { useLang, type Lang } from "@/components/language-context";

const messages: Record<Lang, string[]> = {
  mr: [
    "7/12 उतारा ₹30 पासून",
    "8A उतारा ₹30 पासून",
    "गाव नकाशा ₹300 पासून",
    "नकाशे / प्लॅन सेवा उपलब्ध",
    "किंमत आधी कळेल — छुपी फी नाही",
    "WhatsApp वर PDF सहाय्य",
    "PrintShubh ही सरकारी वेबसाइट नाही",
  ],
  en: [
    "7/12 Extract from ₹30",
    "8A Extract from ₹30",
    "Village Map from ₹300",
    "Maps / Plans services available",
    "Know the price first — no hidden fees",
    "PDF assistance on WhatsApp",
    "PrintShubh is not a government website",
  ],
};

const ariaLabel: Record<Lang, string> = {
  mr: "ताज्या घडामोडी",
  en: "Latest updates",
};

function MessageRow({ items, ariaHidden }: { items: string[]; ariaHidden?: boolean }) {
  return (
    <ul
      className="flex shrink-0 items-center gap-8 px-4"
      aria-hidden={ariaHidden ? "true" : undefined}
    >
      {items.map((m, i) => (
        <li key={`${m}-${i}`} className="flex items-center gap-8">
          <span className="text-[13px] font-semibold leading-none">{m}</span>
          <span aria-hidden="true" className="text-blue-300/80">
            •
          </span>
        </li>
      ))}
    </ul>
  );
}

export function AnnouncementMarquee() {
  const { lang } = useLang();
  const items = messages[lang];

  return (
    <div
      className="ps-marquee group overflow-hidden border-b border-blue-800/40 bg-blue-700 text-white"
      role="region"
      aria-label={ariaLabel[lang]}
      tabIndex={0}
    >
      <div className="ps-marquee-track py-2">
        <MessageRow items={items} />
        {/* Duplicate copy completes the seamless -50% loop. */}
        <MessageRow items={items} ariaHidden />
      </div>
    </div>
  );
}
