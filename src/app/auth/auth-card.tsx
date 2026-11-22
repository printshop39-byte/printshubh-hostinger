import type { ReactNode } from "react";
import { KeyRound } from "lucide-react";

/** Shared card shell for the password-recovery pages (matches the admin login look). */
export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#f7fbff] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-md items-center px-4">
        <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-blue-600 text-white">
              <KeyRound className="size-4" />
            </span>
            <div>
              <h1 className="text-base font-black text-slate-900">{title}</h1>
              {subtitle && <p className="text-[12px] font-semibold text-slate-500">{subtitle}</p>}
            </div>
          </div>
          {children}
        </div>
      </div>
    </main>
  );
}

export const inputClass =
  "h-10 w-full rounded-md border border-slate-300 px-3 text-[14px] text-slate-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50";
export const buttonClass =
  "inline-flex h-10 w-full items-center justify-center rounded-md bg-blue-600 text-[14px] font-bold text-white transition hover:bg-blue-700 disabled:opacity-50";
