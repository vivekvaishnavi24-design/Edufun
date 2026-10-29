import React, { useState, useRef, useMemo } from "react";
import {
  UploadCloud,
  FileText,
  X,
  Sparkles,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Sliders,
  FileUp,
  Loader2,
  Library,
  Search,
  Compass,
  GraduationCap,
} from "lucide-react";
import {
  AcademicFaculty,
  AppLanguage,
  EducationLevel,
  GeneratedQuiz,
  QuizDifficulty,
  SubjectItem,
  ClassroomUserAuth,
} from "../types";
import { SAMPLE_STUDY_MATERIALS, SampleStudyMaterial } from "../data/sampleDocuments";
import {
  FACULTIES,
  EDUCATION_LEVEL_OPTIONS,
  UNIVERSAL_SUBJECTS,
  searchSubjects,
} from "../data/subjectTaxonomy";
import { assignQuizToClassGroup } from "../utils/classroomStorage";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuizGenerated: (quiz: GeneratedQuiz) => void;
  initialTab?: "pdf" | "subjects" | "samples" | "text";
  currentUser?: ClassroomUserAuth | null;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onQuizGenerated,
  initialTab = "pdf",
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState<"pdf" | "subjects" | "samples" | "text">(initialTab);

  const isStaff = currentUser && (currentUser.role === "admin" || currentUser.role === "teacher");

  // Teacher / Admin Exclusive Exam Options
  const [examCategory, setExamCategory] = useState<"unit_exam" | "formative" | "board_mock" | "pop_quiz">("unit_exam");
  const [autoAssignClass, setAutoAssignClass] = useState<boolean>(true);
  const [strictProctoring, setStrictProctoring] = useState<boolean>(false);
  const [examTimeLimitMinutes, setExamTimeLimitMinutes] = useState<number>(15);
  const [passingPercentage, setPassingPercentage] = useState<number>(65);
  const [includeMarkingRubric, setIncludeMarkingRubric] = useState<boolean>(true);
  const [teacherExamInstructions, setTeacherExamInstructions] = useState<string>("");

  // PDF state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Subjects state
  const [selectedFaculty, setSelectedFaculty] = useState<AcademicFaculty>("all");
  const [subjectSearchQuery, setSubjectSearchQuery] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<SubjectItem | null>(null);
  const [customSubjectInput, setCustomSubjectInput] = useState<string>("");
  const [educationLevel, setEducationLevel] = useState<EducationLevel>("undergraduate");

  // Sample material state
  const [selectedSample, setSelectedSample] = useState<SampleStudyMaterial | null>(null);

  // Raw text state
  const [rawText, setRawText] = useState<string>("");
  const [rawTitle, setRawTitle] = useState<string>("");

  // Quiz configuration
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [questionTypes, setQuestionTypes] = useState<"mixed" | "mcq" | "true_false" | "typed">("mixed");
  const [difficulty, setDifficulty] = useState<QuizDifficulty>("medium");
  const [focusTopic, setFocusTopic] = useState<string>("");
  const [quizLanguage, setQuizLanguage] = useState<AppLanguage>("en");

  // Loading & Error states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const filteredSubjects = useMemo(() => {
    return searchSubjects(subjectSearchQuery, selectedFaculty);
  }, [subjectSearchQuery, selectedFaculty]);

  if (!isOpen) return null;

  const handleFile = (file: File) => {
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setErrorMessage("Please select a valid PDF file.");
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setErrorMessage("File size exceeds 25MB limit. Please upload a smaller PDF.");
      return;
    }

    setErrorMessage(null);
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setPdfBase64(base64);
    };
    reader.onerror = () => {
      setErrorMessage("Failed to read PDF file.");
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleGenerate = async () => {
    setErrorMessage(null);

    let docName = "";
    let base64Payload: string | undefined = undefined;
    let textPayload: string | undefined = undefined;
    let subjectNamePayload: string | undefined = undefined;
    let facultyPayload: AcademicFaculty | undefined = undefined;

    if (activeTab === "pdf") {
      if (!pdfBase64 || !selectedFile) {
        setErrorMessage("Please select or drop a PDF file first.");
        return;
      }
      docName = selectedFile.name;
      base64Payload = pdfBase64;
    } else if (activeTab === "subjects") {
      const activeName = customSubjectInput.trim() || selectedSubject?.name;
      if (!activeName) {
        setErrorMessage("Please select a subject or type in any custom subject name.");
        return;
      }
      subjectNamePayload = activeName;
      facultyPayload = selectedSubject?.faculty || selectedFaculty;
      docName = activeName;
    } else if (activeTab === "samples") {
      if (!selectedSample) {
        setErrorMessage("Please choose a sample study guide.");
        return;
      }
      docName = selectedSample.title;
      textPayload = selectedSample.content;
    } else {
      if (!rawText.trim()) {
        setErrorMessage("Please paste or enter study material notes.");
        return;
      }
      docName = rawTitle.trim() || "Pasted Lecture Notes";
      textPayload = rawText.trim();
    }

    setIsLoading(true);
    setLoadingStep(
      activeTab === "subjects"
        ? `Consulting curriculum standards for ${docName}...`
        : "Reading document and analyzing structure..."
    );

    try {
      setTimeout(() => {
        setLoadingStep(
          activeTab === "subjects"
            ? `Synthesizing academic questions at ${educationLevel.replace("_", " ")} level...`
            : "Extracting core concepts and generating test questions..."
        );
      }, 1500);

      setTimeout(() => {
        setLoadingStep(
          quizLanguage === "hi"
            ? "हिन्दी में प्रश्न, विकल्प एवं सारांश तैयार किए जा रहे हैं..."
            : quizLanguage === "sa"
            ? "संस्कृते प्रश्नोत्तराणि संक्षेपसाराश्च निर्मीयन्ते..."
            : "Drafting MCQ, True/False statements and detailed explanations..."
        );
      }, 3500);

      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pdfBase64: base64Payload,
          textContext: textPayload,
          subjectName: subjectNamePayload,
          faculty: facultyPayload,
          educationLevel: educationLevel || "class_1",
          documentName: docName,
          numQuestions,
          questionTypes,
          difficulty,
          focusTopic: focusTopic.trim() || undefined,
          language: quizLanguage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Server error (${response.status}): Failed to generate quiz`
        );
      }

      const generatedQuiz: GeneratedQuiz = await response.json();

      // If logged in as Teacher or Admin and auto-assign is checked, broadcast test to class
      if (isStaff && autoAssignClass && currentUser?.groupId) {
        try {
          assignQuizToClassGroup(currentUser.groupId, {
            title: generatedQuiz.title,
            topic: focusTopic.trim() || generatedQuiz.topicsCovered?.[0] || generatedQuiz.subjectName || generatedQuiz.title,
            questionsCount: generatedQuiz.questions?.length || numQuestions,
            fullData: generatedQuiz
          });
        } catch (e) {
          console.warn("Could not auto-assign test to class group:", e);
        }
      }

      onQuizGenerated(generatedQuiz);
      onClose();
    } catch (err: any) {
      console.error("Quiz generation failed:", err);
      setErrorMessage(
        err.message || "An unexpected error occurred while generating the test. Please try again."
      );
    } finally {
      setIsLoading(false);
      setLoadingStep("");
    }
  };

  return (
    <div
      id="upload-modal-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
    >
      <div
        id="upload-modal-container"
        className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/60 via-white to-violet-50/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  {isStaff ? "Faculty & Staff Test Generator" : "Generate Interactive Practice Test"}
                </h3>
                {isStaff && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                    👑 Teacher / Admin Mode
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                {isStaff
                  ? "Configure class tests, whole-class broadcasts (75 seats), and proctoring controls"
                  : "Upload study material or select from taxonomy subjects"}
              </p>
            </div>
          </div>

          <button
            id="close-upload-modal-btn"
            onClick={onClose}
            disabled={isLoading}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Split Pane with Independent Option Scrolling */}
        <div className="p-4 sm:p-6 flex flex-col lg:flex-row gap-5 flex-1 min-h-0 overflow-hidden">
          {/* Left Pane: Material Source Selection */}
          <div className="flex-1 lg:w-1/2 flex flex-col min-h-0 overflow-y-auto pr-1 sm:pr-2 space-y-4 scrollbar-thin">
            {/* Source Tabs */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Select Material Source
              </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-100 p-1.5 rounded-2xl">
              <button
                type="button"
                onClick={() => setActiveTab("pdf")}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === "pdf"
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <FileUp className="w-4 h-4" />
                <span>Upload PDF</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("subjects")}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === "subjects"
                    ? "bg-white text-indigo-700 shadow-sm ring-1 ring-indigo-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Library className="w-4 h-4 text-indigo-600" />
                <span>All Subjects (100+)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("samples")}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === "samples"
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Sample Guides</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("text")}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === "text"
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Paste Notes</span>
              </button>
            </div>
          </div>

          {/* Tab 1: PDF Upload */}
          {activeTab === "pdf" && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFile(e.target.files[0]);
                  }
                }}
              />

              {!selectedFile ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                    isDragging
                      ? "border-indigo-500 bg-indigo-50/50"
                      : "border-slate-200 hover:border-indigo-400 hover:bg-slate-50/70"
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">
                    Click to browse or drag & drop PDF
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Lecture notes, syllabus, textbook chapters, or exam study guides (Max 25MB)
                  </p>
                </div>
              ) : (
                <div className="border border-emerald-200 bg-emerald-50/50 rounded-2xl p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-900 truncate">
                        {selectedFile.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • PDF Ready
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setPdfBase64(null);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Universal Subjects (Every Subject Ever Taught) */}
          {activeTab === "subjects" && (
            <div className="space-y-4">
              {/* Type any custom subject box */}
              <div className="bg-gradient-to-r from-indigo-50/80 via-white to-violet-50/80 border border-indigo-200 rounded-2xl p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                      Test on Any Subject Ever Taught
                    </span>
                  </div>
                  <span className="text-[11px] text-indigo-600 font-semibold">
                    Instant Curriculum AI
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Type ANY subject (e.g. Paleontology, Quantum Computing, Roman Law)..."
                      value={customSubjectInput}
                      onChange={(e) => {
                        setCustomSubjectInput(e.target.value);
                        if (e.target.value.trim()) setSelectedSubject(null);
                      }}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white placeholder-slate-400"
                    />
                  </div>
                  <div>
                    <select
                      value={educationLevel}
                      onChange={(e) => setEducationLevel(e.target.value as EducationLevel)}
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                      {EDUCATION_LEVEL_OPTIONS.map((lvl) => (
                        <option key={lvl.id} value={lvl.id}>
                          {lvl.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Faculty selector tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {FACULTIES.slice(0, 8).map((fac) => {
                  const isSel = selectedFaculty === fac.id;
                  return (
                    <button
                      key={fac.id}
                      type="button"
                      onClick={() => setSelectedFaculty(fac.id)}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
                        isSel
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                      }`}
                    >
                      <span>{fac.icon}</span>
                      <span>{fac.shortLabel}</span>
                    </button>
                  );
                })}
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter curated subjects by keyword..."
                  value={subjectSearchQuery}
                  onChange={(e) => setSubjectSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Subject Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
                {filteredSubjects.slice(0, 12).map((sub) => {
                  const isChosen = selectedSubject?.id === sub.id && !customSubjectInput;
                  return (
                    <div
                      key={sub.id}
                      onClick={() => {
                        setSelectedSubject(sub);
                        setCustomSubjectInput("");
                        setDifficulty(sub.defaultDifficulty);
                        if (sub.suggestedLevels[0]) setEducationLevel(sub.suggestedLevels[0]);
                      }}
                      className={`p-3 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                        isChosen
                          ? "border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-500 shadow-2xs"
                          : "border-slate-200 hover:border-indigo-300 bg-white"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-lg">{sub.icon}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            {sub.facultyLabel}
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-slate-900 line-clamp-1">{sub.name}</h5>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{sub.tagline}</p>
                      </div>

                      {isChosen && sub.commonTopics.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-indigo-100">
                          {sub.commonTopics.slice(0, 2).map((topic) => (
                            <button
                              key={topic}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setFocusTopic(topic);
                              }}
                              className="text-[9px] px-1.5 py-0.5 bg-white text-indigo-700 border border-indigo-200 rounded font-medium hover:bg-indigo-100"
                              title="Click to set as focus topic"
                            >
                              {topic}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 3: Preloaded Sample Guides */}
          {activeTab === "samples" && (
            <div className="space-y-2.5">
              <p className="text-xs text-slate-500">
                Choose one of our curriculum-aligned study guides for instant testing:
              </p>
              <div className="grid gap-2.5">
                {SAMPLE_STUDY_MATERIALS.map((sample) => {
                  const isChosen = selectedSample?.id === sample.id;
                  return (
                    <div
                      key={sample.id}
                      onClick={() => {
                        setSelectedSample(sample);
                        setNumQuestions(sample.suggestedQuestions);
                        if (sample.language) {
                          setQuizLanguage(sample.language);
                        }
                      }}
                      className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                        isChosen
                          ? "border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-500 shadow-sm"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-bold text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded-md">
                          {sample.category}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            {sample.language === "hi" ? "हिन्दी" : sample.language === "sa" ? "संस्कृतम्" : "English"}
                          </span>
                          {isChosen && (
                            <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                          )}
                        </div>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {sample.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                        {sample.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 4: Paste Raw Notes */}
          {activeTab === "text" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Topic or Document Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Organic Chemistry Reactions"
                  value={rawTitle}
                  onChange={(e) => setRawTitle(e.target.value)}
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Study Content / Notes / Outline
                </label>
                <textarea
                  rows={6}
                  placeholder="Paste your lecture notes, summaries, or flashcard content here..."
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Pane: Test Options & Teacher Examination Suite (Scrolls Independently!) */}
        <div className="flex-1 lg:w-1/2 flex flex-col min-h-0 overflow-y-auto pr-1 sm:pr-2 border-t lg:border-t-0 lg:border-l border-slate-200 lg:pl-5 space-y-4 scrollbar-thin">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider">
              <Sliders className="w-3.5 h-3.5 text-indigo-600" />
              <span>Test Parameters & Options</span>
            </div>
            <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
              Scroll options independently ↕
            </span>
          </div>

          {/* TEACHER & ADMIN EXCLUSIVE EXAMINATION SUITE */}
          {isStaff && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50/50 to-amber-50 border border-amber-300 text-amber-950 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between border-b border-amber-200 pb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">👑</span>
                  <span className="text-xs font-black uppercase tracking-wider text-amber-950">
                    Teacher Examination Suite
                  </span>
                </div>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-amber-200/90 text-amber-900 border border-amber-300">
                  75 Seats Broadcast
                </span>
              </div>

              {/* Auto-Assign to Class Checkbox */}
              <label className="flex items-start gap-2.5 cursor-pointer bg-white/90 p-2.5 rounded-xl border border-amber-200 shadow-2xs">
                <input
                  type="checkbox"
                  checked={autoAssignClass}
                  onChange={(e) => setAutoAssignClass(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 mt-0.5 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    🎯 Assign & Broadcast Test to Enrolled Classroom (75 Seats)
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Sends this exam join code to all students in your active classroom group.
                  </span>
                </div>
              </label>

              {/* Exam Format / Rigor Category */}
              <div>
                <label className="block text-[11px] font-bold text-slate-800 mb-1">
                  Examination Rigor & Category
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'unit_exam', label: 'Periodic Exam', icon: '📝' },
                    { id: 'formative', label: 'Formative Check', icon: '🔍' },
                    { id: 'board_mock', label: 'Board Exam Mock', icon: '🏆' },
                    { id: 'pop_quiz', label: 'Speed Pop Quiz', icon: '⚡' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setExamCategory(cat.id as any)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                        examCategory === cat.id
                          ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                          : 'bg-white text-slate-700 border-amber-200 hover:bg-amber-100/50'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Exam Duration & Passing Grade */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">
                    Exam Duration
                  </label>
                  <select
                    value={examTimeLimitMinutes}
                    onChange={(e) => setExamTimeLimitMinutes(Number(e.target.value))}
                    className="w-full text-xs p-1.5 rounded-xl border border-amber-200 bg-white font-semibold cursor-pointer"
                  >
                    <option value={10}>10 Mins (Quick)</option>
                    <option value={15}>15 Mins (Standard)</option>
                    <option value={25}>25 Mins (Midterm)</option>
                    <option value={45}>45 Mins (Full Period)</option>
                    <option value={60}>60 Mins (Mock Exam)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">
                    Passing Threshold (%)
                  </label>
                  <select
                    value={passingPercentage}
                    onChange={(e) => setPassingPercentage(Number(e.target.value))}
                    className="w-full text-xs p-1.5 rounded-xl border border-amber-200 bg-white font-semibold cursor-pointer"
                  >
                    <option value={50}>50% Standard Pass</option>
                    <option value={65}>65% Academic Target</option>
                    <option value={75}>75% Merit Benchmark</option>
                    <option value={90}>90% Distinction / Honors</option>
                  </select>
                </div>
              </div>

              {/* Strict Proctoring & Rubric Generation */}
              <div className="space-y-1.5 pt-1 border-t border-amber-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={strictProctoring}
                    onChange={(e) => setStrictProctoring(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-amber-600 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-slate-800">
                    🛡️ Strict Anti-Cheat Proctoring (Tab Switch Alert)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeMarkingRubric}
                    onChange={(e) => setIncludeMarkingRubric(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-amber-600 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-slate-800">
                    📑 Generate Teacher Marking Scheme & Rubrics
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Test Parameters Configuration */}
          <div className="space-y-4">

            {/* Question Count & Types */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Number of Questions ({numQuestions})
                </label>
                <div className="flex items-center gap-2">
                  {[3, 5, 10, 15].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setNumQuestions(cnt)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        numQuestions === cnt
                          ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                          : "border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {cnt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Question Format
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setQuestionTypes("mixed")}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                      questionTypes === "mixed"
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Mixed
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuestionTypes("mcq")}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                      questionTypes === "mcq"
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    MCQ (4 opts)
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuestionTypes("true_false")}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                      questionTypes === "true_false"
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    True / False
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuestionTypes("typed")}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                      questionTypes === "typed"
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Type In ✍️
                  </button>
                </div>
              </div>
            </div>

            {/* Target Class / Grade Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Target Class / Grade Level</span>
                <span className="text-[10px] text-indigo-600 font-bold">Class 1 to 12</span>
              </label>
              <select
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value as EducationLevel)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-800"
              >
                {EDUCATION_LEVEL_OPTIONS.map((lvl) => (
                  <option key={lvl.id} value={lvl.id}>
                    {lvl.label} — {lvl.desc}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty & Focus Topic */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as QuizDifficulty)}
                  className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="easy">Easy (Definitions & Foundational Facts)</option>
                  <option value="medium">Medium (Standard Exam Rigor)</option>
                  <option value="hard">Hard (Analytical Scenarios)</option>
                  <option value="mixed">Mixed (Progressive Ladder)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Focus Concept / Topic (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Krebs Cycle, Paging, Inventions"
                  value={focusTopic}
                  onChange={(e) => setFocusTopic(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Test Language Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Test & Question Language (परीक्षा भाषा)</span>
                <span className="text-[10px] text-indigo-600 font-bold">Multilingual AI</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setQuizLanguage("en")}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                    quizLanguage === "en"
                      ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setQuizLanguage("hi")}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                    quizLanguage === "hi"
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  🇮🇳 हिन्दी (Hindi)
                </button>
                <button
                  type="button"
                  onClick={() => setQuizLanguage("sa")}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                    quizLanguage === "sa"
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  🕉️ संस्कृतम् (Sanskrit)
                </button>
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Loading Animation Step */}
          {isLoading && (
            <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-100 flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-indigo-600 animate-spin shrink-0" />
              <div>
                <div className="text-xs font-bold text-indigo-950">
                  Generating Custom Test
                </div>
                <div className="text-xs text-indigo-700">
                  {loadingStep || "Analyzing material..."}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Footer */}
        <div className="p-6 pt-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl transition-colors"
          >
            Cancel
          </button>

          <button
            id="modal-generate-quiz-btn"
            type="button"
            disabled={isLoading}
            onClick={handleGenerate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 transition-all shadow-md shadow-indigo-200"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating Quiz...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>
                  {activeTab === "subjects"
                    ? `Generate ${customSubjectInput.trim() || selectedSubject?.name || "Subject"} Test`
                    : "Generate Test"}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
