/**
 * Wallpaper admin — small pure helpers (no I/O, no environment, no Next.js).
 *
 * 1. "Keep my place": after an action the admin returns to the same search,
 *    status filter and page. The place travels as a plain string in a hidden
 *    field / `?back=`; it is UNTRUSTED input, so it is re-parsed here and only
 *    three known values survive. Anything else — another path, another host,
 *    protocol-relative URLs, control characters — collapses to "no state", so
 *    it can never be used as an open redirect.
 *
 * 2. Visibility: "Live" in the database does not mean customers can see it.
 *    A published design inside a HIDDEN category is not shown publicly, and the
 *    admin must say so ("Live · Hidden").
 */

export const LIST_PATH = "/admin/wallpapers";

export interface ListState {
  status?: "draft" | "published";
  q?: string;
  page?: number;
}

const RETURN_RE = /^\/admin\/wallpapers(?:\?([^#\r\n]*))?$/;
const ANCHOR_RE = /^[A-Za-z0-9_-]{1,80}$/;

/** Parse an untrusted return value into a safe list state. Never throws. */
export function parseListState(raw: unknown): ListState {
  const s = typeof raw === "string" ? raw : "";
  if (s.length === 0 || s.length > 300) return {};
  const m = RETURN_RE.exec(s);
  if (!m) return {};
  let params: URLSearchParams;
  try {
    params = new URLSearchParams(m[1] ?? "");
  } catch {
    return {};
  }
  const status = params.get("status");
  const q = (params.get("q") ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, 100);
  const page = Number(params.get("page"));
  return {
    status: status === "draft" || status === "published" ? status : undefined,
    q: q || undefined,
    page: Number.isInteger(page) && page > 1 && page <= 10_000 ? page : undefined,
  };
}

/**
 * The list URL for a state, optionally with a result message and a row anchor
 * (`d-WP-001`, `cat-luxury-premium`). Always a same-site relative path.
 */
export function listHref(
  state: ListState,
  extra: { saved?: string; error?: string } = {},
  anchor?: string,
): string {
  const p = new URLSearchParams();
  if (state.status) p.set("status", state.status);
  if (state.q) p.set("q", state.q);
  if (state.page && state.page > 1) p.set("page", String(state.page));
  if (extra.saved) p.set("saved", extra.saved);
  if (extra.error) p.set("error", extra.error);
  const qs = p.toString();
  return LIST_PATH + (qs ? `?${qs}` : "") + (anchor && ANCHOR_RE.test(anchor) ? `#${anchor}` : "");
}

/** The value stored in hidden fields / `?back=` for a state (no message, no anchor). */
export function returnValue(state: ListState): string {
  return listHref(state);
}

export type Visibility = "draft" | "live" | "live-hidden";

/**
 * Draft, Live (customers can see it), or Live · Hidden (published, but its
 * category is hidden or missing, so customers cannot see it).
 */
export function visibilityOf(
  status: "draft" | "published",
  categoryActive: boolean | undefined,
): Visibility {
  if (status !== "published") return "draft";
  return categoryActive === true ? "live" : "live-hidden";
}

export const VISIBILITY_LABEL: Record<Visibility, string> = {
  draft: "Draft",
  live: "Live",
  "live-hidden": "Live · Hidden",
};

export const VISIBILITY_CLASS: Record<Visibility, string> = {
  draft: "bg-amber-100 text-amber-800",
  live: "bg-green-100 text-green-800",
  "live-hidden": "bg-orange-100 text-orange-900 ring-1 ring-orange-300",
};
