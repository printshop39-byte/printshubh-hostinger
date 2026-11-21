"use client";

/**
 * PricingSection — static, transparent starting-price block.
 *
 * Renders as a self-contained card (matching the service-page article /
 * related-services cards) so it drops cleanly into both the homepage and
 * ServicePageShell. English only (the public site has no language switch).
 */

import { AlertTriangle, BadgeCheck, MessageCircle } from "lucide-react";
import { buildWhatsAppUrl, WHATSAPP_DEFAULT_MESSAGE } from "@/lib/whatsapp";
import { inquiryCtaClick } from "@/lib/inquiry-form-bus";
import { trackFunnelEvent } from "@/lib/analytics";
import { trackWhatsAppLead } from "@/components/meta-pixel";
import { PRICING_GROUPS } from "@/lib/pricing-data";

const groups = PRICING_GROUPS;

const badge: string = "Transparent pricing";
const heading: string = "Know the price first — no hidden fees";
const sub: string = "Before starting the service, the price is clearly shared on WhatsApp. Work starts only after your confirmation.";
const noteLabel: string = "Note:";
const note: string = "These are starting prices. The final price depends on district, taluka, village, survey/gat number, and report type. The final price will be shared on WhatsApp before starting the work.";
const cta: string = "Ask free on WhatsApp — know the price first";
const disclaimer: string = "PrintShubh is not a government website. We provide land document search and PDF assistance services. Please verify final legal information on the official government portal.";

export function PricingSection({ serviceName }: { serviceName?: string }) {
  const message = serviceName
    ? `Hello PrintShubh, I need ${serviceName}.\nDistrict: \nTaluka: \nVillage: \nGut/Survey no.: \nPlease share price and time.`
    : undefined;
  const waHref = buildWhatsAppUrl({
    message: message ?? WHATSAPP_DEFAULT_MESSAGE,
    campaign: "pricing",
  });

  return (
    <section
      id="pricing"
      aria-label={heading}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9"
    >
      <p className="inline-flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-bold text-green-800">
        <BadgeCheck className="size-4" />
        {badge}
      </p>
      <h2 className="mt-4 text-2xl font-black leading-tight text-slate-950 sm:text-3xl">
        {heading}
      </h2>
      <p className="mt-2 max-w-2xl text-[15px] leading-7 text-slate-600">{sub}</p>

      <div className="mt-6 space-y-6">
        {groups.map((g) => (
          <div key={g.title.en}>
            <h3 className="mb-2 text-sm font-black uppercase tracking-[0.14em] text-brand-navy">
              {g.title.en}
            </h3>
            <dl className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200">
              {g.rows.map((r) => (
                <div key={r.name.en} className="flex items-center justify-between gap-4 px-4 py-3.5">
                  <dt className="text-[15px] font-semibold text-slate-800">{r.name.en}</dt>
                  <dd className="shrink-0 text-right text-[14px] font-black text-green-700">{r.price.en}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" />
        <p className="text-[13.5px] leading-7 text-amber-900">
          <strong className="font-bold">{noteLabel}</strong> {note}
        </p>
      </div>

      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {
          // Preserve the form-funnel behaviour (may preventDefault on the
          // homepage); analytics never blocks navigation.
          inquiryCtaClick(e);
          trackFunnelEvent("pricing_whatsapp_click", { lang: "en", surface: "pricing" });
          trackWhatsAppLead();
        }}
        className="mt-6 inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-md bg-green-600 px-5 text-[15px] font-bold text-white shadow-sm transition hover:bg-green-700 sm:w-auto"
      >
        <MessageCircle className="size-5" />
        {cta}
      </a>

      <p className="mt-5 text-xs leading-6 text-slate-500">{disclaimer}</p>
    </section>
  );
}
