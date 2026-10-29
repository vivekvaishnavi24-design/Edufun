import { SpotifyTrack, MusicLoopMode } from '../types';

export const PRESET_STUDY_SONGS: SpotifyTrack[] = [
  {
    id: 'spot_moonlight',
    title: 'Moonlight Sonata (Adagio sostenuto - Complete)',
    artist: 'Ludwig van Beethoven',
    album: 'Classical Masterpieces for Deep Focus',
    coverUrl: 'https://images.unsplash.com/photo-1520523839898-507121c2725e?w=300&auto=format&fit=crop&q=80',
    spotifyUrl: 'https://open.spotify.com/track/2JzZzZUQj3Qff7wapcbK04',
    spotifyEmbedUrl: 'https://open.spotify.com/embed/track/2JzZzZUQj3Qff7wapcbK04?utm_source=generator&theme=0',
    previewAudioUrl: '/audio/moonlight.mp3',
    durationSeconds: 359
  },
  {
    id: 'spot_clair_de_lune',
    title: 'Clair de Lune (Complete Movement)',
    artist: 'Claude Debussy',
    album: 'Suite Bergamasque',
    coverUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&auto=format&fit=crop&q=80',
    spotifyUrl: 'https://open.spotify.com/track/6N7gEj5HGv1eIJS3W9PqMv',
    spotifyEmbedUrl: 'https://open.spotify.com/embed/track/6N7gEj5HGv1eIJS3W9PqMv?utm_source=generator&theme=0',
    previewAudioUrl: '/audio/clair_de_lune.mp3',
    durationSeconds: 304
  },
  {
    id: 'spot_lofi_beats',
    title: 'Lofi Study Beats (Complete Focus Session)',
    artist: 'Music Corner Chill Lounge',
    album: 'Deep Concentration & Memory Retention',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&auto=format&fit=crop&q=80',
    spotifyUrl: 'https://open.spotify.com/track/0bvUGW8tYp1W797uP0t1u8',
    spotifyEmbedUrl: 'https://open.spotify.com/embed/track/0bvUGW8tYp1W797uP0t1u8?utm_source=generator&theme=0',
    previewAudioUrl: '/audio/lofi_beats.mp3',
    durationSeconds: 180
  },
  {
    id: 'spot_canon_in_d',
    title: 'Canon in D Major (Complete Orchestral)',
    artist: 'Johann Pachelbel',
    album: 'Timeless Classical Study Sanctuary',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80',
    spotifyUrl: 'https://open.spotify.com/track/0pqPJz9vYnQ0g8T8G1P6Q2',
    spotifyEmbedUrl: 'https://open.spotify.com/embed/track/2JzZzZUQj3Qff7wapcbK04?utm_source=generator&theme=0',
    previewAudioUrl: '/audio/canon_in_d.mp3',
    durationSeconds: 240
  },
  {
    id: 'spot_ambient_focus',
    title: 'Ambient Deep Focus & Relaxation (Complete)',
    artist: 'Music Corner Soundscapes',
    album: 'Stress Relief & Cognitive Flow',
    coverUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&auto=format&fit=crop&q=80',
    spotifyUrl: 'https://open.spotify.com/track/6kkwzB6hMBiaipPEAVnRbR',
    spotifyEmbedUrl: 'https://open.spotify.com/embed/track/6kkwzB6hMBiaipPEAVnRbR?utm_source=generator&theme=0',
    previewAudioUrl: '/audio/ambient_focus.mp3',
    durationSeconds: 210
  }
];

