import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Smile,
  X,
  RefreshCw,
  Copy,
  Check,
  Languages,
  Laugh,
  Volume2,
  Dices,
  Flame
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AppLanguage, StudyJoke } from "../types";
import { playLaughChime } from "../utils/audio";

// Extensive initial collection of study jokes across topics and languages
const EXTENSIVE_DEFAULT_JOKES: Record<AppLanguage, StudyJoke[]> = {
  en: [
    {
      setup: "Why can't you trust atoms?",
      punchline: "Because they make up literally everything! ⚛️",
      topicRef: "Chemistry",
    },
    {
      setup: "Why was the math book always crying?",
      punchline: "Because it had too many problems of its own! 📐",
      topicRef: "Mathematics",
    },
    {
      setup: "What did the biologist wear to impress their date?",
      punchline: "Designer genes! 🧬",
      topicRef: "Genetics",
    },
    {
      setup: "Why did the scarecrow win an academic award?",
      punchline: "Because he was outstanding in his field! 🌾🎓",
      topicRef: "General Study",
    },
    {
      setup: "What is an English teacher's favorite kind of cereal?",
      punchline: "Synonym buns! 🍞",
      topicRef: "Language Arts",
    },
    {
      setup: "Why did the cell go to therapy?",
      punchline: "Because it had too many unresolved division issues! 🧫",
      topicRef: "Cell Biology",
    },
    {
      setup: "How do astronomers organize a party?",
      punchline: "They planet! 🪐",
      topicRef: "Astronomy",
    },
    {
      setup: "Why did the computer keep freezing during the exam?",
      punchline: "Because it left its Windows wide open! 💻❄️",
      topicRef: "Computer Science",
    },
    {
      setup: "What did the thermometer say to the graduated cylinder?",
      punchline: "You may have graduated, but I have more degrees! 🌡️🎓",
      topicRef: "Physics Lab",
    },
    {
      setup: "Why are parallel lines so tragic?",
      punchline: "Because they have so much in common, but will never meet! 💔📏",
      topicRef: "Geometry",
    },
    {
      setup: "What did the proton say to the electron who was feeling down?",
      punchline: "Stay positive, bro! ➕⚡",
      topicRef: "Physics",
    },
    {
      setup: "Why did the historian take a nap?",
      punchline: "Because they needed some time to pass! ⏳🏛️",
      topicRef: "History",
    }
  ],
  hi: [
    {
      setup: "बायोलॉजी के छात्र ने परीक्षा में क्या लिखा?",
      punchline: "माइटोकॉन्ड्रिया कोशिका का पावरहाउस है, पर मेरा दिमाग डिस्चार्ज हो चुका है! ⚡",
      topicRef: "बायोलॉजी",
    },
    {
      setup: "इतिहास के अध्यापक ने पूछा - पानीपत का युद्ध कब हुआ?",
      punchline: "छात्र बोला: जब दोनों सेनाओं के बीच शांति वार्ता फेल हो गई! 😅",
      topicRef: "इतिहास",
    },
    {
      setup: "कंप्यूटर साइंस का छात्र कैफे क्यों गया?",
      punchline: "क्योंकि उसका कुकीज और कैश दोनों खाली हो गए थे! 🍪",
      topicRef: "कंप्यूटर",
    },
    {
      setup: "गणित की पुस्तक इतनी भारी क्यों होती है?",
      punchline: "क्योंकि उसमें समस्याओं का अंबार लगा रहता है! 📐",
      topicRef: "गणित",
    },
    {
      setup: "भौतिकी के छात्र ने गुरुत्वाकर्षण के बारे में क्या कहा?",
      punchline: "जब भी मेरी किताब नीचे गिरती है, मुझे न्यूटन पर बहुत प्यार आता है! 🍎",
      topicRef: "भौतिकी",
    }
  ],
  sa: [
    {
      setup: "छात्रः गुरुम् अपृच्छत् - विद्यालये किमर्थम् आगन्तव्यम्?",
      punchline: "गुरुः अवदत् - गृहम् अधिकं रमणीयं भासत इति ज्ञातुम्! 😄",
      topicRef: "संस्कृतम्",
    },
    {
      setup: "सन्धिपरीक्षायां छात्रस्य चिन्तनम्:",
      punchline: "आलस्यम् + परीक्षा = पुनरभ्यासः! अतः अध्ययनं कुरु! 📚",
      topicRef: "व्याकरणम्",
    },
    {
      setup: "विद्वान् सर्वत्र पूज्यते इति कुतः?",
      punchline: "यतः विदुषः हास्येनापि सर्वे आनन्दिताः भवन्ति! ✨",
      topicRef: "सुभाषितम्",
    }
  ]
};

