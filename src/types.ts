export type QuestionType = 'mcq' | 'true_false' | 'typed';
export type QuizDifficulty = 'easy' | 'medium' | 'hard' | 'mixed';
export type QuestionTypeFilter = 'all' | 'mcq' | 'true_false' | 'typed' | 'mixed';
export type AppLanguage = 'en' | 'hi' | 'sa'; // English, Hindi (हिन्दी), Sanskrit (संस्कृत)
export type BackgroundTheme = 'modern-grid' | 'aurora' | 'midnight' | 'warm-notebook';
export type DeviceType = 'phone' | 'laptop' | 'tablet';

export type UserRole = 'admin' | 'principal' | 'teacher' | 'student';

export interface StudentProfile {
  id: string;
  name: string;
  rollNumber: string;
  avatarEmoji: string;
  groupId: string;
  totalQuizzesTaken: number;
  totalScore: number;
  lastActive: number;
}

export interface ClassroomGroup {
  id: string;
  name: string;
  teacherName: string;
  gradeLevel: string;
  code: string; // Classroom join code, e.g. "BIO-7429"
  description: string;
  students: StudentProfile[];
  assignedQuizTitle?: string;
  assignedQuizTopic?: string;
  assignedQuizQuestions?: number;
  assignedQuizFullData?: any; // Full quiz data object for whole-class testing
  maxCapacity?: number; // Guaranteed minimum 70+ capacity (default 75-100)
  teacherId?: string;
  teacherEmail?: string;
}

export interface ClassroomUserAuth {
  role: UserRole;
  groupId: string;
  groupName: string;
  userName: string;
  userTitle?: string;
  avatarEmoji?: string;
  isLoggedIn: boolean;
  rollNumber?: string;
  // Student Learning Profile extensions
  phoneNumber?: string;
  countryCode?: string;
  gradeLevel?: string; // e.g. "Class 10", "Class 12", "JEE / NEET"
  curriculumBoard?: string; // e.g. "CBSE", "ICSE", "State Board"
  targetGoal?: string; // e.g. "Board Exam Mastery", "Top 1% Rank"
  parentEmail?: string;
  learningStreak?: number;
  totalXp?: number;
  studentId?: string;
  learnerId?: string;
  // Teacher & Admin specific
  adminAuthorized?: boolean;
  teacherSubject?: string;
  token?: string;
}

export type AcademicFaculty =
  | 'all'
  | 'natural_sciences'
  | 'formal_sciences_math'
  | 'computer_science_tech'
  | 'humanities_history'
  | 'social_sciences_law'
  | 'business_finance'
  | 'medicine_health'
  | 'arts_music'
  | 'languages_classics'
  | 'ancient_medieval_studies';

export type EducationLevel =
  | 'class_1'
  | 'class_2'
  | 'class_3'
  | 'class_4'
  | 'class_5'
  | 'class_6'
  | 'class_7'
  | 'class_8'
  | 'class_9'
  | 'class_10'
  | 'class_11'
  | 'class_12'
  | 'high_school'
  | 'ap_college_prep'
  | 'undergraduate'
  | 'graduate'
  | 'professional';

export interface SubjectItem {
  id: string;
  name: string;
  faculty: AcademicFaculty;
  facultyLabel: string;
  icon: string;
  tagline: string;
  description: string;
  commonTopics: string[];
  suggestedLevels: EducationLevel[];
  defaultDifficulty: QuizDifficulty;
  popularCurriculumRef?: string;
}

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  question: string;
  questionSummary?: string; // Summary of what the question is testing
  conceptTested?: string; // Explicit subject concept, theorem, or curriculum topic evaluated
  whyCorrect?: string; // Concise, targeted explanation of why the correct answer is right
  whyIncorrect?: string; // Common misconception or reason why alternative options are incorrect
  options: string[]; // 4 options for MCQ, 2 options ["True", "False"] for true_false, empty for typed
  correctAnswer: string;
  explanation: string;
  sourceReference?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  funFactOrJoke?: string; // Short witty joke, fun pun, or relatable study meme
  hint?: string; // Helpful encouragement and hint when student gets answer wrong
  acceptedAnswers?: string[]; // Flexible variations/synonyms for typed questions
}

export interface ConceptPair {
  id: string;
  term: string;
  definition: string;
  funHint?: string;
}

export interface BossData {
  name: string;
  title: string;
  avatarEmoji: string;
  maxHp: number;
  weakness: string;
  introQuote: string;
  hitReactionQuotes: string[];
  tauntQuotes: string[];
  defeatQuote: string;
}

export interface ChapterGameData {
  pairs: ConceptPair[];
  boss: BossData;
  battleQuestions?: QuizQuestion[];
}

