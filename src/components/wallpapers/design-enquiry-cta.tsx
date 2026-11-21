"use client";

import { MessageCircle } from "lucide-react";
import { trackWhatsAppLead } from "@/components/meta-pixel";
import { trackFunnelEvent } from "@/lib/analytics";

/**
 * "Enquire about this design" button. The WhatsApp link (design name, ID,
 * category and a link back) is built on the server and passed in; this
 * component only adds the click tracking. The funnel event carries categorical
 * properties only (see SafeAnalyticsProperties) — the design ID travels in the
 * link's utm_content, not in analytics.
 */
export function DesignEnquiryCta({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => {
        trackWhatsAppLead();
        trackFunnelEvent("collection_whatsapp_click", {
          lang: "en",
          surface: "wallpaper-catalogue",
          service_key: "wallpaper-design",
        });
      }}
      className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-6 text-base font-black text-white shadow-sm transition hover:bg-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-800 sm:w-auto"
    >
      <MessageCircle className="size-5" aria-hidden="true" />
      {label}
    </a>
  );
}
