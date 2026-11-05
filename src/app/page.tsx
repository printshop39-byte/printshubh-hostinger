import type { Metadata } from "next";
import { AnnouncementMarquee } from "@/components/announcement-marquee";
import { Disclaimer } from "@/components/disclaimer";
import { MobileServiceShortcuts } from "@/components/mobile-service-shortcuts";
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
import { PrintingTechnology } from "@/components/shop/printing-technology";
import { CollectionsGrid } from "@/components/shop/collections-grid";
import { GoogleReviews } from "@/components/shop/google-reviews";
import { VisitShop } from "@/components/shop/visit-shop";

/* ── Homepage metadata ──────────────────────────────────────────────────
 *
 * Title now leads with the "Premium Print & Visual Studio" positioning
 * (owner rebrand decision), but the description DELIBERATELY still mentions
 * 7/12, 8A, गाव नकाशा, DP Map — those land-document pages are still live,
 * still in sitemap.ts, and this description is what currently ranks for
 * them. Dropping those terms before the traffic/backlink audit (see the
 * land-records audit report) risks losing that ranking before anyone has
 * decided whether to keep it. Re-visit this description once that audit's
 * redirect strategy is decided.
 *
 * `alternates.canonical: "/"` resolves against metadataBase to
 * https://www.printshubh.shop/ — the bare root stays the single indexable
 * address for this content, exactly as before. */
export const metadata: Metadata = {
  title: "PRINTSHUBH – Premium Print & Visual Studio | झेरॉक्स, प्रिंटिंग, फोटो",
  description:
    "प्रीमियम वॉलपेपर, कॅनव्हास, वॉल आर्ट, रेक्झिन, साटीन फॅब्रिक व व्हिनाइल प्रिंटिंग — तसेच जंबो झेरॉक्स, फोटो, डिजिटल सेवा आणि 7/12, 8A, गाव नकाशा, DP Map यांसारखी जमीन कागदपत्र सेवा. WhatsApp वर PDF पाठवा.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "mr_IN",
    url: "https://www.printshubh.shop/",
    siteName: "PrintShubh",
    title: "PRINTSHUBH – Premium Print & Visual Studio",
    description:
      "प्रीमियम प्रिंटिंग (वॉलपेपर, कॅनव्हास, वॉल आर्ट, व्हिनाइल) आणि झेरॉक्स, फोटो, डिजिटल सेवा — तसेच 7/12, 8A, गाव नकाशा व DP Map साठी WhatsApp सहाय्य.",
  },
  twitter: {
    card: "summary_large_image",
    title: "PRINTSHUBH – Premium Print & Visual Studio",
    description:
      "प्रीमियम प्रिंटिंग, झेरॉक्स, फोटो व जमीन कागदपत्र सेवा — WhatsApp वर PDF पाठवा.",
  },
};

/* ── Scroll order ───────────────────────────────────────────────────────
 *
 *   hero → services → mobile shortcuts → whatsapp print → shop & work →
 *   30+ years → samples → maps → printing tech → collections → reviews →
 *   location → tools
 *
 * LandDocuments and UnifiedRecordForm were removed from this homepage flow
 * as part of the shop/print-studio repositioning (owner decision). This is
 * a HOMEPAGE/NAVIGATION change only:
 *   - The 9 land-document SEO pages they linked to (satbara-utara-maharashtra,
 *     8a-utara-maharashtra, gav-nakasha-maharashtra, dp-map-maharashtra,
 *     milkat-patrika-maharashtra, e-ferfar-maharashtra,
 *     jameen-report-maharashtra, nakasha-shodh, land-unit-converter) are
 *     UNTOUCHED — still live, still in sitemap.ts, pending a separate
 *     traffic/backlink/redirect audit before any of them are touched.
 *   - /nakasha-shodh's enquiry form, /api/inquiries, the Supabase lead store,
 *     Resend notifications and /admin/land-reports(-gis) are UNTOUCHED —
 *     real customer data and the owner's only way to read it.
 *   - Both components still exist (components/shop/land-documents.tsx,
 *     components/unified-record-form.tsx) — unused by this page but not
 *     deleted, in case this decision is revisited.
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

        {/* Mobile-only priced document/map shortcuts + free-tools row */}
        <MobileServiceShortcuts />

        {/* The four things the shop does, given equal weight */}
        <ServicePillars />

        {/* Send a file, collect the print — the headline conversion */}
        <WhatsAppPrint />

        {/* Proof: the real counter (hidden until photos exist) */}
        <ShopGallery />

        {/* Proof: 30+ years, plus what that experience covers */}
        <ExperienceBand />

        {/* Trust proof — sample previews, 3-step process, assurances */}
        <SampleProcessSection />

        {/* Map-services promo — DP / TPS / Regional Plan, from ₹200 */}
        <MapPromo />

        {/* The 11-colour Epson SureColor SC-S9130 — typography-only until
            real photos/certificates exist (see shop-profile.ts) */}
        <PrintingTechnology />

        {/* The seven premium print collections — wallpaper, canvas, wall
            art, rexine, satin fabric, framed prints, vinyl */}
        <CollectionsGrid />

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
