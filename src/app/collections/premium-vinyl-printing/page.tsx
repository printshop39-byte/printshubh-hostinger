import type { Metadata } from "next";
import { ServiceJsonLd } from "@/components/service-jsonld";
import { CollectionPageShell } from "@/components/shop/collection-page-shell";
import { collectionBySlug } from "@/lib/collections";

const PATH = "/collections/premium-vinyl-printing";

export const metadata: Metadata = {
  title: "Premium Vinyl Printing | Premium Collection",
  description:
    "Durable vinyl printing for shop signage, banners and wall/window graphics. Price shared on WhatsApp.",
  alternates: { canonical: PATH },
  openGraph: {
    type: "article",
    locale: "en_IN",
    url: PATH,
    siteName: "PrintShubh",
    title: "Premium Vinyl Printing | PRINTSHUBH Premium Print & Visual Studio",
    description: "Durable vinyl printing for shop signage, banners and wall/window graphics. Price shared on WhatsApp.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Premium Vinyl Printing | PRINTSHUBH",
    description: "Durable vinyl printing for shop signage, banners and wall/window graphics. Price shared on WhatsApp.",
  },
};

export default function Page() {
  const collection = collectionBySlug("premium-vinyl-printing")!;
  return (
    <>
      <ServiceJsonLd
        path={PATH}
        serviceName="Premium Vinyl Printing"
        serviceNameEn="Premium Vinyl Printing"
        description="Durable vinyl printing for shop signage, banners and wall/window graphics. Price shared on WhatsApp."
        breadcrumbLabel="Premium Vinyl Printing"
      />
      <CollectionPageShell collection={collection} />
    </>
  );
}
