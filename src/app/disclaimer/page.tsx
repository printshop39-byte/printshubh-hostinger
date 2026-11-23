import type { Metadata } from "next";
import { DisclaimerContent } from "./disclaimer-content";

export const metadata: Metadata = {
  title: "अस्वीकरण | Disclaimer",
  description:
    "PrintShubh ही खाजगी संस्था आहे — सरकारी संकेतस्थळ नाही.",
  alternates: { canonical: "/disclaimer" },
};

export default function DisclaimerPage() {
  return <DisclaimerContent />;
}
