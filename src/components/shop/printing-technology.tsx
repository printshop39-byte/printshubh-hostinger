"use client";

/**
 * PrintingTechnology — the 11-colour Epson SureColor SC-S9130 homepage section.
 *
 * TYPOGRAPHY-ONLY ON PURPOSE
 *   No printer photo, no print-sample photo, no stock photography. Neither a
 *   generic "large-format printer" stock image nor a fabricated render would
 *   be the actual machine in this shop, and a "proof we're real" section
 *   illustrated with someone else's equipment undoes the trust it's meant to
 *   build — the same reasoning ShopGallery (components/shop/shop-gallery.tsx)
 *   already applies to shopfront photos. The only graphic here is the
 *   11-swatch colour strip, which is aria-hidden, abstract and makes no
 *   claim to be a photograph of anything.
 *
 *   PRINTING_TECH_PHOTOS in shop-profile.ts is the switch: once real photos
 *   of this machine / a finished print exist, list them there and the strip
 *   below the feature grid appears — nothing in this file needs to change.
 *
 * NO CERTIFICATION CLAIMS YET
 *   CERTIFICATIONS (shop-profile.ts) is wired up and rendered, but the array
 *   is empty, so `hasCertifications()` is false and the strip renders
 *   nothing. Do not hardcode a GREENGUARD Gold / "Gold Quality" badge, logo
 *   or claim here — see the long comment on CERTIFICATIONS for why, and what
 *   has to be true before an entry goes in that list.
 *
 * ONLY QUALITATIVE CLAIMS
 *   Every bullet below describes what the system does (11 colours, large
 *   format, these substrates), never a measured figure (colour gamut, ink
 *   durability, resolution, year counts) PrintShubh cannot currently back
 *   with evidence. Do not add a number here without a verified source.
 */

