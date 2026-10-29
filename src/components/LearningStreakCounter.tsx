import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Flame,
  CheckCircle2,
  Calendar,
  Trophy,
  X,
  Sparkles,
  Clock
} from "lucide-react";
import { LearningStreak } from "../types";
import { getLocalTodayDateString } from "../utils/storage";

interface LearningStreakCounterProps {
  streak: LearningStreak;
  isMidnight?: boolean;
}

export const LearningStreakCounter: React.FC<LearningStreakCounterProps> = ({
  streak,
  isMidnight = false
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Compute last 7 days
  const todayStr = getLocalTodayDateString();
  const pastSevenDays = React.useMemo(() => {
    const days: Array<{
      dateStr: string;
      dayLabel: string;
      isToday: boolean;
      isCompleted: boolean;
    }> = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;
      const dayLabel = d.toLocaleDateString("en-US", { weekday: "narrow" });
      const isToday = dateStr === todayStr;
      const isCompleted = streak.history?.includes(dateStr) || (isToday && streak.completedToday);

      days.push({
        dateStr,
        dayLabel,
        isToday,
        isCompleted: Boolean(isCompleted)
      });
    }
    return days;
  }, [streak.history, streak.completedToday, todayStr]);

  const hasStreak = streak.count > 0;
  const isCompletedToday = streak.completedToday;

  const modalContent = isOpen ? (
    <div
      id="learning-streak-modal-overlay"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      onClick={() => setIsOpen(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Daily Practice Streak"
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-sm sm:max-w-md rounded-3xl shadow-2xl border p-4 sm:p-6 my-auto backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200 max-h-[88vh] overflow-y-auto ${
          isMidnight
            ? "bg-slate-950/98 border-slate-800 text-slate-100 shadow-slate-950/90"
            : "bg-white/98 border-amber-200 text-slate-900 shadow-amber-900/10"
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                hasStreak
                  ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white"
                  : isMidnight
                  ? "bg-slate-800 text-slate-400"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              <Flame className={`w-6 h-6 ${hasStreak ? "fill-white" : ""}`} />
            </div>
            <div>
              <h3 className="text-base font-black flex items-center gap-2">
                Daily Streak
                <span className="text-[10px] px-2 py-0.5 rounded-full font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 uppercase tracking-wider">
                  Daily Goal
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Days in a row you practiced
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Streak Counter Display */}
        <div className="my-4 p-4 rounded-2xl bg-gradient-to-br from-amber-50/90 via-orange-50/60 to-amber-50/40 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-slate-900 border border-amber-200/80 dark:border-amber-900/50 text-center shadow-xs">
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-5xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
              {streak.count}
            </span>
            <span className="text-base font-extrabold text-amber-900 dark:text-amber-300">
              {streak.count === 1 ? "Day in a Row 🔥" : "Days in a Row 🔥"}
            </span>
          </div>

          {/* Status message in simple words */}
          <p className="text-xs sm:text-sm mt-2 font-medium text-slate-700 dark:text-slate-300">
            {isCompletedToday ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Great job! You finished today's practice.
              </span>
            ) : hasStreak ? (
              <span className="inline-flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-bold bg-amber-100/70 dark:bg-amber-950/60 px-3 py-1 rounded-full border border-amber-300/80 dark:border-amber-800">
                <Clock className="w-4 h-4 text-amber-600" />
                Practice a quiz today to make it {streak.count + 1} days!
              </span>
            ) : (
              <span className="text-slate-600 dark:text-slate-400">
                Practice your first quiz today to start your streak!
              </span>
            )}
          </p>
        </div>

        {/* Last 7 Days Mini Tracker */}
        <div className="space-y-2 pb-3">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold px-1">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              This Week
            </span>
            <span className={isCompletedToday ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>
              {isCompletedToday ? "✓ Done Today" : "⏳ Not Done Yet"}
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 pt-1">
            {pastSevenDays.map((day, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center gap-1 text-center"
              >
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  {day.dayLabel}
                </span>
                <div
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                    day.isCompleted
                      ? "bg-emerald-500 text-white shadow-xs shadow-emerald-500/30"
                      : day.isToday
                      ? "border-2 border-dashed border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-50/70 dark:bg-amber-950/30"
                      : isMidnight
                      ? "bg-slate-800 text-slate-600 border border-slate-700"
                      : "bg-slate-100 text-slate-400 border border-slate-200"
                  }`}
                  title={`${day.dateStr}: ${
                    day.isCompleted
                      ? "Practice Completed"
                      : day.isToday
                      ? "Practice needed today"
                      : "No practice recorded"
                  }`}
                >
                  {day.isCompleted ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : day.isToday ? (
                    <Flame className="w-4 h-4 text-amber-500" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Records & Stats */}
        <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2.5 text-center text-xs">
          <div
            className={`p-3 rounded-2xl border ${
              isMidnight
                ? "bg-slate-900 border-slate-800"
                : "bg-slate-50 border-slate-100"
            }`}
          >
            <div className="flex items-center justify-center gap-1.5 text-amber-600 dark:text-amber-400 text-[11px] font-bold uppercase tracking-wider">
              <Trophy className="w-3.5 h-3.5" />
              Longest Streak
            </div>
            <p className="text-xl font-black text-slate-800 dark:text-slate-100 mt-0.5">
              {streak.bestStreak || streak.count}{" "}
              <span className="text-xs font-medium text-slate-500">
                {streak.bestStreak === 1 ? "Day" : "Days"}
              </span>
            </p>
          </div>

          <div
            className={`p-3 rounded-2xl border ${
              isMidnight
                ? "bg-slate-900 border-slate-800"
                : "bg-slate-50 border-slate-100"
            }`}
          >
            <div className="flex items-center justify-center gap-1.5 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Total Days Done
            </div>
            <p className="text-xl font-black text-slate-800 dark:text-slate-100 mt-0.5">
              {streak.history?.length || (streak.completedToday ? 1 : 0)}{" "}
              <span className="text-xs font-medium text-slate-500">
                Days
              </span>
            </p>
          </div>
        </div>

        {/* Friendly Motivational Footer */}
        <div className="mt-3.5 p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-200 flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            Practicing 5 minutes every day helps you remember!
          </span>
          <button
            onClick={() => setIsOpen(false)}
            className="px-3 py-1 bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 font-bold rounded-lg border border-indigo-200 dark:border-indigo-700 text-xs shadow-2xs hover:bg-indigo-50 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="relative inline-block">
      {/* Navbar Streak Button */}
      <button
        id="navbar-learning-streak-btn"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={`Daily Streak: ${streak.count} days`}
        title={`Daily Streak: ${streak.count} day${
          streak.count === 1 ? "" : "s"
        }. ${isCompletedToday ? "Completed today!" : "Practice today to keep it going!"}`}
        className={`group relative inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border cursor-pointer select-none ${
          hasStreak
            ? isCompletedToday
              ? isMidnight
                ? "bg-amber-950/60 text-amber-300 border-amber-500/40 hover:bg-amber-900/60 shadow-xs shadow-amber-900/20"
                : "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-900 border-amber-300 hover:from-amber-100 hover:to-orange-100 shadow-xs"
              : isMidnight
              ? "bg-slate-900 text-amber-400/90 border-slate-700 hover:bg-slate-800"
              : "bg-amber-50/70 text-amber-800 border-amber-200 hover:bg-amber-100/70"
            : isMidnight
            ? "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800"
            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-800"
        }`}
      >
        {/* Flame Icon */}
        <div className="relative flex items-center justify-center shrink-0">
          <Flame
            className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
              hasStreak
                ? isCompletedToday
                  ? "text-orange-500 fill-orange-500 animate-pulse drop-shadow-[0_0_6px_rgba(249,115,22,0.6)]"
                  : "text-amber-500 fill-amber-500/80"
                : "text-slate-400"
            }`}
          />
          {isCompletedToday && (
            <span
              className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white"
              title="Today's goal completed"
            />
          )}
        </div>

        {/* Counter number and text */}
        <div className="flex items-center gap-1">
          <span
            id="navbar-streak-count"
            className={`font-black text-xs sm:text-sm tracking-tight ${
              hasStreak
                ? isMidnight
                  ? "text-amber-300"
                  : "text-amber-900"
                : isMidnight
                ? "text-slate-400"
                : "text-slate-600"
            }`}
          >
            {streak.count}
          </span>
          <span className="hidden sm:inline font-bold">
            {streak.count === 1 ? "Day" : "Days"}
          </span>
          <span className="hidden lg:inline text-[11px] font-medium opacity-80">
            Streak
          </span>
        </div>

        {/* Done indicator */}
        {hasStreak && isCompletedToday && (
          <span className="hidden md:inline-flex items-center text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            ✓ Done
          </span>
        )}
      </button>

      {/* Render modal directly in document.body via Portal so it is NEVER cut off */}
      {typeof document !== "undefined" && modalContent && createPortal(modalContent, document.body)}
    </div>
  );
};
