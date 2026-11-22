"use server";

/**
 * Server actions for the wallpaper admin.
 *
 * SECURITY: a server action is a public HTTP endpoint — anyone can POST to it
 * — so EVERY action starts by re-checking the admin session with isAuthed();
 * hiding a button in the UI protects nothing. All input is re-validated here
 * with the same rules the forms use. Writes go through the service-role store
 * (server only).
 *
 * "Keep my place": list forms carry a hidden `returnTo` (the list URL the admin
 * was on). It is UNTRUSTED, so it is re-parsed by parseListState() — only
 * status / q / page survive — and the redirect is always built from those, never
 * from the raw value.
 */
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { isAuthed } from "@/app/admin/land-reports/auth";
import { CATALOGUE_TAG } from "@/lib/wallpapers/supabase";
import {
  adminGetCategory,
  adminGetDesign,
  categoryExists,
  countCategoryDesigns,
  patchDesign,
  removeCategory,
  removeDesign,
  saveCategory,
} from "@/lib/wallpapers/store";
import { LIST_PATH, listHref, parseListState, returnValue, type ListState } from "@/lib/wallpapers/admin-ui";
import { checkCategoryFields, checkDesignFields, normalizeId } from "@/lib/wallpapers/validation";

const LIST = LIST_PATH;
const stateOf = (fd: FormData): ListState => parseListState(fd.get("returnTo"));

/** The edit page, remembering which list place to go back to. */
function editPath(id: string, state: ListState = {}): string {
  const back = returnValue(state);
  return `${LIST}/${encodeURIComponent(id)}` + (back !== LIST ? `?back=${encodeURIComponent(back)}` : "");
}
const withMsg = (path: string, key: "saved" | "error", text: string) =>
  `${path}${path.includes("?") ? "&" : "?"}${key}=${encodeURIComponent(text)}`;

async function guard(): Promise<void> {
  if (!(await isAuthed())) redirect(withMsg(LIST, "error", "Please sign in again."));
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
  const state = stateOf(formData);
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
  if (!checked.ok || !checked.value) redirect(withMsg(editPath(id, state), "error", checked.error ?? "Invalid input."));
  const v = checked.value;
  const res = await patchDesign(id, {
    title: v.title,
    category_slug: v.categorySlug,
    tags: v.tags,
    description: v.description,
    featured: v.featured,
    status: v.status,
  });
  if (!res.ok) {
    redirect(withMsg(editPath(id, state), "error", res.notFound ? "That design no longer exists." : "Could not save. Check the category and try again."));
  }
  refresh(id);
  let text = "Saved as draft.";
  if (v.status === "published") {
    const cat = await adminGetCategory(v.categorySlug);
    text =
      cat && cat.active
        ? "Saved — this design is live."
        : "Saved — this design is Live, but its category is hidden, so customers cannot see it yet.";
  }
  redirect(withMsg(editPath(id, state), "saved", text));
}

/** Publish / unpublish from the list (the list asks for confirmation first). */
export async function setStatusAction(formData: FormData): Promise<void> {
  await guard();
  const state = stateOf(formData);
  const id = normalizeId(str(formData, "id"));
  const status = str(formData, "status") === "published" ? "published" : "draft";
  const found = await adminGetDesign(id);
  if (!found) redirect(listHref(state, { error: `${id} no longer exists.` }));
  const res = await patchDesign(id, { status });
  if (!res.ok) redirect(listHref(state, { error: `Could not update ${id}.` }, `d-${id}`));
  refresh(id);
  let text = `${id} moved back to draft.`;
  if (status === "published") {
    const cat = await adminGetCategory(found.design.categorySlug);
    text =
      cat && cat.active
        ? `${id} is now live.`
        : `${id} is now Live, but its category is hidden, so customers cannot see it until the category is made visible.`;
  }
  redirect(listHref(state, { saved: text }, `d-${id}`));
}

export async function setFeaturedAction(formData: FormData): Promise<void> {
  await guard();
  const state = stateOf(formData);
  const id = normalizeId(str(formData, "id"));
  const res = await patchDesign(id, { featured: str(formData, "featured") === "true" });
  if (!res.ok) redirect(listHref(state, { error: `Could not update ${id}.` }, `d-${id}`));
  refresh(id);
  redirect(listHref(state, { saved: `${id} updated.` }, `d-${id}`));
}

