import {
  PdfSourceDocument,
  GlobalQuizSettings,
  CommonMistakeItem,
  TopicMasteryItem,
  ClassroomGroup,
  FacultyTeacherGroup,
  FacultyTeacherMember,
  LessonPlan,
  TeacherSpreadsheet
} from '../types';
import { getClassroomGroups } from './classroomStorage';
import { getQuizAttempts } from './storage';

const PDF_SOURCES_KEY = 'testgen_pdf_sources_catalog';
const GLOBAL_SETTINGS_KEY = 'testgen_global_quiz_settings';

export function getStaffApiHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  try {
    const raw = localStorage.getItem('testgen_classroom_auth');
    if (raw) {
      const auth = JSON.parse(raw);
      if (auth.role) headers['x-user-role'] = auth.role;
      if (auth.userName) headers['x-user-name'] = auth.userName;
      if (auth.groupId) headers['x-group-id'] = auth.groupId;
      if (auth.role === 'admin') headers['x-admin-passcode'] = '0192837465';
    }
  } catch (e) {
    console.error('Failed reading staff auth headers', e);
  }
  return headers;
}

export function handleStaffRbacResponse(res: Response, fallbackDesc?: string): void {
  if (res.status === 403 || res.status === 401) {
    res.json().then((body) => {
      const detail = body?.error || (res.status === 403 ? 'RBAC Access Denied: Staff or Administrator privileges required.' : 'Unauthorized: Valid staff authentication required.');
      window.dispatchEvent(new CustomEvent('staff-rbac-alert', {
        detail: {
          status: res.status,
          code: body?.code,
          message: detail,
          action: fallbackDesc
        }
      }));
    }).catch(() => {
      window.dispatchEvent(new CustomEvent('staff-rbac-alert', {
        detail: {
          status: res.status,
          message: res.status === 403 ? 'RBAC Access Denied: Insufficient staff permissions.' : 'Unauthorized: Staff credentials required.',
          action: fallbackDesc
        }
      }));
    });
  }
}

export const DEFAULT_GLOBAL_SETTINGS: GlobalQuizSettings = {
  defaultDifficulty: 'medium',
  timeLimitMinutes: 15,
  questionsPerQuiz: 15,
  allowedQuestionTypes: 'mixed',
  passingPercentage: 65,
  proctoringStrict: false,
  instantFeedback: true,
  showFunFacts: true,
  soundEffects: true
};

const INITIAL_PDF_SOURCES: PdfSourceDocument[] = [
  {
    id: 'pdf_weather_meteorology',
    title: 'Chapter: Weather, Atmosphere & Climate Systems',
    fileName: 'chapter_weather_atmospheric_science.pdf',
    sizeBytes: 3820000,
    uploadedAt: Date.now() - 86400000 * 2,
    uploadedBy: 'Prof. Ramesh Kulkarni',
    gradeLevel: 'Class 6 to 10',
    subject: 'Earth Science & Weather',
    pageCount: 38,
    topicTags: ['Weather', 'Atmospheric Pressure', 'Cloud Formation', 'Four Seasons', 'Jet Streams'],
    summary: 'Comprehensive curriculum chapter covering atmospheric layers, cloud classification, barometric pressure, fronts, storm formation, and weather forecasting.',
    sampleTextSnippet: 'Weather describes the day-to-day fluctuating state of the troposphere. Uneven solar heating creates pressure differentials that drive global wind systems.'
  },
  {
    id: 'pdf_class10_science',
    title: 'NCERT Class 10: Science & Life Processes',
    fileName: 'class_10_science_biology_chem.pdf',
    sizeBytes: 3450000,
    uploadedAt: Date.now() - 86400000 * 3,
    uploadedBy: 'Dr. Sunita Verma',
    gradeLevel: 'Class 9 to 10',
    subject: 'Biology & Natural Sciences',
    pageCount: 42,
    topicTags: ['Life Processes', 'Chemical Reactions', 'Light Optics', 'Heredity'],
    summary: 'Comprehensive NCERT Class 10 Science syllabus covering nutrition, respiration, circulation, excretion, reflection of light, and chemical equations.',
    sampleTextSnippet: 'Autotrophic nutrition involves photosynthesis where green plants synthesize glucose using sunlight, chlorophyll, CO2, and water.'
  },
  {
    id: 'pdf_class12_math',
    title: 'CBSE Class 12: Calculus, Integrals & Vectors',
    fileName: 'class_12_mathematics_calculus.pdf',
    sizeBytes: 4890000,
    uploadedAt: Date.now() - 86400000 * 5,
    uploadedBy: 'Prof. Ramesh Kulkarni',
    gradeLevel: 'Class 11 to 12',
    subject: 'Mathematics & Computer Science',
    pageCount: 56,
    topicTags: ['Definite Integrals', 'Differential Equations', 'Vectors', '3D Geometry'],
    summary: 'Senior secondary advanced mathematics module on differential calculus, integration by parts, vector triple products, and probability distributions.',
    sampleTextSnippet: 'Integration is the inverse process of differentiation. Fundamental theorem of calculus connects differentiation and Riemann sums.'
  },
  {
    id: 'pdf_class8_physics',
    title: 'Class 8 Science: Force, Friction & Sound Waves',
    fileName: 'class_8_force_pressure_sound.pdf',
    sizeBytes: 2180000,
    uploadedAt: Date.now() - 86400000 * 2,
    uploadedBy: 'Dr. Vikram Malhotra',
    gradeLevel: 'Class 6 to 8',
    subject: 'Physics & Engineering Foundations',
    pageCount: 28,
    topicTags: ['Force and Pressure', 'Friction', 'Sound', 'Chemical Effects of Electric Current'],
    summary: 'Middle school physics covering contact vs non-contact forces, atmospheric pressure, static vs rolling friction, and frequency and amplitude of sound waves.',
    sampleTextSnippet: 'Force is a push or pull upon an object resulting from its interaction with another object. Pressure equals force divided by unit area.'
  },
  {
    id: 'pdf_organic_chem',
    title: 'Organic Chemistry: Hydrocarbons & Functional Groups',
    fileName: 'organic_chemistry_reaction_mechanisms.pdf',
    sizeBytes: 5120000,
    uploadedAt: Date.now() - 86400000 * 7,
    uploadedBy: 'Pranav (Admin)',
    gradeLevel: 'Class 11 to 12',
    subject: 'Chemistry & Molecular Science',
    pageCount: 64,
    topicTags: ['Electrophilic Addition', 'Markovnikov Rule', 'Alcohols & Phenols', 'Isomerism'],
    summary: 'Curriculum guide on aliphatic hydrocarbons, resonance stabilization, inductive effects, nucleophilic substitution (SN1/SN2), and functional group identification.',
    sampleTextSnippet: 'In the addition of HX to an unsymmetrical alkene, the acid hydrogen gets attached to the carbon with fewer alkyl substituents (Markovnikov).'
  }
];

