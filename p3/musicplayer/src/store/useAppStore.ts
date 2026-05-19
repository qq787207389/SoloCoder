import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Song, Playlist } from '../types';

interface AppStore {
  theme: 'light' | 'dark';
  favorites: string[];
  recentPlays: Song[];
  playlists: Playlist[];
  searchQuery: string;
  selectedMood: string | null;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleFavorite: (songId: string) => void;
  addToRecentPlays: (song: Song) => void;
  clearRecentPlays: () => void;
  createPlaylist: (name: string, cover: string) => void;
  deletePlaylist: (id: string) => void;
  addSongToPlaylist: (playlistId: string, songId: string) => void;
  removeSongFromPlaylist: (playlistId: string, songId: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedMood: (mood: string | null) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      theme: 'light',
      favorites: [],
      recentPlays: [],
      playlists: [],
      searchQuery: '',
      selectedMood: null,
      setTheme: (theme) => set({ theme }),
      toggleFavorite: (songId) => {
        const { favorites } = get();
        if (favorites.includes(songId)) {
          set({ favorites: favorites.filter((id) => id !== songId) });
        } else {
          set({ favorites: [...favorites, songId] });
        }
      },
      addToRecentPlays: (song) => {
        const { recentPlays } = get();
        const filtered = recentPlays.filter((s) => s.id !== song.id);
        const newRecentPlays = [song, ...filtered].slice(0, 30);
        set({ recentPlays: newRecentPlays });
      },
      clearRecentPlays: () => set({ recentPlays: [] }),
      createPlaylist: (name, cover) => {
        const newPlaylist: Playlist = {
          id: Date.now().toString(),
          name,
          cover,
          songs: [],
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ playlists: [...state.playlists, newPlaylist] }));
      },
      deletePlaylist: (id) => {
        set((state) => ({
          playlists: state.playlists.filter((p) => p.id !== id),
        }));
      },
      addSongToPlaylist: (playlistId, songId) => {
        set((state) => ({
          playlists: state.playlists.map((p) =>
            p.id === playlistId && !p.songs.includes(songId)
              ? { ...p, songs: [...p.songs, songId] }
              : p
          ),
        }));
      },
      removeSongFromPlaylist: (playlistId, songId) => {
        set((state) => ({
          playlists: state.playlists.map((p) =>
            p.id === playlistId
              ? { ...p, songs: p.songs.filter((id) => id !== songId) }
              : p
          ),
        }));
      },
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedMood: (mood) => set({ selectedMood: mood }),
    }),
    {
      name: 'app-storage',
    }
  )
);
