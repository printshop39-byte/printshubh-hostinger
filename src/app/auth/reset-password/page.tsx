import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { authConfigured, isAllowedAdminUser } from "@/app/admin/land-reports/auth";
import { RECOVERY_COOKIE, asRecoveryError, type RecoveryError } from "@/lib/auth-recovery";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AuthCard, buttonClass } from "../auth-card";
import { HashNotice } from "./hash-notice";
import { ResetForm } from "./reset-form";

/**
 * /auth/reset-password — where the recovery link ends up (via /auth/callback).
 *
 *   ?done=1            password changed -> go sign in
 *   ?error=<reason>    expired | invalid | denied | missing -> explanation + "request a new link"
 *   (no params)        shows the form ONLY when the browser holds a fresh recovery
 *                      session (cookie from the callback + valid Supabase session +
 *                      allowlisted admin); otherwise the "invalid / expired" state.
 *
 * Never redirects to the homepage.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reset password",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

const ERROR_COPY: Record<RecoveryError, { title: string; body: string }> = {
  expired: {
    title: "रीसेट लिंक कालबाह्य झाली आहे",
    body: "ही लिंक जुनी झाली आहे किंवा आधीच वापरली गेली आहे. कृपया नवीन रीसेट लिंक मागवा.",
  },
  invalid: {
    title: "रीसेट लिंक वैध नाही",
    body: "लिंक अपूर्ण/चुकीची आहे, किंवा रीसेट सत्र संपले आहे. नवीन रीसेट लिंक मागवा आणि ईमेलमधील सर्वात ताजी लिंक वापरा.",
  },
  missing: {
    title: "रीसेट लिंक वैध नाही",
    body: "लिंकमध्ये आवश्यक माहिती नाही. नवीन रीसेट लिंक मागवा आणि ईमेलमधील सर्वात ताजी लिंक वापरा.",
  },
  denied: {
    title: "हे खाते अधिकृत नाही",
    body: "या ईमेलला admin पासवर्ड रीसेटची परवानगी नाही.",
  },
};

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function ErrorState({ error }: { error: RecoveryError }) {
  const copy = ERROR_COPY[error];
  return (
    <AuthCard title={copy.title} subtitle="पासवर्ड रीसेट">
      <HashNotice />
      <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[12px] font-bold text-red-700">
        {copy.body}
      </p>
      {error !== "denied" && (
        <Link href="/auth/forgot-password" className={buttonClass}>
          नवीन रीसेट लिंक मागवा
        </Link>
      )}
      <Link
        href="/admin/land-reports"
        className="mt-3 block text-center text-[12px] font-bold text-blue-700"
      >
        ← प्रवेश पानावर परत जा
      </Link>
    </AuthCard>
  );
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  if (first(sp.done) === "1") {
    return (
      <AuthCard title="पासवर्ड बदलला" subtitle="पासवर्ड रीसेट">
        <p className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12px] font-bold text-emerald-800">
          नवीन पासवर्ड जतन झाला. सुरक्षेसाठी सर्व सत्रे बंद केली आहेत — नवीन पासवर्डने प्रवेश करा.
        </p>
        <Link href="/admin/land-reports" className={buttonClass}>
          प्रवेश करा
        </Link>
      </AuthCard>
    );
  }

  const queryError = asRecoveryError(first(sp.error));
  if (queryError) return <ErrorState error={queryError} />;

  // No error in the URL: show the form only with a genuine, fresh recovery session.
  let ready = false;
  if (authConfigured()) {
    const hasFlag = (await cookies()).get(RECOVERY_COOKIE)?.value === "1";
    if (hasFlag) {
      try {
        const supabase = await createSupabaseServerClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        ready = isAllowedAdminUser(user);
      } catch {
        ready = false;
      }
    }
  }
  if (!ready) return <ErrorState error="invalid" />;

  return (
    <AuthCard title="नवीन पासवर्ड सेट करा" subtitle="पासवर्ड रीसेट">
      <ResetForm />
    </AuthCard>
  );
}
