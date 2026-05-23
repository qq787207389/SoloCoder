import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { WorkoutSession } from '@/types';
import { storage, getWeekStart, isSameDay } from '@/utils/storage';

const STORAGE_KEY = 'fittrack_history';

export const useHistoryStore = defineStore('history', () => {
  const sessions = ref<WorkoutSession[]>(storage.get(STORAGE_KEY, []));

  const allSessions = computed(() => 
    [...sessions.value].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  );

  const thisWeekSessions = computed(() => {
    const weekStart = getWeekStart();
    return sessions.value.filter(s => {
      const sessionDate = new Date(s.date);
      return sessionDate >= weekStart;
    });
  });

  const thisWeekWorkoutDays = computed(() => {
    const days = new Set(thisWeekSessions.value.map(s => s.date));
    return days.size;
  });

  const addSession = (session: WorkoutSession) => {
    sessions.value.push(session);
    saveToStorage();
  };

  const deleteSession = (id: string) => {
    sessions.value = sessions.value.filter(s => s.id !== id);
    saveToStorage();
  };

  const getPersonalBest = (exerciseId: string): number => {
    let maxWeight = 0;
    sessions.value.forEach(session => {
      session.sets.forEach(set => {
        if (set.exerciseId === exerciseId && set.weight > maxWeight) {
          maxWeight = set.weight;
        }
      });
    });
    return maxWeight;
  };

  const checkIsPR = (exerciseId: string, weight: number): boolean => {
    const currentPR = getPersonalBest(exerciseId);
    return weight > currentPR;
  };

  const getExerciseHistory = (exerciseId: string) => {
    const history: { date: string; maxWeight: number }[] = [];
    const dateMap = new Map<string, number>();

    sessions.value.forEach(session => {
      let sessionMax = 0;
      session.sets.forEach(set => {
        if (set.exerciseId === exerciseId && set.weight > sessionMax) {
          sessionMax = set.weight;
        }
      });
      if (sessionMax > 0) {
        const existing = dateMap.get(session.date) || 0;
        dateMap.set(session.date, Math.max(existing, sessionMax));
      }
    });

    dateMap.forEach((maxWeight, date) => {
      history.push({ date, maxWeight });
    });

    return history.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getMonthlyHeatmapData = (year: number, month: number) => {
    const data: { date: string; count: number }[] = [];
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const count = sessions.value.filter(s => s.date === dateStr).length;
      data.push({ date: dateStr, count });
    }

    return data;
  };

  const getTodaySession = () => {
    const today = new Date().toISOString().split('T')[0];
    return sessions.value.find(s => s.date === today);
  };

  const getRecentSessions = (limit: number = 5) => {
    return allSessions.value.slice(0, limit);
  };

  const exportData = () => {
    return JSON.stringify(sessions.value, null, 2);
  };

  const importData = (data: string) => {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        sessions.value = parsed;
        saveToStorage();
        return true;
      }
    } catch {
      return false;
    }
    return false;
  };

  const saveToStorage = () => {
    storage.set(STORAGE_KEY, sessions.value);
  };

  return {
    sessions,
    allSessions,
    thisWeekSessions,
    thisWeekWorkoutDays,
    addSession,
    deleteSession,
    getPersonalBest,
    checkIsPR,
    getExerciseHistory,
    getMonthlyHeatmapData,
    getTodaySession,
    getRecentSessions,
    exportData,
    importData
  };
});
