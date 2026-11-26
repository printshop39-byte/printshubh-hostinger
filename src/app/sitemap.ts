import type { MetadataRoute } from "next";
import { COLLECTIONS } from "@/lib/collections";
import { getCategories } from "@/lib/wallpapers/catalogue";

/**
 * Sitemap for printshubh.shop.
 *
 * Only routes that physically exist under src/app/<route>/page.tsx are
 * listed — no invented pages, no doorway placeholders. Add a new entry
 * here whenever you add a new top-level route so search engines can find
 * it.
 *
 * Priority guidance:
 *   - Homepage           1.0
 *   - Service pages      0.8 — primary conversion/landing surfaces for SEO
 *   - Support / FAQ      0.7 — common conversion-adjacent pages
 *   - Policy / legal     0.4 — needed for trust + Search Console signals
 *                              but not the entry point we're optimising for
 *
 * changeFrequency is a hint; Googlebot mostly ignores it but other
 * crawlers (Bing, Yandex) still respect it lightly.
 */
const SITE_URL = "https://www.printshubh.shop";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const entries: MetadataRoute.Sitemap = [
    /* Homepage */
    { url: `${SITE_URL}/`, lastModified, changeFrequency: "weekly", priority: 1.0 },

    /* Shop-counter service pages (printing / photo / digital). */
    { url: `${SITE_URL}/printing-xerox`,              lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/photo-services`,              lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/digital-services`,            lastModified, changeFrequency: "monthly", priority: 0.8 },

    /* The 7 Premium Print & Visual Studio collections (owner rebrand) —
     * generated from lib/collections.ts so a new/renamed collection can't
     * be added to the site without also landing here. */
    ...COLLECTIONS.map((c) => ({
      url: `${SITE_URL}/collections/${c.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),

    /* Legacy land-document, map-finder, property-calculator and land-pricing
     * URLs are deliberately NOT listed any more (Phase 1 rebrand cleanup).
     * The pages still exist for now and are retired separately; they are no
     * longer promoted to search engines from here. */

    /* Trust / support pages */
    { url: `${SITE_URL}/about`,      lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/contact`,    lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/faq`,        lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/support`,    lastModified, changeFrequency: "monthly", priority: 0.7 },

    /* Legal / policy pages */
    { url: `${SITE_URL}/privacy`,    lastModified, changeFrequency: "yearly",  priority: 0.4 },
    { url: `${SITE_URL}/terms`,      lastModified, changeFrequency: "yearly",  priority: 0.4 },
    { url: `${SITE_URL}/disclaimer`, lastModified, changeFrequency: "yearly",  priority: 0.4 },
    { url: `${SITE_URL}/refund`,     lastModified, changeFrequency: "yearly",  priority: 0.4 },
    { url: `${SITE_URL}/wallpaper-terms`, lastModified, changeFrequency: "yearly", priority: 0.4 },
  ];

  /* Wallpaper design catalogue: the landing page and one page per active
   * category. Individual design pages are noindex, so they are NOT listed. */
  const wallpaperCategories = await getCategories();
  return [
    ...entries,
    { url: `${SITE_URL}/wallpapers`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    ...wallpaperCategories.map((c) => ({
      url: `${SITE_URL}/wallpapers/${c.slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
