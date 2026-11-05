import type { Metadata } from "next";
import { ServiceJsonLd } from "@/components/service-jsonld";
import { CollectionPageShell } from "@/components/shop/collection-page-shell";
import { collectionBySlug } from "@/lib/collections";

const PATH = "/collections/canvas-printing/";

export const metadata: Metadata = {
  title: "कॅनव्हास प्रिंटिंग | Premium Collection",
  description:
    "तुमचा फोटो किंवा आर्टवर्क फाइन-आर्ट कॅनव्हासवर, आवश्यक असल्यास फ्रेम माउंटिंगसह. किंमत WhatsApp वर कळवली जाते.",
  alternates: { canonical: PATH },
  openGraph: {
    type: "article",
    locale: "mr_IN",
    url: PATH,
    siteName: "PrintShubh",
    title: "कॅनव्हास प्रिंटिंग | PRINTSHUBH Premium Print & Visual Studio",
    description: "तुमचा फोटो किंवा आर्टवर्क फाइन-आर्ट कॅनव्हासवर, आवश्यक असल्यास फ्रेम माउंटिंगसह. किंमत WhatsApp वर कळवली जाते.",
  },
  twitter: {
    card: "summary_large_image",
    title: "कॅनव्हास प्रिंटिंग | PRINTSHUBH",
    description: "तुमचा फोटो किंवा आर्टवर्क फाइन-आर्ट कॅनव्हासवर, आवश्यक असल्यास फ्रेम माउंटिंगसह. किंमत WhatsApp वर कळवली जाते.",
  },
};

export default function Page() {
  const collection = collectionBySlug("canvas-printing")!;
  return (
    <>
      <ServiceJsonLd
        path={PATH}
        serviceName="कॅनव्हास प्रिंटिंग"
        serviceNameEn="Canvas Printing"
        description="Your photo or artwork on fine-art canvas, with frame mounting on request. Price shared on WhatsApp."
        breadcrumbLabel="कॅनव्हास प्रिंटिंग"
      />
      <CollectionPageShell collection={collection} />
    </>
  );
}
