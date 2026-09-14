import type { Metadata } from "next";
import { ServiceJsonLd } from "@/components/service-jsonld";
import { LandUnitContent, landUnitFaqMr } from "./land-unit-content";

const PATH = "/land-unit-converter/";

export const metadata: Metadata = {
  title: "जमीन क्षेत्र रूपांतरक | Guntha, Acre, Hectare Converter",
  description:
    "मोफत जमीन क्षेत्र रूपांतरक — गुंठा, एकर, हेक्टर, चौ. मीटर व चौ. फूट यांच्यातील क्षेत्रफळ झटपट रूपांतरित करा. 7/12 उताऱ्यावरील क्षेत्रफळ समजण्यासाठी उपयुक्त.",
  alternates: { canonical: PATH },
  openGraph: {
    type: "website",
    locale: "mr_IN",
    url: PATH,
    siteName: "PrintShubh",
    title: "जमीन क्षेत्र रूपांतरक — गुंठा, एकर, हेक्टर",
    description: "गुंठा, एकर, हेक्टर, चौ. मीटर व चौ. फूट यांच्यातील रूपांतरण.",
  },
  twitter: {
    card: "summary_large_image",
    title: "जमीन क्षेत्र रूपांतरक | PrintShubh",
    description: "गुंठा ⇄ एकर ⇄ हेक्टर ⇄ चौ. फूट — मोफत साधन.",
  },
};

export default function LandUnitConverterPage() {
  return (
    <>
      <ServiceJsonLd
        path={PATH}
        serviceName="जमीन क्षेत्र रूपांतरक"
        serviceNameEn="Land Unit Converter"
        description="Free land-area unit converter for Maharashtra. Convert instantly between guntha, acre, hectare, square metre and square foot. Useful for reading 7/12 extract and property card area figures. Informational tool only."
        breadcrumbLabel="जमीन क्षेत्र रूपांतरक"
        faqPairs={landUnitFaqMr}
      />
      <LandUnitContent />
    </>
  );
}
