import dynamic from "next/dynamic";
import { Disclaimer } from "@/components/disclaimer";
import { LandingAnimations } from "@/components/landing-animations";
import { HeroContent } from "@/components/hero-content";
import { MapReferenceSection } from "@/components/map-reference-client";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

/* ── Lazy-load below-fold heavy sections ── */
const ServicesGrid = dynamic(
  () => import("@/components/services-grid").then((m) => m.ServicesGrid),
  { ssr: true },
);

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen overflow-x-hidden bg-[#f7fbff] text-slate-900">
        <LandingAnimations />
        <HeroContent />

        {/* Unified MapLibre finder — address search + District→Taluka→Village picker + boundary highlight */}
        <MapReferenceSection />

        {/* Below-fold — lazy loaded */}
        <ServicesGrid />
        <Disclaimer />
      </main>
      <SiteFooter />
    </>
  );
}
