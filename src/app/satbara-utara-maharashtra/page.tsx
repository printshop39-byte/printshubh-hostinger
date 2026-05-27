import type { Metadata } from "next";
import { ServiceJsonLd } from "@/components/service-jsonld";
import { SatbaraContent, satbaraFaqMr } from "./satbara-content";

const PATH = "/satbara-utara-maharashtra/";

export const metadata: Metadata = {
  title: "7/12 उतारा महाराष्ट्र | Satbara Utara PDF सहाय्य | PrintShubh",
  description:
    "महाराष्ट्रात 7/12 (सातबारा) उताऱ्यासाठी WhatsApp सहाय्य — जिल्हा, तालुका, गाव, गट नंबर शेअर करा. अधिकृत स्रोतांवर आधारित खाजगी सेवा.",
  alternates: { canonical: PATH },
  openGraph: {
    type: "article",
    locale: "mr_IN",
    url: PATH,
    siteName: "PrintShubh",
    title: "7/12 उतारा महाराष्ट्र | Satbara Utara PDF सहाय्य",
    description:
      "महाराष्ट्रातील 7/12 / सातबारा उताऱ्यासाठी WhatsApp वर खाजगी सहाय्य. अधिकृत स्रोतांवर आधारित.",
  },
  twitter: {
    card: "summary_large_image",
    title: "7/12 उतारा महाराष्ट्र | PrintShubh",
    description: "महाराष्ट्रातील 7/12 / सातबारा उताऱ्यासाठी WhatsApp वर सहाय्य.",
  },
};

export default function SatbaraPage() {
  return (
    <>
      <ServiceJsonLd
        path={PATH}
        serviceName="7/12 उतारा सहाय्य"
        serviceNameEn="7/12 Utara (Satbara) Assistance"
        description="Private WhatsApp assistance for retrieving 7/12 / Satbara extracts in Maharashtra based on publicly available official sources from Mahabhumi and Bhulekh."
        breadcrumbLabel="7/12 उतारा"
        faqPairs={satbaraFaqMr}
      />
      <SatbaraContent />
    </>
  );
}
