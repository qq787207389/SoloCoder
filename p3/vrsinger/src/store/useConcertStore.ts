import { create } from 'zustand';

type ViewMode = 'front' | 'side' | 'top' | 'free';

interface CharacterState {
  position: [number, number, number];
  rotation: [number, number, number];
  animation: 'idle' | 'walk' | 'dance' | 'wave' | 'sing';
}

interface LightState {
  color: string;
  intensity: number;
  type: 'spot' | 'point' | 'directional';
}

interface ScreenContent {
  type: 'image' | 'video' | 'text' | 'animation';
  src?: string;
  text?: string;
  effect?: string;
}

interface ParticleConfig {
  color: string;
  count: number;
  speed: number;
  type: 'glowstick' | 'sparkle' | 'confetti';
}

interface Avatar {
  id: string;
  name: string;
  position: [number, number, number];
  imageUrl?: string;
  preset: string;
}

interface Danmaku {
  id: string;
  text: string;
  color: string;
  userId: string;
  userName: string;
  timestamp: number;
}

interface ConcertState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  bpm: number;
  beat: number;
  viewMode: ViewMode;
  isDanmakuEnabled: boolean;
  isAvatarEnabled: boolean;
  volume: number;
  characterState: CharacterState;
  lightStates: Record<string, LightState>;
  screenContent: ScreenContent;
  particleConfig: ParticleConfig;
  avatars: Avatar[];
  danmakuList: Danmaku[];
}

interface ConcertStore extends ConcertState {
  setPlaying: (isPlaying: boolean) => void;
  setCurrentTime: (time: number) => void;
  setBeat: (beat: number) => void;
  setViewMode: (mode: ViewMode) => void;
  toggleDanmaku: () => void;
  toggleAvatar: () => void;
  setVolume: (volume: number) => void;
  setCharacterState: (state: Partial<CharacterState>) => void;
  setLightState: (id: string, state: Partial<LightState>) => void;
  setScreenContent: (content: ScreenContent) => void;
  setParticleConfig: (config: Partial<ParticleConfig>) => void;
  addAvatar: (avatar: Avatar) => void;
  removeAvatar: (id: string) => void;
  addDanmaku: (danmaku: Omit<Danmaku, 'id' | 'timestamp'>) => void;
  reset: () => void;
}

const initialCharacterState: CharacterState = {
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  animation: 'idle',
};

const initialLightStates: Record<string, LightState> = {
  main: { color: '#ffffff', intensity: 1, type: 'spot' },
  left: { color: '#4488ff', intensity: 0.8, type: 'spot' },
  right: { color: '#ff4488', intensity: 0.8, type: 'spot' },
  ambient: { color: '#333366', intensity: 0.3, type: 'directional' },
};

const initialScreenContent: ScreenContent = {
  type: 'text',
  text: 'VR SINGER',
  effect: 'glow',
};

const initialParticleConfig: ParticleConfig = {
  color: '#00ffff',
  count: 200,
  speed: 1,
  type: 'glowstick',
};

const initialAvatars: Avatar[] = [
  { id: '1', name: '观众A', position: [-8, 0, 10], preset: 'cool' },
  { id: '2', name: '观众B', position: [8, 0, 10], preset: 'cute' },
  { id: '3', name: '观众C', position: [-5, 0, 15], preset: 'rock' },
  { id: '4', name: '观众D', position: [5, 0, 15], preset: 'sweet' },
];

export const useConcertStore = create<ConcertStore>((set) => ({
  isPlaying: false,
  currentTime: 0,
  duration: 180,
  bpm: 120,
  beat: 0,
  viewMode: 'front',
  isDanmakuEnabled: true,
  isAvatarEnabled: true,
  volume: 0.7,
  characterState: initialCharacterState,
  lightStates: initialLightStates,
  screenContent: initialScreenContent,
  particleConfig: initialParticleConfig,
  avatars: initialAvatars,
  danmakuList: [],

  setPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setBeat: (beat) => set({ beat }),
  setViewMode: (viewMode) => set({ viewMode }),
  toggleDanmaku: () => set((state) => ({ isDanmakuEnabled: !state.isDanmakuEnabled })),
  toggleAvatar: () => set((state) => ({ isAvatarEnabled: !state.isAvatarEnabled })),
  setVolume: (volume) => set({ volume }),
  setCharacterState: (state) =>
    set((prev) => ({
      characterState: { ...prev.characterState, ...state },
    })),
  setLightState: (id, state) =>
    set((prev) => ({
      lightStates: {
        ...prev.lightStates,
        [id]: { ...prev.lightStates[id], ...state },
      },
    })),
  setScreenContent: (screenContent) => set({ screenContent }),
  setParticleConfig: (config) =>
    set((prev) => ({
      particleConfig: { ...prev.particleConfig, ...config },
    })),
  addAvatar: (avatar) =>
    set((state) => ({
      avatars: [...state.avatars, avatar],
    })),
  removeAvatar: (id) =>
    set((state) => ({
      avatars: state.avatars.filter((a) => a.id !== id),
    })),
  addDanmaku: (danmaku) =>
    set((state) => ({
      danmakuList: [
        ...state.danmakuList.slice(-50),
        {
          ...danmaku,
          id: Date.now().toString(),
          timestamp: Date.now(),
        },
      ],
    })),
  reset: () =>
    set({
      isPlaying: false,
      currentTime: 0,
      beat: 0,
      characterState: initialCharacterState,
      lightStates: initialLightStates,
      screenContent: initialScreenContent,
      particleConfig: initialParticleConfig,
      danmakuList: [],
    }),
}));
