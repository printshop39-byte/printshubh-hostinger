"use client";

import type { ReactNode } from "react";

/**
 * Save button for a category form. When the admin is about to HIDE a category
 * that is currently visible and still has live designs, it shows how many
 * designs will disappear from the public site and asks for confirmation.
 *
 * On "OK" it sets the form's hidden `confirmHide` field to "yes"; the server
 * action refuses to hide such a category without it (so this is not only a
 * browser-side nicety).
 */
export function CategorySaveButton({
  name,
  wasActive,
  live,
  draft,
  className,
  children,
}: {
  name: string;
  /** Was the category visible when this page was loaded? */
  wasActive: boolean;
  live: number;
  draft: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        const form = e.currentTarget.form;
        if (!form) return;
        const visible = form.elements.namedItem("active") as HTMLInputElement | null;
        const flag = form.elements.namedItem("confirmHide") as HTMLInputElement | null;
        if (flag) flag.value = "";
        if (wasActive && visible && !visible.checked && live > 0) {
          const plural = (n: number) => `${n} design${n === 1 ? "" : "s"}`;
          const ok = window.confirm(
            `Hide the category "${name}"?\n\n` +
              `${plural(live)} that ${live === 1 ? "is" : "are"} live will disappear from the public catalogue immediately` +
              (draft > 0 ? ` (${plural(draft)} still in draft ${draft === 1 ? "is" : "are"} not affected)` : "") +
              `, and the category page will be hidden too.\n\nYou can make it visible again at any time.`,
          );
          if (!ok) {
            e.preventDefault();
            visible.checked = true; // nothing was saved, so show the category as still visible
            return;
          }
          if (flag) flag.value = "yes";
        }
      }}
    >
      {children}
    </button>
  );
}
