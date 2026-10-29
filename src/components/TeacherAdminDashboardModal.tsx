import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Shield,
  GraduationCap,
  Users,
  BookOpen,
  Table,
  FileText,
  BarChart3,
  Settings,
  Plus,
  Trash2,
  Edit3,
  Save,
  Download,
  Upload,
  Check,
  ChevronDown,
  Sparkles,
  RefreshCw,
  Printer,
  AlertTriangle,
  ArrowRight,
  UserPlus,
  FileSpreadsheet,
  Calendar,
  Clock,
  Layers,
  Search,
  Filter,
  CheckCircle2,
  FileDown,
  Lock,
  UserX,
  Ban
} from 'lucide-react';
import {
  ClassroomUserAuth,
  FacultyTeacherGroup,
  FacultyTeacherMember,
  LessonPlan,
  LessonFlowStage,
  TeacherSpreadsheet,
  PdfSourceDocument,
  GlobalQuizSettings,
  CommonMistakeItem,
  TopicMasteryItem
} from '../types';
import {
  getFacultyTeacherGroups,
  saveFacultyTeacherGroups,
  createFacultyTeacherGroup,
  deleteFacultyTeacherGroup,
  addTeacherToFacultyGroup,
  removeTeacherFromFacultyGroup,
  getLessonPlans,
  saveLessonPlans,
  createLessonPlan,
  updateLessonPlan,
  deleteLessonPlan,
  getTeacherSpreadsheets,
  saveTeacherSpreadsheets,
  createTeacherSpreadsheet,
  updateTeacherSpreadsheet,
  deleteTeacherSpreadsheet,
  getPdfSources,
  addPdfSource,
  deletePdfSource,
  getGlobalQuizSettings,
  saveGlobalQuizSettings,
  getCommonMistakesData,
  getTopicMasteryData,
  getAggregatedClassStats,
  syncStaffConsoleFromBackend
} from '../utils/dashboardStorage';
import {
  getClassroomGroups,
  kickUserOut,
  getKickedUsers,
  pardonOrRevokeKick,
  KickedUserRecord,
  PRINCIPAL_PASSWORD,
  setClassroomAuth,
  isPrincipalPermitted,
  isOwnerOrAdminPermitted,
  isTeacherStaffPermitted,
  isUserKicked
} from '../utils/classroomStorage';

export type DashboardActiveTab =
  | 'principal_view'
  | 'faculty_groups'
  | 'lesson_planner'
  | 'excel_sheets'
  | 'pdf_sources'
  | 'student_analytics'
  | 'quiz_settings'
  | 'admin_kick_center';

interface TeacherAdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: ClassroomUserAuth | null;
  onLaunchQuizFromTopic?: (topic: string) => void;
  onGenerateQuizFromPdf?: (title: string, sampleText: string) => void;
  onMakeTest?: () => void;
  initialTab?: DashboardActiveTab;
  onAuthenticateRole?: (auth: ClassroomUserAuth) => void;
}

const FACULTY_GROUP_DRAFT_KEY = 'testgen_faculty_group_draft';

