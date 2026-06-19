import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminLogin } from "./admin-login";
import { LandReportInquiryForm } from "./inquiry-form";
import { expectedToken, isAuthed } from "./auth";

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
        <AdminLogin configured={expectedToken() !== null} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7fbff] text-slate-900">
      <LandReportInquiryForm />
    </main>
  );
}
