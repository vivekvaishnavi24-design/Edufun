import { ImagineCreativitySimulation, SimulationDifficulty, VisualSceneType } from '../types';
import { IMAGINE_CREATIVITY_PRESETS } from '../data/imagineCreativityPresets';

/**
 * Intelligent client-side pedagogical simulation generator
 * Generates rich, realistic, interactive 4-stage simulations customized
 * according to any asked question and selected educational difficulty!
 */
export function generateTailoredOfflineSimulation(
  question: string,
  difficulty: SimulationDifficulty = 'intermediate'
): ImagineCreativitySimulation {
  const q = question.trim().toLowerCase();

  const adaptPreset = (presetId: string): ImagineCreativitySimulation | null => {
    const preset = IMAGINE_CREATIVITY_PRESETS.find((p) => p.id === presetId);
    if (!preset) return null;
    if (difficulty !== 'intermediate' && preset.difficultyVariants?.[difficulty]) {
      const variant = preset.difficultyVariants[difficulty]!;
      return {
        ...preset,
        ...variant,
        question: question.trim(),
        difficulty,
        stages: variant.stages || preset.stages,
        comprehensionQuiz: variant.comprehensionQuiz || preset.comprehensionQuiz
      };
    }
    return {
      ...preset,
      question: question.trim(),
      difficulty: 'intermediate'
    };
  };

  // 0. Match rich core science presets
  if (
    q.includes('photosynthesis') ||
    q.includes('chloroplast') ||
    q.includes('chlorophyll') ||
    q.includes('calvin cycle') ||
    (q.includes('plant') && (q.includes('sun') || q.includes('energy') || q.includes('leaf') || q.includes('food')))
  ) {
    const sim = adaptPreset('photosynthesis');
    if (sim) return sim;
  }

  if (
    q.includes('water cycle') ||
    q.includes('evaporat') ||
    q.includes('precipitat') ||
    (q.includes('rain') && !q.includes('rainbow')) ||
    q.includes('cloud formation') ||
    q.includes('transpiration')
  ) {
    const sim = adaptPreset('weather_water_cycle');
    if (sim) return sim;
  }

  if (
    q.includes('circuit') ||
    q.includes('light bulb') ||
    q.includes('battery') ||
    (q.includes('current') && q.includes('flow')) ||
    q.includes('voltage') ||
    q.includes('tungsten') ||
    q.includes('resistor')
  ) {
    const sim = adaptPreset('electric_circuit');
    if (sim) return sim;
  }

  if (
    q.includes('heart') ||
    q.includes('blood') ||
    q.includes('circulation') ||
    q.includes('cardio') ||
    q.includes('ventricle') ||
    q.includes('artery') ||
    q.includes('vein')
  ) {
    const sim = adaptPreset('heart_circulation');
    if (sim) return sim;
  }

  if (
    q.includes('state of matter') ||
    q.includes('ice melt') ||
    q.includes('boiling water') ||
    (q.includes('solid') && q.includes('liquid')) ||
    q.includes('phase transition') ||
    q.includes('steam')
  ) {
    const sim = adaptPreset('states_of_matter');
    if (sim) return sim;
  }

  if (
    q.includes('algebra') ||
    q.includes('equation') ||
    q.includes('math scale') ||
    (q.includes('balance') && q.includes('scale')) ||
    q.includes('solve for x')
  ) {
    const sim = adaptPreset('math_scale');
    if (sim) return sim;
  }

  // 1. Aerodynamics & Flight
  if (
    q.includes('fly') ||
    q.includes('flight') ||
    q.includes('wing') ||
    q.includes('airplane') ||
    q.includes('plane') ||
    q.includes('lift') ||
    q.includes('aerodynamic') ||
    q.includes('bernoulli') ||
    q.includes('drone')
  ) {
    return {
      id: `aero_${Date.now()}`,
      question: question.trim(),
      conceptTitle: 'Aerodynamic Lift & Fluid Dynamics ✈️',
      emoji: '✈️',
      category: 'Physics & Fluid Dynamics',
      difficulty,
      summary:
        difficulty === 'beginner'
          ? 'Airplane wings are specially shaped curved airfoils. Air rushes faster over the curved top, creating low pressure that sucks the wing upwards into the sky!'
          : difficulty === 'advanced'
          ? 'Lift is generated through the Bernoulli principle and circulation theorems (Kutta-Joukowski). Asymmetric air velocity distributions create upper surface suction and downward flow deflection.'
          : 'Air flowing across a cambered airfoil splits at the leading edge. The air moves faster over the curved upper surface, creating a zone of lower pressure according to Bernoulli’s law.',
      realWorldAnalogy:
        'Stick your hand out of a moving car window and tilt it slightly upward—you immediately feel invisible air push your palm straight up!',
      stages: [
        {
          id: 'aero_1',
          stageNumber: 1,
          title: 'Stage 1: Stagnation Point & Streamline Division 🌬️',
          subtitle: 'Incoming laminar airflow splits at the wing leading edge',
          narration:
            'As an aircraft pushes forward through the air, undisturbed streamlines strike the rounded leading edge of the wing. At the stagnation point, air splits cleanly into upper and lower streams.',
          visualScene: 'aerodynamics_flight',
          actionPrompt: 'Adjust the Angle of Attack buttons to see where the air strikes the front of the wing!',
          highlightLabels: ['Leading Edge Airfoil', 'Stagnation Point', 'Laminar Streamlines'],
          keyPrinciple: 'Fluid dynamics: Mass conservation across dividing streamlines'
        },
        {
          id: 'aero_2',
          stageNumber: 2,
          title: 'Stage 2: Upper Airflow Acceleration & Low Pressure ⚡',
          subtitle: 'Air accelerates over the curved camber, dropping pressure',
          narration:
            'Because the upper surface of the wing is cambered (curved), air molecules must accelerate over the hump. According to Bernoulli’s principle, higher velocity means reduced static pressure.',
          visualScene: 'aerodynamics_flight',
          actionPrompt: 'Observe the golden low-pressure suction field glowing over the top of the airfoil!',
          highlightLabels: ['Camber Curvature', 'High Air Velocity', 'Bernoulli Suction Field'],
          keyPrinciple: 'Bernoulli Equation: P₁ + ½ρv₁² = P₂ + ½ρv₂²'
        },
        {
          id: 'aero_3',
          stageNumber: 3,
          title: 'Stage 3: Downwash & Newton’s Third Law Deflection ⬇️',
          subtitle: 'The wing forces air downward, generating upward lift',
          narration:
            'Air leaves the sharp trailing edge angled downwards—a phenomenon called downwash. Newton’s third law dictates that forcing air downwards creates an equal and opposite upward reaction force: Lift!',
          visualScene: 'aerodynamics_flight',
          actionPrompt: 'Notice the trailing edge vortex and the green upward lift force arrow growing larger!',
          highlightLabels: ['Trailing Edge Downwash', 'Trailing Vortex', 'Upward Lift Vector'],
          keyPrinciple: 'Newton’s 3rd Law: Action (Downwash) = Reaction (Upward Lift)'
        },
        {
          id: 'aero_4',
          stageNumber: 4,
          title: 'Stage 4: Angle of Attack & Aerodynamic Stall ⚠️',
          subtitle: 'Tilting the wing too high separates airflow into turbulence',
          narration:
            'Increasing the angle of attack boosts lift up to a critical angle (approx 16°). Past this limit, smooth laminar airflow can no longer cling to the upper wing, causing boundary layer separation and stall.',
          visualScene: 'aerodynamics_flight',
          actionPrompt: 'Click "+20°" to trigger an aerodynamic stall warning and watch turbulent eddy vortices appear!',
          highlightLabels: ['Boundary Layer Separation', 'Turbulent Eddies', 'Stall Warning Sensor'],
          keyPrinciple: 'Critical Angle of Attack (α_crit) limits maximum coefficient of lift (C_L_max)'
        }
      ],
      interactiveKnobs: [
        {
          id: 'angle_of_attack',
          label: 'Angle of Attack (α)',
          type: 'slider',
          min: -5,
          max: 25,
          defaultValue: 8,
          unit: '°',
          impactDescription: 'Tilts the airfoil. Higher angles increase lift until stalling above 16°.'
        },
        {
          id: 'airspeed',
          label: 'Airspeed Velocity',
          type: 'slider',
          min: 100,
          max: 800,
          defaultValue: 420,
          unit: 'km/h',
          impactDescription: 'Increases dynamic pressure and doubles lift quadratically (v²).'
        }
      ],
      comprehensionQuiz: [
        {
          question: 'According to Bernoulli’s principle, what happens to air pressure when air moves faster over a curved wing?',
          options: ['Pressure increases significantly', 'Pressure drops, creating suction', 'Pressure turns into solid ice', 'Pressure vanishes into a vacuum'],
          correctIndex: 1,
          explanation: 'Bernoulli’s law states that an increase in fluid velocity occurs simultaneously with a decrease in static fluid pressure.'
        },
        {
          question: 'What occurs during an aerodynamic stall?',
          options: ['The airplane runs out of fuel', 'The wing snaps in half', 'Smooth airflow separates from the upper wing into turbulence', 'Gravity turns off completely'],
          correctIndex: 2,
          explanation: 'When the angle of attack exceeds the critical limit, air can no longer follow the wing contour, causing flow separation and sudden loss of lift.'
        }
      ],
      funFact: 'Commercial airliners produce so much lift that a fully loaded Boeing 747 weighing nearly 1,000,000 pounds can easily float through thin air at 35,000 feet!'
    };
  }

  // 2. Gravity, Orbits, Celestial Motion, Black Holes
  if (
    q.includes('gravity') ||
    q.includes('orbit') ||
    q.includes('planet') ||
    q.includes('space') ||
    q.includes('black hole') ||
    q.includes('moon') ||
    q.includes('tide') ||
    q.includes('celestial') ||
    q.includes('newton') ||
    q.includes('satellite')
  ) {
    return {
      id: `grav_${Date.now()}`,
      question: question.trim(),
      conceptTitle: 'Gravitational Fields & Planetary Orbits 🌌',
      emoji: '🌌',
      category: 'Astrophysics & Classical Mechanics',
      difficulty,
      summary:
        difficulty === 'beginner'
          ? 'Gravity is an invisible pulling force created by heavy objects like stars and planets. A planet in orbit is constantly falling towards the Sun, but moving forward so fast that it keeps missing!'
          : difficulty === 'advanced'
          ? 'In General Relativity, mass-energy curves the 4D spacetime fabric. Objects follow natural geodesics. Stable Keplerian orbits balance inward gravitational acceleration with required centripetal acceleration.'
          : 'Newton discovered that every mass attracts every other mass with a force proportional to their masses and inversely proportional to the square of the distance between them.',
      realWorldAnalogy:
        'Imagine rolling a marble around the rim of a curved funnel—its forward momentum keeps it spinning along the sides instead of plummeting straight down!',
      stages: [
        {
          id: 'grav_1',
          stageNumber: 1,
          title: 'Stage 1: Spacetime Curvature & Mass Attraction 🕳️',
          subtitle: 'Massive bodies create gravitational wells in the fabric of space',
          narration:
            'A massive object like our Sun exerts a gravitational pull on all surrounding matter. In modern physics, this mass actually bends the surrounding spacetime grid like a bowling ball resting on a trampoline.',
          visualScene: 'gravity_orbits',
          actionPrompt: 'Observe the concentric warped grid lines curving deeply around the central star!',
          highlightLabels: ['Central Star Mass', 'Spacetime Curvature Well', 'Gravitational Grid'],
          keyPrinciple: 'Newton’s Law of Universal Gravitation: F = G·(M₁·M₂)/r²'
        },
        {
          id: 'grav_2',
          stageNumber: 2,
          title: 'Stage 2: Tangential Velocity & Perpetual Freefall 🏃‍♂️',
          subtitle: 'Forward speed balances the inward gravitational tug',
          narration:
            'If a planet had no forward velocity, it would drop straight into the star. But with high tangential velocity, the planet curves around the star at the exact rate the star’s surface curves away.',
          visualScene: 'gravity_orbits',
          actionPrompt: 'Check out the green Tangential Velocity vector perpendicular to the orange Gravity pull!',
          highlightLabels: ['Tangential Velocity Vector', 'Centripetal Acceleration', 'Orbital Trajectory'],
          keyPrinciple: 'Circular Orbital Speed: v = √(G·M / r)'
        },
        {
          id: 'grav_3',
          stageNumber: 3,
          title: 'Stage 3: Kepler’s Laws & Elliptical Pathways 📐',
          subtitle: 'Planets sweep out equal areas in equal intervals of time',
          narration:
            'Planetary orbits are ellipses, not perfect circles. When a planet approaches perihelion (closest approach), gravitational pull strengthens, accelerating the planet to its highest orbital speed.',
          visualScene: 'gravity_orbits',
          actionPrompt: 'Look at the shaded wedge demonstrating Kepler’s Second Law of equal area sweep!',
          highlightLabels: ['Elliptical Focus', 'Equal Area Sweep', 'Perihelion Velocity'],
          keyPrinciple: 'Kepler’s 2nd Law: A line connecting a planet and the Sun sweeps equal areas in equal times.'
        },
        {
          id: 'grav_4',
          stageNumber: 4,
          title: 'Stage 4: Extreme Gravity & Black Hole Event Horizons 🕳️',
          subtitle: 'When mass collapses to a singularity, even light cannot escape',
          narration:
            'When a massive star exhausts its nuclear fuel and collapses into a singularity, gravitational curvature becomes infinite. Within the event horizon, escape velocity exceeds the cosmic speed of light.',
          visualScene: 'gravity_orbits',
          actionPrompt: 'Toggle "Black Hole Mode" to transform the Sun into a warping gravitational singularity!',
          highlightLabels: ['Singularity Core', 'Accretion Disk', 'Event Horizon Limit'],
          keyPrinciple: 'Schwarzschild Radius: r_s = 2GM / c²'
        }
      ],
      interactiveKnobs: [
        {
          id: 'orbit_radius',
          label: 'Orbital Distance (r)',
          type: 'slider',
          min: 120,
          max: 240,
          defaultValue: 180,
          unit: 'AU',
          impactDescription: 'Wider orbits take longer periods to complete and have slower velocities.'
        },
        {
          id: 'is_blackhole',
          label: 'Black Hole Mode 🕳️',
          type: 'toggle',
          defaultValue: false,
          impactDescription: 'Transforms central star into a relativistic black hole with intense spacetime warping.'
        }
      ],
      comprehensionQuiz: [
        {
          question: 'Why does a satellite in low Earth orbit stay in space instead of falling straight down?',
          options: [
            'There is no gravity in space whatsoever',
            'Its high forward horizontal speed causes it to perpetually fall around Earth’s curvature',
            'Rocket engines must fire continuously every second',
            'Magnets repel it from the clouds'
          ],
          correctIndex: 1,
          explanation: 'An orbit is perpetual freefall! The satellite falls toward Earth, but its forward speed (~28,000 km/h) matches Earth’s curvature.'
        },
        {
          question: 'What happens to the gravitational force between two planets if the distance between them is doubled?',
          options: ['Force becomes 2 times stronger', 'Force drops to 1/2 of original', 'Force drops to 1/4 of original (inverse square law)', 'Force remains unchanged'],
          correctIndex: 2,
          explanation: 'Newton’s gravity follows the inverse-square law: doubling the distance (2r) reduces the force by a factor of 2² = 4 (one-fourth).'
        }
      ],
      funFact: 'The International Space Station experiences about 90% of Earth’s surface gravity! Astronauts only float because they and the station are in continuous freefall together.'
    };
  }

  // 3. Rocket Propulsion & Space Launch
  if (
    q.includes('rocket') ||
    q.includes('launch') ||
    q.includes('propulsion') ||
    q.includes('thrust') ||
    q.includes('exhaust') ||
    q.includes('fuel') ||
    q.includes('spacecraft') ||
    q.includes('nasa')
  ) {
    return {
      id: `rocket_${Date.now()}`,
      question: question.trim(),
      conceptTitle: 'Rocket Propulsion & Newton’s Third Law 🚀',
      emoji: '🚀',
      category: 'Aerospace Engineering & Classical Mechanics',
      difficulty,
      summary:
        difficulty === 'beginner'
          ? 'Rockets work by shooting super-hot exhaust gases out of their nozzles downwards at immense speed. Pushing gas down pushes the rocket UP into the sky!'
          : difficulty === 'advanced'
          ? 'Rocket engines operate on momentum conservation: thrust equals mass flow rate times effective exhaust velocity plus nozzle pressure differential: F = ṁ·v_e + (p_e - p_a)·A_e.'
          : 'Newton’s Third Law states that every action has an equal and opposite reaction. High-velocity gas particles ejected from combustion push the rocket forward with tremendous thrust.',
      realWorldAnalogy:
        'Blow up a rubber balloon and let it go without tying it—as air blasts out backwards, the balloon zooms across the room in the opposite direction!',
      stages: [
        {
          id: 'rock_1',
          stageNumber: 1,
          title: 'Stage 1: High-Pressure Combustion Chamber Ignition 🔥',
          subtitle: 'Liquid propellants react violently inside the engine bell',
          narration:
            'Turbopumps inject cryogenic liquid fuel and liquid oxygen into the combustion chamber under immense pressure. Chemical ignition produces expanding gas exceeding 3,000°C.',
          visualScene: 'rocket_propulsion',
          actionPrompt: 'Observe the fiery combustion plume and glowing shock diamond Mach rings!',
          highlightLabels: ['Combustion Chamber', 'Cryogenic Propellant Tanks', 'De Laval Nozzle'],
          keyPrinciple: 'Chemical Exothermic Reaction: Fuel + Oxidizer → High Velocity Hot Gas'
        },
        {
          id: 'rock_2',
          stageNumber: 2,
          title: 'Stage 2: De Laval Nozzle Supersonic Gas Expansion 💨',
          subtitle: 'Converging-diverging bell accelerates exhaust past Mach 5',
          narration:
            'The De Laval nozzle funnels high-pressure exhaust through a narrow throat, then expands it outwards. This converts thermal enthalpy into directed kinetic velocity, ejecting gases at hypersonic speed.',
          visualScene: 'rocket_propulsion',
          actionPrompt: 'Notice the supersonic shock diamonds forming in the expanding exhaust stream!',
          highlightLabels: ['Throat Constriction', 'Supersonic Expansion', 'Diamond Shock Waves'],
          keyPrinciple: 'Thermodynamics: Conversion of thermal gas pressure into kinetic momentum'
        },
        {
          id: 'rock_3',
          stageNumber: 3,
          title: 'Stage 3: Newton’s Third Law Momentum Exchange ⚖️',
          subtitle: 'Action of expelled gas produces equal upward reaction thrust',
          narration:
            'Because exhaust mass carries momentum away downwards at thousands of meters per second, an equal momentum is imparted to the rocket body upwards. This works even better in the empty vacuum of space!',
          visualScene: 'rocket_propulsion',
          actionPrompt: 'Check out the green +Thrust reaction vector pushing up against gravity and drag!',
          highlightLabels: ['Downward Action (-ṁv)', 'Upward Reaction (+Thrust)', 'Gravity Drag'],
          keyPrinciple: 'Tsiolkovsky Rocket Equation: Δv = v_e · ln(m₀ / m_f)'
        },
        {
          id: 'rock_4',
          stageNumber: 4,
          title: 'Stage 4: Multi-Stage Separation & Orbital Insertion 🛰️',
          subtitle: 'Discarding empty fuel tanks unlocks massive velocity gains',
          narration:
            'Carrying empty metal fuel tanks wastes kinetic energy. By staging, the heavy first stage booster separates and falls away, allowing the lighter upper stage to ignite and accelerate into orbit.',
          visualScene: 'rocket_propulsion',
          actionPrompt: 'Click "💥 Staging Trigger" to watch the first stage booster separate from the second stage!',
          highlightLabels: ['Booster Separation Pneumatics', 'Second Stage Vacuum Engine', 'Payload Fairing'],
          keyPrinciple: 'Mass Ratio Optimization: Staging dramatically increases final spacecraft velocity (Δv)'
        }
      ],
      interactiveKnobs: [
        {
          id: 'throttle',
          label: 'Engine Throttle',
          type: 'slider',
          min: 40,
          max: 100,
          defaultValue: 85,
          unit: '%',
          impactDescription: 'Controls mass flow rate and total thrust output in kilonewtons.'
        },
        {
          id: 'stage_sep',
          label: 'Stage Separation 💥',
          type: 'toggle',
          defaultValue: false,
          impactDescription: 'Triggers pneumatic separation of heavy first-stage boosters.'
        }
      ],
      comprehensionQuiz: [
        {
          question: 'Can a rocket engine generate thrust in the vacuum of outer space where there is no air to push against?',
          options: [
            'No, rockets require atmospheric air to push against',
            'Yes! Rockets push against their own expelled exhaust gases, not ambient air',
            'No, rocket fuel cannot burn without atmospheric oxygen',
            'Yes, but only if they are near the Moon'
          ],
          correctIndex: 1,
          explanation: 'Rockets carry their own oxidizer and do not push against the surrounding air; they propel themselves by expelling exhaust mass (conservation of momentum).'
        },
        {
          question: 'Why do space rockets use multiple stages instead of one single giant rocket?',
          options: [
            'Stages look cooler on television',
            'Discarding empty, dead weight allows the remaining lighter rocket to accelerate much faster',
            'To give the astronauts extra bedrooms',
            'Because engines can only fire for 30 seconds before melting'
          ],
          correctIndex: 1,
          explanation: 'According to the rocket equation, shedding dead dry mass (empty fuel tanks) dramatically improves the mass ratio, delivering the high speeds needed for orbit.'
        }
      ],
      funFact: 'The Saturn V rocket consumed 15 metric tons of propellant every single second during launch—enough fuel to drain an Olympic swimming pool in under two minutes!'
    };
  }

  // 4. Solar & Lunar Eclipses
  if (
    q.includes('eclipse') ||
    q.includes('solar eclipse') ||
    q.includes('lunar eclipse') ||
    q.includes('totality') ||
    q.includes('umbra') ||
    q.includes('penumbra') ||
    q.includes('corona')
  ) {
    return {
      id: `eclipse_${Date.now()}`,
      question: question.trim(),
      conceptTitle: 'Solar Eclipses & Celestial Geometry 🌑☀️',
      emoji: '🌑',
      category: 'Astronomy & Optical Geometry',
      difficulty,
      summary:
        difficulty === 'beginner'
          ? 'A solar eclipse happens when the Moon moves directly between the Sun and Earth, blocking out the Sun’s light and casting a deep shadow over Earth in the middle of the day!'
          : difficulty === 'advanced'
          ? 'A total solar eclipse requires syzygy alignment where the Moon passes directly along the ecliptic plane at an orbital node. The Moon’s umbral shadow cone intersects Earth’s surface, revealing the faint solar corona.'
          : 'Due to a remarkable cosmic coincidence, the Sun is 400 times larger than the Moon, but also 400 times farther away, giving them nearly identical apparent angular sizes in our sky.',
      realWorldAnalogy:
        'Hold your thumb in front of your face and close one eye—you can easily block out an entire building across the street even though your thumb is tiny!',
      stages: [
        {
          id: 'ecl_1',
          stageNumber: 1,
          title: 'Stage 1: Syzygy Alignment & Orbital Nodes 📐',
          subtitle: 'Sun, Moon, and Earth align in a straight cosmic line',
          narration:
            'The Moon’s orbit around Earth is tilted by about 5 degrees relative to Earth’s orbit around the Sun. Eclipses can only occur when the Moon crosses the ecliptic plane at points called nodes during a New Moon.',
          visualScene: 'solar_eclipse',
          actionPrompt: 'Use the alignment buttons to position the Moon into exact totality alignment!',
          highlightLabels: ['Ecliptic Plane Node', 'Apparent Angular Size', 'New Moon Phase'],
          keyPrinciple: 'Orbital Inclination: 5.14° tilt prevents an eclipse every single month'
        },
        {
          id: 'ecl_2',
          stageNumber: 2,
          title: 'Stage 2: Umbra & Penumbra Shadow Cones 🕶️',
          subtitle: 'The Moon casts two distinct geometric shadow regions',
          narration:
            'Because the Sun is an extended light source, the Moon casts a deep, dark inner shadow cone called the Umbra (total blockage) and a broader, faint outer shadow cone called the Penumbra (partial blockage).',
          visualScene: 'solar_eclipse',
          actionPrompt: 'Observe the dark black Umbra cone narrowing directly toward Earth’s surface!',
          highlightLabels: ['Dark Umbra Cone', 'Faint Penumbra Cone', 'Path of Totality'],
          keyPrinciple: 'Geometric Optics: Extended light sources create umbral and penumbral shadows'
        },
        {
          id: 'ecl_3',
          stageNumber: 3,
          title: 'Stage 3: Totality, Baily’s Beads & Diamond Ring ✨',
          subtitle: 'Sunlight gleaming through lunar valleys creates the diamond ring',
          narration:
            'Seconds before totality, the last rays of sunlight shine through deep canyons and craters along the Moon’s rugged limb, forming gleaming dots known as Baily’s Beads, culminating in the dazzling Diamond Ring.',
          visualScene: 'solar_eclipse',
          actionPrompt: 'Look at the telescope view in the center to spot the glowing Diamond Ring sparkle!',
          highlightLabels: ['Baily’s Beads', 'Diamond Ring Effect', 'Lunar Topography Limb'],
          keyPrinciple: 'Lunar Topography: Mountains and valleys modulate final optical flashes'
        },
        {
          id: 'ecl_4',
          stageNumber: 4,
          title: 'Stage 4: The Solar Corona Revealed in Day-Night 🌟',
          subtitle: 'The Sun’s superheated million-degree outer atmosphere glows',
          narration:
            'During complete totality, the blinding solar photosphere is 100% blocked. The sky turns dark as twilight, stars appear, temperatures plummet, and the Sun’s ethereal white plasma corona shines brightly.',
          visualScene: 'solar_eclipse',
          actionPrompt: 'Notice the pearlescent plasma corona streaming outward from behind the dark Moon!',
          highlightLabels: ['Solar Plasma Corona', 'Prominence Flares', 'Atmospheric Temperature Drop'],
          keyPrinciple: 'Coronal Plasma Physics: Million-degree corona normally hidden by bright photosphere'
        }
      ],
      interactiveKnobs: [
        {
          id: 'moon_alignment',
          label: 'Moon Alignment',
          type: 'slider',
          min: -40,
          max: 40,
          defaultValue: 0,
          unit: '°',
          impactDescription: 'Aligns the Moon with the Sun. Set to 0 for complete totality.'
        }
      ],
      comprehensionQuiz: [
        {
          question: 'What is the dark inner shadow cone called where all direct sunlight is completely blocked?',
          options: ['The Penumbra', 'The Umbra', 'The Antumbra', 'The Corona'],
          correctIndex: 1,
          explanation: 'The Umbra is the dark central part of the shadow where the light source is completely blocked by the Moon.'
        },
        {
          question: 'Why do total solar eclipses not happen every single month during every New Moon?',
          options: [
            'The Moon turns invisible once a year',
            'The Moon’s orbit is tilted about 5 degrees relative to Earth’s orbit around the Sun',
            'The Sun moves too fast in winter',
            'Earth rotates backwards during full moons'
          ],
          correctIndex: 1,
          explanation: 'The 5.14° tilt of the Moon’s orbital plane means its shadow usually passes above or below Earth during New Moon.'
        }
      ],
      funFact: 'Because tidal forces are slowly pushing the Moon about 3.8 cm farther away from Earth every year, in about 600 million years, the Moon will be too far to cover the Sun, and total solar eclipses will end forever!'
    };
  }

  // 5. Sound Waves, Acoustics, Frequency & Pitch
  if (
    q.includes('sound') ||
    q.includes('wave') ||
    q.includes('frequency') ||
    q.includes('pitch') ||
    q.includes('ear') ||
    q.includes('speaker') ||
    q.includes('vibration') ||
    q.includes('acoustic') ||
    q.includes('loudness')
  ) {
    return {
      id: `sound_${Date.now()}`,
      question: question.trim(),
      conceptTitle: 'Sound Waves & Acoustic Frequency 🔊',
      emoji: '🔊',
      category: 'Wave Physics & Acoustics',
      difficulty,
      summary:
        difficulty === 'beginner'
          ? 'Sound is made by vibrations! When a speaker vibrates, it bumps into air particles, sending rippling compression waves through the air that vibrate your eardrum!'
          : difficulty === 'advanced'
          ? 'Sound is a mechanical longitudinal wave characterized by alternating cycles of compression and rarefaction. Wave propagation velocity depends on the bulk modulus and density of the medium: v = √(B/ρ).'
          : 'Unlike light, sound requires a physical medium (gas, liquid, or solid) to travel. Oscillating sources compress air particles into repeating bands of high and low pressure.',
      realWorldAnalogy:
        'Push a slinky back and forth along the floor—you see tight coils (compressions) travel down the length of the spring to the other end!',
      stages: [
        {
          id: 'snd_1',
          stageNumber: 1,
          title: 'Stage 1: Mechanical Vibration of Source 📢',
          subtitle: 'Oscillating membrane pushes against nearby air particles',
          narration:
            'When an audio speaker or guitar string moves, it mechanically displaces the air particles directly in front of it. Forward motion pushes particles together into high pressure zones.',
          visualScene: 'sound_waves',
          actionPrompt: 'Watch the loudspeaker cone vibrate rapidly back and forth!',
          highlightLabels: ['Speaker Voice Coil', 'Vibrating Diaphragm', 'Air Molecule Collision'],
          keyPrinciple: 'Harmonic Oscillation: Source displacement creates mechanical pressure waves'
        },
        {
          id: 'snd_2',
          stageNumber: 2,
          title: 'Stage 2: Longitudinal Compression & Rarefaction 🌊',
          subtitle: 'Particles bump their neighbors, transferring kinetic energy',
          narration:
            'Sound is a longitudinal wave: individual air particles merely oscillate back and forth around their rest positions, passing energy to their neighbors without traveling along with the wave.',
          visualScene: 'sound_waves',
          actionPrompt: 'Notice how the dense yellow compression bands travel from left to right!',
          highlightLabels: ['High-Pressure Compression', 'Low-Pressure Rarefaction', 'Particle Oscillation'],
          keyPrinciple: 'Wave Energy Transfer: Energy travels forward, while matter oscillates locally'
        },
        {
          id: 'snd_3',
          stageNumber: 3,
          title: 'Stage 3: Frequency (Pitch) and Amplitude (Volume) 📈',
          subtitle: 'Cycles per second determine pitch; displacement determines loudness',
          narration:
            'Frequency (measured in Hertz) is the number of wave cycles per second. Higher frequency creates higher pitch notes. Amplitude measures maximum particle displacement, perceived as volume.',
          visualScene: 'sound_waves',
          actionPrompt: 'Examine the live oscilloscope sine wave plotting pressure versus time at the bottom!',
          highlightLabels: ['Wavelength (λ)', 'Wave Frequency (Hz)', 'Peak Amplitude (dB)'],
          keyPrinciple: 'Wave Speed Formula: v = f · λ (Speed = Frequency × Wavelength)'
        },
        {
          id: 'snd_4',
          stageNumber: 4,
          title: 'Stage 4: Tympanic Membrane Auditory Reception 👂',
          subtitle: 'Eardrum vibrates in resonance, sending electrical impulses to brain',
          narration:
            'The incoming pressure waves strike the human tympanic membrane (eardrum), causing it to vibrate in exact sync. Tiny bones (ossicles) amplify these vibrations into the cochlea, which fires nerve signals to the brain.',
          visualScene: 'sound_waves',
          actionPrompt: 'See the pink ear drum on the right vibrating in sync with the sound waves!',
          highlightLabels: ['Tympanic Membrane (Eardrum)', 'Cochlear Hair Cells', 'Auditory Nerve'],
          keyPrinciple: 'Resonance & Auditory Transduction: Mechanical waves converted into neural impulses'
        }
      ],
      interactiveKnobs: [
        {
          id: 'frequency',
          label: 'Sound Frequency (Hz)',
          type: 'slider',
          min: 150,
          max: 800,
          defaultValue: 440,
          unit: 'Hz',
          impactDescription: 'Higher frequency shortens wavelength and raises musical pitch (A4 = 440Hz).'
        },
        {
          id: 'amplitude',
          label: 'Wave Amplitude',
          type: 'slider',
          min: 20,
          max: 100,
          defaultValue: 60,
          unit: '%',
          impactDescription: 'Increases particle displacement, making the sound louder.'
        }
      ],
      comprehensionQuiz: [
        {
          question: 'Why can sound NOT travel through the vacuum of outer space?',
          options: [
            'Space is too cold for sound waves',
            'Sound is a mechanical wave that requires physical matter particles to vibrate',
            'Space is too dark for ears to hear',
            'Sound waves are absorbed by solar radiation'
          ],
          correctIndex: 1,
          explanation: 'Sound is a mechanical pressure wave that relies on collisions between matter molecules; in empty vacuum, there are no particles to vibrate.'
        },
        {
          question: 'What physical property determines how high or low a musical note sounds (its pitch)?',
          options: ['Amplitude (Loudness)', 'Wave Frequency (Hertz)', 'Air Temperature only', 'Color of the speaker'],
          correctIndex: 1,
          explanation: 'Frequency (number of wave cycles per second in Hz) directly dictates perceived pitch: high frequency = high pitch (squeak), low frequency = deep bass (rumble).'
        }
      ],
      funFact: 'Sound travels about 4 times faster in water (1,480 m/s) and 15 times faster in solid steel (5,100 m/s) than it does in air (343 m/s) because denser particles bounce off each other much faster!'
    };
  }

  // 6. Light, Optics, Prisms & Rainbows
  if (
    q.includes('light') ||
    q.includes('prism') ||
    q.includes('rainbow') ||
    q.includes('refraction') ||
    q.includes('reflection') ||
    q.includes('lens') ||
    q.includes('optics') ||
    q.includes('snell') ||
    q.includes('laser')
  ) {
    return {
      id: `optics_${Date.now()}`,
      question: question.trim(),
      conceptTitle: 'Light Optics, Refraction & Prisms 🌈',
      emoji: '🌈',
      category: 'Electromagnetism & Wave Optics',
      difficulty,
      summary:
        difficulty === 'beginner'
          ? 'White light looks plain, but it is actually made of every color of the rainbow mixed together! When light enters a glass prism, glass slows down each color by a different amount, spreading them into a beautiful rainbow!'
          : difficulty === 'advanced'
          ? 'Refraction occurs due to phase velocity changes across dielectric boundaries governed by Snell’s law: n₁·sin(θ₁) = n₂·sin(θ₂). Chromatic dispersion arises because refractive index n(λ) increases for shorter wavelengths.'
          : 'Light travels slower in denser optical media like glass than in air. When entering at an angle, light rays bend (refract). Because violet bends more than red, white light disperses into the visible spectrum.',
      realWorldAnalogy:
        'Imagine pushing a shopping cart from smooth asphalt into thick grass at an angle—the front wheel that hits the grass first slows down, causing the entire cart to pivot and change direction!',
      stages: [
        {
          id: 'opt_1',
          stageNumber: 1,
          title: 'Stage 1: Incident White Light Beam Arrival 🔦',
          subtitle: 'A polychromatic beam approaches the glass interface',
          narration:
            'A laser or beam of white light traveling through air strikes the angled surface of a triangular glass prism. White light contains a continuous mixture of all visible wavelengths from 380 nm to 750 nm.',
          visualScene: 'light_optics',
          actionPrompt: 'Observe the white incident light beam traveling from the left into the glass prism!',
          highlightLabels: ['Polychromatic White Light', 'Angle of Incidence (θ₁)', 'Optical Normal Line'],
          keyPrinciple: 'Speed of Light in Vacuum: c ≈ 300,000 km/s'
        },
        {
          id: 'opt_2',
          stageNumber: 2,
          title: 'Stage 2: Boundary Refraction & Snell’s Law 📐',
          subtitle: 'Entering denser glass slows light, bending it toward the normal',
          narration:
            'Glass is optically denser than air (refractive index n ≈ 1.5). As light crosses the boundary, its phase velocity drops to v = c/n, causing the wavefronts to bend toward the normal line according to Snell’s Law.',
          visualScene: 'light_optics',
          actionPrompt: 'Notice how the light ray bends sharply as it crosses from air into the cyan glass!',
          highlightLabels: ['Glass Medium (n = 1.52)', 'Refracted Angle (θ₂)', 'Normal Interface Line'],
          keyPrinciple: 'Snell’s Law of Refraction: n₁ · sin(θ₁) = n₂ · sin(θ₂)'
        },
        {
          id: 'opt_3',
          stageNumber: 3,
          title: 'Stage 3: Chromatic Dispersion Inside the Prism 🌈',
          subtitle: 'Shorter wavelengths (Violet) slow more and bend sharper than Red',
          narration:
            'The refractive index of glass is not constant: it is higher for short, high-energy violet wavelengths (400 nm) than for long red wavelengths (700 nm). Violet light slows down more and is deflected through a greater angle.',
          visualScene: 'light_optics',
          actionPrompt: 'Watch the beam fan out inside the prism into distinct colored strands!',
          highlightLabels: ['Cauchy Dispersion Relation', 'Violet High Deviation', 'Red Low Deviation'],
          keyPrinciple: 'Dispersion: dn/dλ < 0 across normal optical transparent media'
        },
        {
          id: 'opt_4',
          stageNumber: 4,
          title: 'Stage 4: Emergence & Visible Rainbow Spectrum Projection 🖥️',
          subtitle: 'The second angled surface amplifies the spread onto the screen',
          narration:
            'As light emerges from the second non-parallel prism surface back into air, it refracts again away from the normal. The angular spread is amplified, projecting the complete vibrant rainbow: Red, Orange, Yellow, Green, Blue, Indigo, Violet!',
          visualScene: 'light_optics',
          actionPrompt: 'Inspect the projection screen on the right showing each spectral wavelength in nanometers!',
          highlightLabels: ['Observation Projection Screen', 'Visible Spectrum (ROYGBIV)', 'Angular Dispersion Spread'],
          keyPrinciple: 'Visible Spectrum: Human retinas perceive electromagnetic waves from 380 nm to 750 nm'
        }
      ],
      interactiveKnobs: [
        {
          id: 'incident_angle',
          label: 'Angle of Incidence',
          type: 'slider',
          min: 15,
          max: 65,
          defaultValue: 38,
          unit: '°',
          impactDescription: 'Alters the angle the incoming light strikes the glass prism.'
        },
        {
          id: 'refractive_index',
          label: 'Glass Refractive Index (n)',
          type: 'slider',
          min: 1.3,
          max: 2.4,
          defaultValue: 1.52,
          impactDescription: 'Higher indices (like Diamond n=2.4) bend and disperse light much more strongly!'
        }
      ],
      comprehensionQuiz: [
        {
          question: 'Which color of visible light bends the MOST when passing through a glass prism?',
          options: ['Red', 'Yellow', 'Green', 'Violet'],
          correctIndex: 3,
          explanation: 'Violet light has the shortest wavelength and highest frequency in the visible spectrum, so it experiences the highest refractive index in glass and bends the most.'
        },
        {
          question: 'What causes rainbows to appear in the sky after a rainstorm?',
          options: [
            'Clouds painted with colorful pollen',
            'Millions of airborne raindrops act like tiny prisms, refracting, reflecting, and dispersing sunlight',
            'Solar flares burning oxygen molecules',
            'The ozone layer reflecting the ocean'
          ],
          correctIndex: 1,
          explanation: 'Raindrops act as spherical optical prisms! Sunlight enters each droplet, refracts, reflects off the back wall, and disperses into the rainbow spectrum.'
        }
      ],
      funFact: 'Isaac Newton was the first scientist to prove that prisms do not "color" white light—he placed a second inverted prism in the path of a rainbow beam, recombining all the colors right back into pure white light!'
    };
  }

  // 7. Atoms, Quantum Mechanics, Electrons & Photons
  if (
    q.includes('atom') ||
    q.includes('electron') ||
    q.includes('quantum') ||
    q.includes('proton') ||
    q.includes('neutron') ||
    q.includes('photon') ||
    q.includes('nucleus') ||
    q.includes('bohr')
  ) {
    return {
      id: `atom_${Date.now()}`,
      question: question.trim(),
      conceptTitle: 'Atomic Structure & Quantum Energy Leaps ⚛️',
      emoji: '⚛️',
      category: 'Quantum Physics & Chemistry',
      difficulty,
      summary:
        difficulty === 'beginner'
          ? 'Atoms are the tiny building blocks of everything! Heavy protons and neutrons sit tightly in the center nucleus, while tiny electrons zoom around in special orbital rings!'
          : difficulty === 'advanced'
          ? 'Electrons occupy quantized stationary states defined by quantum numbers. When an electron transitions between energy levels (n_initial → n_final), it absorbs or emits a photon with energy ΔE = h·ν.'
          : 'Electrons cannot orbit at just any random distance. They are locked into quantized energy shells. Absorbing energy kicks an electron up a shell; falling back down releases glowing light!',
      realWorldAnalogy:
        'Climbing a ladder: you can stand securely on the 1st rung or the 2nd rung, but you cannot stand floating in the empty air between the rungs!',
      stages: [
        {
          id: 'atm_1',
          stageNumber: 1,
          title: 'Stage 1: Dense Nucleus (Protons & Neutrons) 🔴🔵',
          subtitle: '99.9% of atomic mass is concentrated in the central core',
          narration:
            'At the center of every atom lies the nucleus, held together by the Strong Nuclear Force. Positively charged protons (+) and neutral neutrons (0) form a dense, heavy core.',
          visualScene: 'atom_quantum',
          actionPrompt: 'Observe the clustered red protons (+) and blue neutrons (n) in the nucleus!',
          highlightLabels: ['Positively Charged Protons (+)', 'Neutral Neutrons (0)', 'Strong Nuclear Force'],
          keyPrinciple: 'Strong Nuclear Force overcomes electrostatic Coulomb repulsion between protons'
        },
        {
          id: 'atm_2',
          stageNumber: 2,
          title: 'Stage 2: Quantized Electron Shells (n=1, n=2, n=3) 🪐',
          subtitle: 'Electrons reside only in discrete, stable quantum energy levels',
          narration:
            'Niels Bohr discovered that electrons orbit the nucleus only in discrete orbits with quantized angular momentum. The innermost shell (n=1) has the lowest energy, known as the ground state.',
          visualScene: 'atom_quantum',
          actionPrompt: 'See the concentric dashed energy shells n=1, n=2, and n=3!',
          highlightLabels: ['Ground State Shell (n=1)', 'Excited State Shell (n=2)', 'Quantized Energy Levels'],
          keyPrinciple: 'Bohr Quantum Postulate: L = n·(h / 2π)'
        },
        {
          id: 'atm_3',
          stageNumber: 3,
          title: 'Stage 3: Photon Absorption & Quantum Leap ⚡',
          subtitle: 'An incoming packet of light promotes the electron to an excited shell',
          narration:
            'When an atom absorbs a photon with the exact energy difference between shells, the electron instantly jumps to a higher orbital shell without ever existing in the space between.',
          visualScene: 'atom_quantum',
          actionPrompt: 'Click "Jump to n=3" to witness an electron excitation quantum leap!',
          highlightLabels: ['Incoming Photon Wavepacket', 'Electron Excitation', 'Orbital Shell Transition'],
          keyPrinciple: 'Photon Energy Absorption: E_photon = h·ν = E_final - E_initial'
        },
        {
          id: 'atm_4',
          stageNumber: 4,
          title: 'Stage 4: Spontaneous Emission & Glow of Light 🌟',
          subtitle: 'Falling back to the ground state releases a radiant photon',
          narration:
            'Excited states are unstable. When the electron drops back down to a lower shell, it releases its excess energy as a single photon of light with a signature spectral wavelength—the secret behind neon lights, lasers, and fireworks!',
          visualScene: 'atom_quantum',
          actionPrompt: 'Click "Jump to n=1" to watch the electron drop back and emit glowing light!',
          highlightLabels: ['Spontaneous Emission', 'Emitted Light Photon', 'Characteristic Atomic Line Spectrum'],
          keyPrinciple: 'Planck-Einstein Equation: ΔE = h·c / λ'
        }
      ],
      interactiveKnobs: [
        {
          id: 'electron_shell',
          label: 'Active Electron Shell (n)',
          type: 'slider',
          min: 1,
          max: 3,
          defaultValue: 2,
          impactDescription: 'Sets the electron quantum energy shell from n=1 (ground state) to n=3 (excited state).'
        }
      ],
      comprehensionQuiz: [
        {
          question: 'What happens when an excited electron falls from shell n=3 down to shell n=1?',
          options: [
            'The atom turns into a black hole',
            'It emits a photon (packet of light) with energy equal to the difference between shells',
            'The electron is destroyed forever',
            'The nucleus splits in half'
          ],
          correctIndex: 1,
          explanation: 'Conservation of energy dictates that when an electron transitions to a lower energy state, the energy lost is emitted as a photon of light.'
        },
        {
          question: 'What subatomic particles reside in the central nucleus of an atom?',
          options: ['Electrons and Photons', 'Protons and Neutrons', 'Neutrinos and Gravitons', 'Molecules and Cells'],
          correctIndex: 1,
          explanation: 'Protons and neutrons reside in the nucleus, held tightly together by the strong nuclear force, while electrons orbit outside.'
        }
      ],
      funFact: 'Atoms are 99.999999999% empty space! If the nucleus of an atom were the size of a marble in the center of a football stadium, the orbiting electrons would be tiny specks of dust buzzing in the highest stadium bleachers.'
    };
  }

  // 8. DNA, Genetics & Molecular Biology
  if (
    q.includes('dna') ||
    q.includes('gene') ||
    q.includes('genetics') ||
    q.includes('chromosome') ||
    q.includes('helix') ||
    q.includes('helicase') ||
    q.includes('replication') ||
    q.includes('polymerase')
  ) {
    return {
      id: `dna_${Date.now()}`,
      question: question.trim(),
      conceptTitle: 'DNA Replication & The Genetic Double Helix 🧬',
      emoji: '🧬',
      category: 'Molecular Biology & Genetics',
      difficulty,
      summary:
        difficulty === 'beginner'
          ? 'DNA is the master recipe book inside every living cell! It looks like a twisted spiral ladder. When cells divide, an enzyme unzips the ladder down the middle so each side can build an exact twin!'
          : difficulty === 'advanced'
          ? 'DNA replication is semi-conservative. DNA Helicase unzips parent strands at the replication fork. DNA Polymerase synthesizes daughter strands continuously (leading) and discontinuously via Okazaki fragments (lagging).'
          : 'Genetic information is encoded in sequences of four chemical bases: Adenine (A), Thymine (T), Cytosine (C), and Guanine (G). Base pairing rules guarantee that A always binds with T, and C always binds with G.',
      realWorldAnalogy:
        'Think of DNA replication like an open zipper on a jacket: each open side is matched tooth-by-tooth with new zipper teeth to make two identical complete jackets!',
      stages: [
        {
          id: 'dna_1',
          stageNumber: 1,
          title: 'Stage 1: The Double Helix & Complementary Base Pairs 🪜',
          subtitle: 'Sugar-phosphate backbone with A-T and C-G rungs',
          narration:
            'Watson and Crick discovered that DNA forms a double helix. The outer rails consist of alternating sugar and phosphate groups, while the internal rungs are complementary nitrogenous bases paired by hydrogen bonds.',
          visualScene: 'dna_replication',
          actionPrompt: 'Observe the color-coded base pairs: Green Adenine binds with Red Thymine; Blue Cytosine with Orange Guanine!',
          highlightLabels: ['Sugar-Phosphate Backbone', 'Adenine-Thymine (2 H-bonds)', 'Cytosine-Guanine (3 H-bonds)'],
          keyPrinciple: 'Chargaff’s Rules: Number of Adenines equals Thymines; Cytosines equals Guanines'
        },
        {
          id: 'dna_2',
          stageNumber: 2,
          title: 'Stage 2: Helicase Unzipping at the Replication Fork ✂️',
          subtitle: 'Enzyme breaks hydrogen bonds to separate parent strands',
          narration:
            'The enzyme DNA Helicase binds to the origin of replication and moves along the molecule, unwinding the twist and severing hydrogen bonds between bases, creating a Y-shaped replication fork.',
          visualScene: 'dna_replication',
          actionPrompt: 'Watch the purple Helicase enzyme actively splitting the double helix down the center!',
          highlightLabels: ['DNA Helicase Enzyme', 'Replication Fork', 'Single-Strand Binding Proteins'],
          keyPrinciple: 'Enzymatic Hydrolysis: ATP powers helicase unwinding at speeds up to 1000 base pairs per second'
        },
        {
          id: 'dna_3',
          stageNumber: 3,
          title: 'Stage 3: Leading & Lagging Strand Polymerization 🏗️',
          subtitle: 'DNA Polymerase reads 3’ to 5’ and synthesizes 5’ to 3’',
          narration:
            'DNA Polymerase synthesizes new daughter strands by matching free nucleotides. The leading strand synthesizes continuously toward the fork, while the lagging strand synthesizes backwards in Okazaki fragments.',
          visualScene: 'dna_replication',
          actionPrompt: 'See the free nucleotides snapping into place with complementary matching partners!',
          highlightLabels: ['DNA Polymerase III', 'Leading Strand (5’ → 3’)', 'Okazaki Fragments on Lagging Strand'],
          keyPrinciple: 'Anti-Parallel Directionality: Polymerase can only add nucleotides to a free 3’-OH end'
        },
        {
          id: 'dna_4',
          stageNumber: 4,
          title: 'Stage 4: Semi-Conservative Duplication Complete ✨',
          subtitle: 'Two identical double helices, each with one original and one new strand',
          narration:
            'DNA Ligase seals any nicks in the sugar-phosphate backbone. The cell now possesses two identical copies of its genome: each helix retains one original parent strand and one newly assembled daughter strand.',
          visualScene: 'dna_replication',
          actionPrompt: 'Observe how each newly formed double helix is a 100% exact copy of the original!',
          highlightLabels: ['Semi-Conservative Helices', 'DNA Ligase Sealing', 'Proofreading Error Rate: 1 in 10⁹'],
          keyPrinciple: 'Semi-Conservative Replication: Preserves genetic fidelity across generations'
        }
      ],
      interactiveKnobs: [
        {
          id: 'replication_speed',
          label: 'Polymerase Speed',
          type: 'slider',
          min: 1,
          max: 5,
          defaultValue: 2,
          impactDescription: 'Speeds up the replication fork unzipping and complementary base pairing.'
        }
      ],
      comprehensionQuiz: [
        {
          question: 'According to base pairing rules, which nitrogenous base always pairs with Adenine (A) in DNA?',
          options: ['Cytosine (C)', 'Guanine (G)', 'Thymine (T)', 'Uracil (U)'],
          correctIndex: 2,
          explanation: 'Adenine (A) always pairs specifically with Thymine (T) via two hydrogen bonds in DNA (A-T pairing).'
        },
        {
          question: 'What does "semi-conservative" replication mean?',
          options: [
            'Only half of the DNA is copied to save energy',
            'Each new DNA molecule contains one original parent strand and one newly synthesized strand',
            'DNA changes into RNA permanently',
            'Cells destroy the original DNA after copying'
          ],
          correctIndex: 1,
          explanation: 'Meselson and Stahl proved replication is semi-conservative: each daughter double helix conserves one original template strand and gains one new strand.'
        }
      ],
      funFact: 'If you unraveled and stretched out all the DNA inside a single human body end-to-end, it would stretch over 10 billion miles—long enough to reach from Earth to Pluto and back!'
    };
  }

  // 9. Volcano Eruption & Magma Dynamics
  if (
    q.includes('volcano') ||
    q.includes('eruption') ||
    q.includes('magma') ||
    q.includes('lava') ||
    q.includes('tephra') ||
    q.includes('pyroclastic') ||
    q.includes('crater') ||
    q.includes('mantle')
  ) {
    return {
      id: `volcano_${Date.now()}`,
      question: question.trim(),
      conceptTitle: 'Volcanic Eruptions & Magma Dynamics 🌋',
      emoji: '🌋',
      category: 'Geology & Geodynamics',
      difficulty,
      summary:
        difficulty === 'beginner'
          ? 'Deep inside the Earth, hot molten rock called magma gathers in underground chambers. High gas pressure forces the magma up through cracks in the crust until it violently erupts into red-hot lava, ash, and rocks!'
          : difficulty === 'advanced'
          ? 'Volcanism is governed by thermodynamic phase equilibria and gas exsolution dynamics (H₂O, CO₂). Overpressure in sub-volcanic reservoirs triggers brittle failure of wall-rock, propagating supersonic conduit decompression.'
          : 'Deep inside Earth’s mantle, immense heat melts rock into buoyant magma. As dissolved volatile gases expand, overwhelming lithostatic pressure forces the magma up through conduit vents in explosive eruptions.',
      realWorldAnalogy:
        'Shaking a bottle of soda and suddenly twisting off the cap: dissolved gas bubbles violently expand and blast a jet of liquid into the sky!',
      stages: [
        {
          id: 'volc_1',
          stageNumber: 1,
          title: 'Stage 1: Partial Melting & Magma Chamber Accumulation 🌋',
          subtitle: 'Buoyant molten rock pools deep beneath the tectonic crust',
          narration:
            'Deep in the asthenosphere, geothermal heat melts rock into liquid magma. Because molten magma is less dense than the surrounding solid rock strata, it buoyantly ascends and pools in a vast subterranean magma reservoir.',
          visualScene: 'volcano_eruption',
          actionPrompt: 'Observe the pulsing magma chamber glowing beneath the solid rock strata!',
          highlightLabels: ['Subterranean Magma Reservoir', 'Buoyant Density Inversion', 'Lithostatic Wall-Rock Pressure'],
          keyPrinciple: 'Archimedes Buoyancy Principle: Δρ = ρ_solid - ρ_magma > 0'
        },
        {
          id: 'volc_2',
          stageNumber: 2,
          title: 'Stage 2: Volatile Exsolution & Conduit Ascent 🫧',
          subtitle: 'Dissolved gas bubbles expand as hydrostatic pressure decreases',
          narration:
            'As magma rises up the central volcanic conduit, confining hydrostatic pressure drops. Dissolved water vapor, carbon dioxide, and sulfur dioxide exsolve out of solution, forming rapidly expanding supercritical gas bubbles.',
          visualScene: 'volcano_eruption',
          actionPrompt: 'Watch the expanding volatile bubbles accelerating upward through the central conduit vent!',
          highlightLabels: ['Volatile Gas Exsolution (H₂O, CO₂)', 'Conduit Vent', 'Bubble Nucleation'],
          keyPrinciple: 'Henry\'s Law: Gas solubility decreases proportionally with decreasing ambient confining pressure'
        },
        {
          id: 'volc_3',
          stageNumber: 3,
          title: 'Stage 3: Explosive Fragmentation & Pyroclastic Cloud 💥',
          subtitle: 'Expanding gases shatter magma into tephra, ash, and lava fountains',
          narration:
            'When gas volume fraction exceeds 75%, bubble walls catastrophically rupture. The molten foam shatters into fine volcanic ash, incandescent pumice lapilli, and ballistic bombs, rocketing out of the summit crater in a supersonic plume.',
          visualScene: 'volcano_eruption',
          actionPrompt: 'Turn up the Magma Pressure slider to watch the convective ash column billow into the stratosphere!',
          highlightLabels: ['Supersonic Choked Flow', 'Convective Plume', 'Pyroclastic Tephra'],
          keyPrinciple: 'Hydrodynamic Fragmentation: Catastrophic brittle failure of gas-pressurized silicate melt'
        },
        {
          id: 'volc_4',
          stageNumber: 4,
          title: 'Stage 4: Viscous Lava Flow & Basaltic Cooling 🪨',
          subtitle: 'Silicate melt cascades down flanks, crystallizing into new igneous rock',
          narration:
            'Degassed molten lava spills over the caldera rim and flows down the volcano flanks. Radiative heat loss to the cold air solidifies the outer crust into dark basaltic rock while molten red-hot channels continue to surge beneath.',
          visualScene: 'volcano_eruption',
          actionPrompt: 'Inspect the glowing lava stream cooling into hard igneous crust along the mountain slope!',
          highlightLabels: ['Pahoehoe & Aa Lava Strata', 'Igneous Crystallization', 'Thermal Radiation'],
          keyPrinciple: 'Stefan-Boltzmann Law: Rapid thermal radiative emission cools lava into solid igneous crust'
        }
      ],
      interactiveKnobs: [
        {
          id: 'magma_pressure',
          label: 'Magma Chamber Overpressure',
          type: 'slider',
          min: 20,
          max: 100,
          defaultValue: 78,
          unit: '%',
          impactDescription: 'Controls volatile gas bubble nucleation and height of the convective ash plume.'
        },
        {
          id: 'is_erupting',
          label: 'Active Conduit Eruption 🌋',
          type: 'toggle',
          defaultValue: true,
          impactDescription: 'Toggles explosive eruption versus dormant pressurized storage.'
        }
      ],
      comprehensionQuiz: [
        {
          question: 'What is the primary driving force behind explosive volcanic eruptions?',
          options: [
            'Violently expanding volatile gas bubbles (steam, CO₂) dissolved in the magma',
            'Underground lightning storms',
            'Ocean water cooling the core',
            'Wind blowing into the crater'
          ],
          correctIndex: 0,
          explanation: 'As magma ascends and pressure drops, dissolved volatile gases (mainly H₂O and CO₂) rapidly exsolve and expand explosively, blasting magma apart into ash and lava!'
        },
        {
          question: 'What is the difference between magma and lava?',
          options: [
            'Magma is molten rock beneath Earth\'s surface; lava is molten rock that has erupted onto the surface',
            'Magma is cold, lava is hot',
            'Magma is blue, lava is green',
            'Magma is made of water'
          ],
          correctIndex: 0,
          explanation: 'Magma refers to molten rock stored beneath Earth\'s crust; once it breaches the surface through a volcanic vent, it is classified as lava.'
        }
      ],
      funFact: 'The 1883 eruption of Krakatoa generated the loudest sound ever recorded in modern history—it ruptured the eardrums of sailors 40 miles away and circled the entire globe four times!'
    };
  }

  // 10. Cell Biology & Eukaryotic Organelles
  if (
    q.includes('cell') ||
    q.includes('mitochondria') ||
    q.includes('organelle') ||
    q.includes('membrane') ||
    q.includes('cytoplasm') ||
    q.includes('ribosome') ||
    q.includes('atp') ||
    q.includes('eukaryot') ||
    q.includes('prokaryot')
  ) {
    return {
      id: `cell_${Date.now()}`,
      question: question.trim(),
      conceptTitle: 'Eukaryotic Cell Biology & Cellular Organelles 🔬',
      emoji: '🔬',
      category: 'Cellular & Molecular Biology',
      difficulty,
      summary:
        difficulty === 'beginner'
          ? 'Cells are the amazing microscopic building blocks of all living things! Inside, special compartments called organelles work together like a tiny city: the nucleus is City Hall, and mitochondria are the power plants producing energy!'
          : difficulty === 'advanced'
          ? 'Eukaryotic cells maintain compartmentalization via selective lipid bilayers and organelle membrane potentials. Mitochondria generate ATP via oxidative phosphorylation, while transcription in the nucleus coordinates with translation at cytosolic ribosomes.'
          : 'The eukaryotic cell is an intricate microscopic factory. The nucleus stores genetic code, mitochondria generate ATP energy through oxidative respiration, and the phospholipid bilayer regulates nutrient transport.',
      realWorldAnalogy:
        'A bustling miniature metropolis: the nucleus is the town hall with blueprints, mitochondria are the power stations, ribosomes are manufacturing factories, and the cell membrane is the guarded perimeter wall!',
      stages: [
        {
          id: 'cell_1',
          stageNumber: 1,
          title: 'Stage 1: Phospholipid Bilayer & Selective Permeability 🛡️',
          subtitle: 'Amphipathic lipid membrane controls influx of ions and metabolites',
          narration:
            'The cell is enclosed by a fluid mosaic membrane composed of a phospholipid bilayer with hydrophilic heads facing the aqueous exterior and hydrophobic tails tucked inside, regulating transport via protein channels.',
          visualScene: 'cell_biology',
          actionPrompt: 'Observe the fluid mosaic cell membrane enclosing the cytoplasm and organelles!',
          highlightLabels: ['Phospholipid Bilayer', 'Transmembrane Protein Channels', 'Fluid Mosaic Cytosol'],
          keyPrinciple: 'Selective Permeability: Hydrophobic core prevents passive diffusion of polar molecules'
        },
        {
          id: 'cell_2',
          stageNumber: 2,
          title: 'Stage 2: The Nucleus & Genomic Transcription 🏛️',
          subtitle: 'Double-membrane nuclear envelope houses chromatin and nucleolus',
          narration:
            'The nucleus acts as the command center of the cell, protecting chromatin (DNA). Through nuclear pores, messenger RNA (mRNA) transcripts are exported into the cytoplasm for protein synthesis.',
          visualScene: 'cell_biology',
          actionPrompt: 'Click on the large central nucleus to inspect the nuclear envelope and nucleolus!',
          highlightLabels: ['Nuclear Envelope', 'Chromatin Threads', 'Nuclear Pore Complexes'],
          keyPrinciple: 'Central Dogma: DNA is transcribed into mRNA inside the protective nuclear membrane'
        },
        {
          id: 'cell_3',
          stageNumber: 3,
          title: 'Stage 3: Mitochondria & ATP Cellular Respiration ⚡',
          subtitle: 'Chemiosmotic proton gradients generate cellular energy currency',
          narration:
            'Known as the powerhouse of the cell, mitochondria possess an inner folded cristae membrane where the electron transport chain pumps protons to drive ATP synthase, producing ATP from glucose breakdown.',
          visualScene: 'cell_biology',
          actionPrompt: 'Notice the golden ATP energy sparks pulsing out of the mitochondria into the cytosol!',
          highlightLabels: ['Mitochondrial Cristae', 'ATP Synthase Complex', 'Proton Gradient (ΔμH⁺)'],
          keyPrinciple: 'Chemiosmosis: Proton motive force across inner mitochondrial membrane synthesizes ATP'
        },
        {
          id: 'cell_4',
          stageNumber: 4,
          title: 'Stage 4: Endoplasmic Reticulum & Protein Packaging 📦',
          subtitle: 'Rough ER ribosomes synthesize peptides, routed through Golgi vesicles',
          narration:
            'Ribosomes bound to the rough endoplasmic reticulum assemble peptide chains from amino acids. Vesicles transport these proteins to the Golgi apparatus for sorting, modification, and cellular delivery.',
          visualScene: 'cell_biology',
          actionPrompt: 'Follow the glowing transport vesicles moving between the endoplasmic reticulum and Golgi!',
          highlightLabels: ['Rough Endoplasmic Reticulum', 'Ribosome Complexes', 'Golgi Apparatus Vesicles'],
          keyPrinciple: 'Vesicular Trafficking: Endomembrane network directs targeted molecular export'
        }
      ],
      interactiveKnobs: [
        {
          id: 'atp_production',
          label: 'Mitochondrial Respiration Rate',
          type: 'slider',
          min: 20,
          max: 100,
          defaultValue: 75,
          unit: '%',
          impactDescription: 'Controls rate of ATP energy spark production and cellular metabolism.'
        },
        {
          id: 'show_organelles',
          label: 'Highlight Organelle Network 💡',
          type: 'toggle',
          defaultValue: true,
          impactDescription: 'Highlights internal compartmentalized organelles with high-contrast outlines.'
        }
      ],
      comprehensionQuiz: [
        {
          question: 'Which cellular organelle is known as the "powerhouse of the cell" for generating ATP energy?',
          options: ['Mitochondrion ⚡', 'Golgi apparatus', 'Lysosome', 'Centriole'],
          correctIndex: 0,
          explanation: 'Mitochondria generate the majority of cellular adenosine triphosphate (ATP) through oxidative phosphorylation, earning the title "powerhouse of the cell"!'
        },
        {
          question: 'What is the primary function of the cell nucleus?',
          options: [
            'To store and protect genetic DNA instructions and direct cellular activities',
            'To pump blood throughout the body',
            'To digest incoming food particles with acid',
            'To reflect light like a prism'
          ],
          correctIndex: 0,
          explanation: 'The nucleus contains the cell’s chromosomes and coordinates growth, metabolism, protein synthesis, and reproduction by regulating gene expression.'
        }
      ],
      funFact: 'Mitochondria have their own separate DNA, distinct from nuclear DNA! Scientists believe mitochondria were once free-living primitive bacteria that merged with ancestral cells over 1.5 billion years ago (endosymbiosis).'
    };
  }

  // 11. Human Digestive System & Absorption
  if (
    q.includes('digest') ||
    q.includes('stomach') ||
    q.includes('intestine') ||
    q.includes('enzyme') ||
    q.includes('food') ||
    q.includes('esophagus') ||
    q.includes('peristalsis') ||
    q.includes('nutrient')
  ) {
    return {
      id: `digest_${Date.now()}`,
      question: question.trim(),
      conceptTitle: 'The Human Digestive System & Nutrient Absorption 🍎',
      emoji: '🍎',
      category: 'Human Anatomy & Physiology',
      difficulty,
      summary:
        difficulty === 'beginner'
          ? 'When you eat food, your digestive system breaks it down into tiny nutrient building blocks! Starting in the mouth with chewing and saliva, traveling down the esophagus, churning in stomach acid, and absorbing into blood through the intestines!'
          : difficulty === 'advanced'
          ? 'Digestion is a coupled mechanical and biochemical process. Amylase initiates carbohydrate cleavage in the oral cavity, gastric hydrochloric acid and pepsin hydrolyze proteins, and intestinal villi facilitate active brush-border nutrient absorption.'
          : 'The gastrointestinal tract converts ingested macromolecules into absorbable monomers. Peristaltic contractions propel bolus down the esophagus into the gastric chamber, followed by enzymatic breakdown and mucosal absorption in the small intestine.',
      realWorldAnalogy:
        'An automated disassembly factory: food enters as whole assemblies, which are systematically unpacked, broken into sub-components with chemical solvents, sorted by quality, and absorbed into the supply chain!',
      stages: [
        {
          id: 'dig_1',
          stageNumber: 1,
          title: 'Stage 1: Oral Cavity & Salivary Amylase Mastication 👄',
          subtitle: 'Teeth mechanically crush food while saliva breaks down starch',
          narration:
            'Mastication mechanically breaks food into smaller pieces, increasing surface area for enzymatic attack. Salivary amylase begins cleaving complex polysaccharides into maltose, shaping the food into a soft bolus.',
          visualScene: 'digestive_system',
          actionPrompt: 'Observe the oral mastication zone and salivary gland enzyme secretion!',
          highlightLabels: ['Salivary Amylase Enzyme', 'Food Bolus', 'Oral Mastication'],
          keyPrinciple: 'Surface Area to Volume Ratio: Crushing food accelerates biochemical enzymatic rate'
        },
        {
          id: 'dig_2',
          stageNumber: 2,
          title: 'Stage 2: Esophageal Peristalsis Wave Propulsion 🌀',
          subtitle: 'Coordinated muscular contractions push the bolus downward',
          narration:
            'Swallowing triggers involuntary rhythmic waves of smooth muscle contraction called peristalsis. Circular muscles contract behind the bolus while longitudinal muscles shorten ahead, driving food smoothly down to the stomach.',
          visualScene: 'digestive_system',
          actionPrompt: 'Watch the traveling peristaltic contraction wave propelling the bolus down the esophagus!',
          highlightLabels: ['Peristaltic Smooth Muscle Waves', 'Lower Esophageal Sphincter', 'Bolus Propulsion'],
          keyPrinciple: 'Peristalsis operates independently of gravity—you can swallow food even when upside down!'
        },
        {
          id: 'dig_3',
          stageNumber: 3,
          title: 'Stage 3: Gastric Churning & Hydrochloric Acid (pH 1.5-2.0) 🧪',
          subtitle: 'Pepsin and gastric acid liquefy bolus into nutrient chyme',
          narration:
            'In the J-shaped stomach, powerful rugae muscular walls churn food. Parietal cells secrete concentrated hydrochloric acid (HCl), denaturing proteins and activating pepsinogen into active pepsin protease.',
          visualScene: 'digestive_system',
          actionPrompt: 'Notice the acidic churning waves in the stomach breaking proteins into peptide chains!',
          highlightLabels: ['Gastric Hydrochloric Acid (HCl)', 'Pepsin Protease', 'Nutrient Chyme'],
          keyPrinciple: 'Enzyme Optimum pH: Pepsin operates optimally at highly acidic pH ~1.5 - 2.0'
        },
        {
          id: 'dig_4',
          stageNumber: 4,
          title: 'Stage 4: Duodenal Neutralization & Small Intestinal Villi Absorption 🩸',
          subtitle: 'Bile emulsifies lipids while microvilli absorb glucose and amino acids',
          narration:
            'Chyme enters the duodenum where pancreatic bicarbonate neutralizes acid, and bile emulsifies fats. Millions of microscopic villi and microvilli lining the small intestine absorb glucose, amino acids, and fatty acids directly into the bloodstream.',
          visualScene: 'digestive_system',
          actionPrompt: 'See the microvilli absorbing radiant glucose and nutrient particles into the bloodstream!',
          highlightLabels: ['Intestinal Mucosal Villi', 'Capillary Blood Network', 'Brush-Border Absorption'],
          keyPrinciple: 'Microvilli fold surface area to over 250 square meters—roughly the size of a tennis court!'
        }
      ],
      interactiveKnobs: [
        {
          id: 'peristalsis_speed',
          label: 'Peristalsis Transit Velocity',
          type: 'slider',
          min: 1,
          max: 5,
          defaultValue: 2,
          impactDescription: 'Controls rate of smooth muscle contraction waves along the digestive tract.'
        },
        {
          id: 'acid_intensity',
          label: 'Gastric Acid Concentration',
          type: 'slider',
          min: 10,
          max: 100,
          defaultValue: 80,
          unit: '%',
          impactDescription: 'Alters enzymatic churning intensity and pH level in the stomach chamber.'
        }
      ],
      comprehensionQuiz: [
        {
          question: 'What is the name of the rhythmic involuntary muscle contractions that push food down the esophagus?',
          options: ['Peristalsis 🌀', 'Osmosis', 'Diffusion', 'Mastication'],
          correctIndex: 0,
          explanation: 'Peristalsis is the series of synchronized wave-like smooth muscle contractions that propels food through the gastrointestinal tract.'
        },
        {
          question: 'Where does the vast majority of chemical nutrient absorption into the bloodstream take place?',
          options: [
            'Small Intestine (via Villi and Microvilli) 🩸',
            'Large Intestine only',
            'Teeth',
            'Esophagus'
          ],
          correctIndex: 0,
          explanation: 'Over 90% of nutrient absorption occurs in the small intestine, whose lining is carpeted with millions of tiny finger-like villi maximizing contact with digested nutrients.'
        }
      ],
      funFact: 'The internal surface area of your small intestine is increased thousands of times by millions of microscopic villi—giving your gut enough surface area to cover an entire doubles tennis court!'
    };
  }

  // 12. Default Fallback: Generate an Enhanced Dynamic Physics/Science Simulation
  return {
    id: `custom_${Date.now()}`,
    question: question.trim(),
    conceptTitle: `Scientific Analysis: ${question.trim()} 🧪`,
    emoji: '🧪',
    category: 'STEM & Conceptual Science Lab',
    difficulty,
    summary:
      difficulty === 'beginner'
        ? `Let's explore how "${question.trim()}" works step-by-step through interactive visual stages and physical principles!`
        : difficulty === 'advanced'
        ? `Pedagogical analysis of "${question.trim()}": examining thermodynamic equilibrium, governing force interactions, and empirical conservation laws.`
        : `Interactive simulation exploring the governing physical mechanisms, state transformations, and balancing forces behind: "${question.trim()}".`,
    realWorldAnalogy:
      'Like gears meshing in a precision watch, each step in this system triggers the next transformation smoothly and predictably.',
    stages: [
      {
        id: 'cust_1',
        stageNumber: 1,
        title: 'Stage 1: System Baseline & Initial State 🏁',
        subtitle: 'Establishing the initial physical conditions and variables',
        narration: `At the beginning of "${question.trim()}", the system rests in equilibrium before external energy or forces are applied. Key boundary conditions dictate the starting state.`,
        visualScene: 'custom_dynamic',
        actionPrompt: 'Observe the initial state indicator and explore the reaction pipeline!',
        highlightLabels: ['Initial Boundary State', 'Input Energy Source', 'Physical Baseline'],
        keyPrinciple: 'Conservation of Energy: Total initial energy remains invariant'
      },
      {
        id: 'cust_2',
        stageNumber: 2,
        title: 'Stage 2: Primary Force Interaction & State Change ⚡',
        subtitle: 'Energy flows into the system, driving physical transformation',
        narration: `As active inputs enter the apparatus, molecular, mechanical, or chemical interactions accelerate. Dynamic transfer gradients drive rapid state changes.`,
        visualScene: 'custom_dynamic',
        actionPrompt: 'Watch the animated particle flow along the central pipeline!',
        highlightLabels: ['Active Driving Force', 'Kinetic Flux Transfer', 'Transformation Zone'],
        keyPrinciple: 'Dynamic Equilibrium: Rate of forward reaction responds to potential gradients'
      },
      {
        id: 'cust_3',
        stageNumber: 3,
        title: 'Stage 3: Feedback Loops & Balancing Counter-Forces ⚖️',
        subtitle: 'Opposing resistance forces stabilize the dynamic cycle',
        narration: `Every physical system encounters restoring forces or dissipation. Balancing mechanisms prevent runaway instability and settle the reaction into a productive steady-state.`,
        visualScene: 'custom_dynamic',
        actionPrompt: 'Notice the oscillating feedback loop maintaining system balance!',
        highlightLabels: ['Negative Feedback Regulator', 'Dissipation Sink', 'Steady-State Balance'],
        keyPrinciple: 'Le Chatelier’s Principle: Systems naturally counteract external perturbations'
      },
      {
        id: 'cust_4',
        stageNumber: 4,
        title: 'Stage 4: Final Equilibrium & Real-World Output 🎯',
        subtitle: 'The system achieves its solved pedagogical outcome',
        narration: `With all stages completed, the phenomenon of "${question.trim()}" delivers its final observable outputs, proving the core physical or mathematical law.`,
        visualScene: 'custom_dynamic',
        actionPrompt: 'Inspect the final stage node and test comprehension with the mini-quiz below!',
        highlightLabels: ['Final Observable Output', 'Empirical Verification', 'System Efficiency'],
        keyPrinciple: 'Governing Law: Physical conservation laws hold true across all transformations'
      }
    ],
    interactiveKnobs: [
      {
        id: 'energy_intensity',
        label: 'Energy Intensity',
        type: 'slider',
        min: 10,
        max: 100,
        defaultValue: 65,
        unit: '%',
        impactDescription: 'Controls input energy and reaction velocity across all pipeline stages.'
      },
      {
        id: 'system_equilibrium',
        label: 'Stabilizer Balance',
        type: 'toggle',
        defaultValue: true,
        impactDescription: 'Toggles active feedback dampening to stabilize steady-state flow.'
      }
    ],
    comprehensionQuiz: [
      {
        question: `What is the primary governing principle that explains: "${question.trim()}"?`,
        options: [
          'Energy and mass are conserved throughout all stages of transformation',
          'Spontaneous energy is created out of nothing',
          'The system operates without any physical laws',
          'Friction turns completely negative'
        ],
        correctIndex: 0,
        explanation: 'The fundamental law of conservation of energy states that energy cannot be created or destroyed, only transformed from one state into another!'
      },
      {
        question: 'What happens when you adjust the interactive variables in this simulation?',
        options: [
          'The simulation pauses forever',
          'The system dynamically recalculates force vectors and particle flow rates',
          'The screen turns completely blank',
          'The browser resets'
        ],
        correctIndex: 1,
        explanation: 'Interactive sandboxes use real-time kinematic calculations to demonstrate how changing variables alters the physical outcome.'
      }
    ],
    funFact: 'Scientific simulations like this allow researchers to test extreme conditions—from the cores of exploding stars to microscopic quantum circuits—safely on a computer screen!'
  };
}
