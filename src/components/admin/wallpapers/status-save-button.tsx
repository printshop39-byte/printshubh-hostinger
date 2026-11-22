"use client";

import type { ReactNode } from "react";

/**
 * Save button for the design edit form. If the Status dropdown was changed,
 * Save would publish or unpublish the design — so it asks first, exactly like
 * the Publish / Unpublish buttons in the list. Saving without changing the
 * status (title, tags …) never prompts.
 */
export function StatusSaveButton({
  id,
  title,
  initialStatus,
  categoryHidden,
  className,
  children,
}: {
  id: string;
  title: string;
  initialStatus: "draft" | "published";
  /** True when the design's category is currently hidden. */
  categoryHidden: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        const form = e.currentTarget.form;
        const select = form?.elements.namedItem("status") as HTMLSelectElement | null;
        if (!select || select.value === initialStatus) return;
        const publishing = select.value === "published";
        const message = publishing
          ? `Publish ${id} "${title}"?\n\nIt will appear on the public catalogue immediately.` +
            (categoryHidden ? "\n\nIts category is hidden, so customers still will not see it until the category is made visible." : "")
          : `Unpublish ${id} "${title}"?\n\nIt will disappear from the public catalogue immediately. You can publish it again later.`;
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
