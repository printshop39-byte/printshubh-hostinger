"use client";

/**
 * HowItWorks — the homepage's five-step process.
 *
 * Browse → send the file on WhatsApp → confirm size, material and price →
 * print → collect at the studio. It is the owner's own description of how an
 * order goes, set as one numbered list: a vertical list on a phone, five
 * columns from `lg`.
 *
 * WHAT IT DELIBERATELY DOES NOT SAY
 *   No delivery, shipping, installation, courier, turnaround time or "same
 *   day". None has been confirmed. The last step is collection at the studio
 *   and nothing more. The price is stated as confirmed BEFORE work starts,
 *   which the hero and the pricing page already say.
 *
 * Nothing waits for an animation: plain server-rendered markup.
 */

import { useLang, type Lang } from "@/components/language-context";

type Step = { title: string; text: string };

const copy: Record<Lang, { eyebrow: string; heading: string; steps: Step[] }> = {
  mr: {
    eyebrow: "कसं चालतं",
    heading: "तुमच्या फाइलपासून प्रिंटपर्यंत.",
    steps: [
      { title: "निवडा", text: "कलेक्शन निवडा, किंवा काय हवं ते सांगा." },
      { title: "फाइल पाठवा", text: "फाइल, आकार आणि प्रती WhatsApp वर पाठवा." },
      {
        title: "आम्ही कळवतो",
        text: "काम सुरू करण्यापूर्वी आकार, मटेरियल आणि किंमत निश्चित केली जाते.",
      },
      { title: "प्रिंट", text: "तुमची ऑर्डर स्टुडिओमध्ये प्रिंट होते." },
      { title: "प्रिंट तयार", text: "कोल्हापूर स्टुडिओमधून घ्या." },
    ],
  },
  en: {
    eyebrow: "How it works",
    heading: "From your file to your print.",
    steps: [
      { title: "Choose", text: "Pick a collection, or tell us what you need." },
      { title: "Send your file", text: "Send the file, size and copies on WhatsApp." },
      {
        title: "We confirm",
        text: "Size, material and price are confirmed before work starts.",
      },
      { title: "We print", text: "Your order is printed at the studio." },
      { title: "Print ready", text: "Collect it from the studio in Kolhapur." },
    ],
  },
};

export function HowItWorks() {
  const { lang } = useLang();
  const tx = copy[lang];

  return (
    <section
      id="process"
      aria-labelledby="process-heading"
      className="scroll-mt-20 bg-white px-5 py-10 sm:px-8 sm:py-14 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <p className="flex items-center gap-3 text-[12px] font-black uppercase tracking-[0.2em] text-brand-navy">
          <span aria-hidden="true" className="h-px w-8 bg-brand-gold" />
          {tx.eyebrow}
        </p>
        <h2
          id="process-heading"
          className="mt-4 max-w-2xl text-balance text-[2.2rem] font-black leading-[1.1] tracking-tight text-brand-navy sm:text-5xl"
        >
          {tx.heading}
        </h2>

        <ol className="mt-8 border-b border-brand-gold/40 sm:mt-10 lg:mt-14 lg:grid lg:grid-cols-5 lg:gap-8 lg:border-b-0">
          {tx.steps.map((step, i) => (
            <li
              key={step.title}
              className="grid grid-cols-[3rem_1fr] gap-x-4 border-t border-brand-gold/40 py-4 sm:py-5 lg:block lg:py-6 lg:pt-6"
            >
              <span
                aria-hidden="true"
                className="text-3xl font-black tabular-nums leading-none text-brand-gold lg:text-5xl"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="lg:mt-5">
                <h3 className="text-xl font-black leading-tight tracking-tight text-brand-navy">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-[15px] leading-6 text-slate-600">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
