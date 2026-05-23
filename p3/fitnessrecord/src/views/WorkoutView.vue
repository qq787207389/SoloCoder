<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ChevronLeft, Check, SkipForward, X, Minus, Plus, Trophy } from 'lucide-vue-next';
import { useWorkoutStore } from '@/stores/workout';
import { useHistoryStore } from '@/stores/history';
import { usePlansStore } from '@/stores/plans';
import { useExercisesStore } from '@/stores/exercises';
import RestTimer from '@/components/workout/RestTimer.vue';
import PRCelebration from '@/components/ui/PRCelebration.vue';

const route = useRoute();
const router = useRouter();
const workoutStore = useWorkoutStore();
const historyStore = useHistoryStore();
const plansStore = usePlansStore();
const exercisesStore = useExercisesStore();

const weight = ref(20);
const reps = ref(10);
const showRestTimer = ref(false);
const showPRModal = ref(false);
const prExerciseName = ref('');

const currentExercise = computed(() => {
  const planExercise = workoutStore.currentExercise;
  if (!planExercise) return null;
  return exercisesStore.getExerciseById(planExercise.exerciseId);
});

const currentPR = computed(() => {
  if (!workoutStore.currentExercise) return 0;
  return historyStore.getPersonalBest(workoutStore.currentExercise.exerciseId);
});

onMounted(() => {
  const planId = route.query.planId as string;
  const mode = route.query.mode as string;

  if (planId) {
    const plan = plansStore.getPlanById(planId);
    if (plan) {
      workoutStore.startWorkout(plan);
      if (plan.exercises.length > 0) {
        weight.value = 20;
        reps.value = plan.exercises[0].reps;
      }
    } else {
      router.push('/plans');
    }
  } else if (mode === 'free') {
    const defaultExercises = exercisesStore.strengthExercises.slice(0, 4).map((ex, i) => ({
      id: Date.now().toString(36) + i,
      exerciseId: ex.id,
      sets: 3,
      reps: 10,
      restSeconds: 60
    }));
    workoutStore.startFreeWorkout(defaultExercises);
  } else {
    router.push('/');
  }
});

const adjustWeight = (delta: number) => {
  weight.value = Math.max(0, weight.value + delta);
};

const adjustReps = (delta: number) => {
  reps.value = Math.max(1, reps.value + delta);
};

const recordSet = () => {
  if (!workoutStore.currentExercise) return;

  const isPR = historyStore.checkIsPR(workoutStore.currentExercise.exerciseId, weight.value);
  
  workoutStore.recordSet(
    workoutStore.currentExercise.exerciseId,
    weight.value,
    reps.value,
    isPR
  );

  if (isPR && currentExercise.value) {
    prExerciseName.value = currentExercise.value.name;
    showPRModal.value = true;
  }

  const hasNext = workoutStore.nextSet();
  
  if (hasNext && workoutStore.currentExercise) {
    reps.value = workoutStore.currentExercise.reps;
    if (workoutStore.currentExercise.restSeconds > 0) {
      showRestTimer.value = true;
    }
  }
};

const skipSet = () => {
  workoutStore.nextSet();
  if (workoutStore.currentExercise) {
    reps.value = workoutStore.currentExercise.reps;
  }
};

const endWorkout = () => {
  if (workoutStore.completedSetsCount === 0) {
    if (confirm('还没有记录任何组，确定要放弃训练吗？')) {
      workoutStore.cancelWorkout();
      router.push('/');
    }
    return;
  }
  
  if (confirm('确定要结束训练吗？')) {
    const session = workoutStore.endWorkout();
    historyStore.addSession(session);
    router.push('/');
  }
};

const onRestTimerEnd = () => {
  showRestTimer.value = false;
};

const closeRestTimer = () => {
  showRestTimer.value = false;
};

const dismissPR = () => {
  showPRModal.value = false;
};

