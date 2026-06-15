"use client";

/**
 * PremiumHero
 *
 * Human-focused, premium homepage hero.
 *   Left  — badge, headline, subheading, search bar, category pills,
 *           primary WhatsApp CTA, mini trust badge.
 *   Right — auto-changing image carousel (4 uploaded photos) with smooth
 *           cross-fade every ~4.5s, dark gradient overlay, per-slide caption,
 *           dots indicator, pause on hover/focus, reduced-motion aware.
 *
 * SSR: "use client" components are still server-rendered by Next, and the
 * LanguageProvider default is "mr", so the Marathi headline/subheading ship in
 * the server HTML for SEO. Brand/standard terms (PrintShubh, WhatsApp, DP/TP,
 * Index II, Google Map) stay as-is in both languages.
 */

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  MapPinned,
  MessageCircle,
  Search,
} from "lucide-react";
import { useLang, type Lang } from "@/components/language-context";
import { HeroMotionBackground } from "@/components/hero-motion-background";
import { whatsappHref } from "@/lib/whatsapp";

type Slide = { src: string; caption: Record<Lang, string> };

const slides: Slide[] = [
  {
    src: "/images/hero/slider_banking.jpg",
    caption: {
      mr: "बँक कामांसाठी कागदपत्र सहाय्य",
      en: "Document help for bank-related work",
    },
  },
  {
    src: "/images/hero/slider_farmer.jpg",
    caption: {
      mr: "शेतकरी आणि जमीन कागदपत्र सेवा",
      en: "Farmer and land document services",
    },
  },
  {
    src: "/images/hero/slider_gov_docs.jpg",
    caption: {
      mr: "सरकारी दस्त आणि नकाशा संदर्भ",
      en: "Government records and map references",
    },
  },
  {
    src: "/images/hero/slider_realestate.jpg",
    caption: {
      mr: "शहरी मालमत्ता, DP/TP आणि प्लॅन सेवा",
      en: "Urban property, DP/TP and planning services",
    },
  },
];

const t: Record<
  Lang,
  {
    badge: string;
    headline: string;
    subheading: string;
    searchPlaceholder: string;
    pills: string[];
    cta: string;
    trust: string;
    searchAria: string;
  }
> = {
  mr: {
    badge: "महाराष्ट्रासाठी डिजिटल जमीन सेवा",
    headline: "जमीन, शेती आणि मालमत्ता कागदपत्रांची डिजिटल सेवा",
    subheading:
      "7/12, 8A, गाव नकाशा, मिळकत पत्रिका, फेरफार, DP/TP आणि झोन रिपोर्ट WhatsApp वर मिळवा.",
    searchPlaceholder: "7/12, गाव नकाशा, मिळकत पत्रिका, DP Map शोधा...",
    pills: ["जमीन कागदपत्रे", "नकाशे / प्लॅन", "मालमत्ता कार्ड", "फेरफार / Index II"],
    cta: "WhatsApp वर विचारा",
    trust: "किंमत आधी कळेल — छुपी फी नाही",
    searchAria: "सेवा शोधा",
  },
  en: {
    badge: "Digital land services for Maharashtra",
    headline: "Digital service for land, farm and property documents",
    subheading:
      "Get 7/12, 8A, village maps, property card, mutation, DP/TP and zone reports on WhatsApp.",
    searchPlaceholder: "Search 7/12, village map, property card, DP map...",
    pills: ["Land Documents", "Maps / Plans", "Property Card", "Mutation / Index II"],
    cta: "Ask on WhatsApp",
    trust: "Know the price first — no hidden fees",
    searchAria: "Search services",
  },
};

const SLIDE_MS = 4500;

function searchMessage(query: string, lang: Lang): string {
  const q = query.trim();
  if (!q) {
    return lang === "mr"
      ? "नमस्कार PrintShubh, मला जमीन कागदपत्र सेवेसाठी मदत हवी आहे. कृपया किंमत आणि वेळ सांगा."
      : "Hello PrintShubh, I need help with land document services. Please share price and time.";
  }
  return lang === "mr"
    ? `नमस्कार PrintShubh, मला "${q}" बद्दल माहिती हवी आहे. कृपया किंमत आणि वेळ सांगा.`
    : `Hello PrintShubh, I need information about "${q}". Please share price and time.`;
}

