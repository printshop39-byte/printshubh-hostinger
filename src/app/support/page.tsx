import type { Metadata } from "next";
import { SupportContent } from "./support-content";

export const metadata: Metadata = {
  title: "मदत केंद्र | Support",
  description:
    "Print Collections चौकशी आणि पेमेंट / रिफंडसाठी PrintShubh मदत. WhatsApp वर त्वरित प्रतिसाद.",
  alternates: { canonical: "/support" },
};

export default function SupportPage() {
  return <SupportContent />;
}
