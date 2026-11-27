/**
 * FAQ data — shared between the interactive accordion (faq-content.tsx,
 * a client component) and the FAQPage JSON-LD emitted server-side from
 * faq/page.tsx. Kept in a plain (non-"use client") module so the server
 * component can import it without pulling a client boundary into the
 * <head> structured-data script.
 */

import type { Lang } from "@/components/language-context";

export interface Qa {
  q: string;
  /** Answer text — also used verbatim in the FAQPage JSON-LD. */
  a: string;
  /** Optional link shown right after the answer on the page. */
  link?: { href: string; label: string };
}

export const faqs: Record<Lang, Qa[]> = {
  mr: [
    {
      q: "माझी वैयक्तिक माहिती सुरक्षित आहे का?",
      a: "होय. तुम्ही दिलेले फोन नंबर, माप, डिझाइन आणि इतर तपशील फक्त तुमच्या सेवेसाठीच वापरले जातात — विकले जात नाहीत, जाहिरातीसाठी वापरले जात नाहीत. अधिक तपशीलासाठी आमचे Privacy Policy पहा.",
      link: { href: "/privacy", label: "Privacy Policy" },
    },
    {
      q: "Print Collections ची किंमत किती आहे?",
      a: "वॉलपेपर, कॅनव्हास, वॉल आर्ट, रेक्झिन/PU लेदरेट, साटीन फॅब्रिक, फ्रेम्ड प्रिंट्स आणि व्हिनाइल — या सातही Collections साठी निश्चित किंमत आधीच दाखवलेली नाही, कारण ती माप, मटेरियल आणि डिझाइननुसार बदलते. WhatsApp वर तुमची गरज सांगितल्यावर आम्ही अचूक किंमत सांगतो — काम सुरू होण्याआधी.",
    },
    {
      q: "मला माझ्या मापाप्रमाणे सानुकूल (custom size) प्रिंट मिळेल का?",
      a: "होय. प्रत्येक Collection साठी तुमच्या भिंतीच्या, फ्रेमच्या किंवा जागेच्या अचूक मापानुसार प्रिंट करून दिली जाते. Collection पानावरील 'Custom Size' बटणावरून माप पाठवा, आम्ही त्यानुसार किंमत कळवू.",
    },
    {
      q: "डिझाइन मलाच द्यावी लागते का?",
      a: "तुम्ही स्वतःची डिझाइन, फोटो किंवा पॅटर्न पाठवू शकता. डिझाइन उपलब्ध नसल्यास WhatsApp वर कळवा — आम्ही योग्य मार्गदर्शन करू.",
    },
    {
      q: "Print Collections चे फोटो / सॅम्पल पाहायला मिळतील का?",
      a: "प्रत्येक Collection पानावर डिझाइन प्रिव्ह्यू दाखवले आहेत. पूर्ण झालेल्या कामाचे फोटो आणि सॅम्पल WhatsApp वर शेअर करता येतात.",
    },
    {
      q: "ऑर्डर आणि डिलिव्हरी कशी होते?",
      a: "WhatsApp वर चौकशी करा, माप व डिझाइन पाठवा, किंमत व वेळ कळवली जाईल. मंजुरीनंतर काम सुरू होते आणि पूर्ण झाल्यावर पिकअप/डिलिव्हरीची व्यवस्था सांगितली जाते.",
    },
    {
      q: "Print Collections साठी पेमेंट कसे करावे?",
      a: "पेमेंट UPI / QR / GPay / PhonePe / Paytm द्वारे केले जाते. अंतिम किंमत कळवल्यानंतर आणि तुमच्या मंजुरीनंतरच पेमेंट घेतले जाते.",
    },
    {
      q: "किती दिवसांत ऑर्डर तयार होते?",
      a: "वेळ Collection, माप आणि प्रमाणावर अवलंबून असते. WhatsApp वर चौकशी करताना आम्ही अंदाजे वेळ सांगतो.",
    },
  ],
  en: [
    {
      q: "Is my personal information safe?",
      a: "Yes. The phone number, size, design and other details you share are used only for the requested service — never sold, never used for advertising. See our Privacy Policy for the full policy.",
      link: { href: "/privacy", label: "Privacy Policy" },
    },
    {
      q: "How much do the Print Collections cost?",
      a: "Wallpaper, canvas, wall art, rexine/PU leatherette, satin fabric, framed prints and vinyl — none of these seven collections show a fixed price upfront, because cost depends on size, material and design. Share your requirement on WhatsApp and we'll confirm the exact price before work begins.",
    },
    {
      q: "Can I get a print made to my own custom size?",
      a: "Yes. Every collection is printed to the exact size of your wall, frame or space. Use the \"Custom Size\" button on the collection page to share your measurements — we'll quote accordingly.",
    },
    {
      q: "Do I need to provide my own design?",
      a: "You can send your own design, photo or pattern. If you don't have one ready, let us know on WhatsApp and we'll guide you.",
    },
    {
      q: "Can I see photos or samples of the Print Collections?",
      a: "Each collection page shows design previews. Photos of finished work and samples can be shared on WhatsApp.",
    },
    {
      q: "How does ordering and delivery work?",
      a: "Enquire on WhatsApp, share your size and design, and we'll confirm price and timeline. Work starts after your approval, and pickup/delivery is arranged once it's ready.",
    },
    {
      q: "How do I pay for a Print Collection order?",
      a: "Payment is via UPI / QR / GPay / PhonePe / Paytm. Payment is taken only after the final price is confirmed and you approve it.",
    },
    {
      q: "How many days does an order take?",
      a: "Turnaround depends on the collection, size and quantity. We'll share an estimated timeline when you enquire on WhatsApp.",
    },
  ],
};
