"use client";

/**
 * SiteHeader
 * Sticky top bar: brand wordmark, primary nav, and Marathi/English toggle.
 * Used on every route via the home page and the LegalPageShell.
 */

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useLang, type Lang } from "@/components/language-context";

const nav: Record<Lang, { label: string; href: string }[]> = {
  mr: [
    { label: "मुख्यपृष्ठ", href: "/" },
    { label: "सेवा", href: "/#unified-form" },
    { label: "साधने", href: "/#tools" },
    { label: "नकाशा शोध", href: "/nakasha-shodh" },
    { label: "मदत", href: "/support" },
    { label: "FAQ", href: "/faq" },
    { label: "संपर्क", href: "/contact" },
  ],
  en: [
    { label: "Home", href: "/" },
    { label: "Services", href: "/#unified-form" },
    { label: "Tools", href: "/#tools" },
    { label: "Map Search", href: "/nakasha-shodh" },
    { label: "Support", href: "/support" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact", href: "/contact" },
  ],
};

export function SiteHeader() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const items = nav[lang];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-5 sm:gap-4 sm:px-8">
        {/* Brand */}
        <Link href="/" className="flex min-h-[44px] min-w-0 items-center gap-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-base font-black text-white shadow-sm">
            P
          </span>
          <span className="truncate text-lg font-black tracking-tight text-slate-900">
            PrintShubh<span className="text-blue-600">.shop</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 lg:flex">
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className="text-sm font-semibold text-slate-700 transition hover:text-blue-700"
            >
              {it.label}
            </Link>
          ))}
        </nav>

        {/* Lang toggle */}
        <div className="flex shrink-0 items-center gap-2">
          <div className="inline-flex overflow-hidden rounded-md border border-slate-300 text-xs font-bold">
            <button
              type="button"
              onClick={() => setLang("mr")}
              aria-pressed={lang === "mr"}
              aria-label="मराठी"
              className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center px-3 py-2 transition ${
                lang === "mr"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              मराठी
            </button>
            <button
              type="button"
              onClick={() => setLang("en")}
              aria-pressed={lang === "en"}
              aria-label="English"
              className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center px-3 py-2 transition ${
                lang === "en"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              EN
            </button>
          </div>
          {/* Mobile menu trigger */}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle navigation"
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-slate-300 text-slate-700 lg:hidden"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {open && (
        <nav id="mobile-nav" className="border-t border-slate-200 bg-white lg:hidden">
          <ul className="mx-auto flex max-w-7xl flex-col px-5 py-3 sm:px-8">
            {items.map((it) => (
              <li key={it.href}>
                <Link
                  href={it.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-[48px] items-center rounded-md px-2 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
                >
                  {it.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
