"use client";

/**
 * Reusable disclaimer shown near every payment / WhatsApp action.
 *
 * Variants:
 *   - "compact": single-line banner used above the WhatsApp button.
 *   - "full":    expanded version used on /disclaimer and legal pages.
 */

import { AlertTriangle } from "lucide-react";

const compactText: string = "PrintShubh is not a government body. We provide private assistance based on official public sources. Final verification must be done on the relevant government portal.";

const fullText: string = "PrintShubh is not a government body. We assist based on information available on Mahabhumi, Bhulekh, Bhuvan, TP/DP and other official public sources. For final land records, ownership, area, boundary or any legal use, verification at the relevant government office or official portal is mandatory.";

export function ServiceAreaDisclaimer({
  variant = "compact",
  className = "",
}: {
  variant?: "compact" | "full";
  className?: string;
}) {
  const text = variant === "full" ? fullText : compactText;

  return (
    <div
      role="note"
      className={`flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-3 text-xs leading-6 text-amber-900 ${className}`}
    >
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
      <p className="font-semibold">{text}</p>
    </div>
  );
}
