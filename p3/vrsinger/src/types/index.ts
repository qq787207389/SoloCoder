export type TimelineEventType = 'character' | 'light' | 'screen' | 'particle' | 'camera';

export interface TimelineEvent {
  time: number;
  type: TimelineEventType;
  data: Record<string, unknown>;
}

export type AnimationType = 'idle' | 'walk' | 'dance' | 'wave' | 'sing';

export interface CharacterState {
  position: [number, number, number];
  rotation: [number, number, number];
  animation: AnimationType;
}

export type LightType = 'spot' | 'point' | 'directional';

export interface LightState {
  color: string;
  intensity: number;
  type: LightType;
}

export type ScreenContentType = 'image' | 'video' | 'text' | 'animation';

export interface ScreenContent {
  type: ScreenContentType;
  src?: string;
  text?: string;
  effect?: string;
}

export type ParticleType = 'glowstick' | 'sparkle' | 'confetti';

export interface ParticleConfig {
  color: string;
  count: number;
  speed: number;
  type: ParticleType;
}

export interface CameraView {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

export interface ConcertTimeline {
  duration: number;
  bpm: number;
  audioUrl: string;
  events: TimelineEvent[];
}

export interface Avatar {
  id: string;
  name: string;
  position: [number, number, number];
  imageUrl?: string;
  preset: string;
}

export interface Danmaku {
  id: string;
  text: string;
  color: string;
  userId: string;
  userName: string;
  timestamp: number;
}

export type ViewMode = 'front' | 'side' | 'top' | 'free';

export interface ConcertState {
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
