/**
 * MAHA local-name lookup helpers.
 *
 * Source: 'Maha Village Search' HTML reference compiled by Sagar from CSV;
 * uploaded as maha_village_search.html. The taluka section (~21 KB) is small
 * enough to inline as a TS module; the village section (~1.3 MB) is shipped
 * as /public/data/maha-village-names.json and lazy-fetched on first taluka
 * selection.
 *
 * Match rules:
 *   - Taluka:  match the existing English taluka name against MAHA_TALUKAS[district].name
 *              (case- and punctuation-tolerant) → use .local for Marathi.
 *   - Village: from the matched taluka grab .code, then fetch
 *              maha-village-names.json (cached) and look up villages[code] by .n
 *              → use .l for Marathi.
 *   - If .local or .l is empty / missing, fall back to the original English.
 *
 * The existing /data/dropdowns/* JSON, district_id / taluka_id / village_id
 * keys, and boundary fetch URLs are NOT touched — this layer only swaps the
 * *display label* shown in dropdown options and stored in form.taluka /
 * form.village (so the WhatsApp message picks the local name automatically).
 */

import type { Lang } from "@/components/language-context";
import {
  DISTRICT_ID_FALLBACK_EN,
  KNOWN_NAME_FIXES,
} from "@/lib/maharashtra-name-map";

interface TalukaEntry { name: string; local: string; code: number; }
type TalukasByDistrict = Record<string, TalukaEntry[]>;

interface VillageEntry { n: string; l: string; }
type VillagesByTalukaCode = Record<string, VillageEntry[]>;