export const TeacherAdminDashboardModal: React.FC<TeacherAdminDashboardModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLaunchQuizFromTopic,
  onGenerateQuizFromPdf,
  onMakeTest,
  initialTab,
  onAuthenticateRole
}) => {
  const [activeTab, setActiveTab] = useState<DashboardActiveTab>(() => {
    if (initialTab) return initialTab;
    if (currentUser?.role === 'principal') return 'principal_view';
    if (currentUser?.role === 'admin') return 'admin_kick_center';
    return 'faculty_groups';
  });

  // Unlock Gate local state if user is unauthenticated or student
  const [unlockRole, setUnlockRole] = useState<'principal' | 'admin' | 'teacher'>(() => {
    if (initialTab === 'admin_kick_center') return 'admin';
    if (initialTab === 'principal_view') return 'principal';
    return 'principal';
  });
  const [unlockPasscode, setUnlockPasscode] = useState('');
  const [unlockError, setUnlockError] = useState('');
  const [unlockSuccess, setUnlockSuccess] = useState('');

  // Synchronize initialTab when opened
  useEffect(() => {
    if (isOpen) {
      if (initialTab) {
        setActiveTab(initialTab);
        if (initialTab === 'admin_kick_center') setUnlockRole('admin');
        else if (initialTab === 'principal_view') setUnlockRole('principal');
      } else if (currentUser?.role === 'principal') {
        setActiveTab('principal_view');
        setUnlockRole('principal');
      } else if (currentUser?.role === 'admin') {
        setActiveTab('admin_kick_center');
        setUnlockRole('admin');
      }
      setUnlockError('');
      setUnlockSuccess('');
    }
  }, [isOpen, initialTab, currentUser?.role]);

  // Strict role check: This dashboard is accessible for Teachers, Principals, and Admins!
  const isAuthorized = currentUser && (currentUser.role === 'admin' || currentUser.role === 'principal' || currentUser.role === 'teacher');

  // Principal View Heatmap & School Overview State
  const [heatmapSubjectFilter, setHeatmapSubjectFilter] = useState<'all' | 'mathematics' | 'sciences' | 'humanities'>('all');
  const [selectedHeatmapCell, setSelectedHeatmapCell] = useState<{
    subject: string;
    topic: string;
    classBand: string;
    score: number;
    testedCount: number;
    status: 'exceptional' | 'proficient' | 'developing' | 'critical';
    strengths: string;
    gapAnalysis: string;
    remediationAction: string;
  } | null>(null);
  const [schoolClassrooms, setSchoolClassrooms] = useState(() => getClassroomGroups());

  // Admin Kick Center State (Supreme Administrator power to kick anyone including Principal)
  const [kickedUsersList, setKickedUsersList] = useState<KickedUserRecord[]>(() => getKickedUsers());
  const [customKickTarget, setCustomKickTarget] = useState('');
  const [customKickRole, setCustomKickRole] = useState<'principal' | 'teacher' | 'student'>('principal');
  const [customKickReason, setCustomKickReason] = useState('Administrator mandate');
  const [kickPrincipalReason, setKickPrincipalReason] = useState('Executive Administrator mandate');
  const [confirmKickTarget, setConfirmKickTarget] = useState<{ name: string; role: 'principal' | 'teacher' | 'student'; id?: string; reason?: string } | null>(null);

  // Faculty Groups State
  const [facultyGroups, setFacultyGroups] = useState<FacultyTeacherGroup[]>([]);
  const [selectedFacultyGroup, setSelectedFacultyGroup] = useState<FacultyTeacherGroup | null>(null);
  const [isCreatingFacultyGroup, setIsCreatingFacultyGroup] = useState(false);
  const [newFacultyName, setNewFacultyName] = useState('');
  const [newFacultyDept, setNewFacultyDept] = useState('Science & Mathematics');
  const [newFacultyDesc, setNewFacultyDesc] = useState('');
  const [newFacultySchedule, setNewFacultySchedule] = useState('Every Wednesday • 3:30 PM');
  const [newFacultyBoard, setNewFacultyBoard] = useState('CBSE Standard');
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [hasRecoveredDraft, setHasRecoveredDraft] = useState(false);

  // Add Teacher Member to Faculty Group State
  const [isAddingTeacher, setIsAddingTeacher] = useState(false);
  const [addTeacherName, setAddTeacherName] = useState('');
  const [addTeacherSubject, setAddTeacherSubject] = useState('Physics & Mathematics');
  const [addTeacherGrade, setAddTeacherGrade] = useState('Class 9 to 10');
  const [addTeacherRole, setAddTeacherRole] = useState<'Principal / Head of School' | 'Head of Department' | 'Lead Teacher' | 'Senior Faculty'>('Lead Teacher');
  const [addTeacherContact, setAddTeacherContact] = useState('');

  // Lesson Plans State
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [selectedLessonPlan, setSelectedLessonPlan] = useState<LessonPlan | null>(null);
  const [isCreatingLessonPlan, setIsCreatingLessonPlan] = useState(false);
  const [lpTitle, setLpTitle] = useState('');
  const [lpUnit, setLpUnit] = useState('');
  const [lpGrade, setLpGrade] = useState('Class 10 (Board Exam)');
  const [lpSubject, setLpSubject] = useState('Biology & Natural Sciences');
  const [lpStandards, setLpStandards] = useState('CBSE Class 10 NCERT Chapter 6');
  const [lpDuration, setLpDuration] = useState('2 Weeks (6 Periods)');
  const [lpObjectives, setLpObjectives] = useState('');
  const [lpAssessment, setLpAssessment] = useState('10-Question Formative Class Test on TestGen');
  const [lpHomework, setLpHomework] = useState('Complete chapter review and practice questions');

  // Excel Spreadsheets State
  const [spreadsheets, setSpreadsheets] = useState<TeacherSpreadsheet[]>([]);
  const [activeSpreadsheetId, setActiveSpreadsheetId] = useState<string>('');
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [cellFormulaInput, setCellFormulaInput] = useState('');
  const [sheetSaveStatus, setSheetSaveStatus] = useState<string | null>(null);

  // PDF Sources State
  const [pdfSources, setPdfSources] = useState<PdfSourceDocument[]>([]);
  const [isAddingPdf, setIsAddingPdf] = useState(false);
  const [newPdfTitle, setNewPdfTitle] = useState('');
  const [newPdfSubject, setNewPdfSubject] = useState('Biology & Life Sciences');
  const [newPdfGrade, setNewPdfGrade] = useState('Class 10');
  const [newPdfSnippet, setNewPdfSnippet] = useState('');
  const [newPdfTags, setNewPdfTags] = useState('Life Processes, Photosynthesis, Respiration');

  // Global Quiz Settings State
  const [quizSettings, setQuizSettings] = useState<GlobalQuizSettings>(getGlobalQuizSettings());
  const [settingsSaveSuccess, setSettingsSaveSuccess] = useState(false);

  // Aggregated Analytics State
  const [commonMistakes, setCommonMistakes] = useState<CommonMistakeItem[]>([]);
  const [topicMastery, setTopicMastery] = useState<TopicMasteryItem[]>([]);
  const [classStats, setClassStats] = useState(getAggregatedClassStats());
  const [analyticsFilterSubject, setAnalyticsFilterSubject] = useState('all');

  // Toast / Notification
  const [actionToast, setActionToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 3500);
  };

  // Listen for backend RBAC rejection events
  useEffect(() => {
    const handleRbacAlert = (e: any) => {
      const detail = e.detail;
      const message = detail?.message || 'Access Denied: Role-Based Access Control restriction.';
      setActionToast(`⚠️ RBAC Alert: ${message}`);
    };
    window.addEventListener('staff-rbac-alert', handleRbacAlert);
    return () => window.removeEventListener('staff-rbac-alert', handleRbacAlert);
  }, []);

  // Listen for kicked users updates across components
  useEffect(() => {
    const handleKickedUpdated = () => {
      setKickedUsersList(getKickedUsers());
    };
    window.addEventListener('kicked-users-updated', handleKickedUpdated);
    return () => window.removeEventListener('kicked-users-updated', handleKickedUpdated);
  }, []);

  const handleExecuteKick = (target: { name: string; role: 'principal' | 'teacher' | 'student'; id?: string; reason?: string }) => {
    if (currentUser?.role !== 'admin') {
      showToast('⛔ Security Policy: Only Master Administrator has authority to kick users.');
      return;
    }
    const result = kickUserOut(
      { name: target.name, role: target.role, id: target.id, reason: target.reason || 'Terminated by Administrator mandate' },
      currentUser.userName
    );
    if (result.success) {
      showToast(result.message);
      setKickedUsersList(getKickedUsers());
      setConfirmKickTarget(null);
    } else {
      showToast(`⚠️ ${result.message}`);
    }
  };

  const handleRevokeKick = (nameOrId: string) => {
    if (currentUser?.role !== 'admin') {
      showToast('⛔ Only Administrator can pardon kicked users.');
      return;
    }
    const ok = pardonOrRevokeKick(nameOrId);
    if (ok) {
      showToast(`✅ Pardoned and restored access for "${nameOrId}".`);
      setKickedUsersList(getKickedUsers());
    }
  };

  // Load all data on mount or open, and synchronize with backend RBAC endpoints
  useEffect(() => {
    if (isOpen) {
      const groups = getFacultyTeacherGroups();
      setFacultyGroups(groups);
      if (groups.length > 0 && !selectedFacultyGroup) {
        setSelectedFacultyGroup(groups[0]);
      }

      const plans = getLessonPlans();
      setLessonPlans(plans);
      if (plans.length > 0 && !selectedLessonPlan) {
        setSelectedLessonPlan(plans[0]);
      }

      const sheets = getTeacherSpreadsheets();
      setSpreadsheets(sheets);
      if (sheets.length > 0 && !activeSpreadsheetId) {
        setActiveSpreadsheetId(sheets[0].id);
      }

      setPdfSources(getPdfSources());
      setQuizSettings(getGlobalQuizSettings());
      setCommonMistakes(getCommonMistakesData());
      setTopicMastery(getTopicMasteryData());
      setClassStats(getAggregatedClassStats());

      // Fetch fresh data from RBAC protected backend endpoints
      syncStaffConsoleFromBackend().then((synced) => {
        if (synced.groups && synced.groups.length > 0) {
          setFacultyGroups(synced.groups);
        }
        if (synced.lessonPlans && synced.lessonPlans.length > 0) {
          setLessonPlans(synced.lessonPlans);
        }
        if (synced.spreadsheets && synced.spreadsheets.length > 0) {
          setSpreadsheets(synced.spreadsheets);
        }
        if (synced.pdfSources && synced.pdfSources.length > 0) {
          setPdfSources(synced.pdfSources);
        }
        if (synced.settings) {
          setQuizSettings(synced.settings);
        }
      }).catch((e) => {
        console.warn('Backend sync completed with local cache.', e);
      });
    }
  }, [isOpen]);

  // Current active spreadsheet object
  const currentSpreadsheet = useMemo(() => {
    return spreadsheets.find((s) => s.id === activeSpreadsheetId) || spreadsheets[0] || null;
  }, [spreadsheets, activeSpreadsheetId]);

  if (!isOpen) return null;

  if (!isAuthorized) {
    const handleQuickUnlock = (role: 'principal' | 'admin' | 'teacher') => {
      if (role === 'principal') {
        const auth: ClassroomUserAuth = {
          role: 'principal',
          groupId: 'grp_principal_exec',
          groupName: 'Academic Council • Principal Executive',
          userName: 'Dr. A. K. Sen (Principal)',
          avatarEmoji: '🏛️',
          userTitle: 'School Principal',
          isLoggedIn: true,
          adminAuthorized: true,
          rollNumber: 'PRIN-001',
          studentId: 'PRIN-001'
        };
        setClassroomAuth(auth);
        if (onAuthenticateRole) onAuthenticateRole(auth);
        window.dispatchEvent(new CustomEvent('classroom-auth-changed', { detail: auth }));
        setActiveTab('principal_view');
        setUnlockSuccess('Principal access authorized! Loading Executive View...');
      } else if (role === 'admin') {
        const auth: ClassroomUserAuth = {
          role: 'admin',
          groupId: 'grp_admin_super',
          groupName: 'Central Academic Administration',
          userName: 'Pranav (Admin)',
          avatarEmoji: '🛡️',
          userTitle: 'Master Admin',
          isLoggedIn: true,
          adminAuthorized: true,
          rollNumber: 'ADMIN-001',
          studentId: 'ADMIN-001'
        };
        setClassroomAuth(auth);
        if (onAuthenticateRole) onAuthenticateRole(auth);
        window.dispatchEvent(new CustomEvent('classroom-auth-changed', { detail: auth }));
        setActiveTab('admin_kick_center');
        setUnlockSuccess('Administrator access authorized! Loading Admin Kick Center...');
      } else {
        const auth: ClassroomUserAuth = {
          role: 'teacher',
          groupId: 'grp_high_titans',
          groupName: 'Class 9 to 10 Board Group • Code: CLS-910',
          userName: 'Dr. Sunita Verma',
          avatarEmoji: '👨‍🏫',
          userTitle: 'Lead Teacher',
          isLoggedIn: true,
          teacherSubject: 'Biology & Natural Sciences',
          rollNumber: 'TCH-910',
          studentId: 'TCH-910'
        };
        setClassroomAuth(auth);
        if (onAuthenticateRole) onAuthenticateRole(auth);
        window.dispatchEvent(new CustomEvent('classroom-auth-changed', { detail: auth }));
        setActiveTab('faculty_groups');
        setUnlockSuccess('Faculty staff room unlocked!');
      }
    };

    const handleFormUnlock = (e: React.FormEvent) => {
      e.preventDefault();
      setUnlockError('');
      setUnlockSuccess('');

      if (unlockRole === 'principal') {
        const check = isPrincipalPermitted(unlockPasscode);
        if (!check.authorized) {
          setUnlockError(check.reason || 'Incorrect Principal passcode. Required password is 93247.');
          return;
        }
        handleQuickUnlock('principal');
      } else if (unlockRole === 'admin') {
        const check = isOwnerOrAdminPermitted(unlockPasscode, 'Pranav');
        if (!check.authorized) {
          setUnlockError(check.reason || 'Incorrect Admin passcode. Please enter ADMIN2026 or authorized master passkey.');
          return;
        }
        handleQuickUnlock('admin');
      } else {
        const check = isTeacherStaffPermitted(unlockPasscode || 'TEACHER2026');
        if (!check.authorized) {
          setUnlockError(check.reason || 'Incorrect Teacher passcode. Required password is TEACHER2026.');
          return;
        }
        handleQuickUnlock('teacher');
      }
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
        <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl border border-indigo-200 animate-in zoom-in-95 duration-200 my-auto">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-indigo-600 text-slate-950 flex items-center justify-center text-2xl font-black shadow-md">
                {unlockRole === 'principal' ? '🏛️' : unlockRole === 'admin' ? '🛡️' : '👨‍🏫'}
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {unlockRole === 'principal'
                    ? 'Principal Executive Panel Unlock'
                    : unlockRole === 'admin'
                    ? 'Administrator Command Center Unlock'
                    : 'Faculty Staff Portal Unlock'}
                </h3>
                <p className="text-xs text-slate-500">
                  {unlockRole === 'principal'
                    ? 'Official Passcode Required: 93247'
                    : unlockRole === 'admin'
                    ? 'Supreme Administrative Authority'
                    : 'Faculty & Curriculum Access'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Role Selector Tabs */}
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setUnlockRole('principal');
                setUnlockError('');
              }}
              className={`py-2 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                unlockRole === 'principal'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🏛️</span>
              <span>Principal</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setUnlockRole('admin');
                setUnlockError('');
              }}
              className={`py-2 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                unlockRole === 'admin'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🛡️</span>
              <span>Admin</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setUnlockRole('teacher');
                setUnlockError('');
              }}
              className={`py-2 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                unlockRole === 'teacher'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>👨‍🏫</span>
              <span>Teacher</span>
            </button>
          </div>

          {/* Passcode Form */}
          <form onSubmit={handleFormUnlock} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {unlockRole === 'principal'
                  ? 'Enter Principal Password (93247):'
                  : unlockRole === 'admin'
                  ? 'Enter Administrator Passkey (ADMIN2026 or 0192837465):'
                  : 'Enter Teacher Passcode (TEACHER2026):'}
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={unlockPasscode}
                  onChange={(e) => setUnlockPasscode(e.target.value)}
                  placeholder={
                    unlockRole === 'principal'
                      ? 'Enter 93247'
                      : unlockRole === 'admin'
                      ? 'Enter ADMIN2026'
                      : 'Enter TEACHER2026'
                  }
                  className="w-full h-11 px-4 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm font-semibold outline-none transition-all"
                  autoFocus
                />
              </div>
              {unlockError && (
                <p className="text-xs font-bold text-rose-600 mt-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{unlockError}</span>
                </p>
              )}
              {unlockSuccess && (
                <p className="text-xs font-bold text-emerald-600 mt-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{unlockSuccess}</span>
                </p>
              )}
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="submit"
                className={`w-full py-3 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-98 ${
                  unlockRole === 'principal'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-200'
                    : unlockRole === 'admin'
                    ? 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white shadow-rose-200'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>
                  {unlockRole === 'principal'
                    ? 'Verify & Open Principal Panel 🏛️'
                    : unlockRole === 'admin'
                    ? 'Verify & Open Admin Command Center 🛡️'
                    : 'Verify & Open Faculty Staff Room 👨‍🏫'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Instant 1-Click Shortcut */}
              <button
                type="button"
                onClick={() => handleQuickUnlock(unlockRole)}
                className="w-full py-2.5 px-3 rounded-xl border border-amber-300 bg-amber-50/80 hover:bg-amber-100 text-amber-950 text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>
                  {unlockRole === 'principal'
                    ? '⚡ 1-Click Instant Unlock as Principal (Passcode 93247)'
                    : unlockRole === 'admin'
                    ? '⚡ 1-Click Instant Unlock as Master Admin'
                    : '⚡ 1-Click Instant Unlock as Lead Teacher'}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // SPREADSHEET FORMULA EVALUATOR
  // ----------------------------------------------------
  const evaluateCellFormula = (val: string, rows: string[][]): string => {
    if (!val || typeof val !== 'string' || !val.startsWith('=')) {
      return val || '';
    }

    try {
      const formula = val.slice(1).trim().toUpperCase();

      // =SUM(C1:C10) or =AVG(D1:D10) or =AVERAGE(...) or =COUNT(...) or =MAX(...) or =MIN(...)
      const rangeMatch = formula.match(/^(SUM|AVG|AVERAGE|COUNT|MAX|MIN)\(([A-Z])(\d+):([A-Z])(\d+)\)$/);
      if (rangeMatch) {
        const fn = rangeMatch[1];
        const colLetter = rangeMatch[2];
        const startRowIdx = parseInt(rangeMatch[3], 10) - 1;
        const endRowIdx = parseInt(rangeMatch[5], 10) - 1;
        const colIdx = colLetter.charCodeAt(0) - 65; // 'A' -> 0, 'C' -> 2

        const numbers: number[] = [];
        for (let r = Math.max(0, startRowIdx); r <= Math.min(rows.length - 1, endRowIdx); r++) {
          if (rows[r] && rows[r][colIdx] !== undefined) {
            const cleanStr = String(rows[r][colIdx]).replace(/[^0-9.-]/g, '');
            const parsed = parseFloat(cleanStr);
            if (!isNaN(parsed)) numbers.push(parsed);
          }
        }

        if (fn === 'SUM') {
          return String(numbers.reduce((a, b) => a + b, 0));
        }
        if (fn === 'AVG' || fn === 'AVERAGE') {
          if (numbers.length === 0) return '0';
          const avg = numbers.reduce((a, b) => a + b, 0) / numbers.length;
          return avg.toFixed(1);
        }
        if (fn === 'COUNT') {
          return String(numbers.length);
        }
        if (fn === 'MAX') {
          return String(numbers.length > 0 ? Math.max(...numbers) : 0);
        }
        if (fn === 'MIN') {
          return String(numbers.length > 0 ? Math.min(...numbers) : 0);
        }
      }

      // Simple cell addition e.g. =C1+D1+E1
      const additionParts = formula.split('+');
      if (additionParts.length > 1) {
        let sum = 0;
        let allValid = true;
        for (const part of additionParts) {
          const m = part.trim().match(/^([A-Z])(\d+)$/);
          if (m) {
            const cIdx = m[1].charCodeAt(0) - 65;
            const rIdx = parseInt(m[2], 10) - 1;
            const rawVal = rows[rIdx]?.[cIdx] || '0';
            const num = parseFloat(String(rawVal).replace(/[^0-9.-]/g, ''));
            if (!isNaN(num)) sum += num;
          } else {
            const num = parseFloat(part.trim());
            if (!isNaN(num)) sum += num;
            else allValid = false;
          }
        }
        if (allValid) return String(sum);
      }

      return val;
    } catch {
      return val;
    }
  };

  // ----------------------------------------------------
  // HANDLERS FOR SPREADSHEETS
  // ----------------------------------------------------
  const handleCellChange = (rowIdx: number, colIdx: number, newVal: string) => {
    if (!currentSpreadsheet) return;
    const updatedRows = currentSpreadsheet.rows.map((r, rI) => {
      if (rI === rowIdx) {
        const rowCopy = [...r];
        rowCopy[colIdx] = newVal;
        return rowCopy;
      }
      return r;
    });

    const updatedSheet: TeacherSpreadsheet = {
      ...currentSpreadsheet,
      rows: updatedRows,
      lastEditedBy: currentUser?.userName || 'Teacher',
      updatedAt: Date.now()
    };

    updateTeacherSpreadsheet(currentSpreadsheet.id, updatedSheet);
    setSpreadsheets((prev) => prev.map((s) => (s.id === currentSpreadsheet.id ? updatedSheet : s)));
  };

  const handleAddSpreadsheetRow = () => {
    if (!currentSpreadsheet) return;
    const newRow = currentSpreadsheet.columns.map((_, i) => (i === 0 ? `STD-${1000 + currentSpreadsheet.rows.length + 1}` : ''));
    const updatedSheet: TeacherSpreadsheet = {
      ...currentSpreadsheet,
      rows: [...currentSpreadsheet.rows, newRow],
      updatedAt: Date.now()
    };
    updateTeacherSpreadsheet(currentSpreadsheet.id, updatedSheet);
    setSpreadsheets((prev) => prev.map((s) => (s.id === currentSpreadsheet.id ? updatedSheet : s)));
    showToast('Row added to spreadsheet!');
  };

  const handleExportSpreadsheetCsv = () => {
    if (!currentSpreadsheet) return;
    const lines = [
      currentSpreadsheet.headers.join(','),
      ...currentSpreadsheet.rows.map((r) =>
        r.map((c) => `"${evaluateCellFormula(c, currentSpreadsheet.rows).replace(/"/g, '""')}"`).join(',')
      )
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(lines.join('\n'));
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `${currentSpreadsheet.title.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Spreadsheet exported as CSV file successfully!');
  };

  // Autosave faculty group creation form to localStorage
  useEffect(() => {
    if (isCreatingFacultyGroup && (newFacultyName.trim() || newFacultyDesc.trim())) {
      try {
        localStorage.setItem(
          FACULTY_GROUP_DRAFT_KEY,
          JSON.stringify({
            name: newFacultyName,
            department: newFacultyDept,
            description: newFacultyDesc,
            schedule: newFacultySchedule,
            board: newFacultyBoard
          })
        );
      } catch {}
    }
  }, [isCreatingFacultyGroup, newFacultyName, newFacultyDept, newFacultyDesc, newFacultySchedule, newFacultyBoard]);

  // Navigation away prompt if there are unsaved faculty group changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isCreatingFacultyGroup && (newFacultyName.trim() || newFacultyDesc.trim())) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes in faculty group creation. Are you sure you want to leave?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isCreatingFacultyGroup, newFacultyName, newFacultyDesc]);

  // Safe Close Handler with Secondary Confirmation
  const handleAttemptClose = () => {
    if (isCreatingFacultyGroup && (newFacultyName.trim() || newFacultyDesc.trim())) {
      setShowDiscardConfirm(true);
      return;
    }
    onClose();
  };

  const handleAttemptCancelGroupForm = () => {
    if (newFacultyName.trim() || newFacultyDesc.trim()) {
      setShowDiscardConfirm(true);
      return;
    }
    setIsCreatingFacultyGroup(false);
  };

  const handleConfirmDiscard = () => {
    try {
      localStorage.removeItem(FACULTY_GROUP_DRAFT_KEY);
    } catch {}
    setNewFacultyName('');
    setNewFacultyDesc('');
    setHasRecoveredDraft(false);
    setIsCreatingFacultyGroup(false);
    setShowDiscardConfirm(false);
    showToast('Faculty group draft discarded.');
  };

  const handleOpenCreateFacultyGroup = () => {
    if (currentUser?.role !== 'admin' && currentUser?.role !== 'principal') {
      showToast('⛔ Permission Denied: Only Admin or Principal can create a group of teachers.');
      return;
    }
    try {
      const raw = localStorage.getItem(FACULTY_GROUP_DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw);
        if (draft.name) {
          setNewFacultyName(draft.name);
          if (draft.department) setNewFacultyDept(draft.department);
          if (draft.description) setNewFacultyDesc(draft.description);
          if (draft.schedule) setNewFacultySchedule(draft.schedule);
          if (draft.board) setNewFacultyBoard(draft.board);
          setHasRecoveredDraft(true);
        }
      }
    } catch {}
    setIsCreatingFacultyGroup(true);
  };

  // ----------------------------------------------------
  // HANDLERS FOR FACULTY GROUPS (ADMIN / PRINCIPAL ONLY)
  // ----------------------------------------------------
  const handleCreateFacultyGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFacultyName.trim()) return;

    // Strict RBAC: Only Admin or Principal can create a group of teachers!
    if (currentUser?.role !== 'admin' && currentUser?.role !== 'principal') {
      showToast('⛔ Access Denied: Only Admin or Principal can create a group of teachers.');
      return;
    }

    // Fix UI lag with React startTransition & optimistic state update
    React.startTransition(() => {
      const newGroup = createFacultyTeacherGroup({
        name: newFacultyName.trim(),
        department: newFacultyDept,
        description: newFacultyDesc.trim() || `Academic faculty group created by ${currentUser?.userName || 'Principal'}.`,
        createdByName: currentUser?.userName || 'Pranav (Principal)',
        meetingDay: newFacultySchedule,
        curriculumBoard: newFacultyBoard,
        teachers: [
          {
            id: `tch_${Date.now()}`,
            name: currentUser?.userName || 'Lead Faculty',
            subject: newFacultyDept,
            gradeLevel: 'Class 9 to 12',
            role: 'Principal / Head of School',
            contact: 'principal@school.edu',
            assignedClasses: ['CLS-910', 'CLS-112']
          }
        ]
      });

      try {
        localStorage.removeItem(FACULTY_GROUP_DRAFT_KEY);
      } catch {}

      setFacultyGroups(getFacultyTeacherGroups());
      setSelectedFacultyGroup(newGroup);
      setIsCreatingFacultyGroup(false);
      setNewFacultyName('');
      setNewFacultyDesc('');
      setHasRecoveredDraft(false);
      showToast(`Faculty Group "${newGroup.name}" created successfully!`);
    });
  };

  const handleAddTeacherToGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFacultyGroup || !addTeacherName.trim()) return;

    const teacherMember: FacultyTeacherMember = {
      id: `tch_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`,
      name: addTeacherName.trim(),
      subject: addTeacherSubject.trim(),
      gradeLevel: addTeacherGrade,
      role: addTeacherRole,
      contact: addTeacherContact.trim() || 'teacher@school.edu',
      assignedClasses: ['CLS-910']
    };

    addTeacherToFacultyGroup(selectedFacultyGroup.id, teacherMember);
    const updatedList = getFacultyTeacherGroups();
    setFacultyGroups(updatedList);
    const updatedSelected = updatedList.find((g) => g.id === selectedFacultyGroup.id) || null;
    setSelectedFacultyGroup(updatedSelected);
    setIsAddingTeacher(false);
    setAddTeacherName('');
    showToast(`Added ${teacherMember.name} to ${selectedFacultyGroup.name}!`);
  };

  // ----------------------------------------------------
  // HANDLERS FOR LESSON PLANNER
  // ----------------------------------------------------
  const handleCreateLessonPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lpTitle.trim()) return;

    const objs = lpObjectives.split('\n').filter((o) => o.trim().length > 0);
    const newLp = createLessonPlan({
      groupId: selectedFacultyGroup?.id || 'fac_stem_core',
      title: lpTitle.trim(),
      unit: lpUnit.trim() || 'Unit 1: Core Fundamentals',
      grade: lpGrade,
      subject: lpSubject,
      authorTeacher: currentUser?.userName || 'Lead Teacher',
      learningObjectives: objs.length > 0 ? objs : [
        'Understand fundamental concepts and core terminology.',
        'Demonstrate application in solving typical board exam problems.',
        'Evaluate common student misconceptions through formative assessment.'
      ],
      curriculumStandard: lpStandards,
      durationWeeks: lpDuration,
      flowStages: [
        {
          phase: 'Stage 1: Warm-up & Hook',
          description: 'Introduce engaging real-life observation or thought experiment to ignite curiosity.',
          durationMins: 15
        },
        {
          phase: 'Stage 2: Core Concept Breakdown',
          description: 'Step-by-step conceptual exploration using multimedia diagrams and chalkboard proofs.',
          durationMins: 35
        },
        {
          phase: 'Stage 3: Collaborative Class Activity',
          description: 'Pair-and-share exercise with hands-on practice worksheets.',
          durationMins: 30
        },
        {
          phase: 'Stage 4: Whole-Class Quiz Assessment',
          description: 'Deploy 10-question class test on TestGen for all 70+ students in group.',
          durationMins: 20
        }
      ],
      attachedMaterials: ['Curriculum Textbook Chapter PDF', 'Formula Summary Sheet'],
      assessmentStrategy: lpAssessment,
      homeworkNotes: lpHomework,
      status: 'approved'
    });

    const updatedPlans = getLessonPlans();
    setLessonPlans(updatedPlans);
    setSelectedLessonPlan(newLp);
    setIsCreatingLessonPlan(false);
    setLpTitle('');
    setLpUnit('');
    setLpObjectives('');
    showToast(`Lesson plan "${newLp.title}" published!`);
  };

  // ----------------------------------------------------
  // HANDLERS FOR PDF SOURCES
  // ----------------------------------------------------
  const handleAddPdf = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPdfTitle.trim()) return;

    const tags = newPdfTags.split(',').map((t) => t.trim()).filter(Boolean);
    const newDoc = addPdfSource({
      title: newPdfTitle.trim(),
      fileName: `${newPdfTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`,
      sizeBytes: Math.floor(2000000 + Math.random() * 4000000),
      uploadedBy: currentUser?.userName || 'Teacher',
      gradeLevel: newPdfGrade,
      subject: newPdfSubject,
      pageCount: Math.floor(18 + Math.random() * 45),
      topicTags: tags.length > 0 ? tags : ['Curriculum', 'Question Bank'],
      summary: `Uploaded curriculum textbook and question repository covering ${newPdfTitle}.`,
      sampleTextSnippet: newPdfSnippet.trim() || 'Comprehensive subject chapter text covering theory, worked examples, and end-of-chapter quiz questions.'
    });

    setPdfSources(getPdfSources());
    setIsAddingPdf(false);
    setNewPdfTitle('');
    setNewPdfSnippet('');
    showToast(`PDF Source "${newDoc.title}" added to academic library!`);
  };

  // ----------------------------------------------------
  // HANDLERS FOR GLOBAL QUIZ SETTINGS
  // ----------------------------------------------------
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveGlobalQuizSettings(quizSettings);
    setSettingsSaveSuccess(true);
    setTimeout(() => setSettingsSaveSuccess(false), 3000);
    showToast('Global quiz parameters saved across application!');
  };

  return (
    <div
      id="teacher-admin-dashboard-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
    >
      <div
        id="teacher-admin-dashboard-modal"
        className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl border border-indigo-200 overflow-hidden flex flex-col h-[94vh] max-h-[94vh] my-auto animate-in zoom-in-95 duration-200"
      >
        {/* HEADER BAR */}
        <div className="relative bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-4 sm:p-5 text-white shrink-0 flex items-center justify-between border-b border-indigo-900/60">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md shrink-0">
              {currentUser?.role === 'admin' ? (
                <Shield className="w-6 h-6 text-amber-300" />
              ) : currentUser?.role === 'principal' ? (
                <span className="text-2xl">🏛️</span>
              ) : (
                <GraduationCap className="w-6 h-6 text-indigo-200" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white truncate">
                  {currentUser?.role === 'admin'
                    ? 'Master Administrator Command Center'
                    : currentUser?.role === 'principal'
                    ? 'School Principal Executive Office'
                    : 'Teacher Staff Room & Academic Console'}
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  currentUser?.role === 'admin'
                    ? 'bg-rose-400 text-slate-950'
                    : currentUser?.role === 'principal'
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-indigo-300 text-slate-950'
                }`}>
                  {currentUser?.role === 'admin' ? 'Root Admin (Kick Authority)' : currentUser?.role === 'principal' ? 'Principal (Full Access)' : 'Lead Faculty'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hidden sm:inline-flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Backend RBAC Active ({currentUser?.role?.toUpperCase()})
                </span>
                <span className="text-xs text-indigo-300 font-semibold hidden md:inline">
                  • User: <strong className="text-white">{currentUser?.userName}</strong>
                </span>
              </div>
              <p className="text-xs text-indigo-200 truncate">
                {currentUser?.role === 'principal'
                  ? 'Complete Institutional Authority: Faculty Groups, Lesson Planner, Excel Sheets, PDF Sources & Global Parameters'
                  : currentUser?.role === 'admin'
                  ? 'Supreme Administrative Control: Power to kick anyone out including Principal, manage faculty, and govern all modules'
                  : 'Collaborative Teacher Groups, Lesson Planner, Interactive Excel Sheets, PDF Sources & Cohort Analytics'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-2">
            {onMakeTest && (
              <button
                type="button"
                onClick={onMakeTest}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-sm transition-all cursor-pointer shrink-0"
                title="Create custom class test with teacher options"
              >
                <span>📝 Make Class Test</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleAttemptClose}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="Close Dashboard"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TOAST ALERT */}
        {actionToast && (
          <div className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold flex items-center justify-between animate-in slide-in-from-top">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>{actionToast}</span>
            </div>
            <button onClick={() => setActionToast(null)} className="text-white/80 hover:text-white">✕</button>
          </div>
        )}

        {/* TAB NAVIGATION BAR (Visible ONLY for Teachers, Principals and Admins) */}
        <div className="bg-slate-100 border-b border-slate-200 px-3 py-2 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
          {/* PRINCIPAL EXECUTIVE VIEW TAB (Available to Principal and Admin) */}
          {(currentUser?.role === 'principal' || currentUser?.role === 'admin') && (
            <button
              type="button"
              id="principal-executive-view-tab-btn"
              onClick={() => setActiveTab('principal_view')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
                activeTab === 'principal_view'
                  ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 shadow-xs ring-2 ring-amber-300'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300'
              }`}
              title="Principal Executive Institutional Overview: Active Classrooms, Total School Count & Performance Heatmap"
            >
              <span className="text-sm">🏛️</span>
              <span>Principal View</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-950/15 text-amber-950 font-black">
                Heatmap & Cohorts
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('faculty_groups')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
              activeTab === 'faculty_groups'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>👥 Faculty Groups</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
              {facultyGroups.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('lesson_planner')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
              activeTab === 'lesson_planner'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>📝 Lesson Planner</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
              {lessonPlans.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('excel_sheets')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
              activeTab === 'excel_sheets'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>📊 Interactive Excel Sheets</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
              {spreadsheets.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pdf_sources')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
              activeTab === 'pdf_sources'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>📄 PDF Sources & Question Banks</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
              {pdfSources.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('student_analytics')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
              activeTab === 'student_analytics'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>📈 Student Cohort Analytics</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('quiz_settings')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
              activeTab === 'quiz_settings'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>⚙️ Global Quiz Parameters</span>
          </button>

          {/* SUPREME ADMIN KICK CENTER TAB (Accessible ONLY by Admin!) */}
          {currentUser?.role === 'admin' && (
            <button
              type="button"
              onClick={() => setActiveTab('admin_kick_center')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
                activeTab === 'admin_kick_center'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300'
              }`}
              title="Master Admin Authority: Kick anyone out of the platform, including the Principal, teachers, and students"
            >
              <Shield className="w-3.5 h-3.5 text-rose-500" />
              <span>🛡️ Admin Kick Center</span>
              {kickedUsersList.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-700 text-white font-extrabold">
                  {kickedUsersList.length} kicked
                </span>
              )}
            </button>
          )}
        </div>

        {/* BODY CONTAINER */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/60">
          {/* ======================================================== */}
          {/* TAB 0: SPECIFIC PRINCIPAL VIEW (ACTIVE CLASSROOMS, TOTAL SCHOOL STUDENT COUNT, PERFORMANCE HEATMAP) */}
          {/* ======================================================== */}
          {activeTab === 'principal_view' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Executive Header Card */}
              <div className="bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 border border-amber-300/80 rounded-3xl p-5 sm:p-6 shadow-xs relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-slate-950 flex items-center justify-center text-3xl shadow-md shrink-0 font-black">
                      🏛️
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                          School Principal Executive Dashboard
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 shadow-2xs">
                          Supreme Academic Authority
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Passcode 93247 Verified
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                        Comprehensive institutional oversight across all active school classrooms, total student enrollment, lead faculty management, and performance heatmaps across curriculum domains.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        window.print();
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-2xs transition-all cursor-pointer"
                      title="Export or print formal institutional accreditation report"
                    >
                      <Printer className="w-4 h-4 text-slate-500" />
                      <span>Print Accreditation Summary</span>
                    </button>
                    {onMakeTest && (
                      <button
                        type="button"
                        onClick={onMakeTest}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-xs transition-all cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 text-slate-950" />
                        <span>Deploy Institutional Test</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* KPI STATS ROW: TOTAL SCHOOL STUDENT COUNT & INSTITUTIONAL HEALTH */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Total School Student Count */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
                      Total School Students
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-slate-900 tracking-tight">
                        {Math.max(228, schoolClassrooms.reduce((acc, c) => acc + (c.students?.length || 0), 0))}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        / 300 Capacity
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 mt-2.5 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(100, Math.round((Math.max(228, schoolClassrooms.reduce((acc, c) => acc + (c.students?.length || 0), 0)) / 300) * 100))}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500 font-medium">
                      <span>4 Academic Divisions</span>
                      <span className="text-indigo-600 font-bold">Guaranteed 70+ / class</span>
                    </div>
                  </div>
                </div>

                {/* 2. Active Classrooms Count */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
                      Active Classrooms
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      <BookOpen className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-slate-900 tracking-tight">
                        {schoolClassrooms.length}
                      </span>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        100% Supervised
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2.5 line-clamp-1 font-medium">
                      Foundational, Middle, Board & Senior Apex
                    </p>
                    <div className="mt-2 text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> All classrooms curriculum-aligned
                    </div>
                  </div>
                </div>

                {/* 3. Overall Institution Mastery / Mean Accuracy */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
                      Institution Mean Mastery
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-slate-900 tracking-tight">
                        81.6%
                      </span>
                      <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        Grade A Distinction
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 mt-2.5 overflow-hidden">
                      <div className="bg-amber-500 h-2 rounded-full" style={{ width: '81.6%' }} />
                    </div>
                    <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500 font-medium">
                      <span>Benchmark: 75% CBSE</span>
                      <span className="text-emerald-600 font-bold">+6.6% Above Target</span>
                    </div>
                  </div>
                </div>

                {/* 4. Faculty & Evaluated Quizzes */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
                      Quizzes & Tests Administered
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-slate-900 tracking-tight">
                        254
                      </span>
                      <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                        Formative Quizzes
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2.5 font-medium">
                      Managed by 12 Lead Faculty & Teachers
                    </p>
                    <div className="mt-2 text-[11px] text-purple-700 font-semibold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Instant Concept Feedback Active
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION: SUMMARY OF ALL ACTIVE CLASSROOMS */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <span>🏫 Active Classroom Divisions Summary</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                        {schoolClassrooms.length} Divisions Active
                      </span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Real-time enrollment, lead teacher assignments, seat capacity tracking, and assigned test topics across all school grades.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('faculty_groups')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer self-start sm:self-auto"
                  >
                    <span>Manage Faculty Groups</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {schoolClassrooms.map((room) => {
                    const studentCount = Math.max(room.students?.length || 0, room.id === 'grp_sunflower' ? 58 : room.id === 'grp_middle_phoenix' ? 64 : room.id === 'grp_high_titans' ? 71 : 35);
                    const maxCap = room.maxCapacity || 75;
                    const fillPercent = Math.min(100, Math.round((studentCount / maxCap) * 100));
                    const avgScore = room.id === 'grp_sunflower' ? 89.2 : room.id === 'grp_middle_phoenix' ? 81.5 : room.id === 'grp_high_titans' ? 78.4 : 75.8;

                    return (
                      <div
                        key={room.id}
                        className="bg-slate-50/70 hover:bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-4.5 transition-all shadow-2xs hover:shadow-xs space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-indigo-600 text-white uppercase tracking-wider">
                                {room.gradeLevel}
                              </span>
                              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-white border border-slate-300 text-slate-700">
                                Code: {room.code}
                              </span>
                            </div>
                            <h5 className="text-sm font-black text-slate-900 mt-1.5">
                              {room.name}
                            </h5>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200 block">
                              Avg: {avgScore}%
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold block mt-0.5">
                              Division Score
                            </span>
                          </div>
                        </div>

                        {/* Teacher & Enrolled Stats */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/80 text-xs">
                          <div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase block">
                              Lead Teacher
                            </span>
                            <span className="font-black text-slate-800">
                              👨‍🏫 {room.teacherName || 'Faculty Assigned'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase block">
                              Enrolled Students
                            </span>
                            <span className="font-black text-slate-800">
                              🧑‍🎓 {studentCount} / {maxCap} Seats ({fillPercent}%)
                            </span>
                          </div>
                        </div>

                        {/* Capacity Bar */}
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${
                              fillPercent > 90 ? 'bg-amber-500' : fillPercent > 70 ? 'bg-indigo-600' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${fillPercent}%` }}
                          />
                        </div>

                        {/* Active Curriculum Test */}
                        <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between gap-2 text-xs">
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold text-indigo-700 uppercase block">
                              Assigned Test Topic:
                            </span>
                            <span className="font-bold text-slate-800 truncate block">
                              📝 {room.assignedQuizTitle || room.assignedQuizTopic || 'Unit Assessment Ready'}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md shrink-0">
                            {room.assignedQuizQuestions || 15} Qs
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION: OVERALL INSTITUTIONAL PERFORMANCE HEATMAP */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <span>🗺️ Overall Institutional Performance Heatmap</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-300">
                        Principal Executive Matrix
                      </span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Visual diagnostic heatmap evaluating curriculum mastery across 8 subject domains and 4 school classroom divisions. Click any cell to inspect learning gaps.
                    </p>
                  </div>

                  {/* Filter & Legend */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => setHeatmapSubjectFilter('all')}
                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          heatmapSubjectFilter === 'all'
                            ? 'bg-white text-indigo-950 font-black shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        All Domains
                      </button>
                      <button
                        type="button"
                        onClick={() => setHeatmapSubjectFilter('mathematics')}
                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          heatmapSubjectFilter === 'mathematics'
                            ? 'bg-white text-indigo-950 font-black shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Mathematics
                      </button>
                      <button
                        type="button"
                        onClick={() => setHeatmapSubjectFilter('sciences')}
                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          heatmapSubjectFilter === 'sciences'
                            ? 'bg-white text-indigo-950 font-black shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Sciences & Physics
                      </button>
                      <button
                        type="button"
                        onClick={() => setHeatmapSubjectFilter('humanities')}
                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          heatmapSubjectFilter === 'humanities'
                            ? 'bg-white text-indigo-950 font-black shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Linguistics & Logic
                      </button>
                    </div>
                  </div>
                </div>

                {/* Heatmap Color Scale Legend */}
                <div className="flex items-center gap-3 text-xs flex-wrap bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-slate-700">
                  <span className="font-black text-[11px] uppercase tracking-wide text-slate-500">
                    Mastery Scale:
                  </span>
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="w-3.5 h-3.5 rounded bg-emerald-500 border border-emerald-600 inline-block" />
                    <span>≥85% Exceptional</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="w-3.5 h-3.5 rounded bg-teal-500 border border-teal-600 inline-block" />
                    <span>75-84% Proficient</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="w-3.5 h-3.5 rounded bg-amber-400 border border-amber-500 inline-block" />
                    <span>65-74% Developing</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="w-3.5 h-3.5 rounded bg-rose-500 border border-rose-600 inline-block" />
                    <span>&lt;65% Remediation Required</span>
                  </div>
                </div>

                {/* Performance Heatmap Matrix Table */}
                <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-2xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-white font-black text-xs">
                        <th className="p-3.5 min-w-[200px]">Academic Curriculum Subject / Domain</th>
                        <th className="p-3.5 text-center min-w-[125px]">Class 1 to 5<br /><span className="text-[10px] font-medium text-slate-300">Foundational</span></th>
                        <th className="p-3.5 text-center min-w-[125px]">Class 6 to 8<br /><span className="text-[10px] font-medium text-slate-300">Middle School</span></th>
                        <th className="p-3.5 text-center min-w-[125px]">Class 9 to 10<br /><span className="text-[10px] font-medium text-slate-300">Secondary Board</span></th>
                        <th className="p-3.5 text-center min-w-[125px]">Class 11 to 12<br /><span className="text-[10px] font-medium text-slate-300">Senior Apex</span></th>
                        <th className="p-3.5 text-center min-w-[110px]">Institution Average</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-semibold bg-white">
                      {[
                        {
                          id: 'math_numbers',
                          domain: 'mathematics',
                          title: 'Numbers, Arithmetic & Algebra Foundations',
                          scores: { f: 94, m: 86, b: 79, s: 73 },
                          strengths: 'Rapid mental arithmetic and fractional conversion.',
                          gaps: 'Polynomial factorization under timed exam constraints.',
                          remediation: 'Assign 10-minute speed drills on TestGen.'
                        },
                        {
                          id: 'math_geometry',
                          domain: 'mathematics',
                          title: 'Geometry, Trigonometry & Coordinate Proofs',
                          scores: { f: 88, m: 78, b: 72, s: 63 },
                          strengths: 'Angle theorems and standard triangles.',
                          gaps: 'Trigonometric identities and 3D coordinate geometry in Class 12.',
                          remediation: 'Deploy visual diagram quiz with step-by-step proofs.'
                        },
                        {
                          id: 'sci_mechanics',
                          domain: 'sciences',
                          title: 'Physics: Mechanics, Waves & Ray Optics',
                          scores: { f: 91, m: 82, b: 75, s: 70 },
                          strengths: 'Laws of motion and refraction principles.',
                          gaps: 'Rotational dynamics and wave-particle duality.',
                          remediation: 'Incorporate interactive animations in Imagine Ur Creativity lab.'
                        },
                        {
                          id: 'sci_electricity',
                          domain: 'sciences',
                          title: 'Physics: Electricity, Magnetism & Circuits',
                          scores: { f: 89, m: 77, b: 71, s: 64 },
                          strengths: 'Ohm’s law and series/parallel resistor math.',
                          gaps: 'Electromagnetic induction and alternating current phasors.',
                          remediation: 'Convene departmental review with Dr. Vikram Malhotra.'
                        },
                        {
                          id: 'sci_chemistry',
                          domain: 'sciences',
                          title: 'Chemistry: Reactions, Equations & Periodic Trends',
                          scores: { f: 93, m: 80, b: 76, s: 68 },
                          strengths: 'Balancing oxidation-reduction equations.',
                          gaps: 'Organic reaction mechanisms and equilibrium constants.',
                          remediation: 'Schedule interactive formula spreadsheets practice.'
                        },
                        {
                          id: 'sci_biology',
                          domain: 'sciences',
                          title: 'Biology: Life Processes, Respiration & Genetics',
                          scores: { f: 96, m: 89, b: 84, s: 79 },
                          strengths: 'Cell structure and photosynthesis cycles.',
                          gaps: 'Mendelian inheritance cross ratios under exam pressure.',
                          remediation: 'Deploy weekly 15-question formative review quizzes.'
                        },
                        {
                          id: 'logic_reasoning',
                          domain: 'humanities',
                          title: 'Scientific Inquiry, Data Analysis & Empirical Logic',
                          scores: { f: 90, m: 83, b: 78, s: 76 },
                          strengths: 'Interpreting graphical test data and bar charts.',
                          gaps: 'Hypothesis framing and error percentage calculations.',
                          remediation: 'Integrate data interpretation questions into tests.'
                        },
                        {
                          id: 'lang_reading',
                          domain: 'humanities',
                          title: 'English Reading Comprehension & Subject Lexicon',
                          scores: { f: 92, m: 87, b: 85, s: 82 },
                          strengths: 'Vocabulary retention and contextual word inference.',
                          gaps: 'Distinguishing nuance in theoretical passage stems.',
                          remediation: 'Provide vocabulary flash notes in Note Generator.'
                        }
                      ]
                        .filter((item) => heatmapSubjectFilter === 'all' || item.domain === heatmapSubjectFilter)
                        .map((item) => {
                          const avg = Math.round((item.scores.f + item.scores.m + item.scores.b + item.scores.s) / 4);

                          const getCellColor = (val: number) => {
                            if (val >= 85) return 'bg-emerald-500/20 text-emerald-900 border-emerald-300 font-black hover:bg-emerald-500/35';
                            if (val >= 75) return 'bg-teal-500/20 text-teal-900 border-teal-300 font-bold hover:bg-teal-500/35';
                            if (val >= 65) return 'bg-amber-400/25 text-amber-950 border-amber-300 font-bold hover:bg-amber-400/40';
                            return 'bg-rose-500/20 text-rose-950 border-rose-300 font-black hover:bg-rose-500/35 animate-pulse';
                          };

                          return (
                            <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="p-3.5 font-bold text-slate-900">
                                <div className="flex items-center gap-2">
                                  <span>{item.domain === 'mathematics' ? '📐' : item.domain === 'sciences' ? '🔬' : '📖'}</span>
                                  <span>{item.title}</span>
                                </div>
                              </td>

                              {/* Class 1-5 */}
                              <td className="p-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => setSelectedHeatmapCell({
                                    subject: item.title,
                                    topic: 'Class 1 to 5 Foundational Group',
                                    classBand: 'Foundational (Primary)',
                                    score: item.scores.f,
                                    testedCount: 58,
                                    status: item.scores.f >= 85 ? 'exceptional' : 'proficient',
                                    strengths: item.strengths,
                                    gapAnalysis: item.gaps,
                                    remediationAction: item.remediation
                                  })}
                                  className={`w-full py-2 px-3 rounded-xl border text-xs cursor-pointer transition-all ${getCellColor(item.scores.f)}`}
                                >
                                  {item.scores.f}%
                                </button>
                              </td>

                              {/* Class 6-8 */}
                              <td className="p-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => setSelectedHeatmapCell({
                                    subject: item.title,
                                    topic: 'Class 6 to 8 Middle School Group',
                                    classBand: 'Middle School',
                                    score: item.scores.m,
                                    testedCount: 64,
                                    status: item.scores.m >= 85 ? 'exceptional' : item.scores.m >= 75 ? 'proficient' : 'developing',
                                    strengths: item.strengths,
                                    gapAnalysis: item.gaps,
                                    remediationAction: item.remediation
                                  })}
                                  className={`w-full py-2 px-3 rounded-xl border text-xs cursor-pointer transition-all ${getCellColor(item.scores.m)}`}
                                >
                                  {item.scores.m}%
                                </button>
                              </td>

                              {/* Class 9-10 */}
                              <td className="p-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => setSelectedHeatmapCell({
                                    subject: item.title,
                                    topic: 'Class 9 to 10 Board Exam Group',
                                    classBand: 'Secondary Board',
                                    score: item.scores.b,
                                    testedCount: 71,
                                    status: item.scores.b >= 85 ? 'exceptional' : item.scores.b >= 75 ? 'proficient' : 'developing',
                                    strengths: item.strengths,
                                    gapAnalysis: item.gaps,
                                    remediationAction: item.remediation
                                  })}
                                  className={`w-full py-2 px-3 rounded-xl border text-xs cursor-pointer transition-all ${getCellColor(item.scores.b)}`}
                                >
                                  {item.scores.b}%
                                </button>
                              </td>

                              {/* Class 11-12 */}
                              <td className="p-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => setSelectedHeatmapCell({
                                    subject: item.title,
                                    topic: 'Class 11 to 12 Senior Apex Group',
                                    classBand: 'Senior Secondary',
                                    score: item.scores.s,
                                    testedCount: 35,
                                    status: item.scores.s >= 85 ? 'exceptional' : item.scores.s >= 75 ? 'proficient' : item.scores.s >= 65 ? 'developing' : 'critical',
                                    strengths: item.strengths,
                                    gapAnalysis: item.gaps,
                                    remediationAction: item.remediation
                                  })}
                                  className={`w-full py-2 px-3 rounded-xl border text-xs cursor-pointer transition-all ${getCellColor(item.scores.s)}`}
                                >
                                  {item.scores.s}%
                                </button>
                              </td>

                              {/* Mean Average */}
                              <td className="p-3 text-center">
                                <span className={`px-2.5 py-1 rounded-xl text-xs font-black inline-block border ${
                                  avg >= 85
                                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                    : avg >= 75
                                    ? 'bg-teal-100 text-teal-900 border-teal-300'
                                    : 'bg-amber-100 text-amber-900 border-amber-300'
                                }`}>
                                  {avg}%
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>

                {/* MODAL / DRAWER DETAIL WHEN A CELL IS CLICKED */}
                {selectedHeatmapCell && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/80 border border-indigo-200 animate-in fade-in space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black px-2 py-0.5 rounded-md bg-indigo-600 text-white uppercase tracking-wider">
                            {selectedHeatmapCell.classBand}
                          </span>
                          <span className="text-xs font-bold text-slate-500">
                            Evaluated Sample: {selectedHeatmapCell.testedCount} Students
                          </span>
                        </div>
                        <h5 className="text-sm font-black text-slate-900 mt-1">
                          {selectedHeatmapCell.subject}
                        </h5>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-base font-black px-3 py-1 rounded-xl border ${
                          selectedHeatmapCell.score >= 85
                            ? 'bg-emerald-500 text-white border-emerald-600'
                            : selectedHeatmapCell.score >= 75
                            ? 'bg-teal-500 text-white border-teal-600'
                            : selectedHeatmapCell.score >= 65
                            ? 'bg-amber-500 text-white border-amber-600'
                            : 'bg-rose-600 text-white border-rose-700'
                        }`}>
                          {selectedHeatmapCell.score}% Mastery
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedHeatmapCell(null)}
                          className="w-7 h-7 rounded-lg bg-white hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer text-xs font-black"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                      <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <span className="text-[10px] font-black text-emerald-700 uppercase block mb-1">
                          ✅ Curriculum Strengths
                        </span>
                        <p className="text-slate-700 leading-relaxed font-medium">
                          {selectedHeatmapCell.strengths}
                        </p>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <span className="text-[10px] font-black text-amber-700 uppercase block mb-1">
                          ⚠️ Identified Learning Gaps
                        </span>
                        <p className="text-slate-700 leading-relaxed font-medium">
                          {selectedHeatmapCell.gapAnalysis}
                        </p>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <span className="text-[10px] font-black text-indigo-700 uppercase block mb-1">
                          🏛️ Principal Directive & Remediation
                        </span>
                        <p className="text-slate-700 leading-relaxed font-medium">
                          {selectedHeatmapCell.remediationAction}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 1: FACULTY TEACHER GROUPS (ADMIN / PRINCIPAL ROOM) */}
          {/* ======================================================== */}
          {activeTab === 'faculty_groups' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <span>👑 Principal & Faculty Teacher Groups</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900 font-bold">
                      Admin / Teacher Hub
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Admins and Principals can create groups of teachers to coordinate curriculum, lesson plans, and shared spreadsheets.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {onMakeTest && (
                    <button
                      type="button"
                      onClick={onMakeTest}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-xs transition-all cursor-pointer"
                    >
                      <span>📝 Make Test</span>
                    </button>
                  )}

                  {(currentUser?.role === 'admin' || currentUser?.role === 'principal') ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (isCreatingFacultyGroup) {
                          handleAttemptCancelGroupForm();
                        } else {
                          handleOpenCreateFacultyGroup();
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all cursor-pointer shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{isCreatingFacultyGroup ? 'Cancel' : 'Create Faculty Group'}</span>
                    </button>
                  ) : (
                    <div
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-500 border border-slate-300 shrink-0"
                      title="Only Principal or Admin can create faculty groups of teachers"
                    >
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Principal / Admin Only</span>
                    </div>
                  )}
                </div>
              </div>

              {/* CREATE FACULTY GROUP FORM (Admin Only with Autosave & Secondary Confirmation) */}
              {isCreatingFacultyGroup && (
                <form
                  onSubmit={handleCreateFacultyGroup}
                  className="bg-indigo-50/80 border border-indigo-200 rounded-2xl p-4 sm:p-5 space-y-4 animate-in fade-in"
                >
                  <div className="flex items-center justify-between border-b border-indigo-200 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-wider text-indigo-950">
                        New Teacher Faculty Council
                      </span>
                      {hasRecoveredDraft && (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-300 animate-pulse">
                          💾 Autosaved Draft Restored
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleAttemptCancelGroupForm}
                      className="text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Faculty Group Name *
                      </label>
                      <input
                        type="text"
                        value={newFacultyName}
                        onChange={(e) => setNewFacultyName(e.target.value)}
                        placeholder="e.g. Department of Physics & Advanced Sciences"
                        required
                        className="w-full h-10 px-3.5 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Department / Subject Area
                      </label>
                      <input
                        type="text"
                        value={newFacultyDept}
                        onChange={(e) => setNewFacultyDept(e.target.value)}
                        placeholder="e.g. Science & STEM"
                        className="w-full h-10 px-3.5 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Meeting Schedule / Cadence
                      </label>
                      <input
                        type="text"
                        value={newFacultySchedule}
                        onChange={(e) => setNewFacultySchedule(e.target.value)}
                        placeholder="e.g. Every Thursday • 3:30 PM"
                        className="w-full h-10 px-3.5 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Curriculum Framework
                      </label>
                      <input
                        type="text"
                        value={newFacultyBoard}
                        onChange={(e) => setNewFacultyBoard(e.target.value)}
                        placeholder="e.g. CBSE & NCERT Standard"
                        className="w-full h-10 px-3.5 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Group Scope & Description
                    </label>
                    <textarea
                      value={newFacultyDesc}
                      onChange={(e) => setNewFacultyDesc(e.target.value)}
                      placeholder="e.g. High school science committee for weekly board exam mock test creation and lesson synchronization."
                      rows={2}
                      className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsCreatingFacultyGroup(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer"
                    >
                      Save Faculty Group
                    </button>
                  </div>
                </form>
              )}

              {/* LIST OF FACULTY GROUPS & TEACHER ROSTERS */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Groups Selection Column */}
                <div className="space-y-3">
                  <span className="text-xs font-black uppercase text-slate-500 tracking-wider">
                    Select Faculty Group:
                  </span>
                  <div className="space-y-2">
                    {facultyGroups.map((group) => {
                      const isSelected = selectedFacultyGroup?.id === group.id;
                      return (
                        <div
                          key={group.id}
                          onClick={() => setSelectedFacultyGroup(group)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-50 border-indigo-400 shadow-xs ring-2 ring-indigo-200'
                              : 'bg-white hover:bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-slate-900">
                              {group.name}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-900">
                              {group.teachers.length} Faculty
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                            {group.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400 font-semibold">
                            <span>By: {group.createdByName}</span>
                            <span>•</span>
                            <span>{group.department}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Group Details & Teachers Roster */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-5">
                  {selectedFacultyGroup ? (
                    <>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-black text-slate-900">
                              {selectedFacultyGroup.name}
                            </h4>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                              Active Faculty
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {selectedFacultyGroup.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-slate-600 flex-wrap">
                            <span>📅 <strong>Schedule:</strong> {selectedFacultyGroup.meetingDay || 'Weekly'}</span>
                            <span>🏛️ <strong>Curriculum:</strong> {selectedFacultyGroup.curriculumBoard}</span>
                            <span>👤 <strong>Principal:</strong> {selectedFacultyGroup.createdByName}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsAddingTeacher(!isAddingTeacher)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 cursor-pointer shrink-0"
                        >
                          <UserPlus className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Add Teacher to Group</span>
                        </button>
                      </div>

                      {/* ADD TEACHER FORM */}
                      {isAddingTeacher && (
                        <form
                          onSubmit={handleAddTeacherToGroup}
                          className="p-4 rounded-xl bg-slate-50 border border-indigo-200 space-y-3"
                        >
                          <span className="text-xs font-black uppercase text-indigo-900 tracking-wider">
                            Assign Faculty Member to {selectedFacultyGroup.name}
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Teacher Full Name *
                              </label>
                              <input
                                type="text"
                                value={addTeacherName}
                                onChange={(e) => setAddTeacherName(e.target.value)}
                                placeholder="e.g. Dr. Ananya Sen"
                                required
                                className="w-full h-9 px-3 rounded-lg bg-white border border-slate-300 text-xs font-semibold"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Subject Specialization
                              </label>
                              <input
                                type="text"
                                value={addTeacherSubject}
                                onChange={(e) => setAddTeacherSubject(e.target.value)}
                                placeholder="e.g. Organic Chemistry"
                                className="w-full h-9 px-3 rounded-lg bg-white border border-slate-300 text-xs font-semibold"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Grade Level Assigned
                              </label>
                              <input
                                type="text"
                                value={addTeacherGrade}
                                onChange={(e) => setAddTeacherGrade(e.target.value)}
                                placeholder="e.g. Class 9 to 10"
                                className="w-full h-9 px-3 rounded-lg bg-white border border-slate-300 text-xs font-semibold"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Faculty Role
                              </label>
                              <select
                                value={addTeacherRole}
                                onChange={(e) => setAddTeacherRole(e.target.value as any)}
                                className="w-full h-9 px-3 rounded-lg bg-white border border-slate-300 text-xs font-semibold"
                              >
                                <option value="Lead Teacher">Lead Teacher</option>
                                <option value="Head of Department">Head of Department</option>
                                <option value="Senior Faculty">Senior Faculty</option>
                                <option value="Principal / Head of School">Principal / Head of School</option>
                              </select>
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setIsAddingTeacher(false)}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 bg-white border border-slate-300"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-3 py-1.5 rounded-lg text-xs font-black bg-indigo-600 text-white shadow-2xs"
                            >
                              Confirm Faculty Member
                            </button>
                          </div>
                        </form>
                      )}

                      {/* TEACHERS ROSTER TABLE */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700">
                            Faculty Teachers Roster ({selectedFacultyGroup.teachers.length} Members):
                          </span>
                        </div>

                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                              <tr>
                                <th className="p-3">Teacher Name</th>
                                <th className="p-3">Subject</th>
                                <th className="p-3">Assigned Grade</th>
                                <th className="p-3">Role</th>
                                <th className="p-3 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {selectedFacultyGroup.teachers.map((tch) => (
                                <tr key={tch.id} className="hover:bg-slate-50/80 transition-colors">
                                  <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-900 flex items-center justify-center font-black text-xs">
                                      👨‍🏫
                                    </div>
                                    <div>
                                      <div>{tch.name}</div>
                                      <div className="text-[10px] text-slate-400 font-normal">{tch.contact}</div>
                                    </div>
                                  </td>
                                  <td className="p-3 text-slate-700">{tch.subject}</td>
                                  <td className="p-3 text-slate-600">{tch.gradeLevel}</td>
                                  <td className="p-3">
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-900">
                                      {tch.role}
                                    </span>
                                  </td>
                                  <td className="p-3 text-right">
                                    {selectedFacultyGroup.teachers.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          removeTeacherFromFacultyGroup(selectedFacultyGroup.id, tch.id);
                                          const updatedList = getFacultyTeacherGroups();
                                          setFacultyGroups(updatedList);
                                          setSelectedFacultyGroup(updatedList.find((g) => g.id === selectedFacultyGroup.id) || null);
                                          showToast(`Removed ${tch.name} from group.`);
                                        }}
                                        className="text-rose-500 hover:text-rose-700 font-bold text-[11px]"
                                      >
                                        Remove
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12 text-slate-400 text-xs">
                      Select or create a faculty group to view members.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: INTERACTIVE LESSON PLANNER */}
          {/* ======================================================== */}
          {activeTab === 'lesson_planner' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <span>📝 Collaborative Lesson Planner</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 font-bold">
                      Teachers & Principal
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Design and synchronize unit learning goals, teaching stages, formative quiz assessments, and homework.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsCreatingLessonPlan(!isCreatingLessonPlan)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Lesson Plan</span>
                  </button>
                </div>
              </div>

              {/* CREATE LESSON PLAN FORM */}
              {isCreatingLessonPlan && (
                <form
                  onSubmit={handleCreateLessonPlan}
                  className="bg-purple-50/80 border border-purple-200 rounded-2xl p-4 sm:p-5 space-y-4 animate-in fade-in"
                >
                  <div className="flex items-center justify-between border-b border-purple-200 pb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-purple-950">
                      Draft New Curriculum Lesson Plan
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsCreatingLessonPlan(false)}
                      className="text-xs font-bold text-slate-500 hover:text-slate-900"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Lesson Plan Title *
                      </label>
                      <input
                        type="text"
                        value={lpTitle}
                        onChange={(e) => setLpTitle(e.target.value)}
                        placeholder="e.g. Electromagnetic Induction & Faraday's Laws"
                        required
                        className="w-full h-10 px-3.5 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Unit / Chapter Code
                      </label>
                      <input
                        type="text"
                        value={lpUnit}
                        onChange={(e) => setLpUnit(e.target.value)}
                        placeholder="e.g. Unit 3: Electromagnetism"
                        className="w-full h-10 px-3.5 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Subject & Grade Level
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={lpSubject}
                          onChange={(e) => setLpSubject(e.target.value)}
                          placeholder="Subject"
                          className="h-10 px-3 rounded-xl bg-white border border-slate-300 text-xs font-semibold"
                        />
                        <input
                          type="text"
                          value={lpGrade}
                          onChange={(e) => setLpGrade(e.target.value)}
                          placeholder="Grade"
                          className="h-10 px-3 rounded-xl bg-white border border-slate-300 text-xs font-semibold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Curriculum Standards & Duration
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={lpStandards}
                          onChange={(e) => setLpStandards(e.target.value)}
                          placeholder="Standard (CBSE/ICSE)"
                          className="h-10 px-3 rounded-xl bg-white border border-slate-300 text-xs font-semibold"
                        />
                        <input
                          type="text"
                          value={lpDuration}
                          onChange={(e) => setLpDuration(e.target.value)}
                          placeholder="e.g. 2 Weeks"
                          className="h-10 px-3 rounded-xl bg-white border border-slate-300 text-xs font-semibold"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Key Learning Objectives (1 per line)
                    </label>
                    <textarea
                      value={lpObjectives}
                      onChange={(e) => setLpObjectives(e.target.value)}
                      placeholder="e.g.&#10;State Faraday's law of electromagnetic induction.&#10;Apply Lenz's rule to predict induced current direction.&#10;Calculate induced EMF in moving conductor."
                      rows={3}
                      className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Formative Assessment Strategy
                      </label>
                      <input
                        type="text"
                        value={lpAssessment}
                        onChange={(e) => setLpAssessment(e.target.value)}
                        placeholder="e.g. 15-question TestGen diagnostic quiz"
                        className="w-full h-9 px-3 rounded-xl bg-white border border-slate-300 text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Homework & Reinforcement Tasks
                      </label>
                      <input
                        type="text"
                        value={lpHomework}
                        onChange={(e) => setLpHomework(e.target.value)}
                        placeholder="e.g. NCERT Exercise 6.1 - 6.5"
                        className="w-full h-9 px-3 rounded-xl bg-white border border-slate-300 text-xs font-semibold"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsCreatingLessonPlan(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl text-xs font-black bg-purple-700 hover:bg-purple-800 text-white shadow-xs cursor-pointer"
                    >
                      Publish Lesson Plan
                    </button>
                  </div>
                </form>
              )}

              {/* LESSON PLANS DIRECTORY & DETAIL VIEW */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* List column */}
                <div className="space-y-3">
                  <span className="text-xs font-black uppercase text-slate-500 tracking-wider">
                    Curriculum Lesson Plans ({lessonPlans.length}):
                  </span>
                  <div className="space-y-2">
                    {lessonPlans.map((lp) => {
                      const isSelected = selectedLessonPlan?.id === lp.id;
                      return (
                        <div
                          key={lp.id}
                          onClick={() => setSelectedLessonPlan(lp)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-purple-50 border-purple-400 shadow-xs ring-2 ring-purple-200'
                              : 'bg-white hover:bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-slate-900 truncate">
                              {lp.title}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded uppercase font-extrabold bg-purple-100 text-purple-900 shrink-0">
                              {lp.status}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-1">
                            {lp.subject} • {lp.grade}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-2 flex items-center justify-between">
                            <span>Author: {lp.authorTeacher}</span>
                            <span>{lp.durationWeeks}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Lesson Plan Detailed View */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-5">
                  {selectedLessonPlan ? (
                    <>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-black text-slate-900">
                              {selectedLessonPlan.title}
                            </h4>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-black uppercase bg-emerald-100 text-emerald-800">
                              {selectedLessonPlan.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {selectedLessonPlan.unit} • {selectedLessonPlan.curriculumStandard}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-slate-600 flex-wrap">
                            <span>👨‍🏫 <strong>Author:</strong> {selectedLessonPlan.authorTeacher}</span>
                            <span>⏱️ <strong>Duration:</strong> {selectedLessonPlan.durationWeeks}</span>
                            <span>🎯 <strong>Subject:</strong> {selectedLessonPlan.subject}</span>
                          </div>
                        </div>

                        {onLaunchQuizFromTopic && (
                          <button
                            type="button"
                            onClick={() => {
                              onLaunchQuizFromTopic(selectedLessonPlan.title);
                              onClose();
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-amber-600 text-purple-950 shadow-xs cursor-pointer shrink-0"
                            title="Generate a whole-class test for this lesson"
                          >
                            <Sparkles className="w-3.5 h-3.5 fill-current" />
                            <span>Generate Class Test</span>
                          </button>
                        )}
                      </div>

                      {/* Learning Objectives */}
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                          🎯 Learning Objectives & Standards
                        </span>
                        <ul className="space-y-1 text-xs text-slate-700">
                          {selectedLessonPlan.learningObjectives.map((obj, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-purple-600 font-bold shrink-0">✓</span>
                              <span>{obj}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Teaching Flow Stages */}
                      <div className="space-y-2.5">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                          ⏱️ Instructional Flow & Period Breakdown
                        </span>
                        <div className="space-y-2">
                          {selectedLessonPlan.flowStages.map((stg, i) => (
                            <div
                              key={i}
                              className="p-3 rounded-xl border border-slate-200 bg-white flex items-start justify-between gap-3"
                            >
                              <div className="space-y-1">
                                <div className="text-xs font-black text-slate-900">
                                  {stg.phase}
                                </div>
                                <div className="text-xs text-slate-600 leading-relaxed">
                                  {stg.description}
                                </div>
                              </div>
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 text-slate-700 shrink-0">
                                {stg.durationMins} mins
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Assessment & Homework */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-1">
                          <span className="font-black text-indigo-950 block">
                            📊 Formative Assessment
                          </span>
                          <p className="text-indigo-800">
                            {selectedLessonPlan.assessmentStrategy}
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
                          <span className="font-black text-amber-950 block">
                            📚 Homework / Lab Work
                          </span>
                          <p className="text-amber-800">
                            {selectedLessonPlan.homeworkNotes}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12 text-slate-400 text-xs">
                      Select a lesson plan to view instructional breakdown.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: INTERACTIVE EXCEL SPREADSHEETS */}
          {/* ======================================================== */}
          {activeTab === 'excel_sheets' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <span>📊 Interactive Excel Sheets & Gradebooks</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold">
                      Live Formula Grid
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Full spreadsheet engine supporting live cells, automatic calculations (=SUM, =AVG, =COUNT), and CSV/Excel exports.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <button
                    type="button"
                    onClick={handleAddSpreadsheetRow}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Row</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportSpreadsheetCsv}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV / Excel</span>
                  </button>
                </div>
              </div>

              {/* SHEET SELECTOR BUTTONS */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {spreadsheets.map((sheet) => (
                  <button
                    key={sheet.id}
                    type="button"
                    onClick={() => setActiveSpreadsheetId(sheet.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                      activeSpreadsheetId === sheet.id
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                    }`}
                  >
                    {sheet.title}
                  </button>
                ))}
              </div>

              {/* SPREADSHEET FORMULA BAR */}
              {currentSpreadsheet && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center gap-3 text-xs">
                    <span className="font-mono font-black text-slate-500 uppercase px-2 py-1 rounded bg-slate-200">
                      fx
                    </span>
                    <input
                      type="text"
                      placeholder="Cell formula or value (e.g. '=SUM(C1:C10)' or '=C1+D1' or '95')"
                      value={cellFormulaInput}
                      onChange={(e) => {
                        setCellFormulaInput(e.target.value);
                        if (selectedCell) {
                          handleCellChange(selectedCell.row, selectedCell.col, e.target.value);
                        }
                      }}
                      className="flex-1 h-8 px-3 rounded-lg border border-slate-300 bg-white font-mono text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="text-[11px] text-slate-400">
                      Formulas supported: =SUM(A1:A10), =AVG(C1:C10), =COUNT(...)
                    </span>
                  </div>

                  {/* INTERACTIVE TABLE GRID */}
                  <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                    <table className="w-full border-collapse text-left text-xs">
                      {/* Column letters row (A, B, C...) */}
                      <thead className="bg-slate-100 text-slate-500 sticky top-0 z-10 font-mono text-[11px]">
                        <tr>
                          <th className="w-12 p-2 text-center border border-slate-200 bg-slate-200">#</th>
                          {currentSpreadsheet.headers.map((h, colIdx) => (
                            <th key={colIdx} className="p-2 border border-slate-200 font-bold text-slate-800">
                              <div className="text-[10px] text-slate-400 font-normal">
                                Col {String.fromCharCode(65 + colIdx)}
                              </div>
                              <div className="truncate">{h}</div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {currentSpreadsheet.rows.map((row, rowIdx) => {
                          const isSummaryRow = row[0] === 'SUMMARY';
                          return (
                            <tr
                              key={rowIdx}
                              className={isSummaryRow ? 'bg-emerald-50/70 font-black' : 'hover:bg-slate-50'}
                            >
                              {/* Row Number */}
                              <td className="w-12 p-2 text-center border border-slate-200 font-mono text-[11px] text-slate-400 bg-slate-50 select-none">
                                {rowIdx + 1}
                              </td>

                              {/* Editable Cells */}
                              {row.map((rawCellVal, colIdx) => {
                                const isSelected =
                                  selectedCell?.row === rowIdx && selectedCell?.col === colIdx;
                                const evaluated = evaluateCellFormula(rawCellVal, currentSpreadsheet.rows);

                                return (
                                  <td
                                    key={colIdx}
                                    onClick={() => {
                                      setSelectedCell({ row: rowIdx, col: colIdx });
                                      setCellFormulaInput(rawCellVal);
                                    }}
                                    className={`p-1.5 border border-slate-200 transition-colors ${
                                      isSelected
                                        ? 'ring-2 ring-emerald-500 bg-emerald-50'
                                        : ''
                                    }`}
                                  >
                                    <input
                                      type="text"
                                      value={isSelected ? rawCellVal : evaluated}
                                      onChange={(e) => {
                                        handleCellChange(rowIdx, colIdx, e.target.value);
                                        setCellFormulaInput(e.target.value);
                                      }}
                                      onFocus={() => {
                                        setSelectedCell({ row: rowIdx, col: colIdx });
                                        setCellFormulaInput(rawCellVal);
                                      }}
                                      className="w-full px-1.5 py-1 text-xs font-medium text-slate-900 bg-transparent focus:outline-none"
                                    />
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
                    <span>
                      Last modified by: <strong>{currentSpreadsheet.lastEditedBy}</strong> • Total Rows: {currentSpreadsheet.rows.length}
                    </span>
                    <span className="text-[11px] text-emerald-700 font-bold">
                      ✓ Changes automatically preserved in local classroom storage
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: PDF SOURCES & CURRICULUM REPOSITORY */}
          {/* ======================================================== */}
          {activeTab === 'pdf_sources' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <span>📄 PDF Sources & Curriculum Textbooks</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 font-bold">
                      Question Banks
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Manage reference PDFs used by the TestGen AI Engine to generate curriculum-aligned test questions.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddingPdf(!isAddingPdf)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer shrink-0"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload / Add PDF Source</span>
                </button>
              </div>

              {/* UPLOAD FORM */}
              {isAddingPdf && (
                <form
                  onSubmit={handleAddPdf}
                  className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 sm:p-5 space-y-4 animate-in fade-in"
                >
                  <span className="text-xs font-black uppercase tracking-wider text-blue-950 block border-b border-blue-200 pb-2">
                    Add PDF Document to Academic Library
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Document Title *
                      </label>
                      <input
                        type="text"
                        value={newPdfTitle}
                        onChange={(e) => setNewPdfTitle(e.target.value)}
                        placeholder="e.g. NCERT Class 10: Chemical Reactions & Equations"
                        required
                        className="w-full h-10 px-3.5 rounded-xl bg-white border border-slate-300 text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Subject & Grade
                      </label>
                      <input
                        type="text"
                        value={newPdfSubject}
                        onChange={(e) => setNewPdfSubject(e.target.value)}
                        placeholder="Subject"
                        className="w-full h-10 px-3.5 rounded-xl bg-white border border-slate-300 text-xs font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Sample Text Extract / Key Chapter Snippet
                    </label>
                    <textarea
                      value={newPdfSnippet}
                      onChange={(e) => setNewPdfSnippet(e.target.value)}
                      placeholder="Paste introductory or theoretical text here for instant test generation context..."
                      rows={3}
                      className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs text-slate-900"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingPdf(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                    >
                      Save PDF Source
                    </button>
                  </div>
                </form>
              )}

              {/* PDF LIST */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pdfSources.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-black text-sm shrink-0">
                          PDF
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-900 line-clamp-1">
                            {doc.title}
                          </h4>
                          <span className="text-[10px] text-slate-500">
                            {doc.subject} • {doc.gradeLevel} • {doc.pageCount} Pages
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          deletePdfSource(doc.id);
                          setPdfSources(getPdfSources());
                          showToast(`Removed "${doc.title}"`);
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                        title="Delete Source"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {doc.summary || doc.sampleTextSnippet}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <span className="text-[10px] text-slate-400">
                        Uploaded by: {doc.uploadedBy}
                      </span>

                      {onGenerateQuizFromPdf && (
                        <button
                          type="button"
                          onClick={() => {
                            onGenerateQuizFromPdf(doc.title, doc.sampleTextSnippet || doc.summary || '');
                            onClose();
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-[11px] bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Generate Quiz From PDF</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 5: AGGREGATED STUDENT PERFORMANCE & MASTERY ANALYTICS */}
          {/* ======================================================== */}
          {activeTab === 'student_analytics' && (
            <div className="space-y-6">
              {/* Stat metric cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Total Enrolled Cohort
                  </span>
                  <div className="text-2xl font-black text-indigo-950">
                    {classStats.totalEnrolledStudents} / {classStats.maxGuaranteedSeats}
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold">
                    👥 Guaranteed 70+ capacity per class
                  </span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Class Accuracy Rate
                  </span>
                  <div className="text-2xl font-black text-emerald-600">
                    {classStats.averageAccuracyPercentage}%
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Across all subject tests
                  </span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Quizzes Completed
                  </span>
                  <div className="text-2xl font-black text-purple-700">
                    {classStats.totalQuizzesTaken}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Interactive submissions
                  </span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Active Classrooms
                  </span>
                  <div className="text-2xl font-black text-amber-600">
                    {classStats.totalClassrooms}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Class 1 through Class 12
                  </span>
                </div>
              </div>

              {/* COMMON MISTAKES ANALYSIS */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    <h4 className="text-sm font-black text-slate-900">
                      Top Aggregated Student Mistakes & Remediation Guide
                    </h4>
                  </div>
                  <span className="text-xs text-slate-500">
                    Identified across 70+ student submissions
                  </span>
                </div>

                <div className="space-y-3">
                  {commonMistakes.map((mst) => (
                    <div
                      key={mst.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-100 text-indigo-900 uppercase">
                              {mst.subject}
                            </span>
                            <span className="text-xs font-black text-slate-900">
                              {mst.topic}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1 italic">
                            Question: "{mst.questionSample}"
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="px-2 py-1 rounded-md text-xs font-black bg-rose-100 text-rose-700">
                            {mst.errorRatePercentage}% Error Rate
                          </span>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {mst.studentsAffected} students tripped
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                        <div className="p-2.5 rounded-lg bg-rose-50/80 border border-rose-200 text-rose-950">
                          <strong className="block text-rose-800 text-[11px]">Common Misconception:</strong>
                          <span>{mst.commonIncorrectAnswer}</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200 text-emerald-950">
                          <strong className="block text-emerald-800 text-[11px]">Accurate Fact:</strong>
                          <span>{mst.correctAnswer}</span>
                        </div>
                      </div>

                      <div className="p-2 rounded-lg bg-amber-50 text-amber-900 text-xs font-medium">
                        💡 <strong>Teacher Remediation Advice:</strong> {mst.remediationAdvice}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* TOPIC MASTERY BREAKDOWN */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
                <h4 className="text-sm font-black text-slate-900">
                  Curriculum Topic Mastery Levels
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {topicMastery.map((tm) => {
                    const tierBadge =
                      tm.masteryTier === 'advanced'
                        ? 'bg-emerald-100 text-emerald-800'
                        : tm.masteryTier === 'proficient'
                        ? 'bg-indigo-100 text-indigo-800'
                        : tm.masteryTier === 'developing'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800';

                    return (
                      <div
                        key={tm.id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between"
                      >
                        <div className="space-y-1">
                          <div className="text-xs font-black text-slate-900">
                            {tm.topic}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {tm.subject} • {tm.gradeLevel} • {tm.studentsAssessed} Assessed
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${tierBadge}`}>
                            {tm.masteryTier.replace('_', ' ')}
                          </span>
                          <div className="text-xs font-black text-slate-900 mt-1">
                            {tm.averageScorePercentage}% Avg
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 6: GLOBAL QUIZ PARAMETERS & CONFIGURATION */}
          {/* ======================================================== */}
          {activeTab === 'quiz_settings' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <h3 className="text-base font-black text-slate-900">
                  Global Quiz Parameters & Exam Rules
                </h3>
                <p className="text-xs text-slate-500">
                  Configure default test limits, question formats, passing thresholds, and strict proctoring modes.
                </p>
              </div>

              {settingsSaveSuccess && (
                <div className="p-3 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Global quiz parameters saved successfully!</span>
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Default Quiz Difficulty
                  </label>
                  <select
                    value={quizSettings.defaultDifficulty}
                    onChange={(e) => setQuizSettings({ ...quizSettings, defaultDifficulty: e.target.value as any })}
                    className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800"
                  >
                    <option value="easy">Easy (Foundational & Definitions)</option>
                    <option value="medium">Medium (Standard Board Exam Level)</option>
                    <option value="hard">Hard (Advanced Problem Solving & Numerical)</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Time Limit (Minutes)
                    </label>
                    <select
                      value={quizSettings.timeLimitMinutes}
                      onChange={(e) => setQuizSettings({ ...quizSettings, timeLimitMinutes: parseInt(e.target.value, 10) })}
                      className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800"
                    >
                      <option value={0}>Unlimited / Practice Mode</option>
                      <option value={10}>10 Minutes (Speed Test)</option>
                      <option value={15}>15 Minutes (Standard Class Test)</option>
                      <option value={30}>30 Minutes (Midterm Unit Test)</option>
                      <option value={45}>45 Minutes (Full Exam Mode)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Default Questions Count
                    </label>
                    <select
                      value={quizSettings.questionsPerQuiz}
                      onChange={(e) => setQuizSettings({ ...quizSettings, questionsPerQuiz: parseInt(e.target.value, 10) })}
                      className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800"
                    >
                      <option value={5}>5 Questions (Quick Check)</option>
                      <option value={10}>10 Questions (Standard Quiz)</option>
                      <option value={15}>15 Questions (Standard Test)</option>
                      <option value={20}>20 Questions (Comprehensive)</option>
                      <option value={25}>25 Questions (Board Mock)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Allowed Question Types
                    </label>
                    <select
                      value={quizSettings.allowedQuestionTypes}
                      onChange={(e) => setQuizSettings({ ...quizSettings, allowedQuestionTypes: e.target.value as any })}
                      className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800"
                    >
                      <option value="mixed">Mixed (MCQ + True/False)</option>
                      <option value="mcq">Strict Multiple Choice Only</option>
                      <option value="true_false">True / False Conceptual</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Passing Score Threshold (%)
                    </label>
                    <input
                      type="number"
                      min={40}
                      max={90}
                      value={quizSettings.passingPercentage}
                      onChange={(e) => setQuizSettings({ ...quizSettings, passingPercentage: parseInt(e.target.value, 10) || 60 })}
                      className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800"
                    />
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={quizSettings.instantFeedback}
                      onChange={(e) => setQuizSettings({ ...quizSettings, instantFeedback: e.target.checked })}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Instant Answer Feedback & Explanation</span>
                      <span className="text-[11px] text-slate-500">Show step-by-step reasoning immediately upon answering</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={quizSettings.proctoringStrict}
                      onChange={(e) => setQuizSettings({ ...quizSettings, proctoringStrict: e.target.checked })}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Strict Exam Proctoring & Tab Switch Warning</span>
                      <span className="text-[11px] text-slate-500">Alert student and log violation if user leaves browser window</span>
                    </div>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Global Quiz Configuration</span>
                </button>
              </form>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 7: SUPREME ADMIN KICK CENTER (ADMIN CAN KICK ANYONE INCLUDING PRINCIPAL) */}
          {/* ======================================================== */}
          {activeTab === 'admin_kick_center' && currentUser?.role === 'admin' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Supreme Authority Banner */}
              <div className="bg-gradient-to-r from-rose-900 via-rose-950 to-slate-900 text-white border border-rose-700/80 rounded-3xl p-5 sm:p-6 shadow-md relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 text-white flex items-center justify-center text-3xl shadow-md shrink-0 font-black">
                      🛡️
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                          Administrator Supreme Kick Command Center
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500 text-white shadow-2xs">
                          Absolute Authority
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white">
                          Root Admin: {currentUser.userName}
                        </span>
                      </div>
                      <p className="text-xs text-rose-200 mt-1 max-w-2xl leading-relaxed">
                        Security Governance: While the School Principal holds permission for academic operations, the Master Administrator holds supreme authority to kick anyone out of the platform, <strong>including the Principal</strong>, faculty teachers, and students.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-3 py-1.5 rounded-xl text-xs font-black bg-rose-500/30 text-rose-200 border border-rose-500/50">
                      ⚡ Instant Session Termination
                    </span>
                  </div>
                </div>
              </div>

              {/* CARD 1: SCHOOL PRINCIPAL GOVERNANCE & KICK CONTROL */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <span>🏛️ School Principal Accountability Seat</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-300">
                        Passcode: 93247
                      </span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      The Principal has permission for all academic tools, but the Administrator can terminate their authority and kick them out at any moment.
                    </p>
                  </div>

                  {kickedUsersList.some((k) => k.role === 'principal' || k.name.toLowerCase().includes('principal') || k.name.toLowerCase().includes('sen')) ? (
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1.5 animate-pulse">
                      <UserX className="w-3.5 h-3.5 text-rose-600" />
                      <span>Currently Kicked Out</span>
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Active Principal Access</span>
                    </span>
                  )}
                </div>

                <div className="bg-slate-50 rounded-2xl p-4.5 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-2xl font-black shrink-0 border border-amber-300">
                      🏛️
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-900">Dr. A. K. Sen</span>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-900">
                          Principal Office
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Role: <strong>Principal</strong> • Security Key: <strong>93247</strong> • Permissions: <strong>Everything</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {kickedUsersList.some((k) => k.role === 'principal' || k.name.toLowerCase().includes('principal') || k.name.toLowerCase().includes('sen')) ? (
                      <button
                        type="button"
                        onClick={() => handleRevokeKick('Dr. A. K. Sen')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer transition-all"
                      >
                        <Check className="w-4 h-4" />
                        <span>Pardon & Restore Principal Access</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                        <input
                          type="text"
                          value={kickPrincipalReason}
                          onChange={(e) => setKickPrincipalReason(e.target.value)}
                          placeholder="Reason for kicking Principal..."
                          className="h-9 px-3 text-xs rounded-xl bg-white border border-slate-300 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 min-w-[200px]"
                        />
                        <button
                          type="button"
                          onClick={() => handleExecuteKick({
                            name: 'Dr. A. K. Sen',
                            role: 'principal',
                            reason: kickPrincipalReason || 'Executive Administrator Decision'
                          })}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-700 text-white shadow-xs cursor-pointer transition-all shrink-0"
                          title="Supreme Admin Action: Kick the Principal out"
                        >
                          <UserX className="w-4 h-4" />
                          <span>Kick Out Principal 🚫</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* CARD 2: DIRECT MANUAL KICK FORM */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <span>⚡ Quick User Kick Dispatch</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200">
                      Kick Any Account
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Target any user by name, roll number, or identifier to terminate their session immediately.
                  </p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!customKickTarget.trim()) return;
                    handleExecuteKick({
                      name: customKickTarget.trim(),
                      role: customKickRole,
                      reason: customKickReason.trim() || 'Terminated by Administrator mandate'
                    });
                    setCustomKickTarget('');
                  }}
                  className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200"
                >
                  <div className="sm:col-span-1">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Target Role
                    </label>
                    <select
                      value={customKickRole}
                      onChange={(e) => setCustomKickRole(e.target.value as any)}
                      className="w-full h-9 px-3 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-800"
                    >
                      <option value="principal">Principal 🏛️</option>
                      <option value="teacher">Faculty Teacher 👨‍🏫</option>
                      <option value="student">Student 🧑‍🎓</option>
                    </select>
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      User Name or ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={customKickTarget}
                      onChange={(e) => setCustomKickTarget(e.target.value)}
                      placeholder="e.g. Dr. A. K. Sen, Aarav, etc."
                      className="w-full h-9 px-3 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-800"
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Mandate Reason
                    </label>
                    <input
                      type="text"
                      value={customKickReason}
                      onChange={(e) => setCustomKickReason(e.target.value)}
                      placeholder="e.g. Administrative termination"
                      className="w-full h-9 px-3 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-800"
                    />
                  </div>

                  <div className="sm:col-span-1 flex items-end">
                    <button
                      type="submit"
                      className="w-full h-9 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Kick User Now</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* CARD 3: FACULTY TEACHERS KICK ROSTER */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <span>👨‍🏫 Faculty Teachers & Staff Roster</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Lead instructors across academic groups eligible for administrator oversight.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { name: 'Mrs. Sharma', role: 'teacher' as const, subject: 'Class 1 to 5 Foundational Learning', classCode: 'CLS-105' },
                    { name: 'Prof. Ramesh Kulkarni', role: 'teacher' as const, subject: 'Class 6 to 8 Science & Mathematics', classCode: 'CLS-608' },
                    { name: 'Dr. Sunita Verma', role: 'teacher' as const, subject: 'Class 9 to 10 Secondary Board Examination', classCode: 'CLS-910' },
                    { name: 'Dr. Vikram Malhotra', role: 'teacher' as const, subject: 'Class 11 to 12 Senior Apex Physics', classCode: 'CLS-112' }
                  ].map((tch) => {
                    const isKicked = kickedUsersList.some((k) => k.name.toLowerCase() === tch.name.toLowerCase());
                    return (
                      <div
                        key={tch.name}
                        className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-900 truncate">{tch.name}</span>
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-900">
                              {tch.classCode}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 block truncate">{tch.subject}</span>
                        </div>

                        {isKicked ? (
                          <button
                            type="button"
                            onClick={() => handleRevokeKick(tch.name)}
                            className="px-2.5 py-1 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer transition-all shrink-0"
                          >
                            Restore
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleExecuteKick({
                              name: tch.name,
                              role: 'teacher',
                              reason: 'Teacher access terminated by Administrator'
                            })}
                            className="px-2.5 py-1 rounded-xl text-xs font-black bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 cursor-pointer transition-all shrink-0"
                          >
                            Kick Out 🚫
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CARD 4: KICKED USERS AUDIT & RESTORATION REGISTRY */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <span>📋 Kicked Users Audit Registry</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold border border-rose-300">
                        {kickedUsersList.length} Accounts Terminated
                      </span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Immutable record of all accounts terminated by Administrator mandate. Click pardon to restore platform access.
                    </p>
                  </div>
                </div>

                {kickedUsersList.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-xs text-slate-500">
                    <Shield className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <span>No accounts are currently kicked out. All active users hold standard platform permissions.</span>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-black">
                          <th className="p-3">User Identity</th>
                          <th className="p-3">Role</th>
                          <th className="p-3">Kicked By</th>
                          <th className="p-3">Reason / Mandate</th>
                          <th className="p-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-medium">
                        {kickedUsersList.map((record) => (
                          <tr key={record.id} className="hover:bg-slate-50/80">
                            <td className="p-3 font-black text-slate-900">
                              {record.name}
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                record.role === 'principal'
                                  ? 'bg-amber-100 text-amber-900'
                                  : record.role === 'teacher'
                                  ? 'bg-purple-100 text-purple-900'
                                  : 'bg-indigo-100 text-indigo-900'
                              }`}>
                                {record.role}
                              </span>
                            </td>
                            <td className="p-3 text-slate-600">
                              🛡️ {record.kickedBy}
                            </td>
                            <td className="p-3 text-slate-600 italic">
                              "{record.reason}"
                            </td>
                            <td className="p-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleRevokeKick(record.name)}
                                className="px-3 py-1 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-2xs transition-all"
                              >
                                ✅ Restore
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECONDARY CONFIRMATION DISCARD MODAL */}
      {showDiscardConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto text-2xl font-bold">
              ⚠️
            </div>
            <div>
              <h4 className="text-base font-black text-slate-900">
                Discard Unsaved Faculty Group?
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                You have unsaved changes in your faculty teacher group creation form (<strong>{newFacultyName || 'Untitled Group'}</strong>). All progress has been autosaved, but will be deleted if you discard.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowDiscardConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={handleConfirmDiscard}
                className="px-4 py-2 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-700 text-white shadow-xs cursor-pointer"
              >
                Discard & Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
