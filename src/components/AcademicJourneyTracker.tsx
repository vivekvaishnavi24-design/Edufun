import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin,
  CheckCircle2,
  Trophy,
  Star,
  Sparkles,
  ArrowRight,
  Play,
  RotateCcw,
  Eye,
  Lock,
  Unlock,
  Flame,
  Award,
  BookOpen,
  Compass,
  ChevronRight,
  X,
  Clock,
  Target,
  Lightbulb,
  Zap,
  ToggleLeft,
  ToggleRight,
  Layers,
  ShieldCheck,
  Check
} from 'lucide-react';
import { GeneratedQuiz, QuizAttempt, AcademicFaculty, BackgroundTheme } from '../types';
import { getQuizAttempts, getSavedQuizzes, getActiveQuiz } from '../utils/storage';
import { playClick, playSuccessSound } from '../utils/audio';

export interface JourneyMilestone {
  id: string;
  stepNumber: number;
  title: string;
  category: string;
  faculty: AcademicFaculty;
  icon: string;
  gradient: string;
  keywords: string[];
  concepts: string[];
  description: string;
  defaultTopic: string;
}

export const JOURNEY_MILESTONES: JourneyMilestone[] = [
  {
    id: 'milestone-1-atmosphere',
    stepNumber: 1,
    title: 'Atmospheric Physics & Weather Systems',
    category: 'Earth & Environmental Sciences',
    faculty: 'natural_sciences',
    icon: '🌦️',
    gradient: 'from-cyan-500 to-blue-600',
    keywords: ['weather', 'atmosphere', 'water cycle', 'troposphere', 'pressure', 'barometer', 'clouds', 'precipitation'],
    concepts: ['Tropospheric Thermal Convection', 'Low-Pressure Thermodynamics', 'Barometric Gradient Dynamics', 'Coriolis Deflection'],
    description: 'Master atmospheric thermodynamics, vertical convection currents, pressure gradients, and Earth weather systems.',
    defaultTopic: 'Atmospheric Science & Weather Systems'
  },
  {
    id: 'milestone-2-biology',
    stepNumber: 2,
    title: 'Cellular Biology & Genetics',
    category: 'Life & Medical Sciences',
    faculty: 'natural_sciences',
    icon: '🧬',
    gradient: 'from-emerald-500 to-teal-600',
    keywords: ['biology', 'cell', 'dna', 'photosynthesis', 'genetics', 'mitosis', 'circulation', 'heart', 'mitochondria'],
    concepts: ['Mitochondrial ATP Synthesis', 'DNA Polymerase Unzipping', 'Chloroplast Photophosphorylation', 'Cardiovascular Hemodynamics'],
    description: 'Explore intracellular organelle respiration, double-helix replication, photosynthesis reactions, and physiological circulation.',
    defaultTopic: 'Cellular Biology, Photosynthesis & Genetics'
  },
  {
    id: 'milestone-3-mechanics',
    stepNumber: 3,
    title: 'Newtonian Mechanics & Orbital Physics',
    category: 'Physical & Space Sciences',
    faculty: 'natural_sciences',
    icon: '⚛️',
    gradient: 'from-indigo-500 to-violet-600',
    keywords: ['physics', 'mechanics', 'force', 'gravity', 'aerodynamics', 'orbit', 'velocity', 'rocket', 'acceleration'],
    concepts: ['Bernoulli Airfoil Lift', 'Keplerian Elliptical Orbits', "Newton's Third Law Reaction Thrust", 'Gravitational Field Strength'],
    description: 'Investigate classical kinematics, airfoil aerodynamic lift, universal gravitation, and vacuum propulsion dynamics.',
    defaultTopic: 'Classical Mechanics, Aerodynamics & Orbits'
  },
  {
    id: 'milestone-4-mathematics',
    stepNumber: 4,
    title: 'Mathematical Reasoning & Equations',
    category: 'Formal Sciences & Mathematics',
    faculty: 'formal_sciences_math',
    icon: '📐',
    gradient: 'from-blue-600 to-indigo-600',
    keywords: ['math', 'mathematics', 'algebra', 'calculus', 'geometry', 'statistics', 'equation', 'trigonometry'],
    concepts: ['Multi-variable Equation Balancing', 'Geometric Coordinate Proofs', 'Differential Rate Analysis', 'Empirical Probability'],
    description: 'Build rigorous problem-solving with algebraic balances, coordinate theorems, rate differentials, and formal proofs.',
    defaultTopic: 'Algebraic Equations & Geometric Reasoning'
  },
  {
    id: 'milestone-5-circuits',
    stepNumber: 5,
    title: 'Electric Circuits & Computational Systems',
    category: 'Engineering & Technology',
    faculty: 'computer_science_tech',
    icon: '⚡',
    gradient: 'from-amber-500 to-orange-600',
    keywords: ['circuit', 'electric', 'computer', 'coding', 'ohm', 'logic', 'technology', 'algorithm', 'electrons'],
    concepts: ["Ohm's Law & Circuit Resistance", 'Closed Loop Electron Flow', 'Boolean Logic Gates', 'Algorithmic Complexity'],
    description: 'Trace electron drift across closed circuits, potential differences, semiconductor gates, and computational algorithms.',
    defaultTopic: 'Electric Circuits, Ohm Law & Logic Gates'
  },
  {
    id: 'milestone-6-chemistry',
    stepNumber: 6,
    title: 'Atomic Chemistry & States of Matter',
    category: 'Chemical & Molecular Sciences',
    faculty: 'natural_sciences',
    icon: '🧪',
    gradient: 'from-rose-500 to-pink-600',
    keywords: ['chemistry', 'atom', 'matter', 'molecule', 'periodic', 'reaction', 'states of matter', 'solid', 'gas'],
    concepts: ['Bohr-Rutherford Electron Shells', 'Covalent & Ionic Bonding', 'Latent Heat Phase Shifts', 'Molecular Kinetic Theory'],
    description: 'Analyze quantized electron energy orbitals, chemical reaction kinetics, and thermodynamic phase transitions.',
    defaultTopic: 'Atomic Theory, Chemical Bonds & Matter'
  },
  {
    id: 'milestone-7-humanities',
    stepNumber: 7,
    title: 'World Civilizations & Constitutional Law',
    category: 'Humanities & Social Sciences',
    faculty: 'humanities_history',
    icon: '🏛️',
    gradient: 'from-yellow-600 to-amber-700',
    keywords: ['history', 'civilization', 'constitution', 'law', 'world', 'society', 'geography', 'democracy'],
    concepts: ['Ancient Classical Governance', 'Constitutional Rights & Checks', 'Socio-economic Trade Networks', 'Historical Causality'],
    description: 'Understand historical inflection points, democratic constitutional frameworks, and global civilization development.',
    defaultTopic: 'World History, Civilizations & Governance'
  },
  {
    id: 'milestone-8-capstone',
    stepNumber: 8,
    title: 'Senior Board Exam Capstone & Mastery',
    category: 'Comprehensive Interdisciplinary Prep',
    faculty: 'all',
    icon: '🏆',
    gradient: 'from-amber-400 via-yellow-500 to-amber-600',
    keywords: ['board', 'exam', 'class 10', 'class 12', 'capstone', 'comprehensive', 'mastery', 'scholar'],
    concepts: ['High-Yield Interdisciplinary Synthesis', 'Timed Examination Discipline', 'Complex Scenario Analysis', 'Critical Deductive Reasoning'],
    description: 'Synthesize knowledge across science, mathematics, technology, and humanities in a rigorous board-level examination.',
    defaultTopic: 'Class 10 & 12 Board Exam Comprehensive Capstone'
  }
];

