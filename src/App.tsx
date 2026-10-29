import React, { useState, useEffect } from "react";
import {
  UploadCloud,
  FileUp,
  Sparkles,
  BookOpen,
  Award,
  Volume2,
  VolumeX,
  Plus,
  Library,
  GraduationCap,
  Globe2,
  ArrowRight,
  WifiOff,
  School,
  Smartphone,
  CheckCircle2,
  Users,
  Send,
  Copy,
  Check,
  ShieldAlert,
  AlertTriangle
} from "lucide-react";
import {
  GeneratedQuiz,
  QuizQuestion,
  BackgroundTheme,
  LearningStreak,
  EducationLevel,
  DeviceType,
  ClassroomUserAuth,
  SpotifyTrack,
  MusicLoopMode
} from "./types";
import { STARTER_QUIZ } from "./data/starterQuiz";
import { ensureVariedMcqOptions, fireBottomLeftAndRightConfetti } from "./utils/quizUtils";
import {
  getActiveQuiz,
  setActiveQuiz,
  saveQuiz,
  saveQuizAttempt,
  getLearningStreak,
  recordQuizCompletionForStreak
} from "./utils/storage";
import {
  getDevicePreference,
  setDevicePreference,
  getClassroomAuth,
  setClassroomAuth,
  getOfflineMode,
  setOfflineMode,
  recordStudentQuizResult,
  getClassroomGroups,
  assignQuizToClassGroup,
  joinGroupByCode
} from "./utils/classroomStorage";
import { ClassroomGroup, AcademicFaculty } from "./types";
import { generateOfflineQuiz } from "./utils/offlineQuizEngine";
import { playSuccessSound, playIncorrectSound } from "./utils/audio";
import { Navbar } from "./components/Navbar";
import { QuizPlayer } from "./components/QuizPlayer";
import { ResultsView } from "./components/ResultsView";
import { UploadModal } from "./components/UploadModal";
import { UniversalSubjectExplorerModal } from "./components/UniversalSubjectExplorerModal";
import { PrintModal } from "./components/PrintModal";
import { QuizHistoryModal } from "./components/QuizHistoryModal";
import { AskQuestionModal } from "./components/AskQuestionModal";
import { ChapterGamesModal } from "./components/ChapterGamesModal";
import { JokeBreakModal } from "./components/JokeBreakModal";
import { NoteGeneratorModal } from "./components/NoteGeneratorModal";
import { DeviceSelectionModal } from "./components/DeviceSelectionModal";
import { ClassroomAuthModal } from "./components/ClassroomAuthModal";
import { ClassroomGroupModal } from "./components/ClassroomGroupModal";
import { TeacherAdminDashboardModal, DashboardActiveTab } from "./components/TeacherAdminDashboardModal";
import { PhoneActionBarSlider } from "./components/PhoneActionBarSlider";
import { BackgroundDecorations } from "./components/BackgroundDecorations";
import { SpotifyMusicPlayerModal } from "./components/SpotifyMusicPlayerModal";
import { SpotifyMusicMiniBar } from "./components/SpotifyMusicMiniBar";
import { ImagineCreativityModal } from "./components/ImagineCreativityModal";
import { AcademicJourneyTracker } from "./components/AcademicJourneyTracker";
import { PRESET_STUDY_SONGS, studyAudio } from "./utils/spotifyMusic";
import { logoutClassroomUser } from "./utils/classroomStorage";