export function parseSongInput(raw: string): string[] {
  if (!raw) return [];
  return raw
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export async function resolveSongsFromApi(queries: string[]): Promise<SpotifyTrack[]> {
  if (queries.length === 0) return [];
  try {
    const res = await fetch('/api/music/resolve-songs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ songs: queries })
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.tracks) && data.tracks.length > 0) {
        return data.tracks.map((t: SpotifyTrack, idx: number) => {
          // Guarantee that every track has a complete, working local audio URL
          const fallbackAudio = PRESET_STUDY_SONGS[idx % PRESET_STUDY_SONGS.length];
          return {
            ...t,
            previewAudioUrl: t.previewAudioUrl && !t.previewAudioUrl.includes('wikimedia.org')
              ? t.previewAudioUrl
              : fallbackAudio.previewAudioUrl,
            durationSeconds: t.durationSeconds || fallbackAudio.durationSeconds || 240
          };
        });
      }
    }
  } catch (e) {
    console.error('Failed to resolve songs from backend, generating local fallback', e);
  }

  // Client-side fallback with complete study audio fallback
  return queries.map((q, idx) => {
    const matchingPreset = PRESET_STUDY_SONGS[idx % PRESET_STUDY_SONGS.length];
    return {
      id: `local_track_${idx}_${Date.now()}`,
      title: q,
      artist: 'Music Corner Study Track',
      album: 'Concentration Session',
      coverUrl: matchingPreset.coverUrl,
      previewAudioUrl: matchingPreset.previewAudioUrl,
      spotifyUrl: `https://open.spotify.com/search/${encodeURIComponent(q)}`,
      spotifyEmbedUrl: matchingPreset.spotifyEmbedUrl,
      durationSeconds: matchingPreset.durationSeconds || 240
    };
  });
}

// Robust Audio Engine with HTML5 audio playback and Web Audio harmonic ambient synthesizer fallback
class StudyAudioEngine {
  private audioCtx: AudioContext | null = null;
  private htmlAudio: HTMLAudioElement | null = null;
  private currentVolume: number = 0.8;
  private synthInterval: number | null = null;
  private isSynthesizing = false;
  private masterGain: GainNode | null = null;
  private currentLoop: boolean = false;
  private currentTrackId: string | null = null;
  private onEndedCallback?: () => void;
  private onTimeUpdateCallback?: (currentTime: number, duration: number) => void;

  public setTimeUpdateListener(cb?: (currentTime: number, duration: number) => void) {
    this.onTimeUpdateCallback = cb;
  }

  public playTrack(track: SpotifyTrack, loop: boolean, onEnded?: () => void) {
    this.currentLoop = loop;
    this.onEndedCallback = onEnded;

    // If the same track is already active in htmlAudio, update loop/callback and ensure playing without restarting
    if (this.currentTrackId === track.id && this.htmlAudio && this.htmlAudio.src) {
      this.htmlAudio.volume = this.currentVolume;
      if (this.htmlAudio.paused) {
        this.htmlAudio.play().catch(() => {});
      }
      return;
    }

    this.stopSynth();
    this.currentTrackId = track.id;

    if (track.previewAudioUrl) {
      if (!this.htmlAudio) {
        this.htmlAudio = new Audio();
      }
      this.htmlAudio.src = track.previewAudioUrl;
      this.htmlAudio.volume = this.currentVolume;
      this.htmlAudio.loop = false; // Explicitly handled in onended to guarantee full song completion

      this.htmlAudio.ontimeupdate = () => {
        if (this.htmlAudio && this.onTimeUpdateCallback) {
          this.onTimeUpdateCallback(
            this.htmlAudio.currentTime || 0,
            this.htmlAudio.duration || track.durationSeconds || 0
          );
        }
      };

      // When the song ends, cleanly complete it and either loop the song or proceed to next
      this.htmlAudio.onended = () => {
        if (this.currentLoop) {
          // Song completed! Seamlessly replay from start
          if (this.htmlAudio) {
            this.htmlAudio.currentTime = 0;
            this.htmlAudio.play().catch(() => {});
          }
        } else if (this.onEndedCallback) {
          this.onEndedCallback();
        }
      };

      this.htmlAudio.onerror = () => {
        console.warn('Audio URL failed or was blocked, switching to ambient study harmonic synthesizer.');
        this.startAmbientSynth(loop, onEnded);
      };

      this.htmlAudio.play().catch(() => {
        // Fallback to ambient study chords
        this.startAmbientSynth(loop, onEnded);
      });
    } else {
      // No preview URL: start calming harmonic study chords so the user ALWAYS hears music!
      this.startAmbientSynth(loop, onEnded);
    }
  }

