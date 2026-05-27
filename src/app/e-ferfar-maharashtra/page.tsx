import type { Metadata } from "next";
import { ServiceJsonLd } from "@/components/service-jsonld";
import { EFerfarContent, eFerfarFaqMr } from "./eferfar-content";

const PATH = "/e-ferfar-maharashtra/";

export const metadata: Metadata = {
  title: "ई-फेरफार महाराष्ट्र | E-Ferfar Mutation सहाय्य | PrintShubh",
  description:
    "महाराष्ट्रातील ई-फेरफार (Mutation) नोंदी, वारस हक्क व बोजे संदर्भासाठी WhatsApp सहाय्य. अधिकृत स्रोतांवर आधारित खाजगी सेवा.",
  alternates: { canonical: PATH },
  openGraph: {
    type: "article",
    locale: "mr_IN",
    url: PATH,
    siteName: "PrintShubh",
    title: "ई-फेरफार महाराष्ट्र | E-Ferfar Mutation सहाय्य",
    description:
      "ई-फेरफार नोंदी, वारस हक्क, बोजे आणि नामांतर संदर्भासाठी WhatsApp वर खाजगी सहाय्य.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ई-फेरफार महाराष्ट्र | PrintShubh",
    description: "ई-फेरफार / Mutation संदर्भासाठी WhatsApp वर सहाय्य.",
  },
};

export default function EFerfarPage() {
  return (
    <>
      <ServiceJsonLd
        path={PATH}
        serviceName="ई-फेरफार सहाय्य"
        serviceNameEn="E-Ferfar (Mutation) Assistance"
        description="Private WhatsApp assistance for Maharashtra E-Ferfar (mutation) entries, inheritance updates and encumbrance references based on publicly available official sources."
        breadcrumbLabel="ई-फेरफार"
        faqPairs={eFerfarFaqMr}
      />
      <EFerfarContent />
    </>
  );
}
