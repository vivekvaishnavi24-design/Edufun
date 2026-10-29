import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  BookOpen,
  ArrowRight,
  RotateCcw,
  Check,
  X,
  Languages,
  Lightbulb,
  Loader2,
  Smile,
  Laugh,
  Send,
  Eye,
  PartyPopper,
  ThumbsUp,
  ThumbsDown,
  Volume2,
  VolumeX,
  Target,
  BrainCircuit
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AppLanguage, QuizQuestion } from "../types";
import { fireBottomLeftAndRightConfetti, checkTypedAnswer, isTrueFalseQuestion } from "../utils/quizUtils";
import { playSuccessSound, playIncorrectSound } from "../utils/audio";

interface QuestionCardProps {
  question: QuizQuestion;
  questionIndex: number;
  totalQuestions: number;
  selectedAnswer: string | undefined;
  onSelectAnswer: (questionId: string, answer: string) => void;
  onClearAnswer?: (questionId: string) => void;
  onNextQuestion?: () => void;
  isLastQuestion?: boolean;
  onFinishQuiz?: () => void;
  onAskQuestion?: (question: QuizQuestion) => void;
  onOpenJokeBreak?: (topic: string, questionContext?: string) => void;
  isExamMode?: boolean;
  isMarkedForReview?: boolean;
  onToggleMarkForReview?: (questionId: string) => void;
  onOpenImagineCreativity?: (questionPrompt?: string) => void;
}

