"use client";

/**
 * SiteSearch — header search trigger + overlay.
 *
 * One small header button opens a modal panel with a plain substring filter
 * over `SITE_SEARCH_INDEX` (~25 entries) — no search library, no backend.
 * Same visible on mobile and desktop (unlike the rest of the header, which
 * splits into a desktop bar vs. a hamburger sheet), since a single icon
 * button costs no space either way and search shouldn't need an extra tap
 * into the menu to reach.
 *
 * Keyboard: "/" or Ctrl/Cmd+K opens it (ignored while typing in another
 * field), Escape closes it, arrow keys + Enter navigate — hand-rolled the
 * same way site-header.tsx's mobile-sheet focus trap is, rather than adding
 * a command-palette dependency.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { useLang, type Lang } from "@/components/language-context";
import { trackFunnelEvent } from "@/lib/analytics";
import { SITE_SEARCH_INDEX } from "@/lib/site-search-index";

const placeholder: Record<Lang, string> = {
  mr: "शोधा: 7/12, गाव नकाशा, EMI...",
  en: "Search: 7/12, village map, EMI...",
};
const noResults: Record<Lang, string> = {
  mr: "काहीही सापडले नाही. WhatsApp वर विचारा.",
  en: "No results found. Ask us on WhatsApp.",
};
const searchLabel: Record<Lang, string> = { mr: "शोध", en: "Search" };
const closeLabel: Record<Lang, string> = { mr: "बंद करा", en: "Close" };

export function SiteSearch() {
  const { lang } = useLang();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const trackedRef = useRef(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return SITE_SEARCH_INDEX.filter(
      (entry) =>
        entry.title.mr.toLowerCase().includes(q) ||
        entry.title.en.toLowerCase().includes(q) ||
        entry.category.mr.toLowerCase().includes(q) ||
        entry.category.en.toLowerCase().includes(q),
    ).slice(0, 8);
  }, [query]);

  /* Global open shortcut. Ignored while the user is typing anywhere else. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (open) return;
      const target = e.target as HTMLElement | null;
      const typing =
        !!target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (typing) return;
      if (e.key === "/" || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  /* Lock scroll + move focus in while open; hand focus back on close. */
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    // Captured now: by the time cleanup runs, the ref may already point
    // elsewhere (or nowhere) if the trigger itself unmounted.
    const trigger = triggerRef.current;
    return () => {
      document.body.style.overflow = previousOverflow;
      cancelAnimationFrame(frame);
      trigger?.focus();
    };
  }, [open]);

  function close() {
    setOpen(false);
    setQuery("");
    trackedRef.current = false;
  }

  function trackSearchOnce() {
    if (trackedRef.current) return;
    trackedRef.current = true;
    trackFunnelEvent("search_used", { lang, surface: "header-search" });
  }

  function goTo(href: string) {
    router.push(href);
    close();
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label={searchLabel[lang]}
        className="inline-flex size-11 items-center justify-center rounded-lg border border-slate-300 text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
      >
        <Search className="size-[18px]" aria-hidden="true" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={searchLabel[lang]}
          className="fixed inset-0 z-[60] flex items-start justify-center bg-slate-950/40 px-4 pt-[12vh] backdrop-blur-sm"
          onClick={close}
        >
          <div
            className="ps-glass w-full max-w-lg rounded-2xl border border-white/60 p-3 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3">
              <Search className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                  if (e.target.value.trim()) trackSearchOnce();
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setActiveIndex((i) => Math.min(i + 1, results.length - 1));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setActiveIndex((i) => Math.max(i - 1, 0));
                  } else if (e.key === "Enter") {
                    e.preventDefault();
                    const entry = results[activeIndex];
                    if (entry) goTo(entry.href);
                  }
                }}
                placeholder={placeholder[lang]}
                className="min-h-[48px] w-full bg-transparent text-[15px] font-medium text-slate-900 outline-none placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={close}
                aria-label={closeLabel[lang]}
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>

            {query.trim() !== "" && (
              <ul className="mt-2 max-h-[60vh] overflow-y-auto">
                {results.length === 0 ? (
                  <li className="px-3 py-4 text-center text-[13.5px] text-slate-500">
                    {noResults[lang]}
                  </li>
                ) : (
                  results.map((entry, i) => (
                    <li key={entry.href}>
                      <Link
                        href={entry.href}
                        onClick={close}
                        className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 transition ${
                          i === activeIndex ? "bg-blue-50" : "hover:bg-slate-50"
                        }`}
                      >
                        <span className="text-[14.5px] font-bold text-slate-900">
                          {entry.title[lang]}
                        </span>
                        <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                          {entry.category[lang]}
                        </span>
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  );
}
