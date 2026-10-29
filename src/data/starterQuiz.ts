import { GeneratedQuiz } from "../types";

export const STARTER_QUIZ: GeneratedQuiz = {
  id: "quiz_starter_weather",
  title: "Chapter: Weather, Atmosphere & Climate Systems Practice Exam",
  summary: "Comprehensive diagnostic assessment evaluating Atmospheric Pressure, Cloud Classification, Wind Dynamics, Fronts, and Barometric Forecasting.",
  topicsCovered: ["Atmospheric Pressure", "Cloud Formation & Precipitation", "Coriolis Effect & Winds", "Warm & Cold Fronts", "Weather Instruments (Barometer)"],
  documentName: "Chapter_Weather_Atmospheric_Dynamics.pdf",
  subjectName: "Weather",
  createdAt: Date.now() - 3600000,
  questions: [
    {
      id: "q1",
      type: "mcq",
      question: "Which layer of Earth's atmosphere is closest to the ground, containing approximately 75% of total air mass and almost all clouds and active weather?",
      questionSummary: "Identifies the atmospheric layer where all day-to-day weather events and storm systems occur.",
      conceptTested: "Atmospheric Stratification & The Troposphere",
      whyCorrect: "The troposphere directly contacts Earth's surface and holds 75% of all air mass and 99% of atmospheric water vapor, driving all thermal convection, clouds, and storms.",
      options: [
        "Troposphere",
        "Stratosphere",
        "Mesosphere",
        "Thermosphere"
      ],
      correctAnswer: "Troposphere",
      explanation: "The troposphere extends from Earth's surface up to about 10–12 km. Because it contains 99% of atmospheric water vapor and experiences continuous thermal convection from solar-heated ground, all clouds, rain, snow, and storms occur here.",
      sourceReference: "Section 1: Atmospheric Layers & The Troposphere",
      difficulty: "easy",
      funFactOrJoke: "Why is the troposphere so dramatic? Because it carries all the world's emotional weather—from sunny smiles to thunderstorm tantrums! 🌤️⚡"
    },
    {
      id: "q2",
      type: "true_false",
      question: "In meteorology, a low-pressure atmospheric system is typically characterized by rising warm air, cloud formation, and precipitation.",
      questionSummary: "Evaluates the fundamental physical relationship between low pressure, convective uplift, and stormy weather.",
      conceptTested: "Low-Pressure Thermodynamics & Convective Uplift",
      whyCorrect: "Low surface pressure forces warm moist air to converge and ascend; as it ascends and decompresses, it cools past its dew point to form rain clouds.",
      options: ["True", "False"],
      correctAnswer: "True",
      explanation: "True. In low-pressure systems (depressions or cyclones), surface winds converge and warm, moist air rises. As it rises, it cools to its dew point, condenses into clouds, and frequently triggers rainfall or stormy weather.",
      sourceReference: "Section 2: High vs Low Pressure Meteorology",
      difficulty: "easy",
      funFactOrJoke: "Low pressure is like a party where everyone rushes to the dance floor—warm air rises up and things get stormy! 🌧️"
    },
    {
      id: "q3",
      type: "mcq",
      question: "What precision instrument is used by meteorologists to measure atmospheric pressure, where a rapid downward reading signals an approaching storm?",
      questionSummary: "Tests knowledge of standard meteorological instruments and barometric pressure drops.",
      conceptTested: "Meteorological Pressure Instrumentation (Barometers)",
      whyCorrect: "Barometers gauge the weight of the air column overhead; a steep decline indicates an incoming low-pressure storm depression.",
      options: [
        "Barometer",
        "Anemometer",
        "Hygrometer",
        "Seismograph"
      ],
      correctAnswer: "Barometer",
      explanation: "A barometer measures atmospheric pressure in millibars (hPa) or inches of mercury. A sudden drop in barometric pressure signals that a low-pressure disturbance or storm front is moving in.",
      sourceReference: "Section 3: Meteorological Measurement Instruments",
      difficulty: "medium",
      funFactOrJoke: "A barometer never lies—when the pressure drops, it's basically saying: 'Grab your umbrella, human!' ☔"
    },
    {
      id: "q4",
      type: "true_false",
      question: "A cold front moves more slowly than a warm front, gently gliding over existing air without causing sudden changes in temperature.",
      questionSummary: "Examines the speed and steep displacement mechanics of advancing cold air wedges versus warm fronts.",
      conceptTested: "Frontal Boundaries & Air Mass Density Dynamics",
      whyCorrect: "Dense cold air forcefully undercuts warm air at higher velocity, creating a steep frontal slope that rapidly unleashes thunderstorms rather than slow gliding.",
      options: ["True", "False"],
      correctAnswer: "False",
      explanation: "False. Cold fronts move significantly faster and are steeper than warm fronts. The dense cold air wedges aggressively under the lighter warm air, violently forcing it upward and triggering rapid temperature drops and sudden thunderstorms.",
      sourceReference: "Section 4: Frontal Boundaries & Storm Dynamics",
      difficulty: "medium",
      funFactOrJoke: "Cold fronts don't do 'gentle'—they crash the party like an uninvited polar bear, bringing instant chills! ❄️🐻"
    },
    {
      id: "q5",
      type: "mcq",
      question: "What planetary phenomenon deflects moving winds and weather systems to the right in the Northern Hemisphere and to the left in the Southern Hemisphere?",
      questionSummary: "Explores the rotational physics of Earth causing directional wind deflection across hemispheres.",
      conceptTested: "Earth's Rotational Physics & The Coriolis Effect",
      whyCorrect: "Because Earth rotates eastwards beneath moving fluids, differing latitudinal velocities cause an apparent deflection to the right in the North and left in the South.",
      options: [
        "The Coriolis Effect",
        "The Greenhouse Effect",
        "Solar Wind Magnetic Reconnection",
        "Gravitational Tidal Locking"
      ],
      correctAnswer: "The Coriolis Effect",
      explanation: "Due to Earth's eastward rotation, points on the equator travel faster than points at higher latitudes. This apparent force deflects large-scale winds and ocean currents to the right in the Northern Hemisphere and to the left in the Southern Hemisphere.",
      sourceReference: "Section 5: Global Circulation & The Coriolis Effect",
      difficulty: "hard",
      funFactOrJoke: "The Coriolis effect is why hurricanes spin counter-clockwise up north and clockwise down under—Earth is the ultimate spinning DJ! 🌍🌀"
    },
    {
      id: "q6",
      type: "typed",
      question: "What term describes the fast-flowing, narrow meandering air currents in the upper atmosphere that steer major global weather systems?",
      questionSummary: "Tests active recall of high-altitude jet streams that steer mid-latitude storms and weather.",
      conceptTested: "Upper Tropospheric Jet Streams & Global Weather Steering",
      whyCorrect: "Jet streams are narrow bands of strong winds in the upper troposphere generated by sharp horizontal temperature gradients between polar and tropical air.",
      options: [],
      correctAnswer: "Jet Stream",
      acceptedAnswers: ["jet stream", "jetstream", "the jet stream", "polar jet stream"],
      explanation: "Jet streams are ribbons of exceptionally fast winds (up to 400 km/h) located near the tropopause. They form at boundaries between polar and tropical air masses and steer weather systems around the globe.",
      sourceReference: "Section 6: Upper Atmospheric Wind Currents",
      difficulty: "easy",
      hint: "Starts with the word 'Jet' (like a supersonic airplane flying in high winds)!",
      funFactOrJoke: "Commercial airplanes intentionally hitch a ride on the jet stream to fly faster and save fuel—nature's free highway in the clouds! ✈️💨"
    }
  ]
};
