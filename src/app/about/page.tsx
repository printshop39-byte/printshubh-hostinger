import type { Metadata } from "next";
import { AboutContent } from "./about-content";

export const metadata: Metadata = {
  title: "आमच्याबद्दल | About PRINTSHUBH — Premium Print & Visual Studio, Kolhapur",
  description:
    "PRINTSHUBH म्हणजे काय, आम्ही कोणत्या सेवा देतो, आणि १९९६ पासून कोल्हापुरात वॉलपेपर, कॅनव्हास, वॉल आर्ट, रेक्झिन, साटीन फॅब्रिक, फ्रेम्ड प्रिंट्स आणि व्हिनाइल प्रिंटिंग.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return <AboutContent />;
}
