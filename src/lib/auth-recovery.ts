/**
 * Password-recovery helpers — pure functions only (no environment access, no
 * Next.js imports), so they are trivially unit-testable.
 *
 * The recovery flow lives under /auth/* (NOT /admin/*, which the admin secret
 * gate in src/proxy.ts answers with 404):
 *
 *   /auth/forgot-password  -> asks Supabase to email a link (only for allowlisted admins)
 *   /auth/callback         -> the link lands here; verifies the code / token_hash and
 *                             establishes the recovery session
 *   /auth/reset-password   -> choose + confirm the new password
 */

/** Production origin. Used for every non-local host. */
export const CANONICAL_ORIGIN = "https://www.printshubh.shop";

/** Short-lived flag set by the callback; the reset form refuses to work without it. */
export const RECOVERY_COOKIE = "ps_recovery";
export const RECOVERY_MAX_AGE_SECONDS = 15 * 60;

const LOCAL_HOST = /^(localhost|127\.0\.0\.1)(:\d{1,5})?$/;

/**
 * Origin placed in the recovery email's redirectTo.
 *
 * - Local development (Host = localhost / 127.0.0.1) -> http://<that host>, so the
 *   flow can be tested without touching production.
 * - Everything else -> the canonical production origin. We never echo an arbitrary
 *   Host header into a link that is emailed to an admin; Supabase additionally
 *   refuses any redirectTo that is not on its own Redirect URLs allow-list.
 */
export function recoveryOrigin(host: string | null | undefined): string {
  const h = String(host ?? "").trim().toLowerCase();
  return LOCAL_HOST.test(h) ? `http://${h}` : CANONICAL_ORIGIN;
}

export function recoveryCallbackUrl(host: string | null | undefined): string {
  return `${recoveryOrigin(host)}/auth/callback`;
}

export type RecoveryError = "expired" | "invalid" | "denied" | "missing";

/**
 * Map what Supabase reports (`error_code`, in the query for PKCE links or in
 * the URL fragment for implicit links) to the reset page's error state.
 * An expired or already-used link is reported as `otp_expired`.
 */
export function recoveryErrorFor(errorCode: string | null | undefined): "expired" | "invalid" {
  const c = String(errorCode ?? "").toLowerCase();
  return c === "otp_expired" || c === "flow_state_expired" ? "expired" : "invalid";
}

export const RECOVERY_ERRORS: readonly RecoveryError[] = ["expired", "invalid", "denied", "missing"];

export function asRecoveryError(value: unknown): RecoveryError | null {
  return RECOVERY_ERRORS.includes(value as RecoveryError) ? (value as RecoveryError) : null;
}

/** Form states shared between the server actions and their client forms. */
export type RequestResetState = { error?: string; sent?: boolean };
export type PasswordState = { error?: string };

export const PASSWORD_MIN = 10;
/** bcrypt (used by Supabase) only looks at the first 72 BYTES. */
export const PASSWORD_MAX_BYTES = 72;

/** Returns a (Marathi) error message, or null when the new password is acceptable. */
export function validateNewPassword(password: string, confirm: string): string | null {
  if (!password || !confirm) return "नवीन पासवर्ड व पुष्टी दोन्ही भरा.";
  if (password !== confirm) return "दोन्ही पासवर्ड जुळत नाहीत.";
  if ([...password].length < PASSWORD_MIN) return `पासवर्ड किमान ${PASSWORD_MIN} अक्षरांचा असावा.`;
  if (new TextEncoder().encode(password).length > PASSWORD_MAX_BYTES) {
    return `पासवर्ड खूप मोठा आहे (कमाल ${PASSWORD_MAX_BYTES} बाइट).`;
  }
  if (password.trim() !== password) return "पासवर्डच्या सुरुवातीला/शेवटी रिकामी जागा नको.";
  return null;
}
