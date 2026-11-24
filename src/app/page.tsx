import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppSupportButton } from "@/components/whatsapp-support-button";
import { ShopHero } from "@/components/shop/shop-hero";
import { HeroCollage } from "@/components/shop/hero-collage";
import { FeaturedDesignsStrip } from "@/components/shop/featured-designs-strip";
import { FEATURED_STRIP_IDS, HERO_COLLAGE_IDS, getShowcase } from "@/lib/wallpapers/showcase";
import { ShopGallery } from "@/components/shop/shop-gallery";
import { CollectionsGrid } from "@/components/shop/collections-grid";
import { CadPrintsSection } from "@/components/shop/cad-prints-section";
import { StudioCapabilities } from "@/components/shop/studio-capabilities";
import { HowItWorks } from "@/components/shop/how-it-works";
import { HomeEnquiry } from "@/components/shop/home-enquiry";
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
    "Premium wallpaper, canvas art, wall graphics & murals, vinyl, PU leatherette and large-format printing, with custom design. Enquire on WhatsApp.",
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
      "Premium wallpaper, canvas art and wall paintings, wall graphics & murals, vinyl and PU leatherette printing, large-format printing and custom design — enquire on WhatsApp.",
  },
  twitter: {
    card: "summary_large_image",
    title: "PRINTSHUBH – Premium Print & Visual Studio",
    description:
      "Premium wallpaper, canvas art, wall graphics, vinyl and large-format printing, plus custom design — enquire on WhatsApp.",
  },
};

/* ── Scroll order ───────────────────────────────────────────────────────
 *
 *   hero (with a collage of real wallpaper design previews) → featured designs →
 *   collections → CAD prints → studio → how it works → enquiry →
 *   (shop photos, once they exist) → Google reviews → visit the shop → footer
 *
 * S1 (premium homepage) is built in checkpoints: C1 the composition and hero;
 * C2 the editorial collections index; C3 the CAD prints section; C4 the
 * studio, process and enquiry sections.
 *
 * What the homepage no longer shows, and where it still lives. This is a
 * homepage-visibility change ONLY: every page, route, tool, API, data table
 * and admin screen below is untouched.
 *   - hero service cards (printing / photo / digital) .. the header menu and
 *     the footer still link to /printing-xerox, /photo-services and
 *     /digital-services
 *   - ServiceStrip, ServicePillars ..................... same three pages
 *   - MobileServiceShortcuts, ToolsSection, and the "also at the counter"
 *     row (services + free tools links) ................ no longer promoted
 *     anywhere on the homepage; /home-loan-emi, /stamp-duty, /ready-reckoner
 *     and /land-unit-converter still exist but are not linked
 *   - ExperienceBand, SampleProcessSection ............. land-document pages
 *     (/satbara-utara-maharashtra and the rest, still live and in the sitemap)
 *   - WhatsAppPrint, PrintingTechnology ................ replaced by
 *     HowItWorks / HomeEnquiry and StudioCapabilities (C4)
 *   - Disclaimer ("not a government website") ......... stays on the
 *     land-document pages, the legal pages and in the footer
 * The component files themselves are kept, unused, for now.
 *
 * ShopGallery, GoogleReviews and VisitShop each render NOTHING until the
 * business data behind them is filled in (src/lib/shop-profile.ts), so the
 * page never shows an empty shell or an unverified claim. */
export default async function Home() {
  /* Real, PUBLISHED wallpaper design previews only (see lib/wallpapers/showcase.ts):
   * a draft, an unpublished or a missing design simply drops out. */
  const [heroDesigns, stripDesigns] = await Promise.all([
    getShowcase(HERO_COLLAGE_IDS),
    getShowcase(FEATURED_STRIP_IDS),
  ]);

  return (
    <>
      <SiteHeader />
      {/* Scrolling updates / announcement bar — below header, above hero */}
      <main className="min-h-screen overflow-x-hidden bg-brand-cream text-slate-900">
        <ShopHero collage={heroDesigns.length >= 2 ? <HeroCollage designs={heroDesigns} /> : undefined} />

        {/* Four featured wallpaper designs, each linking to its own page. */}
        <FeaturedDesignsStrip designs={stripDesigns} />

        {/* The seven premium print collections. */}
        <CollectionsGrid />

        {/* CAD / architectural plan printing: the second pillar of the studio.
            The call to action is WhatsApp; there is no /cad-prints page yet. */}
        <CadPrintsSection />

        {/* The 11-colour, large-format printing capability (no printer model is named here). */}
        <StudioCapabilities />

        {/* Five steps, from choosing to collecting at the studio. */}
        <HowItWorks />

        {/* Closing call to action: WhatsApp (files go there) and a phone call.
            No upload form. */}
        <HomeEnquiry />

        {/* Proof: the real counter (hidden until photos exist) */}
        <ShopGallery />

        {/* Google reviews (hidden until real reviews are configured) */}
        <GoogleReviews />

        {/* Address, hours and map (hidden until the address is confirmed) */}
        <VisitShop />
      </main>
      {/* Hidden while a section with its own WhatsApp call to action or
          controls it would cover is on screen. */}
      <WhatsAppSupportButton hideNear={["#collections", "#cad", "#enquiry", "#visit", "footer"]} />
      <SiteFooter />
    </>
  );
}
