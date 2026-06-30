"use client";

/**
 * Admin access login form. Posts to the `loginAction` server action; on success
 * the action sets the cookie and redirects, so this form only handles the
 * password input + error display.
 */

import { useActionState } from "react";
import { Lock } from "lucide-react";
import { loginAction } from "./actions";
import type { LoginState } from "./auth";

export function AdminLogin({ configured }: { configured: boolean }) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(loginAction, {});

  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-blue-600 text-white">
            <Lock className="size-4" />
          </span>
          <div>
            <h1 className="text-base font-black text-slate-900">Admin प्रवेश</h1>
            <p className="text-[12px] font-semibold text-slate-500">फक्त अधिकृत वापरकर्त्यांसाठी</p>
          </div>
        </div>

        {!configured && (
          <p className="mb-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] font-semibold text-amber-800">
            सर्व्हरवर Supabase Auth सेट केलेले नाही — प्रवेश बंद आहे.
          </p>
        )}

        <form action={formAction} className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-[12px] font-bold text-slate-600">ईमेल</span>
            <input
              type="email"
              name="email"
              autoComplete="username"
              required
              disabled={!configured || pending}
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-[14px] text-slate-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[12px] font-bold text-slate-600">पासवर्ड</span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
              disabled={!configured || pending}
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-[14px] text-slate-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
            />
          </label>

          {state.error && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[12px] font-bold text-red-700">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={!configured || pending}
            className="h-10 w-full rounded-md bg-blue-600 text-[14px] font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {pending ? "तपासत आहे…" : "प्रवेश करा"}
          </button>
        </form>
      </div>
    </div>
  );
}
