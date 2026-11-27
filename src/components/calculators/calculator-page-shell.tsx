"use client";

/**
 * CalculatorPageShell — the calculator counterpart to ServicePageShell.
 *
 * The service shell is sales-oriented (pricing + WhatsApp-PDF CTAs). The
 * free finance tools (EMI, stamp duty, ready reckoner, …) want the same
 * header/footer/breadcrumb chrome but lead with the interactive widget,
 * then SEO prose, then an indicative-only disclaimer. This shell provides
 * exactly that and is reused by every tool route.
 */

import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight, Home, Calculator } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { IndicativeDisclaimer } from "@/components/calculators/indicative-disclaimer";

const homeLabel = "Home";
const toolsLabel = "Tools";
const updatedLabel = "Last updated";

export interface CalculatorPageShellProps {
  eyebrow: string;
  title: string;
  breadcrumb: string;
  intro: string;
  updatedAt?: string;
  /** The interactive calculator widget — rendered first, inside its own card. */
  calculator: ReactNode;
  /** SEO prose rendered below the calculator. */
  content: ReactNode;
  /** Optional extra line appended to the standard indicative disclaimer. */
  disclaimerExtra?: string;
}

export function CalculatorPageShell({
  eyebrow,
  title,
  breadcrumb,
  intro,
  updatedAt,
  calculator,
  content,
  disclaimerExtra,
}: CalculatorPageShellProps) {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen overflow-x-hidden bg-[#f7fbff] pb-24 text-slate-900">
        <section className="border-b border-slate-200 bg-white px-5 pb-10 pt-12 sm:px-8 sm:pt-16">
          <div className="mx-auto max-w-4xl">
            <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <Link href="/" className="inline-flex items-center gap-1 py-3.5 -my-3.5 transition hover:text-blue-700">
                <Home className="size-3.5" />
                {homeLabel}
              </Link>
              <ChevronRight className="size-3 text-slate-400" />
              <span>{toolsLabel}</span>
              <ChevronRight className="size-3 text-slate-400" />
              <span className="text-slate-700">{breadcrumb}</span>
            </nav>

            <p className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
              <Calculator className="size-3.5" />
              {eyebrow}
            </p>
            <h1 className="text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
              {title}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">{intro}</p>
            {updatedAt && (
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                {updatedLabel}: {updatedAt}
              </p>
            )}
          </div>
        </section>

        <section className="px-5 pt-10 sm:px-8">
          <div className="mx-auto max-w-4xl space-y-6">
            {/* The widget leads. */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              {calculator}
            </div>

            <IndicativeDisclaimer extra={disclaimerExtra} />

            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
              {content}
            </article>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
