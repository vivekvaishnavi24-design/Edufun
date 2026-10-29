import React from 'react';

interface UserAvatarProps {
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  role?: 'teacher' | 'student' | 'admin' | 'principal';
  className?: string;
}

const COLOR_PALETTES = [
  'bg-gradient-to-br from-indigo-500 to-indigo-700 text-white',
  'bg-gradient-to-br from-blue-500 to-cyan-600 text-white',
  'bg-gradient-to-br from-emerald-500 to-teal-700 text-white',
  'bg-gradient-to-br from-amber-500 to-orange-600 text-white',
  'bg-gradient-to-br from-rose-500 to-pink-600 text-white',
  'bg-gradient-to-br from-purple-500 to-violet-700 text-white',
  'bg-gradient-to-br from-fuchsia-500 to-purple-600 text-white',
  'bg-gradient-to-br from-sky-500 to-blue-600 text-white',
];

export function getInitial(name?: string): string {
  if (!name || !name.trim()) return '?';
  const clean = name.trim();
  return clean.charAt(0).toUpperCase();
}

export function getAvatarColor(name?: string): string {
  if (!name || !name.trim()) return COLOR_PALETTES[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLOR_PALETTES.length;
  return COLOR_PALETTES[index];
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name = '',
  size = 'md',
  role,
  className = ''
}) => {
  const initial = getInitial(name);
  const colorClass = getAvatarColor(name);

  const sizeClasses = {
    xs: 'w-6 h-6 text-xs font-black rounded-lg',
    sm: 'w-8 h-8 text-sm font-black rounded-xl',
    md: 'w-10 h-10 text-base font-black rounded-2xl shadow-xs',
    lg: 'w-12 h-12 text-lg font-black rounded-2xl shadow-md',
    xl: 'w-16 h-16 text-2xl font-black rounded-3xl shadow-lg',
  };

  return (
    <div className="relative inline-flex items-center justify-center shrink-0">
      <div
        className={`${sizeClasses[size]} ${colorClass} flex items-center justify-center select-none uppercase tracking-wide border border-white/20 ${className}`}
      >
        <span>{initial}</span>
      </div>
      {role === 'principal' && size !== 'xs' && (
        <span
          className="absolute -bottom-1 -right-1 text-[10px] bg-purple-700 text-amber-300 font-black rounded-full px-1 py-0.2 border border-white shadow-xs"
          title="School Principal"
        >
          P
        </span>
      )}
      {role === 'teacher' && size !== 'xs' && (
        <span
          className="absolute -bottom-1 -right-1 text-[10px] bg-amber-400 text-amber-950 font-black rounded-full px-1 py-0.2 border border-white shadow-xs"
          title="Teacher"
        >
          T
        </span>
      )}
      {role === 'admin' && size !== 'xs' && (
        <span
          className="absolute -bottom-1 -right-1 text-[10px] bg-indigo-600 text-white font-black rounded-full px-1 py-0.2 border border-white shadow-xs"
          title="Master Admin"
        >
          A
        </span>
      )}
    </div>
  );
};
