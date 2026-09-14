"use client";

/**
 * Microsoft Clarity — free heatmaps/session recordings, for spotting where
 * mobile visitors actually get stuck (>90% of this site's traffic is mobile).
 *
 * OFF by default: renders nothing unless NEXT_PUBLIC_CLARITY_ID is set,
 * mirroring `src/components/meta-pixel.tsx` and `src/components/ga4-analytics.tsx`.
 */

import Script from "next/script";

const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;

export function ClarityAnalytics() {
  if (!CLARITY_ID) return null;

  return (
    <Script id="clarity-init" strategy="afterInteractive">
      {`
        (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${CLARITY_ID}");
      `}
    </Script>
  );
}
