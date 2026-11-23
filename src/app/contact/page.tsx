import type { Metadata } from "next";
import { ContactContent } from "./contact-content";

export const metadata: Metadata = {
  title: "संपर्क | Contact PrintShubh — Premium Print & Visual Studio, Kolhapur",
  description:
    "PrintShubh ला WhatsApp, फोन किंवा ईमेलवर संपर्क करा. वॉलपेपर, कॅनव्हास, वॉल आर्ट, रेक्झिन, साटीन फॅब्रिक, फ्रेम्ड प्रिंट्स आणि व्हिनाइल प्रिंटसाठी चौकशी.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return <ContactContent />;
}
