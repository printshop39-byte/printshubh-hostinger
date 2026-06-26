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
import { useLang, type Lang } from "@/components/language-context";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { IndicativeDisclaimer } from "@/components/calculators/indicative-disclaimer";

const homeLabel: Record<Lang, string> = { mr: "मुख्यपृष्ठ", en: "Home" };
const toolsLabel: Record<Lang, string> = { mr: "साधने", en: "Tools" };
const updatedLabel: Record<Lang, string> = { mr: "शेवटचा बदल", en: "Last updated" };

export interface CalculatorPageShellProps {
  eyebrow: { mr: string; en: string };
  title: { mr: string; en: string };
  breadcrumb: { mr: string; en: string };
  intro: { mr: string; en: string };
  updatedAt?: { mr: string; en: string };
  /** The interactive calculator widget — rendered first, inside its own card. */
  calculator: ReactNode;
  /** Language-specific SEO prose rendered below the calculator. */
  contentMr: ReactNode;
  contentEn: ReactNode;
  /** Optional extra line appended to the standard indicative disclaimer. */
  disclaimerExtra?: { mr: string; en: string };
}

export function CalculatorPageShell({
  eyebrow,
  title,
  breadcrumb,
  intro,
  updatedAt,
  calculator,
  contentMr,
  contentEn,
  disclaimerExtra,
}: CalculatorPageShellProps) {
  const { lang } = useLang();
  const t: Lang = lang === "mr" ? "mr" : "en";

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen overflow-x-hidden bg-[#f7fbff] pb-24 text-slate-900">
        <section className="border-b border-slate-200 bg-white px-5 pb-10 pt-12 sm:px-8 sm:pt-16">
          <div className="mx-auto max-w-4xl">
            <nav className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <Link href="/" className="inline-flex items-center gap-1 transition hover:text-blue-700">
                <Home className="size-3.5" />
                {homeLabel[t]}
              </Link>
              <ChevronRight className="size-3 text-slate-400" />
              <span>{toolsLabel[t]}</span>
              <ChevronRight className="size-3 text-slate-400" />
              <span className="text-slate-700">{breadcrumb[t]}</span>
            </nav>

            <p className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
              <Calculator className="size-3.5" />
              {eyebrow[t]}
            </p>
            <h1 className="text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
              {title[t]}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">{intro[t]}</p>
            {updatedAt && (
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                {updatedLabel[t]}: {updatedAt[t]}
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
              {t === "mr" ? contentMr : contentEn}
            </article>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
