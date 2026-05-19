import { STORAGE_KEYS, SAMPLE_RESUME, DEFAULT_STYLE_SETTINGS } from '../constants';
import { ThemeType, StyleSettings } from '../types';

export const saveToStorage = (key: string, value: unknown): void => {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const serialized = localStorage.getItem(key);
    if (serialized === null) {
      return defaultValue;
    }
    return JSON.parse(serialized) as T;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return defaultValue;
  }
};

export const saveMarkdown = (markdown: string): void => {
  saveToStorage(STORAGE_KEYS.MARKDOWN, markdown);
};

export const loadMarkdown = (): string => {
  return loadFromStorage(STORAGE_KEYS.MARKDOWN, SAMPLE_RESUME);
};

export const saveTheme = (theme: ThemeType): void => {
  saveToStorage(STORAGE_KEYS.THEME, theme);
};

export const loadTheme = (): ThemeType => {
  return loadFromStorage(STORAGE_KEYS.THEME, 'classic' as ThemeType);
};

export const saveStyleSettings = (settings: StyleSettings): void => {
  saveToStorage(STORAGE_KEYS.STYLE_SETTINGS, settings);
};

export const loadStyleSettings = (): StyleSettings => {
  return loadFromStorage(STORAGE_KEYS.STYLE_SETTINGS, DEFAULT_STYLE_SETTINGS);
};
