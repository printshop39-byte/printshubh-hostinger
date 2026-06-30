import type { Metadata } from "next";
import { AnnouncementMarquee } from "@/components/announcement-marquee";
import { Disclaimer } from "@/components/disclaimer";
import { LandingAnimations } from "@/components/landing-animations";
import { HeroContent } from "@/components/hero-content";
import { QuickChips } from "@/components/quick-chips";
import { UnifiedRecordForm } from "@/components/unified-record-form";
import { MapPromo } from "@/components/map-promo";
import { TrustBar } from "@/components/trust-bar";
import { Testimonials } from "@/components/testimonials";
import { ToolsSection } from "@/components/tools-section";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppSupportButton } from "@/components/whatsapp-support-button";

/* Simple marketing homepage: hero → services list → free tools → pricing.
 * The MapLibre map-reference finder is intentionally NOT the hero anymore —
 * visitors found leading with the map confusing — it now lives on its own
 * /nakasha-shodh page, linked from the nav. */

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

        {/* Simple hero — headline, trust strip + WhatsApp / "choose service" CTAs */}
        <HeroContent />

        {/* Mobile-only quick shortcuts to the most-requested services */}
        <QuickChips />

        {/* Unified record picker — type → district/taluka/village → WhatsApp */}
        <UnifiedRecordForm />

        {/* Trust signals — experience, coverage, delivery, payment */}
        <TrustBar />

        {/* Map-services promo — DP / TPS / Regional Plan, from ₹200 */}
        <MapPromo />

        {/* Customer testimonials — renders only once real quotes are added */}
        <Testimonials />

        {/* Free calculators — customer-facing tools, also linked from the nav */}
        <ToolsSection />

        <Disclaimer />
      </main>
      <WhatsAppSupportButton />
      <SiteFooter />
    </>
  );
}
