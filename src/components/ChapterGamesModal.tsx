import React, { useState, useEffect, useMemo } from "react";
import {
  Gamepad2,
  Swords,
  Layers,
  Zap,
  X,
  Trophy,
  RotateCcw,
  Sparkles,
  Heart,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  Flame,
  Dices,
  Shield,
  Eye,
  Star,
  Lightbulb,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  BossData,
  ConceptPair,
  GeneratedQuiz,
  QuizQuestion
} from "../types";
import {
  playGameHitSound,
  playVictoryFanfare,
  playComboChime,
  playIncorrectSound,
  playSuccessSound,
  playCardFlipSound,
  playBossAttackSound
} from "../utils/audio";
import {
  ensureVariedMcqOptions,
  selectBattleQuestions,
  shuffleArray,
  fireBottomLeftAndRightConfetti
} from "../utils/quizUtils";
import { WordScrambleGame } from "./WordScrambleGame";
import { FactBusterGame } from "./FactBusterGame";

interface ChapterGamesModalProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: GeneratedQuiz;
}

type GameMode = "menu" | "boss" | "match" | "blitz" | "scramble" | "fact_buster";

interface MatchCard {
  id: string;
  pairId: string;
  text: string;
  type: "term" | "def";
  funHint?: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export const ChapterGamesModal: React.FC<ChapterGamesModalProps> = ({
  isOpen,
  onClose,
  quiz,
}) => {
  const [activeMode, setActiveMode] = useState<GameMode>("menu");
  const [bossData, setBossData] = useState<BossData | null>(null);
  const [conceptPairs, setConceptPairs] = useState<ConceptPair[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  // Boss Battle State
  const [battleRound, setBattleRound] = useState<number>(1);
  const [battleQuestionsPool, setBattleQuestionsPool] = useState<QuizQuestion[]>(() =>
    ensureVariedMcqOptions(quiz.questions)
  );
  const [battleQuestions, setBattleQuestions] = useState<QuizQuestion[]>(() =>
    selectBattleQuestions(ensureVariedMcqOptions(quiz.questions), 1, 5)
  );
  const [isFetchingNewQuestions, setIsFetchingNewQuestions] = useState<boolean>(false);
  const [bossHp, setBossHp] = useState<number>(100);
  const [playerHp, setPlayerHp] = useState<number>(100);
  const [bossDialog, setBossDialog] = useState<string>("");
  const [currentBossQIndex, setCurrentBossQIndex] = useState<number>(0);
  const [bossBattleWon, setBossBattleWon] = useState<boolean>(false);
  const [bossBattleLost, setBossBattleLost] = useState<boolean>(false);
  const [playerDamageDealt, setPlayerDamageDealt] = useState<number>(0);
  const [bossCombo, setBossCombo] = useState<number>(0);
  const [selectedBossOption, setSelectedBossOption] = useState<string | null>(null);
  const [bossAnswerChecked, setBossAnswerChecked] = useState<boolean>(false);

  // Boss Battle Power-ups
  const [shield5050Used, setShield5050Used] = useState<boolean>(false);
  const [hiddenOptionIndices, setHiddenOptionIndices] = useState<number[]>([]);
  const [clueUsed, setClueUsed] = useState<boolean>(false);
  const [showClue, setShowClue] = useState<boolean>(false);
  const [critPowerActive, setCritPowerActive] = useState<boolean>(false);
  const [combatFloatingText, setCombatFloatingText] = useState<string>("");
  const [isShaking, setIsShaking] = useState<boolean>(false);

  // Concept Match State
  const [cards, setCards] = useState<MatchCard[]>([]);
  const [selectedCardIndices, setSelectedCardIndices] = useState<number[]>([]);
  const [matchMoves, setMatchMoves] = useState<number>(0);
  const [matchTime, setMatchTime] = useState<number>(0);
  const [isMatchComplete, setIsMatchComplete] = useState<boolean>(false);
  const [matchFeedback, setMatchFeedback] = useState<string>("");
  const [matchConsecutive, setMatchConsecutive] = useState<number>(0);
  const [peekUsed, setPeekUsed] = useState<boolean>(false);
  const [isPeeking, setIsPeeking] = useState<boolean>(false);
  const [peekProgress, setPeekProgress] = useState<number>(100);

  // Speed Blitz State
  const [blitzQuestions, setBlitzQuestions] = useState<QuizQuestion[]>(() =>
    ensureVariedMcqOptions(shuffleArray(quiz.questions))
  );
  const [blitzTimeLeft, setBlitzTimeLeft] = useState<number>(30);
  const [blitzActive, setBlitzActive] = useState<boolean>(false);
  const [blitzScore, setBlitzScore] = useState<number>(0);
  const [blitzStreak, setBlitzStreak] = useState<number>(0);
  const [blitzQIndex, setBlitzQIndex] = useState<number>(0);
  const [blitzSelectedOption, setBlitzSelectedOption] = useState<string | null>(null);
  const [blitzGameOver, setBlitzGameOver] = useState<boolean>(false);
  const [blitzBonusNotif, setBlitzBonusNotif] = useState<string>("");

  // Sync questions when quiz changes
  useEffect(() => {
    const varied = ensureVariedMcqOptions(quiz.questions);
    setBattleQuestionsPool(varied);
    setBattleQuestions(selectBattleQuestions(varied, battleRound, 5));
    setBlitzQuestions(ensureVariedMcqOptions(shuffleArray(quiz.questions)));
  }, [quiz.id]);

  // Fallback pairs memoized
  const fallbackPairs: ConceptPair[] = useMemo(() => {
    return quiz.questions.slice(0, 6).map((q, i) => ({
      id: `pair_${i}`,
      term: q.correctAnswer || `Key Term ${i + 1}`,
      definition: (q.questionSummary || q.question).slice(0, 70),
      funHint: q.funFactOrJoke || "Key fact to remember!",
    }));
  }, [quiz]);

  // Initialize Card Match Game
  const initMatchGame = (pairs: ConceptPair[]) => {
    const list = pairs.length > 0 ? pairs : fallbackPairs;
    const selectedPairs = list.slice(0, 6);

    const deck: MatchCard[] = [];
    selectedPairs.forEach((p, idx) => {
      deck.push({
        id: `term_${idx}`,
        pairId: p.id,
        text: p.term,
        type: "term",
        funHint: p.funHint,
        isFlipped: false,
        isMatched: false,
      });
      deck.push({
        id: `def_${idx}`,
        pairId: p.id,
        text: p.definition,
        type: "def",
        funHint: p.funHint,
        isFlipped: false,
        isMatched: false,
      });
    });

    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setSelectedCardIndices([]);
    setMatchMoves(0);
    setMatchTime(0);
    setIsMatchComplete(false);
    setMatchFeedback("");
    setMatchConsecutive(0);
    setPeekUsed(false);
    setIsPeeking(false);
    setPeekProgress(100);
  };

  // Fetch or generate game data when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchGameData = async () => {
      setIsLoadingData(true);
      try {
        const res = await fetch("/api/generate-chapter-game", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quizTitle: quiz.title,
            topicsCovered: quiz.topicsCovered,
            questions: quiz.questions,
            language: quiz.language || "en",
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setBossData(data.boss);
          setConceptPairs(data.pairs || []);
          initMatchGame(data.pairs || []);
          if (Array.isArray(data.battleQuestions) && data.battleQuestions.length > 0) {
            setBattleQuestionsPool((prev) => {
              const combined = [...prev, ...data.battleQuestions];
              const unique = Array.from(new Map(combined.map((q) => [q.id, q])).values());
              return unique;
            });
            setBattleQuestions(selectBattleQuestions([...quiz.questions, ...data.battleQuestions], battleRound, 5));
          }
        } else {
          initMatchGame([]);
        }
      } catch (e) {
        console.error("Failed to load game data, using local deck:", e);
        initMatchGame([]);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchGameData();
  }, [isOpen, quiz.id]);

  // Trigger brief screen shake
  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 450);
  };

  // Reset Boss Battle
  const initBossBattle = (advanceRound = false) => {
    setBossHp(100);
    setPlayerHp(100);
    setBossBattleWon(false);
    setBossBattleLost(false);
    setPlayerDamageDealt(0);
    setBossCombo(0);
    setSelectedBossOption(null);
    setBossAnswerChecked(false);
    setShield5050Used(false);
    setHiddenOptionIndices([]);
    setClueUsed(false);
    setShowClue(false);
    setCritPowerActive(false);
    setCombatFloatingText("");

    const nextRound = advanceRound ? battleRound + 1 : battleRound;
    setBattleRound(nextRound);

    const pool = battleQuestionsPool.length > 0 ? battleQuestionsPool : quiz.questions;
    const freshQuestions = selectBattleQuestions(pool, nextRound, 5);
    setBattleQuestions(freshQuestions);
    setCurrentBossQIndex(0);

    if (bossData) {
      setBossDialog(bossData.introQuote);
    } else {
      setBossDialog("Prove what you have learned, student! Let the battle begin!");
    }
  };

  // Reroll battle questions
  const handleRerollBattleQuestions = async () => {
    if (isFetchingNewQuestions) return;
    setIsFetchingNewQuestions(true);
    try {
      const nextRound = battleRound + 1;
      setBattleRound(nextRound);

      let pool = [...battleQuestionsPool];
      try {
        const res = await fetch("/api/generate-battle-questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quizTitle: quiz.title,
            topicsCovered: quiz.topicsCovered,
            language: quiz.language || "en",
            battleNumber: nextRound,
            existingQuestions: quiz.questions,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.questions) && data.questions.length > 0) {
            pool = [...pool, ...data.questions];
            setBattleQuestionsPool(pool);
          }
        }
      } catch {
        // Fallback to local pool rotation
      }

      const freshQuestions = selectBattleQuestions(pool, nextRound, 5);
      setBattleQuestions(freshQuestions);
      setCurrentBossQIndex(0);
      setSelectedBossOption(null);
      setBossAnswerChecked(false);
      setHiddenOptionIndices([]);
      setShowClue(false);
      setCombatFloatingText("");
    } finally {
      setIsFetchingNewQuestions(false);
    }
  };

  // Power-up: 50/50 Shield (removes 2 incorrect choices)
  const handleUse5050Shield = () => {
    if (shield5050Used || !currentBossQ || bossAnswerChecked) return;
    setShield5050Used(true);

    const wrongIndices = currentBossQ.options
      .map((opt, idx) => ({ opt, idx }))
      .filter((item) => item.opt !== currentBossQ.correctAnswer)
      .map((item) => item.idx);

    const shuffledWrong = [...wrongIndices].sort(() => Math.random() - 0.5);
    setHiddenOptionIndices(shuffledWrong.slice(0, 2));
    playSuccessSound();
    setCombatFloatingText("🛡️ 2 Wrong Answers Shielded Out!");
    setTimeout(() => setCombatFloatingText(""), 2500);
  };

  // Power-up: Clue Strike
  const handleUseClue = () => {
    if (clueUsed || !currentBossQ || bossAnswerChecked) return;
    setClueUsed(true);
    setShowClue(true);
    playSuccessSound();
  };

  // Power-up: 2x Critical Boost
  const handleUseCritPower = () => {
    if (critPowerActive || bossAnswerChecked) return;
    setCritPowerActive(true);
    playSuccessSound();
    setCombatFloatingText("⚡ 2x Attack Ready for Next Hit!");
    setTimeout(() => setCombatFloatingText(""), 2500);
  };

  // Peek Power-up in Match Game
  const handlePeekCards = () => {
    if (peekUsed || isMatchComplete) return;
    setPeekUsed(true);
    setIsPeeking(true);
    setPeekProgress(100);
    playSuccessSound();

    const interval = 50;
    const totalTime = 2000;
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += interval;
      const remaining = Math.max(0, 100 - (elapsed / totalTime) * 100);
      setPeekProgress(remaining);
      if (elapsed >= totalTime) {
        clearInterval(timer);
        setIsPeeking(false);
      }
    }, interval);
  };

  // Reset Speed Run (Blitz) Game
  const startBlitzGame = () => {
    setBlitzTimeLeft(30);
    setBlitzScore(0);
    setBlitzStreak(0);
    setBlitzQIndex(0);
    setBlitzSelectedOption(null);
    setBlitzGameOver(false);
    setBlitzBonusNotif("");
    const pool = battleQuestionsPool.length > 0 ? battleQuestionsPool : quiz.questions;
    setBlitzQuestions(ensureVariedMcqOptions(shuffleArray(pool)));
    setBlitzActive(true);
  };

  // Blitz Timer
  useEffect(() => {
    if (!blitzActive || blitzGameOver) return;
    if (blitzTimeLeft <= 0) {
      setBlitzActive(false);
      setBlitzGameOver(true);
      playVictoryFanfare();
      fireBottomLeftAndRightConfetti();
      return;
    }
    const timer = setInterval(() => {
      setBlitzTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [blitzActive, blitzTimeLeft, blitzGameOver]);

  // Match Game Timer
  useEffect(() => {
    if (activeMode !== "match" || isMatchComplete) return;
    const timer = setInterval(() => {
      setMatchTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [activeMode, isMatchComplete]);

  if (!isOpen) return null;

  // Active questions for Boss and Blitz
  const currentBossQ: QuizQuestion | undefined =
    battleQuestions.length > 0
      ? battleQuestions[currentBossQIndex % battleQuestions.length]
      : quiz.questions[0];
  const currentBlitzQ: QuizQuestion | undefined =
    blitzQuestions.length > 0
      ? blitzQuestions[blitzQIndex % blitzQuestions.length]
      : quiz.questions[0];

  // Boss Battle Answer Submission
  const handleBossSubmit = (selected: string) => {
    if (bossAnswerChecked || !currentBossQ || bossBattleWon || bossBattleLost) return;

    setSelectedBossOption(selected);
    setBossAnswerChecked(true);

    const isCorrect = selected === currentBossQ.correctAnswer;

    if (isCorrect) {
      let damage = Math.floor(25 + Math.random() * 8);
      if (critPowerActive) {
        damage = damage * 2;
        setCritPowerActive(false);
      }

      const newHp = Math.max(0, bossHp - damage);
      setBossHp(newHp);
      setPlayerDamageDealt((prev) => prev + damage);
      const newCombo = bossCombo + 1;
      setBossCombo(newCombo);
      triggerShake();
      playGameHitSound();
      playComboChime(newCombo);

      setCombatFloatingText(`💥 Direct Hit! -${damage} Boss HP!`);
      setTimeout(() => setCombatFloatingText(""), 2400);

      if (newHp === 0) {
        setBossBattleWon(true);
        setBossDialog(bossData?.defeatQuote || "Great job! You defeated me with what you learned!");
        playVictoryFanfare();
        fireBottomLeftAndRightConfetti();
      } else {
        const reactions = bossData?.hitReactionQuotes || [
          "Ouch! That answer was spot on!",
          "My armor is cracking!",
          "You really studied well!",
        ];
        const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
        setBossDialog(randomReaction);
      }
    } else {
      // Wrong answer -> Boss retaliates!
      setBossCombo(0);
      setCritPowerActive(false);
      playIncorrectSound();
      playBossAttackSound();
      triggerShake();

      const playerDamage = 25;
      const newPlayerHp = Math.max(0, playerHp - playerDamage);
      setPlayerHp(newPlayerHp);

      setCombatFloatingText(`🛡️ Boss Counter Attack! -${playerDamage} Player HP!`);
      setTimeout(() => setCombatFloatingText(""), 2400);

      if (newPlayerHp === 0) {
        setBossBattleLost(true);
        setBossDialog("Good try! Review your notes and challenge me again!");
      } else {
        const taunts = bossData?.tauntQuotes || [
          "Haha! Check your notes again!",
          "Missed that one!",
          "Come on, you know this!",
        ];
        const randomTaunt = taunts[Math.floor(Math.random() * taunts.length)];
        setBossDialog(randomTaunt);
      }
    }
  };

  const handleNextBossQuestion = () => {
    setSelectedBossOption(null);
    setBossAnswerChecked(false);
    setHiddenOptionIndices([]);
    setShowClue(false);
    setCombatFloatingText("");
    setCurrentBossQIndex((prev) => prev + 1);
  };

  // Card Match Click with Smooth 3D Flip
  const handleCardClick = (index: number) => {
    if (cards[index].isFlipped || cards[index].isMatched || selectedCardIndices.length >= 2 || isPeeking) {
      return;
    }

    playCardFlipSound();
    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newSelected = [...selectedCardIndices, index];
    setSelectedCardIndices(newSelected);

    if (newSelected.length === 2) {
      setMatchMoves((prev) => prev + 1);
      const [idx1, idx2] = newSelected;
      const card1 = newCards[idx1];
      const card2 = newCards[idx2];

      if (card1.pairId === card2.pairId && card1.id !== card2.id) {
        // MATCH!
        setTimeout(() => {
          newCards[idx1].isMatched = true;
          newCards[idx2].isMatched = true;
          setCards(newCards);
          setSelectedCardIndices([]);
          const combo = matchConsecutive + 1;
          setMatchConsecutive(combo);
          playComboChime(combo);

          if (card1.funHint) {
            setMatchFeedback(card1.funHint);
          }

          if (newCards.every((c) => c.isMatched)) {
            setIsMatchComplete(true);
            playVictoryFanfare();
            fireBottomLeftAndRightConfetti();
          }
        }, 400);
      } else {
        // NO MATCH -> Flip back
        setMatchConsecutive(0);
        setTimeout(() => {
          newCards[idx1].isFlipped = false;
          newCards[idx2].isFlipped = false;
          setCards(newCards);
          setSelectedCardIndices([]);
          playIncorrectSound();
        }, 900);
      }
    }
  };

  // Speed Run (Blitz) Answer
  const handleBlitzAnswer = (selected: string) => {
    if (!currentBlitzQ || blitzSelectedOption) return;
    setBlitzSelectedOption(selected);
    const isCorrect = selected === currentBlitzQ.correctAnswer;

    if (isCorrect) {
      playSuccessSound();
      const multiplier = blitzStreak >= 4 ? 3 : blitzStreak >= 2 ? 2 : 1;
      const points = 100 * multiplier;
      setBlitzScore((prev) => prev + points);

      const nextStreak = blitzStreak + 1;
      setBlitzStreak(nextStreak);
      playComboChime(nextStreak);

      // +5s Time Bonus on every 3 streaks!
      if (nextStreak % 3 === 0) {
        setBlitzTimeLeft((prev) => prev + 5);
        setBlitzBonusNotif("+5s Bonus Time! ⏱️");
        setTimeout(() => setBlitzBonusNotif(""), 2000);
      }
    } else {
      playIncorrectSound();
      setBlitzStreak(0);
    }

    setTimeout(() => {
      setBlitzSelectedOption(null);
      setBlitzQIndex((prev) => prev + 1);
    }, 320);
  };

  // Calculate Match Star Rating
  const matchStars = matchMoves <= 12 ? 3 : matchMoves <= 18 ? 2 : 1;
  const matchedPairsCount = cards.filter((c) => c.isMatched).length / 2;
  const totalPairsCount = cards.length / 2 || 6;

  // Calculate Blitz Medal
  const blitzMedal =
    blitzScore >= 800
      ? { label: "Gold Champion", emoji: "🥇", desc: "Super fast memory!" }
      : blitzScore >= 400
      ? { label: "Silver Star", emoji: "🥈", desc: "Quick and sharp!" }
      : { label: "Bronze Runner", emoji: "🥉", desc: "Good effort!" };

  return (
    <div
      id="chapter-games-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto"
    >
      <div
        className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-4 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shadow-xs shrink-0">
              <Gamepad2 className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-black tracking-tight">Chapter Games</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-400 text-amber-950 shadow-2xs">
                  Active Play
                </span>
              </div>
              <p className="text-xs text-indigo-100 truncate">
                {quiz.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeMode !== "menu" && (
              <button
                onClick={() => setActiveMode("menu")}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>All Games</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-indigo-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-50/60">
          {/* 1. MENU VIEW */}
          {activeMode === "menu" && (
            <div className="space-y-6">
              <div className="text-center max-w-md mx-auto space-y-1">
                <h3 className="text-lg font-black text-slate-900">
                  Pick a Game to Play
                </h3>
                <p className="text-xs text-slate-500">
                  Practice what you learned with fun battles, flip card memory, and speed runs!
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Mode 1: Boss Battle */}
                <button
                  onClick={() => {
                    initBossBattle();
                    setActiveMode("boss");
                  }}
                  className="group text-left p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-rose-400 hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer transform hover:-translate-y-1"
                >
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs">
                      <Swords className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-base font-black text-slate-900 group-hover:text-rose-600 transition-colors flex items-center gap-1.5">
                        <span>⚔️ Boss Battle</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                        Defeat the chapter boss with your answers! Use 50/50 shields, clues, and 2x attack power.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-rose-600">
                    <span>Play Battle</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* Mode 2: Flip the Card */}
                <button
                  onClick={() => {
                    initMatchGame(conceptPairs);
                    setActiveMode("match");
                  }}
                  className="group text-left p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-400 hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer transform hover:-translate-y-1"
                >
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs">
                      <Layers className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                        <span>🎴 Flip the Card</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                        Interactive 3D memory cards! Match words with their meanings, peek at cards, and earn 3 gold stars.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
                    <span>Play Flip Card</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* Mode 3: Speed Run */}
                <button
                  onClick={() => {
                    startBlitzGame();
                    setActiveMode("blitz");
                  }}
                  className="group text-left p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-amber-400 hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer transform hover:-translate-y-1"
                >
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-base font-black text-slate-900 group-hover:text-amber-600 transition-colors flex items-center gap-1.5">
                        <span>⚡ 30s Speed Run</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                        Fast 30-second sprint! Chain correct answers for streak multipliers and bonus time rewards.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-600">
                    <span>Play Speed Run</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* Mode 4: Word Scramble Detective */}
                <button
                  onClick={() => setActiveMode("scramble")}
                  className="group text-left p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-teal-400 hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer transform hover:-translate-y-1"
                >
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs text-2xl">
                      🔤
                    </div>
                    <div>
                      <div className="text-base font-black text-slate-900 group-hover:text-teal-600 transition-colors flex items-center gap-1.5">
                        <span>Word Scramble</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                        Unscramble key concept terms with letter tiles, clues, and vocabulary puzzle streaks!
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-600">
                    <span>Play Scramble</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* Mode 5: Fact Buster */}
                <button
                  onClick={() => setActiveMode("fact_buster")}
                  className="group text-left p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-rose-400 hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer transform hover:-translate-y-1"
                >
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs text-2xl">
                      🎯
                    </div>
                    <div>
                      <div className="text-base font-black text-slate-900 group-hover:text-rose-600 transition-colors flex items-center gap-1.5">
                        <span>Fact Buster: True or False</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                        Lightning-fast 45s sprint! Spot true chapter facts and bust false claims with speed.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-rose-600">
                    <span>Play Fact Buster</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </div>

              {/* Quick tip banner */}
              <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200/80 text-xs text-indigo-950 flex items-center gap-3">
                <span className="text-xl">💡</span>
                <div>
                  <span className="font-bold">Why playing games helps:</span>{" "}
                  Quick games help your brain remember key facts faster, keep your mind alert, and make studying fun!
                </div>
              </div>
            </div>
          )}

          {/* 2. BOSS BATTLE VIEW */}
          {activeMode === "boss" && (
            <div className={`space-y-4 ${isShaking ? "animate-bounce" : ""}`}>
              {/* Boss Arena Card with Clash Layout */}
              <div
                className={`relative overflow-hidden p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white shadow-2xl border transition-all duration-300 ${
                  bossHp <= 40
                    ? "border-rose-500 ring-2 ring-rose-500/40 shadow-rose-950/50"
                    : "border-indigo-800/80"
                }`}
              >
                {/* Background Subtle Sparkle Grid */}
                <div className="absolute inset-0 bg-study-grid opacity-15 pointer-events-none" />

                <div className="relative z-10 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  {/* Left: Player / Hero Status */}
                  <div className="sm:col-span-5 flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10 backdrop-blur-xs">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-2xl shadow-inner shrink-0 ring-2 ring-blue-400/50">
                      🎓
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-blue-300 flex items-center gap-1">
                          <Shield className="w-3.5 h-3.5 text-blue-400" />
                          You (Student Hero)
                        </span>
                        <span className="font-mono text-blue-200 font-bold">{playerHp}%</span>
                      </div>
                      {/* Player HP Bar */}
                      <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-700">
                        <motion.div
                          className="h-full bg-gradient-to-r from-blue-500 via-indigo-400 to-cyan-300 rounded-full transition-all duration-300"
                          style={{ width: `${playerHp}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5">
                        <span>Shields Active</span>
                        {bossCombo > 1 && (
                          <span className="text-amber-400 font-black">
                            • {bossCombo}x Combo Streak!
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Center: Clash Emblem */}
                  <div className="sm:col-span-2 flex flex-col items-center justify-center text-center">
                    <span className="text-xs font-black tracking-widest uppercase text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/30 shadow-xs">
                      Round {battleRound}
                    </span>
                    <span className="text-sm font-black text-slate-300 my-1">VS</span>
                  </div>

                  {/* Right: Boss Status */}
                  <div className="sm:col-span-5 flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10 backdrop-blur-xs">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-rose-300 flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                          {bossData?.name || "Chapter Boss"}
                        </span>
                        <span className="font-mono text-rose-200 font-bold">{bossHp}%</span>
                      </div>
                      {/* Boss HP Bar */}
                      <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-700">
                        <motion.div
                          className={`h-full rounded-full transition-all duration-300 ${
                            bossHp > 50
                              ? "bg-gradient-to-r from-emerald-500 to-green-400"
                              : bossHp > 25
                              ? "bg-gradient-to-r from-amber-500 to-yellow-400"
                              : "bg-gradient-to-r from-rose-600 via-red-500 to-orange-500 animate-pulse"
                          }`}
                          style={{ width: `${bossHp}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-rose-300/80 mt-1 flex items-center justify-between">
                        <span className="truncate">Weakness: {bossData?.weakness || "Correct Facts"}</span>
                        {bossHp <= 40 && (
                          <span className="font-black text-rose-400 uppercase text-[9px] animate-pulse">
                            Enraged!
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="relative shrink-0">
                      <div
                        className={`w-12 h-12 rounded-2xl bg-white/10 border-2 flex items-center justify-center text-3xl shadow-lg transition-transform ${
                          bossHp <= 40 ? "border-rose-500 scale-105" : "border-indigo-400"
                        }`}
                      >
                        {bossData?.avatarEmoji || "🐉"}
                      </div>
                      {bossHp <= 40 && (
                        <span className="absolute -top-1.5 -right-1.5 text-xs animate-bounce">
                          🔥
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Floating Combat Feedback */}
                {combatFloatingText && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mt-3 p-2 rounded-xl bg-amber-400 text-slate-950 text-center font-black text-xs shadow-lg"
                  >
                    {combatFloatingText}
                  </motion.div>
                )}

                {/* Boss Dialogue Bubble */}
                <div className="mt-3.5 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-xs sm:text-sm text-indigo-100 flex items-start gap-2.5">
                  <span className="text-base shrink-0">💬</span>
                  <div className="min-w-0">
                    <span className="font-bold text-amber-300 mr-1.5">{bossData?.name || "Boss"}:</span>
                    <span className="italic font-medium">"{bossDialog || "Let's see if you can answer this!"}"</span>
                  </div>
                </div>
              </div>

              {/* Victory State */}
              {bossBattleWon ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-8 rounded-3xl bg-white border border-emerald-200 text-center space-y-4 shadow-xl"
                >
                  <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-3xl shadow-sm animate-bounce">
                    🏆
                  </div>
                  <div>
                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
                      Victory!
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 mt-2">
                      Boss Defeated! You Won!
                    </h3>
                    <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
                      You defeated {bossData?.name || "the boss"} with {playerDamageDealt} points of knowledge damage!
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
                    <button
                      onClick={() => initBossBattle(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md cursor-pointer hover:scale-[1.02]"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Next Battle Round (Fresh Questions ⚔️)</span>
                    </button>
                    <button
                      onClick={() => setActiveMode("menu")}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      All Games
                    </button>
                  </div>
                </motion.div>
              ) : bossBattleLost ? (
                /* Player Defeat State */
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-8 rounded-3xl bg-white border border-rose-200 text-center space-y-4 shadow-xl"
                >
                  <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-3xl shadow-sm">
                    💔
                  </div>
                  <div>
                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-100 text-rose-800">
                      Try Again
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 mt-2">
                      Defeated in Battle!
                    </h3>
                    <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
                      {bossData?.name || "The boss"} held ground this time. Review your notes and try again to win!
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
                    <button
                      onClick={() => initBossBattle(false)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-all shadow-md cursor-pointer hover:scale-[1.02]"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Retry Battle ⚔️</span>
                    </button>
                    <button
                      onClick={() => setActiveMode("menu")}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      All Games
                    </button>
                  </div>
                </motion.div>
              ) : currentBossQ ? (
                /* Question Battle Box */
                <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-500 gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-indigo-700">
                        Battle #{battleRound} • Question {currentBossQIndex + 1} of {battleQuestions.length}
                      </span>
                    </div>

                    {/* Tactical Power-Ups Bar */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        onClick={handleUse5050Shield}
                        disabled={shield5050Used || bossAnswerChecked}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          shield5050Used
                            ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                            : "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 active:scale-95 shadow-2xs"
                        }`}
                        title="Remove 2 wrong answers"
                      >
                        <Shield className="w-3.5 h-3.5 text-blue-600" />
                        <span>50/50 Shield</span>
                      </button>

                      <button
                        onClick={handleUseClue}
                        disabled={clueUsed || bossAnswerChecked}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          clueUsed
                            ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                            : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 active:scale-95 shadow-2xs"
                        }`}
                        title="Show a helpful hint"
                      >
                        <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                        <span>Clue</span>
                      </button>

                      <button
                        onClick={handleUseCritPower}
                        disabled={critPowerActive || bossAnswerChecked}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          critPowerActive
                            ? "bg-amber-400 text-slate-900 border border-amber-500 shadow-sm animate-pulse"
                            : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 active:scale-95"
                        }`}
                        title="Double damage on your next correct answer"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-600" />
                        <span>2x Attack</span>
                      </button>

                      <button
                        onClick={handleRerollBattleQuestions}
                        disabled={isFetchingNewQuestions}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 transition-colors cursor-pointer"
                        title="Get fresh questions for this battle"
                      >
                        <Dices className={`w-3.5 h-3.5 ${isFetchingNewQuestions ? 'animate-spin' : ''}`} />
                        <span>{isFetchingNewQuestions ? "Loading..." : "New Questions"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Clue box if opened */}
                  {showClue && currentBossQ.hint && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium flex items-center gap-2.5"
                    >
                      <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>💡 <strong>Study Clue:</strong> {currentBossQ.hint}</span>
                    </motion.div>
                  )}

                  <h4 className="text-base font-bold text-slate-900 leading-snug">
                    {currentBossQ.question}
                  </h4>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentBossQ.options.map((opt, i) => {
                      const isHidden = hiddenOptionIndices.includes(i);
                      if (isHidden) {
                        return (
                          <div
                            key={i}
                            className="p-3.5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-slate-400 text-xs flex items-center justify-center italic"
                          >
                            🛡️ Shielded Out (Wrong Choice)
                          </div>
                        );
                      }

                      const isSelected = selectedBossOption === opt;
                      const isCorrectAnswer = opt === currentBossQ.correctAnswer;

                      let btnStyle =
                        "border-slate-200 bg-white hover:bg-indigo-50/60 hover:border-indigo-300 text-slate-800 cursor-pointer active:scale-[0.99] shadow-2xs";
                      if (bossAnswerChecked) {
                        if (isCorrectAnswer) {
                          btnStyle =
                            "border-emerald-500 bg-emerald-50 text-emerald-950 font-bold shadow-xs ring-2 ring-emerald-400/40";
                        } else if (isSelected) {
                          btnStyle =
                            "border-rose-500 bg-rose-50 text-rose-950 font-bold shadow-xs ring-2 ring-rose-400/40";
                        } else {
                          btnStyle = "border-slate-200 bg-slate-50 text-slate-400 opacity-60";
                        }
                      }

                      return (
                        <button
                          key={i}
                          disabled={bossAnswerChecked}
                          onClick={() => handleBossSubmit(opt)}
                          className={`p-3.5 rounded-2xl border text-left text-xs sm:text-sm transition-all flex items-start gap-3 ${btnStyle}`}
                        >
                          <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 font-bold text-xs shadow-2xs">
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span className="flex-1 leading-snug">{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Post-Attack Bar */}
                  {bossAnswerChecked && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="pt-3 flex items-center justify-between border-t border-slate-100 flex-wrap gap-2"
                    >
                      <div className="text-xs">
                        {selectedBossOption === currentBossQ.correctAnswer ? (
                          <span className="font-bold text-emerald-700 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            Direct Hit! You landed knowledge damage!
                          </span>
                        ) : (
                          <span className="font-bold text-rose-700 flex items-center gap-1.5">
                            <XCircle className="w-4 h-4 text-rose-600" />
                            Boss countered! Correct answer was: "{currentBossQ.correctAnswer}"
                          </span>
                        )}
                      </div>

                      <button
                        onClick={handleNextBossQuestion}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all cursor-pointer shadow-xs active:scale-95"
                      >
                        <span>Next Question</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )}
                </div>
              ) : null}
            </div>
          )}

          {/* 3. FLIP THE CARD (CONCEPT MATCH) VIEW */}
          {activeMode === "match" && (
            <div className="space-y-4">
              {/* Card Match HUD */}
              <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200/90 text-xs flex-wrap gap-3 shadow-2xs">
                <div className="flex items-center gap-4 font-semibold text-slate-700 flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    Moves: <strong className="text-slate-900">{matchMoves}</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-500" />
                    Time: <strong className="text-slate-900">{matchTime}s</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600" />
                    Matched: <strong className="text-slate-900">{matchedPairsCount} / {totalPairsCount}</strong>
                  </span>
                  {matchConsecutive > 1 && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] animate-pulse shadow-2xs">
                      🔥 {matchConsecutive}x Combo!
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePeekCards}
                    disabled={peekUsed || isMatchComplete}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      peekUsed
                        ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                        : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 shadow-2xs active:scale-95"
                    }`}
                    title="Quick peek at all cards for 2 seconds"
                  >
                    <Eye className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Quick Peek (👁️)</span>
                  </button>

                  <button
                    onClick={() => initMatchGame(conceptPairs)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restart Cards</span>
                  </button>
                </div>
              </div>

              {/* Progress bar of matched pairs */}
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${(matchedPairsCount / totalPairsCount) * 100}%` }}
                />
              </div>

              {/* Peek timer bar countdown */}
              {isPeeking && (
                <div className="w-full bg-amber-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-amber-500 h-full transition-all duration-75"
                    style={{ width: `${peekProgress}%` }}
                  />
                </div>
              )}

              {matchFeedback && !isMatchComplete && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 text-center font-bold"
                >
                  💡 {matchFeedback}
                </motion.div>
              )}

              {/* Game Finished Banner with Star Rating */}
              {isMatchComplete ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-8 rounded-3xl bg-white border border-emerald-200 text-center space-y-4 shadow-xl"
                >
                  <div className="flex justify-center gap-2 text-3xl">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-10 h-10 ${
                          i < matchStars
                            ? "fill-amber-400 text-amber-400 drop-shadow-sm animate-bounce"
                            : "text-slate-200"
                        }`}
                      />
                    ))}
                  </div>

                  <div>
                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
                      Great Memory!
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 mt-2">
                      All Cards Matched!
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      You matched every card in <strong>{matchMoves} moves</strong> and <strong>{matchTime} seconds</strong>!
                    </p>
                    <p className="text-xs font-bold text-emerald-700 mt-1">
                      {matchStars === 3
                        ? "⭐⭐⭐ Perfect Score! Excellent Memory!"
                        : matchStars === 2
                        ? "⭐⭐ Great Job! Quick and sharp!"
                        : "⭐ Good effort! Try again for 3 stars!"}
                    </p>
                  </div>

                  <div className="flex justify-center gap-3 pt-2 flex-wrap">
                    <button
                      onClick={() => initMatchGame(conceptPairs)}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md cursor-pointer hover:scale-[1.02]"
                    >
                      Play Again 🧩
                    </button>
                    <button
                      onClick={() => setActiveMode("menu")}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      All Games
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* Card Grid with 3D Flip Effects */
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                  {cards.map((card, idx) => {
                    const isCardShown = card.isFlipped || card.isMatched || isPeeking;

                    return (
                      <div
                        key={card.id}
                        className="h-32 sm:h-36 perspective-1000 select-none cursor-pointer"
                        onClick={() => handleCardClick(idx)}
                      >
                        <div
                          className={`relative w-full h-full rounded-2xl transform-style-preserve-3d transition-transform duration-500 shadow-sm ${
                            isCardShown ? "rotate-y-180" : "hover:-translate-y-1 hover:shadow-md"
                          }`}
                        >
                          {/* CARD BACK (Face Down) */}
                          <div className="absolute inset-0 w-full h-full rounded-2xl backface-hidden bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 text-white border border-indigo-500/30 p-3 flex flex-col items-center justify-between shadow-xs">
                            <div className="flex items-center justify-between w-full opacity-60">
                              <Sparkles className="w-3 h-3 text-indigo-300" />
                              <span className="text-[9px] font-mono tracking-widest text-indigo-300">CARD #{idx + 1}</span>
                              <Sparkles className="w-3 h-3 text-indigo-300" />
                            </div>

                            <div className="flex flex-col items-center justify-center gap-1.5 my-auto">
                              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-xl shadow-inner">
                                🎴
                              </div>
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-200">
                                Flip Card
                              </span>
                            </div>

                            <span className="text-[8px] text-indigo-300/60 uppercase tracking-widest font-semibold">
                              Tap to Reveal
                            </span>
                          </div>

                          {/* CARD FRONT (Face Up / Flipped) */}
                          <div
                            className={`absolute inset-0 w-full h-full rounded-2xl backface-hidden rotate-y-180 p-3 flex flex-col justify-between text-xs font-bold border transition-all ${
                              card.isMatched
                                ? "bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 border-emerald-400 text-emerald-950 ring-2 ring-emerald-400/50 shadow-sm"
                                : card.type === "term"
                                ? "bg-gradient-to-br from-indigo-50 via-white to-blue-50 border-indigo-300 text-indigo-950 shadow-sm"
                                : "bg-gradient-to-br from-amber-50 via-white to-orange-50 border-amber-300 text-amber-950 shadow-sm"
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span
                                className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                                  card.isMatched
                                    ? "bg-emerald-200 text-emerald-900"
                                    : card.type === "term"
                                    ? "bg-indigo-100 text-indigo-800"
                                    : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {card.isMatched ? "✓ Matched" : card.type === "term" ? "Word / Concept" : "Meaning"}
                              </span>

                              {card.isMatched ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <span className="text-[10px] text-slate-400">#{idx + 1}</span>
                              )}
                            </div>

                            <div className="my-auto text-center leading-snug line-clamp-4 font-semibold px-1">
                              {card.text}
                            </div>

                            <div className="text-[8px] text-center text-slate-400 font-mono uppercase tracking-wider">
                              {card.isMatched ? "Complete" : "Find its match"}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 4. SPEED RUN (BLITZ) VIEW */}
          {activeMode === "blitz" && (
            <div className="space-y-4">
              {/* Blitz HUD */}
              <div
                className={`p-4 rounded-2xl transition-all flex items-center justify-between text-white ${
                  blitzTimeLeft <= 10
                    ? "bg-rose-950 border-2 border-rose-500 animate-pulse shadow-lg"
                    : "bg-slate-900 border border-slate-800"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex items-center gap-1.5 font-black text-lg sm:text-2xl ${
                      blitzTimeLeft <= 10 ? "text-rose-400" : "text-amber-400"
                    }`}
                  >
                    <Clock className="w-5 h-5" />
                    <span>{blitzTimeLeft}s</span>
                  </div>

                  {blitzStreak > 1 && (
                    <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-500 text-white animate-bounce shadow-xs">
                      <Flame className="w-3.5 h-3.5" />
                      <span>{blitzStreak}x Streak!</span>
                    </div>
                  )}

                  {blitzBonusNotif && (
                    <div className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500 text-white animate-pulse">
                      {blitzBonusNotif}
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <div className="text-[10px] font-bold uppercase text-slate-400">
                    Score
                  </div>
                  <div className="text-lg sm:text-2xl font-black text-white font-mono">
                    {blitzScore} pts
                  </div>
                </div>
              </div>

              {blitzGameOver ? (
                /* Blitz Performance Medal Podium */
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-8 rounded-3xl bg-white border border-amber-200 text-center space-y-4 shadow-xl"
                >
                  <div className="text-5xl animate-bounce">
                    {blitzMedal.emoji}
                  </div>
                  <div>
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 uppercase tracking-wider">
                      {blitzMedal.label}
                    </span>
                    <h3 className="text-3xl font-black text-slate-900 mt-2">
                      {blitzScore} Points!
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {blitzMedal.desc}
                    </p>
                  </div>

                  <div className="flex justify-center gap-3 pt-2 flex-wrap">
                    <button
                      onClick={startBlitzGame}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 transition-colors shadow-md cursor-pointer hover:scale-[1.02]"
                    >
                      Play Again ⚡
                    </button>
                    <button
                      onClick={() => setActiveMode("menu")}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      All Games
                    </button>
                  </div>
                </motion.div>
              ) : currentBlitzQ ? (
                <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                  <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                    Quick Question {blitzQIndex + 1}
                  </div>
                  <h4 className="text-base font-bold text-slate-900">
                    {currentBlitzQ.question}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentBlitzQ.options.map((opt, i) => {
                      const isSelected = blitzSelectedOption === opt;
                      const isCorrect = opt === currentBlitzQ.correctAnswer;

                      let btnStyle =
                        "border-slate-200 bg-white hover:bg-amber-50/60 hover:border-amber-300 text-slate-800 cursor-pointer shadow-2xs";
                      if (blitzSelectedOption) {
                        if (isCorrect) {
                          btnStyle = "border-emerald-500 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-400/40";
                        } else if (isSelected) {
                          btnStyle = "border-rose-500 bg-rose-50 text-rose-950 font-bold ring-2 ring-rose-400/40";
                        }
                      }

                      return (
                        <button
                          key={i}
                          disabled={!!blitzSelectedOption}
                          onClick={() => handleBlitzAnswer(opt)}
                          className={`p-3.5 rounded-2xl border text-left text-xs sm:text-sm font-semibold transition-all flex items-start gap-3 active:scale-95 ${btnStyle}`}
                        >
                          <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 font-bold text-xs shadow-2xs">
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span className="flex-1 leading-snug">{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* 4. WORD SCRAMBLE DETECTIVE VIEW */}
          {activeMode === "scramble" && (
            <WordScrambleGame
              quiz={quiz}
              onBackToMenu={() => setActiveMode("menu")}
            />
          )}

          {/* 5. FACT BUSTER: RAPID TRUE OR FALSE VIEW */}
          {activeMode === "fact_buster" && (
            <FactBusterGame
              quiz={quiz}
              onBackToMenu={() => setActiveMode("menu")}
            />
          )}
        </div>
      </div>
    </div>
  );
};
