import React, { useRef } from 'react';
import {
  BookOpenCheck,
  Library,
  RotateCcw,
  FileDown,
  Gamepad2,
  Laugh,
  Smartphone,
  Wifi,
  WifiOff,
  School,
  Sparkles,
  Users,
  ChevronLeft,
  ChevronRight,
  Music,
  Disc3,
  LogOut
} from 'lucide-react';
import { BackgroundTheme, ClassroomUserAuth, DeviceType } from '../types';
import { UserAvatar } from './UserAvatar';

interface PhoneActionBarSliderProps {
  onOpenNotes?: () => void;
  onOpenJuniorSchool?: () => void;
  onOpenSubjects?: () => void;
  onOpenClassroomGroup?: () => void;
  onOpenGroupRoster?: () => void;
  onOpenLoginModal?: () => void;
  onResetQuiz?: () => void;
  onOpenPrint?: () => void;
  onOpenGames?: () => void;
  onOpenJokes?: () => void;
  onOpenDeviceSelector?: () => void;
  isOffline: boolean;
  onToggleOffline: () => void;
  currentUser: ClassroomUserAuth | null;
  theme?: BackgroundTheme;
  onOpenMusic?: () => void;
  isMusicPlaying?: boolean;
  onLogout?: () => void;
  onOpenImagineCreativity?: () => void;
}

