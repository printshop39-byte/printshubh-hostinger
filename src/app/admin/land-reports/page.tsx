import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BhuNakshaOverlayTool } from "@/components/admin/bhunaksha-overlay-tool";

/**
 * Protected internal admin route — Manual BhuNaksha Overlay (Phase 1).
 *
 * Gated behind the ENABLE_ADMIN_BHUNAKSHA_OVERLAY feature flag: when it is not
 * "true" the route 404s, so it is never exposed publicly. It is also marked
 * noindex and is not listed in the sitemap. This is a placeholder gate — wire a
 * real auth check (session / IP allowlist) before production use.
 *
 * `force-dynamic` so the env flag is read at request time rather than baked in
 * at build time.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Land Reports — Admin",
  robots: { index: false, follow: false },
};

export default function AdminLandReportsPage() {
  if (process.env.ENABLE_ADMIN_BHUNAKSHA_OVERLAY !== "true") {
    notFound();
  }
  return (
    <main className="min-h-screen bg-[#f7fbff] text-slate-900">
      <BhuNakshaOverlayTool />
    </main>
  );
}
