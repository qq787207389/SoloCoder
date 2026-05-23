import type { User, Pet, Post, Reminder } from '../types.ts';

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
}

const API_BASE = '/api';

const request = async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE}${endpoint}`, options);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const api = {
  getCurrentUser: () => request<{ user: User }>('/user'),
  getUsers: () => request<{ users: User[] }>('/users'),
  getPets: (userId?: string) => 
    request<{ pets: Pet[] }>(`/pets${userId ? `?userId=${userId}` : ''}`),
  createPet: (pet: Omit<Pet, 'id'>) =>
    request<{ pet: Pet }>('/pets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pet),
    }),
  updatePet: (id: string, pet: Partial<Pet>) =>
    request<{ pet: Pet }>(`/pets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pet),
    }),
  deletePet: (id: string) =>
    request<{ success: boolean }>(`/pets/${id}`, { method: 'DELETE' }),

  getPosts: (params?: { petId?: string; userId?: string; tag?: string }) => {
    const query = params
      ? '?' + new URLSearchParams(params as Record<string, string>).toString()
      : '';
    return request<{ posts: Post[] }>(`/posts${query}`);
  },
  createPost: (post: Omit<Post, 'id' | 'likes' | 'comments' | 'createdAt'>) =>
    request<{ post: Post }>('/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post),
    }),
  likePost: (id: string) =>
    request<{ post: Post }>(`/posts/${id}/like`, { method: 'POST' }),
  addComment: (id: string, content: string) =>
    request<{ comment: Comment }>(`/posts/${id}/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    }),

  getReminders: (petId?: string) =>
    request<{ reminders: Reminder[] }>(`/reminders${petId ? `?petId=${petId}` : ''}`),
  createReminder: (reminder: Omit<Reminder, 'id'>) =>
    request<{ reminder: Reminder }>('/reminders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reminder),
    }),
  updateReminder: (id: string, reminder: Partial<Reminder>) =>
    request<{ reminder: Reminder }>(`/reminders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reminder),
    }),
  deleteReminder: (id: string) =>
    request<{ success: boolean }>(`/reminders/${id}`, { method: 'DELETE' }),
};
