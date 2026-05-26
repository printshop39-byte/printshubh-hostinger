"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Lang = "mr" | "en";

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
}

export const LanguageContext = createContext<LangCtx>({
  lang: "mr",
  setLang: () => {},
});

/** BCP-47 form of the in-app lang code — used to set <html lang>.
 * "mr" → "mr-IN", "en" → "en-IN" (Indian English flavour is the right
 * signal for our local audience and Search Console). */
function bcp47(l: Lang): string {
  return l === "mr" ? "mr-IN" : "en-IN";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("mr");

  /* Keep the <html lang="…"> attribute in sync with the active language.
   * SSR ships "mr-IN" (see layout.tsx); on the client we update it when
   * the user toggles. This is mainly an a11y + SEO signal — assistive
   * tech reads the attribute, and Google uses it as a soft language hint
   * alongside hreflang. */
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = bcp47(lang);
    }
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
