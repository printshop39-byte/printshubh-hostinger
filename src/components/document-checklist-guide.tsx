"use client";

/**
 * DocumentChecklistGuide
 *
 * Premium "prepare your details" section.
 *   Left  — dark panel: title, subtitle, a 4-step process stepper, WhatsApp CTA.
 *   Right — white card: interactive checklist (tick items) with a live progress
 *           bar showing how ready the user's information is.
 *
 * Bilingual via useLang(); Marathi is the SSR default for SEO. Brand/standard
 * terms (CTS, Plot, Google Map, PDF, PrintShubh) stay as-is in both languages.
 */

import { useState } from "react";
import { Check, CheckCircle2, MessageCircle } from "lucide-react";
import { useLang, type Lang } from "@/components/language-context";
import { whatsappHref } from "@/lib/whatsapp";

type Bilingual = Record<Lang, string>;

const title: Bilingual = {
  mr: "तुमची माहिती तयार आहे का?",
  en: "Is your information ready?",
};
const subtitle: Bilingual = {
  mr: "सेवा लवकर मिळण्यासाठी खालील माहिती तयार ठेवा.",
  en: "Keep these details ready for faster service.",
};
const eyebrow: Bilingual = { mr: "तयारी", en: "Get ready" };
const stepsTitle: Bilingual = { mr: "प्रक्रिया", en: "How it works" };
const checklistTitle: Bilingual = { mr: "तयारी यादी", en: "Checklist" };
const readyLabel: Bilingual = { mr: "तयार", en: "ready" };
const cta: Bilingual = { mr: "WhatsApp वर विचारा", en: "Ask on WhatsApp" };

const checklist: Bilingual[] = [
  { mr: "जिल्हा / तालुका / गाव", en: "District / Taluka / Village" },
  { mr: "गट नंबर / सर्वे नंबर", en: "Gat / Survey number" },
  { mr: "CTS / Plot number (असल्यास)", en: "CTS / Plot number (if available)" },
  { mr: "नकाशा सेवेसाठी Google Map link", en: "Google Map link for map service" },
  { mr: "जुना दस्त / PDF (असल्यास)", en: "Old document / PDF (if available)" },
  { mr: "मोबाइल नंबर", en: "Mobile number" },
];

const steps: Bilingual[] = [
  { mr: "सेवा निवडा", en: "Select service" },
  { mr: "माहिती भरा", en: "Fill details" },
  { mr: "किंमत confirm करा", en: "Confirm price" },
  { mr: "PDF / report मिळवा", en: "Receive PDF / report" },
];

export function DocumentChecklistGuide() {
  const { lang } = useLang();
  const [checked, setChecked] = useState<boolean[]>(() => checklist.map(() => false));

  const doneCount = checked.filter(Boolean).length;
  const pct = Math.round((doneCount / checklist.length) * 100);

  function toggle(i: number) {
    setChecked((prev) => prev.map((c, idx) => (idx === i ? !c : c)));
  }

  return (
    <section className="bg-[#f7fbff] px-5 py-16 sm:px-8 lg:py-20">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-3xl border border-slate-200 shadow-xl shadow-blue-900/10 lg:grid-cols-2">
        {/* ── Left dark panel ── */}
        <div className="relative flex flex-col justify-between gap-8 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-8 text-white sm:p-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-300">
              {eyebrow[lang]}
            </p>
            <h2 className="mt-3 text-2xl font-black leading-tight sm:text-3xl">{title[lang]}</h2>
            <p className="mt-3 max-w-md text-[15px] leading-7 text-slate-300">{subtitle[lang]}</p>
          </div>

          {/* Step stepper */}
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              {stepsTitle[lang]}
            </p>
            <ol className="space-y-4">
              {steps.map((step, i) => (
                <li key={step.en} className="flex items-center gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-blue-600 text-sm font-black text-white">
                    {i + 1}
                  </span>
                  <span className="text-[15px] font-semibold text-slate-100">{step[lang]}</span>
                </li>
              ))}
            </ol>
          </div>

          <a
            href={whatsappHref()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 w-fit items-center justify-center gap-2 rounded-xl bg-green-600 px-6 text-[15px] font-bold text-white shadow-sm transition hover:bg-green-700"
          >
            <MessageCircle className="size-5" />
            {cta[lang]}
          </a>
        </div>

        {/* ── Right white checklist panel ── */}
        <div className="bg-white p-8 sm:p-10">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-lg font-black text-slate-950">{checklistTitle[lang]}</h3>
            <span className="text-sm font-bold text-blue-700">
              {doneCount}/{checklist.length} {readyLabel[lang]}
            </span>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-green-500 transition-all duration-300 motion-reduce:transition-none"
              style={{ width: `${pct}%` }}
            />
          </div>

          <ul className="mt-6 space-y-2.5">
            {checklist.map((item, i) => {
              const on = checked[i];
              return (
                <li key={item.en}>
                  <button
                    type="button"
                    onClick={() => toggle(i)}
                    aria-pressed={on}
                    className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-[15px] font-semibold transition ${
                      on
                        ? "border-green-200 bg-green-50 text-green-900"
                        : "border-slate-200 bg-white text-slate-700 hover:border-blue-300"
                    }`}
                  >
                    <span
                      className={`grid size-6 shrink-0 place-items-center rounded-md border transition ${
                        on ? "border-green-500 bg-green-500 text-white" : "border-slate-300 bg-white text-transparent"
                      }`}
                      aria-hidden="true"
                    >
                      <Check className="size-4" />
                    </span>
                    {item[lang]}
                    {on && <CheckCircle2 className="ml-auto size-4 shrink-0 text-green-600" aria-hidden="true" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
