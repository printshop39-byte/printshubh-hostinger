/**
 * Wallpaper catalogue — SEED DATA (Phase C).
 *
 * A small sample so the browsing experience can be built and reviewed. The
 * titles, categories, tags and one-line descriptions are DRAFT copy for the
 * owner to review. In Phase D this file is replaced by the database (admin
 * upload + publish workflow); nothing else in the app reads it directly.
 *
 * Categories are plain rows: add, rename, reorder or deactivate one here (or,
 * later, in admin) without touching any page.
 */
import type { DesignImage, WallpaperCategory, WallpaperDesign } from "./types";

/** Previews are written by scripts/wallpaper-previews.mjs as <id>-<width>.webp. */
const BASE = "/catalogue/wallpapers";
function preview(id: string): DesignImage {
  const key = id.toLowerCase();
  return {
    src400: `${BASE}/${key}-400.webp`,
    src900: `${BASE}/${key}-900.webp`,
    src1600: `${BASE}/${key}-1600.webp`,
    width: 1600,
    height: 900,
  };
}

export const CATEGORIES: WallpaperCategory[] = [
  {
    slug: "luxury-premium",
    name: "Luxury & Premium",
    description: "Rich, statement wallpapers with gold detailing and refined, high-end finishes.",
    sortOrder: 1,
    coverDesignId: "WP-001",
    active: true,
  },
  {
    slug: "floral-botanical",
    name: "Floral & Botanical",
    description: "Soft florals, leafy botanicals and garden-inspired murals for calm, natural rooms.",
    sortOrder: 2,
    coverDesignId: "WP-003",
    active: true,
  },
  {
    slug: "indian-traditional-art",
    name: "Indian Traditional Art",
    description: "Pichwai, Mithila and Mughal-inspired artwork, rich with peacocks, lotuses and gardens.",
    sortOrder: 3,
    coverDesignId: "WP-006",
    active: true,
  },
  {
    slug: "abstract-modern",
    name: "Abstract & Modern",
    description: "Contemporary compositions, geometry and soft abstract forms for modern interiors.",
    sortOrder: 4,
    coverDesignId: "WP-009",
    active: true,
  },
  {
    slug: "nature-landscapes",
    name: "Nature & Landscapes",
    description: "Mountains, forests and valleys, printed as wide scenic murals.",
    sortOrder: 5,
    coverDesignId: "WP-012",
    active: true,
  },
  {
    slug: "kids-nursery",
    name: "Kids & Nursery",
    description: "Gentle, playful scenes for children's rooms and nurseries.",
    sortOrder: 6,
    coverDesignId: "WP-015",
    active: true,
  },
  {
    slug: "marble-texture",
    name: "Marble & Texture",
    description: "Marble, plaster and sculpted-relief looks for quiet, tactile walls.",
    sortOrder: 7,
    coverDesignId: "WP-016",
    active: true,
  },
  {
    slug: "devotional-spiritual",
    name: "Devotional & Spiritual",
    description: "Peaceful devotional artwork for prayer rooms and calm spaces.",
    sortOrder: 8,
    coverDesignId: "WP-018",
    active: true,
  },
];

const D = (
  id: string,
  title: string,
  categorySlug: string,
  tags: string[],
  description: string,
  createdAt: string,
  featured = false,
): WallpaperDesign => ({
  id,
  title,
  categorySlug,
  tags,
  description,
  featured,
  status: "published",
  createdAt,
  image: preview(id),
});

export const DESIGNS: WallpaperDesign[] = [
  D("WP-001", "Golden Palm Royale", "luxury-premium", ["premium", "metallic", "botanical"], "Gold palm fronds on deep emerald green.", "2026-11-18", true),
  D("WP-002", "Ivory Lotus Luxe", "luxury-premium", ["premium", "floral", "minimal"], "Pale lotus blooms on a soft ivory ground.", "2026-11-17"),
  D("WP-003", "Botanical Whispers", "floral-botanical", ["floral", "botanical", "modern"], "Layered palms and ferns in muted sage.", "2026-11-16", true),
  D("WP-004", "Enchanted Blossom Garden", "floral-botanical", ["floral", "birds", "soft"], "Blossoming branches with small songbirds.", "2026-11-15"),
  D("WP-005", "Botanical Bird Poetry", "floral-botanical", ["floral", "birds", "traditional"], "Birds among slender, flowering branches.", "2026-11-14"),
  D("WP-006", "Mithila Tree of Life", "indian-traditional-art", ["traditional", "mithila", "premium"], "A Mithila-style tree of life with peacocks and fish.", "2026-11-13", true),
  D("WP-007", "Peacock Paradise Pichwai", "indian-traditional-art", ["traditional", "pichwai", "peacock"], "Pichwai peacocks beside a lotus pond.", "2026-11-12", true),
  D("WP-008", "Royal Mughal Botanical Garden", "indian-traditional-art", ["traditional", "mughal", "garden"], "A Mughal garden pavilion with formal flowerbeds.", "2026-11-11"),
  D("WP-009", "Abstract Living", "abstract-modern", ["modern", "abstract", "living-room"], "Earthy abstract shapes for a modern living room.", "2026-11-10"),
  D("WP-010", "Abstract Metallic Geometry", "abstract-modern", ["modern", "geometric", "metallic"], "Arched, layered forms in warm greige.", "2026-11-09"),
  D("WP-019", "Zen Cloud Symphony", "abstract-modern", ["modern", "abstract", "soft"], "Drifting cloud lines in quiet neutrals.", "2026-11-08"),
  /* WP-011 and WP-014: hidden (draft) until their rights and similarity checks are done. */
  { ...D("WP-011", "Misty Mountain Paradise", "nature-landscapes", ["landscape", "mountains", "mural"], "A misty mountain lake at sunrise.", "2026-11-07", true), status: "draft" },
  D("WP-012", "Golden Whispering Forest", "nature-landscapes", ["landscape", "forest", "mural"], "A sunlit woodland path between old oaks.", "2026-11-06"),
  D("WP-013", "The Silent Valley", "nature-landscapes", ["landscape", "valley", "modern"], "Rolling hills and a winding river.", "2026-11-05"),
  { ...D("WP-014", "Whimsical Kids World", "kids-nursery", ["kids", "nursery", "playful"], "Friendly animals under hot-air balloons.", "2026-11-04", true), status: "draft" },
  D("WP-015", "Safari Dreams", "kids-nursery", ["kids", "animals", "soft"], "A gentle safari of elephants, giraffes and lions.", "2026-11-03"),
  D("WP-016", "Contemporary Fluid Marble", "marble-texture", ["marble", "texture", "modern"], "Flowing marble veining in soft taupe.", "2026-11-02"),
  D("WP-017", "Sculpted Botanical Plaster", "marble-texture", ["texture", "plaster", "botanical"], "Sculpted leaf relief in pale plaster.", "2026-11-01"),
  D("WP-018", "Shrinathji Pichwai", "devotional-spiritual", ["devotional", "pichwai", "traditional"], "A devotional Pichwai with cows and lotuses.", "2026-10-31", true),
  /* Draft: not public anywhere — kept in the data to prove that drafts never
   * leak into any page, search result, sitemap or direct URL. */
  {
    id: "WP-020",
    title: "Indian Heritage Stories",
    categorySlug: "indian-traditional-art",
    tags: ["traditional"],
    description: "In progress.",
    featured: false,
    status: "draft",
    createdAt: "2026-11-19",
    image: null,
  },
];
