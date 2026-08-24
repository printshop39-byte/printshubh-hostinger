"use client";

/**
 * MobileBottomNav — app-style sticky bottom bar, mobile only (md:hidden).
 *
 * The three actions a walk-in customer actually wants are WhatsApp, Call and
 * Directions, so those own the bar; Home keeps navigation one tap away.
 *
 * Directions appears only once SHOP_ADDRESS is filled in
 * (src/lib/shop-profile.ts). Until then its slot is taken by Services, so
 * the bar is never a dead button and never points at an address nobody has
 * confirmed.
 *
 * Layout adds pb-16 on mobile so this bar never covers footer content.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Home, MessageCircle, Navigation, Phone } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLang, type Lang } from "@/components/language-context";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { trackWhatsAppLead } from "@/components/meta-pixel";
import { SHOP_ADDRESS } from "@/lib/shop-profile";
import { SITE_CONTACT } from "@/components/site-footer";

const WA_MESSAGE: Record<Lang, string> = {
  mr: "नमस्कार PrintShubh, मला सेवेबद्दल मदत हवी आहे.",
  en: "Hello PrintShubh, I need help with a service.",
};

const label = {
  home: { mr: "होम", en: "Home" },
  services: { mr: "सेवा", en: "Services" },
  call: { mr: "कॉल", en: "Call" },
  directions: { mr: "दिशा", en: "Directions" },
} satisfies Record<string, Record<Lang, string>>;

const tabClass =
  "flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 transition active:scale-95 motion-reduce:active:scale-100";

function TabLabel({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <>
      <Icon size={21} strokeWidth={2} aria-hidden="true" />
      <span className="text-[11px] font-bold">{text}</span>
    </>
  );
}

export function MobileBottomNav() {
  const { lang } = useLang();
  const pathname = usePathname();

  const waHref = buildWhatsAppUrl({ message: WA_MESSAGE[lang], campaign: "bottom-nav" });
  const atHome = pathname === "/";

  return (
    <nav
      aria-label={lang === "mr" ? "मुख्य नेव्हिगेशन" : "Primary navigation"}
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_10px_rgba(0,0,0,0.06)] md:hidden"
    >
      <Link
        href="/"
        className={`${tabClass} ${atHome ? "text-blue-700" : "text-slate-600"}`}
      >
        <TabLabel icon={Home} text={label.home[lang]} />
      </Link>

      {SHOP_ADDRESS ? (
        <a
          href={SHOP_ADDRESS.directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`${tabClass} text-slate-600`}
        >
          <TabLabel icon={Navigation} text={label.directions[lang]} />
        </a>
      ) : (
        <Link href="/#services" className={`${tabClass} text-slate-600`}>
          <TabLabel icon={FileText} text={label.services[lang]} />
        </Link>
      )}

      <a href={`tel:${SITE_CONTACT.phoneTel}`} className={`${tabClass} text-slate-600`}>
        <TabLabel icon={Phone} text={label.call[lang]} />
      </a>

      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackWhatsAppLead()}
        className={`${tabClass} text-green-600`}
      >
        <TabLabel icon={MessageCircle} text="WhatsApp" />
      </a>
    </nav>
  );
}
