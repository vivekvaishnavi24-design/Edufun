import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert,
  Clock,
  Flag,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Award,
  Printer,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  Send,
  Eye,
  Check,
  X,
  FileCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GeneratedQuiz, ClassroomUserAuth } from '../types';
import { QuestionCard } from './QuestionCard';
import { recordStudentQuizResult } from '../utils/classroomStorage';
import { playSuccessSound, playIncorrectSound, playVictoryFanfare } from '../utils/audio';
import { fireBottomLeftAndRightConfetti } from '../utils/quizUtils';
import { UserAvatar } from './UserAvatar';

interface ExamModeHallProps {
  quiz: GeneratedQuiz;
  userAnswers: Record<string, string>;
  onSelectAnswer: (questionId: string, answer: string) => void;
  onClearAnswer: (questionId: string) => void;
  onFinishExam: () => void;
  currentUser?: ClassroomUserAuth | null;
  onExitExamMode: () => void;
}

export const ExamModeHall: React.FC<ExamModeHallProps> = ({
  quiz,
  userAnswers,
  onSelectAnswer,
  onClearAnswer,
  onFinishExam,
  currentUser,
  onExitExamMode
}) => {
  const totalQuestions = quiz.questions.length;
  // Exam timer: 90 seconds per question (e.g. 5 questions = 7.5 mins, 10 questions = 15 mins)
  const defaultExamDuration = Math.max(totalQuestions * 90, 300);
  const [timeLeft, setTimeLeft] = useState<number>(defaultExamDuration);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [markedForReviewIds, setMarkedForReviewIds] = useState<Set<string>>(new Set());

  // Proctor monitoring state
  const [tabSwitchCount, setTabSwitchCount] = useState<number>(0);
  const [tabSwitchWarning, setTabSwitchWarning] = useState<string | null>(null);
  const [proctorAuditEvents, setProctorAuditEvents] = useState<string[]>([]);

  // Submission & Marksheet state
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [isExamSubmitted, setIsExamSubmitted] = useState<boolean>(false);
  const [examEndTime, setExamEndTime] = useState<Date | null>(null);

  // Candidate info
  const candidateName = currentUser?.userName || 'Candidate Student';
  const candidateRoll = currentUser?.rollNumber || 'EXAM-2026';
  const groupName = currentUser?.groupName || 'Academic Exam Hall';

  // Track tab visibility changes / focus loss
  useEffect(() => {
    if (isExamSubmitted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => {
          const next = prev + 1;
          const timeStr = new Date().toLocaleTimeString();
          const eventMsg = `Tab focus lost at ${timeStr} (Event #${next})`;
          setProctorAuditEvents((events) => [...events, eventMsg]);
          setTabSwitchWarning(
            `⚠️ Proctor Notice: Focus lost or tab switch detected (${next}). Logged for official audit.`
          );
          return next;
        });
      }
    };

    const handleWindowBlur = () => {
      // Window lost focus
      setTabSwitchCount((prev) => {
        const next = prev + 1;
        const timeStr = new Date().toLocaleTimeString();
        const eventMsg = `Window blurred at ${timeStr} (Event #${next})`;
        setProctorAuditEvents((events) => [...events, eventMsg]);
        setTabSwitchWarning(
          `⚠️ Proctor Notice: Window blur detected (${next}). Please keep exam full screen.`
        );
        return next;
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [isExamSubmitted]);

  // Exam Countdown Timer
  useEffect(() => {
    if (isExamSubmitted) return;
    if (timeLeft <= 0) {
      handleFinalSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isExamSubmitted, timeLeft]);

  const toggleMarkForReview = (questionId: string) => {
    setMarkedForReviewIds((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  const answeredCount = Object.keys(userAnswers).length;
  const unansweredCount = totalQuestions - answeredCount;
  const markedCount = markedForReviewIds.size;

  // Format MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Submit and calculate results
  const handleFinalSubmit = () => {
    setShowSubmitModal(false);
    setIsExamSubmitted(true);
    setExamEndTime(new Date());

    // Calculate score
    const correctCount = quiz.questions.filter(
      (q) => userAnswers[q.id] === q.correctAnswer
    ).length;
    const finalScore = correctCount * 10;

    // Record into classroom group podium if student belongs to a group
    if (currentUser?.groupId) {
      recordStudentQuizResult(currentUser.groupId, candidateName, finalScore);
    }

    playVictoryFanfare();
    fireBottomLeftAndRightConfetti();
  };

  // Print official marksheet
  const handlePrintMarksheet = () => {
    window.print();
  };

  // Correct calculation for marksheet
  const correctCount = quiz.questions.filter(
    (q) => userAnswers[q.id] === q.correctAnswer
  ).length;
  const percentage = Math.round((correctCount / totalQuestions) * 100);

  const getGrade = (pct: number) => {
    if (pct >= 90) return { letter: 'A+', label: 'Distinction / Outstanding' };
    if (pct >= 80) return { letter: 'A', label: 'First Division / Excellent' };
    if (pct >= 70) return { letter: 'B+', label: 'Very Good' };
    if (pct >= 60) return { letter: 'B', label: 'Good Passing Grade' };
    if (pct >= 50) return { letter: 'C', label: 'Satisfactory' };
    return { letter: 'D', label: 'Needs Improvement / Re-test' };
  };

  const gradeInfo = getGrade(percentage);
  const currentQuestion = quiz.questions[currentIdx];

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* 1. Exam Header Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-indigo-900/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-md shrink-0">
              🏛️
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-800">
                  Official Exam Hall
                </span>
                <span className="text-xs text-slate-300 font-bold">
                  {quiz.title}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300 mt-1 flex-wrap">
                <span>Candidate: <strong className="text-white font-bold">{candidateName}</strong></span>
                <span>•</span>
                <span>Roll: <strong className="text-white font-bold">{candidateRoll}</strong></span>
                <span>•</span>
                <span>Group: <strong className="text-indigo-300 font-bold">{groupName}</strong></span>
              </div>
            </div>
          </div>

          {/* Timer & Proctor Status */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-black transition-colors ${
                timeLeft <= 120
                  ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse'
                  : 'bg-slate-800/80 border-slate-700 text-amber-400'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{formatTime(timeLeft)} remaining</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              <span>Proctor: Active</span>
              {tabSwitchCount > 0 && (
                <span className="px-1.5 py-0.2 rounded bg-rose-500 text-white font-black text-[10px]">
                  {tabSwitchCount} alert{tabSwitchCount > 1 ? 's' : ''}
                </span>
              )}
            </div>

            {!isExamSubmitted && (
              <button
                type="button"
                onClick={onExitExamMode}
                className="px-3 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Exit Exam Hall
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Proctor Warning Banner if Tab Switched */}
      {tabSwitchWarning && !isExamSubmitted && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold flex items-center justify-between gap-3 shadow-xs"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{tabSwitchWarning}</span>
          </div>
          <button
            type="button"
            onClick={() => setTabSwitchWarning(null)}
            className="text-rose-500 hover:text-rose-700 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* 2. SUBMITTED STATE: OFFICIAL MARKSHEET */}
      {isExamSubmitted ? (
        <div id="exam-marksheet-section" className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Marksheet Official Header */}
          <div className="p-6 sm:p-8 bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white border-b border-indigo-800 text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-white/10 text-white flex items-center justify-center mx-auto text-3xl shadow-inner border border-white/20">
              📜
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-amber-400 text-amber-950 tracking-wider">
              Official Examination Marksheet
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{quiz.title}</h2>
            <p className="text-xs text-indigo-200">
              Exam Evaluated On {examEndTime ? examEndTime.toLocaleString() : new Date().toLocaleString()}
            </p>
          </div>

          {/* Marksheet Details Grid */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 font-bold uppercase tracking-wider block text-[10px]">Candidate Name</span>
                <span className="text-sm font-black text-slate-900">{candidateName}</span>
              </div>
              <div>
                <span className="text-slate-500 font-bold uppercase tracking-wider block text-[10px]">Roll / ID Number</span>
                <span className="text-sm font-black text-slate-900">{candidateRoll}</span>
              </div>
              <div>
                <span className="text-slate-500 font-bold uppercase tracking-wider block text-[10px]">Classroom Group</span>
                <span className="text-sm font-black text-slate-900">{groupName}</span>
              </div>
              <div>
                <span className="text-slate-500 font-bold uppercase tracking-wider block text-[10px]">Proctor Audit</span>
                <span className={`text-sm font-black ${tabSwitchCount === 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {tabSwitchCount === 0 ? 'Integrity Verified (0 switches)' : `${tabSwitchCount} Tab switch(es)`}
                </span>
              </div>
            </div>

            {/* Score & Grade Display */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 p-6 rounded-2xl bg-gradient-to-r from-indigo-50 via-white to-violet-50 border border-indigo-200 text-center">
              <div>
                <div className="text-4xl sm:text-5xl font-black text-indigo-950 font-mono">
                  {correctCount} / {totalQuestions}
                </div>
                <div className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">
                  Total Score ({percentage}%)
                </div>
              </div>

              <div className="h-12 w-px bg-slate-200 hidden sm:block" />

              <div>
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white font-black text-2xl shadow-md">
                  {gradeInfo.letter}
                </div>
                <div className="text-xs font-bold text-indigo-900 mt-1">
                  {gradeInfo.label}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handlePrintMarksheet}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-md cursor-pointer hover:scale-[1.02]"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Marksheet</span>
              </button>
              <button
                type="button"
                onClick={onFinishExam}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md cursor-pointer hover:scale-[1.02]"
              >
                <FileCheck className="w-4 h-4" />
                <span>View Full Question Answers & Explanations</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* 3. ACTIVE EXAMINATION MODE */
        <div className="space-y-4">
          {/* Question Palette / Matrix */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between text-xs flex-wrap gap-2">
              <span className="font-bold text-slate-700 uppercase tracking-wider">
                Question Palette ({answeredCount}/{totalQuestions} Answered)
              </span>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1 font-semibold text-indigo-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" /> Answered ({answeredCount})
                </span>
                <span className="flex items-center gap-1 font-semibold text-slate-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> Unanswered ({unansweredCount})
                </span>
                <span className="flex items-center gap-1 font-semibold text-purple-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Review ({markedCount})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {quiz.questions.map((q, idx) => {
                const isAnswered = userAnswers[q.id] !== undefined;
                const isMarked = markedForReviewIds.has(q.id);
                const isCurrent = currentIdx === idx;

                let chipStyle = 'bg-slate-100 text-slate-600 border-slate-200';
                if (isAnswered) {
                  chipStyle = 'bg-indigo-600 text-white border-indigo-600 font-bold';
                }
                if (isMarked) {
                  chipStyle = 'bg-purple-600 text-white border-purple-600 font-bold';
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIdx(idx)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold flex items-center justify-center border transition-all cursor-pointer ${chipStyle} ${
                      isCurrent ? 'ring-3 ring-indigo-400 ring-offset-1 scale-105 shadow-xs' : ''
                    }`}
                  >
                    {idx + 1}
                    {isMarked && <span className="text-[9px] -mr-1">🚩</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Question Card in Exam Mode */}
          <QuestionCard
            question={currentQuestion}
            questionIndex={currentIdx}
            totalQuestions={totalQuestions}
            selectedAnswer={userAnswers[currentQuestion.id]}
            onSelectAnswer={onSelectAnswer}
            onClearAnswer={onClearAnswer}
            isExamMode={true}
            isMarkedForReview={markedForReviewIds.has(currentQuestion.id)}
            onToggleMarkForReview={toggleMarkForReview}
            onNextQuestion={() => {
              if (currentIdx < totalQuestions - 1) {
                setCurrentIdx((prev) => prev + 1);
              }
            }}
            isLastQuestion={currentIdx === totalQuestions - 1}
          />

          {/* Navigation & Submit Bar */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs gap-3">
            <button
              type="button"
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx((prev) => Math.max(prev - 1, 0))}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 hover:scale-[1.02] transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Submit Examination</span>
            </button>

            <button
              type="button"
              disabled={currentIdx === totalQuestions - 1}
              onClick={() => setCurrentIdx((prev) => Math.min(prev + 1, totalQuestions - 1))}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Pre-Submission Review Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl font-black">
                📋
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Ready to Submit Examination?
                </h3>
                <p className="text-xs text-slate-500">
                  Please review your question status before finalizing.
                </p>
              </div>
            </div>

            {/* Audit Status Matrix */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-600">Total Questions:</span>
                <span className="font-black text-slate-900">{totalQuestions}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-700">Answered Questions:</span>
                <span className="font-black text-emerald-700">{answeredCount}</span>
              </div>
              {unansweredCount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-700">Unanswered Questions:</span>
                  <span className="font-black text-rose-700">{unansweredCount}</span>
                </div>
              )}
              {markedCount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-700">Marked for Review:</span>
                  <span className="font-black text-purple-700">{markedCount}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                <span className="font-bold text-slate-600">Tab Switch Events:</span>
                <span className={`font-black ${tabSwitchCount === 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {tabSwitchCount}
                </span>
              </div>
            </div>

            {unansweredCount > 0 && (
              <p className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                ⚠️ You have <strong>{unansweredCount}</strong> unanswered questions remaining. You can go back and answer them or proceed with submission.
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 border border-slate-200 hover:bg-slate-50 cursor-pointer"
              >
                Return to Exam
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                className="px-5 py-2 rounded-xl text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-md cursor-pointer"
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
