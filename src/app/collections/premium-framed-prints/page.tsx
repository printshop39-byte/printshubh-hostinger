import type { Metadata } from "next";
import { ServiceJsonLd } from "@/components/service-jsonld";
import { CollectionPageShell } from "@/components/shop/collection-page-shell";
import { collectionBySlug } from "@/lib/collections";

const PATH = "/collections/premium-framed-prints/";

export const metadata: Metadata = {
  title: "प्रीमियम फ्रेम्ड प्रिंट्स | Premium Collection",
  description:
    "प्रिंट + फ्रेमिंग, भिंतीवर लावण्यासाठी तयार — घर, ऑफिस व भेटवस्तूंसाठी. किंमत WhatsApp वर कळवली जाते.",
  alternates: { canonical: PATH },
  openGraph: {
    type: "article",
    locale: "mr_IN",
    url: PATH,
    siteName: "PrintShubh",
    title: "प्रीमियम फ्रेम्ड प्रिंट्स | PRINTSHUBH Premium Print & Visual Studio",
    description: "प्रिंट + फ्रेमिंग, भिंतीवर लावण्यासाठी तयार — घर, ऑफिस व भेटवस्तूंसाठी. किंमत WhatsApp वर कळवली जाते.",
  },
  twitter: {
    card: "summary_large_image",
    title: "प्रीमियम फ्रेम्ड प्रिंट्स | PRINTSHUBH",
    description: "प्रिंट + फ्रेमिंग, भिंतीवर लावण्यासाठी तयार — घर, ऑफिस व भेटवस्तूंसाठी. किंमत WhatsApp वर कळवली जाते.",
  },
};

export default function Page() {
  const collection = collectionBySlug("premium-framed-prints")!;
  return (
    <>
      <ServiceJsonLd
        path={PATH}
        serviceName="प्रीमियम फ्रेम्ड प्रिंट्स"
        serviceNameEn="Premium Framed Prints"
        description="Print plus framing, ready to hang — for home, office and gifts. Price shared on WhatsApp."
        breadcrumbLabel="प्रीमियम फ्रेम्ड प्रिंट्स"
      />
      <CollectionPageShell collection={collection} />
    </>
  );
}
