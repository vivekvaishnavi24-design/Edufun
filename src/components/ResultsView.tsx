import React, { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import {
  Trophy,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  FileDown,
  Sparkles,
  ArrowRight,
  BookOpen,
  Filter,
  Check,
  X,
  Target,
  Gamepad2,
  Smile,
  Flame,
  Lightbulb
} from "lucide-react";
import { GeneratedQuiz, LearningStreak } from "../types";
import { isTrueFalseQuestion, checkTypedAnswer } from "../utils/quizUtils";

interface ResultsViewProps {
  quiz: GeneratedQuiz;
  userAnswers: Record<string, string>;
  onRetakeAll: () => void;
  onRetakeMissed: (missedQuestionIds: string[]) => void;
  onNewQuiz: () => void;
  onOpenPrint: () => void;
  onOpenGames?: () => void;
  onOpenJokeBreak?: () => void;
  onRegenerateFreshQuiz?: () => void;
  onOpenNotes?: () => void;
  onOpenImagineCreativity?: (questionText: string) => void;
  isRegenerating?: boolean;
  learningStreak?: LearningStreak;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  quiz,
  userAnswers,
  onRetakeAll,
  onRetakeMissed,
  onNewQuiz,
  onOpenPrint,
  onOpenGames,
  onOpenJokeBreak,
  onRegenerateFreshQuiz,
  onOpenNotes,
  onOpenImagineCreativity,
  isRegenerating = false,
  learningStreak
}) => {
  const [filter, setFilter] = useState<"all" | "missed" | "correct">("all");

  const totalQuestions = quiz.questions.length;
  const answeredCount = Object.keys(userAnswers).length;

  const correctQuestions = quiz.questions.filter(
    (q) => userAnswers[q.id] === q.correctAnswer
  );
  const missedQuestions = quiz.questions.filter(
    (q) => userAnswers[q.id] !== undefined && userAnswers[q.id] !== q.correctAnswer
  );
  const unansweredQuestions = quiz.questions.filter(
    (q) => userAnswers[q.id] === undefined
  );

  const score = correctQuestions.length;
  const percentage = Math.round((score / totalQuestions) * 100);

  // Breakdown by type
  const mcqQuestions = quiz.questions.filter((q) => q.type === "mcq");
  const tfQuestions = quiz.questions.filter((q) => q.type === "true_false");

  const mcqCorrect = mcqQuestions.filter(
    (q) => userAnswers[q.id] === q.correctAnswer
  ).length;
  const tfCorrect = tfQuestions.filter(
    (q) => userAnswers[q.id] === q.correctAnswer
  ).length;

  // Grade evaluation
  let gradeText = "Pass";
  let gradeColor = "text-emerald-700 bg-emerald-50 border-emerald-200";
  if (percentage >= 90) {
    gradeText = "A • Amazing Work!";
    gradeColor = "text-emerald-700 bg-emerald-50 border-emerald-200";
  } else if (percentage >= 80) {
    gradeText = "B+ • Great Job!";
    gradeColor = "text-blue-700 bg-blue-50 border-blue-200";
  } else if (percentage >= 70) {
    gradeText = "C+ • Good Effort!";
    gradeColor = "text-amber-700 bg-amber-50 border-amber-200";
  } else {
    gradeText = "Keep Practicing!";
    gradeColor = "text-rose-700 bg-rose-50 border-rose-200";
  }

  // Confetti on good score
  useEffect(() => {
    if (percentage >= 70) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Ignore in environments without canvas
      }
    }
  }, [percentage]);

  // Filter questions for the review list
  const filteredQuestions = quiz.questions.filter((q) => {
    const isCorrect = userAnswers[q.id] === q.correctAnswer;
    const isAnswered = userAnswers[q.id] !== undefined;

    if (filter === "correct") return isCorrect;
    if (filter === "missed") return isAnswered && !isCorrect;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Score Summary Card */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${gradeColor}`}>
                  {gradeText}
                </span>
                {quiz.subjectName && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    📚 {quiz.subjectName}
                    {quiz.educationLevel && ` • ${quiz.educationLevel.replace("_", " ")}`}
                  </span>
                )}
                <span className="text-xs text-slate-600">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                {score} / {totalQuestions} Questions Correct
              </h2>
              <p className="text-sm text-slate-600 mt-0.5">
                {quiz.title}
              </p>
            </div>
          </div>

          {/* Percentage Circular Badge */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                {percentage}%
              </div>
              <div className="text-xs font-semibold text-slate-600">
                Accuracy Score
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-6">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs font-medium text-slate-600">
              Total Questions
            </div>
            <div className="text-xl font-bold text-slate-900 mt-1">
              {totalQuestions}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
            <div className="text-xs font-medium text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Correct
            </div>
            <div className="text-xl font-bold text-emerald-900 mt-1">
              {score}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200">
            <div className="text-xs font-medium text-rose-700 flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" />
              Missed
            </div>
            <div className="text-xl font-bold text-rose-900 mt-1">
              {missedQuestions.length}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200">
            <div className="text-xs font-medium text-blue-700 flex items-center gap-1">
              <Target className="w-3.5 h-3.5" />
              MCQ vs T/F
            </div>
            <div className="text-sm font-bold text-blue-950 mt-1">
              MCQ: {mcqQuestions.length > 0 ? `${mcqCorrect}/${mcqQuestions.length}` : "N/A"}{" "}
              • T/F: {tfQuestions.length > 0 ? `${tfCorrect}/${tfQuestions.length}` : "N/A"}
            </div>
          </div>
        </div>

        {/* Learning Streak Banner */}
        {learningStreak && (
          <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-300/80 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Flame className="w-5 h-5 fill-white animate-pulse" />
              </div>
              <div>
                <div className="text-sm font-bold text-amber-950 flex items-center gap-2">
                  <span>Learning Streak: {learningStreak.count} {learningStreak.count === 1 ? "Day" : "Days"}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    ✓ Logged for Today!
                  </span>
                </div>
                <p className="text-xs text-amber-800/90 mt-0.5">
                  Great job practicing today! Complete another quiz tomorrow to reach {learningStreak.count + 1} consecutive days.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600 bg-white/80 px-2.5 py-1 rounded-lg border border-amber-200">
                🏆 Best: {learningStreak.bestStreak || learningStreak.count} Days
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {missedQuestions.length > 0 && (
            <button
              id="retake-missed-btn"
              onClick={() =>
                onRetakeMissed(missedQuestions.map((q) => q.id))
              }
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-sm shadow-amber-200 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry Missed ({missedQuestions.length})</span>
            </button>
          )}

          <button
            id="retake-all-btn"
            onClick={onRetakeAll}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try These Questions Again</span>
          </button>

          {onRegenerateFreshQuiz && (
            <button
              id="retake-fresh-questions-btn"
              onClick={onRegenerateFreshQuiz}
              disabled={isRegenerating}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 transition-all shadow-2xs hover:scale-[1.02] cursor-pointer"
              title="Generate a brand new set of questions on this exact topic"
            >
              <RotateCcw className={`w-4 h-4 text-amber-700 ${isRegenerating ? "animate-spin" : ""}`} />
              <span>{isRegenerating ? "Generating New Questions..." : "Practice New Questions 🔄"}</span>
            </button>
          )}

          {onOpenNotes && (
            <button
              id="results-notes-btn"
              onClick={onOpenNotes}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-all shadow-2xs hover:scale-[1.02] cursor-pointer"
              title="Open simple study notes for this topic"
            >
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Study Notes 📝</span>
            </button>
          )}

          <button
            id="results-print-btn"
            onClick={onOpenPrint}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 transition-all"
          >
            <FileDown className="w-4 h-4" />
            <span>Print / Save Quiz</span>
          </button>

          {onOpenGames && (
            <button
              id="results-games-btn"
              onClick={onOpenGames}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 transition-all shadow-2xs hover:scale-[1.02]"
              title="Play Boss Battle or Concept Match"
            >
              <Gamepad2 className="w-4 h-4 text-violet-600" />
              <span>Play Games 🕹️</span>
            </button>
          )}

          {onOpenJokeBreak && (
            <button
              id="results-joke-btn"
              onClick={onOpenJokeBreak}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-all shadow-2xs"
              title="Hear a fun study joke or pun"
            >
              <Smile className="w-4 h-4 text-amber-600" />
              <span>Joke Break</span>
            </button>
          )}

          <button
            id="results-new-quiz-btn"
            onClick={onNewQuiz}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all ml-auto"
          >
            <Sparkles className="w-4 h-4" />
            <span>New Test / All Subjects</span>
          </button>
        </div>
      </div>

      {/* Review Section */}
      <div className="space-y-4">
        {/* Review header & filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Interactive Question & Answer Review
            </h3>
            <p className="text-xs text-slate-500">
              Review correct answers and in-depth conceptual explanations for every question
            </p>
          </div>

          {/* Filter tabs */}
          <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                filter === "all"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All ({quiz.questions.length})
            </button>
            <button
              onClick={() => setFilter("missed")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                filter === "missed"
                  ? "bg-white text-rose-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Missed ({missedQuestions.length})
            </button>
            <button
              onClick={() => setFilter("correct")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                filter === "correct"
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Correct ({score})
            </button>
          </div>
        </div>

        {/* Questions list */}
        <div className="space-y-4">
          {filteredQuestions.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
              No questions match the current filter.
            </div>
          ) : (
            filteredQuestions.map((q, idx) => {
              const studentAnswer = userAnswers[q.id];
              const isAnswered = studentAnswer !== undefined;
              const isTrueFalse = isTrueFalseQuestion(q) || q.type === "true_false";
              const isTyped = q.type === "typed";
              const isCorrect = isAnswered && (
                isTyped
                  ? checkTypedAnswer(studentAnswer, q.correctAnswer, q.acceptedAnswers)
                  : studentAnswer === q.correctAnswer
              );
              const displayOptions = isTrueFalse
                ? ["True", "False"]
                : (q.options || []).filter((o) => !o.toLowerCase().startsWith("alternative"));

              return (
                <div
                  key={q.id}
                  id={`review-question-${q.id}`}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6"
                >
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-900 text-white">
                        Q{idx + 1}
                      </span>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          isTrueFalse
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : q.type === "mcq"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {isTrueFalse ? "True / False" : q.type === "mcq" ? "Multiple Choice" : "Typed Answer"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {onOpenImagineCreativity && (
                        <button
                          type="button"
                          onClick={() => onOpenImagineCreativity(q.question)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black text-amber-950 bg-gradient-to-r from-amber-300 to-amber-400 hover:from-amber-200 hover:to-amber-300 border border-amber-400 shadow-2xs transition-all cursor-pointer"
                          title="Animate and simulate this question visually in Imagine Ur Creativity"
                        >
                          <Sparkles className="w-3.5 h-3.5 fill-amber-900 text-amber-900" />
                          <span>Animate Concept ✨</span>
                        </button>
                      )}

                      <div
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          isCorrect
                            ? "bg-emerald-100 text-emerald-800"
                            : isAnswered
                            ? "bg-rose-100 text-rose-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {isCorrect ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Correct</span>
                          </>
                        ) : isAnswered ? (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Incorrect</span>
                          </>
                        ) : (
                          <span>Skipped / Unanswered</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <h4 className="text-base sm:text-lg font-semibold text-slate-900 mb-4">
                    {q.question}
                  </h4>

                  {/* Options review or Typed review */}
                  {isTyped ? (
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2 mb-4 text-xs sm:text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-600">Your Answer:</span>
                        <span className={`font-mono font-bold px-2 py-0.5 rounded ${isCorrect ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                          {studentAnswer || "(Not answered)"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-600">Expected:</span>
                        <span className="font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-200">
                          {q.correctAnswer}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className={`grid gap-2 mb-4 ${isTrueFalse ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
                      {displayOptions.map((opt, optIdx) => {
                        const isChosen = studentAnswer === opt;
                        const isAnswer = opt === q.correctAnswer;

                        let rowClass = "border-slate-200 bg-slate-50/50 text-slate-600";
                        if (isAnswer) {
                          rowClass =
                            "border-emerald-500 bg-emerald-50/90 text-emerald-950 font-semibold ring-1 ring-emerald-400";
                        } else if (isChosen && !isCorrect) {
                          rowClass =
                            "border-rose-400 bg-rose-50 text-rose-950 ring-1 ring-rose-300";
                        }

                        return (
                          <div
                            key={optIdx}
                            className={`p-3 rounded-xl border text-sm flex items-center justify-between gap-3 ${rowClass}`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-md bg-white border border-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
                                {isTrueFalse
                                  ? opt.toLowerCase() === "true" ? "T" : "F"
                                  : String.fromCharCode(65 + optIdx)}
                              </span>
                              <span className="font-medium">{opt}</span>
                            </div>

                            <div className="flex items-center gap-2 text-xs font-bold shrink-0">
                              {isAnswer && (
                                <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  Correct Answer
                                </span>
                              )}
                              {isChosen && !isCorrect && (
                                <span className="text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <X className="w-3 h-3 text-rose-600" />
                                  Your Choice
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* 1. Concept Tested Box */}
                  <div className="p-3.5 rounded-xl bg-indigo-50/90 border border-indigo-200 text-indigo-950 mb-3 shadow-2xs">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span className="text-xs font-black uppercase tracking-wider text-indigo-900">
                        🎯 Concept Tested:
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-indigo-950 leading-relaxed pl-6">
                      {q.conceptTested || q.questionSummary || `${quiz.title} • Foundational Core Concept`}
                    </p>
                  </div>

                  {/* 2. Why the Correct Answer is Right Box */}
                  <div className="p-4 rounded-xl bg-white border border-emerald-300/80 shadow-2xs text-slate-800 mb-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                      <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                        💡 Why the Correct Answer is Right:
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium pl-6 whitespace-pre-line">
                      {q.whyCorrect || q.explanation}
                    </p>

                    {/* Extended context if whyCorrect and explanation are distinct */}
                    {q.whyCorrect && q.explanation && q.whyCorrect.trim() !== q.explanation.trim() && (
                      <div className="pt-2 mt-2 border-t border-slate-100 pl-6 text-xs text-slate-600 leading-relaxed">
                        <strong className="font-bold text-slate-700 block mb-0.5">
                          Detailed Context:
                        </strong>
                        <span>{q.explanation}</span>
                      </div>
                    )}
                  </div>

                  {/* 3. Source Reference & Hint */}
                  {(q.sourceReference || q.hint) && (
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                      {q.sourceReference && (
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span className="font-medium text-slate-700">Source:</span>
                          <span>{q.sourceReference}</span>
                        </div>
                      )}
                      {q.hint && (
                        <div className="flex items-center gap-1.5 text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          <span className="font-bold">Hint:</span>
                          <span>{q.hint}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
