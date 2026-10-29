import { GeneratedQuiz, QuizQuestion, AppLanguage, EducationLevel } from '../types';
import { ensureVariedMcqOptions } from './quizUtils';

interface OfflineQuizOptions {
  subjectName?: string;
  focusTopic?: string;
  faculty?: string;
  educationLevel?: EducationLevel;
  numQuestions?: number;
  questionTypes?: 'mixed' | 'mcq' | 'true_false';
  language?: AppLanguage;
}

export function generateOfflineQuiz(opts: OfflineQuizOptions): GeneratedQuiz {
  const {
    subjectName = 'General Knowledge',
    focusTopic = '',
    faculty = 'all',
    educationLevel = 'class_1',
    numQuestions = 5,
    questionTypes = 'mixed',
    language = 'en'
  } = opts;

  const count = Math.min(Math.max(numQuestions || 5, 3), 10);
  const titleTopic = focusTopic || subjectName;

  const isPrimaryClasses =
    educationLevel === 'class_1' ||
    educationLevel === 'class_2' ||
    educationLevel === 'class_3' ||
    educationLevel === 'class_4' ||
    educationLevel === 'class_5';

  const isMiddleClasses =
    educationLevel === 'class_6' ||
    educationLevel === 'class_7' ||
    educationLevel === 'class_8';

  const isHighSchool =
    educationLevel === 'class_9' ||
    educationLevel === 'class_10' ||
    educationLevel === 'class_11' ||
    educationLevel === 'class_12' ||
    educationLevel === 'high_school';

  let pool: QuizQuestion[] = [];

  if (isPrimaryClasses) {
    // Classes 1–5 (Foundational Learning) Offline Question Bank
    pool = [
      {
        id: 'off_j1',
        type: 'mcq',
        question: `When exploring ${titleTopic}, what is the best first step to take?`,
        options: [
          'Read or observe step-by-step with curiosity',
          'Rush without looking at details',
          'Close your eyes and guess',
          'Skip immediately'
        ],
        correctAnswer: 'Read or observe step-by-step with curiosity',
        explanation: 'Learning step-by-step with patience helps young minds understand and remember key ideas easily!',
        hint: 'Think about how we practice writing letters or counting!',
        difficulty: 'easy'
      },
      {
        id: 'off_j2',
        type: 'true_false',
        question: `True or False: Asking teachers, parents, and friends questions helps you become smarter and more confident every day.`,
        options: ['True', 'False'],
        correctAnswer: 'True',
        explanation: 'Yes! Asking questions is a young champion’s greatest superpower.',
        hint: 'Curiosity helps us discover new things!',
        difficulty: 'easy'
      },
      {
        id: 'off_j3',
        type: 'mcq',
        question: `Which of these habits helps you do best when studying ${titleTopic}?`,
        options: [
          'Checking your answer twice before submitting',
          'Guessing as fast as possible',
          'Ignoring the instructions',
          'Giving up when it feels new'
        ],
        correctAnswer: 'Checking your answer twice before submitting',
        explanation: 'Checking your work catches small slips and helps you feel confident in your answer.',
        hint: 'Good students always take a quick look back at their work.',
        difficulty: 'easy'
      },
      {
        id: 'off_j4',
        type: 'true_false',
        question: `True or False: Practicing with fun examples, drawings, and stories makes ${titleTopic} easy and enjoyable!`,
        options: ['True', 'False'],
        correctAnswer: 'True',
        explanation: 'True! Connecting ideas to everyday examples like pets, games, and nature makes learning fun.',
        hint: 'Joyful practice builds lasting memory.',
        difficulty: 'easy'
      },
      {
        id: 'off_j5',
        type: 'typed',
        question: `What positive word describes how you feel when you solve a problem correctly after trying hard?`,
        options: [],
        correctAnswer: 'Happy',
        acceptedAnswers: ['happy', 'proud', 'joy', 'excited', 'happiness'],
        explanation: 'Solving questions on your own brings happiness and pride!',
        hint: 'Starts with the letter H (like a smiling face 😊)',
        difficulty: 'easy'
      }
    ];
  } else if (isMiddleClasses) {
    // Classes 6–8 Offline Question Bank
    pool = [
      {
        id: 'off_m1',
        type: 'mcq',
        question: `In Class 6–8 science and mathematics relating to ${titleTopic}, how should you verify a derived relationship?`,
        options: [
          'Substitute known values and verify units and numerical consistency',
          'Assume equations always hold true without checking units',
          'Rely solely on visual guessing',
          'Ignore variable definitions'
        ],
        correctAnswer: 'Substitute known values and verify units and numerical consistency',
        explanation: 'Checking units and substituting test numbers confirms whether mathematical and physical models are sound.',
        hint: 'Think about checking your work in algebra or physics.',
        difficulty: 'medium'
      },
      {
        id: 'off_m2',
        type: 'true_false',
        question: `True or False: In ${titleTopic}, identifying the fundamental variables (such as force, distance, mass, or ratios) is necessary before calculating.`,
        options: ['True', 'False'],
        correctAnswer: 'True',
        explanation: 'Clear parameter identification prevents confusion and ensures correct formula usage.',
        hint: 'Always write down what is given first!',
        difficulty: 'easy'
      },
      {
        id: 'off_m3',
        type: 'mcq',
        question: `Which fundamental principle is central to middle school analysis of ${titleTopic}?`,
        options: [
          'Systematic observation and balancing equations step-by-step',
          'Memorizing answers without understanding the underlying steps',
          'Ignoring boundary constraints',
          'Skipping experimental proof'
        ],
        correctAnswer: 'Systematic observation and balancing equations step-by-step',
        explanation: 'Step-by-step logical derivation builds solid problem-solving foundations for board examinations.',
        hint: 'Balance and consistency are key.',
        difficulty: 'medium'
      },
      {
        id: 'off_m4',
        type: 'true_false',
        question: `True or False: Concepts learned in Class 6, 7, and 8 form the essential building blocks for higher secondary science and math.`,
        options: ['True', 'False'],
        correctAnswer: 'True',
        explanation: 'Middle school concepts in algebra, geometry, living organisms, and force form the backbone of secondary education.',
        hint: 'Knowledge builds like a tower.',
        difficulty: 'easy'
      },
      {
        id: 'off_m5',
        type: 'typed',
        question: `What is the mathematical term for an equation with variables raised to the first power (e.g. 2x + 5 = 15)?`,
        options: [],
        correctAnswer: 'Linear',
        acceptedAnswers: ['linear', 'linear equation', 'linear equations'],
        explanation: 'Linear equations have variables with degree 1 and graph as straight lines.',
        hint: 'Starts with "Line..." (produces a straight line graph)',
        difficulty: 'medium'
      }
    ];
  } else if (isHighSchool) {
    // Secondary & Senior (Classes 9–12) Offline Question Bank
    pool = [
      {
        id: 'off_h1',
        type: 'mcq',
        question: `In Class 9–12 advanced curriculum for ${titleTopic}, what distinguishes analytical mastery from rote memorization?`,
        options: [
          'Ability to apply first principles to novel multi-step boundary conditions',
          'Reciting textbook paragraphs verbatim without solving problems',
          'Assuming all formulas apply universally without constraint checks',
          'Ignoring conservation laws and dimensional analysis'
        ],
        correctAnswer: 'Ability to apply first principles to novel multi-step boundary conditions',
        explanation: 'Board exams and entrance assessments test whether students can deduce solutions from fundamental conservation and mathematical laws.',
        hint: 'First principles allow you to solve unfamiliar problems.',
        difficulty: 'hard'
      },
      {
        id: 'off_h2',
        type: 'true_false',
        question: `True or False: In ${titleTopic}, dimensional analysis and checking limit behaviors (e.g. as t → ∞ or x → 0) is a crucial verification method.`,
        options: ['True', 'False'],
        correctAnswer: 'True',
        explanation: 'Examining extreme values and checking dimensions catches algebraic errors in physics and mathematics.',
        hint: 'Extreme cases reveal formula correctness.',
        difficulty: 'medium'
      },
      {
        id: 'off_h3',
        type: 'mcq',
        question: `When analyzing complex systems in ${titleTopic}, what is the standard scientific methodology?`,
        options: [
          'Isolate the system, draw a free-body or state diagram, and apply governing equations',
          'Combine formulas at random until numbers seem plausible',
          'Disregard conservation of energy or mass',
          'Treat vector quantities as simple scalars'
        ],
        correctAnswer: 'Isolate the system, draw a free-body or state diagram, and apply governing equations',
        explanation: 'Isolating the system and defining a reference frame is the standard technique across physics, chemistry, and calculus.',
        hint: 'Always isolate the system and draw diagrams.',
        difficulty: 'hard'
      },
      {
        id: 'off_h4',
        type: 'true_false',
        question: `True or False: Mastery of ${titleTopic} at Class 10 and Class 12 standard provides direct readiness for competitive exams and university curricula.`,
        options: ['True', 'False'],
        correctAnswer: 'True',
        explanation: 'Senior secondary curriculums are calibrated to establish rigorous university entrance benchmarks.',
        hint: 'Senior curriculum bridges secondary school to collegiate academics.',
        difficulty: 'easy'
      },
      {
        id: 'off_h5',
        type: 'typed',
        question: `In physics and mathematics, what term describes the rate of change of a function with respect to a variable?`,
        options: [],
        correctAnswer: 'Derivative',
        acceptedAnswers: ['derivative', 'differentiation', 'the derivative'],
        explanation: 'A derivative measures the instantaneous rate of change of a function.',
        hint: 'Core concept in calculus (dy/dx)',
        difficulty: 'medium'
      }
    ];
  } else {
    // Senior & Standard Academic Subjects
    pool = [
      {
        id: 'off_s1',
        type: 'mcq',
        question: `What is the core pedagogical foundation of studying ${titleTopic}?`,
        options: [
          'Understanding fundamental principles and applying them systematically',
          'Memorizing isolated formulas without conceptual context',
          'Relying solely on guesswork and intuition',
          'Avoiding empirical validation'
        ],
        correctAnswer: 'Understanding fundamental principles and applying them systematically',
        explanation: `Systematic study of ${titleTopic} establishes mental models that bridge fundamental definitions with observable phenomena.`,
        hint: 'Think about the core goal of academic problem solving.',
        difficulty: 'medium'
      },
      {
        id: 'off_s2',
        type: 'true_false',
        question: `True or False: In ${titleTopic}, verified empirical observation and mathematical consistency are essential for sound conclusions.`,
        options: ['True', 'False'],
        correctAnswer: 'True',
        explanation: 'Scientific and academic inquiry requires consistent evidence and logical validation.',
        hint: 'Consider how hypotheses are proven in this field.',
        difficulty: 'easy'
      },
      {
        id: 'off_s3',
        type: 'mcq',
        question: `When approaching an analytical problem in ${titleTopic}, which step is recommended first?`,
        options: [
          'Identify given parameters, core constraints, and target unknowns',
          'Assume edge cases do not matter and compute immediately',
          'Skip defining the coordinate system or boundary conditions',
          'Select an arbitrary formula at random'
        ],
        correctAnswer: 'Identify given parameters, core constraints, and target unknowns',
        explanation: 'Clear initial framing prevents arithmetic and dimensional errors.',
        hint: 'Always clarify what you are given and what you must find.',
        difficulty: 'medium'
      },
      {
        id: 'off_s4',
        type: 'true_false',
        question: `True or False: Key principles in ${titleTopic} connect meaningfully with neighboring scientific and humanistic disciplines.`,
        options: ['True', 'False'],
        correctAnswer: 'True',
        explanation: 'Interdisciplinary synthesis reinforces deep conceptual retention.',
        hint: 'Knowledge across disciplines is interconnected.',
        difficulty: 'easy'
      },
      {
        id: 'off_s5',
        type: 'typed',
        question: `What is the term for a proposed explanation made on the basis of limited evidence as a starting point for further investigation?`,
        options: [],
        correctAnswer: 'Hypothesis',
        acceptedAnswers: ['hypothesis', 'hypotheses', 'a hypothesis'],
        explanation: 'A hypothesis is a testable proposition framed to explain an observed phenomenon.',
        hint: 'Starts with "Hypo..." (foundational scientific term)',
        difficulty: 'medium'
      }
    ];
  }

  // Filter based on questionTypes if requested
  let filtered = pool;
  if (questionTypes === 'mcq') {
    filtered = pool.filter((q) => q.type === 'mcq');
  } else if (questionTypes === 'true_false') {
    filtered = pool.filter((q) => q.type === 'true_false');
  }

  if (filtered.length < count) {
    filtered = pool;
  }

  const selected = filtered.slice(0, count);

  return {
    id: `offline_quiz_${Date.now()}`,
    title: `${titleTopic} • Offline Practice Quiz`,
    summary: `Instant zero-latency practice quiz running 100% offline on your device for ${titleTopic}.`,
    language,
    topicsCovered: [titleTopic, 'Offline Knowledge Bank'],
    documentName: titleTopic,
    subjectName: titleTopic,
    faculty: faculty as any,
    educationLevel,
    createdAt: Date.now(),
    questions: ensureVariedMcqOptions(
      selected.map((q) => ({
        ...q,
        conceptTested: q.conceptTested || `${titleTopic} • Foundational Core Concept`,
        whyCorrect: q.whyCorrect || q.explanation || `"${q.correctAnswer}" is the verified correct answer based on established principles.`
      }))
    )
  };
}
