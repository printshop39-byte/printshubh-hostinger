"use client";

/**
 * LandDocuments — the land-document half of the business, restyled but not
 * rewritten.
 *
 * SEO NOTE: every `href` here points at a URL that was already indexed. The
 * redesign changes how these services look on the homepage; it must not
 * change where they live. Do not "tidy" these paths — the trailing slashes
 * and the Marathi-transliterated slugs are the canonical forms declared in
 * src/app/sitemap.ts and in each page's `alternates.canonical`.
 *
 * Index II has no page of its own, so it links to the enquiry picker rather
 * than to a thin doorway page created just to have somewhere to point.
 */

import Link from "next/link";
import { ArrowRight, Info, ScrollText } from "lucide-react";
import { useLang, type Lang } from "@/components/language-context";
import { Reveal, Stagger, StaggerItem } from "@/components/shop/motion";
import { ASK_PRICE, priceFor } from "@/lib/pricing-data";

const t: Record<Lang, { eyebrow: string; heading: string; sub: string; note: string }> = {
  mr: {
    eyebrow: "जमीन कागदपत्रे",
    heading: "जमीन कागदपत्र सेवा",
    sub: "अधिकृत सार्वजनिक स्रोतांवर आधारित खाजगी सहाय्य — जिल्हा, तालुका व गाव सांगा, बाकी आम्ही पाहतो.",
    note: "PrintShubh हे सरकारी संकेतस्थळ नाही. अधिकृत नोंदी संबंधित शासकीय संकेतस्थळावरही उपलब्ध आहेत.",
  },
  en: {
    eyebrow: "Land documents",
    heading: "Land document services",
    sub: "Private assistance based on official public sources — tell us the district, taluka and village, we handle the rest.",
    note: "PrintShubh is not a government website. The official records are also available on the relevant government portals.",
  },
};

interface DocCard {
  code: string;
  title: Record<Lang, string>;
  desc: Record<Lang, string>;
  href: string;
  /** Exact `name.en` of the matching row in src/lib/pricing-data.ts. */
  priceNameEn: string;
}

const cards: DocCard[] = [
  {
    code: "7/12",
    title: { mr: "सातबारा उतारा", en: "7/12 Extract" },
    desc: {
      mr: "गट क्रमांक, क्षेत्र, पीक व हक्क नोंदी दर्शवणारा उतारा.",
      en: "Survey number, area, crop and rights entries for a plot.",
    },
    href: "/satbara-utara-maharashtra/",
    priceNameEn: "7/12 Extract",
  },
  {
    code: "8A",
    title: { mr: "८अ उतारा", en: "8A Extract" },
    desc: {
      mr: "एका खातेदाराच्या गावातील सर्व जमिनींचा एकत्रित उतारा.",
      en: "All holdings of one account-holder in a village, on one extract.",
    },
    href: "/8a-utara-maharashtra/",
    priceNameEn: "8A Extract",
  },
  {
    code: "फेरफार",
    title: { mr: "ई-फेरफार", en: "Mutation / eFerfar" },
    desc: {
      mr: "मालकी हक्कातील बदलाच्या नोंदी आणि फेरफार क्रमांक.",
      en: "Records of ownership changes and the mutation entry number.",
    },
    href: "/e-ferfar-maharashtra/",
    priceNameEn: "Mutation / Ferfar",
  },
  {
    code: "नकाशा",
    title: { mr: "गाव नकाशा", en: "Village Map" },
    desc: {
      mr: "गावाची सीमा आणि गटांच्या सीमारेषा दाखवणारा नकाशा.",
      en: "Village boundary and plot boundary lines on one map.",
    },
    href: "/gav-nakasha-maharashtra/",
    priceNameEn: "Village Map",
  },
  {
    code: "PC",
    title: { mr: "मिळकत पत्रिका", en: "Property Card" },
    desc: {
      mr: "शहरी मिळकतीच्या मालकी व हक्काच्या नोंदी.",
      en: "Ownership and rights records for an urban property.",
    },
    href: "/milkat-patrika-maharashtra/",
    priceNameEn: "Property Card",
  },
  {
    code: "DP / TP",
    title: { mr: "विकास व नगर रचना नकाशा", en: "DP / TP Map" },
    desc: {
      mr: "विकास योजना, टाउन प्लॅनिंग व प्रादेशिक योजना नकाशे.",
      en: "Development Plan, Town Planning and Regional Plan maps.",
    },
    href: "/dp-map-maharashtra/",
    priceNameEn: "Development Plan",
  },
  {
    code: "अहवाल",
    title: { mr: "जमीन अहवाल", en: "Land Report" },
    desc: {
      mr: "झोन, नकाशा व नोंदी एकत्र करून तयार केलेला अहवाल.",
      en: "Zone, map and record details compiled into one report.",
    },
    href: "/jameen-report-maharashtra/",
    priceNameEn: "Google Map Zone-wise Land Report",
  },
  {
    code: "Index II",
    title: { mr: "इंडेक्स २", en: "Index II" },
    desc: {
      mr: "नोंदणीकृत दस्ताचा सारांश — WhatsApp वर विचारा.",
      en: "Summary of a registered document — ask us on WhatsApp.",
    },
    href: "/#unified-form",
    priceNameEn: "Index II",
  },
];

