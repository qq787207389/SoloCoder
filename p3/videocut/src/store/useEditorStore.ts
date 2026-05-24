import { create } from 'zustand';
import { MediaAsset, Clip, Track, TextOverlay, EditorState, generateId } from '../types';

interface EditorActions {
  addAsset: (asset: Omit<MediaAsset, 'id'>) => void;
  removeAsset: (id: string) => void;
  addTrack: (type: 'video' | 'audio') => void;
  removeTrack: (id: string) => void;
  addClip: (clip: Omit<Clip, 'id'>) => void;
  removeClip: (id: string) => void;
  updateClip: (id: string, updates: Partial<Clip>) => void;
  selectClip: (id: string | null) => void;
  addTextOverlay: (overlay: Omit<TextOverlay, 'id'>) => void;
  removeTextOverlay: (id: string) => void;
  updateTextOverlay: (id: string, updates: Partial<TextOverlay>) => void;
  selectText: (id: string | null) => void;
  setCurrentTime: (time: number) => void;
  setPlaying: (playing: boolean) => void;
  setZoom: (zoom: number) => void;
  updateDuration: () => void;
  loadProject: (state: Omit<EditorState, 'isPlaying' | 'currentTime'>) => void;
  clearProject: () => void;
}

const createInitialTracks = (): Track[] => [
  { id: generateId(), type: 'video', name: 'Video 1', muted: false, locked: false, height: 60 },
  { id: generateId(), type: 'video', name: 'Video 2', muted: false, locked: false, height: 60 },
  { id: generateId(), type: 'audio', name: 'Audio 1', muted: false, locked: false, height: 40 },
];

export const useEditorStore = create<EditorState & EditorActions>((set, get) => ({
  assets: [],
  tracks: createInitialTracks(),
  clips: [],
  textOverlays: [],
  currentTime: 0,
  isPlaying: false,
  zoom: 1,
  selectedClipId: null,
  selectedTextId: null,
  duration: 60,

  addAsset: (asset) =>
    set((state) => ({
      assets: [...state.assets, { ...asset, id: generateId() }],
    })),

  removeAsset: (id) =>
    set((state) => ({
      assets: state.assets.filter((a) => a.id !== id),
      clips: state.clips.filter((c) => c.assetId !== id),
    })),

  addTrack: (type) => {
    const count = get().tracks.filter((t) => t.type === type).length + 1;
    set((state) => ({
      tracks: [
        ...state.tracks,
        {
          id: generateId(),
          type,
          name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${count}`,
          muted: false,
          locked: false,
          height: type === 'video' ? 60 : 40,
        },
      ],
    }));
  },

  removeTrack: (id) =>
    set((state) => ({
      tracks: state.tracks.filter((t) => t.id !== id),
      clips: state.clips.filter((c) => c.trackId !== id),
    })),

  addClip: (clip) =>
    set((state) => ({
      clips: [...state.clips, { ...clip, id: generateId() }],
    })),

  removeClip: (id) =>
    set((state) => ({
      clips: state.clips.filter((c) => c.id !== id),
      selectedClipId: state.selectedClipId === id ? null : state.selectedClipId,
    })),

  updateClip: (id, updates) =>
    set((state) => ({
      clips: state.clips.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    })),

  selectClip: (id) => set({ selectedClipId: id, selectedTextId: null }),

  addTextOverlay: (overlay) =>
    set((state) => ({
      textOverlays: [...state.textOverlays, { ...overlay, id: generateId() }],
    })),

  removeTextOverlay: (id) =>
    set((state) => ({
      textOverlays: state.textOverlays.filter((t) => t.id !== id),
      selectedTextId: state.selectedTextId === id ? null : state.selectedTextId,
    })),

  updateTextOverlay: (id, updates) =>
    set((state) => ({
      textOverlays: state.textOverlays.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),

  selectText: (id) => set({ selectedTextId: id, selectedClipId: null }),

  setCurrentTime: (time) => set({ currentTime: Math.max(0, time) }),

  setPlaying: (playing) => set({ isPlaying: playing }),

  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(10, zoom)) }),

  updateDuration: () => {
    const { clips, textOverlays } = get();
    const maxClipEnd = clips.length > 0
      ? Math.max(...clips.map((c) => c.startTime + c.duration))
      : 0;
    const maxTextEnd = textOverlays.length > 0
      ? Math.max(...textOverlays.map((t) => t.endTime))
      : 0;
    set({ duration: Math.max(60, maxClipEnd, maxTextEnd) });
  },

  loadProject: (state) =>
    set({
      ...state,
      isPlaying: false,
      currentTime: 0,
    }),

  clearProject: () =>
    set({
      assets: [],
      clips: [],
      textOverlays: [],
      currentTime: 0,
      isPlaying: false,
      selectedClipId: null,
      selectedTextId: null,
      duration: 60,
    }),
}));
