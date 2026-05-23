import type { User, Pet, Post, Reminder } from '../types.ts';

const STORAGE_KEYS = {
  CURRENT_USER: 'petdaily_current_user',
  USERS: 'petdaily_users',
  PETS: 'petdaily_pets',
  POSTS: 'petdaily_posts',
  REMINDERS: 'petdaily_reminders',
};

export const storage = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  },

  remove(key: string): void {
    localStorage.removeItem(key);
  },
};

export const getCurrentUser = (): User | null => {
  return storage.get<User | null>(STORAGE_KEYS.CURRENT_USER, null);
};

export const setCurrentUser = (user: User | null): void => {
  storage.set(STORAGE_KEYS.CURRENT_USER, user);
};

export const getUsers = (): User[] => {
  return storage.get<User[]>(STORAGE_KEYS.USERS, []);
};

export const saveUsers = (users: User[]): void => {
  storage.set(STORAGE_KEYS.USERS, users);
};

export const getPets = (): Pet[] => {
  return storage.get<Pet[]>(STORAGE_KEYS.PETS, []);
};

export const savePets = (pets: Pet[]): void => {
  storage.set(STORAGE_KEYS.PETS, pets);
};

export const getPosts = (): Post[] => {
  return storage.get<Post[]>(STORAGE_KEYS.POSTS, []);
};

export const savePosts = (posts: Post[]): void => {
  storage.set(STORAGE_KEYS.POSTS, posts);
};

export const getReminders = (): Reminder[] => {
  return storage.get<Reminder[]>(STORAGE_KEYS.REMINDERS, []);
};

export const saveReminders = (reminders: Reminder[]): void => {
  storage.set(STORAGE_KEYS.REMINDERS, reminders);
};
