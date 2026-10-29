import React, { useState, useMemo } from "react";
import {
  X,
  Search,
  Sparkles,
  GraduationCap,
  Sliders,
  ChevronRight,
  BookOpen,
  ArrowRight,
  Loader2,
  AlertCircle,
  Check,
  Compass,
  Zap,
  Globe2,
  Library,
  HelpCircle,
} from "lucide-react";
import {
  AcademicFaculty,
  AppLanguage,
  EducationLevel,
  GeneratedQuiz,
  QuizDifficulty,
  SubjectItem,
} from "../types";
import {
  FACULTIES,
  EDUCATION_LEVEL_OPTIONS,
  UNIVERSAL_SUBJECTS,
  searchSubjects,
} from "../data/subjectTaxonomy";
import { generateOfflineQuiz } from "../utils/offlineQuizEngine";

interface UniversalSubjectExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuizGenerated: (quiz: GeneratedQuiz) => void;
  initialFaculty?: AcademicFaculty;
  isOffline?: boolean;
}

export const UniversalSubjectExplorerModal: React.FC<UniversalSubjectExplorerModalProps> = ({
  isOpen,
  onClose,
  onQuizGenerated,
  initialFaculty = "all",
  isOffline = false,
}) => {
  const [selectedFaculty, setSelectedFaculty] = useState<AcademicFaculty>(initialFaculty);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Selected subject for configuration/launch
  const [activeSubject, setActiveSubject] = useState<SubjectItem | null>(null);

  // Custom subject input
  const [customSubjectName, setCustomSubjectName] = useState<string>("");
  const [customSubjectTopic, setCustomSubjectTopic] = useState<string>("");
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  // Configuration options
  const [educationLevel, setEducationLevel] = useState<EducationLevel>("undergraduate");
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [questionTypes, setQuestionTypes] = useState<"mixed" | "mcq" | "true_false">("mixed");
  const [difficulty, setDifficulty] = useState<QuizDifficulty>("medium");
  const [language, setLanguage] = useState<AppLanguage>("en");
  const [selectedTopic, setSelectedTopic] = useState<string>("");

  // Loading & error states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filtered subject list
  const filteredSubjects = useMemo(() => {
    return searchSubjects(searchQuery, selectedFaculty);
  }, [searchQuery, selectedFaculty]);

  if (!isOpen) return null;

  const handleSelectSubject = (subject: SubjectItem) => {
    setActiveSubject(subject);
    setIsCustomMode(false);
    setDifficulty(subject.defaultDifficulty);
    if (subject.suggestedLevels.length > 0) {
      setEducationLevel(subject.suggestedLevels[0]);
    }
    setSelectedTopic("");
    setErrorMessage(null);
  };

  const handleGenerate = async (targetSubjectName?: string, targetTopic?: string) => {
    const subjectToUse = targetSubjectName || (isCustomMode ? customSubjectName.trim() : activeSubject?.name);

    if (!subjectToUse) {
      setErrorMessage("Please select a subject or type in any custom subject name.");
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    const topicToFocus = targetTopic !== undefined ? targetTopic : (isCustomMode ? customSubjectTopic.trim() : selectedTopic);

    if (isOffline) {
      const offlineQuiz = generateOfflineQuiz({
        subjectName: subjectToUse,
        faculty: activeSubject?.faculty || selectedFaculty,
        educationLevel,
        focusTopic: topicToFocus || undefined,
        numQuestions,
        questionTypes,
        language,
      });
      onQuizGenerated(offlineQuiz);
      onClose();
      setIsLoading(false);
      return;
    }

    setLoadingStep(`Consulting curriculum standards for ${subjectToUse}...`);

    try {
      setLoadingStep(`Synthesizing academic questions at ${educationLevel.replace("_", " ")} level...`);

      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectName: subjectToUse,
          faculty: activeSubject?.faculty || selectedFaculty,
          educationLevel,
          focusTopic: topicToFocus || undefined,
          numQuestions,
          questionTypes,
          difficulty,
          language,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to generate subject quiz.`);
      }

      setLoadingStep("Verifying question accuracy and formatting explanations...");
      const quiz: GeneratedQuiz = await response.json();

      onQuizGenerated(quiz);
      onClose();
    } catch (err: any) {
      console.error("Error generating subject test:", err);
      setErrorMessage(err.message || "Failed to generate subject quiz. Please try again.");
    } finally {
      setIsLoading(false);
      setLoadingStep("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/70 via-white to-violet-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
              <Library className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">
                  Universal Subject Catalog
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
                  Every Subject Ever Taught
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Explore across 10 academic faculties or create a curriculum test on ANY field of human knowledge
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Custom Subject Action Bar */}
        <div className="px-6 py-3 bg-slate-50/80 border-b border-slate-200/70 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Live Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 100+ subjects (e.g. Quantum Mechanics, Microeconomics, Pāṇini, Roman Law)..."
              className="w-full pl-9 pr-9 py-2 bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Custom Subject Switch */}
          <button
            type="button"
            onClick={() => {
              setIsCustomMode(!isCustomMode);
              setActiveSubject(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shrink-0 ${
              isCustomMode
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-300"
                : "bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50"
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>{isCustomMode ? "Browsing Subject Catalog" : "Enter ANY Custom Subject"}</span>
          </button>
        </div>

        {/* Faculties Pill Tabs */}
        {!isCustomMode && (
          <div className="px-6 py-2.5 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none bg-white">
            {FACULTIES.map((fac) => {
              const isSelected = selectedFaculty === fac.id;
              return (
                <button
                  key={fac.id}
                  onClick={() => setSelectedFaculty(fac.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                  }`}
                  title={fac.description}
                >
                  <span>{fac.icon}</span>
                  <span>{fac.shortLabel}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Modal Main Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Custom Subject Generator Card */}
          {isCustomMode && (
            <div className="bg-gradient-to-br from-indigo-50/90 via-white to-violet-50/80 border-2 border-indigo-200 rounded-3xl p-6 shadow-sm space-y-5 animate-in fade-in duration-150">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    Test on ANY Subject Ever Taught in Human History
                  </h4>
                  <p className="text-xs text-slate-500">
                    Enter any academic discipline, niche field, historical curriculum, or university degree topic. Gemini's encyclopedic knowledge will generate an authentic curriculum test.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Subject Name *
                  </label>
                  <input
                    type="text"
                    value={customSubjectName}
                    onChange={(e) => setCustomSubjectName(e.target.value)}
                    placeholder="e.g. Paleoclimatology, Quantum Cryptography, Roman Legal History..."
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Subtopic or Module (Optional)
                  </label>
                  <input
                    type="text"
                    value={customSubjectTopic}
                    onChange={(e) => setCustomSubjectTopic(e.target.value)}
                    placeholder="e.g. Milankovitch Cycles, Shor's Algorithm, Corpus Juris Civilis..."
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Quick suggestions pills */}
              <div>
                <span className="text-xs font-medium text-slate-500 mr-2">Or click an intriguing topic:</span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[
                    "Class 1: Counting & Shapes (1-20)",
                    "Class 2: Living Things & Four Seasons",
                    "Class 3: Times Tables (2-10)",
                    "Class 4: States of Matter & Science",
                    "Class 5: Our Solar System & Planets",
                    "Junior Kids GK: Animal Records & Space",
                    "Astrophysics: Black Hole Thermodynamics",
                    "Bioinformatics & CRISPR Mechanisms",
                    "Classical Sanskrit: Vibhakti & Sandhi",
                    "Philosophy of Consciousness & Qualia",
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        const parts = preset.split(": ");
                        setCustomSubjectName(parts[0]);
                        setCustomSubjectTopic(parts[1] || "");
                      }}
                      className="px-2.5 py-1 text-xs bg-white text-indigo-700 hover:bg-indigo-50 border border-indigo-200/80 rounded-lg transition-colors font-medium"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Subjects Grid & Details Split View */}
          {!isCustomMode && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Available Disciplines ({filteredSubjects.length})
                </span>
                {selectedFaculty !== "all" && (
                  <button
                    onClick={() => setSelectedFaculty("all")}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                  >
                    View all faculties
                  </button>
                )}
              </div>

              {filteredSubjects.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200 p-8">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                    <Compass className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">
                    No matching subjects found for "{searchQuery}"
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Don't worry! TestGen supports every subject ever taught. Switch to custom mode to generate an authentic exam on "{searchQuery}".
                  </p>
                  <button
                    onClick={() => {
                      setCustomSubjectName(searchQuery);
                      setIsCustomMode(true);
                    }}
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm inline-flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Quiz for "{searchQuery}"</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {filteredSubjects.map((sub) => {
                    const isSelected = activeSubject?.id === sub.id;
                    return (
                      <div
                        key={sub.id}
                        onClick={() => handleSelectSubject(sub)}
                        className={`group relative rounded-2xl p-4 border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "bg-indigo-50/60 border-indigo-400 ring-2 ring-indigo-500/20 shadow-sm"
                            : "bg-white border-slate-200/90 hover:border-indigo-300 hover:shadow-xs"
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span className="text-2xl p-1 rounded-xl bg-slate-50 border border-slate-100 group-hover:scale-105 transition-transform shrink-0">
                              {sub.icon}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                              {sub.facultyLabel}
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                            {sub.name}
                          </h4>
                          <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                            {sub.description}
                          </p>

                          {/* Common topics preview */}
                          <div className="flex flex-wrap gap-1 mt-3">
                            {sub.commonTopics.slice(0, 3).map((topic) => (
                              <span
                                key={topic}
                                className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 truncate max-w-[140px]"
                              >
                                {topic}
                              </span>
                            ))}
                            {sub.commonTopics.length > 3 && (
                              <span className="text-[10px] px-1.5 py-0.5 text-slate-400 font-medium">
                                +{sub.commonTopics.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-slate-400 text-[11px] font-medium">
                            {sub.defaultDifficulty.toUpperCase()} • {sub.suggestedLevels[0]?.replace("_", " ")}
                          </span>
                          <span className="font-bold text-indigo-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                            Select <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Test Configuration Panel (When activeSubject or isCustomMode is active) */}
          {(activeSubject || isCustomMode) && (
            <div className="bg-slate-50/90 border border-slate-200 rounded-3xl p-6 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  <Sliders className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-sm font-bold text-slate-900">
                    Configure Academic Test:{" "}
                    <span className="text-indigo-600 font-extrabold">
                      {isCustomMode ? (customSubjectName || "Custom Subject") : activeSubject?.name}
                    </span>
                  </h4>
                </div>
                {activeSubject?.popularCurriculumRef && (
                  <span className="text-[11px] text-slate-500 hidden sm:inline">
                    Reference: {activeSubject.popularCurriculumRef}
                  </span>
                )}
              </div>

              {/* Subtopic selection chips for active subject */}
              {activeSubject && activeSubject.commonTopics.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Focus on a Specific Module / Topic (Optional)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedTopic("")}
                      className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                        selectedTopic === ""
                          ? "bg-indigo-600 text-white"
                          : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      Entire Curriculum (Comprehensive)
                    </button>
                    {activeSubject.commonTopics.map((topic) => {
                      const isChosen = selectedTopic === topic;
                      return (
                        <button
                          key={topic}
                          type="button"
                          onClick={() => setSelectedTopic(topic)}
                          className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                            isChosen
                              ? "bg-indigo-600 text-white shadow-2xs"
                              : "bg-white text-slate-700 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50"
                          }`}
                        >
                          {topic}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Education Level */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Academic Level
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {EDUCATION_LEVEL_OPTIONS.map((level) => {
                    const isSelected = educationLevel === level.id;
                    return (
                      <button
                        key={level.id}
                        type="button"
                        onClick={() => setEducationLevel(level.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? "border-indigo-600 bg-white ring-2 ring-indigo-500/20 shadow-xs"
                            : "border-slate-200 bg-white/70 hover:bg-white hover:border-slate-300"
                        }`}
                      >
                        <div className="text-xs font-bold text-slate-900 line-clamp-1">
                          {level.label}
                        </div>
                        <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                          {level.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Number of Questions, Question Types, Difficulty, Language */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* Num Questions */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Questions ({numQuestions})
                  </label>
                  <input
                    type="range"
                    min={3}
                    max={20}
                    step={1}
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>3 quick</span>
                    <span>10 test</span>
                    <span>20 deep exam</span>
                  </div>
                </div>

                {/* Question Types */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Question Format
                  </label>
                  <select
                    value={questionTypes}
                    onChange={(e) => setQuestionTypes(e.target.value as any)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="mixed">Mixed (MCQ + True/False)</option>
                    <option value="mcq">Multiple Choice Only (4 options)</option>
                    <option value="true_false">True / False Only</option>
                  </select>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Difficulty Level
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="easy">Easy (Recall & Core Facts)</option>
                    <option value="medium">Medium (Standard Academic)</option>
                    <option value="hard">Hard (Deep Analytical & Multi-Step)</option>
                    <option value="mixed">Progressive Mixed</option>
                  </select>
                </div>

                {/* Language */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as any)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="en">English (Academic Standard)</option>
                    <option value="hi">हिन्दी (Hindi)</option>
                    <option value="sa">संस्कृतम् (Classical Sanskrit)</option>
                  </select>
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Action Button */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveSubject(null);
                    setIsCustomMode(false);
                  }}
                  disabled={isLoading}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-200/60 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => handleGenerate()}
                  disabled={isLoading}
                  className="px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md shadow-indigo-300 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{loadingStep || "Generating Exam..."}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate {isCustomMode ? customSubjectName || "Subject" : activeSubject?.name} Exam</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-indigo-500" />
            <span>Universal syllabus coverage across high school, university, and ancient disciplines</span>
          </div>

          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
