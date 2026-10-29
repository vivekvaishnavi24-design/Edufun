import { ImagineCreativitySimulation } from '../types';

export const IMAGINE_CREATIVITY_PRESETS: ImagineCreativitySimulation[] = [
  {
    id: 'weather_water_cycle',
    question: 'How does the water cycle and weather work?',
    conceptTitle: 'The Infinite Water Cycle & Weather Engine',
    emoji: '🌧️',
    category: 'Natural Sciences & Earth Meteorology',
    summary: 'Earth has had the exact same water for billions of years! Water continually journeys through four miraculous transformations: Evaporation from oceans, Condensation into clouds, Precipitation as rain or snow, and Collection back into rivers and oceans.',
    realWorldAnalogy: 'Think of Earth as a gigantic solar-powered boiling pot with a cool glass lid. The sun heats the pot, steam rises, sticks to the lid as cool droplets, and drips right back into the pot!',
    stages: [
      {
        id: 'evap_stage',
        stageNumber: 1,
        title: 'Stage 1: Evaporation & Transpiration ☀️🌊',
        subtitle: 'The Sun heats liquid water, turning it into invisible vapor',
        narration: 'The sun shines down on oceans, lakes, and plants. The solar heat gives liquid water molecules kinetic energy, causing them to break free from the surface and rise into the atmosphere as invisible water vapor. Plants also release water vapor through tiny pores in their leaves called stomata—a process called transpiration.',
        visualScene: 'weather_water_cycle',
        actionPrompt: 'Watch water vapor particles shimmering and rising from the ocean surface toward the sky!',
        highlightLabels: ['Solar Radiation ☀️', 'Ocean Surface 🌊', 'Rising Water Vapor 🫧', 'Leaf Transpiration 🍃'],
        keyPrinciple: 'Heat increases molecular kinetic energy: Liquid Water (H₂O) → Water Vapor (Gas)'
      },
      {
        id: 'cond_stage',
        stageNumber: 2,
        title: 'Stage 2: Condensation & Cloud Formation ☁️',
        subtitle: 'High up in the cold sky, vapor cools into billions of tiny droplets',
        narration: 'As warm water vapor climbs higher into the atmosphere, the air pressure drops and the air becomes much colder. Cold air cannot hold as much moisture, so the vapor cools down and condenses onto microscopic airborne dust particles (cloud condensation nuclei), gathering into fluffy, dense clouds.',
        visualScene: 'weather_water_cycle',
        actionPrompt: 'Notice how the clouds grow thicker and darker as more water vapor molecules gather!',
        highlightLabels: ['Cold Upper Troposphere ❄️', 'Microscopic Cloud Nuclei 🌫️', 'Cumulonimbus Cloud ☁️'],
        keyPrinciple: 'Cooling causes water vapor gas to condense back into microscopic liquid droplets.'
      },
      {
        id: 'precip_stage',
        stageNumber: 3,
        title: 'Stage 3: Precipitation (Rain, Snow & Hail) 🌧️❄️',
        subtitle: 'Droplets merge until they become too heavy for clouds to hold',
        narration: 'Inside the clouds, billions of tiny droplets bump into each other and fuse into larger, heavier drops. Eventually, gravity wins! When the cloud can no longer support their immense weight, the droplets fall back to Earth as precipitation—rain if the air is warm, or snow and hail if the temperature is below freezing.',
        visualScene: 'weather_water_cycle',
        actionPrompt: 'Trigger rain or increase cloud saturation to watch downpours splash against the mountain!',
        highlightLabels: ['Gravitational Pull ⬇️', 'Falling Raindrops 🌧️', 'Mountain Splash 🏔️'],
        keyPrinciple: 'Gravity pulls heavy water drops downward when upward air currents can no longer hold them.'
      },
      {
        id: 'collect_stage',
        stageNumber: 4,
        title: 'Stage 4: Collection, Runoff & Infiltration 🏞️🌊',
        subtitle: 'Water flows down rivers and percolates underground back to the ocean',
        narration: 'Precipitation lands on mountains, soil, and forests. Much of it gathers into bubbling mountain streams and rivers that flow downhill into lakes and oceans. Another portion seeps deep into the soil as groundwater (infiltration), replenishing underground aquifers and plant roots, ready for the cycle to begin all over again!',
        visualScene: 'weather_water_cycle',
        actionPrompt: 'See the river runoff surging from mountain slopes into the ocean reservoir!',
        highlightLabels: ['Surface Runoff 🏞️', 'Soil Infiltration 🪵', 'Groundwater Aquifer 💧', 'Ocean Reservoir 🌊'],
        keyPrinciple: 'Earth is a closed system: no new water is ever created or destroyed; it is perpetually recycled.'
      }
    ],
    interactiveKnobs: [
      {
        id: 'sun_heat',
        label: 'Sun Heat Intensity',
        type: 'slider',
        min: 10,
        max: 100,
        defaultValue: 60,
        unit: '%',
        impactDescription: 'Higher sun heat speeds up evaporation and creates more rising vapor bubbles.'
      },
      {
        id: 'cloud_density',
        label: 'Cloud Saturation',
        type: 'slider',
        min: 10,
        max: 100,
        defaultValue: 55,
        unit: '%',
        impactDescription: 'Darkens and swells clouds, triggering rain showers when over 65%.'
      },
      {
        id: 'is_raining',
        label: 'Rain Downpour 🌧️',
        type: 'toggle',
        defaultValue: true,
        impactDescription: 'Toggles active precipitation showers and splashes across the landscape.'
      },
      {
        id: 'lightning_storm',
        label: 'Lightning Thunderstorm ⚡',
        type: 'toggle',
        defaultValue: false,
        impactDescription: 'Triggers storm clouds with electric lightning bolts and atmospheric charge.'
      }
    ],
    comprehensionQuiz: [
      {
        question: 'What natural energy source powers the entire water cycle on Earth?',
        options: ['The Sun (Solar Radiation)', 'Earth\'s Magnetic Field', 'Ocean Waves', 'Wind Turbines'],
        correctIndex: 0,
        explanation: 'The Sun provides the thermal radiation that heats surface water, transforming liquid into water vapor and driving evaporation!'
      },
      {
        question: 'What happens when water vapor rises high into the cool atmosphere?',
        options: [
          'It escapes into outer space forever',
          'It cools and condenses into cloud droplets',
          'It instantly turns into solid diamonds',
          'It combusts and catches on fire'
        ],
        correctIndex: 1,
        explanation: 'As vapor ascends, temperatures drop. The vapor condenses around tiny airborne dust particles to form clouds.'
      }
    ],
    funFact: 'The water you drink today may have once been drunk by a Tyrannosaurus Rex 66 million years ago, because Earth continuously recycles the exact same water molecules!',
    difficulty: 'intermediate',
    difficultyVariants: {
      beginner: {
        conceptTitle: 'Where Does Rain Come From? The Water Adventure! 🌧️🌈',
        summary: 'Water goes on a magical round-trip loop! The sun heats water into invisible steam, it floats up into fluffy clouds, turns into rain drops, and splashes back down to Earth.',
        realWorldAnalogy: 'Think of Earth like a giant bubbly bath with a cool ceiling: Steam rises up, turns into drips, and splashes right back into the bath!',
        stages: [
          {
            id: 'evap_stage',
            stageNumber: 1,
            title: 'Stage 1: Sun Heats the Puddles ☀️💧',
            subtitle: 'Warm sunshine turns water into invisible floating vapor',
            narration: 'Look at the warm sun shining down on the ocean! When water gets warm, it turns into tiny invisible floating steam bubbles that float up into the sky.',
            visualScene: 'weather_water_cycle',
            actionPrompt: 'Tap the bright Sun to warm up the water and watch steam rise!',
            highlightLabels: ['Warm Sun ☀️', 'Blue Ocean 🌊', 'Rising Steam 🫧'],
            keyPrinciple: 'Heat makes water evaporate into the air.'
          },
          {
            id: 'cond_stage',
            stageNumber: 2,
            title: 'Stage 2: Fluffy Clouds Form ☁️',
            subtitle: 'Up in the cold sky, steam cools into fluffy white clouds',
            narration: 'Way up high in the sky, it is very chilly! The floating steam cools down and hugs together into big fluffy clouds.',
            visualScene: 'weather_water_cycle',
            actionPrompt: 'Click on the clouds to make them grow thicker and darker!',
            highlightLabels: ['Chilly Sky ❄️', 'Fluffy Clouds ☁️'],
            keyPrinciple: 'Cold air turns water vapor back into cloud drops.'
          },
          {
            id: 'precip_stage',
            stageNumber: 3,
            title: 'Stage 3: Rain Splashes Down! 🌧️',
            subtitle: 'When clouds get too full and heavy, raindrops fall',
            narration: 'When the cloud gets too full and heavy with water, it cannot hold it anymore! Splash! Raindrops fall down to water plants, trees, and puddles.',
            visualScene: 'weather_water_cycle',
            actionPrompt: 'Tap the raincloud to make it rain all over the mountain!',
            highlightLabels: ['Raindrops 🌧️', 'Mountain Splash 🏔️'],
            keyPrinciple: 'Rain falls when clouds get too heavy.'
          },
          {
            id: 'collect_stage',
            stageNumber: 4,
            title: 'Stage 4: Rivers Flow to the Sea 🏞️',
            subtitle: 'Rainwater flows down streams and fills our oceans again',
            narration: 'The fallen rain flows into babbling streams, rushing rivers, and back to the big ocean, ready to start the adventure all over again!',
            visualScene: 'weather_water_cycle',
            actionPrompt: 'Follow the river flowing back to the ocean!',
            highlightLabels: ['Rushing River 🏞️', 'Big Ocean 🌊'],
            keyPrinciple: 'Earth recycles the exact same water forever!'
          }
        ],
        comprehensionQuiz: [
          {
            question: 'What gives water the heat it needs to float up into the sky?',
            options: ['The warm Sun ☀️', 'A giant refrigerator', 'A flashlight', 'A fan'],
            correctIndex: 0,
            explanation: 'The Sun gives warm heat that warms puddles, lakes, and oceans into rising vapor!'
          },
          {
            question: 'What happens when clouds get too heavy with water droplets?',
            options: ['It rains or snows! 🌧️', 'The clouds turn to stone', 'The clouds float to the moon', 'Nothing happens'],
            correctIndex: 0,
            explanation: 'When clouds get too heavy, gravity pulls the raindrops down as rain!'
          }
        ]
      },
      advanced: {
        conceptTitle: 'Thermodynamics of the Hydrological Cycle & Atmospheric Moisture Dynamics 🌧️⚡',
        summary: 'The hydrological cycle is Earth\'s primary planetary heat engine. Solar irradiance drives latent heat flux through ocean evaporation and vegetative evapotranspiration. Adiabatic cooling in ascending air parcels leads to saturation at the lifting condensation level (LCL), Bergeron-Findeisen precipitation coalescence, and orographic runoff balancing global hydrostatic equilibrium.',
        realWorldAnalogy: 'A planetary-scale Rankine refrigeration cycle: The equatorial oceans act as the evaporator boiler absorbing latent heat of vaporization (2.5×10⁶ J/kg), while the upper troposphere serves as the condenser radiator rejecting heat to space via cloud albedo and infrared cooling.',
        stages: [
          {
            id: 'evap_stage',
            stageNumber: 1,
            title: 'Stage 1: Latent Heat Flux & Evapotranspiration ☀️🌊',
            subtitle: 'Phase change consumes 2260 kJ/kg, elevating atmospheric moisture mass',
            narration: 'Shortwave solar irradiance drives surface sensible and latent heat flux. Water molecules overcome hydrogen bonding intermolecular forces, vaporizing into the boundary layer. Stomatal transpiration from terrestrial vegetation couples carbon uptake with water vapor flux along the atmospheric vapor pressure deficit (VPD).',
            visualScene: 'weather_water_cycle',
            actionPrompt: 'Examine surface latent heat exchange and molecular vapor flux vectoring!',
            highlightLabels: ['Latent Heat of Vaporization (Lv)', 'Vapor Pressure Deficit (VPD)', 'Boundary Layer Mixing', 'Ocean-Atmosphere Boundary'],
            keyPrinciple: 'dQ = Lv × dm. Phase transition absorbs 2.26 MJ per kilogram of water vapor.'
          },
          {
            id: 'cond_stage',
            stageNumber: 2,
            title: 'Stage 2: Adiabatic Expansion & Cloud Microphysics ☁️',
            subtitle: 'Air parcels cool at dry/saturated adiabatic lapse rates to reach LCL',
            narration: 'Convective or orographic uplift causes thermodynamic adiabatic expansion. As parcels reach the Lifting Condensation Level (LCL), relative humidity achieves 100% (supersaturation). Vapor condenses heterogeneously onto hygroscopic aerosols (sulfates, sea salt) via Köhler theory, releasing latent heat of condensation.',
            visualScene: 'weather_water_cycle',
            actionPrompt: 'Track the lifting condensation level isotherm and droplet radius growth!',
            highlightLabels: ['Adiabatic Lapse Rate (Γ)', 'Cloud Condensation Nuclei (CCN)', 'Köhler Activation', 'Latent Heat Release'],
            keyPrinciple: 'Heterogeneous nucleation on aerosol nuclei releases latent heat, buoying updrafts.'
          },
          {
            id: 'precip_stage',
            stageNumber: 3,
            title: 'Stage 3: Collision-Coalescence & Bergeron-Findeisen Coalescence 🌧️❄️',
            subtitle: 'Differing vapor pressures over ice vs supercooled liquid yield terminal precipitation velocity',
            narration: 'In mixed-phase clouds, saturation vapor pressure over ice is lower than over supercooled liquid water (Bergeron process), causing rapid vapor deposition onto ice crystals at the expense of droplets. Droplets reach critical terminal fall velocity, overcoming vertical updrafts to precipitate.',
            visualScene: 'weather_water_cycle',
            actionPrompt: 'Observe ice-liquid vapor pressure differentials and precipitation terminal velocity!',
            highlightLabels: ['Bergeron-Findeisen Mechanism', 'Terminal Fall Velocity', 'Orographic Rainout', 'Hydrometeor Growth'],
            keyPrinciple: 'Differential saturation vapor pressures over ice versus supercooled water drive crystal growth.'
          },
          {
            id: 'collect_stage',
            stageNumber: 4,
            title: 'Stage 4: Hydrostatic Runoff, Infiltration & Aquifer Residence 🏞️🌊',
            subtitle: 'Darcy\'s law hydraulic conductivity returns discharge to oceanic reservoirs',
            narration: 'Precipitation partitions into surface hortonian overland runoff and vadose zone infiltration governed by Richards equation and Darcy\'s law. Deep percolation replenishes unconfined aquifers with multidecadal residence times before baseflow discharge returns water to oceanic basins.',
            visualScene: 'weather_water_cycle',
            actionPrompt: 'Trace watershed drainage basins, hydraulic gradients, and baseflow equilibrium!',
            highlightLabels: ['Darcy Hydraulic Gradient', 'Vadose Zone Percolation', 'Watershed Hydrograph', 'Oceanic Mass Balance'],
            keyPrinciple: 'Planetary mass conservation: dS/dt = Precipitation - (Evapotranspiration + Runoff).'
          }
        ],
        comprehensionQuiz: [
          {
            question: 'What thermodynamic process causes air parcels to cool as they ascend through the atmosphere?',
            options: [
              'Adiabatic expansion due to decreasing atmospheric pressure',
              'Direct thermal conduction to space',
              'Chemical neutralization with ozone',
              'Friction against the stratosphere'
            ],
            correctIndex: 0,
            explanation: 'As air ascends, lower ambient pressure causes the parcel to expand against its surroundings, doing thermodynamic work and cooling adiabatically!'
          },
          {
            question: 'Why do ice crystals grow rapidly at the expense of supercooled water droplets in the Bergeron-Findeisen process?',
            options: [
              'Saturation vapor pressure over ice is lower than over liquid water at the same sub-zero temperature',
              'Ice has a higher density than liquid water',
              'Water droplets are repelled by Earth\'s magnetic field',
              'Supercooled water cannot freeze'
            ],
            correctIndex: 0,
            explanation: 'Because water molecules bind more tightly in the ice lattice, saturation vapor pressure over ice is lower than over supercooled liquid, creating a vapor pressure gradient towards ice!'
          }
        ]
      }
    }
  },
  {
    id: 'photosynthesis',
    question: 'How do plants make food and oxygen using photosynthesis?',
    conceptTitle: 'Photosynthesis: How Plants Turn Light, Water & Air into Food & Oxygen',
    emoji: '🌱',
    category: 'Biological & Botanical Sciences',
    summary: 'Photosynthesis is nature\'s solar kitchen! Green plants absorb 3 simple ingredients: Sunlight (☀️ solar energy), Water (💧 H₂O from soil), and Carbon Dioxide (💨 CO₂ from air). Inside microscopic green factories called chloroplasts, they transform these ingredients into sweet Glucose sugar (🍬 food energy for the plant) and release pure Oxygen gas (🫧 O₂ for humans and animals to breathe!).',
    realWorldAnalogy: 'Think of every leaf as a solar-powered bakery: Sunlight is the power running the oven, Water and Carbon Dioxide are the flour and yeast, sweet Glucose sugar is the freshly baked bread, and clean Oxygen puffs out the chimney like aromatic steam!',
    stages: [
      {
        id: 'photo_light',
        stageNumber: 1,
        title: 'Stage 1: Trapping Sunlight Photons ☀️🍃',
        subtitle: 'Green chlorophyll pigments inside leaf chloroplasts capture solar light packets',
        narration: 'Look at the Sun beaming golden light photons down onto the plant leaf. The leaf is packed with millions of microscopic green pigment molecules called Chlorophyll. Just like miniature solar panels, chlorophyll absorbs radiant photon energy and converts it into electrical and chemical charging power.',
        visualScene: 'photosynthesis',
        actionPrompt: 'Watch the golden solar photons showering onto the green leaf and exciting chlorophyll thylakoids!',
        highlightLabels: ['Sunlight Photons ☀️', 'Leaf Solar Panel 🌿', 'Chlorophyll Pigments 🟢', 'Solar Charging ⚡'],
        keyPrinciple: 'Chlorophyll selectively captures photon energy to power the chemical synthesis of food.'
      },
      {
        id: 'photo_inputs',
        stageNumber: 2,
        title: 'Stage 2: Drinking Soil Water & Inhaling CO₂ 💧💨',
        subtitle: 'Roots suck up H₂O through stem pipelines while leaf stomata breathe in CO₂ gas',
        narration: 'Next, the plant gathers its raw ingredients. Deep underground, branching roots pull moisture (H₂O) from the soil like millions of tiny straws. This water rushes up the stem inside blue xylem pipelines into the leaf veins. At the exact same time, microscopic breathing mouths on the underside of the leaf, called Stomata, open their guard cells to breathe in carbon dioxide (CO₂) from the ambient air.',
        visualScene: 'photosynthesis',
        actionPrompt: 'Follow the blue water molecules climbing up the stem and purple CO₂ molecules entering the leaf stomata pore!',
        highlightLabels: ['Root Water Uptake (H₂O) 💧', 'Stem Xylem Pipeline ⬆️', 'Leaf Stomata Pore 👄', 'Atmospheric CO₂ 💨'],
        keyPrinciple: 'Plants combine 6 molecules of Water (H₂O) from soil + 6 molecules of Carbon Dioxide (CO₂) from air.'
      },
      {
        id: 'photo_reaction',
        stageNumber: 3,
        title: 'Stage 3: Splitting Water & Assembling Sugar (Inside Chloroplast) ⚡🔬',
        subtitle: 'Water molecules are cracked apart and carbon atoms are stitched into sugar',
        narration: 'Now zoom inside the green Chloroplast factory! First, inside the pancake-like thylakoid discs (Light Reactions), light photons crack water molecules (H₂O) apart with an energetic spark! The oxygen atom is separated and floats away, while hydrogen and ATP energy carriers cross the bridge to the Calvin cycle wheel. In this biochemical kitchen, Rubisco enzymes take Carbon from CO₂ and Hydrogen from water, stitching them together into sweet Glucose sugar!',
        visualScene: 'photosynthesis',
        actionPrompt: 'Observe the water molecule split into oxygen gas and hydrogen, and watch the Calvin cycle wheel assemble sugar!',
        highlightLabels: ['Water Splitting (Photolysis) 💥', 'Oxygen Freeing 🫧', 'Calvin Cycle Wheel 🔄', 'Sugar Assembly 🧪'],
        keyPrinciple: '6 CO₂ + 6 H₂O + Sunlight Energy ➔ C₆H₁₂O₆ (Glucose Sugar) + 6 O₂ (Oxygen Gas)'
      },
      {
        id: 'photo_outputs',
        stageNumber: 4,
        title: 'Stage 4: Glucose Sugar Stored & Pure Oxygen Released 🍬🫧',
        subtitle: 'Sweet food feeds stems, roots, and fruits while fresh oxygen purifies the planet',
        narration: 'The miraculous products are complete! The plant produces energy-dense Glucose sugar crystals (C₆H₁₂O₆). These flow down golden phloem pipelines to nourish the stems, roots, blossoming flowers, and sweet fruits for plant growth. As an incredible blessing for all living creatures, pure Oxygen gas (O₂) bubbles out of the stomata into the atmosphere for humans and animals to breathe!',
        visualScene: 'photosynthesis',
        actionPrompt: 'See fresh oxygen bubbles floating up into the sky and golden glucose food traveling through the plant!',
        highlightLabels: ['Glucose Food Crystals (C₆H₁₂O₆) 🍬', 'Fresh Oxygen Bubbles (O₂) 🫧', 'Phloem Highway ⬇️', 'Plant Growth 🪴'],
        keyPrinciple: 'Virtually all food energy on Earth and every breath of oxygen we take originates from plant photosynthesis.'
      }
    ],
    interactiveKnobs: [
      {
        id: 'sunlight_power',
        label: 'Sunlight Brightness',
        type: 'slider',
        min: 10,
        max: 100,
        defaultValue: 75,
        unit: '%',
        impactDescription: 'Increases photon energy striking the leaf to speed up water splitting and ATP generation.'
      },
      {
        id: 'water_flow',
        label: 'Root Soil Moisture (H₂O)',
        type: 'slider',
        min: 10,
        max: 100,
        defaultValue: 70,
        unit: '%',
        impactDescription: 'Supplies water molecules up the stem xylem to furnish hydrogen atoms for glucose.'
      },
      {
        id: 'co2_level',
        label: 'CO₂ Atmospheric Level',
        type: 'slider',
        min: 20,
        max: 100,
        defaultValue: 60,
        unit: '%',
        impactDescription: 'Supplies essential carbon atoms to the Calvin cycle assembly wheel.'
      },
      {
        id: 'stomata_open',
        label: 'Leaf Stomata Pores (Open / Closed)',
        type: 'toggle',
        defaultValue: true,
        impactDescription: 'Opens or closes leaf breathing mouths. When closed, gas exchange pauses and photosynthesis stops!'
      },
      {
        id: 'zoom_chloroplast',
        label: 'Chloroplast Lab View (Zoom In / Out)',
        type: 'toggle',
        defaultValue: true,
        impactDescription: 'Toggles between living botanical whole-plant view and microscopic 50,000x chloroplast zoom.'
      }
    ],
    comprehensionQuiz: [
      {
        question: 'What are the 3 key raw ingredients a plant needs to perform photosynthesis?',
        options: [
          'Sunlight ☀️, Water (H₂O) 💧, and Carbon Dioxide (CO₂) 💨',
          'Nitrogen gas, Soil minerals, and Helium',
          'Glucose sugar, Oxygen gas, and Vinegar',
          'Salt, Electricity, and Iron ore'
        ],
        correctIndex: 0,
        explanation: 'Plants use Sunlight for energy, Water from soil roots, and Carbon Dioxide from air through leaf stomata!'
      },
      {
        question: 'What gas do plants release into the air that humans and animals need to breathe?',
        options: ['Oxygen gas (O₂) 🫧', 'Carbon Dioxide (CO₂)', 'Argon', 'Methane'],
        correctIndex: 0,
        explanation: 'Plants split water molecules in their thylakoids and release clean Oxygen gas (O₂) as a byproduct!'
      },
      {
        question: 'What sweet food molecule is created by the plant during the Calvin cycle?',
        options: ['Glucose Sugar (C₆H₁₂O₆) 🍬', 'Table Salt (NaCl)', 'Calcium Carbonate', 'Citric Acid'],
        correctIndex: 0,
        explanation: 'Glucose is a rich carbohydrate sugar that plants use as food for energy, root growth, and fruit sweetness!'
      }
    ],
    funFact: 'More than 50% of the oxygen you are breathing right now was not made by land trees, but by microscopic single-celled ocean plants called phytoplankton photosynthesizing across the world\'s seas!',
    difficulty: 'intermediate',
    difficultyVariants: {
      beginner: {
        conceptTitle: 'How Plants Make Food & Sweet Treats ☀️🍪',
        summary: 'Plants catch sunshine with green leaves, drink water from dirt, and breathe air to bake sweet sugar! Along the way, they make clean fresh air for us to breathe.',
        realWorldAnalogy: 'Think of a leaf like a sunny kitchen bakery: Sunshine powers the mixer, water and air are the ingredients, and sweet sugar is the freshly baked cookie!',
        stages: [
          {
            id: 'photo_light',
            stageNumber: 1,
            title: 'Stage 1: Catching Sunshine ☀️🍃',
            subtitle: 'Green leaves act like solar panels catching light',
            narration: 'Look at the warm golden sunshine shining down! Green leaves have special green helpers called chlorophyll that catch sunshine like tiny solar panels.',
            visualScene: 'photosynthesis',
            actionPrompt: 'Tap the bright Sun or click the leaf to catch golden sunshine photons!',
            highlightLabels: ['Sunshine Energy ☀️', 'Green Leaf 🍃', 'Solar Power ⚡'],
            keyPrinciple: 'Plants use sunlight energy to power their food factory.'
          },
          {
            id: 'photo_inputs',
            stageNumber: 2,
            title: 'Stage 2: Drinking Water & Breathing Air 💧💨',
            subtitle: 'Roots suck water like straws and leaves breathe in air',
            narration: 'Roots act like drinking straws underground, sipping up clean water from the soil. The water travels up the stem to the leaves, while tiny mouth pores on the leaf breathe in air.',
            visualScene: 'photosynthesis',
            actionPrompt: 'Click the roots to send a splash of water surging up the plant!',
            highlightLabels: ['Root Water 💧', 'Stem Straw ⬆️', 'Leaf Air Mouth 👄'],
            keyPrinciple: 'Water from soil + Air from atmosphere = Raw ingredients!'
          },
          {
            id: 'photo_reaction',
            stageNumber: 3,
            title: 'Stage 3: Cooking Sugar Inside the Leaf ⚡🍪',
            subtitle: 'Sunlight cracks water and mixes air into sugar',
            narration: 'Inside the leaf kitchen, sunlight sparks water open! The plant keeps the energetic parts and mixes them with air to bake sweet sugar.',
            visualScene: 'photosynthesis',
            actionPrompt: 'Tap the sugar wheel to help the leaf bake sweet glucose!',
            highlightLabels: ['Water Cracker 💥', 'Sugar Mixer 🔄', 'Cooking Sugar 🍬'],
            keyPrinciple: 'Light energy transforms water and air into sweet food.'
          },
          {
            id: 'photo_outputs',
            stageNumber: 4,
            title: 'Stage 4: Sweet Sugar Food & Clean Oxygen 🍬🫧',
            subtitle: 'Sugar feeds the plant while clean oxygen floats into the sky',
            narration: 'The treats are done! Sweet sugar feeds the roots, flowers, and fruits so the plant grows big and strong. And clean oxygen bubbles out for us to breathe!',
            visualScene: 'photosynthesis',
            actionPrompt: 'Watch sweet sugar gems feed the plant and oxygen bubbles float into the sky!',
            highlightLabels: ['Sweet Sugar 🍬', 'Fresh Oxygen Bubbles 🫧', 'Growing Flowers 🌸'],
            keyPrinciple: 'Plants give us the oxygen we breathe and make their own food!'
          }
        ],
        comprehensionQuiz: [
          {
            question: 'What do plants drink from the soil using their roots?',
            options: ['Water (H₂O) 💧', 'Soda pop', 'Orange juice', 'Gasoline'],
            correctIndex: 0,
            explanation: 'Roots act like straws sipping clean water from the soil!'
          },
          {
            question: 'What sweet treat do plants make to give themselves energy?',
            options: ['Sugar (Glucose) 🍬', 'Pizza', 'Potato chips', 'Ice cream'],
            correctIndex: 0,
            explanation: 'Plants make Glucose sugar, which fuels root growth, stem strength, and flower blooms!'
          }
        ]
      },
      advanced: {
        conceptTitle: 'Biochemistry of Photosynthesis: Light Reactions & Calvin Cycle ⚡🔬',
        summary: 'Photosynthesis is an anabolic, endergonic oxidation-reduction process in autotrophs. Photons drive the light-dependent reactions in the thylakoid membrane, causing photolysis of H₂O (Photosystem II & I, generating ATP & NADPH). In the stroma, the Calvin cycle (Rubisco carbon fixation, reduction of 3-PGA to G3P, regeneration of RuBP) synthesizes glucose.',
        realWorldAnalogy: 'A dual-phase industrial energy refinery: Phase 1 is a quantum photolytic reactor converting photon flux into chemical battery carriers (ATP + NADPH); Phase 2 is an automated macromolecular assembly line synthesizing hexose carbohydrates from inorganic CO₂.',
        stages: [
          {
            id: 'photo_light',
            stageNumber: 1,
            title: 'Stage 1: Photosystems II & I Photon Absorption ☀️⚡',
            subtitle: 'P680 reaction centers excite electrons along the thylakoid membrane',
            narration: 'Photons hit light-harvesting pigment-protein complexes (chlorophyll a, b, and carotenoids). Resonance energy is shuttled to the P680 reaction center of Photosystem II, photo-oxidizing it and initiating non-cyclic photophosphorylation along the electron transport chain.',
            visualScene: 'photosynthesis',
            actionPrompt: 'Observe photon excitation of Photosystem II and electron transport across the thylakoid lipid bilayer!',
            highlightLabels: ['Photosystem II (P680) ⚡', 'Plastoquinone & Cytochrome b6f', 'Proton Motive Force (ΔpH)', 'Thylakoid Lumen'],
            keyPrinciple: 'E = hf. Photons photo-oxidize reaction center chlorophyll to generate electrochemical potential.'
          },
          {
            id: 'photo_inputs',
            stageNumber: 2,
            title: 'Stage 2: Transpiration Pull, Xylem Water & Stomatal Conductance 💧💨',
            subtitle: 'Negative pressure potential draws H₂O while guard cell turgor admits CO₂',
            narration: 'Cohesion-tension theory: Evaporative transpiration creates negative xylem water potential (tension), pulling continuous H₂O columns from root cortical cells. Concurrently, potassium ion (K⁺) influx drives osmotic swelling of stomatal guard cells, maximizing CO₂ diffusion conductance (gs).',
            visualScene: 'photosynthesis',
            actionPrompt: 'Track xylem capillary tension and guard cell microfibril radial deformation!',
            highlightLabels: ['Water Potential Gradient (Ψ)', 'Xylem Annular Vessels', 'Stomatal Conductance (gs)', 'Potassium Ion Flux (K⁺)'],
            keyPrinciple: 'Transpiration pull and stomatal conductance govern raw reactant substrate influx.'
          },
          {
            id: 'photo_reaction',
            stageNumber: 3,
            title: 'Stage 3: Photolysis, Chemiosmosis & Rubisco Carbon Fixation ⚡🔬',
            subtitle: 'Water splitting generates proton gradient; Calvin cycle fixes inorganic carbon',
            narration: 'The oxygen-evolving complex at PSII oxidizes water: 2 H₂O → 4 H⁺ + 4 e⁻ + O₂. Protons pumped across the thylakoid membrane drive CF₀CF₁ ATP synthase. In the stroma, Rubisco catalyzes carboxylation of ribulose-1,5-bisphosphate (RuBP), yielding 3-phosphoglycerate (3-PGA), which is reduced via NADPH to glyceraldehyde 3-phosphate (G3P).',
            visualScene: 'photosynthesis',
            actionPrompt: 'Examine photolytic water cleavage and the cyclic RuBP regeneration sequence!',
            highlightLabels: ['Photolysis: 2H₂O → 4H⁺ + 4e⁻ + O₂', 'CF₀CF₁ ATP Synthase', 'Rubisco Carboxylase', 'G3P Triose Phosphate'],
            keyPrinciple: 'Non-cyclic photophosphorylation couples photolysis to carbon assimilation.'
          },
          {
            id: 'photo_outputs',
            stageNumber: 4,
            title: 'Stage 4: Hexose Sugar Polymerization & Phloem Translocation 🍬🫧',
            subtitle: 'G3P condenses into glucose & sucrose; O₂ diffuses out via stomatal boundary layer',
            narration: 'Triose phosphates exported to the cytosol are synthesized into hexose glucose (C₆H₁₂O₆) and disaccharide sucrose for phloem mass flow (pressure-flow hypothesis). Diatomic oxygen (O₂) diffuses down its concentration gradient through spongy mesophyll air spaces and exits stomata into the atmosphere.',
            visualScene: 'photosynthesis',
            actionPrompt: 'Trace cytosolic sucrose condensation, sieve tube loading, and oxygen boundary layer diffusion!',
            highlightLabels: ['Hexose Glucose (C₆H₁₂O₆) 🍬', 'Phloem Sieve-Tube Loading', 'O₂ Gas Efflux 🫧', 'Pressure-Flow Translocation'],
            keyPrinciple: '6 CO₂ + 6 H₂O + Photons ➔ C₆H₁₂O₆ + 6 O₂ (ΔG° = +2870 kJ/mol)'
          }
        ],
        comprehensionQuiz: [
          {
            question: 'Which enzyme catalyzes the primary carbon fixation reaction in the Calvin cycle?',
            options: [
              'Rubisco (Ribulose-1,5-bisphosphate carboxylase-oxygenase)',
              'ATP Synthase (CF₀CF₁)',
              'DNA Polymerase III',
              'Cytochrome c Oxidase'
            ],
            correctIndex: 0,
            explanation: 'Rubisco catalyzes the covalent addition of atmospheric CO₂ to 5-carbon RuBP, producing unstable 6-carbon intermediates that split into 3-PGA!'
          },
          {
            question: 'What is the precise chemical source of electrons and protons (H⁺) used to reduce NADP⁺ during light reactions?',
            options: [
              'Photolysis of Water (H₂O) at the Oxygen-Evolving Complex',
              'Oxidation of cytosolic Glucose',
              'Atmospheric Nitrogen gas',
              'Degradation of Ribosomes'
            ],
            correctIndex: 0,
            explanation: 'The oxygen-evolving complex at Photosystem II splits water: 2 H₂O → 4 H⁺ + 4 e⁻ + O₂, liberating oxygen gas and supplying electrons to replace those excited at P680!'
          },
          {
            question: 'What triose phosphate intermediate directly exits the Calvin cycle to be converted into glucose in the cytosol?',
            options: [
              'Glyceraldehyde 3-phosphate (G3P)',
              'Pyruvate',
              'Oxaloacetate',
              'Acetyl-CoA'
            ],
            correctIndex: 0,
            explanation: 'For every 3 turns of the Calvin cycle, one net molecule of G3P (triose phosphate) exits the chloroplast stroma to form glucose and sucrose in the cytosol!'
          }
        ]
      }
    }
  },
  {
    id: 'electric_circuit',
    question: 'How does an electric circuit power a light bulb?',
    conceptTitle: 'Electric Circuits & The Flow of Electrons',
    emoji: '💡',
    category: 'Physics & Electrical Engineering',
    summary: 'Electricity is the organized flow of subatomic negative particles called electrons. A closed continuous loop—the circuit—allows the chemical potential of a battery to push electrons through wires and filaments, converting electrical energy into radiant light and warmth.',
    realWorldAnalogy: 'Think of a circuit like a closed water racetrack with a water pump (the battery). When the valve (switch) is open, water cannot circulate. When closed, water rushes through a watermill (the light bulb), making it spin brilliantly!',
    stages: [
      {
        id: 'circ_battery',
        stageNumber: 1,
        title: 'Stage 1: Chemical Pressure in the Battery 🔋',
        subtitle: 'The battery creates an electromotive force (voltage)',
        narration: 'Inside a battery, chemical reactions build up an excess of negatively charged electrons at the negative terminal (-) and a shortage at the positive terminal (+). This difference in electrical potential is called Voltage (V), measured in volts—it is the push that urges electrons to move.',
        visualScene: 'electric_circuit',
        actionPrompt: 'Notice the electric potential waiting at the terminals of the battery!',
        highlightLabels: ['Negative Terminal (-) ⚡', 'Positive Terminal (+) ➕', 'Voltage Potential (V)'],
        keyPrinciple: 'Voltage is electrical potential difference: the push that makes electrons want to flow.'
      },
      {
        id: 'circ_switch',
        stageNumber: 2,
        title: 'Stage 2: Closing the Switch (Continuous Path) 🔌',
        subtitle: 'An open circuit stops flow; closing it completes the loop',
        narration: 'When the switch is OPEN, air creates an enormous barrier of electrical resistance, so electrons cannot cross and no current flows. When you click the switch to CLOSED, a continuous metal conductor bridges the gap, allowing electrons to start marching.',
        visualScene: 'electric_circuit',
        actionPrompt: 'Click the interactive switch to complete the loop and start the current!',
        highlightLabels: ['Closed Knife Switch 🟢', 'Copper Wire Conductor 🟠', 'Current Flow (Amperes)'],
        keyPrinciple: 'Electrons only flow in a complete unbroken loop (closed circuit).'
      },
      {
        id: 'circ_flow',
        stageNumber: 3,
        title: 'Stage 3: Electron Drift & Current 🏃💨',
        subtitle: 'Billions of electrons move through the copper lattice',
        narration: 'Electrons begin moving through the copper wire. While individual electron drift speed is surprisingly slow (millimeters per second), the electric field travels almost at the speed of light, so the circuit responds instantaneously from end to end!',
        visualScene: 'electric_circuit',
        actionPrompt: 'Observe the bright yellow electrons flowing through the conductive wire!',
        highlightLabels: ['Electron Flow (e⁻) 🟡', 'Conventional Current (I) ➡️', 'Ohm\'s Law (I = V / R)'],
        keyPrinciple: 'Current (I) = Voltage (V) ÷ Resistance (R).'
      },
      {
        id: 'circ_bulb',
        stageNumber: 4,
        title: 'Stage 4: Resistance & Incandescent Light 💡✨',
        subtitle: 'Collisions in the thin filament generate glowing heat and light',
        narration: 'As electrons enter the tightly coiled, ultra-thin tungsten filament of the light bulb, they encounter high electrical resistance. The electrons constantly collide with tungsten atoms, transferring kinetic energy. The filament heats up to over 2,500°C and glows incandescently with bright radiant light!',
        visualScene: 'electric_circuit',
        actionPrompt: 'Increase the voltage slider to watch the bulb filament glow brighter with golden aura!',
        highlightLabels: ['Tungsten Filament ➰', 'Heat & Light Emission 💡', 'Bright Photon Glow ✨'],
        keyPrinciple: 'Electrical energy converts to thermal and radiant light energy via electrical resistance.'
      }
    ],
    interactiveKnobs: [
      {
        id: 'circuit_switch',
        label: 'Circuit Switch (Open / Closed)',
        type: 'toggle',
        defaultValue: true,
        impactDescription: 'Closing the switch completes the circuit loop and starts electron current.'
      },
      {
        id: 'voltage_power',
        label: 'Battery Voltage (Volts)',
        type: 'slider',
        min: 1,
        max: 24,
        defaultValue: 12,
        unit: 'V',
        impactDescription: 'Higher voltage pushes electrons faster, making the bulb glow brighter.'
      },
      {
        id: 'bulb_resistance',
        label: 'Filament Resistance (Ohms)',
        type: 'slider',
        min: 2,
        max: 20,
        defaultValue: 6,
        unit: 'Ω',
        impactDescription: 'Resistance regulates current draw according to Ohm\'s Law I = V / R.'
      }
    ],
    comprehensionQuiz: [
      {
        question: 'What happens to the current in a circuit when the switch is opened?',
        options: [
          'The current drops immediately to zero because the loop is broken',
          'The current speeds up ten times',
          'The battery explodes immediately',
          'Electrons leak out onto the floor'
        ],
        correctIndex: 0,
        explanation: 'An open switch creates an air gap with infinite resistance, breaking the conductive path and dropping current to zero.'
      },
      {
        question: 'According to Ohm\'s Law (I = V / R), if voltage increases while resistance stays constant, what happens to current?',
        options: [
          'Current increases proportionally',
          'Current decreases to zero',
          'Resistance becomes negative',
          'Current turns into magnetism'
        ],
        correctIndex: 0,
        explanation: 'Current is directly proportional to voltage: higher push (voltage) results in greater flow (current)!'
      }
    ],
    funFact: 'Although the electrical signal and lights turn on almost at the speed of light (~300,000 km/s), the actual physical electrons in a household wire drift at a leisurely speed of less than 1 millimeter per second!',
    difficulty: 'intermediate',
    difficultyVariants: {
      beginner: {
        conceptTitle: 'How Batteries Light Up a Tiny Bulb! 💡✨',
        summary: 'Electricity is like a march of friendly little helpers called electrons. When the switch bridges the road into a continuous loop, the battery pushes the helpers into the light bulb, making it glow bright and warm!',
        realWorldAnalogy: 'Think of a circular roller coaster track: when the drawbridge (switch) is closed, the little carts (electrons) can zoom in a circle and turn on the fun flashing carnival lights!',
        stages: [
          {
            id: 'circ_battery',
            stageNumber: 1,
            title: 'Stage 1: The Battery Energy Tank 🔋',
            subtitle: 'The battery stores the power waiting to push helpers',
            narration: 'Look at the battery! It is like an energy tank with a plus (+) and minus (-) side, ready to give a strong push to tiny electron helpers.',
            visualScene: 'electric_circuit',
            actionPrompt: 'Notice the battery terminals waiting to send power through the loop!',
            highlightLabels: ['Battery Tank 🔋', 'Plus Sign (+)', 'Minus Sign (-)'],
            keyPrinciple: 'Batteries store energy to push electricity.'
          },
          {
            id: 'circ_switch',
            stageNumber: 2,
            title: 'Stage 2: Closing the Drawbridge (Switch) 🔌',
            subtitle: 'When the switch closes, the road is open for business',
            narration: 'When the switch is open, there is a gap in the road so helpers cannot walk. When you click the switch closed, it completes the loop so electricity can flow!',
            visualScene: 'electric_circuit',
            actionPrompt: 'Click the switch to close the bridge and watch the current flow!',
            highlightLabels: ['Closed Switch 🟢', 'Smooth Wire Road 🟠'],
            keyPrinciple: 'Electricity only flows in a closed loop.'
          },
          {
            id: 'circ_flow',
            stageNumber: 3,
            title: 'Stage 3: Tiny Electrons Marching 🏃💨',
            subtitle: 'Golden electron helpers march along the wire',
            narration: 'Watch the little yellow electron dots march through the wire! They follow the track in a smooth, continuous circle.',
            visualScene: 'electric_circuit',
            actionPrompt: 'Follow the marching yellow electrons as they race toward the light bulb!',
            highlightLabels: ['Marching Electrons 🟡', 'Wire Pathway 🛤️'],
            keyPrinciple: 'Current is the flow of millions of tiny electrons.'
          },
          {
            id: 'circ_bulb',
            stageNumber: 4,
            title: 'Stage 4: The Bulb Glows Bright! 💡🌟',
            subtitle: 'Helpers squeeze through the tiny wire to make light',
            narration: 'The helpers squeeze into the bulb\'s tiny curly wire. Squeezing through makes friction heat up the wire until it glows brilliantly with radiant light!',
            visualScene: 'electric_circuit',
            actionPrompt: 'Move the voltage slider up to make the bulb shine even brighter!',
            highlightLabels: ['Glowing Bulb 💡', 'Bright Golden Rays ✨'],
            keyPrinciple: 'Electricity turns into warm glowing light.'
          }
        ],
        comprehensionQuiz: [
          {
            question: 'What happens to the light bulb when the switch is opened?',
            options: ['The bulb turns off because the loop is broken', 'The bulb turns purple', 'The battery turns into water', 'The wire starts dancing'],
            correctIndex: 0,
            explanation: 'When the switch is open, the path is broken and electricity cannot flow!'
          },
          {
            question: 'What tiny particles flow through the wires to create electricity?',
            options: ['Electrons ⚡', 'Sand grains', 'Raindrops', 'Feathers'],
            correctIndex: 0,
            explanation: 'Electrons are the subatomic charged particles whose flow produces electrical current!'
          }
        ]
      },
      advanced: {
        conceptTitle: 'Electrodynamics, Drift Velocity & Ohm\'s Law in DC Circuits ⚡🔬',
        summary: 'A direct current (DC) closed circuit establishes an electrostatic surface charge gradient, generating an internal electric field (E) that exerts Lorentz force F = qE on conduction band electrons within the copper Fermi sea. In the tungsten filament, electron-phonon scattering dissipates electrical power via Joule heating (P = I²R = V²/R).',
        realWorldAnalogy: 'A viscous fluid manifold driven by an electrochemical potential gradient (EMF), where boundary surface charges steer the Poynting vector S = E × B into the resistive filament.',
        stages: [
          {
            id: 'circ_battery',
            stageNumber: 1,
            title: 'Stage 1: Electrochemical EMF & Fermi Level Disparity 🔋⚡',
            subtitle: 'Redox half-reactions maintain potential difference V = -∫ E · dl',
            narration: 'Spontaneous galvanic redox reactions establish an electrochemical potential gradient across the anode and cathode. This chemical electromotive force (EMF) creates a surface charge gradient along the conductive boundary, maintaining the electrostatic potential difference (Voltage).',
            visualScene: 'electric_circuit',
            actionPrompt: 'Analyze the electrostatic potential gradient between cathode (+) and anode (-) terminals!',
            highlightLabels: ['Electrochemical EMF (ε)', 'Surface Charge Gradient (σ)', 'Fermi Energy Level (EF)', 'Potential Difference (ΔV)'],
            keyPrinciple: 'Voltage represents electrical work per unit charge: 1 Volt = 1 Joule / Coulomb.'
          },
          {
            id: 'circ_switch',
            stageNumber: 2,
            title: 'Stage 2: Circuit Closure & Poynting Vector Transmission 🔌🌊',
            subtitle: 'Relativistic field propagation establishes microscopic Ohm\'s law J = σE',
            narration: 'Upon switch contact, transient electromagnetic waves propagate along the conductor boundaries at near light-speed c, redistributing surface charges. Within picoseconds, a steady-state axial electric field E is established throughout the wire, satisfying the microscopic continuity equation ∇ · J = 0.',
            visualScene: 'electric_circuit',
            actionPrompt: 'Observe the instantaneous propagation of the electrostatic field upon switch closure!',
            highlightLabels: ['Microscopic Ohm\'s Law (J = σE)', 'Poynting Energy Flux (S = E × B)', 'Continuity Eq (∇·J = 0)'],
            keyPrinciple: 'Energy is transferred not by kinetic electron flight, but via the Poynting vector flux field.'
          },
          {
            id: 'circ_flow',
            stageNumber: 3,
            title: 'Stage 3: Drift Velocity & Drude Transport Model 🏃💨',
            subtitle: 'Mean free path relaxation time τ governs net drift velocity vd = -eEτ / m',
            narration: 'Within the copper crystal lattice, conduction electrons undergo rapid thermal motion (~10⁶ m/s) with random isotropic scattering. The applied electric field imparts a small net directional drift velocity vd = -eEτ / m (~10⁻⁴ m/s), yielding macroscopic current I = n · q · A · vd.',
            visualScene: 'electric_circuit',
            actionPrompt: 'Examine electron-ion lattice collisions and the net macroscopic drift current I = n·q·A·vd!',
            highlightLabels: ['Drude Relaxation Time (τ)', 'Drift Velocity (vd)', 'Carrier Density (n)', 'Charge Density (J)'],
            keyPrinciple: 'I = n · q · A · vd where drift velocity is proportional to the internal E field.'
          },
          {
            id: 'circ_bulb',
            stageNumber: 4,
            title: 'Stage 4: Electron-Phonon Scattering & Blackbody Incandescence 💡🔥',
            subtitle: 'Joule dissipation P = I²R = V²/R drives thermal emission via Stefan-Boltzmann law',
            narration: 'Within the constricted cross-sectional area of the tungsten filament, high electron collision density transfers momentum to lattice phonons. This non-conservative Joule dissipation heats the filament to ~2,800 K, emitting a continuous Planck blackbody spectrum (Stefan-Boltzmann radiative flux j* = σT⁴).',
            visualScene: 'electric_circuit',
            actionPrompt: 'Adjust voltage to track Joule dissipation P = V²/R and incandescent spectral emission!',
            highlightLabels: ['Electron-Phonon Coupling', 'Joule Dissipation (I²R)', 'Planck Blackbody Radiation', 'Stefan-Boltzmann Flux'],
            keyPrinciple: 'Power dissipated in a resistor: P = I · V = I²R = V² / R.'
          }
        ],
        comprehensionQuiz: [
          {
            question: 'Why does a household light bulb turn on virtually instantaneously when the switch is flipped?',
            options: [
              'The electromagnetic field and Poynting energy flux propagate at near light-speed through the space surrounding the wires',
              'Physical electrons fly at light speed from the power plant into the filament',
              'Sound waves push the electrons forward',
              'The switch sends a radio signal to warm up the filament'
            ],
            correctIndex: 0,
            explanation: 'Energy is carried by the electromagnetic field (Poynting vector S = E × B) which propagates at relativistic velocity, even though individual electron drift speed is fractions of a millimeter per second!'
          },
          {
            question: 'What microscopic parameter primarily determines the electrical resistance of a metallic conductor?',
            options: [
              'The electron-phonon scattering relaxation time and geometric cross-sectional area',
              'The color of the wire insulation',
              'Earth\'s gravitational field',
              'The barometric atmospheric pressure'
            ],
            correctIndex: 0,
            explanation: 'Resistance R = ρL/A where resistivity ρ depends on carrier density n, elementary charge e, and mean collision relaxation time τ via the Drude model ρ = m / (n e² τ)!'
          }
        ]
      }
    }
  },
  {
    id: 'math_scale',
    question: 'How do you solve an algebra equation like 2x + 6 = 14 visually?',
    conceptTitle: 'Solving Equations with a Visual Balance Scale',
    emoji: '⚖️',
    category: 'Mathematics & Algebraic Foundations',
    summary: 'An algebraic equation is fundamentally a perfectly balanced seesaw or weighing scale. The equal sign (=) means both pans weigh the exact same amount. Whatever mathematical operation you perform on one side, you must perform on the other to preserve the balance!',
    realWorldAnalogy: 'Imagine a physical scale with two mystery treasure boxes and six 1-kg gold bars on the left, perfectly balanced against fourteen 1-kg gold bars on the right. How much does each mystery box weigh?',
    stages: [
      {
        id: 'eq_initial',
        stageNumber: 1,
        title: 'Stage 1: The Balanced Equation (2x + 6 = 14) ⚖️',
        subtitle: 'Both pans balance at equilibrium with equal total weight',
        narration: 'We place two mystery boxes labeled \'x\' and 6 individual 1-unit block weights on the left pan. On the right pan, we place 14 unit weights. The scale is in perfect horizontal equilibrium because 2x + 6 is equal to 14.',
        visualScene: 'math_scale',
        actionPrompt: 'Look at the balanced scale showing 2x + 6 on the left and 14 on the right!',
        highlightLabels: ['Left Pan: 2x + 6 📦📦', 'Balance Fulcrum ⚖️', 'Right Pan: 14 Units 🧱'],
        keyPrinciple: 'An equation states that Left Side = Right Side.'
      },
      {
        id: 'eq_subtract',
        stageNumber: 2,
        title: 'Stage 2: Subtract 6 from Both Sides (-6) ➖',
        subtitle: 'Isolate the variable terms by removing the constant weights',
        narration: 'To isolate the mystery boxes, we want to get rid of the +6 weights. The Golden Rule of Algebra says: whatever we do to one side, we MUST do to the other side! We remove 6 weights from the left pan AND 6 weights from the right pan: (2x + 6) - 6 = 14 - 6. Result: 2x = 8!',
        visualScene: 'math_scale',
        actionPrompt: 'Watch the 6 weights vanish simultaneously from both pans, keeping the scale balanced!',
        highlightLabels: ['Subtract 6 from Left (-6)', 'Subtract 6 from Right (-6)', 'Remaining: 2x = 8'],
        keyPrinciple: 'Subtraction Property of Equality: If a = b, then a - c = b - c.'
      },
      {
        id: 'eq_divide',
        stageNumber: 3,
        title: 'Stage 3: Divide Both Sides by 2 (÷2) ➗',
        subtitle: 'Split both sides into two equal matching groups',
        narration: 'Now we have 2 identical mystery boxes balancing against 8 unit weights. To find what ONE single box weighs, we divide both sides by 2: (2x) ÷ 2 = 8 ÷ 2. We split the left pan into two separate boxes, and the right pan into two groups of 4 weights.',
        visualScene: 'math_scale',
        actionPrompt: 'See the 8 weights on the right pan dividing into two equal groups of 4!',
        highlightLabels: ['Divide Left by 2 (2x ÷ 2)', 'Divide Right by 2 (8 ÷ 2)', 'Each Group = 4'],
        keyPrinciple: 'Division Property of Equality: If a = b and c ≠ 0, then a / c = b / c.'
      },
      {
        id: 'eq_solution',
        stageNumber: 4,
        title: 'Stage 4: The Mystery Solved! x = 4 🎉',
        subtitle: 'Opening the box proves the exact value of the unknown',
        narration: 'One mystery box \'x\' balances perfectly against exactly 4 unit weights! x = 4. Let\'s check our work: 2(4) + 6 = 8 + 6 = 14. It checks out with 100% mathematical perfection!',
        visualScene: 'math_scale',
        actionPrompt: 'The mystery box pops open to reveal exactly 4 unit weights inside!',
        highlightLabels: ['Mystery Box x 🎁', 'Equals 4 Units 🧱🧱🧱🧱', 'Proof Verified: 2(4)+6=14 ✅'],
        keyPrinciple: 'Algebra is not memorization—it is maintaining symmetry and balance to unveil the unknown.'
      }
    ],
    interactiveKnobs: [
      {
        id: 'eq_step_slider',
        label: 'Step Progression',
        type: 'slider',
        min: 1,
        max: 4,
        defaultValue: 1,
        impactDescription: 'Slide through Step 1 (Equation), Step 2 (-6), Step 3 (÷2), to Step 4 (x = 4).'
      },
      {
        id: 'show_verification',
        label: 'Proof & Verification Check ✅',
        type: 'toggle',
        defaultValue: true,
        impactDescription: 'Displays mathematical step substitution proving 2(4) + 6 = 14.'
      }
    ],
    comprehensionQuiz: [
      {
        question: 'If you have 3x + 5 = 20, what is the best first step to solve for x?',
        options: [
          'Subtract 5 from both sides',
          'Multiply both sides by 100',
          'Divide both sides by 17',
          'Erase the x'
        ],
        correctIndex: 0,
        explanation: 'Subtracting 5 from both sides isolates the 3x term: 3x = 15, which leaves x = 5!'
      },
      {
        question: 'Why must you do the exact same operation to both sides of an equation?',
        options: [
          'To keep the mathematical balance equal on both sides',
          'Because numbers get lonely without a twin',
          'To make the problem take longer',
          'It is actually optional in algebra'
        ],
        correctIndex: 0,
        explanation: 'An equation represents balanced equality; changing only one side disrupts the equality and produces a false statement.'
      }
    ],
    funFact: 'The word "Algebra" comes from the Arabic word "Al-Jabr" (الجبر), coined by the 9th-century mathematician Al-Khwarizmi, which literally means "the reunion of broken parts" or "restoring balance"!',
    difficulty: 'intermediate',
    difficultyVariants: {
      beginner: {
        conceptTitle: 'The Playground Balance Scale: Finding the Mystery Box ⚖️🎁',
        summary: 'Math equations are just like a balanced playground seesaw! Whatever treasure blocks you take off one side, you must take off the other side to keep it from tipping over.',
        realWorldAnalogy: 'Two balanced baskets on a seesaw: if you remove 6 apples from one basket, you must remove 6 apples from the other to keep it level!',
        stages: [
          {
            id: 'eq_initial',
            stageNumber: 1,
            title: 'Stage 1: Perfect Balance (2 Boxes + 6 Blocks = 14 Blocks) ⚖️',
            subtitle: 'Both pans weigh the exact same amount',
            narration: 'Look at the scale! On the left pan, we have 2 mystery gift boxes and 6 gold blocks. On the right pan, we have 14 gold blocks. The scale is perfectly balanced in the middle.',
            visualScene: 'math_scale',
            actionPrompt: 'Look at how the scale stays balanced with mystery boxes on the left!',
            highlightLabels: ['2 Mystery Boxes (x)', '6 Gold Blocks', '14 Gold Blocks'],
            keyPrinciple: 'The equal sign means both sides weigh the same.'
          },
          {
            id: 'eq_subtract',
            stageNumber: 2,
            title: 'Stage 2: Take Away 6 Blocks from Both Sides ➖',
            subtitle: 'Take away the same number from each side to keep it fair',
            narration: 'To uncover what is inside the mystery boxes, let\'s remove the 6 extra blocks from the left pan. To keep the seesaw fair and balanced, we must also take away 6 blocks from the right pan! 14 minus 6 leaves 8 blocks.',
            visualScene: 'math_scale',
            actionPrompt: 'Watch 6 blocks vanish from both sides to keep the seesaw level!',
            highlightLabels: ['Subtract 6 Left', 'Subtract 6 Right', '8 Blocks Left on Right'],
            keyPrinciple: 'Whatever you remove from one side, remove from the other.'
          },
          {
            id: 'eq_divide',
            stageNumber: 3,
            title: 'Stage 3: Split into 2 Equal Teams (Divide by 2) ➗',
            subtitle: 'Divide the blocks evenly between the 2 mystery boxes',
            narration: 'Now we have 2 mystery boxes on the left and 8 blocks on the right. If 2 boxes weigh 8 blocks, let\'s split both sides into two equal piles!',
            visualScene: 'math_scale',
            actionPrompt: 'Divide 8 blocks by 2 boxes to find what 1 box weighs!',
            highlightLabels: ['2 Boxes 📦📦', 'Split into Halves', '8 Blocks Divided by 2'],
            keyPrinciple: 'Splitting into equal groups finds the weight of one box.'
          },
          {
            id: 'eq_solution',
            stageNumber: 4,
            title: 'Stage 4: The Mystery is Solved! x = 4 🎉',
            subtitle: 'Each mystery box contains exactly 4 gold blocks',
            narration: 'Hurray! 1 mystery box balances against exactly 4 gold blocks. So x = 4! Let\'s double-check: 2 times 4 is 8, plus 6 equals 14. Perfect!',
            visualScene: 'math_scale',
            actionPrompt: 'Celebrate the solution x = 4 with verified balance!',
            highlightLabels: ['1 Box = 4 Blocks', 'Solution: x = 4', 'Verified Truth ✓'],
            keyPrinciple: 'Equations are fun puzzles where balance reveals the answer.'
          }
        ],
        comprehensionQuiz: [
          {
            question: 'If you have a mystery box + 3 = 10, how many blocks are inside the box?',
            options: ['7 blocks (because 10 - 3 = 7)', '13 blocks', '0 blocks', '100 blocks'],
            correctIndex: 0,
            explanation: 'Subtracting 3 from both sides leaves the mystery box equal to 7 blocks!'
          },
          {
            question: 'Why must you do the same thing to both sides of a balance scale?',
            options: ['To keep the scale from tipping over', 'To make the blocks turn blue', 'Because the scale likes to sing', 'It does not matter'],
            correctIndex: 0,
            explanation: 'An equation is an equality; doing the exact same thing to both sides keeps the balance equal!'
          }
        ]
      },
      advanced: {
        conceptTitle: 'Axiomatic Equality & Linear Transformations: Solving 2x + 6 = 14 ⚖️📐',
        summary: 'Solving first-degree linear equations in one variable involves applying the field axioms of real numbers (ℝ). Subtraction of the additive group constant isolates the linear term, followed by scalar multiplication by the multiplicative inverse (1/2) to isolate the unique solution vector.',
        realWorldAnalogy: 'A dual-pan hydrostatic balance or calibrated force sensor: applying invariant inverse operators to maintain the bijection f(x) = y across the equality relation.',
        stages: [
          {
            id: 'eq_initial',
            stageNumber: 1,
            title: 'Stage 1: Formulation of the Linear System 2x + 6 = 14 ⚖️',
            subtitle: 'Affine transformation f(x) = ax + b mapped to scalar target c',
            narration: 'We begin with the linear affine relationship 2x + 6 = 14 defined over the field of real numbers ℝ. The LHS represents a scaled variable 2x translated by constant +6, balanced against the RHS constant 14.',
            visualScene: 'math_scale',
            actionPrompt: 'Observe the affine equivalence 2x + 6 = 14 across the balance fulcrum!',
            highlightLabels: ['Linear Term (2x)', 'Affine Translation (+6)', 'Scalar Target (14)', 'Equality Relation (=)'],
            keyPrinciple: 'Equality is reflexive, symmetric, and transitive across all field operations.'
          },
          {
            id: 'eq_subtract',
            stageNumber: 2,
            title: 'Stage 2: Additive Inverse Transformation (-6) ➖',
            subtitle: 'Apply the subtraction property of equality: (2x + 6) - 6 = 14 - 6',
            narration: 'By the additive inverse axiom, 6 + (-6) = 0. Adding the additive inverse (-6) to both sides preserves equality: 2x + 0 = 8. This eliminates the constant offset from the LHS.',
            visualScene: 'math_scale',
            actionPrompt: 'Track the elimination of the additive constant 6 from both sides of the relation!',
            highlightLabels: ['Additive Inverse (-6)', 'Identity Element (0)', 'Isolated Linear Term (2x = 8)'],
            keyPrinciple: 'a = b ⟹ a - c = b - c preserves relational isomorphism.'
          },
          {
            id: 'eq_divide',
            stageNumber: 3,
            title: 'Stage 3: Multiplicative Inverse Scaling (× 1/2) ➗',
            subtitle: 'Multiply both sides by 2⁻¹ to isolate identity scalar 1x',
            narration: 'To isolate x with unit coefficient, multiply both sides by the multiplicative inverse of 2 (which is 1/2): (1/2)(2x) = (1/2)(8). Since (1/2)(2) = 1, this simplifies to 1x = 4.',
            visualScene: 'math_scale',
            actionPrompt: 'Observe scalar multiplication by 1/2 to isolate the unit coefficient of x!',
            highlightLabels: ['Multiplicative Inverse (2⁻¹ = 1/2)', 'Scalar Division', 'Monomial Isolation'],
            keyPrinciple: 'a = b and c ≠ 0 ⟹ a/c = b/c.'
          },
          {
            id: 'eq_solution',
            stageNumber: 4,
            title: 'Stage 4: Solution Set Verification & Uniqueness x ∈ {4} ✓',
            subtitle: 'Direct substitution verifies 2(4) + 6 = 8 + 6 = 14 (Q.E.D.)',
            narration: 'The solution x = 4 is substituted into the original proposition: 2(4) + 6 = 8 + 6 = 14. The LHS identity strictly equals the RHS, proving x = 4 is the unique solution in the field ℝ.',
            visualScene: 'math_scale',
            actionPrompt: 'Confirm algebraic validity via rigorous substitution 2(4) + 6 = 14!',
            highlightLabels: ['Unique Solution x = 4', 'Substitution Verification', 'Identity Verified (14 = 14)'],
            keyPrinciple: 'A non-zero linear equation in one variable over a field has exactly one unique solution.'
          }
        ],
        comprehensionQuiz: [
          {
            question: 'What mathematical axiom justifies subtracting the same quantity from both sides of an equality?',
            options: [
              'The Subtraction Property of Equality (or existence of additive inverses)',
              'The pythagorean theorem',
              'The quadratic formula',
              'The prime number theorem'
            ],
            correctIndex: 0,
            explanation: 'In any algebraic group, adding the additive inverse (-c) to both sides preserves the equality relation!'
          },
          {
            question: 'For the equation ax + b = c (where a ≠ 0), what is the general explicit solution for x?',
            options: ['x = (c - b) / a', 'x = a(c + b)', 'x = c / (a + b)', 'x = a - b + c'],
            correctIndex: 0,
            explanation: 'Subtracting b gives ax = c - b; dividing by non-zero a yields x = (c - b)/a!'
          }
        ]
      }
    }
  },
  {
    id: 'heart_circulation',
    question: 'How does the human heart pump blood through the entire body?',
    conceptTitle: 'The Human Heart: The Ultimate Dual-Pumping Engine',
    emoji: '🫀',
    category: 'Human Anatomy & Medical Physiology',
    summary: 'Your heart beats over 100,000 times every day without a single break! It works as two synchronized pumps side by side: the right side sends oxygen-depleted blood to the lungs to pick up fresh oxygen, and the left side powerfully propels oxygenated blood to your brain, muscles, and organs.',
    realWorldAnalogy: 'Imagine a busy airport terminal with two shuttles: Shuttle 1 picks up passengers with empty luggage and drives them to the oxygen warehouse (lungs) to load up. Shuttle 2 picks up the fully loaded passengers and speeds them to every home in the city (your organs)!',
    stages: [
      {
        id: 'heart_deox',
        stageNumber: 1,
        title: 'Stage 1: Oxygen-Depleted Blood Enters Right Atrium 🔵',
        subtitle: 'Used blood returns from the body through the vena cava',
        narration: 'After muscles and organs use up oxygen, the deoxygenated blood (depicted in blue) travels back through the superior and inferior vena cava veins and fills the right upper chamber: the Right Atrium.',
        visualScene: 'heart_circulation',
        actionPrompt: 'Follow blue blood cells streaming through the vena cava into the right atrium!',
        highlightLabels: ['Vena Cava Veins 🔵', 'Right Atrium (RA)', 'Tricuspid Valve 🚪'],
        keyPrinciple: 'Veins carry deoxygenated blood back toward the heart at low pressure.'
      },
      {
        id: 'heart_lungs',
        stageNumber: 2,
        title: 'Stage 2: Pumping to the Lungs for Oxygen 🫁💨',
        subtitle: 'Right ventricle contracts, sending blood to alveoli air sacs',
        narration: 'The tricuspid valve opens, and blood flows into the Right Ventricle. The right ventricle contracts with force, pumping blood through the pulmonary valve into the pulmonary artery toward both lungs. In the lung alveoli, red blood cells drop off carbon dioxide (CO₂) and capture fresh oxygen (O₂), instantly turning bright crimson red!',
        visualScene: 'heart_circulation',
        actionPrompt: 'Watch blood turn from deep blue to bright red as it gathers oxygen in the lungs!',
        highlightLabels: ['Right Ventricle (RV)', 'Pulmonary Artery 🫁', 'Oxygen Exchange in Alveoli 🔴'],
        keyPrinciple: 'Pulmonary circulation is the loop between heart and lungs for gas exchange.'
      },
      {
        id: 'heart_left',
        stageNumber: 3,
        title: 'Stage 3: Oxygenated Blood Enters Left Atrium & Ventricle 🔴',
        subtitle: 'Fresh red blood returns to the heart\'s powerhouse chamber',
        narration: 'The oxygen-rich crimson blood travels through the pulmonary veins into the Left Atrium. It passes through the mitral (bicuspid) valve into the Left Ventricle—the thickest, most muscular chamber of the human heart, built to generate high arterial pressure.',
        visualScene: 'heart_circulation',
        actionPrompt: 'Observe the muscular left ventricle filling with oxygen-rich crimson blood!',
        highlightLabels: ['Pulmonary Veins 🔴', 'Left Atrium (LA)', 'Thick Muscular Left Ventricle (LV)'],
        keyPrinciple: 'The left ventricle has thick muscular walls to generate systemic arterial blood pressure.'
      },
      {
        id: 'heart_aorta',
        stageNumber: 4,
        title: 'Stage 4: Pumping to the Whole Body via the Aorta 🚀🫀',
        subtitle: 'The aortic valve opens and propels blood to the brain and body',
        narration: 'With a thunderous contraction (systole), the Left Ventricle squeezes with tremendous force! Blood surges through the aortic valve into the Aorta—the body\'s largest highway artery—speeding nourishing oxygen and glucose to your brain, heart muscles, fingers, and toes!',
        visualScene: 'heart_circulation',
        actionPrompt: 'Feel the rhythmic heartbeat propulsion through the great aortic arch!',
        highlightLabels: ['Aorta Highway 🌟', 'Systemic Circulation 🧠💪', 'Body Organs & Capillaries'],
        keyPrinciple: 'Systemic circulation delivers oxygen and nutrients to trillions of cells across the human body.'
      }
    ],
    interactiveKnobs: [
      {
        id: 'heart_rate_bpm',
        label: 'Heart Rate (Beats Per Minute)',
        type: 'slider',
        min: 50,
        max: 150,
        defaultValue: 75,
        unit: 'BPM',
        impactDescription: 'Changes the cardiac contraction pulse tempo from resting to athletic sprint.'
      },
      {
        id: 'pulse_sound',
        label: 'Heartbeat Audio Pulse 🔊',
        type: 'toggle',
        defaultValue: true,
        impactDescription: 'Plays rhythmic anatomical lub-dub cardiac pulse sound effects.'
      }
    ],
    comprehensionQuiz: [
      {
        question: 'Which heart chamber has the thickest muscle wall and pumps blood into the aorta to the entire body?',
        options: ['Left Ventricle', 'Right Atrium', 'Left Atrium', 'Superior Vena Cava'],
        correctIndex: 0,
        explanation: 'The Left Ventricle must pump blood through the entire body against high systemic vascular resistance, requiring the thickest myocardium.'
      },
      {
        question: 'Where does deoxygenated blood go immediately after leaving the right ventricle?',
        options: ['To the lungs to receive oxygen', 'Directly to the brain', 'To the stomach', 'To the kidneys'],
        correctIndex: 0,
        explanation: 'Blood from the right ventricle travels via the pulmonary artery straight to the lungs to exhale CO₂ and absorb fresh oxygen.'
      }
    ],
    funFact: 'In an average human lifetime of 75 years, the heart will beat over 2.5 BILLION times and pump enough blood to fill more than 3 supertankers!',
    difficulty: 'intermediate',
    difficultyVariants: {
      beginner: {
        conceptTitle: 'Your Amazing Beating Heart! 🫀❤️',
        summary: 'Your heart is a superhero muscle that never takes a single nap! It sends tired blue blood to your lungs to pick up fresh air, and then pumps supercharged bright red blood all the way to your brain, toes, and fingers.',
        realWorldAnalogy: 'A two-car train: Blue train cars go to the oxygen station in your chest to load up fresh air, and red train cars zoom around the body to deliver air to all your running muscles!',
        stages: [
          {
            id: 'heart_deox',
            stageNumber: 1,
            title: 'Stage 1: Tired Blue Blood Returns Home 🔵',
            subtitle: 'Blood returns to the heart to get re-energized',
            narration: 'After you run and play, your blood is tired and needs fresh oxygen. It travels in blue veins right into the top right room of your heart!',
            visualScene: 'heart_circulation',
            actionPrompt: 'Look at the blue blood filling the heart ready for fresh air!',
            highlightLabels: ['Tired Blue Blood 🔵', 'Right Heart Room', 'Heart Door Valve 🚪'],
            keyPrinciple: 'Veins bring tired blood back to the heart.'
          },
          {
            id: 'heart_lungs',
            stageNumber: 2,
            title: 'Stage 2: Whoosh to the Lungs for Oxygen! 🫁💨',
            subtitle: 'The heart pushes blood to the lungs to breathe',
            narration: 'Squeeze! The heart pushes blood into the lungs. In the lungs, taking a deep breath turns the blood from dark blue to glowing ruby red with fresh oxygen!',
            visualScene: 'heart_circulation',
            actionPrompt: 'Watch the blood turn from dark blue to glowing red as you breathe!',
            highlightLabels: ['Lungs Air Sacs 🫁', 'Fresh Red Oxygen 🔴', 'Breathing Power'],
            keyPrinciple: 'Lungs give oxygen to the blood.'
          },
          {
            id: 'heart_left',
            stageNumber: 3,
            title: 'Stage 3: Supercharged Red Blood Returns 🔴',
            subtitle: 'Fresh red blood fills the heart\'s strongest muscle room',
            narration: 'The fresh crimson blood rushes into the left room of your heart. This is the strongest muscle in your whole chest, ready to give a giant pump!',
            visualScene: 'heart_circulation',
            actionPrompt: 'Notice the strong muscular left room filling with ruby red blood!',
            highlightLabels: ['Fresh Red Blood 🔴', 'Strongest Heart Muscle', 'Ready to Pump ⚡'],
            keyPrinciple: 'The left side of the heart is built super strong.'
          },
          {
            id: 'heart_aorta',
            stageNumber: 4,
            title: 'Stage 4: Zoom to Your Brain, Muscles & Toes! 🚀🌟',
            subtitle: 'Lub-dub! Blood speeds to every corner of your body',
            narration: 'Lub-dub! The heart gives a giant squeeze, launching red blood into the big aorta pipe to power your thinking brain, running legs, and waving hands!',
            visualScene: 'heart_circulation',
            actionPrompt: 'Follow the red blood speeding to your brain and fingertips!',
            highlightLabels: ['Aorta Highway 🌟', 'Thinking Brain 🧠', 'Running Legs 🏃'],
            keyPrinciple: 'The heart pumps life-giving oxygen to every part of your body.'
          }
        ],
        comprehensionQuiz: [
          {
            question: 'What color does blood turn when it picks up fresh oxygen in the lungs?',
            options: ['Bright crimson red 🔴', 'Neon green', 'Bright yellow', 'Purple polka dots'],
            correctIndex: 0,
            explanation: 'Oxygen binds to iron in red blood cells, turning it bright crimson red!'
          },
          {
            question: 'Where does the heart pump blood to pick up fresh oxygen?',
            options: ['To the lungs 🫁', 'To the shoes', 'To the hair', 'To the ears'],
            correctIndex: 0,
            explanation: 'The heart pumps blood through the pulmonary arteries to the lungs!'
          }
        ]
      },
      advanced: {
        conceptTitle: 'Cardiac Hemodynamics & Wiggers Cycle: Systemic vs Pulmonary Circuits 🫀🔬',
        summary: 'The mammalian cardiovascular system operates as a closed dual loop governed by Frank-Starling cardiac output laws, atrioventricular pressure gradients, and baroreceptor autoregulation. Stroke volume and myocardial contractility drive systemic arterial perfusion (MAP).',
        realWorldAnalogy: 'A dual-displacement synchronized reciprocating hydrostatic pump operating against asymmetric pulmonary (low compliance) and systemic (high resistance) hydraulic impedances.',
        stages: [
          {
            id: 'heart_deox',
            stageNumber: 1,
            title: 'Stage 1: Systemic Venous Return & Right Atrial Diastole 🔵',
            subtitle: 'Central venous pressure fills right atrium via superior and inferior venae cavae',
            narration: 'Deoxygenated blood returns via systemic capacitance veins under low venous pressure (~2-6 mmHg). During ventricular diastole, venous return passive filling and atrial kick (P wave) expand the right atrium, traversing the tricuspid valve into the right ventricle.',
            visualScene: 'heart_circulation',
            actionPrompt: 'Observe central venous return through cava vessels into the compliant right atrium!',
            highlightLabels: ['Central Venous Pressure (CVP)', 'Tricuspid Valve Diastole', 'Atrial Depolarization (P-wave)'],
            keyPrinciple: 'Preload (End-Diastolic Volume) governs myocardial stroke volume via Frank-Starling law.'
          },
          {
            id: 'heart_lungs',
            stageNumber: 2,
            title: 'Stage 2: Right Ventricular Systole & Pulmonary Microcirculation 🫁💨',
            subtitle: 'Isovolumetric contraction opens pulmonary semilunar valve into low-resistance pulmonary bed',
            narration: 'Right ventricular pressure exceeds pulmonary arterial pressure (~15-25 mmHg), opening the pulmonary valve. Red blood cells navigate pulmonary capillary beds across the 0.5 µm blood-gas barrier, releasing CO₂ and achieving 98% hemoglobin SaO₂ cooperativity.',
            visualScene: 'heart_circulation',
            actionPrompt: 'Track hemoglobin oxygen saturation cooperativity across the alveolar capillary barrier!',
            highlightLabels: ['Pulmonary Artery Pressure (PAP)', 'Alveolar Gas Diffusion (DLCO)', 'Hemoglobin-O₂ Affinity'],
            keyPrinciple: 'Fick\'s law of diffusion governs gas exchange across the alveolar-capillary membrane.'
          },
          {
            id: 'heart_left',
            stageNumber: 3,
            title: 'Stage 3: Pulmonary Venous Return & Left Ventricular Compliance 🔴',
            subtitle: 'Oxygenated blood fills left atrium and high-pressure left ventricular myocardium',
            narration: 'Four pulmonary veins deliver oxygenated blood to the left atrium. Flow crosses the bicuspid mitral valve into the left ventricle. Thick concentric myocardial geometry generates ventricular compliance capable of sustaining systemic arterial pressures.',
            visualScene: 'heart_circulation',
            actionPrompt: 'Analyze left ventricular compliance and end-diastolic pressure-volume relations (EDPVR)!',
            highlightLabels: ['Mitral Valve Flow (E/A ratio)', 'Left Ventricular Hypertrophy', 'End-Diastolic Volume (LVEDV)'],
            keyPrinciple: 'Left ventricular wall thickness compensates for higher systemic vascular resistance (SVR).'
          },
          {
            id: 'heart_aorta',
            stageNumber: 4,
            title: 'Stage 4: Left Ventricular Ejection & Systemic Hemodynamics 🚀🫀',
            subtitle: 'Peak systolic pressure (~120 mmHg) propels cardiac output (CO = HR × SV) via aortic arch',
            narration: 'During isovolumetric contraction, LV pressure eclipses aortic diastolic pressure (~80 mmHg). The aortic semilunar valve snaps open, ejecting stroke volume (~70 mL) into the elastic aorta (Windkessel effect), sustaining mean arterial pressure (MAP = CO × SVR).',
            visualScene: 'heart_circulation',
            actionPrompt: 'Examine aortic Windkessel damping and cardiac output ejection dynamics!',
            highlightLabels: ['Aortic Valve Systole', 'Stroke Volume (SV = EDV - ESV)', 'Windkessel Compliance', 'MAP Autoregulation'],
            keyPrinciple: 'Cardiac Output (Q) = Stroke Volume (SV) × Heart Rate (HR).'
          }
        ],
        comprehensionQuiz: [
          {
            question: 'What physiological law explains why an increase in end-diastolic volume (preload) leads to increased stroke volume?',
            options: [
              'Frank-Starling Law of the Heart',
              'Bernoulli\'s principle',
              'Hooke\'s elasticity law',
              'Newton\'s third law'
            ],
            correctIndex: 0,
            explanation: 'The Frank-Starling mechanism dictates that increased sarcomere stretch (preload) optimizes actin-myosin overlap, producing greater myocardial contractile force!'
          },
          {
            question: 'Which vascular feature of the aorta dampens the pulsatile blood pressure into smooth continuous systemic flow?',
            options: [
              'The elastic Windkessel effect of the arterial wall',
              'Venous valves in the legs',
              'Capillary fenestrations',
              'Lymphatic nodes'
            ],
            correctIndex: 0,
            explanation: 'The elastic compliance of the aorta stores potential energy during systole and recoils during diastole, maintaining continuous forward flow!'
          }
        ]
      }
    }
  },
  {
    id: 'states_of_matter',
    question: 'How do atoms move during phase changes between solid, liquid, and gas?',
    conceptTitle: 'States of Matter & Kinetic Molecular Theory',
    emoji: '🧊',
    category: 'Chemistry & Molecular Physics',
    summary: 'Everything around you is made of billions of tiny atoms and molecules in constant motion. Temperature is simply the average kinetic speed of these molecules. Heating transforms a rigid solid ice crystal into flowing liquid water, and finally into free-flying water vapor gas!',
    realWorldAnalogy: 'Imagine people on a dance floor: when it\'s freezing, everyone huddles shoulder-to-shoulder shivering in place (Solid). At room temperature, people hold hands and weave past each other smoothly (Liquid). In an energetic rave, everyone dashes and bounces across the room (Gas)!',
    stages: [
      {
        id: 'matter_solid',
        stageNumber: 1,
        title: 'Stage 1: Solid State (Ice at -20°C) 🧊',
        subtitle: 'Atoms locked in a rigid crystalline lattice vibrating gently',
        narration: 'In a solid, intermolecular bonds hold molecules tightly in fixed positions. The molecules cannot slide or travel freely, but they vibrate back and forth around fixed equilibrium points. A solid maintains a definite shape and a definite volume.',
        visualScene: 'states_of_matter',
        actionPrompt: 'Observe the crystalline lattice with tightly packed molecules vibrating in place!',
        highlightLabels: ['Strong Intermolecular Bonds 🔗', 'Fixed Hexagonal Lattice ❄️', 'Low Kinetic Energy'],
        keyPrinciple: 'Solids have definite shape and definite volume with strong intermolecular attraction.'
      },
      {
        id: 'matter_melting',
        stageNumber: 2,
        title: 'Stage 2: Melting into Liquid (Water at 25°C) 💧',
        subtitle: 'Heat breaks rigid bonds, allowing molecules to tumble and flow',
        narration: 'As we add thermal energy, the molecules vibrate faster and more vigorously until they overcome the rigid crystal bonds at the melting point (0°C). In liquid water, molecules stay close together due to cohesive forces, but they can freely slip, slide, and flow over one another, taking the shape of their container.',
        visualScene: 'states_of_matter',
        actionPrompt: 'Increase temperature to watch the ice melt into rolling, flowing blue liquid droplets!',
        highlightLabels: ['Melting Transition 🌡️', 'Flexible Cohesion 🌊', 'Fluid Flow'],
        keyPrinciple: 'Liquids have definite volume but indefinite shape, conforming to the container.'
      },
      {
        id: 'matter_gas',
        stageNumber: 3,
        title: 'Stage 3: Boiling into Gas (Steam at 100°C) 💨',
        subtitle: 'Molecules break completely free and zoom with high speed',
        narration: 'At the boiling point (100°C), kinetic energy completely overwhelms intermolecular attraction! Water molecules break completely free into water vapor gas, flying at hundreds of meters per second in straight lines, colliding with each other and the walls of the container with high pressure.',
        visualScene: 'states_of_matter',
        actionPrompt: 'Crank up the temperature slider to 100°C+ and watch molecules bouncing off walls at high speed!',
        highlightLabels: ['Vaporization Point ♨️', 'High Kinetic Speed ⚡', 'Gas Pressure Collisions 💥'],
        keyPrinciple: 'Gases have indefinite shape and indefinite volume, rapidly expanding to fill any space.'
      }
    ],
    interactiveKnobs: [
      {
        id: 'temperature_celsius',
        label: 'Temperature (°Celsius)',
        type: 'slider',
        min: -30,
        max: 150,
        defaultValue: 25,
        unit: '°C',
        impactDescription: 'Directly changes molecular kinetic energy from frozen solid (<0°C) to liquid to vapor gas (>100°C).'
      },
      {
        id: 'container_pressure',
        label: 'Container Pressure Gauge',
        type: 'slider',
        min: 1,
        max: 10,
        defaultValue: 2,
        unit: 'atm',
        impactDescription: 'Demonstrates Gay-Lussac and Boyle laws as temperature and volume alter pressure.'
      }
    ],
    comprehensionQuiz: [
      {
        question: 'What fundamentally happens to molecules when you heat a substance?',
        options: [
          'Their average kinetic speed and vibration increases',
          'They grow bigger in physical size like balloons',
          'They turn into gold atoms',
          'They stop moving completely'
        ],
        correctIndex: 0,
        explanation: 'Temperature is a direct measure of the average kinetic energy of the molecules; adding heat makes them move and collide faster!'
      },
      {
        question: 'Which state of matter has neither a definite shape nor a definite volume?',
        options: ['Gas', 'Solid', 'Liquid', 'Crystal'],
        correctIndex: 0,
        explanation: 'Gases expand indefinitely to fill whatever container or space they occupy!'
      }
    ],
    funFact: 'Water is one of the only substances on Earth where the solid phase (ice) is actually LESS dense than the liquid phase! That is why icebergs float on oceans, saving sea creatures from freezing in the winter!',
    difficulty: 'intermediate',
    difficultyVariants: {
      beginner: {
        conceptTitle: 'Ice, Water, and Steam: The 3 Shapes of Matter! 🧊💧💨',
        summary: 'Everything around you is made of tiny dancing ball atoms! When it is super cold, they hug together tightly in an ice block. When warmed up, they slide around like water. When boiling hot, they zoom into the air like invisible steam!',
        realWorldAnalogy: 'Dancing friends on a playground: When freezing cold, everyone stands shoulder-to-shoulder shivering in place (Solid). At room temperature, everyone holds hands and slips smoothly across the floor (Liquid). At a wild dance party, everyone jumps and bounces all over the room (Gas)!',
        stages: [
          {
            id: 'matter_solid',
            stageNumber: 1,
            title: 'Stage 1: Frozen Ice Cubes (Solid) 🧊',
            subtitle: 'Tiny atoms hug tightly together and shiver in place',
            narration: 'Look at the ice cube! Inside, tiny water atoms are locked tightly together like bricks in a castle wall. They can only shiver and wiggle in place, keeping a solid block shape.',
            visualScene: 'states_of_matter',
            actionPrompt: 'Notice the tight neat rows of wiggling atoms in the solid ice cube!',
            highlightLabels: ['Solid Ice Cube 🧊', 'Locked Atoms', 'Wiggling in Place'],
            keyPrinciple: 'Solids hold their own definite shape.'
          },
          {
            id: 'matter_melting',
            stageNumber: 2,
            title: 'Stage 2: Melting into Flowing Water (Liquid) 💧',
            subtitle: 'Warmth lets the atoms slip, slide, and splash around',
            narration: 'Turn up the heat! The warm temperature gives atoms more energy to break out of their neat rows. Now they can slip and slide past each other, flowing into whatever cup or bowl you pour them in!',
            visualScene: 'states_of_matter',
            actionPrompt: 'Slide the temperature slider up to watch the ice melt into splashy water!',
            highlightLabels: ['Flowing Water 💧', 'Slipping Atoms', 'Liquid Puddle'],
            keyPrinciple: 'Liquids flow and take the shape of their container.'
          },
          {
            id: 'matter_gas',
            stageNumber: 3,
            title: 'Stage 3: Boiling into Floating Steam (Gas) 💨',
            subtitle: 'Super hot atoms zoom freely into the air',
            narration: 'Turn the heat up to boiling! The atoms get supercharged with zoomy energy! They break completely free, dashing and flying through the air like invisible floating steam bubbles.',
            visualScene: 'states_of_matter',
            actionPrompt: 'Crank the temperature to 100°C to see atoms zoom freely into the air!',
            highlightLabels: ['Floating Steam 💨', 'Fast Zooming Atoms', 'Flying Free'],
            keyPrinciple: 'Gases spread out to fill the whole room.'
          }
        ],
        comprehensionQuiz: [
          {
            question: 'What happens to water atoms when you heat them up?',
            options: ['They move and bounce faster and faster', 'They go to sleep', 'They turn into square blocks', 'They stop moving completely'],
            correctIndex: 0,
            explanation: 'Heat gives molecules kinetic energy, making them move and bounce faster!'
          },
          {
            question: 'Which shape of matter flows and takes the shape of the cup you pour it in?',
            options: ['Liquid (like water) 💧', 'Solid (like a rock)', 'Wood block', 'Diamond'],
            correctIndex: 0,
            explanation: 'Liquids have a definite volume but no fixed shape, taking the shape of their container!'
          }
        ]
      },
      advanced: {
        conceptTitle: 'Thermodynamics of Phase Equilibria: Clausius-Clapeyron & Maxwell-Boltzmann 🧊⚛️',
        summary: 'Phase transitions represent first-order thermodynamic transformations governed by Gibbs free energy minimization (dG = -SdT + VdP). Latent heat of fusion (ΔHfus) and vaporization (ΔHvap) dictate transitions between crystalline lattices, van der Waals liquids, and ideal gas distributions.',
        realWorldAnalogy: 'A statistical potential well manifold where thermal energy kBT competes against Lennard-Jones intermolecular pair potentials.',
        stages: [
          {
            id: 'matter_solid',
            stageNumber: 1,
            title: 'Stage 1: Low-Entropy Crystalline Phonon Modes (Solid Ice) 🧊',
            subtitle: 'Hydrogen bond networks minimize enthalpy in hexagonal Ih lattice (kBT << intermolecular binding potential)',
            narration: 'Below 273.15 K, intermolecular hydrogen bonding (~20 kJ/mol) traps H₂O in an open hexagonal Ih lattice with coordination number 4. Thermal energy is quantized into acoustic and optical lattice phonon vibrational modes, obeying the Debye T³ heat capacity model at cryogenic limits.',
            visualScene: 'states_of_matter',
            actionPrompt: 'Observe the hexagonal coordination lattice and low-amplitude phonon vibrational modes!',
            highlightLabels: ['Hexagonal Ih Lattice', 'Lattice Phonon Vibrations', 'Enthalpic Potential Well (ΔH)', 'Low Thermodynamic Entropy (S)'],
            keyPrinciple: 'In solids, intermolecular binding potential energy significantly exceeds thermal kinetic energy (U >> kBT).'
          },
          {
            id: 'matter_melting',
            stageNumber: 2,
            title: 'Stage 2: First-Order Latent Fusion & Short-Range Order (Liquid) 💧',
            subtitle: 'Latent heat ΔHfus = 334 J/g disrupts ~15% of H-bonds, collapsing interstitial density anomaly',
            narration: 'At Tfus = 0°C (273.15 K at 1 atm), enthalpy of fusion ΔHfus breaks tetrahedral rigidity without raising temperature (dQ = T·dS). The collapsed cage structure yields water\'s density maximum at 3.98°C. Molecules retain short-range radial distribution order but acquire translational diffusion degrees of freedom (Stokes-Einstein relation D = kBT / 6πηr).',
            visualScene: 'states_of_matter',
            actionPrompt: 'Adjust temperature across the 0°C isothermal latent heat barrier to observe fluid shear!',
            highlightLabels: ['Latent Heat of Fusion (ΔHfus)', 'Stokes-Einstein Diffusion (D)', 'Short-Range Coordination', 'Viscous Fluidity'],
            keyPrinciple: 'Melting is an isothermal first-order phase transition characterized by a discontinuity in entropy S and enthalpy H.'
          },
          {
            id: 'matter_gas',
            stageNumber: 3,
            title: 'Stage 3: Kinetic Vaporization & Maxwell-Boltzmann Momentum Flux (Gas) 💨',
            subtitle: 'Latent heat ΔHvap = 2260 J/g breaks residual bonds into ideal gas kinetic manifold',
            narration: 'At Tvaporization (100°C), molecular kinetic energy completely overcomes van der Waals cohesive dispersion. Molecules enter the gaseous state governed by the ideal gas law PV = nRT and Maxwell-Boltzmann speed distribution f(v) = 4π (m/2πkBT)^(3/2) v² exp(-mv²/2kBT). High mean free path (λ >> molecular diameter) yields isotropic wall collision pressure P = 1/3 ρ <v²>.',
            visualScene: 'states_of_matter',
            actionPrompt: 'Inspect the Maxwell-Boltzmann molecular velocity distribution and wall collision impulse pressure!',
            highlightLabels: ['Maxwell-Boltzmann Speed Dist', 'Mean Free Path (λ)', 'Kinetic Momentum Transfer (P = F/A)', 'Vapor Enthalpy (ΔHvap)'],
            keyPrinciple: 'Pressure exerted by a gas is the cumulative momentum flux of elastic molecular collisions per unit surface area.'
          }
        ],
        comprehensionQuiz: [
          {
            question: 'Why does temperature remain constant during a first-order phase transition even as heat continues to be added?',
            options: [
              'All absorbed thermal energy (latent heat) is consumed breaking intermolecular bonds and increasing configurational entropy',
              'The thermometer freezes during the transition',
              'Heat radiates away instantaneously into dark matter',
              'Molecules decrease their kinetic energy to zero'
            ],
            correctIndex: 0,
            explanation: 'During a first-order phase change, added energy (latent heat ΔH) does work against intermolecular potentials to increase entropy ΔS = ΔH/T, without altering average kinetic velocity!'
          },
          {
            question: 'Which equation relates the temperature dependence of vapor pressure to the latent heat of vaporization?',
            options: [
              'The Clausius-Clapeyron equation: d(ln P)/dT = ΔHvap / (R T²)',
              'Newton\'s law of cooling',
              'Schrodinger equation',
              'Coulomb\'s inverse-square law'
            ],
            correctIndex: 0,
            explanation: 'The Clausius-Clapeyron equation relates the slope of the coexistence curve in a P-T phase diagram to the enthalpy of vaporization ΔHvap!'
          }
        ]
      }
    }
  }
];
