"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

export type Lang = "mr" | "en";

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
}

export const LanguageContext = createContext<LangCtx>({
  lang: "en",
  setLang: () => {},
});

/** BCP-47 form of the in-app lang code — used to set <html lang>.
 * "mr" → "mr-IN", "en" → "en-IN" (Indian English flavour is the right
 * signal for our local audience and Search Console). */
function bcp47(l: Lang): string {
  return l === "mr" ? "mr-IN" : "en-IN";
}

const NOOP = () => {};

/**
 * ENGLISH-ONLY PUBLIC SITE (S1-A)
 *
 * Every public route is locked to English: `lang` is always "en" and
 * `setLang` does nothing, so no visitor can switch the interface to Marathi.
 * The Marathi branches inside the components are left in place for now (they
 * are removed route group by route group in S1-B); they simply never render.
 *
 * The ONE exception is the admin area (`/admin/*`): its tools keep their own
 * working language switch, so there the provider behaves exactly as it did
 * before (state-driven, starting in English).
 */
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname === "/admin" || (pathname?.startsWith("/admin/") ?? false);
  const [adminLang, setAdminLang] = useState<Lang>("en");

  const lang: Lang = isAdmin ? adminLang : "en";
  const setLang = isAdmin ? setAdminLang : NOOP;

  /* Keep the <html lang="…"> attribute in sync with the active language:
   * always "en-IN" on public pages. Mainly an a11y + SEO signal. */
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = bcp47(lang);
    }
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang }), [lang, setLang]);

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
