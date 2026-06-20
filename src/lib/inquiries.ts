import "server-only";

/**
 * Client inquiry storage (Supabase Postgres via its REST/PostgREST API).
 *
 * We talk to Supabase from the SERVER only, using the service-role key — the
 * browser never sees the key and never hits Supabase directly (it posts to our
 * /api/inquiries route instead). No extra npm dependency: plain fetch against
 * the auto-generated REST endpoint.
 *
 * Setup (one-time, in the Supabase dashboard):
 *   1. Create a project, then run the SQL in docs / the chat to create the
 *      `printshubh_inquiries` table with RLS enabled (service role bypasses RLS).
 *   2. Set env on the server: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function inquiriesConfigured(): boolean {
  return Boolean(SUPABASE_URL && SERVICE_KEY);
}

export interface InquiryInput {
  customer_name: string;
  mobile: string;
  service?: string;
  district?: string;
  taluka?: string;
  village?: string;
  gat?: string;
  note?: string;
}

export interface Inquiry extends InquiryInput {
  id: string;
  created_at: string;
  status: string;
}

// Namespaced table — the Supabase project may be shared with other apps, so we
// use a printshubh_ prefix to avoid colliding with any existing `inquiries`.
const restUrl = () => `${SUPABASE_URL}/rest/v1/printshubh_inquiries`;
const authHeaders = (): Record<string, string> => ({
  apikey: SERVICE_KEY as string,
  Authorization: `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
});

/** Insert one inquiry. Returns ok:false (never throws) so callers stay simple. */
export async function insertInquiry(input: InquiryInput): Promise<{ ok: boolean; error?: string }> {
  if (!inquiriesConfigured()) return { ok: false, error: "not_configured" };
  try {
    const res = await fetch(restUrl(), {
      method: "POST",
      headers: { ...authHeaders(), Prefer: "return=minimal" },
      body: JSON.stringify(input),
      cache: "no-store",
    });
    if (!res.ok) return { ok: false, error: `db_${res.status}` };
    return { ok: true };
  } catch {
    return { ok: false, error: "network" };
  }
}

/** Update one inquiry's status (admin-only — callers must auth first). */
export async function updateInquiryStatus(id: string, status: string): Promise<{ ok: boolean }> {
  if (!inquiriesConfigured()) return { ok: false };
  try {
    const res = await fetch(`${restUrl()}?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { ...authHeaders(), Prefer: "return=minimal" },
      body: JSON.stringify({ status }),
      cache: "no-store",
    });
    return { ok: res.ok };
  } catch {
    return { ok: false };
  }
}

/** Delete one inquiry (admin-only — callers must auth first). */
export async function deleteInquiry(id: string): Promise<{ ok: boolean }> {
  if (!inquiriesConfigured()) return { ok: false };
  try {
    const res = await fetch(`${restUrl()}?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { ...authHeaders(), Prefer: "return=minimal" },
      cache: "no-store",
    });
    return { ok: res.ok };
  } catch {
    return { ok: false };
  }
}

/** Newest-first list of inquiries for the admin panel. Returns [] on any error. */
export async function listInquiries(limit = 200): Promise<Inquiry[]> {
  if (!inquiriesConfigured()) return [];
  try {
    const res = await fetch(`${restUrl()}?select=*&order=created_at.desc&limit=${limit}`, {
      headers: authHeaders(),
      cache: "no-store",
    });
    if (!res.ok) return [];
    return (await res.json()) as Inquiry[];
  } catch {
    return [];
  }
}
