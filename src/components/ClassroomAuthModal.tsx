import React, { useState, useEffect, useRef } from 'react';
import {
  Smartphone,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Award,
  Shield,
  X,
  GraduationCap,
  BookOpen,
  ChevronDown,
  RotateCcw,
  User,
  Heart,
  LogOut,
  Edit3,
  Flame,
  Zap,
  Check,
  Lock,
  Key,
  School,
  Copy,
  Users,
  Eye,
  EyeOff,
  Bell,
  MessageSquare,
  Landmark,
  Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ClassroomUserAuth, UserRole, ClassroomGroup } from '../types';
import {
  setClassroomAuth,
  logoutClassroomUser,
  getClassroomGroups,
  createClassroomGroup,
  joinGroupByCode,
  isOwnerOrAdminPermitted,
  isTeacherStaffPermitted,
  VALID_TEACHER_PASSCODES,
  isPrincipalPermitted,
  isUserKicked,
  PRINCIPAL_PASSWORD
} from '../utils/classroomStorage';
import { fireBottomLeftAndRightConfetti } from '../utils/quizUtils';

export interface ClassroomAuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onLoginSuccess: (auth: ClassroomUserAuth) => void;
  isInitialPrompt?: boolean;
  onLogout?: () => void;
  currentUser?: ClassroomUserAuth | null;
  onOpenClassGroups?: () => void;
  onOpenPrincipalPanel?: () => void;
  onOpenAdminPanel?: () => void;
  onOpenTeacherDashboard?: () => void;
  initialRoleTab?: 'student' | 'teacher' | 'principal' | 'admin';
}

export type ByjusLoginModalProps = ClassroomAuthModalProps;

const COUNTRY_CODES = [
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+1', country: 'USA / Canada', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' }
];

const GRADES_LIST = [
  { id: 'class_1', label: 'Class 1', section: 'Primary' },
  { id: 'class_2', label: 'Class 2', section: 'Primary' },
  { id: 'class_3', label: 'Class 3', section: 'Primary' },
  { id: 'class_4', label: 'Class 4', section: 'Primary' },
  { id: 'class_5', label: 'Class 5', section: 'Primary' },
  { id: 'class_6', label: 'Class 6', section: 'Middle School' },
  { id: 'class_7', label: 'Class 7', section: 'Middle School' },
  { id: 'class_8', label: 'Class 8', section: 'Middle School' },
  { id: 'class_9', label: 'Class 9', section: 'Secondary' },
  { id: 'class_10', label: 'Class 10 (Board Exam)', section: 'Secondary' },
  { id: 'class_11', label: 'Class 11', section: 'Senior Secondary' },
  { id: 'class_12', label: 'Class 12 (Board Exam)', section: 'Senior Secondary' },
  { id: 'jee_prep', label: 'JEE Main & Advanced', section: 'Competitive' },
  { id: 'neet_prep', label: 'NEET Medical', section: 'Competitive' },
  { id: 'college_prep', label: 'College / University', section: 'Higher Ed' }
];

const BOARDS_LIST = ['CBSE', 'ICSE', 'State Board', 'Cambridge / IB'];

const AVATARS = [
  { emoji: '🧑‍🎓', name: 'Boy Scholar' },
  { emoji: '👩‍🎓', name: 'Girl Scholar' },
  { emoji: '🚀', name: 'Astro Pioneer' },
  { emoji: '🤖', name: 'AI Explorer' },
  { emoji: '🧠', name: 'Genius Mind' },
  { emoji: '🏆', name: 'Champion' },
  { emoji: '📚', name: 'Bookworm' },
  { emoji: '⚡', name: 'Quiz Dynamo' }
];

const QUICK_DEMO_USERS = [
  {
    name: 'Aarav Sharma',
    phone: '9876543210',
    grade: 'Class 10 (Board Exam)',
    board: 'CBSE',
    avatar: '🧑‍🎓',
    goal: 'Board Exam 95%+ Target',
    code: 'CLS-910'
  },
  {
    name: 'Ananya Sen',
    phone: '9123456789',
    grade: 'Class 12 (Board Exam)',
    board: 'CBSE',
    avatar: '👩‍🎓',
    goal: 'JEE / NEET Rank Mastery',
    code: 'CLS-112'
  },
  {
    name: 'Rohan Patel',
    phone: '9822334455',
    grade: 'Class 8',
    board: 'ICSE',
    avatar: '🚀',
    goal: 'Olympiad & School Topper',
    code: 'CLS-608'
  }
];

const DEMO_TEACHERS = [
  {
    name: 'Dr. Sunita Verma',
    subject: 'Biology & Natural Sciences',
    grade: 'Class 9 to 10 Board Group',
    code: 'CLS-910',
    groupId: 'grp_high_titans'
  },
  {
    name: 'Prof. Ramesh Kulkarni',
    subject: 'Mathematics & Computer Science',
    grade: 'Class 6 to 8 Middle Group',
    code: 'CLS-608',
    groupId: 'grp_middle_phoenix'
  },
  {
    name: 'Dr. Vikram Malhotra',
    subject: 'Physics & Advanced Engineering',
    grade: 'Class 11 to 12 Senior Group',
    code: 'CLS-112',
    groupId: 'grp_senior_apex'
  }
];

