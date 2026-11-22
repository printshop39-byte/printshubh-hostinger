"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestResetAction } from "../actions";
import { buttonClass, inputClass } from "../auth-card";
import type { RequestResetState } from "@/lib/auth-recovery";

export function ForgotForm({ configured }: { configured: boolean }) {
  const [state, formAction, pending] = useActionState<RequestResetState, FormData>(
    requestResetAction,
    {},
  );

  if (state.sent) {
    return (
      <div className="space-y-3">
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12px] font-bold text-emerald-800">
          हा ईमेल admin म्हणून नोंदवलेला असल्यास रीसेट लिंक पाठवली आहे. Inbox आणि Spam तपासा. लिंक
          थोड्या वेळातच कालबाह्य होते; ईमेल न आल्यास ६० सेकंदांनंतर पुन्हा प्रयत्न करा.
        </p>
        <Link href="/admin/land-reports" className="block text-center text-[12px] font-bold text-blue-700">
          ← प्रवेश पानावर परत जा
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      {!configured && (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] font-semibold text-amber-800">
          सर्व्हरवर Supabase Auth किंवा admin ईमेल यादी सेट केलेली नाही — रीसेट बंद आहे.
        </p>
      )}
      <label className="block">
        <span className="mb-1 block text-[12px] font-bold text-slate-600">Admin ईमेल</span>
        <input
          type="email"
          name="email"
          autoComplete="username"
          required
          disabled={!configured || pending}
          className={inputClass}
        />
      </label>

      {state.error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[12px] font-bold text-red-700">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={!configured || pending} className={buttonClass}>
        {pending ? "पाठवत आहे…" : "रीसेट लिंक पाठवा"}
      </button>
      <Link href="/admin/land-reports" className="block text-center text-[12px] font-bold text-blue-700">
        ← प्रवेश पानावर परत जा
      </Link>
    </form>
  );
}
