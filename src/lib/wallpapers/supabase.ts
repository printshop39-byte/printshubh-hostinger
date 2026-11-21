import "server-only";

/**
 * Minimal Supabase REST + Storage client for the wallpaper catalogue.
 *
 * Same approach as src/lib/inquiries.ts: plain fetch, no extra dependency, and
 * the SERVICE-ROLE key — which never leaves the server. Nothing in this file
 * (or anything that imports it) can be bundled into the browser: it is marked
 * `server-only`. Row-level security on the tables has no policies, so without
 * this key the data cannot be read or written at all.
 *
 * Required env (the same two the inquiries feature already uses):
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

export const PREVIEW_BUCKET = "wallpaper-previews";
export const CATALOGUE_TAG = "wallpapers";

const baseUrl = () => (process.env.SUPABASE_URL ?? "").trim().replace(/\/$/, "");
const serviceKey = () => (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim();

export function wallpaperDbConfigured(): boolean {
  return Boolean(baseUrl() && serviceKey());
}

const authHeaders = (extra: Record<string, string> = {}): Record<string, string> => ({
  apikey: serviceKey(),
  Authorization: `Bearer ${serviceKey()}`,
  ...extra,
});

export interface RestResult<T> {
  ok: boolean;
  status: number;
  data: T | null;
}

/**
 * Call PostgREST.
 *  - `cached: true`  -> public catalogue reads: cached for 60 s and tagged, so an
 *                       admin change (which expires the tag) shows up immediately.
 *  - `cached: false` -> everything else is never cached.
 */
export async function rest<T>(
  path: string,
  opts: { method?: string; body?: unknown; prefer?: string; cached?: boolean } = {},
): Promise<RestResult<T>> {
  if (!wallpaperDbConfigured()) return { ok: false, status: 0, data: null };
  try {
    const res = await fetch(`${baseUrl()}/rest/v1/${path}`, {
      method: opts.method ?? "GET",
      headers: authHeaders({
        "Content-Type": "application/json",
        ...(opts.prefer ? { Prefer: opts.prefer } : {}),
      }),
      body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
      ...(opts.cached
        ? { next: { revalidate: 60, tags: [CATALOGUE_TAG] } }
        : { cache: "no-store" as const }),
    });
    let data: T | null = null;
    try {
      data = (await res.json()) as T;
    } catch {
      /* empty body (e.g. 204) */
    }
    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: 0, data: null };
  }
}

/** Public CDN URL of an object in the preview bucket. */
export function publicPreviewUrl(objectKey: string): string {
  return `${baseUrl()}/storage/v1/object/public/${PREVIEW_BUCKET}/${objectKey}`;
}

/** Upload one preview. Never overwrites silently: callers use unique keys. */
export async function uploadPreview(objectKey: string, bytes: Uint8Array): Promise<boolean> {
  if (!wallpaperDbConfigured()) return false;
  try {
    const res = await fetch(`${baseUrl()}/storage/v1/object/${PREVIEW_BUCKET}/${objectKey}`, {
      method: "POST",
      headers: authHeaders({ "Content-Type": "image/webp", "Cache-Control": "max-age=31536000" }),
      body: bytes as unknown as BodyInit,
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Delete preview objects (best effort; returns false if the call failed). */
export async function deletePreviews(objectKeys: string[]): Promise<boolean> {
  if (!wallpaperDbConfigured() || objectKeys.length === 0) return true;
  try {
    const res = await fetch(`${baseUrl()}/storage/v1/object/${PREVIEW_BUCKET}`, {
      method: "DELETE",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ prefixes: objectKeys }),
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}
