/**
 * Input validation for the wallpaper admin. Pure functions (no I/O) so the same
 * rules guard every entry point: the upload route, the edit actions and the
 * category actions. Never trust the browser — the server re-checks everything.
 */

export const DESIGN_ID_RE = /^WP-\d{3,6}$/;
export const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
/** Preview sizes the catalogue serves, in pixels of width. */
export const PREVIEW_WIDTHS = [400, 900, 1600] as const;
/** Hard cap per preview file (the bucket enforces the same 1 MB). */
export const MAX_PREVIEW_BYTES = 1_000_000;

export interface Checked<T> {
  ok: boolean;
  value?: T;
  error?: string;
}

const clean = (s: unknown, max: number) =>
  String(s ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);

/** "Floral, Premium  ,floral" -> ["floral", "premium"] (max 12, 30 chars each). */
export function normalizeTags(input: unknown): string[] {
  const raw = Array.isArray(input) ? input : String(input ?? "").split(/[,\n]/);
  const out: string[] = [];
  for (const t of raw) {
    const tag = clean(t, 30)
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    if (tag && !out.includes(tag)) out.push(tag);
    if (out.length >= 12) break;
  }
  return out;
}

export function normalizeId(input: unknown): string {
  return String(input ?? "").trim().toUpperCase();
}

export interface DesignFields {
  id: string;
  title: string;
  categorySlug: string;
  tags: string[];
  description: string;
  featured: boolean;
  status: "draft" | "published";
}

/** Validates the editable fields of a design (not the image). */
export function checkDesignFields(
  raw: Record<string, unknown>,
  opts: { requireId: boolean },
): Checked<Omit<DesignFields, "id"> & { id: string }> {
  const id = normalizeId(raw.id);
  if (opts.requireId && !DESIGN_ID_RE.test(id)) return { ok: false, error: "Design ID must look like WP-001." };
  if (!opts.requireId && id && !DESIGN_ID_RE.test(id)) return { ok: false, error: "Design ID must look like WP-001." };

  const title = clean(raw.title, 120);
  if (!title) return { ok: false, error: "A title is required." };

  const categorySlug = String(raw.categorySlug ?? "").trim();
  if (!SLUG_RE.test(categorySlug)) return { ok: false, error: "Choose a category." };

  const description = clean(raw.description, 600);
  const status = raw.status === "published" ? "published" : "draft";
  const featured = raw.featured === true || raw.featured === "on" || raw.featured === "true";
  return {
    ok: true,
    value: { id, title, categorySlug, tags: normalizeTags(raw.tags), description, featured, status },
  };
}

export interface CategoryFields {
  slug: string;
  name: string;
  description: string;
  sortOrder: number;
  coverDesignId: string | null;
  active: boolean;
}

export function slugify(name: string): string {
  return clean(name, 80)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function checkCategoryFields(raw: Record<string, unknown>): Checked<CategoryFields> {
  const name = clean(raw.name, 80);
  if (!name) return { ok: false, error: "A category name is required." };
  const slug = String(raw.slug ?? "").trim() || slugify(name);
  if (!SLUG_RE.test(slug) || slug.length > 60) return { ok: false, error: "The URL slug may use lowercase letters, numbers and hyphens only." };
  const sort = Number(raw.sortOrder);
  const sortOrder = Number.isFinite(sort) ? Math.min(Math.max(Math.round(sort), 0), 10_000) : 100;
  const cover = normalizeId(raw.coverDesignId);
  if (cover && !DESIGN_ID_RE.test(cover)) return { ok: false, error: "Cover design ID must look like WP-001 (or be empty)." };
  const active = raw.active === true || raw.active === "on" || raw.active === "true";
  return {
    ok: true,
    value: { slug, name, description: clean(raw.description, 400), sortOrder, coverDesignId: cover || null, active },
  };
}

/** A real WebP file starts with "RIFF" <size> "WEBP". Rejects renamed images/scripts. */
export function isWebp(bytes: Uint8Array): boolean {
  if (bytes.length < 12) return false;
  const s = (from: number, to: number) => String.fromCharCode(...bytes.slice(from, to));
  return s(0, 4) === "RIFF" && s(8, 12) === "WEBP";
}

export function checkDimensions(width: unknown, height: unknown): Checked<{ width: number; height: number }> {
  const w = Math.round(Number(width));
  const h = Math.round(Number(height));
  if (!(w >= 100 && w <= 6000 && h >= 100 && h <= 6000)) return { ok: false, error: "Image size is out of range." };
  return { ok: true, value: { width: w, height: h } };
}
