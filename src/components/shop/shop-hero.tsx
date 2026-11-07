"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  MessageCircle,
  Sparkles,
  Sparkle,
} from "lucide-react";
import { useLang, type Lang } from "@/components/language-context";
import { trackWhatsAppLead } from "@/components/meta-pixel";
import { trackFunnelEvent } from "@/lib/analytics";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { BRAND_LINE, BRAND_NAME, YEARS_EXPERIENCE } from "@/lib/shop-profile";
import {
  SERVICE_ICONS,
  type ServiceIconKey,
} from "@/components/shop/service-icons";

const copy = {
  mr: {
    badge: "कोल्हापूरचे Premium Print & Visual Studio",
    headlineStart: "प्रीमियम प्रिंट",
    headlineAccent: "व्हिज्युअल स्टुडिओ.",
    support:
      "वॉलपेपर, कॅनव्हास, वॉल आर्ट, रेक्झिन, साटीन फॅब्रिक, फ्रेम्ड प्रिंट्स व व्हिनाइल — तसेच रोजची झेरॉक्स, फोटो व डिजिटल सेवा. किंमत WhatsApp वर, आधीच स्पष्ट.",
    panelKicker: "आज कोणते काम आहे?",
    panelTitle: "तुमच्या कामासाठी योग्य सेवा निवडा",
    printTitle: "प्रिंटिंग / झेरॉक्स",
    printBody: "PDF पाठवा आणि किंमत विचारा",
    photoTitle: "फोटो सेवा",
    photoBody: "पासपोर्ट, ID आणि फोटो प्रिंट",
    digitalTitle: "डिजिटल सेवा",
    digitalBody: "ऑनलाइन फॉर्म, PDF व WhatsApp प्रिंटिंग",
    collectionsTitle: "Premium Collections",
    collectionsBody: "वॉलपेपर, कॅनव्हास, वॉल आर्ट व बरेच काही",
    primary: "WhatsApp वर फाइल पाठवा",
    trust: [
      `${YEARS_EXPERIENCE}+ वर्षांचा अनुभव`,
      "किंमत आधी कळेल",
      "सरकारी संस्था नाही",
    ],
    note: "अधिकृत सार्वजनिक स्रोतांवर आधारित खाजगी सहाय्य सेवा.",
  },
  en: {
    badge: "Kolhapur's Premium Print & Visual Studio",
    headlineStart: "Premium Print",
    headlineAccent: "& Visual Studio.",
    support:
      "Wallpaper, canvas, wall art, rexine, satin fabric, framed prints and vinyl — plus everyday xerox, photo and digital services. Price on WhatsApp, upfront.",
    panelKicker: "What do you need today?",
    panelTitle: "Choose a service and go straight ahead",
    printTitle: "Printing / Xerox",
    printBody: "Send a PDF and ask for a quote",
    photoTitle: "Photo services",
    photoBody: "Passport, ID and photo prints",
    digitalTitle: "Digital services",
    digitalBody: "Online forms, PDF work and WhatsApp printing",
    collectionsTitle: "Premium Collections",
    collectionsBody: "Wallpaper, canvas, wall art and more",
    primary: "Send a file on WhatsApp",
    trust: [
      `${YEARS_EXPERIENCE}+ years of experience`,
      "Price confirmed first",
      "Not a government entity",
    ],
    note: "Private assistance based on official public sources.",
  },
} satisfies Record<Lang, Record<string, string | string[]>>;

/* This panel's 4 cards: printing, photo, digital, Premium Collections.
 *
 * History, for anyone diffing: card 3 used to be "land" (7/12, 8A,
 * Property Card, href "/#unified-form"), then briefly "maps" (Village
 * map / DP / TP / Regional Plan, href "/#maps" -> MapPromo). Both were
 * land-document-adjacent government services; MapPromo itself has been
 * removed from the homepage (owner repositioning decision, see
 * src/app/page.tsx) and its hero card replaced with one that actually
 * promotes the new Premium Collections. */
type Intent = {
  key: "printing" | "photo" | "digital" | "collections";
  iconKey: ServiceIconKey;
  titleKey: "printTitle" | "photoTitle" | "digitalTitle" | "collectionsTitle";
  bodyKey: "printBody" | "photoBody" | "digitalBody" | "collectionsBody";
  href: string;
  external?: boolean;
};

/* Stage-4 rebrand: Collections leads this panel (was last of four) so the
 * Premium Studio identity is the first card a visitor sees, not the
 * fourth. Printing/photo/digital stay in the panel, just demoted. */
const intents: Intent[] = [
  {
    key: "collections",
    iconKey: "digital",
    titleKey: "collectionsTitle",
    bodyKey: "collectionsBody",
    href: "/#collections",
  },
  {
    key: "printing",
    iconKey: "printer",
    titleKey: "printTitle",
    bodyKey: "printBody",
    href: "whatsapp",
    external: true,
  },
  {
    key: "photo",
    iconKey: "photo",
    titleKey: "photoTitle",
    bodyKey: "photoBody",
    href: "/photo-services",
  },
  {
    key: "digital",
    iconKey: "digital",
    titleKey: "digitalTitle",
    bodyKey: "digitalBody",
    href: "/digital-services",
  },
];