export interface MilestoneProgress {
  milestone: JourneyMilestone;
  status: 'mastered' | 'in_progress' | 'ready' | 'locked';
  attemptsCount: number;
  bestScorePercentage: number;
  lastAttemptAt?: number;
  associatedAttempts: QuizAttempt[];
  associatedQuizzes: GeneratedQuiz[];
  stars: number; // 0 to 3
}

interface AcademicJourneyTrackerProps {
  onSelectQuiz: (quiz: GeneratedQuiz) => void;
  onReviewQuizAttempt: (quiz: GeneratedQuiz, attemptAnswers?: Record<string, string>) => void;
  onStartTopicQuiz: (topicName: string, faculty?: AcademicFaculty) => void;
  currentQuizId?: string;
  isImagineCreativityEnabled: boolean;
  onToggleImagineCreativity: (enabled: boolean) => void;
  theme?: BackgroundTheme;
}

export const AcademicJourneyTracker: React.FC<AcademicJourneyTrackerProps> = ({
  onSelectQuiz,
  onReviewQuizAttempt,
  onStartTopicQuiz,
  currentQuizId,
  isImagineCreativityEnabled,
  onToggleImagineCreativity,
  theme = 'modern-grid'
}) => {
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [savedQuizzes, setSavedQuizzes] = useState<GeneratedQuiz[]>([]);
  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'mastered' | 'in_progress' | 'ready'>('all');

  // Load storage state and listen for updates
  const reloadData = () => {
    setAttempts(getQuizAttempts());
    setSavedQuizzes(getSavedQuizzes());
  };

  useEffect(() => {
    reloadData();
    const handleStorage = () => reloadData();
    window.addEventListener('storage', handleStorage);
    window.addEventListener('learning-streak-updated', handleStorage);
    window.addEventListener('quiz-attempt-saved', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('learning-streak-updated', handleStorage);
      window.removeEventListener('quiz-attempt-saved', handleStorage);
    };
  }, []);

  // Compute progress for each milestone based on real student quiz records
  const milestoneProgressList = useMemo<MilestoneProgress[]>(() => {
    let previousWasMastered = true; // Milestone 1 starts ready/unlocked

    return JOURNEY_MILESTONES.map((m, index) => {
      // Find matching attempts
      const matchingAttempts = attempts.filter((att) => {
        const titleLower = (att.quizTitle || '').toLowerCase();
        return m.keywords.some((k) => titleLower.includes(k.toLowerCase()));
      });

      // Find matching saved quizzes
      const matchingQuizzes = savedQuizzes.filter((sq) => {
        const titleLower = (sq.title || '').toLowerCase();
        const docLower = (sq.documentName || '').toLowerCase();
        const subjectLower = (sq.subjectName || '').toLowerCase();
        const topics = (sq.topicsCovered || []).map((t) => t.toLowerCase()).join(' ');
        const fullHaystack = `${titleLower} ${docLower} ${subjectLower} ${topics}`;
        return m.keywords.some((k) => fullHaystack.includes(k.toLowerCase()));
      });

      const attemptsCount = matchingAttempts.length;
      let bestScorePercentage = 0;
      let lastAttemptAt: number | undefined;

      if (attemptsCount > 0) {
        bestScorePercentage = Math.max(...matchingAttempts.map((a) => a.percentage || 0));
        const sorted = [...matchingAttempts].sort((a, b) => b.completedAt - a.completedAt);
        lastAttemptAt = sorted[0]?.completedAt;
      }

      // Determine stars
      let stars = 0;
      if (bestScorePercentage >= 90) stars = 3;
      else if (bestScorePercentage >= 75) stars = 2;
      else if (bestScorePercentage > 0) stars = 1;

      // Status
      let status: 'mastered' | 'in_progress' | 'ready' | 'locked' = 'locked';
      if (bestScorePercentage >= 75) {
        status = 'mastered';
        previousWasMastered = true;
      } else if (attemptsCount > 0) {
        status = 'in_progress';
        previousWasMastered = false;
      } else if (index === 0 || previousWasMastered) {
        status = 'ready';
        previousWasMastered = false;
      } else {
        status = 'locked';
        previousWasMastered = false;
      }

      return {
        milestone: m,
        status,
        attemptsCount,
        bestScorePercentage,
        lastAttemptAt,
        associatedAttempts: matchingAttempts,
        associatedQuizzes: matchingQuizzes,
        stars
      };
    });
  }, [attempts, savedQuizzes]);

  // Overall journey metrics
  const totalMilestones = milestoneProgressList.length;
  const masteredCount = milestoneProgressList.filter((m) => m.status === 'mastered').length;
  const inProgressCount = milestoneProgressList.filter((m) => m.status === 'in_progress').length;
  const completionPercentage = Math.round((masteredCount / totalMilestones) * 100);

  const totalJourneyXp = useMemo(() => {
    return attempts.reduce((acc, curr) => acc + (curr.score || 0) * 100, 0);
  }, [attempts]);

  const activeMilestone = useMemo(() => {
    if (!selectedMilestoneId) return null;
    return milestoneProgressList.find((mp) => mp.milestone.id === selectedMilestoneId) || null;
  }, [selectedMilestoneId, milestoneProgressList]);

  // Filtered milestones for display
  const filteredMilestones = useMemo(() => {
    if (activeTabFilter === 'all') return milestoneProgressList;
    return milestoneProgressList.filter((mp) => mp.status === activeTabFilter);
  }, [milestoneProgressList, activeTabFilter]);

  const handleMilestoneClick = (mp: MilestoneProgress) => {
    playClick();
    setSelectedMilestoneId(mp.milestone.id);
  };

  const isMidnight = theme === 'midnight';

  return (
    <section
      id="academic-journey-tracker"
      aria-label="Academic Journey Progress Tracker"
      className={`rounded-3xl border transition-all duration-300 p-4 sm:p-6 space-y-6 ${
        isMidnight
          ? 'bg-slate-900/90 border-indigo-900/40 text-slate-100 shadow-xl shadow-slate-950/50'
          : 'bg-white/95 border-indigo-100 text-slate-900 shadow-md shadow-indigo-100/40 backdrop-blur-sm'
      }`}
    >
      {/* 1. TOP HEADER & OVERALL JOURNEY METRICS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-amber-500 text-white flex items-center justify-center text-2xl shadow-md shadow-indigo-600/25 shrink-0">
            🗺️
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-xl font-black tracking-tight flex items-center gap-2">
                Academic Journey
                <span className="text-xs px-2.5 py-0.5 rounded-full font-extrabold uppercase bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Curriculum Roadmap
                </span>
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Track mastery of curriculum topics across your learning quest. Click any segment on the road to review past quizzes and explanations!
            </p>
          </div>
        </div>

        {/* Milestone Summary Badges */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Completion Meter */}
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs shadow-2xs">
            <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
            <div>
              <div className="font-extrabold text-slate-900 dark:text-slate-100">
                {masteredCount} of {totalMilestones} Mastered
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                {completionPercentage}% Journey Progress
              </div>
            </div>
          </div>

          {/* Total XP */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/80 text-xs shadow-2xs">
            <Flame className="w-4 h-4 text-orange-500 shrink-0" />
            <div>
              <div className="font-black text-indigo-950 dark:text-indigo-200">
                {totalJourneyXp.toLocaleString()} XP
              </div>
              <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
                Mastery Points
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. PROGRESS ROADMAP VISUAL BAR */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
          <span className="flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-indigo-500" />
            Curriculum Quest Path
          </span>
          <span>{completionPercentage}% Completed</span>
        </div>
        <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700/80 shadow-inner">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-700 shadow-sm"
            style={{ width: `${Math.max(completionPercentage, 5)}%` }}
          />
        </div>
      </div>

      {/* 3. FILTER TABS */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        {[
          { id: 'all', label: `All Milestones (${totalMilestones})` },
          { id: 'mastered', label: `Mastered (${masteredCount})` },
          { id: 'in_progress', label: `In Progress (${inProgressCount})` },
          { id: 'ready', label: 'Ready to Explore' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTabFilter(tab.id as any)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer border ${
              activeTabFilter === tab.id
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4. INTERACTIVE ROADMAP PATHWAY (Winding / Serpentine Visual Grid) */}
      <div className="relative pt-2">
        {/* Desktop / Tablet Connecting Path Wire */}
        <div className="hidden lg:block absolute top-[52px] left-10 right-10 h-1 bg-gradient-to-r from-indigo-200 via-purple-200 to-amber-200 dark:from-indigo-950 dark:via-purple-950 dark:to-amber-950 z-0 rounded-full" />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 relative z-10">
          {filteredMilestones.map((mp) => {
            const m = mp.milestone;
            const isMastered = mp.status === 'mastered';
            const isInProgress = mp.status === 'in_progress';
            const isReady = mp.status === 'ready';
            const isLocked = mp.status === 'locked';

            return (
              <button
                key={m.id}
                type="button"
                onClick={() => handleMilestoneClick(mp)}
                className={`group relative text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between hover:scale-[1.02] active:scale-[0.99] ${
                  isMastered
                    ? isMidnight
                      ? 'bg-slate-800/90 border-emerald-500/60 hover:border-emerald-400 shadow-sm shadow-emerald-500/10'
                      : 'bg-gradient-to-b from-white to-emerald-50/40 border-emerald-300 hover:border-emerald-400 shadow-xs'
                    : isInProgress
                    ? isMidnight
                      ? 'bg-slate-800/90 border-amber-500/60 hover:border-amber-400 shadow-sm shadow-amber-500/10'
                      : 'bg-gradient-to-b from-white to-amber-50/40 border-amber-300 hover:border-amber-400 shadow-xs'
                    : isReady
                    ? isMidnight
                      ? 'bg-slate-800/90 border-indigo-500/50 hover:border-indigo-400'
                      : 'bg-white border-indigo-200 hover:border-indigo-400 shadow-2xs'
                    : isMidnight
                    ? 'bg-slate-900/60 border-slate-800 text-slate-400 opacity-80'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
                title={`Click to review past quizzes and concepts for Step ${m.stepNumber}: ${m.title}`}
              >
                {/* Milestone Step Pin & Status Icon */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center shrink-0 border ${
                        isMastered
                          ? 'bg-emerald-500 text-white border-emerald-400 shadow-xs'
                          : isInProgress
                          ? 'bg-amber-500 text-white border-amber-400 shadow-xs'
                          : isReady
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {m.stepNumber}
                    </span>
                    <span className="text-xl shrink-0 group-hover:scale-110 transition-transform">
                      {m.icon}
                    </span>
                  </div>

                  {/* Status Indicator Badge */}
                  <div>
                    {isMastered ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        Mastered
                      </span>
                    ) : isInProgress ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-700">
                        <Flame className="w-3 h-3 text-amber-600 dark:text-amber-400 animate-pulse" />
                        In Progress
                      </span>
                    ) : isReady ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-indigo-800 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-950/80 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                        <Unlock className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                        Start Quest
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                        <Lock className="w-3 h-3" />
                        Next Up
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-1 mb-3">
                  <div className="text-xs font-black line-clamp-1 text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {m.title}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {m.description}
                  </div>
                </div>

                {/* Footer Metrics & Stars */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                  {/* Stars / Accuracy */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3].map((starIdx) => (
                      <Star
                        key={starIdx}
                        className={`w-3.5 h-3.5 ${
                          starIdx <= mp.stars
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-200 dark:text-slate-700'
                        }`}
                      />
                    ))}
                    {mp.bestScorePercentage > 0 && (
                      <span className="text-[10px] font-extrabold ml-1 text-slate-700 dark:text-slate-300">
                        {mp.bestScorePercentage}%
                      </span>
                    )}
                  </div>

                  {/* Quizzes Count or Call to Action */}
                  <div className="font-bold flex items-center gap-1 text-indigo-600 dark:text-indigo-400 group-hover:underline">
                    {mp.attemptsCount > 0 ? (
                      <span>{mp.attemptsCount} {mp.attemptsCount === 1 ? 'quiz' : 'quizzes'} • Review</span>
                    ) : (
                      <span>Explore Segment</span>
                    )}
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. SEGMENT INSPECTOR / REVIEW MODAL */}
      {activeMilestone && (
        <div
          id="milestone-segment-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-fade-in"
          onClick={() => setSelectedMilestoneId(null)}
        >
          <div
            className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[88vh] animate-in zoom-in-95 duration-200 ${
              isMidnight
                ? 'bg-slate-900 border-indigo-900/60 text-slate-100'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-900 text-white border-b border-indigo-900 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 text-3xl flex items-center justify-center shrink-0 shadow-md">
                  {activeMilestone.milestone.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                      Step {activeMilestone.milestone.stepNumber} of {totalMilestones}
                    </span>
                    <span className="text-xs text-indigo-200 font-semibold">
                      {activeMilestone.milestone.category}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black mt-0.5">
                    {activeMilestone.milestone.title}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedMilestoneId(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
              {/* Milestone Details & Concepts */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {activeMilestone.milestone.description}
                </p>

                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-indigo-500" />
                    Core Curriculum Concepts Evaluated:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeMilestone.milestone.concepts.map((concept, cIdx) => (
                      <span
                        key={cIdx}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-indigo-700 dark:text-indigo-300 shadow-2xs"
                      >
                        {concept}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Past Quizzes / Attempt History List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    Past Quizzes & Attempt History ({activeMilestone.associatedAttempts.length})
                  </h4>
                  {activeMilestone.bestScorePercentage > 0 && (
                    <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      Best Score: {activeMilestone.bestScorePercentage}%
                    </span>
                  )}
                </div>

                {activeMilestone.associatedAttempts.length === 0 ? (
                  <div className="text-center py-6 px-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-500 space-y-2">
                    <p className="text-xs sm:text-sm font-semibold">
                      No attempts recorded yet for this curriculum milestone!
                    </p>
                    <p className="text-xs text-slate-400">
                      Take a quiz on this topic to log your score, unlock stars, and advance your Academic Journey.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMilestoneId(null);
                        onStartTopicQuiz(
                          activeMilestone.milestone.defaultTopic,
                          activeMilestone.milestone.faculty
                        );
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 mt-2 rounded-xl text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Start Topic Quiz Now 🚀</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {activeMilestone.associatedAttempts.map((attempt) => {
                      const attemptDate = new Date(attempt.completedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      });

                      // Find matching full quiz data from savedQuizzes or fallback
                      const fullQuiz =
                        savedQuizzes.find((q) => q.id === attempt.quizId) ||
                        activeMilestone.associatedQuizzes.find((q) => q.id === attempt.quizId) ||
                        getActiveQuiz();

                      return (
                        <div
                          key={attempt.id}
                          className="p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:border-indigo-300 dark:hover:border-indigo-600 transition-all"
                        >
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                                {attempt.quizTitle}
                              </span>
                              <span
                                className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                  attempt.percentage >= 75
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                                }`}
                              >
                                {attempt.percentage}% • {attempt.score}/{attempt.totalQuestions} Correct
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400">
                              <Clock className="w-3 h-3" />
                              <span>{attemptDate}</span>
                            </div>
                          </div>

                          {/* Review & Retake Actions */}
                          <div className="flex items-center gap-2 shrink-0">
                            {fullQuiz && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedMilestoneId(null);
                                  onReviewQuizAttempt(fullQuiz, attempt.answers);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800 transition-all cursor-pointer"
                                title="Review all question explanations, concept tested, and correct answers"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Review Quiz & Explanations</span>
                              </button>
                            )}

                            {fullQuiz && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedMilestoneId(null);
                                  onSelectQuiz(fullQuiz);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 border border-slate-200 dark:border-slate-600 transition-all cursor-pointer"
                                title="Retake this exact quiz"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>Retake</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Start Fresh Quiz on This Topic CTA */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80">
                <div>
                  <div className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                    Ready to practice fresh questions for this milestone?
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Generate an interactive practice test tailored to {activeMilestone.milestone.title}.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedMilestoneId(null);
                    onStartTopicQuiz(
                      activeMilestone.milestone.defaultTopic,
                      activeMilestone.milestone.faculty
                    );
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-all cursor-pointer shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Start Practice Quiz</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. AT THE VERY END: OPTION TO TURN ON OR OFF IMAGINE UR CREATIVITY */}
      <div
        id="imagine-creativity-toggle-end-option"
        className={`pt-5 mt-4 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl transition-all ${
          isImagineCreativityEnabled
            ? isMidnight
              ? 'bg-amber-950/20 border border-amber-500/30'
              : 'bg-gradient-to-r from-amber-50/80 via-orange-50/40 to-indigo-50/50 border border-amber-200/90'
            : isMidnight
            ? 'bg-slate-800/40 border border-slate-800'
            : 'bg-slate-50/90 border border-slate-200'
        }`}
      >
        <div className="flex items-start sm:items-center gap-3.5">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 transition-all ${
              isImagineCreativityEnabled
                ? 'bg-gradient-to-tr from-amber-400 to-indigo-600 text-slate-950 shadow-md shadow-amber-400/20 font-black'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
            }`}
          >
            ✨
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100">
                Imagine Ur Creativity Lab
              </span>
              <span
                className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  isImagineCreativityEnabled
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                {isImagineCreativityEnabled ? 'Enabled (ON) 🌟' : 'Disabled (OFF) ⏸️'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
              Toggle interactive physics animations, 3D visual simulations, and "Animate Concept ✨" explainer buttons on or off across your tests.
            </p>
          </div>
        </div>

        {/* Toggle Switch Control */}
        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
            {isImagineCreativityEnabled ? 'Active' : 'Turned Off'}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={isImagineCreativityEnabled}
            onClick={() => {
              playClick();
              onToggleImagineCreativity(!isImagineCreativityEnabled);
            }}
            className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
              isImagineCreativityEnabled
                ? 'bg-amber-500 ring-2 ring-amber-400/50 shadow-md shadow-amber-500/20'
                : 'bg-slate-300 dark:bg-slate-700'
            }`}
            title={
              isImagineCreativityEnabled
                ? 'Click to turn off Imagine Ur Creativity'
                : 'Click to turn on Imagine Ur Creativity'
            }
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out flex items-center justify-center text-[10px] ${
                isImagineCreativityEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            >
              {isImagineCreativityEnabled ? '✨' : '✕'}
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};
