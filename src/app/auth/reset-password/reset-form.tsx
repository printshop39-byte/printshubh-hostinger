"use client";

import { useActionState } from "react";
import { updatePasswordAction } from "../actions";
import { buttonClass, inputClass } from "../auth-card";
import { PASSWORD_MIN, type PasswordState } from "@/lib/auth-recovery";

export function ResetForm() {
  const [state, formAction, pending] = useActionState<PasswordState, FormData>(
    updatePasswordAction,
    {},
  );

  return (
    <form action={formAction} className="space-y-3">
      <label className="block">
        <span className="mb-1 block text-[12px] font-bold text-slate-600">नवीन पासवर्ड</span>
        <input
          type="password"
          name="password"
          autoComplete="new-password"
          required
          minLength={PASSWORD_MIN}
          disabled={pending}
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-[12px] font-bold text-slate-600">पासवर्डची पुष्टी करा</span>
        <input
          type="password"
          name="confirm"
          autoComplete="new-password"
          required
          minLength={PASSWORD_MIN}
          disabled={pending}
          className={inputClass}
        />
      </label>
      <p className="text-[11px] font-semibold text-slate-500">
        किमान {PASSWORD_MIN} अक्षरे. बदल झाल्यावर सर्व उपकरणांवरून बाहेर पडाल आणि नवीन पासवर्डने पुन्हा
        प्रवेश करावा लागेल.
      </p>

      {state.error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[12px] font-bold text-red-700">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "जतन करत आहे…" : "नवीन पासवर्ड जतन करा"}
      </button>
    </form>
  );
}