/* ── Talukas inlined (small, always needed) ─────────────────────────── */
export const MAHA_TALUKAS: TalukasByDistrict = {"AMRAVATI":[{"name":"Achalpur","local":"अचलपूर","code":4004},{"name":"Amravati","local":"अमरावती","code":4009},{"name":"Anjangaon Surji","local":"अंजनगाव सुर्जी","code":4003},{"name":"Bhatkuli","local":"भाटकुली","code":4010},{"name":"Chandur Railway","local":"चांदूर रेल्वे","code":4013},{"name":"Chandurbazar","local":"चांदूर बाजार","code":4005},{"name":"Chikhaldara","local":"चिखलदारा","code":4002},{"name":"Daryapur","local":"दर्यापूर","code":4011},{"name":"Dhamangaon Railway","local":"धामनगाव रेल्वे","code":4014},{"name":"Dharni","local":"धारणी","code":4001},{"name":"Morshi","local":"मोरशी","code":4006},{"name":"Nandgaon-Khandeshwar","local":"नांदगाव खांडेश्वर","code":4012},{"name":"Teosa","local":"तिवसा","code":4008},{"name":"Warud","local":"वारूड","code":4007}],"GADCHIROLI":[{"name":"Aheri","local":"","code":4062},{"name":"Armori","local":"आरमोरी","code":4053},{"name":"Bhamragad","local":"","code":4061},{"name":"Chamorshi","local":"","code":4058},{"name":"Desaiganj (Vadasa)","local":"","code":4052},{"name":"Dhanora","local":"","code":4056},{"name":"Etapalli","local":"","code":4060},{"name":"Gadchiroli","local":"","code":4057},{"name":"Korchi","local":"","code":4055},{"name":"Kurkheda","local":"","code":4054},{"name":"Mulchera","local":"","code":4059},{"name":"Sironcha","local":"","code":4063}],"LATUR":[{"name":"Ahmadpur","local":"अहमदपूर","code":4228},{"name":"Ausa","local":"औसा","code":4232},{"name":"Chakur","local":"चाकूर","code":4230},{"name":"Deoni","local":"देवनी","code":4234},{"name":"Jalkot","local":"जलकोट","code":4229},{"name":"Latur","local":"लातूर","code":4226},{"name":"Nilanga","local":"निलंगा","code":4233},{"name":"Renapur","local":"रेनापूर","code":4227},{"name":"Shirur-Anantpal","local":"शिरूर अनंतपाळ","code":4231},{"name":"Udgir","local":"उदगीर","code":4235}],"KOLHAPUR":[{"name":"Ajra","local":"आजरा","code":4292},{"name":"Bavda","local":"गगनबावडा","code":4288},{"name":"Bhudargad","local":"बुधरगड","code":4291},{"name":"Chandgad","local":"चांदगड","code":4294},{"name":"Gadhinglaj","local":"गडहिंग्लज","code":4293},{"name":"Hatkanangle","local":"हातकणंगले","code":4285},{"name":"Kagal","local":"कागल","code":4290},{"name":"Karvir","local":"करवीर","code":4287},{"name":"Panhala","local":"पन्हाळा","code":4284},{"name":"Radhanagari","local":"राधानगरी","code":4289},{"name":"Shahuwadi","local":"शाहूवाडी","code":4283},{"name":"Shirol","local":"शिरोळ","code":4286}],"SOLAPUR":[{"name":"Akkalkot","local":"अक्कलकोट","code":4254},{"name":"Barshi","local":"बार्शी","code":4246},{"name":"Karmala","local":"करमाळा","code":4244},{"name":"Madha","local":"माढा","code":4245},{"name":"Malshiras","local":"माळशिरस","code":4250},{"name":"Mangalvedhe","local":"मंगलवेढे","code":4252},{"name":"Mohol","local":"मोहोळ","code":4248},{"name":"Pandharpur","local":"पंढरपूर","code":4249},{"name":"Sangole","local":"सांगोला","code":4251},{"name":"Solapur North","local":"उत्तर सोलापूर","code":4247},{"name":"Solapur South","local":"दक्षिण सोलापूर","code":4253}],"NANDURBAR":[{"name":"Akkalkuwa","local":"अक्कलकुवा","code":3950},{"name":"Akrani","local":"अकर्नी","code":3951},{"name":"Nandurbar","local":"नंदूरबार","code":3954},{"name":"Nawapur","local":"नवापूर","code":3955},{"name":"Shahade","local":"शहादा","code":3953},{"name":"Talode","local":"तलोदा","code":3952}],"AKOLA":[{"name":"Akola","local":"अकोला","code":3991},{"name":"Akot","local":"अकोट","code":3989},{"name":"Balapur","local":"बालापूर","code":3990},{"name":"Barshitakli","local":"बार्शीटाकळी","code":3994},{"name":"Murtijapur","local":"मुर्तिजापूर","code":3992},{"name":"Patur","local":"पातूर","code":3993},{"name":"Telhara","local":"तेलहारा","code":3988}],"AHMEDNAGAR":[{"name":"Akola","local":"अकोले","code":4201},{"name":"Jamkhed","local":"जामखेड","code":4214},{"name":"Karjat","local":"कर्जत","code":4213},{"name":"Kopargaon","local":"कोपरगाव","code":4203},{"name":"Nagar","local":"नगर","code":4209},{"name":"Nevasa","local":"नेवासा","code":4206},{"name":"Parner","local":"पारनेर","code":4211},{"name":"Pathardi","local":"पाथर्डी","code":4208},{"name":"Rahta","local":"रहाता","code":4204},{"name":"Rahuri","local":"राहुरी","code":4210},{"name":"Sangamner","local":"संगमनेर","code":4202},{"name":"Shevgaon","local":"शेगाव","code":4207},{"name":"Shrigonda","local":"श्रीगोंदा","code":4212},{"name":"Shrirampur","local":"श्रीरामपूर","code":4205}],"RAIGAD":[{"name":"Alibag","local":"अलिबाग","code":4177},{"name":"Karjat","local":"कर्जत","code":4174},{"name":"Khalapur","local":"खालापूर","code":4175},{"name":"Mahad","local":"महाड","code":4185},{"name":"Mangaon","local":"मानगाव","code":4181},{"name":"Mhasla","local":"म्हासळा","code":4184},{"name":"Murud","local":"मुरूड","code":4178},{"name":"Panvel","local":"पनवेल","code":4173},{"name":"Pen","local":"पेण","code":4176},{"name":"Poladpur","local":"पोलादपूर","code":4186},{"name":"Roha","local":"रोहा","code":4179},{"name":"Shrivardhan","local":"श्रीवर्धन","code":4183},{"name":"Sudhagad","local":"सुधागड","code":4180},{"name":"Tala","local":"ताला","code":4182},{"name":"Uran","local":"उरण","code":4172}],"JALGAON":[{"name":"Amalner","local":"","code":3969},{"name":"Bhadgaon","local":"","code":3971},{"name":"Bhusawal","local":"","code":3965},{"name":"Bodvad","local":"","code":3964},{"name":"Chalisgaon","local":"","code":3972},{"name":"Chopda","local":"","code":3960},{"name":"Dharangaon","local":"","code":3968},{"name":"Erandol","local":"एरंडोल","code":3967},{"name":"Jalgaon","local":"","code":3966},{"name":"Jamner","local":"","code":3974},{"name":"Muktainagar (Edlabad)","local":"","code":3963},{"name":"Pachora","local":"","code":3973},{"name":"Parola","local":"","code":3970},{"name":"Raver","local":"","code":3962},{"name":"Yawal","local":"","code":3961}],"JALNA":[{"name":"Ambad","local":"","code":4129},{"name":"Badnapur","local":"","code":4128},{"name":"Bhokardan","local":"","code":4125},{"name":"Ghansawangi","local":"","code":4130},{"name":"Jafferabad","local":"","code":4126},{"name":"Jalna","local":"","code":4127},{"name":"Mantha","local":"","code":4132},{"name":"Partur","local":"","code":4131}],"THANE":[{"name":"Ambarnath","local":"अंबरनाथ","code":4170},{"name":"Bhiwandi","local":"भिवंडी","code":4166},{"name":"Kalyan","local":"कल्याण","code":4168},{"name":"Murbad","local":"मुरबाड","code":4171},{"name":"Shahapur","local":"शहापूर","code":4167},{"name":"Thane","local":"ठाणे","code":4165},{"name":"Ulhasnagar","local":"उल्हासनगर","code":4169}],"PUNE":[{"name":"Ambegaon","local":"अंबरनाथ","code":4188},{"name":"Baramati","local":"बारामती","code":4199},{"name":"Bhor","local":"भोर","code":4198},{"name":"Daund","local":"दौंड","code":4195},{"name":"Haveli","local":"हवेली","code":4193},{"name":"Indapur","local":"इंदापूर","code":4200},{"name":"Junnar","local":"जुन्नर","code":4187},{"name":"Khed","local":"खेड","code":4190},{"name":"Mawal","local":"मवाळ","code":4191},{"name":"Mulshi","local":"मुळशी","code":4192},{"name":"Pune City","local":"पुणे शहर","code":4194},{"name":"Purandhar","local":"पुरंदर","code":4196},{"name":"Shirur","local":"शिरूर","code":4189},{"name":"Velhe","local":"वेल्हे","code":4197}],"BEED":[{"name":"Ambejogai","local":"आंबेजोगाई","code":4225},{"name":"Ashti","local":"अष्टी","code":4215},{"name":"Bid","local":"बीड","code":4221},{"name":"Dharur","local":"धारूर","code":4223},{"name":"Georai","local":"गेवराई","code":4218},{"name":"Kaij","local":"कैज","code":4222},{"name":"Manjlegaon","local":"माजलगाव","code":4219},{"name":"Parli","local":"परळी","code":4224},{"name":"Patoda","local":"पतोडा","code":4216},{"name":"Shirur (Kasar)","local":"शिरूर (कासार)","code":4217},{"name":"Wadwani","local":"वडवणी","code":4220}],"GONDIA":[{"name":"Amgaon","local":"आमगाव","code":4047},{"name":"Arjuni Morgaon","local":"अर्जुनी मोरगाव","code":4050},{"name":"Deori","local":"देवरी","code":4051},{"name":"Gondiya","local":"गोंदिया","code":4046},{"name":"Goregaon","local":"गोरेगाव","code":4045},{"name":"Sadak-Arjuni","local":"सडक अर्जुनी","code":4049},{"name":"Salekasa","local":"सालेकसा","code":4048},{"name":"Tirora","local":"तिरोडा","code":4044}],"NANDED":[{"name":"Ardhapur","local":"अर्धापूर","code":4099},{"name":"Bhokar","local":"भोकर","code":4102},{"name":"Biloli","local":"बिलोली","code":4105},{"name":"Deglur","local":"देगलुर","code":4110},{"name":"Dharmabad","local":"धर्माबाद","code":4104},{"name":"Hadgaon","local":"हदगाव","code":4098},{"name":"Himayatnagar","local":"हिमायतनगर","code":4097},{"name":"Kandhar","local":"कंधार","code":4108},{"name":"Kinwat","local":"किनवत","code":4096},{"name":"Loha","local":"लोहा","code":4107},{"name":"Mahoor","local":"माहूर","code":4095},{"name":"Mudkhed","local":"मुदखेड","code":4101},{"name":"Mukhed","local":"मुखेड","code":4109},{"name":"Naigaon (Khairgaon)","local":"नायगाव (खु)","code":4106},{"name":"Nanded","local":"नांदेड","code":4100},{"name":"Umri","local":"उमरी","code":4103}],"YAVATMAL":[{"name":"Arni","local":"अर्नी","code":4088},{"name":"Babulgaon","local":"बाबूलगाव","code":4080},{"name":"Darwha","local":"धारवा","code":4083},{"name":"Digras","local":"दिग्रस","code":4084},{"name":"Ghatanji","local":"घट्नजी","code":4089},{"name":"Kalamb","local":"कळंब","code":4081},{"name":"Kelapur","local":"केलापूर","code":4090},{"name":"Mahagaon","local":"महागाव","code":4087},{"name":"Maregaon","local":"मारेगाव","code":4092},{"name":"Ner","local":"नेर","code":4079},{"name":"Pusad","local":"पूसद","code":4085},{"name":"Ralegaon","local":"राळेगाव","code":4091},{"name":"Umarkhed","local":"उमरखेड","code":4086},{"name":"Wani","local":"वनी","code":4094},{"name":"Yavatmal","local":"यवतमाळ","code":4082},{"name":"Zari-Jamani","local":"जरी जामनी","code":4093}],"WARDHA":[{"name":"Arvi","local":"आर्वी","code":4017},{"name":"Ashti","local":"अष्टी","code":4015},{"name":"Deoli","local":"देवळी","code":4020},{"name":"Hinganghat","local":"हिंगणघाट","code":4021},{"name":"Karanja","local":"कारंजा","code":4016},{"name":"Samudrapur","local":"समुद्रपूर","code":4022},{"name":"Seloo","local":"सेलू","code":4018},{"name":"Wardha","local":"वर्धा","code":4019}],"SANGLI":[{"name":"Atpadi","local":"आटपाडी","code":4300},{"name":"Jat","local":"जत","code":4304},{"name":"Kadegaon","local":"कडेगाव","code":4298},{"name":"Kavathemahankal","local":"कवठे महांकाळ","code":4303},{"name":"Khanapur","local":"खानापूर","code":4299},{"name":"Miraj","local":"मिरज","code":4302},{"name":"Palus","local":"पलुस","code":4297},{"name":"Shirala","local":"शिराळा","code":4295},{"name":"Tasgaon","local":"तासगाव","code":4301},{"name":"Walwa","local":"वाळवा","code":4296}],"HINGOLI":[{"name":"Aundha (Nagnath)","local":"","code":4113},{"name":"Basmath","local":"","code":4115},{"name":"Hingoli","local":"","code":4112},{"name":"Kalamnuri","local":"","code":4114},{"name":"Sengaon","local":"","code":4111}],"AURANGABAD":[{"name":"Aurangabad","local":"औरंगाबाद","code":4137},{"name":"Gangapur","local":"गंगापूर","code":4140},{"name":"Kannad","local":"कन्नड","code":4133},{"name":"Khuldabad","local":"खुल्ताबाद","code":4138},{"name":"Paithan","local":"पैठण","code":4141},{"name":"Phulambri","local":"फुलंब्री","code":4136},{"name":"Sillod","local":"सिल्लोड","code":4135},{"name":"Soegaon","local":"सोयेगाव","code":4134},{"name":"Vaijapur","local":"वैजापूर","code":4139}],"NASHIK":[{"name":"Baglan","local":"बागलण","code":4145},{"name":"Chandvad","local":"चांदवड","code":4148},{"name":"Deola","local":"देवळा","code":4144},{"name":"Dindori","local":"दिंडोरी","code":4149},{"name":"Igatpuri","local":"इगतपूरी","code":4153},{"name":"Kalwan","local":"कालवण","code":4143},{"name":"Malegaon","local":"मालेगाव","code":4146},{"name":"Nandgaon","local":"नांदगाव","code":4147},{"name":"Nashik","local":"नाशिक","code":4152},{"name":"Niphad","local":"निफाड","code":4155},{"name":"Peth","local":"पेठ","code":4150},{"name":"Sinnar","local":"सिन्नर","code":4154},{"name":"Surgana","local":"सुरगना","code":4142},{"name":"Trimbakeshwar","local":"त्र्यंबक","code":4151},{"name":"Yevla","local":"येवला","code":4156}],"CHANDRAPUR":[{"name":"Ballarpur","local":"","code":4074},{"name":"Bhadravati","local":"","code":4070},{"name":"Brahmapuri","local":"","code":4067},{"name":"Chandrapur","local":"","code":4071},{"name":"Chimur","local":"","code":4065},{"name":"Gondpipri","local":"","code":4078},{"name":"Jiwati","local":"","code":4076},{"name":"Korpana","local":"","code":4075},{"name":"Mul","local":"","code":4072},{"name":"Nagbhir","local":"नागभीड","code":4066},{"name":"Pombhurna","local":"","code":4073},{"name":"Rajura","local":"","code":4077},{"name":"Sawali","local":"","code":4068},{"name":"Sindewahi","local":"","code":4069},{"name":"Warora","local":"","code":4064}],"BHANDARA":[{"name":"Bhandara","local":"भंडारा","code":4039},{"name":"Lakhandur","local":"लाखंदूर","code":4043},{"name":"Lakhani","local":"लाखनी","code":4041},{"name":"Mohadi","local":"मोहाडी","code":4038},{"name":"Pauni","local":"पाउनी","code":4042},{"name":"Sakoli","local":"साकोली","code":4040},{"name":"Tumsar","local":"तुमसर","code":4037}],"NAGPUR":[{"name":"Bhiwapur","local":"भिवापूर","code":4036},{"name":"Hingna","local":"हिंगणा","code":4033},{"name":"Kalameshwar","local":"कळंमेश्वर","code":4025},{"name":"Kamptee","local":"कामथी","code":4030},{"name":"Katol","local":"काटोळ","code":4024},{"name":"Kuhi","local":"कुही","code":4035},{"name":"Mauda","local":"मौदा","code":4029},{"name":"Nagpur (Rural)","local":"नागपूर (ग्रामीण)","code":4031},{"name":"Nagpur (Urban)","local":"नागपूर (शहर)","code":4032},{"name":"Narkhed","local":"नारखेड","code":4023},{"name":"Parseoni","local":"पारशिवनी","code":4027},{"name":"Ramtek","local":"रामटेक","code":4028},{"name":"Savner","local":"सावनेर","code":4026},{"name":"Umred","local":"उमरेड","code":4034}],"OSMANABAD":[{"name":"Bhum","local":"भूम","code":4237},{"name":"Kalamb","local":"कळंब","code":4239},{"name":"Lohara","local":"लोहारा","code":4242},{"name":"Osmanabad","local":"उस्मानाबाद","code":4240},{"name":"Paranda","local":"परंडा","code":4236},{"name":"Tuljapur","local":"तुळजापूर","code":4241},{"name":"Umarga","local":"उमरगा","code":4243},{"name":"Washi","local":"वाशी","code":4238}],"BULDHANA":[{"name":"Buldana","local":"बुलढाणा","code":3984},{"name":"Chikhli","local":"चिखली","code":3983},{"name":"Deolgaon Raja","local":"देउळगाव राजा","code":3985},{"name":"Jalgaon (Jamod)","local":"जळगाव जामोद","code":3975},{"name":"Khamgaon","local":"खामगाव","code":3981},{"name":"Lonar","local":"लोणार","code":3987},{"name":"Malkapur","local":"मलकापूर","code":3979},{"name":"Mehkar","local":"मेहकर","code":3982},{"name":"Motala","local":"मातोळा","code":3980},{"name":"Nandura","local":"नंदूरा","code":3978},{"name":"Sangrampur","local":"संग्रामपूर","code":3976},{"name":"Shegaon","local":"शेगाव","code":3977},{"name":"Sindkhed Raja","local":"सिंधखेड राजा","code":3986}],"RATNAGIRI":[{"name":"Chiplun","local":"चिपळूण","code":4269},{"name":"Dapoli","local":"दापोली","code":4267},{"name":"Guhagar","local":"गुहाघर","code":4270},{"name":"Khed","local":"खेड","code":4268},{"name":"Lanja","local":"लांजा","code":4273},{"name":"Mandangad","local":"मंडणगड","code":4266},{"name":"Rajapur","local":"राजापूर","code":4274},{"name":"Ratnagiri","local":"रत्नागिरी","code":4271},{"name":"Sangameshwar","local":"संगमेश्वर","code":4272}],"PALGHAR":[{"name":"Dahanu","local":"डहाणू","code":4158},{"name":"Jawhar","local":"जव्हार","code":4160},{"name":"Mokhada","local":"मोखाडा","code":4161},{"name":"Palghar","local":"पालघर","code":4163},{"name":"Talasari","local":"तलासरी","code":4157},{"name":"Vada","local":"वाडा","code":4162},{"name":"Vasai","local":"वसई","code":4164},{"name":"Vikramgad","local":"विक्रमगड","code":4159}],"SINDHUDURG":[{"name":"Devgad","local":"देवगड","code":4275},{"name":"Dodamarg","local":"दोडामार्ग","code":4282},{"name":"Kankavli","local":"कणकवली","code":4277},{"name":"Kudal","local":"कुडाळ","code":4280},{"name":"Malwan","local":"मालवण","code":4278},{"name":"Sawantwadi","local":"सावंतवाडी","code":4281},{"name":"Vaibhavvadi","local":"वैभववाडी","code":4276},{"name":"Vengurla","local":"वेंगुर्ला","code":4279}],"DHULE":[{"name":"Dhule","local":"","code":3959},{"name":"Sakri","local":"","code":3958},{"name":"Shirpur","local":"","code":3956},{"name":"Sindkhede","local":"","code":3957}],"PARBHANI":[{"name":"Gangakhed","local":"गंगाखेड","code":4122},{"name":"Jintur","local":"जिंतुर","code":4117},{"name":"Manwath","local":"मानवत","code":4119},{"name":"Palam","local":"पालम","code":4123},{"name":"Parbhani","local":"परभणी","code":4118},{"name":"Pathri","local":"पातरी","code":4120},{"name":"Purna","local":"पुर्णा","code":4124},{"name":"Sailu","local":"सेलू","code":4116},{"name":"Sonpeth","local":"सोनपेठ","code":4121}],"SATARA":[{"name":"Jaoli","local":"जावळी","code":4263},{"name":"Karad","local":"कराड","code":4265},{"name":"Khandala","local":"खंडाळा","code":4257},{"name":"Khatav","local":"खटाव","code":4260},{"name":"Koregaon","local":"कोरेगाव","code":4261},{"name":"Mahabaleshwar","local":"महाबळेश्वर","code":4255},{"name":"Man","local":"मान","code":4259},{"name":"Patan","local":"पाटण","code":4264},{"name":"Phaltan","local":"फलटण","code":4258},{"name":"Satara","local":"सातारा","code":4262},{"name":"Wai","local":"वाई","code":4256}],"WASHIM":[{"name":"Karanja","local":"कारंजा","code":3997},{"name":"Malegaon","local":"मालेगाव","code":3995},{"name":"Mangrulpir","local":"मांगरूळपिर","code":3996},{"name":"Manora","local":"मनोरा","code":3998},{"name":"Risod","local":"रिसोड","code":4000},{"name":"Washim","local":"वाशिम","code":3999}]};

