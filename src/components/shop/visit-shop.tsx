"use client";

/**
 * VisitShop — address, hours, map and the three ways to reach the counter.
 *
 * RENDERS NOTHING until SHOP_ADDRESS is filled in (src/lib/shop-profile.ts).
 * Publishing an address the owner has not confirmed would be worse than
 * publishing none: local search ranks on name/address/phone matching the
 * Google Business Profile exactly, and a wrong address actively damages
 * that. Until then the site keeps describing itself as a service-area
 * business, which is what it has always accurately claimed.
 *
 * The map is an iframe but it is framed as part of the layout — rounded,
 * bordered, sharing the card's grid — rather than dropped on the page raw.
 * `loading="lazy"` keeps Google Maps entirely out of the initial page cost;
 * it is well below the fold, so it never competes with the hero.
 */

import { Clock, MapPin, MessageCircle, Navigation, Phone } from "lucide-react";
import { useLang, type Lang } from "@/components/language-context";
import { OPENING_HOURS, SHOP_ADDRESS } from "@/lib/shop-profile";
import { SITE_CONTACT } from "@/components/site-footer";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { trackWhatsAppLead } from "@/components/meta-pixel";
import { Reveal } from "@/components/shop/motion";

const t: Record<
  Lang,
  {
    eyebrow: string;
    heading: string;
    sub: string;
    addressLabel: string;
    hoursLabel: string;
    call: string;
    whatsapp: string;
    directions: string;
    mapTitle: string;
    waMessage: string;
  }
> = {
  mr: {
    eyebrow: "पत्ता",
    heading: "आमच्या दुकानाला भेट द्या",
    sub: "काम मोठे असो वा छोटे — काउंटरवर या, किंवा आधी WhatsApp वर विचारा.",
    addressLabel: "पत्ता",
    hoursLabel: "वेळ",
    call: "कॉल करा",
    whatsapp: "WhatsApp",
    directions: "दिशा दाखवा",
    mapTitle: "PrintShubh दुकानाचे Google नकाशावरील स्थान",
    waMessage: "नमस्कार PrintShubh, मला दुकानाबद्दल विचारायचे आहे.",
  },
  en: {
    eyebrow: "Find us",
    heading: "Visit the shop",
    sub: "Big job or small — come to the counter, or ask on WhatsApp first.",
    addressLabel: "Address",
    hoursLabel: "Hours",
    call: "Call",
    whatsapp: "WhatsApp",
    directions: "Directions",
    mapTitle: "PrintShubh shop location on Google Maps",
    waMessage: "Hello PrintShubh, I would like to ask about the shop.",
  },
};

export function VisitShop() {
  const { lang } = useLang();
  const tx = t[lang];

  const address = SHOP_ADDRESS;
  if (!address) return null;

  const waHref = buildWhatsAppUrl({ message: tx.waMessage, campaign: "visit-shop" });

  return (
    <section
      id="visit"
      aria-labelledby="visit-heading"
      className="scroll-mt-24 bg-white px-5 py-16 sm:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <p className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-[11.5px] font-black uppercase tracking-[0.18em] text-blue-800">
            <MapPin className="size-3.5" aria-hidden="true" />
            {tx.eyebrow}
          </p>
          <h2
            id="visit-heading"
            className="mt-5 text-3xl font-black leading-[1.12] tracking-tight text-slate-950 sm:text-4xl lg:text-[2.75rem]"
          >
            {tx.heading}
          </h2>
          <p className="mt-3 max-w-xl text-lg leading-8 text-slate-600">{tx.sub}</p>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="mt-10 grid overflow-hidden rounded-3xl border border-slate-200 shadow-sm lg:grid-cols-[0.9fr_1.1fr]">
            {/* Details column */}
            <div className="bg-[#f6faff] p-7 sm:p-9">
              <h3 className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                {tx.addressLabel}
              </h3>
              <address className="mt-3 not-italic text-[16px] font-bold leading-7 text-slate-900">
                {address.lines[lang].map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>

              {OPENING_HOURS && (
                <>
                  <h3 className="mt-8 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                    <Clock className="size-3.5" aria-hidden="true" />
                    {tx.hoursLabel}
                  </h3>
                  <dl className="mt-3 space-y-1.5">
                    {OPENING_HOURS.rows.map((row) => (
                      <div key={row.days.en} className="flex justify-between gap-4 text-[14.5px]">
                        <dt className="font-bold text-slate-700">{row.days[lang]}</dt>
                        <dd className="font-semibold text-slate-600">{row.time[lang]}</dd>
                      </div>
                    ))}
                  </dl>
                </>
              )}

              <div className="mt-8 flex flex-wrap gap-2.5">
                <a
                  href={`tel:${SITE_CONTACT.phoneTel}`}
                  className="inline-flex h-12 items-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-black text-white transition hover:bg-slate-800"
                >
                  <Phone className="size-4" aria-hidden="true" />
                  {tx.call}
                </a>
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackWhatsAppLead()}
                  className="inline-flex h-12 items-center gap-2 rounded-xl bg-green-600 px-5 text-sm font-black text-white transition hover:bg-green-700"
                >
                  <MessageCircle className="size-4" aria-hidden="true" />
                  {tx.whatsapp}
                </a>
                <a
                  href={address.directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-sm font-black text-slate-800 transition hover:border-blue-300 hover:text-blue-800"
                >
                  <Navigation className="size-4" aria-hidden="true" />
                  {tx.directions}
                </a>
              </div>
            </div>

            {/* Map column — lazy, titled, and never the LCP element. */}
            <div className="min-h-[320px] bg-slate-100 lg:min-h-[420px]">
              <iframe
                src={address.mapsEmbedUrl}
                title={tx.mapTitle}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full min-h-[320px] w-full border-0 lg:min-h-[420px]"
              />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
