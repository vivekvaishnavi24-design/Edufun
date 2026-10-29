import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Send,
  Loader2,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  Award,
  ChevronRight,
  ChevronLeft,
  Compass,
  Cpu,
  BrainCircuit,
  Wand2,
  Zap,
  Info,
  Target,
  XCircle,
  Check
} from 'lucide-react';
import { ImagineCreativitySimulation, AnimationStage, SimulationDifficulty } from '../types';
import { IMAGINE_CREATIVITY_PRESETS } from '../data/imagineCreativityPresets';
import { InteractiveSimulationStage } from './InteractiveSimulationStage';
import { fireBottomLeftAndRightConfetti } from '../utils/quizUtils';
import { playSuccessSound, playIncorrectSound } from '../utils/audio';
import { generateTailoredOfflineSimulation } from '../utils/simulationGenerator';

interface ImagineCreativityModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuestionPrompt?: string;
  isOffline?: boolean;
}

export const ImagineCreativityModal: React.FC<ImagineCreativityModalProps> = ({
  isOpen,
  onClose,
  initialQuestionPrompt = '',
  isOffline = false
}) => {
  const [questionInput, setQuestionInput] = useState<string>(initialQuestionPrompt);
  const [activeSimulation, setActiveSimulation] = useState<ImagineCreativitySimulation>(
    () => IMAGINE_CREATIVITY_PRESETS[0] // Default to Water Cycle & Weather
  );
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
  const [knobValues, setKnobValues] = useState<Record<string, any>>({});
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(1);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isLoadingGenAI, setIsLoadingGenAI] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Educational Difficulty selection (beginner, intermediate, advanced)
  const [selectedDifficulty, setSelectedDifficulty] = useState<SimulationDifficulty>('intermediate');

  // Comprehension Mini-Quiz state
  const [userQuizAnswers, setUserQuizAnswers] = useState<Record<number, number>>({});
  const [showQuizCelebration, setShowQuizCelebration] = useState<boolean>(false);

  // Difficulty change handler
  const handleDifficultyChange = (newDifficulty: SimulationDifficulty) => {
    setSelectedDifficulty(newDifficulty);
    const preset = IMAGINE_CREATIVITY_PRESETS.find((p) => p.id === activeSimulation.id);
    if (preset) {
      if (newDifficulty !== 'intermediate' && preset.difficultyVariants?.[newDifficulty]) {
        const variant = preset.difficultyVariants[newDifficulty]!;
        setActiveSimulation({
          ...preset,
          ...variant,
          difficulty: newDifficulty,
          stages: variant.stages || preset.stages,
          comprehensionQuiz: variant.comprehensionQuiz || preset.comprehensionQuiz
        });
      } else {
        setActiveSimulation({
          ...preset,
          difficulty: 'intermediate'
        });
      }
    } else if (activeSimulation.difficultyVariants?.[newDifficulty]) {
      const variant = activeSimulation.difficultyVariants[newDifficulty]!;
      setActiveSimulation((prev) => ({
        ...prev,
        ...variant,
        difficulty: newDifficulty,
        stages: variant.stages || prev.stages,
        comprehensionQuiz: variant.comprehensionQuiz || prev.comprehensionQuiz
      }));
    } else {
      // Regenerate simulation data specifically adapted to the new difficulty level!
      const updated = generateTailoredOfflineSimulation(activeSimulation.question, newDifficulty);
      setActiveSimulation({
        ...updated,
        id: activeSimulation.id
      });
    }
  };

  // Reset knobs and stage when active simulation changes
  useEffect(() => {
    if (activeSimulation) {
      const initialKnobs: Record<string, any> = {};
      activeSimulation.interactiveKnobs.forEach((k) => {
        initialKnobs[k.id] = k.defaultValue;
      });
      setKnobValues(initialKnobs);
      setCurrentStageIndex(0);
      setUserQuizAnswers({});
      setShowQuizCelebration(false);
    }
  }, [activeSimulation]);

  // Handle incoming initial prompt
  useEffect(() => {
    if (isOpen && initialQuestionPrompt) {
      setQuestionInput(initialQuestionPrompt);
      handleSearchOrSelectQuestion(initialQuestionPrompt);
    }
  }, [isOpen, initialQuestionPrompt]);

  // Auto-Play Stage cycler
  useEffect(() => {
    if (!isPlaying) return;
    const stageDuration = 6500 / speed;
    const timer = setTimeout(() => {
      setCurrentStageIndex((prev) => (prev + 1) % activeSimulation.stages.length);
    }, stageDuration);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStageIndex, speed, activeSimulation]);

  // Speech Narration via Web Speech API
  const handleToggleSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!('speechSynthesis' in window)) {
      setErrorMsg("Text-to-speech is not supported in this browser environment.");
      return;
    }

    window.speechSynthesis.cancel();
    const currentStage = activeSimulation.stages[currentStageIndex];
    const utterance = new SpeechSynthesisUtterance(
      `${currentStage.title}. ${currentStage.narration}`
    );
    utterance.rate = 0.95 * speed;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // Change Speech when stage changes if speaking was enabled
  useEffect(() => {
    if (isSpeaking && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const currentStage = activeSimulation.stages[currentStageIndex];
      const utterance = new SpeechSynthesisUtterance(
        `${currentStage.title}. ${currentStage.narration}`
      );
      utterance.rate = 0.95 * speed;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  }, [currentStageIndex]);

  // Stop speech when closing modal
  useEffect(() => {
    if (!isOpen) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Knob change handler
  const handleKnobChange = (id: string, value: any) => {
    setKnobValues((prev) => ({ ...prev, [id]: value }));
  };

  // Switch or match prompt
  const handleSearchOrSelectQuestion = async (queryText: string) => {
    const clean = queryText.trim().toLowerCase();
    if (!clean) return;

    setErrorMsg(null);

    // 1. Check if user clicked a direct preset button (exact preset id match)
    const exactPreset = IMAGINE_CREATIVITY_PRESETS.find(
      (p) => p.id === queryText.trim() || p.conceptTitle.toLowerCase() === clean
    );

    if (exactPreset) {
      if (selectedDifficulty !== 'intermediate' && exactPreset.difficultyVariants?.[selectedDifficulty]) {
        const variant = exactPreset.difficultyVariants[selectedDifficulty]!;
        setActiveSimulation({
          ...exactPreset,
          ...variant,
          difficulty: selectedDifficulty,
          stages: variant.stages || exactPreset.stages,
          comprehensionQuiz: variant.comprehensionQuiz || exactPreset.comprehensionQuiz
        });
      } else {
        setActiveSimulation({
          ...exactPreset,
          difficulty: 'intermediate'
        });
      }
      return;
    }

    // 2. Offline Mode: Immediately use intelligent tailored offline simulation
    if (isOffline) {
      const tailoredSim = generateTailoredOfflineSimulation(queryText, selectedDifficulty);
      setActiveSimulation(tailoredSim);
      fireBottomLeftAndRightConfetti();
      return;
    }

    // 3. Online: Call AI to create a bespoke simulation specifically according to this question!
    setIsLoadingGenAI(true);
    try {
      const res = await fetch('/api/imagine-creativity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: queryText, difficulty: selectedDifficulty })
      });

      if (!res.ok) {
        throw new Error(`Server returned error status ${res.status}`);
      }

      const dynamicSim: ImagineCreativitySimulation = await res.json();
      setActiveSimulation(dynamicSim);
      fireBottomLeftAndRightConfetti();
    } catch (err: any) {
      console.warn("AI Imagine Creativity fallback to tailored generator:", err);
      // Fallback cleanly to our tailored domain generator
      const fallbackSim = generateTailoredOfflineSimulation(queryText, selectedDifficulty);
      setActiveSimulation(fallbackSim);
      fireBottomLeftAndRightConfetti();
    } finally {
      setIsLoadingGenAI(false);
    }
  };

  // Handle quiz option click
  const handleSelectQuizOption = (qIdx: number, optIdx: number, correctIdx: number) => {
    setUserQuizAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
    if (optIdx === correctIdx) {
      playSuccessSound();
      if (Object.keys(userQuizAnswers).length + 1 >= activeSimulation.comprehensionQuiz.length) {
        setShowQuizCelebration(true);
        fireBottomLeftAndRightConfetti();
      }
    } else {
      playIncorrectSound();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fade-in">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* HEADER BAR */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-900 border-b border-indigo-900/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-indigo-500 text-slate-950 flex items-center justify-center shadow-lg shadow-indigo-500/20 font-black">
              <Sparkles className="w-6 h-6 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-1.5">
                  Imagine Ur Creativity
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                  Interactive Animation Lab
                </span>
              </div>
              <p className="text-xs text-indigo-200/80 hidden sm:block">
                Ask any question or concept, and watch it animated with interactive controls and step-by-step intuition!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Read-Aloud Toggle */}
            <button
              onClick={handleToggleSpeech}
              className={`p-2 rounded-xl transition-all cursor-pointer border ${
                isSpeaking
                  ? 'bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-400/50'
                  : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
              }`}
              title={isSpeaking ? "Mute audio narration" : "Read aloud step explanation"}
            >
              {isSpeaking ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition-colors cursor-pointer border border-slate-700"
              title="Close Imagine Ur Creativity"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SCROLLABLE MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* 1. QUESTION INPUT, DIFFICULTY SELECTOR & PRESET SELECTOR */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 shadow-inner space-y-3.5">
            {/* Difficulty Level Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="font-black uppercase tracking-wider text-amber-400 text-[11px] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Educational Difficulty:
                </span>
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  (Tailors formulas, narrations, molecular mechanisms, and quiz!)
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 p-1 rounded-xl">
                {[
                  {
                    id: 'beginner' as const,
                    label: '🟢 Beginner (Grades 3-5)',
                    short: '🟢 Easy / Intuition',
                    badge: '🟢 Beginner Level',
                    desc: 'Everyday intuitive metaphors, simple formulas, and foundational concepts'
                  },
                  {
                    id: 'intermediate' as const,
                    label: '🟡 Intermediate (Grades 6-8)',
                    short: '🟡 Standard',
                    badge: '🟡 Standard Curriculum',
                    desc: 'Balanced curriculum science with standard chemical/physical equations'
                  },
                  {
                    id: 'advanced' as const,
                    label: '🟣 Advanced (High School / AP)',
                    short: '🟣 AP / College',
                    badge: '🟣 Advanced AP Depth',
                    desc: 'Rigorous biochemical pathways, thermodynamics, and molecular mechanics'
                  }
                ].map((diff) => {
                  const isSelected = selectedDifficulty === diff.id;
                  return (
                    <button
                      key={diff.id}
                      onClick={() => handleDifficultyChange(diff.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                        isSelected
                          ? diff.id === 'beginner'
                            ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25 ring-1 ring-emerald-300'
                            : diff.id === 'intermediate'
                            ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/25 ring-1 ring-amber-300'
                            : 'bg-purple-600 text-white shadow-md shadow-purple-600/25 ring-1 ring-purple-300'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                      }`}
                      title={diff.desc}
                    >
                      <span className="hidden md:inline">{diff.label}</span>
                      <span className="md:hidden">{diff.short}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="block text-xs font-black uppercase tracking-wider text-amber-400">
              💡 Tell Us Your Question or Concept:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={questionInput}
                  onChange={(e) => setQuestionInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearchOrSelectQuestion(questionInput);
                    }
                  }}
                  placeholder="e.g. How does photosynthesis make oxygen? How does the water cycle work? 2x + 6 = 14"
                  className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
                />
              </div>

              <button
                onClick={() => handleSearchOrSelectQuestion(questionInput)}
                disabled={isLoadingGenAI || !questionInput.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-amber-400/20 cursor-pointer disabled:opacity-50"
              >
                {isLoadingGenAI ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Animating...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>Animate It!</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Preset Selector Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-bold text-slate-400">Quick Visual Labs:</span>
              {IMAGINE_CREATIVITY_PRESETS.map((preset) => {
                const isSelected = activeSimulation.id === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setQuestionInput(preset.question);
                      if (selectedDifficulty !== 'intermediate' && preset.difficultyVariants?.[selectedDifficulty]) {
                        const variant = preset.difficultyVariants[selectedDifficulty]!;
                        setActiveSimulation({
                          ...preset,
                          ...variant,
                          difficulty: selectedDifficulty,
                          stages: variant.stages || preset.stages,
                          comprehensionQuiz: variant.comprehensionQuiz || preset.comprehensionQuiz
                        });
                      } else {
                        setActiveSimulation({
                          ...preset,
                          difficulty: 'intermediate'
                        });
                      }
                    }}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm shadow-amber-400/20 font-black scale-[1.02]'
                        : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border-slate-700'
                    }`}
                  >
                    <span>{preset.emoji}</span>
                    <span>{preset.conceptTitle.split(':')[0]}</span>
                  </button>
                );
              })}
            </div>

            {/* Curated Wonder Questions - Animate Any Question Instantly */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-800/80">
              <span className="text-[11px] font-black text-amber-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Try Asking:
              </span>
              {[
                { label: '✈️ How do airplanes fly?', q: 'How do airplane wings generate lift to fly?' },
                { label: '🌌 How does gravity orbit planets?', q: 'How does gravity keep planets in elliptical orbits?' },
                { label: '🚀 How do rockets launch in space?', q: 'How do rockets propel themselves in the vacuum of outer space?' },
                { label: '🌑 Solar Eclipse geometry', q: 'What happens during a Total Solar Eclipse?' },
                { label: '🌈 Prism rainbow light', q: 'Why does white light split into a rainbow inside a glass prism?' },
                { label: '🔊 Sound waves in air', q: 'How do sound waves travel through air as compression waves?' },
                { label: '⚛️ Electron quantum jumps', q: 'How do electrons jump quantum energy levels in an atom?' },
                { label: '🧬 DNA replication unzipping', q: 'How does DNA unzip and duplicate during cell replication?' }
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuestionInput(item.q);
                    handleSearchOrSelectQuestion(item.q);
                  }}
                  className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-800/60 text-indigo-200 hover:text-white transition-all cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. SIMULATION TITLE & REAL-WORLD ANALOGY BANNER */}
          <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-purple-950/80 border border-indigo-800/60 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-2xl">{activeSimulation.emoji}</span>
                <h3 className="text-base sm:text-lg font-black text-white">
                  {activeSimulation.conceptTitle}
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                    selectedDifficulty === 'beginner'
                      ? 'bg-emerald-950/80 text-emerald-400 border-emerald-700/80'
                      : selectedDifficulty === 'advanced'
                      ? 'bg-purple-950/80 text-purple-300 border-purple-700/80'
                      : 'bg-amber-950/80 text-amber-300 border-amber-700/80'
                  }`}
                >
                  {selectedDifficulty === 'beginner'
                    ? '🟢 Beginner Level'
                    : selectedDifficulty === 'advanced'
                    ? '🟣 Advanced AP Depth'
                    : '🟡 Standard Level'}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                {activeSimulation.summary}
              </p>
              {activeSimulation.realWorldAnalogy && (
                <div className="flex items-start gap-2 bg-indigo-950/90 border border-indigo-700/50 rounded-xl p-2.5 mt-2">
                  <Lightbulb className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-100 font-medium">
                    <strong className="text-amber-300">Simple Analogy:</strong> {activeSimulation.realWorldAnalogy}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="text-[10px] font-black uppercase text-indigo-300 bg-indigo-900/60 px-2.5 py-1 rounded-full border border-indigo-700/60">
                {activeSimulation.category}
              </span>
            </div>
          </div>

          {/* 3. INTERACTIVE SIMULATION STAGE (CANVAS + CONTROLS) */}
          <InteractiveSimulationStage
            simulation={activeSimulation}
            currentStageIndex={currentStageIndex}
            onSelectStageIndex={(idx) => setCurrentStageIndex(idx)}
            knobValues={knobValues}
            onChangeKnob={handleKnobChange}
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            speed={speed}
            onChangeSpeed={(newSpeed) => setSpeed(newSpeed)}
            difficulty={selectedDifficulty}
            onChangeDifficulty={handleDifficultyChange}
          />

          {/* 4. STAGE STEPPER BUTTONS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {activeSimulation.stages.map((stg, idx) => {
              const isCurrent = idx === currentStageIndex;
              return (
                <button
                  key={stg.id}
                  onClick={() => {
                    setCurrentStageIndex(idx);
                    setIsPlaying(false);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-indigo-600/30 border-indigo-400 text-white shadow-md shadow-indigo-600/20 ring-2 ring-indigo-500/40'
                      : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="text-[10px] font-black uppercase text-amber-400 mb-0.5">
                    Stage {stg.stageNumber}
                  </div>
                  <div className="text-xs font-bold truncate text-slate-200">
                    {stg.title.split(':')[1] || stg.title}
                  </div>
                </button>
              );
            })}
          </div>

          {/* 5. CHECK YOUR UNDERSTANDING (INTERACTIVE MINI CHALLENGE) */}
          {activeSimulation.comprehensionQuiz && activeSimulation.comprehensionQuiz.length > 0 && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <h4 className="text-sm font-black text-white uppercase tracking-wider">
                    Check Your Understanding: Test Your Knowledge
                  </h4>
                </div>
                {showQuizCelebration && (
                  <span className="text-xs font-black text-emerald-400 bg-emerald-950 border border-emerald-800 px-2.5 py-0.5 rounded-full animate-pulse">
                    🎉 Concept Mastered!
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {activeSimulation.comprehensionQuiz.map((q, qIdx) => {
                  const selectedOpt = userQuizAnswers[qIdx];
                  const hasAnswered = selectedOpt !== undefined;
                  const isCorrect = selectedOpt === q.correctIndex;

                  return (
                    <div key={qIdx} className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
                      <p className="text-xs sm:text-sm font-bold text-slate-100">
                        {qIdx + 1}. {q.question}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, optIdx) => {
                          const isOptionSelected = selectedOpt === optIdx;
                          let btnStyle = "bg-slate-800/90 hover:bg-slate-700 text-slate-300 border-slate-700";

                          if (hasAnswered) {
                            if (optIdx === q.correctIndex) {
                              btnStyle = "bg-emerald-900/80 border-emerald-500 text-emerald-200 font-bold";
                            } else if (isOptionSelected && !isCorrect) {
                              btnStyle = "bg-rose-900/80 border-rose-500 text-rose-200 font-bold";
                            } else {
                              btnStyle = "bg-slate-800/40 text-slate-500 border-slate-800";
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              disabled={hasAnswered}
                              onClick={() => handleSelectQuizOption(qIdx, optIdx, q.correctIndex)}
                              className={`text-left text-xs p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {hasAnswered && optIdx === q.correctIndex && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {hasAnswered && (
                        <div className="space-y-2 mt-3 pt-3 border-t border-slate-800">
                          {/* 1. Header Banner */}
                          <div className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-bold ${
                            isCorrect
                              ? 'bg-emerald-950/80 border-emerald-700/80 text-emerald-200'
                              : 'bg-rose-950/80 border-rose-700/80 text-rose-200'
                          }`}>
                            {isCorrect ? (
                              <>
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span>✅ Correct! Excellent understanding of this stage! 🎉</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                                <span>❌ Incorrect. Correct Answer: {String.fromCharCode(65 + q.correctIndex)}. {q.options[q.correctIndex]}</span>
                              </>
                            )}
                          </div>

                          {/* 2. Concept Tested */}
                          <div className="p-2.5 rounded-lg bg-indigo-950/70 border border-indigo-800/60 text-indigo-200 text-xs">
                            <div className="flex items-center gap-1.5 font-bold text-indigo-300 uppercase tracking-wider mb-1 text-[11px]">
                              <Target className="w-3.5 h-3.5 text-indigo-400" />
                              <span>🎯 Concept Tested:</span>
                            </div>
                            <p className="font-semibold text-slate-100 pl-5">
                              {q.conceptTested || activeSimulation.conceptTitle || "Scientific Principle & Dynamic Mechanism"}
                            </p>
                          </div>

                          {/* 3. Why the Correct Answer is Right */}
                          <div className="p-2.5 rounded-lg bg-slate-900 border border-emerald-900/60 text-slate-200 text-xs space-y-1">
                            <div className="flex items-center gap-1.5 font-bold text-amber-300 uppercase tracking-wider text-[11px]">
                              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                              <span>💡 Why the Correct Answer is Right:</span>
                            </div>
                            <p className="text-slate-300 pl-5 leading-relaxed font-medium">
                              {q.whyCorrect || q.explanation}
                            </p>
                            {q.whyCorrect && q.explanation && q.whyCorrect.trim() !== q.explanation.trim() && (
                              <div className="pt-1.5 mt-1.5 border-t border-slate-800 pl-5 text-[11px] text-slate-400">
                                <strong className="font-semibold text-slate-300 block">Detailed Context:</strong>
                                <span>{q.explanation}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 6. DID YOU KNOW FUN FACT */}
          {activeSimulation.funFact && (
            <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 border border-amber-600/40 rounded-2xl p-4 flex items-start gap-3">
              <span className="text-2xl shrink-0">🦖</span>
              <div>
                <h5 className="text-xs font-black uppercase tracking-wider text-amber-300">
                  Did You Know?
                </h5>
                <p className="text-xs text-amber-100/90 leading-relaxed mt-0.5">
                  {activeSimulation.funFact}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-slate-300">Imagine Ur Creativity Engine Active</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors cursor-pointer border border-slate-700"
          >
            Done Exploring
          </button>
        </div>
      </div>
    </div>
  );
};
