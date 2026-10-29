import React, { useState, useRef, useEffect } from "react";
import { Palette, Sparkles, Moon, Grid3X3, BookOpen, Check } from "lucide-react";
import { BackgroundTheme } from "../types";

interface ThemePickerProps {
  currentTheme: BackgroundTheme;
  onSelectTheme: (theme: BackgroundTheme) => void;
}

const THEMES: Array<{
  id: BackgroundTheme;
  name: string;
  subtitle: string;
  icon: React.ElementType;
  previewClass: string;
}> = [
  {
    id: "modern-grid",
    name: "Studio Grid",
    subtitle: "Clean blueprint dots & soft focal glow",
    icon: Grid3X3,
    previewClass: "bg-indigo-50 border-indigo-200 text-indigo-700"
  },
  {
    id: "aurora",
    name: "Aurora Glow",
    subtitle: "Pastel atmospheric light blooms",
    icon: Sparkles,
    previewClass: "bg-emerald-50 border-emerald-200 text-emerald-700"
  },
  {
    id: "midnight",
    name: "Midnight Focus",
    subtitle: "Deep starry night slate for late study",
    icon: Moon,
    previewClass: "bg-slate-900 border-slate-700 text-indigo-300"
  },
  {
    id: "warm-notebook",
    name: "Warm Campus",
    subtitle: "Cozy parchment paper & amber warmth",
    icon: BookOpen,
    previewClass: "bg-amber-50 border-amber-200 text-amber-800"
  }
];

export const ThemePicker: React.FC<ThemePickerProps> = ({
  currentTheme,
  onSelectTheme
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeThemeObj = THEMES.find((t) => t.id === currentTheme) || THEMES[0];
  const ActiveIcon = activeThemeObj.icon;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        id="theme-picker-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200/90 bg-white/85 hover:bg-white text-slate-700 hover:text-slate-900 shadow-2xs backdrop-blur-sm transition-all"
        title="Change background ambiance style"
        aria-label="Change background ambiance"
      >
        <Palette className="w-3.5 h-3.5 text-indigo-600" />
        <span className="hidden lg:inline">{activeThemeObj.name}</span>
        <span className="lg:hidden">Theme</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/90 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2.5 py-1.5 border-b border-slate-100 flex items-center justify-between">
            <span className="text-2xs uppercase tracking-wider font-extrabold text-slate-500">
              Background Ambiance
            </span>
            <span className="text-2xs text-slate-500 font-medium">Click to apply</span>
          </div>

          <div className="space-y-1 mt-1.5">
            {THEMES.map((theme) => {
              const Icon = theme.icon;
              const isSelected = theme.id === currentTheme;
              return (
                <button
                  key={theme.id}
                  onClick={() => {
                    onSelectTheme(theme.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all ${
                    isSelected
                      ? "bg-indigo-50/80 border border-indigo-200/80 shadow-2xs"
                      : "hover:bg-slate-100/80 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${theme.previewClass}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {theme.name}
                      </div>
                      <div className="text-2xs text-slate-500 truncate">
                        {theme.subtitle}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-indigo-600 shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