export interface StudyJoke {
  setup: string;
  punchline: string;
  topicRef: string;
}

export interface GeneratedQuiz {
  id: string;
  title: string;
  summary: string;
  language?: AppLanguage;
  topicsCovered: string[];
  documentName?: string;
  subjectName?: string;
  faculty?: AcademicFaculty;
  educationLevel?: EducationLevel;
  createdAt: number;
  questions: QuizQuestion[];
}

export interface InteractiveNoteConcept {
  term: string;
  definition: string;
  analogy: string;
  mnemonic: string;
  importance: string;
}

export interface CornellSection {
  cue: string;
  notes: string[];
  highlight: string;
}

export interface ConceptGraphNode {
  id: string;
  label: string;
  category: string;
  summary: string;
  connectedTo: string[];
}

export interface CheatSheetRule {
  label: string;
  detail: string;
}

export interface NoteQuickCheck {
  question: string;
  answer: string;
  hint: string;
}

export interface GeneratedStudyNotes {
  id: string;
  topic: string;
  subtopic?: string;
  title: string;
  readingTimeMinutes: number;
  executiveSummary: string;
  style: string;
  language: AppLanguage;
  createdAt: number;
  coreConcepts: InteractiveNoteConcept[];
  cornellSections: CornellSection[];
  conceptGraph: ConceptGraphNode[];
  cheatSheetRules: CheatSheetRule[];
  quickChecks: NoteQuickCheck[];
}

export interface AskQuestionResponse {
  questionSummary: string;
  answer: string;
  keyTakeaways: string[];
  relatedConcepts: string[];
  language: AppLanguage;
}

export interface UserAnswerRecord {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  answeredAt: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  quizTitle: string;
  startedAt: number;
  completedAt: number;
  totalQuestions: number;
  score: number;
  percentage: number;
  answers: Record<string, string>; // questionId -> selectedAnswer
}

export interface GenerateQuizRequest {
  pdfBase64?: string;
  textContext?: string;
  documentName?: string;
  subjectName?: string;
  faculty?: AcademicFaculty;
  educationLevel?: EducationLevel;
  numQuestions: number;
  questionTypes: 'mcq' | 'true_false' | 'mixed';
  difficulty: QuizDifficulty;
  focusTopic?: string;
  language?: AppLanguage;
}

export interface LearningStreak {
  count: number;
  lastCompletedDate: string | null; // Format: YYYY-MM-DD
  bestStreak: number;
  completedToday: boolean;
  history: string[]; // List of YYYY-MM-DD dates where a quiz was completed
}

export interface SpotifyTrack {
  id: string;
  title: string;
  artist: string;
  album?: string;
  coverUrl?: string;
  spotifyUri?: string;
  spotifyUrl: string;
  spotifyEmbedUrl: string;
  previewAudioUrl?: string;
  durationSeconds?: number;
}

export interface ExamResultData {
  isExamMode: boolean;
  timeSpentSeconds: number;
  totalTimeAllocatedSeconds: number;
  tabSwitches: number;
  candidateName: string;
  rollNumber?: string;
  groupName?: string;
  submittedAt: string;
}

export type MusicLoopMode = 'single' | 'all' | 'off';

export interface PdfSourceDocument {
  id: string;
  title: string;
  fileName: string;
  sizeBytes: number;
  uploadedAt: number;
  uploadedBy: string;
  gradeLevel: string;
  subject: string;
  pageCount: number;
  topicTags: string[];
  summary?: string;
  sampleTextSnippet?: string;
}

export interface GlobalQuizSettings {
  defaultDifficulty: QuizDifficulty;
  timeLimitMinutes: number; // 0 for unlimited, 10, 15, 20, 30, 45, 60
  questionsPerQuiz: number;
  allowedQuestionTypes: 'mcq' | 'true_false' | 'typed' | 'mixed';
  passingPercentage: number;
  proctoringStrict: boolean;
  instantFeedback: boolean;
  showFunFacts: boolean;
  soundEffects: boolean;
}

export interface CommonMistakeItem {
  id: string;
  subject: string;
  topic: string;
  questionSample: string;
  commonIncorrectAnswer: string;
  correctAnswer: string;
  errorRatePercentage: number;
  studentsAffected: number;
  remediationAdvice: string;
}

export interface TopicMasteryItem {
  id: string;
  topic: string;
  subject: string;
  gradeLevel: string;
  masteryTier: 'advanced' | 'proficient' | 'developing' | 'needs_support';
  averageScorePercentage: number;
  studentsAssessed: number;
  quizzesTaken: number;
}