export function LandDocuments() {
  const { lang } = useLang();
  const tx = t[lang];

  return (
    <section
      id="land-documents"
      aria-labelledby="land-documents-heading"
      className="scroll-mt-24 bg-white px-4 py-12 sm:px-8 sm:py-16 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <p className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-[11.5px] font-black uppercase tracking-[0.18em] text-blue-800">
            <ScrollText className="size-3.5" aria-hidden="true" />
            {tx.eyebrow}
          </p>
          <h2
            id="land-documents-heading"
            className="mt-5 text-3xl font-black leading-[1.12] tracking-tight text-slate-950 sm:text-4xl lg:text-[2.75rem]"
          >
            {tx.heading}
          </h2>
          <p className="mt-4 max-w-2xl text-[15px] leading-7 text-slate-600 sm:text-lg sm:leading-8">{tx.sub}</p>
        </Reveal>

        <Stagger as="ul" className="mt-7 grid gap-3 sm:mt-11 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {cards.map((card) => {
            const priceRecord = priceFor(card.priceNameEn);
            const isAsk = priceRecord === ASK_PRICE;
            return (
              <StaggerItem as="li" key={card.code}>
                <Link
                  href={card.href}
                  className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-[0_22px_46px_-24px_rgba(29,78,216,0.45)] motion-reduce:transform-none motion-reduce:transition-none sm:p-5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex w-fit items-center rounded-lg bg-slate-100 px-2.5 py-1 text-[11.5px] font-black tracking-wide text-slate-600 transition group-hover:bg-blue-50 group-hover:text-blue-700">
                      {card.code}
                    </span>
                    <span
                      className={
                        isAsk
                          ? "shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 text-right text-[10.5px] font-semibold leading-tight text-slate-600"
                          : "shrink-0 rounded-md bg-green-50 px-2 py-1 text-[12px] font-black text-green-700"
                      }
                    >
                      {priceRecord[lang]}
                    </span>
                  </div>
                  <h3 className="mt-3 text-lg font-black leading-tight text-slate-950 sm:mt-4">
                    {card.title[lang]}
                  </h3>
                  <p className="mt-2 line-clamp-2 flex-1 text-[14px] leading-6 text-slate-600 sm:line-clamp-none">
                    {card.desc[lang]}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-black text-blue-700">
                    {lang === "mr" ? "पहा" : "Open"}
                    <ArrowRight
                      className="size-4 transition duration-300 group-hover:translate-x-1 motion-reduce:transform-none"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              </StaggerItem>
            );
          })}
        </Stagger>

        <Reveal delay={0.05}>
          <p className="mt-8 flex max-w-3xl items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-[13px] font-semibold leading-6 text-amber-900">
            <Info className="mt-1 size-3.5 shrink-0 text-amber-700" aria-hidden="true" />
            <span>{tx.note}</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
