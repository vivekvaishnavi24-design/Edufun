import React, { useState, useEffect, useMemo } from 'react';
import {
  RotateCcw,
  Sparkles,
  Lightbulb,
  Award,
  CheckCircle2,
  ChevronRight,
  Flame,
  Shuffle,
  HelpCircle,
  Trophy,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GeneratedQuiz } from '../types';
import {
  playSuccessSound,
  playIncorrectSound,
  playComboChime,
  playVictoryFanfare,
  playCardFlipSound
} from '../utils/audio';
import { fireBottomLeftAndRightConfetti } from '../utils/quizUtils';

interface WordScrambleGameProps {
  quiz: GeneratedQuiz;
  onBackToMenu: () => void;
}

interface ScrambleItem {
  id: string;
  word: string;
  hint: string;
  category: string;
}

export const WordScrambleGame: React.FC<WordScrambleGameProps> = ({
  quiz,
  onBackToMenu
}) => {
  // Extract key vocabulary terms directly from the chapter, topics, and quiz questions
  const vocabularyItems: ScrambleItem[] = useMemo(() => {
    const list: ScrambleItem[] = [];
    const seenWords = new Set<string>();

    const STOP_WORDS = new Set([
      'WHAT', 'WHICH', 'WHERE', 'WHEN', 'WHOSE', 'WHOM', 'THERE', 'THEIR', 'THESE', 'THOSE',
      'ABOUT', 'AFTER', 'BEFORE', 'DURING', 'UNDER', 'OVER', 'BETWEEN', 'AMONG', 'THROUGH',
      'BECAUSE', 'ALTHOUGH', 'HOWEVER', 'THEREFORE', 'WHEREAS', 'DESPITE', 'EITHER', 'NEITHER',
      'SELECT', 'CHOOSE', 'ANSWER', 'OPTION', 'CHOICE', 'QUESTION', 'STATEMENT', 'CORRECT',
      'INCORRECT', 'FOLLOWING', 'DESCRIBE', 'EXPLAIN', 'DETERMINE', 'ACCORDING', 'REGARDING',
      'ALTERNATIVE', 'ABOVE', 'BELOW', 'NONE', 'TRUE', 'FALSE', 'SOME', 'MANY', 'EVERY',
      'FIRST', 'SECOND', 'THIRD', 'FOURTH', 'ANOTHER', 'GIVEN', 'CALLED', 'KNOWN', 'TERMED',
      'MEANS', 'DEFINED', 'EXAMPLE', 'PROCESS', 'SYSTEM', 'METHOD', 'STUDY', 'CHAPTER',
      'SECTION', 'TOPIC', 'QUIZ', 'TEST', 'STUDENT', 'SCHOOL', 'GRADE', 'CLASS', 'EXAM',
      'COURSE', 'MODULE', 'UNIT', 'PART', 'PAGE', 'BOOK', 'LEARN', 'PRACTICE', 'REVIEW',
      'SUMMARY', 'OVERVIEW', 'INTRODUCTION', 'CONCLUSION', 'RESULT', 'SCORE', 'LEVEL',
      'GENERAL', 'COMMON', 'SIMPLE', 'BASIC', 'ADVANCED', 'NUMBER', 'LETTER', 'TOTAL',
      'FOUND', 'USING', 'BASED', 'WHETHER', 'INDICATE', 'PROVIDE', 'CONTAIN', 'INCLUDE'
    ]);

    const addWordIfValid = (raw: string, hint: string, category: string) => {
      // Split into single words if multiple words passed
      const tokens = raw.trim().split(/[\s,/:;-]+/);
      tokens.forEach((t) => {
        const clean = t.trim().toUpperCase().replace(/[^A-Z]/g, '');
        if (
          clean.length >= 4 &&
          clean.length <= 13 &&
          !STOP_WORDS.has(clean) &&
          !seenWords.has(clean)
        ) {
          seenWords.add(clean);
          list.push({
            id: `scramble_${list.length}_${clean}`,
            word: clean,
            hint,
            category
          });
        }
      });
    };

    // 1. Extract from topicsCovered (highest relevance directly to the chapter syllabus)
    if (Array.isArray(quiz.topicsCovered) && quiz.topicsCovered.length > 0) {
      quiz.topicsCovered.forEach((topic) => {
        const cleanTopic = topic.trim();
        addWordIfValid(
          cleanTopic,
          `Key concept from the chapter syllabus topic: "${cleanTopic}"`,
          `Topic: ${cleanTopic}`
        );
      });
    }

    // 2. Extract key terms from questions and answers
    quiz.questions.forEach((q, idx) => {
      const topicTag = quiz.topicsCovered?.[idx % (quiz.topicsCovered?.length || 1)] || quiz.subjectName || `Chapter Topic ${idx + 1}`;
      const ans = q.correctAnswer.trim();
      const ansUpper = ans.toUpperCase();

      if (ansUpper !== 'TRUE' && ansUpper !== 'FALSE') {
        addWordIfValid(
          ans,
          q.hint || q.explanation || `Core solution concept for Question ${idx + 1} (${topicTag})`,
          topicTag
        );
      }

      // Also extract capitalized technical terminology from the question explanation & summary
      const contextText = `${q.explanation || ''} ${q.questionSummary || ''} ${q.question || ''}`;
      const matches = contextText.match(/\b[A-Z][a-z]{3,12}\b/g) || [];
      for (const m of matches) {
        if (!STOP_WORDS.has(m.toUpperCase())) {
          addWordIfValid(
            m,
            q.hint || q.explanation || `Key chapter term from ${topicTag}`,
            topicTag
          );
          if (list.length >= 16) break;
        }
      }
    });

    // 3. Extract words from quiz title and subjectName
    const subjectLabel = quiz.subjectName || quiz.title || 'Chapter Subject';
    const titleWords = `${quiz.title || ''} ${quiz.subjectName || ''}`
      .replace(/[^a-zA-Z\s]/g, ' ')
      .split(/\s+/);
    titleWords.forEach((tw) => {
      addWordIfValid(
        tw,
        `Main chapter theme: ${quiz.title}`,
        subjectLabel
      );
    });

    // 4. Final subject fallback if needed
    if (list.length === 0) {
      const cleanSubject = subjectLabel
        .replace(/[^a-zA-Z\s]/g, '')
        .toUpperCase()
        .split(/\s+/)
        .filter((w) => w.length >= 4 && !STOP_WORDS.has(w));

      if (cleanSubject.length > 0) {
        cleanSubject.forEach((w, i) => {
          list.push({
            id: `fallback_${i}_${w}`,
            word: w,
            hint: `Mastery keyword directly tied to ${quiz.title}`,
            category: subjectLabel
          });
        });
      }
    }

    return list.slice(0, 16);
  }, [quiz]);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const currentItem = vocabularyItems[currentIndex % vocabularyItems.length];

  // Scrambled letters tiles state
  const [availableTiles, setAvailableTiles] = useState<{ id: string; letter: string; used: boolean }[]>([]);
  const [placedTiles, setPlacedTiles] = useState<{ id: string; letter: string }[]>([]);
  const [isWordComplete, setIsWordComplete] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [isShaking, setIsShaking] = useState<boolean>(false);

  // Setup current scramble word
  useEffect(() => {
    if (!currentItem) return;
    const cleanWord = currentItem.word.replace(/\s+/g, '');
    const letters = cleanWord.split('').map((letter, i) => ({
      id: `${currentIndex}_${i}_${letter}`,
      letter,
      used: false
    }));

    // Deterministically or randomly shuffle
    const shuffled = [...letters].sort(() => Math.random() - 0.5);
    // ensure it's not identical to the target word
    if (shuffled.map((t) => t.letter).join('') === cleanWord && shuffled.length > 2) {
      shuffled.reverse();
    }

    setAvailableTiles(shuffled);
    setPlacedTiles([]);
    setIsWordComplete(false);
    setShowHint(false);
  }, [currentIndex, currentItem]);

  const targetWordClean = currentItem ? currentItem.word.replace(/\s+/g, '') : '';
  const currentSpelled = placedTiles.map((t) => t.letter).join('');

  // Handle tile click to place
  const handleSelectTile = (tile: { id: string; letter: string; used: boolean }) => {
    if (tile.used || isWordComplete) return;
    playCardFlipSound();

    const newPlaced = [...placedTiles, { id: tile.id, letter: tile.letter }];
    setPlacedTiles(newPlaced);

    setAvailableTiles((prev) =>
      prev.map((t) => (t.id === tile.id ? { ...t, used: true } : t))
    );

    // Check if full length reached
    if (newPlaced.length === targetWordClean.length) {
      const spelled = newPlaced.map((t) => t.letter).join('');
      if (spelled === targetWordClean) {
        // Success!
        setIsWordComplete(true);
        playSuccessSound();
        const nextStreak = streak + 1;
        setStreak(nextStreak);
        playComboChime(nextStreak);
        setScore((prev) => prev + 150 * (nextStreak >= 3 ? 2 : 1));
        fireBottomLeftAndRightConfetti();
      } else {
        // Wrong spelling -> shake and sound
        playIncorrectSound();
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
      }
    }
  };

  // Handle removing a placed tile
  const handleRemovePlaced = (index: number) => {
    if (isWordComplete) return;
    playCardFlipSound();
    const removed = placedTiles[index];
    const newPlaced = placedTiles.filter((_, i) => i !== index);
    setPlacedTiles(newPlaced);

    setAvailableTiles((prev) =>
      prev.map((t) => (t.id === removed.id ? { ...t, used: false } : t))
    );
  };

  // Clear all placed tiles back
  const handleClearAll = () => {
    playCardFlipSound();
    setPlacedTiles([]);
    setAvailableTiles((prev) => prev.map((t) => ({ ...t, used: false })));
  };

  // Reshuffle available tiles
  const handleReshuffle = () => {
    playCardFlipSound();
    setAvailableTiles((prev) => [...prev].sort(() => Math.random() - 0.5));
  };

  // Reveal next correct letter hint powerup
  const handleRevealNextLetter = () => {
    if (isWordComplete) return;
    const nextIdx = placedTiles.length;
    if (nextIdx >= targetWordClean.length) return;
    const neededLetter = targetWordClean[nextIdx];

    // Find an unused available tile with this letter
    const tileToUse = availableTiles.find((t) => !t.used && t.letter === neededLetter);
    if (tileToUse) {
      handleSelectTile(tileToUse);
      setHintsUsed((prev) => prev + 1);
    }
  };

  // Advance to next word
  const handleNextWord = () => {
    if (currentIndex + 1 < vocabularyItems.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      playVictoryFanfare();
      fireBottomLeftAndRightConfetti();
      setCurrentIndex(0);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Score & Controls Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-teal-900 to-emerald-950 text-white shadow-md flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-black text-xl">
            🔤
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black">Word Scramble Detective</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-teal-400 text-teal-950">
                Word {currentIndex + 1} of {vocabularyItems.length}
              </span>
            </div>
            <p className="text-xs text-teal-200">
              Unscramble key concept terms from this chapter
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-right">
          {streak > 1 && (
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-orange-500 text-white animate-bounce shadow-xs">
              <Flame className="w-3.5 h-3.5" />
              <span>{streak}x Streak!</span>
            </div>
          )}
          <div>
            <div className="text-[10px] uppercase font-bold text-teal-300">Score</div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono">
              {score} pts
            </div>
          </div>
        </div>
      </div>

      {/* Main Scramble Play Area */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Chapter & Topic Context Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black bg-teal-50 text-teal-800 border border-teal-200">
              <BookOpen className="w-3.5 h-3.5 text-teal-600" />
              <span>Chapter: {quiz.title}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
              <span>🎯 {currentItem.category}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRevealNextLetter}
              disabled={isWordComplete || placedTiles.length >= targetWordClean.length}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Reveal Letter</span>
            </button>
          </div>
        </div>

        {/* Chapter Concept Clue Box */}
        <div className="p-3.5 rounded-2xl bg-teal-50/80 border border-teal-200/80 text-xs text-teal-950 flex items-start gap-2.5 shadow-2xs">
          <HelpCircle className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <strong className="block font-black text-teal-950 mb-0.5">Chapter Concept Clue:</strong>
            <span className="text-teal-900 leading-relaxed">{currentItem.hint}</span>
          </div>
        </div>

        {/* Answer Slot Row */}
        <div className="text-center space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Spell the Word Below:
          </div>

          <div
            className={`flex flex-wrap items-center justify-center gap-2 min-h-[58px] p-3 rounded-2xl border-2 transition-all ${
              isWordComplete
                ? 'border-emerald-500 bg-emerald-50/60 ring-4 ring-emerald-300/40'
                : isShaking
                ? 'border-rose-400 bg-rose-50/60 animate-shake ring-2 ring-rose-300'
                : 'border-dashed border-slate-300 bg-slate-50/80'
            }`}
          >
            {targetWordClean.split('').map((_, i) => {
              const placed = placedTiles[i];
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => placed && handleRemovePlaced(i)}
                  className={`w-11 h-12 sm:w-13 sm:h-14 rounded-xl flex items-center justify-center font-black text-lg sm:text-xl border transition-all ${
                    placed
                      ? isWordComplete
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-105'
                        : 'bg-teal-600 text-white border-teal-700 shadow-md hover:scale-95 cursor-pointer'
                      : 'bg-white border-slate-300 text-slate-300'
                  }`}
                  title={placed ? 'Click to remove letter' : 'Slot'}
                >
                  {placed ? placed.letter : '_'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Available Scrambled Letter Tiles */}
        <div className="text-center space-y-3 pt-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Click Letters to Spell:
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl mx-auto">
            {availableTiles.map((tile) => (
              <button
                key={tile.id}
                type="button"
                disabled={tile.used || isWordComplete}
                onClick={() => handleSelectTile(tile)}
                className={`w-11 h-12 sm:w-13 sm:h-14 rounded-xl font-black text-lg sm:text-xl border transition-all ${
                  tile.used
                    ? 'opacity-25 bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-white hover:bg-teal-50 border-slate-300 hover:border-teal-500 text-slate-800 shadow-xs hover:shadow-md cursor-pointer hover:-translate-y-0.5 active:scale-95'
                }`}
              >
                {tile.letter}
              </button>
            ))}
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleReshuffle}
              disabled={isWordComplete}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Reshuffle</span>
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              disabled={isWordComplete || placedTiles.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Word</span>
            </button>
          </div>
        </div>

        {/* Word Solved Banner & Advance Button */}
        <AnimatePresence>
          {isWordComplete && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 text-center space-y-3"
            >
              <div className="inline-flex items-center gap-2 text-sm font-black text-emerald-900">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Brilliant! You correctly unscrambled "{currentItem.word}"!</span>
              </div>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                {currentItem.hint}
              </p>
              <button
                type="button"
                onClick={handleNextWord}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200 hover:scale-[1.02] transition-all cursor-pointer"
              >
                <span>Next Scramble Word</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
