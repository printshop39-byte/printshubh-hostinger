"use client";

import {
  ServicePageShell,
  ServiceSection,
  ServiceList,
  ServiceFaq,
} from "@/components/service-page-shell";
import { useLang } from "@/components/language-context";

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
  const { lang } = useLang();

  return (
    <ServicePageShell
      slug="dp-map-maharashtra"
      eyebrow={{ mr: "नगर रचना सेवा", en: "Town Planning Service" }}
      title={{
        mr: "DP Map / TP Map Maharashtra — Development Plan सहाय्य",
        en: "DP Map / TP Map Maharashtra — Development Plan Assistance",
      }}
      breadcrumb={{ mr: "DP / TP Map", en: "DP / TP Map" }}
      intro={{
        mr: "महाराष्ट्रातील Development Plan, TP Scheme आणि Regional Plan संदर्भासाठी WhatsApp वर खाजगी सहाय्य. झोन, आरक्षण, रस्ता रुंदी आणि FSI तपासण्याचा सोपा मार्ग.",
        en: "Private WhatsApp assistance for Maharashtra Development Plan, TP Scheme and Regional Plan references — zoning, reservations, road widths and FSI checks made simple.",
      }}
      updatedAt={lang === "mr" ? "मे २०२६" : "May 2026"}
      whatsappMessage={{
        mr: "नमस्कार, मला DP Map / TP Map तपासायचा आहे.\nजिल्हा / शहर:\nतालुका / Ward:\nCTS किंवा गट नंबर:\nप्रश्न (झोन / आरक्षण / FSI / रस्ता):",
        en: "Hello, I need to check the DP / TP Map.\nDistrict / City:\nTaluka / Ward:\nCTS or Gut number:\nQuestion (zone / reservation / FSI / road):",
      }}
      contentMr={<BodyMr />}
      contentEn={<BodyEn faqPairs={dpMapFaqEn} />}
    />
  );
}

