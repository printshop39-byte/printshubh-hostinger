import type { Metadata } from "next";
import { ServiceJsonLd } from "@/components/service-jsonld";
import { StampDutyContent, stampDutyFaqMr } from "./stamp-duty-content";

const PATH = "/stamp-duty/";

export const metadata: Metadata = {
  title: "मुद्रांक शुल्क कॅल्क्युलेटर महाराष्ट्र | Stamp Duty Calculator | PrintShubh",
  description:
    "महाराष्ट्रासाठी मोफत मुद्रांक शुल्क कॅल्क्युलेटर — मालमत्ता मूल्य, स्थानिक स्वराज्य संस्था, मेट्रो सेस व महिला सवलतीसह मुद्रांक शुल्क, नोंदणी शुल्क व एकूण रक्कम मोजा.",
  alternates: { canonical: PATH },
  openGraph: {
    type: "website",
    locale: "mr_IN",
    url: PATH,
    siteName: "PrintShubh",
    title: "मुद्रांक शुल्क कॅल्क्युलेटर — महाराष्ट्र",
    description:
      "मालमत्ता मूल्यावरून मुद्रांक शुल्क, मेट्रो सेस व नोंदणी शुल्क मोजा.",
  },
  twitter: {
    card: "summary_large_image",
    title: "मुद्रांक शुल्क कॅल्क्युलेटर | PrintShubh",
    description: "महाराष्ट्र मुद्रांक शुल्क व नोंदणी शुल्क — मोफत साधन.",
  },
};

export default function StampDutyPage() {
  return (
    <>
      <ServiceJsonLd
        path={PATH}
        serviceName="मुद्रांक शुल्क कॅल्क्युलेटर"
        serviceNameEn="Stamp Duty Calculator"
        description="Free Maharashtra stamp duty and registration calculator. Estimate stamp duty, metro cess and registration fee by property value, local body type, metro city and female-buyer concession. Informational tool only."
        breadcrumbLabel="मुद्रांक शुल्क"
        faqPairs={stampDutyFaqMr}
      />
      <StampDutyContent />
    </>
  );
}
