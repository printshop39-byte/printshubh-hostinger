import type { Metadata } from "next";
import { RefundContent } from "./refund-content";

export const metadata: Metadata = {
  title: "परतावा धोरण | Refund Policy — PrintShubh",
  description:
    "PrintShubh परतावा धोरण — पेमेंट कधी परत मिळतो, कधी नाही आणि कशी विनंती करावी हे मराठी-प्रथम सोप्या भाषेत.",
  alternates: { canonical: "/refund" },
};

export default function RefundPage() {
  return <RefundContent />;
}