interface JokeBreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicTitle: string;
  contextQuestion?: string;
  defaultLanguage?: AppLanguage;
}

export const JokeBreakModal: React.FC<JokeBreakModalProps> = ({
  isOpen,
  onClose,
  topicTitle,
  contextQuestion,
  defaultLanguage = "en",
}) => {
  const [language, setLanguage] = useState<AppLanguage>(defaultLanguage);
  const [jokes, setJokes] = useState<StudyJoke[]>(() => EXTENSIVE_DEFAULT_JOKES[defaultLanguage] || []);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [seenSetups, setSeenSetups] = useState<Set<string>>(new Set());
  const [totalJokesSeen, setTotalJokesSeen] = useState<number>(1);
  const [showPunchline, setShowPunchline] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (defaultLanguage) {
      setLanguage(defaultLanguage);
    }
  }, [defaultLanguage]);

  // When opening or switching language, initialize pool
  useEffect(() => {
    if (isOpen) {
      const initialPool = [...(EXTENSIVE_DEFAULT_JOKES[language] || EXTENSIVE_DEFAULT_JOKES.en)];
      setJokes(initialPool);
      setCurrentIndex(0);
      setTotalJokesSeen(1);
      // Fetch fresh AI jokes right away to replenish and stay ahead
      fetchMoreAIJokes(language, topicTitle);
    }
  }, [isOpen, language, topicTitle]);

  const fetchMoreAIJokes = async (targetLang: AppLanguage, currentTopic: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/joke-break", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: currentTopic || topicTitle,
          language: targetLang,
          context: contextQuestion,
          seenCount: totalJokesSeen,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.jokes && data.jokes.length > 0) {
          setJokes((prev) => {
            const existingSet = new Set(prev.map((j) => j.setup));
            const fresh = (data.jokes as StudyJoke[]).filter((j) => !existingSet.has(j.setup));
            return [...prev, ...fresh];
          });
        }
      }
    } catch (e) {
      console.error("Failed to fetch fresh jokes:", e);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentJoke = jokes[currentIndex] || {
    setup:
      language === "hi"
        ? "बायोलॉजी और दिमाग का क्या संबंध है?"
        : language === "sa"
        ? "विद्याभ्यासे हास्यस्य किं स्थानम्?"
        : "Why do we take quick joke breaks while studying?",
    punchline:
      language === "hi"
        ? "जब तक थोड़ा हँसोगे नहीं, तब तक न्यूरॉन्स चार्ज कैसे होंगे! ⚡"
        : language === "sa"
        ? "प्रसन्नचित्तस्य बुद्धिः शीघ्रं प्रसरति! (A joyful mind learns twice as fast!) 😄"
        : "Because a laughing brain retains 40% more concepts—science says smile! 🧠✨",
    topicRef: topicTitle,
  };

  const handleNextJoke = () => {
    playLaughChime();
    setTotalJokesSeen((prev) => prev + 1);

    // Track setup as seen
    if (currentJoke) {
      setSeenSetups((prev) => new Set([...prev, currentJoke.setup]));
    }

    if (currentIndex < jokes.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setShowPunchline(true);
      // If we are nearing the end of current pool, fetch even more!
      if (currentIndex >= jokes.length - 3) {
        fetchMoreAIJokes(language, topicTitle);
      }
    } else {
      // Reached the end of default & fetched jokes, immediately fetch fresh AI jokes!
      fetchMoreAIJokes(language, topicTitle);
    }
  };

  const handleSurpriseJoke = () => {
    const surpriseTopics = [
      "Quantum Mechanics",
      "Organic Chemistry",
      "Calculus Integrals",
      "World History",
      "Computer Bugs",
      "Microeconomics",
      "Neuroscience",
    ];
    const randomTopic = surpriseTopics[Math.floor(Math.random() * surpriseTopics.length)];
    fetchMoreAIJokes(language, randomTopic);
    handleNextJoke();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `${currentJoke.setup}\n${currentJoke.punchline}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div
      id="joke-break-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl border border-amber-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-amber-100 flex items-center justify-between gap-4 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-yellow-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Smile className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  {language === "hi"
                    ? "पढ़ाई में हँसी का ब्रेक"
                    : language === "sa"
                    ? "अध्ययन-विनोद-विश्रामः"
                    : "Endless Study Chuckle"}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-900 border border-amber-300">
                  Never Runs Out
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {language === "hi"
                  ? "चुटकुले कभी खत्म नहीं होंगे - हमेशा नए हास्य एवं व्यंग्य"
                  : language === "sa"
                  ? "अनन्ताः विनोदाः - नित्यं नवीनाः पाठाभ्यासहास्याः"
                  : "Continuous smart jokes that keep rotating after default ones!"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Language Switcher & Joke Counter */}
          <div className="flex items-center justify-between gap-2 p-2 bg-amber-50/60 rounded-xl border border-amber-200/60 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <Flame className="w-3.5 h-3.5 text-amber-600" />
              <span>Joke #{totalJokesSeen} seen</span>
            </div>
            <div className="flex items-center gap-1">
              {(["en", "hi", "sa"] as AppLanguage[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    setLanguage(lang);
                    setJokes(EXTENSIVE_DEFAULT_JOKES[lang] || EXTENSIVE_DEFAULT_JOKES.en);
                    setCurrentIndex(0);
                    fetchMoreAIJokes(lang, topicTitle);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    language === lang
                      ? "bg-white text-amber-900 shadow-2xs border border-amber-200"
                      : "text-amber-700 hover:text-amber-950"
                  }`}
                >
                  {lang === "en" ? "EN" : lang === "hi" ? "हिन्दी" : "संस्कृतम्"}
                </button>
              ))}
            </div>
          </div>

          {/* Joke Card */}
          <div className="relative p-6 rounded-2xl bg-gradient-to-br from-amber-50/90 via-white to-yellow-50/60 border border-amber-200 shadow-sm min-h-[170px] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                <Laugh className="w-3 h-3 text-amber-600" />
                <span>{currentJoke.topicRef || topicTitle}</span>
              </div>

              <div className="text-base sm:text-lg font-bold text-slate-800 leading-relaxed">
                "{currentJoke.setup}"
              </div>

              {showPunchline && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-300 text-amber-950 text-sm font-bold leading-relaxed"
                >
                  👉 {currentJoke.punchline}
                </motion.div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 mt-3 border-t border-amber-100 text-xs text-slate-400">
              <span className="font-medium text-slate-500">
                Pool: {currentIndex + 1} of {jokes.length} jokes loaded
              </span>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 font-medium transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <button
              onClick={handleNextJoke}
              disabled={isLoading}
              className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-md shadow-amber-200 transition-all active:scale-[0.98] cursor-pointer"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
              <span>
                {language === "hi"
                  ? "अगला मजेदार चुटकुला 😄"
                  : language === "sa"
                  ? "अन्यो विनोदः 😄"
                  : "Next Witty Joke 😄"}
              </span>
            </button>

            <button
              onClick={handleSurpriseJoke}
              disabled={isLoading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 py-3 px-3.5 rounded-xl text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 transition-colors cursor-pointer"
              title="Surprise me with a joke on another topic"
            >
              <Dices className="w-3.5 h-3.5 text-amber-700" />
              <span>Surprise Me 🎲</span>
            </button>

            <button
              onClick={onClose}
              className="w-full sm:w-auto py-3 px-4 rounded-xl text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Back to Study 📚
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
