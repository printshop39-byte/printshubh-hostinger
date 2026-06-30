"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { LegalPageShell } from "@/components/legal-page-shell";
import { useLang } from "@/components/language-context";
import { faqs, type Qa } from "./faq-data";

export function FaqContent() {
  const { lang } = useLang();
  const items = faqs[lang];
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <LegalPageShell
      title={{ mr: "वारंवार विचारले जाणारे प्रश्न", en: "Frequently Asked Questions" }}
      breadcrumb={{ mr: "FAQ", en: "FAQ" }}
      intro={{
        mr: "7/12, 8A, फेरफार, गाव नकाशा, DP/TP, पेमेंट आणि परताव्यासंदर्भात सर्व सामान्य प्रश्नांची उत्तरे एका ठिकाणी.",
        en: "Common questions about 7/12, 8A, mutation, village maps, DP/TP, payment and refund — all in one place.",
      }}
      updatedAt="May 2026"
      contentMr={<FaqList items={items} openIdx={openIdx} setOpenIdx={setOpenIdx} />}
      contentEn={<FaqList items={items} openIdx={openIdx} setOpenIdx={setOpenIdx} />}
    />
  );
}

function FaqList({
  items,
  openIdx,
  setOpenIdx,
}: {
  items: Qa[];
  openIdx: number | null;
  setOpenIdx: (n: number | null) => void;
}) {
  return (
    <div className="divide-y divide-slate-200">
      {items.map((it, i) => {
        const open = openIdx === i;
        return (
          <div key={i} className="py-3">
            <button
              type="button"
              onClick={() => setOpenIdx(open ? null : i)}
              aria-expanded={open}
              className="flex w-full items-start justify-between gap-3 text-left"
            >
              <span className="text-[15px] font-black leading-7 text-slate-950">
                {it.q}
              </span>
              <ChevronDown
                className={`mt-1 size-4 shrink-0 text-slate-500 transition-transform ${
                  open ? "rotate-180" : ""
                }`}
              />
            </button>
            {open && (
              <p className="mt-2 pr-7 text-[15px] leading-7 text-slate-700">{it.a}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