export const PhoneActionBarSlider: React.FC<PhoneActionBarSliderProps> = ({
  onOpenNotes,
  onOpenJuniorSchool,
  onOpenSubjects,
  onOpenClassroomGroup,
  onOpenGroupRoster,
  onOpenLoginModal,
  onResetQuiz,
  onOpenPrint,
  onOpenGames,
  onOpenJokes,
  onOpenDeviceSelector,
  isOffline,
  onToggleOffline,
  currentUser,
  theme = 'modern-grid',
  onOpenMusic,
  isMusicPlaying = false,
  onLogout,
  onOpenImagineCreativity
}) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const isMidnight = theme === 'midnight';

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  return (
    <div
      id="phone-action-slider-container"
      className={`rounded-2xl border p-2.5 backdrop-blur-xs shadow-xs transition-all relative ${
        isMidnight
          ? 'bg-slate-900/95 border-slate-800 text-slate-100'
          : 'bg-white/95 border-indigo-100 text-slate-900'
      }`}
    >
      <div className="flex items-center justify-between px-1 mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
            📱 Phone Action Slider
          </span>
          <span className="text-[10px] text-slate-400 font-medium">Swipe for options</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={scrollLeft}
            className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 flex items-center justify-center"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={scrollRight}
            className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 flex items-center justify-center"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Horizontal Swipeable Track */}
      <div
        ref={sliderRef}
        className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none snap-x snap-mandatory"
      >
        {/* Imagine Ur Creativity Animated Explainer */}
        {onOpenImagineCreativity && (
          <button
            onClick={onOpenImagineCreativity}
            className="snap-start inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black border transition-all shrink-0 cursor-pointer shadow-md bg-gradient-to-r from-amber-500 to-indigo-600 text-white border-amber-300/60"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-200 fill-current animate-pulse" />
            <span>✨ Imagine Creativity</span>
          </button>
        )}

        {/* 1. Music Corner */}
        {onOpenMusic && (
          <button
            onClick={onOpenMusic}
            className={`snap-start inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all shrink-0 cursor-pointer shadow-2xs ${
              isMusicPlaying
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow-emerald-500/25 ring-2 ring-emerald-400/40'
                : 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <Disc3 className={`w-3.5 h-3.5 ${isMusicPlaying ? 'animate-spin text-slate-950' : 'text-emerald-600'}`} style={{ animationDuration: '3s' }} />
            <span>{isMusicPlaying ? '🎵 Playing Song' : '🎵 Music Corner'}</span>
          </button>
        )}

        {/* 2. Offline Mode Toggle */}
        <button
          onClick={onToggleOffline}
          className={`snap-start inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all shrink-0 cursor-pointer ${
            isOffline
              ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
          }`}
        >
          {isOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
          <span>{isOffline ? '⚡ Offline: ON' : '🟢 Online Mode'}</span>
        </button>

        {/* 3. Classroom Groups Button */}
        {(onOpenGroupRoster || onOpenClassroomGroup) && (
          <button
            onClick={onOpenGroupRoster || onOpenClassroomGroup}
            className="snap-start inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black shrink-0 cursor-pointer shadow-2xs border bg-indigo-50 text-indigo-900 border-indigo-200 hover:bg-indigo-100"
          >
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            <span>👥 Class Groups</span>
            <span className="text-[10px] px-1 rounded bg-indigo-200 text-indigo-950 font-bold">
              70+
            </span>
          </button>
        )}

        {/* 4. Student / Teacher Login Profile */}
        {(onOpenLoginModal || onOpenClassroomGroup) && (
          <button
            onClick={onOpenLoginModal || onOpenClassroomGroup}
            className={`snap-start inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold shrink-0 cursor-pointer shadow-2xs border ${
              currentUser
                ? 'bg-purple-900 text-white border-purple-700'
                : 'bg-amber-400 text-purple-950 border-amber-500 font-black'
            }`}
          >
            {currentUser ? (
              <span className="text-sm">{currentUser.avatarEmoji || '🧑‍🎓'}</span>
            ) : (
              <span className="text-sm">⚡</span>
            )}
            <span>
              {currentUser
                ? `${currentUser.userName} (${currentUser.role.toUpperCase()})`
                : 'Portal Login'}
            </span>
          </button>
        )}

        {/* 4. Log Out button if signed in */}
        {currentUser && onLogout && (
          <button
            onClick={onLogout}
            className="snap-start inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 shrink-0 cursor-pointer shadow-2xs"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-600" />
            <span>Log Out</span>
          </button>
        )}

        {/* 3. Study Notes */}
        {onOpenNotes && (
          <button
            onClick={onOpenNotes}
            className="snap-start inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 shrink-0 cursor-pointer shadow-2xs"
          >
            <BookOpenCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>Study Notes</span>
          </button>
        )}

        {/* 5. All Topics (100+) */}
        {onOpenSubjects && (
          <button
            onClick={onOpenSubjects}
            className="snap-start inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100 shrink-0 cursor-pointer shadow-2xs"
          >
            <Library className="w-3.5 h-3.5 text-indigo-600" />
            <span>All Topics (100+)</span>
          </button>
        )}

        {/* 6. Chapter Games */}
        {onOpenGames && (
          <button
            onClick={onOpenGames}
            className="snap-start inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 shrink-0 cursor-pointer shadow-2xs"
          >
            <Gamepad2 className="w-3.5 h-3.5 text-purple-600" />
            <span>Boss Games</span>
          </button>
        )}

        {/* 7. Study Jokes */}
        {onOpenJokes && (
          <button
            onClick={onOpenJokes}
            className="snap-start inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-pink-50 text-pink-800 border border-pink-200 hover:bg-pink-100 shrink-0 cursor-pointer shadow-2xs"
          >
            <Laugh className="w-3.5 h-3.5 text-pink-600" />
            <span>Study Joke</span>
          </button>
        )}

        {/* 8. Print / Save Test */}
        {onOpenPrint && (
          <button
            onClick={onOpenPrint}
            className="snap-start inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200 shrink-0 cursor-pointer shadow-2xs"
          >
            <FileDown className="w-3.5 h-3.5 text-slate-600" />
            <span>Print Test</span>
          </button>
        )}

        {/* 9. Restart Quiz */}
        {onResetQuiz && (
          <button
            onClick={onResetQuiz}
            className="snap-start inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200 shrink-0 cursor-pointer shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
            <span>Restart</span>
          </button>
        )}

        {/* 10. Switch Device Mode */}
        {onOpenDeviceSelector && (
          <button
            onClick={onOpenDeviceSelector}
            className="snap-start inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 shrink-0 cursor-pointer shadow-2xs"
          >
            <Smartphone className="w-3.5 h-3.5 text-blue-600" />
            <span>Device: Phone</span>
          </button>
        )}
      </div>
    </div>
  );
};
