import React, { useState, useEffect } from 'react';
import {
  Music,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Plus,
  Trash2,
  Sparkles,
  ExternalLink,
  X,
  ListMusic,
  Search,
  Check,
  Disc3,
  Minimize2
} from 'lucide-react';
import { SpotifyTrack, MusicLoopMode } from '../types';
import {
  PRESET_STUDY_SONGS,
  parseSongInput,
  resolveSongsFromApi,
  studyAudio
} from '../utils/spotifyMusic';

const POPULAR_STUDY_HITS = [
  { label: 'Believer', artist: 'Imagine Dragons', query: 'Imagine Dragons Believer' },
  { label: 'Shape of You', artist: 'Ed Sheeran', query: 'Ed Sheeran Shape of You' },
  { label: 'Cruel Summer', artist: 'Taylor Swift', query: 'Taylor Swift Cruel Summer' },
  { label: 'Blinding Lights', artist: 'The Weeknd', query: 'The Weeknd Blinding Lights' },
  { label: 'Kesariya', artist: 'Arijit Singh', query: 'Arijit Singh Kesariya' },
  { label: 'Viva La Vida', artist: 'Coldplay', query: 'Coldplay Viva La Vida' },
  { label: 'Lofi Chill Beats', artist: 'Chillhop', query: 'Lofi Study Beats' },
  { label: 'Moonlight Sonata', artist: 'Beethoven', query: 'Moonlight Sonata' }
];

interface SpotifyMusicPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlist: SpotifyTrack[];
  currentTrackIndex: number;
  isPlaying: boolean;
  loopMode: MusicLoopMode;
  onSetPlaylist: (tracks: SpotifyTrack[]) => void;
  onSetCurrentIndex: (index: number) => void;
  onSetIsPlaying: (playing: boolean) => void;
  onSetLoopMode: (mode: MusicLoopMode) => void;
}