  public setLoop(loop: boolean) {
    this.currentLoop = loop;
  }

  public getCurrentTime(): number {
    return this.htmlAudio?.currentTime || 0;
  }

  public getDuration(): number {
    return this.htmlAudio?.duration || 0;
  }

  public isCurrentlyPlaying(): boolean {
    return !!(this.htmlAudio && !this.htmlAudio.paused && !this.htmlAudio.ended);
  }

  public seek(seconds: number) {
    if (this.htmlAudio && !isNaN(seconds)) {
      this.htmlAudio.currentTime = Math.max(0, Math.min(seconds, this.htmlAudio.duration || seconds));
    }
  }

  public pause() {
    if (this.htmlAudio) {
      this.htmlAudio.pause();
    }
    this.stopSynth();
  }

  public resume() {
    if (this.htmlAudio && this.htmlAudio.src && !this.htmlAudio.ended) {
      this.htmlAudio.play().catch(() => {
        this.startAmbientSynth(true);
      });
    } else if (this.isSynthesizing) {
      this.startAmbientSynth(true);
    }
  }

  public stop() {
    this.currentTrackId = null;
    if (this.htmlAudio) {
      this.htmlAudio.pause();
      this.htmlAudio.currentTime = 0;
    }
    this.stopSynth();
  }

  public setVolume(val: number) {
    this.currentVolume = Math.max(0, Math.min(1, val));
    if (this.htmlAudio) {
      this.htmlAudio.volume = this.currentVolume;
    }
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(this.currentVolume * 0.15, this.audioCtx.currentTime);
    }
  }

  // Generative soothing lofi ambient chords (Cmaj7 -> Am7 -> Fmaj7 -> Gsus4)
  private startAmbientSynth(loop: boolean, onEnded?: () => void) {
    try {
      if (!this.audioCtx) {
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtxClass) return;
        this.audioCtx = new AudioCtxClass();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      this.stopSynth();
      this.isSynthesizing = true;

      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(this.currentVolume * 0.15, this.audioCtx.currentTime);
      this.masterGain.connect(this.audioCtx.destination);

      const chords = [
        [261.63, 329.63, 392.00, 493.88], // Cmaj7
        [220.00, 261.63, 329.63, 392.00], // Am7
        [174.61, 220.00, 261.63, 329.63], // Fmaj7
        [196.00, 261.63, 293.66, 392.00]  // Gsus4
      ];

      let chordIdx = 0;
      const playNextChord = () => {
        if (!this.isSynthesizing || !this.audioCtx || !this.masterGain) return;
        const freqs = chords[chordIdx % chords.length];
        chordIdx++;

        freqs.forEach((freq) => {
          if (!this.audioCtx || !this.masterGain) return;
          const osc = this.audioCtx.createOscillator();
          const noteGain = this.audioCtx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

          // Gentle bell envelope
          const now = this.audioCtx.currentTime;
          noteGain.gain.setValueAtTime(0, now);
          noteGain.gain.linearRampToValueAtTime(0.04, now + 0.3);
          noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);

          osc.connect(noteGain);
          noteGain.connect(this.masterGain);

          osc.start(now);
          osc.stop(now + 4.0);
        });
      };

      playNextChord();
      this.synthInterval = window.setInterval(playNextChord, 4000);
    } catch (err) {
      console.warn('Synth playback failed:', err);
    }
  }

  private stopSynth() {
    this.isSynthesizing = false;
    if (this.synthInterval !== null) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
    if (this.masterGain && this.audioCtx) {
      try {
        this.masterGain.disconnect();
      } catch {}
      this.masterGain = null;
    }
  }
}

export const studyAudio = new StudyAudioEngine();
