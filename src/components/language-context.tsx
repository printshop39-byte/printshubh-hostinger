"use client";

import { createContext, useContext, useState } from "react";

export type Lang = "mr" | "en";

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
}

export const LanguageContext = createContext<LangCtx>({
  lang: "mr",
  setLang: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("mr");
  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
