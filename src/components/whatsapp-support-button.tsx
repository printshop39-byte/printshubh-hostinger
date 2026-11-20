"use client";

/**
 * WhatsAppSupportButton
 * Floating round button on the bottom-right of legal/support pages.
 * Builds its link via the canonical buildWhatsAppUrl helper.
 *
 * `hideNear` (optional): CSS selectors of page regions that already carry
 * their own WhatsApp call to action or controls the button would cover (the
 * homepage passes its CAD, enquiry and collections sections and the footer).
 * While any of them is on screen the button is hidden (and un-focusable); it
 * comes back when they scroll away. Without the prop nothing changes, which
 * is how every other page uses it.
 */

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { trackWhatsAppLead } from "@/components/meta-pixel";

const msg: string = "Hello, I need help with PrintShubh services.";

const label: string = "WhatsApp Support";

export function WhatsAppSupportButton({ hideNear }: { hideNear?: string[] }) {
  const [covering, setCovering] = useState(false);
  const selectorKey = hideNear?.join(",") ?? "";

  useEffect(() => {
    if (!selectorKey || typeof IntersectionObserver === "undefined") return;
    const els = selectorKey
      .split(",")
      .map((s) => document.querySelector(s))
      .filter((el): el is Element => el !== null);
    if (els.length === 0) return;

    const visible = new Set<Element>();
    // Only the strip along the bottom of the screen matters: that is where
    // the button sits, so a region that is merely on screen elsewhere does
    // not hide it.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target);
          else visible.delete(entry.target);
        }
        setCovering(visible.size > 0);
      },
      { rootMargin: "-86% 0px 0px 0px" },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [selectorKey]);
  const href = buildWhatsAppUrl({ message: msg, campaign: "floating-support" });

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackWhatsAppLead()}
      aria-label={label}
      className={`fixed bottom-5 right-5 z-50 hidden h-14 items-center justify-center gap-2 rounded-full bg-green-600 px-5 text-sm font-black text-white shadow-lg shadow-green-600/30 transition hover:bg-green-700 md:inline-flex md:bottom-7 md:right-7 motion-reduce:transition-none ${
        covering ? "pointer-events-none md:invisible md:opacity-0" : ""
      }`}
    >
      <MessageCircle className="size-5" />
      <span className="hidden sm:inline">{label}</span>
    </a>
  );
}
