import type { Metadata } from "next";
import { ServiceJsonLd } from "@/components/service-jsonld";
import { DpMapContent, dpMapFaqMr } from "./dp-map-content";

const PATH = "/dp-map-maharashtra/";

export const metadata: Metadata = {
  title:
    "DP Map Maharashtra | TP Map व Development Plan सहाय्य | PrintShubh",
  description:
    "महाराष्ट्रातील DP Map, TP Scheme आणि Regional Plan संदर्भासाठी WhatsApp सहाय्य. झोन, आरक्षण, रस्ता रुंदी, FSI तपासणी — अधिकृत स्रोतांवर आधारित खाजगी सेवा.",
  alternates: { canonical: PATH },
  openGraph: {
    type: "article",
    locale: "mr_IN",
    url: PATH,
    siteName: "PrintShubh",
    title: "DP Map Maharashtra | TP Map व Development Plan सहाय्य",
    description:
      "DP / TP नकाशा, झोन, आरक्षण, रस्ता रुंदी आणि FSI संदर्भासाठी WhatsApp वर खाजगी सहाय्य.",
  },
  twitter: {
    card: "summary_large_image",
    title: "DP Map Maharashtra | PrintShubh",
    description: "DP / TP Map संदर्भासाठी WhatsApp वर सहाय्य.",
  },
};

export default function DpMapPage() {
  return (
    <>
      <ServiceJsonLd
        path={PATH}
        serviceName="DP Map / TP Map सहाय्य"
        serviceNameEn="DP Map / TP Map Assistance"
        description="Private WhatsApp assistance for Maharashtra Development Plan (DP) and Town Planning (TP) Scheme references — zoning, reservations, road widths and FSI checks — based on publicly available official sources."
        breadcrumbLabel="DP Map / TP Map"
        faqPairs={dpMapFaqMr}
      />
      <DpMapContent />
    </>
  );
}
