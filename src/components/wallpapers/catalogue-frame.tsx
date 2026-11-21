import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppSupportButton } from "@/components/whatsapp-support-button";
import { SITE_URL } from "@/lib/wallpapers/catalogue";

/** Page chrome shared by every catalogue route: header, footer, floating WhatsApp. */
export function CatalogueFrame({
  children,
  hideButtonNear,
}: {
  children: ReactNode;
  /** Regions that already carry their own WhatsApp CTA (hides the floating one there). */
  hideButtonNear?: string[];
}) {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen overflow-x-hidden bg-brand-cream pb-24 text-slate-900">{children}</main>
      <WhatsAppSupportButton hideNear={hideButtonNear ?? ["footer"]} />
      <SiteFooter />
    </>
  );
}

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items, tone = "light" }: { items: Crumb[]; tone?: "light" | "dark" }) {
  const dark = tone === "dark";
  return (
    <nav
      aria-label="Breadcrumb"
      className={`mb-3 flex flex-wrap items-center gap-1.5 text-xs font-semibold ${dark ? "text-white/80" : "text-slate-500"}`}
    >
      <Link
        href="/"
        className={`inline-flex items-center gap-1 py-3.5 -my-3.5 transition ${dark ? "hover:text-white" : "hover:text-brand-navy"}`}
      >
        <Home className="size-3.5" aria-hidden="true" />
        Home
      </Link>
      {items.map((c) => (
        <span key={c.label} className="inline-flex items-center gap-1.5">
          <ChevronRight className={`size-3 ${dark ? "text-white/50" : "text-slate-400"}`} aria-hidden="true" />
          {c.href ? (
            <Link
              href={c.href}
              className={`py-3.5 -my-3.5 transition ${dark ? "hover:text-white" : "hover:text-brand-navy"}`}
            >
              {c.label}
            </Link>
          ) : (
            <span className={dark ? "text-white" : "text-slate-700"} aria-current="page">
              {c.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}

/** Valid schema.org BreadcrumbList: Home › Wallpaper Designs › … */
export function BreadcrumbJsonLd({ items }: { items: Array<{ name: string; path: string }> }) {
  const ld = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...items].map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.path === "/" ? "/" : it.path}`,
    })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />;
}
