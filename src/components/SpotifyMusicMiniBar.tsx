import React from 'react';
import {
  Play,
  Pause,
  SkipForward,
  Repeat,
  Repeat1,
  Music,
  ExternalLink,
  Disc3,
  Maximize2
} from 'lucide-react';
import { SpotifyTrack, MusicLoopMode, BackgroundTheme } from '../types';

interface SpotifyMusicMiniBarProps {
  currentTrack?: SpotifyTrack;
  isPlaying: boolean;
  loopMode: MusicLoopMode;
  playlistLength: number;
  onTogglePlay: () => void;
  onNextTrack: () => void;
  onOpenModal: () => void;
  theme?: BackgroundTheme;
}

export const SpotifyMusicMiniBar: React.FC<SpotifyMusicMiniBarProps> = ({
  currentTrack,
  isPlaying,
  loopMode,
  playlistLength,
  onTogglePlay,
  onNextTrack,
  onOpenModal,
  theme = 'modern-grid'
}) => {
  if (!currentTrack) return null;

  const isMidnight = theme === 'midnight';

  return (
    <div
      id="music-corner-minibar"
      className="fixed bottom-4 right-4 z-40 max-w-sm sm:max-w-md w-[calc(100%-2rem)] sm:w-auto animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div
        className={`p-2.5 sm:p-3 rounded-2xl border shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 transition-all ${
          isMidnight
            ? 'bg-slate-900/95 border-emerald-900/40 text-slate-100 shadow-emerald-950/40'
            : 'bg-slate-950/90 border-emerald-500/30 text-white shadow-xl'
        }`}
      >
        {/* Track Info & Visualizer */}
        <div
          onClick={onOpenModal}
          className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer group"
          title="Click to open Music Corner"
        >
          <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-slate-800 shrink-0 flex items-center justify-center border border-emerald-500/40 shadow-xs">
            {currentTrack.coverUrl ? (
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <Disc3 className={`w-5 h-5 text-emerald-400 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
            )}
            {isPlaying && (
              <div className="absolute inset-0 bg-emerald-950/50 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-white group-hover:text-emerald-300 transition-colors truncate">
                {currentTrack.title}
              </span>
              <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 shrink-0">
                {loopMode === 'single' ? '🔂 Loop 1' : loopMode === 'all' ? `🔁 Loop All (${playlistLength})` : 'Loop'}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              {currentTrack.artist}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onTogglePlay}
            className="w-8 h-8 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 flex items-center justify-center shadow-md shadow-emerald-500/20 transition-transform active:scale-95 cursor-pointer"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>

          {playlistLength > 1 && (
            <button
              onClick={onNextTrack}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Next Track"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onOpenModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Expand Full Music Corner"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