const goBack = () => {
  if (workoutStore.completedSetsCount > 0) {
    if (confirm('训练进行中，确定要退出吗？')) {
      workoutStore.cancelWorkout();
      router.back();
    }
  } else {
    workoutStore.cancelWorkout();
    router.back();
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-950 flex flex-col">
    <div class="px-4 py-4 flex items-center justify-between">
      <button
        @click="goBack"
        class="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
      >
        <ChevronLeft class="w-5 h-5 text-white" />
      </button>
      <div class="text-center">
        <p class="text-gray-400 text-xs">训练进度</p>
        <p class="text-white font-semibold">{{ workoutStore.completedSetsCount }}/{{ workoutStore.totalSets }}</p>
      </div>
      <button
        @click="endWorkout"
        class="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
      >
        <X class="w-5 h-5 text-white" />
      </button>
    </div>

    <div class="px-4 mb-4">
      <div class="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          class="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
          :style="{ width: `${workoutStore.progress}%` }"
        />
      </div>
    </div>

    <div class="flex-1 flex flex-col items-center justify-center px-4">
      <div v-if="currentExercise" class="w-full max-w-sm">
        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold text-white mb-2">{{ currentExercise.name }}</h2>
          <p class="text-emerald-400 font-medium">
            第 {{ workoutStore.currentSetNumber }} / {{ workoutStore.currentExercise?.sets }} 组
          </p>
          <div v-if="currentPR > 0" class="flex items-center justify-center gap-1 mt-2">
            <Trophy class="w-4 h-4 text-yellow-400" />
            <span class="text-yellow-400 text-sm">当前 PR: {{ currentPR }} kg</span>
          </div>
        </div>

        <div class="bg-gray-900 rounded-3xl p-8 mb-8 border border-gray-800">
          <div class="mb-8">
            <div class="flex items-center justify-between mb-3">
              <label class="text-gray-400 text-sm">重量 (kg)</label>
              <span v-if="weight > currentPR && currentPR > 0" class="text-yellow-400 text-xs flex items-center gap-1">
                <Trophy class="w-3 h-3" /> 新纪录！
              </span>
            </div>
            <div class="flex items-center justify-center gap-6">
              <button
                @click="adjustWeight(-2.5)"
                class="w-14 h-14 rounded-2xl bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
              >
                <Minus class="w-6 h-6 text-white" />
              </button>
              <span class="text-5xl font-bold text-white w-24 text-center font-mono">
                {{ weight }}
              </span>
              <button
                @click="adjustWeight(2.5)"
                class="w-14 h-14 rounded-2xl bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
              >
                <Plus class="w-6 h-6 text-white" />
              </button>
            </div>
          </div>

          <div>
            <label class="text-gray-400 text-sm block mb-3">次数</label>
            <div class="flex items-center justify-center gap-6">
              <button
                @click="adjustReps(-1)"
                class="w-14 h-14 rounded-2xl bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
              >
                <Minus class="w-6 h-6 text-white" />
              </button>
              <span class="text-5xl font-bold text-white w-24 text-center font-mono">
                {{ reps }}
              </span>
              <button
                @click="adjustReps(1)"
                class="w-14 h-14 rounded-2xl bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
              >
                <Plus class="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <button
            @click="skipSet"
            class="py-4 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-2xl flex items-center justify-center gap-2 transition-colors"
          >
            <SkipForward class="w-5 h-5" />
            跳过
          </button>
          <button
            @click="recordSet"
            class="py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-500/30"
          >
            <Check class="w-6 h-6" />
            完成
          </button>
        </div>
      </div>

      <div v-else class="text-center">
        <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <Trophy class="w-12 h-12 text-emerald-400" />
        </div>
        <h2 class="text-2xl font-bold text-white mb-2">🎉 训练完成！</h2>
        <p class="text-gray-400 mb-8">太棒了，今天的训练结束了</p>
        <button
          @click="endWorkout"
          class="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl transition-colors"
        >
          保存记录
        </button>
      </div>
    </div>

    <RestTimer
      v-if="showRestTimer"
      :seconds="workoutStore.currentExercise?.restSeconds || 60"
      :show="showRestTimer"
      @end="onRestTimerEnd"
      @close="closeRestTimer"
    />

    <PRCelebration
      v-if="showPRModal"
      :exercise-name="prExerciseName"
      @close="dismissPR"
    />
  </div>
</template>