export interface FacultyTeacherMember {
  id: string;
  name: string;
  subject: string;
  gradeLevel: string;
  role: 'Principal / Head of School' | 'Head of Department' | 'Lead Teacher' | 'Senior Faculty';
  contact: string;
  assignedClasses: string[];
}

export interface FacultyTeacherGroup {
  id: string;
  name: string;
  department: string;
  createdByName: string; // e.g. "Pranav (Principal)"
  createdAt: number;
  description: string;
  teachers: FacultyTeacherMember[];
  meetingDay?: string;
  curriculumBoard: string;
}

export interface LessonFlowStage {
  phase: string; // e.g. "Warm-up & Hook", "Concept Exploration", "Lab / Hands-on Activity", "MCQ Assessment", "Homework"
  description: string;
  durationMins: number;
}

export interface LessonPlan {
  id: string;
  groupId: string; // Associated faculty group
  title: string;
  unit: string;
  grade: string;
  subject: string;
  authorTeacher: string;
  learningObjectives: string[];
  curriculumStandard: string;
  durationWeeks: string;
  flowStages: LessonFlowStage[];
  attachedMaterials: string[];
  assessmentStrategy: string;
  homeworkNotes: string;
  status: 'draft' | 'in_review' | 'approved' | 'active';
  updatedAt: number;
}

export interface TeacherSpreadsheet {
  id: string;
  groupId: string;
  title: string;
  description: string;
  columns: string[]; // ["A", "B", "C", ...]
  headers: string[]; // ["Roll No", "Student Name", "Quiz 1", ...]
  rows: string[][]; // 2D grid of cell values or formulas (=SUM, =AVG, etc.)
  templateType: 'gradebook' | 'syllabus_tracker' | 'attendance' | 'custom';
  lastEditedBy: string;
  updatedAt: number;
}

// ==========================================
// Imagine Ur Creativity Types
// ==========================================
export type SimulationDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type VisualSceneType =
  | 'weather_water_cycle'
  | 'photosynthesis'
  | 'electric_circuit'
  | 'math_scale'
  | 'heart_circulation'
  | 'states_of_matter'
  | 'aerodynamics_flight'
  | 'gravity_orbits'
  | 'rocket_propulsion'
  | 'volcano_eruption'
  | 'sound_waves'
  | 'digestive_system'
  | 'dna_replication'
  | 'solar_eclipse'
  | 'atom_quantum'
  | 'light_optics'
  | 'cell_biology'
  | 'custom_dynamic'
  | 'generic_diagram';

export interface DynamicSceneEntity {
  id: string;
  label: string;
  type: 'circle' | 'rect' | 'path' | 'beam' | 'particle_cloud' | 'stream' | 'force_arrow' | 'label_box';
  x: number;
  y: number;
  width?: number;
  height?: number;
  color: string;
  secondaryColor?: string;
  motion?: 'orbit' | 'flow' | 'oscillate' | 'pulse' | 'stream' | 'rise' | 'spin' | 'static';
  motionSpeed?: number;
  interactiveTooltip?: string;
  highlightInStages?: number[];
}

export interface DynamicVisualData {
  sceneType?: string;
  theme?: 'space' | 'aerial' | 'microscopic' | 'laboratory' | 'nature' | 'cyber';
  canvasTitle?: string;
  backdrop?: string;
  entities?: DynamicSceneEntity[];
  forceLabels?: { name: string; value: string; color: string }[];
  interactivePrompt?: string;
}

export interface AnimationStage {
  id: string;
  stageNumber: number;
  title: string;
  subtitle: string;
  narration: string;
  visualScene: VisualSceneType;
  actionPrompt: string;
  highlightLabels: string[];
  keyPrinciple?: string;
  dynamicVisualData?: DynamicVisualData;
}

export interface InteractiveKnob {
  id: string;
  label: string;
  type: 'slider' | 'toggle' | 'trigger';
  min?: number;
  max?: number;
  step?: number;
  defaultValue: number | boolean;
  unit?: string;
  impactDescription: string;
}

export interface ComprehensionQuizItem {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  conceptTested?: string;
  whyCorrect?: string;
}

export interface ImagineCreativitySimulation {
  id: string;
  question: string;
  conceptTitle: string;
  emoji: string;
  category: string;
  summary: string;
  realWorldAnalogy: string;
  difficulty?: SimulationDifficulty;
  stages: AnimationStage[];
  interactiveKnobs: InteractiveKnob[];
  comprehensionQuiz: ComprehensionQuizItem[];
  funFact: string;
  dynamicVisualData?: DynamicVisualData;
  difficultyVariants?: {
    beginner?: Partial<ImagineCreativitySimulation>;
    intermediate?: Partial<ImagineCreativitySimulation>;
    advanced?: Partial<ImagineCreativitySimulation>;
  };
}