export function getPdfSources(): PdfSourceDocument[] {
  try {
    const raw = localStorage.getItem(PDF_SOURCES_KEY);
    if (!raw) {
      localStorage.setItem(PDF_SOURCES_KEY, JSON.stringify(INITIAL_PDF_SOURCES));
      return INITIAL_PDF_SOURCES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_PDF_SOURCES;
  } catch {
    return INITIAL_PDF_SOURCES;
  }
}

export function savePdfSources(sources: PdfSourceDocument[]): void {
  try {
    localStorage.setItem(PDF_SOURCES_KEY, JSON.stringify(sources));
    window.dispatchEvent(new CustomEvent('pdf-sources-updated', { detail: sources }));
  } catch (e) {
    console.error('Failed to save PDF sources', e);
  }
}

export function addPdfSource(source: Omit<PdfSourceDocument, 'id' | 'uploadedAt'>): PdfSourceDocument {
  const sources = getPdfSources();
  const newDoc: PdfSourceDocument = {
    ...source,
    id: `pdf_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`,
    uploadedAt: Date.now()
  };
  sources.unshift(newDoc);
  savePdfSources(sources);

  // Sync with RBAC protected backend endpoint
  fetch('/api/staff/pdf-sources', {
    method: 'POST',
    headers: getStaffApiHeaders(),
    body: JSON.stringify(newDoc)
  }).then((res) => {
    if (!res.ok) handleStaffRbacResponse(res, 'Upload PDF Document');
  }).catch((err) => console.warn('Offline or staff API error adding PDF source', err));

  return newDoc;
}

export function deletePdfSource(id: string): boolean {
  const sources = getPdfSources();
  const filtered = sources.filter((s) => s.id !== id);
  if (filtered.length !== sources.length) {
    savePdfSources(filtered);

    // Sync with RBAC protected backend endpoint (Admin only)
    fetch(`/api/staff/pdf-sources/${id}`, {
      method: 'DELETE',
      headers: getStaffApiHeaders()
    }).then((res) => {
      if (!res.ok) handleStaffRbacResponse(res, 'Delete PDF Document');
    }).catch((err) => console.warn('Offline or staff API error deleting PDF source', err));

    return true;
  }
  return false;
}

export function getGlobalQuizSettings(): GlobalQuizSettings {
  try {
    const raw = localStorage.getItem(GLOBAL_SETTINGS_KEY);
    if (!raw) {
      localStorage.setItem(GLOBAL_SETTINGS_KEY, JSON.stringify(DEFAULT_GLOBAL_SETTINGS));
      return DEFAULT_GLOBAL_SETTINGS;
    }
    return { ...DEFAULT_GLOBAL_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_GLOBAL_SETTINGS;
  }
}

export function saveGlobalQuizSettings(settings: GlobalQuizSettings): void {
  try {
    localStorage.setItem(GLOBAL_SETTINGS_KEY, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('global-quiz-settings-changed', { detail: settings }));

    // Sync with RBAC protected backend endpoint (Admin only)
    fetch('/api/staff/quiz-settings', {
      method: 'PUT',
      headers: getStaffApiHeaders(),
      body: JSON.stringify(settings)
    }).then((res) => {
      if (!res.ok) handleStaffRbacResponse(res, 'Update Global Exam Settings');
    }).catch((err) => console.warn('Offline or staff API error updating quiz settings', err));
  } catch (e) {
    console.error('Failed to save global quiz settings', e);
  }
}

// Common Mistakes Knowledge Base for Aggregated Analytics
const SAMPLE_COMMON_MISTAKES: CommonMistakeItem[] = [
  {
    id: 'mst_1',
    subject: 'Biology',
    topic: 'Photosynthesis & Cellular Respiration',
    questionSample: 'Where do the light-independent (Calvin cycle) reactions occur in chloroplasts?',
    commonIncorrectAnswer: 'Thylakoid Membrane (Light-dependent site)',
    correctAnswer: 'Stroma (Fluid matrix)',
    errorRatePercentage: 58,
    studentsAffected: 44,
    remediationAdvice: 'Clarify that while photons are absorbed in thylakoids, sugar fixation enzymes operate in the fluid stroma.'
  },
  {
    id: 'mst_2',
    subject: 'Mathematics',
    topic: 'Quadratic Equations & Discriminants',
    questionSample: 'What nature of roots exists when the discriminant D = b² - 4ac is negative?',
    commonIncorrectAnswer: 'Two equal real roots',
    correctAnswer: 'No real roots (Two distinct imaginary/complex roots)',
    errorRatePercentage: 52,
    studentsAffected: 39,
    remediationAdvice: 'Emphasize the sign test: D > 0 (real distinct), D = 0 (real equal), D < 0 (no real solutions).'
  },
  {
    id: 'mst_3',
    subject: 'Physics',
    topic: 'Newtonian Dynamics & Action-Reaction Pairs',
    questionSample: 'Why do action and reaction forces not cancel each other out to zero net force?',
    commonIncorrectAnswer: 'Because action occurs slightly before reaction',
    correctAnswer: 'They act simultaneously on two different interacting bodies',
    errorRatePercentage: 64,
    studentsAffected: 48,
    remediationAdvice: 'Draw Free Body Diagrams showing forces on Body A vs Body B to visually demonstrate non-cancellation.'
  },
  {
    id: 'mst_4',
    subject: 'Chemistry',
    topic: 'Acid-Base Equilibria & pH Scale',
    questionSample: 'What is the pH of a 10⁻⁸ M aqueous solution of HCl at 25°C?',
    commonIncorrectAnswer: 'pH = 8 (Basic)',
    correctAnswer: 'pH ≈ 6.96 (Slightly acidic, accounting for autoionization of water)',
    errorRatePercentage: 71,
    studentsAffected: 53,
    remediationAdvice: 'Remind learners that adding an acid to water cannot yield a basic pH (>7); water autoionization [H⁺] = 10⁻⁷ M must be summed.'
  },
  {
    id: 'mst_5',
    subject: 'Computer Science',
    topic: 'Data Structures & Big-O Notation',
    questionSample: 'What is the average time complexity of searching in an unsorted Array vs Hash Table?',
    commonIncorrectAnswer: 'O(log N) for Array',
    correctAnswer: 'O(N) for Array, O(1) for Hash Table average',
    errorRatePercentage: 46,
    studentsAffected: 35,
    remediationAdvice: 'Differentiate linear scans in unsorted arrays from binary search in presorted arrays.'
  }
];

// Topic Mastery Overview for Aggregated Analytics
const SAMPLE_TOPIC_MASTERY: TopicMasteryItem[] = [
  {
    id: 'mst_top_1',
    topic: 'Integers, Ratios & Fractions',
    subject: 'Mathematics',
    gradeLevel: 'Class 6 to 8',
    masteryTier: 'advanced',
    averageScorePercentage: 88,
    studentsAssessed: 62,
    quizzesTaken: 84
  },
  {
    id: 'mst_top_2',
    topic: 'Cell Structure & Microorganisms',
    subject: 'Biology',
    gradeLevel: 'Class 6 to 8',
    masteryTier: 'proficient',
    averageScorePercentage: 79,
    studentsAssessed: 58,
    quizzesTaken: 72
  },
  {
    id: 'mst_top_3',
    topic: 'Light Reflection & Refraction Optics',
    subject: 'Physics',
    gradeLevel: 'Class 9 to 10',
    masteryTier: 'developing',
    averageScorePercentage: 64,
    studentsAssessed: 69,
    quizzesTaken: 95
  },
  {
    id: 'mst_top_4',
    topic: 'Trigonometric Identities & Heights',
    subject: 'Mathematics',
    gradeLevel: 'Class 9 to 10',
    masteryTier: 'proficient',
    averageScorePercentage: 76,
    studentsAssessed: 71,
    quizzesTaken: 110
  },
  {
    id: 'mst_top_5',
    topic: 'Differential Calculus & Derivatives',
    subject: 'Mathematics',
    gradeLevel: 'Class 11 to 12',
    masteryTier: 'developing',
    averageScorePercentage: 61,
    studentsAssessed: 65,
    quizzesTaken: 89
  },
  {
    id: 'mst_top_6',
    topic: 'Organic Reaction Mechanisms (SN1/SN2)',
    subject: 'Chemistry',
    gradeLevel: 'Class 11 to 12',
    masteryTier: 'needs_support',
    averageScorePercentage: 47,
    studentsAssessed: 68,
    quizzesTaken: 94
  }
];

export function getCommonMistakesData(): CommonMistakeItem[] {
  return SAMPLE_COMMON_MISTAKES;
}

export function getTopicMasteryData(): TopicMasteryItem[] {
  return SAMPLE_TOPIC_MASTERY;
}

export function getAggregatedClassStats() {
  const groups = getClassroomGroups();
  const attempts = getQuizAttempts();

  let totalEnrolled = 0;
  let totalQuizzesAttempted = 0;
  let totalScoreSum = 0;

  groups.forEach((g) => {
    totalEnrolled += g.students.length;
    g.students.forEach((s) => {
      totalQuizzesAttempted += s.totalQuizzesTaken;
      totalScoreSum += s.totalScore;
    });
  });

  const averageAccuracy = totalQuizzesAttempted > 0
    ? Math.round((totalScoreSum / (totalQuizzesAttempted * 15)) * 100)
    : 76;

  return {
    totalClassrooms: groups.length,
    totalEnrolledStudents: totalEnrolled,
    maxGuaranteedSeats: groups.length * 75,
    totalQuizzesTaken: Math.max(totalQuizzesAttempted, attempts.length, 64),
    averageAccuracyPercentage: Math.min(Math.max(averageAccuracy, 65), 94),
    topPerformingClass: groups[0]?.name || 'Class 9 to 10 Board Group',
    activeAssignmentsCount: groups.filter((g) => !!g.assignedQuizTitle).length
  };
}

// ==========================================
// FACULTY TEACHER GROUPS (ADMIN / PRINCIPAL ROOM)
// ==========================================
const FACULTY_GROUPS_KEY = 'testgen_faculty_teacher_groups';
const LESSON_PLANS_KEY = 'testgen_faculty_lesson_plans';
const SPREADSHEETS_KEY = 'testgen_teacher_spreadsheets';

const INITIAL_FACULTY_GROUPS: FacultyTeacherGroup[] = [
  {
    id: 'fac_stem_core',
    name: 'Department of STEM & Natural Sciences',
    department: 'Science & Mathematics',
    createdByName: 'Pranav (Principal)',
    createdAt: Date.now() - 86400000 * 14,
    description: 'Core faculty council responsible for secondary and senior mathematics, physics, and biology curriculum alignment and weekly test preparation.',
    meetingDay: 'Every Tuesday & Thursday • 3:30 PM',
    curriculumBoard: 'CBSE & NCERT Standard',
    teachers: [
      {
        id: 'tch_sunita',
        name: 'Dr. Sunita Verma',
        subject: 'Biology & Natural Sciences',
        gradeLevel: 'Class 9 to 10',
        role: 'Head of Department',
        contact: 'sverma@school.edu',
        assignedClasses: ['CLS-910', 'BIO-10A']
      },
      {
        id: 'tch_ramesh',
        name: 'Prof. Ramesh Kulkarni',
        subject: 'Mathematics & Computer Science',
        gradeLevel: 'Class 6 to 8',
        role: 'Lead Teacher',
        contact: 'rkulkarni@school.edu',
        assignedClasses: ['CLS-608', 'MATH-8B']
      },
      {
        id: 'tch_vikram',
        name: 'Dr. Vikram Malhotra',
        subject: 'Physics & Advanced Engineering',
        gradeLevel: 'Class 11 to 12',
        role: 'Senior Faculty',
        contact: 'vmalhotra@school.edu',
        assignedClasses: ['CLS-112', 'PHY-12A']
      }
    ]
  },
  {
    id: 'fac_senior_boards',
    name: 'Senior Secondary Board Council',
    department: 'Academic Operations & Board Prep',
    createdByName: 'Pranav (Principal)',
    createdAt: Date.now() - 86400000 * 20,
    description: 'Executive committee coordinating Class 10 & Class 12 mock examinations, question bank generation, and student performance tracking.',
    meetingDay: 'Friday • 4:00 PM',
    curriculumBoard: 'CBSE / ICSE Board Framework',
    teachers: [
      {
        id: 'tch_sunita',
        name: 'Dr. Sunita Verma',
        subject: 'Life Sciences',
        gradeLevel: 'Class 10',
        role: 'Lead Teacher',
        contact: 'sverma@school.edu',
        assignedClasses: ['CLS-910']
      },
      {
        id: 'tch_vikram',
        name: 'Dr. Vikram Malhotra',
        subject: 'Electromagnetism & Mechanics',
        gradeLevel: 'Class 12',
        role: 'Senior Faculty',
        contact: 'vmalhotra@school.edu',
        assignedClasses: ['CLS-112']
      }
    ]
  }
];

export function getFacultyTeacherGroups(): FacultyTeacherGroup[] {
  try {
    const raw = localStorage.getItem(FACULTY_GROUPS_KEY);
    if (!raw) {
      localStorage.setItem(FACULTY_GROUPS_KEY, JSON.stringify(INITIAL_FACULTY_GROUPS));
      return INITIAL_FACULTY_GROUPS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_FACULTY_GROUPS;
  } catch {
    return INITIAL_FACULTY_GROUPS;
  }
}

export function saveFacultyTeacherGroups(groups: FacultyTeacherGroup[]): void {
  try {
    localStorage.setItem(FACULTY_GROUPS_KEY, JSON.stringify(groups));
    window.dispatchEvent(new CustomEvent('faculty-groups-updated', { detail: groups }));
  } catch (e) {
    console.error('Failed to save faculty groups', e);
  }
}

export function createFacultyTeacherGroup(
  data: Omit<FacultyTeacherGroup, 'id' | 'createdAt'>
): FacultyTeacherGroup {
  const list = getFacultyTeacherGroups();
  const newGroup: FacultyTeacherGroup = {
    ...data,
    id: `fac_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`,
    createdAt: Date.now()
  };
  list.unshift(newGroup);
  saveFacultyTeacherGroups(list);

  // Sync with backend RBAC endpoint
  fetch('/api/staff/faculty-groups', {
    method: 'POST',
    headers: getStaffApiHeaders(),
    body: JSON.stringify(newGroup)
  }).then((res) => {
    if (!res.ok) handleStaffRbacResponse(res, 'Create Faculty Group');
  }).catch((err) => console.warn('Offline or staff API error creating faculty group', err));

  return newGroup;
}

export function deleteFacultyTeacherGroup(groupId: string): boolean {
  const list = getFacultyTeacherGroups();
  const filtered = list.filter((g) => g.id !== groupId);
  if (filtered.length !== list.length) {
    saveFacultyTeacherGroups(filtered);

    // Sync with backend RBAC endpoint (Admin only)
    fetch(`/api/staff/faculty-groups/${groupId}`, {
      method: 'DELETE',
      headers: getStaffApiHeaders()
    }).then((res) => {
      if (!res.ok) handleStaffRbacResponse(res, 'Delete Faculty Group');
    }).catch((err) => console.warn('Offline or staff API error deleting faculty group', err));

    return true;
  }
  return false;
}

export function addTeacherToFacultyGroup(groupId: string, teacher: FacultyTeacherMember): boolean {
  const list = getFacultyTeacherGroups();
  const group = list.find((g) => g.id === groupId);
  if (!group) return false;
  if (!group.teachers.some((t) => t.id === teacher.id)) {
    group.teachers.push(teacher);
    saveFacultyTeacherGroups(list);

    // Sync with backend RBAC endpoint
    fetch(`/api/staff/faculty-groups/${groupId}/members`, {
      method: 'POST',
      headers: getStaffApiHeaders(),
      body: JSON.stringify(teacher)
    }).then((res) => {
      if (!res.ok) handleStaffRbacResponse(res, 'Add Faculty Member');
    }).catch((err) => console.warn('Offline or staff API error adding teacher', err));

    return true;
  }
  return false;
}

export function removeTeacherFromFacultyGroup(groupId: string, teacherId: string): boolean {
  const list = getFacultyTeacherGroups();
  const group = list.find((g) => g.id === groupId);
  if (!group) return false;
  const initialLen = group.teachers.length;
  group.teachers = group.teachers.filter((t) => t.id !== teacherId);
  if (group.teachers.length !== initialLen) {
    saveFacultyTeacherGroups(list);

    // Sync with backend RBAC endpoint (Admin only)
    fetch(`/api/staff/faculty-groups/${groupId}/members/${teacherId}`, {
      method: 'DELETE',
      headers: getStaffApiHeaders()
    }).then((res) => {
      if (!res.ok) handleStaffRbacResponse(res, 'Remove Faculty Member');
    }).catch((err) => console.warn('Offline or staff API error removing teacher', err));

    return true;
  }
  return false;
}

// ==========================================
// INTERACTIVE LESSON PLANNER
// ==========================================
const INITIAL_LESSON_PLANS: LessonPlan[] = [
  {
    id: 'lp_bio_photosynthesis',
    groupId: 'fac_stem_core',
    title: 'Photosynthesis & Cellular Bioenergetics',
    unit: 'Unit 4: Plant Physiology & Life Processes',
    grade: 'Class 10 (Board Exam)',
    subject: 'Biology & Natural Sciences',
    authorTeacher: 'Dr. Sunita Verma',
    learningObjectives: [
      'Differentiate light-dependent reactions in thylakoids from Calvin cycle in the stroma.',
      'Explain the balanced chemical equation of photosynthesis and raw materials involved.',
      'Analyze the stomatal guard cell transpiration and CO2 uptake mechanism.',
      'Connect glucose synthesis to human respiration and mitochondrial ATP generation.'
    ],
    curriculumStandard: 'CBSE Class 10 NCERT Chapter 6 • Life Processes',
    durationWeeks: '2 Weeks (6 Instructional Periods)',
    flowStages: [
      {
        phase: 'Stage 1: Warm-up & Hook',
        description: 'Leaf pigment chromatography demonstration. Ask students: "Where do trees get their physical mass from — soil or air?"',
        durationMins: 15
      },
      {
        phase: 'Stage 2: Core Concept Breakdown',
        description: 'Deep dive into chloroplast thylakoid membranes, chlorophyll excitation, photolysis of H2O, and ATP/NADPH yield.',
        durationMins: 35
      },
      {
        phase: 'Stage 3: Interactive Class Activity',
        description: 'Microscopic inspection of stomatal pores on Rhoeo leaf peel. Students sketch guard cells in turgid vs flaccid states.',
        durationMins: 40
      },
      {
        phase: 'Stage 4: Formative Quiz Assessment',
        description: 'Launch 10-question MCQ quiz on TestGen to all 70+ enrolled students in class to evaluate misconceptions.',
        durationMins: 20
      },
      {
        phase: 'Stage 5: Homework & Synthesis',
        description: 'Write a 200-word paragraph detailing how light intensity affects rate of photosynthesis with sketch of graph.',
        durationMins: 10
      }
    ],
    attachedMaterials: [
      'NCERT Class 10 Life Processes Chapter PDF',
      'Chloroplast Ultrastructure Diagram Handout'
    ],
    assessmentStrategy: '10-MCQ Formative Class Quiz on TestGen + Lab Notebook Diagram Checklist.',
    homeworkNotes: 'Complete worksheet page 42-45; revise Calvin cycle enzyme RuBisCO.',
    status: 'approved',
    updatedAt: Date.now() - 86400000 * 2
  },
  {
    id: 'lp_math_quadratic',
    groupId: 'fac_stem_core',
    title: 'Quadratic Equations, Discriminants & Parabolic Graphs',
    unit: 'Unit 2: Algebra & Polynomial Equations',
    grade: 'Class 10 (Board Exam)',
    subject: 'Mathematics & Computer Science',
    authorTeacher: 'Prof. Ramesh Kulkarni',
    learningObjectives: [
      'Master factorization and completing the square methods for ax² + bx + c = 0.',
      'Derive and utilize the quadratic formula x = (-b ± √(b² - 4ac)) / (2a).',
      'Interpret the discriminant D to predict two distinct, equal, or complex roots.',
      'Model real-world projectile motion trajectories using vertex and roots.'
    ],
    curriculumStandard: 'CBSE Class 10 NCERT Chapter 4 • Quadratic Equations',
    durationWeeks: '1.5 Weeks (5 Instructional Periods)',
    flowStages: [
      {
        phase: 'Stage 1: Real-World Hook',
        description: 'Launch a basketball trajectory simulation. Show why the path forms a parabolic arc with peak vertex.',
        durationMins: 15
      },
      {
        phase: 'Stage 2: Derivation & Formulas',
        description: 'Step-by-step algebraic proof of the quadratic formula from general standard form.',
        durationMins: 30
      },
      {
        phase: 'Stage 3: Problem Solving Drill',
        description: 'Paired problem-solving solving 5 discriminant sign scenarios (D > 0, D = 0, D < 0).',
        durationMins: 35
      },
      {
        phase: 'Stage 4: Whole-Class Speed Quiz',
        description: 'Broadcast class quiz code CLS-910 for 15-minute diagnostic test to verify student mastery.',
        durationMins: 20
      }
    ],
    attachedMaterials: [
      'CBSE Class 10 Mathematics Formula Sheet PDF',
      'Parabolic Curve Graphing Template'
    ],
    assessmentStrategy: 'Speed Quiz on TestGen + End-of-unit 20-mark written test.',
    homeworkNotes: 'Solve Exercise 4.3 questions 1 through 8 in NCERT textbook.',
    status: 'active',
    updatedAt: Date.now() - 86400000 * 4
  }
];

export function getLessonPlans(groupId?: string): LessonPlan[] {
  try {
    const raw = localStorage.getItem(LESSON_PLANS_KEY);
    if (!raw) {
      localStorage.setItem(LESSON_PLANS_KEY, JSON.stringify(INITIAL_LESSON_PLANS));
      return groupId ? INITIAL_LESSON_PLANS.filter((p) => p.groupId === groupId) : INITIAL_LESSON_PLANS;
    }
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_LESSON_PLANS;
    return groupId ? list.filter((p: LessonPlan) => p.groupId === groupId) : list;
  } catch {
    return groupId ? INITIAL_LESSON_PLANS.filter((p) => p.groupId === groupId) : INITIAL_LESSON_PLANS;
  }
}

export function saveLessonPlans(plans: LessonPlan[]): void {
  try {
    localStorage.setItem(LESSON_PLANS_KEY, JSON.stringify(plans));
    window.dispatchEvent(new CustomEvent('lesson-plans-updated', { detail: plans }));
  } catch (e) {
    console.error('Failed to save lesson plans', e);
  }
}

export function createLessonPlan(plan: Omit<LessonPlan, 'id' | 'updatedAt'>): LessonPlan {
  const plans = getLessonPlans();
  const newPlan: LessonPlan = {
    ...plan,
    id: `lp_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`,
    updatedAt: Date.now()
  };
  plans.unshift(newPlan);
  saveLessonPlans(plans);

  // Sync with backend RBAC endpoint
  fetch('/api/staff/lesson-plans', {
    method: 'POST',
    headers: getStaffApiHeaders(),
    body: JSON.stringify(newPlan)
  }).then((res) => {
    if (!res.ok) handleStaffRbacResponse(res, 'Create Lesson Plan');
  }).catch((err) => console.warn('Offline or staff API error creating lesson plan', err));

  return newPlan;
}

export function updateLessonPlan(id: string, updates: Partial<LessonPlan>): boolean {
  const plans = getLessonPlans();
  const idx = plans.findIndex((p) => p.id === id);
  if (idx !== -1) {
    plans[idx] = { ...plans[idx], ...updates, updatedAt: Date.now() };
    saveLessonPlans(plans);

    // Sync with backend RBAC endpoint
    fetch(`/api/staff/lesson-plans/${id}`, {
      method: 'PUT',
      headers: getStaffApiHeaders(),
      body: JSON.stringify(updates)
    }).then((res) => {
      if (!res.ok) handleStaffRbacResponse(res, 'Update Lesson Plan');
    }).catch((err) => console.warn('Offline or staff API error updating lesson plan', err));

    return true;
  }
  return false;
}

export function deleteLessonPlan(id: string): boolean {
  const plans = getLessonPlans();
  const filtered = plans.filter((p) => p.id !== id);
  if (filtered.length !== plans.length) {
    saveLessonPlans(filtered);

    // Sync with backend RBAC endpoint
    fetch(`/api/staff/lesson-plans/${id}`, {
      method: 'DELETE',
      headers: getStaffApiHeaders()
    }).then((res) => {
      if (!res.ok) handleStaffRbacResponse(res, 'Delete Lesson Plan');
    }).catch((err) => console.warn('Offline or staff API error deleting lesson plan', err));

    return true;
  }
  return false;
}

// ==========================================
// INTERACTIVE EXCEL SPREADSHEETS FOR TEACHERS & ADMIN
// ==========================================
const INITIAL_SPREADSHEETS: TeacherSpreadsheet[] = [
  {
    id: 'sheet_class10_marks',
    groupId: 'fac_stem_core',
    title: 'Class 10 Board Marks & Continuous Evaluation Sheet',
    description: 'Comprehensive academic score tracking for 70+ enrolled students across periodic tests, midterms, and lab practicals.',
    templateType: 'gradebook',
    columns: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
    headers: [
      'Roll No',
      'Student Name',
      'Periodic Test 1 (25)',
      'Midterm Exam (50)',
      'Practical Lab (25)',
      'Total Marks (100)',
      'Percentage (%)',
      'Grade',
      'Remarks'
    ],
    rows: [
      ['STD-1001', 'Aarav Sharma', '24', '47', '25', '=C1+D1+E1', '96%', 'A+', 'Outstanding Mastery'],
      ['STD-1002', 'Ananya Sen', '25', '49', '24', '=C2+D2+E2', '98%', 'A+', 'Class Topper Candidate'],
      ['STD-1003', 'Rohan Patel', '21', '40', '22', '=C3+D3+E3', '83%', 'A', 'Strong Analytical Skills'],
      ['STD-1004', 'Diya Mukherjee', '23', '45', '24', '=C4+D4+E4', '92%', 'A+', 'Excellent Lab Work'],
      ['STD-1005', 'Kabir Verma', '18', '35', '20', '=C5+D5+E5', '73%', 'B+', 'Needs practice in algebra'],
      ['STD-1006', 'Saanvi Iyer', '24', '46', '23', '=C6+D6+E6', '93%', 'A+', 'Consistent Performer'],
      ['STD-1007', 'Aryan Gupta', '16', '31', '19', '=C7+D7+E7', '66%', 'B', 'Focus on optics theory'],
      ['STD-1008', 'Meera Nair', '22', '44', '23', '=C8+D8+E8', '89%', 'A', 'Very Good Progress'],
      ['STD-1009', 'Aditya Joshi', '20', '39', '21', '=C9+D9+E9', '80%', 'A', 'Regular in Homework'],
      ['STD-1010', 'Ishaan Deshmukh', '19', '38', '20', '=C10+D10+E10', '77%', 'B+', 'Active class participation'],
      ['SUMMARY', 'Class Average', '=AVG(C1:C10)', '=AVG(D1:D10)', '=AVG(E1:E10)', '=AVG(F1:F10)', '84.7%', 'A', 'Cohort Healthy']
    ],
    lastEditedBy: 'Dr. Sunita Verma',
    updatedAt: Date.now() - 86400000 * 1
  },
  {
    id: 'sheet_syllabus_tracker',
    groupId: 'fac_stem_core',
    title: 'Faculty Syllabus Timeline & Topic Sign-Off Matrix',
    description: 'Weekly teaching progression, allocated hours, completed units, and principal syllabus approvals.',
    templateType: 'syllabus_tracker',
    columns: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
    headers: [
      'Unit Code',
      'Chapter / Topic Title',
      'Assigned Teacher',
      'Target Completion',
      'Class Hours',
      'Progress (%)',
      'Principal Approval'
    ],
    rows: [
      ['BIO-01', 'Chemical Reactions & Equations', 'Dr. Sunita Verma', 'Week 4 - Aug', '12', '100%', 'Approved by Pranav'],
      ['BIO-02', 'Acids, Bases & Salts', 'Dr. Sunita Verma', 'Week 7 - Sep', '14', '100%', 'Approved by Pranav'],
      ['BIO-03', 'Life Processes (Nutrition & Respiration)', 'Dr. Sunita Verma', 'Week 11 - Oct', '18', '95%', 'In Review'],
      ['PHY-01', 'Light - Reflection and Refraction', 'Dr. Vikram Malhotra', 'Week 8 - Sep', '16', '100%', 'Approved by Pranav'],
      ['PHY-02', 'Human Eye and Colourful World', 'Dr. Vikram Malhotra', 'Week 12 - Oct', '10', '90%', 'In Progress'],
      ['MATH-01', 'Real Numbers & Polynomials', 'Prof. Ramesh Kulkarni', 'Week 5 - Aug', '14', '100%', 'Approved by Pranav'],
      ['MATH-02', 'Pair of Linear Equations in 2 Variables', 'Prof. Ramesh Kulkarni', 'Week 9 - Sep', '16', '100%', 'Approved by Pranav'],
      ['MATH-03', 'Quadratic Equations & AP Progressions', 'Prof. Ramesh Kulkarni', 'Week 13 - Oct', '20', '85%', 'In Progress']
    ],
    lastEditedBy: 'Pranav (Principal)',
    updatedAt: Date.now() - 86400000 * 3
  }
];

export function getTeacherSpreadsheets(groupId?: string): TeacherSpreadsheet[] {
  try {
    const raw = localStorage.getItem(SPREADSHEETS_KEY);
    if (!raw) {
      localStorage.setItem(SPREADSHEETS_KEY, JSON.stringify(INITIAL_SPREADSHEETS));
      return groupId ? INITIAL_SPREADSHEETS.filter((s) => s.groupId === groupId) : INITIAL_SPREADSHEETS;
    }
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SPREADSHEETS;
    return groupId ? list.filter((s: TeacherSpreadsheet) => s.groupId === groupId) : list;
  } catch {
    return groupId ? INITIAL_SPREADSHEETS.filter((s) => s.groupId === groupId) : INITIAL_SPREADSHEETS;
  }
}

export function saveTeacherSpreadsheets(sheets: TeacherSpreadsheet[]): void {
  try {
    localStorage.setItem(SPREADSHEETS_KEY, JSON.stringify(sheets));
    window.dispatchEvent(new CustomEvent('teacher-spreadsheets-updated', { detail: sheets }));
  } catch (e) {
    console.error('Failed to save spreadsheets', e);
  }
}

export function createTeacherSpreadsheet(sheet: Omit<TeacherSpreadsheet, 'id' | 'updatedAt'>): TeacherSpreadsheet {
  const list = getTeacherSpreadsheets();
  const newSheet: TeacherSpreadsheet = {
    ...sheet,
    id: `sheet_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`,
    updatedAt: Date.now()
  };
  list.unshift(newSheet);
  saveTeacherSpreadsheets(list);

  // Sync with backend RBAC endpoint
  fetch('/api/staff/spreadsheets', {
    method: 'POST',
    headers: getStaffApiHeaders(),
    body: JSON.stringify(newSheet)
  }).then((res) => {
    if (!res.ok) handleStaffRbacResponse(res, 'Create Spreadsheet');
  }).catch((err) => console.warn('Offline or staff API error creating spreadsheet', err));

  return newSheet;
}

export function updateTeacherSpreadsheet(id: string, updates: Partial<TeacherSpreadsheet>): boolean {
  const list = getTeacherSpreadsheets();
  const idx = list.findIndex((s) => s.id === id);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...updates, updatedAt: Date.now() };
    saveTeacherSpreadsheets(list);

    // Sync with backend RBAC endpoint
    fetch(`/api/staff/spreadsheets/${id}`, {
      method: 'PUT',
      headers: getStaffApiHeaders(),
      body: JSON.stringify(updates)
    }).then((res) => {
      if (!res.ok) handleStaffRbacResponse(res, 'Update Spreadsheet');
    }).catch((err) => console.warn('Offline or staff API error updating spreadsheet', err));

    return true;
  }
  return false;
}

export function deleteTeacherSpreadsheet(id: string): boolean {
  const list = getTeacherSpreadsheets();
  const filtered = list.filter((s) => s.id !== id);
  if (filtered.length !== list.length) {
    saveTeacherSpreadsheets(filtered);

    // Sync with backend RBAC endpoint
    fetch(`/api/staff/spreadsheets/${id}`, {
      method: 'DELETE',
      headers: getStaffApiHeaders()
    }).then((res) => {
      if (!res.ok) handleStaffRbacResponse(res, 'Delete Spreadsheet');
    }).catch((err) => console.warn('Offline or staff API error deleting spreadsheet', err));

    return true;
  }
  return false;
}

// Master Synchronization helper to fetch latest RBAC protected staff records from backend
export async function syncStaffConsoleFromBackend(): Promise<{
  groups?: FacultyTeacherGroup[];
  lessonPlans?: LessonPlan[];
  spreadsheets?: TeacherSpreadsheet[];
  pdfSources?: PdfSourceDocument[];
  settings?: GlobalQuizSettings;
}> {
  const headers = getStaffApiHeaders();

  try {
    const [groupsRes, plansRes, sheetsRes, pdfRes, settingsRes] = await Promise.allSettled([
      fetch('/api/staff/faculty-groups', { headers }),
      fetch('/api/staff/lesson-plans', { headers }),
      fetch('/api/staff/spreadsheets', { headers }),
      fetch('/api/staff/pdf-sources', { headers }),
      fetch('/api/staff/quiz-settings', { headers })
    ]);

    const result: any = {};

    if (groupsRes.status === 'fulfilled' && groupsRes.value.ok) {
      const data = await groupsRes.value.json();
      if (Array.isArray(data.groups) && data.groups.length > 0) {
        saveFacultyTeacherGroups(data.groups);
        result.groups = data.groups;
      }
    } else if (groupsRes.status === 'fulfilled' && (groupsRes.value.status === 403 || groupsRes.value.status === 401)) {
      handleStaffRbacResponse(groupsRes.value, 'Load Faculty Groups');
    }

    if (plansRes.status === 'fulfilled' && plansRes.value.ok) {
      const data = await plansRes.value.json();
      if (Array.isArray(data.lessonPlans) && data.lessonPlans.length > 0) {
        saveLessonPlans(data.lessonPlans);
        result.lessonPlans = data.lessonPlans;
      }
    }

    if (sheetsRes.status === 'fulfilled' && sheetsRes.value.ok) {
      const data = await sheetsRes.value.json();
      if (Array.isArray(data.spreadsheets) && data.spreadsheets.length > 0) {
        saveTeacherSpreadsheets(data.spreadsheets);
        result.spreadsheets = data.spreadsheets;
      }
    }

    if (pdfRes.status === 'fulfilled' && pdfRes.value.ok) {
      const data = await pdfRes.value.json();
      if (Array.isArray(data.pdfSources) && data.pdfSources.length > 0) {
        savePdfSources(data.pdfSources);
        result.pdfSources = data.pdfSources;
      }
    }

    if (settingsRes.status === 'fulfilled' && settingsRes.value.ok) {
      const data = await settingsRes.value.json();
      if (data.settings) {
        saveGlobalQuizSettings(data.settings);
        result.settings = data.settings;
      }
    }

    return result;
  } catch (e) {
    console.warn('Backend sync failed or offline; using local cache.', e);
    return {};
  }
}

