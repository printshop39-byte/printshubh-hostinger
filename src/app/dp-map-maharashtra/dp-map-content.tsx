"use client";

import {
  ServicePageShell,
  ServiceSection,
  ServiceList,
  ServiceFaq,
} from "@/components/service-page-shell";

export const dpMapFaqMr: Array<{ q: string; a: string }> = [
  {
    q: "DP Map आणि TP Scheme यात फरक काय?",
    a: "DP (Development Plan) हा संपूर्ण महानगर / शहरासाठी असतो — झोन, रस्ते, आरक्षण आणि भविष्यातील विकास दर्शवतो. TP Scheme (Town Planning) हा एका विशिष्ट भागासाठी जमीन पुनर्रचना (land pooling) करणारी योजना असते — जमिनींचे पुनर्वाटप, अंतर्गत रस्ते आणि सुविधा क्षेत्रे यांचा तपशील देते.",
  },
  {
    q: "माझ्या जमिनीवर आरक्षण आहे की नाही हे कसे कळेल?",
    a: "जिल्हा, तालुका, गाव आणि CTS / गट नंबर शेअर करा. आम्ही UDCPR-संबंधित प्रकाशित DP / TP नकाशे तपासू आणि तुमच्या जमिनीवर आरक्षण (रस्ता, बाग, शाळा, सार्वजनिक सुविधा) आहे का ते कळवू.",
  },
  {
    q: "DP Map साठी कोणती माहिती लागते?",
    a: "जिल्हा, तालुका / महानगर, CTS नंबर किंवा गट नंबर. मुंबईसाठी ward नंबर देखील उपयोगी. आम्ही sanctioned DP नकाशा, झोनिंग टेबल आणि आरक्षण-नोंदी एकत्र पाठवतो.",
  },
  {
    q: "FSI आणि रस्ता रुंदी कशी तपासली जाते?",
    a: "DP योजना पाहून जमिनीच्या झोन-वर्गानुसार (R1, R2, C, I, इ.) आणि लगतच्या रस्त्याच्या रुंदीनुसार लागू FSI सांगता येतो. UDCPR 2020 अंतर्गत संगणकीय गणना देखील करता येते. आम्ही प्राथमिक संदर्भ देतो; अंतिम परवानगीसाठी आर्किटेक्ट किंवा महानगरपालिका विभाग आवश्यक.",
  },
  {
    q: "Regional Plan आणि Development Plan वेगळे आहेत का?",
    a: "हो. Regional Plan हा संपूर्ण प्रादेशिक क्षेत्रासाठी (e.g. MMR, Pune Metropolitan Region) धोरणात्मक मार्गदर्शक. DP विशिष्ट महानगर / शहरासाठी वैधानिक नकाशा. आम्ही दोन्ही प्रकारच्या नकाशांसाठी संदर्भ देऊ शकतो.",
  },
  {
    q: "DP नकाशा कायदेशीर वापरासाठी वैध आहे का?",
    a: "Sanctioned DP प्रकाशित नकाशा अनेक उपयोगांसाठी वैध संदर्भ. कायदेशीर प्रकरणे, बांधकाम परवाना, आणि NA अर्जासाठी संबंधित नगर रचना विभाग / महानगरपालिकेच्या stamped प्रत आवश्यक.",
  },
];

const dpMapFaqEn: Array<{ q: string; a: string }> = [
  {
    q: "What's the difference between a DP and a TP Scheme?",
    a: "DP (Development Plan) is the city-/metro-wide statutory plan showing zones, road network, reservations and future growth. A TP Scheme (Town Planning) is land-pooling-based reorganisation for a specific sub-area — reallotment, internal roads, public amenity plots.",
  },
  {
    q: "How do I check if my land has a reservation?",
    a: "Share district, taluka, village and CTS / Gut number. We look up the sanctioned DP / TP maps published under UDCPR and confirm whether your parcel falls under a reservation (road, garden, school, public amenity).",
  },
  {
    q: "What details are needed for a DP map check?",
    a: "District, taluka/metro, CTS or Gut number. For Mumbai, the ward number helps. We share the sanctioned DP map excerpt, zoning table and reservation notes together.",
  },
  {
    q: "How are FSI and road width determined?",
    a: "From the DP zoning class (R1/R2/C/I…) and the abutting road width, applicable FSI follows UDCPR 2020 tables. We provide the reference baseline; final clearance still goes through an architect / corporation department.",
  },
  {
    q: "Is the Regional Plan different from the DP?",
    a: "Yes. Regional Plans are policy guides for a whole region (e.g. MMR, PMRDA). DP is the statutory plan for a specific city/metro. We can assist with references for both.",
  },
  {
    q: "Is the DP map valid for legal use?",
    a: "The published sanctioned DP is a valid reference. For court use, permits or NA applications, the Town Planning department's stamped copy is generally required.",
  },
];

