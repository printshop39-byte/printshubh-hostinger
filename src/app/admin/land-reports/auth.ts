import "server-only";

/**
 * Server-only access gate for the admin land-reports area.
 *
 * Backed by Supabase Auth (email + password, per-user). The session lives in
 * httpOnly cookies managed by @supabase/ssr; `isAuthed()` validates it against
 * the Supabase Auth server on every call (getUser(), not getSession(), so a
 * forged/expired cookie can't pass).
 *
 * Fail-safe: when Supabase auth env is not configured, `isAuthed()` returns
 * false — the gate stays closed rather than falling open.
 *
 * Admin users are created in the Supabase dashboard (Authentication → Users);
 * public sign-ups must be DISABLED there so only invited admins exist.
 */

import {
  createSupabaseServerClient,
  supabaseAuthConfigured,
} from "@/lib/supabase/server";

/** Error state shared between the login action and the login form. */
export type LoginState = { error?: string };

/** True when the Supabase auth env vars are present (login is possible). */
export function authConfigured(): boolean {
  return supabaseAuthConfigured();
}

/** True only when a valid Supabase user session is present. */
export async function isAuthed(): Promise<boolean> {
  if (!supabaseAuthConfigured()) return false;
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return Boolean(user);
  } catch {
    return false;
  }
}
