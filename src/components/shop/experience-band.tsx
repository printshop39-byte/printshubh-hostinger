"use client";

/**
 * ExperienceBand — the "30+ years" trust moment.
 *
 * WHAT IS AND IS NOT A NUMBER HERE
 *   Only two figures can appear: years in business (30+, the claim the site
 *   has always made) and, if the owner ever fills in CUSTOMERS_SERVED, a
 *   real customer count. Everything else in this band is a statement about
 *   what the shop does, not a statistic — because a made-up "thousands of
 *   happy customers" is worth less than nothing to a local customer who can
 *   simply walk in and check.
 *
 *   The count-up runs once, on entering the viewport, and only when motion
 *   is welcome. Server HTML always contains the final number.
 *
 * WORDING IS SOURCED, NOT INVENTED
 *   The heading matches the scope of the claim on /about — "मागील ३० वर्षांपासून
 *   नकाशे, जमीन अभिलेख आणि सरकारी कागदपत्र प्रक्रियेचा अनुभव". An earlier draft
 *   read "वर्षानुवर्षे त्याच काउंटरवर" / "Same counter, year after year", which
 *   asserts 30 years of continuous trading at one address — something no
 *   source on this site states. Do not reintroduce that framing without the
 *   owner confirming it.
 */

import { Award, Clock, FileText, MapPinned, Printer, ShieldCheck, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLang, type Lang } from "@/components/language-context";
import { CUSTOMERS_SERVED, YEARS_EXPERIENCE } from "@/lib/shop-profile";
import { CountUp, Reveal, Stagger, StaggerItem } from "@/components/shop/motion";

const t: Record<Lang, { heading: string; sub: string; years: string; customers: string }> = {
  mr: {
    heading: "नकाशे आणि जमीन अभिलेखांचा दीर्घ अनुभव.",
    sub: "हाच अनुभव आता प्रिंटिंग, फोटो आणि डिजिटल सेवांसोबत एकाच ठिकाणी.",
    years: "वर्षांचा अनुभव",
    customers: "ग्राहक",
  },
  en: {
    heading: "Long experience with maps and land records.",
    sub: "That same experience now sits alongside printing, photo and digital services in one place.",
    years: "years of experience",
    customers: "customers served",
  },
};

/* Qualitative capability tiles — descriptions of the service, never counts.
 *
 * The last two carry over the same-day and UPI signals that used to live in
 * the old TrustBar component, which this band replaces. Both are claims the
 * site already makes on the FAQ and pricing pages; nothing new is asserted
 * here. */
const capabilities: { icon: LucideIcon; label: Record<Lang, string> }[] = [
  { icon: Printer, label: { mr: "दैनंदिन प्रिंटिंग व झेरॉक्स सेवा", en: "Everyday printing and xerox" } },
  { icon: FileText, label: { mr: "डिजिटल कागदपत्र सेवा", en: "Digital document services" } },
  { icon: MapPinned, label: { mr: "महाराष्ट्रभर WhatsApp सहाय्य", en: "WhatsApp assistance across Maharashtra" } },
  { icon: Clock, label: { mr: "बहुतेक कागदपत्रे त्याच दिवशी", en: "Most documents the same day" } },
  { icon: ShieldCheck, label: { mr: "सुरक्षित UPI पेमेंट", en: "Secure UPI payment" } },
];

export function ExperienceBand() {
  const { lang } = useLang();
  const tx = t[lang];

  return (
    <section className="border-y border-slate-200 bg-[#f6faff] px-5 py-16 sm:px-8 lg:py-24">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        {/* Left — the headline figure */}
        <Reveal>
          <div className="flex items-end gap-4">
            <Award className="mb-3 size-9 shrink-0 text-blue-600" aria-hidden="true" />
            <p className="text-[5.5rem] font-black leading-[0.85] tracking-[-0.04em] text-slate-950 sm:text-[7rem]">
              <CountUp to={YEARS_EXPERIENCE} suffix="+" />
            </p>
          </div>
          <p className="mt-3 text-xl font-black text-slate-700">{tx.years}</p>
          <h2 className="mt-6 max-w-md text-3xl font-black leading-[1.12] tracking-tight text-slate-950 sm:text-4xl">
            {tx.heading}
          </h2>
          <p className="mt-3 max-w-md text-lg leading-8 text-slate-600">{tx.sub}</p>
        </Reveal>

        {/* Right — capability tiles, plus a customer count only if it is real.
            Compact 2-up tiles on mobile (icon over label) so the band doesn't
            cost five full-width screens of scroll; back to the original
            single-column, icon-beside-label list from lg up, where this list
            already sits in a narrower half-page column next to the figure. */}
        <Stagger as="ul" className="grid grid-cols-2 gap-2.5 lg:grid-cols-1 lg:gap-3.5">
          {CUSTOMERS_SERVED !== null && (
            <StaggerItem as="li" className="col-span-2 lg:col-span-1">
              <div className="ps-glass flex items-center gap-4 rounded-2xl px-5 py-5">
                <span
                  aria-hidden="true"
                  className="grid size-12 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700"
                >
                  <Users className="size-5" />
                </span>
                <p className="text-2xl font-black leading-none text-slate-950">
                  <CountUp to={CUSTOMERS_SERVED} suffix="+" />
                  <span className="ml-2 text-base font-bold text-slate-600">
                    {tx.customers}
                  </span>
                </p>
              </div>
            </StaggerItem>
          )}

          {capabilities.map(({ icon: Icon, label }) => (
            <StaggerItem as="li" key={label.en}>
              <div className="ps-glass flex h-full flex-col items-start gap-2 rounded-2xl px-3.5 py-3.5 lg:flex-row lg:items-center lg:gap-4 lg:px-5 lg:py-5">
                <span
                  aria-hidden="true"
                  className="grid size-9 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700 lg:size-12"
                >
                  <Icon className="size-4 lg:size-5" />
                </span>
                <p className="text-[12.5px] font-bold leading-5 text-slate-800 lg:text-[15.5px] lg:leading-6">
                  {label[lang]}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
