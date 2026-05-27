import type { Metadata } from "next";
import { ServiceJsonLd } from "@/components/service-jsonld";
import { MilkatContent, milkatFaqMr } from "./milkat-content";

const PATH = "/milkat-patrika-maharashtra/";

export const metadata: Metadata = {
  title:
    "मिळकत पत्रिका महाराष्ट्र | Property Card PDF सहाय्य | PrintShubh",
  description:
    "महाराष्ट्रातील मिळकत पत्रिका (Property Card) PDF साठी WhatsApp सहाय्य — CTS नंबर, City Survey आणि शहरी मालमत्ता नोंदी. अधिकृत स्रोतांवर आधारित खाजगी सेवा.",
  alternates: { canonical: PATH },
  openGraph: {
    type: "article",
    locale: "mr_IN",
    url: PATH,
    siteName: "PrintShubh",
    title: "मिळकत पत्रिका महाराष्ट्र | Property Card सहाय्य",
    description:
      "मिळकत पत्रिका / Property Card PDF साठी WhatsApp वर खाजगी सहाय्य.",
  },
  twitter: {
    card: "summary_large_image",
    title: "मिळकत पत्रिका महाराष्ट्र | PrintShubh",
    description: "Property Card PDF साठी WhatsApp वर सहाय्य.",
  },
};

export default function MilkatPage() {
  return (
    <>
      <ServiceJsonLd
        path={PATH}
        serviceName="मिळकत पत्रिका सहाय्य"
        serviceNameEn="Property Card (Milkat Patrika) Assistance"
        description="Private WhatsApp assistance for retrieving Property Card / Milkat Patrika for urban properties in Maharashtra (CTS number, City Survey records) based on publicly available official sources."
        breadcrumbLabel="मिळकत पत्रिका"
        faqPairs={milkatFaqMr}
      />
      <MilkatContent />
    </>
  );
}
