"use client";

/**
 * ShopHero — the first five seconds of printshubh.shop.
 *
 * The job of this block is to answer one question before the visitor
 * scrolls: "what is this shop?" So the H1 is the business name and what it
 * does — PRINTSHUBH / JUMBO XEROX — with the service list right under it.
 * Land documents are still here, as one of four things we do, rather than
 * the only thing the page talks about.
 *
 * PERFORMANCE NOTES
 *   The headline block is animated with the CSS `.ps-enter` keyframe, NOT
 *   with Framer Motion. The <h1> is the LCP element; a JS-driven fade would
 *   keep it at opacity 0 until React hydrates, which on a mid-range phone
 *   can be a second or more of blank hero. CSS starts at first paint.
 *
 *   Framer Motion is used only for the decorative right-hand column
 *   (pointer parallax), where hydration timing doesn't matter and the whole
 *   thing is skipped on touch devices anyway.
 */

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, FileText, Info, Printer, Sparkles } from "lucide-react";
import { useLang, type Lang } from "@/components/language-context";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { trackWhatsAppLead } from "@/components/meta-pixel";
import { trackFunnelEvent } from "@/lib/analytics";
import {
  BRAND_LINE,
  BRAND_NAME,
  SHOP_PHOTOS,
  YEARS_EXPERIENCE,
} from "@/lib/shop-profile";
import { PrintDeskVisual } from "@/components/shop/print-desk-visual";
import {
  SERVICE_ICONS,
  type ServiceIconKey,
} from "@/components/shop/service-icons";
import {
  Magnetic,
  useCalmMotion,
  useFinePointer,
  useParallaxOffset,
  usePointerParallax,
} from "@/components/shop/motion";

const t: Record<
  Lang,
  {
    badge: string;
    eyebrow: string;
    headline: string;
    support: string;
    printingTitle: string;
    printingBody: string;
    printingCta: string;
    landTitle: string;
    landBody: string;
    landCta: string;
    trust: string[];
    whatsappMessage: string;
    disclaimer: string;
  }
> = {
  mr: {
    badge: "स्थानिक दुकान • डिजिटल सेवा",
    eyebrow: `${BRAND_NAME} ${BRAND_LINE}`,
    headline: "प्रिंटिंग असो किंवा जमीन कागदपत्रे — काम WhatsApp वरून सुरू करा",
    support:
      "PDF, फोटो किंवा जमिनीची माहिती पाठवा. किंमत आणि उपलब्धता आधी कळवूनच काम सुरू केले जाईल.",
    printingTitle: "प्रिंटिंग व फोटो",
    printingBody: "PDF / फोटो पाठवा • किंमत व तयार होण्याची वेळ विचारा",
    printingCta: "फाइल पाठवा",
    landTitle: "जमीन कागदपत्रे",
    landBody: "7/12, 8A, गाव नकाशा, मिळकत पत्रिका व DP / TP",
    landCta: "रेकॉर्ड निवडा",
    trust: [
      `${YEARS_EXPERIENCE}+ वर्षांचा अनुभव`,
      "अधिकृत स्रोतांवर आधारित",
      "बहुतेक कागदपत्रे त्याच दिवशी",
    ],
    whatsappMessage:
      "नमस्कार PrintShubh, मी प्रिंटसाठी फाइल पाठवत आहे. कृपया किंमत व वेळ सांगा.",
    disclaimer:
      "PrintShubh हे सरकारी संकेतस्थळ नाही. जमीन कागदपत्रांसाठी आम्ही अधिकृत स्रोतांवर आधारित खाजगी सहाय्य सेवा देतो.",
  },
  en: {
    badge: "Local shop • Digital services",
    eyebrow: `${BRAND_NAME} ${BRAND_LINE}`,
    headline: "Printing or land documents — start your job on WhatsApp",
    support:
      "Send a PDF, photo or land details. We confirm price and availability before starting.",
    printingTitle: "Printing & photos",
    printingBody: "Send a PDF / photo • ask for price and turnaround",
    printingCta: "Send a file",
    landTitle: "Land documents",
    landBody: "7/12, 8A, village map, property card and DP / TP",
    landCta: "Choose a record",
    trust: [
      `${YEARS_EXPERIENCE}+ years of experience`,
      "Based on official sources",
      "Most documents the same day",
    ],
    whatsappMessage:
      "Hello PrintShubh, I am sending a file for printing. Please share the price and turnaround.",
    disclaimer:
      "PrintShubh is not a government website. For land documents we provide private assistance based on official public sources.",
  },
};

/* Floating document tiles over the hero visual.
 *
 * `depth` drives the parallax: a higher number moves further with the
 * cursor, which reads as "closer to the viewer". `top`/`left` are
 * percentages of the visual box so the layout holds at every width. */
