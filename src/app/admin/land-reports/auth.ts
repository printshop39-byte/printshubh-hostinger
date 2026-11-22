import "server-only";

/**
 * Server-only access gate for ALL admin pages, actions and routes
 * (land-reports, land-reports-gis, wallpapers, the upload route).
 *
 * Two independent conditions must BOTH hold:
 *   1. A valid Supabase Auth session (email + password). The session lives in
 *      cookies managed by @supabase/ssr; it is validated against the Supabase
 *      Auth server on every call (getUser(), not getSession(), so a forged or
 *      expired cookie can't pass).
 *   2. That user's CONFIRMED email is on the ADMIN_EMAILS allowlist.
 *
 * Why (2): a Supabase project can hold accounts from other apps or from open
 * sign-ups. "Has an account" must never mean "is an administrator".
 *
 * ADMIN_EMAILS is a server-only environment variable (never NEXT_PUBLIC_, never
 * sent to the browser). Example: ADMIN_EMAILS="owner@example.com, helper@example.com"
 *
 * FAIL CLOSED: if Supabase auth is not configured, or ADMIN_EMAILS is missing
 * or empty, `isAuthed()` is false for everyone — the gate never falls open.
 *
 * Admin users are created in the Supabase dashboard (Authentication -> Users)
 * and public sign-ups should be DISABLED there as well (defence in depth).
 */

import { isAllowedAdminEmail, parseAdminEmails } from "@/lib/admin-allowlist";
import {
  createSupabaseServerClient,
  supabaseAuthConfigured,
} from "@/lib/supabase/server";

/** Error state shared between the login action and the login form. */
export type LoginState = { error?: string };

/** The parsed allowlist, read fresh from the server environment on each use. */
function adminAllowlist(): string[] {
  return parseAdminEmails(process.env.ADMIN_EMAILS);
}

/** True when login is possible AND at least one admin email is allowlisted. */
export function authConfigured(): boolean {
  return supabaseAuthConfigured() && adminAllowlist().length > 0;
}

/**
 * The single rule for "this Supabase user is an administrator": a CONFIRMED
 * email that is on the (non-empty) ADMIN_EMAILS allowlist. Shared by the admin
 * gate below and by the password-recovery flow (src/app/auth/*), so recovery
 * can never grant or reset anything the admin gate would not allow.
 */
export function isAllowedAdminUser(
  user:
    | { email?: string | null; email_confirmed_at?: string | null; confirmed_at?: string | null }
    | null
    | undefined,
): boolean {
  if (!user) return false;
  // An unconfirmed address proves nothing: require the email to be verified.
  if (!user.email_confirmed_at && !user.confirmed_at) return false;
  const allowlist = adminAllowlist();
  if (allowlist.length === 0) return false; // missing/empty ADMIN_EMAILS: nobody is admin
  return isAllowedAdminEmail(user.email, allowlist);
}

/** True only for a valid session belonging to a confirmed, allowlisted admin email. */
export async function isAuthed(): Promise<boolean> {
  if (!supabaseAuthConfigured()) return false;
  if (adminAllowlist().length === 0) return false; // missing/empty ADMIN_EMAILS: nobody is admin
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return isAllowedAdminUser(user);
  } catch {
    return false;
  }
}
