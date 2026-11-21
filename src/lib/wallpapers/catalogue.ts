/**
 * Wallpaper catalogue — the ONLY module pages use to read the catalogue.
 *
 * Source: the Supabase database when it is configured and reachable (Phase D),
 * otherwise the built-in sample in ./data.ts — so the public site never goes
 * blank if the database is not set up yet or is briefly unavailable.
 *
 * Privacy rule: drafts, inactive categories and designs without a preview are
 * filtered out HERE, once, so no page can leak them by forgetting a check.
 */
import { cache } from "react";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { CATEGORIES, DESIGNS } from "./data";
import { loadPublicFromDb } from "./store";
import { wallpaperDbConfigured } from "./supabase";
import type {
  DesignPage,
  DesignQuery,
  PublicDesign,
  WallpaperCategory,
  WallpaperDesign,
} from "./types";

export const SITE_URL = "https://www.printshubh.shop";
export const DEFAULT_PAGE_SIZE = 24;

const isPublic = (d: WallpaperDesign): d is PublicDesign =>
  d.status === "published" && d.image !== null;

/** One read per request (React cache), from the database or the sample. */
const load = cache(async (): Promise<{ categories: WallpaperCategory[]; designs: WallpaperDesign[] }> => {
  if (wallpaperDbConfigured()) {
    const live = await loadPublicFromDb();
    if (live) return live;
  }
  return { categories: CATEGORIES, designs: DESIGNS };
});

/** Active categories, in display order. */
export async function getCategories(): Promise<WallpaperCategory[]> {
  return (await load()).categories.filter((c) => c.active).sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getCategory(slug: string): Promise<WallpaperCategory | undefined> {
  return (await getCategories()).find((c) => c.slug === slug);
}

/** Published designs only, newest first, filtered and paged. */
export async function getDesigns(query: DesignQuery = {}): Promise<DesignPage> {
  const cats = await getCategories();
  const activeSlugs = new Set(cats.map((c) => c.slug));
  const nameBySlug = new Map(cats.map((c) => [c.slug, c.name]));

  const tokens = (query.q ?? "")
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);
  const tag = query.tag?.toLowerCase();

  const matches = (await load()).designs.filter(isPublic)
    .filter((d) => activeSlugs.has(d.categorySlug))
    .filter((d) => !query.categorySlug || d.categorySlug === query.categorySlug)
    .filter((d) => !query.featuredOnly || d.featured)
    .filter((d) => !tag || d.tags.includes(tag))
    .filter((d) => {
      if (tokens.length === 0) return true;
      const haystack = [d.id, d.title, d.description ?? "", nameBySlug.get(d.categorySlug) ?? "", ...d.tags]
        .join(" ")
        .toLowerCase();
      return tokens.every((t) => haystack.includes(t));
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id));

  const pageSize = Math.max(1, query.pageSize ?? DEFAULT_PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(matches.length / pageSize));
  const page = Math.min(Math.max(1, Math.floor(query.page ?? 1)), totalPages);
  return {
    designs: matches.slice((page - 1) * pageSize, page * pageSize),
    total: matches.length,
    page,
    pageSize,
    totalPages,
  };
}

/** Design IDs are case-insensitive in URLs ("wp-001" or "WP-001"). */
export async function getDesign(id: string): Promise<PublicDesign | undefined> {
  const wanted = id.trim().toLowerCase();
  const found = (await load()).designs.filter(isPublic).find((d) => d.id.toLowerCase() === wanted);
  if (!found) return undefined;
  // A design in an inactive category is not public either.
  return (await getCategory(found.categorySlug)) ? found : undefined;
}

export async function getFeaturedDesigns(limit = 6): Promise<PublicDesign[]> {
  return (await getDesigns({ featuredOnly: true, pageSize: limit })).designs;
}

export async function getNewArrivals(limit = 6): Promise<PublicDesign[]> {
  return (await getDesigns({ pageSize: limit })).designs;
}

export async function getRelatedDesigns(design: PublicDesign, limit = 4): Promise<PublicDesign[]> {
  const same = (await getDesigns({ categorySlug: design.categorySlug, pageSize: limit + 1 })).designs;
  return same.filter((d) => d.id !== design.id).slice(0, limit);
}

/** Cover preview + design count for a category card. */
export async function getCategoryCards(): Promise<
  Array<{ category: WallpaperCategory; cover: PublicDesign | undefined; count: number }>
> {
  const cats = await getCategories();
  return Promise.all(
    cats.map(async (category) => {
      const { total } = await getDesigns({ categorySlug: category.slug, pageSize: 1 });
      const cover =
        (await getDesign(category.coverDesignId)) ??
        (await getDesigns({ categorySlug: category.slug, pageSize: 1 })).designs[0];
      return { category, cover, count: total };
    }),
  );
}

/** Tags that exist on published designs, most used first (for filter chips). */
export async function getPopularTags(limit = 8): Promise<string[]> {
  const counts = new Map<string, number>();
  for (const d of (await load()).designs.filter(isPublic)) {
    for (const t of d.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([t]) => t);
}

/* ── URLs ────────────────────────────────────────────────────────────────── */

export const catalogueUrl = () => "/wallpapers";
export const categoryUrl = (slug: string) => `/wallpapers/${slug}`;
export const designUrl = (categorySlug: string, id: string) =>
  `/wallpapers/${categorySlug}/${id.toLowerCase()}`;

/* ── WhatsApp enquiry ────────────────────────────────────────────────────── */

/** The enquiry message for one specific design: name, ID, category and a link
 * back to the design so the studio sees exactly what the customer saw. */
export function buildDesignEnquiryMessage(design: PublicDesign, category: WallpaperCategory): string {
  return [
    `Hello PRINTSHUBH, I am interested in Wallpaper Design ${design.id} (${design.title}) from the ${category.name} category. Please share pricing, material options and printing details.`,
    "",
    `Design link: ${SITE_URL}${designUrl(design.categorySlug, design.id)}`,
  ].join("\n");
}

/** WhatsApp link for a design; uses the project's single business number. */
export function buildDesignEnquiryUrl(design: PublicDesign, category: WallpaperCategory): string {
  return buildWhatsAppUrl({
    message: buildDesignEnquiryMessage(design, category),
    campaign: "wallpaper-catalogue",
    content: design.id.toLowerCase(),
  });
}