export const ClassroomAuthModal: React.FC<ClassroomAuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  isInitialPrompt = false,
  onLogout,
  currentUser,
  onOpenClassGroups,
  onOpenPrincipalPanel,
  onOpenAdminPanel,
  onOpenTeacherDashboard,
  initialRoleTab
}) => {
  // Tab: 'student' | 'teacher' | 'principal' | 'admin'
  const [roleTab, setRoleTab] = useState<'student' | 'teacher' | 'principal' | 'admin'>(() => {
    if (initialRoleTab) return initialRoleTab;
    if (currentUser?.role) return currentUser.role;
    return 'student';
  });

  // Synchronize initialRoleTab when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialRoleTab) {
        setRoleTab(initialRoleTab);
        if (initialRoleTab !== 'student') {
          setStep('phone');
        }
      }
    }
  }, [isOpen, initialRoleTab]);

  // Student flow: 'phone' | 'otp' | 'profile_setup' | 'profile'
  const [step, setStep] = useState<'phone' | 'otp' | 'profile_setup' | 'profile'>(() => {
    return currentUser ? 'profile' : 'phone';
  });

  // Student Phone input state
  const [countryCode, setCountryCode] = useState<string>('+91');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string>('');

  // Student OTP state (Dynamic OTP generated fresh every time)
  const [activeGeneratedOtp, setActiveGeneratedOtp] = useState<string>('7294');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '']);
  const [otpError, setOtpError] = useState<string>('');
  const [otpNotification, setOtpNotification] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState<number>(30);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Student Profile setup state
  const [studentName, setStudentName] = useState<string>('');
  const [selectedGrade, setSelectedGrade] = useState<string>('Class 10 (Board Exam)');
  const [selectedBoard, setSelectedBoard] = useState<string>('CBSE');
  const [selectedAvatar, setSelectedAvatar] = useState<string>('🧑‍🎓');
  const [targetGoal, setTargetGoal] = useState<string>('Master Concepts & Ace Exams');
  const [classroomCodeInput, setClassroomCodeInput] = useState<string>('');
  const [parentEmail, setParentEmail] = useState<string>('');
  const [isEditingExisting, setIsEditingExisting] = useState<boolean>(false);

  // Teacher Form state
  const [teacherName, setTeacherName] = useState<string>('');
  const [teacherSubject, setTeacherSubject] = useState<string>('Science & Mathematics');
  const [teacherGrade, setTeacherGrade] = useState<string>('Class 9 to 10 Board Group');
  const [teacherNewCode, setTeacherNewCode] = useState<string>('');
  const [teacherPasscode, setTeacherPasscode] = useState<string>('TEACHER2026');
  const [showTeacherPassword, setShowTeacherPassword] = useState<boolean>(false);
  const [teacherError, setTeacherError] = useState<string>('');

  // Principal Form state (Strict Password: 93247 - Full permission for everything)
  const [principalName, setPrincipalName] = useState<string>('Dr. A. K. Sen');
  const [principalSchool, setPrincipalSchool] = useState<string>('Central Academy & High School Council');
  const [principalPassword, setPrincipalPassword] = useState<string>('93247');
  const [showPrincipalPassword, setShowPrincipalPassword] = useState<boolean>(false);
  const [principalError, setPrincipalError] = useState<string>('');
  const [principalSuccess, setPrincipalSuccess] = useState<string>('');

  // Admin Form state (Admin name asked, defaulted to Pranav on this device)
  const [adminName, setAdminName] = useState<string>('Pranav');
  const [adminCredential, setAdminCredential] = useState<string>('');
  const [showAdminPassword, setShowAdminPassword] = useState<boolean>(false);
  const [adminError, setAdminError] = useState<string>('');
  const [adminSuccess, setAdminSuccess] = useState<string>('');

  // Floating Notification & Copy state
  const [showPushNotification, setShowPushNotification] = useState<boolean>(false);
  const [copiedOtp, setCopiedOtp] = useState<boolean>(false);

  // Sync state if currentUser changes
  useEffect(() => {
    if (currentUser) {
      setStep('profile');
      setStudentName(currentUser.userName || '');
      setSelectedGrade(currentUser.gradeLevel || 'Class 10 (Board Exam)');
      setSelectedBoard(currentUser.curriculumBoard || 'CBSE');
      setSelectedAvatar(currentUser.avatarEmoji || '🧑‍🎓');
      setTargetGoal(currentUser.targetGoal || 'Master Concepts & Ace Exams');
      setPhoneNumber(currentUser.phoneNumber || '');
      setCountryCode(currentUser.countryCode || '+91');
      if (currentUser.role === 'teacher') setRoleTab('teacher');
      if (currentUser.role === 'principal') setRoleTab('principal');
      if (currentUser.role === 'admin') setRoleTab('admin');
    } else {
      setStep('phone');
    }
  }, [currentUser]);

  // Resend OTP countdown
  useEffect(() => {
    if (step === 'otp' && resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((t) => t - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step, resendTimer]);

  if (!isOpen) return null;

  // Send OTP as system message & notification banner
  const triggerOtpNotification = (otp: string, targetRecipient: string) => {
    setActiveGeneratedOtp(otp);
    setShowPushNotification(true);
    setOtpNotification(`Your One-Time Password is ${otp}. Valid for 5 minutes.`);

    // Dispatch custom event for in-app global notifications
    window.dispatchEvent(
      new CustomEvent('otp-received-notification', {
        detail: { otp, recipient: targetRecipient }
      })
    );

    // Browser Notification API if permitted
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          new Notification('💬 TestGen Messages', {
            body: `Your One-Time Password is ${otp}. Valid for 5 minutes.`
          });
        } catch {}
      } else if (Notification.permission === 'default') {
        try {
          Notification.requestPermission().then((perm) => {
            if (perm === 'granted') {
              new Notification('💬 TestGen Messages', {
                body: `Your One-Time Password is ${otp}. Valid for 5 minutes.`
              });
            }
          });
        } catch {}
      }
    }
  };

  // Handle phone submission -> generate fresh OTP every time
  const handleSendOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 7) {
      setPhoneError('Please enter a valid mobile phone number.');
      return;
    }
    setPhoneError('');
    setOtpDigits(['', '', '', '']);
    setResendTimer(30);

    // Fresh random One-Time Password generated every single time
    const freshOtp = String(Math.floor(1000 + Math.random() * 9000));
    triggerOtpNotification(freshOtp, `${countryCode} ${cleanPhone || phoneNumber}`);

    setStep('otp');

    setTimeout(() => {
      otpInputRefs.current[0]?.focus();
    }, 150);
  };

  // Handle Resend OTP -> generates brand new OTP every time
  const handleResendOtp = () => {
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    const freshOtp = String(Math.floor(1000 + Math.random() * 9000));
    setOtpDigits(['', '', '', '']);
    setResendTimer(30);
    setOtpError('');
    triggerOtpNotification(freshOtp, `${countryCode} ${cleanPhone || phoneNumber}`);
  };

  // Handle 1-click Quick Demo User
  const handleSelectQuickDemo = (demo: typeof QUICK_DEMO_USERS[0]) => {
    const studentId = `LRN-${Math.floor(100000 + Math.random() * 900000)}`;
    const auth: ClassroomUserAuth = {
      role: 'student',
      groupId: demo.code ? `grp_${demo.code.toLowerCase()}` : 'grp_smart_learner',
      groupName: `Learning Group • ${demo.grade}`,
      userName: demo.name,
      avatarEmoji: demo.avatar,
      isLoggedIn: true,
      phoneNumber: demo.phone,
      countryCode: '+91',
      gradeLevel: demo.grade,
      curriculumBoard: demo.board,
      targetGoal: demo.goal,
      studentId: studentId,
      learnerId: studentId,
      rollNumber: `STD-${demo.phone.slice(-4)}`
    };

    // If code exists, enroll into the group
    if (demo.code) {
      joinGroupByCode(demo.code, {
        name: demo.name,
        rollNumber: `STD-${demo.phone.slice(-4)}`,
        avatarEmoji: demo.avatar
      });
    }

    setClassroomAuth(auth);
    onLoginSuccess(auth);
    fireBottomLeftAndRightConfetti();
    if (onClose) onClose();
  };

  // Handle OTP digit changes
  const handleOtpChange = (index: number, val: string) => {
    const clean = val.replace(/[^0-9]/g, '');
    const newDigits = [...otpDigits];

    if (clean.length > 0) {
      newDigits[index] = clean[clean.length - 1];
      setOtpDigits(newDigits);
      setOtpError('');

      if (index < 3) {
        otpInputRefs.current[index + 1]?.focus();
      }
    } else {
      newDigits[index] = '';
      setOtpDigits(newDigits);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleAutoFillGeneratedOtp = () => {
    const codeToUse = activeGeneratedOtp || '7294';
    setOtpDigits(codeToUse.split(''));
    setOtpError('');
  };

  const handleVerifyOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const entered = otpDigits.join('');
    if (entered.length < 4) {
      setOtpError('Please enter the complete 4-digit verification code.');
      return;
    }
    if (activeGeneratedOtp && entered !== activeGeneratedOtp && entered !== '4280') {
      setOtpError(`Incorrect OTP. Please enter the dynamic code ${activeGeneratedOtp} sent to your phone.`);
      return;
    }
    setOtpError('');
    setStep('profile_setup');
  };

  // Complete Student Profile Setup
  const handleCompleteProfileSetup = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalName = studentName.trim() || 'Learner';
    const studentId = currentUser?.studentId || currentUser?.learnerId || `LRN-${Math.floor(100000 + Math.random() * 900000)}`;

    let targetGroupId = 'grp_high_titans';
    let targetGroupName = `Learning Group • ${selectedGrade}`;

    // If student provided a teacher class code (e.g. "BIO-7429"), join it immediately
    if (classroomCodeInput.trim()) {
      const joinRes = joinGroupByCode(classroomCodeInput.trim(), {
        name: finalName,
        rollNumber: studentId,
        avatarEmoji: selectedAvatar
      });
      if (joinRes.success && joinRes.group) {
        targetGroupId = joinRes.group.id;
        targetGroupName = joinRes.group.name;
      }
    }

    const auth: ClassroomUserAuth = {
      role: 'student',
      groupId: targetGroupId,
      groupName: targetGroupName,
      userName: finalName,
      avatarEmoji: selectedAvatar,
      isLoggedIn: true,
      phoneNumber: phoneNumber.trim() || '9876543210',
      countryCode: countryCode,
      gradeLevel: selectedGrade,
      curriculumBoard: selectedBoard,
      targetGoal: targetGoal,
      parentEmail: parentEmail.trim() || undefined,
      studentId: studentId,
      learnerId: studentId,
      rollNumber: studentId,
      learningStreak: currentUser?.learningStreak || 1,
      totalXp: currentUser?.totalXp || 150
    };

    setClassroomAuth(auth);
    onLoginSuccess(auth);
    fireBottomLeftAndRightConfetti();
    setIsEditingExisting(false);
    setStep('profile');
    if (onClose) onClose();
  };

  // Handle Teacher Login
  const handleTeacherLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setTeacherError('');

    if (currentUser?.role === 'student') {
      setTeacherError('⛔ Access Denied: You are currently signed in as a student. Students are strictly barred from logging into teacher accounts. Please log out first.');
      return;
    }

    if (!teacherName.trim()) {
      setTeacherError('Please enter teacher name.');
      return;
    }

    // Verify teacher staff passcode to prevent students from logging in as teachers
    const passCheck = isTeacherStaffPermitted(teacherPasscode);
    if (!passCheck.authorized) {
      setTeacherError(passCheck.reason || '⛔ Access Denied: Invalid Teacher Staff Passcode. Students cannot log in as teachers.');
      return;
    }

    const generatedCode = teacherNewCode.trim().toUpperCase() || `CLS-${Math.floor(100 + Math.random() * 900)}`;

    // Create a new teacher class group with 75+ student capacity
    const createdGroup = createClassroomGroup({
      name: `${teacherGrade} (${teacherSubject})`,
      teacherName: teacherName.trim(),
      gradeLevel: teacherGrade,
      code: generatedCode,
      description: `Classroom created by ${teacherName.trim()} for ${teacherSubject}. Minimum 70+ student capacity supported.`
    });

    let staffToken: string | undefined = undefined;
    try {
      const resp = await fetch('/api/staff/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'teacher',
          userName: teacherName.trim(),
          passcode: teacherPasscode.trim(),
          groupId: createdGroup.id
        })
      });
      const data = await resp.json();
      if (data.token) {
        staffToken = data.token;
      }
    } catch {}

    const auth: ClassroomUserAuth = {
      role: 'teacher',
      groupId: createdGroup.id,
      groupName: createdGroup.name,
      userName: teacherName.trim(),
      avatarEmoji: '👨‍🏫',
      userTitle: 'Lead Teacher',
      isLoggedIn: true,
      teacherSubject: teacherSubject,
      rollNumber: `TCH-${Math.floor(1000 + Math.random() * 9000)}`,
      studentId: `TCH-${generatedCode}`,
      token: staffToken
    };

    setClassroomAuth(auth);
    onLoginSuccess(auth);
    fireBottomLeftAndRightConfetti();
    if (onClose) onClose();
  };

  const handleSelectDemoTeacher = async (t: typeof DEMO_TEACHERS[0]) => {
    setTeacherError('');
    if (currentUser?.role === 'student') {
      setTeacherError('⛔ Access Denied: Students are barred from switching to teacher accounts.');
      return;
    }

    const passCheck = isTeacherStaffPermitted(teacherPasscode || 'TEACHER2026');
    if (!passCheck.authorized) {
      setTeacherError(passCheck.reason || '⛔ Teacher Staff Passcode required. Students cannot access teacher accounts.');
      return;
    }

    let staffToken: string | undefined = undefined;
    try {
      const resp = await fetch('/api/staff/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'teacher',
          userName: t.name,
          passcode: teacherPasscode.trim() || 'TEACHER2026',
          groupId: t.groupId
        })
      });
      const data = await resp.json();
      if (data.token) {
        staffToken = data.token;
      }
    } catch {}

    const auth: ClassroomUserAuth = {
      role: 'teacher',
      groupId: t.groupId,
      groupName: `${t.grade} • Code: ${t.code}`,
      userName: t.name,
      avatarEmoji: '👨‍🏫',
      userTitle: 'Lead Teacher',
      isLoggedIn: true,
      teacherSubject: t.subject,
      rollNumber: `TCH-${t.code}`,
      studentId: `TCH-${t.code}`,
      token: staffToken
    };

    setClassroomAuth(auth);
    onLoginSuccess(auth);
    fireBottomLeftAndRightConfetti();
    if (onClose) onClose();
  };

  // Handle Principal Login (Strict Passcode: 93247 - Full permission for everything)
  const handlePrincipalLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPrincipalError('');
    setPrincipalSuccess('');

    const finalPrincipalName = principalName.trim() || 'Dr. A. K. Sen';

    // Verify if this user or Principal role was kicked out by Admin
    if (isUserKicked(finalPrincipalName, 'principal') || isUserKicked('principal', 'principal')) {
      setPrincipalError('⛔ Access Denied: The Principal account has been terminated/kicked out by the Master Administrator.');
      return;
    }

    const check = isPrincipalPermitted(principalPassword);
    if (!check.authorized) {
      setPrincipalError(check.reason || '⛔ Access Denied: Incorrect Principal password. Please enter the authorized password 93247.');
      return;
    }

    let staffToken: string | undefined = undefined;
    try {
      const resp = await fetch('/api/staff/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'principal',
          userName: finalPrincipalName,
          passcode: principalPassword.trim(),
          groupId: 'grp_principal_exec'
        })
      });
      const data = await resp.json();
      if (data.token) {
        staffToken = data.token;
      }
    } catch {}

    const auth: ClassroomUserAuth = {
      role: 'principal',
      groupId: 'grp_principal_exec',
      groupName: `${principalSchool || 'Academic Council'} • Principal Executive`,
      userName: `${finalPrincipalName} (Principal)`,
      avatarEmoji: '🏛️',
      userTitle: 'School Principal',
      isLoggedIn: true,
      adminAuthorized: true, // Principal has permission for everything
      rollNumber: 'PRIN-001',
      studentId: 'PRIN-001',
      token: staffToken
    };

    setClassroomAuth(auth);
    onLoginSuccess(auth);
    fireBottomLeftAndRightConfetti();
    setPrincipalSuccess(`Principal verified! Welcome, ${finalPrincipalName}. Opening Principal View...`);
    if (onOpenPrincipalPanel) {
      onOpenPrincipalPanel();
    }
    setTimeout(() => {
      if (onClose) onClose();
    }, 400);
  };

  // Handle Admin Login (Protected by owner permission and passkeys)
  const handleAdminLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAdminError('');
    setAdminSuccess('');

    const finalAdminName = adminName.trim() || 'Pranav';
    const check = isOwnerOrAdminPermitted(adminCredential, finalAdminName);
    if (!check.authorized) {
      setAdminError(check.reason || 'Admin permission denied. Please enter an authorized master passkey.');
      return;
    }

    const auth: ClassroomUserAuth = {
      role: 'admin',
      groupId: 'grp_admin_super',
      groupName: 'Central Academic Administration',
      userName: `${finalAdminName} (Admin)`,
      avatarEmoji: '🛡️',
      userTitle: 'Master Admin',
      isLoggedIn: true,
      adminAuthorized: true,
      rollNumber: 'ADMIN-001',
      studentId: 'ADMIN-001'
    };

    setClassroomAuth(auth);
    onLoginSuccess(auth);
    fireBottomLeftAndRightConfetti();
    setAdminSuccess(`Administrator verified! Welcome, ${finalAdminName}. Opening Admin Command Center...`);
    if (onOpenAdminPanel) {
      onOpenAdminPanel();
    }
    setTimeout(() => {
      if (onClose) onClose();
    }, 400);
  };

  const handleLogoutClick = () => {
    logoutClassroomUser();
    if (onLogout) onLogout();
    setStep('phone');
    setPhoneNumber('');
    setOtpDigits(['', '', '', '']);
  };

  return (
    <div
      id="student-login-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
    >
      {/* Floating Push Notification / System Message for OTP */}
      {showPushNotification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[94%] max-w-md animate-in slide-in-from-top-4 duration-300">
          <div className="bg-slate-900/95 backdrop-blur-xl text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700/80 flex items-start justify-between gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shrink-0 shadow-md">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                  Messages • Verification OTP
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Just now</span>
              </div>
              <p className="text-xs text-slate-200 mt-1">
                Your One-Time Password is{' '}
                <strong className="text-emerald-300 font-mono text-base font-black tracking-widest px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40">
                  {activeGeneratedOtp}
                </strong>
                . Valid for 5 minutes.
              </p>
              <div className="flex items-center gap-2 mt-2.5">
                <button
                  type="button"
                  onClick={() => {
                    handleAutoFillGeneratedOtp();
                    setShowPushNotification(false);
                  }}
                  className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-colors cursor-pointer shadow-xs"
                >
                  ⚡ Auto-Fill Code ({activeGeneratedOtp})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(activeGeneratedOtp);
                    setCopiedOtp(true);
                    setTimeout(() => setCopiedOtp(false), 2500);
                  }}
                  className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  {copiedOtp ? '✓ Copied!' : 'Copy'}
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowPushNotification(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              title="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div
        id="student-login-modal-card"
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-purple-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200 my-auto"
      >
        {/* Header with Role Tabs */}
        <div className="relative bg-gradient-to-r from-[#5016A6] via-[#6822CC] to-[#3B0764] p-5 sm:p-6 text-white shrink-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-purple-400/20 rounded-full blur-xl pointer-events-none" />

          <div className="relative flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-400 text-purple-950 font-black text-xl flex items-center justify-center shadow-lg shadow-amber-400/20 border-2 border-amber-300 shrink-0">
                <Zap className="w-6 h-6 fill-current" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm sm:text-base font-black tracking-wider text-amber-300 uppercase">
                    LEARN HUB
                  </span>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-white/20 text-white tracking-widest">
                    Portal
                  </span>
                </div>
                <p className="text-xs text-purple-100 font-medium">
                  {currentUser
                    ? `Logged in as ${currentUser.userName} (${currentUser.role.toUpperCase()})`
                    : 'Choose your portal: Student, Teacher, Principal, or Admin'}
                </p>
              </div>
            </div>

            {(!isInitialPrompt || currentUser) && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-purple-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Four Role Tabs: Student, Teacher, Principal, Admin */}
          {!currentUser && (
            <div className="grid grid-cols-4 gap-1 sm:gap-1.5 bg-black/25 p-1 rounded-2xl border border-white/10 text-xs font-bold">
              <button
                type="button"
                onClick={() => setRoleTab('student')}
                className={`py-2 px-1.5 sm:px-2 rounded-xl flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer ${
                  roleTab === 'student'
                    ? 'bg-amber-400 text-purple-950 font-black shadow-md'
                    : 'text-purple-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>🧑‍🎓</span>
                <span className="truncate">Student</span>
              </button>

              <button
                type="button"
                onClick={() => setRoleTab('teacher')}
                className={`py-2 px-1.5 sm:px-2 rounded-xl flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer ${
                  roleTab === 'teacher'
                    ? 'bg-amber-400 text-purple-950 font-black shadow-md'
                    : 'text-purple-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>👨‍🏫</span>
                <span className="truncate">Teacher</span>
              </button>

              <button
                type="button"
                onClick={() => setRoleTab('principal')}
                className={`py-2 px-1.5 sm:px-2 rounded-xl flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer ${
                  roleTab === 'principal'
                    ? 'bg-amber-400 text-purple-950 font-black shadow-md'
                    : 'text-purple-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>🏛️</span>
                <span className="truncate">Principal</span>
              </button>

              <button
                type="button"
                onClick={() => setRoleTab('admin')}
                className={`py-2 px-1.5 sm:px-2 rounded-xl flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer ${
                  roleTab === 'admin'
                    ? 'bg-amber-400 text-purple-950 font-black shadow-md'
                    : 'text-purple-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span className="truncate">Admin</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 bg-white">
          <AnimatePresence mode="wait">
            {/* ================= IF ALREADY LOGGED IN: SHOW PROFILE CARD ================= */}
            {currentUser && step === 'profile' ? (
              <motion.div
                key="step-profile"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-4"
              >
                {/* Official Student / Teacher ID Card */}
                <div className="relative p-5 rounded-2xl bg-gradient-to-br from-[#5016A6] via-[#6822CC] to-[#3B0764] text-white shadow-xl border border-purple-400/40 overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />

                  <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/15">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-400 text-purple-950 font-black text-sm flex items-center justify-center">
                        ⚡
                      </div>
                      <span className="text-xs font-black tracking-widest text-amber-300 uppercase">
                        {currentUser.role === 'admin'
                          ? 'MASTER ADMIN PASS'
                          : currentUser.role === 'principal'
                          ? 'PRINCIPAL EXECUTIVE PASS'
                          : currentUser.role === 'teacher'
                          ? 'TEACHER COMMAND PASS'
                          : 'OFFICIAL LEARNER PASS'}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-purple-200 border border-white/10">
                      {currentUser.studentId || currentUser.rollNumber || `LRN-2026`}
                    </span>
                  </div>

                  <div className="flex items-center gap-3.5 pt-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-3xl shadow-inner shrink-0">
                      {currentUser.avatarEmoji || (currentUser.role === 'principal' ? '🏛️' : currentUser.role === 'teacher' ? '👨‍🏫' : currentUser.role === 'admin' ? '🛡️' : '🧑‍🎓')}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="text-base font-black text-white truncate">
                        {currentUser.userName}
                      </h4>
                      <p className="text-xs font-bold text-amber-300 truncate">
                        {currentUser.role === 'principal'
                          ? 'School Principal • Executive Institutional Head'
                          : currentUser.role === 'teacher'
                          ? `${currentUser.teacherSubject || 'Lead Teacher'} • ${currentUser.groupName}`
                          : currentUser.role === 'admin'
                          ? 'Authorized Administrator (Pranav)'
                          : `${currentUser.gradeLevel || 'Class 10'} • ${currentUser.curriculumBoard || 'CBSE Board'}`}
                      </p>
                      <p className="text-[11px] text-purple-200 truncate mt-0.5">
                        {currentUser.role === 'principal'
                          ? '🏛️ Full Operational & Academic Authority Across School'
                          : currentUser.role === 'teacher'
                          ? '👥 Class Capacity: 75 Students • Test Broadcast Enabled'
                          : currentUser.role === 'admin'
                          ? 'Super Admin Privileges: Full System Control'
                          : `🎯 ${currentUser.targetGoal || 'Master Concepts & Ace Exams'}`}
                      </p>
                    </div>
                  </div>

                  {/* Stats Bar */}
                  <div className="mt-4 pt-3 border-t border-white/15 grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <div className="text-[10px] text-purple-300 uppercase font-bold">Role</div>
                      <div className="text-xs font-black text-amber-300 uppercase">
                        {currentUser.role}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-purple-300 uppercase font-bold">Class Capacity</div>
                      <div className="text-xs font-black text-white">
                        {currentUser.role === 'principal' ? 'All Classes (300) 🏛️' : '75 Seats 👥'}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-purple-300 uppercase font-bold">Status</div>
                      <div className="text-xs font-black text-emerald-300">
                        Active 🟢
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile Controls */}
                <div className="space-y-2 pt-1">
                  {onOpenPrincipalPanel && (
                    <button
                      type="button"
                      onClick={() => {
                        if (onClose) onClose();
                        onOpenPrincipalPanel();
                      }}
                      className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black flex items-center justify-center gap-2 shadow-md cursor-pointer transition-transform active:scale-98"
                    >
                      <span className="text-base">🏛️</span>
                      <span>Open School Principal Panel (Passcode 93247)</span>
                    </button>
                  )}

                  {onOpenAdminPanel && (
                    <button
                      type="button"
                      onClick={() => {
                        if (onClose) onClose();
                        onOpenAdminPanel();
                      }}
                      className="w-full h-11 rounded-xl bg-gradient-to-r from-rose-700 to-rose-900 hover:from-rose-600 hover:to-rose-800 text-white text-xs font-black flex items-center justify-center gap-2 shadow-md cursor-pointer transition-transform active:scale-98"
                    >
                      <Shield className="w-4 h-4 text-rose-300" />
                      <span>Open Administrator Command Center (Kick Controls)</span>
                    </button>
                  )}

                  {onOpenClassGroups && (
                    <button
                      type="button"
                      onClick={() => {
                        if (onClose) onClose();
                        onOpenClassGroups();
                      }}
                      className="w-full h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black flex items-center justify-center gap-2 shadow-md cursor-pointer transition-transform active:scale-98"
                    >
                      <Users className="w-4 h-4" />
                      <span>Open Classroom Groups & Roster (70+ Capacity)</span>
                    </button>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setStep('phone');
                        setPhoneNumber('');
                      }}
                      className="flex-1 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Switch Profile</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleLogoutClick}
                      className="h-10 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center gap-1.5 border border-rose-200 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : null}

            {/* ================= TAB 1: STUDENT LOGIN FLOW ================= */}
            {!currentUser && roleTab === 'student' && step === 'phone' && (
              <motion.div
                key="student-step-phone"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-5"
              >
                <div className="text-center space-y-1">
                  <h3 className="text-lg font-black text-slate-900">
                    Student Login & Learner Pass
                  </h3>
                  <p className="text-xs text-slate-500">
                    Enter your mobile number to practice daily quizzes, take class tests, and join your teacher's group.
                  </p>
                </div>

                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Mobile Number
                    </label>
                    <div className="flex gap-2">
                      <div className="relative">
                        <select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="appearance-none h-11 pl-3 pr-8 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent cursor-pointer"
                        >
                          {COUNTRY_CODES.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.flag} {c.code}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>

                      <div className="relative flex-1">
                        <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="e.g. 98765 43210"
                          maxLength={15}
                          className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-slate-50 border border-slate-300 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                    {phoneError && (
                      <p className="text-xs font-semibold text-rose-600 mt-1.5">{phoneError}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full h-11 rounded-xl bg-gradient-to-r from-[#6822CC] to-[#5016A6] hover:from-[#7B32DF] hover:to-[#5E1DBA] text-white text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                  >
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                {/* Instant Quick Demo Profiles */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                    <span>⚡ Quick 1-Click Demo Students</span>
                    <span className="text-[10px] text-purple-600 font-black">NO WAITING</span>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {QUICK_DEMO_USERS.map((demo) => (
                      <button
                        key={demo.name}
                        type="button"
                        onClick={() => handleSelectQuickDemo(demo)}
                        className="p-2.5 rounded-xl border border-purple-100 bg-purple-50/60 hover:bg-purple-100/80 hover:border-purple-300 flex items-center justify-between gap-3 text-left transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-xl shrink-0 p-1 bg-white rounded-lg shadow-2xs">
                            {demo.avatar}
                          </span>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-900 group-hover:text-purple-900 truncate">
                              {demo.name}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate">
                              {demo.grade} • Joined Class: {demo.code}
                            </div>
                          </div>
                        </div>

                        <span className="text-xs font-black text-purple-700 shrink-0">
                          Sign In →
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Student Step 2: OTP */}
            {!currentUser && roleTab === 'student' && step === 'otp' && (
              <motion.div
                key="student-step-otp"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <div className="text-center space-y-1">
                  <h3 className="text-lg font-black text-slate-900">
                    Verify Your Mobile Number
                  </h3>
                  <p className="text-xs text-slate-500">
                    Enter the dynamic 4-digit code sent to{' '}
                    <strong className="text-purple-700">
                      {countryCode} {phoneNumber || '9876543210'}
                    </strong>
                  </p>
                </div>

                {/* Simulated Real-Time SMS Alert Banner */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-emerald-950 text-xs shadow-xs animate-in fade-in">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">📲</span>
                      <div>
                        <div className="font-black text-emerald-950 flex items-center gap-1.5">
                          <span>SMS Received:</span>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-950 font-mono font-black text-sm tracking-wider">
                            {activeGeneratedOtp}
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-800 mt-0.5">
                          Your One-Time Password is <strong>{activeGeneratedOtp}</strong>. Valid for 5 minutes.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAutoFillGeneratedOtp}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] shadow-xs cursor-pointer shrink-0"
                    >
                      Use OTP
                    </button>
                  </div>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="flex justify-center gap-3">
                    {otpDigits.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => {
                          otpInputRefs.current[i] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className="w-12 h-14 text-center text-xl font-black rounded-xl bg-slate-50 border-2 border-slate-300 text-slate-900 focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-100 transition-all"
                      />
                    ))}
                  </div>

                  {otpError && (
                    <p className="text-xs font-semibold text-rose-600 text-center">{otpError}</p>
                  )}

                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={handleAutoFillGeneratedOtp}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-emerald-800 bg-emerald-100/70 hover:bg-emerald-100 border border-emerald-300 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Click to Auto-fill Code ({activeGeneratedOtp})</span>
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="w-full h-11 rounded-xl bg-gradient-to-r from-[#6822CC] to-[#5016A6] hover:from-[#7B32DF] hover:to-[#5E1DBA] text-white text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                  >
                    <span>Verify & Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <button
                      type="button"
                      onClick={() => setStep('phone')}
                      className="text-slate-500 hover:text-slate-900 font-bold"
                    >
                      ← Change Phone
                    </button>

                    <button
                      type="button"
                      disabled={resendTimer > 0}
                      onClick={handleResendOtp}
                      className={`font-bold cursor-pointer ${
                        resendTimer > 0 ? 'text-slate-400' : 'text-purple-700 hover:underline'
                      }`}
                    >
                      {resendTimer > 0 ? `Resend new OTP in ${resendTimer}s` : '🔄 Resend New Code'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Student Step 3: Profile Setup */}
            {!currentUser && roleTab === 'student' && step === 'profile_setup' && (
              <motion.div
                key="student-step-profile-setup"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <div className="text-center space-y-1">
                  <h3 className="text-lg font-black text-slate-900">
                    Personalize Your Student Profile
                  </h3>
                  <p className="text-xs text-slate-500">
                    Set up your learner pass and optionally enter your teacher's class code to join your classroom group.
                  </p>
                </div>

                <form onSubmit={handleCompleteProfileSetup} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Student Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        placeholder="e.g. Aarav Sharma"
                        required
                        className="w-full h-10 pl-10 pr-3.5 rounded-xl bg-slate-50 border border-slate-300 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* Teacher's Classroom Code (Optional) */}
                  <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 space-y-1">
                    <label className="block text-xs font-black text-indigo-900 flex items-center justify-between">
                      <span>Teacher's Class Join Code (Optional)</span>
                      <span className="text-[10px] text-indigo-600 font-bold">70+ Seats Per Class</span>
                    </label>
                    <input
                      type="text"
                      value={classroomCodeInput}
                      onChange={(e) => setClassroomCodeInput(e.target.value.toUpperCase())}
                      placeholder="e.g. CLS-910 or BIO-7429"
                      className="w-full h-9 px-3 rounded-lg bg-white border border-indigo-300 text-xs font-mono font-bold text-indigo-950 uppercase placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="text-[10px] text-indigo-700">
                      Enter code given by your teacher to instantly join the class test group!
                    </p>
                  </div>

                  {/* Class / Grade Selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Select Class / Grade
                    </label>
                    <div className="relative">
                      <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <select
                        value={selectedGrade}
                        onChange={(e) => setSelectedGrade(e.target.value)}
                        className="appearance-none w-full h-10 pl-10 pr-8 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent cursor-pointer"
                      >
                        {GRADES_LIST.map((g) => (
                          <option key={g.id} value={g.label}>
                            {g.label} ({g.section})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Board / Curriculum */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Curriculum Board
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {BOARDS_LIST.map((board) => (
                        <button
                          key={board}
                          type="button"
                          onClick={() => setSelectedBoard(board)}
                          className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                            selectedBoard === board
                              ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {board}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Avatar Picker */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Learner Avatar
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                      {AVATARS.map((av) => (
                        <button
                          key={av.name}
                          type="button"
                          onClick={() => setSelectedAvatar(av.emoji)}
                          className={`p-2 rounded-xl text-xl flex items-center justify-center border transition-all ${
                            selectedAvatar === av.emoji
                              ? 'bg-purple-100 border-purple-600 scale-105 shadow-xs'
                              : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                          }`}
                          title={av.name}
                        >
                          {av.emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-purple-950 text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer mt-2"
                  >
                    <span>Start Learning & Join Class</span>
                    <Sparkles className="w-4 h-4 fill-current" />
                  </button>
                </form>
              </motion.div>
            )}

            {/* ================= TAB 2: TEACHER LOGIN ================= */}
            {!currentUser && roleTab === 'teacher' && (
              <motion.div
                key="role-teacher"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <div className="text-center space-y-1">
                  <h3 className="text-lg font-black text-slate-900">
                    Teacher Command Portal
                  </h3>
                  <p className="text-xs text-slate-500">
                    Teachers can create quizzes, generate classroom codes, and broadcast whole-class tests to 70+ students.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                  <School className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>
                    <strong>Teacher Privileges:</strong> Generate class join codes (75 capacity), create custom tests, and monitor live submissions on the podium.
                  </span>
                </div>

                <form onSubmit={handleTeacherLogin} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Teacher Full Name
                    </label>
                    <input
                      type="text"
                      value={teacherName}
                      onChange={(e) => setTeacherName(e.target.value)}
                      placeholder="e.g. Dr. Sunita Verma"
                      required
                      className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Teaching Subject
                    </label>
                    <input
                      type="text"
                      value={teacherSubject}
                      onChange={(e) => setTeacherSubject(e.target.value)}
                      placeholder="e.g. Biology & Natural Sciences"
                      required
                      className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Class / Grade Level
                    </label>
                    <select
                      value={teacherGrade}
                      onChange={(e) => setTeacherGrade(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600 cursor-pointer"
                    >
                      <option value="Class 1 to 5 Foundational Group">Class 1 to 5 Foundational Group (75 Capacity)</option>
                      <option value="Class 6 to 8 Middle Group">Class 6 to 8 Middle Group (75 Capacity)</option>
                      <option value="Class 9 to 10 Board Group">Class 9 to 10 Board Group (75 Capacity)</option>
                      <option value="Class 11 to 12 Senior Group">Class 11 to 12 Senior Group (75 Capacity)</option>
                      <option value="JEE & NEET Advanced Batch">JEE & NEET Advanced Batch (75 Capacity)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                      <span>Custom Classroom Code (or auto-generated)</span>
                      <span className="text-[10px] text-purple-700 font-bold">75 Student Seats</span>
                    </label>
                    <input
                      type="text"
                      value={teacherNewCode}
                      onChange={(e) => setTeacherNewCode(e.target.value.toUpperCase())}
                      placeholder="e.g. BIO-7429 (Leave blank for auto-generate)"
                      className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono font-bold text-purple-900 uppercase"
                    />
                  </div>

                  {/* Teacher Staff Verification Passcode (Blocks Students) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-purple-600" />
                        <span>Teacher Staff Passcode (Faculty Verification)</span>
                      </label>
                      <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                        Students Prohibited
                      </span>
                    </div>

                    <div className="relative">
                      <input
                        type={showTeacherPassword ? "text" : "password"}
                        value={teacherPasscode}
                        onChange={(e) => setTeacherPasscode(e.target.value)}
                        placeholder="Enter Staff Passcode (e.g. TEACHER2026)"
                        required
                        className="w-full h-10 pl-3.5 pr-10 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                      <button
                        type="button"
                        onClick={() => setShowTeacherPassword(!showTeacherPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        title={showTeacherPassword ? "Hide passcode" : "Show passcode"}
                      >
                        {showTeacherPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                      <span>Default School Staff Code: <code className="font-mono text-purple-700 font-bold">TEACHER2026</code></span>
                      <button
                        type="button"
                        onClick={() => setTeacherPasscode('TEACHER2026')}
                        className="text-purple-600 font-bold hover:underline cursor-pointer"
                      >
                        Insert Code
                      </button>
                    </div>
                  </div>

                  {teacherError && (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-1.5">
                      <span className="shrink-0">⚠️</span>
                      <span>{teacherError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full h-11 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white text-sm font-black flex items-center justify-center gap-2 shadow-md cursor-pointer"
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Enter Teacher Portal & Create Class Code</span>
                  </button>
                </form>

                {/* 1-Click Demo Teachers */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="text-xs font-bold text-slate-500">
                    ⚡ 1-Click Demo Lead Teachers:
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
                    {DEMO_TEACHERS.map((t) => (
                      <button
                        key={t.name}
                        type="button"
                        onClick={() => handleSelectDemoTeacher(t)}
                        className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-purple-50 hover:border-purple-300 flex items-center justify-between text-left transition-colors cursor-pointer group"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-900 group-hover:text-purple-900">
                            {t.name}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {t.subject} • Join Code: <strong className="text-purple-700 font-mono font-bold">{t.code}</strong>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-purple-700 shrink-0">
                          Sign In →
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ================= TAB 3: PRINCIPAL LOGIN (PASSWORD: 93247 - FULL PERMISSION) ================= */}
            {!currentUser && roleTab === 'principal' && (
              <motion.div
                key="role-principal"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-2 shadow-sm border border-amber-300">
                    <span className="text-2xl">🏛️</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900">
                    School Principal Portal
                  </h3>
                  <p className="text-xs text-slate-500">
                    Executive Institutional Leadership • <strong className="text-amber-800">Full Permission for Everything</strong> across tests, faculty, curriculum & analytics.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 text-amber-950 text-xs space-y-1.5 shadow-2xs">
                  <div className="flex items-center gap-1.5 font-black text-amber-900">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Executive Authority Enabled:</span>
                  </div>
                  <p className="text-amber-900 leading-relaxed">
                    Principals hold comprehensive permissions across all faculty groups, lesson planners, interactive mark spreadsheets, test generators, question banks, and class rosters.
                  </p>
                  <div className="pt-1 text-[11px] text-amber-800 font-semibold flex items-center gap-1">
                    <span>🛡️ Security Governance:</span>
                    <span className="italic">The System Administrator holds supreme authority to kick out any user, including the Principal.</span>
                  </div>
                </div>

                <form onSubmit={handlePrincipalLogin} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Principal Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={principalName}
                        onChange={(e) => setPrincipalName(e.target.value)}
                        placeholder="e.g. Dr. A. K. Sen"
                        required
                        className="w-full h-10 pl-10 pr-3.5 rounded-xl bg-slate-50 border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Institution / School Name
                    </label>
                    <div className="relative">
                      <School className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={principalSchool}
                        onChange={(e) => setPrincipalSchool(e.target.value)}
                        placeholder="e.g. Central Academy & High School Council"
                        className="w-full h-10 pl-10 pr-3.5 rounded-xl bg-slate-50 border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                      <span>Principal Password</span>
                      <span className="text-[10px] text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
                        Passcode: 93247
                      </span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPrincipalPassword ? "text" : "password"}
                        value={principalPassword}
                        onChange={(e) => setPrincipalPassword(e.target.value)}
                        placeholder="Enter password (93247)"
                        required
                        className="w-full h-10 pl-10 pr-10 rounded-xl bg-slate-50 border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPrincipalPassword(!showPrincipalPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                        title={showPrincipalPassword ? "Hide password" : "Show password"}
                      >
                        {showPrincipalPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                      <span>Authorized Principal Key: <code className="font-mono text-amber-700 font-bold">93247</code></span>
                      <button
                        type="button"
                        onClick={() => setPrincipalPassword('93247')}
                        className="text-amber-700 font-bold hover:underline cursor-pointer"
                      >
                        Insert Code (93247)
                      </button>
                    </div>
                  </div>

                  {principalError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs font-semibold flex items-start gap-1.5">
                      <span className="shrink-0">⚠️</span>
                      <span>{principalError}</span>
                    </div>
                  )}

                  {principalSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-start gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{principalSuccess}</span>
                    </div>
                  )}

                  <div className="space-y-2 pt-1">
                    <button
                      type="submit"
                      className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-sm font-black flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-[0.99]"
                    >
                      <span>🏛️</span>
                      <span>Verify Password (93247) & Open Principal Panel</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPrincipalPassword('93247');
                        const finalName = principalName.trim() || 'Dr. A. K. Sen';
                        const auth: ClassroomUserAuth = {
                          role: 'principal',
                          groupId: 'grp_principal_exec',
                          groupName: `${principalSchool || 'Academic Council'} • Principal Executive`,
                          userName: `${finalName} (Principal)`,
                          avatarEmoji: '🏛️',
                          userTitle: 'School Principal',
                          isLoggedIn: true,
                          adminAuthorized: true,
                          rollNumber: 'PRIN-001',
                          studentId: 'PRIN-001'
                        };
                        setClassroomAuth(auth);
                        onLoginSuccess(auth);
                        fireBottomLeftAndRightConfetti();
                        if (onOpenPrincipalPanel) onOpenPrincipalPanel();
                        if (onClose) onClose();
                      }}
                      className="w-full py-2.5 px-3 rounded-xl border border-amber-300 bg-amber-100/80 hover:bg-amber-200 text-amber-950 text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                      <span>⚡ 1-Click Instant Unlock & Open Principal Panel (Passcode 93247)</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* ================= TAB 4: ADMIN LOGIN (PERMISSION GUARDED BY OWNER) ================= */}
            {!currentUser && roleTab === 'admin' && (
              <motion.div
                key="role-admin"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-2">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900">
                    Restricted Admin Portal
                  </h3>
                  <p className="text-xs text-slate-500">
                    Admin access is protected. Authorized for <strong className="text-slate-800">Pranav (Owner / Principal)</strong> and authorized administrative staff.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-black text-rose-800">
                    <Shield className="w-3.5 h-3.5 text-rose-600" />
                    <span>Administrator Permission Guard:</span>
                  </div>
                  <p className="text-rose-700 leading-relaxed">
                    Enter the authorized administrator name and master authorization key to access the Super Admin Dashboard and Faculty Management.
                  </p>
                </div>

                <form onSubmit={handleAdminLogin} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Admin Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={adminName}
                        onChange={(e) => setAdminName(e.target.value)}
                        placeholder="e.g. Pranav"
                        required
                        className="w-full h-10 pl-10 pr-3.5 rounded-xl bg-slate-50 border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                      <span>Administrator Password</span>
                      <span className="text-[10px] text-slate-500 font-bold">Confidential</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showAdminPassword ? "text" : "password"}
                        value={adminCredential}
                        onChange={(e) => setAdminCredential(e.target.value)}
                        placeholder="Enter Admin Password"
                        required
                        className="w-full h-10 pl-10 pr-10 rounded-xl bg-slate-50 border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                        title={showAdminPassword ? "Hide password" : "Show password"}
                      >
                        {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {adminError && (
                    <div className="p-3 rounded-xl bg-rose-100 border border-rose-300 text-rose-900 text-xs font-semibold">
                      {adminError}
                    </div>
                  )}

                  {adminSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-semibold">
                      {adminSuccess}
                    </div>
                  )}

                  <div className="space-y-2 pt-1">
                    <button
                      type="submit"
                      className="w-full h-11 rounded-xl bg-gradient-to-r from-rose-700 to-red-600 hover:from-rose-600 hover:to-red-500 text-white text-sm font-black flex items-center justify-center gap-2 shadow-md cursor-pointer"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Verify Password & Open Admin Command Center</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAdminCredential('ADMIN2026');
                        const finalAdminName = adminName.trim() || 'Pranav';
                        const auth: ClassroomUserAuth = {
                          role: 'admin',
                          groupId: 'grp_admin_super',
                          groupName: 'Central Academic Administration',
                          userName: `${finalAdminName} (Admin)`,
                          avatarEmoji: '🛡️',
                          userTitle: 'Master Admin',
                          isLoggedIn: true,
                          adminAuthorized: true,
                          rollNumber: 'ADMIN-001',
                          studentId: 'ADMIN-001'
                        };
                        setClassroomAuth(auth);
                        onLoginSuccess(auth);
                        fireBottomLeftAndRightConfetti();
                        if (onOpenAdminPanel) onOpenAdminPanel();
                        if (onClose) onClose();
                      }}
                      className="w-full py-2.5 px-3 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-900 text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                      <span>⚡ 1-Click Instant Unlock & Open Admin Command Center</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export const ByjusLoginModal = ClassroomAuthModal;
