import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Song, PlayMode, VisualizerType } from '../types';

interface PlayerStore {
  currentSong: Song | null;
  playlist: Song[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playMode: PlayMode;
  visualizerType: VisualizerType;
  isMuted: boolean;
  audioContext: AudioContext | null;
  analyser: AnalyserNode | null;
  setCurrentSong: (song: Song | null) => void;
  setPlaylist: (songs: Song[]) => void;
  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  setPlayMode: (mode: PlayMode) => void;
  setVisualizerType: (type: VisualizerType) => void;
  setIsMuted: (muted: boolean) => void;
  setAudioContext: (ctx: AudioContext | null) => void;
  setAnalyser: (analyser: AnalyserNode | null) => void;
  playNext: () => void;
  playPrev: () => void;
}

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      currentSong: null,
      playlist: [],
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 0.7,
      playMode: 'sequence',
      visualizerType: 'bar',
      isMuted: false,
      audioContext: null,
      analyser: null,
      setCurrentSong: (song) => set({ currentSong: song }),
      setPlaylist: (songs) => set({ playlist: songs }),
      setIsPlaying: (playing) => set({ isPlaying: playing }),
      setCurrentTime: (time) => set({ currentTime: time }),
      setDuration: (duration) => set({ duration }),
      setVolume: (volume) => set({ volume }),
      setPlayMode: (mode) => set({ playMode: mode }),
      setVisualizerType: (type) => set({ visualizerType: type }),
      setIsMuted: (muted) => set({ isMuted: muted }),
      setAudioContext: (ctx) => set({ audioContext: ctx }),
      setAnalyser: (analyser) => set({ analyser }),
      playNext: () => {
        const { currentSong, playlist, playMode } = get();
        if (!currentSong || playlist.length === 0) return;

        const currentIndex = playlist.findIndex((s) => s.id === currentSong.id);
        
        if (playMode === 'shuffle') {
          const randomIndex = Math.floor(Math.random() * playlist.length);
          set({ currentSong: playlist[randomIndex] });
        } else if (playMode === 'loop') {
          set({ currentSong: playlist[currentIndex] });
        } else {
          const nextIndex = (currentIndex + 1) % playlist.length;
          set({ currentSong: playlist[nextIndex] });
        }
      },
      playPrev: () => {
        const { currentSong, playlist, playMode } = get();
        if (!currentSong || playlist.length === 0) return;

        const currentIndex = playlist.findIndex((s) => s.id === currentSong.id);
        
        if (playMode === 'shuffle') {
          const randomIndex = Math.floor(Math.random() * playlist.length);
          set({ currentSong: playlist[randomIndex] });
        } else if (playMode === 'loop') {
          set({ currentSong: playlist[currentIndex] });
        } else {
          const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
          set({ currentSong: playlist[prevIndex] });
        }
      },
    }),
    {
      name: 'player-storage',
      partialize: (state) => ({
        volume: state.volume,
        playMode: state.playMode,
        visualizerType: state.visualizerType,
        isMuted: state.isMuted,
      }),
    }
  )
);
