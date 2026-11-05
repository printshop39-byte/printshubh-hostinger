import type { Metadata } from "next";
import { ServiceJsonLd } from "@/components/service-jsonld";
import { CollectionPageShell } from "@/components/shop/collection-page-shell";
import { collectionBySlug } from "@/lib/collections";

const PATH = "/collections/wall-paintings-wall-art/";

export const metadata: Metadata = {
  title: "वॉल पेंटिंग्स आणि वॉल आर्ट | Premium Collection",
  description:
    "घर, ऑफिस किंवा दुकानासाठी सजावटीचे वॉल आर्ट प्रिंट — सिंगल किंवा मल्टी-पॅनल. किंमत WhatsApp वर कळवली जाते.",
  alternates: { canonical: PATH },
  openGraph: {
    type: "article",
    locale: "mr_IN",
    url: PATH,
    siteName: "PrintShubh",
    title: "वॉल पेंटिंग्स आणि वॉल आर्ट | PRINTSHUBH Premium Print & Visual Studio",
    description: "घर, ऑफिस किंवा दुकानासाठी सजावटीचे वॉल आर्ट प्रिंट — सिंगल किंवा मल्टी-पॅनल. किंमत WhatsApp वर कळवली जाते.",
  },
  twitter: {
    card: "summary_large_image",
    title: "वॉल पेंटिंग्स आणि वॉल आर्ट | PRINTSHUBH",
    description: "घर, ऑफिस किंवा दुकानासाठी सजावटीचे वॉल आर्ट प्रिंट — सिंगल किंवा मल्टी-पॅनल. किंमत WhatsApp वर कळवली जाते.",
  },
};

export default function Page() {
  const collection = collectionBySlug("wall-paintings-wall-art")!;
  return (
    <>
      <ServiceJsonLd
        path={PATH}
        serviceName="वॉल पेंटिंग्स आणि वॉल आर्ट"
        serviceNameEn="Wall Paintings & Wall Art"
        description="Decorative wall-art prints for home, office or shop — single or multi-panel. Price shared on WhatsApp."
        breadcrumbLabel="वॉल पेंटिंग्स आणि वॉल आर्ट"
      />
      <CollectionPageShell collection={collection} />
    </>
  );
}
