import { GeneratedQuiz, QuizAttempt, LearningStreak } from "../types";

const SAVED_QUIZZES_KEY = "pdf_quiz_saved_quizzes";
const QUIZ_ATTEMPTS_KEY = "pdf_quiz_attempts";
const ACTIVE_QUIZ_KEY = "pdf_quiz_active_quiz";

export const LEARNING_STREAK_KEY = "learning_streak";
export const LEARNING_STREAK_DATA_KEY = "learning_streak_data";

/**
 * Returns today's date formatted as YYYY-MM-DD in local time
 */
export function getLocalTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Returns the difference in calendar days between two YYYY-MM-DD date strings (date2 - date1)
 */
export function getCalendarDayDiff(fromDateStr: string, toDateStr: string): number {
  try {
    const [y1, m1, d1] = fromDateStr.split("-").map(Number);
    const [y2, m2, d2] = toDateStr.split("-").map(Number);
    const utc1 = Date.UTC(y1, m1 - 1, d1);
    const utc2 = Date.UTC(y2, m2 - 1, d2);
    return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}

/**
 * Saves streak data to localStorage under both simple count and detailed JSON keys
 */
export function saveLearningStreakData(streak: LearningStreak): void {
  try {
    localStorage.setItem(LEARNING_STREAK_KEY, streak.count.toString());
    localStorage.setItem("learningStreak", streak.count.toString());
    localStorage.setItem("testgen_learning_streak", streak.count.toString());
    localStorage.setItem(LEARNING_STREAK_DATA_KEY, JSON.stringify(streak));
  } catch (e) {
    console.error("Failed to save learning streak data", e);
  }
}

/**
 * Reads and evaluates the current learning streak from localStorage
 */
export function getLearningStreak(): LearningStreak {
  try {
    const today = getLocalTodayDateString();
    const rawData = localStorage.getItem(LEARNING_STREAK_DATA_KEY);
    const rawCount = localStorage.getItem(LEARNING_STREAK_KEY);

    let streak: LearningStreak = {
      count: 0,
      lastCompletedDate: null,
      bestStreak: 0,
      completedToday: false,
      history: []
    };

    if (rawData) {
      const parsed = JSON.parse(rawData);
      streak = {
        count: typeof parsed.count === "number" ? parsed.count : 0,
        lastCompletedDate: parsed.lastCompletedDate || null,
        bestStreak: typeof parsed.bestStreak === "number" ? parsed.bestStreak : 0,
        completedToday: false,
        history: Array.isArray(parsed.history) ? parsed.history : []
      };
    } else if (rawCount) {
      const parsedCount = parseInt(rawCount, 10);
      if (!isNaN(parsedCount) && parsedCount > 0) {
        streak.count = parsedCount;
        streak.bestStreak = parsedCount;
      }
    } else {
      // Smart check: if user already has completed quiz attempts in storage, analyze them
      const attempts = getQuizAttempts();
      if (attempts.length > 0) {
        const attemptDates = Array.from(
          new Set(
            attempts
              .filter((a) => a.completedAt)
              .map((a) => {
                const d = new Date(a.completedAt);
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
                  d.getDate()
                ).padStart(2, "0")}`;
              })
          )
        ).sort();

        if (attemptDates.length > 0) {
          const lastDate = attemptDates[attemptDates.length - 1];
          const diff = getCalendarDayDiff(lastDate, today);
          if (diff === 0 || diff === 1) {
            let c = 1;
            let prev = lastDate;
            for (let i = attemptDates.length - 2; i >= 0; i--) {
              if (getCalendarDayDiff(attemptDates[i], prev) === 1) {
                c++;
                prev = attemptDates[i];
              } else {
                break;
              }
            }
            streak.count = c;
            streak.lastCompletedDate = lastDate;
            streak.bestStreak = c;
            streak.completedToday = diff === 0;
            streak.history = attemptDates;
            saveLearningStreakData(streak);
            return streak;
          }
        }
      }
    }

    // Evaluate streak validity against today's date
    if (streak.lastCompletedDate) {
      const diff = getCalendarDayDiff(streak.lastCompletedDate, today);
      if (diff === 0) {
        // Quiz completed today!
        streak.completedToday = true;
      } else if (diff === 1) {
        // Quiz was completed yesterday; streak is intact and waiting for today's quiz
        streak.completedToday = false;
      } else if (diff > 1) {
        // User missed at least 1 day between last completed date and today; streak broken
        streak.count = 0;
        streak.completedToday = false;
        // Persist the reset count
        saveLearningStreakData(streak);
      } else {
        // diff < 0: clock skew or same day
        streak.completedToday = true;
      }
    }

    return streak;
  } catch (e) {
    console.error("Failed to load learning streak", e);
    return {
      count: 0,
      lastCompletedDate: null,
      bestStreak: 0,
      completedToday: false,
      history: []
    };
  }
}

/**
 * Records a quiz completion to update consecutive days streak
 */
export function recordQuizCompletionForStreak(): {
  streak: LearningStreak;
  isNewDay: boolean;
  incremented: boolean;
} {
  try {
    const today = getLocalTodayDateString();
    const current = getLearningStreak();
    let isNewDay = false;
    let incremented = false;

    const historySet = new Set(current.history || []);
    historySet.add(today);

    let newCount = current.count;
    if (current.lastCompletedDate === today) {
      // Already completed a quiz today
      isNewDay = false;
      incremented = false;
      newCount = Math.max(1, current.count);
    } else if (current.lastCompletedDate && getCalendarDayDiff(current.lastCompletedDate, today) === 1) {
      // Completed yesterday: increment streak!
      newCount = (current.count || 0) + 1;
      isNewDay = true;
      incremented = true;
    } else {
      // First day ever or streak was broken: start with 1
      newCount = 1;
      isNewDay = true;
      incremented = true;
    }

    const newBest = Math.max(current.bestStreak || 0, newCount);
    const updated: LearningStreak = {
      count: newCount,
      lastCompletedDate: today,
      bestStreak: newBest,
      completedToday: true,
      history: Array.from(historySet).slice(-60)
    };

    saveLearningStreakData(updated);

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("learning-streak-updated", { detail: updated })
      );
    }

    return { streak: updated, isNewDay, incremented };
  } catch (e) {
    console.error("Failed to record quiz completion for streak", e);
    const fallback: LearningStreak = {
      count: 1,
      lastCompletedDate: getLocalTodayDateString(),
      bestStreak: 1,
      completedToday: true,
      history: [getLocalTodayDateString()]
    };
    saveLearningStreakData(fallback);
    return { streak: fallback, isNewDay: true, incremented: true };
  }
}

export function getSavedQuizzes(): GeneratedQuiz[] {
  try {
    const raw = localStorage.getItem(SAVED_QUIZZES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to load saved quizzes", e);
    return [];
  }
}

export function saveQuiz(quiz: GeneratedQuiz): void {
  try {
    const current = getSavedQuizzes();
    const existingIndex = current.findIndex((q) => q.id === quiz.id);
    let updated: GeneratedQuiz[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = quiz;
    } else {
      updated = [quiz, ...current].slice(0, 30); // keep up to 30 quizzes
    }
    localStorage.setItem(SAVED_QUIZZES_KEY, JSON.stringify(updated));
    localStorage.setItem(ACTIVE_QUIZ_KEY, JSON.stringify(quiz));
  } catch (e) {
    console.error("Failed to save quiz", e);
  }
}

export function getActiveQuiz(): GeneratedQuiz | null {
  try {
    const raw = localStorage.getItem(ACTIVE_QUIZ_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function setActiveQuiz(quiz: GeneratedQuiz): void {
  try {
    localStorage.setItem(ACTIVE_QUIZ_KEY, JSON.stringify(quiz));
  } catch (e) {
    console.error("Failed to set active quiz", e);
  }
}

export function deleteQuiz(quizId: string): void {
  try {
    const current = getSavedQuizzes();
    const updated = current.filter((q) => q.id !== quizId);
    localStorage.setItem(SAVED_QUIZZES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to delete quiz", e);
  }
}

export function getQuizAttempts(quizId?: string): QuizAttempt[] {
  try {
    const raw = localStorage.getItem(QUIZ_ATTEMPTS_KEY);
    const attempts: QuizAttempt[] = raw ? JSON.parse(raw) : [];
    if (quizId) {
      return attempts.filter((a) => a.quizId === quizId);
    }
    return attempts;
  } catch (e) {
    return [];
  }
}

export function saveQuizAttempt(attempt: QuizAttempt): void {
  try {
    const raw = localStorage.getItem(QUIZ_ATTEMPTS_KEY);
    const attempts: QuizAttempt[] = raw ? JSON.parse(raw) : [];
    const updated = [attempt, ...attempts].slice(0, 50);
    localStorage.setItem(QUIZ_ATTEMPTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save quiz attempt", e);
  }
}
