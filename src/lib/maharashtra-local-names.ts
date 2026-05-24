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

interface TalukaEntry { name: string; local: string; code: number; }
type TalukasByDistrict = Record<string, TalukaEntry[]>;

interface VillageEntry { n: string; l: string; }
type VillagesByTalukaCode = Record<string, VillageEntry[]>;

/* ── Talukas inlined (small, always needed) ─────────────────────────── */
export const MAHA_TALUKAS: TalukasByDistrict = {"AMRAVATI":[{"name":"Achalpur","local":"अचलपूर","code":4004},{"name":"Amravati","local":"अमरावती","code":4009},{"name":"Anjangaon Surji","local":"अंजनगाव सुर्जी","code":4003},{"name":"Bhatkuli","local":"भाटकुली","code":4010},{"name":"Chandur Railway","local":"चांदूर रेल्वे","code":4013},{"name":"Chandurbazar","local":"चांदूर बाजार","code":4005},{"name":"Chikhaldara","local":"चिखलदारा","code":4002},{"name":"Daryapur","local":"दर्यापूर","code":4011},{"name":"Dhamangaon Railway","local":"धामनगाव रेल्वे","code":4014},{"name":"Dharni","local":"धारणी","code":4001},{"name":"Morshi","local":"मोरशी","code":4006},{"name":"Nandgaon-Khandeshwar","local":"नांदगाव खांडेश्वर","code":4012},{"name":"Teosa","local":"तिवसा","code":4008},{"name":"Warud","local":"वारूड","code":4007}],"GADCHIROLI":[{"name":"Aheri","local":"","code":4062},{"name":"Armori","local":"आरमोरी","code":4053},{"name":"Bhamragad","local":"","code":4061},{"name":"Chamorshi","local":"","code":4058},{"name":"Desaiganj (Vadasa)","local":"","code":4052},{"name":"Dhanora","local":"","code":4056},{"name":"Etapalli","local":"","code":4060},{"name":"Gadchiroli","local":"","code":4057},{"name":"Korchi","local":"","code":4055},{"name":"Kurkheda","local":"","code":4054},{"name":"Mulchera","local":"","code":4059},{"name":"Sironcha","local":"","code":4063}],"LATUR":[{"name":"Ahmadpur","local":"अहमदपूर","code":4228},{"name":"Ausa","local":"औसा","code":4232},{"name":"Chakur","local":"चाकूर","code":4230},{"name":"Deoni","local":"देवनी","code":4234},{"name":"Jalkot","local":"जलकोट","code":4229},{"name":"Latur","local":"लातूर","code":4226},{"name":"Nilanga","local":"निलंगा","code":4233},{"name":"Renapur","local":"रेनापूर","code":4227},{"name":"Shirur-Anantpal","local":"शिरूर अनंतपाळ","code":4231},{"name":"Udgir","local":"उदगीर","code":4235}],"KOLHAPUR":[{"name":"Ajra","local":"आजरा","code":4292},{"name":"Bavda","local":"गगनबावडा","code":4288},{"name":"Bhudargad","local":"बुधरगड","code":4291},{"name":"Chandgad","local":"चांदगड","code":4294},{"name":"Gadhinglaj","local":"गडहिंग्लज","code":4293},{"name":"Hatkanangle","local":"हातकणंगले","code":4285},{"name":"Kagal","local":"कागल","code":4290},{"name":"Karvir","local":"करवीर","code":4287},{"name":"Panhala","local":"पन्हाळा","code":4284},{"name":"Radhanagari","local":"राधानगरी","code":4289},{"name":"Shahuwadi","local":"शाहूवाडी","code":4283},{"name":"Shirol","local":"शिरोळ","code":4286}],"SOLAPUR":[{"name":"Akkalkot","local":"अक्कलकोट","code":4254},{"name":"Barshi","local":"बार्शी","code":4246},{"name":"Karmala","local":"करमाळा","code":4244},{"name":"Madha","local":"माढा","code":4245},{"name":"Malshiras","local":"माळशिरस","code":4250},{"name":"Mangalvedhe","local":"मंगलवेढे","code":4252},{"name":"Mohol","local":"मोहोळ","code":4248},{"name":"Pandharpur","local":"पंढरपूर","code":4249},{"name":"Sangole","local":"सांगोला","code":4251},{"name":"Solapur North","local":"उत्तर सोलापूर","code":4247},{"name":"Solapur South","local":"दक्षिण सोलापूर","code":4253}],"NANDURBAR":[{"name":"Akkalkuwa","local":"अक्कलकुवा","code":3950},{"name":"Akrani","local":"अकर्नी","code":3951},{"name":"Nandurbar","local":"नंदूरबार","code":3954},{"name":"Nawapur","local":"नवापूर","code":3955},{"name":"Shahade","local":"शहादा","code":3953},{"name":"Talode","local":"तलोदा","code":3952}],"AKOLA":[{"name":"Akola","local":"अकोला","code":3991},{"name":"Akot","local":"अकोट","code":3989},{"name":"Balapur","local":"बालापूर","code":3990},{"name":"Barshitakli","local":"बार्शीटाकळी","code":3994},{"name":"Murtijapur","local":"मुर्तिजापूर","code":3992},{"name":"Patur","local":"पातूर","code":3993},{"name":"Telhara","local":"तेलहारा","code":3988}],"AHMEDNAGAR":[{"name":"Akola","local":"अकोले","code":4201},{"name":"Jamkhed","local":"जामखेड","code":4214},{"name":"Karjat","local":"कर्जत","code":4213},{"name":"Kopargaon","local":"कोपरगाव","code":4203},{"name":"Nagar","local":"नगर","code":4209},{"name":"Nevasa","local":"नेवासा","code":4206},{"name":"Parner","local":"पारनेर","code":4211},{"name":"Pathardi","local":"पाथर्डी","code":4208},{"name":"Rahta","local":"रहाता","code":4204},{"name":"Rahuri","local":"राहुरी","code":4210},{"name":"Sangamner","local":"संगमनेर","code":4202},{"name":"Shevgaon","local":"शेगाव","code":4207},{"name":"Shrigonda","local":"श्रीगोंदा","code":4212},{"name":"Shrirampur","local":"श्रीरामपूर","code":4205}],"RAIGAD":[{"name":"Alibag","local":"अलिबाग","code":4177},{"name":"Karjat","local":"कर्जत","code":4174},{"name":"Khalapur","local":"खालापूर","code":4175},{"name":"Mahad","local":"महाड","code":4185},{"name":"Mangaon","local":"मानगाव","code":4181},{"name":"Mhasla","local":"म्हासळा","code":4184},{"name":"Murud","local":"मुरूड","code":4178},{"name":"Panvel","local":"पनवेल","code":4173},{"name":"Pen","local":"पेण","code":4176},{"name":"Poladpur","local":"पोलादपूर","code":4186},{"name":"Roha","local":"रोहा","code":4179},{"name":"Shrivardhan","local":"श्रीवर्धन","code":4183},{"name":"Sudhagad","local":"सुधागड","code":4180},{"name":"Tala","local":"ताला","code":4182},{"name":"Uran","local":"उरण","code":4172}],"JALGAON":[{"name":"Amalner","local":"","code":3969},{"name":"Bhadgaon","local":"","code":3971},{"name":"Bhusawal","local":"","code":3965},{"name":"Bodvad","local":"","code":3964},{"name":"Chalisgaon","local":"","code":3972},{"name":"Chopda","local":"","code":3960},{"name":"Dharangaon","local":"","code":3968},{"name":"Erandol","local":"एरंडोल","code":3967},{"name":"Jalgaon","local":"","code":3966},{"name":"Jamner","local":"","code":3974},{"name":"Muktainagar (Edlabad)","local":"","code":3963},{"name":"Pachora","local":"","code":3973},{"name":"Parola","local":"","code":3970},{"name":"Raver","local":"","code":3962},{"name":"Yawal","local":"","code":3961}],"JALNA":[{"name":"Ambad","local":"","code":4129},{"name":"Badnapur","local":"","code":4128},{"name":"Bhokardan","local":"","code":4125},{"name":"Ghansawangi","local":"","code":4130},{"name":"Jafferabad","local":"","code":4126},{"name":"Jalna","local":"","code":4127},{"name":"Mantha","local":"","code":4132},{"name":"Partur","local":"","code":4131}],"THANE":[{"name":"Ambarnath","local":"अंबरनाथ","code":4170},{"name":"Bhiwandi","local":"भिवंडी","code":4166},{"name":"Kalyan","local":"कल्याण","code":4168},{"name":"Murbad","local":"मुरबाड","code":4171},{"name":"Shahapur","local":"शहापूर","code":4167},{"name":"Thane","local":"ठाणे","code":4165},{"name":"Ulhasnagar","local":"उल्हासनगर","code":4169}],"PUNE":[{"name":"Ambegaon","local":"अंबरनाथ","code":4188},{"name":"Baramati","local":"बारामती","code":4199},{"name":"Bhor","local":"भोर","code":4198},{"name":"Daund","local":"दौंड","code":4195},{"name":"Haveli","local":"हवेली","code":4193},{"name":"Indapur","local":"इंदापूर","code":4200},{"name":"Junnar","local":"जुन्नर","code":4187},{"name":"Khed","local":"खेड","code":4190},{"name":"Mawal","local":"मवाळ","code":4191},{"name":"Mulshi","local":"मुळशी","code":4192},{"name":"Pune City","local":"पुणे शहर","code":4194},{"name":"Purandhar","local":"पुरंदर","code":4196},{"name":"Shirur","local":"शिरूर","code":4189},{"name":"Velhe","local":"वेल्हे","code":4197}],"BEED":[{"name":"Ambejogai","local":"आंबेजोगाई","code":4225},{"name":"Ashti","local":"अष्टी","code":4215},{"name":"Bid","local":"बीड","code":4221},{"name":"Dharur","local":"धारूर","code":4223},{"name":"Georai","local":"गेवराई","code":4218},{"name":"Kaij","local":"कैज","code":4222},{"name":"Manjlegaon","local":"माजलगाव","code":4219},{"name":"Parli","local":"परळी","code":4224},{"name":"Patoda","local":"पतोडा","code":4216},{"name":"Shirur (Kasar)","local":"शिरूर (कासार)","code":4217},{"name":"Wadwani","local":"वडवणी","code":4220}],"GONDIA":[{"name":"Amgaon","local":"आमगाव","code":4047},{"name":"Arjuni Morgaon","local":"अर्जुनी मोरगाव","code":4050},{"name":"Deori","local":"देवरी","code":4051},{"name":"Gondiya","local":"गोंदिया","code":4046},{"name":"Goregaon","local":"गोरेगाव","code":4045},{"name":"Sadak-Arjuni","local":"सडक अर्जुनी","code":4049},{"name":"Salekasa","local":"सालेकसा","code":4048},{"name":"Tirora","local":"तिरोडा","code":4044}],"NANDED":[{"name":"Ardhapur","local":"अर्धापूर","code":4099},{"name":"Bhokar","local":"भोकर","code":4102},{"name":"Biloli","local":"बिलोली","code":4105},{"name":"Deglur","local":"देगलुर","code":4110},{"name":"Dharmabad","local":"धर्माबाद","code":4104},{"name":"Hadgaon","local":"हदगाव","code":4098},{"name":"Himayatnagar","local":"हिमायतनगर","code":4097},{"name":"Kandhar","local":"कंधार","code":4108},{"name":"Kinwat","local":"किनवत","code":4096},{"name":"Loha","local":"लोहा","code":4107},{"name":"Mahoor","local":"माहूर","code":4095},{"name":"Mudkhed","local":"मुदखेड","code":4101},{"name":"Mukhed","local":"मुखेड","code":4109},{"name":"Naigaon (Khairgaon)","local":"नायगाव (खु)","code":4106},{"name":"Nanded","local":"नांदेड","code":4100},{"name":"Umri","local":"उमरी","code":4103}],"YAVATMAL":[{"name":"Arni","local":"अर्नी","code":4088},{"name":"Babulgaon","local":"बाबूलगाव","code":4080},{"name":"Darwha","local":"धारवा","code":4083},{"name":"Digras","local":"दिग्रस","code":4084},{"name":"Ghatanji","local":"घट्नजी","code":4089},{"name":"Kalamb","local":"कळंब","code":4081},{"name":"Kelapur","local":"केलापूर","code":4090},{"name":"Mahagaon","local":"महागाव","code":4087},{"name":"Maregaon","local":"मारेगाव","code":4092},{"name":"Ner","local":"नेर","code":4079},{"name":"Pusad","local":"पूसद","code":4085},{"name":"Ralegaon","local":"राळेगाव","code":4091},{"name":"Umarkhed","local":"उमरखेड","code":4086},{"name":"Wani","local":"वनी","code":4094},{"name":"Yavatmal","local":"यवतमाळ","code":4082},{"name":"Zari-Jamani","local":"जरी जामनी","code":4093}],"WARDHA":[{"name":"Arvi","local":"आर्वी","code":4017},{"name":"Ashti","local":"अष्टी","code":4015},{"name":"Deoli","local":"देवळी","code":4020},{"name":"Hinganghat","local":"हिंगणघाट","code":4021},{"name":"Karanja","local":"कारंजा","code":4016},{"name":"Samudrapur","local":"समुद्रपूर","code":4022},{"name":"Seloo","local":"सेलू","code":4018},{"name":"Wardha","local":"वर्धा","code":4019}],"SANGLI":[{"name":"Atpadi","local":"आटपाडी","code":4300},{"name":"Jat","local":"जत","code":4304},{"name":"Kadegaon","local":"कडेगाव","code":4298},{"name":"Kavathemahankal","local":"कवठे महांकाळ","code":4303},{"name":"Khanapur","local":"खानापूर","code":4299},{"name":"Miraj","local":"मिरज","code":4302},{"name":"Palus","local":"पलुस","code":4297},{"name":"Shirala","local":"शिराळा","code":4295},{"name":"Tasgaon","local":"तासगाव","code":4301},{"name":"Walwa","local":"वाळवा","code":4296}],"HINGOLI":[{"name":"Aundha (Nagnath)","local":"","code":4113},{"name":"Basmath","local":"","code":4115},{"name":"Hingoli","local":"","code":4112},{"name":"Kalamnuri","local":"","code":4114},{"name":"Sengaon","local":"","code":4111}],"AURANGABAD":[{"name":"Aurangabad","local":"औरंगाबाद","code":4137},{"name":"Gangapur","local":"गंगापूर","code":4140},{"name":"Kannad","local":"कन्नड","code":4133},{"name":"Khuldabad","local":"खुल्ताबाद","code":4138},{"name":"Paithan","local":"पैठण","code":4141},{"name":"Phulambri","local":"फुलंब्री","code":4136},{"name":"Sillod","local":"सिल्लोड","code":4135},{"name":"Soegaon","local":"सोयेगाव","code":4134},{"name":"Vaijapur","local":"वैजापूर","code":4139}],"NASHIK":[{"name":"Baglan","local":"बागलण","code":4145},{"name":"Chandvad","local":"चांदवड","code":4148},{"name":"Deola","local":"देवळा","code":4144},{"name":"Dindori","local":"दिंडोरी","code":4149},{"name":"Igatpuri","local":"इगतपूरी","code":4153},{"name":"Kalwan","local":"कालवण","code":4143},{"name":"Malegaon","local":"मालेगाव","code":4146},{"name":"Nandgaon","local":"नांदगाव","code":4147},{"name":"Nashik","local":"नाशिक","code":4152},{"name":"Niphad","local":"निफाड","code":4155},{"name":"Peth","local":"पेठ","code":4150},{"name":"Sinnar","local":"सिन्नर","code":4154},{"name":"Surgana","local":"सुरगना","code":4142},{"name":"Trimbakeshwar","local":"त्र्यंबक","code":4151},{"name":"Yevla","local":"येवला","code":4156}],"CHANDRAPUR":[{"name":"Ballarpur","local":"","code":4074},{"name":"Bhadravati","local":"","code":4070},{"name":"Brahmapuri","local":"","code":4067},{"name":"Chandrapur","local":"","code":4071},{"name":"Chimur","local":"","code":4065},{"name":"Gondpipri","local":"","code":4078},{"name":"Jiwati","local":"","code":4076},{"name":"Korpana","local":"","code":4075},{"name":"Mul","local":"","code":4072},{"name":"Nagbhir","local":"नागभीड","code":4066},{"name":"Pombhurna","local":"","code":4073},{"name":"Rajura","local":"","code":4077},{"name":"Sawali","local":"","code":4068},{"name":"Sindewahi","local":"","code":4069},{"name":"Warora","local":"","code":4064}],"BHANDARA":[{"name":"Bhandara","local":"भंडारा","code":4039},{"name":"Lakhandur","local":"लाखंदूर","code":4043},{"name":"Lakhani","local":"लाखनी","code":4041},{"name":"Mohadi","local":"मोहाडी","code":4038},{"name":"Pauni","local":"पाउनी","code":4042},{"name":"Sakoli","local":"साकोली","code":4040},{"name":"Tumsar","local":"तुमसर","code":4037}],"NAGPUR":[{"name":"Bhiwapur","local":"भिवापूर","code":4036},{"name":"Hingna","local":"हिंगणा","code":4033},{"name":"Kalameshwar","local":"कळंमेश्वर","code":4025},{"name":"Kamptee","local":"कामथी","code":4030},{"name":"Katol","local":"काटोळ","code":4024},{"name":"Kuhi","local":"कुही","code":4035},{"name":"Mauda","local":"मौदा","code":4029},{"name":"Nagpur (Rural)","local":"नागपूर (ग्रामीण)","code":4031},{"name":"Nagpur (Urban)","local":"नागपूर (शहर)","code":4032},{"name":"Narkhed","local":"नारखेड","code":4023},{"name":"Parseoni","local":"पारशिवनी","code":4027},{"name":"Ramtek","local":"रामटेक","code":4028},{"name":"Savner","local":"सावनेर","code":4026},{"name":"Umred","local":"उमरेड","code":4034}],"OSMANABAD":[{"name":"Bhum","local":"भूम","code":4237},{"name":"Kalamb","local":"कळंब","code":4239},{"name":"Lohara","local":"लोहारा","code":4242},{"name":"Osmanabad","local":"उस्मानाबाद","code":4240},{"name":"Paranda","local":"परंडा","code":4236},{"name":"Tuljapur","local":"तुळजापूर","code":4241},{"name":"Umarga","local":"उमरगा","code":4243},{"name":"Washi","local":"वाशी","code":4238}],"BULDHANA":[{"name":"Buldana","local":"बुलढाणा","code":3984},{"name":"Chikhli","local":"चिखली","code":3983},{"name":"Deolgaon Raja","local":"देउळगाव राजा","code":3985},{"name":"Jalgaon (Jamod)","local":"जळगाव जामोद","code":3975},{"name":"Khamgaon","local":"खामगाव","code":3981},{"name":"Lonar","local":"लोणार","code":3987},{"name":"Malkapur","local":"मलकापूर","code":3979},{"name":"Mehkar","local":"मेहकर","code":3982},{"name":"Motala","local":"मातोळा","code":3980},{"name":"Nandura","local":"नंदूरा","code":3978},{"name":"Sangrampur","local":"संग्रामपूर","code":3976},{"name":"Shegaon","local":"शेगाव","code":3977},{"name":"Sindkhed Raja","local":"सिंधखेड राजा","code":3986}],"RATNAGIRI":[{"name":"Chiplun","local":"चिपळूण","code":4269},{"name":"Dapoli","local":"दापोली","code":4267},{"name":"Guhagar","local":"गुहाघर","code":4270},{"name":"Khed","local":"खेड","code":4268},{"name":"Lanja","local":"लांजा","code":4273},{"name":"Mandangad","local":"मंडणगड","code":4266},{"name":"Rajapur","local":"राजापूर","code":4274},{"name":"Ratnagiri","local":"रत्नागिरी","code":4271},{"name":"Sangameshwar","local":"संगमेश्वर","code":4272}],"PALGHAR":[{"name":"Dahanu","local":"डहाणू","code":4158},{"name":"Jawhar","local":"जव्हार","code":4160},{"name":"Mokhada","local":"मोखाडा","code":4161},{"name":"Palghar","local":"पालघर","code":4163},{"name":"Talasari","local":"तलासरी","code":4157},{"name":"Vada","local":"वाडा","code":4162},{"name":"Vasai","local":"वसई","code":4164},{"name":"Vikramgad","local":"विक्रमगड","code":4159}],"SINDHUDURG":[{"name":"Devgad","local":"देवगड","code":4275},{"name":"Dodamarg","local":"दोडामार्ग","code":4282},{"name":"Kankavli","local":"कणकवली","code":4277},{"name":"Kudal","local":"कुडाळ","code":4280},{"name":"Malwan","local":"मालवण","code":4278},{"name":"Sawantwadi","local":"सावंतवाडी","code":4281},{"name":"Vaibhavvadi","local":"वैभववाडी","code":4276},{"name":"Vengurla","local":"वेंगुर्ला","code":4279}],"DHULE":[{"name":"Dhule","local":"","code":3959},{"name":"Sakri","local":"","code":3958},{"name":"Shirpur","local":"","code":3956},{"name":"Sindkhede","local":"","code":3957}],"PARBHANI":[{"name":"Gangakhed","local":"गंगाखेड","code":4122},{"name":"Jintur","local":"जिंतुर","code":4117},{"name":"Manwath","local":"मानवत","code":4119},{"name":"Palam","local":"पालम","code":4123},{"name":"Parbhani","local":"परभणी","code":4118},{"name":"Pathri","local":"पातरी","code":4120},{"name":"Purna","local":"पुर्णा","code":4124},{"name":"Sailu","local":"सेलू","code":4116},{"name":"Sonpeth","local":"सोनपेठ","code":4121}],"SATARA":[{"name":"Jaoli","local":"जावळी","code":4263},{"name":"Karad","local":"कराड","code":4265},{"name":"Khandala","local":"खंडाळा","code":4257},{"name":"Khatav","local":"खटाव","code":4260},{"name":"Koregaon","local":"कोरेगाव","code":4261},{"name":"Mahabaleshwar","local":"महाबळेश्वर","code":4255},{"name":"Man","local":"मान","code":4259},{"name":"Patan","local":"पाटण","code":4264},{"name":"Phaltan","local":"फलटण","code":4258},{"name":"Satara","local":"सातारा","code":4262},{"name":"Wai","local":"वाई","code":4256}],"WASHIM":[{"name":"Karanja","local":"कारंजा","code":3997},{"name":"Malegaon","local":"मालेगाव","code":3995},{"name":"Mangrulpir","local":"मांगरूळपिर","code":3996},{"name":"Manora","local":"मनोरा","code":3998},{"name":"Risod","local":"रिसोड","code":4000},{"name":"Washim","local":"वाशिम","code":3999}]};

