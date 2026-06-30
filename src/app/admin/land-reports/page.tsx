import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminLogin } from "./admin-login";
import { AdminLeadsList } from "./leads-list";
import { logoutAction } from "./actions";
import { authConfigured, isAuthed } from "./auth";

/**
 * Admin land-reports — simple, stable WhatsApp inquiry workflow.
 *
 * Two gates:
 *   1. ENABLE_ADMIN_BHUNAKSHA_OVERLAY flag — route 404s when off (never public).
 *   2. Shared-password login (ADMIN_ACCESS_PASSWORD) — see ./auth.ts.
 *
 * The advanced GIS overlay tool now lives at /admin/land-reports-gis (preserved,
 * not deleted). `force-dynamic` so env/cookies are read per request.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Land Reports — Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLandReportsPage() {
  if (process.env.ENABLE_ADMIN_BHUNAKSHA_OVERLAY !== "true") {
    notFound();
  }

  if (!(await isAuthed())) {
    return (
      <main className="min-h-screen bg-[#f7fbff] text-slate-900">
        <AdminLogin configured={authConfigured()} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7fbff] text-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <header className="mb-5 flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-black text-slate-900">जमीन अहवाल — ग्राहक चौकशी</h1>
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wide text-amber-800">
            फक्त admin
          </span>
          <form action={logoutAction} className="ml-auto">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-2.5 py-1.5 text-[12px] font-bold text-slate-700 transition hover:bg-slate-50"
            >
              बाहेर पडा
            </button>
          </form>
        </header>
        {/* Client submissions from the landing-page form — click a row for detail + actions */}
        <AdminLeadsList />
      </div>
    </main>
  );
}
