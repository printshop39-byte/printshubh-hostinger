"use client";

/**
 * ToolsSection — homepage grid of the free finance/property calculators.
 * Anchored at #tools (the header nav links here). Customer-facing: these
 * tools pull in search traffic and feed the WhatsApp document services.
 */

import Link from "next/link";
import { ArrowRight, Calculator, FileText, Landmark } from "lucide-react";
import { useLang, type Lang } from "@/components/language-context";

interface Tool {
  href: string;
  icon: typeof Calculator;
  title: Record<Lang, string>;
  desc: Record<Lang, string>;
}

const TOOLS: Tool[] = [
  {
    href: "/home-loan-emi/",
    icon: Calculator,
    title: { mr: "गृहकर्ज EMI कॅल्क्युलेटर", en: "Home-loan EMI Calculator" },
    desc: {
      mr: "मासिक EMI, एकूण व्याज आणि बँकनिहाय तुलना.",
      en: "Monthly EMI, total interest and a bank-wise comparison.",
    },
  },
  {
    href: "/stamp-duty/",
    icon: FileText,
    title: { mr: "मुद्रांक शुल्क कॅल्क्युलेटर", en: "Stamp Duty Calculator" },
    desc: {
      mr: "मुद्रांक शुल्क, मेट्रो सेस व नोंदणी शुल्क मोजा.",
      en: "Estimate stamp duty, metro cess and registration fee.",
    },
  },
  {
    href: "/ready-reckoner/",
    icon: Landmark,
    title: { mr: "रेडी रेकनर दर शोध", en: "Ready Reckoner Rate Lookup" },
    desc: {
      mr: "तालुका व झोननिहाय सरकारी जमीन-मूल्य दर.",
      en: "Government land-value rates by taluka and zone.",
    },
  },
];

const heading: Record<Lang, string> = { mr: "मोफत साधने", en: "Free Tools" };
const sub: Record<Lang, string> = {
  mr: "मालमत्ता व कर्जासाठी झटपट गणन — मराठीत.",
  en: "Quick property and loan calculators — in Marathi.",
};

export function ToolsSection() {
  const { lang } = useLang();
  const t: Lang = lang === "mr" ? "mr" : "en";

  return (
    <section id="tools" className="scroll-mt-20 px-5 py-12 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl font-black text-slate-950 sm:text-3xl">{heading[t]}</h2>
        <p className="mt-2 text-base text-slate-600">{sub[t]}</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.href}
                href={tool.href}
                className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-200 hover:shadow-md"
              >
                <span className="inline-flex size-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-4 text-lg font-black text-slate-900">{tool.title[t]}</h3>
                <p className="mt-1.5 flex-1 text-[14.5px] leading-6 text-slate-600">{tool.desc[t]}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-blue-700">
                  {t === "mr" ? "उघडा" : "Open"}
                  <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
