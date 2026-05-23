"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { MapPin, Search, X } from "lucide-react";
import { useLang, type Lang } from "@/components/language-context";

/* ──────────────────────────────────────────────────────────────────────────────
   Shared location dataset + reusable searchable autocomplete.
   - Used in the Hero quick-preview card and StorytellingSection
   - Marathi/English aware via useLang()
   - Keyboard support: ArrowUp, ArrowDown, Enter, Escape
   - Closes on outside click
   - Highlights the matched substring
   ────────────────────────────────────────────────────────────────────────────── */

export type BiText = { mr: string; en: string };

export interface VillageEntry {
  mr: string;
  en: string;
}

export interface TalukaEntry {
  name: BiText;
  villages: VillageEntry[];
}

export interface DistrictEntry {
  district: BiText;
  talukas: TalukaEntry[];
}

export interface LocationSelection {
  district: BiText;
  taluka?: BiText;
  village?: BiText;
  kind: "district" | "taluka" | "village";
}

export const locationData: DistrictEntry[] = [
  {
    district: { mr: "पुणे", en: "Pune" },
    talukas: [
      {
        name: { mr: "हवेली", en: "Haveli" },
        villages: [
          { mr: "वाघोली", en: "Wagholi" },
          { mr: "लोहगाव", en: "Lohegaon" },
          { mr: "खराडी", en: "Kharadi" },
        ],
      },
      {
        name: { mr: "मुळशी", en: "Mulshi" },
        villages: [
          { mr: "पिरंगुट", en: "Pirangut" },
          { mr: "भूगाव", en: "Bhugaon" },
        ],
      },
    ],
  },
  {
    district: { mr: "कोल्हापूर", en: "Kolhapur" },
    talukas: [
      {
        name: { mr: "करवीर", en: "Karvir" },
        villages: [
          { mr: "उचगाव", en: "Uchgaon" },
          { mr: "गोकुळ शिरगाव", en: "Gokul Shirgaon" },
        ],
      },
      {
        name: { mr: "शिरोळ", en: "Shirol" },
        villages: [{ mr: "जयसिंगपूर", en: "Jaysingpur" }],
      },
    ],
  },
  {
    district: { mr: "सांगली", en: "Sangli" },
    talukas: [
      {
        name: { mr: "मिरज", en: "Miraj" },
        villages: [
          { mr: "कुपवाड", en: "Kupwad" },
          { mr: "बेडग", en: "Bedag" },
        ],
      },
      {
        name: { mr: "तासगाव", en: "Tasgaon" },
        villages: [{ mr: "मणेराजुरी", en: "Manerajuri" }],
      },
    ],
  },
  {
    district: { mr: "सातारा", en: "Satara" },
    talukas: [
      {
        name: { mr: "कराड", en: "Karad" },
        villages: [{ mr: "मलकापूर", en: "Malkapur" }],
      },
      {
        name: { mr: "वाई", en: "Wai" },
        villages: [{ mr: "पाचगणी", en: "Panchgani" }],
      },
    ],
  },
  {
    district: { mr: "नाशिक", en: "Nashik" },
    talukas: [
      {
        name: { mr: "नाशिक", en: "Nashik" },
        villages: [
          { mr: "सातपूर", en: "Satpur" },
          { mr: "अंबड", en: "Ambad" },
        ],
      },
      {
        name: { mr: "सिन्नर", en: "Sinnar" },
        villages: [{ mr: "मुसळगाव", en: "Musalgaon" }],
      },
    ],
  },
  {
    district: { mr: "नागपूर", en: "Nagpur" },
    talukas: [
      {
        name: { mr: "नागपूर ग्रामीण", en: "Nagpur Rural" },
        villages: [{ mr: "बुटीबोरी", en: "Butibori" }],
      },
      {
        name: { mr: "हिंगणा", en: "Hingna" },
        villages: [{ mr: "वानाडोंगरी", en: "Wanadongri" }],
      },
    ],
  },
  {
    district: { mr: "मुंबई", en: "Mumbai" },
    talukas: [
      {
        name: { mr: "मुंबई शहर", en: "Mumbai City" },
        villages: [
          { mr: "कोलाबा", en: "Colaba" },
          { mr: "दादर", en: "Dadar" },
        ],
      },
      {
        name: { mr: "मुंबई उपनगर", en: "Mumbai Suburban" },
        villages: [
          { mr: "अंधेरी", en: "Andheri" },
          { mr: "बांद्रा", en: "Bandra" },
        ],
      },
    ],
  },
];

/* ── Flatten dataset to a searchable suggestion list ──────────────────────── */
interface Suggestion {
  key: string;
  kind: "district" | "taluka" | "village";
  district: BiText;
  taluka?: BiText;
  village?: BiText;
  /* Pre-computed display labels */
  primary: BiText;
  context?: BiText;
}

