import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import "maplibre-gl/dist/maplibre-gl.css";
import { LanguageProvider } from "@/components/language-context";
import { MetaPixel } from "@/components/meta-pixel";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { HydrationFlag } from "@/components/hydration-flag";
import { LocalBusinessJsonLd } from "@/components/shop/local-business-jsonld";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const notoDevanagari = Noto_Sans_Devanagari({
  variable: "--font-noto-devanagari",
  subsets: ["devanagari"],
  weight: ["400", "600", "700", "900"],
  display: "swap",
});

const SITE_URL = "https://www.printshubh.shop";

/* ── Site-wide metadata ────────────────────────────────────────────────
 *
 * metadataBase lets every Open Graph / Twitter image URL on child pages
 * stay relative ("/og.png") and still resolve to the canonical
 * https://www.printshubh.shop/og.png.
 *
 * The homepage overrides title / description in src/app/page.tsx — this
 * default copy is what every other page inherits unless it sets its own. */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "PrintShubh.shop | महाराष्ट्रासाठी जमीन सेवा",
    template: "%s | PrintShubh",
  },
  description:
    "७/१२ उतारा, ८अ, गाव नकाशा, DP/TP Map, Property Card, Mutation/Ferfar आणि Land Report साठी WhatsApp सहाय्य.",
  applicationName: "PrintShubh",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "mr_IN",
    url: SITE_URL + "/",
    siteName: "PrintShubh",
    title: "PrintShubh.shop | महाराष्ट्रासाठी जमीन सेवा",
    description:
      "महाराष्ट्रातील जमीन कागदपत्रांसाठी WhatsApp सहाय्य — 7/12, 8A, गाव नकाशा, DP Map, मिळकत पत्रिका.",
  },
  twitter: {
    card: "summary_large_image",
    title: "PrintShubh.shop | महाराष्ट्रासाठी जमीन सेवा",
    description:
      "महाराष्ट्रातील जमीन कागदपत्रांसाठी WhatsApp सहाय्य.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/favicon.png",
    apple: "/apple-icon.png",
  },
};

/* ── JSON-LD: one business entity, three linked nodes ────────────────
 *
 * The business is described ONCE, by the PrintShop node in
 * src/components/shop/local-business-jsonld.tsx, which is rendered from
 * this layout so every route carries it.
 *
 * Previously this file also emitted a ProfessionalService node for the same
 * business. Two un-linked local-business nodes at one URL invite Google to
 * read them as two different companies and split the entity signals — the
 * opposite of what local SEO needs. That node is gone; PrintShop supersedes
 * it and carries the same telephone / email / areaServed.
 *
 * What is left is a small graph joined by stable @ids:
 *
 *   #organization  — the brand      (this file)
 *   #printshop     — the business   (local-business-jsonld.tsx),
 *                    parentOrganization → #organization
 *   #website       — the site       (this file), publisher → #organization
 *
 * The @id values are permanent. Service pages reference #printshop as their
 * provider instead of restating the business inline, so the description
 * lives in exactly one place. */

const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": SITE_URL + "/#website",
  name: "PrintShubh",
  url: SITE_URL + "/",
  inLanguage: "mr-IN",
  publisher: { "@id": SITE_URL + "/#organization" },
};

/* ── JSON-LD: Organization ───────────────────────────────────────────
 *
 * The brand entity. The PrintShop node carries the local-business signals
 * and points back here via parentOrganization; Organization adds the logo +
 * contactPoint Google uses for the brand knowledge panel.
 *
 * No address is asserted here. Once SHOP_ADDRESS is filled in
 * (src/lib/shop-profile.ts) the address appears on the PrintShop node only,
 * so there is one place to keep in sync with the Google Business Profile. */
