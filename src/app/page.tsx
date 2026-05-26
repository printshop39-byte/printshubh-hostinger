import type { Metadata } from "next";
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
