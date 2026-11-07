import type { Metadata } from "next";
import { AnnouncementMarquee } from "@/components/announcement-marquee";
import { Disclaimer } from "@/components/disclaimer";
import { MobileServiceShortcuts } from "@/components/mobile-service-shortcuts";
import { SampleProcessSection } from "@/components/sample-process-section";
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
  title: "PRINTSHUBH – Premium Print & Visual Studio | Wallpaper, Canvas, Wall Art",
  description:
    "Premium wallpaper, canvas, wall art, rexine, satin fabric and vinyl printing — plus Jumbo Xerox, photo and digital services, and 7/12, 8A, village map, DP Map land-document assistance. Send a PDF on WhatsApp.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://www.printshubh.shop/",
    siteName: "PrintShubh",
    title: "PRINTSHUBH – Premium Print & Visual Studio",
    description:
      "Premium printing (wallpaper, canvas, wall art, vinyl) plus Xerox, photo and digital services — and WhatsApp assistance for 7/12, 8A, village map and DP Map.",
  },
  twitter: {
    card: "summary_large_image",
    title: "PRINTSHUBH – Premium Print & Visual Studio",
    description:
      "Premium printing, Xerox, photo and land-document services — send a PDF on WhatsApp.",
  },
};

/* ── Scroll order ───────────────────────────────────────────────────────
 *
 *   hero → services → mobile shortcuts → whatsapp print → shop & work →
 *   30+ years → samples → printing tech → collections → reviews →
 *   location → tools
 *
 * LandDocuments, UnifiedRecordForm and (later) MapPromo were removed from
 * this homepage flow as part of the shop/print-studio -> Premium Print &
 * Visual Studio repositioning (owner decision). This is a
 * HOMEPAGE/NAVIGATION change only:
 *   - The 9 land-document SEO pages they linked to (satbara-utara-maharashtra,
 *     8a-utara-maharashtra, gav-nakasha-maharashtra, dp-map-maharashtra,
 *     milkat-patrika-maharashtra, e-ferfar-maharashtra,
 *     jameen-report-maharashtra, nakasha-shodh, land-unit-converter) are
 *     UNTOUCHED — still live, still in sitemap.ts, pending a separate
 *     traffic/backlink/redirect audit before any of them are touched.
 *   - /nakasha-shodh's enquiry form, /api/inquiries, the Supabase lead store,
 *     Resend notifications and /admin/land-reports(-gis) are UNTOUCHED —
 *     real customer data and the owner's only way to read it.
 *   - All three components still exist (components/shop/land-documents.tsx,
 *     components/unified-record-form.tsx, components/map-promo.tsx) —
 *     unused by this page but not deleted, in case this decision is
 *     revisited.
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
      <main className="min-h-screen overflow-x-hidden bg-brand-cream text-slate-900">
        {/* No <LandingAnimations /> here on purpose.
            That component drives GSAP + ScrollTrigger over [data-reveal]
            nodes, and the redesigned homepage has none left — every section
            now reveals through Framer Motion (src/components/shop/motion.tsx).
            Mounting it cost ~43 KB gzip of JS to animate nothing.
            It is still used by /nakasha-shodh, where map-reference-section
            does render [data-reveal] nodes — do not delete the component. */}

        <ShopHero />
        <ServiceStrip />

        {/* The seven premium print collections — wallpaper, canvas, wall
            art, rexine, satin fabric, framed prints, vinyl. Stage-4
            rebrand: moved up so Collections is the first thing a visitor
            sees after the hero, ahead of the counter-service pillars. */}
        <CollectionsGrid />

        {/* Mobile-only priced document/map shortcuts + free-tools row */}
        <MobileServiceShortcuts />

        {/* Send a file, collect the print — the headline conversion */}
        <WhatsAppPrint />

        {/* Proof: the real counter (hidden until photos exist) */}
        <ShopGallery />

        {/* Proof: 30+ years, plus what that experience covers */}
        <ExperienceBand />

        {/* Trust proof — sample previews, 3-step process, assurances */}
        <SampleProcessSection />

        {/* The 11-colour Epson SureColor SC-S9130 — typography-only until
            real photos/certificates exist (see shop-profile.ts) */}
        <PrintingTechnology />

        {/* The other things the shop does — printing/xerox, photo, digital.
            Stage-4 rebrand: moved below Collections (was directly under the
            hero) so Premium Collections reads as the primary identity;
            still fully present and linked, not removed. */}
        <ServicePillars />

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
