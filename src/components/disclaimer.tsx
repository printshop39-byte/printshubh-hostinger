"use client";

import { AlertTriangle, MessageCircle } from "lucide-react";
import { useLang, type Lang } from "@/components/language-context";

const disclaimerText: Record<Lang, string> = {
  mr: "PrintShubh हे सरकारी संकेतस्थळ नाही. आम्ही अधिकृत स्रोतांवर आधारित सहाय्य सेवा प्रदान करतो.",
  en: "PrintShubh is not a government website. We provide assistance services based on official sources.",
};

const contactLabel: Record<Lang, string> = {
  mr: "संपर्क करा",
  en: "Contact Us",
};

const waMessage: Record<Lang, string> = {
  mr: "मला PrintShubh सेवेबद्दल माहिती हवी आहे",
  en: "I need information about PrintShubh services",
};

export function Disclaimer() {
  const { lang } = useLang();
  const waHref = `https://wa.me/918625801907?text=${encodeURIComponent(waMessage[lang])}`;

  return (
    <section className="border-t border-slate-200 bg-white px-5 py-10 sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 text-slate-700 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-1 size-5 shrink-0 text-amber-600" />
          <p className="max-w-3xl text-sm font-medium leading-7">
            {disclaimerText[lang]}
          </p>
        </div>
        <a
          href={waHref}
          className="pointer-events-auto inline-flex h-11 items-center justify-center gap-2 rounded-md bg-green-600 px-4 text-sm font-bold text-white transition hover:bg-green-700"
        >
          <MessageCircle className="size-4" />
          {contactLabel[lang]}
        </a>
      </div>
    </section>
  );
}
