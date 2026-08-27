import type { Metadata } from "next";
import { AnnouncementMarquee } from "@/components/announcement-marquee";
import { Disclaimer } from "@/components/disclaimer";
import { QuickChips } from "@/components/quick-chips";
import { UnifiedRecordForm } from "@/components/unified-record-form";
import { SampleProcessSection } from "@/components/sample-process-section";
import { MapPromo } from "@/components/map-promo";
import { ToolsSection } from "@/components/tools-section";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppSupportButton } from "@/components/whatsapp-support-button";
import { ShopHero } from "@/components/shop/shop-hero";
import { ServiceStrip } from "@/components/shop/service-strip";
import { ServicePillars } from "@/components/shop/service-pillars";
import { WhatsAppPrint } from "@/components/shop/whatsapp-print";
import { ShopGallery } from "@/components/shop/shop-gallery";
import { ExperienceBand } from "@/components/shop/experience-band";
import { LandDocuments } from "@/components/shop/land-documents";
import { GoogleReviews } from "@/components/shop/google-reviews";
import { VisitShop } from "@/components/shop/visit-shop";

/* ── Homepage metadata ──────────────────────────────────────────────────
 *
 * The title now leads with the shop itself — Jumbo Xerox, printing, photo —
 * and keeps the land-document terms that already rank. Both halves of the
 * business are in one title because both halves are real, and a visitor
 * searching either should recognise this result as the right shop.
 *
 * `alternates.canonical: "/"` resolves against metadataBase to
 * https://www.printshubh.shop/ — the bare root stays the single indexable
 * address for this content, exactly as before. */
export const metadata: Metadata = {
  title: "PRINTSHUBH JUMBO XEROX | झेरॉक्स, प्रिंटिंग, फोटो व जमीन कागदपत्रे",
  description:
    "जंबो झेरॉक्स, रंगीत प्रिंटिंग, पासपोर्ट फोटो, लॅमिनेशन, स्कॅनिंग आणि 7/12, 8A, गाव नकाशा, DP Map यांसारखी जमीन कागदपत्र सेवा — एकाच ठिकाणी. WhatsApp वर PDF पाठवा.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "mr_IN",
    url: "https://www.printshubh.shop/",
    siteName: "PrintShubh",
    title: "PRINTSHUBH JUMBO XEROX | झेरॉक्स, प्रिंटिंग, फोटो व जमीन कागदपत्रे",
    description:
      "झेरॉक्स, प्रिंटिंग, फोटो आणि डिजिटल सेवा — तसेच 7/12, 8A, गाव नकाशा व DP Map साठी WhatsApp सहाय्य.",
  },
  twitter: {
    card: "summary_large_image",
    title: "PRINTSHUBH JUMBO XEROX | झेरॉक्स, प्रिंटिंग, फोटो",
    description:
      "झेरॉक्स, प्रिंटिंग, फोटो व जमीन कागदपत्र सेवा — WhatsApp वर PDF पाठवा.",
  },
};

/* ── Scroll order ───────────────────────────────────────────────────────
 *
 *   hero → services → whatsapp print → shop & work → 30+ years →
 *   land documents → enquiry form → maps → reviews → location → tools
 *
 * The shape of that sequence is the argument the page makes: this is a real
 * shop (hero, services), here is the easiest way to use it (WhatsApp print),
 * here is the proof (photos, experience), and here is the specialist work
 * that brought most of the search traffic in the first place (land
 * documents, enquiry form, maps).
 *
 * ShopGallery, GoogleReviews and VisitShop each render NOTHING until the
 * business data behind them is filled in (src/lib/shop-profile.ts), so the
 * page never shows an empty shell or an unverified claim. */
export default function Home() {
  return (
    <>
      <SiteHeader />
      {/* Scrolling updates / announcement bar — below header, above hero */}
      <AnnouncementMarquee />
      <main className="min-h-screen overflow-x-hidden bg-white text-slate-900">
        {/* No <LandingAnimations /> here on purpose.
            That component drives GSAP + ScrollTrigger over [data-reveal]
            nodes, and the redesigned homepage has none left — every section
            now reveals through Framer Motion (src/components/shop/motion.tsx).
            Mounting it cost ~43 KB gzip of JS to animate nothing.
            It is still used by /nakasha-shodh, where map-reference-section
            does render [data-reveal] nodes — do not delete the component. */}

        <ShopHero />
        <ServiceStrip />

        {/* The four things the shop does, given equal weight */}
        <ServicePillars />

        {/* Send a file, collect the print — the headline conversion */}
        <WhatsAppPrint />

        {/* Proof: the real counter (hidden until photos exist) */}
        <ShopGallery />

        {/* Proof: 30+ years, plus what that experience covers */}
        <ExperienceBand />

        {/* The land-document services, linking the existing indexed pages */}
        <LandDocuments />

        {/* Unified record picker — type → district/taluka/village → WhatsApp */}
        <UnifiedRecordForm />

        {/* Trust proof — sample previews, 3-step process, assurances */}
        <SampleProcessSection />

        {/* Mobile-only quick shortcuts to the most-requested services */}
        <QuickChips />

        {/* Map-services promo — DP / TPS / Regional Plan, from ₹200 */}
        <MapPromo />

        {/* Google reviews (hidden until real reviews are configured) */}
        <GoogleReviews />

        {/* Address, hours and map (hidden until the address is confirmed) */}
        <VisitShop />

        {/* Free calculators — customer-facing tools, also linked from the nav */}
        <ToolsSection />

        <Disclaimer />
      </main>
      <WhatsAppSupportButton />
      <SiteFooter />
    </>
  );
}
