"use client";

/**
 * HomeEnquiry — the homepage's closing call to action.
 *
 * Not a form. The site has no upload feature and this section does not add
 * one: files travel over WhatsApp, which is how every order starts. The
 * section tells the visitor what to send, then offers two ways to reach the
 * studio: a WhatsApp message (primary) and a phone call.
 *
 * THE TELEPHONE NUMBER
 *   The number is the studio's WhatsApp number, WHATSAPP_NUMBER in
 *   lib/whatsapp.ts. It is already published as the tel: link in the footer,
 *   the mobile bottom bar, the Visit section and the contact page, and as the
 *   `telephone` of the site's structured data. Nothing new is asserted.
 *   The opening hours come from OPENING_HOURS (shop-profile.ts), which was
 *   copied from the Google Business Profile.
 *
 * ANALYTICS
 *   The WhatsApp button reuses the existing `service_whatsapp_click` event
 *   and the Meta lead pixel call. The phone link has no tracking, like every
 *   other tel: link on the site; no event was added.
 *
 * Nothing waits for an animation: plain server-rendered markup.
 */

import { MessageCircle, Phone } from "lucide-react";
import { useLang, type Lang } from "@/components/language-context";
import { trackWhatsAppLead } from "@/components/meta-pixel";
import { trackFunnelEvent } from "@/lib/analytics";
import { OPENING_HOURS } from "@/lib/shop-profile";
import { buildWhatsAppUrl, WHATSAPP_DISPLAY, WHATSAPP_NUMBER } from "@/lib/whatsapp";

const copy: Record<
  Lang,
  {
    eyebrow: string;
    heading: string;
    body: string;
    listLabel: string;
    items: string[];
    whatsapp: string;
    call: string;
    filesNote: string;
    message: string;
  }
> = {
  mr: {
    eyebrow: "चौकशी",
    heading: "फाइल पाठवा. बाकी आम्ही कळवतो.",
    body: "फाइल, आकार आणि प्रती WhatsApp वर पाठवा. काम सुरू करण्यापूर्वी मटेरियल आणि किंमत कळवली जाते.",
    listLabel: "काय पाठवायचं",
    items: ["तुमची फाइल किंवा डिझाइन", "हवा तो आकार", "किती प्रती"],
    whatsapp: "WhatsApp वर संदेश पाठवा",
    call: "कॉल करा",
    filesNote: "फाइल्स WhatsApp वरच पाठवायच्या आहेत.",
    message:
      "नमस्कार PrintShubh, मला प्रिंटसाठी फाइल पाठवायची आहे. काय हवं आहे / आकार / प्रती: ",
  },
  en: {
    eyebrow: "Enquiry",
    heading: "Send your file. We confirm the rest.",
    body: "Send the file, size and number of copies on WhatsApp. The material and the price are confirmed before work starts.",
    listLabel: "What to send",
    items: ["Your file or design", "The size you need", "Number of copies"],
    whatsapp: "Message us on WhatsApp",
    call: "Call",
    filesNote: "Files are sent on WhatsApp.",
    message:
      "Hello PrintShubh, I would like to send a file for printing. What I need / size / copies: ",
  },
};

export function HomeEnquiry() {
  const { lang } = useLang();
  const tx = copy[lang];

  const href = buildWhatsAppUrl({
    message: tx.message,
    campaign: "home-enquiry",
    content: "send-file",
  });

  const hours = OPENING_HOURS?.rows[0];

  return (
    <section
      id="enquiry"
      aria-labelledby="enquiry-heading"
      className="scroll-mt-20 border-t border-brand-gold/60 bg-brand-navy px-5 py-10 text-white sm:px-8 sm:py-14 lg:py-24"
    >
      <div className="mx-auto grid max-w-7xl gap-8 sm:gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:gap-20">
        <div>
          <p className="flex items-center gap-3 text-[12px] font-black uppercase tracking-[0.2em] text-brand-gold-light">
            <span aria-hidden="true" className="h-px w-8 bg-brand-gold" />
            {tx.eyebrow}
          </p>
          <h2
            id="enquiry-heading"
            className="mt-4 max-w-2xl text-balance text-[2.2rem] font-black leading-[1.1] tracking-tight sm:text-5xl"
          >
            {tx.heading}
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
            {tx.body}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                trackWhatsAppLead();
                trackFunnelEvent("service_whatsapp_click", {
                  lang,
                  surface: "home-enquiry",
                  service_key: "enquiry",
                });
              }}
              className="inline-flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-xl bg-green-500 px-6 text-base font-black text-slate-950 transition hover:bg-green-400 sm:w-auto motion-reduce:transition-none"
            >
              <MessageCircle className="size-5" aria-hidden="true" />
              {tx.whatsapp}
            </a>
            <a
              href={`tel:+${WHATSAPP_NUMBER}`}
              className="inline-flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-xl border border-white/30 px-6 text-base font-black text-white transition hover:bg-white/10 sm:w-auto motion-reduce:transition-none"
            >
              <Phone className="size-5" aria-hidden="true" />
              {tx.call} {WHATSAPP_DISPLAY}
            </a>
          </div>
          {hours ? (
            <p className="mt-3 text-sm font-semibold text-slate-400">
              {hours.days[lang]}, {hours.time[lang]}
            </p>
          ) : null}
        </div>

        <div className="border border-white/15 px-5 py-6 sm:px-8 sm:py-8">
          <p className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-400">
            {tx.listLabel}
          </p>
          <ul className="mt-4">
            {tx.items.map((item, i) => (
              <li
                key={item}
                className="flex items-baseline gap-4 border-t border-white/15 py-4 first:border-t-0 sm:py-5"
              >
                <span
                  aria-hidden="true"
                  className="text-sm font-black tabular-nums text-brand-gold"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-xl font-black leading-tight tracking-tight sm:text-2xl">
                  {item}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t border-white/15 pt-4 text-sm font-semibold text-slate-400">
            {tx.filesNote}
          </p>
        </div>
      </div>
    </section>
  );
}
