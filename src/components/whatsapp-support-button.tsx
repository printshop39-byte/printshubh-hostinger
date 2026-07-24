"use client";

/**
 * WhatsAppSupportButton
 * Floating round button on the bottom-right of legal/support pages.
 * Builds its link via the canonical buildWhatsAppUrl helper.
 */

import { MessageCircle } from "lucide-react";
import { useLang, type Lang } from "@/components/language-context";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { trackWhatsAppLead } from "@/components/meta-pixel";

const msg: Record<Lang, string> = {
  mr: "नमस्कार, मला PrintShubh सेवेबद्दल मदत हवी आहे.",
  en: "Hello, I need help with PrintShubh services.",
};

const label: Record<Lang, string> = {
  mr: "WhatsApp वर मदत",
  en: "WhatsApp Support",
};

export function WhatsAppSupportButton() {
  const { lang } = useLang();
  const href = buildWhatsAppUrl({ message: msg[lang], campaign: "floating-support" });

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackWhatsAppLead()}
      aria-label={label[lang]}
      className="fixed bottom-5 right-5 z-50 hidden h-14 items-center justify-center gap-2 rounded-full bg-green-600 px-5 text-sm font-black text-white shadow-lg shadow-green-600/30 transition hover:bg-green-700 md:inline-flex md:bottom-7 md:right-7"
    >
      <MessageCircle className="size-5" />
      <span className="hidden sm:inline">{label[lang]}</span>
    </a>
  );
}
