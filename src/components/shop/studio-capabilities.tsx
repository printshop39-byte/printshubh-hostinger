"use client";

/**
 * StudioCapabilities — the homepage's "how it is printed" section.
 *
 * The collections say WHAT is printed and the CAD section says WHO the plans
 * are for. This section answers one different question: with what capability.
 * Its visual job is the "spec sheet": a large 11 and one plain row.
 *
 * WHAT IS STATED, AND WHERE IT COMES FROM
 *   - An 11-colour printing system and large-format printing: facts supplied
 *     by the owner and already stated on the About page.
 *   - Size, material and price confirmed before printing: the process the
 *     owner described (and the price statement the hero already makes).
 *   Nothing else. The printer's make and model are deliberately NOT named on
 *   the homepage (owner decision), and there is no list of materials here (the
 *   collections section already carries it), no resolution, speed, colour
 *   gamut, ink durability, warranty, certification, print width or "best /
 *   highest quality". CAD is not connected to this equipment either: whether
 *   plans go through it has not been confirmed.
 *
 * NO PICTURES, NO RENDERS
 *   There is no photo of the machine (PRINTING_TECH_PHOTOS in shop-profile.ts
 *   is empty), and a stock or generated image would not be this machine. The
 *   page is type and a hairline panel. When real photos exist, add them to
 *   that list and a photo strip can go below the panel.
 *
 * Nothing waits for an animation: no Reveal, no opacity-zero first state.
 */

import { useLang, type Lang } from "@/components/language-context";

const copy: Record<
  Lang,
  {
    eyebrow: string;
    heading: string;
    body: string;
    big: string;
    bigLabel: string;
    rows: { label: string; value: string }[];
  }
> = {
  mr: {
    eyebrow: "स्टुडिओ",
    heading: "प्रिंटमागचं मशीन.",
    body: "आमचे इंटिरियर प्रिंट 11-रंगी लार्ज-फॉरमॅट प्रिंटिंग प्रणालीवर केले जातात. प्रिंट सुरू करण्यापूर्वी आकार, मटेरियल आणि किंमत तुमच्याशी निश्चित केली जाते.",
    big: "11",
    bigLabel: "रंगी प्रिंटिंग प्रणाली",
    rows: [{ label: "क्षमता", value: "लार्ज-फॉरमॅट प्रिंटिंग" }],
  },
  en: {
    eyebrow: "The studio",
    heading: "The machine behind the prints.",
    body: "Our interior prints are made on an 11-colour, large-format printing system. Size, material and price are confirmed with you before printing begins.",
    big: "11",
    bigLabel: "colour printing system",
    rows: [{ label: "Capability", value: "Large-format printing" }],
  },
};

export function StudioCapabilities() {
  const { lang } = useLang();
  const tx = copy[lang];

  return (
    <section
      id="studio"
      aria-labelledby="studio-heading"
      className="scroll-mt-20 border-t border-brand-gold/30 bg-brand-cream px-5 py-10 sm:px-8 sm:py-14 lg:py-24"
    >
      <div className="mx-auto grid max-w-7xl gap-8 sm:gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:gap-20">
        <div>
          <p className="flex items-center gap-3 text-[12px] font-black uppercase tracking-[0.2em] text-brand-navy">
            <span aria-hidden="true" className="h-px w-8 bg-brand-gold" />
            {tx.eyebrow}
          </p>
          <h2
            id="studio-heading"
            className="mt-4 max-w-md text-balance text-[2.2rem] font-black leading-[1.1] tracking-tight text-brand-navy sm:text-5xl"
          >
            {tx.heading}
          </h2>
          <p className="mt-5 max-w-lg text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
            {tx.body}
          </p>
        </div>

        <div className="border border-brand-gold/50 bg-white/70 px-5 py-6 sm:px-8 sm:py-8">
          <p className="flex items-baseline gap-4">
            <span
              aria-hidden="true"
              className="text-[4.5rem] font-black leading-none tracking-tighter text-brand-gold sm:text-[6rem]"
            >
              {tx.big}
            </span>
            <span className="text-lg font-black leading-tight text-brand-navy sm:text-2xl">
              <span className="sr-only">{tx.big}-</span>
              {tx.bigLabel}
            </span>
          </p>

          <dl className="mt-6 border-t border-brand-gold/40">
            {tx.rows.map((row) => (
              <div
                key={row.label}
                className="grid gap-1 border-b border-brand-gold/40 py-4 sm:grid-cols-[9rem_1fr] sm:gap-6"
              >
                <dt className="text-[12px] font-black uppercase tracking-[0.16em] text-slate-500">
                  {row.label}
                </dt>
                <dd className="text-base font-bold leading-6 text-brand-navy sm:text-lg">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
