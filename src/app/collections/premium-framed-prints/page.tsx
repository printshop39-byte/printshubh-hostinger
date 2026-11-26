import type { Metadata } from "next";
import { ServiceJsonLd } from "@/components/service-jsonld";
import { CollectionPageShell } from "@/components/shop/collection-page-shell";
import { collectionBySlug } from "@/lib/collections";

const PATH = "/collections/premium-framed-prints";

export const metadata: Metadata = {
  title: "Premium Framed Prints | Premium Collection",
  description:
    "Print plus framing, ready to hang — for home, office and gifts. Price shared on WhatsApp.",
  alternates: { canonical: PATH },
  openGraph: {
    type: "article",
    locale: "en_IN",
    url: PATH,
    siteName: "PrintShubh",
    title: "Premium Framed Prints | PRINTSHUBH Premium Print & Visual Studio",
    description: "Print plus framing, ready to hang — for home, office and gifts. Price shared on WhatsApp.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Premium Framed Prints | PRINTSHUBH",
    description: "Print plus framing, ready to hang — for home, office and gifts. Price shared on WhatsApp.",
  },
};

export default function Page() {
  const collection = collectionBySlug("premium-framed-prints")!;
  return (
    <>
      <ServiceJsonLd
        path={PATH}
        serviceName="Premium Framed Prints"
        serviceNameEn="Premium Framed Prints"
        description="Print plus framing, ready to hang — for home, office and gifts. Price shared on WhatsApp."
        breadcrumbLabel="Premium Framed Prints"
      />
      <CollectionPageShell collection={collection} />
    </>
  );
}
