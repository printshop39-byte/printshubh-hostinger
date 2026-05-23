import type { Metadata } from "next";
import { ContactContent } from "./contact-content";

export const metadata: Metadata = {
  title: "संपर्क | Contact PrintShubh — महाराष्ट्र जमीन कागदपत्र सहाय्य",
  description:
    "PrintShubh ला WhatsApp, फोन किंवा ईमेलवर संपर्क करा. 7/12, 8A, गाव नकाशा, TP/DP आणि मिळकत पत्रिका सहाय्य.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return <ContactContent />;
}
