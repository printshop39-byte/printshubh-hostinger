import "server-only";

/**
 * Wallpaper catalogue — database access (server only).
 *
 * Two audiences, kept apart on purpose:
 *   - PUBLIC reads (loadPublicFromDb): published designs + active categories
 *     only, cached for 60 s and refreshed instantly when an admin saves.
 *   - ADMIN reads/writes: every status, never cached, and only ever called from
 *     code that has already checked the admin session.
 */
import {
  PREVIEW_BUCKET,
  deletePreviews,
  publicPreviewUrl,
  rest,
  uploadPreview,
} from "./supabase";
import { PREVIEW_WIDTHS } from "./validation";
import type { DesignImage, WallpaperCategory, WallpaperDesign } from "./types";

const DESIGNS = "printshubh_wallpaper_designs";
const CATEGORIES = "printshubh_wallpaper_categories";

export interface DesignRow {
  id: string;
  title: string;
  category_slug: string;
  tags: string[];
  description: string;
  featured: boolean;
  status: "draft" | "published";
  preview_base: string;
  width: number;
  height: number;
  created_at: string;
}

export interface CategoryRow {
  slug: string;
  name: string;
  description: string;
  sort_order: number;
  cover_design_id: string | null;
  active: boolean;
}

/* ── Row <-> domain ──────────────────────────────────────────────────────── */

const STORAGE_PREFIX = "storage:";

/** Object keys (inside the bucket) behind a storage-backed preview. */
export function storageKeysFor(previewBase: string): string[] {
  if (!previewBase.startsWith(STORAGE_PREFIX)) return [];
  const key = previewBase.slice(STORAGE_PREFIX.length);
  return PREVIEW_WIDTHS.map((w) => `${key}-${w}.webp`);
}

export function resolveImage(previewBase: string, width: number, height: number): DesignImage {
  const src = (w: number) =>
    previewBase.startsWith(STORAGE_PREFIX)
      ? publicPreviewUrl(`${previewBase.slice(STORAGE_PREFIX.length)}-${w}.webp`)
      : `${previewBase}-${w}.webp`;
  return { src400: src(400), src900: src(900), src1600: src(1600), width, height };
}

export function rowToDesign(r: DesignRow): WallpaperDesign {
  return {
    id: r.id,
    title: r.title,
    categorySlug: r.category_slug,
    tags: Array.isArray(r.tags) ? r.tags : [],
    description: r.description || undefined,
    featured: Boolean(r.featured),
    status: r.status === "published" ? "published" : "draft",
    createdAt: r.created_at,
    image: r.preview_base ? resolveImage(r.preview_base, r.width, r.height) : null,
  };
}

export function rowToCategory(r: CategoryRow): WallpaperCategory {
  return {
    slug: r.slug,
    name: r.name,
    description: r.description ?? "",
    sortOrder: r.sort_order,
    coverDesignId: r.cover_design_id ?? "",
    active: Boolean(r.active),
  };
}

/* ── Paged fetch (PostgREST returns at most ~1000 rows per call) ─────────── */

async function restAll<T>(path: string, cached: boolean): Promise<T[] | null> {
  const PAGE = 1000;
  const all: T[] = [];
  for (let offset = 0; offset < 100_000; offset += PAGE) {
    const res = await rest<T[]>(`${path}&limit=${PAGE}&offset=${offset}`, { cached });
    if (!res.ok || !Array.isArray(res.data)) return null;
    all.push(...res.data);
    if (res.data.length < PAGE) break;
  }
  return all;
}

/* ── Public read ─────────────────────────────────────────────────────────── */

/** Published designs + active categories, or null when the database cannot be
 * used (not configured, unreachable, or the tables do not exist yet). */
export async function loadPublicFromDb(): Promise<{
  categories: WallpaperCategory[];
  designs: WallpaperDesign[];
} | null> {
  const [cats, designs] = await Promise.all([
    restAll<CategoryRow>(`${CATEGORIES}?select=*&active=eq.true&order=sort_order.asc`, true),
    restAll<DesignRow>(`${DESIGNS}?select=*&status=eq.published&order=created_at.desc`, true),
  ]);
  if (!cats || !designs) return null;
  return { categories: cats.map(rowToCategory), designs: designs.map(rowToDesign) };
}

/* ── Admin reads ─────────────────────────────────────────────────────────── */