export const SpotifyMusicPlayerModal: React.FC<SpotifyMusicPlayerModalProps> = ({
  isOpen,
  onClose,
  playlist,
  currentTrackIndex,
  isPlaying,
  loopMode,
  onSetPlaylist,
  onSetCurrentIndex,
  onSetIsPlaying,
  onSetLoopMode
}) => {
  const [songInput, setSongInput] = useState<string>('');
  const [isResolving, setIsResolving] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackTime, setPlaybackTime] = useState<number>(0);
  const [playbackDuration, setPlaybackDuration] = useState<number>(180);

  const currentTrack: SpotifyTrack | undefined = playlist[currentTrackIndex] || playlist[0];

  useEffect(() => {
    studyAudio.setVolume(isMuted ? 0 : volume);
  }, [volume, isMuted]);

  // Subscribe to live audio time updates to guarantee and display song completion
  useEffect(() => {
    if (studyAudio.getCurrentTime() > 0) {
      setPlaybackTime(studyAudio.getCurrentTime());
    }
    if (studyAudio.getDuration() > 0) {
      setPlaybackDuration(studyAudio.getDuration());
    } else if (currentTrack?.durationSeconds) {
      setPlaybackDuration(currentTrack.durationSeconds);
    }

    studyAudio.setTimeUpdateListener((currentTime, duration) => {
      setPlaybackTime(currentTime);
      if (duration && duration > 0) {
        setPlaybackDuration(duration);
      }
    });
    return () => {
      studyAudio.setTimeUpdateListener(undefined);
    };
  }, [currentTrack?.id]);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleAddAndPlaySongs = async (e?: React.FormEvent, playNow: boolean = true) => {
    if (e) e.preventDefault();
    const rawQueries = parseSongInput(songInput);
    if (rawQueries.length === 0) return;

    setIsResolving(true);
    try {
      const resolved = await resolveSongsFromApi(rawQueries);
      if (resolved.length > 0) {
        // APPEND to existing playlist so previous songs are NOT deleted!
        const updatedPlaylist = [...playlist, ...resolved];
        onSetPlaylist(updatedPlaylist);

        // If total songs > 1, default loop mode to loop all in playlist! If 1 total song, loop single.
        const newLoopMode: MusicLoopMode = updatedPlaylist.length > 1 ? 'all' : 'single';
        onSetLoopMode(newLoopMode);

        if (playNow) {
          // Jump to newly added song and start playing in loop
          const newIdx = playlist.length; // index of first added song
          onSetCurrentIndex(newIdx);
          onSetIsPlaying(true);
        }
        setSongInput('');
      }
    } catch (err) {
      console.error('Failed to add songs:', err);
    } finally {
      setIsResolving(false);
    }
  };

  const handleAddPreset = (track: SpotifyTrack) => {
    const existingIdx = playlist.findIndex((t) => t.id === track.id);
    if (existingIdx >= 0) {
      onSetCurrentIndex(existingIdx);
      onSetIsPlaying(true);
    } else {
      // Append preset to playlist so existing tracks remain!
      const updated = [...playlist, track];
      onSetPlaylist(updated);
      onSetCurrentIndex(updated.length - 1);
      onSetIsPlaying(true);
      if (updated.length > 1 && loopMode === 'single') {
        onSetLoopMode('all');
      }
    }
  };

  const handleTogglePlay = () => {
    if (playlist.length === 0 && PRESET_STUDY_SONGS.length > 0) {
      onSetPlaylist([PRESET_STUDY_SONGS[0]]);
      onSetCurrentIndex(0);
      onSetLoopMode('single');
      onSetIsPlaying(true);
      return;
    }
    onSetIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (playlist.length === 0) return;
    const nextIdx = (currentTrackIndex + 1) % playlist.length;
    onSetCurrentIndex(nextIdx);
    onSetIsPlaying(true);
  };

  const handlePrev = () => {
    if (playlist.length === 0) return;
    const prevIdx = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    onSetCurrentIndex(prevIdx);
    onSetIsPlaying(true);
  };

  const handleRemoveTrack = (index: number) => {
    const updated = playlist.filter((_, i) => i !== index);
    onSetPlaylist(updated);
    if (index === currentTrackIndex) {
      onSetCurrentIndex(Math.max(0, index - 1));
      if (updated.length === 0) {
        onSetIsPlaying(false);
        studyAudio.stop();
      }
    } else if (index < currentTrackIndex) {
      onSetCurrentIndex(currentTrackIndex - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="spotify-music-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-3 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-xl font-black shrink-0">
              <Disc3 className={`w-6 h-6 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-1.5">
                  <span>Music Corner</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                    Full Song Player & Looper 🎵
                  </span>
                </h2>
              </div>
              <p className="text-xs text-slate-400">
                Play complete study tracks without stopping. Loop 1 song continuously or loop your entire study playlist!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Minimize to floating music bar"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Song Input & Add Form */}
          <div className="bg-slate-800/80 rounded-2xl border border-slate-700/80 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5" />
                <span>Search & Play ANY Song You Want</span>
              </label>
              <span className="text-[11px] text-slate-400">
                Plays the actual master recording from the artist
              </span>
            </div>

            {/* Quick-play Popular Song Chips */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                <span>⚡ Instant One-Click Song Picks:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_STUDY_HITS.map((hit) => (
                  <button
                    key={hit.label}
                    type="button"
                    disabled={isResolving}
                    onClick={async () => {
                      setSongInput(hit.query);
                      setIsResolving(true);
                      try {
                        const resolved = await resolveSongsFromApi([hit.query]);
                        if (resolved.length > 0) {
                          const updated = [...playlist, ...resolved];
                          onSetPlaylist(updated);
                          onSetCurrentIndex(playlist.length);
                          onSetIsPlaying(true);
                          setSongInput('');
                        }
                      } finally {
                        setIsResolving(false);
                      }
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-900/90 text-slate-300 hover:text-white hover:bg-emerald-600/30 border border-slate-700 hover:border-emerald-500/50 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <span>▶</span>
                    <span>{hit.label}</span>
                    <span className="text-[10px] text-slate-500">({hit.artist})</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleAddAndPlaySongs} className="space-y-2.5 pt-1">
              <textarea
                value={songInput}
                onChange={(e) => setSongInput(e.target.value)}
                placeholder="Type ANY song title or artist you want (e.g. Believer, Shape of You, Taylor Swift, Arijit Singh, Coldplay, Anime OST...)"
                rows={2}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
              />

              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="font-semibold text-emerald-300">Playback Rule:</span>
                  <span>1 song = Loops actual song 🔂 | Multiple songs = Plays entire playlist 🔁</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => handleAddAndPlaySongs(e, false)}
                    disabled={isResolving || !songInput.trim()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all cursor-pointer disabled:opacity-40"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Add to Queue</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isResolving || !songInput.trim()}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-md shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isResolving ? (
                      <>
                        <Disc3 className="w-3.5 h-3.5 animate-spin" />
                        <span>Finding Actual Song...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Play Actual Song</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Current Music Corner Card */}
          {currentTrack ? (
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 p-4 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Album Cover / Disc */}
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-slate-950 border border-slate-700 shrink-0 shadow-md flex items-center justify-center">
                  {currentTrack.coverUrl ? (
                    <img
                      src={currentTrack.coverUrl}
                      alt={currentTrack.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Music className="w-8 h-8 text-emerald-400" />
                  )}
                  {isPlaying && (
                    <div className="absolute inset-0 bg-emerald-950/40 flex items-center justify-center">
                      <div className="flex items-end gap-1 h-6">
                        <span className="w-1 bg-emerald-400 rounded-full animate-bounce" style={{ height: '70%', animationDelay: '0ms' }} />
                        <span className="w-1 bg-emerald-400 rounded-full animate-bounce" style={{ height: '100%', animationDelay: '150ms' }} />
                        <span className="w-1 bg-emerald-400 rounded-full animate-bounce" style={{ height: '50%', animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Track Details */}
                <div className="min-w-0 flex-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Now Playing
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      Track {currentTrackIndex + 1} of {playlist.length}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-300 ml-auto hidden sm:inline-flex items-center gap-1 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/40">
                      🎧 Actual Master Audio • Complete & Looped
                    </span>
                  </div>

                  <h3 className="text-base font-black text-white truncate">
                    {currentTrack.title}
                  </h3>
                  <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                    <p className="text-xs text-slate-400 truncate">
                      {currentTrack.artist} {currentTrack.album ? `• ${currentTrack.album}` : ''}
                    </p>
                    <a
                      href={currentTrack.spotifyUrl || `https://open.spotify.com/search/${encodeURIComponent(currentTrack.title + " " + currentTrack.artist)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 hover:underline"
                      title="Open in Spotify Web Player"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Spotify</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Live Track Completion Scrubber & Timer */}
              <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-700/60">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="text-emerald-400 font-bold">{formatTime(playbackTime)}</span>
                  <span className="text-[10px] uppercase font-sans tracking-wide text-slate-400 flex items-center gap-1 font-semibold">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    Full Song Playback Progress
                  </span>
                  <span className="text-slate-300">{formatTime(playbackDuration)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={playbackDuration || 100}
                  value={playbackTime}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setPlaybackTime(val);
                    studyAudio.seek(val);
                  }}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
              </div>

              {/* Real Spotify Embed Frame */}
              <div className="rounded-xl overflow-hidden border border-slate-700/60 bg-black/40">
                <iframe
                  title="Spotify Embed"
                  src={currentTrack.spotifyEmbedUrl}
                  width="100%"
                  height="152"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  className="rounded-xl"
                />
              </div>

              {/* Player Controls Bar */}
              <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-700/70 flex-wrap">
                {/* Loop Mode Indicator & Switcher */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      const nextMode: MusicLoopMode = loopMode === 'single' ? 'all' : loopMode === 'all' ? 'off' : 'single';
                      onSetLoopMode(nextMode);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      loopMode === 'single'
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow-xs'
                        : loopMode === 'all'
                        ? 'bg-indigo-600 text-white border-indigo-500 font-black shadow-xs'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                    title="Click to toggle loop mode (Loop 1 Song, Loop All Songs, or Loop Off)"
                  >
                    {loopMode === 'single' ? (
                      <>
                        <Repeat1 className="w-3.5 h-3.5" />
                        <span>🔂 Looping 1 Song</span>
                      </>
                    ) : loopMode === 'all' ? (
                      <>
                        <Repeat className="w-3.5 h-3.5" />
                        <span>🔁 Looping All ({playlist.length})</span>
                      </>
                    ) : (
                      <>
                        <Repeat className="w-3.5 h-3.5 opacity-40" />
                        <span>Loop Off</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Main Playback Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrev}
                    disabled={playlist.length <= 1}
                    className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700 transition-colors disabled:opacity-30 cursor-pointer"
                    title="Previous track"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleTogglePlay}
                    className="w-10 h-10 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/25 transition-transform active:scale-95 cursor-pointer"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                  </button>

                  <button
                    onClick={handleNext}
                    disabled={playlist.length <= 1}
                    className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700 transition-colors disabled:opacity-30 cursor-pointer"
                    title="Next track"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>

                {/* Volume slider */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="text-slate-400 hover:text-white"
                  >
                    {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      setVolume(parseFloat(e.target.value));
                      setIsMuted(false);
                    }}
                    className="w-16 sm:w-20 accent-emerald-400 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 space-y-2 bg-slate-800/40 rounded-2xl border border-slate-700/60 p-6">
              <Music className="w-10 h-10 mx-auto text-emerald-400 opacity-60" />
              <p className="text-sm font-bold text-slate-200">No songs currently in queue</p>
              <p className="text-xs">Type a song above or choose one of the study focus presets below to begin listening!</p>
            </div>
          )}

          {/* Quick Study Focus Presets */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Instant Focus Presets</span>
              </span>
              <span className="text-[10px] text-slate-500">Click to play & loop</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRESET_STUDY_SONGS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleAddPreset(preset)}
                  className="p-2.5 rounded-xl border border-slate-700 bg-slate-800/70 hover:bg-slate-700/70 hover:border-emerald-500/50 text-left transition-all flex items-center gap-2.5 cursor-pointer group"
                >
                  <span className="text-lg shrink-0">🎵</span>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-300 truncate">
                      {preset.title}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {preset.artist}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Playlist Queue */}
          {playlist.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ListMusic className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                    Current Queue ({playlist.length} song{playlist.length > 1 ? 's' : ''})
                  </span>
                </div>
                <span className="text-[11px] text-emerald-400 font-bold">
                  {loopMode === 'single' ? '🔂 Repeating 1 Song' : loopMode === 'all' ? '🔁 Looping Entire Queue' : '➡️ Play Once'}
                </span>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {playlist.map((track, idx) => {
                  const isCurrent = idx === currentTrackIndex;
                  return (
                    <div
                      key={`${track.id}_${idx}`}
                      onClick={() => {
                        onSetCurrentIndex(idx);
                        onSetIsPlaying(true);
                      }}
                      className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                        isCurrent
                          ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200'
                          : 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`w-5 text-center text-xs font-bold ${isCurrent ? 'text-emerald-400' : 'text-slate-500'}`}>
                          {isCurrent && isPlaying ? '▶' : `${idx + 1}`}
                        </span>
                        <div className="min-w-0">
                          <div className={`text-xs font-bold truncate ${isCurrent ? 'text-white' : 'text-slate-200'}`}>
                            {track.title}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {track.artist}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isCurrent && (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Active
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveTrack(idx);
                          }}
                          className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Remove from queue"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
