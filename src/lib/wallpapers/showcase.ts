/**
 * Wallpaper showcase — which published designs the homepage and the Wallpaper
 * Printing page show off.
 *
 * Read-only: this module only calls getDesign() from catalogue.ts, which already
 * returns PUBLISHED designs in ACTIVE categories and nothing else. A draft, an
 * unpublished or a missing design therefore simply drops out of a showcase; it
 * can never appear here.
 *
 * Only designs whose provenance the owner has declared (owner-created,
 * AI-assisted originals, 2026-11-24) may be listed. getShowcase() refuses any
 * other ID, so a typo or a later edit cannot quietly put an unreviewed design on
 * the homepage. To change a slot, edit the lists below (and ALLOWED, once that
 * design's rights have been confirmed).
 *
 * WP-011 and WP-014: rights review done 2026-11-26 (Google Lens: no exact or
 * near-identical match; no known character resemblance). Reference-image use is
 * unknown, so no "exclusive" / "original" claims, and no real place name for WP-011.
 */
import { getDesign } from "@/lib/wallpapers/catalogue";
import type { PublicDesign } from "@/lib/wallpapers/types";

const ALLOWED: ReadonlySet<string> = new Set([
  "WP-001",
  "WP-003",
  "WP-006",
  "WP-007",
  "WP-011",
  "WP-014",
  "WP-018",
]);

/** Homepage hero collage: one wide tile and two smaller ones. */
export const HERO_COLLAGE_IDS = ["WP-001", "WP-006", "WP-007"] as const;

/** Wallpaper Printing page: a 2 x 2 collage. */
export const COLLECTION_COLLAGE_IDS = ["WP-001", "WP-003", "WP-006", "WP-007"] as const;

/** Homepage "featured designs" strip (shown in full, never cropped). */
export const FEATURED_STRIP_IDS = ["WP-003", "WP-011", "WP-014", "WP-018"] as const;

/**
 * Wording for traditional styles: these designs are INSPIRED by a folk or temple
 * art tradition. Never describe them as authentic, handmade or by traditional
 * artists.
 */
export const STYLE_NOTE: Readonly<Record<string, string>> = {
  "WP-006": "Madhubani-inspired",
  "WP-007": "Pichwai-inspired",
  "WP-018": "Pichwai-inspired",
};

export function showcaseAlt(design: Pick<PublicDesign, "id" | "title">): string {
  const note = STYLE_NOTE[design.id];
  return `${design.title}${note ? ` (${note})` : ""} — wallpaper design ${design.id}`;
}

/** The requested designs, in the requested order, that exist and are public. */
export async function getShowcase(ids: readonly string[]): Promise<PublicDesign[]> {
  const found = await Promise.all(ids.filter((id) => ALLOWED.has(id)).map((id) => getDesign(id)));
  return found.filter((d): d is PublicDesign => Boolean(d));
}