export function deriveConceptTested(question: QuizQuestion, fallbackSummary?: string): string {
  if (question.conceptTested && question.conceptTested.trim()) {
    return question.conceptTested.trim();
  }
  if (fallbackSummary && fallbackSummary.trim()) {
    return fallbackSummary.trim();
  }
  if (question.questionSummary && question.questionSummary.trim()) {
    return question.questionSummary.trim();
  }
  if (question.sourceReference && question.sourceReference.trim()) {
    return `Core Principle (${question.sourceReference.trim()})`;
  }
  const cleanQ = question.question
    .replace(/^(what is|which of the following|why does|how does|define|explain|identify|in which|what does)\s+/i, '')
    .replace(/[?!.:]+$/, '')
    .trim();
  if (cleanQ.length > 5 && cleanQ.length < 75) {
    return cleanQ.charAt(0).toUpperCase() + cleanQ.slice(1);
  }
  return "Foundational Subject Principle";
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionIndex,
  totalQuestions,
  selectedAnswer,
  onSelectAnswer,
  onClearAnswer,
  onNextQuestion,
  isLastQuestion,
  onFinishQuiz,
  onAskQuestion,
  onOpenJokeBreak,
  isExamMode = false,
  isMarkedForReview = false,
  onToggleMarkForReview,
  onOpenImagineCreativity
}) => {
  const isAnswered = selectedAnswer !== undefined;
  const isTyped = question.type === "typed";

  const isCorrect = isAnswered
    ? isTyped
      ? checkTypedAnswer(selectedAnswer, question.correctAnswer, question.acceptedAnswers)
      : selectedAnswer === question.correctAnswer
    : false;

  // Local state for typed question input
  const [typedInput, setTypedInput] = useState<string>(selectedAnswer || "");
  const [hasRevealedAnswer, setHasRevealedAnswer] = useState<boolean>(false);

  // Sync typedInput if selectedAnswer changes or resets
  useEffect(() => {
    setTypedInput(selectedAnswer || "");
    if (!selectedAnswer) {
      setHasRevealedAnswer(false);
    }
  }, [selectedAnswer]);

  // Language translation state for this question
  const [activeLang, setActiveLang] = useState<AppLanguage>("en");
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [translations, setTranslations] = useState<Record<string, {
    questionSummary: string;
    translatedQuestion: string;
    translatedExplanation: string;
    translatedCorrectAnswer: string;
  }>>({});

  const handleTranslate = async (targetLang: AppLanguage) => {
    if (targetLang === "en") {
      setActiveLang("en");
      return;
    }

    if (translations[targetLang]) {
      setActiveLang(targetLang);
      return;
    }

    setIsTranslating(true);
    try {
      const res = await fetch("/api/summarize-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionText: question.question,
          options: question.options,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          targetLanguage: targetLang
        })
      });

      if (res.ok) {
        const data = await res.json();
        setTranslations((prev) => ({
          ...prev,
          [targetLang]: data
        }));
        setActiveLang(targetLang);
      }
    } catch (e) {
      console.error("Translation error:", e);
    } finally {
      setIsTranslating(false);
    }
  };

  const isTrueFalse = isTrueFalseQuestion(question) || question.type === "true_false";

  const handleOptionSelect = (option: string) => {
    if (isExamMode) {
      onSelectAnswer(question.id, option);
      return;
    }
    if (isAnswered) return;
    const isThisCorrect = option === question.correctAnswer;
    if (isThisCorrect) {
      playSuccessSound();
      fireBottomLeftAndRightConfetti();
    } else {
      playIncorrectSound();
    }
    onSelectAnswer(question.id, option);
  };

  // Keyboard shortcut listener for True/False questions ([T] for True, [F] for False)
  useEffect(() => {
    if (!isTrueFalse || isTyped) return;
    if (!isExamMode && isAnswered) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.key === "t" || e.key === "T" || e.key === "1") {
        e.preventDefault();
        handleOptionSelect("True");
      } else if (e.key === "f" || e.key === "F" || e.key === "2") {
        e.preventDefault();
        handleOptionSelect("False");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isTrueFalse, isTyped, isAnswered, isExamMode]);

  const handleTypedSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = typedInput.trim();
    if (!trimmed) return;
    if (isExamMode) {
      onSelectAnswer(question.id, trimmed);
      return;
    }
    if (isAnswered) return;

    const correct = checkTypedAnswer(trimmed, question.correctAnswer, question.acceptedAnswers);
    if (correct) {
      playSuccessSound();
      fireBottomLeftAndRightConfetti();
    } else {
      playIncorrectSound();
    }
    onSelectAnswer(question.id, trimmed);
  };

  const handleTryAgain = () => {
    if (onClearAnswer) {
      onClearAnswer(question.id);
    }
    setTypedInput("");
    setHasRevealedAnswer(false);
  };

  const currentTranslation = translations[activeLang];
  const displayQuestionText = currentTranslation ? currentTranslation.translatedQuestion : question.question;
  const displayExplanation = currentTranslation ? currentTranslation.translatedExplanation : question.explanation;
  const displaySummary = currentTranslation ? currentTranslation.questionSummary : question.questionSummary;
  const displayConceptTested = deriveConceptTested(question, displaySummary);
  const displayWhyCorrect = question.whyCorrect || displayExplanation;

  const getOptionLetter = (idx: number) => {
    return String.fromCharCode(65 + idx); // A, B, C, D...
  };

  // Ensure True/False strictly has exactly 2 options: ["True", "False"], never Alternative 1
  const displayOptions = isTrueFalse
    ? ["True", "False"]
    : question.options && question.options.length > 0
    ? question.options.filter((o) => !o.toLowerCase().startsWith("alternative")).slice(0, 4)
    : [];

  const correctOptionIndex = displayOptions.findIndex(
    (opt) => opt.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase()
  );
  const correctOptionLetter = correctOptionIndex >= 0 ? getOptionLetter(correctOptionIndex) : null;

  const userOptionIndex = displayOptions.findIndex(
    (opt) => selectedAnswer && opt.trim().toLowerCase() === selectedAnswer.trim().toLowerCase()
  );
  const userOptionLetter = userOptionIndex >= 0 ? getOptionLetter(userOptionIndex) : null;

  // SpeechSynthesis "Read Aloud" state
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Stop SpeechSynthesis when question changes or component unmounts
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [question.id]);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [question.id]);

  const handleToggleReadAloud = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      console.warn("SpeechSynthesis is not supported in this browser environment.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();

    // Prepare clear text to speak
    const qText = displayQuestionText;
    let textToSpeak = `Question ${questionIndex + 1}: ${qText}. `;

    if (isTyped) {
      textToSpeak += `Type your answer. ${question.hint ? `Hint: ${question.hint}` : ""}`;
    } else if (isTrueFalse) {
      textToSpeak += `Options are: True, or False.`;
    } else {
      textToSpeak += `The options are: `;
      displayOptions.forEach((opt, idx) => {
        const letter = String.fromCharCode(65 + idx);
        textToSpeak += `Option ${letter}: ${opt}. `;
      });
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    if (activeLang === "hi") {
      utterance.lang = "hi-IN";
    } else if (activeLang === "sa") {
      utterance.lang = "sa-IN";
    } else {
      utterance.lang = "en-US";
    }

    try {
      const voices = window.speechSynthesis.getVoices();
      const match = voices.find((v) =>
        v.lang.startsWith(utterance.lang) ||
        (activeLang === "en" && (v.lang.startsWith("en-US") || v.lang.startsWith("en-GB")))
      );
      if (match) {
        utterance.voice = match;
      }
    } catch {}

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  return (
    <div
      id={`question-card-${question.id}`}
      className="bg-white/95 backdrop-blur-sm rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all p-5 sm:p-7"
    >
      {/* Question Header & Meta */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs font-bold bg-slate-900 text-white">
            Q{questionIndex + 1} of {totalQuestions}
          </span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
              isTrueFalse
                ? "bg-purple-50 text-purple-700 border border-purple-200/70"
                : question.type === "mcq"
                ? "bg-blue-50 text-blue-700 border border-blue-200/70"
                : "bg-emerald-50 text-emerald-700 border border-emerald-200/70"
            }`}
          >
            {isTrueFalse
              ? "True / False (2 Choices Only)"
              : question.type === "mcq"
              ? "Multiple Choice (4 Options)"
              : "Type Your Answer ✍️"}
          </span>
          {question.difficulty && (
            <span
              className={`text-xs px-2 py-0.5 rounded-md font-medium capitalize ${
                question.difficulty === "easy"
                  ? "bg-emerald-50 text-emerald-700"
                  : question.difficulty === "hard"
                  ? "bg-amber-50 text-amber-700"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {question.difficulty}
            </span>
          )}
        </div>

        {/* Right Actions: Language Switcher & Ask Tutor */}
        <div className="flex items-center gap-2">
          {/* Language Switch for this Question */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => handleTranslate("en")}
              className={`px-2 py-0.5 rounded font-bold transition-all ${
                activeLang === "en" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => handleTranslate("hi")}
              disabled={isTranslating}
              className={`px-2 py-0.5 rounded font-bold transition-all ${
                activeLang === "hi" ? "bg-white text-indigo-700 shadow-2xs" : "text-slate-500 hover:text-slate-800"
              }`}
              title="हिंदी में अनुवाद एवं सारांश"
            >
              {isTranslating && activeLang !== "hi" ? (
                <Loader2 className="w-3 h-3 animate-spin inline" />
              ) : (
                "हिन्दी"
              )}
            </button>
            <button
              onClick={() => handleTranslate("sa")}
              disabled={isTranslating}
              className={`px-2 py-0.5 rounded font-bold transition-all ${
                activeLang === "sa" ? "bg-white text-indigo-700 shadow-2xs" : "text-slate-500 hover:text-slate-800"
              }`}
              title="संस्कृते अनुवादान्वयः सारांशश्च"
            >
              {isTranslating && activeLang !== "sa" ? (
                <Loader2 className="w-3 h-3 animate-spin inline" />
              ) : (
                "संस्कृतम्"
              )}
            </button>
          </div>

          {/* Read Aloud Button (SpeechSynthesis API) */}
          <button
            type="button"
            onClick={handleToggleReadAloud}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              isSpeaking
                ? "bg-rose-100 text-rose-700 border border-rose-300 ring-2 ring-rose-400/50 shadow-xs animate-pulse"
                : "bg-indigo-50 hover:bg-indigo-100/90 text-indigo-700 border border-indigo-200/80 shadow-2xs hover:scale-[1.02]"
            }`}
            title={isSpeaking ? "Stop reading question aloud" : "Read question and choices aloud using SpeechSynthesis"}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>Stop ⏹️</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>Read Aloud 🔊</span>
              </>
            )}
          </button>

          {/* Ask AI Tutor */}
          {onAskQuestion && (
            <button
              onClick={() => onAskQuestion(question)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200/80 transition-colors"
              title="Ask AI Tutor to summarize and explain this question"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ask Tutor</span>
            </button>
          )}

          {/* Animate in Imagine Ur Creativity */}
          {onOpenImagineCreativity && (
            <button
              type="button"
              onClick={() => onOpenImagineCreativity(question.question)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-amber-900 bg-gradient-to-r from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 border border-amber-300 transition-all cursor-pointer shadow-2xs"
              title="Animate and simulate this concept interactively in Imagine Ur Creativity"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-current" />
              <span className="hidden sm:inline">Animate Concept ✨</span>
            </button>
          )}

          {/* Question status chip */}
          {isExamMode ? (
            <div className="flex items-center gap-1.5">
              {onToggleMarkForReview && (
                <button
                  type="button"
                  onClick={() => onToggleMarkForReview(question.id)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                    isMarkedForReview
                      ? "bg-purple-100 text-purple-800 border-purple-300"
                      : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-purple-50"
                  }`}
                  title="Mark this question to review before final submission"
                >
                  <span>{isMarkedForReview ? "🚩 Marked" : "🏳️ Mark Review"}</span>
                </button>
              )}
              {isAnswered ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-300">
                  <Check className="w-3.5 h-3.5" />
                  <span>Answered</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                  <span>Not Answered</span>
                </span>
              )}
            </div>
          ) : isAnswered ? (
            <div
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                isCorrect
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                  : "bg-rose-100 text-rose-800 border border-rose-200"
              }`}
            >
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Correct</span>
                </>
              ) : (
                <>
                  <XCircle className="w-3 h-3 text-rose-600" />
                  <span>Try Again</span>
                </>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Prominent Question Summary Box (if present) */}
      {displaySummary && (
        <div className="mb-4 p-3 bg-amber-50/70 border border-amber-200/70 rounded-xl flex items-start gap-2.5 text-xs">
          <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <span className="font-bold text-amber-900 mr-1.5">
              {activeLang === "hi"
                ? "प्रश्न सारांश:"
                : activeLang === "sa"
                ? "प्रश्नसारः:"
                : "Question Summary:"}
            </span>
            <span className="text-amber-950 font-medium">
              {displaySummary}
            </span>
          </div>
        </div>
      )}

      {/* Question Prompt */}
      <h2 className="text-lg sm:text-xl font-semibold text-slate-900 leading-snug mb-6">
        {displayQuestionText}
      </h2>

      {/* Question Interaction Area: Typed input VS Options list */}
      {isTyped ? (
        /* Typed Question Input */
        <div className="mb-6 space-y-3">
          <form onSubmit={handleTypedSubmit} className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Type your answer below:
            </label>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                value={typedInput}
                onChange={(e) => setTypedInput(e.target.value)}
                disabled={isAnswered}
                placeholder="Type your answer here and press Enter..."
                className={`flex-1 px-4 py-3 rounded-xl border text-sm sm:text-base font-medium transition-all outline-none ${
                  isAnswered
                    ? isCorrect
                      ? "border-emerald-500 bg-emerald-50/60 text-emerald-950 ring-2 ring-emerald-400"
                      : "border-rose-400 bg-rose-50/60 text-rose-950 ring-1 ring-rose-300"
                    : "border-slate-300 bg-white focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 text-slate-900"
                }`}
              />
              {!isAnswered ? (
                <button
                  type="submit"
                  disabled={!typedInput.trim()}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all shrink-0 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Answer</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 shrink-0">
                  {!isCorrect && (
                    <button
                      type="button"
                      onClick={handleTryAgain}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl text-sm font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 transition-all cursor-pointer"
                      title="Try typing again"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Retry</span>
                    </button>
                  )}
                  {!isCorrect && !hasRevealedAnswer && (
                    <button
                      type="button"
                      onClick={() => setHasRevealedAnswer(true)}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-all cursor-pointer"
                    >
                      <Eye className="w-4 h-4 text-slate-600" />
                      <span>Show Answer</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </form>

          {isAnswered && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Your typed answer:</span>
              <code className="px-2 py-0.5 rounded bg-slate-100 text-slate-900 font-mono font-bold">
                {selectedAnswer}
              </code>
            </div>
          )}
        </div>
      ) : isTrueFalse ? (
        /* Dedicated Fun, Interactive True/False Arena (Scrollable so student doesn't have to scroll the whole app) */
        <div className="mb-6 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-bold flex items-center gap-1.5 text-indigo-700">
              <Sparkles className="w-3.5 h-3.5" />
              Pick True or False:
            </span>
            <span className="hidden sm:inline text-slate-400">
              Quick Keys: Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 font-mono font-bold text-slate-700">T</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 font-mono font-bold text-slate-700">F</kbd>
            </span>
          </div>

          <div className="max-h-[310px] sm:max-h-[370px] overflow-y-auto overscroll-contain pr-1 sm:pr-1.5 p-1 rounded-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. TRUE HERO BUTTON */}
            {(() => {
              const isSelected = selectedAnswer === "True";
              const isThisCorrect = question.correctAnswer === "True";

              let cardStyle =
                "bg-gradient-to-b from-emerald-50/70 via-white to-emerald-50/30 border-emerald-200/90 hover:border-emerald-500 hover:bg-emerald-50/90 text-slate-800 shadow-2xs hover:shadow-md";
              let iconStyle = "bg-emerald-100 text-emerald-600";
              let badge = null;

              if (isExamMode) {
                if (isSelected) {
                  cardStyle =
                    "bg-indigo-50/95 border-indigo-600 text-indigo-950 ring-4 ring-indigo-400/40 shadow-md scale-[1.01]";
                  iconStyle = "bg-indigo-600 text-white shadow-sm";
                  badge = (
                    <span className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-indigo-800 bg-indigo-100 px-2.5 py-1 rounded-full border border-indigo-300">
                      Selected Choice ✓
                    </span>
                  );
                } else {
                  cardStyle = "bg-white border-slate-200 text-slate-700 hover:border-indigo-300 shadow-2xs";
                  iconStyle = "bg-slate-100 text-slate-600";
                }
              } else if (isAnswered) {
                if (isThisCorrect) {
                  cardStyle =
                    "bg-emerald-50/95 border-emerald-500 text-emerald-950 ring-4 ring-emerald-400/40 shadow-md scale-[1.01]";
                  iconStyle = "bg-emerald-600 text-white shadow-sm";
                  badge = (
                    <span className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      Correct Statement
                    </span>
                  );
                } else if (isSelected && !isCorrect) {
                  cardStyle =
                    "bg-rose-50/95 border-rose-500 text-rose-950 ring-4 ring-rose-400/40 shadow-sm";
                  iconStyle = "bg-rose-600 text-white";
                  badge = (
                    <span className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-rose-800 bg-rose-100 px-2.5 py-1 rounded-full border border-rose-300">
                      <XCircle className="w-3.5 h-3.5 text-rose-700" />
                      Your Choice
                    </span>
                  );
                } else {
                  cardStyle = "bg-slate-50 border-slate-200 text-slate-400 opacity-60";
                  iconStyle = "bg-slate-200 text-slate-400";
                }
              }

              const canClick = isExamMode || !isAnswered;

              return (
                <button
                  type="button"
                  id={`tf-true-${question.id}`}
                  disabled={!isExamMode && isAnswered}
                  onClick={() => handleOptionSelect("True")}
                  className={`p-5 sm:p-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center text-center relative group select-none ${cardStyle} ${
                    canClick
                      ? "cursor-pointer active:scale-95 hover:-translate-y-1"
                      : "cursor-default"
                  }`}
                >
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-3 shadow-inner transition-transform group-hover:scale-110 ${iconStyle}`}
                  >
                    <ThumbsUp className="w-7 h-7" />
                  </div>

                  <div className="text-xl sm:text-2xl font-black tracking-tight mb-1 text-emerald-950 flex items-center gap-1.5">
                    <span>
                      {activeLang === "hi"
                        ? "सत्य (TRUE)"
                        : activeLang === "sa"
                        ? "सत्यम् (TRUE)"
                        : "TRUE"}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 font-medium max-w-[220px] mb-3">
                    This statement is accurate & true
                  </p>

                  <div className="flex items-center gap-1.5 mt-auto">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100/80 text-emerald-850 text-[10px] font-bold uppercase tracking-wider">
                      Key [T] or [1]
                    </span>
                    {badge}
                  </div>
                </button>
              );
            })()}

            {/* 2. FALSE HERO BUTTON */}
            {(() => {
              const isSelected = selectedAnswer === "False";
              const isThisCorrect = question.correctAnswer === "False";

              let cardStyle =
                "bg-gradient-to-b from-rose-50/70 via-white to-rose-50/30 border-rose-200/90 hover:border-rose-500 hover:bg-rose-50/90 text-slate-800 shadow-2xs hover:shadow-md";
              let iconStyle = "bg-rose-100 text-rose-600";
              let badge = null;

              if (isExamMode) {
                if (isSelected) {
                  cardStyle =
                    "bg-indigo-50/95 border-indigo-600 text-indigo-950 ring-4 ring-indigo-400/40 shadow-md scale-[1.01]";
                  iconStyle = "bg-indigo-600 text-white shadow-sm";
                  badge = (
                    <span className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-indigo-800 bg-indigo-100 px-2.5 py-1 rounded-full border border-indigo-300">
                      Selected Choice ✓
                    </span>
                  );
                } else {
                  cardStyle = "bg-white border-slate-200 text-slate-700 hover:border-indigo-300 shadow-2xs";
                  iconStyle = "bg-slate-100 text-slate-600";
                }
              } else if (isAnswered) {
                if (isThisCorrect) {
                  cardStyle =
                    "bg-emerald-50/95 border-emerald-500 text-emerald-950 ring-4 ring-emerald-400/40 shadow-md scale-[1.01]";
                  iconStyle = "bg-emerald-600 text-white shadow-sm";
                  badge = (
                    <span className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      Correct Statement
                    </span>
                  );
                } else if (isSelected && !isCorrect) {
                  cardStyle =
                    "bg-rose-50/95 border-rose-500 text-rose-950 ring-4 ring-rose-400/40 shadow-sm";
                  iconStyle = "bg-rose-600 text-white";
                  badge = (
                    <span className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-rose-800 bg-rose-100 px-2.5 py-1 rounded-full border border-rose-300">
                      <XCircle className="w-3.5 h-3.5 text-rose-700" />
                      Your Choice
                    </span>
                  );
                } else {
                  cardStyle = "bg-slate-50 border-slate-200 text-slate-400 opacity-60";
                  iconStyle = "bg-slate-200 text-slate-400";
                }
              }

              const canClick = isExamMode || !isAnswered;

              return (
                <button
                  type="button"
                  id={`tf-false-${question.id}`}
                  disabled={!isExamMode && isAnswered}
                  onClick={() => handleOptionSelect("False")}
                  className={`p-5 sm:p-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center text-center relative group select-none ${cardStyle} ${
                    canClick
                      ? "cursor-pointer active:scale-95 hover:-translate-y-1"
                      : "cursor-default"
                  }`}
                >
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-3 shadow-inner transition-transform group-hover:scale-110 ${iconStyle}`}
                  >
                    <ThumbsDown className="w-7 h-7" />
                  </div>

                  <div className="text-xl sm:text-2xl font-black tracking-tight mb-1 text-rose-950 flex items-center gap-1.5">
                    <span>
                      {activeLang === "hi"
                        ? "असत्य (FALSE)"
                        : activeLang === "sa"
                        ? "अशुद्धम् (FALSE)"
                        : "FALSE"}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 font-medium max-w-[220px] mb-3">
                    This statement is inaccurate & false
                  </p>

                  <div className="flex items-center gap-1.5 mt-auto">
                    <span className="px-2 py-0.5 rounded-md bg-rose-100/80 text-rose-850 text-[10px] font-bold uppercase tracking-wider">
                      Key [F] or [2]
                    </span>
                    {badge}
                  </div>
                </button>
              );
            })()}
          </div>
        </div>
      </div>
      ) : (
        /* Multiple Choice Options (Dedicated scroll container so student doesn't have to scroll the whole app) */
        <div className="mb-6 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 px-1">
            <span>Select Your Answer ({displayOptions.length} Options):</span>
            <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200/50">
              Scroll options below ↕️
            </span>
          </div>
          <div className="max-h-[310px] sm:max-h-[370px] overflow-y-auto overscroll-contain pr-1 sm:pr-1.5 space-y-2.5 rounded-2xl border border-slate-200/60 bg-slate-50/30 p-2 shadow-inner focus:outline-none focus:ring-1 focus:ring-indigo-300">
            {displayOptions.map((option, idx) => {
              const isThisSelected = selectedAnswer === option;
              const isThisTheCorrectAnswer = option === question.correctAnswer;

              let optionStyle =
                "border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/30 text-slate-800";
              let badgeStyle = "bg-slate-100 text-slate-600 border-slate-200";

              if (isExamMode) {
                if (isThisSelected) {
                  optionStyle =
                    "border-indigo-600 bg-indigo-50/90 text-indigo-950 font-bold shadow-xs ring-2 ring-indigo-400/60";
                  badgeStyle = "bg-indigo-600 text-white border-indigo-600";
                } else {
                  optionStyle =
                    "border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/30 text-slate-800";
                  badgeStyle = "bg-slate-100 text-slate-600 border-slate-200";
                }
              } else if (isAnswered) {
                if (isThisTheCorrectAnswer) {
                  // Highlight the correct answer in green
                  optionStyle =
                    "border-emerald-500 bg-emerald-50/90 text-emerald-950 font-medium shadow-sm ring-1 ring-emerald-400";
                  badgeStyle = "bg-emerald-500 text-white border-emerald-500";
                } else if (isThisSelected && !isCorrect) {
                  // Student clicked the wrong answer
                  optionStyle =
                    "border-rose-500 bg-rose-50/90 text-rose-950 ring-1 ring-rose-400";
                  badgeStyle = "bg-rose-500 text-white border-rose-500";
                } else {
                  // Other unselected wrong answers
                  optionStyle =
                    "border-slate-200/80 bg-slate-50/60 text-slate-400 opacity-60";
                  badgeStyle = "bg-slate-200 text-slate-400 border-slate-300";
                }
              }

              return (
                <button
                  key={idx}
                  id={`option-${question.id}-${idx}`}
                  type="button"
                  disabled={!isExamMode && isAnswered}
                  onClick={() => handleOptionSelect(option)}
                  className={`w-full text-left p-3.5 sm:p-4 rounded-xl border transition-all flex items-start gap-3.5 relative group ${optionStyle} ${
                    !isAnswered || isExamMode ? "cursor-pointer active:scale-[0.99]" : "cursor-default"
                  }`}
                >
                  {/* Option indicator (A, B, C, D) */}
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border ${badgeStyle} transition-colors`}
                  >
                    {getOptionLetter(idx)}
                  </div>

                  {/* Option text */}
                  <div className="flex-1 text-sm sm:text-base leading-relaxed pt-0.5">
                    {option}
                  </div>

                  {/* Status Icons & Indicators */}
                  {isAnswered && !isExamMode && (
                    <div className="shrink-0 flex items-center gap-1.5 pt-0.5">
                      {isThisTheCorrectAnswer && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          {activeLang === "hi"
                            ? "सही उत्तर"
                            : activeLang === "sa"
                            ? "शुद्धमुत्तरम्"
                            : "Correct Answer"}
                        </span>
                      )}
                      {isThisSelected && !isCorrect && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-100/90 px-2 py-0.5 rounded-full">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          {activeLang === "hi"
                            ? "आपका उत्तर"
                            : activeLang === "sa"
                            ? "भवतः उत्तरम्"
                            : "Your Choice"}
                        </span>
                      )}
                    </div>
                  )}
                  {isExamMode && isThisSelected && (
                    <div className="shrink-0 flex items-center gap-1 text-xs font-bold text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full">
                      <span>Selected</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Instant Feedback & Pedagogical Explanation Box */}
      <AnimatePresence>
        {isAnswered && !isExamMode && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.25 }}
            className={`rounded-xl p-4 sm:p-5 border ${
              isCorrect
                ? "bg-emerald-50/70 border-emerald-200"
                : "bg-amber-50/80 border-amber-200"
            }`}
          >
            {/* 1. Header Banner: Explicit Correct/Incorrect Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-200/80">
              <div className="flex items-center gap-3">
                {isCorrect ? (
                  <div className="h-9 w-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/25 ring-2 ring-emerald-300">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="h-9 w-9 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-600/25 ring-2 ring-rose-300">
                    <XCircle className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        isCorrect
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "bg-rose-100 text-rose-800 border border-rose-300"
                      }`}
                    >
                      {isCorrect
                        ? activeLang === "hi"
                          ? "✅ सही उत्तर (+100 XP)"
                          : activeLang === "sa"
                          ? "✅ शुद्धमुत्तरम् (+100 XP)"
                          : "✅ Correct Answer (+100 XP)"
                        : activeLang === "hi"
                          ? "❌ गलत उत्तर"
                          : activeLang === "sa"
                          ? "❌ अशुद्धमुत्तरम्"
                          : "❌ Incorrect Answer"}
                    </span>
                  </div>
                  <h3
                    className={`text-sm sm:text-base font-extrabold mt-0.5 ${
                      isCorrect ? "text-emerald-950" : "text-rose-950"
                    }`}
                  >
                    {isCorrect
                      ? activeLang === "hi"
                        ? "उत्कृष्ट! आपका उत्तर बिल्कुल सही है! 🎉"
                        : activeLang === "sa"
                        ? "उत्तमम्! भवतः उत्तरं समीचीनम्! 🎉"
                        : "Great job! That's correct! 🎉"
                      : activeLang === "hi"
                        ? "यह उत्तर सही नहीं था — नीचे दी गई संकल्पना और व्याख्या देखें! 💪"
                        : activeLang === "sa"
                        ? "इदमुत्तरं न समीचीनम् — अधो दत्तां संकल्पनां पश्यतु! 💪"
                        : "Not quite right — review the core concept and explanation below! 💪"}
                  </h3>
                </div>
              </div>

              {/* Utility actions */}
              <div className="flex items-center gap-1.5 flex-wrap self-end sm:self-auto">
                {onOpenImagineCreativity && (
                  <button
                    type="button"
                    onClick={() => onOpenImagineCreativity(question.question)}
                    className="text-xs font-black text-amber-950 bg-gradient-to-r from-amber-300 to-amber-400 hover:from-amber-200 hover:to-amber-300 px-2.5 py-1 rounded-lg border border-amber-400 shadow-2xs inline-flex items-center gap-1.5 transition-all cursor-pointer"
                    title="Animate and simulate this question visually in Imagine Ur Creativity"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-900 fill-amber-900" />
                    <span>Animate Concept ✨</span>
                  </button>
                )}

                {onAskQuestion && (
                  <button
                    onClick={() => onAskQuestion(question)}
                    className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 inline-flex items-center gap-1 hover:underline shrink-0 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-200 cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Ask AI Help</span>
                  </button>
                )}

                {onClearAnswer && !isCorrect && (
                  <button
                    onClick={handleTryAgain}
                    className="text-xs font-bold text-slate-700 hover:text-slate-900 inline-flex items-center gap-1 bg-white hover:bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-300 shadow-2xs cursor-pointer transition-all"
                    title="Try answering again"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Try Again</span>
                  </button>
                )}
              </div>
            </div>

            {/* 2. Side-by-Side Answer Comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3.5">
              {/* Student's Answer */}
              <div
                className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                  isCorrect
                    ? "bg-emerald-100/60 border-emerald-300/80 text-emerald-950"
                    : "bg-rose-50 border-rose-200 text-rose-950"
                }`}
              >
                {isCorrect ? (
                  <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                ) : (
                  <X className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider block opacity-75">
                    {activeLang === "hi"
                      ? "आपका चुना हुआ उत्तर:"
                      : activeLang === "sa"
                      ? "भवता चितमुत्तरम्:"
                      : "Your Submitted Answer:"}
                  </span>
                  <div className="font-extrabold text-xs sm:text-sm mt-0.5 break-words">
                    {userOptionLetter ? `${userOptionLetter}. ` : ""}
                    {selectedAnswer || (
                      <span className="italic text-slate-500 font-normal">
                        No answer submitted
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Verified Correct Answer */}
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-start gap-2.5 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">
                    {activeLang === "hi"
                      ? "प्रमाणित सही उत्तर (Correct Answer):"
                      : activeLang === "sa"
                      ? "प्रमाणितं शुद्धमुत्तरम्:"
                      : "Verified Correct Answer:"}
                  </span>
                  <div className="font-extrabold text-xs sm:text-sm text-emerald-900 mt-0.5 break-words">
                    {correctOptionLetter ? `${correctOptionLetter}. ` : ""}
                    {question.correctAnswer}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Concept Tested Box */}
            <div className="p-3.5 rounded-xl bg-indigo-50/90 border border-indigo-200 text-indigo-950 mb-3 shadow-2xs">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="text-xs font-black uppercase tracking-wider text-indigo-900">
                  {activeLang === "hi"
                    ? "🎯 परीक्षित संकल्पना (Concept Tested):"
                    : activeLang === "sa"
                    ? "🎯 परीक्षिता संकल्पना (Concept Tested):"
                    : "🎯 Concept Tested:"}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-indigo-950 leading-relaxed pl-6">
                {displayConceptTested}
              </p>
            </div>

            {/* 4. Why the Correct Answer is Right Box */}
            <div className="p-4 rounded-xl bg-white border border-emerald-200/90 shadow-sm text-slate-800 mb-3 space-y-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                  {activeLang === "hi"
                    ? "💡 सही उत्तर क्यों सही है (Why It's Right):"
                    : activeLang === "sa"
                    ? "💡 शुद्धमुत्तरं किमर्थं समीचीनम्:"
                    : "💡 Why the Correct Answer is Right:"}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium pl-6 whitespace-pre-line">
                {displayWhyCorrect}
              </p>

              {/* Extended explanation if distinct */}
              {question.whyCorrect &&
                displayExplanation &&
                question.whyCorrect.trim() !== displayExplanation.trim() && (
                  <div className="pt-2 mt-2 border-t border-slate-100 pl-6 text-xs text-slate-600 leading-relaxed">
                    <strong className="font-bold text-slate-700 block mb-0.5">
                      {activeLang === "hi" ? "विस्तृत संदर्भ (Detailed Context):" : "Detailed Context:"}
                    </strong>
                    <span>{displayExplanation}</span>
                  </div>
                )}
            </div>

            {/* 5. Hint (if incorrect) */}
            {!isCorrect && (question.hint || question.funFactOrJoke) && (
              <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5 mb-3 shadow-2xs">
                <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold text-amber-950 block mb-0.5">
                    {activeLang === "hi" ? "💡 आपके लिए अध्ययन संकेत (Hint):" : "💡 Study Hint for Next Time:"}
                  </strong>
                  <span>
                    {question.hint ||
                      `Re-read the question carefully and focus on key terminology.`}
                  </span>
                </div>
              </div>
            )}

            {/* 6. Document Reference & Joke/Fun Fact */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {question.sourceReference && (
                <div className="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-white/80 px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span className="font-semibold text-slate-700">Source:</span>
                  <span>{question.sourceReference}</span>
                </div>
              )}

              {question.funFactOrJoke && (
                <div className="inline-flex items-center gap-1.5 text-xs text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/80 shadow-2xs">
                  <span className="text-sm shrink-0">🎭</span>
                  <span className="italic">{question.funFactOrJoke}</span>
                </div>
              )}

              {onOpenJokeBreak && (
                <button
                  onClick={() =>
                    onOpenJokeBreak(
                      question.sourceReference || "Quiz Topic",
                      question.question
                    )
                  }
                  className="text-xs font-semibold text-amber-800 hover:text-amber-950 inline-flex items-center gap-1 hover:underline bg-amber-100/80 hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200 cursor-pointer"
                  title="Take a quick fun joke break"
                >
                  <Smile className="w-3 h-3 text-amber-700" />
                  <span>Joke Break 😄</span>
                </button>
              )}

              {onOpenImagineCreativity && (
                <button
                  type="button"
                  onClick={() => onOpenImagineCreativity(question.question)}
                  className="text-xs font-semibold text-amber-900 hover:text-amber-950 inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 px-2.5 py-1 rounded-lg border border-amber-300 shadow-2xs cursor-pointer"
                  title="Animate and simulate this concept interactively in Imagine Ur Creativity"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-current" />
                  <span>Animate Concept ✨</span>
                </button>
              )}
            </div>

            {/* Next question prompt inside feedback */}
            {onNextQuestion && !isLastQuestion && (
              <div className="mt-4 pt-3 border-t border-slate-200/60 flex justify-end">
                <button
                  id={`next-btn-after-${question.id}`}
                  onClick={onNextQuestion}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {isLastQuestion && onFinishQuiz && (
              <div className="mt-4 pt-3 border-t border-slate-200/60 flex justify-end">
                <button
                  id="finish-quiz-bottom-btn"
                  onClick={onFinishQuiz}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
                >
                  <span>Finish Test & View Score Report</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
