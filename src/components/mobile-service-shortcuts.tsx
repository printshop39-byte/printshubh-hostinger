"use client";

/**
 * MobileServiceShortcuts — mobile-only (md:hidden) quick-access block shown
 * right under the hero/ServiceStrip. A slim pill row for the free
 * calculators (home-loan EMI, stamp duty, ready reckoner) — top-of-funnel
 * tools, not a priced service.
 *
 * The priced document/map card grid (7/12, 8A, eFerfar, Village Map) that
 * used to sit above this row was removed when LandDocuments and
 * UnifiedRecordForm came off the homepage (owner repositioning decision) —
 * see src/app/page.tsx. The land-unit-converter chip was dropped from this
 * row too, in the same repositioning. The pages themselves (including
 * /land-unit-converter/) are untouched; they are just no longer promoted
 * from here.
 */

import Link from "next/link";
import { useLang, type Lang } from "@/components/language-context";

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

export function MobileServiceShortcuts() {
  const { lang } = useLang();

  return (
    <div className="bg-[#f8fbff] px-5 py-4 md:hidden">
      <p className="mb-2 text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">
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
