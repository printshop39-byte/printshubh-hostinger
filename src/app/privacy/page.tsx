import type { Metadata } from "next";
import { PrivacyContent } from "./privacy-content";

export const metadata: Metadata = {
  title: "गोपनीयता धोरण | Privacy Policy — PrintShubh",
  description:
    "PrintShubh कोणती माहिती गोळा करते, ती कशी वापरते आणि तुमच्या गोपनीयतेचे संरक्षण कसे करते — मराठी-प्रथम सोप्या भाषेत.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
