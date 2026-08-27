import type { Metadata } from "next";
import { ServiceJsonLd } from "@/components/service-jsonld";
import { ShopServicePage } from "@/components/shop/shop-service-page";

/* New route — it does not replace or redirect any existing page. The
 * land-document routes keep their URLs, metadata and content untouched. */
/* No trailing slash: this project runs Next's default `trailingSlash: false`,
 * so /printing-xerox/ answers 308 -> /printing-xerox. Declaring the slashed
 * form as canonical would point the canonical at a redirect. The existing
 * land-document routes keep their slashed canonicals — those are already
 * indexed that way and are not worth disturbing. */
const PATH = "/printing-xerox";

export const metadata: Metadata = {
  // The root layout appends " | PrintShubh" via the title template, so
  // the brand is deliberately absent here.
  title: "जंबो झेरॉक्स, प्रिंटिंग व स्कॅनिंग | Jumbo Xerox & Printing",
  description:
    "जंबो झेरॉक्स, रंगीत व ब्लॅक-अँड-व्हाइट झेरॉक्स, A4 / A3 प्रिंटिंग, पोस्टर प्रिंट, स्कॅनिंग, बाइंडिंग आणि लॅमिनेशन. WhatsApp वर PDF पाठवा, दुकानातून तयार प्रिंट घ्या.",
  alternates: { canonical: PATH },
  openGraph: {
    type: "article",
    locale: "mr_IN",
    url: PATH,
    siteName: "PrintShubh",
    title: "जंबो झेरॉक्स, प्रिंटिंग व स्कॅनिंग | PrintShubh",
    description:
      "जंबो झेरॉक्स, रंगीत झेरॉक्स, A4 / A3 प्रिंटिंग, स्कॅनिंग, बाइंडिंग व लॅमिनेशन — PrintShubh Jumbo Xerox.",
  },
  twitter: {
    card: "summary_large_image",
    title: "जंबो झेरॉक्स व प्रिंटिंग | PrintShubh",
    description: "जंबो झेरॉक्स, रंगीत प्रिंट, स्कॅनिंग, बाइंडिंग व लॅमिनेशन.",
  },
};

/* Single source for the FAQ copy: rendered on the page AND emitted as
 * FAQPage structured data, so the two can never drift apart. */
const faqMr = [
  {
    q: "जंबो झेरॉक्स म्हणजे काय?",
    a: "मोठ्या आकाराच्या कागदपत्रांची — नकाशे, आराखडे, बांधकाम ड्रॉइंग — मोठ्या आकारात काढलेली झेरॉक्स प्रत. सामान्य A4 मशीनवर ती बसत नाही.",
  },
  {
    q: "किंमत किती आहे?",
    a: "किंमत कागद, आकार, रंग आणि प्रतींच्या संख्येवर अवलंबून असते. त्यामुळे काम सुरू करण्यापूर्वी WhatsApp वर नेमकी किंमत कळवली जाते — छुपी फी नाही.",
  },
  {
    q: "WhatsApp वर फाइल पाठवून प्रिंट मिळेल का?",
    a: "होय. PDF किंवा फोटो WhatsApp वर पाठवा, किती प्रती, कोणता आकार आणि रंग हवा ते सांगा. किंमत कळवल्यानंतर प्रिंट तयार करून ठेवली जाते.",
  },
  {
    q: "स्कॅन केलेली फाइल कशी मिळेल?",
    a: "स्कॅन केलेली फाइल PDF स्वरूपात WhatsApp वर पाठवली जाते, किंवा हवे असल्यास प्रिंट काढून दिली जाते.",
  },
];

const faqEn = [
  {
    q: "What is jumbo xerox?",
    a: "A photocopy of an oversized document — maps, plans, construction drawings — reproduced at large format, which a standard A4 machine cannot handle.",
  },
  {
    q: "What does it cost?",
    a: "It depends on the paper, size, colour and number of copies, so the exact price is confirmed on WhatsApp before any work starts. No hidden fees.",
  },
  {
    q: "Can I send a file on WhatsApp and collect the print?",
    a: "Yes. Send the PDF or photo on WhatsApp with the number of copies, the size and whether you want colour. Once the price is agreed, the print is made ready for collection.",
  },
  {
    q: "How do I get a scanned file?",
    a: "The scan is sent back as a PDF on WhatsApp, or printed out for you if you prefer a hard copy.",
  },
];

export default function PrintingXeroxPage() {
  return (
    <>
      <ServiceJsonLd
        path={PATH}
        serviceName="जंबो झेरॉक्स, प्रिंटिंग व स्कॅनिंग सेवा"
        serviceNameEn="Jumbo Xerox, Printing and Scanning Services"
        description="Jumbo xerox, colour and black-and-white photocopying, A4 and A3 printing, poster printing, scanning, binding and lamination at the PrintShubh counter, with files accepted over WhatsApp."
        breadcrumbLabel="प्रिंटिंग व झेरॉक्स"
        faqPairs={faqMr}
      />
      <ShopServicePage
        groupKey="printing"
        title={{
          mr: "जंबो झेरॉक्स, प्रिंटिंग आणि स्कॅनिंग",
          en: "Jumbo xerox, printing and scanning",
        }}
        intro={{
          mr: "एका प्रतीपासून मोठ्या ऑर्डरपर्यंत — झेरॉक्स, रंगीत प्रिंट, A3 पोस्टर, स्कॅनिंग, बाइंडिंग आणि लॅमिनेशन एकाच काउंटरवर. फाइल WhatsApp वर पाठवली तरी चालते.",
          en: "From a single copy to a bulk order — photocopying, colour prints, A3 posters, scanning, binding and lamination at one counter. Sending the file on WhatsApp works just as well.",
        }}
        steps={{
          mr: [
            "फाइल WhatsApp वर पाठवा किंवा कागद घेऊन दुकानात या",
            "प्रती, आकार व रंग सांगा — किंमत लगेच कळवली जाईल",
            "प्रिंट तयार झाल्यावर कळवले जाईल",
          ],
          en: [
            "Send the file on WhatsApp, or bring the paper to the counter",
            "Tell us copies, size and colour — we quote straight away",
            "We message you when the print is ready",
          ],
        }}
        faq={{ mr: faqMr, en: faqEn }}
      />
    </>
  );
}
