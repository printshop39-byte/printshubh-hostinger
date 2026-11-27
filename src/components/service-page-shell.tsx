"use client";

/**
 * ServicePageShell — see ./service-jsonld.tsx for the schema half.
 *
 * Shared scaffolding for the 7 service SEO routes. Each service page
 * (server component) emits its JSON-LD via <ServiceJsonLd /> and then
 * renders its own *Content client component, which wraps this shell.
 */

import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight, Home, MessageCircle, FileText, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ServiceAreaDisclaimer } from "@/components/service-area-disclaimer";
import { WhatsAppSupportButton } from "@/components/whatsapp-support-button";
import { PricingSection } from "@/components/pricing-section";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

const homeLabel = "Home";
const servicesLabel = "Services";
const updatedLabel = "Last updated";
const ctaAsk = "Ask on WhatsApp";
const ctaPdf = "Send details for PDF";
const relatedHeading = "Related services";

export interface ServicePageShellProps {
  slug: string;
  eyebrow: string;
  title: string;
  breadcrumb?: string;
  intro: string;
  updatedAt?: string;
  whatsappMessage?: string;
  content: ReactNode;
}

export function ServicePageShell({
  slug,
  eyebrow,
  title,
  breadcrumb,
  intro,
  updatedAt,
  whatsappMessage,
  content,
}: ServicePageShellProps) {
  const msg =
    whatsappMessage ?? `Hello, I need assistance for the ${title} service.`;
  const waHrefAsk = buildWhatsAppUrl({ message: msg, campaign: slug });
  const pdfMsg = `Hello, sharing details for ${title} PDF: district / taluka / village / Gut or CTS number. Please guide further.`;
  const waHrefPdf = buildWhatsAppUrl({ message: pdfMsg, campaign: slug, content: "pdf-cta" });

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
              <span>{servicesLabel}</span>
              <ChevronRight className="size-3 text-slate-400" />
              <span className="text-slate-700">{breadcrumb ?? title}</span>
            </nav>

            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
              {eyebrow}
            </p>
            <h1 className="text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
              {title}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              {intro}
            </p>
            {updatedAt && (
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                {updatedLabel}: {updatedAt}
              </p>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href={waHrefAsk}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-green-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-green-700"
              >
                <MessageCircle className="size-4" />
                {ctaAsk}
              </a>
              <a
                href={waHrefPdf}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-blue-700 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800"
              >
                <FileText className="size-4" />
                {ctaPdf}
              </a>
            </div>
          </div>
        </section>

        <section className="px-5 pt-10 sm:px-8">
          <div className="mx-auto max-w-4xl space-y-6">
            <ServiceAreaDisclaimer variant="compact" />
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
              {content}
            </article>
            <PricingSection serviceName={title} />
            <RelatedServices slug={slug} title={relatedHeading} />
          </div>
        </section>
      </main>
      <WhatsAppSupportButton />
      <SiteFooter />
    </>
  );
}

export function ServiceSection({
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

export function ServiceList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="ml-5 list-disc space-y-1.5 text-[15px] leading-7 text-slate-700 marker:text-blue-500">
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );
}

export function ServiceFaq({
  pairs,
}: {
  pairs: Array<{ q: string; a: ReactNode }>;
}) {
  return (
    <dl className="space-y-4">
      {pairs.map((p, i) => (
        <div key={i} className="rounded-lg border border-slate-200 bg-slate-50/60 p-4">
          <dt className="text-[15px] font-black text-slate-900">{p.q}</dt>
          <dd className="mt-1.5 text-[14.5px] leading-7 text-slate-700">{p.a}</dd>
        </div>
      ))}
    </dl>
  );
}

const SERVICE_DIR: Record<string, { label: string; href: string }> = {
  "satbara-utara-maharashtra": { label: "7/12 Extract", href: "/satbara-utara-maharashtra/" },
  "8a-utara-maharashtra":      { label: "8A Extract", href: "/8a-utara-maharashtra/" },
  "gav-nakasha-maharashtra":   { label: "Village Map", href: "/gav-nakasha-maharashtra/" },
  "dp-map-maharashtra":        { label: "DP Map / TP Map", href: "/dp-map-maharashtra/" },
  "milkat-patrika-maharashtra":{ label: "Property Card", href: "/milkat-patrika-maharashtra/" },
  "e-ferfar-maharashtra":      { label: "E-Ferfar (Mutation)", href: "/e-ferfar-maharashtra/" },
  "jameen-report-maharashtra": { label: "Land Report", href: "/jameen-report-maharashtra/" },
};

const SERVICE_INTERNAL_LINKS: Record<string, string[]> = {
  "satbara-utara-maharashtra":  ["8a-utara-maharashtra", "e-ferfar-maharashtra", "jameen-report-maharashtra"],
  "8a-utara-maharashtra":       ["satbara-utara-maharashtra", "e-ferfar-maharashtra", "jameen-report-maharashtra"],
  "gav-nakasha-maharashtra":    ["dp-map-maharashtra", "satbara-utara-maharashtra", "milkat-patrika-maharashtra"],
  "dp-map-maharashtra":         ["gav-nakasha-maharashtra", "milkat-patrika-maharashtra", "jameen-report-maharashtra"],
  "milkat-patrika-maharashtra": ["satbara-utara-maharashtra", "dp-map-maharashtra", "jameen-report-maharashtra"],
  "e-ferfar-maharashtra":       ["satbara-utara-maharashtra", "8a-utara-maharashtra", "jameen-report-maharashtra"],
  "jameen-report-maharashtra":  ["satbara-utara-maharashtra", "milkat-patrika-maharashtra", "gav-nakasha-maharashtra"],
};

function RelatedServices({ slug, title }: { slug: string; title: string }) {
  const related = (SERVICE_INTERNAL_LINKS[slug] ?? []).map((s) => SERVICE_DIR[s]).filter(Boolean);
  if (related.length === 0) return null;

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
      <h2 className="mb-3 text-base font-black text-slate-900 sm:text-lg">{title}</h2>
      <ul className="grid gap-2 sm:grid-cols-3">
        {related.map((r) => (
          <li key={r.href}>
            <Link
              href={r.href}
              className="group inline-flex w-full items-center justify-between gap-2 min-h-[44px] rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-800 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800"
            >
              <span>{r.label}</span>
              <ArrowRight className="size-4 shrink-0 opacity-60 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
