"use client";

/**
 * LegalPageShell
 * Consistent wrapper for /about /contact /terms /privacy /refund /disclaimer
 * /faq /support. Renders:
 *   - SiteHeader (with lang toggle)
 *   - Hero band with Marathi-first heading
 *   - ServiceAreaDisclaimer (compact) banner at the top of the page
 *   - Marathi or English content slot (controlled by useLang)
 *   - Floating WhatsApp Support button
 *   - SiteFooter
 */

import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { useLang, type Lang } from "@/components/language-context";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ServiceAreaDisclaimer } from "@/components/service-area-disclaimer";
import { WhatsAppSupportButton } from "@/components/whatsapp-support-button";

interface LegalPageShellProps {
  title: { mr: string; en: string };
  intro?: { mr: string; en: string };
  breadcrumb?: { mr: string; en: string };
  /** Marathi content. Use plain React nodes for full layout control. */
  contentMr: ReactNode;
  /** English content. */
  contentEn: ReactNode;
  /** Last-updated date string (already localized or just ISO). */
  updatedAt?: string;
}

const homeLabel: Record<Lang, string> = { mr: "मुख्यपृष्ठ", en: "Home" };
const updatedLabel: Record<Lang, string> = {
  mr: "शेवटचा बदल",
  en: "Last updated",
};

export function LegalPageShell({
  title,
  intro,
  breadcrumb,
  contentMr,
  contentEn,
  updatedAt,
}: LegalPageShellProps) {
  const { lang } = useLang();
  const t = lang === "mr" ? "mr" : "en";

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[#f7fbff] pb-24 text-slate-900">
        {/* Hero band */}
        <section className="border-b border-slate-200 bg-white px-5 pb-10 pt-12 sm:px-8 sm:pt-16">
          <div className="mx-auto max-w-4xl">
            {/* Breadcrumb */}
            <nav className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <Link
                href="/"
                className="inline-flex items-center gap-1 transition hover:text-blue-700"
              >
                <Home className="size-3.5" />
                {homeLabel[t]}
              </Link>
              <ChevronRight className="size-3 text-slate-400" />
              <span className="text-slate-700">
                {(breadcrumb ?? title)[t]}
              </span>
            </nav>

            <h1 className="text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
              {title[t]}
            </h1>
            {intro && (
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                {intro[t]}
              </p>
            )}
            {updatedAt && (
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                {updatedLabel[t]}: {updatedAt}
              </p>
            )}
          </div>
        </section>

        {/* Body */}
        <section className="px-5 pt-10 sm:px-8">
          <div className="mx-auto max-w-4xl space-y-6">
            <ServiceAreaDisclaimer variant="compact" />
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
              {lang === "mr" ? contentMr : contentEn}
            </article>
          </div>
        </section>
      </main>
      <WhatsAppSupportButton />
      <SiteFooter />
    </>
  );
}

/* ── Small typographic helpers shared by every legal page ─────────────── */

export function LegalSection({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-7 last:mb-0">
      <h2 className="mb-2.5 text-lg font-black text-slate-950 sm:text-xl">
        {heading}
      </h2>
      <div className="space-y-3 text-[15px] leading-7 text-slate-700">
        {children}
      </div>
    </section>
  );
}

export function LegalList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="ml-5 list-disc space-y-1.5 text-[15px] leading-7 text-slate-700 marker:text-blue-500">
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );
}
