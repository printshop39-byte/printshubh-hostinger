import type { Metadata } from "next";
import { ServiceJsonLd } from "@/components/service-jsonld";
import { CollectionPageShell } from "@/components/shop/collection-page-shell";
import { collectionBySlug } from "@/lib/collections";

const PATH = "/collections/satin-fabric-printing/";

export const metadata: Metadata = {
  title: "साटीन फॅब्रिक प्रिंटिंग | Premium Collection",
  description:
    "साटीन फॅब्रिकवर चमकदार प्रिंट फिनिश — इव्हेंट बॅकड्रॉप व सजावटीसाठी. किंमत WhatsApp वर कळवली जाते.",
  alternates: { canonical: PATH },
  openGraph: {
    type: "article",
    locale: "mr_IN",
    url: PATH,
    siteName: "PrintShubh",
    title: "साटीन फॅब्रिक प्रिंटिंग | PRINTSHUBH Premium Print & Visual Studio",
    description: "साटीन फॅब्रिकवर चमकदार प्रिंट फिनिश — इव्हेंट बॅकड्रॉप व सजावटीसाठी. किंमत WhatsApp वर कळवली जाते.",
  },
  twitter: {
    card: "summary_large_image",
    title: "साटीन फॅब्रिक प्रिंटिंग | PRINTSHUBH",
    description: "साटीन फॅब्रिकवर चमकदार प्रिंट फिनिश — इव्हेंट बॅकड्रॉप व सजावटीसाठी. किंमत WhatsApp वर कळवली जाते.",
  },
};

export default function Page() {
  const collection = collectionBySlug("satin-fabric-printing")!;
  return (
    <>
      <ServiceJsonLd
        path={PATH}
        serviceName="साटीन फॅब्रिक प्रिंटिंग"
        serviceNameEn="Satin Fabric Printing"
        description="A smooth, lustrous print finish on satin fabric — for event backdrops and decor. Price shared on WhatsApp."
        breadcrumbLabel="साटीन फॅब्रिक प्रिंटिंग"
      />
      <CollectionPageShell collection={collection} />
    </>
  );
}
