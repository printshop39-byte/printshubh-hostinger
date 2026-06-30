"use client";

/**
 * QuickChips — mobile-only (md:hidden) horizontal, swipeable row of the most-
 * requested services, shown right under the hero. Each chip jumps straight to
 * that service's page (a 1-tap shortcut). Hidden on desktop, where the full
 * nav + services grid already serve this.
 */

import Link from "next/link";
import { useLang, type Lang } from "@/components/language-context";

interface Chip {
  emoji: string;
  label: Record<Lang, string>;
  href: string;
}

const chips: Chip[] = [
  { emoji: "📄", label: { mr: "7/12 उतारा", en: "7/12" }, href: "/satbara-utara-maharashtra/" },
  { emoji: "📋", label: { mr: "8A उतारा", en: "8A" }, href: "/8a-utara-maharashtra/" },
  { emoji: "🗺️", label: { mr: "गाव नकाशा", en: "Village Map" }, href: "/gav-nakasha-maharashtra/" },
  { emoji: "🔄", label: { mr: "फेरफार", en: "eFerfar" }, href: "/e-ferfar-maharashtra/" },
  { emoji: "🧮", label: { mr: "EMI कॅल्क", en: "EMI" }, href: "/home-loan-emi/" },
  { emoji: "💰", label: { mr: "स्टॅम्प ड्युटी", en: "Stamp Duty" }, href: "/stamp-duty/" },
];

export function QuickChips() {
  const { lang } = useLang();

  return (
    <div className="bg-[#f8fbff] md:hidden">
      <div className="flex gap-2 overflow-x-auto px-5 py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {chips.map((chip) => (
          <Link
            key={chip.href}
            href={chip.href}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-800 transition active:bg-blue-100"
          >
            <span aria-hidden="true">{chip.emoji}</span>
            {chip.label[lang]}
          </Link>
        ))}
      </div>
    </div>
  );
}
