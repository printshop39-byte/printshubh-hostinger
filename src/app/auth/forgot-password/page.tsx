import type { Metadata } from "next";
import { authConfigured } from "@/app/admin/land-reports/auth";
import { AuthCard } from "../auth-card";
import { ForgotForm } from "./forgot-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Forgot password",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function ForgotPasswordPage() {
  return (
    <AuthCard title="पासवर्ड विसरलात?" subtitle="Admin पासवर्ड रीसेट — फक्त अधिकृत ईमेलसाठी">
      <ForgotForm configured={authConfigured()} />
    </AuthCard>
  );
}
