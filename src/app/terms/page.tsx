import type { Metadata } from "next";
import { TermsContent } from "./terms-content";

export const metadata: Metadata = {
  title: "अटी व शर्ती | Terms & Conditions — PrintShubh",
  description:
    "PrintShubh सेवा वापरण्याच्या अटी व शर्ती. PrintShubh ही खाजगी सहाय्य सेवा आहे — सरकारी विभाग नाही. अंतिम नोंदी अधिकृत पोर्टलवर पडताळून पहाव्यात.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return <TermsContent />;
}