export function PremiumHero() {
  const { lang } = useLang();
  const tx = t[lang];
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const dotsId = useId();
  const pausedRef = useRef(false);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  /* Auto-advance the carousel. A single interval reads `pausedRef` so hover
   * pausing never tears down/recreates the timer. */
  useEffect(() => {
    const id = setInterval(() => {
      if (pausedRef.current) return;
      setActive((a) => (a + 1) % slides.length);
    }, SLIDE_MS);
    return () => clearInterval(id);
  }, []);

  const searchHref = whatsappHref(searchMessage(query, lang));
  const ctaHref = whatsappHref(searchMessage("", lang));

  return (
    <section className="relative isolate overflow-hidden border-b border-slate-200 bg-[#f8fbff]">
      <HeroMotionBackground />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-10 px-5 pb-14 pt-8 sm:px-8 lg:grid-cols-2 lg:pb-20 lg:pt-14">
        {/* ── Left: content ── */}
        <div className="max-w-2xl">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3.5 py-1.5 text-sm font-bold text-blue-800 shadow-sm">
            <MapPinned className="size-4" />
            {tx.badge}
          </p>

          <h1 className="text-4xl font-black leading-[1.12] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            {tx.headline}
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-700">{tx.subheading}</p>

          {/* Search bar — submits the query to WhatsApp as a prefilled message */}
          <div className="mt-7 flex w-full max-w-xl items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700">
              <Search className="size-5" aria-hidden="true" />
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={tx.searchPlaceholder}
              aria-label={tx.searchAria}
              className="min-w-0 flex-1 bg-transparent px-1 text-[15px] font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />
            <a
              href={searchHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={tx.cta}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-blue-700 px-4 text-sm font-bold text-white transition hover:bg-blue-800"
            >
              <Search className="size-4 sm:hidden" />
              <span className="hidden sm:inline">{lang === "mr" ? "शोधा" : "Search"}</span>
            </a>
          </div>

          {/* Quick category pills → jump to the services section */}
          <div className="mt-4 flex flex-wrap gap-2">
            {tx.pills.map((pill) => (
              <a
                key={pill}
                href="#services"
                className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-700"
              >
                {pill}
              </a>
            ))}
          </div>

          {/* Primary WhatsApp CTA + mini trust badge */}
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href={ctaHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-[52px] items-center justify-center gap-2 rounded-xl bg-green-600 px-6 text-base font-bold text-white shadow-sm transition hover:bg-green-700"
            >
              <MessageCircle className="size-5" />
              {tx.cta}
              <ArrowRight className="size-4" />
            </a>
            <span className="inline-flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-3.5 py-2 text-[13px] font-bold text-green-800">
              <BadgeCheck className="size-4 shrink-0" />
              {tx.trust}
            </span>
          </div>
        </div>

        {/* ── Right: auto-changing image carousel ── */}
        <div
          className="group relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-xl shadow-blue-900/10 sm:aspect-[16/10] lg:aspect-[4/3] lg:h-[520px]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
          role="group"
          aria-roledescription="carousel"
          aria-label={lang === "mr" ? "सेवा छायाचित्रे" : "Service images"}
        >
          {slides.map((slide, i) => (
            <div
              key={slide.src}
              className="absolute inset-0 transition-opacity duration-700 ease-in-out motion-reduce:transition-none"
              style={{ opacity: i === active ? 1 : 0 }}
              aria-hidden={i === active ? undefined : "true"}
            >
              <Image
                src={slide.src}
                alt={slide.caption[lang]}
                fill
                priority={i === 0}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              {/* Dark gradient overlay for caption legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/15 to-transparent" />
              <p className="absolute inset-x-0 bottom-0 p-5 text-lg font-bold leading-7 text-white drop-shadow sm:p-6 sm:text-xl">
                {slide.caption[lang]}
              </p>
            </div>
          ))}

          {/* Dots indicator */}
          <div className="absolute bottom-4 right-4 z-10 flex gap-2" role="tablist" aria-label={dotsId}>
            {slides.map((slide, i) => (
              <button
                key={slide.src}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={`${lang === "mr" ? "स्लाइड" : "Slide"} ${i + 1}`}
                onClick={() => setActive(i)}
                className={`h-2.5 rounded-full transition-all ${
                  i === active ? "w-6 bg-white" : "w-2.5 bg-white/55 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
