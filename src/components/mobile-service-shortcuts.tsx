"use client";

/**
 * MobileServiceShortcuts — mobile-only (md:hidden) quick-access block shown
 * right under the hero/ServiceStrip. Two visually distinct tiers so
 * documents (what most visitors came for) don't blur into tools (a
 * secondary, top-of-funnel surface):
 *
 *  - Priced document/map cards, grouped under the same bilingual group
 *    titles used on the /pricing page (src/lib/pricing-data.ts) — same
 *    words everywhere, no new copy.
 *  - A slim, visually subordinate pill row for the free calculators.
 *
 * Was formerly a single flat pill row (quick-chips.tsx) mixing both; split
 * out because a single undifferentiated row destroys the "documents vs
 * tools" hierarchy the shortcuts are meant to give a scanning visitor.
 */

import Link from "next/link";
import { useLang, type Lang } from "@/components/language-context";
import { ASK_PRICE, PRICING_GROUPS, priceFor } from "@/lib/pricing-data";

interface DocCard {
  emoji: string;
  label: Record<Lang, string>;
  priceNameEn: string;
  href: string;
}

const docCards: DocCard[] = [
  { emoji: "📄", label: { mr: "7/12 उतारा", en: "7/12" }, priceNameEn: "7/12 Extract", href: "/satbara-utara-maharashtra/" },
  { emoji: "📋", label: { mr: "8A उतारा", en: "8A" }, priceNameEn: "8A Extract", href: "/8a-utara-maharashtra/" },
  { emoji: "🔄", label: { mr: "फेरफार", en: "eFerfar" }, priceNameEn: "Mutation / Ferfar", href: "/e-ferfar-maharashtra/" },
];

const mapCards: DocCard[] = [
  { emoji: "🗺️", label: { mr: "गाव नकाशा", en: "Village Map" }, priceNameEn: "Village Map", href: "/gav-nakasha-maharashtra/" },
];

interface Tool {
  emoji: string;
  label: Record<Lang, string>;
  href: string;
}

const tools: Tool[] = [
  { emoji: "🧮", label: { mr: "EMI कॅल्क", en: "EMI" }, href: "/home-loan-emi/" },
  { emoji: "💰", label: { mr: "स्टॅम्प ड्युटी", en: "Stamp Duty" }, href: "/stamp-duty/" },
  { emoji: "📊", label: { mr: "रेडी रेकनर", en: "Ready Reckoner" }, href: "/ready-reckoner/" },
];

const toolsHeading: Record<Lang, string> = { mr: "मोफत साधने", en: "Free Tools" };

function PriceBadge({ nameEn, lang }: { nameEn: string; lang: Lang }) {
  const priceRecord = priceFor(nameEn);
  const price = priceRecord[lang];
  const isAsk = priceRecord === ASK_PRICE;
  return (
    <span
      className={
        isAsk
          ? "w-fit rounded-md bg-slate-100 px-1.5 py-0.5 text-[10.5px] font-semibold leading-tight text-slate-600"
          : "w-fit rounded-md bg-green-50 px-1.5 py-0.5 text-[11px] font-black text-green-700"
      }
    >
      {price}
    </span>
  );
}

function DocCardTile({ card, lang }: { card: DocCard; lang: Lang }) {
  return (
    <Link
      href={card.href}
      className="flex flex-col gap-1.5 rounded-xl border border-blue-100 bg-blue-50/60 px-3.5 py-3 transition active:bg-blue-100"
    >
      <span className="text-xl" aria-hidden="true">
        {card.emoji}
      </span>
      <span className="text-[13.5px] font-bold leading-tight text-slate-900">{card.label[lang]}</span>
      <PriceBadge nameEn={card.priceNameEn} lang={lang} />
    </Link>
  );
}

export function MobileServiceShortcuts() {
  const { lang } = useLang();
  const docGroupTitle = PRICING_GROUPS.find((g) => g.key === "doc")!.title[lang];

  return (
    <div className="bg-[#f8fbff] px-5 py-4 md:hidden">
      <p className="mb-2 text-[11px] font-black uppercase tracking-[0.12em] text-blue-800">{docGroupTitle}</p>
      <div className="grid grid-cols-2 gap-2.5">
        {docCards.map((card) => (
          <DocCardTile key={card.href} card={card} lang={lang} />
        ))}
        {mapCards.map((card) => (
          <div key={card.href} className="col-span-2">
            <DocCardTile card={card} lang={lang} />
          </div>
        ))}
      </div>

      <p className="mb-2 mt-4 text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">
        {toolsHeading[lang]}
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-[13px] font-bold text-slate-700 transition active:bg-slate-50"
          >
            <span aria-hidden="true">{tool.emoji}</span>
            {tool.label[lang]}
          </Link>
        ))}
      </div>
    </div>
  );
}
