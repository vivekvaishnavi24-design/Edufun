import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Award,
  BookOpen,
  Send,
  Star,
  CheckCircle,
  Trophy,
  Plus,
  X,
  LogOut,
  Sparkles,
  ArrowRight,
  Check,
  Crown,
  Medal,
  Copy,
  Share2,
  Monitor,
  Zap,
  Search,
  School,
  FileText,
  AlertCircle
} from 'lucide-react';
import { ClassroomGroup, ClassroomUserAuth, GeneratedQuiz } from '../types';
import {
  getClassroomGroups,
  saveClassroomGroups,
  setClassroomAuth,
  createClassroomGroup,
  joinGroupByCode,
  assignQuizToClassGroup,
  kickUserOut
} from '../utils/classroomStorage';
import { UserAvatar } from './UserAvatar';
import { fireBottomLeftAndRightConfetti } from '../utils/quizUtils';

interface ClassroomGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: ClassroomUserAuth | null;
  onSwitchUser: () => void;
  onLogout?: () => void;
  onAssignQuizToGroup?: (topic: string, fullData?: any) => void;
  currentQuiz?: GeneratedQuiz | null;
  onStartAssignedQuiz?: (quizTitle: string, quizTopic: string, fullData?: any) => void;
}

export const ClassroomGroupModal: React.FC<ClassroomGroupModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSwitchUser,
  onLogout,
  onAssignQuizToGroup,
  currentQuiz,
  onStartAssignedQuiz
}) => {
  const [groups, setGroups] = useState<ClassroomGroup[]>(() => getClassroomGroups());
  const [selectedGroupId, setSelectedGroupId] = useState<string>(() => {
    return currentUser?.groupId || groups[0]?.id || 'grp_high_titans';
  });
  const [assignInput, setAssignInput] = useState<string>('');
  const [assignQuestionsCount, setAssignQuestionsCount] = useState<number>(15);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Student Join Code State
  const [studentJoinCode, setStudentJoinCode] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedInvite, setCopiedInvite] = useState<boolean>(false);

  // Teacher Projector / Big Screen Modal State
  const [showProjectorScreen, setShowProjectorScreen] = useState<boolean>(false);

  // Search filter for students roster
  const [studentSearchQuery, setStudentSearchQuery] = useState<string>('');

  // New Group Creation Modal State for Teachers
  const AUTOSAVE_KEY = 'testgen_draft_create_classroom_group';
  const [isCreatingGroup, setIsCreatingGroup] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('testgen_draft_create_classroom_group');
      if (saved) {
        const parsed = JSON.parse(saved);
        return Boolean(parsed?.name || parsed?.desc);
      }
    } catch {}
    return false;
  });
  const [newGroupName, setNewGroupName] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('testgen_draft_create_classroom_group');
      if (saved) return JSON.parse(saved)?.name || '';
    } catch {}
    return '';
  });
  const [newGroupGrade, setNewGroupGrade] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('testgen_draft_create_classroom_group');
      if (saved) return JSON.parse(saved)?.grade || 'Class 9 to 10';
    } catch {}
    return 'Class 9 to 10';
  });
  const [newGroupCode, setNewGroupCode] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('testgen_draft_create_classroom_group');
      if (saved) return JSON.parse(saved)?.code || '';
    } catch {}
    return '';
  });
  const [newGroupDesc, setNewGroupDesc] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('testgen_draft_create_classroom_group');
      if (saved) return JSON.parse(saved)?.desc || '';
    } catch {}
    return '';
  });

  // Secondary confirmation state for discarding unsaved group creation draft
  const [showDiscardConfirm, setShowDiscardConfirm] = useState<boolean>(false);
  const [pendingCloseAction, setPendingCloseAction] = useState<'close_modal' | 'cancel_form' | null>(null);

  // Autosave draft whenever form fields change
  useEffect(() => {
    if (isCreatingGroup) {
      if (newGroupName || newGroupCode || newGroupDesc) {
        try {
          localStorage.setItem(
            AUTOSAVE_KEY,
            JSON.stringify({
              name: newGroupName,
              grade: newGroupGrade,
              code: newGroupCode,
              desc: newGroupDesc
            })
          );
        } catch {}
      }
    }
  }, [isCreatingGroup, newGroupName, newGroupGrade, newGroupCode, newGroupDesc]);

  // Prompt before window unload if there's an active unsaved draft
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isCreatingGroup && (newGroupName.trim() || newGroupDesc.trim())) {
        e.preventDefault();
        e.returnValue = 'You have unsaved classroom group changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isCreatingGroup, newGroupName, newGroupDesc]);

  // Safe Close Handler with Secondary Confirmation
  const handleAttemptClose = () => {
    if (isCreatingGroup && (newGroupName.trim() || newGroupDesc.trim())) {
      setPendingCloseAction('close_modal');
      setShowDiscardConfirm(true);
      return;
    }
    onClose();
  };

  const handleAttemptCancelForm = () => {
    if (newGroupName.trim() || newGroupDesc.trim()) {
      setPendingCloseAction('cancel_form');
      setShowDiscardConfirm(true);
      return;
    }
    setIsCreatingGroup(false);
  };

  const handleConfirmDiscard = () => {
    try {
      localStorage.removeItem(AUTOSAVE_KEY);
    } catch {}
    setNewGroupName('');
    setNewGroupCode('');
    setNewGroupDesc('');
    setShowDiscardConfirm(false);

    if (pendingCloseAction === 'close_modal') {
      setIsCreatingGroup(false);
      onClose();
    } else {
      setIsCreatingGroup(false);
    }
    setPendingCloseAction(null);
    showToast('error', 'Draft discarded.');
  };

  if (!isOpen) return null;

  const activeGroup = groups.find((g) => g.id === selectedGroupId) || groups.find((g) => g.id === currentUser?.groupId) || groups[0];
  const isTeacher = currentUser?.role === 'teacher';
  const isPrincipal = currentUser?.role === 'principal';
  const isAdmin = currentUser?.role === 'admin';
  const canManageGroup = isTeacher || isPrincipal || isAdmin;
  const maxCapacity = activeGroup.maxCapacity || 75; // Guaranteed minimum 70+ capacity

  const showToast = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4500);
  };

  // Copy Group Code
  const handleCopyCode = () => {
    if (!activeGroup.code) return;
    navigator.clipboard.writeText(activeGroup.code);
    setCopiedCode(true);
    showToast('success', `Classroom code "${activeGroup.code}" copied to clipboard!`);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // Copy Full Invite Message
  const handleCopyInviteMessage = () => {
    const inviteText = `📚 Join our classroom group on TestGen!\nGroup: ${activeGroup.name} (${activeGroup.gradeLevel})\nTeacher: ${activeGroup.teacherName}\nClassroom Join Code: ${activeGroup.code}\nCapacity: 75 Students (Minimum 70+ Class Size Supported)\nEnter this code in TestGen to take tests and view your rank!`;
    navigator.clipboard.writeText(inviteText);
    setCopiedInvite(true);
    showToast('success', `Classroom invite message copied! Share with your students on WhatsApp, Email, or Slack.`);
    setTimeout(() => setCopiedInvite(false), 2500);
  };

  // Student Joins Group by Code
  const handleJoinByCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentJoinCode.trim()) return;

    const studentName = currentUser?.userName || 'Enrolled Student';
    const rollNum = currentUser?.rollNumber || currentUser?.studentId || `STD-${Math.floor(10 + Math.random() * 90)}`;
    const avatar = currentUser?.avatarEmoji || '🧑‍🎓';

    const res = joinGroupByCode(studentJoinCode.trim(), {
      name: studentName,
      rollNumber: rollNum,
      avatarEmoji: avatar
    });

    if (!res.success || !res.group) {
      showToast('error', res.error || 'Failed to join group. Please check code.');
      return;
    }

    const refreshed = getClassroomGroups();
    setGroups(refreshed);
    setSelectedGroupId(res.group.id);

    if (currentUser) {
      const updatedAuth: ClassroomUserAuth = {
        ...currentUser,
        groupId: res.group.id,
        groupName: res.group.name
      };
      setClassroomAuth(updatedAuth);
    }

    fireBottomLeftAndRightConfetti();
    showToast('success', `🎉 Successfully joined "${res.group.name}"! Taught by ${res.group.teacherName}.`);
    setStudentJoinCode('');
  };

  // Teacher creates a new group (Capacity: 75 students)
  const handleCreateGroupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    const teacherNameToUse = currentUser?.userName || 'Lead Teacher';
    const created = createClassroomGroup({
      name: newGroupName.trim(),
      teacherName: teacherNameToUse,
      gradeLevel: newGroupGrade,
      code: newGroupCode.trim() || undefined,
      description: newGroupDesc.trim() || undefined,
      teacherId: currentUser?.studentId,
      teacherEmail: currentUser?.phoneNumber
    });

    const refreshed = getClassroomGroups();
    setGroups(refreshed);
    setSelectedGroupId(created.id);

    // Switch current user to this newly created group if teacher
    if (currentUser && isTeacher) {
      const updatedAuth: ClassroomUserAuth = {
        ...currentUser,
        groupId: created.id,
        groupName: created.name
      };
      setClassroomAuth(updatedAuth);
    }

    setIsCreatingGroup(false);
    setNewGroupName('');
    setNewGroupCode('');
    setNewGroupDesc('');
    fireBottomLeftAndRightConfetti();
    showToast('success', `Classroom group "${created.name}" created! Join Code: ${created.code} (Capacity: 75 Students).`);
  };

  // Teacher assigns a custom test topic to the whole class
  const handleAssignCustomQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignInput.trim()) return;

    const topic = assignInput.trim();
    const testTitle = `${activeGroup.gradeLevel}: ${topic}`;

    assignQuizToClassGroup(activeGroup.id, {
      title: testTitle,
      topic: topic,
      questionsCount: assignQuestionsCount
    });

    const refreshed = getClassroomGroups();
    setGroups(refreshed);
    showToast('success', `🚀 Test "${testTitle}" assigned to all 70+ students in ${activeGroup.name}!`);

    if (onAssignQuizToGroup) {
      onAssignQuizToGroup(topic);
    }
    setAssignInput('');
  };

  // Teacher assigns the currently loaded quiz to this class group
  const handleAssignCurrentLoadedQuiz = () => {
    if (!currentQuiz) return;

    assignQuizToClassGroup(activeGroup.id, {
      title: currentQuiz.title,
      topic: currentQuiz.topicsCovered?.[0] || currentQuiz.subjectName || currentQuiz.title,
      questionsCount: currentQuiz.questions.length,
      fullData: currentQuiz
    });

    const refreshed = getClassroomGroups();
    setGroups(refreshed);
    fireBottomLeftAndRightConfetti();
    showToast('success', `🎯 Assigned active quiz "${currentQuiz.title}" to ${activeGroup.name}! All students can now take this exact test.`);
  };

  // Student clicks to start the assigned test
  const handleStartClassTest = () => {
    if (!activeGroup.assignedQuizTitle) return;
    if (onStartAssignedQuiz) {
      onStartAssignedQuiz(
        activeGroup.assignedQuizTitle,
        activeGroup.assignedQuizTopic || activeGroup.assignedQuizTitle,
        activeGroup.assignedQuizFullData
      );
    } else if (onAssignQuizToGroup) {
      onAssignQuizToGroup(activeGroup.assignedQuizTopic || activeGroup.assignedQuizTitle, activeGroup.assignedQuizFullData);
    }
    onClose();
  };

  // Memoized filter and sort for 75+ students to prevent UI lag
  const filteredStudents = useMemo(() => {
    const list = activeGroup.students || [];
    if (!studentSearchQuery.trim()) return list;
    const q = studentSearchQuery.toLowerCase();
    return list.filter((s) => s.name.toLowerCase().includes(q) || (s.rollNumber && s.rollNumber.toLowerCase().includes(q)));
  }, [activeGroup.students, studentSearchQuery]);

  // Memoized sorted students by totalScore desc
  const sortedStudents = useMemo(() => {
    return [...filteredStudents].sort((a, b) => b.totalScore - a.totalScore);
  }, [filteredStudents]);

  // Memoized podium students
  const podiumStudents = useMemo(() => {
    return sortedStudents.filter((s) => s.totalScore > 0 || s.totalQuizzesTaken > 0);
  }, [sortedStudents]);

  const completedTestCount = useMemo(() => {
    return (activeGroup.students || []).filter((s) => s.totalQuizzesTaken > 0).length;
  }, [activeGroup.students]);

  return (
    <>
      <div
        id="classroom-group-modal-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xs overflow-y-auto"
      >
        <div
          className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between gap-4 bg-gradient-to-r from-indigo-50/90 via-white to-violet-50/90 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200 text-2xl shrink-0">
                🏫
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-black text-slate-900 truncate">
                    {activeGroup.name}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-xs font-mono font-black uppercase bg-indigo-100 text-indigo-800 border border-indigo-200 shrink-0">
                    CODE: {activeGroup.code}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                    👥 70+ Seats ({activeGroup.students.length}/{maxCapacity})
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 truncate">
                  Teacher: <strong className="text-slate-800 font-bold">{activeGroup.teacherName}</strong> • Grade: <strong className="text-slate-700">{activeGroup.gradeLevel}</strong> • {activeGroup.students.length} Enrolled (Capacity: 75)
                </p>
              </div>
            </div>

            <button
              onClick={handleAttemptClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              title="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Status Toast Banner */}
          {statusMessage && (
            <div
              className={`p-3 text-xs font-bold flex items-center justify-between gap-2 border-b shrink-0 animate-in fade-in ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : 'bg-rose-50 text-rose-900 border-rose-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {statusMessage.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{statusMessage.text}</span>
              </div>
              <button
                type="button"
                onClick={() => setStatusMessage(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Modal Body */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 bg-slate-50/40">
            {/* 1. TEACHER JOIN CODE SHARE BANNER */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#5016A6] via-[#6822CC] to-[#3B0764] text-white shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-36 h-36 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
              <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-purple-950">
                      Classroom Join Code
                    </span>
                    <span className="text-xs text-purple-200 font-medium">
                      Share with students to join this group
                    </span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl sm:text-4xl font-mono font-black tracking-wider text-amber-300">
                      {activeGroup.code}
                    </span>
                    <span className="text-xs text-purple-200 font-medium">
                      (Capacity: 75 Seats • 70+ Students Supported)
                    </span>
                  </div>
                  <p className="text-xs text-purple-100 max-w-md">
                    Students can enter this code in their TestGen portal to enroll in this class, take your assigned tests, and appear on the class leaderboard.
                  </p>
                </div>

                {/* Action Buttons for Code */}
                <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-amber-400 text-purple-950 hover:bg-amber-300 shadow-sm transition-all cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Code Copied!' : 'Copy Code'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyInviteMessage}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white/15 hover:bg-white/25 text-white border border-white/20 transition-all cursor-pointer"
                  >
                    {copiedInvite ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                    <span>{copiedInvite ? 'Invite Copied!' : 'Share Invite Text'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowProjectorScreen(true)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-black/20 hover:bg-black/30 text-purple-200 hover:text-white border border-white/10 transition-all cursor-pointer"
                    title="Display big code on classroom board"
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>Classroom Projector View</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 2. STUDENT: JOIN GROUP BY CODE INPUT */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <School className="w-4 h-4 text-indigo-600" />
                  <span>Student: Join Another Class by Code</span>
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  Have a code from your teacher?
                </span>
              </div>

              <form onSubmit={handleJoinByCodeSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={studentJoinCode}
                  onChange={(e) => setStudentJoinCode(e.target.value.toUpperCase())}
                  placeholder="Enter classroom code (e.g. CLS-910 or BIO-2026)"
                  className="flex-1 px-3.5 py-2 text-xs sm:text-sm font-mono font-bold rounded-xl border border-slate-300 bg-slate-50 text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-2xs transition-all cursor-pointer shrink-0"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Join Class</span>
                </button>
              </form>
            </div>

            {/* 3. GROUP SELECTOR & ROLE CARD */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Users className="w-4 h-4 text-indigo-600 shrink-0" />
                <div className="min-w-0 flex-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Switch Active Group ({groups.length} Classrooms Available)
                  </label>
                  <select
                    value={activeGroup.id}
                    onChange={(e) => {
                      setSelectedGroupId(e.target.value);
                      const sel = groups.find((g) => g.id === e.target.value);
                      if (sel && currentUser) {
                        setClassroomAuth({
                          ...currentUser,
                          groupId: sel.id,
                          groupName: sel.name
                        });
                      }
                    }}
                    className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  >
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} • {g.code} (Teacher: {g.teacherName}, {g.students?.length || 0}/75 Seats)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Create Group Button for Teachers/Admins */}
              <button
                type="button"
                onClick={() => setIsCreatingGroup(!isCreatingGroup)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isCreatingGroup ? 'Cancel' : '+ Teacher: Create Group (75 Capacity)'}</span>
              </button>
            </div>

            {/* Teacher New Group Creation Form */}
            {isCreatingGroup && (
              <form
                onSubmit={handleCreateGroupSubmit}
                className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200 space-y-3 animate-in fade-in zoom-in-95 duration-200"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>Create New Classroom Group</span>
                  </span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    75 Student Capacity (70+ Supported)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Classroom Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="e.g. Grade 10 Science Titans or Class 8 Mathematics"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Grade / Class Level *
                    </label>
                    <select
                      value={newGroupGrade}
                      onChange={(e) => setNewGroupGrade(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="Class 1 to 5">Class 1 to 5 Foundational</option>
                      <option value="Class 6 to 8">Class 6 to 8 Middle School</option>
                      <option value="Class 9 to 10">Class 9 to 10 Board Exam</option>
                      <option value="Class 11 to 12">Class 11 to 12 Senior Secondary</option>
                      <option value="JEE & NEET Advanced">JEE & NEET Advanced</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Custom Classroom Code (or auto-generated)
                    </label>
                    <input
                      type="text"
                      value={newGroupCode}
                      onChange={(e) => setNewGroupCode(e.target.value.toUpperCase())}
                      placeholder="e.g. SCI-10A (auto-generated if blank)"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Classroom Description
                    </label>
                    <input
                      type="text"
                      value={newGroupDesc}
                      onChange={(e) => setNewGroupDesc(e.target.value)}
                      placeholder="e.g. Weekly tests, board preparation, and live exams"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleAttemptCancelForm}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-2xs transition-all cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Create Group (75 Capacity)</span>
                  </button>
                </div>
              </form>
            )}

            {/* 4. WHOLE-CLASS TEST ASSIGNMENT & CREATION (TEACHER & STUDENT VIEW) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 via-white to-orange-50 border border-amber-200 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-600" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-amber-950">
                    Whole-Class Examination & Test Assignment
                  </h3>
                </div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 border border-amber-300">
                  Whole Class (70+ Students)
                </span>
              </div>

              {/* If active group already has an assigned test */}
              {activeGroup.assignedQuizTitle ? (
                <div className="p-4 rounded-xl bg-white border border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider flex items-center gap-1">
                      <span>Live Test Assigned by {activeGroup.teacherName}:</span>
                    </span>
                    <h4 className="text-sm sm:text-base font-black text-slate-900">
                      {activeGroup.assignedQuizTitle}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Topic: <strong className="text-slate-700">{activeGroup.assignedQuizTopic || activeGroup.assignedQuizTitle}</strong> • {activeGroup.assignedQuizQuestions || 15} Questions • {completedTestCount} of {activeGroup.students.length} Students Completed
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleStartClassTest}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-white bg-amber-600 hover:bg-amber-700 shadow-md transition-all cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>Take Class Test Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
                  No active test assigned yet. Teachers can create a test and assign it to all 70+ students below!
                </div>
              )}

              {/* Teacher, Principal & Admin controls to assign test */}
              {canManageGroup && (
                <div className="pt-2 border-t border-amber-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">
                      {isPrincipal
                        ? '🏛️ Principal Oversight: Assign / Create Test for this Group'
                        : isAdmin
                        ? '🛡️ Admin Command: Assign / Create Test for this Group'
                        : '👨‍🏫 Teacher Command: Assign / Create Test for this Group'}
                    </span>
                  </div>

                  {/* 1-Click Assign Current App Quiz if loaded */}
                  {currentQuiz && (
                    <div className="p-3 rounded-xl bg-indigo-50/80 border border-indigo-200 flex items-center justify-between gap-2">
                      <div className="text-xs text-indigo-950 min-w-0">
                        <span className="font-bold">Currently Loaded Quiz: </span>
                        <strong className="truncate block font-black text-indigo-700">{currentQuiz.title}</strong>
                        <span className="text-[11px] text-indigo-600">({currentQuiz.questions.length} questions ready)</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleAssignCurrentLoadedQuiz}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-2xs transition-all shrink-0 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send This Test to Class</span>
                      </button>
                    </div>
                  )}

                  {/* Custom Test Topic Creation */}
                  <form onSubmit={handleAssignCustomQuiz} className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={assignInput}
                      onChange={(e) => setAssignInput(e.target.value)}
                      placeholder="e.g. Quadratic Equations, Light & Optics, Photosynthesis..."
                      className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />

                    <select
                      value={assignQuestionsCount}
                      onChange={(e) => setAssignQuestionsCount(Number(e.target.value))}
                      className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                    >
                      <option value={10}>10 Questions</option>
                      <option value={15}>15 Questions</option>
                      <option value={20}>20 Questions</option>
                      <option value={25}>25 Questions</option>
                    </select>

                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-white bg-amber-600 hover:bg-amber-700 shadow-2xs transition-all cursor-pointer shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Create & Assign</span>
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* 5. CLASSROOM PODIUM (REAL EXAMINATION WINNERS) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span>Classroom Podium (Real Student Champions)</span>
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  Actual test scores only
                </span>
              </div>

              {podiumStudents.length > 0 ? (
                <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-900 to-indigo-950 text-white shadow-md border border-indigo-900/50">
                  <div className="flex items-end justify-center gap-2 sm:gap-4 pt-3 pb-2">
                    {/* Rank 2: Silver */}
                    {podiumStudents[1] ? (
                      <div className="flex-1 max-w-[140px] flex flex-col items-center text-center animate-in fade-in duration-300">
                        <div className="relative mb-2">
                          <UserAvatar
                            name={podiumStudents[1].name}
                            size="md"
                            role="student"
                          />
                          <span className="absolute -bottom-1 -right-1 text-sm">🥈</span>
                        </div>
                        <div className="text-xs font-bold truncate max-w-full text-slate-200">
                          {podiumStudents[1].name}
                        </div>
                        <div className="text-[11px] font-black text-slate-300">
                          {podiumStudents[1].totalScore} pts
                        </div>
                        <div className="w-full h-20 rounded-t-xl bg-gradient-to-t from-slate-700 to-slate-500 flex flex-col items-center justify-center mt-2 border-t-2 border-slate-300 shadow-inner">
                          <span className="text-2xl font-black text-slate-200">2</span>
                          <span className="text-[9px] uppercase font-bold text-slate-300">Silver</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 max-w-[140px] flex flex-col items-center opacity-40">
                        <div className="w-full h-16 rounded-t-xl bg-slate-800/60 border-t border-dashed border-slate-600 flex items-center justify-center mt-auto">
                          <span className="text-xs font-bold text-slate-500">2nd Open</span>
                        </div>
                      </div>
                    )}

                    {/* Rank 1: Gold */}
                    {podiumStudents[0] && (
                      <div className="flex-1 max-w-[160px] flex flex-col items-center text-center animate-in fade-in duration-300 -mt-3">
                        <div className="relative mb-2">
                          <Crown className="w-5 h-5 text-amber-400 mx-auto mb-0.5 animate-bounce" />
                          <UserAvatar
                            name={podiumStudents[0].name}
                            size="lg"
                            role="student"
                          />
                          <span className="absolute -bottom-1 -right-1 text-base">🥇</span>
                        </div>
                        <div className="text-xs sm:text-sm font-black truncate max-w-full text-amber-300">
                          {podiumStudents[0].name}
                        </div>
                        <div className="text-xs font-black text-white">
                          {podiumStudents[0].totalScore} pts
                        </div>
                        <div className="w-full h-28 rounded-t-xl bg-gradient-to-t from-amber-600 to-amber-400 flex flex-col items-center justify-center mt-2 border-t-2 border-amber-200 shadow-lg text-amber-950">
                          <span className="text-3xl font-black">1</span>
                          <span className="text-[10px] uppercase font-black tracking-wider">Champion</span>
                        </div>
                      </div>
                    )}

                    {/* Rank 3: Bronze */}
                    {podiumStudents[2] ? (
                      <div className="flex-1 max-w-[140px] flex flex-col items-center text-center animate-in fade-in duration-300">
                        <div className="relative mb-2">
                          <UserAvatar
                            name={podiumStudents[2].name}
                            size="md"
                            role="student"
                          />
                          <span className="absolute -bottom-1 -right-1 text-sm">🥉</span>
                        </div>
                        <div className="text-xs font-bold truncate max-w-full text-amber-200">
                          {podiumStudents[2].name}
                        </div>
                        <div className="text-[11px] font-black text-amber-300">
                          {podiumStudents[2].totalScore} pts
                        </div>
                        <div className="w-full h-16 rounded-t-xl bg-gradient-to-t from-amber-800 to-amber-700 flex flex-col items-center justify-center mt-2 border-t-2 border-amber-500 shadow-inner">
                          <span className="text-2xl font-black text-amber-200">3</span>
                          <span className="text-[9px] uppercase font-bold text-amber-300">Bronze</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 max-w-[140px] flex flex-col items-center opacity-40">
                        <div className="w-full h-12 rounded-t-xl bg-slate-800/60 border-t border-dashed border-slate-600 flex items-center justify-center mt-auto">
                          <span className="text-xs font-bold text-slate-500">3rd Open</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-5 text-center rounded-2xl bg-white border border-dashed border-slate-200 text-slate-500 space-y-1.5">
                  <Award className="w-7 h-7 mx-auto text-amber-500" />
                  <p className="text-xs font-bold text-slate-800">
                    Podium is waiting for classroom examination submissions!
                  </p>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    As students take quizzes in <strong className="text-slate-800">{activeGroup.name}</strong>, actual scores will appear on the 1st, 2nd, and 3rd place podium.
                  </p>
                </div>
              )}
            </div>

            {/* 6. CLASSROOM STUDENT ROSTER (70+ CAPACITY) */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                    Classroom Student Roster ({activeGroup.students.length} / {maxCapacity} Seats)
                  </span>
                </div>

                {/* Search input for large class (70+ students) */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={studentSearchQuery}
                    onChange={(e) => setStudentSearchQuery(e.target.value)}
                    placeholder="Search student or roll #..."
                    className="w-48 pl-8 pr-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {sortedStudents.length === 0 ? (
                <div className="p-6 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-500 space-y-2">
                  <Users className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="font-bold text-slate-700">
                    {activeGroup.students.length === 0 ? 'No students have joined this classroom yet.' : 'No matching students found.'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Share the join code <strong className="text-indigo-600 font-mono font-bold">{activeGroup.code}</strong> with your class. The classroom supports up to {maxCapacity} students!
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {sortedStudents.map((std, idx) => {
                    const isCurrent = currentUser?.userName?.toLowerCase() === std.name.toLowerCase();
                    return (
                      <div
                        key={std.id}
                        className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                          isCurrent
                            ? 'bg-indigo-50/80 border-indigo-400 ring-2 ring-indigo-400/20 shadow-2xs'
                            : 'bg-white border-slate-200 hover:bg-slate-50/80'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-6 text-center text-xs font-black text-slate-400 shrink-0">
                            {idx === 0 && std.totalScore > 0 ? '🥇' : idx === 1 && std.totalScore > 0 ? '🥈' : idx === 2 && std.totalScore > 0 ? '🥉' : `#${idx + 1}`}
                          </span>

                          <UserAvatar name={std.name} size="sm" role="student" />

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                {std.name}
                              </span>
                              {isCurrent && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-200 text-indigo-900">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {std.rollNumber ? `Roll #${std.rollNumber} • ` : ''}{std.totalQuizzesTaken} Tests Taken
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <div className="text-right">
                            <div className="text-sm font-black text-indigo-600">
                              {std.totalScore} pts
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium">
                              Score
                            </div>
                          </div>

                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => {
                                const res = kickUserOut(
                                  { id: std.id, name: std.name, role: 'student', reason: 'Terminated by Administrator mandate' },
                                  currentUser?.userName || 'Root Administrator'
                                );
                                if (res.success) {
                                  showToast('success', res.message);
                                  setGroups(getClassroomGroups());
                                } else {
                                  showToast('error', res.message);
                                }
                              }}
                              className="px-2 py-1 rounded-lg text-[10px] font-black bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 transition-all cursor-pointer shadow-2xs"
                              title={`Admin Supreme Authority: Kick ${std.name} out of classroom`}
                            >
                              🚫 Kick
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-5 border-t border-slate-100 flex items-center justify-between bg-white shrink-0">
            <div className="text-xs text-slate-500">
              Guaranteed capacity: 70+ students & teacher. Offline-ready & saved locally.
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSwitchUser();
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Switch Role / Login
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Classroom Projector / Big Screen Modal for Classrooms */}
      {showProjectorScreen && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-md animate-in fade-in"
          onClick={() => setShowProjectorScreen(false)}
        >
          <div
            className="max-w-xl w-full bg-slate-900 border-2 border-indigo-500/50 rounded-3xl p-8 sm:p-10 text-center text-white space-y-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowProjectorScreen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white bg-slate-800"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                CLASSROOM SMARTBOARD PROJECTOR MODE
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                {activeGroup.name}
              </h3>
              <p className="text-sm text-slate-300">
                Teacher: <strong>{activeGroup.teacherName}</strong> • Capacity: <strong>75 Students</strong>
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-br from-indigo-950 to-slate-950 border-2 border-amber-400/80 shadow-2xl space-y-2">
              <span className="text-xs uppercase font-bold tracking-widest text-amber-300 block">
                ENTER CLASS JOIN CODE:
              </span>
              <div className="text-5xl sm:text-7xl font-mono font-black text-amber-300 tracking-wider select-all py-2">
                {activeGroup.code}
              </div>
              <span className="text-xs text-slate-300 block">
                Open TestGen on your device & enter this code to join the class test!
              </span>
            </div>

            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-5 py-2.5 rounded-xl text-xs font-black bg-amber-400 text-purple-950 hover:bg-amber-300 shadow-md cursor-pointer"
              >
                {copiedCode ? '✓ Copied' : 'Copy Code'}
              </button>
              <button
                type="button"
                onClick={() => setShowProjectorScreen(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECONDARY CONFIRMATION MODAL (NAVIGATION AWAY / DISCARD PROMPT) */}
      {showDiscardConfirm && (
        <div
          id="classroom-group-discard-confirm-overlay"
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-rose-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-xl font-black">
              ⚠️
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900">
                Discard Unsaved Classroom Group Draft?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                You have an active draft for <strong>"{newGroupName || 'New Classroom Group'}"</strong>.
                If you navigate away now, your unsaved form changes will be discarded.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDiscardConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Keep Editing & Autosave
              </button>
              <button
                type="button"
                onClick={handleConfirmDiscard}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md transition-colors cursor-pointer"
              >
                Discard Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
