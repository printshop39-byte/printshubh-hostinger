"use client";

/**
 * MobileBottomNav — app-style sticky bottom bar, mobile only (md:hidden).
 *
 * Content-discovery taxonomy: Home, Documents (#land-documents), Maps
 * (#maps), Call and WhatsApp. Directions was deliberately dropped — it's
 * already reachable via VisitShop, the footer and the Google Business
 * Profile, and a "नकाशे" (Maps, documents) tab next to a "दिशा" (Directions)
 * tab reads as the same word twice in Marathi. Call stays: it's the lowest-
 * friction path for the shop's older, land-document-anxious walk-in
 * customers, and unlike Documents/Maps/Tools it has no other persistent
 * mobile surface (WhatsAppSupportButton is desktop-only).
 *
 * Hrefs are root-relative (/#id) because this bar is mounted in the root
 * layout and renders on every route, not just "/".
 *
 * Layout adds pb-16 on mobile so this bar never covers footer content.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Home, Map, MessageCircle, Phone } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLang, type Lang } from "@/components/language-context";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { trackWhatsAppLead } from "@/components/meta-pixel";
import { SITE_CONTACT } from "@/components/site-footer";

const WA_MESSAGE: Record<Lang, string> = {
  mr: "नमस्कार PrintShubh, मला सेवेबद्दल मदत हवी आहे.",
  en: "Hello PrintShubh, I need help with a service.",
};

const label = {
  home: { mr: "होम", en: "Home" },
  documents: { mr: "कागदपत्रे", en: "Docs" },
  maps: { mr: "नकाशे", en: "Maps" },
  call: { mr: "कॉल", en: "Call" },
} satisfies Record<string, Record<Lang, string>>;

const tabClass =
  "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-0.5 py-2.5 transition active:scale-95 motion-reduce:active:scale-100";

function TabLabel({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <>
      <Icon size={20} strokeWidth={2} aria-hidden="true" />
      <span className="w-full truncate text-center text-[10px] font-bold">{text}</span>
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
        aria-current={atHome ? "page" : undefined}
        className={`${tabClass} ${atHome ? "text-blue-700" : "text-slate-600"}`}
      >
        <TabLabel icon={Home} text={label.home[lang]} />
      </Link>

      <Link href="/#land-documents" className={`${tabClass} text-slate-600`}>
        <TabLabel icon={FileText} text={label.documents[lang]} />
      </Link>

      <Link href="/#maps" className={`${tabClass} text-slate-600`}>
        <TabLabel icon={Map} text={label.maps[lang]} />
      </Link>

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
