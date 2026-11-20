"use client";

/**
 * LegacyPriceAssistant
 *
 * The floating "₹ Know the price" chat widget (public/price-assistant.js) is a
 * LAND-DOCUMENT price helper: 7/12, 8A, village map, DP map and so on. It used
 * to load on every page from the root layout, which put a land-records button
 * over the Premium Print & Visual Studio pages.
 *
 * It now loads only on the legacy land-document pages (the nine pages kept
 * live pending the traffic/backlink audit). Nothing else in the codebase calls
 * the script and no page markup depends on it, so every other page is simply
 * without the widget. The script file itself is untouched.
 *
 * The script appends its own elements to <body> and keeps them across client
 * side navigation, so leaving a land-document page for the homepage would
 * leave the button behind. The effect below hides it on every other route and
 * shows it again on the way back.
 */

import Script from "next/script";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** The legacy land-document pages (see the note in src/app/page.tsx). */
const LAND_DOCUMENT_PATHS: readonly string[] = [
  "/satbara-utara-maharashtra",
  "/8a-utara-maharashtra",
  "/gav-nakasha-maharashtra",
  "/dp-map-maharashtra",
  "/milkat-patrika-maharashtra",
  "/e-ferfar-maharashtra",
  "/jameen-report-maharashtra",
  "/nakasha-shodh",
  "/land-unit-converter",
];

function isLandDocumentPath(pathname: string | null): boolean {
  if (!pathname) return false;
  const clean = pathname.replace(/\/+$/, "") || "/";
  return LAND_DOCUMENT_PATHS.includes(clean);
}

export function LegacyPriceAssistant() {
  const pathname = usePathname();
  const active = isLandDocumentPath(pathname);

  useEffect(() => {
    // "" hands control back to the widget's own stylesheet (the panel is
    // closed by default and opens through a class); "none" hides it.
    document
      .querySelectorAll<HTMLElement>(".psb-launcher, .psb-panel")
      .forEach((el) => {
        el.style.display = active ? "" : "none";
      });
  }, [active, pathname]);

  return active ? <Script src="/price-assistant.js" strategy="afterInteractive" /> : null;
}
