/**
 * Root 404 — Next.js 16's `global-not-found` convention.
 *
 * WHY THIS FILE EXISTS
 *   Next 16 always needs a global-not-found component for the app's single
 *   `/_not-found` route. Without one here, the app-loader falls back to its
 *   own built-in page (next/dist/client/components/builtin/global-not-found.js)
 *   — on this machine that fallback path hit a webpack resolver bug
 *   ("Module not found: Empty dependency (no request)") and failed every
 *   `next build`. Supplying our own file skips that fallback entirely.
 *
 * WHY IT HAS ITS OWN <html>/<body>
 *   This route does NOT render inside src/app/layout.tsx (same rule as
 *   global-error.tsx) — Next's own built-in version above does the same
 *   thing. So it imports globals.css and the brand fonts directly instead of
 *   inheriting them from the root layout.
 *
 * WHY NO useLang() / LanguageProvider
 *   LanguageProvider is mounted inside layout.tsx, which this route bypasses.
 *   The public site is English-only, so this page is simply written in English.
 */

import Link from "next/link";
import { GeistSans } from "geist/font/sans";
import localFont from "next/font/local";
import "./globals.css";
import { WHATSAPP_CTA } from "@/lib/whatsapp";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

const notoDevanagari = localFont({
  src: [
    { path: "./fonts/noto-sans-devanagari/NotoSansDevanagari-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/noto-sans-devanagari/NotoSansDevanagari-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/noto-sans-devanagari/NotoSansDevanagari-700.woff2", weight: "700", style: "normal" },
    { path: "./fonts/noto-sans-devanagari/NotoSansDevanagari-900.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-noto-devanagari",
  display: "swap",
  preload: false,
});

export default function GlobalNotFound() {
  const waHref = buildWhatsAppUrl({ campaign: "404", content: "ask-help" });

  return (
    <html lang="en">
      <body
        className={`${GeistSans.variable} ${notoDevanagari.variable} flex min-h-screen flex-col items-center justify-center bg-[#f8fbff] px-5 text-center`}
      >
        <p className="text-6xl font-black text-blue-700">404</p>
        <h1 className="mt-4 text-2xl font-black text-slate-950">
          This page could not be found.
        </h1>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-blue-700 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-800"
          >
            Go to homepage
          </Link>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-green-600 px-5 py-3 text-sm font-black text-white transition hover:bg-green-700"
          >
            {WHATSAPP_CTA}
          </a>
        </div>
      </body>
    </html>
  );
}