const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": SITE_URL + "/#organization",
  name: "PrintShubh",
  alternateName: "PRINTSHUBH JUMBO XEROX",
  url: SITE_URL + "/",
  logo: SITE_URL + "/favicon.png",
  email: "support@printshubh.shop",
  areaServed: { "@type": "State", name: "Maharashtra" },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+91 86258 01907",
    contactType: "customer support",
    availableLanguage: ["Marathi", "English"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="mr-IN"
      className={`${geistSans.variable} ${geistMono.variable} ${notoDevanagari.variable} h-full`}
    >
      <head>
        {/* Structured data — plain <script> tags, emitted server-side with
            no JS-evaluation cost, one node per tag so each is easy to read
            in the Rich Results Test. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteLd),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationLd),
          }}
        />
        {/* The single business entity, on every route. */}
        <LocalBusinessJsonLd />
        {/* ── Failure-safe for JS-driven scroll reveals ──────────────────
         *
         * Framer Motion serialises its `initial` state into the server HTML,
         * so every <Reveal> / <Stagger> section ships as
         * style="opacity:0;transform:translateY(…)" and only becomes visible
         * once React hydrates and the IntersectionObserver fires.
         *
         * If the bundle never arrives — a failed chunk, a blocked CDN, an
         * old browser — that content stays invisible forever, while the
         * header, hero and footer render fine. The page would look broken
         * rather than degraded.
         *
         * <noscript> covers the scripting-disabled case declaratively. It
         * does NOT cover "JS enabled but the bundle failed", so the small
         * inline script below is the real backstop: it schedules a check and,
         * if hydration has not cleared the inline opacity within a few
         * seconds, reveals everything. On a healthy page load Framer has
         * long since taken over and the check is a no-op. */}
        <noscript>
          <style
            dangerouslySetInnerHTML={{
              __html:
                '[style*="opacity:0"]{opacity:1!important;transform:none!important}',
            }}
          />
        </noscript>
        {/* Two distinct failure modes, two rules:
         *
         *   no `data-hydrated`  → React never mounted. Reveal everything.
         *   `data-hydrated` set → React mounted, so Framer owns these
         *                         elements. Reveal only what is INSIDE the
         *                         viewport and still computed-invisible: on a
         *                         healthy page Framer clears in-view elements
         *                         immediately, so anything still hidden there
         *                         means the IntersectionObserver is not
         *                         firing. Below-fold elements are left alone
         *                         so the reveal animation survives.
         *
         * The in-view sweep repeats on scroll (throttled) because a broken
         * observer stays broken as the visitor moves down the page.
         *
         * Opacity is read from getComputedStyle, not from the attribute
         * substring: "opacity:0.5" contains "opacity:0", and matching on text
         * alone would snap mid-animation elements to their end state. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var S='[style*="opacity:0"]',t=0;function inView(el){var r=el.getBoundingClientRect();return r.bottom>0&&r.top<(window.innerHeight||0)}function sweep(all){var n=document.querySelectorAll(S);for(var i=0;i<n.length;i++){var el=n[i];if(getComputedStyle(el).opacity!=="0")continue;if(all||inView(el)){el.style.opacity="1";el.style.transform="none"}}}window.addEventListener("load",function(){setTimeout(function(){if(!document.documentElement.hasAttribute("data-hydrated")){sweep(true);return}sweep(false);window.addEventListener("scroll",function(){if(t)return;t=setTimeout(function(){t=0;sweep(false)},400)},{passive:true})},4000)})})();`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col antialiased pb-16 md:pb-0">
        <HydrationFlag />
        <MetaPixel />
        <LanguageProvider>
          {children}
          {/* App-style sticky bottom nav — mobile only */}
          <MobileBottomNav />
        </LanguageProvider>
        <Script src="/price-assistant.js" strategy="afterInteractive" />
        {/* No web-analytics provider is mounted. This site is hosted on
            Hostinger, and @vercel/analytics only works behind Vercel's edge —
            elsewhere it 404s on /_vercel/insights/script.js and logs a console
            error on every page view.

            Funnel events still flow: src/lib/analytics.ts dispatches them on
            the `printshubh:funnel` DOM channel, where a self-hosted analytics
            snippet or tag manager can subscribe. See FUNNEL_CHANNEL there. */}
      </body>
    </html>
  );
}
