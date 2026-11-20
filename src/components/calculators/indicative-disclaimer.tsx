"use client";

import { Info } from "lucide-react";

/**
 * Shared "this is an estimate, not official" notice for every calculator tool.
 * Mirrors the careful, non-government framing the service pages already use
 * (see ServiceAreaDisclaimer / disclaimer page) — keeps PrintShubh clear of
 * liability for figures that ultimately depend on IGR / bank / municipal rules.
 */
export function IndicativeDisclaimer({ extra }: { extra?: string }) {
  const base =
    "These are indicative estimates for guidance only. Confirm the final figure with the relevant bank, IGR registration office or competent authority. PrintShubh is not a government website.";
  const extraText = extra;

  return (
    <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-[13.5px] leading-6 text-amber-900">
      <Info className="mt-0.5 size-4 shrink-0 text-amber-600" />
      <p>
        {base}
        {extraText ? ` ${extraText}` : ""}
      </p>
    </div>
  );
}
