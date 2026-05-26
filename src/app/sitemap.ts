import type { MetadataRoute } from "next";

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
 *   - Primary policy /   0.6 — needed for trust + Search Console signals
 *     legal pages          but not the entry point we're optimising for
 *   - Support / FAQ      0.7 — common conversion-adjacent pages
 *
 * changeFrequency is a hint; Googlebot mostly ignores it but other
 * crawlers (Bing, Yandex) still respect it lightly.
 */
const SITE_URL = "https://www.printshubh.shop";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: `${SITE_URL}/`,           lastModified, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${SITE_URL}/about`,      lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/contact`,    lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/faq`,        lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/support`,    lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/privacy`,    lastModified, changeFrequency: "yearly",  priority: 0.4 },
    { url: `${SITE_URL}/terms`,      lastModified, changeFrequency: "yearly",  priority: 0.4 },
    { url: `${SITE_URL}/disclaimer`, lastModified, changeFrequency: "yearly",  priority: 0.4 },
    { url: `${SITE_URL}/refund`,     lastModified, changeFrequency: "yearly",  priority: 0.4 },
  ];
}