/* ── District-key normalisation ──────────────────────────────────────
 * MAHA_DATA keys districts by UPPERCASE English ("AMRAVATI", "KOLHAPUR").
 * Our DistrictRow.name_en is also UPPERCASE but occasionally byte-corrupted
 * (KOLH>PUR — the `>` byte 0x3E replaced `A` 0x41 during DBF parsing). The
 * fix table KNOWN_NAME_FIXES maps the raw corrupted strings back to clean
 * ASCII; we apply it FIRST so the alphanumeric strip doesn't drop the `>`
 * and silently lose the `A`.
 *
 * After the fix we strip non-A-Z, then apply district-rename aliases for
 * AHMADNAGAR / AHMEDNAGAR / AHILYANAGAR, CHHATRAPATI SAMBHAJINAGAR =
 * AURANGABAD (renamed 2022), DHARASHIV = OSMANABAD (renamed 2022). */
function normDistrict(raw: string): string {
  if (!raw) return "";
  // 1. Recover byte-corrupted forms BEFORE we strip punctuation.
  const fixed = KNOWN_NAME_FIXES[raw] ?? raw;
  // 2. Uppercase + strip everything but A-Z.
  const upper = fixed.toUpperCase().replace(/[^A-Z]+/g, "");
  // 3. Rename aliases (current + historical district names).
  const aliases: Record<string, string> = {
    // Ahmednagar was renamed Ahilyanagar in 2024. MAHA_DATA still uses the
    // old name "AHMEDNAGAR" so we redirect both forms there.
    AHMADNAGAR: "AHMEDNAGAR",
    AHILYANAGAR: "AHMEDNAGAR",
    // Aurangabad renamed Chhatrapati Sambhajinagar in 2022.
    CHHATRAPATISAMBHAJINAGAR: "AURANGABAD",
    // Osmanabad renamed Dharashiv in 2022.
    DHARASHIV: "OSMANABAD",
    // KOLH>PUR was already handled by KNOWN_NAME_FIXES, but if for some
    // reason the strip happens first (older callers) we still recover.
    KOLHPUR: "KOLHAPUR",
    NNDED: "NANDED",
    NANDURBR: "NANDURBAR",
    NSHIK: "NASHIK",
    STRA: "SATARA",
  };
  return aliases[upper] ?? upper;
}