const ALL_SUGGESTIONS: Suggestion[] = (() => {
  const out: Suggestion[] = [];
  for (const d of locationData) {
    out.push({
      key: `d:${d.district.en}`,
      kind: "district",
      district: d.district,
      primary: d.district,
    });
    for (const t of d.talukas) {
      out.push({
        key: `t:${d.district.en}:${t.name.en}`,
        kind: "taluka",
        district: d.district,
        taluka: t.name,
        primary: t.name,
        context: d.district,
      });
      for (const v of t.villages) {
        out.push({
          key: `v:${d.district.en}:${t.name.en}:${v.en}`,
          kind: "village",
          district: d.district,
          taluka: t.name,
          village: v,
          primary: v,
          context: { mr: `${t.name.mr}, ${d.district.mr}`, en: `${t.name.en}, ${d.district.en}` },
        });
      }
    }
  }
  return out;
})();

/* ── Helpers ──────────────────────────────────────────────────────────────── */
function normalize(s: string): string {
  return s.normalize("NFKD").toLowerCase().trim();
}

function matches(suggestion: Suggestion, q: string): boolean {
  const n = normalize(q);
  if (n.length < 2) return false;
  const haystacks = [
    suggestion.primary.mr,
    suggestion.primary.en,
    suggestion.context?.mr ?? "",
    suggestion.context?.en ?? "",
  ].map(normalize);
  return haystacks.some((h) => h.includes(n));
}

function findMatchIndex(text: string, q: string): { start: number; end: number } | null {
  const n = normalize(q);
  if (!n) return null;
  const lower = text.toLowerCase();
  const idx = lower.indexOf(n);
  if (idx === -1) return null;
  return { start: idx, end: idx + n.length };
}

function HighlightedText({ text, query }: { text: string; query: string }) {
  const range = findMatchIndex(text, query);
  if (!range) return <>{text}</>;
  return (
    <>
      {text.slice(0, range.start)}
      <mark className="rounded bg-yellow-100 px-0.5 font-black text-blue-900">
        {text.slice(range.start, range.end)}
      </mark>
      {text.slice(range.end)}
    </>
  );
}

function kindBadge(kind: Suggestion["kind"], lang: Lang) {
  const map: Record<Suggestion["kind"], { mr: string; en: string; cls: string }> = {
    district: { mr: "जिल्हा", en: "District", cls: "border-blue-200 bg-blue-50 text-blue-800" },
    taluka:   { mr: "तालुका", en: "Taluka",   cls: "border-indigo-200 bg-indigo-50 text-indigo-800" },
    village:  { mr: "गाव",   en: "Village",  cls: "border-green-200 bg-green-50 text-green-800" },
  };
  const item = map[kind];
  return (
    <span className={`inline-flex shrink-0 items-center rounded-md border px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${item.cls}`}>
      {lang === "mr" ? item.mr : item.en}
    </span>
  );
}

