import type { Metadata } from "next";
import { ServiceJsonLd } from "@/components/service-jsonld";
import { CollectionPageShell } from "@/components/shop/collection-page-shell";
import { collectionBySlug } from "@/lib/collections";

const PATH = "/collections/premium-wallpaper-printing/";

export const metadata: Metadata = {
  title: "प्रीमियम वॉलपेपर प्रिंटिंग | Premium Collection",
  description:
    "घर, ऑफिस किंवा दुकानासाठी सानुकूल डिझाइन वॉलपेपर प्रिंटिंग — तुमची डिझाइन/फोटो, मापानुसार प्रिंट. किंमत WhatsApp वर कळवली जाते.",
  alternates: { canonical: PATH },
  openGraph: {
    type: "article",
    locale: "mr_IN",
    url: PATH,
    siteName: "PrintShubh",
    title: "प्रीमियम वॉलपेपर प्रिंटिंग | PRINTSHUBH Premium Print & Visual Studio",
    description: "घर, ऑफिस किंवा दुकानासाठी सानुकूल डिझाइन वॉलपेपर प्रिंटिंग — तुमची डिझाइन/फोटो, मापानुसार प्रिंट. किंमत WhatsApp वर कळवली जाते.",
  },
  twitter: {
    card: "summary_large_image",
    title: "प्रीमियम वॉलपेपर प्रिंटिंग | PRINTSHUBH",
    description: "घर, ऑफिस किंवा दुकानासाठी सानुकूल डिझाइन वॉलपेपर प्रिंटिंग — तुमची डिझाइन/फोटो, मापानुसार प्रिंट. किंमत WhatsApp वर कळवली जाते.",
  },
};

export default function Page() {
  const collection = collectionBySlug("premium-wallpaper-printing")!;
  return (
    <>
      <ServiceJsonLd
        path={PATH}
        serviceName="प्रीमियम वॉलपेपर प्रिंटिंग"
        serviceNameEn="Premium Wallpaper Printing"
        description="Custom-design wallpaper printing for homes, offices and shops — your design or photo, printed to size. Price shared on WhatsApp."
        breadcrumbLabel="प्रीमियम वॉलपेपर प्रिंटिंग"
      />
      <CollectionPageShell collection={collection} />
    </>
  );
}
