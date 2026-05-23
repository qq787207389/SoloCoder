<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import LineChart from '@/components/charts/LineChart.vue';
import HeatmapChart from '@/components/charts/HeatmapChart.vue';
import { useHistoryStore } from '@/stores/history';
import { useExercisesStore } from '@/stores/exercises';
import { formatDate } from '@/utils/storage';
import { Dumbbell, TrendingUp, Calendar } from 'lucide-vue-next';

const historyStore = useHistoryStore();
const exercisesStore = useExercisesStore();

const selectedExerciseId = ref('squat');

const heatmapData = computed(() => {
  const now = new Date();
  return historyStore.getMonthlyHeatmapData(now.getFullYear(), now.getMonth());
});

const lineChartData = computed(() => {
  const history = historyStore.getExerciseHistory(selectedExerciseId.value);
  return history.map(h => ({
    date: h.date.slice(5),
    value: h.maxWeight
  }));
});

const selectedExercise = computed(() => 
  exercisesStore.getExerciseById(selectedExerciseId.value)
);

const totalVolume = computed(() => {
  let total = 0;
  historyStore.sessions.forEach(session => {
    session.sets.forEach(set => {
      total += set.weight * set.reps;
    });
  });
  return total;
});

const totalSets = computed(() => {
  let total = 0;
  historyStore.sessions.forEach(session => {
    total += session.sets.length;
  });
  return total;
});
</script>

<template>
  <div class="min-h-screen bg-gray-950 pb-20">
    <div class="px-4 pt-8 pb-4">
      <h1 class="text-2xl font-bold text-white mb-6">数据统计</h1>

      <div class="grid grid-cols-3 gap-3 mb-6">
        <div class="bg-gray-900 rounded-xl p-4 border border-gray-800 text-center">
          <div class="w-10 h-10 mx-auto mb-2 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <Dumbbell class="w-5 h-5 text-emerald-400" />
          </div>
          <p class="text-xl font-bold text-white">{{ historyStore.sessions.length }}</p>
          <p class="text-gray-500 text-xs">总训练</p>
        </div>
        <div class="bg-gray-900 rounded-xl p-4 border border-gray-800 text-center">
          <div class="w-10 h-10 mx-auto mb-2 rounded-full bg-blue-500/20 flex items-center justify-center">
            <TrendingUp class="w-5 h-5 text-blue-400" />
          </div>
          <p class="text-xl font-bold text-white">{{ totalSets }}</p>
          <p class="text-gray-500 text-xs">总组数</p>
        </div>
        <div class="bg-gray-900 rounded-xl p-4 border border-gray-800 text-center">
          <div class="w-10 h-10 mx-auto mb-2 rounded-full bg-orange-500/20 flex items-center justify-center">
            <Calendar class="w-5 h-5 text-orange-400" />
          </div>
          <p class="text-xl font-bold text-white">{{ (totalVolume / 1000).toFixed(1) }}k</p>
          <p class="text-gray-500 text-xs">总容量(kg)</p>
        </div>
      </div>

      <div class="bg-gray-900 rounded-2xl p-5 mb-6 border border-gray-800">
        <HeatmapChart :data="heatmapData" />
      </div>

      <div class="bg-gray-900 rounded-2xl p-5 mb-6 border border-gray-800">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-white font-semibold">力量进步曲线</h3>
          <select
            v-model="selectedExerciseId"
            class="bg-gray-800 text-white text-sm rounded-lg py-2 px-3 focus:outline-none"
          >
            <option v-for="ex in exercisesStore.strengthExercises" :key="ex.id" :value="ex.id">
              {{ ex.name }}
            </option>
          </select>
        </div>
        <div v-if="lineChartData.length > 0">
          <LineChart :data="lineChartData" :title="`${selectedExercise?.name} 最大重量`" />
        </div>
        <div v-else class="text-center py-12">
          <p class="text-gray-500">还没有该动作的训练记录</p>
          <p class="text-gray-600 text-sm mt-1">开始训练后这里会显示你的进步曲线</p>
        </div>
      </div>

      <div v-if="historyStore.allSessions.length > 0">
        <h3 class="text-lg font-semibold text-white mb-4">训练历史</h3>
        <div class="space-y-3">
          <div
            v-for="session in historyStore.allSessions"
            :key="session.id"
            class="bg-gray-900 rounded-xl p-4 border border-gray-800"
          >
            <div class="flex items-center justify-between mb-3">
              <div>
                <h4 class="text-white font-medium">{{ session.planName || '自由训练' }}</h4>
                <p class="text-gray-500 text-sm">{{ formatDate(session.date) }}</p>
              </div>
              <span class="text-emerald-400 text-sm">
                {{ session.sets.length }} 组
              </span>
            </div>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="(set, index) in session.sets.slice(0, 4)"
                :key="set.id"
                class="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded"
              >
                {{ exercisesStore.getExerciseById(set.exerciseId)?.name }}: {{ set.weight }}kg×{{ set.reps }}
              </span>
              <span v-if="session.sets.length > 4" class="text-xs text-gray-500 py-1">
                +{{ session.sets.length - 4 }} 更多
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