export default function App() {
  // Device Selection & Experience
  const [deviceType, setDeviceType] = useState<DeviceType>(() => getDevicePreference() || "laptop");
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState<boolean>(() => !getDevicePreference());

  // Classroom Group Login & 70+ Capacity Roster
  const [currentUser, setCurrentUser] = useState<ClassroomUserAuth | null>(() => getClassroomAuth());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(() => !getClassroomAuth() && !!getDevicePreference());
  const [isGroupModalOpen, setIsGroupModalOpen] = useState<boolean>(false);
  const [isTeacherDashboardOpen, setIsTeacherDashboardOpen] = useState<boolean>(false);
  const [teacherDashboardTab, setTeacherDashboardTab] = useState<DashboardActiveTab>('faculty_groups');
  const [classroomGroups, setClassroomGroups] = useState<ClassroomGroup[]>(() => getClassroomGroups());
  const [homeJoinCode, setHomeJoinCode] = useState<string>('');
  const [classActionSuccess, setClassActionSuccess] = useState<string | null>(null);
  const [kickedAlert, setKickedAlert] = useState<{
    isOpen: boolean;
    name: string;
    role: string;
    adminName: string;
    reason: string;
  } | null>(null);

  // Sync groups on events
  useEffect(() => {
    const handleAuthChange = (e: any) => {
      setCurrentUser(e.detail);
      setClassroomGroups(getClassroomGroups());
    };
    const handleQuizAssigned = () => {
      setClassroomGroups(getClassroomGroups());
    };
    const handleOtpNotification = (e: any) => {
      const { otp, recipient } = e.detail || {};
      if (otp) {
        setClassActionSuccess(`📲 SMS Message Delivered to ${recipient || 'Phone'}: OTP is ${otp}. Valid for 5 minutes.`);
        setTimeout(() => setClassActionSuccess(null), 8000);
      }
    };
    const handleUserKickedOut = (e: any) => {
      const { kickedName, kickedRole, adminName, reason } = e.detail || {};
      setKickedAlert({
        isOpen: true,
        name: kickedName || 'User',
        role: kickedRole || 'account',
        adminName: adminName || 'Master Administrator',
        reason: reason || 'Access terminated by Administrator mandate'
      });
      setIsTeacherDashboardOpen(false);
      setIsGroupModalOpen(false);
      setIsLoginModalOpen(true);
    };
    window.addEventListener('classroom-auth-changed', handleAuthChange);
    window.addEventListener('class-quiz-assigned', handleQuizAssigned);
    window.addEventListener('otp-received-notification', handleOtpNotification);
    window.addEventListener('user-kicked-out', handleUserKickedOut);
    return () => {
      window.removeEventListener('classroom-auth-changed', handleAuthChange);
      window.removeEventListener('class-quiz-assigned', handleQuizAssigned);
      window.removeEventListener('otp-received-notification', handleOtpNotification);
      window.removeEventListener('user-kicked-out', handleUserKickedOut);
    };
  }, []);

  const activeGroup = classroomGroups.find((g) => g.id === currentUser?.groupId) || classroomGroups[0];

  // Music Corner System State
  const [isMusicModalOpen, setIsMusicModalOpen] = useState<boolean>(false);
  const [musicPlaylist, setMusicPlaylist] = useState<SpotifyTrack[]>(() => PRESET_STUDY_SONGS.slice(0, 1));
  const [currentMusicIndex, setCurrentMusicIndex] = useState<number>(0);
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);
  const [musicLoopMode, setMusicLoopMode] = useState<MusicLoopMode>('single');

  // Persistent audio playback driver ensuring full song completion across all views & navigation
  useEffect(() => {
    const currentTrack = musicPlaylist[currentMusicIndex] || musicPlaylist[0];
    if (!currentTrack) {
      studyAudio.pause();
      return;
    }

    const handleSongEnded = () => {
      if (musicLoopMode === 'single') {
        // Replay single song cleanly from start
        studyAudio.playTrack(currentTrack, true, handleSongEnded);
      } else if (musicLoopMode === 'all') {
        // Advance to next song in playlist and play it to completion
        const nextIdx = (currentMusicIndex + 1) % musicPlaylist.length;
        setCurrentMusicIndex(nextIdx);
        setIsMusicPlaying(true);
      } else {
        if (currentMusicIndex < musicPlaylist.length - 1) {
          setCurrentMusicIndex((prev) => prev + 1);
          setIsMusicPlaying(true);
        } else {
          setIsMusicPlaying(false);
          studyAudio.pause();
        }
      }
    };

    if (isMusicPlaying) {
      studyAudio.playTrack(currentTrack, musicLoopMode === 'single', handleSongEnded);
    } else {
      studyAudio.pause();
    }
  }, [currentMusicIndex, isMusicPlaying, musicLoopMode, musicPlaylist]);

  const handleLogout = () => {
    logoutClassroomUser();
    setCurrentUser(null);
  };

  // Teacher sends current active quiz to active class group
  const handleTeacherSendCurrentQuizToClass = () => {
    if (!currentQuiz || !activeGroup) return;
    assignQuizToClassGroup(activeGroup.id, {
      title: currentQuiz.title,
      topic: currentQuiz.topicsCovered?.[0] || currentQuiz.subjectName || currentQuiz.title,
      questionsCount: currentQuiz.questions.length,
      fullData: currentQuiz
    });
    setClassroomGroups(getClassroomGroups());
    fireBottomLeftAndRightConfetti();
    setClassActionSuccess(`🎯 Test "${currentQuiz.title}" successfully sent to ${activeGroup.name}! All 70+ students in class can now take it.`);
    setTimeout(() => setClassActionSuccess(null), 6000);
  };

  // Student quick joins classroom group by code from homepage
  const handleHomeJoinCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeJoinCode.trim()) return;
    const studentName = currentUser?.userName || 'Enrolled Student';
    const roll = currentUser?.rollNumber || `STD-${Math.floor(10 + Math.random() * 90)}`;
    const avatar = currentUser?.avatarEmoji || '🧑‍🎓';

    const res = joinGroupByCode(homeJoinCode.trim(), {
      name: studentName,
      rollNumber: roll,
      avatarEmoji: avatar
    });

    if (res.success && res.group) {
      setClassroomGroups(getClassroomGroups());
      if (currentUser) {
        setClassroomAuth({
          ...currentUser,
          groupId: res.group.id,
          groupName: res.group.name
        });
      }
      fireBottomLeftAndRightConfetti();
      setClassActionSuccess(`🎉 Successfully joined classroom "${res.group.name}" taught by ${res.group.teacherName}!`);
      setHomeJoinCode('');
      setTimeout(() => setClassActionSuccess(null), 5000);
    } else {
      setClassActionSuccess(`⚠️ ${res.error || 'Failed to join group. Please verify code.'}`);
      setTimeout(() => setClassActionSuccess(null), 6000);
    }
  };

  // Start assigned class test
  const handleStartAssignedClassTest = () => {
    if (!activeGroup.assignedQuizTitle) return;
    if (activeGroup.assignedQuizFullData) {
      handleNewQuizGenerated(activeGroup.assignedQuizFullData);
    } else {
      handleLaunchQuizFromNotes(activeGroup.assignedQuizTopic || activeGroup.assignedQuizTitle);
    }
  };

  // Offline Mode Toggle
  const [isOffline, setIsOffline] = useState<boolean>(() => getOfflineMode() || !navigator.onLine);

  // Background Ambiance Theme
  const [theme, setTheme] = useState<BackgroundTheme>(() => {
    const savedTheme = localStorage.getItem("testgen_bg_theme") as BackgroundTheme;
    if (savedTheme && ["modern-grid", "aurora", "midnight", "warm-notebook"].includes(savedTheme)) {
      return savedTheme;
    }
    return "modern-grid";
  });

  const handleSelectTheme = (newTheme: BackgroundTheme) => {
    setTheme(newTheme);
    try {
      localStorage.setItem("testgen_bg_theme", newTheme);
    } catch {
      // ignore
    }
  };

  // Initialize quiz from storage or starter quiz
  const [currentQuiz, setCurrentQuiz] = useState<GeneratedQuiz>(() => {
    const saved = getActiveQuiz();
    if (saved && saved.questions && saved.questions.length > 0) {
      return {
        ...saved,
        questions: ensureVariedMcqOptions(saved.questions),
      };
    }
    const balancedStarter = {
      ...STARTER_QUIZ,
      questions: ensureVariedMcqOptions(STARTER_QUIZ.questions),
    };
    saveQuiz(balancedStarter);
    return balancedStarter;
  });

  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Learning Streak state
  const [learningStreak, setLearningStreak] = useState<LearningStreak>(() =>
    getLearningStreak()
  );

  useEffect(() => {
    const handleStreakUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<LearningStreak>;
      if (customEvent.detail) {
        setLearningStreak(customEvent.detail);
      } else {
        setLearningStreak(getLearningStreak());
      }
    };
    window.addEventListener("learning-streak-updated", handleStreakUpdate);
    return () => {
      window.removeEventListener("learning-streak-updated", handleStreakUpdate);
    };
  }, []);

  // Browser online/offline event listeners
  useEffect(() => {
    const handleOnline = () => {
      // If user hasn't explicitly forced offline mode, sync with browser status
      if (!getOfflineMode()) {
        setIsOffline(false);
      }
    };
    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isSubjectsModalOpen, setIsSubjectsModalOpen] = useState<boolean>(false);
  const [isPrintOpen, setIsPrintOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isAskModalOpen, setIsAskModalOpen] = useState<boolean>(false);
  const [focusedQuestion, setFocusedQuestion] = useState<QuizQuestion | undefined>(undefined);

  // Fun & Games Modals
  const [isGamesOpen, setIsGamesOpen] = useState<boolean>(false);
  const [isJokeModalOpen, setIsJokeModalOpen] = useState<boolean>(false);
  const [jokeTopic, setJokeTopic] = useState<string>("");
  const [jokeQuestionContext, setJokeQuestionContext] = useState<string | undefined>(undefined);

  // Note Generator Modal
  const [isNotesModalOpen, setIsNotesModalOpen] = useState<boolean>(false);
  const [notesTopic, setNotesTopic] = useState<string>("");
  const [notesSubtopic, setNotesSubtopic] = useState<string>("");
  const [isRegeneratingQuiz, setIsRegeneratingQuiz] = useState<boolean>(false);

  // Imagine Ur Creativity (Interactive Visual Animation Lab)
  const [isImagineCreativityOpen, setIsImagineCreativityOpen] = useState<boolean>(false);
  const [imagineCreativityPrompt, setImagineCreativityPrompt] = useState<string>("");
  const [isImagineCreativityEnabled, setIsImagineCreativityEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("imagine_creativity_enabled");
      return saved !== null ? saved === "true" : true;
    } catch {
      return true;
    }
  });

  const handleToggleImagineCreativity = (enabled: boolean) => {
    setIsImagineCreativityEnabled(enabled);
    try {
      localStorage.setItem("imagine_creativity_enabled", String(enabled));
    } catch {
      // ignore
    }
  };

  const handleOpenImagineCreativity = (prompt?: string) => {
    if (!isImagineCreativityEnabled) {
      setIsImagineCreativityEnabled(true);
      try {
        localStorage.setItem("imagine_creativity_enabled", "true");
      } catch {}
    }
    setImagineCreativityPrompt(prompt || "");
    setIsImagineCreativityOpen(true);
  };

  const handleReviewPastQuizAttempt = (selectedQuiz: GeneratedQuiz, pastAnswers?: Record<string, string>) => {
    setCurrentQuiz({
      ...selectedQuiz,
      questions: ensureVariedMcqOptions(selectedQuiz.questions),
    });
    if (pastAnswers && Object.keys(pastAnswers).length > 0) {
      setUserAnswers(pastAnswers);
      setIsCompleted(true);
    } else {
      setUserAnswers({});
      setIsCompleted(false);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStartTopicQuizFromJourney = (topicName: string, faculty?: AcademicFaculty) => {
    handleLaunchClassQuiz("class_10", topicName);
  };

  const handleToggleOffline = () => {
    const next = !isOffline;
    setIsOffline(next);
    setOfflineMode(next);
  };

  const handleSelectDevice = (selected: DeviceType) => {
    setDeviceType(selected);
    setDevicePreference(selected);
    setIsDeviceModalOpen(false);
    // If user hasn't completed classroom login yet, trigger login modal
    if (!currentUser) {
      setIsLoginModalOpen(true);
    }
  };

  const handleOpenPrincipalPanel = () => {
    setTeacherDashboardTab('principal_view');
    setIsTeacherDashboardOpen(true);
  };

  const handleOpenAdminPanel = () => {
    setTeacherDashboardTab('admin_kick_center');
    setIsTeacherDashboardOpen(true);
  };

  const handleLoginSuccess = (auth: ClassroomUserAuth) => {
    setCurrentUser(auth);
    setClassroomAuth(auth);
    setIsLoginModalOpen(false);

    if (auth.role === 'principal') {
      setTeacherDashboardTab('principal_view');
      setIsTeacherDashboardOpen(true);
    } else if (auth.role === 'admin') {
      setTeacherDashboardTab('admin_kick_center');
      setIsTeacherDashboardOpen(true);
    } else if (auth.role === 'teacher') {
      setTeacherDashboardTab('faculty_groups');
      setIsTeacherDashboardOpen(true);
    }
  };

  const handleOpenAskTutor = (question?: QuizQuestion) => {
    setFocusedQuestion(question);
    setIsAskModalOpen(true);
  };

  const handleOpenJokeBreak = (topic?: string, questionContext?: string) => {
    setJokeTopic(topic || currentQuiz.title);
    setJokeQuestionContext(questionContext);
    setIsJokeModalOpen(true);
  };

  const handleOpenGames = () => {
    setIsGamesOpen(true);
  };

  const handleOpenNotes = (targetTopic?: string, targetSubtopic?: string) => {
    setNotesTopic(targetTopic || currentQuiz.subjectName || currentQuiz.title);
    setNotesSubtopic(targetSubtopic || (currentQuiz.topicsCovered?.[0] || ""));
    setIsNotesModalOpen(true);
  };

  const handleLaunchClassQuiz = async (classLevel: EducationLevel, defaultTopic: string) => {
    setIsRegeneratingQuiz(true);
    try {
      if (isOffline) {
        const offQuiz = generateOfflineQuiz({
          subjectName: defaultTopic,
          educationLevel: classLevel,
          numQuestions: 5,
        });
        handleNewQuizGenerated(offQuiz);
        return;
      }
      const res = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectName: defaultTopic,
          educationLevel: classLevel,
          numQuestions: 5,
          questionTypes: "mixed",
          difficulty: "medium",
        }),
      });
      if (res.ok) {
        const quiz = await res.json();
        handleNewQuizGenerated(quiz);
      } else {
        const offQuiz = generateOfflineQuiz({
          subjectName: defaultTopic,
          educationLevel: classLevel,
          numQuestions: 5,
        });
        handleNewQuizGenerated(offQuiz);
      }
    } catch {
      const offQuiz = generateOfflineQuiz({
        subjectName: defaultTopic,
        educationLevel: classLevel,
        numQuestions: 5,
      });
      handleNewQuizGenerated(offQuiz);
    } finally {
      setIsRegeneratingQuiz(false);
    }
  };

  const handleRegenerateFreshQuiz = async () => {
    setIsRegeneratingQuiz(true);
    try {
      if (isOffline) {
        const offQuiz = generateOfflineQuiz({
          subjectName: currentQuiz.subjectName || currentQuiz.title,
          faculty: currentQuiz.faculty,
          educationLevel: currentQuiz.educationLevel || "class_1",
          numQuestions: Math.max(currentQuiz.questions.length, 5),
          language: currentQuiz.language || "en",
        });
        handleNewQuizGenerated(offQuiz);
        return;
      }

      const res = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectName: currentQuiz.subjectName || currentQuiz.title,
          documentName: currentQuiz.documentName,
          faculty: currentQuiz.faculty,
          educationLevel: currentQuiz.educationLevel || "undergraduate",
          numQuestions: Math.max(currentQuiz.questions.length, 5),
          questionTypes: "mixed",
          difficulty: "medium",
          focusTopic: `Fresh variation attempt #${Date.now()}`,
          language: currentQuiz.language || "en",
        }),
      });

      if (res.ok) {
        const freshQuiz = await res.json();
        handleNewQuizGenerated(freshQuiz);
      } else {
        const offQuiz = generateOfflineQuiz({
          subjectName: currentQuiz.subjectName || currentQuiz.title,
          faculty: currentQuiz.faculty,
          educationLevel: currentQuiz.educationLevel || "class_1",
          numQuestions: 5,
          language: currentQuiz.language || "en",
        });
        handleNewQuizGenerated(offQuiz);
      }
    } catch (err) {
      console.error("Failed to generate fresh questions, using offline engine:", err);
      const offQuiz = generateOfflineQuiz({
        subjectName: currentQuiz.subjectName || currentQuiz.title,
        faculty: currentQuiz.faculty,
        educationLevel: currentQuiz.educationLevel || "class_1",
        numQuestions: 5,
        language: currentQuiz.language || "en",
      });
      handleNewQuizGenerated(offQuiz);
    } finally {
      setIsRegeneratingQuiz(false);
    }
  };

  const handleLaunchQuizFromNotes = async (targetTopic: string, targetSubtopic?: string) => {
    setIsRegeneratingQuiz(true);
    try {
      if (isOffline) {
        const offQuiz = generateOfflineQuiz({
          subjectName: targetTopic,
          focusTopic: targetSubtopic,
          numQuestions: 5,
          language: currentQuiz.language || "en",
        });
        handleNewQuizGenerated(offQuiz);
        return;
      }

      const res = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectName: targetTopic,
          focusTopic: targetSubtopic,
          numQuestions: 5,
          questionTypes: "mixed",
          difficulty: "medium",
          language: currentQuiz.language || "en",
        }),
      });

      if (res.ok) {
        const freshQuiz = await res.json();
        handleNewQuizGenerated(freshQuiz);
      } else {
        const offQuiz = generateOfflineQuiz({
          subjectName: targetTopic,
          focusTopic: targetSubtopic,
          numQuestions: 5,
          language: currentQuiz.language || "en",
        });
        handleNewQuizGenerated(offQuiz);
      }
    } catch (err) {
      console.error("Failed to launch quiz from notes, using offline generator:", err);
      const offQuiz = generateOfflineQuiz({
        subjectName: targetTopic,
        focusTopic: targetSubtopic,
        numQuestions: 5,
        language: currentQuiz.language || "en",
      });
      handleNewQuizGenerated(offQuiz);
    } finally {
      setIsRegeneratingQuiz(false);
    }
  };

  // Keep storage in sync when currentQuiz changes
  useEffect(() => {
    if (currentQuiz) {
      setActiveQuiz(currentQuiz);
    }
  }, [currentQuiz]);

  const handleSelectAnswer = (questionId: string, answer: string) => {
    if (userAnswers[questionId] !== undefined) return;

    const question = currentQuiz.questions.find((q) => q.id === questionId);
    const isCorrect = question ? question.correctAnswer === answer : false;

    if (soundEnabled) {
      if (isCorrect) {
        playSuccessSound();
      } else {
        playIncorrectSound();
      }
    }

    const updatedAnswers = {
      ...userAnswers,
      [questionId]: answer,
    };
    setUserAnswers(updatedAnswers);
  };

  const handleClearAnswer = (questionId: string) => {
    const nextAnswers = { ...userAnswers };
    delete nextAnswers[questionId];
    setUserAnswers(nextAnswers);
  };

  const handleFinishQuiz = () => {
    setIsCompleted(true);

    const total = currentQuiz.questions.length;
    const score = currentQuiz.questions.filter(
      (q) => userAnswers[q.id] === q.correctAnswer
    ).length;

    saveQuiz(currentQuiz);

    saveQuizAttempt({
      id: `attempt_${Date.now()}`,
      quizId: currentQuiz.id,
      quizTitle: currentQuiz.title,
      startedAt: currentQuiz.createdAt,
      completedAt: Date.now(),
      totalQuestions: total,
      score,
      percentage: total > 0 ? Math.round((score / total) * 100) : 0,
      answers: userAnswers,
    });

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("quiz-attempt-saved"));
    }

    // Record score for student in classroom group roster
    if (currentUser && currentUser.groupId) {
      recordStudentQuizResult(currentUser.groupId, currentUser.userName, score);
    }

    const streakResult = recordQuizCompletionForStreak();
    setLearningStreak(streakResult.streak);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRetakeAll = () => {
    setUserAnswers({});
    setIsCompleted(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRetakeMissed = (missedQuestionIds: string[]) => {
    const next = { ...userAnswers };
    missedQuestionIds.forEach((id) => delete next[id]);
    setUserAnswers(next);
    setIsCompleted(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNewQuizGenerated = (newQuiz: GeneratedQuiz) => {
    const balancedQuiz = {
      ...newQuiz,
      questions: ensureVariedMcqOptions(newQuiz.questions),
    };
    saveQuiz(balancedQuiz);
    setCurrentQuiz(balancedQuiz);
    setUserAnswers({});
    setIsCompleted(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const totalAnswered = Object.keys(userAnswers).length;
  const totalQuestions = currentQuiz.questions.length;

  return (
    <div
      className={`min-h-screen relative flex flex-col font-sans selection:bg-indigo-200 selection:text-indigo-900 transition-colors duration-500 ${
        theme === "midnight" ? "text-slate-100" : "text-slate-900"
      }`}
    >
      {/* Background Decorations */}
      <BackgroundDecorations theme={theme} />

      {/* Top Navbar */}
      <Navbar
        currentQuiz={currentQuiz}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenSubjects={() => setIsSubjectsModalOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenPrint={() => setIsPrintOpen(true)}
        onResetActiveQuiz={handleRetakeAll}
        onOpenAskTutor={() => handleOpenAskTutor()}
        onOpenGames={handleOpenGames}
        onOpenJokeBreak={() => handleOpenJokeBreak()}
        onOpenNotes={() => handleOpenNotes()}
        totalAnswered={totalAnswered}
        totalQuestions={totalQuestions}
        currentTheme={theme}
        onChangeTheme={handleSelectTheme}
        streak={learningStreak}
        deviceType={deviceType}
        onOpenDeviceSelector={() => setIsDeviceModalOpen(true)}
        isOffline={isOffline}
        onToggleOffline={handleToggleOffline}
        currentUser={currentUser}
        onOpenClassroomGroup={() => setIsGroupModalOpen(true)}
        onOpenGroupRoster={() => setIsGroupModalOpen(true)}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onOpenPrincipalPanel={handleOpenPrincipalPanel}
        onOpenAdminPanel={handleOpenAdminPanel}
        onOpenTeacherDashboard={() => {
          if (currentUser?.role === 'principal') {
            setTeacherDashboardTab('principal_view');
          } else if (currentUser?.role === 'admin') {
            setTeacherDashboardTab('admin_kick_center');
          } else {
            setTeacherDashboardTab('faculty_groups');
          }
          setIsTeacherDashboardOpen(true);
        }}
        onOpenMusic={() => setIsMusicModalOpen(true)}
        isMusicPlaying={isMusicPlaying}
        onLogout={handleLogout}
        onOpenImagineCreativity={isImagineCreativityEnabled ? () => handleOpenImagineCreativity() : undefined}
      />

      {/* Main App Content Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-5">
        {/* Offline Mode Alert Banner (if offline) */}
        {isOffline && (
          <div className="p-3 rounded-2xl bg-amber-500 text-white flex items-center justify-between gap-3 text-xs font-bold shadow-md shadow-amber-500/20 animate-in fade-in">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 shrink-0" />
              <span>
                ⚡ Offline Mode Active — All quizzes, Class 1–12 questions, notes, and tests are running locally on your device with zero data needed!
              </span>
            </div>
            <button
              type="button"
              onClick={handleToggleOffline}
              className="px-3 py-1 rounded-xl bg-white text-amber-900 font-extrabold hover:bg-amber-50 shrink-0 cursor-pointer shadow-2xs"
            >
              Switch to Online
            </button>
          </div>
        )}

        {/* PHONE VIEW SPECIFIC: Combine ALL options and buttons into a smooth swipeable slider */}
        {deviceType === "phone" && (
          <PhoneActionBarSlider
            onOpenNotes={() => handleOpenNotes()}
            onOpenSubjects={() => setIsSubjectsModalOpen(true)}
            onOpenClassroomGroup={() => setIsGroupModalOpen(true)}
            onOpenGroupRoster={() => setIsGroupModalOpen(true)}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
            onResetQuiz={handleRetakeAll}
            onOpenPrint={() => setIsPrintOpen(true)}
            onOpenGames={handleOpenGames}
            onOpenJokes={() => handleOpenJokeBreak()}
            onOpenDeviceSelector={() => setIsDeviceModalOpen(true)}
            isOffline={isOffline}
            onToggleOffline={handleToggleOffline}
            currentUser={currentUser}
            theme={theme}
            onOpenMusic={() => setIsMusicModalOpen(true)}
            isMusicPlaying={isMusicPlaying}
            onLogout={handleLogout}
            onOpenImagineCreativity={isImagineCreativityEnabled ? () => handleOpenImagineCreativity() : undefined}
          />
        )}

        {/* Class Action Notification Banner */}
        {classActionSuccess && (
          <div className="p-3.5 rounded-2xl bg-indigo-600 text-white flex items-center justify-between gap-3 text-xs font-bold shadow-lg animate-in fade-in">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
              <span>{classActionSuccess}</span>
            </div>
            <button
              onClick={() => setClassActionSuccess(null)}
              className="text-white/80 hover:text-white cursor-pointer px-1.5"
            >
              ✕
            </button>
          </div>
        )}

        {/* EXCLUSIVE TEACHER & ADMIN COLLABORATION CARD (Hidden for students) */}
        {currentUser && (currentUser.role === 'admin' || currentUser.role === 'teacher') && (
          <div
            id="teacher-admin-exclusive-hub-card"
            className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-700/60 shadow-lg space-y-3.5 animate-in fade-in"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-800/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xl shadow-md shrink-0">
                  {currentUser.role === 'admin' ? '👑' : '🏫'}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm sm:text-base font-black text-white">
                      {currentUser.role === 'admin'
                        ? 'Principal & Administrator Console'
                        : 'Teacher Staff Room & Collaboration Portal'}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-400/30">
                      Staff Only • Hidden from Students
                    </span>
                  </div>
                  <p className="text-xs text-indigo-200 mt-0.5">
                    Admins & Teachers can build lesson plans, collaborate on live Excel sheets, organize faculty groups, and configure exam settings.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-white/15 hover:bg-white/25 text-white border border-white/20 transition-all cursor-pointer shrink-0"
                  title="Make a test with Teacher & Admin options"
                >
                  <span>📝 Make Class Test</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTeacherDashboardTab('faculty_groups');
                    setIsTeacherDashboardOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-md transition-all cursor-pointer shrink-0"
                >
                  <span>Open Staff Console</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Shortcuts Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setTeacherDashboardTab('lesson_planner');
                  setIsTeacherDashboardOpen(true);
                }}
                className="p-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-left transition-all cursor-pointer group"
              >
                <span className="text-base block mb-1">📝</span>
                <div className="text-xs font-black text-white group-hover:text-amber-300">
                  Lesson Planner
                </div>
                <div className="text-[10px] text-indigo-200">
                  Curriculum units & flow
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTeacherDashboardTab('excel_sheets');
                  setIsTeacherDashboardOpen(true);
                }}
                className="p-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-left transition-all cursor-pointer group"
              >
                <span className="text-base block mb-1">📊</span>
                <div className="text-xs font-black text-white group-hover:text-amber-300">
                  Excel Sheets
                </div>
                <div className="text-[10px] text-indigo-200">
                  Formulas & Gradebooks
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTeacherDashboardTab('faculty_groups');
                  setIsTeacherDashboardOpen(true);
                }}
                className="p-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-left transition-all cursor-pointer group"
              >
                <span className="text-base block mb-1">👥</span>
                <div className="text-xs font-black text-white group-hover:text-amber-300">
                  Teacher Groups
                </div>
                <div className="text-[10px] text-indigo-200">
                  Principal faculty council
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTeacherDashboardTab('student_analytics');
                  setIsTeacherDashboardOpen(true);
                }}
                className="p-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-left transition-all cursor-pointer group"
              >
                <span className="text-base block mb-1">📈</span>
                <div className="text-xs font-black text-white group-hover:text-amber-300">
                  Cohort Analytics
                </div>
                <div className="text-[10px] text-indigo-200">
                  Common mistakes & mastery
                </div>
              </button>
            </div>
          </div>
        )}

        {/* PROMINENT CLASSROOM GROUP & WHOLE-CLASS TESTING BAR (Guaranteed 70+ Students Capacity) */}
        <div
          id="classroom-group-hub-bar"
          className={`p-4 sm:p-5 rounded-3xl border transition-all space-y-3.5 shadow-sm ${
            theme === "midnight"
              ? "bg-slate-900/95 border-indigo-900/60 text-slate-100"
              : "bg-white border-indigo-200/90 text-slate-900"
          }`}
        >
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-100 dark:border-slate-800">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 text-white flex items-center justify-center text-xl shadow-md shrink-0">
                🏫
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white truncate">
                    {activeGroup.name}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-mono font-black uppercase bg-indigo-100 text-indigo-900 border border-indigo-300 shrink-0">
                    CODE: {activeGroup.code}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                    👥 70+ Capacity ({activeGroup.students?.length || 0}/{activeGroup.maxCapacity || 75} Seats)
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 truncate">
                  Teacher: <strong className="text-slate-800 dark:text-slate-200">{activeGroup.teacherName}</strong> • Grade: <strong>{activeGroup.gradeLevel}</strong> • {activeGroup.students?.length || 0} Students Enrolled
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(activeGroup.code);
                  setClassActionSuccess(`Class code "${activeGroup.code}" copied to clipboard!`);
                  setTimeout(() => setClassActionSuccess(null), 3500);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors cursor-pointer"
                title="Copy Classroom Code"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </button>

              <button
                type="button"
                onClick={() => setIsGroupModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-all cursor-pointer"
              >
                <Users className="w-3.5 h-3.5" />
                <span>View Class & Podium (75 Seats)</span>
              </button>
            </div>
          </div>

          {/* Teacher or Student Specific Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {/* Left Box: Active Class Test or Teacher Assignment Command */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-800/80 dark:to-slate-900 border border-amber-200 dark:border-amber-900/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center gap-1">
                  <span>🎯 Whole-Class Assigned Test</span>
                </span>
                {currentUser?.role === 'teacher' && (
                  <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400">
                    Teacher Mode
                  </span>
                )}
              </div>

              {activeGroup.assignedQuizTitle ? (
                <div className="space-y-1.5">
                  <div className="text-xs font-black text-slate-900 dark:text-white truncate">
                    {activeGroup.assignedQuizTitle}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {activeGroup.assignedQuizQuestions || 15} Questions • All 70+ students can take this test!
                  </div>
                  <button
                    type="button"
                    onClick={handleStartAssignedClassTest}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black text-white bg-amber-600 hover:bg-amber-700 shadow-xs transition-all cursor-pointer"
                  >
                    <span>Start Whole-Class Test Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="text-xs text-slate-500">
                  {currentUser?.role === 'teacher'
                    ? 'No test assigned yet. Click "Send Test to Class" on any quiz to send it to all 70+ students!'
                    : `No active test assigned by ${activeGroup.teacherName} yet. Practice with curriculum tests below!`}
                </div>
              )}

              {currentUser?.role === 'teacher' && currentQuiz && (
                <button
                  type="button"
                  onClick={handleTeacherSendCurrentQuizToClass}
                  className="w-full mt-2 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 shadow-sm cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Active Quiz ("{currentQuiz.title.slice(0, 24)}...") to Class</span>
                </button>
              )}
            </div>

            {/* Right Box: Quick Join Class by Teacher Code */}
            <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-slate-800/80 border border-indigo-200 dark:border-indigo-900/40 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-900 dark:text-indigo-300 flex items-center gap-1">
                <span>🔑 Join Classroom by Teacher's Code</span>
              </span>
              <p className="text-[11px] text-slate-500">
                Students: Enter the 6-character code from your teacher to join their class test:
              </p>
              <form onSubmit={handleHomeJoinCodeSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={homeJoinCode}
                  onChange={(e) => setHomeJoinCode(e.target.value.toUpperCase())}
                  placeholder="e.g. CLS-910 or BIO-2026"
                  className="flex-1 px-3 py-1.5 text-xs font-mono font-bold rounded-xl border border-slate-300 bg-white text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-2xs transition-all cursor-pointer shrink-0"
                >
                  Join
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* ACADEMIC JOURNEY CURRICULUM ROADMAP & PROGRESS TRACKER */}
        <AcademicJourneyTracker
          onSelectQuiz={(selectedQuiz) => {
            setCurrentQuiz({
              ...selectedQuiz,
              questions: ensureVariedMcqOptions(selectedQuiz.questions),
            });
            setUserAnswers({});
            setIsCompleted(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onReviewQuizAttempt={handleReviewPastQuizAttempt}
          onStartTopicQuiz={handleStartTopicQuizFromJourney}
          currentQuizId={currentQuiz.id}
          isImagineCreativityEnabled={isImagineCreativityEnabled}
          onToggleImagineCreativity={handleToggleImagineCreativity}
          theme={theme}
        />

        {/* IMAGINE UR CREATIVITY INTERACTIVE VISUAL LAB BANNER (Shown when Enabled) */}
        {isImagineCreativityEnabled && (
          <div
            id="imagine-creativity-hub-bar"
            className={`p-4 sm:p-5 rounded-3xl border transition-all space-y-3.5 shadow-sm ${
              theme === "midnight"
                ? "bg-gradient-to-r from-amber-950/30 via-slate-900 to-indigo-950/40 border-amber-500/30 text-slate-100"
                : "bg-gradient-to-r from-amber-50/90 via-orange-50/60 to-indigo-50/80 border-amber-200/80 text-slate-900"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-400 to-indigo-600 text-slate-950 flex items-center justify-center text-2xl shadow-md shadow-amber-500/20 shrink-0 font-black">
                  ✨
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm sm:text-base font-black tracking-tight">
                      Imagine Ur Creativity: Animated Visual Explainer Lab
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-400 text-slate-950 shadow-2xs">
                      Interactive Animations
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hidden md:inline">
                      Step-by-step simulations with live experiment sliders!
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 max-w-2xl">
                    Stuck on a tricky concept? Ask any question—like <strong className="text-indigo-600 dark:text-indigo-300">How does the water cycle work?</strong> or <strong className="text-indigo-600 dark:text-indigo-300">How does a circuit light a bulb?</strong>—and watch it come alive in real-time animated visual models!
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleOpenImagineCreativity()}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:scale-[1.02] shadow-md shadow-amber-400/25 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 fill-current" />
                  <span>Open Creativity Lab</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Quick Concept Launch Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
              {[
                {
                  id: 'weather_water_cycle',
                  title: 'Water Cycle & Weather',
                  emoji: '🌧️',
                  tag: 'Evaporation to Rain'
                },
                {
                  id: 'electric_circuit',
                  title: 'Electric Circuit',
                  emoji: '💡',
                  tag: 'Electrons & Bulb'
                },
                {
                  id: 'photosynthesis',
                  title: 'Photosynthesis',
                  emoji: '🌱',
                  tag: 'Sunlight to Oxygen'
                },
                {
                  id: 'math_scale',
                  title: 'Algebra Scale',
                  emoji: '⚖️',
                  tag: '2x + 6 = 14'
                },
                {
                  id: 'heart_circulation',
                  title: 'Heart Blood Flow',
                  emoji: '🫀',
                  tag: 'Dual Pump Organs'
                },
                {
                  id: 'states_of_matter',
                  title: 'States of Matter',
                  emoji: '🧊',
                  tag: 'Solid ➔ Liquid ➔ Gas'
                }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleOpenImagineCreativity(item.title)}
                  className={`p-2.5 rounded-xl border text-left transition-all hover:scale-[1.03] cursor-pointer flex flex-col justify-between ${
                    theme === "midnight"
                      ? "bg-slate-800/80 hover:bg-slate-700/90 border-slate-700 hover:border-amber-400"
                      : "bg-white hover:bg-amber-50/60 border-slate-200 hover:border-amber-400 shadow-2xs"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xl">{item.emoji}</span>
                    <span className="text-[9px] font-black uppercase text-amber-500 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.2 rounded">
                      Play
                    </span>
                  </div>
                  <div className="mt-1.5">
                    <div className="text-xs font-black truncate">{item.title}</div>
                    <div className="text-[10px] text-slate-500 truncate">{item.tag}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Unified Curriculum & Class Hub (Class 1 to Class 12 & Advanced) */}
        <div
          id="classes-curriculum-section"
          className={`p-4 sm:p-5 rounded-2xl border transition-colors duration-300 space-y-4 ${
            theme === "midnight"
              ? "bg-slate-900/90 border-indigo-900/40 text-slate-100 shadow-md shadow-slate-950/40"
              : "bg-gradient-to-r from-indigo-50/90 via-sky-50/70 to-blue-50/80 border-indigo-200/90 text-slate-900 shadow-xs"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-700 text-white flex items-center justify-center text-xl shadow-xs shrink-0 font-black">
                📚
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs sm:text-sm font-black text-indigo-950 dark:text-indigo-300">
                    Curriculum & Class Hub
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-600 text-white shadow-2xs">
                    Class 1 to Class 12
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 hidden sm:inline">
                    Every Grade • Practice Tests & Board Exam Preparation
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Select any class from 1 to 12 for instant curriculum-aligned tests, or create custom exam sets with AI.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsUploadOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <span>Create Class Quiz</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* All Classes Grid: Class 1 to Class 12 in order */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 pt-1">
            {[
              { classId: "class_1" as EducationLevel, label: "Class 1", icon: "🎨", subtitle: "Counting & Shapes" },
              { classId: "class_2" as EducationLevel, label: "Class 2", icon: "🦁", subtitle: "Living & Addition" },
              { classId: "class_3" as EducationLevel, label: "Class 3", icon: "🚀", subtitle: "Tables & Solar System" },
              { classId: "class_4" as EducationLevel, label: "Class 4", icon: "🔬", subtitle: "Fractions & Matter" },
              { classId: "class_5" as EducationLevel, label: "Class 5", icon: "🌍", subtitle: "Factors & Energy" },
              { classId: "class_6" as EducationLevel, label: "Class 6", icon: "📐", subtitle: "Integers & Living" },
              { classId: "class_7" as EducationLevel, label: "Class 7", icon: "🧪", subtitle: "Nutrition & Heat" },
              { classId: "class_8" as EducationLevel, label: "Class 8", icon: "⚡", subtitle: "Force, Pressure & Cells" },
              { classId: "class_9" as EducationLevel, label: "Class 9", icon: "⚛️", subtitle: "Atoms, Motion & Law" },
              { classId: "class_10" as EducationLevel, label: "Class 10", icon: "🎯", subtitle: "Board Exam Math & Science" },
              { classId: "class_11" as EducationLevel, label: "Class 11", icon: "🧬", subtitle: "Calculus, Physics & Bio" },
              { classId: "class_12" as EducationLevel, label: "Class 12", icon: "🏆", subtitle: "Senior Board & Advanced" },
            ].map((item) => (
              <button
                key={item.classId}
                type="button"
                onClick={() => handleLaunchClassQuiz(item.classId, `${item.label} Comprehensive Curriculum`)}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all hover:scale-[1.02] cursor-pointer ${
                  theme === "midnight"
                    ? "bg-slate-800/90 border-slate-700 hover:border-indigo-400"
                    : "bg-white/95 border-indigo-200/80 hover:border-indigo-400 hover:bg-white shadow-2xs"
                }`}
              >
                <span className="text-xl shrink-0">{item.icon}</span>
                <div className="min-w-0">
                  <div className="text-xs font-black text-slate-900 dark:text-slate-100 truncate">
                    {item.label}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate font-medium">
                    {item.subtitle}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Universal Academic Curriculum Bar (Standard view on Tablet/Laptop) */}
        <div
          className={`p-4 rounded-2xl border backdrop-blur-xs transition-colors duration-300 space-y-3 ${
            theme === "midnight"
              ? "bg-slate-900/90 border-slate-800 text-slate-100 shadow-md shadow-slate-950/40"
              : "bg-gradient-to-r from-indigo-50/90 via-white to-violet-50/90 border-indigo-100 text-slate-900 shadow-xs"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Library className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                    Explore Topics
                  </span>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-200">
                    Browse 100+ Topics
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Science, Math, Coding, History, Medicine, Languages, and more
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsSubjectsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-all shrink-0 self-start sm:self-auto cursor-pointer"
            >
              <span>See All Topics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Subject Launch Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
            {[
              { label: "Quantum Physics", icon: "⚛️" },
              { label: "Organic Chemistry", icon: "🧪" },
              { label: "Calculus & Math", icon: "📐" },
              { label: "Coding & Algorithms", icon: "⚡" },
              { label: "World History", icon: "🏛️" },
              { label: "Economics", icon: "📉" },
              { label: "Biology & Anatomy", icon: "🫀" },
              { label: "संस्कृतम् (Sanskrit)", icon: "🕉️" },
              { label: "Law & Justice", icon: "⚖️" },
              { label: "Psychology", icon: "🧠" },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => setIsSubjectsModalOpen(true)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-1 shrink-0 cursor-pointer ${
                  theme === "midnight"
                    ? "bg-slate-800/90 text-slate-200 border-slate-700 hover:border-indigo-400 hover:text-white"
                    : "bg-white text-slate-700 border-slate-200/90 hover:border-indigo-300 hover:bg-indigo-50/50 shadow-2xs"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => setIsSubjectsModalOpen(true)}
              className="px-2.5 py-1 rounded-lg text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 border border-indigo-200 whitespace-nowrap flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-indigo-600" />
              <span>+ Type Any Topic...</span>
            </button>
          </div>
        </div>

        {/* Current Quiz Banner & Controls */}
        <div
          className={`flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border backdrop-blur-xs transition-colors duration-300 ${
            theme === "midnight"
              ? "bg-slate-900/85 border-slate-800/90 text-slate-100 shadow-md shadow-slate-950/40"
              : "bg-white/85 sm:bg-gradient-to-r sm:from-indigo-50/80 sm:via-white/90 sm:to-slate-50/80 border-indigo-100/90 text-slate-900 shadow-xs"
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <FileUp className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div
                className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  theme === "midnight" ? "text-indigo-400" : "text-indigo-700"
                }`}
              >
                <span>Current Quiz</span>
                {currentQuiz.subjectName && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 font-bold border border-indigo-200">
                    {currentQuiz.subjectName}
                  </span>
                )}
                {isOffline && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-bold border border-amber-300">
                    OFFLINE
                  </span>
                )}
              </div>
              <div
                className={`text-sm font-bold truncate ${
                  theme === "midnight" ? "text-white" : "text-slate-900"
                }`}
              >
                {currentQuiz.documentName || currentQuiz.title}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Audio Toggle */}
            <button
              onClick={() => setSoundEnabled((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                soundEnabled
                  ? theme === "midnight"
                    ? "bg-slate-800 text-indigo-300 border-indigo-500/40 shadow-xs"
                    : "bg-white text-indigo-700 border-indigo-200 shadow-xs"
                  : theme === "midnight"
                  ? "bg-slate-900 text-slate-500 border-slate-800"
                  : "bg-slate-100 text-slate-400 border-slate-200"
              }`}
              title={soundEnabled ? "Sound on" : "Sound muted"}
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Sound On</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>Muted</span>
                </>
              )}
            </button>

            {/* Quick Upload / Switch PDF button */}
            <button
              onClick={() => setIsUploadOpen(true)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                theme === "midnight"
                  ? "bg-slate-800 text-slate-200 hover:text-white border-slate-700 hover:border-slate-600"
                  : "bg-white text-slate-700 hover:text-indigo-600 border-slate-200 hover:border-indigo-200 shadow-2xs"
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Change PDF</span>
            </button>

            {/* Teacher: Send Test to Class Group button */}
            {currentUser?.role === 'teacher' && (
              <button
                type="button"
                onClick={handleTeacherSendCurrentQuizToClass}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 shadow-xs transition-all cursor-pointer"
                title={`Assign this test to ${activeGroup.name} (Class code: ${activeGroup.code})`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Test to Class ({activeGroup.code})</span>
              </button>
            )}

            {/* Generate Fresh Questions */}
            <button
              onClick={handleRegenerateFreshQuiz}
              disabled={isRegeneratingQuiz}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-all cursor-pointer disabled:opacity-60"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isRegeneratingQuiz ? "Creating..." : "Fresh Questions"}</span>
            </button>
          </div>
        </div>

        {/* Quiz Body: QuizPlayer or ResultsView */}
        {!isCompleted ? (
          <QuizPlayer
            quiz={currentQuiz}
            userAnswers={userAnswers}
            onSelectAnswer={handleSelectAnswer}
            onClearAnswer={handleClearAnswer}
            onFinishQuiz={handleFinishQuiz}
            onAskQuestion={handleOpenAskTutor}
            onOpenJokeBreak={handleOpenJokeBreak}
            currentUser={currentUser}
            onOpenImagineCreativity={isImagineCreativityEnabled ? handleOpenImagineCreativity : undefined}
          />
        ) : (
          <ResultsView
            quiz={currentQuiz}
            userAnswers={userAnswers}
            onRetakeAll={handleRetakeAll}
            onRetakeMissed={handleRetakeMissed}
            onNewQuiz={() => setIsUploadOpen(true)}
            onOpenPrint={() => setIsPrintOpen(true)}
            onOpenGames={handleOpenGames}
            onOpenNotes={handleOpenNotes}
            onOpenImagineCreativity={isImagineCreativityEnabled ? handleOpenImagineCreativity : undefined}
            learningStreak={learningStreak}
          />
        )}
      </main>

      {/* Footer */}
      <footer
        className={`border-t py-6 text-center text-xs transition-colors duration-300 ${
          theme === "midnight"
            ? "border-slate-800/80 bg-slate-950/70 text-slate-500"
            : "border-slate-200/80 bg-white/70 text-slate-500"
        }`}
      >
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span>TestGen • Offline-Ready Test & Quiz Platform</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold">
              Class 1 to College
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDeviceModalOpen(true)}
              className="hover:text-indigo-600 transition-colors"
            >
              Device: <strong className="capitalize">{deviceType}</strong>
            </button>
            <span>•</span>
            <button
              onClick={() => setIsGroupModalOpen(true)}
              className="hover:text-indigo-600 transition-colors font-medium flex items-center gap-1.5"
            >
              <span>👥 Class:</span> <strong>{activeGroup ? activeGroup.name : (currentUser ? currentUser.groupName : "Guest")}</strong>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-indigo-100 text-indigo-900 border border-indigo-200">
                {activeGroup?.code || "CLS-910"}
              </span>
            </button>
            <span>•</span>
            <button
              onClick={handleToggleOffline}
              className="hover:text-indigo-600 transition-colors"
            >
              Status: <strong>{isOffline ? "Offline" : "Online"}</strong>
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {/* 1. Device Selection Modal */}
      <DeviceSelectionModal
        isOpen={isDeviceModalOpen}
        currentDevice={deviceType}
        onSelectDevice={handleSelectDevice}
        onClose={() => setIsDeviceModalOpen(false)}
        isInitialPrompt={!getDevicePreference()}
      />

      {/* 2. Classroom Auth Portal Modal (Student, Teacher, Admin) */}
      <ClassroomAuthModal
        isOpen={isLoginModalOpen}
        onLoginSuccess={handleLoginSuccess}
        onClose={() => setIsLoginModalOpen(false)}
        isInitialPrompt={!getClassroomAuth()}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenClassGroups={() => setIsGroupModalOpen(true)}
        onOpenPrincipalPanel={handleOpenPrincipalPanel}
        onOpenAdminPanel={handleOpenAdminPanel}
        onOpenTeacherDashboard={() => {
          setTeacherDashboardTab('faculty_groups');
          setIsTeacherDashboardOpen(true);
        }}
      />

      {/* 3. Classroom Group Roster Modal (70+ Students Capacity) */}
      <ClassroomGroupModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        currentUser={currentUser}
        onSwitchUser={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        onAssignQuizToGroup={(topic) => handleLaunchQuizFromNotes(topic)}
        currentQuiz={currentQuiz}
        onStartAssignedQuiz={(title, topic, fullData) => {
          if (fullData) {
            handleNewQuizGenerated(fullData);
          } else {
            handleLaunchQuizFromNotes(topic || title);
          }
        }}
      />

      {/* 4. Universal Academic Catalog Modal */}
      <UniversalSubjectExplorerModal
        isOpen={isSubjectsModalOpen}
        onClose={() => setIsSubjectsModalOpen(false)}
        onQuizGenerated={handleNewQuizGenerated}
        isOffline={isOffline}
      />

      {/* 6. Document Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onQuizGenerated={handleNewQuizGenerated}
      />

      {/* 7. Print Modal */}
      <PrintModal
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        quiz={currentQuiz}
      />

      {/* 8. Quiz History Modal */}
      <QuizHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectQuiz={(selectedQuiz) => {
          setCurrentQuiz({
            ...selectedQuiz,
            questions: ensureVariedMcqOptions(selectedQuiz.questions),
          });
          setUserAnswers({});
          setIsCompleted(false);
        }}
        currentQuizId={currentQuiz.id}
      />

      {/* 9. Ask Tutor Modal */}
      <AskQuestionModal
        isOpen={isAskModalOpen}
        onClose={() => {
          setIsAskModalOpen(false);
          setFocusedQuestion(undefined);
        }}
        contextQuestion={focusedQuestion}
        documentContext={currentQuiz.documentName ? `${currentQuiz.title} - ${currentQuiz.documentName}` : currentQuiz.title}
        defaultLanguage={currentQuiz.language || "en"}
        onOpenImagineCreativity={isImagineCreativityEnabled ? handleOpenImagineCreativity : undefined}
      />

      {/* 10. Chapter Games Modal */}
      <ChapterGamesModal
        isOpen={isGamesOpen}
        onClose={() => setIsGamesOpen(false)}
        quiz={currentQuiz}
      />

      {/* 11. Study Joke Modal */}
      <JokeBreakModal
        isOpen={isJokeModalOpen}
        onClose={() => setIsJokeModalOpen(false)}
        topicTitle={jokeTopic || currentQuiz.title}
        contextQuestion={jokeQuestionContext}
        defaultLanguage={currentQuiz.language || "en"}
      />

      {/* 12. Note Generator Modal */}
      <NoteGeneratorModal
        isOpen={isNotesModalOpen}
        onClose={() => setIsNotesModalOpen(false)}
        defaultTopic={notesTopic || currentQuiz.subjectName || currentQuiz.title}
        defaultLanguage={currentQuiz.language || "en"}
        onLaunchQuizFromNotes={handleLaunchQuizFromNotes}
      />

      {/* 13. Spotify Study Music Player Modal */}
      <SpotifyMusicPlayerModal
        isOpen={isMusicModalOpen}
        onClose={() => setIsMusicModalOpen(false)}
        playlist={musicPlaylist}
        currentTrackIndex={currentMusicIndex}
        isPlaying={isMusicPlaying}
        loopMode={musicLoopMode}
        onSetPlaylist={setMusicPlaylist}
        onSetCurrentIndex={setCurrentMusicIndex}
        onSetIsPlaying={setIsMusicPlaying}
        onSetLoopMode={setMusicLoopMode}
      />

      {/* Floating Spotify Music Mini-Bar when playing or active */}
      {!isMusicModalOpen && musicPlaylist.length > 0 && (
        <SpotifyMusicMiniBar
          currentTrack={musicPlaylist[currentMusicIndex]}
          isPlaying={isMusicPlaying}
          loopMode={musicLoopMode}
          playlistLength={musicPlaylist.length}
          onTogglePlay={() => setIsMusicPlaying(!isMusicPlaying)}
          onNextTrack={() => {
            const nextIdx = (currentMusicIndex + 1) % musicPlaylist.length;
            setCurrentMusicIndex(nextIdx);
            setIsMusicPlaying(true);
          }}
          onOpenModal={() => setIsMusicModalOpen(true)}
          theme={theme}
        />
      )}

      {/* 14. Teacher / Administrator Command Portal (Staff Room, Lesson Planner, Excel Sheets, Hidden from Students) */}
      <TeacherAdminDashboardModal
        isOpen={isTeacherDashboardOpen}
        onClose={() => setIsTeacherDashboardOpen(false)}
        currentUser={currentUser}
        initialTab={teacherDashboardTab}
        onLaunchQuizFromTopic={(topic) => handleLaunchQuizFromNotes(topic)}
        onGenerateQuizFromPdf={(title, sampleText) => handleLaunchQuizFromNotes(`${title}: ${sampleText.slice(0, 100)}`)}
        onAuthenticateRole={(auth) => setCurrentUser(auth)}
      />

      {/* 15. Imagine Ur Creativity Interactive Visual Animation Lab */}
      <ImagineCreativityModal
        isOpen={isImagineCreativityOpen}
        onClose={() => setIsImagineCreativityOpen(false)}
        initialQuestionPrompt={imagineCreativityPrompt}
        isOffline={isOffline}
      />

      {/* 16. Kicked Out Notice Modal */}
      {kickedAlert?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border-2 border-rose-500/80 rounded-3xl max-w-md w-full shadow-2xl p-6 text-center transform transition-all animate-scale-up">
            <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/60 border-2 border-rose-400 dark:border-rose-600 flex items-center justify-center mx-auto mb-4 text-rose-600 dark:text-rose-400">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 mb-2">
              <AlertTriangle className="w-3.5 h-3.5" /> Access Terminated
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
              Account Revoked by Administrator
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
              Account <span className="font-bold text-slate-900 dark:text-white">"{kickedAlert.name}"</span> ({kickedAlert.role}) has been removed from active session by <span className="font-semibold text-rose-600 dark:text-rose-400">{kickedAlert.adminName}</span>.
            </p>
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-300 text-left mb-6 font-mono leading-relaxed">
              <span className="font-bold block uppercase text-[10px] tracking-wider mb-1 text-rose-600 dark:text-rose-400">Admin Directive:</span>
              {kickedAlert.reason}
            </div>
            <button
              onClick={() => setKickedAlert(null)}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold transition-all shadow-md active:scale-95"
            >
              Acknowledge & Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
