"use client";

/**
 * MobileBottomNav — app-style sticky bottom bar, mobile only (md:hidden).
 *
 * Content-discovery taxonomy: Home, Collections (#collections), Call and
 * WhatsApp.
 * Directions was deliberately dropped — it's already reachable via
 * VisitShop, the footer and the Google Business Profile. Call stays: it's
 * the lowest-friction path for the shop's older, less web-savvy walk-in
 * customers, and unlike Collections/Tools it has no other persistent
 * mobile surface (WhatsAppSupportButton is desktop-only).
 *
 * The Documents tab (→ /#land-documents) was removed when LandDocuments and
 * UnifiedRecordForm came off the homepage (owner repositioning decision) —
 * its target anchor no longer exists on this page. The Maps tab (→ /#maps)
 * was removed the same way when MapPromo came off the homepage too (same
 * repositioning, Premium Print & Visual Studio) — that anchor is also gone.
 *
 * Hrefs are root-relative (/#id) because this bar is mounted in the root
 * layout and renders on every route, not just "/".
 *
 * Layout adds pb-16 on mobile so this bar never covers footer content.
 */

import Link from "next/link";
import { HashLink } from "@/components/hash-link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, MessageCircle, Phone } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { isHomePath } from "@/lib/home-path";
import { trackWhatsAppLead } from "@/components/meta-pixel";
import { SITE_CONTACT } from "@/components/site-footer";

const WA_MESSAGE: string = "Hello PrintShubh, I need help with a service.";

const label = {
  home: "Home",
  collections: "Collections",
  call: "Call",
};

const tabClass =
  "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-0.5 py-2.5 transition active:scale-95 motion-reduce:active:scale-100";

function TabLabel({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <>
      <Icon size={20} strokeWidth={2} aria-hidden="true" />
      <span className="w-full truncate text-center text-[11px] font-semibold">{text}</span>
    </>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();

  const waHref = buildWhatsAppUrl({ message: WA_MESSAGE, campaign: "bottom-nav" });
  const atHome = isHomePath(pathname);

  // Admin screens are tools for the owner, not customer pages: the public
  // Home / Collections / Call / WhatsApp bar must not sit on top of their
  // buttons. (Only affects /admin routes; every public page is unchanged.)
  if (pathname === "/admin" || pathname?.startsWith("/admin/")) return null;

  return (
    <nav
      aria-label="Primary navigation"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-brand-gold/40 bg-forest pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(10,43,33,0.3)] md:hidden"
    >
      <Link
        href="/"
        aria-current={atHome ? "page" : undefined}
        className={`${tabClass} ${atHome ? "text-brand-gold" : "text-ivory/85"}`}
      >
        <TabLabel icon={Home} text={label.home} />
      </Link>

      <HashLink href="/#collections" className={`${tabClass} text-ivory/85`}>
        <TabLabel icon={LayoutGrid} text={label.collections} />
      </HashLink>

      <a href={`tel:${SITE_CONTACT.phoneTel}`} className={`${tabClass} text-ivory/85`}>
        <TabLabel icon={Phone} text={label.call} />
      </a>

      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackWhatsAppLead()}
        className={`${tabClass} text-brand-gold`}
      >
        <TabLabel icon={MessageCircle} text="WhatsApp" />
      </a>
    </nav>
  );
}
