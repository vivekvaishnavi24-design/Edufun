import React from "react";
import {
  GraduationCap,
  PlusCircle,
  History,
  FileDown,
  RotateCcw,
  Sparkles,
  BookOpenCheck,
  Gamepad2,
  Smile,
  Library,
  Smartphone,
  Laptop,
  Tablet,
  Wifi,
  WifiOff,
  School,
  Users,
  Laugh,
  Music,
  Disc3,
  LogOut,
  Shield
} from "lucide-react";
import { GeneratedQuiz, BackgroundTheme, LearningStreak, DeviceType, ClassroomUserAuth } from "../types";
import { ThemePicker } from "./ThemePicker";
import { LearningStreakCounter } from "./LearningStreakCounter";
import { getLearningStreak } from "../utils/storage";
import { PWAInstallButton } from "./PWAInstallButton";
import { UserAvatar } from "./UserAvatar";

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
  const [localStreak, setLocalStreak] = React.useState<LearningStreak>(
    () => streak || getLearningStreak()
  );

  React.useEffect(() => {
    if (streak) {
      setLocalStreak(streak);
    }
  }, [streak]);

  React.useEffect(() => {
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

  const isPhoneView = deviceType === "phone";

  return (
    <header
      className={`sticky top-0 z-30 backdrop-blur-md border-b transition-colors duration-300 ${
        isMidnight
          ? "bg-slate-950/80 border-slate-800/80 text-slate-100"
          : "bg-white/85 border-slate-200/80 text-slate-900"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200/50 shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1
                  className={`text-base sm:text-lg font-black tracking-tight truncate ${
                    isMidnight ? "text-white" : "text-slate-900"
                  }`}
                >
                  TestGen
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 shrink-0">
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                  Practice & Notes
                </span>
              </div>
              <p
                className={`text-xs truncate hidden sm:block ${
                  isMidnight ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Offline-ready tests, Class 1 to 12 & Universal Examination System
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Online / Offline Mode Toggle */}
            {onToggleOffline && (
              <button
                id="navbar-offline-toggle-btn"
                onClick={onToggleOffline}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-xl transition-all border shadow-2xs cursor-pointer ${
                  isOffline
                    ? "bg-amber-500 text-white border-amber-600 shadow-amber-500/25 ring-2 ring-amber-400/40"
                    : isMidnight
                    ? "text-emerald-300 bg-emerald-950/60 border-emerald-800/80 hover:bg-emerald-900/60"
                    : "text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border-emerald-200"
                }`}
                title={isOffline ? "Currently in Offline Mode (Click to switch to Online)" : "Currently in Online Mode (Click to switch to Offline)"}
              >
                {isOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isOffline ? "Offline" : "Online"}</span>
                <span className={`text-[10px] px-1 py-0.2 rounded font-black ${isOffline ? "bg-amber-700 text-amber-100" : "bg-emerald-200 text-emerald-900"}`}>
                  {isOffline ? "OFF" : "LIVE"}
                </span>
              </button>
            )}

            {/* DEDICATED CLASSROOM GROUPS BUTTON (70+ Students Capacity) */}
            {(onOpenGroupRoster || onOpenClassroomGroup) && (
              <button
                id="navbar-classroom-groups-btn"
                onClick={onOpenGroupRoster || onOpenClassroomGroup}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-xl transition-all shadow-xs cursor-pointer border ${
                  isMidnight
                    ? "bg-indigo-950/80 hover:bg-indigo-900/80 text-indigo-300 border-indigo-700/80"
                    : "bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border-indigo-200"
                }`}
                title="Classroom Groups: 70+ Students Capacity, Join with Teacher Code, View Roster & Class Tests"
              >
                <Users className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>👥 Class Groups</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded font-extrabold bg-indigo-200 text-indigo-950">
                  70+ Seats
                </span>
              </button>
            )}

            {/* IMAGINE UR CREATIVITY ANIMATED VISUALIZER BUTTON */}
            {onOpenImagineCreativity && (
              <button
                id="navbar-imagine-creativity-btn"
                onClick={onOpenImagineCreativity}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-xl transition-all shadow-md cursor-pointer border bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white border-amber-300/60 hover:scale-[1.03]"
                title="Imagine Ur Creativity: Tell us any question and see it animated step-by-step with interactive simulations (like water cycle, circuits & more)!"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-200 fill-current animate-pulse" />
                <span className="hidden sm:inline">Imagine Ur Creativity</span>
                <span className="sm:hidden">Creativity ✨</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded font-extrabold bg-slate-950/80 text-amber-300">
                  Animate
                </span>
              </button>
            )}

            {/* 1. PRINCIPAL EXECUTIVE PANEL BUTTON (Always 1-Click Accessible!) */}
            {onOpenPrincipalPanel && (
              <button
                id="navbar-principal-hub-btn"
                onClick={onOpenPrincipalPanel}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-xl transition-all shadow-xs cursor-pointer border ${
                  currentUser?.role === 'principal'
                    ? "bg-gradient-to-r from-amber-900 via-purple-950 to-indigo-950 text-amber-200 border-amber-500/70 hover:scale-[1.02] ring-2 ring-amber-400/40"
                    : isMidnight
                    ? "bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border-amber-700/60"
                    : "bg-gradient-to-r from-amber-50 via-amber-100 to-orange-50 hover:from-amber-100 hover:to-orange-100 text-amber-950 border-amber-300"
                }`}
                title="School Principal Executive Hub: Active Classrooms, Total Student Count (228/300) & Performance Heatmaps (Passcode: 93247)"
              >
                <span className="text-sm">🏛️</span>
                <span className="hidden sm:inline">Principal View</span>
                <span className="sm:hidden">Principal</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded font-extrabold bg-amber-400 text-slate-950">
                  {currentUser?.role === 'principal' ? 'Active' : '93247'}
                </span>
              </button>
            )}

            {/* 2. MASTER ADMIN COMMAND CENTER BUTTON (Always 1-Click Accessible!) */}
            {onOpenAdminPanel && (
              <button
                id="navbar-admin-hub-btn"
                onClick={onOpenAdminPanel}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-xl transition-all shadow-xs cursor-pointer border ${
                  currentUser?.role === 'admin'
                    ? "bg-gradient-to-r from-rose-900 via-rose-800 to-rose-950 text-rose-100 border-rose-600/70 hover:scale-[1.02] ring-2 ring-rose-400/40"
                    : isMidnight
                    ? "bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border-rose-800/60"
                    : "bg-rose-50 hover:bg-rose-100 text-rose-900 border-rose-200"
                }`}
                title="Administrator Supreme Command Center: Kick Management (can kick anyone including Principal), Faculty Groups & Governance"
              >
                <Shield className="w-3.5 h-3.5 text-rose-500" />
                <span className="hidden sm:inline">Admin Panel</span>
                <span className="sm:hidden">Admin</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded font-extrabold bg-rose-600 text-white">
                  {currentUser?.role === 'admin' ? 'Root' : 'Kick'}
                </span>
              </button>
            )}

            {/* 3. TEACHER STAFF ROOM BUTTON (When logged in as teacher) */}
            {currentUser?.role === 'teacher' && onOpenTeacherDashboard && (
              <button
                id="navbar-faculty-hub-btn"
                onClick={onOpenTeacherDashboard}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-xl transition-all shadow-xs cursor-pointer border bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 text-purple-100 border-purple-500/70 hover:scale-[1.02]"
                title="Faculty Staff Room: Lesson Planner, Interactive Excel Sheets & Question Banks"
              >
                <span className="text-sm">🏫</span>
                <span className="hidden sm:inline">Faculty Staff Room</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded font-extrabold bg-purple-400 text-slate-950">
                  Planner
                </span>
              </button>
            )}

            {/* Student / Teacher / Principal / Admin Login & Profile Button */}
            {(onOpenLoginModal || onOpenClassroomGroup) && (
              <button
                id="navbar-student-btn"
                onClick={onOpenLoginModal || onOpenClassroomGroup}
                className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer border ${
                  currentUser
                    ? "bg-gradient-to-r from-[#6822CC] to-[#5016A6] text-white border-purple-400/40 hover:scale-[1.02]"
                    : "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-purple-950 border-amber-300 hover:scale-[1.02] font-black"
                }`}
                title={currentUser ? `${currentUser.role.toUpperCase()}: ${currentUser.userName}` : "Student / Teacher / Principal / Admin Login"}
              >
                {currentUser ? (
                  <>
                    <span className="text-base">
                      {currentUser.avatarEmoji || (currentUser.role === 'principal' ? '🏛️' : currentUser.role === 'teacher' ? '👨‍🏫' : currentUser.role === 'admin' ? '🛡️' : '🧑‍🎓')}
                    </span>
                    <span className="font-black truncate max-w-[110px] text-amber-300">
                      {currentUser.userName}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/20 text-white font-black hidden sm:inline uppercase">
                      {currentUser.role}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-sm">⚡</span>
                    <span className="font-black tracking-wide">Login / Portal</span>
                  </>
                )}
              </button>
            )}

            {/* Logout Button if signed in */}
            {currentUser && onLogout && (
              <button
                id="navbar-logout-btn"
                onClick={onLogout}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-xl transition-all border shadow-2xs cursor-pointer ${
                  isMidnight
                    ? "text-rose-300 bg-rose-950/60 border-rose-900/70 hover:bg-rose-900/60"
                    : "text-rose-700 bg-rose-50 hover:bg-rose-100 border-rose-200"
                }`}
                title="Sign out of student profile"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-500" />
                <span className="hidden lg:inline">Sign Out</span>
              </button>
            )}

            {/* Music Corner Button */}
            {onOpenMusic && (
              <button
                id="navbar-music-btn"
                onClick={onOpenMusic}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-xl transition-all border shadow-2xs cursor-pointer ${
                  isMusicPlaying
                    ? "bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow-emerald-500/25 ring-2 ring-emerald-400/40"
                    : isMidnight
                    ? "text-emerald-300 bg-emerald-950/60 border-emerald-800/80 hover:bg-emerald-900/60"
                    : "text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border-emerald-200"
                }`}
                title="Music Corner: Play and loop complete study songs without stopping"
              >
                <Disc3 className={`w-3.5 h-3.5 ${isMusicPlaying ? 'animate-spin text-slate-950' : 'text-emerald-600'}`} style={{ animationDuration: '3s' }} />
                <span className="hidden sm:inline">Music Corner 🎵</span>
                {isMusicPlaying && (
                  <span className="text-[10px] px-1 py-0.2 rounded font-black bg-slate-950 text-emerald-300">
                    PLAY
                  </span>
                )}
              </button>
            )}

            {/* Device Selector Button */}
            {onOpenDeviceSelector && (
              <button
                id="navbar-device-btn"
                onClick={onOpenDeviceSelector}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-xl transition-colors border shadow-2xs cursor-pointer ${
                  isMidnight
                    ? "text-slate-200 hover:text-white bg-slate-800 border-slate-700 hover:bg-slate-700"
                    : "text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border-slate-200"
                }`}
                title="Change device experience: Phone (Slider view), Laptop, or Tablet"
              >
                {deviceType === 'phone' ? <Smartphone className="w-3.5 h-3.5 text-indigo-600" /> : deviceType === 'tablet' ? <Tablet className="w-3.5 h-3.5 text-purple-600" /> : <Laptop className="w-3.5 h-3.5 text-blue-600" />}
                <span className="capitalize hidden md:inline">{deviceType === 'phone' ? 'Phone (Slider)' : deviceType}</span>
              </button>
            )}

            {/* PWA Install Button */}
            <PWAInstallButton />

            {/* When NOT in phone view, keep the standard multi-button layout! */}
            {!isPhoneView && (
              <>
                {/* Learning Streak Counter */}
                <LearningStreakCounter streak={localStreak} isMidnight={isMidnight} />

                {onChangeTheme && (
                  <ThemePicker
                    currentTheme={currentTheme}
                    onSelectTheme={onChangeTheme}
                  />
                )}

                {onOpenNotes && (
                  <button
                    id="navbar-notes-btn"
                    onClick={onOpenNotes}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors border shadow-2xs cursor-pointer ${
                      isMidnight
                        ? "text-amber-300 hover:text-white bg-amber-950/60 border-amber-800/80 hover:bg-amber-900/60"
                        : "text-amber-800 hover:text-amber-950 bg-amber-50 hover:bg-amber-100 border-amber-200"
                    }`}
                    title="Create simple study notes and flashcards"
                  >
                    <BookOpenCheck className="w-3.5 h-3.5 text-amber-600" />
                    <span className="hidden sm:inline">Study Notes</span>
                    <span className="text-[10px] px-1 py-0.2 rounded bg-amber-200 text-amber-900 font-black">
                      Notes
                    </span>
                  </button>
                )}

                {onOpenSubjects && (
                  <button
                    id="navbar-subjects-btn"
                    onClick={onOpenSubjects}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors border shadow-2xs ${
                      isMidnight
                        ? "text-indigo-300 hover:text-white bg-indigo-950/60 border-indigo-800/80 hover:bg-indigo-900/60"
                        : "text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border-indigo-200"
                    }`}
                    title="Browse topics across science, math, history and more"
                  >
                    <Library className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="hidden sm:inline">All Topics</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-200/70 text-indigo-900 font-extrabold hidden md:inline">
                      100+
                    </span>
                  </button>
                )}

                {currentQuiz && (
                  <>
                    <button
                      id="navbar-reset-btn"
                      onClick={onResetActiveQuiz}
                      className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        isMidnight
                          ? "text-slate-300 hover:text-white hover:bg-slate-800"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                      title="Reset answers to practice again"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Restart
                    </button>

                    <button
                      id="navbar-print-btn"
                      onClick={onOpenPrint}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        isMidnight
                          ? "text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700"
                          : "text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200"
                      }`}
                      title="Print or save this quiz"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Print / Save</span>
                    </button>

                    {onOpenGames && (
                      <button
                        id="navbar-games-btn"
                        onClick={onOpenGames}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                          isMidnight
                            ? "text-purple-300 hover:text-white bg-purple-950/60 border-purple-800/80 hover:bg-purple-900/60"
                            : "text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 border-purple-200"
                        }`}
                        title="Interactive Study Battle & Matching"
                      >
                        <Gamepad2 className="w-3.5 h-3.5 text-purple-600" />
                        <span className="hidden sm:inline">Games</span>
                        <span className="text-[10px] px-1 py-0.2 rounded bg-purple-200 text-purple-900 font-bold">
                          Boss
                        </span>
                      </button>
                    )}

                    {onOpenJokeBreak && (
                      <button
                        id="navbar-joke-btn"
                        onClick={onOpenJokeBreak}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                          isMidnight
                            ? "text-pink-300 hover:text-white bg-pink-950/60 border-pink-800/80 hover:bg-pink-900/60"
                            : "text-pink-700 hover:text-pink-900 bg-pink-50 hover:bg-pink-100 border-pink-200"
                        }`}
                        title="Take a quick humorous study break"
                      >
                        <Laugh className="w-3.5 h-3.5 text-pink-600" />
                        <span className="hidden sm:inline">Joke</span>
                      </button>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
