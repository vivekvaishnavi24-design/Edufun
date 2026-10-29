import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  BarChart2,
  LayoutList,
  Layers,
  Sparkles,
  Award,
  Gamepad2,
  Smile,
  Flame,
  RotateCcw,
  BookOpen,
  GraduationCap,
  Mic,
  MicOff,
  Volume2
} from "lucide-react";
import { motion } from "motion/react";
import { GeneratedQuiz, QuizQuestion, ClassroomUserAuth } from "../types";
import { QuestionCard } from "./QuestionCard";
import { ExamModeHall } from "./ExamModeHall";
import { playSuccessSound, playIncorrectSound } from "../utils/audio";

interface QuizPlayerProps {
  quiz: GeneratedQuiz;
  userAnswers: Record<string, string>;
  onSelectAnswer: (questionId: string, answer: string) => void;
  onClearAnswer: (questionId: string) => void;
  onFinishQuiz: () => void;
  onAskQuestion?: (question: QuizQuestion) => void;
  onOpenJokeBreak?: (topic: string, questionContext?: string) => void;
  onOpenGames?: () => void;
  onRegenerateFreshQuiz?: () => void;
  onOpenNotes?: () => void;
  isRegenerating?: boolean;
  currentUser?: ClassroomUserAuth | null;
  onOpenImagineCreativity?: (questionPrompt?: string) => void;
}

