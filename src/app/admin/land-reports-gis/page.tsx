import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BhuNakshaOverlayTool } from "@/components/admin/bhunaksha-overlay-tool";
import { AdminLogin } from "../land-reports/admin-login";
import { expectedToken, isAuthed } from "../land-reports/auth";

/**
 * Advanced BhuNaksha GIS overlay tool — preserved from the original
 * /admin/land-reports page. Same gates as the simple inquiry page: the
 * ENABLE_ADMIN_BHUNAKSHA_OVERLAY flag plus the shared-password login.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Land Reports GIS — Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLandReportsGisPage() {
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
      <BhuNakshaOverlayTool />
    </main>
  );
}
