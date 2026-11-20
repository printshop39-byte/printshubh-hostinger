"use client";

/**
 * CadPrintsSection — the homepage's CAD / architectural printing section.
 *
 * The second pillar of the studio, next to the decorative collections: large
 * format prints of architects' and engineers' plans. It is set apart from the
 * collections on purpose: a dark, drafting-sheet treatment (a fine grid, a
 * dimension line, crop marks) against the cream of the page above it.
 *
 * WHAT THE PAGE CLAIMS, AND WHERE IT COMES FROM
 *   - AutoCAD architectural and structural plans, printed large: stated by the
 *     owner. The printing-xerox page already describes reproducing "maps,
 *     plans, construction drawings" at large format.
 *   - The price is confirmed before work starts: the same statement the hero
 *     and the pricing page already make.
 *   Nothing else. No sizes, no paper, no file formats (DWG / PDF), no
 *   turnaround, no prices, no resolution: none of those has been confirmed.
 *   The enquiry asks the customer for the drawing type, size and copies and
 *   the studio answers what it can do.
 *
 * THE DRAWING MOTIFS ARE ONLY DECORATION
 *   A grid, one blank dimension line and four crop marks, all aria-hidden CSS.
 *   There is no drawing, no plan and no title block: a made-up "technical
 *   sheet" would be a fake sample.
 *
 * `/cad-prints` does not exist yet and is not linked: the call to action is a
 * WhatsApp enquiry. The `#cad` anchor is for linking to this section later.
 *
 * Nothing waits for an animation: no Reveal, no opacity-zero first state.
 */

import { MessageCircle } from "lucide-react";
import { trackWhatsAppLead } from "@/components/meta-pixel";
import { trackFunnelEvent } from "@/lib/analytics";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

const copy: {
  eyebrow: string;
  heading: string;
  body: string;
  cta: string;
  note: string;
  listLabel: string;
  items: string[];
  enquiry: string;
} = {
  eyebrow: "CAD Prints",
  heading: "Architectural & structural plans, printed large.",
  body: "AutoCAD drawings for architects, engineers and builders. Send your file on WhatsApp with the size and number of copies, and we confirm what works.",
  cta: "Enquire about CAD prints",
  note: "The price is confirmed before work starts.",
  listLabel: "What we print",
  items: ["Architectural plans", "Structural plans", "Engineering drawings", "CAD plotting"],
  enquiry:
    "Hello PrintShubh, I need CAD plan prints. Drawing type / size / copies: ",
};

/* A fine 24px grid with a stronger 120px grid over it, in cream at low
 * opacity. Pure CSS, no asset. */
const GRID =
  "[background-image:linear-gradient(rgba(246,241,234,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(246,241,234,.05)_1px,transparent_1px),linear-gradient(rgba(246,241,234,.09)_1px,transparent_1px),linear-gradient(90deg,rgba(246,241,234,.09)_1px,transparent_1px)] [background-size:24px_24px,24px_24px,120px_120px,120px_120px]";

const MARK = "absolute size-3 border-brand-gold";

export function CadPrintsSection() {
  const tx = copy;

  const href = buildWhatsAppUrl({
    message: tx.enquiry,
    campaign: "cad-section",
    content: "cad-prints",
  });

  return (
    <section
      id="cad"
      aria-labelledby="cad-heading"
      className="relative isolate scroll-mt-20 overflow-hidden bg-brand-navy-dark text-white"
    >
      <div aria-hidden="true" className={`absolute inset-0 -z-10 ${GRID}`} />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:gap-20 lg:py-24">
        <div>
          <p className="flex items-center gap-3 font-mono text-[12px] font-bold uppercase tracking-[0.2em] text-brand-gold-light">
            <span aria-hidden="true" className="relative block h-3 w-12 shrink-0">
              <span className="absolute inset-x-0 top-1/2 h-px bg-brand-gold" />
              <span className="absolute left-0 top-0 h-3 w-px bg-brand-gold" />
              <span className="absolute right-0 top-0 h-3 w-px bg-brand-gold" />
            </span>
            {tx.eyebrow}
          </p>

          <h2
            id="cad-heading"
            className="mt-5 max-w-2xl text-balance text-[2rem] font-black leading-[1.1] tracking-tight sm:text-5xl"
          >
            {tx.heading}
          </h2>

          <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
            {tx.body}
          </p>

          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              trackWhatsAppLead();
              trackFunnelEvent("service_whatsapp_click", {
                lang: "en",
                surface: "cad-section",
                service_key: "cad",
              });
            }}
            className="mt-8 inline-flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-xl bg-green-500 px-6 text-base font-black text-slate-950 transition hover:bg-green-400 sm:w-auto motion-reduce:transition-none"
          >
            <MessageCircle className="size-5" aria-hidden="true" />
            {tx.cta}
          </a>
          <p className="mt-3 text-sm font-semibold text-slate-400">{tx.note}</p>
        </div>

        <div className="relative">
          <span aria-hidden="true" className={`${MARK} -left-2 -top-2 border-l border-t`} />
          <span aria-hidden="true" className={`${MARK} -right-2 -top-2 border-r border-t`} />
          <span aria-hidden="true" className={`${MARK} -bottom-2 -left-2 border-b border-l`} />
          <span aria-hidden="true" className={`${MARK} -bottom-2 -right-2 border-b border-r`} />

          <div className="border border-white/15 bg-brand-navy-dark/60 px-5 py-6 sm:px-8 sm:py-8">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
              {tx.listLabel}
            </p>
            <ul className="mt-4">
              {tx.items.map((item, i) => (
                <li
                  key={item}
                  className="flex items-baseline gap-4 border-t border-white/15 py-4 first:border-t-0 sm:py-5"
                >
                  <span
                    aria-hidden="true"
                    className="font-mono text-sm font-bold tabular-nums text-brand-gold"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-xl font-black leading-tight tracking-tight sm:text-2xl">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
