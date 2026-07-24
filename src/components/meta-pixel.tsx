"use client";

/**
 * Meta (Facebook) Pixel — for Meta/Instagram ad conversion tracking.
 *
 * OFF by default: renders nothing unless NEXT_PUBLIC_META_PIXEL_ID is set, so
 * no tracking script loads until you explicitly opt in. When you do enable it,
 * UPDATE THE PRIVACY POLICY (/privacy) to disclose Meta Pixel tracking — it
 * sets cookies and sends events to Meta (DPDP / consent relevance in India).
 *
 * Fires:
 *   - PageView on load (here)
 *   - "Contact" when a primary WhatsApp CTA is clicked — call
 *     trackWhatsAppLead() from those click handlers.
 */

import Script from "next/script";

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export function MetaPixel() {
  if (!PIXEL_ID) return null;

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${PIXEL_ID}');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        {/*
          Meta Pixel's official no-JavaScript fallback: a raw 1x1 tracking
          beacon that must load without JS and hit facebook.com/tr directly.
          next/image is deliberately NOT used here — it needs client JS to
          render (useless inside <noscript>) and its optimizer would rewrite
          this exact tracking URL, breaking the no-JS PageView. The raw <img>
          is required, so suppress no-img-element for this one element only.
        */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          alt=""
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}

/** Fire a "Contact" conversion when a user opens a WhatsApp CTA. No-op if the
 *  pixel isn't loaded (env unset, blocker, or not yet ready). */
export function trackWhatsAppLead(): void {
  if (typeof window === "undefined") return;
  const fbq = (window as unknown as { fbq?: (...a: unknown[]) => void }).fbq;
  fbq?.("track", "Contact");
}
