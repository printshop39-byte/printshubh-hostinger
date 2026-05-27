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
import { useLang, type Lang } from "@/components/language-context";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ServiceAreaDisclaimer } from "@/components/service-area-disclaimer";
import { WhatsAppSupportButton } from "@/components/whatsapp-support-button";

const homeLabel: Record<Lang, string> = { mr: "मुख्यपृष्ठ", en: "Home" };
const servicesLabel: Record<Lang, string> = { mr: "सेवा", en: "Services" };
const updatedLabel: Record<Lang, string> = {
  mr: "शेवटचा बदल",
  en: "Last updated",
};
const ctaAsk: Record<Lang, string> = {
  mr: "WhatsApp वर विचारा",
  en: "Ask on WhatsApp",
};
const ctaPdf: Record<Lang, string> = {
  mr: "PDF साठी माहिती पाठवा",
  en: "Send details for PDF",
};
const relatedHeading: Record<Lang, string> = {
  mr: "संबंधित सेवा",
  en: "Related services",
};

export interface ServicePageShellProps {
  slug: string;
  eyebrow: { mr: string; en: string };
  title: { mr: string; en: string };
  breadcrumb?: { mr: string; en: string };
  intro: { mr: string; en: string };
  updatedAt?: string;
  whatsappMessage?: { mr: string; en: string };
  contentMr: ReactNode;
  contentEn: ReactNode;
}

export function ServicePageShell({
  slug,
  eyebrow,
  title,
  breadcrumb,
  intro,
  updatedAt,
  whatsappMessage,
  contentMr,
  contentEn,
}: ServicePageShellProps) {
  const { lang } = useLang();
  const t = lang === "mr" ? "mr" : "en";

  const msg =
    whatsappMessage?.[t] ??
    (lang === "mr"
      ? `नमस्कार, मला ${title.mr} सेवेसाठी सहाय्य हवे आहे.`
      : `Hello, I need assistance for the ${title.en} service.`);
  const utm = `utm_source=printshubh&utm_medium=whatsapp&utm_campaign=${encodeURIComponent(slug)}`;
  const waHrefAsk = `https://wa.me/918625801907?text=${encodeURIComponent(msg)}&${utm}`;
  const pdfMsg =
    lang === "mr"
      ? `नमस्कार, ${title.mr} ची PDF साठी माहिती पाठवत आहे: जिल्हा / तालुका / गाव / गट किंवा CTS नंबर. कृपया मार्गदर्शन करा.`
      : `Hello, sharing details for ${title.en} PDF: district / taluka / village / Gut or CTS number. Please guide further.`;
  const waHrefPdf = `https://wa.me/918625801907?text=${encodeURIComponent(pdfMsg)}&${utm}&utm_content=pdf-cta`;

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[#f7fbff] pb-24 text-slate-900">
        <section className="border-b border-slate-200 bg-white px-5 pb-10 pt-12 sm:px-8 sm:pt-16">
          <div className="mx-auto max-w-4xl">
            <nav className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <Link href="/" className="inline-flex items-center gap-1 transition hover:text-blue-700">
                <Home className="size-3.5" />
                {homeLabel[t]}
              </Link>
              <ChevronRight className="size-3 text-slate-400" />
              <span>{servicesLabel[t]}</span>
              <ChevronRight className="size-3 text-slate-400" />
              <span className="text-slate-700">{(breadcrumb ?? title)[t]}</span>
            </nav>

            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
              {eyebrow[t]}
            </p>
            <h1 className="text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
              {title[t]}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              {intro[t]}
            </p>
            {updatedAt && (
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                {updatedLabel[t]}: {updatedAt}
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
                {ctaAsk[t]}
              </a>
              <a
                href={waHrefPdf}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-blue-700 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800"
              >
                <FileText className="size-4" />
                {ctaPdf[t]}
              </a>
            </div>
          </div>
        </section>

        <section className="px-5 pt-10 sm:px-8">
          <div className="mx-auto max-w-4xl space-y-6">
            <ServiceAreaDisclaimer variant="compact" />
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
              {lang === "mr" ? contentMr : contentEn}
            </article>
            <RelatedServices slug={slug} lang={t} title={relatedHeading[t]} />
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

const SERVICE_DIR: Record<string, { mr: string; en: string; href: string }> = {
  "satbara-utara-maharashtra": { mr: "7/12 उतारा", en: "7/12 Extract", href: "/satbara-utara-maharashtra/" },
  "8a-utara-maharashtra":      { mr: "8A उतारा", en: "8A Extract", href: "/8a-utara-maharashtra/" },
  "gav-nakasha-maharashtra":   { mr: "गाव नकाशा", en: "Village Map", href: "/gav-nakasha-maharashtra/" },
  "dp-map-maharashtra":        { mr: "DP Map / TP Map", en: "DP Map / TP Map", href: "/dp-map-maharashtra/" },
  "milkat-patrika-maharashtra":{ mr: "मिळकत पत्रिका", en: "Property Card", href: "/milkat-patrika-maharashtra/" },
  "e-ferfar-maharashtra":      { mr: "ई-फेरफार", en: "E-Ferfar (Mutation)", href: "/e-ferfar-maharashtra/" },
  "jameen-report-maharashtra": { mr: "जमीन अहवाल", en: "Land Report", href: "/jameen-report-maharashtra/" },
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

function RelatedServices({ slug, lang, title }: { slug: string; lang: Lang; title: string }) {
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
              className="group inline-flex w-full items-center justify-between gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-800 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800"
            >
              <span>{r[lang]}</span>
              <ArrowRight className="size-4 shrink-0 opacity-60 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