import { Image as ImageIcon, Layers, Palette, Printer, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import NextImage from "next/image";
import { useRef } from "react";
import { useLang, type Lang } from "@/components/language-context";
import { trackWhatsAppLead } from "@/components/meta-pixel";
import { trackFunnelEvent, useFunnelViewEvent } from "@/lib/analytics";
import {
  CERTIFICATIONS,
  PRINTING_TECH_PHOTOS,
  hasCertifications,
  hasPrintingTechPhotos,
} from "@/lib/shop-profile";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { Reveal, Stagger, StaggerItem } from "@/components/shop/motion";

const t: Record<
  Lang,
  {
    eyebrow: string;
    heading: string;
    sub: string;
    machineLabel: string;
    machineName: string;
    featuresHeading: string;
    appsHeading: string;
    cta: string;
  }
> = {
  mr: {
    eyebrow: "प्रिंटिंग तंत्रज्ञान",
    heading: "11-रंगी व्यावसायिक प्रिंटिंग तंत्रज्ञान.",
    sub: "आमच्या दुकानात Epson SureColor SC-S9130 हे व्यावसायिक लार्ज-फॉरमॅट प्रिंटर वापरले जाते — बारीक तपशील आणि सौम्य रंगसंक्रमणासह दर्जेदार प्रिंट.",
    machineLabel: "वापरातील मशीन",
    machineName: "Epson SureColor SC-S9130",
    featuresHeading: "काय मिळते",
    appsHeading: "कोणत्या मटेरियलवर प्रिंट करतो",
    cta: "WhatsApp वर प्रिंटिंगबद्दल विचारा",
  },
  en: {
    eyebrow: "Printing technology",
    heading: "11-Colour Professional Printing Technology.",
    sub: "Our shop runs the Epson SureColor SC-S9130, a professional large-format printer — fine detail and smooth tonal transitions on every print.",
    machineLabel: "Machine in use",
    machineName: "Epson SureColor SC-S9130",
    featuresHeading: "What you get",
    appsHeading: "What we print it on",
    cta: "Ask about printing on WhatsApp",
  },
};

const features: { icon: LucideIcon; label: Record<Lang, string> }[] = [
  {
    icon: Palette,
    label: {
      mr: "11-रंगी व्यावसायिक प्रिंटिंग प्रणाली",
      en: "Advanced 11-colour printing system",
    },
  },
  {
    icon: Printer,
    label: { mr: "व्यावसायिक लार्ज-फॉरमॅट प्रिंटिंग", en: "Professional large-format printing" },
  },
  {
    icon: ImageIcon,
    label: { mr: "उच्च-गुणवत्तेचे प्रतिमा पुनरुत्पादन", en: "High-quality image reproduction" },
  },
  {
    icon: Sparkles,
    label: { mr: "सौम्य व नैसर्गिक रंगसंक्रमण", en: "Smooth tonal transitions" },
  },
  {
    icon: Layers,
    label: { mr: "बारीक तपशीलांसह आर्टवर्क प्रिंटिंग", en: "Detailed artwork reproduction" },
  },
];

/* What the SC-S9130 at this shop is actually used to print. Kept as plain
 * labels, not photos — see the file header. */
const applications: Record<Lang, string>[] = [
  { mr: "प्रीमियम वॉलपेपर", en: "Premium wallpaper" },
  { mr: "कॅनव्हास प्रिंट", en: "Canvas print" },
  { mr: "वॉल आर्ट", en: "Wall art" },
  { mr: "रेक्झिन प्रिंट", en: "Rexine printing" },
  { mr: "साटीन फॅब्रिक प्रिंट", en: "Satin fabric printing" },
  { mr: "व्हिनाइल प्रिंट", en: "Vinyl printing" },
];

/**
 * Abstract, decorative 11-swatch colour strip. aria-hidden — it illustrates
 * "11 colours" without claiming to be a photo of the printer or its output.
 */
function ColourSwatchStrip() {
  const hues = [
    "#1d4ed8",
    "#0ea5e9",
    "#06b6d4",
    "#10b981",
    "#84cc16",
    "#facc15",
    "#f97316",
    "#ef4444",
    "#ec4899",
    "#a855f7",
    "#111827",
  ];
  return (
    <div aria-hidden="true" className="flex overflow-hidden rounded-xl border border-slate-200">
      {hues.map((hue, i) => (
        <span key={i} className="h-10 flex-1" style={{ backgroundColor: hue }} />
      ))}
    </div>
  );
}

export function PrintingTechnology() {
  const { lang } = useLang();
  const tx = t[lang];

  const sectionRef = useRef<HTMLElement>(null);
  useFunnelViewEvent(sectionRef, "printing_tech_view", { lang, surface: "printing-technology" });

  const waHref = buildWhatsAppUrl({
    message:
      lang === "mr"
        ? "नमस्कार PrintShubh, मला 11-रंगी प्रिंटिंग (वॉलपेपर/कॅनव्हास/व्हिनाइल) बद्दल माहिती हवी आहे."
        : "Hello PrintShubh, I'd like to know more about your 11-colour printing (wallpaper/canvas/vinyl).",
    campaign: "printing-technology",
    content: "ask-printing",
  });

  return (
    <section
      ref={sectionRef}
      aria-labelledby="printing-technology-heading"
      className="bg-brand-cream px-5 py-16 sm:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <p className="inline-flex items-center gap-2 rounded-full border border-brand-gold-light bg-brand-cream px-3.5 py-1.5 text-[11.5px] font-black uppercase tracking-[0.18em] text-brand-navy">
            <Printer className="size-3.5" aria-hidden="true" />
            {tx.eyebrow}
          </p>
          <h2
            id="printing-technology-heading"
            className="mt-5 max-w-3xl text-3xl font-black leading-[1.12] tracking-tight text-slate-950 sm:text-4xl"
          >
            {tx.heading}
          </h2>
          <p className="mt-3 max-w-2xl text-lg leading-8 text-slate-600">{tx.sub}</p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="ps-glass mt-8 max-w-xl rounded-2xl px-5 py-4">
            <p className="text-[11.5px] font-black uppercase tracking-[0.14em] text-brand-navy">
              {tx.machineLabel}
            </p>
            <p className="mt-1 text-lg font-black text-slate-950">{tx.machineName}</p>
            <div className="mt-4">
              <ColourSwatchStrip />
            </div>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-10 lg:grid-cols-2">
          <div>
            <Reveal>
              <h3 className="text-sm font-black uppercase tracking-[0.12em] text-slate-500">
                {tx.featuresHeading}
              </h3>
            </Reveal>
            <Stagger as="ul" className="mt-4 grid gap-2.5">
              {features.map(({ icon: Icon, label }) => (
                <StaggerItem as="li" key={label.en}>
                  <div className="ps-glass flex items-center gap-4 rounded-2xl px-4 py-3.5">
                    <span
                      aria-hidden="true"
                      className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-cream text-brand-navy"
                    >
                      <Icon className="size-4.5" />
                    </span>
                    <p className="text-[14.5px] font-bold leading-5 text-slate-800">
                      {label[lang]}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>

          <div>
            <Reveal>
              <h3 className="text-sm font-black uppercase tracking-[0.12em] text-slate-500">
                {tx.appsHeading}
              </h3>
            </Reveal>
            <Stagger as="ul" className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {applications.map((label) => (
                <StaggerItem as="li" key={label.en}>
                  <div className="ps-glass flex h-full items-center justify-center rounded-2xl px-3 py-4 text-center">
                    <p className="text-[13.5px] font-bold leading-5 text-slate-800">
                      {label[lang]}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>

        {/* Real photo strip — renders nothing until PRINTING_TECH_PHOTOS
            (shop-profile.ts) has entries. See the file header. */}
        {hasPrintingTechPhotos() && (
          <Reveal delay={0.1}>
            <ul className="ps-scroll-x mt-12 flex gap-4 pb-2">
              {PRINTING_TECH_PHOTOS.map((photo) => (
                <li
                  key={photo.src}
                  className="ps-snap w-[78vw] shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm sm:w-[46vw] lg:w-[22rem]"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <NextImage
                      src={photo.src}
                      alt={photo.alt[lang]}
                      width={photo.width}
                      height={photo.height}
                      loading="lazy"
                      sizes="(max-width: 640px) 78vw, (max-width: 1024px) 46vw, 22rem"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <p className="px-4 py-3 text-[13px] font-bold text-slate-700">
                    {photo.caption[lang]}
                  </p>
                </li>
              ))}
            </ul>
          </Reveal>
        )}

        {/* Certification strip — scaffolded, not visible yet. Renders
            nothing while CERTIFICATIONS (shop-profile.ts) is empty. Do not
            hardcode a badge here instead of filling that list in. */}
        {hasCertifications() && (
          <Reveal delay={0.1}>
            <ul className="mt-12 grid gap-4 sm:grid-cols-2">
              {CERTIFICATIONS.map((cert) => (
                <li
                  key={cert.certificateNumber}
                  className="ps-glass flex items-center gap-4 rounded-2xl px-5 py-4"
                >
                  <NextImage
                    src={cert.logoSrc}
                    alt={cert.name[lang]}
                    width={cert.logoWidth}
                    height={cert.logoHeight}
                    className="h-12 w-auto shrink-0"
                  />
                  <div>
                    <p className="text-sm font-black text-slate-950">{cert.name[lang]}</p>
                    <p className="mt-0.5 text-[12.5px] font-semibold text-slate-600">
                      {cert.scope[lang]}
                    </p>
                    <a
                      href={cert.verificationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-block text-[12px] font-bold text-brand-navy underline-offset-2 hover:underline"
                    >
                      {cert.certificateNumber}
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        )}

        <Reveal delay={0.15}>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              trackWhatsAppLead();
              trackFunnelEvent("printing_tech_whatsapp_click", {
                lang,
                surface: "printing-technology",
              });
            }}
            className="mt-10 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-black text-white transition hover:bg-green-700"
          >
            {tx.cta}
          </a>
        </Reveal>
      </div>
    </section>
  );
}
