import type { Metadata } from "next";
import { ServiceJsonLd } from "@/components/service-jsonld";
import { GavNakashaContent, gavNakashaFaqMr } from "./gav-nakasha-content";

const PATH = "/gav-nakasha-maharashtra/";

export const metadata: Metadata = {
  title: "गाव नकाशा महाराष्ट्र | Village Map PDF सहाय्य | PrintShubh",
  description:
    "महाराष्ट्रातील गाव नकाशा, गट नकाशा व सर्वे नंबर संदर्भासाठी WhatsApp सहाय्य. Bhuvan, Mahabhumi व सार्वजनिक स्रोतांवर आधारित खाजगी सेवा.",
  alternates: { canonical: PATH },
  openGraph: {
    type: "article",
    locale: "mr_IN",
    url: PATH,
    siteName: "PrintShubh",
    title: "गाव नकाशा महाराष्ट्र | Village Map PDF सहाय्य",
    description:
      "महाराष्ट्रातील गाव नकाशा, गट नकाशा, सर्वे नंबर संदर्भासाठी WhatsApp वर खाजगी सहाय्य.",
  },
  twitter: {
    card: "summary_large_image",
    title: "गाव नकाशा महाराष्ट्र | PrintShubh",
    description: "महाराष्ट्रातील गाव नकाशा / Village Map PDF सहाय्य.",
  },
};

export default function GavNakashaPage() {
  return (
    <>
      <ServiceJsonLd
        path={PATH}
        serviceName="गाव नकाशा सहाय्य"
        serviceNameEn="Village Map (Gav Nakasha) Assistance"
        description="Private WhatsApp assistance for retrieving village maps, Gut maps and Survey-number reference maps in Maharashtra based on Bhuvan, Mahabhumi and publicly available official sources."
        breadcrumbLabel="गाव नकाशा"
        faqPairs={gavNakashaFaqMr}
      />
      <GavNakashaContent />
    </>
  );
}
