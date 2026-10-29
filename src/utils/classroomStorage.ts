import { ClassroomGroup, ClassroomUserAuth, DeviceType, StudentProfile, UserRole } from '../types';

const AUTH_KEY = 'testgen_classroom_auth';
const GROUPS_KEY = 'testgen_classroom_groups';
const DEVICE_KEY = 'testgen_device_preference';
const OFFLINE_MODE_KEY = 'testgen_offline_mode';

const DEFAULT_GROUPS: ClassroomGroup[] = [
  {
    id: 'grp_sunflower',
    name: 'Class 1 to 5 Foundational Group',
    teacherName: 'Mrs. Sharma',
    gradeLevel: 'Class 1 to 5',
    code: 'CLS-105',
    description: 'Foundational learning and weekly tests for Class 1 to Class 5 (75 Seats).',
    assignedQuizTitle: 'Class 1: Fun Math & Counting',
    assignedQuizTopic: 'Counting Numbers 1 to 20',
    assignedQuizQuestions: 10,
    maxCapacity: 75,
    students: []
  },
  {
    id: 'grp_middle_phoenix',
    name: 'Class 6 to 8 Middle Group',
    teacherName: 'Prof. Ramesh Kulkarni',
    gradeLevel: 'Class 6 to 8',
    code: 'CLS-608',
    description: 'Middle school classroom for Class 6, 7, and 8 (75 Seats).',
    assignedQuizTitle: 'Class 6: Integers & Science Foundations',
    assignedQuizTopic: 'Integers, Ratios & Habitats',
    assignedQuizQuestions: 15,
    maxCapacity: 75,
    students: []
  },
  {
    id: 'grp_high_titans',
    name: 'Class 9 to 10 Board Group',
    teacherName: 'Dr. Sunita Verma',
    gradeLevel: 'Class 9 to 10',
    code: 'CLS-910',
    description: 'Secondary board examination preparation group (75 Seats).',
    assignedQuizTitle: 'Class 10: Trigonometry & Light Optics',
    assignedQuizTopic: 'Trigonometry & Chemical Reactions',
    assignedQuizQuestions: 20,
    maxCapacity: 75,
    students: []
  },
  {
    id: 'grp_senior_apex',
    name: 'Class 11 to 12 Senior Group',
    teacherName: 'Dr. Vikram Malhotra',
    gradeLevel: 'Class 11 to 12',
    code: 'CLS-112',
    description: 'Senior secondary and competitive examination group (75 Seats).',
    assignedQuizTitle: 'Class 12: Calculus & Electromagnetism',
    assignedQuizTopic: 'Integrals & Electrostatics',
    assignedQuizQuestions: 25,
    maxCapacity: 75,
    students: []
  }
];

let _cachedGroups: ClassroomGroup[] | null = null;

export function getClassroomGroups(): ClassroomGroup[] {
  if (_cachedGroups && _cachedGroups.length > 0) {
    return _cachedGroups;
  }
  try {
    const raw = localStorage.getItem(GROUPS_KEY);
    if (!raw) {
      localStorage.setItem(GROUPS_KEY, JSON.stringify(DEFAULT_GROUPS));
      _cachedGroups = DEFAULT_GROUPS;
      return DEFAULT_GROUPS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      _cachedGroups = DEFAULT_GROUPS;
      return DEFAULT_GROUPS;
    }

    _cachedGroups = parsed;
    return parsed;
  } catch {
    _cachedGroups = DEFAULT_GROUPS;
    return DEFAULT_GROUPS;
  }
}

export function saveClassroomGroups(groups: ClassroomGroup[]): void {
  try {
    _cachedGroups = groups;
    localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
  } catch (e) {
    console.error('Failed to save classroom groups', e);
  }
}

export function getClassroomAuth(): ClassroomUserAuth | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ClassroomUserAuth;
  } catch {
    return null;
  }
}

export function setClassroomAuth(auth: ClassroomUserAuth | null): void {
  try {
    if (!auth) {
      localStorage.removeItem(AUTH_KEY);
    } else {
      localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
    }
    window.dispatchEvent(new CustomEvent('classroom-auth-changed', { detail: auth }));
  } catch (e) {
    console.error('Failed to set classroom auth', e);
  }
}

