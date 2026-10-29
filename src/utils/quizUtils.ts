import confetti from "canvas-confetti";
import { QuizQuestion, GeneratedQuiz } from "../types";

/**
 * Fires 2 confetti bursts from bottom-left and bottom-right corners
 */
export function fireBottomLeftAndRightConfetti() {
  try {
    // Burst from bottom-left
    confetti({
      particleCount: 45,
      angle: 60,
      spread: 55,
      origin: { x: 0.05, y: 0.95 },
      colors: ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#3b82f6", "#8b5cf6"],
      zIndex: 9999,
    });

    // Burst from bottom-right
    confetti({
      particleCount: 45,
      angle: 120,
      spread: 55,
      origin: { x: 0.95, y: 0.95 },
      colors: ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#3b82f6", "#8b5cf6"],
      zIndex: 9999,
    });
  } catch (err) {
    console.warn("Confetti animation error:", err);
  }
}

/**
 * Validates a user's typed response against the correct answer and accepted variations
 */
export function checkTypedAnswer(
  userText: string,
  correctAnswer: string,
  acceptedAnswers: string[] = []
): boolean {
  if (!userText || !correctAnswer) return false;

  const clean = (str: string) =>
    str
      .toLowerCase()
      .trim()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "")
      .replace(/\s+/g, " ");

  const u = clean(userText);
  const c = clean(correctAnswer);

  if (u === c) return true;

  // Check without common leading articles
  const stripArticles = (s: string) => s.replace(/^(the|a|an)\s+/, "");
  if (stripArticles(u) === stripArticles(c)) return true;

  // Check against accepted variations
  for (const alt of acceptedAnswers) {
    const cleanAlt = clean(alt);
    if (u === cleanAlt || stripArticles(u) === stripArticles(cleanAlt)) {
      return true;
    }
  }

  // Numerical equality check
  const numUser = parseFloat(u);
  const numCorrect = parseFloat(c);
  if (!isNaN(numUser) && !isNaN(numCorrect) && Math.abs(numUser - numCorrect) < 0.001) {
    return true;
  }

  return false;
}

/**
 * Helper to reliably identify if a question is True/False
 */
export function isTrueFalseQuestion(q: any): boolean {
  if (!q) return false;
  if (q.type === "true_false") return true;
  const qText = String(q.question || "").toLowerCase();
  if (
    qText.includes("true or false") ||
    qText.includes("true/false") ||
    qText.includes("(true or false)") ||
    qText.includes("(true/false)") ||
    qText.includes("is this statement true") ||
    qText.includes("state whether true or false") ||
    qText.includes("सत्य या असत्य") ||
    qText.includes("सत्यम् अथवा असत्यम्")
  ) {
    return true;
  }
  const opts = (Array.isArray(q.options) ? q.options : []).map((o: any) =>
    String(o).trim().toLowerCase()
  );
  const hasTrue =
    opts.includes("true") || opts.includes("सत्य") || opts.includes("सत्यम्");
  const hasFalse =
    opts.includes("false") || opts.includes("असत्य") || opts.includes("अशुद्धम्");
  if (hasTrue && hasFalse) return true;
  const correct = String(q.correctAnswer || "").trim().toLowerCase();
  if ((correct === "true" || correct === "false") && opts.length <= 2) {
    return true;
  }
  return false;
}

/**
 * Ensures that for any sequence of quiz questions:
 * 1. For true_false: Exactly 2 options strictly: ["True", "False"], never Alternative 1 or extra choices.
 * 2. For typed: options is empty.
 * 3. For mcq: Exactly 4 options, and the correct answer is never always placed on Option A (index 0).
 *    The correct option position changes after EVERY question (e.g. Q1 -> B, Q2 -> D, Q3 -> A, Q4 -> C, etc.)
 *    so that no two consecutive MCQ questions have the same correct option letter.
 */
