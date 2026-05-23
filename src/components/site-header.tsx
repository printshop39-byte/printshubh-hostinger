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
    { label: "सेवा", href: "/#services" },
    { label: "नकाशा संदर्भ", href: "/#map-reference" },
    { label: "मदत", href: "/support" },
    { label: "FAQ", href: "/faq" },
    { label: "संपर्क", href: "/contact" },
  ],
  en: [
    { label: "Home", href: "/" },
    { label: "Services", href: "/#services" },
    { label: "Map Reference", href: "/#map-reference" },
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
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-base font-black text-white shadow-sm">
            P
          </span>
          <span className="text-lg font-black tracking-tight text-slate-900">
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
        <div className="flex items-center gap-2">
          <div className="inline-flex overflow-hidden rounded-md border border-slate-300 text-xs font-bold">
            <button
              type="button"
              onClick={() => setLang("mr")}
              className={`px-2.5 py-1.5 transition ${
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
              className={`px-2.5 py-1.5 transition ${
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
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-700 lg:hidden"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {open && (
        <nav className="border-t border-slate-200 bg-white lg:hidden">
          <ul className="mx-auto flex max-w-7xl flex-col px-5 py-3 sm:px-8">
            {items.map((it) => (
              <li key={it.href}>
                <Link
                  href={it.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-2 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
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
