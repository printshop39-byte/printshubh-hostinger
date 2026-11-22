"use server";

/**
 * Password-recovery server actions (request a reset email, save the new
 * password). Each action re-checks everything itself — Server Actions are
 * public endpoints, so nothing here relies on the UI having hidden a form.
 */

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { authConfigured, isAllowedAdminUser } from "@/app/admin/land-reports/auth";
import { isAllowedAdminEmail, normalizeEmail, parseAdminEmails } from "@/lib/admin-allowlist";
import {
  RECOVERY_COOKIE,
  recoveryCallbackUrl,
  validateNewPassword,
  type PasswordState,
  type RequestResetState,
} from "@/lib/auth-recovery";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const EMAIL_SHAPE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/**
 * Ask Supabase to email a recovery link.
 *
 * - The link is only requested for addresses on the ADMIN_EMAILS allowlist.
 * - The reply is IDENTICAL for every address, so this form cannot be used to
 *   discover which emails are admins (no account enumeration).
 */
export async function requestResetAction(
  _prev: RequestResetState,
  formData: FormData,
): Promise<RequestResetState> {
  if (!authConfigured()) {
    return { error: "सर्व्हरवर Supabase Auth किंवा admin ईमेल यादी सेट केलेली नाही." };
  }

  const email = normalizeEmail(formData.get("email"));
  if (!EMAIL_SHAPE.test(email)) return { error: "कृपया वैध ईमेल लिहा." };

  if (isAllowedAdminEmail(email, parseAdminEmails(process.env.ADMIN_EMAILS))) {
    try {
      const host = (await headers()).get("host");
      const supabase = await createSupabaseServerClient();
      // The result is deliberately ignored (rate limits, unknown users …) so the
      // response below cannot reveal whether an email was accepted.
      await supabase.auth.resetPasswordForEmail(email, { redirectTo: recoveryCallbackUrl(host) });
    } catch {
      /* swallow: same response either way */
    }
  }
  return { sent: true };
}

/**
 * Save the new password. Requires, all at once:
 *   1. the short-lived cookie set by /auth/callback (a fresh recovery link was used),
 *   2. a valid Supabase session for a confirmed, allowlisted admin,
 *   3. a new password that passes the rules (length, match).
 * On success every session of the user is revoked, so the new password must be
 * used to sign in again.
 */
export async function updatePasswordAction(
  _prev: PasswordState,
  formData: FormData,
): Promise<PasswordState> {
  const jar = await cookies();
  const expired = "रीसेट सत्र संपले आहे. कृपया नवीन रीसेट लिंक मागवा.";

  if (jar.get(RECOVERY_COOKIE)?.value !== "1") return { error: expired };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAllowedAdminUser(user)) return { error: expired };

  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const invalid = validateNewPassword(password, confirm);
  if (invalid) return { error: invalid };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    switch (error.code) {
      case "same_password":
        return { error: "नवीन पासवर्ड जुन्या पासवर्डपेक्षा वेगळा असावा." };
      case "weak_password":
        return { error: "हा पासवर्ड पुरेसा मजबूत नाही. अक्षरे, अंक व चिन्हे मिसळून वापरा." };
      case "session_not_found":
      case "session_expired":
      case "bad_jwt":
        return { error: expired };
      default:
        return { error: "पासवर्ड बदलता आला नाही. थोड्या वेळाने पुन्हा प्रयत्न करा." };
    }
  }

  // Revoke ALL sessions (global scope is the default) and drop the recovery flag.
  await supabase.auth.signOut();
  jar.delete({ name: RECOVERY_COOKIE, path: "/auth" });
  redirect("/auth/reset-password?done=1");
}
