"use client";

import {
  ServicePageShell,
  ServiceSection,
  ServiceList,
  ServiceFaq,
} from "@/components/service-page-shell";

export const gavNakashaFaqMr: Array<{ q: string; a: string }> = [
  {
    q: "गाव नकाशा म्हणजे काय?",
    a: "गाव नकाशा हा महाराष्ट्र शासनाच्या भूमी अभिलेख विभागाने तयार केलेला गावाच्या सीमा, गट / सर्वे नंबर, रस्ते, नाले व सार्वजनिक मालमत्तेची मांडणी दाखवणारा अधिकृत नकाशा आहे.",
  },
  {
    q: "गाव नकाशा कशासाठी लागतो?",
    a: "जमिनीची सीमा निश्चिती, शेजारच्या जमिनींचा संदर्भ, नवीन बांधकाम परवाना, NA अर्ज, कायदेशीर वाद, आणि कोर्ट प्रकरणांसाठी पुरावा म्हणून गाव नकाशा वापरला जातो.",
  },
  {
    q: "गाव नकाशा PDF साठी कोणती माहिती लागते?",
    a: "जिल्हा, तालुका आणि गाव लागते. जर एका विशिष्ट गटाचा नकाशा हवा असेल तर गट किंवा सर्वे नंबर शेअर करा. आम्ही Mahabhumi व Bhuvan स्रोतांवर उपलब्धता तपासतो.",
  },
  {
    q: "गट नकाशा आणि गाव नकाशा वेगळे आहेत का?",
    a: "हो. गाव नकाशा संपूर्ण गावाचा असतो; गट नकाशा फक्त एका गटाचा (किंवा सर्वे नंबरचा) तपशीलवार झूम-इन असतो. आम्ही दोन्ही प्रकारच्या नकाशांसाठी सहाय्य देतो.",
  },
  {
    q: "नकाशा अद्ययावत आहे की जुना?",
    a: "उपलब्ध डिजिटल नकाशे विविध वर्षांचे असू शकतात. अद्ययावत सीमेसाठी पुनर्मोजणी (Resurvey) नंतरचा नकाशा तपासावा. आम्ही PDF वर वर्ष / source नमूद करून देतो.",
  },
  {
    q: "नकाशा कायदेशीर वापरासाठी वैध आहे का?",
    a: "Mahabhumi / Bhuvan वरून मिळवलेला नकाशा अनेक संदर्भांसाठी उपयोगी, पण कायदेशीर वादांसाठी तहसील कार्यालयाची सही-शिक्का असलेली प्रत किंवा भूमी मोजणी अधिकाऱ्याची मोजणी आवश्यक.",
  },
];

const gavNakashaFaqEn: Array<{ q: string; a: string }> = [
  {
    q: "What is a village map (Gav Nakasha)?",
    a: "A village map is an official cadastral-style map prepared by the Maharashtra Bhumi Abhilekh department showing village boundaries, Gut / Survey numbers, roads, water bodies and public assets.",
  },
  {
    q: "What is the village map used for?",
    a: "Boundary identification, neighbour-parcel reference, building permits, NA applications, court evidence and any land dispute that needs a spatial reference.",
  },
  {
    q: "What details are needed for a village map PDF?",
    a: "District, taluka and village. For a specific Gut/Survey-level zoom, share that number too. We check availability on Mahabhumi and Bhuvan.",
  },
  {
    q: "Is a Gut map the same as a Village map?",
    a: "No. The village map covers the whole village; the Gut map is a zoomed detail of one Gut or Survey number. We can assist with either.",
  },
  {
    q: "Are these maps current or historical?",
    a: "Digital maps available span several years. For up-to-date boundaries the post-resurvey map is preferred. We note the year/source on the PDF wherever known.",
  },
  {
    q: "Is the map valid for legal use?",
    a: "Maps from Mahabhumi / Bhuvan are useful for reference; legal disputes generally require a Tehsil-stamped copy or a fresh measurement by the Bhumi Mojni officer.",
  },
];

