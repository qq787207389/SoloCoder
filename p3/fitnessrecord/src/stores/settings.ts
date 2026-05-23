import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { UserSettings } from '@/types';
import { storage } from '@/utils/storage';

const STORAGE_KEY = 'fittrack_settings';

const defaultSettings: UserSettings = {
  weeklyGoal: 3,
  theme: 'dark',
  soundEnabled: true
};

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<UserSettings>(storage.get(STORAGE_KEY, defaultSettings));

  const updateSettings = (updates: Partial<UserSettings>) => {
    settings.value = { ...settings.value, ...updates };
    saveToStorage();
  };

  const setWeeklyGoal = (goal: number) => {
    settings.value.weeklyGoal = goal;
    saveToStorage();
  };

  const setTheme = (theme: 'dark' | 'light') => {
    settings.value.theme = theme;
    saveToStorage();
  };

  const toggleSound = () => {
    settings.value.soundEnabled = !settings.value.soundEnabled;
    saveToStorage();
  };

  const resetSettings = () => {
    settings.value = { ...defaultSettings };
    saveToStorage();
  };

  const saveToStorage = () => {
    storage.set(STORAGE_KEY, settings.value);
  };

  return {
    settings,
    updateSettings,
    setWeeklyGoal,
    setTheme,
    toggleSound,
    resetSettings
  };
});
