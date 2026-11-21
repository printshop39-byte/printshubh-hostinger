"use server";

/**
 * Server actions for the wallpaper admin.
 *
 * SECURITY: a server action is a public HTTP endpoint — anyone can POST to it
 * — so EVERY action starts by re-checking the admin session with isAuthed();
 * hiding a button in the UI protects nothing. All input is re-validated here
 * with the same rules the forms use. Writes go through the service-role store
 * (server only).
 */
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { isAuthed } from "@/app/admin/land-reports/auth";
import { CATALOGUE_TAG } from "@/lib/wallpapers/supabase";
import {
  adminGetDesign,
  categoryExists,
  patchDesign,
  removeCategory,
  removeDesign,
  saveCategory,
} from "@/lib/wallpapers/store";
import { checkCategoryFields, checkDesignFields, normalizeId } from "@/lib/wallpapers/validation";

const LIST = "/admin/wallpapers";
const editPath = (id: string) => `${LIST}/${encodeURIComponent(id)}`;
const msg = (path: string, key: "saved" | "error", text: string) => `${path}?${key}=${encodeURIComponent(text)}`;

async function guard(): Promise<void> {
  if (!(await isAuthed())) redirect(msg(LIST, "error", "Please sign in again."));
}

/** The public catalogue and the admin lists must show a change immediately. */
function refresh(id?: string) {
  updateTag(CATALOGUE_TAG);
  revalidatePath(LIST);
  if (id) revalidatePath(editPath(id));
}

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "");

/** Edit a design's details (not its image — see the upload route). */
export async function updateDesignAction(formData: FormData): Promise<void> {
  await guard();
  const id = normalizeId(str(formData, "id"));
  const checked = checkDesignFields(
    {
      id,
      title: formData.get("title"),
      categorySlug: formData.get("categorySlug"),
      tags: formData.get("tags"),
      description: formData.get("description"),
      featured: formData.get("featured"),
      status: formData.get("status"),
    },
    { requireId: true },
  );
  if (!checked.ok || !checked.value) redirect(msg(editPath(id), "error", checked.error ?? "Invalid input."));
  const v = checked.value;
  const res = await patchDesign(id, {
    title: v.title,
    category_slug: v.categorySlug,
    tags: v.tags,
    description: v.description,
    featured: v.featured,
    status: v.status,
  });
  if (!res.ok) redirect(msg(editPath(id), "error", res.notFound ? "That design no longer exists." : "Could not save. Check the category and try again."));
  refresh(id);
  redirect(msg(editPath(id), "saved", v.status === "published" ? "Saved — this design is live." : "Saved as draft."));
}

/** Publish / unpublish from the list. */
export async function setStatusAction(formData: FormData): Promise<void> {
  await guard();
  const id = normalizeId(str(formData, "id"));
  const status = str(formData, "status") === "published" ? "published" : "draft";
  const res = await patchDesign(id, { status });
  if (!res.ok) redirect(msg(LIST, "error", `Could not update ${id}.`));
  refresh(id);
  redirect(msg(LIST, "saved", status === "published" ? `${id} is now live.` : `${id} moved back to draft.`));
}

export async function setFeaturedAction(formData: FormData): Promise<void> {
  await guard();
  const id = normalizeId(str(formData, "id"));
  const res = await patchDesign(id, { featured: str(formData, "featured") === "true" });
  if (!res.ok) redirect(msg(LIST, "error", `Could not update ${id}.`));
  refresh(id);
  redirect(msg(LIST, "saved", `${id} updated.`));
}

/**
 * Remove a design for good (database row + stored previews). Deliberately
 * strict: a LIVE design cannot be deleted — unpublish it first — so a stray
 * click can never take a customer-facing page offline.
 */
export async function deleteDesignAction(formData: FormData): Promise<void> {
  await guard();
  const id = normalizeId(str(formData, "id"));
  const found = await adminGetDesign(id);
  if (!found) redirect(msg(LIST, "error", `${id} no longer exists.`));
  if (found.design.status === "published") {
    redirect(msg(editPath(id), "error", "This design is live. Move it back to draft first, then delete it."));
  }
  const res = await removeDesign(id);
  if (!res.ok) redirect(msg(editPath(id), "error", "Could not delete. Nothing was changed."));
  refresh();
  redirect(msg(LIST, "saved", `${id} deleted.`));
}

/** Add or edit a category (the slug identifies it). */
export async function saveCategoryAction(formData: FormData): Promise<void> {
  await guard();
  const checked = checkCategoryFields({
    slug: formData.get("slug"),
    name: formData.get("name"),
    description: formData.get("description"),
    sortOrder: formData.get("sortOrder"),
    coverDesignId: formData.get("coverDesignId"),
    active: formData.get("active"),
  });
  if (!checked.ok || !checked.value) redirect(msg(LIST, "error", checked.error ?? "Invalid category."));
  // "Add category" must never silently overwrite an existing one with the same slug.
  if (str(formData, "mode") === "create" && (await categoryExists(checked.value.slug))) {
    redirect(msg(LIST, "error", `A category with the URL "${checked.value.slug}" already exists.`));
  }
  const res = await saveCategory(checked.value);
  if (!res.ok) redirect(msg(LIST, "error", "Could not save the category."));
  refresh();
  redirect(msg(LIST, "saved", `Category "${checked.value.name}" saved.`));
}

/** Remove a category — only when no design uses it. */
export async function deleteCategoryAction(formData: FormData): Promise<void> {
  await guard();
  const slug = str(formData, "slug").trim();
  const res = await removeCategory(slug);
  if (!res.ok) {
    redirect(msg(LIST, "error", res.status === 409 ? "That category still has designs. Move or delete them first, or just deactivate it." : "Could not delete the category."));
  }
  refresh();
  redirect(msg(LIST, "saved", "Category deleted."));
}
