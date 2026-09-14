"use client";

/**
 * Google Analytics 4 — the first real destination for the funnel events
 * `src/lib/analytics.ts` already dispatches on `FUNNEL_CHANNEL`.
 *
 * OFF by default: renders nothing and adds no listener unless
 * NEXT_PUBLIC_GA_MEASUREMENT_ID is set, mirroring `src/components/meta-pixel.tsx`.
 * gtag.js works on any host (unlike @vercel/analytics, which 404s off Vercel's
 * edge — see the history note in analytics.ts), so this is safe on Hostinger.
 *
 * Every funnel event is forwarded to GA4 as-is: `properties` is already
 * sanitised to a fixed, low-risk allowlist by trackFunnelEvent, so no new PII
 * surface is created here.
 */

import { useEffect } from "react";
import Script from "next/script";
import { FUNNEL_CHANNEL, type SafeAnalyticsProperties } from "@/lib/analytics";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

type FunnelEventDetail = {
  event: string;
  properties: SafeAnalyticsProperties;
};

export function GA4Analytics() {
  useEffect(() => {
    if (!GA_ID) return;

    const onFunnelEvent = (e: Event) => {
      const detail = (e as CustomEvent<FunnelEventDetail>).detail;
      if (!detail?.event) return;
      window.gtag?.("event", detail.event, detail.properties);
    };

    window.addEventListener(FUNNEL_CHANNEL, onFunnelEvent);
    return () => window.removeEventListener(FUNNEL_CHANNEL, onFunnelEvent);
  }, []);

  if (!GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}