export function DpMapContent() {
  return (
    <ServicePageShell
      slug="dp-map-maharashtra"
      eyebrow="Town Planning Service"
      title="DP Map / TP Map Maharashtra — Development Plan Assistance"
      breadcrumb="DP / TP Map"
      intro="Private WhatsApp assistance for Maharashtra Development Plan, TP Scheme and Regional Plan references — zoning, reservations, road widths and FSI checks made simple."
      updatedAt="May 2026"
      whatsappMessage={"Hello, I need to check the DP / TP Map.\nDistrict / City:\nTaluka / Ward:\nCTS or Gut number:\nQuestion (zone / reservation / FSI / road):"}
      content={<Body faqPairs={dpMapFaqEn} />}
    />
  );
}

function Body({ faqPairs }: { faqPairs: Array<{ q: string; a: string }> }) {
  return (
    <>
      <ServiceSection heading="What is this service?">
        <p>
          The <strong>Development Plan (DP)</strong> and{" "}
          <strong>Town Planning Scheme (TP)</strong> are statutory maps
          sanctioned under Maharashtra&apos;s Regional and Town Planning Act. They
          record zoning (residential, commercial, industrial), road widths,
          public reservations (gardens, schools, hospitals) and future growth
          direction.
        </p>
        <p>
          The PrintShubh team checks <strong>UDCPR 2020</strong>, sanctioned
          DP publications and the relevant town-planning department&apos;s{" "}
          <strong>official public sources</strong> and delivers the DP
          provisions applicable to your land on WhatsApp — explained simply.
        </p>
      </ServiceSection>

      <ServiceSection heading="Who can use this?">
        <ServiceList
          items={[
            "Buyers checking reservation / zone before purchase.",
            "Anyone planning building permits, NA or FSI consumption.",
            "Real-estate developers, architects, structural consultants.",
            "Project finance and land due-diligence teams.",
            "Owners affected by road widening or TP schemes.",
            "Anyone exploring TDR (Transferable Development Rights).",
          ]}
        />
      </ServiceSection>

      <ServiceSection heading="What details are needed?">
        <ServiceList
          items={[
            "District / city (e.g. Kolhapur, Pune, Mumbai, Thane).",
            "Taluka or municipal ward.",
            "CTS number (urban) or Gut number (rural).",
            "(Optional) survey number, plot number, building name.",
            "Your question — zoning, reservation, FSI, or road check.",
          ]}
        />
      </ServiceSection>

      <ServiceSection heading="How does WhatsApp delivery work?">
        <ServiceList
          items={[
            "Share location + CTS / Gut number + specific question on WhatsApp.",
            "We locate the relevant DP / TP map and identify your land's position.",
            "We report applicable zone, reservations, road width and indicative FSI.",
            "PDF excerpt + short written summary delivered on WhatsApp.",
            "Fee quoted up-front; UPI payment.",
            "Refund if specific plot data is unavailable.",
          ]}
        />
      </ServiceSection>

      <ServiceSection heading="PDF / document assistance">
        <p>
          Our summary includes the DP map excerpt, zone class, applicable
          reservations and road width. <strong>Indicative FSI under UDCPR
          2020</strong> is noted — but final permit clearance depends on the
          architect / municipal department.
        </p>
        <p>
          A reservation does not mean immediate loss of your land — most are
          resolved via acquisition / TDR / accommodation-reservation
          mechanisms. We point to the next step.
        </p>
      </ServiceSection>

      <ServiceSection heading="Important notes">
        <ServiceList
          items={[
            "DPs go through revisions — use the latest sanctioned edition.",
            "Final plots under a TP scheme can differ from original plots.",
            "Road widening may be proposed — DP marks proposed and existing widths separately.",
            "One CTS may carry multiple reservations — read the full map.",
            "Industrial / SEZ / Eco-sensitive zones bring extra clearance steps.",
          ]}
        />
      </ServiceSection>

      <ServiceSection heading="PrintShubh is not a government website">
        <p>
          <strong>
            PrintShubh is not a government website. We provide private
            assistance based on official public sources.
          </strong>{" "}
          For permits, NA and legal decisions rely on stamped town-planning
          department publications.
        </p>
      </ServiceSection>

      <ServiceSection heading="Frequently asked questions">
        <ServiceFaq pairs={faqPairs} />
      </ServiceSection>
    </>
  );
}
