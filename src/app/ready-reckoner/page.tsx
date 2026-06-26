import type { Metadata } from "next";
import { ServiceJsonLd } from "@/components/service-jsonld";
import { ReadyReckonerContent, readyReckonerFaqMr } from "./ready-reckoner-content";

const PATH = "/ready-reckoner/";

export const metadata: Metadata = {
  title: "रेडी रेकनर दर कोल्हापूर | Ready Reckoner Rate Lookup | PrintShubh",
  description:
    "कोल्हापूर जिल्ह्यासाठी रेडी रेकनर (ASR) दर शोधा — तालुका व वर्गनिहाय प्रति चौरस मीटर सरकारी जमीन-मूल्य आणि अंदाजे मालमत्ता मूल्य. (नमुना दर.)",
  alternates: { canonical: PATH },
  openGraph: {
    type: "website",
    locale: "mr_IN",
    url: PATH,
    siteName: "PrintShubh",
    title: "रेडी रेकनर दर शोध — कोल्हापूर",
    description:
      "तालुका व वर्गनिहाय रेडी रेकनर (ASR) दर आणि क्षेत्रफळावरून अंदाजे मूल्य.",
  },
  twitter: {
    card: "summary_large_image",
    title: "रेडी रेकनर दर शोध | PrintShubh",
    description: "तालुका-निहाय सरकारी जमीन-मूल्य दर — कोल्हापूर नमुना.",
  },
};

export default function ReadyReckonerPage() {
  return (
    <>
      <ServiceJsonLd
        path={PATH}
        serviceName="रेडी रेकनर दर शोध"
        serviceNameEn="Ready Reckoner Rate Lookup"
        description="Look up Ready Reckoner (Annual Statement of Rates) land values by taluka and category for Kolhapur district, and estimate property value from area. Informational tool — currently shows sample rates pending official ASR data."
        breadcrumbLabel="रेडी रेकनर"
        faqPairs={readyReckonerFaqMr}
      />
      <ReadyReckonerContent />
    </>
  );
}
