import Link from "next/link";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

/**
 * Search + filter controls for the wallpaper catalogue.
 *
 * Deliberately server-rendered plain HTML: the search is a normal GET form and
 * the filters / pages are ordinary links, so the catalogue needs no client-side
 * JavaScript to browse, works before hydration, and every state is a shareable
 * URL.
 */

/** Builds "/path?x=1&y=2", skipping empty values. */
export function withParams(path: string, params: Record<string, string | number | undefined>): string {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "" && !(k === "page" && Number(v) <= 1)) qs.set(k, String(v));
  }
  const s = qs.toString();
  return s ? `${path}?${s}` : path;
}

export function CatalogueSearch({
  action,
  q,
  tag,
  placeholder = "Search designs",
  tone = "light",
}: {
  /** Page the form submits to (landing or one category). */
  action: string;
  q?: string;
  tag?: string;
  placeholder?: string;
  /** "dark" for use on the navy hero. */
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <form action={action} method="get" role="search" className="flex w-full max-w-xl gap-2">
      {tag && <input type="hidden" name="tag" value={tag} />}
      <label className="sr-only" htmlFor={`wp-search-${action}`}>
        Search wallpaper designs
      </label>
      <input
        id={`wp-search-${action}`}
        name="q"
        type="search"
        defaultValue={q ?? ""}
        placeholder={placeholder}
        autoComplete="off"
        className={`min-h-[48px] w-full min-w-0 rounded-xl border px-4 text-base font-semibold outline-none transition focus:ring-2 focus:ring-brand-gold ${
          dark
            ? "border-white/30 bg-white/95 text-slate-900 placeholder:text-slate-500"
            : "border-slate-300 bg-white text-slate-900 placeholder:text-slate-500"
        }`}
      />
      <button
        type="submit"
        className="inline-flex min-h-[48px] shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-gold px-5 text-sm font-black text-brand-navy-dark transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <Search className="size-4" aria-hidden="true" />
        Search
      </button>
    </form>
  );
}

export function TagChips({
  tags,
  basePath,
  activeTag,
  q,
}: {
  tags: string[];
  basePath: string;
  activeTag?: string;
  q?: string;
}) {
  if (tags.length === 0) return null;
  const chip =
    "inline-flex min-h-[44px] items-center rounded-full border px-4 text-sm font-bold capitalize transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy";
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Filter by style">
      {activeTag && (
        <li>
          <Link
            href={withParams(basePath, { q })}
            className={`${chip} border-brand-navy bg-brand-navy text-white`}
            aria-label={`Clear filter ${activeTag}`}
          >
            {activeTag} ✕
          </Link>
        </li>
      )}
      {tags
        .filter((t) => t !== activeTag)
        .map((t) => (
          <li key={t}>
            <Link
              href={withParams(basePath, { q, tag: t })}
              className={`${chip} border-slate-300 bg-white text-slate-700 hover:border-brand-gold hover:text-brand-navy`}
            >
              {t}
            </Link>
          </li>
        ))}
    </ul>
  );
}

export function Pagination({
  basePath,
  page,
  totalPages,
  params,
}: {
  basePath: string;
  page: number;
  totalPages: number;
  params: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;
  const btn =
    "inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-brand-navy transition hover:border-brand-gold";
  return (
    <nav className="mt-8 flex items-center justify-between gap-3" aria-label="Pagination">
      {page > 1 ? (
        <Link href={withParams(basePath, { ...params, page: page - 1 })} className={btn} rel="prev">
          <ChevronLeft className="size-4" aria-hidden="true" />
          Previous
        </Link>
      ) : (
        <span />
      )}
      <p className="text-sm font-semibold text-slate-600">
        Page {page} of {totalPages}
      </p>
      {page < totalPages ? (
        <Link href={withParams(basePath, { ...params, page: page + 1 })} className={btn} rel="next">
          Next
          <ChevronRight className="size-4" aria-hidden="true" />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
