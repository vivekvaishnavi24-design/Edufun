import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  Flame,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Trophy,
  CheckCircle2,
  XCircle,
  Sparkles,
  Zap,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GeneratedQuiz } from '../types';
import {
  playSuccessSound,
  playIncorrectSound,
  playComboChime,
  playVictoryFanfare
} from '../utils/audio';
import { fireBottomLeftAndRightConfetti } from '../utils/quizUtils';

interface FactBusterGameProps {
  quiz: GeneratedQuiz;
  onBackToMenu: () => void;
}

interface FactStatement {
  id: string;
  statement: string;
  isTrue: boolean;
  explanation: string;
}

export const FactBusterGame: React.FC<FactBusterGameProps> = ({
  quiz,
  onBackToMenu
}) => {
  // Generate a bank of true & false statements from the quiz questions
  const factStatements: FactStatement[] = useMemo(() => {
    const list: FactStatement[] = [];

    quiz.questions.forEach((q, idx) => {
      // True statement based on correct answer
      list.push({
        id: `fact_true_${idx}`,
        statement: `${q.question.replace(/\?$/, '')} is correctly answered as: ${q.correctAnswer}.`,
        isTrue: true,
        explanation: q.explanation || `Confirmed! ${q.correctAnswer} is the correct fact.`
      });

      // False statement based on wrong option
      const wrongOpts = q.options.filter((opt) => opt !== q.correctAnswer);
      if (wrongOpts.length > 0) {
        const falseOpt = wrongOpts[0];
        list.push({
          id: `fact_false_${idx}`,
          statement: `${q.question.replace(/\?$/, '')} has ${falseOpt} as the primary proven cause.`,
          isTrue: false,
          explanation: `Busted! That's false. The actual answer is ${q.correctAnswer}.`
        });
      }
    });

    // Shuffle the statement bank
    return list.sort(() => Math.random() - 0.5);
  }, [quiz]);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(45);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [bonusText, setBonusText] = useState<string>('');
  const [lastResult, setLastResult] = useState<{ isCorrect: boolean; explanation: string } | null>(null);

  const currentFact = factStatements[currentIndex % factStatements.length];

  // Countdown timer
  useEffect(() => {
    if (!isActive || isGameOver) return;
    if (timeLeft <= 0) {
      setIsGameOver(true);
      setIsActive(false);
      playVictoryFanfare();
      fireBottomLeftAndRightConfetti();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, isGameOver, timeLeft]);

  // Restart game
  const handleRestart = () => {
    setCurrentIndex(0);
    setTimeLeft(45);
    setScore(0);
    setStreak(0);
    setLastResult(null);
    setIsGameOver(false);
    setIsActive(true);
  };

  // Evaluate candidate answer
  const handleAnswer = (choiceIsTrue: boolean) => {
    if (!currentFact || isGameOver) return;
    const isCorrect = choiceIsTrue === currentFact.isTrue;

    if (isCorrect) {
      playSuccessSound();
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      playComboChime(nextStreak);
      const points = 100 * (nextStreak >= 4 ? 3 : nextStreak >= 2 ? 2 : 1);
      setScore((prev) => prev + points);

      if (nextStreak % 3 === 0) {
        setTimeLeft((prev) => prev + 4);
        setBonusText('+4s Time Bonus! ⏱️');
        setTimeout(() => setBonusText(''), 1800);
      }
    } else {
      playIncorrectSound();
      setStreak(0);
    }

    setLastResult({
      isCorrect,
      explanation: currentFact.explanation
    });

    // Advance to next fact statement
    setCurrentIndex((prev) => prev + 1);
  };

  // Medal determination
  const medal =
    score >= 1200
      ? { label: 'Grand Fact Buster', emoji: '🥇', desc: 'Incredible speed & sharp knowledge!' }
      : score >= 600
      ? { label: 'Silver Truth Seeker', emoji: '🥈', desc: 'Fast reflex and great accuracy!' }
      : { label: 'Bronze Challenger', emoji: '🥉', desc: 'Good attempt, play again to beat your record!' };

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 text-white shadow-md flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`flex items-center gap-1.5 font-black text-xl sm:text-2xl ${
              timeLeft <= 10 ? 'text-amber-200 animate-pulse' : 'text-white'
            }`}
          >
            <Clock className="w-5 h-5" />
            <span>{timeLeft}s</span>
          </div>

          {streak > 1 && (
            <div className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-white text-orange-900 animate-bounce shadow-xs">
              <Flame className="w-3.5 h-3.5 text-orange-600" />
              <span>{streak}x Streak!</span>
            </div>
          )}

          {bonusText && (
            <div className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-400 text-emerald-950 animate-pulse">
              {bonusText}
            </div>
          )}
        </div>

        <div className="text-right">
          <div className="text-[10px] uppercase font-bold text-amber-200">Fact Score</div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono">
            {score} pts
          </div>
        </div>
      </div>

      {isGameOver ? (
        /* Game Over Performance Modal */
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-8 rounded-3xl bg-white border border-amber-200 text-center space-y-4 shadow-xl"
        >
          <div className="text-6xl animate-bounce">{medal.emoji}</div>
          <div>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 uppercase tracking-wider">
              {medal.label}
            </span>
            <h3 className="text-3xl font-black text-slate-900 mt-2">{score} Points!</h3>
            <p className="text-xs text-slate-500 mt-1">{medal.desc}</p>
          </div>

          <div className="flex justify-center gap-3 pt-3 flex-wrap">
            <button
              onClick={handleRestart}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-colors shadow-md cursor-pointer hover:scale-[1.02]"
            >
              Play Again ⚡
            </button>
            <button
              onClick={onBackToMenu}
              className="px-5 py-2.5 rounded-xl text-xs font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              All Games
            </button>
          </div>
        </motion.div>
      ) : (
        /* Active Game Card */
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="text-center space-y-1">
            <span className="text-xs font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              Statement #{currentIndex + 1}
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug pt-3 max-w-xl mx-auto">
              "{currentFact?.statement}"
            </h3>
          </div>

          {/* Large TRUE / FALSE Buttons */}
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto pt-2">
            <button
              type="button"
              onClick={() => handleAnswer(true)}
              className="p-6 rounded-2xl border-2 border-emerald-300 bg-gradient-to-b from-emerald-50 to-white hover:border-emerald-500 hover:bg-emerald-100/60 text-emerald-950 font-black text-xl flex flex-col items-center justify-center gap-2 shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <ThumbsUp className="w-6 h-6" />
              </div>
              <span>TRUE</span>
              <span className="text-[10px] font-bold text-emerald-700 uppercase">Key [T]</span>
            </button>

            <button
              type="button"
              onClick={() => handleAnswer(false)}
              className="p-6 rounded-2xl border-2 border-rose-300 bg-gradient-to-b from-rose-50 to-white hover:border-rose-500 hover:bg-rose-100/60 text-rose-950 font-black text-xl flex flex-col items-center justify-center gap-2 shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs">
                <ThumbsDown className="w-6 h-6" />
              </div>
              <span>FALSE</span>
              <span className="text-[10px] font-bold text-rose-700 uppercase">Key [F]</span>
            </button>
          </div>

          {/* Previous Result Feedback */}
          {lastResult && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 max-w-md mx-auto border ${
                lastResult.isCorrect
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : 'bg-rose-50 text-rose-900 border-rose-200'
              }`}
            >
              {lastResult.isCorrect ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span className="line-clamp-2">{lastResult.explanation}</span>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};
