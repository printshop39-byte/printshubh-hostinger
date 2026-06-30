"use client";

/**
 * MobileBottomNav — app-style sticky bottom bar, mobile only (md:hidden).
 *
 * Gives 1-tap access to the four primary actions from anywhere. The WhatsApp
 * tab is green (brand recognition) and fires the Meta "Contact" event. On
 * mobile this replaces the floating WhatsApp button (hidden < md); the
 * price-assistant launcher stays (it floats above this bar).
 *
 * Layout adds pb-16 on mobile so this bar never covers footer content.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calculator, FileText, Home, MessageCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLang, type Lang } from "@/components/language-context";
import { trackWhatsAppLead } from "@/components/meta-pixel";

const WA_MESSAGE: Record<Lang, string> = {
  mr: "नमस्कार PrintShubh, मला जमीन कागदपत्र सेवेसाठी मदत हवी आहे.",
  en: "Hello PrintShubh, I need help with a land-document service.",
};

interface Item {
  icon: LucideIcon;
  label: Record<Lang, string>;
  href: string;
  external?: boolean;
  whatsapp?: boolean;
}

const items: Item[] = [
  { icon: Home, label: { mr: "होम", en: "Home" }, href: "/" },
  { icon: FileText, label: { mr: "सेवा", en: "Services" }, href: "/#unified-form" },
  { icon: Calculator, label: { mr: "साधने", en: "Tools" }, href: "/#tools" },
];

export function MobileBottomNav() {
  const { lang } = useLang();
  const pathname = usePathname();

  const waHref = `https://wa.me/918625801907?text=${encodeURIComponent(
    WA_MESSAGE[lang],
  )}&utm_source=printshubh&utm_medium=whatsapp&utm_campaign=bottom-nav`;

  return (
    <nav
      aria-label={lang === "mr" ? "मुख्य नेव्हिगेशन" : "Primary navigation"}
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_10px_rgba(0,0,0,0.06)] md:hidden"
    >
      {items.map(({ icon: Icon, label, href }) => {
        const active = pathname === href || (href === "/" && pathname === "/");
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 transition active:scale-95 ${
              active ? "text-blue-700" : "text-slate-600"
            }`}
          >
            <Icon size={22} strokeWidth={2} aria-hidden="true" />
            <span className="text-[11px] font-bold">{label[lang]}</span>
          </Link>
        );
      })}
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackWhatsAppLead()}
        className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-green-600 transition active:scale-95"
      >
        <MessageCircle size={22} strokeWidth={2} aria-hidden="true" />
        <span className="text-[11px] font-bold">WhatsApp</span>
      </a>
    </nav>
  );
}
