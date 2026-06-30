import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AnnouncementMarquee } from "@/components/announcement-marquee";
import { WhatsAppSupportButton } from "@/components/whatsapp-support-button";
import { PricingPageBody } from "./pricing-page-body";

/* Dedicated pricing page — the transparent price table moved off the homepage
 * to its own indexable URL. Targets searches like "7/12 किंमत kolhapur" and
 * keeps the "किंमत आधी कळेल — छुपी फी नाही" trust copy. Linked from the footer. */
export const metadata: Metadata = {
  title: "किंमत — 7/12, गाव नकाशा, मिळकत पत्रिका दर | Pricing",
  description:
    "PrintShubh सेवा दर — 7/12 ₹30 पासून, गाव नकाशा ₹300 पासून, DP/TP ₹200 पासून. किंमत आधी कळेल, छुपी फी नाही. महाराष्ट्र जमीन कागदपत्र WhatsApp सहाय्य.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    type: "website",
    locale: "mr_IN",
    url: "https://www.printshubh.shop/pricing",
    siteName: "PrintShubh",
    title: "PrintShubh किंमत — जमीन कागदपत्र सेवा दर",
    description:
      "7/12, 8A, गाव नकाशा, DP/TP, मिळकत पत्रिका दर. किंमत आधी कळेल, छुपी फी नाही.",
  },
};

export default function PricingPage() {
  return (
    <>
      <SiteHeader />
      <AnnouncementMarquee />
      <main className="min-h-screen bg-[#f7fbff] px-5 py-12 text-slate-900 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <PricingPageBody />
        </div>
      </main>
      <WhatsAppSupportButton />
      <SiteFooter />
    </>
  );
}
