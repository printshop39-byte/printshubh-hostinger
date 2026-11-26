import type { Metadata } from "next";
import { ServiceJsonLd } from "@/components/service-jsonld";
import { CollectionPageShell } from "@/components/shop/collection-page-shell";
import { collectionBySlug } from "@/lib/collections";

const PATH = "/collections/wall-paintings-wall-art";

export const metadata: Metadata = {
  title: "Wall Paintings & Wall Art | Premium Collection",
  description:
    "Decorative wall-art prints for home, office or shop — single or multi-panel. Price shared on WhatsApp.",
  alternates: { canonical: PATH },
  openGraph: {
    type: "article",
    locale: "en_IN",
    url: PATH,
    siteName: "PrintShubh",
    title: "Wall Paintings & Wall Art | PRINTSHUBH Premium Print & Visual Studio",
    description: "Decorative wall-art prints for home, office or shop — single or multi-panel. Price shared on WhatsApp.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wall Paintings & Wall Art | PRINTSHUBH",
    description: "Decorative wall-art prints for home, office or shop — single or multi-panel. Price shared on WhatsApp.",
  },
};

export default function Page() {
  const collection = collectionBySlug("wall-paintings-wall-art")!;
  return (
    <>
      <ServiceJsonLd
        path={PATH}
        serviceName="Wall Paintings & Wall Art"
        serviceNameEn="Wall Paintings & Wall Art"
        description="Decorative wall-art prints for home, office or shop — single or multi-panel. Price shared on WhatsApp."
        breadcrumbLabel="Wall Paintings & Wall Art"
      />
      <CollectionPageShell collection={collection} />
    </>
  );
}
