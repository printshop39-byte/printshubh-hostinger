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

import { usePathname } from "next/navigation";
import { useLang, type Lang } from "@/components/language-context";

/* The land-document promo lines (7/12, 8A, Village Map, Maps/Plans) that
 * used to run here were removed as part of the shop/print-studio ->
 * Premium Print & Visual Studio repositioning (owner decision) — see
 * src/app/page.tsx. Those pages are still live; they're just no longer
 * advertised sitewide. First line now promotes the 7 Premium Collections
 * instead. The "not a government website" line was dropped from this
 * premium-facing bar too; the disclaimer stays on the land-document pages and
 * in the footer, where it applies. */
const messages: Record<Lang, string[]> = {
  mr: [
    "वॉलपेपर, कॅनव्हास, वॉल आर्ट व अधिक — Premium Collections",
    "किंमत आधी कळेल — छुपी फी नाही",
    "WhatsApp वर PDF सहाय्य",
  ],
  en: [
    "Wallpaper, canvas, wall art & more — Premium Collections",
    "Know the price first — no hidden fees",
    "PDF assistance on WhatsApp",
  ],
};

/* The homepage is the print studio, so its third line asks for the print file.
 * "PDF assistance on WhatsApp" is the land-document wording and stays on every
 * other route exactly as it was. */
const homeLastLine: Record<Lang, string> = {
  mr: "प्रिंट फाइल WhatsApp वर पाठवा",
  en: "Send your print file on WhatsApp",
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
          <span className="text-[11.5px] font-semibold leading-none">{m}</span>
          <span aria-hidden="true" className="text-brand-gold/80">
            •
          </span>
        </li>
      ))}
    </ul>
  );
}

export function AnnouncementMarquee() {
  const { lang } = useLang();
  const isHome = usePathname() === "/";
  const items = isHome ? [...messages[lang].slice(0, -1), homeLastLine[lang]] : messages[lang];

  return (
    <div
      className="ps-marquee group overflow-hidden border-b border-brand-gold/30 bg-brand-navy text-white"
      role="region"
      aria-label={ariaLabel[lang]}
      tabIndex={0}
    >
      <div className="ps-marquee-track py-1.5">
        <MessageRow items={items} />
        {/* Duplicate copy completes the seamless -50% loop. */}
        <MessageRow items={items} ariaHidden />
      </div>
    </div>
  );
}
