import type { Metadata } from "next";
import { ServiceJsonLd } from "@/components/service-jsonld";
import { CollectionPageShell } from "@/components/shop/collection-page-shell";
import { collectionBySlug } from "@/lib/collections";

const PATH = "/collections/rexine-pu-leatherette-printing";

export const metadata: Metadata = {
  title: "Rexine / PU Leatherette Printing | Premium Collection",
  description:
    "Custom design printing on rexine / PU leatherette — for furniture, headboards and covers. Price shared on WhatsApp.",
  alternates: { canonical: PATH },
  openGraph: {
    type: "article",
    locale: "en_IN",
    url: PATH,
    siteName: "PrintShubh",
    title: "Rexine / PU Leatherette Printing | PRINTSHUBH Premium Print & Visual Studio",
    description: "Custom design printing on rexine / PU leatherette — for furniture, headboards and covers. Price shared on WhatsApp.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rexine / PU Leatherette Printing | PRINTSHUBH",
    description: "Custom design printing on rexine / PU leatherette — for furniture, headboards and covers. Price shared on WhatsApp.",
  },
};

export default function Page() {
  const collection = collectionBySlug("rexine-pu-leatherette-printing")!;
  return (
    <>
      <ServiceJsonLd
        path={PATH}
        serviceName="Rexine / PU Leatherette Printing"
        serviceNameEn="Rexine / PU Leatherette Printing"
        description="Custom design printing on rexine / PU leatherette — for furniture, headboards and covers. Price shared on WhatsApp."
        breadcrumbLabel="Rexine / PU Leatherette Printing"
      />
      <CollectionPageShell collection={collection} />
    </>
  );
}
