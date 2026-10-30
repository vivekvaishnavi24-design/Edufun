import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  BookOpen,
  RotateCcw,
  Star,
  Check,
  X,
  Lightbulb,
  FileText,
  Volume2,
  VolumeX,
  Target,
  FileUp,
  Brain,
  Award,
  Layers,
  ChevronRight,
  Smile,
  Edit3,
  BookmarkCheck,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GeneratedQuiz, QuizQuestion, ClassroomUserAuth } from "../types";
import { playSuccessSound, playIncorrectSound } from "../utils/audio";
import { checkTypedAnswer, isTrueFalseQuestion } from "../utils/quizUtils";

interface StudyModePlayerProps {
  quiz: GeneratedQuiz;
  soundEnabled?: boolean;
  onSwitchToPracticeMode: () => void;
  onOpenAskTutor?: (question: QuizQuestion) => void;
  onOpenImagineCreativity?: (questionPrompt?: string) => void;
  onOpenJokeBreak?: (topic: string, questionContext?: string) => void;
  onUploadNewPdf?: () => void;
  onRegenerateFreshQuestions?: () => void;
  onOpenNotes?: () => void;
  currentUser?: ClassroomUserAuth | null;
}

export const StudyModePlayer: React.FC<StudyModePlayerProps> = ({
  quiz,
  soundEnabled = true,
  onSwitchToPracticeMode,
  onOpenAskTutor,
  onOpenImagineCreativity,
  onOpenJokeBreak,
  onUploadNewPdf,
  onRegenerateFreshQuestions,
  onOpenNotes,
  currentUser,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>({});
  const [revealedExplanations, setRevealedExplanations] = useState<Record<string, boolean>>({});
  const [masteredIds, setMasteredIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(`testgen_study_mastered_${quiz.id}`);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [typedInput, setTypedInput] = useState<string>("");
  const [studyNotes, setStudyNotes] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(`testgen_study_notes_${quiz.id}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [isNoteExpanded, setIsNoteExpanded] = useState<boolean>(false);
  const [isSessionCompleted, setIsSessionCompleted] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const totalQuestions = quiz.questions.length;
  const currentQuestion = quiz.questions[currentIndex] || quiz.questions[0];

  // Sync typed input when navigating questions
  useEffect(() => {
    if (currentQuestion) {
      setTypedInput(userAnswers[currentQuestion.id] || "");
      setIsNoteExpanded(Boolean(studyNotes[currentQuestion.id]));
    }
  }, [currentIndex, currentQuestion, userAnswers, studyNotes]);

  // Persist mastered questions
  useEffect(() => {
    try {
      localStorage.setItem(
        `testgen_study_mastered_${quiz.id}`,
        JSON.stringify(Array.from(masteredIds))
      );
    } catch {
      // ignore
    }
  }, [masteredIds, quiz.id]);

  // Persist study notes
  useEffect(() => {
    try {
      localStorage.setItem(
        `testgen_study_notes_${quiz.id}`,
        JSON.stringify(studyNotes)
      );
    } catch {
      // ignore
    }
  }, [studyNotes, quiz.id]);

  // Web Speech Synthesis (Read Aloud)
  const handleToggleSpeech = (textToRead: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.lang = quiz.language === "hi" ? "hi-IN" : "en-US";
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  if (!currentQuestion) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
        <p className="text-slate-600">No study questions available.</p>
        <button
          onClick={onSwitchToPracticeMode}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
        >
          Return to Practice Test
        </button>
      </div>
    );
  }

  const selectedAnswer = userAnswers[currentQuestion.id];
  const isAnswered = selectedAnswer !== undefined;
  const isTyped = currentQuestion.type === "typed";
  const isTrueFalse = isTrueFalseQuestion(currentQuestion) || currentQuestion.type === "true_false";

  const isCorrect = isAnswered
    ? isTyped
      ? checkTypedAnswer(selectedAnswer, currentQuestion.correctAnswer, currentQuestion.acceptedAnswers)
      : selectedAnswer === currentQuestion.correctAnswer
    : false;

  const isMastered = masteredIds.has(currentQuestion.id);

  const displayOptions = isTrueFalse
    ? ["True", "False"]
    : currentQuestion.options && currentQuestion.options.length > 0
    ? currentQuestion.options.filter((o) => !o.toLowerCase().startsWith("alternative")).slice(0, 4)
    : [];

  const handleSelectOption = (option: string) => {
    const isThisCorrect = option === currentQuestion.correctAnswer;
    if (soundEnabled) {
      if (isThisCorrect) {
        playSuccessSound();
      } else {
        playIncorrectSound();
      }
    }

    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: option,
    }));

    // Auto-mark as mastered if answered correctly on first try
    if (isThisCorrect && !userAnswers[currentQuestion.id]) {
      setMasteredIds((prev) => new Set(prev).add(currentQuestion.id));
    }
  };

  const handleTypedSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = typedInput.trim();
    if (!trimmed) return;

    const correct = checkTypedAnswer(
      trimmed,
      currentQuestion.correctAnswer,
      currentQuestion.acceptedAnswers
    );

    if (soundEnabled) {
      if (correct) {
        playSuccessSound();
      } else {
        playIncorrectSound();
      }
    }

    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: trimmed,
    }));

    if (correct && !userAnswers[currentQuestion.id]) {
      setMasteredIds((prev) => new Set(prev).add(currentQuestion.id));
    }
  };

  const handleTryAgain = () => {
    setUserAnswers((prev) => {
      const next = { ...prev };
      delete next[currentQuestion.id];
      return next;
    });
    setTypedInput("");
  };

  const handleToggleMastered = () => {
    setMasteredIds((prev) => {
      const next = new Set(prev);
      if (next.has(currentQuestion.id)) {
        next.delete(currentQuestion.id);
      } else {
        next.add(currentQuestion.id);
      }
      return next;
    });
  };

  const handleSaveNote = (text: string) => {
    setStudyNotes((prev) => ({
      ...prev,
      [currentQuestion.id]: text,
    }));
  };

  const masteredCount = masteredIds.size;
  const answeredCount = Object.keys(userAnswers).length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  // Concept & explanation text derivations
  const conceptName =
    currentQuestion.conceptTested ||
    currentQuestion.questionSummary ||
    quiz.topicsCovered?.[0] ||
    "Core Foundational Principle";

  const whyRightText =
    currentQuestion.whyCorrect || currentQuestion.explanation;

  const pdfCitation =
    currentQuestion.sourceReference ||
    (quiz.documentName
      ? `Extracted from PDF: "${quiz.documentName}"`
      : "Extracted from Uploaded PDF Material");

  // Summary / Wrap-Up View
  if (isSessionCompleted) {
    return (
      <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-emerald-200/90 shadow-xl p-5 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-300">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <Award className="w-8 h-8" />
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 inline-block">
            Self-Paced Study Session Complete
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Outstanding Learning Work! 🎉
          </h2>
          <p className="text-sm text-slate-600">
            You reviewed all {totalQuestions} concepts from{" "}
            <strong className="text-slate-800">
              {quiz.documentName || quiz.title}
            </strong>{" "}
            with zero time pressure and immediate pedagogical explanations.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
            <div className="text-2xl font-black text-emerald-700">{masteredCount}</div>
            <div className="text-xs font-semibold text-emerald-900 mt-0.5">Concepts Mastered ⭐</div>
          </div>
          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-center">
            <div className="text-2xl font-black text-indigo-700">{answeredCount}</div>
            <div className="text-xs font-semibold text-indigo-900 mt-0.5">Questions Explored 📖</div>
          </div>
          <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-center">
            <div className="text-2xl font-black text-teal-700">
              {Math.round((masteredCount / totalQuestions) * 100)}%
            </div>
            <div className="text-xs font-semibold text-teal-900 mt-0.5">Mastery Rate</div>
          </div>
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center">
            <div className="text-2xl font-black text-amber-700">
              {Object.keys(studyNotes).length}
            </div>
            <div className="text-xs font-semibold text-amber-900 mt-0.5">Personal Notes 📝</div>
          </div>
        </div>

        {/* Mastered Topics Checklist */}
        <div className="max-w-2xl mx-auto bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
          <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider">
            PDF Concepts Studied & Verified:
          </h4>
          <div className="divide-y divide-slate-200/60 max-h-56 overflow-y-auto pr-1">
            {quiz.questions.map((q, idx) => {
              const isQMastered = masteredIds.has(q.id);
              return (
                <div key={q.id} className="py-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span className="font-bold text-slate-500">#{idx + 1}</span>
                    <span className="font-semibold text-slate-800 truncate">
                      {q.conceptTested || q.questionSummary || q.question}
                    </span>
                  </div>
                  <div className="shrink-0">
                    {isQMastered ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                        Mastered
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          setCurrentIndex(idx);
                          setIsSessionCompleted(false);
                        }}
                        className="text-[11px] font-semibold text-indigo-600 hover:underline"
                      >
                        Review Concept ➔
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onSwitchToPracticeMode}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all cursor-pointer"
          >
            <Layers className="w-4 h-4" />
            <span>Test Knowledge in Practice Mode 🎯</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsSessionCompleted(false);
              setCurrentIndex(0);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-2xs transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Re-read Study Concepts 🔄</span>
          </button>

          {onOpenNotes && (
            <button
              type="button"
              onClick={onOpenNotes}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Interactive Study Notes 📝</span>
            </button>
          )}

          {onUploadNewPdf && (
            <button
              type="button"
              onClick={onUploadNewPdf}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-300 transition-all cursor-pointer"
            >
              <FileUp className="w-4 h-4" />
              <span>Study Another PDF 📄</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 1. Calm, Self-Paced Study Header */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-emerald-200/90 shadow-sm p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs">
                <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                <span>Self-Paced Study Mode</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                ⏱️ No Time Limit • Learn at Your Pace
              </span>

              {quiz.documentName && (
                <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200 font-medium truncate max-w-xs">
                  <FileText className="w-3 h-3 text-slate-500" />
                  <span className="truncate">{quiz.documentName}</span>
                </span>
              )}
            </div>

            <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1.5">
              {quiz.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {quiz.summary || "Interactive learning step-by-step with immediate feedback, explanations, and PDF citations."}
            </p>
          </div>

          {/* Top Control Actions */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {/* Mastered Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 shadow-2xs">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>{masteredCount} of {totalQuestions} Mastered</span>
            </div>

            {/* Switch to Practice Test */}
            <button
              type="button"
              onClick={onSwitchToPracticeMode}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 shadow-2xs transition-all cursor-pointer hover:scale-[1.02]"
              title="Switch to scored practice test mode"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Practice Mode 🎯</span>
            </button>

            {/* Upload PDF */}
            {onUploadNewPdf && (
              <button
                type="button"
                onClick={onUploadNewPdf}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-all cursor-pointer"
                title="Upload or change PDF"
              >
                <FileUp className="w-3.5 h-3.5 text-teal-600" />
                <span>PDFs 📄</span>
              </button>
            )}

            {/* AI Tutor */}
            {onOpenAskTutor && (
              <button
                type="button"
                onClick={() => onOpenAskTutor(currentQuestion)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-all cursor-pointer"
                title="Ask AI Tutor for guidance on this concept"
              >
                <Brain className="w-3.5 h-3.5 text-indigo-600" />
                <span>Ask AI Tutor</span>
              </button>
            )}
          </div>
        </div>

        {/* 2. Responsive Question Progress & Jump Strip */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 shrink-0">
            <span>Concept Steps ({currentIndex + 1}/{totalQuestions}):</span>
            <span className="text-slate-400 font-normal">
              {progressPercent}% Studied
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-thin max-w-full">
            {quiz.questions.map((q, idx) => {
              const qAns = userAnswers[q.id];
              const isQAnswered = qAns !== undefined;
              const isQMastered = masteredIds.has(q.id);
              const isCurrent = currentIndex === idx;

              let dotClass = "bg-slate-100 text-slate-600 border-slate-200 hover:border-slate-300";
              if (isQMastered) {
                dotClass = "bg-emerald-100 text-emerald-900 border-emerald-300 font-black";
              } else if (isQAnswered) {
                dotClass = "bg-teal-100 text-teal-900 border-teal-300 font-bold";
              }

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`relative w-8 h-8 rounded-xl text-xs flex items-center justify-center border transition-all cursor-pointer ${dotClass} ${
                    isCurrent
                      ? "ring-2 ring-emerald-600 ring-offset-1 scale-105 shadow-sm"
                      : ""
                  }`}
                  title={`Question ${idx + 1}: ${isQMastered ? "Mastered ⭐" : isQAnswered ? "Reviewed" : "Not yet studied"}`}
                >
                  {idx + 1}
                  {isQMastered && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border border-white ring-1 ring-amber-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. The Main One-by-One Question Learning Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden p-4 sm:p-6 space-y-5">
        {/* Step Indicator & Concept Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
              Concept #{currentIndex + 1} of {totalQuestions}
            </span>
            <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 capitalize">
              {currentQuestion.type === "true_false"
                ? "True / False Analysis"
                : currentQuestion.type === "typed"
                ? "Active Recall (Typed)"
                : "Multiple Choice Question"}
            </span>
            {currentQuestion.difficulty && (
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase bg-slate-100 text-slate-600">
                {currentQuestion.difficulty}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Read-Aloud */}
            <button
              type="button"
              onClick={() =>
                handleToggleSpeech(
                  `${currentQuestion.question}. ${
                    isAnswered ? `Explanation: ${currentQuestion.explanation}` : ""
                  }`
                )
              }
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isSpeaking
                  ? "bg-rose-50 text-rose-700 border-rose-300 animate-pulse"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
              title="Read Question Aloud with Voice"
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-rose-600" />
                  <span className="text-[11px] font-bold">Stop Audio</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-slate-600" />
                  <span className="text-[11px]">Listen 🔊</span>
                </>
              )}
            </button>

            {/* Toggle Mastered Star */}
            <button
              type="button"
              onClick={handleToggleMastered}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isMastered
                  ? "bg-amber-100 text-amber-900 border-amber-300 shadow-2xs ring-1 ring-amber-400"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
              title="Toggle mastered status for this concept"
            >
              <Star
                className={`w-3.5 h-3.5 ${
                  isMastered ? "fill-amber-500 text-amber-500" : "text-slate-400"
                }`}
              />
              <span>{isMastered ? "Mastered ⭐" : "Mark Mastered"}</span>
            </button>
          </div>
        </div>

        {/* Core Concept Tested Headline */}
        <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 flex items-start gap-2.5">
          <Target className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase text-indigo-700 tracking-wider block">
              Core Concept Tested:
            </span>
            <div className="text-xs sm:text-sm font-extrabold text-indigo-950 mt-0.5">
              {conceptName}
            </div>
          </div>
        </div>

        {/* Question Prompt */}
        <div className="space-y-1">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
            {currentQuestion.question}
          </h3>
          {currentQuestion.questionSummary && (
            <p className="text-xs text-slate-500 font-medium">
              💡 {currentQuestion.questionSummary}
            </p>
          )}
        </div>

        {/* Pre-Answer Learning Aids (Study mode allows peeking hint & explanation before answering!) */}
        {!isAnswered && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() =>
                setRevealedHints((prev) => ({
                  ...prev,
                  [currentQuestion.id]: !prev[currentQuestion.id],
                }))
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-all cursor-pointer"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
              <span>
                {revealedHints[currentQuestion.id]
                  ? "Hide Clue"
                  : "💡 Need a Clue / Hint?"}
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                setRevealedExplanations((prev) => ({
                  ...prev,
                  [currentQuestion.id]: !prev[currentQuestion.id],
                }))
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-all cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-teal-600" />
              <span>
                {revealedExplanations[currentQuestion.id]
                  ? "Hide Concept Solution"
                  : "📖 Study Concept Before Answering"}
              </span>
            </button>
          </div>
        )}

        {/* Revealed Hint Box */}
        {revealedHints[currentQuestion.id] && !isAnswered && (
          <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5 animate-in fade-in duration-200">
            <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold block mb-0.5">Study Clue:</strong>
              <span>
                {currentQuestion.hint ||
                  "Think about the foundational laws or definitions covered in this chapter of the uploaded PDF."}
              </span>
            </div>
          </div>
        )}

        {/* Revealed Pre-Study Explanation Box */}
        {revealedExplanations[currentQuestion.id] && !isAnswered && (
          <div className="p-4 rounded-2xl bg-teal-50/90 border border-teal-200 text-xs text-teal-950 space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-teal-900 font-extrabold">
              <BookOpen className="w-4 h-4 text-teal-700" />
              <span>Concept Primer & Solution:</span>
            </div>
            <p className="leading-relaxed text-teal-950 font-medium pl-6">
              {currentQuestion.explanation}
            </p>
            <div className="pt-2 border-t border-teal-200/80 flex items-center justify-between text-[11px] text-teal-800">
              <span>Expected Answer: <strong>{currentQuestion.correctAnswer}</strong></span>
              <button
                type="button"
                onClick={() => handleSelectOption(currentQuestion.correctAnswer)}
                className="font-bold text-teal-900 underline hover:no-underline cursor-pointer"
              >
                Mark Answered & Confirm ➔
              </button>
            </div>
          </div>
        )}

        {/* Question Options or Typed Input */}
        <div className="pt-2">
          {isTyped ? (
            /* Typed Short Answer Field */
            <form onSubmit={handleTypedSubmit} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Type your answer based on the PDF material..."
                  value={typedInput}
                  disabled={isAnswered}
                  onChange={(e) => setTypedInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50 font-medium"
                />
                {!isAnswered ? (
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer"
                  >
                    Submit & Check
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleTryAgain}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Try Again</span>
                  </button>
                )}
              </div>
            </form>
          ) : (
            /* Multiple Choice / True-False Options */
            <div
              className={`grid gap-2.5 ${
                isTrueFalse ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"
              }`}
            >
              {displayOptions.map((option, idx) => {
                const isSelected = selectedAnswer === option;
                const isThisTheCorrectAnswer = option === currentQuestion.correctAnswer;
                const optionLetter = String.fromCharCode(65 + idx);

                let btnStyle = "bg-white hover:bg-slate-50 border-slate-200 text-slate-800";

                if (isAnswered) {
                  if (isThisTheCorrectAnswer) {
                    btnStyle = "bg-emerald-50 border-emerald-400 text-emerald-950 font-bold ring-1 ring-emerald-400";
                  } else if (isSelected) {
                    btnStyle = "bg-rose-50 border-rose-300 text-rose-950";
                  } else {
                    btnStyle = "bg-slate-50 border-slate-200 text-slate-400 opacity-60";
                  }
                }

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleSelectOption(option)}
                    className={`p-3.5 sm:p-4 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${btnStyle}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-7 h-7 rounded-xl text-xs font-black flex items-center justify-center shrink-0 border ${
                          isAnswered && isThisTheCorrectAnswer
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : isAnswered && isSelected
                            ? "bg-rose-600 text-white border-rose-600"
                            : "bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        {isTrueFalse ? (option === "True" ? "T" : "F") : optionLetter}
                      </span>
                      <span className="text-xs sm:text-sm font-semibold break-words">
                        {option}
                      </span>
                    </div>

                    {isAnswered && (
                      <div className="shrink-0 flex items-center gap-1.5">
                        {isThisTheCorrectAnswer && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            Correct
                          </span>
                        )}
                        {isSelected && !isThisTheCorrectAnswer && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                            <X className="w-3.5 h-3.5 text-rose-600" />
                            Your Selection
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 4. IMMEDIATE FEEDBACK & IN-DEPTH EXPLANATION BOX */}
        <AnimatePresence>
          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.25 }}
              className={`rounded-2xl p-4 sm:p-5 border space-y-4 ${
                isCorrect
                  ? "bg-emerald-50/70 border-emerald-200"
                  : "bg-amber-50/80 border-amber-200"
              }`}
            >
              {/* Header Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-2xl text-white flex items-center justify-center shrink-0 shadow-md ${
                      isCorrect
                        ? "bg-emerald-600 ring-2 ring-emerald-300 shadow-emerald-500/20"
                        : "bg-amber-600 ring-2 ring-amber-300 shadow-amber-500/20"
                    }`}
                  >
                    {isCorrect ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Lightbulb className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isCorrect
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "bg-amber-100 text-amber-900 border border-amber-300"
                      }`}
                    >
                      {isCorrect ? "✅ Correct Answer" : "💡 Active Recall Review"}
                    </span>
                    <h4
                      className={`text-sm sm:text-base font-extrabold mt-0.5 ${
                        isCorrect ? "text-emerald-950" : "text-amber-950"
                      }`}
                    >
                      {isCorrect
                        ? "Terrific! You grasped this concept perfectly! 🎉"
                        : "Review the pedagogical explanation below to solidify your understanding! 💪"}
                    </h4>
                  </div>
                </div>

                {/* Right actions */}
                <div className="flex items-center gap-2 flex-wrap self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={handleTryAgain}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-300 shadow-2xs transition-all cursor-pointer"
                    title="Clear choice to practice active recall again"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Try Again Without Penalty</span>
                  </button>

                  {onOpenImagineCreativity && (
                    <button
                      type="button"
                      onClick={() => onOpenImagineCreativity(currentQuestion.question)}
                      className="inline-flex items-center gap-1.5 text-xs font-black text-amber-950 bg-gradient-to-r from-amber-300 to-amber-400 hover:from-amber-200 hover:to-amber-300 px-3 py-1.5 rounded-xl border border-amber-400 shadow-2xs transition-all cursor-pointer"
                      title="Simulate this concept in the interactive lab"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-900 fill-amber-900" />
                      <span>Animate ✨</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Verified Answer & Explanation */}
              <div className="p-4 rounded-xl bg-white border border-emerald-200 shadow-2xs text-slate-800 space-y-2.5">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-xs font-black uppercase text-slate-900 tracking-wider">
                    Why the Correct Answer is Right:
                  </span>
                </div>
                <div className="pl-6 text-xs sm:text-sm font-semibold text-emerald-950">
                  Verified Answer: <strong>{currentQuestion.correctAnswer}</strong>
                </div>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium pl-6 whitespace-pre-line">
                  {whyRightText}
                </p>

                {currentQuestion.whyCorrect &&
                  currentQuestion.explanation &&
                  currentQuestion.whyCorrect.trim() !== currentQuestion.explanation.trim() && (
                    <div className="pt-2 border-t border-slate-100 pl-6 text-xs text-slate-600 leading-relaxed">
                      <strong className="font-bold text-slate-700 block mb-0.5">
                        Deep Pedagogical Context:
                      </strong>
                      <span>{currentQuestion.explanation}</span>
                    </div>
                  )}
              </div>

              {/* Uploaded PDF Citation & Reference Box */}
              <div className="p-3.5 rounded-xl bg-teal-50/90 border border-teal-200 text-teal-950 flex items-start gap-2.5 shadow-2xs">
                <FileText className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="text-[10px] font-black uppercase text-teal-800 tracking-wider block">
                    Source Material / PDF Reference:
                  </span>
                  <div className="text-xs font-bold text-teal-950 mt-0.5">
                    {pdfCitation}
                  </div>
                </div>
              </div>

              {/* Study Hint / Memory Mnemonic */}
              {(currentQuestion.hint || currentQuestion.funFactOrJoke) && (
                <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
                  <span className="text-base shrink-0 mt-0.5">💡</span>
                  <div>
                    <strong className="font-bold block mb-0.5">Study Takeaway:</strong>
                    <span>
                      {currentQuestion.hint || currentQuestion.funFactOrJoke}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 5. Personal Study Scratchpad / Note */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsNoteExpanded(!isNoteExpanded)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-indigo-600 transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-indigo-500" />
              <span>
                {studyNotes[currentQuestion.id]
                  ? "Edit My Study Note ✍️"
                  : "+ Add My Study Note for this PDF Question"}
              </span>
            </button>
            {studyNotes[currentQuestion.id] && !isNoteExpanded && (
              <span className="text-[11px] text-slate-500 italic truncate max-w-xs">
                "{studyNotes[currentQuestion.id]}"
              </span>
            )}
          </div>

          {isNoteExpanded && (
            <div className="mt-2.5">
              <textarea
                rows={2}
                placeholder="Write down your key takeaway, formula, or reminder for this question..."
                value={studyNotes[currentQuestion.id] || ""}
                onChange={(e) => handleSaveNote(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-slate-400">
                Notes are automatically saved to your browser for revision.
              </span>
            </div>
          )}
        </div>

        {/* 6. Step Navigation (Previous / Next / Finish) */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer ${
              currentIndex === 0
                ? "border-slate-200 text-slate-300 bg-slate-50 cursor-not-allowed"
                : "border-slate-200 text-slate-700 hover:bg-slate-100 bg-white shadow-2xs"
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous Concept</span>
          </button>

          <span className="text-xs text-slate-500 font-bold hidden sm:inline">
            Step {currentIndex + 1} of {totalQuestions}
          </span>

          {currentIndex < totalQuestions - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, totalQuestions - 1))}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-sm transition-all cursor-pointer"
            >
              <span>Next Concept</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsSessionCompleted(true)}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200 transition-all cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>Complete Study Session 🎉</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
