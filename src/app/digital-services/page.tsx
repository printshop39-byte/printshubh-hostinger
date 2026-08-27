import type { Metadata } from "next";
import { ServiceJsonLd } from "@/components/service-jsonld";
import { ShopServicePage } from "@/components/shop/shop-service-page";

/* New route. Additive only — no existing URL changes or redirects. */
/* No trailing slash: this project runs Next's default `trailingSlash: false`,
 * so /printing-xerox/ answers 308 -> /printing-xerox. Declaring the slashed
 * form as canonical would point the canonical at a redirect. The existing
 * land-document routes keep their slashed canonicals — those are already
 * indexed that way and are not worth disturbing. */
const PATH = "/digital-services";

export const metadata: Metadata = {
  // " | PrintShubh" is appended by the root layout title template.
  title: "ऑनलाइन फॉर्म, PDF सेवा व WhatsApp प्रिंटिंग",
  description:
    "ऑनलाइन फॉर्म भरण्यास मदत, PDF जोडणे-विभागणे-आकार कमी करणे, कागदपत्र सहाय्य आणि WhatsApp वरून प्रिंट. PrintShubh ही खाजगी सहाय्य सेवा आहे, सरकारी संकेतस्थळ नाही.",
  alternates: { canonical: PATH },
  openGraph: {
    type: "article",
    locale: "mr_IN",
    url: PATH,
    siteName: "PrintShubh",
    title: "ऑनलाइन फॉर्म, PDF सेवा व WhatsApp प्रिंटिंग | PrintShubh",
    description:
      "ऑनलाइन फॉर्म सहाय्य, PDF सेवा, कागदपत्र मदत आणि WhatsApp प्रिंटिंग — PrintShubh.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ऑनलाइन फॉर्म व PDF सेवा | PrintShubh",
    description: "ऑनलाइन फॉर्म सहाय्य, PDF सेवा आणि WhatsApp प्रिंटिंग.",
  },
};

const faqMr = [
  {
    q: "PrintShubh सरकारी कार्यालय आहे का?",
    a: "नाही. PrintShubh ही खाजगी सहाय्य सेवा आहे. आम्ही अर्ज भरण्यास आणि कागदपत्रे तयार करण्यास मदत करतो; अर्ज मंजूर करण्याचा किंवा नाकारण्याचा अधिकार संबंधित शासकीय विभागाकडेच असतो.",
  },
  {
    q: "WhatsApp प्रिंटिंग कशी चालते?",
    a: "PDF किंवा फोटो WhatsApp वर पाठवा, किती प्रती आणि कोणता आकार हवा ते सांगा. किंमत कळवल्यानंतर प्रिंट तयार करून ठेवली जाते आणि तयार झाल्यावर तुम्हाला कळवले जाते.",
  },
  {
    q: "PDF सेवेत काय काय होते?",
    a: "अनेक फाइल एकत्र जोडणे, मोठ्या PDF मधून हवी ती पाने वेगळी करणे, फाइलचा आकार कमी करणे आणि अर्जाला हव्या त्या स्वरूपात फाइल तयार करून देणे.",
  },
  {
    q: "माझी माहिती सुरक्षित राहते का?",
    a: "काम पूर्ण करण्यासाठी आवश्यक तेवढीच माहिती वापरली जाते. तपशिलासाठी आमचे गोपनीयता धोरण वाचा.",
  },
];

const faqEn = [
  {
    q: "Is PrintShubh a government office?",
    a: "No. PrintShubh is a private assistance service. We help you complete forms and prepare documents; only the relevant government department can approve or reject an application.",
  },
  {
    q: "How does WhatsApp printing work?",
    a: "Send the PDF or photo on WhatsApp with the number of copies and the size. Once the price is agreed the print is prepared, and we message you when it is ready.",
  },
  {
    q: "What is included in PDF services?",
    a: "Merging several files into one, pulling specific pages out of a large PDF, reducing the file size, and preparing the file in the format an application asks for.",
  },
  {
    q: "Is my information kept safe?",
    a: "Only the information needed to complete the job is used. See our privacy policy for the details.",
  },
];

export default function DigitalServicesPage() {
  return (
    <>
      <ServiceJsonLd
        path={PATH}
        serviceName="ऑनलाइन फॉर्म, PDF व डिजिटल कागदपत्र सहाय्य"
        serviceNameEn="Online Form, PDF and Digital Document Assistance"
        description="Private assistance with online form filling, PDF preparation, document handling and WhatsApp-based printing. PrintShubh is not a government website and cannot approve applications."
        breadcrumbLabel="डिजिटल सेवा"
        faqPairs={faqMr}
      />
      <ShopServicePage
        groupKey="digital"
        title={{
          mr: "ऑनलाइन फॉर्म, PDF सेवा आणि WhatsApp प्रिंटिंग",
          en: "Online forms, PDF services and WhatsApp printing",
        }}
        intro={{
          mr: "अर्ज ऑनलाइन भरायचा असो, PDF जोडायची असो किंवा घरून फाइल पाठवून प्रिंट घ्यायची असो — काउंटरवर मदत मिळते. PrintShubh ही खाजगी सहाय्य सेवा आहे, सरकारी संकेतस्थळ नाही.",
          en: "Whether it is an online form to fill, a PDF to put together, or a file to send from home and collect as a print — the counter can help. PrintShubh is a private assistance service, not a government website.",
        }}
        steps={{
          mr: [
            "काय काम आहे ते WhatsApp वर सांगा किंवा दुकानात या",
            "आवश्यक माहिती व फाइल्स गोळा केल्या जातील",
            "काम पूर्ण होऊन फाइल किंवा प्रिंट तयार मिळेल",
          ],
          en: [
            "Tell us the job on WhatsApp, or come to the counter",
            "We gather the details and files that are needed",
            "You get the finished file or the printed copy",
          ],
        }}
        faq={{ mr: faqMr, en: faqEn }}
      />
    </>
  );
}
