"use client";

/**
 * LegalPageShell
 * Consistent wrapper for /about /contact /terms /privacy /refund /disclaimer
 * /faq /support. Renders:
 *   - SiteHeader
 *   - Hero band with the page heading
 *   - ServiceAreaDisclaimer (compact) banner at the top of the page
 *     (on by default; /about and /contact switch it off)
 *   - English content slot (the public site is English-only)
 *   - Floating WhatsApp Support button
 *   - SiteFooter
 */

import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ServiceAreaDisclaimer } from "@/components/service-area-disclaimer";
import { WhatsAppSupportButton } from "@/components/whatsapp-support-button";

interface LegalPageShellProps {
  title: string;
  intro?: string;
  breadcrumb?: string;
  /** Page content. Use plain React nodes for full layout control. */
  content: ReactNode;
  /** Last-updated date string (already localized or just ISO). */
  updatedAt?: string;
  /** Show the "not a government body" banner. Defaults to true. */
  showServiceDisclaimer?: boolean;
}

const homeLabel = "Home";
const updatedLabel = "Last updated";

export function LegalPageShell({
  title,
  intro,
  breadcrumb,
  content,
  updatedAt,
  showServiceDisclaimer = true,
}: LegalPageShellProps) {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen overflow-x-hidden bg-brand-cream pb-24 text-slate-900">
        {/* Hero band */}
        <section className="border-b border-slate-200 bg-brand-cream px-5 pb-10 pt-12 sm:px-8 sm:pt-16">
          <div className="mx-auto max-w-4xl">
            {/* Breadcrumb */}
            <nav className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <Link
                href="/"
                className="inline-flex items-center gap-1 py-3.5 -my-3.5 transition hover:text-brand-navy"
              >
                <Home className="size-3.5" />
                {homeLabel}
              </Link>
              <ChevronRight className="size-3 text-slate-400" />
              <span className="text-slate-700">
                {breadcrumb ?? title}
              </span>
            </nav>

            <h1 className="text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
              {title}
            </h1>
            {intro && (
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                {intro}
              </p>
            )}
            {updatedAt && (
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                {updatedLabel}: {updatedAt}
              </p>
            )}
          </div>
        </section>

        {/* Body */}
        <section className="px-5 pt-10 sm:px-8">
          <div className="mx-auto max-w-4xl space-y-6">
            {showServiceDisclaimer && <ServiceAreaDisclaimer variant="compact" />}
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
              {content}
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
    <ul className="ml-5 list-disc space-y-1.5 text-[15px] leading-7 text-slate-700 marker:text-brand-gold">
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );
}
