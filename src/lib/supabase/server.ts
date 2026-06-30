import "server-only";

/**
 * Server-side Supabase client (auth) for the admin area.
 *
 * Uses @supabase/ssr with a cookie adapter bound to Next's request cookies,
 * so the auth session lives in httpOnly cookies the browser can't read. This
 * is SEPARATE from the service-role REST access in src/lib/inquiries.ts:
 *   - This client (anon key) only establishes WHO the admin is (auth).
 *   - inquiries.ts (service-role key) does the actual lead CRUD.
 *
 * Required env (public — the anon key is safe to expose; RLS protects data):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *
 * If either is missing, supabaseAuthConfigured() is false and the admin gate
 * stays CLOSED (fail-safe) — it never falls open.
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function supabaseAuthConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // Writable from Server Actions / Route Handlers; in a Server
          // Component cookie writes throw — swallow there. Login/logout run
          // as Server Actions, where this DOES persist the session.
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            /* called from a Server Component render — safe to ignore */
          }
        },
      },
    },
  );
}