export function ShopHero() {
  const { lang } = useLang();
  const tx = copy[lang];
  const printHref = buildWhatsAppUrl({
    message:
      lang === "mr"
        ? "नमस्कार PrintShubh, मी प्रिंटिंगसाठी फाइल पाठवत आहे. आकार / प्रती / रंग: "
        : "Hello PrintShubh, I am sending a file for printing. Size / copies / colour: ",
    campaign: "hero-v2",
    content: "printing-intent",
  });

  const trackIntent = (key: Intent["key"], whatsapp = false) => {
    if (whatsapp) trackWhatsAppLead();
    trackFunnelEvent("hero_intent_click", {
      lang,
      surface: "hero-v2",
      service_key: key,
    });
  };

  return (
    <section
      id="top"
      className="relative isolate overflow-hidden bg-brand-navy text-white"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-70 [background:radial-gradient(circle_at_15%_10%,rgba(184,144,82,0.38),transparent_36%),radial-gradient(circle_at_88%_80%,rgba(184,144,82,0.16),transparent_34%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.7)_1px,transparent_1px)] [background-size:42px_42px]"
      />

      <div className="relative mx-auto grid max-w-7xl gap-8 px-5 pb-10 pt-8 sm:px-8 sm:pb-14 sm:pt-12 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:gap-14 lg:py-20">
        <div>
          <p className="ps-enter inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-bold text-brand-gold-light backdrop-blur">
            <Sparkles className="size-3.5 text-amber-300" aria-hidden="true" />
            {tx.badge as string}
          </p>
          <p
            className="ps-enter mt-6 text-sm font-black uppercase tracking-[0.16em] text-brand-gold"
            style={{ "--ps-delay": "60ms" } as React.CSSProperties}
          >
            {BRAND_NAME} · {BRAND_LINE}
          </p>
          <h1
            className="ps-enter mt-3 max-w-3xl text-[2.8rem] font-black leading-[.98] tracking-[-.045em] sm:text-6xl lg:text-[4.6rem]"
            style={{ "--ps-delay": "110ms" } as React.CSSProperties}
          >
            {tx.headlineStart as string}
            <span className="mt-1 block bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
              {tx.headlineAccent as string}
            </span>
          </h1>
          <p
            className="ps-enter mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8"
            style={{ "--ps-delay": "170ms" } as React.CSSProperties}
          >
            {tx.support as string}
          </p>
          <a
            href={printHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackIntent("printing", true)}
            className="ps-enter mt-7 inline-flex min-h-[56px] w-full items-center justify-center gap-2.5 rounded-xl bg-green-500 px-6 text-base font-black text-slate-950 shadow-[0_18px_45px_-18px_rgba(34,197,94,.9)] transition hover:-translate-y-0.5 hover:bg-green-400 sm:w-auto motion-reduce:transform-none"
            style={{ "--ps-delay": "230ms" } as React.CSSProperties}
          >
            <MessageCircle className="size-5" aria-hidden="true" />
            {tx.primary as string}
            <ArrowRight className="size-4" aria-hidden="true" />
          </a>
          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold text-slate-300 sm:text-sm">
            {(tx.trust as string[]).map((item) => (
              <li key={item} className="flex items-center gap-1.5">
                <CheckCircle2
                  className="size-4 text-green-400"
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[1.75rem] border border-white/15 bg-white/[0.08] p-4 shadow-2xl backdrop-blur-xl sm:p-6">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-300">
            {tx.panelKicker as string}
          </p>
          <h2 className="mt-2 text-2xl font-black leading-tight text-white sm:text-3xl">
            {tx.panelTitle as string}
          </h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {intents.map((intent) => {
              const href = intent.href === "whatsapp" ? printHref : intent.href;
              const card = (
                <>
                  <span className="grid size-14 place-items-center rounded-2xl border border-white/10 bg-gradient-to-br from-white/15 to-white/[.04] p-1.5 shadow-inner transition group-hover:scale-105 group-hover:border-amber-300/40">
                    {intent.key === "collections" ? (
                      <Sparkle className="size-7 text-amber-300 drop-shadow-lg" aria-hidden="true" />
                    ) : (
                      (() => {
                        const Icon = SERVICE_ICONS[intent.iconKey];
                        return <Icon className="h-full w-full drop-shadow-lg" />;
                      })()
                    )}
                  </span>
                  <span className="mt-4 text-base font-black text-white">
                    {tx[intent.titleKey] as string}
                  </span>
                  <span className="mt-1 text-sm leading-5 text-slate-400">
                    {tx[intent.bodyKey] as string}
                  </span>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-black uppercase tracking-wide text-amber-300">
                    {lang === "mr" ? "उघडा" : "Open"}
                    <ArrowRight
                      className="size-4 transition group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </>
              );
              const classes =
                "group relative flex min-h-[184px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-brand-navy-dark to-brand-navy p-4 text-left shadow-[0_14px_35px_-24px_rgba(184,144,82,.6)] transition hover:-translate-y-1 hover:border-brand-gold/40 hover:shadow-[0_22px_50px_-24px_rgba(251,191,36,.48)] motion-reduce:transform-none";
              return intent.external ? (
                <a
                  key={intent.key}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackIntent(intent.key, true)}
                  className={classes}
                >
                  {card}
                </a>
              ) : (
                <Link
                  key={intent.key}
                  href={href}
                  onClick={() => trackIntent(intent.key)}
                  className={classes}
                >
                  {card}
                </Link>
              );
            })}
          </div>
          <p className="mt-4 text-xs font-semibold leading-5 text-slate-400">
            {tx.note as string}
          </p>
        </div>
      </div>
    </section>
  );
}
