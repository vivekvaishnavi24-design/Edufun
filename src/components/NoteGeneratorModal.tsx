import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  BookOpen,
  X,
  Send,
  Loader2,
  Copy,
  Check,
  Printer,
  Volume2,
  VolumeX,
  Bookmark,
  Share2,
  Lightbulb,
  ArrowRight,
  Layers,
  HelpCircle,
  FileText,
  RotateCw,
  Search,
  CheckCircle2,
  Zap,
  Highlighter,
  Download,
  Trash2,
  Library,
  Flame,
  Laugh
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  AppLanguage,
  GeneratedStudyNotes,
  GeneratedQuiz,
  InteractiveNoteConcept
} from "../types";
import { fireBottomLeftAndRightConfetti } from "../utils/quizUtils";
import { playCardFlipSound } from "../utils/audio";

interface NoteGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTopic?: string;
  defaultLanguage?: AppLanguage;
  onLaunchQuizFromNotes?: (topic: string, subtopic?: string) => void;
}

export const NoteGeneratorModal: React.FC<NoteGeneratorModalProps> = ({
  isOpen,
  onClose,
  defaultTopic = "",
  defaultLanguage = "en",
  onLaunchQuizFromNotes
}) => {
  // Input fields
  const [topic, setTopic] = useState<string>(defaultTopic);
  const [subtopic, setSubtopic] = useState<string>("");
  const [style, setStyle] = useState<string>("active_recall");
  const [language, setLanguage] = useState<AppLanguage>(defaultLanguage);

  // Note generation state
  const [notes, setNotes] = useState<GeneratedStudyNotes | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<
    "flashcards" | "cornell" | "mindmap" | "cheatsheet" | "quizcheck"
  >("flashcards");

  // Interactive controls
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});
  const [masteredCards, setMasteredCards] = useState<Record<number, boolean>>({});
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [highlightMode, setHighlightMode] = useState<boolean>(false);

  // Quick check state
  const [quickCheckAnswers, setQuickCheckAnswers] = useState<Record<number, string>>({});
  const [quickCheckRevealed, setQuickCheckRevealed] = useState<Record<number, boolean>>({});
  const [isRefreshingRecall, setIsRefreshingRecall] = useState<boolean>(false);
  const [recallFeedback, setRecallFeedback] = useState<string>("");

  // Saved notes library
  const [savedNotesList, setSavedNotesList] = useState<GeneratedStudyNotes[]>([]);
  const [showSavedList, setShowSavedList] = useState<boolean>(false);

  useEffect(() => {
    if (defaultTopic) {
      setTopic(defaultTopic);
    }
  }, [defaultTopic]);

  useEffect(() => {
    if (defaultLanguage) {
      setLanguage(defaultLanguage);
    }
  }, [defaultLanguage]);

  // Load saved notes from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("testgen_saved_notes");
      if (stored) {
        setSavedNotesList(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!isOpen) return null;

  const handleGenerate = async (targetTopic?: string, targetSubtopic?: string) => {
    const finalTopic = (targetTopic || topic).trim();
    const finalSubtopic = (targetSubtopic !== undefined ? targetSubtopic : subtopic).trim();

    if (!finalTopic) return;

    setIsLoading(true);
    // Reset view states
    setFlippedCards({});
    setMasteredCards({});
    setSelectedNodeId(null);
    setQuickCheckAnswers({});
    setQuickCheckRevealed({});
    setRecallFeedback("");
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    try {
      const res = await fetch("/api/generate-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: finalTopic,
          subtopic: finalSubtopic,
          style,
          language
        })
      });

      if (res.ok) {
        const data = await res.json();
        setNotes(data.notes);
        setActiveTab("flashcards");
        fireBottomLeftAndRightConfetti();
      } else {
        throw new Error("Failed to generate notes");
      }
    } catch (err) {
      console.error("Error generating notes, building simple fallback:", err);
      // Generate immediate structured study notes in simple words
      const fallback: GeneratedStudyNotes = {
        id: `note_${Date.now()}`,
        topic: finalTopic,
        subtopic: finalSubtopic || undefined,
        title: `${finalTopic} Study Notes`,
        readingTimeMinutes: 3,
        executiveSummary: `Here is a simple, clear guide to ${finalTopic}${finalSubtopic ? ` (${finalSubtopic})` : ""}. Review the flashcards, key points, and test your memory below!`,
        style,
        language,
        createdAt: Date.now(),
        coreConcepts: [
          {
            term: "Main Idea",
            definition: `The most important rule behind ${finalTopic}. Everything in this topic starts here.`,
            analogy: "Like the engine in a car—without it, nothing else moves!",
            mnemonic: "B-A-S-E: Start with the basics first.",
            importance: "You will see this on almost every quiz."
          },
          {
            term: "How It Works",
            definition: `The simple step-by-step process of how ${finalTopic} happens from start to finish.`,
            analogy: "Like following a recipe: add ingredients in order to get the right result.",
            mnemonic: "1-2-3: Step one leads to step two, then step three.",
            importance: "Helps you answer 'explain how' questions easily."
          },
          {
            term: "Key Example",
            definition: `A real-world example showing ${finalTopic} in everyday life.`,
            analogy: "Like seeing gravity when an apple drops from a tree.",
            mnemonic: "R-E-A-L: Look for real world signs.",
            importance: "Great for remembering concepts during a test."
          },
          {
            term: "Common Mistake",
            definition: "The number one error students make when answering questions on this topic.",
            analogy: "Like putting the cart before the horse: always check the cause before the effect!",
            mnemonic: "S-T-O-P: Read the question twice before picking an answer.",
            importance: "Saves you from easy mistakes on exams."
          }
        ],
        cornellSections: [
          {
            cue: `What is the main point of ${finalTopic}?`,
            notes: [
              `It helps explain how ${finalTopic} works in nature and science.`,
              "Each step connects directly to the next step.",
              "Knowing this makes tough quiz questions easy to solve."
            ],
            highlight: "Remember: always look at what goes in and what comes out."
          },
          {
            cue: "What are the key steps?",
            notes: [
              "Step 1: The starting condition or input.",
              "Step 2: The reaction or main change.",
              "Step 3: The final result or output."
            ],
            highlight: "Tip: Don't mix up step 1 and step 3!"
          }
        ],
        conceptGraph: [
          {
            id: "node_1",
            label: "Starting Point",
            category: "Basics",
            summary: "Where the process begins.",
            connectedTo: ["node_2"]
          },
          {
            id: "node_2",
            label: finalTopic,
            category: "Main Idea",
            summary: "The main thing happening.",
            connectedTo: ["node_1", "node_3"]
          },
          {
            id: "node_3",
            label: finalSubtopic || "Result",
            category: "Result",
            summary: "What happens at the end.",
            connectedTo: ["node_2"]
          }
        ],
        cheatSheetRules: [
          {
            label: "Rule 1: Check the Basics",
            detail: "Make sure you understand the main definition before solving problems."
          },
          {
            label: "Rule 2: Cause and Effect",
            detail: "Always ask yourself: what caused this to happen, and what happened next?"
          },
          {
            label: "Rule 3: Watch Out for Traps",
            detail: "Read tricky questions slowly. Look out for words like 'always' or 'never'."
          }
        ],
        quickChecks: [
          {
            question: `In simple words, what is the main goal of ${finalTopic}?`,
            answer: "To show how starting parts turn into the final result step by step.",
            hint: "Think about why this topic matters!"
          },
          {
            question: `What should you always check first in ${finalTopic}?`,
            answer: "Check the starting conditions and what changes during the process.",
            hint: "Always begin at step one!"
          }
        ]
      };
      setNotes(fallback);
      setActiveTab("flashcards");
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh Instant Recall function
  const handleRefreshInstantRecall = async () => {
    if (!notes) return;
    setIsRefreshingRecall(true);
    setQuickCheckAnswers({});
    setQuickCheckRevealed({});
    setActiveTab("quizcheck");

    try {
      const existingQs = notes.quickChecks?.map((q) => q.question) || [];
      const res = await fetch("/api/refresh-instant-recall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: notes.topic,
          subtopic: notes.subtopic,
          language,
          existingQuestions: existingQs,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.quickChecks) && data.quickChecks.length > 0) {
          setNotes((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              quickChecks: data.quickChecks,
            };
          });
          fireBottomLeftAndRightConfetti();
          setRecallFeedback("New quick recall questions ready! Test your memory.");
          setTimeout(() => setRecallFeedback(""), 4000);
          return;
        }
      }
      throw new Error("Could not fetch new recall questions");
    } catch {
      // Local dynamic fallback from core concepts using simple words
      if (notes.coreConcepts && notes.coreConcepts.length > 0) {
        const freshFromConcepts = notes.coreConcepts.map((c, i) => ({
          question: `In simple terms, what is "${c.term}"?`,
          answer: c.definition,
          hint: c.mnemonic || c.analogy || "Remember the main idea!",
        }));
        setNotes((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            quickChecks: freshFromConcepts.slice(0, 4),
          };
        });
        fireBottomLeftAndRightConfetti();
        setRecallFeedback("New quick recall questions ready! Test your memory.");
        setTimeout(() => setRecallFeedback(""), 4000);
      }
    } finally {
      setIsRefreshingRecall(false);
    }
  };

  const handleToggleFlip = (index: number) => {
    playCardFlipSound();
    setFlippedCards((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleToggleMastered = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setMasteredCards((prev) => {
      const nextVal = !prev[index];
      if (nextVal) {
        fireBottomLeftAndRightConfetti();
      }
      return {
        ...prev,
        [index]: nextVal
      };
    });
  };

  const handleCheckQuickAnswer = (index: number, isCorrect: boolean) => {
    setQuickCheckRevealed((prev) => ({ ...prev, [index]: true }));
    if (isCorrect) {
      fireBottomLeftAndRightConfetti();
    }
  };

  // Text-to-Speech Read Aloud
  const handleSpeechReadout = () => {
    if (!notes || !("speechSynthesis" in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const textToRead = `${notes.title}. ${notes.executiveSummary}. Key points: ${notes.coreConcepts
      .map((c) => `${c.term}: ${c.definition}. Example: ${c.analogy}`)
      .join(". ")}`;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // Copy Markdown
  const handleCopyMarkdown = () => {
    if (!notes) return;
    const md = `# ${notes.title}\n\n${notes.executiveSummary}\n\n## Key Concepts\n${notes.coreConcepts
      .map(
        (c) =>
          `### ${c.term}\n- **Definition**: ${c.definition}\n- **Simple Analogy**: ${c.analogy}\n- **Memory Hook**: ${c.mnemonic}\n- **Why It Matters**: ${c.importance}`
      )
      .join("\n\n")}\n\n## Important Notes\n${notes.cornellSections
      .map((s) => `### ${s.cue}\n${s.notes.map((n) => `- ${n}`).join("\n")}\n*Key Tip*: ${s.highlight}`)
      .join("\n\n")}\n\n## Quick Rules\n${notes.cheatSheetRules
      .map((r) => `- **${r.label}**: ${r.detail}`)
      .join("\n")}`;

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Save to localStorage library
  const handleSaveToLibrary = () => {
    if (!notes) return;
    try {
      const existing = [...savedNotesList.filter((n) => n.id !== notes.id)];
      const updated = [notes, ...existing];
      setSavedNotesList(updated);
      localStorage.setItem("testgen_saved_notes", JSON.stringify(updated));
      fireBottomLeftAndRightConfetti();
    } catch {
      // ignore
    }
  };

  const handleDeleteSavedNote = (id: string) => {
    const updated = savedNotesList.filter((n) => n.id !== id);
    setSavedNotesList(updated);
    localStorage.setItem("testgen_saved_notes", JSON.stringify(updated));
  };

  const totalConcepts = notes?.coreConcepts?.length || 0;
  const masteredCount = Object.values(masteredCards).filter(Boolean).length;

  return (
    <div
      id="note-generator-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl border border-indigo-200 shadow-2xl max-w-4xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-indigo-100 flex items-center justify-between gap-4 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 text-white shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-xs shrink-0">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold tracking-tight">
                  Study Notes
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-400 text-indigo-950 shadow-2xs">
                  Easy to Learn
                </span>
              </div>
              <p className="text-xs text-indigo-100/90 truncate">
                Cards, summaries, topic maps, and quick memory checks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSavedList((prev) => !prev)}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="View your saved notes"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Saved Notes</span>
              {savedNotesList.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-indigo-950 text-[10px] font-black">
                  {savedNotesList.length}
                </span>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Saved Notes Drawer Toggle View */}
        <AnimatePresence>
          {showSavedList && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-b border-indigo-100 bg-indigo-50/80 p-4 max-h-56 overflow-y-auto shrink-0 space-y-2"
            >
              <div className="flex items-center justify-between text-xs font-bold text-indigo-900">
                <span className="flex items-center gap-1.5">
                  <Library className="w-3.5 h-3.5 text-indigo-600" />
                  Your Saved Notes ({savedNotesList.length}):
                </span>
                <button
                  onClick={() => setShowSavedList(false)}
                  className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Close
                </button>
              </div>

              {savedNotesList.length === 0 ? (
                <p className="text-xs text-slate-500 py-2">
                  No saved notes yet. Generate notes below and tap "Save Notes" to keep them!
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                  {savedNotesList.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-2 shadow-2xs hover:border-indigo-300 transition-colors"
                    >
                      <button
                        onClick={() => {
                          setNotes(item);
                          setTopic(item.topic);
                          setSubtopic(item.subtopic || "");
                          setShowSavedList(false);
                        }}
                        className="text-left text-xs font-bold text-slate-800 hover:text-indigo-600 truncate flex-1 cursor-pointer"
                      >
                        {item.title}
                      </button>

                      <button
                        onClick={() => handleDeleteSavedNote(item.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-md cursor-pointer"
                        title="Delete saved note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Bar / Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70 shrink-0 space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleGenerate();
            }}
            className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center"
          >
            {/* Topic Input (Required) */}
            <div className="flex-1 min-w-0">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Topic <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Photosynthesis, Gravity, World War II..."
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
              />
            </div>

            {/* Subtopic Input (Optional) */}
            <div className="flex-1 min-w-0">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Subtopic <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={subtopic}
                onChange={(e) => setSubtopic(e.target.value)}
                placeholder="e.g. Light reactions, Solar system..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
              />
            </div>

            {/* Style Selector */}
            <div className="w-full sm:w-44 shrink-0">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Note Style
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 outline-none cursor-pointer"
              >
                <option value="active_recall">🧠 Key Points & Summary</option>
                <option value="feynman">🔬 Simple Analogies</option>
                <option value="cheat_sheet">⚡ Quick Cheat Sheet</option>
                <option value="mnemonics">🎯 Memory Tips</option>
              </select>
            </div>

            {/* Generate Button */}
            <div className="self-end sm:self-auto sm:pt-5">
              <button
                type="submit"
                disabled={isLoading || !topic.trim()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-200 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Writing Notes...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Generate Notes</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick topic inspiration pills */}
          {!notes && !isLoading && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-400 font-semibold shrink-0">Try:</span>
              {[
                { t: "Cellular Respiration", s: "Glycolysis" },
                { t: "Physics", s: "Gravity & Motion" },
                { t: "Calculus", s: "Derivatives" },
                { t: "Economics", s: "Supply & Demand" },
              ].map((item) => (
                <button
                  key={item.t}
                  type="button"
                  onClick={() => {
                    setTopic(item.t);
                    setSubtopic(item.s);
                    handleGenerate(item.t, item.s);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-indigo-400 hover:text-indigo-600 font-medium whitespace-nowrap text-xs transition-colors cursor-pointer shadow-2xs"
                >
                  {item.t}: {item.s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center animate-pulse">
                  <Sparkles className="w-8 h-8 text-indigo-600 animate-spin" />
                </div>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  Writing Simple Notes for "{topic}"...
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  Making flashcards, simple explanations, topic maps, and memory checks.
                </p>
              </div>
            </div>
          ) : notes ? (
            <div className="space-y-6">
              {/* Note Header & Utility Toolbar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-50/80 via-white to-violet-50/80 border border-indigo-100 shadow-2xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-100 text-indigo-800 border border-indigo-200">
                      ~{notes.readingTimeMinutes} Min Read
                    </span>
                    {notes.subtopic && (
                      <span className="text-xs font-semibold text-slate-500">
                        Subtopic: {notes.subtopic}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mt-1">
                    {notes.title}
                  </h3>
                  <p
                    className={`text-xs text-slate-600 mt-1 leading-relaxed ${
                      highlightMode ? "bg-yellow-200/80 p-1.5 rounded-lg" : ""
                    }`}
                  >
                    {notes.executiveSummary}
                  </p>
                </div>

                {/* Toolbar */}
                <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                  {/* Refresh Instant Recall Button in Toolbar */}
                  <button
                    id="toolbar-refresh-instant-recall-btn"
                    onClick={handleRefreshInstantRecall}
                    disabled={isRefreshingRecall}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    title="Refresh Instant Recall questions to test your memory"
                  >
                    <RotateCw className={`w-3.5 h-3.5 text-emerald-600 ${isRefreshingRecall ? "animate-spin" : ""}`} />
                    <span>{isRefreshingRecall ? "Refreshing..." : "Refresh Instant Recall"}</span>
                  </button>

                  <button
                    onClick={handleSpeechReadout}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSpeaking
                        ? "bg-rose-50 text-rose-700 border-rose-300 ring-2 ring-rose-200"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                    title={isSpeaking ? "Stop Voice" : "Listen Aloud"}
                  >
                    {isSpeaking ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                        <span>Stop Voice</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Listen Aloud</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setHighlightMode((prev) => !prev)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                      highlightMode
                        ? "bg-amber-100 text-amber-900 border-amber-300 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                    title="Highlight key study points"
                  >
                    <Highlighter className="w-3.5 h-3.5 text-amber-600" />
                    <span>Highlight</span>
                  </button>

                  <button
                    onClick={handleCopyMarkdown}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Copy Notes"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleSaveToLibrary}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Save these notes"
                  >
                    <Bookmark className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Save Notes</span>
                  </button>

                  {onLaunchQuizFromNotes && (
                    <button
                      onClick={() => {
                        onLaunchQuizFromNotes(notes.topic, notes.subtopic);
                        onClose();
                      }}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold text-white bg-violet-600 hover:bg-violet-700 shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
                      title="Take a practice quiz on these notes"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-300" />
                      <span>Take Quiz 📝</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Feedback toast if refreshed */}
              {recallFeedback && (
                <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{recallFeedback}</span>
                </div>
              )}

              {/* Interactive Tabs with Simple Words */}
              <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none">
                {[
                  {
                    id: "flashcards",
                    label: "Flashcards",
                    icon: "🗂️",
                    badge: `${masteredCount}/${totalConcepts} Learned`
                  },
                  { id: "cornell", label: "Key Notes & Summary", icon: "📑" },
                  { id: "mindmap", label: "Topic Map", icon: "🌐" },
                  { id: "cheatsheet", label: "Cheat Sheet", icon: "⚡" },
                  { id: "quizcheck", label: "Instant Recall", icon: "❓" }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                      activeTab === tab.id
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                          activeTab === tab.id
                            ? "bg-indigo-800 text-amber-300"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Tab 1: Flashcards */}
              {activeTab === "flashcards" && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-indigo-50/70 border border-indigo-200/70 rounded-2xl text-xs">
                    <span className="font-semibold text-indigo-950 flex items-center gap-1.5">
                      <span>🎴</span>
                      <span>Tap any card to flip it in 3D and see simple examples!</span>
                    </span>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-bold text-indigo-700">
                        Learned: {masteredCount} of {totalConcepts}
                      </span>
                      <div className="w-24 bg-indigo-200/80 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full transition-all duration-300 rounded-full"
                          style={{
                            width: `${totalConcepts > 0 ? (masteredCount / totalConcepts) * 100 : 0}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {notes.coreConcepts.map((concept, idx) => {
                      const isFlipped = Boolean(flippedCards[idx]);
                      const isMastered = Boolean(masteredCards[idx]);

                      return (
                        <div
                          key={idx}
                          className="h-[280px] [perspective:1000px] select-none"
                        >
                          <div
                            onClick={() => handleToggleFlip(idx)}
                            className={`relative w-full h-full duration-500 [transform-style:preserve-3d] cursor-pointer transition-transform rounded-3xl ${
                              isFlipped ? "[transform:rotateY(180deg)]" : ""
                            }`}
                          >
                            {/* FRONT OF CARD */}
                            <div
                              className={`absolute inset-0 w-full h-full [backface-visibility:hidden] rounded-3xl p-5 sm:p-6 border flex flex-col justify-between shadow-xs hover:shadow-md transition-all ${
                                isMastered
                                  ? "bg-gradient-to-br from-emerald-50/90 to-teal-50/70 border-emerald-300 ring-2 ring-emerald-400/40"
                                  : "bg-white border-slate-200/90 hover:border-indigo-300"
                              }`}
                            >
                              <div>
                                <div className="flex items-center justify-between gap-2 mb-3">
                                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-2xs">
                                    Card #{idx + 1}
                                  </span>

                                  <button
                                    onClick={(e) => handleToggleMastered(idx, e)}
                                    className={`px-3 py-1 rounded-full text-[10px] font-black transition-all cursor-pointer ${
                                      isMastered
                                        ? "bg-emerald-600 text-white shadow-xs"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    }`}
                                    title="Mark as learned"
                                  >
                                    {isMastered ? "✓ Learned" : "Mark Learned"}
                                  </button>
                                </div>

                                <div className="space-y-2.5 mt-2">
                                  <h4 className="text-xl font-black text-slate-900 tracking-tight leading-snug">
                                    {concept.term}
                                  </h4>
                                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                                    {concept.definition}
                                  </p>
                                </div>
                              </div>

                              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-600 font-bold">
                                <span className="text-[11px] text-slate-400 italic truncate max-w-[170px]">
                                  {concept.importance}
                                </span>
                                <div className="flex items-center gap-1.5 bg-indigo-50/80 px-2.5 py-1 rounded-lg">
                                  <span>Tap to flip 3D</span>
                                  <RotateCw className="w-3 h-3" />
                                </div>
                              </div>
                            </div>

                            {/* BACK OF CARD (Rotated 180deg) */}
                            <div
                              className="absolute inset-0 w-full h-full [transform:rotateY(180deg)] [backface-visibility:hidden] rounded-3xl p-5 sm:p-6 border border-amber-300 bg-gradient-to-br from-amber-50/95 via-orange-50/60 to-amber-100/50 flex flex-col justify-between shadow-md"
                            >
                              <div>
                                <div className="flex items-center justify-between gap-2 mb-3">
                                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-200/80 text-amber-950 border border-amber-300">
                                    Memory Key #{idx + 1}
                                  </span>
                                  <span className="text-xs font-bold text-amber-900 truncate max-w-[180px]">
                                    {concept.term}
                                  </span>
                                </div>

                                <div className="space-y-2.5 mt-1">
                                  {/* Analogy Box */}
                                  <div className="p-3 rounded-2xl bg-white/90 border border-amber-200 shadow-2xs">
                                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900 block mb-1">
                                      💡 Simple Example
                                    </span>
                                    <p className="text-xs text-slate-800 leading-relaxed font-medium">
                                      {concept.analogy}
                                    </p>
                                  </div>

                                  {/* Mnemonic Box */}
                                  <div className="p-2.5 rounded-2xl bg-indigo-50/90 border border-indigo-200 shadow-2xs">
                                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-900 block mb-0.5">
                                      🎯 Memory Tip
                                    </span>
                                    <p className="text-xs text-indigo-950 font-bold leading-relaxed">
                                      {concept.mnemonic}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="pt-2 border-t border-amber-200/70 flex items-center justify-between text-xs text-amber-900 font-bold">
                                <span className="text-[11px] text-amber-700">Remember this tip!</span>
                                <div className="flex items-center gap-1.5 bg-white/80 px-2.5 py-1 rounded-lg border border-amber-200">
                                  <span>Tap to flip back</span>
                                  <RotateCw className="w-3 h-3" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab 2: Key Notes & Summary */}
              {activeTab === "cornell" && (
                <div className="space-y-4">
                  <div className="p-3 bg-indigo-50/70 border border-indigo-200/70 rounded-xl text-xs text-indigo-950 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>
                      <strong>Questions & Notes:</strong> Key questions on the left, clear notes on the right.
                    </span>
                  </div>

                  <div className="space-y-3">
                    {notes.cornellSections.map((section, idx) => (
                      <div
                        key={idx}
                        className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs grid grid-cols-1 md:grid-cols-3"
                      >
                        {/* Cue Column */}
                        <div className="p-4 bg-slate-50/90 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                              Question #{idx + 1}
                            </span>
                            <h4 className="text-sm font-bold text-slate-900 mt-2">
                              {section.cue}
                            </h4>
                          </div>
                          <span className="text-[10px] text-slate-400 mt-3 hidden md:block">
                            Key Question
                          </span>
                        </div>

                        {/* Notes Column */}
                        <div className="p-4 md:col-span-2 space-y-2">
                          <ul className="space-y-1.5 text-xs text-slate-700">
                            {section.notes.map((note, nIdx) => (
                              <li key={nIdx} className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0 mt-1.5" />
                                <span
                                  className={
                                    highlightMode ? "bg-yellow-200/70 px-1 rounded" : ""
                                  }
                                >
                                  {note}
                                </span>
                              </li>
                            ))}
                          </ul>

                          {section.highlight && (
                            <div className="mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-semibold flex items-center gap-2">
                              <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span>{section.highlight}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Topic Map */}
              {activeTab === "mindmap" && (
                <div className="space-y-4">
                  <div className="p-3 bg-violet-50 border border-violet-200 rounded-xl text-xs text-violet-950 flex items-center justify-between gap-2 flex-wrap">
                    <span className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-violet-600 shrink-0" />
                      <span>
                        <strong>Topic Map:</strong> Tap any card to see how these ideas connect together.
                      </span>
                    </span>
                    {selectedNodeId && (
                      <button
                        onClick={() => setSelectedNodeId(null)}
                        className="text-xs text-violet-700 hover:underline font-bold cursor-pointer"
                      >
                        Reset Selection
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {notes.conceptGraph.map((node) => {
                      const isSelected = selectedNodeId === node.id;
                      const isConnected =
                        selectedNodeId &&
                        notes.conceptGraph
                          .find((n) => n.id === selectedNodeId)
                          ?.connectedTo.includes(node.id);

                      return (
                        <div
                          key={node.id}
                          onClick={() => setSelectedNodeId(node.id)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                            isSelected
                              ? "bg-violet-600 text-white border-violet-600 shadow-md scale-[1.02]"
                              : isConnected
                              ? "bg-violet-50 border-violet-400 shadow-xs"
                              : "bg-white border-slate-200 hover:border-violet-300"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-2">
                            <span
                              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                isSelected
                                  ? "bg-white/20 text-white"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {node.category}
                            </span>
                            {isConnected && (
                              <span className="text-[10px] font-bold text-violet-600 bg-violet-100 px-1.5 py-0.2 rounded">
                                Connected
                              </span>
                            )}
                          </div>

                          <h4
                            className={`text-sm font-bold ${
                              isSelected ? "text-white" : "text-slate-900"
                            }`}
                          >
                            {node.label}
                          </h4>

                          <p
                            className={`text-xs mt-1.5 leading-relaxed ${
                              isSelected ? "text-violet-100" : "text-slate-600"
                            }`}
                          >
                            {node.summary}
                          </p>

                          <div
                            className={`mt-3 pt-2 text-[10px] border-t flex items-center justify-between ${
                              isSelected ? "border-violet-500 text-violet-200" : "border-slate-100 text-slate-400"
                            }`}
                          >
                            <span>Connections: {node.connectedTo.length}</span>
                            <span>{isSelected ? "Selected" : "Tap to See"}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab 4: Cheat Sheet */}
              {activeTab === "cheatsheet" && (
                <div className="space-y-4">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      <strong>Important Rules:</strong> Key tips, formulas, and things to avoid on a quiz.
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {notes.cheatSheetRules.map((rule, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs flex items-start gap-3.5"
                      >
                        <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0">
                          #{idx + 1}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">
                            {rule.label}
                          </h4>
                          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                            {rule.detail}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 5: Instant Recall Checks */}
              {activeTab === "quizcheck" && (
                <div className="space-y-4">
                  {/* Dedicated Header with Refresh Instant Recall Button */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-emerald-950">Quick Recall Quiz</h4>
                        <p className="text-xs text-emerald-800">
                          Test what you remember from these notes right now!
                        </p>
                      </div>
                    </div>
                    <button
                      id="tab-refresh-instant-recall-btn"
                      onClick={handleRefreshInstantRecall}
                      disabled={isRefreshingRecall}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] shadow-sm transition-all cursor-pointer shrink-0"
                    >
                      <RotateCw className={`w-3.5 h-3.5 ${isRefreshingRecall ? "animate-spin" : ""}`} />
                      <span>{isRefreshingRecall ? "Refreshing..." : "Refresh Instant Recall"}</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {notes.quickChecks.map((check, idx) => {
                      const isRevealed = Boolean(quickCheckRevealed[idx]);

                      return (
                        <div
                          key={idx}
                          className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
                              Question #{idx + 1}
                            </span>
                            <span className="text-xs text-slate-400">
                              {isRevealed ? "Answer Shown" : "Try Answering"}
                            </span>
                          </div>

                          <h4 className="text-sm sm:text-base font-bold text-slate-900">
                            {check.question}
                          </h4>

                          {!isRevealed ? (
                            <div className="flex items-center gap-2 pt-2 flex-wrap">
                              <button
                                onClick={() => handleCheckQuickAnswer(idx, true)}
                                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer"
                              >
                                Show Answer
                              </button>
                              <span className="text-xs text-slate-500 italic">
                                💡 Hint: {check.hint}
                              </span>
                            </div>
                          ) : (
                            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-1 animate-in fade-in">
                              <div className="font-extrabold text-emerald-950">
                                ✓ Answer: {check.answer}
                              </div>
                              <div className="text-emerald-800 text-[11px]">
                                {check.hint}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Empty placeholder state */
            <div className="py-16 text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                Ready to Create Simple Study Notes
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Type in any topic above and tap "Generate Notes". You will get easy flashcards, clear summaries, and memory checks!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
