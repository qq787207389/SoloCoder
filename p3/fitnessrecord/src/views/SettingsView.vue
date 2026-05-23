<script setup lang="ts">
import { ref } from 'vue';
import { Volume2, VolumeX, Download, Upload, RotateCcw, Target, Info } from 'lucide-vue-next';
import { useSettingsStore } from '@/stores/settings';
import { useHistoryStore } from '@/stores/history';

const settingsStore = useSettingsStore();
const historyStore = useHistoryStore();

const showImportModal = ref(false);
const importData = ref('');
const importError = ref('');

const weeklyGoalOptions = [2, 3, 4, 5, 6, 7];

const handleExport = () => {
  const data = historyStore.exportData();
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fittrack-export-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

const handleImport = () => {
  importError.value = '';
  if (historyStore.importData(importData.value)) {
    showImportModal.value = false;
    importData.value = '';
  } else {
    importError.value = '数据格式错误，请检查文件内容';
  }
};

const resetAllData = () => {
  if (confirm('确定要重置所有数据吗？这将清除所有训练记录！')) {
    localStorage.clear();
    location.reload();
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-950 pb-20">
    <div class="px-4 pt-8 pb-4">
      <h1 class="text-2xl font-bold text-white mb-6">设置</h1>

      <div class="bg-gray-900 rounded-2xl border border-gray-800 mb-6 overflow-hidden">
        <div class="p-4 border-b border-gray-800">
          <h3 class="text-white font-medium flex items-center gap-2">
            <Target class="w-5 h-5 text-emerald-400" />
            训练目标
          </h3>
        </div>
        <div class="p-4">
          <label class="text-gray-400 text-sm block mb-3">每周训练目标</label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="goal in weeklyGoalOptions"
              :key="goal"
              @click="settingsStore.setWeeklyGoal(goal)"
              class="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              :class="[
                settingsStore.settings.weeklyGoal === goal
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              ]"
            >
              {{ goal }} 天
            </button>
          </div>
        </div>
      </div>

      <div class="bg-gray-900 rounded-2xl border border-gray-800 mb-6 overflow-hidden">
        <div class="p-4 border-b border-gray-800">
          <h3 class="text-white font-medium flex items-center gap-2">
            <Volume2 class="w-5 h-5 text-blue-400" />
            声音设置
          </h3>
        </div>
        <div class="p-4">
          <button
            @click="settingsStore.toggleSound"
            class="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-800 transition-colors"
          >
            <div class="flex items-center gap-3">
              <component
                :is="settingsStore.settings.soundEnabled ? Volume2 : VolumeX"
                class="w-5 h-5 text-gray-400"
              />
              <span class="text-white">休息结束提醒音效</span>
            </div>
            <div
              class="w-12 h-7 rounded-full transition-colors relative"
              :class="settingsStore.settings.soundEnabled ? 'bg-emerald-500' : 'bg-gray-700'"
            >
              <div
                class="absolute top-1 w-5 h-5 rounded-full bg-white transition-transform"
                :class="settingsStore.settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'"
              />
            </div>
          </button>
        </div>
      </div>

      <div class="bg-gray-900 rounded-2xl border border-gray-800 mb-6 overflow-hidden">
        <div class="p-4 border-b border-gray-800">
          <h3 class="text-white font-medium flex items-center gap-2">
            <Download class="w-5 h-5 text-orange-400" />
            数据管理
          </h3>
        </div>
        <div class="divide-y divide-gray-800">
          <button
            @click="handleExport"
            class="w-full flex items-center gap-3 p-4 hover:bg-gray-800 transition-colors text-left"
          >
            <Download class="w-5 h-5 text-gray-400" />
            <div>
              <p class="text-white">导出训练数据</p>
              <p class="text-gray-500 text-sm">将所有训练记录导出为 JSON 文件</p>
            </div>
          </button>
          <button
            @click="showImportModal = true"
            class="w-full flex items-center gap-3 p-4 hover:bg-gray-800 transition-colors text-left"
          >
            <Upload class="w-5 h-5 text-gray-400" />
            <div>
              <p class="text-white">导入训练数据</p>
              <p class="text-gray-500 text-sm">从备份文件恢复训练记录</p>
            </div>
          </button>
          <button
            @click="resetAllData"
            class="w-full flex items-center gap-3 p-4 hover:bg-gray-800 transition-colors text-left"
          >
            <RotateCcw class="w-5 h-5 text-red-400" />
            <div>
              <p class="text-red-400">重置所有数据</p>
              <p class="text-gray-500 text-sm">清除所有训练记录和设置</p>
            </div>
          </button>
        </div>
      </div>

      <div class="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <div class="p-4 border-b border-gray-800">
          <h3 class="text-white font-medium flex items-center gap-2">
            <Info class="w-5 h-5 text-purple-400" />
            关于
          </h3>
        </div>
        <div class="p-4">
          <div class="text-center py-4">
            <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
              <span class="text-3xl">💪</span>
            </div>
            <h2 class="text-xl font-bold text-white mb-1">FitTrack</h2>
            <p class="text-gray-500 text-sm">健身训练记录工具</p>
            <p class="text-gray-600 text-xs mt-4">版本 1.0.0</p>
          </div>
          <p class="text-gray-500 text-sm text-center mt-4">
            所有数据保存在本地浏览器中，请定期导出备份
          </p>
        </div>
      </div>
    </div>

    <Transition name="fade">
      <div
        v-if="showImportModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        @click.self="showImportModal = false"
      >
        <div class="w-full max-w-md bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <h3 class="text-xl font-bold text-white mb-4">导入训练数据</h3>
          <p class="text-gray-400 text-sm mb-4">
            请粘贴之前导出的 JSON 数据内容
          </p>
          <textarea
            v-model="importData"
            placeholder="粘贴 JSON 数据..."
            class="w-full h-40 bg-gray-800 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500 resize-none mb-4"
          />
          <p v-if="importError" class="text-red-400 text-sm mb-4">
            {{ importError }}
          </p>
          <div class="flex gap-3">
            <button
              @click="showImportModal = false"
              class="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl transition-colors"
            >
              取消
            </button>
            <button
              @click="handleImport"
              class="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors"
            >
              导入
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
