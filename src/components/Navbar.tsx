import React, { useState, useEffect, useRef } from "react";
import {
  GraduationCap,
  Sparkles,
  Wifi,
  WifiOff,
  School,
  Users,
  Laugh,
  Music,
  Disc3,
  LogOut,
  Shield,
  Smartphone,
  Tablet,
  Laptop,
  BookOpenCheck,
  Library,
  RotateCcw,
  FileDown,
  Gamepad2,
  Menu,
  X,
  ChevronDown,
  MoreHorizontal,
  Palette,
  Flame,
  Check
} from "lucide-react";
import { GeneratedQuiz, BackgroundTheme, LearningStreak, DeviceType, ClassroomUserAuth } from "../types";
import { ThemePicker } from "./ThemePicker";
import { LearningStreakCounter } from "./LearningStreakCounter";
import { getLearningStreak } from "../utils/storage";
import { PWAInstallButton } from "./PWAInstallButton";

interface NavbarProps {
  currentQuiz: GeneratedQuiz | null;
  onOpenUpload: () => void;
  onOpenSubjects?: () => void;
  onOpenHistory: () => void;
  onOpenPrint: () => void;
  onResetActiveQuiz: () => void;
  onOpenAskTutor?: () => void;
  onOpenGames?: () => void;
  onOpenJokeBreak?: () => void;
  onOpenNotes?: () => void;
  onOpenJuniorSchool?: () => void;
  totalAnswered: number;
  totalQuestions: number;
  currentTheme?: BackgroundTheme;
  onChangeTheme?: (theme: BackgroundTheme) => void;
  streak?: LearningStreak;
  deviceType?: DeviceType;
  onOpenDeviceSelector?: () => void;
  isOffline?: boolean;
  onToggleOffline?: () => void;
  currentUser?: ClassroomUserAuth | null;
  onOpenClassroomGroup?: () => void;
  onOpenGroupRoster?: () => void;
  onOpenLoginModal?: () => void;
  onOpenTeacherDashboard?: () => void;
  onOpenPrincipalPanel?: () => void;
  onOpenAdminPanel?: () => void;
  onOpenMusic?: () => void;
  isMusicPlaying?: boolean;
  onLogout?: () => void;
  onOpenImagineCreativity?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentQuiz,
  onOpenUpload,
  onOpenSubjects,
  onOpenHistory,
  onOpenPrint,
  onResetActiveQuiz,
  onOpenAskTutor,
  onOpenGames,
  onOpenJokeBreak,
  onOpenNotes,
  onOpenJuniorSchool,
  totalAnswered,
  totalQuestions,
  currentTheme = "modern-grid",
  onChangeTheme,
  streak,
  deviceType = "laptop",
  onOpenDeviceSelector,
  isOffline = false,
  onToggleOffline,
  currentUser,
  onOpenClassroomGroup,
  onOpenGroupRoster,
  onOpenLoginModal,
  onOpenTeacherDashboard,
  onOpenPrincipalPanel,
  onOpenAdminPanel,
  onOpenMusic,
  isMusicPlaying = false,
  onLogout,
  onOpenImagineCreativity
}) => {
  const isMidnight = currentTheme === "midnight";
  const [localStreak, setLocalStreak] = useState<LearningStreak>(
    () => streak || getLearningStreak()
  );

  // Dropdown states
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isPortalsMenuOpen, setIsPortalsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const moreMenuRef = useRef<HTMLDivElement>(null);
  const portalsMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Sync learning streak updates
  useEffect(() => {
    if (streak) {
      setLocalStreak(streak);
    }
  }, [streak]);

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<LearningStreak>;
      if (customEvent.detail) {
        setLocalStreak(customEvent.detail);
      } else {
        setLocalStreak(getLearningStreak());
      }
    };
    window.addEventListener("learning-streak-updated", handleUpdate);
    return () => {
      window.removeEventListener("learning-streak-updated", handleUpdate);
    };
  }, []);

  // Click outside listener for desktop/tablet dropdown menus
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setIsMoreMenuOpen(false);
      }
      if (portalsMenuRef.current && !portalsMenuRef.current.contains(e.target as Node)) {
        setIsPortalsMenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMoreMenuOpen(false);
        setIsPortalsMenuOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Helper close all menus
  const closeAllMenus = () => {
    setIsMoreMenuOpen(false);
    setIsPortalsMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-30 backdrop-blur-md border-b transition-colors duration-300 ${
        isMidnight
          ? "bg-slate-950/90 border-slate-800/80 text-slate-100"
          : "bg-white/90 border-slate-200/80 text-slate-900"
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          {/* ======================================================== */}
          {/* 1. LEFT BRAND & TITLE */}
          {/* ======================================================== */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 shrink-0">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200/50 shrink-0">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1
                  className={`text-base sm:text-lg font-black tracking-tight truncate ${
                    isMidnight ? "text-white" : "text-slate-900"
                  }`}
                >
                  TestGen
                </h1>
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60 shrink-0">
                  <Sparkles className="w-2.5 h-2.5 text-indigo-600" />
                  Practice & Notes
                </span>
              </div>
              <p
                className={`text-[11px] truncate hidden xl:block ${
                  isMidnight ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Class 1 to 12 & Universal Examination System
              </p>
            </div>

            {/* Compact Network Status Badge on Large screens */}
            {onToggleOffline && (
              <button
                type="button"
                onClick={onToggleOffline}
                className={`hidden 2xl:inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ml-1 ${
                  isOffline
                    ? "bg-amber-500 text-white border-amber-600 shadow-2xs"
                    : isMidnight
                    ? "text-emerald-300 bg-emerald-950/60 border-emerald-800"
                    : "text-emerald-800 bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
                }`}
                title={isOffline ? "Offline Mode (Click to connect Online)" : "Online Mode (Click for Offline)"}
              >
                {isOffline ? <WifiOff className="w-2.5 h-2.5" /> : <Wifi className="w-2.5 h-2.5" />}
                <span>{isOffline ? "OFF" : "LIVE"}</span>
              </button>
            )}
          </div>

          {/* ======================================================== */}
          {/* 2. CENTER-RIGHT PRIMARY ACTION BAR (RESPONSIVE NO-OVERFLOW) */}
          {/* ======================================================== */}
          <div className="flex items-center gap-1.5 sm:gap-2 justify-end min-w-0 shrink-0">
            {/* A. IMAGINE UR CREATIVITY (Key Core Feature) */}
            {onOpenImagineCreativity && (
              <button
                type="button"
                id="navbar-imagine-creativity-btn"
                onClick={() => {
                  closeAllMenus();
                  onOpenImagineCreativity();
                }}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-black rounded-xl transition-all shadow-xs cursor-pointer border bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white border-amber-300/60 hover:scale-[1.02] shrink-0"
                title="Imagine Ur Creativity: Animated physics, 3D simulations & step-by-step visual explanations"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-200 fill-current animate-pulse shrink-0" />
                <span className="hidden lg:inline">Imagine Ur Creativity</span>
                <span className="hidden sm:inline lg:hidden">Creativity</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded font-extrabold bg-slate-950/80 text-amber-300 shrink-0">
                  ✨
                </span>
              </button>
            )}

            {/* B. CLASSROOM GROUPS (70+ Students Capacity) */}
            {(onOpenGroupRoster || onOpenClassroomGroup) && (
              <button
                type="button"
                id="navbar-classroom-groups-btn"
                onClick={() => {
                  closeAllMenus();
                  if (onOpenGroupRoster) onOpenGroupRoster();
                  else if (onOpenClassroomGroup) onOpenClassroomGroup();
                }}
                className={`hidden md:inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-black rounded-xl transition-all shadow-xs cursor-pointer border shrink-0 ${
                  isMidnight
                    ? "bg-indigo-950/80 hover:bg-indigo-900/80 text-indigo-300 border-indigo-700/80"
                    : "bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border-indigo-200"
                }`}
                title="Classroom Groups: 70+ Students Capacity, Join with Teacher Code, View Roster & Class Tests"
              >
                <Users className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="hidden lg:inline">Class Groups</span>
                <span className="lg:hidden">Groups</span>
                <span className="text-[10px] px-1 py-0.2 rounded font-extrabold bg-indigo-200 text-indigo-950 shrink-0">
                  70+
                </span>
              </button>
            )}

            {/* C. INSTITUTIONAL PORTALS (ROLE-AWARE DROPDOWN OR DIRECT BADGE) */}
            {currentUser?.role === 'principal' && onOpenPrincipalPanel ? (
              <button
                type="button"
                id="navbar-principal-hub-btn"
                onClick={() => {
                  closeAllMenus();
                  onOpenPrincipalPanel();
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-black rounded-xl transition-all shadow-xs cursor-pointer border bg-gradient-to-r from-amber-900 via-purple-950 to-indigo-950 text-amber-200 border-amber-500/70 hover:scale-[1.02] ring-2 ring-amber-400/40 shrink-0"
                title="School Principal Executive Hub: Active Classrooms, Total School Count & Performance Heatmap"
              >
                <span className="text-sm">🏛️</span>
                <span className="hidden lg:inline">Principal View</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded font-extrabold bg-amber-400 text-slate-950">
                  Active
                </span>
              </button>
            ) : currentUser?.role === 'admin' && onOpenAdminPanel ? (
              <button
                type="button"
                id="navbar-admin-hub-btn"
                onClick={() => {
                  closeAllMenus();
                  onOpenAdminPanel();
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-black rounded-xl transition-all shadow-xs cursor-pointer border bg-gradient-to-r from-rose-900 via-rose-800 to-rose-950 text-rose-100 border-rose-600/70 hover:scale-[1.02] ring-2 ring-rose-400/40 shrink-0"
                title="Administrator Supreme Command Center: Power to kick anyone including Principal"
              >
                <Shield className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden lg:inline">Admin Panel</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded font-extrabold bg-rose-600 text-white">
                  Root
                </span>
              </button>
            ) : currentUser?.role === 'teacher' && onOpenTeacherDashboard ? (
              <button
                type="button"
                id="navbar-teacher-hub-btn"
                onClick={() => {
                  closeAllMenus();
                  onOpenTeacherDashboard();
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-black rounded-xl transition-all shadow-xs cursor-pointer border bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 text-purple-100 border-purple-500/70 hover:scale-[1.02] shrink-0"
                title="Faculty Staff Room: Lesson Planner, Interactive Spreadsheets & Question Banks"
              >
                <span className="text-sm">🏫</span>
                <span className="hidden lg:inline">Staff Room</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded font-extrabold bg-purple-400 text-slate-950">
                  Planner
                </span>
              </button>
            ) : (
              /* Compact "Portals ▾" Dropdown for easy 1-click access to Principal, Admin, and Teacher */
              (onOpenPrincipalPanel || onOpenAdminPanel || onOpenTeacherDashboard) && (
                <div className="relative hidden sm:block shrink-0" ref={portalsMenuRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      setIsPortalsMenuOpen(!isPortalsMenuOpen);
                    }}
                    className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-black rounded-xl transition-all shadow-xs cursor-pointer border ${
                      isMidnight
                        ? "bg-slate-900 hover:bg-slate-800 text-amber-300 border-amber-600/50"
                        : "bg-amber-50 hover:bg-amber-100 text-amber-950 border-amber-300/80"
                    }`}
                    title="Access Principal Executive View (Passcode: 93247), Admin Kick Center, or Faculty Staff Room"
                    aria-expanded={isPortalsMenuOpen}
                  >
                    <span className="text-sm">🏛️</span>
                    <span className="hidden md:inline">Portals</span>
                    <span className="text-[10px] px-1 py-0.2 rounded font-extrabold bg-amber-400 text-slate-950">
                      93247
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isPortalsMenuOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* Portals Dropdown Popover */}
                  {isPortalsMenuOpen && (
                    <div
                      className={`absolute right-0 mt-2 w-72 rounded-2xl p-2 shadow-2xl border z-50 animate-in fade-in zoom-in-95 duration-150 ${
                        isMidnight
                          ? "bg-slate-900 border-slate-700 text-white"
                          : "bg-white border-slate-200 text-slate-900 shadow-indigo-950/10"
                      }`}
                    >
                      <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Executive & Staff Portals
                        </span>
                      </div>

                      <div className="space-y-1 pt-1.5">
                        {onOpenPrincipalPanel && (
                          <button
                            type="button"
                            onClick={() => {
                              closeAllMenus();
                              onOpenPrincipalPanel();
                            }}
                            className="w-full p-2.5 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/40 text-left flex items-start gap-2.5 transition-colors cursor-pointer group"
                          >
                            <span className="text-xl shrink-0 p-1 bg-amber-100 dark:bg-amber-900/60 rounded-lg">
                              🏛️
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-300 flex items-center justify-between">
                                <span>Principal Executive Hub</span>
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-200 dark:bg-amber-800 text-amber-950 dark:text-amber-100 font-black">
                                  93247
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                Active Classrooms, Total School Count & Heatmap
                              </p>
                            </div>
                          </button>
                        )}

                        {onOpenAdminPanel && (
                          <button
                            type="button"
                            onClick={() => {
                              closeAllMenus();
                              onOpenAdminPanel();
                            }}
                            className="w-full p-2.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left flex items-start gap-2.5 transition-colors cursor-pointer group"
                          >
                            <span className="text-xl shrink-0 p-1 bg-rose-100 dark:bg-rose-900/60 rounded-lg">
                              🛡️
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-rose-700 dark:group-hover:text-rose-300 flex items-center justify-between">
                                <span>Admin Command Center</span>
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-600 text-white font-black">
                                  Kick
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                Power to kick anyone out including Principal
                              </p>
                            </div>
                          </button>
                        )}

                        {onOpenTeacherDashboard && (
                          <button
                            type="button"
                            onClick={() => {
                              closeAllMenus();
                              onOpenTeacherDashboard();
                            }}
                            className="w-full p-2.5 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-950/40 text-left flex items-start gap-2.5 transition-colors cursor-pointer group"
                          >
                            <span className="text-xl shrink-0 p-1 bg-purple-100 dark:bg-purple-900/60 rounded-lg">
                              🏫
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-300">
                                Faculty Staff Room
                              </div>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                Lesson Planner, Interactive Sheets & Banks
                              </p>
                            </div>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            )}

            {/* D. LEARNING STREAK (Inline on Wide Screens) */}
            <div className="hidden xl:block shrink-0">
              <LearningStreakCounter streak={localStreak} isMidnight={isMidnight} />
            </div>

            {/* E. USER LOGIN / PROFILE BADGE */}
            {(onOpenLoginModal || onOpenClassroomGroup) && (
              <button
                type="button"
                id="navbar-student-btn"
                onClick={() => {
                  closeAllMenus();
                  if (onOpenLoginModal) onOpenLoginModal();
                  else if (onOpenClassroomGroup) onOpenClassroomGroup();
                }}
                className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer border shrink-0 ${
                  currentUser
                    ? "bg-gradient-to-r from-[#6822CC] to-[#5016A6] text-white border-purple-400/40 hover:scale-[1.02]"
                    : "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-purple-950 border-amber-300 hover:scale-[1.02] font-black"
                }`}
                title={currentUser ? `${currentUser.role.toUpperCase()}: ${currentUser.userName}` : "Sign In or Switch Role"}
              >
                {currentUser ? (
                  <>
                    <span className="text-sm">
                      {currentUser.avatarEmoji || (currentUser.role === 'principal' ? '🏛️' : currentUser.role === 'teacher' ? '👨‍🏫' : currentUser.role === 'admin' ? '🛡️' : '🧑‍🎓')}
                    </span>
                    <span className="font-black truncate max-w-[85px] sm:max-w-[100px] text-amber-300">
                      {currentUser.userName.split(' ')[0]}
                    </span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-white/20 text-white font-black hidden lg:inline uppercase">
                      {currentUser.role}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-xs">⚡</span>
                    <span className="font-black tracking-wide hidden sm:inline">Login / Portal</span>
                    <span className="font-black sm:hidden">Login</span>
                  </>
                )}
              </button>
            )}

            {/* F. MORE TOOLS & CONTROLS DROPDOWN (DESKTOP & TABLET: NEVER OVERFLOWS) */}
            <div className="relative hidden sm:block shrink-0" ref={moreMenuRef}>
              <button
                type="button"
                id="navbar-more-tools-btn"
                onClick={() => {
                  setIsPortalsMenuOpen(false);
                  setIsMoreMenuOpen(!isMoreMenuOpen);
                }}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-black rounded-xl transition-all border shadow-2xs cursor-pointer ${
                  isMusicPlaying
                    ? "bg-emerald-500 text-slate-950 border-emerald-400 ring-2 ring-emerald-400/40"
                    : isMidnight
                    ? "text-slate-200 hover:text-white bg-slate-900 border-slate-700 hover:bg-slate-800"
                    : "text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border-slate-200"
                }`}
                title="More Tools: Music Corner, Study Notes, Topics, Games, Themes, and Settings"
                aria-expanded={isMoreMenuOpen}
              >
                {isMusicPlaying ? (
                  <Disc3 className="w-3.5 h-3.5 animate-spin text-slate-950" style={{ animationDuration: '3s' }} />
                ) : (
                  <MoreHorizontal className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                )}
                <span className="hidden lg:inline">{isMusicPlaying ? "Playing" : "More"}</span>
                {isMusicPlaying ? (
                  <span className="text-[9px] px-1 py-0.2 rounded font-black bg-slate-950 text-emerald-300">
                    🎵
                  </span>
                ) : isOffline ? (
                  <span className="text-[9px] px-1 py-0.2 rounded font-black bg-amber-500 text-white">
                    OFF
                  </span>
                ) : (
                  <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isMoreMenuOpen ? "rotate-180" : ""}`} />
                )}
              </button>

              {/* More Tools Dropdown Menu */}
              {isMoreMenuOpen && (
                <div
                  className={`absolute right-0 mt-2 w-80 rounded-3xl p-3 shadow-2xl border z-50 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] overflow-y-auto ${
                    isMidnight
                      ? "bg-slate-900 border-slate-700 text-white shadow-black/60"
                      : "bg-white border-slate-200 text-slate-900 shadow-indigo-950/15"
                  }`}
                >
                  {/* Category 1: Study Tools */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 block">
                      Study & Revision Library
                    </span>

                    {onOpenSubjects && (
                      <button
                        type="button"
                        onClick={() => {
                          closeAllMenus();
                          onOpenSubjects();
                        }}
                        className="w-full px-2.5 py-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-slate-800 text-left flex items-center justify-between text-xs font-bold transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Library className="w-4 h-4 text-indigo-600" />
                          <span>All Topics Catalog</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-900 font-black">
                          100+
                        </span>
                      </button>
                    )}

                    {onOpenNotes && (
                      <button
                        type="button"
                        onClick={() => {
                          closeAllMenus();
                          onOpenNotes();
                        }}
                        className="w-full px-2.5 py-2 rounded-xl hover:bg-amber-50 dark:hover:bg-slate-800 text-left flex items-center justify-between text-xs font-bold transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <BookOpenCheck className="w-4 h-4 text-amber-600" />
                          <span>Study Notes & Flashcards</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-bold">
                          Notes
                        </span>
                      </button>
                    )}

                    {onOpenGames && (
                      <button
                        type="button"
                        onClick={() => {
                          closeAllMenus();
                          onOpenGames();
                        }}
                        className="w-full px-2.5 py-2 rounded-xl hover:bg-purple-50 dark:hover:bg-slate-800 text-left flex items-center justify-between text-xs font-bold transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Gamepad2 className="w-4 h-4 text-purple-600" />
                          <span>Interactive Boss Battle Games</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-100 text-purple-900 font-bold">
                          Boss
                        </span>
                      </button>
                    )}

                    {onOpenJokeBreak && (
                      <button
                        type="button"
                        onClick={() => {
                          closeAllMenus();
                          onOpenJokeBreak();
                        }}
                        className="w-full px-2.5 py-2 rounded-xl hover:bg-pink-50 dark:hover:bg-slate-800 text-left flex items-center gap-2 text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Laugh className="w-4 h-4 text-pink-600" />
                        <span>Take a Quick Joke Break 😄</span>
                      </button>
                    )}

                    {currentQuiz && (
                      <div className="pt-1 border-t border-slate-100 dark:border-slate-800 space-y-1">
                        <button
                          type="button"
                          onClick={() => {
                            closeAllMenus();
                            onResetActiveQuiz();
                          }}
                          className="w-full px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left flex items-center gap-2 text-xs font-medium cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                          <span>Restart Active Quiz Answers</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            closeAllMenus();
                            onOpenPrint();
                          }}
                          className="w-full px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left flex items-center gap-2 text-xs font-medium cursor-pointer"
                        >
                          <FileDown className="w-3.5 h-3.5 text-slate-500" />
                          <span>Print or Save Quiz Sheet</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Category 2: Utilities & Media */}
                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 block">
                      Focus Audio & Environment
                    </span>

                    {onOpenMusic && (
                      <button
                        type="button"
                        onClick={() => {
                          closeAllMenus();
                          onOpenMusic();
                        }}
                        className={`w-full px-2.5 py-2 rounded-xl text-left flex items-center justify-between text-xs font-bold transition-colors cursor-pointer ${
                          isMusicPlaying
                            ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200"
                            : "hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Disc3 className={`w-4 h-4 ${isMusicPlaying ? 'animate-spin text-emerald-600' : 'text-slate-500'}`} />
                          <span>Music Corner Study Playlist</span>
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-black ${isMusicPlaying ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                          {isMusicPlaying ? 'PLAYING 🎵' : 'OPEN'}
                        </span>
                      </button>
                    )}

                    {onToggleOffline && (
                      <button
                        type="button"
                        onClick={onToggleOffline}
                        className="w-full px-2.5 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left flex items-center justify-between text-xs font-bold transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          {isOffline ? <WifiOff className="w-4 h-4 text-amber-600" /> : <Wifi className="w-4 h-4 text-emerald-600" />}
                          <span>Network Offline Mode</span>
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-black ${isOffline ? 'bg-amber-500 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                          {isOffline ? 'OFFLINE' : 'ONLINE'}
                        </span>
                      </button>
                    )}

                    {onOpenDeviceSelector && (
                      <button
                        type="button"
                        onClick={() => {
                          closeAllMenus();
                          onOpenDeviceSelector();
                        }}
                        className="w-full px-2.5 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left flex items-center justify-between text-xs font-bold transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          {deviceType === 'phone' ? <Smartphone className="w-4 h-4 text-indigo-600" /> : deviceType === 'tablet' ? <Tablet className="w-4 h-4 text-purple-600" /> : <Laptop className="w-4 h-4 text-blue-600" />}
                          <span>Device View Simulator</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 capitalize font-bold">
                          {deviceType}
                        </span>
                      </button>
                    )}

                    {/* Theme Picker Container inside dropdown */}
                    {onChangeTheme && (
                      <div className="pt-1.5 px-2.5 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                          <Palette className="w-4 h-4 text-indigo-500" />
                          <span>App Theme</span>
                        </span>
                        <ThemePicker
                          currentTheme={currentTheme}
                          onSelectTheme={onChangeTheme}
                        />
                      </div>
                    )}

                    <div className="pt-2 px-1 flex items-center justify-between gap-2">
                      <PWAInstallButton />
                      {currentUser && onLogout && (
                        <button
                          type="button"
                          onClick={() => {
                            closeAllMenus();
                            onLogout();
                          }}
                          className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 border border-rose-200 transition-colors cursor-pointer ml-auto"
                        >
                          <LogOut className="w-3.5 h-3.5 text-rose-500" />
                          <span>Sign Out</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* G. MOBILE HAMBURGER / DRAWER BUTTON (VISIBLE ON MOBILE ONLY < 768px) */}
            <button
              type="button"
              id="navbar-mobile-toggle-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`sm:hidden p-2 rounded-xl transition-all border cursor-pointer shrink-0 relative ${
                isMobileMenuOpen
                  ? "bg-slate-900 text-white border-slate-700"
                  : isMidnight
                  ? "bg-slate-900 text-slate-200 border-slate-800"
                  : "bg-slate-100 text-slate-700 border-slate-200"
              }`}
              title="Toggle mobile menu"
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
              {isMusicPlaying && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. MOBILE MENU SLIDE-DOWN DRAWER (MOBILE SCREENS ONLY) */}
      {/* ======================================================== */}
      {isMobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className={`sm:hidden border-t max-h-[82vh] overflow-y-auto p-4 space-y-4 animate-in slide-in-from-top-2 duration-200 shadow-2xl ${
            isMidnight
              ? "bg-slate-950/98 border-slate-800 text-white"
              : "bg-white/98 border-slate-200 text-slate-900"
          }`}
        >
          {/* Section 1: Core Learning Features */}
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block px-1">
              🌟 Core Learning Hub
            </span>

            {onOpenImagineCreativity && (
              <button
                type="button"
                onClick={() => {
                  closeAllMenus();
                  onOpenImagineCreativity();
                }}
                className="w-full p-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 text-white font-black text-xs flex items-center justify-between shadow-md cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-yellow-200 fill-current animate-pulse" />
                  <span>Imagine Ur Creativity Lab</span>
                </div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-950/80 text-amber-300">
                  Animate ✨
                </span>
              </button>
            )}

            {(onOpenGroupRoster || onOpenClassroomGroup) && (
              <button
                type="button"
                onClick={() => {
                  closeAllMenus();
                  if (onOpenGroupRoster) onOpenGroupRoster();
                  else if (onOpenClassroomGroup) onOpenClassroomGroup();
                }}
                className={`w-full p-3 rounded-2xl border text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                  isMidnight
                    ? "bg-slate-900 border-slate-800 text-indigo-300"
                    : "bg-indigo-50/80 border-indigo-200 text-indigo-950"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>Classroom Groups & Tests</span>
                </div>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-200 text-indigo-950">
                  70+ Seats
                </span>
              </button>
            )}
          </div>

          {/* Section 2: Executive & Staff Portals */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block px-1">
              🏛️ Staff & Executive Portals
            </span>

            {onOpenPrincipalPanel && (
              <button
                type="button"
                onClick={() => {
                  closeAllMenus();
                  onOpenPrincipalPanel();
                }}
                className="w-full p-2.5 rounded-xl border border-amber-200 dark:border-amber-800/80 bg-amber-50/80 dark:bg-amber-950/30 text-amber-950 dark:text-amber-200 text-xs font-bold flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">🏛️</span>
                  <span>School Principal Executive Hub</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-800 text-amber-950 dark:text-amber-100 font-black">
                  Passcode 93247
                </span>
              </button>
            )}

            {onOpenAdminPanel && (
              <button
                type="button"
                onClick={() => {
                  closeAllMenus();
                  onOpenAdminPanel();
                }}
                className="w-full p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/80 bg-rose-50/80 dark:bg-rose-950/30 text-rose-950 dark:text-rose-200 text-xs font-bold flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-rose-600" />
                  <span>Administrator Supreme Kick Center</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-rose-600 text-white font-black">
                  Kick Controls
                </span>
              </button>
            )}

            {onOpenTeacherDashboard && (
              <button
                type="button"
                onClick={() => {
                  closeAllMenus();
                  onOpenTeacherDashboard();
                }}
                className="w-full p-2.5 rounded-xl border border-purple-200 dark:border-purple-800/80 bg-purple-50/80 dark:bg-purple-950/30 text-purple-950 dark:text-purple-200 text-xs font-bold flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <School className="w-4 h-4 text-purple-600" />
                  <span>Faculty Staff Room & Planner</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-200 dark:bg-purple-800 text-purple-950 dark:text-purple-100 font-bold">
                  Sheets
                </span>
              </button>
            )}
          </div>

          {/* Section 3: Study Tools */}
          <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block px-1">
              📚 Study Library & Revision
            </span>

            {onOpenSubjects && (
              <button
                type="button"
                onClick={() => {
                  closeAllMenus();
                  onOpenSubjects();
                }}
                className="w-full p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 text-left flex items-center justify-between text-xs font-bold cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Library className="w-4 h-4 text-indigo-600" />
                  <span>All Curriculum Topics (100+)</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-900 dark:text-indigo-200 font-bold">
                  Explore
                </span>
              </button>
            )}

            {onOpenNotes && (
              <button
                type="button"
                onClick={() => {
                  closeAllMenus();
                  onOpenNotes();
                }}
                className="w-full p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 text-left flex items-center justify-between text-xs font-bold cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <BookOpenCheck className="w-4 h-4 text-amber-600" />
                  <span>Study Notes & Flashcards</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-bold">
                  Notes
                </span>
              </button>
            )}

            {onOpenGames && (
              <button
                type="button"
                onClick={() => {
                  closeAllMenus();
                  onOpenGames();
                }}
                className="w-full p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 text-left flex items-center justify-between text-xs font-bold cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4 text-purple-600" />
                  <span>Boss Battle Quiz Games</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/60 text-purple-900 dark:text-purple-200 font-bold">
                  Play
                </span>
              </button>
            )}

            {onOpenJokeBreak && (
              <button
                type="button"
                onClick={() => {
                  closeAllMenus();
                  onOpenJokeBreak();
                }}
                className="w-full p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 text-left flex items-center gap-2 text-xs font-bold cursor-pointer"
              >
                <Laugh className="w-4 h-4 text-pink-600" />
                <span>Take a Quick Joke Break 😄</span>
              </button>
            )}

            {currentQuiz && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    closeAllMenus();
                    onResetActiveQuiz();
                  }}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-center text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restart Answers</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    closeAllMenus();
                    onOpenPrint();
                  }}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-center text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Print / Save</span>
                </button>
              </div>
            )}
          </div>

          {/* Section 4: Utilities & System */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block px-1">
              ⚙️ Settings & Audio
            </span>

            {onOpenMusic && (
              <button
                type="button"
                onClick={() => {
                  closeAllMenus();
                  onOpenMusic();
                }}
                className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between text-xs font-bold cursor-pointer ${
                  isMusicPlaying
                    ? "bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow-sm"
                    : "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Disc3 className={`w-4 h-4 ${isMusicPlaying ? 'animate-spin text-slate-950' : 'text-slate-500'}`} />
                  <span>Study Music Corner</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded font-black ${isMusicPlaying ? 'bg-slate-950 text-emerald-300' : 'bg-slate-200 dark:bg-slate-800'}`}>
                  {isMusicPlaying ? 'LOOPING 🎵' : 'OPEN'}
                </span>
              </button>
            )}

            <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                Network Mode
              </span>
              {onToggleOffline && (
                <button
                  type="button"
                  onClick={onToggleOffline}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition-colors cursor-pointer ${
                    isOffline
                      ? "bg-amber-500 text-white"
                      : "bg-emerald-600 text-white"
                  }`}
                >
                  {isOffline ? "Offline Mode (Active)" : "Online Mode (Connected)"}
                </button>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-indigo-500" />
                <span>Theme</span>
              </span>
              {onChangeTheme && (
                <ThemePicker
                  currentTheme={currentTheme}
                  onSelectTheme={onChangeTheme}
                />
              )}
            </div>

            <div className="flex items-center justify-between gap-2 pt-2">
              <PWAInstallButton />
              {currentUser && onLogout && (
                <button
                  type="button"
                  onClick={() => {
                    closeAllMenus();
                    onLogout();
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 border border-rose-200 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
