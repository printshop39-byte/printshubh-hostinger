import type { Metadata } from "next";
import { ServiceJsonLd } from "@/components/service-jsonld";
import { ShopServicePage } from "@/components/shop/shop-service-page";

/* New route. Additive only — no existing URL changes or redirects. */
/* No trailing slash: this project runs Next's default `trailingSlash: false`,
 * so /printing-xerox/ answers 308 -> /printing-xerox. Declaring the slashed
 * form as canonical would point the canonical at a redirect. The existing
 * land-document routes keep their slashed canonicals — those are already
 * indexed that way and are not worth disturbing. */
const PATH = "/photo-services";

export const metadata: Metadata = {
  // " | PrintShubh" is appended by the root layout title template.
  title: "पासपोर्ट फोटो, ID फोटो व फोटो प्रिंट",
  description:
    "पासपोर्ट फोटो, ID फोटो, मिनी फोटो, फोटो प्रिंटिंग आणि फोटो एडिटिंग. अर्जासाठी लागणाऱ्या मापात फोटो — दुकानातच काढून, तपासून, प्रिंट करून.",
  alternates: { canonical: PATH },
  openGraph: {
    type: "article",
    locale: "mr_IN",
    url: PATH,
    siteName: "PrintShubh",
    title: "पासपोर्ट फोटो, ID फोटो व फोटो प्रिंट | PrintShubh",
    description:
      "पासपोर्ट फोटो, ID फोटो, मिनी फोटो, फोटो प्रिंटिंग व एडिटिंग — PrintShubh.",
  },
  twitter: {
    card: "summary_large_image",
    title: "पासपोर्ट व ID फोटो | PrintShubh",
    description: "पासपोर्ट फोटो, ID फोटो, फोटो प्रिंटिंग व एडिटिंग.",
  },
};

const faqMr = [
  {
    q: "पासपोर्ट फोटो किती वेळात मिळतो?",
    a: "फोटो दुकानातच काढला जातो आणि सामान्यतः त्याच भेटीत प्रिंट करून दिला जातो. गर्दीच्या वेळी थोडा वेळ लागू शकतो.",
  },
  {
    q: "अर्जासाठी वेगळ्या मापाचा फोटो हवा असेल तर?",
    a: "कोणत्या अर्जासाठी हवा आहे ते सांगा — त्या अर्जाला लागणाऱ्या मापात आणि पार्श्वभूमीत फोटो तयार करून दिला जातो.",
  },
  {
    q: "मोबाइलमधला फोटो प्रिंट करून मिळेल का?",
    a: "होय. फोटो WhatsApp वर पाठवा, कोणत्या आकारात आणि किती प्रती हव्यात ते सांगा. किंमत कळवल्यानंतर प्रिंट तयार केली जाते.",
  },
  {
    q: "फोटो एडिटिंग म्हणजे काय केले जाते?",
    a: "पार्श्वभूमी बदलणे, आकार बरोबर करणे, उजेड-रंग सुधारणे यांसारखी अर्जासाठी आवश्यक ती दुरुस्ती केली जाते.",
  },
];

const faqEn = [
  {
    q: "How long does a passport photo take?",
    a: "The photo is taken at the counter and is usually printed during the same visit. It can take a little longer at busy times.",
  },
  {
    q: "What if the form needs a different size?",
    a: "Tell us which application it is for and the photo is produced in the size and background that form requires.",
  },
  {
    q: "Can you print a photo from my phone?",
    a: "Yes. Send it on WhatsApp with the size and number of copies you want. Once the price is agreed, the print is made ready.",
  },
  {
    q: "What does photo editing cover?",
    a: "Background changes, correcting the crop and size, and fixing brightness or colour — whatever the application needs.",
  },
];

export default function PhotoServicesPage() {
  return (
    <>
      <ServiceJsonLd
        path={PATH}
        serviceName="पासपोर्ट फोटो व फोटो प्रिंट सेवा"
        serviceNameEn="Passport Photo and Photo Printing Services"
        description="Passport photos, ID photos, mini photos, photo printing and photo editing at the PrintShubh counter, sized for the application the customer needs them for."
        breadcrumbLabel="फोटो सेवा"
        faqPairs={faqMr}
      />
      <ShopServicePage
        groupKey="photo"
        title={{
          mr: "पासपोर्ट फोटो, ID फोटो आणि फोटो प्रिंट",
          en: "Passport photos, ID photos and photo prints",
        }}
        intro={{
          mr: "अर्जाला नेमका कोणत्या मापाचा फोटो हवा आहे ते सांगा — फोटो काढून, आवश्यक ती दुरुस्ती करून, त्याच भेटीत प्रिंट करून दिला जातो. मोबाइलमधले फोटोही प्रिंट करून मिळतात.",
          en: "Tell us the size the form asks for — the photo is taken, corrected and printed in the same visit. Photos from your phone can be printed too.",
        }}
        steps={{
          mr: [
            "दुकानात या, किंवा फोटो WhatsApp वर पाठवा",
            "कोणत्या अर्जासाठी हवा आहे ते सांगा",
            "तपासून, प्रिंट करून तयार ठेवला जाईल",
          ],
          en: [
            "Come to the counter, or send the photo on WhatsApp",
            "Tell us which application it is for",
            "We check it, print it and keep it ready",
          ],
        }}
        faq={{ mr: faqMr, en: faqEn }}
      />
    </>
  );
}