const tiles: {
  label: string;
  sub: Record<Lang, string>;
  icon: ServiceIconKey;
  top: string;
  left: string;
  depth: number;
  floatY: string;
  floatDur: string;
  delay: string;
}[] = [
  {
    label: "7/12",
    sub: { mr: "उतारा", en: "Extract" },
    icon: "land",
    top: "4%",
    left: "-3%",
    depth: 18,
    floatY: "9px",
    floatDur: "8.5s",
    delay: "0ms",
  },
  {
    label: "A3 PRINT",
    sub: { mr: "रंगीत / B&W", en: "Colour / B&W" },
    icon: "printer",
    top: "18%",
    left: "66%",
    depth: 26,
    floatY: "7px",
    floatDur: "7.2s",
    delay: "600ms",
  },
  {
    label: "PHOTO",
    sub: { mr: "पासपोर्ट / ID", en: "Passport / ID" },
    icon: "photo",
    top: "62%",
    left: "-4%",
    depth: 12,
    floatY: "6px",
    floatDur: "9.4s",
    delay: "300ms",
  },
  {
    label: "JUMBO XEROX",
    sub: { mr: "मोठ्या आकाराचे", en: "Large format" },
    icon: "printer",
    top: "78%",
    left: "52%",
    depth: 22,
    floatY: "8px",
    floatDur: "8s",
    delay: "900ms",
  },
];