/** Best-effort English district key from a DistrictRow. Tries name_en first
 * (run through KNOWN_NAME_FIXES + normDistrict), then DISTRICT_ID_FALLBACK_EN
 * keyed by district_id slug. Returns "" only when both are missing. */
function districtKeyFromRow(row: LocalNameRow | undefined): string {
  if (!row) return "";
  const raw = (row.name_en ?? "").trim();
  if (raw) {
    const k = normDistrict(raw);
    if (k) return k;
  }
  const slug = row.district_id;
  if (slug && DISTRICT_ID_FALLBACK_EN[slug]) {
    return normDistrict(DISTRICT_ID_FALLBACK_EN[slug]);
  }
  // Last resort: try treating the slug itself as a district name
  // (e.g. slug "kolh-pur" → normDistrict tries the slug, hits its alias
  // "KOLHPUR" → "KOLHAPUR"). This catches districts we forgot to add to
  // DISTRICT_ID_FALLBACK_EN.
  if (slug) {
    return normDistrict(slug);
  }
  return "";
}

/* ── Name normalisation ─────────────────────────────────────────────
 * Two passes of normalisation:
 *
 *   normName(): strict — strip non-alphanumerics and lowercase. Catches
 *               "Chandur Railway" vs "ChandurRailway",
 *               "Desaiganj (Vadasa)" vs "DesaiganjVadasa".
 *
 *   normNameRelaxed(): like normName, plus collapse the Marathi village
 *               suffix family:
 *                  Bk. / Bk / Budruk  → bk
 *                  Kh. / Kh / Khurd   → kh
 *                  (CT) / (M Corp) / (MC) / (NP) / (OG) → drop
 *               So "Pimpari Kh." matches "Pimpari Khurd" matches "Pimpari Kh"
 *               under the same key.
 *
 * Looking up a village does two passes: strict first, then relaxed if the
 * strict match misses. That way exact matches stay precise and ambiguous
 * suffixes still resolve.
 */
