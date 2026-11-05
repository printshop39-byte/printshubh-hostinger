import type { Metadata } from "next";
import { ServiceJsonLd } from "@/components/service-jsonld";
import { CollectionPageShell } from "@/components/shop/collection-page-shell";
import { collectionBySlug } from "@/lib/collections";

const PATH = "/collections/rexine-pu-leatherette-printing/";

export const metadata: Metadata = {
  title: "रेक्झिन / PU लेदरेट प्रिंटिंग | Premium Collection",
  description:
    "रेक्झिन व PU लेदरेट पृष्ठभागावर सानुकूल डिझाइन प्रिंट — फर्निचर, हेडबोर्ड व कव्हरसाठी. किंमत WhatsApp वर कळवली जाते.",
  alternates: { canonical: PATH },
  openGraph: {
    type: "article",
    locale: "mr_IN",
    url: PATH,
    siteName: "PrintShubh",
    title: "रेक्झिन / PU लेदरेट प्रिंटिंग | PRINTSHUBH Premium Print & Visual Studio",
    description: "रेक्झिन व PU लेदरेट पृष्ठभागावर सानुकूल डिझाइन प्रिंट — फर्निचर, हेडबोर्ड व कव्हरसाठी. किंमत WhatsApp वर कळवली जाते.",
  },
  twitter: {
    card: "summary_large_image",
    title: "रेक्झिन / PU लेदरेट प्रिंटिंग | PRINTSHUBH",
    description: "रेक्झिन व PU लेदरेट पृष्ठभागावर सानुकूल डिझाइन प्रिंट — फर्निचर, हेडबोर्ड व कव्हरसाठी. किंमत WhatsApp वर कळवली जाते.",
  },
};

export default function Page() {
  const collection = collectionBySlug("rexine-pu-leatherette-printing")!;
  return (
    <>
      <ServiceJsonLd
        path={PATH}
        serviceName="रेक्झिन / PU लेदरेट प्रिंटिंग"
        serviceNameEn="Rexine / PU Leatherette Printing"
        description="Custom design printing on rexine / PU leatherette — for furniture, headboards and covers. Price shared on WhatsApp."
        breadcrumbLabel="रेक्झिन / PU लेदरेट प्रिंटिंग"
      />
      <CollectionPageShell collection={collection} />
    </>
  );
}