export async function adminLoad(): Promise<{
  ok: boolean;
  categories: WallpaperCategory[];
  designs: WallpaperDesign[];
}> {
  const [cats, designs] = await Promise.all([
    restAll<CategoryRow>(`${CATEGORIES}?select=*&order=sort_order.asc`, false),
    restAll<DesignRow>(`${DESIGNS}?select=*&order=created_at.desc`, false),
  ]);
  if (!cats || !designs) return { ok: false, categories: [], designs: [] };
  return { ok: true, categories: cats.map(rowToCategory), designs: designs.map(rowToDesign) };
}

export async function adminGetDesign(id: string): Promise<{ design: WallpaperDesign; previewBase: string } | null> {
  const res = await rest<DesignRow[]>(`${DESIGNS}?select=*&id=eq.${encodeURIComponent(id)}&limit=1`);
  const row = res.ok && Array.isArray(res.data) ? res.data[0] : undefined;
  return row ? { design: rowToDesign(row), previewBase: row.preview_base } : null;
}

/** Next free Design ID: WP-<max + 1>, at least three digits. */
export async function nextDesignId(): Promise<string> {
  const res = await restAll<{ id: string }>(`${DESIGNS}?select=id`, false);
  const max = (res ?? []).reduce((m, r) => Math.max(m, Number(r.id.slice(3)) || 0), 0);
  return `WP-${String(max + 1).padStart(3, "0")}`;
}

/* ── Admin writes ────────────────────────────────────────────────────────── */

export type WriteResult = { ok: boolean; status: number; notFound?: boolean };

export async function insertDesign(row: Omit<DesignRow, "created_at">): Promise<WriteResult> {
  const res = await rest<DesignRow[]>(DESIGNS, { method: "POST", body: row, prefer: "return=representation" });
  return { ok: res.ok, status: res.status };
}

export async function patchDesign(id: string, patch: Partial<Omit<DesignRow, "id" | "created_at">>): Promise<WriteResult> {
  const res = await rest<DesignRow[]>(`${DESIGNS}?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: patch,
    prefer: "return=representation",
  });
  const empty = res.ok && Array.isArray(res.data) && res.data.length === 0;
  return { ok: res.ok && !empty, status: res.status, notFound: empty };
}

/** Delete a design: the database row first, then (best effort) its stored previews. */
export async function removeDesign(id: string): Promise<WriteResult> {
  const found = await adminGetDesign(id);
  if (!found) return { ok: false, status: 404, notFound: true };
  const res = await rest<DesignRow[]>(`${DESIGNS}?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    prefer: "return=representation",
  });
  if (!res.ok) return { ok: false, status: res.status };
  await deletePreviews(storageKeysFor(found.previewBase));
  return { ok: true, status: res.status };
}

/** Insert-or-update a category by slug. */
export async function saveCategory(c: {
  slug: string;
  name: string;
  description: string;
  sortOrder: number;
  coverDesignId: string | null;
  active: boolean;
}): Promise<WriteResult> {
  const res = await rest<CategoryRow[]>(`${CATEGORIES}?on_conflict=slug`, {
    method: "POST",
    prefer: "resolution=merge-duplicates,return=representation",
    body: {
      slug: c.slug,
      name: c.name,
      description: c.description,
      sort_order: c.sortOrder,
      cover_design_id: c.coverDesignId,
      active: c.active,
    },
  });
  return { ok: res.ok, status: res.status };
}

export async function categoryExists(slug: string): Promise<boolean> {
  const res = await rest<{ slug: string }[]>(`${CATEGORIES}?select=slug&slug=eq.${encodeURIComponent(slug)}&limit=1`);
  return res.ok && Array.isArray(res.data) && res.data.length > 0;
}

export async function countDesignsIn(slug: string): Promise<number> {
  const res = await rest<{ id: string }[]>(`${DESIGNS}?select=id&category_slug=eq.${encodeURIComponent(slug)}`);
  return res.ok && Array.isArray(res.data) ? res.data.length : 0;
}

export async function removeCategory(slug: string): Promise<WriteResult> {
  if ((await countDesignsIn(slug)) > 0) return { ok: false, status: 409 };
  const res = await rest<CategoryRow[]>(`${CATEGORIES}?slug=eq.${encodeURIComponent(slug)}`, {
    method: "DELETE",
    prefer: "return=representation",
  });
  return { ok: res.ok, status: res.status };
}

/* ── Preview storage ─────────────────────────────────────────────────────── */

export { PREVIEW_BUCKET, uploadPreview, deletePreviews };
