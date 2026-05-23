import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { WorkoutSet, WorkoutSession, PlanExercise } from '@/types';
import { generateId } from '@/utils/storage';

export const useWorkoutStore = defineStore('workout', () => {
  const isActive = ref(false);
  const planId = ref<string | undefined>(undefined);
  const planName = ref<string | undefined>(undefined);
  const startTime = ref<string>('');
  const currentExerciseIndex = ref(0);
  const currentSetIndex = ref(0);
  const planExercises = ref<PlanExercise[]>([]);
  const completedSets = ref<WorkoutSet[]>([]);
  const showPRCelebration = ref(false);
  const lastPRExercise = ref('');

  const currentExercise = computed(() => {
    if (planExercises.value.length === 0) return null;
    return planExercises.value[currentExerciseIndex.value];
  });

  const currentSetNumber = computed(() => currentSetIndex.value + 1);

  const totalSets = computed(() => {
    return planExercises.value.reduce((sum, ex) => sum + ex.sets, 0);
  });

  const completedSetsCount = computed(() => completedSets.value.length);

  const progress = computed(() => {
    if (totalSets.value === 0) return 0;
    return Math.round((completedSetsCount.value / totalSets.value) * 100);
  });

  const startWorkout = (plan: { id?: string; name?: string; exercises: PlanExercise[] }) => {
    isActive.value = true;
    planId.value = plan.id;
    planName.value = plan.name;
    startTime.value = new Date().toISOString();
    planExercises.value = plan.exercises;
    currentExerciseIndex.value = 0;
    currentSetIndex.value = 0;
    completedSets.value = [];
    showPRCelebration.value = false;
  };

  const startFreeWorkout = (exercises: PlanExercise[]) => {
    startWorkout({ exercises });
  };

  const recordSet = (exerciseId: string, weight: number, reps: number, isPR = false) => {
    const set: WorkoutSet = {
      id: generateId(),
      exerciseId,
      weight,
      reps,
      isPR
    };
    completedSets.value.push(set);

    if (isPR) {
      lastPRExercise.value = exerciseId;
      showPRCelebration.value = true;
      setTimeout(() => {
        showPRCelebration.value = false;
      }, 3000);
    }

    return set;
  };

  const nextSet = () => {
    const current = currentExercise.value;
    if (!current) return false;

    if (currentSetIndex.value + 1 < current.sets) {
      currentSetIndex.value++;
      return true;
    }

    if (currentExerciseIndex.value + 1 < planExercises.value.length) {
      currentExerciseIndex.value++;
      currentSetIndex.value = 0;
      return true;
    }

    return false;
  };

  const skipExercise = () => {
    if (currentExerciseIndex.value + 1 < planExercises.value.length) {
      currentExerciseIndex.value++;
      currentSetIndex.value = 0;
      return true;
    }
    return false;
  };

  const endWorkout = (): WorkoutSession => {
    const endTime = new Date().toISOString();
    const duration = Math.round(
      (new Date(endTime).getTime() - new Date(startTime.value).getTime()) / 1000
    );

    const session: WorkoutSession = {
      id: generateId(),
      date: new Date().toISOString().split('T')[0],
      planId: planId.value,
      planName: planName.value,
      sets: [...completedSets.value],
      duration,
      startTime: startTime.value,
      endTime
    };

    isActive.value = false;
    planId.value = undefined;
    planName.value = undefined;
    startTime.value = '';
    currentExerciseIndex.value = 0;
    currentSetIndex.value = 0;
    planExercises.value = [];
    completedSets.value = [];

    return session;
  };

  const cancelWorkout = () => {
    isActive.value = false;
    planId.value = undefined;
    planName.value = undefined;
    startTime.value = '';
    currentExerciseIndex.value = 0;
    currentSetIndex.value = 0;
    planExercises.value = [];
    completedSets.value = [];
  };

  const dismissPRCelebration = () => {
    showPRCelebration.value = false;
  };

  return {
    isActive,
    planId,
    planName,
    startTime,
    currentExerciseIndex,
    currentSetIndex,
    planExercises,
    completedSets,
    showPRCelebration,
    lastPRExercise,
    currentExercise,
    currentSetNumber,
    totalSets,
    completedSetsCount,
    progress,
    startWorkout,
    startFreeWorkout,
    recordSet,
    nextSet,
    skipExercise,
    endWorkout,
    cancelWorkout,
    dismissPRCelebration
  };
});