export function getDevicePreference(): DeviceType | null {
  try {
    const pref = localStorage.getItem(DEVICE_KEY);
    if (pref === 'phone' || pref === 'laptop' || pref === 'tablet') {
      return pref;
    }
    return null;
  } catch {
    return null;
  }
}

export function setDevicePreference(device: DeviceType): void {
  try {
    localStorage.setItem(DEVICE_KEY, device);
    window.dispatchEvent(new CustomEvent('device-preference-changed', { detail: device }));
  } catch (e) {
    console.error('Failed to set device preference', e);
  }
}

export function getOfflineMode(): boolean {
  try {
    const raw = localStorage.getItem(OFFLINE_MODE_KEY);
    return raw === 'true';
  } catch {
    return false;
  }
}

export function setOfflineMode(offline: boolean): void {
  try {
    localStorage.setItem(OFFLINE_MODE_KEY, String(offline));
    window.dispatchEvent(new CustomEvent('offline-mode-changed', { detail: offline }));
  } catch (e) {
    console.error('Failed to set offline mode', e);
  }
}

export function recordStudentQuizResult(groupId: string, studentName: string, scoreGained: number): void {
  try {
    const groups = getClassroomGroups();
    const grp = groups.find((g) => g.id === groupId);
    if (!grp) return;

    let student = grp.students.find((s) => s.name.toLowerCase() === studentName.toLowerCase());
    if (student) {
      student.totalQuizzesTaken += 1;
      student.totalScore += scoreGained;
      student.lastActive = Date.now();
    } else {
      // Add student (unlimited capacity)
      grp.students.push({
        id: `std_real_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        name: studentName,
        rollNumber: String(grp.students.length + 1).padStart(2, '0'),
        avatarEmoji: '⭐',
        groupId,
        totalQuizzesTaken: 1,
        totalScore: scoreGained,
        lastActive: Date.now()
      });
    }

    saveClassroomGroups(groups);
  } catch (e) {
    console.error('Failed to record student quiz result', e);
  }
}

export function logoutClassroomUser(): void {
  try {
    localStorage.removeItem(AUTH_KEY);
    window.dispatchEvent(new CustomEvent('classroom-auth-changed', { detail: null }));
  } catch (e) {
    console.error('Failed to logout classroom user', e);
  }
}

export function createClassroomGroup(data: {
  name: string;
  teacherName: string;
  gradeLevel: string;
  code?: string;
  description?: string;
  teacherId?: string;
  teacherEmail?: string;
}): ClassroomGroup {
  const groups = getClassroomGroups();
  const rawCode = data.code?.trim() || `CLS-${Math.floor(1000 + Math.random() * 9000)}`;
  const newGroup: ClassroomGroup = {
    id: `grp_${Date.now()}`,
    name: data.name.trim(),
    teacherName: data.teacherName.trim(),
    gradeLevel: data.gradeLevel.trim() || 'Class 6 to 12',
    code: rawCode.toUpperCase(),
    description: data.description?.trim() || `Classroom learning group created by ${data.teacherName} (Capacity: 75 students).`,
    maxCapacity: 75, // Guaranteed at least 70+ student capacity!
    students: [],
    teacherId: data.teacherId,
    teacherEmail: data.teacherEmail
  };

  groups.unshift(newGroup);
  saveClassroomGroups(groups);
  return newGroup;
}

export function joinClassroomGroup(
  groupId: string,
  student: { name: string; rollNumber?: string; avatarEmoji?: string }
): StudentProfile {
  const groups = getClassroomGroups();
  const grp = groups.find((g) => g.id === groupId);
  if (!grp) {
    throw new Error('Group not found');
  }

  const maxCap = grp.maxCapacity || 75;
  if (grp.students.length >= maxCap) {
    throw new Error(`This classroom group has reached its maximum capacity of ${maxCap} students.`);
  }

  // Check if student already exists
  let existing = grp.students.find((s) => s.name.toLowerCase() === student.name.trim().toLowerCase());
  if (existing) {
    if (student.avatarEmoji) existing.avatarEmoji = student.avatarEmoji;
    if (student.rollNumber) existing.rollNumber = student.rollNumber;
    existing.lastActive = Date.now();
    saveClassroomGroups(groups);
    return existing;
  }

  // Add new student (Supports 75+ capacity!)
  const newStudent: StudentProfile = {
    id: `std_real_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    name: student.name.trim(),
    rollNumber: student.rollNumber?.trim() || String(grp.students.length + 1).padStart(2, '0'),
    avatarEmoji: student.avatarEmoji || '🧑‍🎓',
    groupId,
    totalQuizzesTaken: 0,
    totalScore: 0,
    lastActive: Date.now()
  };

  grp.students.push(newStudent);
  saveClassroomGroups(groups);
  return newStudent;
}

// Lag-free batch enrollment when multiple (up to 75+) students join at once
export function batchEnrollStudents(
  groupId: string,
  newStudentsList: Array<{ name: string; rollNumber?: string; avatarEmoji?: string }>
): ClassroomGroup | null {
  const groups = getClassroomGroups();
  const grp = groups.find((g) => g.id === groupId);
  if (!grp) return null;

  const maxCap = grp.maxCapacity || 75;
  const existingNames = new Set(grp.students.map((s) => s.name.toLowerCase()));

  for (const s of newStudentsList) {
    if (grp.students.length >= maxCap) break;
    const cleanName = s.name.trim();
    if (!cleanName || existingNames.has(cleanName.toLowerCase())) continue;

    existingNames.add(cleanName.toLowerCase());
    grp.students.push({
      id: `std_batch_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      name: cleanName,
      rollNumber: s.rollNumber || String(grp.students.length + 1).padStart(2, '0'),
      avatarEmoji: s.avatarEmoji || '🧑‍🎓',
      groupId,
      totalQuizzesTaken: 0,
      totalScore: 0,
      lastActive: Date.now()
    });
  }

  saveClassroomGroups(groups);
  return grp;
}

// Join group by Teacher's Classroom Code (e.g. "BIO-7429", "CLS-910")
export function joinGroupByCode(
  code: string,
  student: { name: string; rollNumber?: string; avatarEmoji?: string }
): { success: boolean; group?: ClassroomGroup; student?: StudentProfile; error?: string } {
  if (!code || !code.trim()) {
    return { success: false, error: 'Please enter a valid classroom join code.' };
  }

  const cleanCode = code.trim().toUpperCase();
  const groups = getClassroomGroups();
  const matchedGroup = groups.find(
    (g) => g.code.toUpperCase() === cleanCode || g.id === cleanCode
  );

  if (!matchedGroup) {
    return {
      success: false,
      error: `No classroom group found with code "${cleanCode}". Please verify the code with your teacher.`
    };
  }

  const maxCap = matchedGroup.maxCapacity || 75;
  if (matchedGroup.students.length >= maxCap) {
    return {
      success: false,
      error: `Classroom "${matchedGroup.name}" is full (maximum ${maxCap} students capacity reached).`
    };
  }

  try {
    const enrolledStudent = joinClassroomGroup(matchedGroup.id, student);
    return { success: true, group: matchedGroup, student: enrolledStudent };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to join group.' };
  }
}

// Assign a quiz to a class group so all 70+ students can take the exact test
export function assignQuizToClassGroup(
  groupId: string,
  quizData: {
    title: string;
    topic: string;
    questionsCount?: number;
    fullData?: any;
  }
): boolean {
  const groups = getClassroomGroups();
  const grp = groups.find((g) => g.id === groupId);
  if (!grp) return false;

  grp.assignedQuizTitle = quizData.title;
  grp.assignedQuizTopic = quizData.topic;
  grp.assignedQuizQuestions = quizData.questionsCount || 15;
  if (quizData.fullData) {
    grp.assignedQuizFullData = quizData.fullData;
  }

  saveClassroomGroups(groups);
  window.dispatchEvent(new CustomEvent('class-quiz-assigned', { detail: { groupId, ...quizData } }));
  return true;
}

// Record student score for the classroom podium & teacher report
export function recordStudentQuizScore(
  groupId: string,
  studentName: string,
  score: number
): void {
  const groups = getClassroomGroups();
  const grp = groups.find((g) => g.id === groupId);
  if (!grp) return;

  const std = grp.students.find((s) => s.name.toLowerCase() === studentName.toLowerCase().trim());
  if (std) {
    std.totalQuizzesTaken = (std.totalQuizzesTaken || 0) + 1;
    std.totalScore = Math.max(std.totalScore || 0, score);
    std.lastActive = Date.now();
    saveClassroomGroups(groups);
  }
}

// Owner Admin Permission check:
// Admin login is permitted ONLY with secret owner password or authorized passkeys
export const OWNER_ADMIN_PASSCODES = ['0192837465', 'ADMIN2026', 'ADMIN', 'PRANAV-ADMIN', 'PRANAV-2026', 'ADMIN-MASTER-2026', 'OWNER-7724', '7724'];

const APPROVED_ADMINS_KEY = 'testgen_approved_admins';

export function getApprovedAdminsList(): string[] {
  try {
    const raw = localStorage.getItem(APPROVED_ADMINS_KEY);
    if (!raw) return ['pranav', 'admin'];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : ['pranav', 'admin'];
  } catch {
    return ['pranav', 'admin'];
  }
}

export function grantAdminPermission(identifier: string): boolean {
  if (!identifier || !identifier.trim()) return false;
  try {
    const list = getApprovedAdminsList();
    const clean = identifier.trim().toLowerCase();
    if (!list.includes(clean)) {
      list.push(clean);
      localStorage.setItem(APPROVED_ADMINS_KEY, JSON.stringify(list));
    }
    return true;
  } catch {
    return false;
  }
}

export function revokeAdminPermission(identifier: string): boolean {
  if (!identifier || !identifier.trim()) return false;
  try {
    const list = getApprovedAdminsList().filter((e) => e.toLowerCase() !== identifier.trim().toLowerCase());
    localStorage.setItem(APPROVED_ADMINS_KEY, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}

export function isOwnerOrAdminPermitted(credential: string, adminName?: string): { authorized: boolean; reason?: string } {
  if (!credential || !credential.trim()) {
    return { authorized: false, reason: 'Please enter the administrator password.' };
  }

  const cleanRaw = credential.trim();
  const cleanUpper = cleanRaw.toUpperCase();

  // Primary Secret Owner Admin Password check
  if (cleanRaw === '0192837465') {
    return { authorized: true };
  }

  // Master passcodes or owner check
  if (OWNER_ADMIN_PASSCODES.includes(cleanUpper) || cleanUpper.startsWith('PRANAV') || cleanUpper === 'ADMIN-MASTER-2026') {
    return { authorized: true };
  }

  // If entered name is Pranav and passkey matches
  if (adminName && adminName.trim().toLowerCase() === 'pranav' && (cleanRaw === '0192837465' || cleanUpper === 'PRANAV-ADMIN' || cleanUpper === '7724' || cleanUpper === 'ADMIN' || cleanUpper === 'OWNER')) {
    return { authorized: true };
  }

  // Check if owner previously approved this identifier in localStorage
  try {
    const approvedList = getApprovedAdminsList();
    const clean = cleanRaw.toLowerCase();
    if (approvedList.some((e) => e.toLowerCase() === clean)) {
      return { authorized: true };
    }
  } catch {}

  return {
    authorized: false,
    reason: 'Access Denied: Incorrect administrator password. Please verify your credentials and try again.'
  };
}

export const VALID_TEACHER_PASSCODES = ['TEACHER2026', 'FACULTY', 'STAFF7724', 'TEACHER', '0192837465', '7724'];

export function isTeacherStaffPermitted(passcode: string): { authorized: boolean; reason?: string } {
  if (!passcode || !passcode.trim()) {
    return {
      authorized: false,
      reason: 'Staff Passcode required. Students cannot log in through the Teacher portal without teacher staff verification.'
    };
  }

  const clean = passcode.trim().toUpperCase();
  if (
    VALID_TEACHER_PASSCODES.includes(clean) ||
    clean === '0192837465' ||
    OWNER_ADMIN_PASSCODES.includes(clean)
  ) {
    return { authorized: true };
  }

  return {
    authorized: false,
    reason: 'Access Denied: Invalid Teacher Staff Passcode. Students are prohibited from logging in as teachers. Please switch to the Student Login tab.'
  };
}

// ==========================================
// PRINCIPAL AUTHENTICATION & ACCESS CONTROL
// ==========================================
export const PRINCIPAL_PASSWORD = '93247';

export function isPrincipalPermitted(password: string): { authorized: boolean; reason?: string } {
  if (!password || !password.trim()) {
    return {
      authorized: false,
      reason: 'Please enter the Principal password.'
    };
  }

  const clean = password.trim();
  if (clean === PRINCIPAL_PASSWORD) {
    return { authorized: true };
  }

  return {
    authorized: false,
    reason: 'Access Denied: Incorrect Principal password. Please enter the authorized password 93247.'
  };
}

// ==========================================
// ADMIN KICK MANAGEMENT SYSTEM
// Admin can kick anyone out including the principal!
// ==========================================
export interface KickedUserRecord {
  id: string;
  name: string;
  role: UserRole;
  kickedAt: number;
  kickedBy: string;
  reason?: string;
}

const KICKED_USERS_KEY = 'testgen_kicked_users';

export function getKickedUsers(): KickedUserRecord[] {
  try {
    const raw = localStorage.getItem(KICKED_USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function isUserKicked(nameOrId: string, role?: UserRole): boolean {
  if (!nameOrId) return false;
  const list = getKickedUsers();
  const clean = nameOrId.trim().toLowerCase();
  return list.some(
    (k) =>
      (k.id.toLowerCase() === clean || k.name.toLowerCase() === clean) &&
      (!role || k.role === role)
  );
}

export function kickUserOut(
  target: { id?: string; name: string; role: UserRole; reason?: string },
  adminName: string = 'Master Administrator'
): { success: boolean; message: string } {
  // Only Admin can kick, but admin CANNOT be kicked
  if (target.role === 'admin') {
    return {
      success: false,
      message: 'Security Policy: Master Administrators cannot be kicked out.'
    };
  }

  try {
    const kickedList = getKickedUsers();
    const record: KickedUserRecord = {
      id: target.id || `kicked_${Date.now()}`,
      name: target.name.trim(),
      role: target.role,
      kickedAt: Date.now(),
      kickedBy: adminName,
      reason: target.reason || 'Terminated by Administrator'
    };

    kickedList.unshift(record);
    localStorage.setItem(KICKED_USERS_KEY, JSON.stringify(kickedList));

    // If target is currently enrolled student in any classroom, remove them
    const groups = getClassroomGroups();
    let groupModified = false;
    groups.forEach((g) => {
      const initLen = g.students.length;
      g.students = g.students.filter(
        (s) => s.name.toLowerCase() !== target.name.toLowerCase() && (!target.id || s.id !== target.id)
      );
      if (g.students.length !== initLen) {
        groupModified = true;
      }
    });
    if (groupModified) {
      saveClassroomGroups(groups);
    }

    // Check if the currently logged-in user on this device matches the kicked user
    const current = getClassroomAuth();
    if (
      current &&
      ((target.role === 'principal' && current.role === 'principal') ||
        current.userName.toLowerCase() === target.name.toLowerCase() ||
        (target.id && (current.studentId === target.id || current.rollNumber === target.id)))
    ) {
      // Force log out immediately
      logoutClassroomUser();
      window.dispatchEvent(
        new CustomEvent('user-kicked-out', {
          detail: {
            kickedName: target.name,
            kickedRole: target.role,
            adminName,
            reason: record.reason
          }
        })
      );
    }

    // Notify components that roster / active sessions changed
    window.dispatchEvent(new CustomEvent('kicked-users-updated', { detail: record }));

    return {
      success: true,
      message: `Successfully kicked out ${target.role.toUpperCase()} "${target.name}". Their access has been terminated.`
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Failed to kick user out.'
    };
  }
}

export function pardonOrRevokeKick(targetNameOrId: string): boolean {
  try {
    const list = getKickedUsers().filter(
      (k) =>
        k.id.toLowerCase() !== targetNameOrId.toLowerCase() &&
        k.name.toLowerCase() !== targetNameOrId.toLowerCase()
    );
    localStorage.setItem(KICKED_USERS_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('kicked-users-updated'));
    return true;
  } catch {
    return false;
  }
}


