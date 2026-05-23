import type { Metadata } from "next";
import { FaqContent } from "./faq-content";

export const metadata: Metadata = {
  title: "वारंवार विचारले जाणारे प्रश्न | FAQ — PrintShubh",
  description:
    "7/12, 8A, फेरफार, गाव नकाशा, DP / TP, WhatsApp PDF, पेमेंट आणि परतावा यांविषयी वारंवार विचारल्या जाणाऱ्या प्रश्नांची उत्तरे.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return <FaqContent />;
}
