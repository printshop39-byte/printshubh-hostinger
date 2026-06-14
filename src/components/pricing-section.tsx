"use client";

/**
 * PricingSection — static, transparent starting-price block.
 *
 * Renders as a self-contained card (matching the service-page article /
 * related-services cards) so it drops cleanly into both the homepage and
 * ServicePageShell. Bilingual via useLang(); SSR default lang is "mr", so
 * the Marathi price text ships in the server HTML (Google-readable).
 *
 * Language rule: in Marathi view show Marathi labels only; in English view
 * show English labels only. Brand/standard terms ("PrintShubh", "Google Map",
 * "Index II") may appear in both. Price numbers are identical across languages.
 */

import { AlertTriangle, BadgeCheck, MessageCircle } from "lucide-react";
import { useLang, type Lang } from "@/components/language-context";
import { whatsappHref } from "@/lib/whatsapp";

type Row = { name: Record<Lang, string>; price: Record<Lang, string> };

const rows: Row[] = [
  { name: { mr: "7/12 उतारा", en: "7/12 Extract" }, price: { mr: "₹30 पासून", en: "From ₹30" } },
  { name: { mr: "8A उतारा", en: "8A Extract" }, price: { mr: "₹30 पासून", en: "From ₹30" } },
  { name: { mr: "मिळकत पत्रिका", en: "Property Card" }, price: { mr: "₹100 पासून", en: "From ₹100" } },
  { name: { mr: "गाव नकाशा", en: "Village Map" }, price: { mr: "₹300 पासून", en: "From ₹300" } },
  { name: { mr: "संपूर्ण नकाशा विकास अहवाल", en: "Full Map Development Report" }, price: { mr: "₹200 पासून", en: "From ₹200" } },
  { name: { mr: "नगर रचना नकाशा", en: "Town Planning Map" }, price: { mr: "₹200 पासून", en: "From ₹200" } },
  { name: { mr: "Google Map नुसार झोन-निहाय जमीन अहवाल", en: "Google Map Zone-wise Land Report" }, price: { mr: "₹200 पासून", en: "From ₹200" } },
  { name: { mr: "Index II", en: "Index II" }, price: { mr: "WhatsApp वर किंमत विचारा", en: "Ask price on WhatsApp" } },
];

const badge: Record<Lang, string> = { mr: "पारदर्शक किंमत", en: "Transparent pricing" };
const heading: Record<Lang, string> = {
  mr: "किंमत आधी कळेल — छुपी फी नाही",
  en: "Know the price first — no hidden fees",
};
const sub: Record<Lang, string> = {
  mr: "सेवा सुरू होण्यापूर्वी किंमत WhatsApp वर स्पष्ट सांगितली जाते. तुमची संमती मिळाल्यानंतरच काम सुरू केले जाते.",
  en: "Before starting the service, the price is clearly shared on WhatsApp. Work starts only after your confirmation.",
};
const noteLabel: Record<Lang, string> = { mr: "टीप:", en: "Note:" };
const note: Record<Lang, string> = {
  mr: "ही सुरुवातीची किंमत आहे. अंतिम किंमत जिल्हा, तालुका, गाव, गट नंबर आणि report type नुसार WhatsApp वर आधी सांगितली जाईल. तुमची संमती मिळाल्यानंतरच काम सुरू होईल.",
  en: "These are starting prices. The final price depends on district, taluka, village, survey/gat number, and report type. The final price will be shared on WhatsApp before starting the work.",
};
const cta: Record<Lang, string> = {
  mr: "WhatsApp वर मोफत विचारा — किंमत आधी कळेल",
  en: "Ask free on WhatsApp — know the price first",
};
const disclaimer: Record<Lang, string> = {
  mr: "PrintShubh ही सरकारी वेबसाइट नाही. आम्ही जमीन कागदपत्र शोध व PDF सहाय्य सेवा देतो. अंतिम कायदेशीर पडताळणी अधिकृत सरकारी पोर्टलवर करावी.",
  en: "PrintShubh is not a government website. We provide land document search and PDF assistance services. Please verify final legal information on the official government portal.",
};

export function PricingSection({ serviceName }: { serviceName?: Record<Lang, string> }) {
  const { lang } = useLang();

  const message = serviceName
    ? lang === "mr"
      ? `नमस्कार PrintShubh, मला ${serviceName.mr} हवी आहे.\nजिल्हा: \nतालुका: \nगाव: \nगट/सर्वे नंबर: \nकृपया किंमत आणि वेळ सांगा.`
      : `Hello PrintShubh, I need ${serviceName.en}.\nDistrict: \nTaluka: \nVillage: \nGut/Survey no.: \nPlease share price and time.`
    : undefined;
  const waHref = whatsappHref(message);

  return (
    <section
      id="pricing"
      aria-label={heading[lang]}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9"
    >
      <p className="inline-flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-bold text-green-800">
        <BadgeCheck className="size-4" />
        {badge[lang]}
      </p>
      <h2 className="mt-4 text-2xl font-black leading-tight text-slate-950 sm:text-3xl">
        {heading[lang]}
      </h2>
      <p className="mt-2 max-w-2xl text-[15px] leading-7 text-slate-600">{sub[lang]}</p>

      <dl className="mt-6 divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200">
        {rows.map((r) => (
          <div key={r.name.en} className="flex items-center justify-between gap-4 px-4 py-3.5">
            <dt className="text-[15px] font-semibold text-slate-800">{r.name[lang]}</dt>
            <dd className="shrink-0 text-[15px] font-black text-green-700">{r.price[lang]}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" />
        <p className="text-[13.5px] leading-7 text-amber-900">
          <strong className="font-bold">{noteLabel[lang]}</strong> {note[lang]}
        </p>
      </div>

      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-md bg-green-600 px-5 text-[15px] font-bold text-white shadow-sm transition hover:bg-green-700 sm:w-auto"
      >
        <MessageCircle className="size-5" />
        {cta[lang]}
      </a>

      <p className="mt-5 text-xs leading-6 text-slate-500">{disclaimer[lang]}</p>
    </section>
  );
}