export function GavNakashaContent() {
  return (
    <ServicePageShell
      slug="gav-nakasha-maharashtra"
      eyebrow="Maharashtra Map Service"
      title="Village Map Maharashtra — Gav Nakasha PDF Assistance"
      breadcrumb="Village Map"
      intro="Get village maps, Gut maps and Survey-number reference maps over WhatsApp. Share district, taluka, village — receive the PDF on the same chat."
      updatedAt="May 2026"
      whatsappMessage={"Hello, I need a village map (Gav Nakasha).\nDistrict:\nTaluka:\nVillage:\n(Optional) Gut / Survey number:"}
      content={<Body faqPairs={gavNakashaFaqEn} />}
    />
  );
}

function Body({ faqPairs }: { faqPairs: Array<{ q: string; a: string }> }) {
  return (
    <>
      <ServiceSection heading="What is this service?">
        <p>
          The <strong>village map (Gav Nakasha)</strong> is an official map
          prepared by Maharashtra&apos;s Bhumi Abhilekh department showing the
          village boundary, every Gut / Survey number&apos;s layout, internal
          roads, water bodies, public assets and neighbour relationships.
          It&apos;s referenced often in land transactions, building permits and
          court matters.
        </p>
        <p>
          The PrintShubh team locates the publicly available map from{" "}
          <strong>Mahabhumi, Bhuvan</strong> and other{" "}
          <strong>official public sources</strong> and delivers a clean,
          readable PDF on WhatsApp. We do not create maps — we{" "}
          <em>retrieve</em> them.
        </p>
      </ServiceSection>

      <ServiceSection heading="Who can use this?">
        <ServiceList
          items={[
            "Farmers wanting to understand land boundary, neighbours and layout.",
            "Investors needing a spatial reference before buying land.",
            "Anyone applying for building permits, NA conversion or zoning checks.",
            "Litigants needing visual evidence in land disputes or court cases.",
            "Families working through inheritance / partition.",
            "Agri-tech, surveying and site-planning teams.",
          ]}
        />
      </ServiceSection>

      <ServiceSection heading="What details are needed?">
        <ServiceList
          items={[
            "District, taluka, village — the base reference.",
            "(Optional) Gut number or Survey number — for a specific zoom.",
            "(Optional) Preferred map year — current vs pre-resurvey.",
            "(Optional) Print-ready or digital-only preference.",
          ]}
        />
      </ServiceSection>

      <ServiceSection heading="How does WhatsApp delivery work?">
        <ServiceList
          items={[
            "Share district, taluka, village (and Gut number if known) on WhatsApp.",
            "We search Mahabhumi and Bhuvan for the available map.",
            "Fee is quoted up-front; we proceed only after approval.",
            "Payment via UPI — Google Pay, PhonePe or Paytm.",
            "The map PDF is sent on WhatsApp.",
            "If the map isn't available, the refund policy applies.",
          ]}
        />
      </ServiceSection>

      <ServiceSection heading="PDF / document assistance">
        <p>
          The village map PDF is print-ready — A4 or A3. On request we can
          highlight your specific parcel (circle or arrow) so the boundary
          check is easy.
        </p>
        <p>
          Areas shown on the map are <em>indicative</em>. Final legal area
          requires a Bhumi Mojni officer&apos;s measurement.
        </p>
      </ServiceSection>

      <ServiceSection heading="Important notes">
        <ServiceList
          items={[
            "Map scales vary — fitting a whole village on A4 may break ¼\" = 10' parcel scale.",
            "Re-surveyed villages have separate old and new maps; pick the right one for your purpose.",
            "Map boundary may not exactly match ground-truth — only a fresh measurement is the final word.",
            "If rivers, drains or roads have changed, look for the newer record.",
          ]}
        />
      </ServiceSection>

      <ServiceSection heading="PrintShubh is not a government website">
        <p>
          <strong>
            PrintShubh is not a government website. We provide private
            assistance based on official public sources.
          </strong>{" "}
          For legal-evidence use, obtain a Tehsil-stamped copy.
        </p>
      </ServiceSection>

      <ServiceSection heading="Frequently asked questions">
        <ServiceFaq pairs={faqPairs} />
      </ServiceSection>
    </>
  );
}
