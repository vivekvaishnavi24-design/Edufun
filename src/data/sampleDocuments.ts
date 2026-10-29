export interface SampleStudyMaterial {
  id: string;
  title: string;
  category: string;
  description: string;
  language: "en" | "hi" | "sa";
  suggestedQuestions: number;
  content: string;
}

export const SAMPLE_STUDY_MATERIALS: SampleStudyMaterial[] = [
  {
    id: "chapter_weather",
    title: "Chapter: Weather, Atmosphere & Climate Systems",
    category: "Earth Science & Weather",
    description: "Atmospheric pressure, cloud types (cirrus, cumulus, stratus), humidity, Coriolis effect, cold and warm fronts, and barometric storm prediction.",
    language: "en",
    suggestedQuestions: 6,
    content: `Chapter: Weather, Atmospheric Dynamics and Climate Systems:
Weather represents the short-term, fluctuating state of the atmosphere at a given location and time, governed by solar radiation, air density, humidity, and Earth's planetary rotation.

1. Atmospheric Structure & Troposphere:
- Troposphere: The lowest atmospheric layer (0 to 12 km), containing 75% of atmospheric mass and 99% of all atmospheric water vapor. All active clouds, precipitation, and storm cycles occur in this layer.
- Atmospheric Pressure: The force exerted by the weight of air above. Standard sea level pressure is 1013.25 mb (hPa) or 29.92 inches of mercury. Pressure drops exponentially with altitude.

2. Cloud Classification & Precipitation:
- Cumulus: Fluffy, cotton-like clouds with flat bases indicating convective thermal uplift and fair weather.
- Stratus: Featureless, low grey sheets covering the sky, frequently producing steady drizzle or light rain.
- Cirrus: High, wispy clouds composed entirely of ice crystals above 6,000 meters, often indicating an approaching frontal change.
- Cumulonimbus: Anvil-shaped, towering thunderstorm clouds reaching the tropopause, producing violent downpours, lightning, hail, and squalls.

3. Pressure Systems & Global Winds:
- High Pressure (Anticyclones): Characterized by sinking dry air, outward diverging surface winds, and clear, calm skies.
- Low Pressure (Cyclones): Characterized by converging surface winds and rising buoyant air, producing cloudiness and active weather.
- Coriolis Effect: Planetary rotation deflects moving winds to the right in the Northern Hemisphere and to the left in the Southern Hemisphere, causing rotational cyclonic storm patterns.
- Jet Streams: Narrow, high-velocity meandering wind currents in the upper troposphere (up to 400 km/h) that steer mid-latitude weather disturbances.

4. Weather Fronts & Instruments:
- Cold Front: Dense cold air rapidly displaces warm air upward along a steep boundary, triggering brief intense downpours and sharp temperature drops.
- Warm Front: Lighter warm air ascends gradually over retreating cold air, producing widespread stratus cloud cover and prolonged gentle rain.
- Barometer: Measures barometric pressure (falling pressure warns of approaching storms).
- Anemometer: Measures wind velocity.
- Hygrometer: Measures relative air humidity.`
  },
  {
    id: "sanskrit_grammar",
    title: "संस्कृतव्याकरणम्: सन्धिप्रकरणम् (Sanskrit Sandhi Rules)",
    category: "संस्कृतम् (Sanskrit)",
    description: "अच्-सन्धिः (स्वरसन्धिः), हल्-सन्धिः (व्यञ्जनसन्धिः) तथा विसर्गसन्धिः नियमाः सोदाहरणम्।",
    language: "sa",
    suggestedQuestions: 5,
    content: `संस्कृतव्याकरणे सन्धिप्रकरणम्:
द्वयोः वर्णयोः परस्परं व्यवधानरहितं सामीप्यं संहिता इत्युच्यते। वर्णानां मेलनेन यत् रूपान्तरं वा विकारः जायते, सा सन्धिः भवति।

१. अच्-सन्धिः (स्वरसन्धिः):
- दीर्घसन्धिः (अकः सवर्णे दीर्घः): यदि ह्रस्व-दीर्घ-अ-इ-उ-ऋ-वर्णेभ्यः परं सवर्णाः स्वराः आगच्छन्ति, तर्हि तयोः स्थाने दीर्घः एकादेशः भवति।
  उदा. विद्या + आलयः = विद्यालयः, हिम + आलयः = हिमालयः, भानु + उदयः = भानुदयः।
- गुणसन्धिः (आद्गुणः): अ/आ इत्यस्मात् परं इ/ई, उ/ऊ, ऋ/ॠ आगच्छति चेत् तयोः स्थाने क्रमशः ए, ओ, अर् भवति।
  उदा. नर + ईशः = नरेशः, सूर्य + उदयः = सूर्योदयः, महा + ऋषिः = महर्षिः।
- वृद्धिसन्धिः (वृद्धिरेचि): अ/आ इत्यस्मात् परं ए/ऐ वा ओ/औ आगच्छति चेत् तयोः स्थाने क्रमशः ऐ, औ भवति।
  उदा. एक + एकम् = एकैकम्, जल + ओघः = जलौघः।
- यण्-सन्धिः (इको यणचि): इ/ई, उ/ऊ, ऋ/ॠ, लृ इत्येभ्यः परं असवर्णाः स्वराः आगच्छन्ति चेत् क्रमशः य्, व्, र्, ल् भवन्ति।
  उदा. इति + आदि = इत्यादि, सु + आगतम् = स्वागतम्।

२. हल्-सन्धिः (व्यञ्जनसन्धिः):
- श्चुत्वसन्धिः (स्तोः श्चुना श्चुः): सकार-तवर्गयोः स्थाने शकार-चवर्गाभ्यां योगे क्रमशः शकार-चवर्गाः भवन्ति।
  उदा. सत् + चित् = सच्चित्, रामस् + चिनोति = रामश्चिनोति।
- जश्त्वसन्धिः (झलां जशोऽन्ते): पदान्ते स्थितानां झल्-वर्णानां स्थाने जश्-वर्णाः (ज्, ब्, ग्, ड्, द्) भवन्ति।
  उदा. वाक् + ईशः = वागीशः, अच् + अन्तः = अजन्तः।

३. विसर्गसन्धिः:
- विसर्गस्य उत्वम् (अतो रोरप्लुतादप्लुते): ह्रस्वात् अकारात् परस्य विसर्गस्य ह्रस्वे अकारे परे उत्वं भवति, ततः गुणसन्धिः पूर्वरूपं च भवति।
  उदा. शिवः + अर्च्यः = शिवोऽर्च्यः, कः + अपि = कोऽपि।
- विसर्गस्य सत्वम् (विसर्जनीयस्य सः): खर्-प्रत्याहारे परे विसर्गस्य सकारः भवति।
  उदा. नमः + ते = नमस्ते, विष्णुः + त्राता = विष्णुस्त्राता।`
  },
  {
    id: "hindi_literature",
    title: "हिन्दी व्याकरण एवं काव्यशास्त्र: रस और अलंकार",
    category: "हिन्दी (Hindi)",
    description: "काव्य के प्रमुख रस (शृंगार, वीर, करुण) एवं प्रमुख अलंकार (अनुप्रास, यमक, उपमा, रूपक)।",
    language: "hi",
    suggestedQuestions: 5,
    content: `हिन्दी काव्यशास्त्र: रस, छंद और अलंकार का परिचय:

१. रस सिद्धान्त:
आचार्य भरतमुनि के अनुसार: "विभावानुभावव्यभिचारिसंयोगाद्रसनिष्पत्तिः" अर्थात् विभाव, अनुभाव और संचारी भाव के संयोग से रस की निष्पत्ति होती है।
- रस के चार प्रमुख अंग होते हैं: स्थायी भाव, विभाव (आलम्बन और उद्दीपन), अनुभाव और संचारी/व्यभिचारी भाव (कुल ३३)।
- प्रमुख रस और उनके स्थायी भाव:
  १. शृंगार रस: स्थायी भाव 'रति' (प्रेम)। इसके दो भेद हैं - संयोग शृंगार और वियोग (विप्रलम्भ) शृंगार।
  २. वीर रस: स्थायी भाव 'उत्साह'।
  ३. करुण रस: स्थायी भाव 'शोक'।
  ४. रौद्र रस: स्थायी भाव 'क्रोध'।
  ५. शान्त रस: स्थायी भाव 'शम' या 'निर्वेद'।
  ६. हास्य रस: स्थायी भाव 'हास'।

२. अलंकार सिद्धान्त:
काव्य की शोभा बढ़ाने वाले धर्मों को अलंकार कहते हैं।
- शब्दालंकार (जहाँ शब्दों के प्रयोग से चमत्कार उत्पन्न हो):
  १. अनुप्रास अलंकार: जहाँ एक ही वर्ण की आवृत्ति बार-बार हो (उदा. "चारु चंद्र की चंचल किरणें, खेल रही थीं जल-थल में")।
  २. यमक अलंकार: जहाँ एक शब्द दो या दो से अधिक बार आए और हर बार उसका अर्थ भिन्न हो (उदा. "कनक कनक ते सौ गुनी मादकता अधिकाय, या खाये बौराय जग या पाये बौराय" - यहाँ कनक का अर्थ धतूरा और सोना है)।
  ३. श्लेष अलंकार: जहाँ एक ही शब्द एक बार प्रयुक्त हो किन्तु प्रसंगवश उसके अनेक अर्थ निकलें।
- अर्थालंकार (जहाँ अर्थ के कारण चमत्कार हो):
  १. उपमा अलंकार: जहाँ उपमेय (प्रस्तुत) की तुलना उपमान (अFlags/अप्रस्तुत) से सादृश्यवाचक शब्द (सा, सी, सम, सरिस) द्वारा की जाए (उदा. "पीपर पात सरिस मन डोला")।
  २. रूपक अलंकार: जहाँ उपमेय और उपमान में भेद रहित अभेद आरोप किया जाए (उदा. "चरन कमल बन्दौ हरिराई")।
  ३. उत्प्रेक्षा अलंकार: जहाँ उपमेय में उपमान की संभावना व्यक्त की जाए (वाचक शब्द: मनु, मानो, जनु, जानो आदि)।`
  },
  {
    id: "bio_respiration",
    title: "Biology: Cellular Respiration & ATP Synthesis",
    category: "Life Sciences",
    description: "Glycolysis, Krebs Cycle, Electron Transport Chain, and oxidative phosphorylation.",
    language: "en",
    suggestedQuestions: 6,
    content: `Cellular Respiration and Energy Metabolism:
Cellular respiration is the biochemical process by which eukaryotic cells convert biochemical energy from nutrients (primarily glucose) into adenosine triphosphate (ATP), and release waste products (carbon dioxide and water).

1. Glycolysis:
- Takes place in the cytoplasm of the cell.
- Does NOT require oxygen (anaerobic).
- One 6-carbon glucose molecule is broken down into two 3-carbon pyruvate molecules.
- Net gain per glucose: 2 ATP molecules (4 ATP produced minus 2 ATP consumed in investment phase) and 2 NADH molecules.
- Substrate-level phosphorylation is the mechanism used to synthesize ATP here.

2. Pyruvate Oxidation (Link Reaction):
- Pyruvate enters the mitochondrial matrix via active transport.
- Each pyruvate is converted into Acetyl-CoA, producing 1 NADH and releasing 1 CO2 per pyruvate (2 NADH and 2 CO2 per glucose).

3. The Citric Acid Cycle (Krebs Cycle):
- Located inside the mitochondrial matrix.
- Acetyl-CoA combines with oxaloacetate (4 carbons) to form citrate (6 carbons).
- For each turn of the cycle (one acetyl group): generates 3 NADH, 1 FADH2, 1 ATP (or GTP via substrate-level phosphorylation), and 2 CO2 molecules.
- Since one glucose produces two acetyl-CoAs, the cycle turns twice per glucose, producing 6 NADH, 2 FADH2, 2 ATP, and 4 CO2.

4. Oxidative Phosphorylation & Electron Transport Chain (ETC):
- Located in the inner mitochondrial membrane (cristae).
- High-energy electrons from NADH and FADH2 are transferred through protein complexes I to IV.
- Oxygen serves as the final electron acceptor, combining with protons (H+) to form water (H2O).
- Protons are pumped from the mitochondrial matrix into the intermembrane space, generating a steep electrochemical proton gradient (proton-motive force).
- Chemiosmosis: Protons flow back into the matrix through ATP synthase, driving the phosphorylation of ADP to ATP.
- NADH yields approximately 2.5 to 3 ATPs; FADH2 enters at Complex II and yields approximately 1.5 to 2 ATPs because its electrons enter at a lower energy level.
- Total theoretical yield: approximately 30 to 32 ATP per glucose molecule in eukaryotes.`
  },
  {
    id: "cs_os",
    title: "Computer Science: Operating Systems & Virtual Memory",
    category: "Computing",
    description: "Processes, threads, scheduling algorithms, paging, and page fault handling.",
    language: "en",
    suggestedQuestions: 6,
    content: `Operating Systems Principles: Processes, Scheduling, and Virtual Memory:

1. Process Management vs. Threads:
- A Process is an execution instance of a program in memory with its own independent virtual address space (including text, data, heap, and stack).
- A Thread is the smallest unit of CPU execution within a process. Multiple threads in the same process share code, data sections, and OS resources (e.g., open files), but maintain private thread-specific program counters, register sets, and call stacks.
- Context switching between threads in the same process is significantly faster than between separate processes because memory page tables do not need to be flushed.

2. CPU Scheduling:
- Preemptive Scheduling: The CPU can be taken away from a running process before it voluntarily relinquishes it (e.g., Round Robin, Shortest Remaining Time First).
- Non-Preemptive Scheduling: A process holds the CPU until it terminates or enters a waiting/blocked I/O state (e.g., First-Come-First-Served).
- Round Robin (RR) scheduling uses fixed time slices (time quantum). If the quantum is too small, excessive context switching overhead degrades throughput; if too large, it degenerates into FCFS.

3. Deadlocks:
- A deadlock condition occurs when a set of processes are blocked because each is holding a resource and waiting for another resource held by another process.
- Coffman's Four Necessary Conditions: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. Breaking any single condition prevents deadlock.

4. Virtual Memory and Paging:
- Virtual memory decouples physical memory size from logical address spaces, allowing programs larger than physical RAM to execute.
- Logical addresses are partitioned into Pages; physical RAM is divided into matching fixed-size Page Frames.
- The Memory Management Unit (MMU) uses the Page Table to translate virtual page numbers (VPN) to physical frame numbers (PFN).
- Translation Lookaside Buffer (TLB): A fast associative hardware cache storing recent page translations. A TLB miss incurs extra memory accesses.
- Page Fault: An interrupt generated when an accessed page is marked as invalid/not present in RAM. The OS swaps the required page in from secondary storage (disk/SSD).
- Thrashing: Occurs when a system spends more time servicing page faults and swapping pages than executing instructions, typically when total working set sizes exceed physical memory.`
  },
  {
    id: "hist_industrial",
    title: "World History: The Industrial Revolution",
    category: "History",
    description: "Key technological inventions, economic shifts, urbanization, and social impacts.",
    language: "en",
    suggestedQuestions: 5,
    content: `The Industrial Revolution (c. 1760 – 1840):
The First Industrial Revolution marked a profound transformation from agrarian, handicraft economies to machine-driven industrial manufacturing, beginning in Great Britain.

1. Catalysts in Great Britain:
- Abundant domestic coal and iron ore deposits situated close to navigable rivers and canals.
- Agricultural Revolution improvements (e.g., crop rotation, selective breeding, seed drill) created food surpluses, freeing agricultural labor for factory work.
- Access to global colonial markets, raw cotton imports, and accumulated capital for investment.
- Strong patent protections and stable legal institutions.

2. Technological Breakthroughs:
- Textiles: James Hargreaves' Spinning Jenny (1764), Richard Arkwright's Water Frame (1769), and Samuel Crompton's Spinning Mule dramatically increased thread output.
- Steam Power: James Watt's separate condenser (1769) radically improved the efficiency of Thomas Newcomen's earlier atmospheric steam engine, allowing factories to relocate away from riverbanks.
- Iron Smelting: Henry Cort's puddling process and rolling mill enabled the commercial production of wrought iron.

3. Socioeconomic Impacts:
- Urbanization: Rapid migration from countryside to industrial centers (e.g., Manchester, Birmingham, Leeds). Cities suffered severe overcrowding, lack of sanitation, and spread of cholera.
- Labor Conditions: 12-to-16-hour workdays, 6 days a week, with widespread child labor in coal mines and cotton mills due to lower wages and nimble hands.
- Social Stratification: Rise of the industrial bourgeoisie (factory owners, bankers) and the industrial working class (proletariat).
- Legislative Reforms: The Factory Act of 1833 in Britain restricted workday hours for children under 13 and mandated basic education.`
  }
];
