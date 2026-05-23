import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { WorkoutPlan, PlanExercise } from '@/types';
import { storage, generateId } from '@/utils/storage';

const STORAGE_KEY = 'fittrack_plans';

export const usePlansStore = defineStore('plans', () => {
  const plans = ref<WorkoutPlan[]>(storage.get(STORAGE_KEY, []));

  const allPlans = computed(() => plans.value);

  const getPlanById = (id: string) => {
    return plans.value.find(p => p.id === id);
  };

  const createPlan = (name: string, exercises: PlanExercise[]) => {
    const newPlan: WorkoutPlan = {
      id: generateId(),
      name,
      exercises,
      createdAt: new Date().toISOString()
    };
    plans.value.push(newPlan);
    saveToStorage();
    return newPlan;
  };

  const updatePlan = (id: string, updates: Partial<WorkoutPlan>) => {
    const index = plans.value.findIndex(p => p.id === id);
    if (index !== -1) {
      plans.value[index] = { ...plans.value[index], ...updates };
      saveToStorage();
    }
  };

  const deletePlan = (id: string) => {
    plans.value = plans.value.filter(p => p.id !== id);
    saveToStorage();
  };

  const saveToStorage = () => {
    storage.set(STORAGE_KEY, plans.value);
  };

  return {
    plans,
    allPlans,
    getPlanById,
    createPlan,
    updatePlan,
    deletePlan
  };
});
