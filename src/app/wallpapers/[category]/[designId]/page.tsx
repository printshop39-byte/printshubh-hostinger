import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { CatalogueFrame } from "@/components/wallpapers/catalogue-frame";
import { DesignDetail } from "@/components/wallpapers/design-detail";
import {
  buildDesignEnquiryUrl,
  designUrl,
  getCategories,
  getCategory,
  getDesign,
  getRelatedDesigns,
} from "@/lib/wallpapers/catalogue";

type Params = Promise<{ category: string; designId: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { designId } = await params;
  const design = await getDesign(designId);
  const category = design ? await getCategory(design.categorySlug) : undefined;
  if (!design || !category) return { title: "Wallpaper design not found", robots: { index: false, follow: false } };

  const path = designUrl(design.categorySlug, design.id);
  const title = `${design.title} — Wallpaper Design ${design.id}`;
  const description = `${design.title} (${design.id}), a wallpaper design from the ${category.name} collection by PRINTSHUBH. Enquire about pricing, material options and printing on WhatsApp.`;
  return {
    title,
    description,
    alternates: { canonical: path },
    // Individual design pages start as noindex,follow: they become indexable
    // once each design carries real descriptive content (see Phase A, D5).
    robots: { index: false, follow: true },
    openGraph: {
      type: "website",
      url: path,
      siteName: "PRINTSHUBH",
      title: `${title} | PRINTSHUBH`,
      description,
      images: [{ url: design.image.src1600, width: design.image.width, height: design.image.height, alt: design.title }],
    },
    twitter: { card: "summary_large_image", title: `${title} | PRINTSHUBH`, description },
  };
}

export default async function WallpaperDesignPage({ params }: { params: Params }) {
  const { category: slug, designId } = await params;
  const design = await getDesign(designId);
  if (!design) notFound(); // unknown, draft, or no preview yet

  // One canonical URL per design: /wallpapers/<its category>/<id in lower case>.
  const canonical = designUrl(design.categorySlug, design.id);
  if (slug !== design.categorySlug || designId !== design.id.toLowerCase()) permanentRedirect(canonical);

  const category = await getCategory(design.categorySlug);
  if (!category) notFound();
  const [categories, related] = await Promise.all([getCategories(), getRelatedDesigns(design, 4)]);
  const enquiryUrl = buildDesignEnquiryUrl(design, category);

  return (
    <CatalogueFrame hideButtonNear={["#design-enquiry", "footer"]}>
      <DesignDetail
        design={design}
        category={category}
        categories={categories}
        related={related}
        enquiryUrl={enquiryUrl}
      />
    </CatalogueFrame>
  );
}