/* ── District-key normalisation ──────────────────────────────────────
 * MAHA_DATA keys districts by UPPERCASE English ("AMRAVATI", "KOLHAPUR").
 * Our DistrictRow.name_en is also UPPERCASE but occasionally byte-corrupted
 * (KOLH>PUR). We normalise the user-supplied key to plain A-Z only before
 * looking it up. Also handles "AHMADNAGAR" alias for "AHMEDNAGAR". */
function normDistrict(raw: string): string {
  if (!raw) return "";
  const upper = raw.toUpperCase().replace(/[^A-Z]+/g, "");
  const aliases: Record<string, string> = {
    AHMADNAGAR: "AHMEDNAGAR",
    AHILYANAGAR: "AHMEDNAGAR",
    CHHATRAPATISAMBHAJINAGAR: "AURANGABAD",
    DHARASHIV: "OSMANABAD",
  };
  return aliases[upper] ?? upper;
}

/* ── Name normalisation ─────────────────────────────────────────────
 * Strip spaces, hyphens, dots, parens and lowercase so that
 *   "Chandur Railway" == "chandurrailway"
 *   "Desaiganj (Vadasa)" == "desaiganjvadasa" */
function normName(raw: string): string {
  if (!raw) return "";
  return raw.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

/* ── Taluka lookup ───────────────────────────────────────────────── */

/** Returns the matched MAHA TalukaEntry, or null. */
export function findTalukaEntry(
  districtKeyRaw: string,
  talukaEnglishName: string,
): TalukaEntry | null {
  const dkey = normDistrict(districtKeyRaw);
  const list = MAHA_TALUKAS[dkey];
  if (!list) return null;
  const want = normName(talukaEnglishName);
  if (!want) return null;
  return list.find((t) => normName(t.name) === want) ?? null;
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
 *  Returns the original English name when no Marathi label is on file. */
export function getVillageDisplayName(
  talukaCode: number | null,
  villageEnglishName: string,
  lang: Lang,
): string {
  if (lang !== "mr") return villageEnglishName;
  if (talukaCode == null || !VILLAGE_CACHE) return villageEnglishName;
  const list = VILLAGE_CACHE[String(talukaCode)];
  if (!list) return villageEnglishName;
  const want = normName(villageEnglishName);
  const match = list.find((v) => normName(v.n) === want);
  if (match && match.l && match.l.trim()) return match.l;
  return villageEnglishName;
}

/** Synchronous "is data ready?" hook for components to render properly. */
export function villageNamesReady(): boolean {
  return VILLAGE_CACHE !== null;
}
