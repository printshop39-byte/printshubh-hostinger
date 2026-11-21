/**
 * POST /admin/wallpapers/upload — create a design, or replace a design's image.
 *
 * The browser sends three small WebP previews (400 / 900 / 1600 px wide) that it
 * resized itself, plus the design's details. The original artwork never reaches
 * the server. Lives under /admin so the admin secret gate (src/proxy.ts) also
 * covers it.
 *
 * Defences, in order:
 *   1. admin session (Supabase Auth)            -> 401
 *   2. same-origin request (Origin = Host)      -> 403  (cookie-auth CSRF guard)
 *   3. total body size                           -> 413
 *   4. field validation                          -> 400
 *   5. each file: size cap + real WebP signature -> 400
 * New designs are ALWAYS created as drafts; publishing is a separate, explicit
 * step in the admin. A failed insert removes any previews already uploaded.
 */
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { isAuthed } from "@/app/admin/land-reports/auth";
import { CATALOGUE_TAG, wallpaperDbConfigured } from "@/lib/wallpapers/supabase";
import {
  adminGetDesign,
  categoryExists,
  deletePreviews,
  insertDesign,
  nextDesignId,
  patchDesign,
  storageKeysFor,
  uploadPreview,
} from "@/lib/wallpapers/store";
import {
  MAX_PREVIEW_BYTES,
  PREVIEW_WIDTHS,
  checkDesignFields,
  checkDimensions,
  isWebp,
  normalizeId,
} from "@/lib/wallpapers/validation";

const MAX_BODY_BYTES = 4_000_000; // stays under the host's 4.5 MB request limit

const json = (body: Record<string, unknown>, status: number) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function randomKey(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function POST(req: Request) {
  if (!(await isAuthed())) return json({ ok: false, error: "Not signed in." }, 401);
  if (!sameOrigin(req)) return json({ ok: false, error: "Blocked: cross-site request." }, 403);
  if (!wallpaperDbConfigured()) return json({ ok: false, error: "Database is not configured." }, 503);

  const declared = Number(req.headers.get("content-length") ?? "0");
  if (declared > MAX_BODY_BYTES) return json({ ok: false, error: "Upload is too large." }, 413);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return json({ ok: false, error: "Could not read the upload." }, 400);
  }

  // ── The three previews ────────────────────────────────────────────────────
  const files: Record<number, Uint8Array> = {};
  let total = 0;
  for (const w of PREVIEW_WIDTHS) {
    const f = form.get(`w${w}`);
    if (!(f instanceof Blob)) return json({ ok: false, error: `Missing the ${w}px preview.` }, 400);
    if (f.size === 0 || f.size > MAX_PREVIEW_BYTES) return json({ ok: false, error: `The ${w}px preview is too large (max 1 MB).` }, 400);
    const bytes = new Uint8Array(await f.arrayBuffer());
    if (!isWebp(bytes)) return json({ ok: false, error: `The ${w}px preview is not a WebP image.` }, 400);
    files[w] = bytes;
    total += bytes.length;
  }
  if (total > MAX_BODY_BYTES) return json({ ok: false, error: "Upload is too large." }, 413);

  const dims = checkDimensions(form.get("width"), form.get("height"));
  if (!dims.ok || !dims.value) return json({ ok: false, error: dims.error }, 400);

  const uploadSet = async (id: string) => {
    const key = `${id.toLowerCase()}-${randomKey()}`;
    const results = await Promise.all(PREVIEW_WIDTHS.map((w) => uploadPreview(`${key}-${w}.webp`, files[w])));
    const base = `storage:${key}`;
    if (results.some((ok) => !ok)) {
      await deletePreviews(storageKeysFor(base));
      return null;
    }
    return base;
  };

  // ── Replace the image of an existing design ──────────────────────────────
  const replaceId = normalizeId(form.get("replaceId"));
  if (replaceId) {
    const existing = await adminGetDesign(replaceId);
    if (!existing) return json({ ok: false, error: "That design does not exist." }, 404);
    const base = await uploadSet(replaceId);
    if (!base) return json({ ok: false, error: "Storage rejected the upload." }, 502);
    const res = await patchDesign(replaceId, { preview_base: base, width: dims.value.width, height: dims.value.height });
    if (!res.ok) {
      await deletePreviews(storageKeysFor(base));
      return json({ ok: false, error: "Could not save the new image." }, 502);
    }
    await deletePreviews(storageKeysFor(existing.previewBase)); // old previews, best effort
    revalidateTag(CATALOGUE_TAG, "max");
    return json({ ok: true, id: replaceId }, 200);
  }

  // ── Create a new design (always a draft) ─────────────────────────────────
  const checked = checkDesignFields(
    {
      id: form.get("id"),
      title: form.get("title"),
      categorySlug: form.get("categorySlug"),
      tags: form.get("tags"),
      description: form.get("description"),
      featured: form.get("featured"),
      status: "draft",
    },
    { requireId: false },
  );
  if (!checked.ok || !checked.value) return json({ ok: false, error: checked.error }, 400);
  const v = checked.value;
  if (!(await categoryExists(v.categorySlug))) return json({ ok: false, error: "That category does not exist." }, 400);

  const explicitId = v.id !== "";
  for (let attempt = 0; attempt < 3; attempt++) {
    const id = explicitId ? v.id : await nextDesignId();
    const base = await uploadSet(id);
    if (!base) return json({ ok: false, error: "Storage rejected the upload." }, 502);
    const res = await insertDesign({
      id,
      title: v.title,
      category_slug: v.categorySlug,
      tags: v.tags,
      description: v.description,
      featured: v.featured,
      status: "draft",
      preview_base: base,
      width: dims.value.width,
      height: dims.value.height,
    });
    if (res.ok) {
      revalidateTag(CATALOGUE_TAG, "max");
      return json({ ok: true, id }, 201);
    }
    await deletePreviews(storageKeysFor(base)); // never leave orphaned files behind
    if (res.status === 409 && explicitId) return json({ ok: false, error: `Design ID ${id} is already used.` }, 409);
    if (res.status !== 409) return json({ ok: false, error: "Could not save the design." }, 502);
    // 409 on an auto-assigned ID: another upload took it first — pick the next one.
  }
  return json({ ok: false, error: "Could not allocate a Design ID. Please retry." }, 409);
}
