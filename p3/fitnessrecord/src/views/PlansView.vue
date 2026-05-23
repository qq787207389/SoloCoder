<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Plus, Play, Trash2, ChevronRight, Dumbbell } from 'lucide-vue-next';
import { usePlansStore } from '@/stores/plans';
import { useExercisesStore } from '@/stores/exercises';

const router = useRouter();
const plansStore = usePlansStore();
const exercisesStore = useExercisesStore();

const showCreateModal = ref(false);
const newPlanName = ref('');
const selectedExercises = ref<Array<{ exerciseId: string; sets: number; reps: number; restSeconds: number }>>([]);

const plans = computed(() => plansStore.allPlans);

const getExerciseName = (id: string) => {
  return exercisesStore.getExerciseById(id)?.name || '未知动作';
};

const addExerciseToPlan = () => {
  selectedExercises.value.push({
    exerciseId: 'squat',
    sets: 3,
    reps: 10,
    restSeconds: 60
  });
};

const removeExerciseFromPlan = (index: number) => {
  selectedExercises.value.splice(index, 1);
};

const createPlan = () => {
  if (!newPlanName.value.trim() || selectedExercises.value.length === 0) return;
  
  plansStore.createPlan(newPlanName.value, selectedExercises.value.map(ex => ({
    id: Date.now().toString(36) + Math.random().toString(36).substr(2),
    ...ex
  })));
  
  showCreateModal.value = false;
  newPlanName.value = '';
  selectedExercises.value = [];
};

const startPlan = (plan: any) => {
  router.push({
    path: '/workout',
    query: { planId: plan.id }
  });
};

const deletePlan = (id: string) => {
  if (confirm('确定要删除这个训练计划吗？')) {
    plansStore.deletePlan(id);
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-950 pb-20">
    <div class="px-4 pt-8 pb-4">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-white">训练计划</h1>
        <button
          @click="showCreateModal = true"
          class="w-10 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center transition-colors"
        >
          <Plus class="w-5 h-5 text-white" />
        </button>
      </div>

      <div v-if="plans.length === 0" class="text-center py-16">
        <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
          <Dumbbell class="w-10 h-10 text-gray-600" />
        </div>
        <h3 class="text-white font-medium mb-2">还没有训练计划</h3>
        <p class="text-gray-500 text-sm mb-6">创建一个属于你的训练计划吧</p>
        <button
          @click="showCreateModal = true"
          class="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors"
        >
          创建计划
        </button>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="plan in plans"
          :key="plan.id"
          class="bg-gray-900 rounded-2xl p-5 border border-gray-800"
        >
          <div class="flex items-start justify-between mb-4">
            <div>
              <h3 class="text-white font-semibold text-lg">{{ plan.name }}</h3>
              <p class="text-gray-500 text-sm mt-1">
                {{ plan.exercises.length }} 个动作 · {{ plan.exercises.reduce((sum, e) => sum + e.sets, 0) }} 组
              </p>
            </div>
            <button
              @click="deletePlan(plan.id)"
              class="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center transition-colors"
            >
              <Trash2 class="w-4 h-4 text-red-400" />
            </button>
          </div>

          <div class="space-y-2 mb-4">
            <div
              v-for="(exercise, index) in plan.exercises"
              :key="exercise.id"
              class="flex items-center gap-3 text-sm"
            >
              <span class="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 text-xs">
                {{ index + 1 }}
              </span>
              <span class="text-gray-300 flex-1">{{ getExerciseName(exercise.exerciseId) }}</span>
              <span class="text-gray-500">{{ exercise.sets }}×{{ exercise.reps }}</span>
            </div>
          </div>

          <button
            @click="startPlan(plan)"
            class="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Play class="w-4 h-4" />
            开始训练
          </button>
        </div>
      </div>
    </div>

    <Transition name="fade">
      <div
        v-if="showCreateModal"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80"
        @click.self="showCreateModal = false"
      >
        <div class="w-full max-w-lg bg-gray-900 rounded-t-3xl sm:rounded-3xl p-6 max-h-[90vh] overflow-y-auto">
          <h2 class="text-xl font-bold text-white mb-6">创建训练计划</h2>

          <div class="mb-6">
            <label class="block text-gray-400 text-sm mb-2">计划名称</label>
            <input
              v-model="newPlanName"
              type="text"
              placeholder="例如：增肌训练"
              class="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div class="mb-6">
            <div class="flex items-center justify-between mb-3">
              <label class="text-gray-400 text-sm">训练动作</label>
              <button
                @click="addExerciseToPlan"
                class="text-emerald-400 text-sm flex items-center gap-1"
              >
                <Plus class="w-4 h-4" />
                添加
              </button>
            </div>

            <div v-if="selectedExercises.length === 0" class="text-center py-8 bg-gray-800/50 rounded-xl">
              <p class="text-gray-500 text-sm">点击上方添加训练动作</p>
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="(exercise, index) in selectedExercises"
                :key="index"
                class="bg-gray-800 rounded-xl p-4"
              >
                <div class="flex items-center justify-between mb-3">
                  <select
                    v-model="exercise.exerciseId"
                    class="bg-gray-700 text-white rounded-lg py-2 px-3 text-sm focus:outline-none"
                  >
                    <option v-for="ex in exercisesStore.allExercises" :key="ex.id" :value="ex.id">
                      {{ ex.name }}
                    </option>
                  </select>
                  <button
                    @click="removeExerciseFromPlan(index)"
                    class="text-red-400 hover:text-red-300"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
                <div class="grid grid-cols-3 gap-3">
                  <div>
                    <label class="text-gray-500 text-xs block mb-1">组数</label>
                    <input
                      v-model.number="exercise.sets"
                      type="number"
                      min="1"
                      class="w-full bg-gray-700 text-white rounded-lg py-2 px-3 text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label class="text-gray-500 text-xs block mb-1">次数</label>
                    <input
                      v-model.number="exercise.reps"
                      type="number"
                      min="1"
                      class="w-full bg-gray-700 text-white rounded-lg py-2 px-3 text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label class="text-gray-500 text-xs block mb-1">休息(秒)</label>
                    <input
                      v-model.number="exercise.restSeconds"
                      type="number"
                      min="0"
                      step="30"
                      class="w-full bg-gray-700 text-white rounded-lg py-2 px-3 text-sm focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="flex gap-3">
            <button
              @click="showCreateModal = false"
              class="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl transition-colors"
            >
              取消
            </button>
            <button
              @click="createPlan"
              :disabled="!newPlanName.trim() || selectedExercises.length === 0"
              class="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
            >
              创建
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
