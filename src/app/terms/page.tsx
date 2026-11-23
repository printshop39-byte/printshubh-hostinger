import type { Metadata } from "next";
import { TermsContent } from "./terms-content";

export const metadata: Metadata = {
  title: "अटी व शर्ती | Terms & Conditions",
  description:
    "PrintShubh सेवा वापरण्याच्या अटी व शर्ती. PrintShubh ही खाजगी संस्था आहे — सरकारी विभाग नाही.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return <TermsContent />;
}
