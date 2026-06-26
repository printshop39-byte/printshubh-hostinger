import type { Metadata } from "next";
import { ServiceJsonLd } from "@/components/service-jsonld";
import { EmiContent, emiFaqMr } from "./emi-content";

const PATH = "/home-loan-emi/";

export const metadata: Metadata = {
  title: "गृहकर्ज EMI कॅल्क्युलेटर | Home Loan EMI + बँक तुलना | PrintShubh",
  description:
    "महाराष्ट्रासाठी मोफत गृहकर्ज EMI कॅल्क्युलेटर — कर्जरक्कम, व्याजदर व मुदत टाका आणि मासिक EMI, एकूण व्याज व बँकनिहाय तुलना लगेच पाहा.",
  alternates: { canonical: PATH },
  openGraph: {
    type: "website",
    locale: "mr_IN",
    url: PATH,
    siteName: "PrintShubh",
    title: "गृहकर्ज EMI कॅल्क्युलेटर — बँक तुलना",
    description:
      "कर्जरक्कम, व्याजदर व मुदतीवरून मासिक EMI व एकूण व्याज मोजा. बँकनिहाय EMI तुलना.",
  },
  twitter: {
    card: "summary_large_image",
    title: "गृहकर्ज EMI कॅल्क्युलेटर | PrintShubh",
    description: "मासिक EMI, एकूण व्याज व बँकनिहाय तुलना — मोफत साधन.",
  },
};

export default function HomeLoanEmiPage() {
  return (
    <>
      <ServiceJsonLd
        path={PATH}
        serviceName="गृहकर्ज EMI कॅल्क्युलेटर"
        serviceNameEn="Home Loan EMI Calculator"
        description="Free home-loan EMI calculator for Maharashtra. Estimate monthly EMI, total interest and compare indicative bank interest rates. Informational tool only — PrintShubh does not provide loans."
        breadcrumbLabel="गृहकर्ज EMI"
        faqPairs={emiFaqMr}
      />
      <EmiContent />
    </>
  );
}
