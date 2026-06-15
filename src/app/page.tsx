import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { AnnouncementMarquee } from "@/components/announcement-marquee";
import { Disclaimer } from "@/components/disclaimer";
import { LandingAnimations } from "@/components/landing-animations";
import { PremiumHero } from "@/components/premium-hero";
import { PricingSection } from "@/components/pricing-section";
import { MapReferenceSection } from "@/components/map-reference-client";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

/* ── Lazy-load below-fold heavy sections ── */
const PremiumServiceTabs = dynamic(
  () => import("@/components/premium-service-tabs").then((m) => m.PremiumServiceTabs),
  { ssr: true },
);
const DocumentChecklistGuide = dynamic(
  () => import("@/components/document-checklist-guide").then((m) => m.DocumentChecklistGuide),
  { ssr: true },
);

/* ── Homepage metadata ──────────────────────────────────────────────────
 *
 * Overrides the site-wide defaults from src/app/layout.tsx with the
 * Marathi-first copy we want Google to use for the homepage SERP entry.
 * `alternates.canonical: "/"` resolves against metadataBase to
 * https://www.printshubh.shop/ — keeping the bare-root URL as the one
 * indexable address for this content. */
export const metadata: Metadata = {
  title: "गाव नकाशा, 7/12 उतारा, DP Map | Maharashtra Land Documents Help",
  description:
    "महाराष्ट्रातील 7/12, 8A उतारा, गाव नकाशा, DP/TP Map, मिळकत पत्रिका व जमीन अहवालासाठी WhatsApp सहाय्य. अधिकृत स्रोतांवर आधारित खाजगी सेवा.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "mr_IN",
    url: "https://www.printshubh.shop/",
    siteName: "PrintShubh",
    title: "गाव नकाशा, 7/12 उतारा, DP Map | PrintShubh",
    description:
      "महाराष्ट्रातील जमीन कागदपत्रांसाठी WhatsApp सहाय्य — 7/12, 8A, गाव नकाशा, DP Map, मिळकत पत्रिका.",
  },
  twitter: {
    card: "summary_large_image",
    title: "गाव नकाशा, 7/12 उतारा, DP Map | PrintShubh",
    description:
      "महाराष्ट्रातील जमीन कागदपत्रांसाठी WhatsApp सहाय्य.",
  },
};

export default function Home() {
  return (
    <>
      <SiteHeader />
      {/* Scrolling updates / announcement bar — below header, above hero */}
      <AnnouncementMarquee />
      <main className="min-h-screen overflow-x-hidden bg-[#f7fbff] text-slate-900">
        <LandingAnimations />
        <PremiumHero />

        {/* Unified MapLibre finder — address search + District→Taluka→Village picker + boundary highlight */}
        <MapReferenceSection />

        {/* Below-fold — lazy loaded — premium auto-switching service tabs */}
        <PremiumServiceTabs />

        {/* "Prepare your details" checklist + process guide */}
        <DocumentChecklistGuide />

        {/* Transparent starting prices — server-rendered for SEO */}
        <section className="bg-[#f7fbff] px-5 py-12 sm:px-8">
          <div className="mx-auto max-w-4xl">
            <PricingSection />
          </div>
        </section>

        <Disclaimer />
      </main>
      <SiteFooter />
    </>
  );
}
