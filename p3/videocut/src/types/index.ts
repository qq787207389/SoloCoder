export interface VideoTrackInfo {
  codec: string;
  width: number;
  height: number;
  duration: number;
  frameRate: number;
}

export interface AudioTrackInfo {
  codec: string;
  sampleRate: number;
  numberOfChannels: number;
  duration: number;
}

export interface MediaAsset {
  id: string;
  name: string;
  file: File;
  url: string;
  duration: number;
  width: number;
  height: number;
  thumbnailUrl: string;
  thumbnailData: ImageData | null;
  waveformData: number[];
  videoTrack: VideoTrackInfo | null;
  audioTrack: AudioTrackInfo | null;
  audioBuffer: AudioBuffer | null;
}

export interface Clip {
  id: string;
  assetId: string;
  trackId: string;
  startTime: number;
  duration: number;
  sourceStart: number;
  sourceEnd: number;
  volume: number;
}

export interface Track {
  id: string;
  type: 'video' | 'audio';
  name: string;
  muted: boolean;
  locked: boolean;
  height: number;
}

export interface TextOverlay {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  textAlign: 'left' | 'center' | 'right';
}

export interface EditorState {
  assets: MediaAsset[];
  tracks: Track[];
  clips: Clip[];
  textOverlays: TextOverlay[];
  currentTime: number;
  isPlaying: boolean;
  zoom: number;
  selectedClipId: string | null;
  selectedTextId: string | null;
  duration: number;
}

export interface FrameCacheEntry {
  timestamp: number;
  frame: VideoFrame;
  lastUsed: number;
}

export type DecodeMessage =
  | { type: 'init'; file: File }
  | { type: 'decode'; timestamp: number }
  | { type: 'seek'; timestamp: number }
  | { type: 'close' };

export type DecodeResponse =
  | { type: 'frame'; frame: VideoFrame; timestamp: number }
  | { type: 'ready'; duration: number; width: number; height: number }
  | { type: 'error'; message: string };

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
};

export const timeToPixels = (time: number, zoom: number): number => {
  return time * zoom * 10;
};

export const pixelsToTime = (pixels: number, zoom: number): number => {
  return pixels / (zoom * 10);
};
