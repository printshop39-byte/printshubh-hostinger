import type { Metadata } from "next";
import { ServiceJsonLd } from "@/components/service-jsonld";
import { CollectionPageShell } from "@/components/shop/collection-page-shell";
import { collectionBySlug } from "@/lib/collections";

const PATH = "/collections/premium-vinyl-printing/";

export const metadata: Metadata = {
  title: "प्रीमियम व्हिनाइल प्रिंटिंग | Premium Collection",
  description:
    "दुकान साइनेज, बॅनर व भिंत/खिडकी ग्राफिक्ससाठी टिकाऊ व्हिनाइल प्रिंट. किंमत WhatsApp वर कळवली जाते.",
  alternates: { canonical: PATH },
  openGraph: {
    type: "article",
    locale: "mr_IN",
    url: PATH,
    siteName: "PrintShubh",
    title: "प्रीमियम व्हिनाइल प्रिंटिंग | PRINTSHUBH Premium Print & Visual Studio",
    description: "दुकान साइनेज, बॅनर व भिंत/खिडकी ग्राफिक्ससाठी टिकाऊ व्हिनाइल प्रिंट. किंमत WhatsApp वर कळवली जाते.",
  },
  twitter: {
    card: "summary_large_image",
    title: "प्रीमियम व्हिनाइल प्रिंटिंग | PRINTSHUBH",
    description: "दुकान साइनेज, बॅनर व भिंत/खिडकी ग्राफिक्ससाठी टिकाऊ व्हिनाइल प्रिंट. किंमत WhatsApp वर कळवली जाते.",
  },
};

export default function Page() {
  const collection = collectionBySlug("premium-vinyl-printing")!;
  return (
    <>
      <ServiceJsonLd
        path={PATH}
        serviceName="प्रीमियम व्हिनाइल प्रिंटिंग"
        serviceNameEn="Premium Vinyl Printing"
        description="Durable vinyl printing for shop signage, banners and wall/window graphics. Price shared on WhatsApp."
        breadcrumbLabel="प्रीमियम व्हिनाइल प्रिंटिंग"
      />
      <CollectionPageShell collection={collection} />
    </>
  );
}