function normName(raw: string): string {
  if (!raw) return "";
  return raw.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

/** Strict-but-safe relaxation. Only collapses variations that are
 * **provably the same village** — never a "contains" substring trick.
 *
 *   - Drop admin-status tags in parens: (CT), (M Corp), (MC), (M.C),
 *     (NP), (N.P), (NA), (OG), (CB), (M), (PH), (N.V), (NV), (Cantt),
 *     (Notified Village), (Out Growth).
 *   - Bk. / Bk / Budruk → bk
 *   - Kh. / Kh / Khurd → kh
 *   - Marathi suffix vadi → wadi (always a stem-glued suffix).
 *   - Numeric ordinals: "No. 1" / "No 1" / "Number 1" / "नं. 1" /
 *     "नं 1" / "क्र. 1" / "क्र 1" → "no1"  (Khatgaon No. 1 ↔ Khatgaon-No1
 *     ↔ Khatgaon नं. 1 all collapse).
 *
 * Devanagari is lowercased to itself (no-op) by .toLowerCase().
 */
function normNameRelaxed(raw: string): string {
  if (!raw) return "";
  return raw
    .toLowerCase()
    // Drop common administrative-status tags in parens.
    .replace(
      /\((?:ct|mcorp|m\s*corp|mc|m\.?\s*c\.?|np|n\.?\s*p\.?|na|n\.?\s*a\.?|og|o\.?\s*g\.?|cb|c\.?\s*b\.?|m|ph|nv|n\.?\s*v\.?|cantt|out\s*growth|outgrowth|notified\s*village)\)/gi,
      "",
    )
    // Numeric ordinals — English first, then Marathi shorthand.
    // Order matters: do this BEFORE the alphanumeric strip so the
    // remaining digits stay attached to "no".
    .replace(/\b(?:no\.?|number)\s*(\d+)/gi, "no$1")
    .replace(/नं\.?\s*(\d+)/g, "no$1")
    .replace(/क्र\.?\s*(\d+)/g, "no$1")
    // Unify suffix family: word boundary so "bkrishna" is untouched.
    .replace(/\b(bk\.?|budruk)\b/gi, "bk")
    .replace(/बु\.?/g, "bk")
    .replace(/\b(kh\.?|khurd)\b/gi, "kh")
    .replace(/खु\.?/g, "kh")
    // Marathi suffix family: vadi → wadi (always a suffix in village names
    // like "Padawalvadi" / "Padawalwadi"; no word boundary on the left
    // because it's glued onto the preceding stem).
    .replace(/vadi\b/gi, "wadi")
    // Now strip everything else.
    .replace(/[^a-z0-9ऀ-ॿ]+/g, "");
}

/* ── Taluka lookup ───────────────────────────────────────────────── */

/** Returns the matched MAHA TalukaEntry, or null. Two-pass match: strict
 * (alphanumeric-only) then relaxed (collapse Bk./Kh./Budruk/Khurd, drop
 * (CT)/(MC) status tags). */
export function findTalukaEntry(
  districtKeyRaw: string,
  talukaEnglishName: string,
): TalukaEntry | null {
  const dkey = normDistrict(districtKeyRaw);
  const list = MAHA_TALUKAS[dkey];
  if (!list) return null;
  const wantStrict = normName(talukaEnglishName);
  if (!wantStrict) return null;
  let hit = list.find((t) => normName(t.name) === wantStrict);
  if (hit) return hit;
  const wantRelaxed = normNameRelaxed(talukaEnglishName);
  if (!wantRelaxed) return null;
  hit = list.find((t) => normNameRelaxed(t.name) === wantRelaxed);
  return hit ?? null;
}

/** Match a MAHA taluka entry by its numeric LGD code. This is the most
 * reliable join because LGD codes are stable across name renames and free
 * of the LGD-vs-MAHA spelling mismatches that plague taluka names
 * (e.g. dropdown says "GAGANBAWADA" while MAHA stores it as "Bavda" — both
 * carry LGD code 4288, so the join still works).
 *
 * The dropdown JSON stores LGD codes as zero-padded strings like "04288",
 * while MAHA stores them as plain numbers like 4288. parseInt() normalises
 * both so the lookup is identity-stable. */
export function findTalukaEntryByLgdCode(
  districtKeyRaw: string,
  lgdCode: string | number | null | undefined,
): TalukaEntry | null {
  if (lgdCode == null || lgdCode === "") return null;
  const num =
    typeof lgdCode === "number" ? lgdCode : parseInt(String(lgdCode), 10);
  if (!Number.isFinite(num) || num <= 0) return null;
  const dkey = normDistrict(districtKeyRaw);
  const list = MAHA_TALUKAS[dkey];
  if (!list) return null;
  return list.find((t) => t.code === num) ?? null;
}

/** Marathi display, falling back to the original English if no local. */
export function getTalukaDisplayName(
  districtKeyRaw: string,
  talukaEnglishName: string,
  lang: Lang,
): string {
  if (lang !== "mr") return talukaEnglishName;
  const entry = findTalukaEntry(districtKeyRaw, talukaEnglishName);
  if (entry && entry.local && entry.local.trim()) return entry.local;
  return talukaEnglishName;
}

/** Numeric code (4292, …) for the matched taluka, or null. */
export function getTalukaCode(
  districtKeyRaw: string,
  talukaEnglishName: string,
): number | null {
  const entry = findTalukaEntry(districtKeyRaw, talukaEnglishName);
  return entry ? entry.code : null;
}

/* ── Villages: lazy-fetched JSON, cached in module scope ───────────── */

let VILLAGE_CACHE: VillagesByTalukaCode | null = null;
let VILLAGE_PROMISE: Promise<VillagesByTalukaCode> | null = null;

/** Public API: ensures the villages JSON has been fetched at least once. */
export async function ensureVillageNames(): Promise<VillagesByTalukaCode> {
  if (VILLAGE_CACHE) return VILLAGE_CACHE;
  if (VILLAGE_PROMISE) return VILLAGE_PROMISE;
  VILLAGE_PROMISE = fetch("/data/maha-village-names.json")
    .then((r) => {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then((data: VillagesByTalukaCode) => {
      VILLAGE_CACHE = data;
      logDatasetsReady();
      return data;
    })
    .catch((e) => {
      console.error("[maha-local-names] village fetch failed:", e);
      VILLAGE_CACHE = {};
      return VILLAGE_CACHE;
    });
  return VILLAGE_PROMISE;
}

/** Marathi display for a single village.
 *  Pass the *taluka code* (from getTalukaCode) and the village English name.
 *  Two-pass match (strict → relaxed) so "Pimpari Kh." resolves whether the
 *  MAHA data spells it Kh. / Kh / Khurd. Returns the original English name
 *  when no Marathi label is on file — never returns null. */
export function getVillageDisplayName(
  talukaCode: number | null,
  villageEnglishName: string,
  lang: Lang,
): string {
  if (lang !== "mr") return villageEnglishName;
  if (talukaCode == null || !VILLAGE_CACHE) return villageEnglishName;
  const list = VILLAGE_CACHE[String(talukaCode)];
  if (!list) return villageEnglishName;
  const wantStrict = normName(villageEnglishName);
  let match = list.find((v) => normName(v.n) === wantStrict);
  if (!match) {
    const wantRelaxed = normNameRelaxed(villageEnglishName);
    match = list.find((v) => normNameRelaxed(v.n) === wantRelaxed);
  }
  if (match && match.l && match.l.trim()) return match.l;
  return villageEnglishName;
}

/** Synchronous "is data ready?" hook for components to render properly. */
export function villageNamesReady(): boolean {
  return VILLAGE_CACHE !== null;
}

/* ── LGD lookup overlay (optional) ────────────────────────────────────
 * The LGD JSON (built from the user's Excel sheets via
 * scripts/build-lgd-local-names.mjs) is the authoritative source. It's
 * lazy-fetched once on first taluka selection — same pattern as the MAHA
 * villages dataset. When present, LGD takes precedence over MAHA; when
 * absent, MAHA is the fallback; when neither has a Marathi label, the
 * helpers return the original English string from the row.
 *
 * Schema (matches scripts/build-lgd-local-names.mjs output):
 *   {
 *     "byVillageCode": { "<lgdCode>": { nameEn, nameMr, talukaEn, talukaMr,
 *                                       districtEn, districtMr } },
 *     "byName":       { "district|taluka|village-normalized": { nameEn, nameMr } },
 *     "talukas":      { "district|taluka-normalized": { nameEn, nameMr } }
 *   }
 */
interface LgdNamePair { nameEn: string; nameMr: string; }
interface LgdVillageRecord extends LgdNamePair {
  talukaEn?: string; talukaMr?: string;
  districtEn?: string; districtMr?: string;
}
interface LgdDataset {
  byVillageCode: Record<string, LgdVillageRecord>;
  byName: Record<string, LgdNamePair>;
  talukas: Record<string, LgdNamePair>;
}

let LGD_CACHE: LgdDataset | null = null;
let LGD_PROMISE: Promise<LgdDataset | null> | null = null;

/** Fetch & cache the LGD JSON. Resolves to null if the file is missing —
 * the helpers all treat null as "no overlay, use MAHA / fallback". */
export async function ensureLgdNames(): Promise<LgdDataset | null> {
  if (LGD_CACHE) return LGD_CACHE;
  if (LGD_PROMISE) return LGD_PROMISE;
  LGD_PROMISE = fetch("/data/lgd-local-names.json")
    .then((r) => {
      if (!r.ok) {
        // 404 is expected before the user runs the LGD build script.
        return null;
      }
      return r.json() as Promise<LgdDataset>;
    })
    .then((data) => {
      LGD_CACHE = data ?? null;
      logDatasetsReady();
      return LGD_CACHE;
    })
    .catch((e) => {
      console.warn("[lgd-local-names] fetch failed (will use MAHA fallback):", e);
      LGD_CACHE = null;
      return null;
    });
  return LGD_PROMISE;
}

export function lgdNamesReady(): boolean {
  return LGD_CACHE !== null;
}

/* ── Row-based helpers (the public API the component should call) ───
 *
 * Crucial rule: these helpers NEVER filter or skip rows. They take a row
 * from the existing dropdown JSON, look up an optional Marathi label, and
 * return either the localized label or the row's original English name as
 * fallback. The dropdown render path stays a 1-to-1 map over the existing
 * row arrays.
 *
 * Lookup order for villages:
 *   1. LGD byVillageCode  (LGD code from row.village_id or row.code)
 *   2. LGD byName         (district|taluka|village key, strict + relaxed)
 *   3. MAHA villages      (taluka code → village list, strict + relaxed)
 *   4. row.name_en        (always returned in English mode, or as final fallback)
 *
 * Lookup order for talukas:
 *   1. LGD talukas        (district|taluka key, strict + relaxed)
 *   2. MAHA talukas       (district → name list, strict + relaxed)
 *   3. row.name_en
 */

/** Minimal subset of the DistrictRow / TalukaRow / VillageRow shapes the
 * helpers actually read. Defined here (not imported) to avoid coupling
 * this lib to the component's types — any compatible shape works. */
export interface LocalNameRow {
  name_en?: string;
  name_mr?: string;
  code?: string | number | null;       // LGD code if present on row
  /** LGD code on taluka rows (dropdown JSON ships this as a zero-padded
   * string like "04288"). Treated as authoritative for MAHA joins because
   * names diverge across LGD and MAHA datasets. */
  lgd?: string | number | null;
  village_id?: string;                   // e.g. "v-563889"
  taluka_id?: string;                    // e.g. "t-512-ajra"
  district_id?: string;                  // e.g. "d-516"
}

/** Pull a probable LGD numeric code out of a row. We check `code`, then the
 * trailing digits of village_id ("v-563889" → "563889") so old data without
 * an explicit code still resolves. */
function lgdCodeFromRow(row: LocalNameRow | undefined): string | null {
  if (!row) return null;
  if (row.code != null && String(row.code).trim()) return String(row.code).trim();
  for (const k of ["village_id", "taluka_id", "district_id"] as const) {
    const v = row[k];
    if (!v) continue;
    const m = /(\d{3,})$/.exec(v);
    if (m) return m[1];
  }
  return null;
}

function lgdLookupByName(
  kind: "village" | "taluka",
  districtKeyRaw: string,
  talukaEnglish: string | undefined,
  villageEnglish: string | undefined,
): LgdNamePair | null {
  if (!LGD_CACHE) return null;
  const dKey = normDistrict(districtKeyRaw);
  if (!dKey) return null;

  if (kind === "taluka") {
    if (!talukaEnglish) return null;
    const strict = `${dKey}|${normName(talukaEnglish)}`;
    const relaxed = `${dKey}|${normNameRelaxed(talukaEnglish)}`;
    return LGD_CACHE.talukas[strict] ?? LGD_CACHE.talukas[relaxed] ?? null;
  }

  // village
  if (!talukaEnglish || !villageEnglish) return null;
  const tStrict = normName(talukaEnglish);
  const tRelaxed = normNameRelaxed(talukaEnglish);
  const vStrict = normName(villageEnglish);
  const vRelaxed = normNameRelaxed(villageEnglish);
  const candidates = [
    `${dKey}|${tStrict}|${vStrict}`,
    `${dKey}|${tStrict}|${vRelaxed}`,
    `${dKey}|${tRelaxed}|${vStrict}`,
    `${dKey}|${tRelaxed}|${vRelaxed}`,
  ];
  for (const c of candidates) {
    if (LGD_CACHE.byName[c]) return LGD_CACHE.byName[c];
  }
  return null;
}

/* Once-per-(district, taluka, village) debug log. Browser-side only —
 * gated by a Set so noisy dropdowns don't flood the console. Toggle the
 * env-checked DEBUG_ON flag below to silence. */
/* Debug logs fire only in development OR when the page URL has ?debugLgd=1.
 * Per-call payload is keyed by (kind, districtKey, talukaEn, villageEn) so
 * the same dropdown re-render doesn't flood the console — first occurrence
 * wins. */
const DEBUG_ON =
  typeof window !== "undefined" &&
  (process.env.NODE_ENV !== "production" ||
    /[?&]debugLgd=1\b/.test(window.location?.search ?? ""));
const _debugSeen = new Set<string>();
function debugLog(payload: Record<string, unknown>) {
  if (!DEBUG_ON) return;
  // Dedup signature INCLUDES cache-loaded flags so we re-log when LGD/MAHA
  // arrives late and the same lookup transitions from English fallback to
  // a localized result.
  const sig = JSON.stringify([
    payload.kind,
    payload.districtKey,
    payload.talukaEn,
    payload.villageEn,
    payload.source,
    payload.lgdLoaded,
    payload.mahaLoaded,
  ]);
  if (_debugSeen.has(sig)) return;
  _debugSeen.add(sig);
  console.log("[LGD]", payload);
}

/** One-shot log fired the first time either localization cache lands.
 * Useful for confirming the JSON files were actually fetched. */
let _datasetLogOnce = false;
function logDatasetsReady() {
  if (_datasetLogOnce || !DEBUG_ON) return;
  if (LGD_CACHE === null && VILLAGE_CACHE === null) return;
  _datasetLogOnce = true;
  console.log("[LGD data loaded]", {
    lgdTalukaKeys: LGD_CACHE ? Object.keys(LGD_CACHE.talukas).length : 0,
    lgdByNameKeys: LGD_CACHE ? Object.keys(LGD_CACHE.byName).length : 0,
    mahaTalukaCodes: VILLAGE_CACHE ? Object.keys(VILLAGE_CACHE).length : 0,
  });
}

/** Taluka label (row-based). Always returns a non-empty string, falling
 * back to row.name_en. Pass the matching DistrictRow so we know which
 * district the taluka belongs to (LGD + MAHA are keyed by district). */
export function getTalukaDisplayNameRow(
  talukaRow: LocalNameRow | undefined,
  districtRow: LocalNameRow | undefined,
  lang: Lang,
): string {
  const fallback = talukaRow?.name_en?.trim() || talukaRow?.name_mr?.trim() || "—";
  if (!talukaRow) return fallback;
  if (lang !== "mr") return fallback;

  // Resolve to a clean uppercase English key — handles KOLH>PUR via
  // KNOWN_NAME_FIXES inside normDistrict + slug fallback.
  const dKey = districtKeyFromRow(districtRow);

  let result = fallback;
  let source: string = "fallback-en";

  // 1. LGD by name (district|taluka key)
  const lgd = lgdLookupByName("taluka", dKey, talukaRow.name_en, undefined);
  if (lgd && lgd.nameMr && lgd.nameMr.trim()) {
    result = lgd.nameMr; source = "lgd-byName";
  }
  // 2. Row's own Marathi name (from the dropdown JSON)
  else if (talukaRow.name_mr && talukaRow.name_mr.trim()) {
    result = talukaRow.name_mr; source = "row.name_mr";
  }
  // 3. MAHA — try LGD-code join FIRST (immune to name mismatches like
  //    GAGANBAWADA vs Bavda; both share code 4288), then name-based join
  //    as a last resort for any row that's missing an lgd code. We pull
  //    the code from row.lgd if present, otherwise from a trailing digit
  //    run in taluka_id (legacy rows like "t-04288-bavda").
  else if (dKey) {
    const codeRaw =
      talukaRow.lgd != null && String(talukaRow.lgd).trim()
        ? talukaRow.lgd
        : lgdCodeFromRow(talukaRow);
    const entry = findTalukaEntryByLgdCode(dKey, codeRaw);
    if (entry && entry.local && entry.local.trim()) {
      result = entry.local; source = "maha-byCode";
    }
  }
  if (result === fallback && dKey && talukaRow.name_en) {
    const entry = findTalukaEntry(dKey, talukaRow.name_en);
    if (entry && entry.local && entry.local.trim()) {
      result = entry.local; source = "maha";
    }
  }

  debugLog({
    kind: "taluka",
    lgdLoaded: LGD_CACHE !== null,
    mahaLoaded: VILLAGE_CACHE !== null,
    districtKey: dKey,
    talukaEn: talukaRow.name_en ?? "",
    talukaLookupKey: dKey && talukaRow.name_en
      ? `${dKey}|${normName(talukaRow.name_en)}`
      : "",
    source,
    result,
  });

  return result;
}

/** Village label (row-based). Pass the village row + parent taluka + parent
 * district so the helpers have full context. Like the taluka helper, ALWAYS
 * returns a non-empty string — never null or "—" unless the row itself has
 * no name. */
export function getVillageDisplayNameRow(
  villageRow: LocalNameRow | undefined,
  talukaRow: LocalNameRow | undefined,
  districtRow: LocalNameRow | undefined,
  lang: Lang,
): string {
  const fallback = villageRow?.name_en?.trim() || villageRow?.name_mr?.trim() || "—";
  if (!villageRow) return fallback;
  if (lang !== "mr") return fallback;

  const dKey = districtKeyFromRow(districtRow);

  let result = fallback;
  let source: string = "fallback-en";

  // 1. LGD by village code
  const vCode = lgdCodeFromRow(villageRow);
  if (LGD_CACHE && vCode) {
    const rec = LGD_CACHE.byVillageCode[vCode];
    if (rec && rec.nameMr && rec.nameMr.trim()) {
      result = rec.nameMr; source = "lgd-byCode";
    }
  }
  // 2. LGD by name (district|taluka|village)
  if (result === fallback) {
    const lgd = lgdLookupByName("village", dKey, talukaRow?.name_en, villageRow.name_en);
    if (lgd && lgd.nameMr && lgd.nameMr.trim()) {
      result = lgd.nameMr; source = "lgd-byName";
    }
  }
  // 3. Row's own Marathi name (from the dropdown JSON)
  if (result === fallback && villageRow.name_mr && villageRow.name_mr.trim()) {
    result = villageRow.name_mr; source = "row.name_mr";
  }
  // 4. MAHA villages by taluka code. We prefer the LGD code from the
  //    taluka row (authoritative, immune to name mismatches like
  //    GAGANBAWADA↔Bavda) and only fall back to a name-based join when
  //    the taluka row doesn't carry an lgd code.
  //
  //    Match ladder INSIDE the taluka's village list — order matters
  //    because each rung is a stricter→looser canonical join, never a
  //    broad substring guess:
  //
  //      a) strict  — alphanumeric-only equality.
  //      b) relaxed — drops (N.V)/(CT)/(M Corp) tags, collapses
  //                   Kh./Bk./Budruk/Khurd/बु./खु., vadi↔wadi, English
  //                   and Marathi ordinals "No. 1"/"नं. 1" → "no1".
  //      c) gated startsWith — only if EXACTLY ONE candidate in the same
  //                   taluka starts with the relaxed dropdown stem AND
  //                   length difference is ≤ 4 chars (catches harmless
  //                   tag suffix variants we haven't enumerated, refuses
  //                   broad partial matches like "Patil" → "Patilwadi"
  //                   that could land on the wrong village).
  //
  //    On a true miss we log up to 5 candidate names from the same taluka
  //    so the miss diagnostics show why it missed.
  let mahaCandidates: string[] = []; // for miss diagnostics only
  if (result === fallback && dKey && villageRow.name_en) {
    let tCode: number | null = null;
    const lgdRaw = talukaRow?.lgd;
    if (lgdRaw != null && String(lgdRaw).trim()) {
      const num = parseInt(String(lgdRaw), 10);
      if (Number.isFinite(num) && num > 0) tCode = num;
    }
    if (tCode == null && talukaRow?.name_en) {
      tCode = getTalukaCode(dKey, talukaRow.name_en);
    }
    if (tCode != null && VILLAGE_CACHE) {
      const list = VILLAGE_CACHE[String(tCode)];
      if (list) {
        const wantStrict = normName(villageRow.name_en);
        const wantRelaxed = normNameRelaxed(villageRow.name_en);

        // a) strict
        let match = list.find((v) => normName(v.n) === wantStrict);
        let matchSource: string = "maha";

        // b) safe-relaxed (only tag/suffix collapses)
        if (!match) {
          match = list.find((v) => normNameRelaxed(v.n) === wantRelaxed);
          if (match) matchSource = "maha-relaxed";
        }

        // c) GATED startsWith — same taluka (already enforced by
        //    operating inside `list`), exactly one candidate, length
        //    difference ≤ 4 chars. We deliberately do NOT do a generic
        //    .includes() — that would let "Patil" match "Patilwadi"
        //    incorrectly. The gate keeps us conservative: when there's
        //    one and only one nearby candidate that this dropdown stem
        //    is a prefix of (e.g. "Khatgaon" → "Khatgaon No 1" when the
        //    ordinal stripper hasn't fired for some reason), accept it;
        //    otherwise fall through to English.
        if (!match && wantRelaxed.length >= 4) {
          const candidates = list.filter((v) => {
            const cand = normNameRelaxed(v.n);
            if (cand.length < 4) return false;
            if (Math.abs(cand.length - wantRelaxed.length) > 4) return false;
            return cand.startsWith(wantRelaxed) || wantRelaxed.startsWith(cand);
          });
          if (candidates.length === 1) {
            match = candidates[0];
            matchSource = "maha-prefix-1of1";
          }
        }

        if (match && match.l && match.l.trim()) {
          result = match.l; source = matchSource;
        } else if (result === fallback) {
          // Stash up to 5 candidate English names from the same taluka so
          // the miss diagnostics below can show them.
          mahaCandidates = list
            .slice(0, 200)
            .map((v) => v.n)
            .filter(Boolean)
            .slice(0, 5);
        }
      }
    }
  }

  debugLog({
    kind: "village",
    lgdLoaded: LGD_CACHE !== null,
    mahaLoaded: VILLAGE_CACHE !== null,
    districtKey: dKey,
    talukaEn: talukaRow?.name_en ?? "",
    villageEn: villageRow.name_en ?? "",
    // Surface a few sibling names when we couldn't resolve — saves a
    // round trip into the DevTools cache panel.
    ...(source === "fallback-en" && mahaCandidates.length
      ? { mahaCandidatesSample: mahaCandidates }
      : {}),
    villageLookupKey:
      dKey && talukaRow?.name_en && villageRow.name_en
        ? `${dKey}|${normName(talukaRow.name_en)}|${normName(villageRow.name_en)}`
        : "",
    lgdCode: vCode,
    source,
    result,
  });

  // Explicit per-miss log requested by Sagar — emits a stable
  //   "[MR fallback]" line you can grep in DevTools to find every
  // village that didn't resolve. Fires only when we actually fell back
  // to English AND debug logging is enabled.
  if (DEBUG_ON && source === "fallback-en") {
    const attemptedKeys: string[] = [];
    if (vCode) attemptedKeys.push(`lgd-byVillageCode:${vCode}`);
    if (dKey && talukaRow?.name_en && villageRow.name_en) {
      const tS = normName(talukaRow.name_en);
      const tR = normNameRelaxed(talukaRow.name_en);
      const vS = normName(villageRow.name_en);
      const vR = normNameRelaxed(villageRow.name_en);
      attemptedKeys.push(`lgd-byName:${dKey}|${tS}|${vS}`);
      if (tR !== tS || vR !== vS) {
        attemptedKeys.push(`lgd-byName-relaxed:${dKey}|${tR}|${vR}`);
      }
      attemptedKeys.push(`maha-byTalukaCode:strict:${vS}`);
      if (vR !== vS) attemptedKeys.push(`maha-byTalukaCode:relaxed:${vR}`);
    }
    console.log("[MR fallback]", {
      districtId: districtRow?.district_id ?? "",
      districtEn: districtRow?.name_en ?? "",
      districtKey: dKey,
      talukaId: talukaRow?.taluka_id ?? "",
      talukaEn: talukaRow?.name_en ?? "",
      talukaLgd: talukaRow?.lgd ?? "",
      villageId: villageRow.village_id ?? "",
      villageEn: villageRow.name_en ?? "",
      lgdCode: vCode,
      attemptedKeys,
      sameTalukaCandidateSample: mahaCandidates,
    });
  }

  return result;
}

/* (DISTRICT_ID_FALLBACK_EN is imported at the top of this module.) */
