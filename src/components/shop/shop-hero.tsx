"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  MessageCircle,
  Sparkles,
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
    badge: "कोल्हापूरचे प्रिंटिंग सेंटर • महाराष्ट्रासाठी डिजिटल सेवा",
    headlineStart: "प्रिंट आणि डॉक्युमेंट",
    headlineAccent: "सोल्यूशन्स.",
    support:
      "फाइल पाठवा, सेवा निवडा आणि काम सोपं करा. प्रिंटिंग, फोटो व जमीन कागदपत्रांसाठी विश्वासार्ह सहाय्य — किंमत आणि उपलब्धता आधीच स्पष्ट.",
    panelKicker: "आज कोणते काम आहे?",
    panelTitle: "तुमच्या कामासाठी योग्य सेवा निवडा",
    printTitle: "प्रिंटिंग / झेरॉक्स",
    printBody: "PDF पाठवा आणि किंमत विचारा",
    photoTitle: "फोटो सेवा",
    photoBody: "पासपोर्ट, ID आणि फोटो प्रिंट",
    landTitle: "जमीन कागदपत्रे",
    landBody: "7/12, 8A, मिळकत पत्रिका",
    mapTitle: "नकाशे / प्लॅन",
    mapBody: "गाव नकाशा, DP, TP, Regional Plan",
    primary: "WhatsApp वर फाइल पाठवा",
    trust: [
      `${YEARS_EXPERIENCE}+ वर्षांचा अनुभव`,
      "किंमत आधी कळेल",
      "सरकारी संस्था नाही",
    ],
    note: "अधिकृत सार्वजनिक स्रोतांवर आधारित खाजगी सहाय्य सेवा.",
  },
  en: {
    badge: "Kolhapur print centre • Digital services across Maharashtra",
    headlineStart: "Send the file.",
    headlineAccent: "Get the job ready.",
    support:
      "One dependable place for printing, photos and land documents. Price and availability are confirmed before work starts.",
    panelKicker: "What do you need today?",
    panelTitle: "Choose a service and go straight ahead",
    printTitle: "Printing / Xerox",
    printBody: "Send a PDF and ask for a quote",
    photoTitle: "Photo services",
    photoBody: "Passport, ID and photo prints",
    landTitle: "Land documents",
    landBody: "7/12, 8A and property card",
    mapTitle: "Maps / plans",
    mapBody: "Village map, DP, TP and Regional Plan",
    primary: "Send a file on WhatsApp",
    trust: [
      `${YEARS_EXPERIENCE}+ years of experience`,
      "Price confirmed first",
      "Not a government entity",
    ],
    note: "Private assistance based on official public sources.",
  },
} satisfies Record<Lang, Record<string, string | string[]>>;

type Intent = {
  key: "printing" | "photo" | "land" | "maps";
  iconKey: ServiceIconKey;
  titleKey: "printTitle" | "photoTitle" | "landTitle" | "mapTitle";
  bodyKey: "printBody" | "photoBody" | "landBody" | "mapBody";
  href: string;
  external?: boolean;
};

const intents: Intent[] = [
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
    key: "land",
    iconKey: "land",
    titleKey: "landTitle",
    bodyKey: "landBody",
    href: "/#unified-form",
  },
  {
    key: "maps",
    iconKey: "digital",
    titleKey: "mapTitle",
    bodyKey: "mapBody",
    href: "/#maps",
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
      className="relative isolate overflow-hidden bg-slate-950 text-white"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-70 [background:radial-gradient(circle_at_15%_10%,rgba(37,99,235,0.42),transparent_36%),radial-gradient(circle_at_88%_80%,rgba(16,185,129,0.22),transparent_34%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.7)_1px,transparent_1px)] [background-size:42px_42px]"
      />

      <div className="relative mx-auto grid max-w-7xl gap-8 px-5 pb-10 pt-8 sm:px-8 sm:pb-14 sm:pt-12 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:gap-14 lg:py-20">
        <div>
          <p className="ps-enter inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-bold text-blue-100 backdrop-blur">
            <Sparkles className="size-3.5 text-amber-300" aria-hidden="true" />
            {tx.badge as string}
          </p>
          <p
            className="ps-enter mt-6 text-sm font-black uppercase tracking-[0.16em] text-blue-300"
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
              const Icon = SERVICE_ICONS[intent.iconKey];
              const href = intent.href === "whatsapp" ? printHref : intent.href;
              const card = (
                <>
                  <span className="grid size-14 place-items-center rounded-2xl border border-white/10 bg-gradient-to-br from-white/15 to-white/[.04] p-1.5 shadow-inner transition group-hover:scale-105 group-hover:border-amber-300/40">
                    <Icon className="h-full w-full drop-shadow-lg" />
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
                "group relative flex min-h-[184px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/95 to-slate-950 p-4 text-left shadow-[0_14px_35px_-24px_rgba(59,130,246,.9)] transition hover:-translate-y-1 hover:border-amber-300/40 hover:shadow-[0_22px_50px_-24px_rgba(251,191,36,.48)] motion-reduce:transform-none";
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
