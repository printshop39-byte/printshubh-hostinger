import type { Metadata } from "next";
import { ServiceJsonLd } from "@/components/service-jsonld";
import { JameenReportContent, jameenReportFaqMr } from "./jameen-report-content";

const PATH = "/jameen-report-maharashtra/";

export const metadata: Metadata = {
  title: "जमीन अहवाल महाराष्ट्र | Land Report सहाय्य | PrintShubh",
  description:
    "महाराष्ट्रातील जमीन-अहवाल / Land Report — 7/12, 8A, फेरफार, नकाशा आणि बोजे यांचे एकत्रित संकलन. WhatsApp वर खाजगी सहाय्य.",
  alternates: { canonical: PATH },
  openGraph: {
    type: "article",
    locale: "mr_IN",
    url: PATH,
    siteName: "PrintShubh",
    title: "जमीन अहवाल महाराष्ट्र | Land Report सहाय्य",
    description:
      "Land Report (7/12 + 8A + फेरफार + नकाशा) एकत्रित संकलनासाठी WhatsApp वर खाजगी सहाय्य.",
  },
  twitter: {
    card: "summary_large_image",
    title: "जमीन अहवाल महाराष्ट्र | PrintShubh",
    description: "Land Report एकत्रित संकलनासाठी WhatsApp वर सहाय्य.",
  },
};

export default function JameenReportPage() {
  return (
    <>
      <ServiceJsonLd
        path={PATH}
        serviceName="जमीन अहवाल सहाय्य"
        serviceNameEn="Land Report (Jameen Ahwal) Assistance"
        description="Private WhatsApp assistance for compiled Maharashtra land reports — 7/12, 8A, mutation history, village map and encumbrance — based on publicly available official sources."
        breadcrumbLabel="जमीन अहवाल"
        faqPairs={jameenReportFaqMr}
      />
      <JameenReportContent />
    </>
  );
}
