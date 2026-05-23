import type { Metadata } from "next";
import { SupportContent } from "./support-content";

export const metadata: Metadata = {
  title: "मदत केंद्र | Support — PrintShubh",
  description:
    "7/12, गाव नकाशा, DP / TP, जमीन कागदपत्र आणि पेमेंट / रिफंडसाठी PrintShubh मदत. WhatsApp वर त्वरित प्रतिसाद.",
  alternates: { canonical: "/support" },
};

export default function SupportPage() {
  return <SupportContent />;
}
