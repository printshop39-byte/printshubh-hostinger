import type { Metadata } from "next";
import { ServiceJsonLd } from "@/components/service-jsonld";
import { CollectionPageShell } from "@/components/shop/collection-page-shell";
import { collectionBySlug } from "@/lib/collections";

const PATH = "/collections/satin-fabric-printing";

export const metadata: Metadata = {
  title: "Satin Fabric Printing | Premium Collection",
  description:
    "A smooth, lustrous print finish on satin fabric — for event backdrops and decor. Price shared on WhatsApp.",
  alternates: { canonical: PATH },
  openGraph: {
    type: "article",
    locale: "en_IN",
    url: PATH,
    siteName: "PrintShubh",
    title: "Satin Fabric Printing | PRINTSHUBH Premium Print & Visual Studio",
    description: "A smooth, lustrous print finish on satin fabric — for event backdrops and decor. Price shared on WhatsApp.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Satin Fabric Printing | PRINTSHUBH",
    description: "A smooth, lustrous print finish on satin fabric — for event backdrops and decor. Price shared on WhatsApp.",
  },
};

export default function Page() {
  const collection = collectionBySlug("satin-fabric-printing")!;
  return (
    <>
      <ServiceJsonLd
        path={PATH}
        serviceName="Satin Fabric Printing"
        serviceNameEn="Satin Fabric Printing"
        description="A smooth, lustrous print finish on satin fabric — for event backdrops and decor. Price shared on WhatsApp."
        breadcrumbLabel="Satin Fabric Printing"
      />
      <CollectionPageShell collection={collection} />
    </>
  );
}