export function ensureVariedMcqOptions(questions: QuizQuestion[]): QuizQuestion[] {
  let prevTargetIdx = -1;

  return questions.map((q, qIndex) => {
    // True/False questions must strictly have only 2 options: True and False (no Alternative 1)
    if (isTrueFalseQuestion(q)) {
      const isFalse =
        String(q.correctAnswer).trim().toLowerCase() === "false" ||
        String(q.correctAnswer).trim().toLowerCase() === "असत्य" ||
        String(q.correctAnswer).trim().toLowerCase() === "अशुद्धम्";

      return {
        ...q,
        type: "true_false",
        options: ["True", "False"],
        correctAnswer: isFalse ? "False" : "True",
      };
    }

    // Typed questions have no multiple choice options
    if (q.type === "typed") {
      return {
        ...q,
        type: "typed",
        options: [],
        correctAnswer: (q.correctAnswer || "").trim(),
      };
    }

    const rawOptions = Array.isArray(q.options) ? q.options : [];
    const correctAnswer = (q.correctAnswer || "").trim();

    // If less than 2 options or no correct answer, return as-is
    if (rawOptions.length < 2 || !correctAnswer) {
      return q;
    }

    // Standard MCQs strictly have 4 options
    const targetLength = 4;

    // Extract distractors (options that don't match correctAnswer)
    const rawDistractors = rawOptions.filter(
      (opt) => opt.trim().toLowerCase() !== correctAnswer.toLowerCase() && !opt.toLowerCase().startsWith("alternative")
    );

    // Filter duplicates among distractors
    const uniqueDistractors: string[] = [];
    for (const d of rawDistractors) {
      if (!uniqueDistractors.some((u) => u.toLowerCase() === d.toLowerCase())) {
        uniqueDistractors.push(d);
      }
    }

    // Gather authentic distractors from other questions in the quiz if needed
    if (uniqueDistractors.length < targetLength - 1) {
      const candidateDistractors = questions
        .flatMap((other) => [other.correctAnswer, ...(other.options || [])])
        .map((s) => String(s || "").trim())
        .filter(
          (s) =>
            s &&
            s.toLowerCase() !== correctAnswer.toLowerCase() &&
            s.toLowerCase() !== "true" &&
            s.toLowerCase() !== "false" &&
            !s.toLowerCase().startsWith("alternative") &&
            !uniqueDistractors.some((u) => u.toLowerCase() === s.toLowerCase())
        );

      for (const d of candidateDistractors) {
        if (uniqueDistractors.length >= targetLength - 1) break;
        uniqueDistractors.push(d);
      }
    }

    // Fallback options if still under 3 distractors, NEVER "Alternative 1"
    const fallbackOptions = ["None of the above", "All of the above", "Cannot be determined accurately"];
    let fIdx = 0;
    while (uniqueDistractors.length < targetLength - 1) {
      const fb = fallbackOptions[fIdx++] || `Option ${uniqueDistractors.length + 1}`;
      if (!uniqueDistractors.some((u) => u.toLowerCase() === fb.toLowerCase())) {
        uniqueDistractors.push(fb);
      }
    }

    // Keep only first 3 distractors
    const finalDistractors = uniqueDistractors.slice(0, targetLength - 1);
    const shuffledDistractors = [...finalDistractors].sort(() => Math.random() - 0.5);

    // Calculate next target index such that:
    // 1) targetIdx !== prevTargetIdx (the correct option changes after every question)
    // 2) For the first question (qIndex === 0), avoid 0 so it doesn't default to Option A
    const allIndices = [0, 1, 2, 3];
    const validIndices = allIndices.filter((idx) => idx !== prevTargetIdx);

    let candidateIndices = validIndices;
    if (qIndex === 0) {
      const nonZero = validIndices.filter((idx) => idx !== 0);
      if (nonZero.length > 0) {
        candidateIndices = nonZero;
      }
    }

    // Pick a candidate index
    const targetIdx =
      candidateIndices[Math.floor(Math.random() * candidateIndices.length)] ??
      (prevTargetIdx === 0 ? 1 : 0);

    prevTargetIdx = targetIdx;

    // Assemble new options array with correctAnswer strictly placed at targetIdx
    const newOptions: string[] = [];
    let dIndex = 0;
    for (let i = 0; i < targetLength; i++) {
      if (i === targetIdx) {
        newOptions.push(correctAnswer);
      } else {
        newOptions.push(shuffledDistractors[dIndex++] || `Option ${i + 1}`);
      }
    }

    return {
      ...q,
      type: "mcq",
      options: newOptions,
      correctAnswer: correctAnswer,
    };
  });
}

/**
 * Fisher-Yates array shuffle helper
 */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Selects a fresh set of questions for a battle session.
 * Guarantees that:
 * 1. Questions differ between consecutive battles (rotates and shuffles through question pool).
 * 2. MCQ options change correct answer position after every single question.
 */
export function selectBattleQuestions(
  pool: QuizQuestion[],
  battleNumber: number,
  count = 5
): QuizQuestion[] {
  if (!pool || pool.length === 0) return [];

  let selected: QuizQuestion[] = [];

  if (pool.length <= count) {
    // If pool is small, shuffle order based on battle number and random seed
    const shuffled = shuffleArray(pool);
    // Reverse or shift if battleNumber is even vs odd to ensure different starting question
    if (battleNumber % 2 === 0) {
      shuffled.reverse();
    }
    selected = shuffled;
  } else {
    // When pool has more questions, pick a shifted window or shuffled sample
    const shuffledPool = shuffleArray(pool);
    // Prioritize questions by battle rotation
    const startIndex = ((battleNumber - 1) * 3) % pool.length;
    const rotated = [
      ...shuffledPool.slice(startIndex),
      ...shuffledPool.slice(0, startIndex),
    ];
    selected = rotated.slice(0, count);
  }

  // Ensure correct option position changes after every question
  return ensureVariedMcqOptions(selected);
}
