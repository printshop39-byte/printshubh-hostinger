/**
 * Wallpaper catalogue — shared types.
 *
 * The catalogue is read through the async functions in ./catalogue.ts, never
 * from the raw data directly, so the data source can move from the seed file
 * (Phase C) to the database + storage (Phase D) without any page changing.
 */

/** One responsive preview of a design. Only previews are ever published —
 * the full-resolution production masters are never part of the website. */
export interface DesignImage {
  /** Preview URLs, smallest to largest. */
  src400: string;
  src900: string;
  src1600: string;
  /** Pixel size of the LARGEST preview (src1600); used for width/height so
   * the layout does not jump while images load. */
  width: number;
  height: number;
}

export type DesignStatus = "published" | "draft";

export interface WallpaperCategory {
  /** URL segment: /wallpapers/<slug> */
  slug: string;
  name: string;
  /** One or two sentences; shown on the category page and its cards. */
  description: string;
  /** Lower comes first. */
  sortOrder: number;
  /** Design ID whose preview doubles as the category cover. */
  coverDesignId: string;
  /** Inactive categories are hidden from every public page. */
  active: boolean;
}

export interface WallpaperDesign {
  /** Unique, human-quotable ID, e.g. "WP-001". */
  id: string;
  title: string;
  categorySlug: string;
  /** Lowercase slugs, e.g. "floral", "traditional". */
  tags: string[];
  /** Optional short style description. */
  description?: string;
  featured: boolean;
  status: DesignStatus;
  /** ISO date; drives "new arrivals". */
  createdAt: string;
  /** A draft may not have a preview yet. */
  image: DesignImage | null;
}

/** A design that is published AND has a preview — the only kind pages show. */
export type PublicDesign = WallpaperDesign & { image: DesignImage; status: "published" };

export interface DesignQuery {
  categorySlug?: string;
  /** Free-text search over ID, title, tags, category and description. */
  q?: string;
  tag?: string;
  featuredOnly?: boolean;
  /** 1-based. */
  page?: number;
  pageSize?: number;
}

export interface DesignPage {
  designs: PublicDesign[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
