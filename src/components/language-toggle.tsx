"use client";

import { useLang } from "@/components/language-context";

export function LanguageToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="flex items-center gap-0.5 rounded-md border border-slate-200 bg-white p-0.5 shadow-sm">
      <button
        type="button"
        onClick={() => setLang("mr")}
        className={`h-8 rounded px-3 text-xs font-black transition ${
          lang === "mr"
            ? "bg-blue-700 text-white shadow-sm"
            : "text-slate-600 hover:bg-slate-100"
        }`}
      >
        मराठी
      </button>
      <button
        type="button"
        onClick={() => setLang("en")}
        className={`h-8 rounded px-3 text-xs font-black transition ${
          lang === "en"
            ? "bg-blue-700 text-white shadow-sm"
            : "text-slate-600 hover:bg-slate-100"
        }`}
      >
        English
      </button>
    </div>
  );
}