export const QuizPlayer: React.FC<QuizPlayerProps> = ({
  quiz,
  userAnswers,
  onSelectAnswer,
  onClearAnswer,
  onFinishQuiz,
  onAskQuestion,
  onOpenJokeBreak,
  onOpenGames,
  onRegenerateFreshQuiz,
  onOpenNotes,
  isRegenerating = false,
  currentUser,
  onOpenImagineCreativity
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<"single" | "sheet">("single");
  const [isExamMode, setIsExamMode] = useState<boolean>(false);

  // Voice-controlled quiz mode state
  const [isVoiceMode, setIsVoiceMode] = useState<boolean>(false);
  const [voiceStatus, setVoiceStatus] = useState<string>("");
  const [lastHeard, setLastHeard] = useState<string>("");
  const [speechSupported, setSpeechSupported] = useState<boolean>(() => {
    return (
      typeof window !== "undefined" &&
      ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
    );
  });

  const totalQuestions = quiz.questions.length;
  const answeredCount = Object.keys(userAnswers).length;
  const progressPercent = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  // Voice answer handler with audio feedback
  const handleVoiceAnswer = (question: QuizQuestion, chosenAnswer: string) => {
    onSelectAnswer(question.id, chosenAnswer);
    const isCorrect = chosenAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
    if (isCorrect) {
      playSuccessSound();
      setVoiceStatus(`Selected "${chosenAnswer}" • Correct! 🎉`);
    } else {
      playIncorrectSound();
      setVoiceStatus(`Selected "${chosenAnswer}" • Incorrect ❌`);
    }

    // Auto-advance in single question mode after a brief delay
    if (viewMode === "single" && currentQuestionIndex < quiz.questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex((prev) => prev + 1);
      }, 1000);
    }
  };

  // Continuous speech recognition effect when Voice Quiz Mode is active
  useEffect(() => {
    if (!isVoiceMode) {
      setVoiceStatus("");
      setLastHeard("");
      return;
    }

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setSpeechSupported(false);
      setVoiceStatus("Voice recognition is not supported in this browser.");
      return;
    }

    let recognition: any = null;
    let shouldKeepListening = true;

    try {
      recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = quiz.language === "hi" ? "hi-IN" : "en-US";

      recognition.onstart = () => {
        setVoiceStatus("Listening... speak 'A', 'B', 'Option one', 'True', or 'False'");
      };

      recognition.onresult = (event: any) => {
        const lastResult = event.results[event.results.length - 1];
        if (!lastResult || !lastResult[0]) return;
        const rawTranscript = String(lastResult[0].transcript || "").trim();
        const transcript = rawTranscript.toLowerCase();
        setLastHeard(rawTranscript);

        const currentQ = quiz.questions[currentQuestionIndex];
        if (!currentQ) return;

        // Navigation voice commands
        if (transcript.includes("next") || transcript.includes("forward")) {
          if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
            setVoiceStatus("Moved to next question ➡️");
          }
          return;
        }
        if (transcript.includes("previous") || transcript.includes("back")) {
          if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex((prev) => prev - 1);
            setVoiceStatus("Moved to previous question ⬅️");
          }
          return;
        }
        if (transcript.includes("finish") || transcript.includes("submit") || transcript.includes("complete")) {
          onFinishQuiz();
          return;
        }

        // True / False detection
        if (currentQ.type === "true_false") {
          if (
            transcript.includes("true") ||
            transcript.includes("correct") ||
            transcript.includes("right") ||
            transcript === "t" ||
            transcript === "yes"
          ) {
            handleVoiceAnswer(currentQ, "True");
            return;
          }
          if (
            transcript.includes("false") ||
            transcript.includes("incorrect") ||
            transcript.includes("wrong") ||
            transcript === "f" ||
            transcript === "no"
          ) {
            handleVoiceAnswer(currentQ, "False");
            return;
          }
        }

        // Multiple choice options detection ('A', 'B', 'C', 'D' or 'Option 1', 'Option 2', etc.)
        let matchedChoice: string | null = null;

        // Option A / Option 1
        if (
          transcript === "a" ||
          transcript === "ay" ||
          transcript === "option a" ||
          transcript === "choice a" ||
          transcript === "option 1" ||
          transcript === "option one" ||
          transcript === "one" ||
          transcript === "1" ||
          transcript === "first" ||
          transcript.startsWith("option a")
        ) {
          matchedChoice = currentQ.options[0] || null;
        }
        // Option B / Option 2
        else if (
          transcript === "b" ||
          transcript === "be" ||
          transcript === "bee" ||
          transcript === "option b" ||
          transcript === "choice b" ||
          transcript === "option 2" ||
          transcript === "option two" ||
          transcript === "two" ||
          transcript === "to" ||
          transcript === "too" ||
          transcript === "2" ||
          transcript === "second" ||
          transcript.startsWith("option b")
        ) {
          matchedChoice = currentQ.options[1] || null;
        }
        // Option C / Option 3
        else if (
          transcript === "c" ||
          transcript === "see" ||
          transcript === "sea" ||
          transcript === "option c" ||
          transcript === "choice c" ||
          transcript === "option 3" ||
          transcript === "option three" ||
          transcript === "three" ||
          transcript === "3" ||
          transcript === "third" ||
          transcript.startsWith("option c")
        ) {
          matchedChoice = currentQ.options[2] || null;
        }
        // Option D / Option 4
        else if (
          transcript === "d" ||
          transcript === "dee" ||
          transcript === "the" ||
          transcript === "option d" ||
          transcript === "choice d" ||
          transcript === "option 4" ||
          transcript === "option four" ||
          transcript === "four" ||
          transcript === "for" ||
          transcript === "4" ||
          transcript === "fourth" ||
          transcript.startsWith("option d")
        ) {
          matchedChoice = currentQ.options[3] || null;
        }

        // Fallback: match by actual option text content
        if (!matchedChoice && Array.isArray(currentQ.options)) {
          for (const opt of currentQ.options) {
            const optLower = String(opt).toLowerCase().trim();
            if (optLower && (transcript.includes(optLower) || optLower.includes(transcript))) {
              matchedChoice = opt;
              break;
            }
          }
        }

        if (matchedChoice) {
          handleVoiceAnswer(currentQ, matchedChoice);
        } else {
          setVoiceStatus(`Heard "${rawTranscript}". Say 'A', 'B', 'C', 'D' or 'Option one'.`);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Web Speech API event:", event.error);
        if (event.error === "not-allowed") {
          shouldKeepListening = false;
          setVoiceStatus("Microphone access blocked. Please enable mic in your browser settings.");
        } else {
          setVoiceStatus("Listening... speak 'A', 'B', 'Option 1', 'True' or 'False'");
        }
      };

      recognition.onend = () => {
        if (shouldKeepListening && isVoiceMode) {
          try {
            recognition.start();
          } catch {}
        }
      };

      recognition.start();
    } catch (err) {
      console.warn("Speech recognition initialization error:", err);
      setVoiceStatus("Voice recognition could not start.");
    }

    return () => {
      shouldKeepListening = false;
      if (recognition) {
        try {
          recognition.stop();
        } catch {}
      }
    };
  }, [isVoiceMode, currentQuestionIndex, quiz.questions]);

  // If in Official Exam Hall Mode, render the dedicated exam experience
  if (isExamMode) {
    return (
      <ExamModeHall
        quiz={quiz}
        userAnswers={userAnswers}
        onSelectAnswer={onSelectAnswer}
        onClearAnswer={onClearAnswer}
        onFinishExam={onFinishQuiz}
        currentUser={currentUser}
        onExitExamMode={() => setIsExamMode(false)}
      />
    );
  }

  // Calculate live score
  const correctCount = quiz.questions.filter(
    (q) => userAnswers[q.id] === q.correctAnswer
  ).length;
  const incorrectCount = answeredCount - correctCount;
  const currentAccuracy =
    answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

  // Calculate consecutive streak
  let currentStreak = 0;
  for (let i = quiz.questions.length - 1; i >= 0; i--) {
    const q = quiz.questions[i];
    const ans = userAnswers[q.id];
    if (ans !== undefined) {
      if (ans === q.correctAnswer) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isAllAnswered = answeredCount === totalQuestions;

  return (
    <div className="space-y-6">
      {/* Quiz Top Control & Score Dashboard */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                Interactive Practice Test
              </span>
              {quiz.topicsCovered?.length > 0 && (
                <span className="text-xs text-slate-500 hidden sm:inline truncate max-w-xs">
                  {quiz.topicsCovered.slice(0, 3).join(", ")}
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              {quiz.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {quiz.summary}
            </p>
          </div>

          {/* Live stats and mode switch */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* View Mode Toggle */}
            <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode("single")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === "single"
                    ? "bg-white text-slate-900 shadow-sm font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Focus Mode
              </button>
              <button
                type="button"
                onClick={() => setViewMode("sheet")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === "sheet"
                    ? "bg-white text-slate-900 shadow-sm font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <LayoutList className="w-3.5 h-3.5" />
                All Questions
              </button>
            </div>

            {/* Fun & Games Actions */}
            {onOpenNotes && (
              <button
                type="button"
                onClick={onOpenNotes}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-all shadow-2xs hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                title="Generate interactive study notes for this topic"
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                <span>Study Notes 📝</span>
              </button>
            )}

            {onRegenerateFreshQuiz && (
              <button
                type="button"
                onClick={onRegenerateFreshQuiz}
                disabled={isRegenerating}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-all shadow-2xs hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                title="Generate a brand new set of questions on this topic"
              >
                <RotateCcw className={`w-3.5 h-3.5 text-slate-700 ${isRegenerating ? "animate-spin" : ""}`} />
                <span>{isRegenerating ? "Loading..." : "New Questions 🔄"}</span>
              </button>
            )}

            {onOpenGames && (
              <button
                type="button"
                onClick={onOpenGames}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 transition-all shadow-2xs hover:scale-[1.02] active:scale-[0.98]"
                title="Play quiz games"
              >
                <Gamepad2 className="w-3.5 h-3.5 text-violet-600" />
                <span>Play Games 🕹️</span>
              </button>
            )}

            {onOpenJokeBreak && (
              <button
                type="button"
                onClick={() =>
                  onOpenJokeBreak(quiz.title, currentQuestion?.question)
                }
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-all shadow-2xs"
                title="Take a quick 10-second funny joke break"
              >
                <Smile className="w-3.5 h-3.5 text-amber-600" />
                <span>Joke Break</span>
              </button>
            )}

            {/* Streak Multiplier */}
            {currentStreak >= 2 && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs animate-pulse">
                <Flame className="w-3.5 h-3.5" />
                <span>{currentStreak}x Streak!</span>
              </div>
            )}

            {/* Live Score Counter */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
              <div className="flex items-center gap-1 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{correctCount} Correct</span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1 text-rose-700 font-semibold">
                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>{incorrectCount} Missed</span>
              </div>
              {answeredCount > 0 && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="font-bold text-slate-800">
                    {currentAccuracy}%
                  </span>
                </>
              )}
            </div>

            {/* Voice-Controlled Quiz Mode Button */}
            <button
              type="button"
              onClick={() => setIsVoiceMode(!isVoiceMode)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                isVoiceMode
                  ? "bg-rose-500 text-white font-black shadow-rose-500/30 ring-2 ring-rose-400"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 hover:scale-[1.02] active:scale-[0.98]"
              }`}
              title="Voice Quiz Mode: Speak option labels ('A', 'B', 'Option one', 'True', 'False') to answer"
            >
              {isVoiceMode ? (
                <>
                  <Mic className="w-4 h-4 text-white animate-bounce" />
                  <span>Voice Mode ON 🎙️</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 text-slate-700" />
                  <span>Voice Mode 🎙️</span>
                </>
              )}
            </button>

            {/* Official Exam Hall Mode Button */}
            <button
              type="button"
              onClick={() => setIsExamMode(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black text-amber-950 bg-amber-400 hover:bg-amber-300 border border-amber-500/30 transition-all shadow-xs hover:scale-[1.02] cursor-pointer"
              title="Switch to Strict Official Examination Hall Mode with proctor monitoring and countdown timer"
            >
              <GraduationCap className="w-4 h-4 text-amber-900" />
              <span>Exam Hall Mode 🏛️</span>
            </button>

            {/* Finish Quiz Button */}
            <button
              id="finish-quiz-top-btn"
              onClick={onFinishQuiz}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                isAllAnswered
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 ring-2 ring-emerald-400"
                  : "bg-slate-900 hover:bg-slate-800 text-white"
              }`}
            >
              <Award className="w-4 h-4" />
              <span>{isAllAnswered ? "Complete Test & Report" : "Review & Finish"}</span>
            </button>
          </div>
        </div>

        {/* Quick Question Jump Strip */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 overflow-x-auto pb-1">
          <div className="text-xs font-semibold text-slate-500 shrink-0">
            Questions ({answeredCount}/{totalQuestions}):
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {quiz.questions.map((q, idx) => {
              const answer = userAnswers[q.id];
              const isAnswered = answer !== undefined;
              const isCorrect = isAnswered && answer === q.correctAnswer;
              const isCurrent = currentQuestionIndex === idx;

              let dotClass = "bg-slate-100 text-slate-600 border-slate-200 hover:border-slate-300";
              if (isAnswered) {
                if (isCorrect) {
                  dotClass = "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold";
                } else {
                  dotClass = "bg-rose-100 text-rose-800 border-rose-300 font-bold";
                }
              }

              return (
                <button
                  key={q.id}
                  id={`jump-question-${idx + 1}`}
                  onClick={() => {
                    setCurrentQuestionIndex(idx);
                    if (viewMode === "sheet") {
                      const el = document.getElementById(`question-card-${q.id}`);
                      el?.scrollIntoView({ behavior: "smooth", block: "center" });
                    }
                  }}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center border transition-all ${dotClass} ${
                    isCurrent && viewMode === "single"
                      ? "ring-2 ring-indigo-600 ring-offset-1 scale-105"
                      : ""
                  }`}
                  title={`Question ${idx + 1}: ${
                    !isAnswered ? "Unanswered" : isCorrect ? "Correct" : "Incorrect"
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Subtle Animated Progress Bar */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-slate-200/90 p-3.5 sm:p-4 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Quiz Completion</span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
              {answeredCount} of {totalQuestions} Answered
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isAllAnswered ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 animate-pulse">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                All Questions Answered! Ready for Results 🎉
              </span>
            ) : (
              <span className="font-mono font-bold text-slate-600">
                {Math.round(progressPercent)}% Complete
              </span>
            )}
          </div>
        </div>

        {/* Smooth Animated Progress Track */}
        <div className="relative h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
          <motion.div
            className={`h-full rounded-full transition-colors duration-500 ${
              isAllAnswered
                ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 shadow-sm shadow-emerald-400/50"
                : "bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400"
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Voice Mode Active Banner */}
      {isVoiceMode && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-rose-950 via-slate-900 to-indigo-950 text-white border border-rose-500/40 shadow-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/40">
              <Mic className="w-4 h-4 animate-pulse" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black uppercase text-rose-400 tracking-wider">
                  Voice Quiz Mode Active
                </span>
                {lastHeard && (
                  <span className="text-[11px] text-slate-200 font-mono bg-white/10 px-2 py-0.5 rounded-md truncate max-w-xs">
                    Heard: "{lastHeard}"
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 truncate">
                {voiceStatus || "Speak option label ('A', 'B', 'Option one', 'True', 'False', or 'Next')."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsVoiceMode(false)}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-200 transition-colors shrink-0 cursor-pointer"
          >
            Turn Off
          </button>
        </div>
      )}

      {/* Main Question Display */}
      {viewMode === "single" ? (
        <div className="space-y-4">
          <QuestionCard
            question={currentQuestion}
            questionIndex={currentQuestionIndex}
            totalQuestions={totalQuestions}
            selectedAnswer={userAnswers[currentQuestion.id]}
            onSelectAnswer={onSelectAnswer}
            onClearAnswer={onClearAnswer}
            onAskQuestion={onAskQuestion}
            onOpenJokeBreak={onOpenJokeBreak}
            onOpenImagineCreativity={onOpenImagineCreativity}
            onNextQuestion={() => {
              if (currentQuestionIndex < totalQuestions - 1) {
                setCurrentQuestionIndex((prev) => prev + 1);
              }
            }}
            isLastQuestion={currentQuestionIndex === totalQuestions - 1}
            onFinishQuiz={onFinishQuiz}
          />

          {/* Bottom Nav Buttons for Single Mode */}
          <div className="flex items-center justify-between pt-2">
            <button
              id="prev-question-btn"
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0))}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                currentQuestionIndex === 0
                  ? "border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50"
                  : "border-slate-200 text-slate-700 hover:bg-slate-100 bg-white shadow-sm"
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <span className="text-xs text-slate-500 font-medium">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </span>

            {currentQuestionIndex < totalQuestions - 1 ? (
              <button
                id="next-question-btn"
                onClick={() =>
                  setCurrentQuestionIndex((prev) =>
                    Math.min(prev + 1, totalQuestions - 1)
                  )
                }
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-100 bg-white shadow-sm transition-all"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                id="finish-from-nav-btn"
                onClick={onFinishQuiz}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all"
              >
                <span>View Results</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Sheet View: all questions visible */
        <div className="space-y-6">
          {quiz.questions.map((question, idx) => (
            <QuestionCard
              key={question.id}
              question={question}
              questionIndex={idx}
              totalQuestions={totalQuestions}
              selectedAnswer={userAnswers[question.id]}
              onSelectAnswer={onSelectAnswer}
              onClearAnswer={onClearAnswer}
              onAskQuestion={onAskQuestion}
              onOpenJokeBreak={onOpenJokeBreak}
              onOpenImagineCreativity={onOpenImagineCreativity}
            />
          ))}

          <div className="text-center py-6">
            <button
              id="finish-from-sheet-btn"
              onClick={onFinishQuiz}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all"
            >
              <Award className="w-4 h-4" />
              <span>Complete Test & View Results Report</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
