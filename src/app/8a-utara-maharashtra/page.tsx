import type { Metadata } from "next";
import { ServiceJsonLd } from "@/components/service-jsonld";
import { EightAContent, eightAFaqMr } from "./eight-a-content";

const PATH = "/8a-utara-maharashtra/";

export const metadata: Metadata = {
  title: "8A उतारा महाराष्ट्र | 8A Extract PDF सहाय्य | PrintShubh",
  description:
    "महाराष्ट्रात 8A उताऱ्यासाठी WhatsApp सहाय्य — खातेदार-निहाय एकत्रित जमीन नोंदी. अधिकृत स्रोतांवर आधारित खाजगी सेवा.",
  alternates: { canonical: PATH },
  openGraph: {
    type: "article",
    locale: "mr_IN",
    url: PATH,
    siteName: "PrintShubh",
    title: "8A उतारा महाराष्ट्र | 8A Extract PDF सहाय्य",
    description:
      "महाराष्ट्रातील 8A उताऱ्यासाठी WhatsApp वर खाजगी सहाय्य. अधिकृत स्रोतांवर आधारित.",
  },
  twitter: {
    card: "summary_large_image",
    title: "8A उतारा महाराष्ट्र | PrintShubh",
    description: "महाराष्ट्रातील 8A उताऱ्यासाठी WhatsApp वर सहाय्य.",
  },
};

export default function EightAPage() {
  return (
    <>
      <ServiceJsonLd
        path={PATH}
        serviceName="8A उतारा सहाय्य"
        serviceNameEn="8A Extract Assistance"
        description="Private WhatsApp assistance for retrieving 8A account-holder extracts in Maharashtra based on publicly available official sources."
        breadcrumbLabel="8A उतारा"
        faqPairs={eightAFaqMr}
      />
      <EightAContent />
    </>
  );
}