function BodyMr() {
  return (
    <>
      <ServiceSection heading="सेवा म्हणजे काय?">
        <p>
          <strong>Development Plan (DP)</strong> आणि{" "}
          <strong>Town Planning Scheme (TP)</strong> हे महाराष्ट्र प्रादेशिक
          आणि नगर रचना अधिनियमांतर्गत मंजूर केलेले वैधानिक नकाशे आहेत. ते
          झोन-वर्गीकरण (निवासी, व्यावसायिक, औद्योगिक), रस्ता रुंदी, सार्वजनिक
          आरक्षण (बाग, शाळा, हॉस्पिटल), आणि भविष्यातील विकास दिशा यांची नोंद
          ठेवतात.
        </p>
        <p>
          PrintShubh टीम <strong>UDCPR 2020</strong>, मंजूर sanctioned DP
          प्रकाशने आणि संबंधित नगर रचना विभागांच्या{" "}
          <strong>अधिकृत सार्वजनिक स्रोतांवर</strong> तपास करून तुमच्या
          जमिनीवर लागू असलेल्या DP तरतुदी WhatsApp वर पाठवते — सोप्या भाषेत
          स्पष्ट करून.
        </p>
      </ServiceSection>

      <ServiceSection heading="कोणाला उपयोगी?">
        <ServiceList
          items={[
            "जमीन खरेदीपूर्वी आरक्षण / झोन तपासू इच्छिणारे.",
            "बांधकाम परवाना, NA अर्ज, FSI consumption planning करणारे.",
            "Real-estate developer, architect, structural consultant.",
            "Project finance आणि land due-diligence टीम.",
            "रस्ता रुंदीकरण / TP योजना अंतर्गत प्रभावित होणारे मालक.",
            "TDR (Transferable Development Rights) पडताळणी करणारे.",
          ]}
        />
      </ServiceSection>

      <ServiceSection heading="कोणती माहिती लागते?">
        <ServiceList
          items={[
            "जिल्हा / शहर (e.g. कोल्हापूर, पुणे, मुंबई, ठाणे).",
            "तालुका किंवा महानगरपालिका ward.",
            "CTS नंबर (शहरी जमिनी) किंवा गट नंबर (ग्रामीण).",
            "(पर्यायी) survey number, plot number, building name.",
            "तुमचा प्रश्न — झोन तपासणी, आरक्षण, FSI, किंवा रस्ता रुंदी.",
          ]}
        />
      </ServiceSection>

      <ServiceSection heading="WhatsApp वर प्रक्रिया कशी होते?">
        <ServiceList
          items={[
            "तुम्ही WhatsApp वर स्थान + CTS / गट नंबर + विशिष्ट प्रश्न शेअर करता.",
            "PrintShubh टीम संबंधित DP / TP नकाशा शोधते आणि तुमची जमीन कोणत्या भागात आहे ते निश्चित करते.",
            "लागू झोन, आरक्षण, रस्ता रुंदी आणि indicative FSI कळवले जाते.",
            "PDF excerpt + लघु लेखी अहवाल WhatsApp वर पाठवला जातो.",
            "शुल्क आधी सांगितले जाते; UPI पेमेंट.",
            "विशिष्ट प्लॉटसाठी DP तपशील नसल्यास परतावा.",
          ]}
        />
      </ServiceSection>

      <ServiceSection heading="PDF / दस्तऐवज सहाय्य">
        <p>
          आमचा अहवाल DP नकाशा excerpt, झोन-वर्ग, लागू आरक्षणे आणि रस्ता
          रुंदीसह तयार केला जातो. <strong>UDCPR 2020 अंतर्गत indicative
          FSI</strong> देखील नमूद होते — पण अंतिम परवानगी आर्किटेक्ट /
          महानगरपालिका विभागावर अवलंबून.
        </p>
        <p>
          आरक्षणाचा अर्थ <em>तुमची जमीन ताबडतोब बंद होणार</em> असा नाही — बहुतेक
          आरक्षणे सरकारी अधिग्रहण / TDR / accommodation reservation पद्धतीने
          सोडवली जातात. आम्ही या पुढच्या पावलांची दिशा देखील सांगतो.
        </p>
      </ServiceSection>

      <ServiceSection heading="महत्त्वाच्या सूचना">
        <ServiceList
          items={[
            "DP प्रकाशनांचे विविध revision असू शकतात — नवीनतम sanctioned आवृत्ती तपासावी.",
            "TP Scheme अंतर्गत final plots मूळ plots पेक्षा वेगळ्या असू शकतात.",
            "रस्ता रुंदीकरण proposed असू शकते — DP वर proposed आणि existing वेगवेगळ्या रंगात दिसते.",
            "एका CTS वर एकापेक्षा अधिक आरक्षणे असू शकतात — पूर्ण नकाशा तपासणे आवश्यक.",
            "औद्योगिक / SEZ / Eco-sensitive झोन असल्यास अतिरिक्त मंजुरी लागते.",
          ]}
        />
      </ServiceSection>

      <ServiceSection heading="PrintShubh सरकारी वेबसाइट नाही">
        <p>
          <strong>
            PrintShubh हे सरकारी संकेतस्थळ नाही. आम्ही अधिकृत स्रोतांवर आधारित
            खाजगी सहाय्य सेवा प्रदान करतो.
          </strong>{" "}
          बांधकाम परवाना, NA, किंवा कायदेशीर निर्णयासाठी संबंधित नगर रचना
          विभाग / महानगरपालिकेच्या अधिकृत प्रत व सही-शिक्का असलेल्या
          प्रकाशनांवरच अवलंबून रहावे.
        </p>
      </ServiceSection>

      <ServiceSection heading="वारंवार विचारले जाणारे प्रश्न">
        <ServiceFaq pairs={dpMapFaqMr} />
      </ServiceSection>
    </>
  );
}

function BodyEn({ faqPairs }: { faqPairs: Array<{ q: string; a: string }> }) {
  return (
    <>
      <ServiceSection heading="What is this service?">
        <p>
          The <strong>Development Plan (DP)</strong> and{" "}
          <strong>Town Planning Scheme (TP)</strong> are statutory maps
          sanctioned under Maharashtra's Regional and Town Planning Act. They
          record zoning (residential, commercial, industrial), road widths,
          public reservations (gardens, schools, hospitals) and future growth
          direction.
        </p>
        <p>
          The PrintShubh team checks <strong>UDCPR 2020</strong>, sanctioned
          DP publications and the relevant town-planning department's{" "}
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