/* ── Component ────────────────────────────────────────────────────────────── */
export function LocationAutocomplete({
  value,
  onSelect,
  onFreeTextSubmit,
  placeholderOverride,
  size = "md",
  className = "",
  showSearchButton = false,
  searching = false,
  searchButtonLabel,
}: {
  value?: string;
  onSelect: (sel: LocationSelection) => void;
  /** Fired when user presses Enter or clicks the Search button on a query that
      has no autocomplete match. Use for Nominatim / address geocoding. */
  onFreeTextSubmit?: (query: string) => void;
  placeholderOverride?: { mr: string; en: string };
  size?: "sm" | "md";
  className?: string;
  /** Render an inline Search button on the right side of the input. */
  showSearchButton?: boolean;
  /** External "searching…" state — disables the Search button. */
  searching?: boolean;
  searchButtonLabel?: { mr: string; en: string };
}) {
  const { lang } = useLang();
  const [query, setQuery] = useState(value ?? "");
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (value !== undefined) setQuery(value);
  }, [value]);

  const filtered = useMemo<Suggestion[]>(() => {
    if (normalize(query).length < 2) return [];
    const out = ALL_SUGGESTIONS.filter((s) => matches(s, query));
    /* Stable order: districts first, then talukas, then villages */
    const rank: Record<Suggestion["kind"], number> = { district: 0, taluka: 1, village: 2 };
    return out.sort((a, b) => rank[a.kind] - rank[b.kind]).slice(0, 12);
  }, [query]);

  /* Reset activeIdx when filter changes */
  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  /* Outside click closes */
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const placeholder = placeholderOverride
    ? placeholderOverride[lang]
    : lang === "mr"
      ? "जिल्हा / तालुका / गाव शोधा"
      : "Search district / taluka / village";

  const choose = useCallback(
    (s: Suggestion) => {
      onSelect({
        district: s.district,
        taluka: s.taluka,
        village: s.village,
        kind: s.kind,
      });
      const label =
        s.kind === "village" && s.village
          ? `${s.village[lang]}, ${s.taluka![lang]}, ${s.district[lang]}`
          : s.kind === "taluka" && s.taluka
            ? `${s.taluka[lang]}, ${s.district[lang]}`
            : s.district[lang];
      setQuery(label);
      setOpen(false);
    },
    [onSelect, lang],
  );

  const submitFreeText = useCallback(() => {
    const q = query.trim();
    if (q.length === 0) return;
    if (onFreeTextSubmit) {
      onFreeTextSubmit(q);
      setOpen(false);
    }
  }, [query, onFreeTextSubmit]);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) setOpen(true);
      setActiveIdx((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      if (open && filtered[activeIdx]) {
        e.preventDefault();
        choose(filtered[activeIdx]);
      } else if (onFreeTextSubmit) {
        e.preventDefault();
        submitFreeText();
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  /* Scroll active item into view */
  useEffect(() => {
    if (!open || !listRef.current) return;
    const li = listRef.current.querySelector<HTMLLIElement>(
      `li[data-idx="${activeIdx}"]`,
    );
    if (li) li.scrollIntoView({ block: "nearest" });
  }, [activeIdx, open]);

  const isSm = size === "sm";
  const btnLabel = searchButtonLabel
    ? searchButtonLabel[lang]
    : lang === "mr"
      ? "शोधा"
      : "Search";

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search
            className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-blue-700 ${
              isSm ? "size-4" : "size-4"
            }`}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => {
              if (filtered.length > 0) setOpen(true);
            }}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            aria-label={placeholder}
            aria-autocomplete="list"
            aria-expanded={open}
            autoComplete="off"
            spellCheck={false}
            className={`w-full rounded-xl border border-slate-300 bg-white pl-9 pr-9 text-sm font-semibold text-slate-900 shadow-sm outline-none transition placeholder:font-medium placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
              isSm ? "h-10" : "h-12"
            }`}
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setOpen(false);
              }}
              aria-label={lang === "mr" ? "साफ करा" : "Clear"}
              className="pointer-events-auto absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {showSearchButton && (
          <button
            type="button"
            onClick={submitFreeText}
            disabled={searching || query.trim().length === 0}
            className={`shrink-0 rounded-xl bg-blue-700 px-5 text-sm font-bold text-white transition hover:bg-blue-800 disabled:opacity-60 ${
              isSm ? "h-10" : "h-12"
            }`}
          >
            {searching ? "…" : btnLabel}
          </button>
        )}
      </div>

      {open && filtered.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl shadow-blue-900/10">
          <ul ref={listRef} className="max-h-72 overflow-y-auto py-1" role="listbox">
            {filtered.map((s, idx) => {
              const isActive = idx === activeIdx;
              const primary = s.primary[lang];
              const context = s.context?.[lang];
              return (
                <li
                  key={s.key}
                  data-idx={idx}
                  role="option"
                  aria-selected={isActive}
                  className={`flex cursor-pointer items-center gap-3 px-3 py-2 transition ${
                    isActive ? "bg-blue-50" : "hover:bg-slate-50"
                  }`}
                  onMouseEnter={() => setActiveIdx(idx)}
                  onMouseDown={(e) => {
                    /* Use mouseDown so input blur doesn't close before click */
                    e.preventDefault();
                    choose(s);
                  }}
                >
                  <MapPin
                    className={`size-4 shrink-0 ${
                      s.kind === "district"
                        ? "text-blue-700"
                        : s.kind === "taluka"
                          ? "text-indigo-700"
                          : "text-green-700"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-900">
                      <HighlightedText text={primary} query={query} />
                    </p>
                    {context && (
                      <p className="truncate text-xs text-slate-500">
                        <HighlightedText text={context} query={query} />
                      </p>
                    )}
                  </div>
                  {kindBadge(s.kind, lang)}
                </li>
              );
            })}
          </ul>
          <div className="border-t border-slate-100 bg-slate-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            {lang === "mr"
              ? "↑↓ निवडा • Enter निश्चित करा • Esc बंद करा"
              : "↑↓ navigate • Enter select • Esc close"}
          </div>
        </div>
      )}

      {open && normalize(query).length >= 2 && filtered.length === 0 && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 rounded-xl border border-slate-200 bg-white p-3 text-center text-xs font-semibold text-slate-500 shadow-lg">
          {lang === "mr" ? "स्थान सापडले नाही." : "No location found."}
        </div>
      )}
    </div>
  );
}
