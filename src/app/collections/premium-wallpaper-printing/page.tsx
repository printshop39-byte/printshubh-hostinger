import type { Metadata } from "next";
import { ServiceJsonLd } from "@/components/service-jsonld";
import { CollectionPageShell } from "@/components/shop/collection-page-shell";
import { WallpaperCollage } from "@/components/shop/wallpaper-collage";
import { collectionBySlug } from "@/lib/collections";
import { COLLECTION_COLLAGE_IDS, getShowcase } from "@/lib/wallpapers/showcase";

const PATH = "/collections/premium-wallpaper-printing";

export const metadata: Metadata = {
  title: "Premium Wallpaper Printing | Premium Collection",
  description:
    "Custom-design wallpaper printing for homes, offices and shops — your design or photo, printed to size. Price shared on WhatsApp.",
  alternates: { canonical: PATH },
  openGraph: {
    type: "article",
    locale: "en_IN",
    url: PATH,
    siteName: "PrintShubh",
    title: "Premium Wallpaper Printing | PRINTSHUBH Premium Print & Visual Studio",
    description: "Custom-design wallpaper printing for homes, offices and shops — your design or photo, printed to size. Price shared on WhatsApp.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Premium Wallpaper Printing | PRINTSHUBH",
    description: "Custom-design wallpaper printing for homes, offices and shops — your design or photo, printed to size. Price shared on WhatsApp.",
  },
};

export default async function Page() {
  const collection = collectionBySlug("premium-wallpaper-printing")!;
  /* Real, PUBLISHED design previews only; with fewer than two the page falls back
   * to the original icon visual. */
  const designs = await getShowcase(COLLECTION_COLLAGE_IDS);
  return (
    <>
      <ServiceJsonLd
        path={PATH}
        serviceName="Premium Wallpaper Printing"
        serviceNameEn="Premium Wallpaper Printing"
        description="Custom-design wallpaper printing for homes, offices and shops — your design or photo, printed to size. Price shared on WhatsApp."
        breadcrumbLabel="Premium Wallpaper Printing"
      />
      <CollectionPageShell
        collection={collection}
        heroVisual={designs.length >= 2 ? <WallpaperCollage designs={designs} /> : undefined}
      />
    </>
  );
}
