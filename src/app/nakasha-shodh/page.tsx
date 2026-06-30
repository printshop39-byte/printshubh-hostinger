import type { Metadata } from "next";
import { AnnouncementMarquee } from "@/components/announcement-marquee";
import { LandingAnimations } from "@/components/landing-animations";
import { MapReferenceSection } from "@/components/map-reference-client";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppSupportButton } from "@/components/whatsapp-support-button";

/* ── Dedicated map / finder page ────────────────────────────────────────────
 *
 * The MapLibre map-reference finder (District→Taluka→Village picker + boundary
 * highlight + WhatsApp inquiry form) used to be the homepage hero. It was moved
 * here on its own page because visitors found leading with the map confusing.
 * The homepage is now a simple marketing layout; this page is linked from the
 * nav ("नकाशा शोध") for users who explicitly want the map finder. The section
 * keeps id="map-reference", so the inquiry-form bus continues to work here. */
export const metadata: Metadata = {
  title: "नकाशा शोध — जिल्हा, तालुका, गाव नकाशा संदर्भ",
  description:
    "महाराष्ट्रातील जिल्हा, तालुका व गाव निवडून जमीन / सर्वे नकाशा संदर्भ शोधा. गाव सीमा पाहा आणि कागदपत्र सहाय्य WhatsApp वर मिळवा.",
  alternates: {
    canonical: "/nakasha-shodh",
  },
  openGraph: {
    type: "website",
    locale: "mr_IN",
    url: "https://www.printshubh.shop/nakasha-shodh",
    siteName: "PrintShubh",
    title: "नकाशा शोध — गाव नकाशा संदर्भ | PrintShubh",
    description:
      "जिल्हा → तालुका → गाव निवडा आणि जमीन नकाशा संदर्भ व कागदपत्र सहाय्य WhatsApp वर मिळवा.",
  },
};

export default function NakashaShodhPage() {
  return (
    <>
      <SiteHeader />
      <AnnouncementMarquee />
      <main className="min-h-screen overflow-x-hidden bg-[#f7fbff] text-slate-900">
        <LandingAnimations />
        <MapReferenceSection />
      </main>
      <WhatsAppSupportButton />
      <SiteFooter />
    </>
  );
}
