export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  cover: string;
  audio: string;
  mood: string[];
  duration: number;
}

export interface Playlist {
  id: string;
  name: string;
  cover: string;
  songs: string[];
  createdAt: string;
}

export type PlayMode = 'sequence' | 'loop' | 'shuffle';

export type VisualizerType = 'bar' | 'wave';

export interface PlayerState {
  currentSong: Song | null;
  playlist: Song[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playMode: PlayMode;
  visualizerType: VisualizerType;
  isMuted: boolean;
}

export interface AppState {
  theme: 'light' | 'dark';
  favorites: string[];
  recentPlays: Song[];
  playlists: Playlist[];
  searchQuery: string;
  selectedMood: string | null;
}