/**
 * Remove a design for good (database row + stored previews). Deliberately
 * strict: a LIVE design cannot be deleted — unpublish it first — so a stray
 * click can never take a customer-facing page offline.
 */
export async function deleteDesignAction(formData: FormData): Promise<void> {
  await guard();
  const state = stateOf(formData);
  const id = normalizeId(str(formData, "id"));
  const found = await adminGetDesign(id);
  if (!found) redirect(listHref(state, { error: `${id} no longer exists.` }));
  if (found.design.status === "published") {
    redirect(withMsg(editPath(id, state), "error", "This design is live. Move it back to draft first, then delete it."));
  }
  const res = await removeDesign(id);
  if (!res.ok) redirect(withMsg(editPath(id, state), "error", "Could not delete. Nothing was changed."));
  refresh();
  redirect(listHref(state, { saved: `${id} deleted.` }));
}

/**
 * Add or edit a category (the slug identifies it).
 *
 * Two safety rules (enforced here, not only in the browser):
 *   - HIDING a category that still has live designs takes them offline, so it
 *     needs an explicit `confirmHide=yes` (set by the browser after the admin
 *     accepts the "N designs will become hidden" warning).
 *   - A Cover design ID must be an existing design.
 */
export async function saveCategoryAction(formData: FormData): Promise<void> {
  await guard();
  const state = stateOf(formData);
  const checked = checkCategoryFields({
    slug: formData.get("slug"),
    name: formData.get("name"),
    description: formData.get("description"),
    sortOrder: formData.get("sortOrder"),
    coverDesignId: formData.get("coverDesignId"),
    active: formData.get("active"),
  });
  if (!checked.ok || !checked.value) redirect(listHref(state, { error: checked.error ?? "Invalid category." }));
  const v = checked.value;
  const anchor = `cat-${v.slug}`;
  const creating = str(formData, "mode") === "create";

  // "Add category" must never silently overwrite an existing one with the same slug.
  if (creating && (await categoryExists(v.slug))) {
    redirect(listHref(state, { error: `A category with the URL "${v.slug}" already exists.` }));
  }

  // Hiding a visible category: show the impact, require confirmation.
  if (!creating && !v.active) {
    const before = await adminGetCategory(v.slug);
    if (before && before.active) {
      const counts = await countCategoryDesigns(v.slug);
      if (!counts) redirect(listHref(state, { error: "Could not check how many designs use this category. Nothing was changed." }, anchor));
      if (counts.live > 0 && str(formData, "confirmHide") !== "yes") {
        redirect(
          listHref(
            state,
            {
              error: `Not saved: hiding "${v.name}" would take ${counts.live} live design${counts.live === 1 ? "" : "s"} off the public site. Save again and confirm the warning to continue.`,
            },
            anchor,
          ),
        );
      }
    }
  }

  // Cover design: must exist (a typo would otherwise silently fall back to another design).
  let note = "";
  if (v.coverDesignId) {
    const cover = await adminGetDesign(v.coverDesignId);
    if (!cover) {
      redirect(
        listHref(
          state,
          { error: `Not saved: cover design ${v.coverDesignId} does not exist. Check the ID (for example WP-001) or leave it empty.` },
          anchor,
        ),
      );
    }
    if (cover.design.status !== "published") {
      note = ` Note: ${v.coverDesignId} is still a draft, so the public page uses another design as the cover until it is live.`;
    } else if (cover.design.categorySlug !== v.slug) {
      note = ` Note: ${v.coverDesignId} belongs to a different category.`;
    }
  }

  const res = await saveCategory(v);
  if (!res.ok) redirect(listHref(state, { error: "Could not save the category." }, anchor));
  refresh();
  const hidden = v.active ? "" : " It is hidden: customers cannot see it or its designs.";
  redirect(listHref(state, { saved: `Category "${v.name}" saved.${hidden}${note}` }, anchor));
}

/** Remove a category — only when no design uses it. */
export async function deleteCategoryAction(formData: FormData): Promise<void> {
  await guard();
  const state = stateOf(formData);
  const slug = str(formData, "slug").trim();
  const res = await removeCategory(slug);
  if (!res.ok) {
    redirect(
      listHref(
        state,
        { error: res.status === 409 ? "That category still has designs. Move or delete them first, or just deactivate it." : "Could not delete the category." },
        `cat-${slug}`,
      ),
    );
  }
  refresh();
  redirect(listHref(state, { saved: "Category deleted." }));
}
