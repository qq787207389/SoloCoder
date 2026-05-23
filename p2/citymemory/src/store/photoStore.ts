import { create } from 'zustand';
import type { Photo, Comment, Decade, FilterOptions } from '../types';

interface PhotoState {
  photos: Photo[];
  selectedPhoto: Photo | null;
  comments: Comment[];
  filterOptions: FilterOptions;
  loading: boolean;
  error: string | null;

  fetchPhotos: (filters?: FilterOptions) => Promise<void>;
  fetchPhotoById: (id: string) => Promise<void>;
  fetchComments: (photoId: string) => Promise<void>;
  addComment: (photoId: string, content: string, author: string) => Promise<void>;
  uploadPhoto: (formData: FormData) => Promise<Photo | null>;
  setFilterOptions: (options: FilterOptions) => void;
  clearSelectedPhoto: () => void;
}

export const usePhotoStore = create<PhotoState>((set, get) => ({
  photos: [],
  selectedPhoto: null,
  comments: [],
  filterOptions: { decade: 'all' },
  loading: false,
  error: null,

  fetchPhotos: async (filters) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (filters?.decade) params.append('decade', filters.decade);
      if (filters?.radius) params.append('radius', filters.radius.toString());
      if (filters?.centerLat) params.append('lat', filters.centerLat.toString());
      if (filters?.centerLng) params.append('lng', filters.centerLng.toString());

      const response = await fetch(`/api/photos?${params}`);
      const photos = await response.json();
      set({ photos, loading: false });
    } catch (error) {
      set({ error: '获取照片列表失败', loading: false });
    }
  },

  fetchPhotoById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/photos/${id}`);
      if (!response.ok) throw new Error('Photo not found');
      const photo = await response.json();
      set({ selectedPhoto: photo, loading: false });
    } catch (error) {
      set({ error: '获取照片详情失败', loading: false });
    }
  },

  fetchComments: async (photoId) => {
    try {
      const response = await fetch(`/api/photos/${photoId}/comments`);
      const comments = await response.json();
      set({ comments });
    } catch (error) {
      console.error('获取评论失败', error);
    }
  },

  addComment: async (photoId, content, author) => {
    try {
      const response = await fetch(`/api/photos/${photoId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, author }),
      });
      const newComment = await response.json();
      set((state) => ({ comments: [...state.comments, newComment] }));
    } catch (error) {
      console.error('添加评论失败', error);
    }
  },

  uploadPhoto: async (formData) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/photos', {
        method: 'POST',
        body: formData,
      });
      const photo = await response.json();
      set((state) => ({ photos: [...state.photos, photo], loading: false }));
      return photo;
    } catch (error) {
      set({ error: '上传照片失败', loading: false });
      return null;
    }
  },

  setFilterOptions: (options) => {
    set({ filterOptions: { ...get().filterOptions, ...options } });
  },

  clearSelectedPhoto: () => {
    set({ selectedPhoto: null, comments: [] });
  },
}));
