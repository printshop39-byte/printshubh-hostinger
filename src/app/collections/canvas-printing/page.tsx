import type { Metadata } from "next";
import { ServiceJsonLd } from "@/components/service-jsonld";
import { CollectionPageShell } from "@/components/shop/collection-page-shell";
import { collectionBySlug } from "@/lib/collections";

const PATH = "/collections/canvas-printing";

export const metadata: Metadata = {
  title: "Canvas Printing | Premium Collection",
  description:
    "Your photo or artwork on fine-art canvas, with frame mounting on request. Price shared on WhatsApp.",
  alternates: { canonical: PATH },
  openGraph: {
    type: "article",
    locale: "en_IN",
    url: PATH,
    siteName: "PrintShubh",
    title: "Canvas Printing | PRINTSHUBH Premium Print & Visual Studio",
    description: "Your photo or artwork on fine-art canvas, with frame mounting on request. Price shared on WhatsApp.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Canvas Printing | PRINTSHUBH",
    description: "Your photo or artwork on fine-art canvas, with frame mounting on request. Price shared on WhatsApp.",
  },
};

export default function Page() {
  const collection = collectionBySlug("canvas-printing")!;
  return (
    <>
      <ServiceJsonLd
        path={PATH}
        serviceName="Canvas Printing"
        serviceNameEn="Canvas Printing"
        description="Your photo or artwork on fine-art canvas, with frame mounting on request. Price shared on WhatsApp."
        breadcrumbLabel="Canvas Printing"
      />
      <CollectionPageShell collection={collection} />
    </>
  );
}