function HeroTile({
  tile,
  lang,
  px,
  py,
  animate,
}: {
  tile: (typeof tiles)[number];
  lang: Lang;
  px: ReturnType<typeof usePointerParallax>["px"];
  py: ReturnType<typeof usePointerParallax>["py"];
  animate: boolean;
}) {
  const x = useParallaxOffset(px, tile.depth);
  const y = useParallaxOffset(py, tile.depth * 0.6);
  const TileIcon = SERVICE_ICONS[tile.icon];

  return (
    <motion.div
      className="absolute"
      style={{
        top: tile.top,
        left: tile.left,
        x: animate ? x : 0,
        y: animate ? y : 0,
      }}
    >
      <div
        className="ps-float ps-glass flex items-center gap-2.5 rounded-xl px-3.5 py-2.5"
        style={
          {
            "--ps-float-y": tile.floatY,
            "--ps-float-dur": tile.floatDur,
            "--ps-float-delay": tile.delay,
          } as React.CSSProperties
        }
      >
        <TileIcon className="h-7 w-7 shrink-0" />
        <div>
          <p className="text-[13px] font-black leading-none tracking-tight text-slate-900">
            {tile.label}
          </p>
          <p className="mt-1 text-[11px] font-semibold leading-none text-slate-500">
            {tile.sub[lang]}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function ShopHero() {
  const { lang } = useLang();
  const tx = t[lang];

  const calm = useCalmMotion();
  const fine = useFinePointer();
  // Parallax only where there is a real mouse and motion is welcome.
  const parallaxOn = fine && !calm;
  const { px, py, onMouseMove, onMouseLeave } = usePointerParallax(parallaxOn);

  const printWaHref = buildWhatsAppUrl({
    message: tx.whatsappMessage,
    campaign: "hero",
    content: "printing-intent",
  });

  // Once real shop photography exists, the hero leads with it instead of
  // the illustration — a real counter always beats a drawing of one.
  const heroPhoto = SHOP_PHOTOS[0];

  return (
    <section className="ps-hero-wash relative isolate overflow-hidden border-b border-slate-200">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 pb-12 pt-10 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-8 lg:pb-16 lg:pt-14">
        {/* ── Left: the message ────────────────────────────────────── */}
        <div id="top">
          <p
            className="ps-enter inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3.5 py-1.5 text-[12.5px] font-bold text-blue-800 shadow-sm"
            style={{ "--ps-delay": "0ms" } as React.CSSProperties}
          >
            <Sparkles className="size-3.5" aria-hidden="true" />
            {tx.badge}
          </p>

          <p
            className="ps-enter mt-5 text-sm font-black uppercase tracking-[0.12em] text-blue-700"
            style={{ "--ps-delay": "70ms" } as React.CSSProperties}
          >
            {tx.eyebrow}
          </p>

          <h1
            className="ps-enter mt-3 max-w-2xl text-[2.35rem] font-black leading-[1.05] tracking-[-0.025em] text-slate-950 sm:text-5xl lg:text-[3.5rem]"
            style={{ "--ps-delay": "120ms" } as React.CSSProperties}
          >
            {tx.headline}
          </h1>

          <p
            className="ps-enter mt-4 max-w-xl text-lg leading-8 text-slate-700"
            style={{ "--ps-delay": "180ms" } as React.CSSProperties}
          >
            {tx.support}
          </p>

          <div
            className="ps-enter mt-7 grid gap-3 sm:grid-cols-2"
            style={{ "--ps-delay": "240ms" } as React.CSSProperties}
          >
            <Magnetic className="h-full">
              <a
                href={printWaHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  trackWhatsAppLead();
                  trackFunnelEvent("hero_intent_click", {
                    lang,
                    surface: "hero",
                    service_key: "printing",
                  });
                }}
                className="group flex h-full min-h-[132px] w-full flex-col items-start rounded-2xl bg-green-600 p-5 text-left text-white shadow-lg shadow-green-600/20 transition hover:-translate-y-0.5 hover:bg-green-700 motion-reduce:transform-none"
              >
                <span className="flex items-center gap-2 text-lg font-black">
                  <Printer className="size-5" aria-hidden="true" />
                  {tx.printingTitle}
                </span>
                <span className="mt-2 text-sm font-semibold leading-5 text-green-50">
                  {tx.printingBody}
                </span>
                <span className="mt-auto flex items-center gap-1 pt-3 text-sm font-black">
                  {tx.printingCta}
                  <ArrowRight
                    className="size-4 transition group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
              </a>
            </Magnetic>
            <Link
              href="#unified-form"
              onClick={() =>
                trackFunnelEvent("hero_intent_click", {
                  lang,
                  surface: "hero",
                  service_key: "land",
                })
              }
              className="group flex min-h-[132px] flex-col items-start rounded-2xl border border-blue-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-lg motion-reduce:transform-none"
            >
              <span className="flex items-center gap-2 text-lg font-black text-slate-950">
                <FileText className="size-5 text-blue-700" aria-hidden="true" />
                {tx.landTitle}
              </span>
              <span className="mt-2 text-sm font-semibold leading-5 text-slate-600">
                {tx.landBody}
              </span>
              <span className="mt-auto flex items-center gap-1 pt-3 text-sm font-black text-blue-700">
                {tx.landCta}
                <ArrowRight
                  className="size-4 transition group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </span>
            </Link>
          </div>

          {/* Trust micro-line — every item is a claim the site already makes
              elsewhere: 30+ years (footer badges), "based on official
              sources" (disclaimer, service pages) and same-day delivery
              (FAQ, scoped to documents). Earlier drafts said "स्थानिक
              विश्वास" / "Trusted locally" and "जलद सेवा" / "Fast turnaround",
              which are unsourced promotional claims — do not reintroduce
              them. No new numbers, no new promises. */}
          <ul
            className="ps-enter mt-5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-[13px] font-bold text-slate-600"
            style={{ "--ps-delay": "320ms" } as React.CSSProperties}
          >
            {tx.trust.map((item, i) => (
              <li key={item} className="flex items-center gap-2.5">
                {i > 0 && (
                  <span aria-hidden="true" className="text-slate-300">
                    •
                  </span>
                )}
                {item}
              </li>
            ))}
          </ul>

          {/* Legally required, and deliberately above the fold: the land
              document half of the business must never read as official. */}
          <p
            className="ps-enter mt-5 flex max-w-xl items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-[12.5px] font-semibold leading-6 text-amber-900"
            style={{ "--ps-delay": "380ms" } as React.CSSProperties}
          >
            <Info
              className="mt-1 size-3.5 shrink-0 text-amber-700"
              aria-hidden="true"
            />
            <span>{tx.disclaimer}</span>
          </p>
        </div>

        {/* ── Right: the visual ────────────────────────────────────── */}
        <div
          className="relative mx-auto w-full max-w-lg lg:max-w-none"
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
        >
          <div className="ps-paper-grid relative aspect-[5/4] overflow-hidden rounded-3xl border border-slate-200 bg-white/60 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.45)]">
            {heroPhoto ? (
              <Image
                src={heroPhoto.src}
                alt={heroPhoto.alt[lang]}
                width={heroPhoto.width}
                height={heroPhoto.height}
                priority
                sizes="(max-width: 1024px) 92vw, 46vw"
                className="h-full w-full object-cover"
              />
            ) : (
              <PrintDeskVisual className="h-full w-full" />
            )}
          </div>

          {/* Floating tiles sit OUTSIDE the clipped box so they can overhang
              its edges — that overlap is what gives the composition depth. */}
          <div className="pointer-events-none absolute inset-0">
            {tiles.map((tile) => (
              <HeroTile
                key={tile.label}
                tile={tile}
                lang={lang}
                px={px}
                py={py}
                animate={parallaxOn}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
