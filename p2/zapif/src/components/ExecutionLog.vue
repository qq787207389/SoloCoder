<template>
  <div class="execution-log" :class="{ expanded: isExpanded }">
    <div class="log-header" @click="toggleExpand">
      <span class="log-title">
        📋 执行日志
        <span v-if="store.executionLogs.length > 0" class="log-count">{{ store.executionLogs.length }}</span>
      </span>
      <span class="expand-icon">{{ isExpanded ? '▼' : '▲' }}</span>
    </div>
    
    <div v-if="isExpanded" class="log-content">
      <div v-if="store.executionLogs.length === 0" class="empty-logs">
        暂无执行记录，点击"测试运行"开始执行
      </div>
      
      <div v-else class="log-list">
        <div
          v-for="(log, index) in store.executionLogs"
          :key="index"
          class="log-item"
          :class="log.status"
        >
          <div class="log-icon">
            <span v-if="log.status === 'start'">⏳</span>
            <span v-else-if="log.status === 'success'">✅</span>
            <span v-else-if="log.status === 'error'">❌</span>
          </div>
          <div class="log-info">
            <div class="log-node-name">{{ log.nodeName }}</div>
            <div class="log-message">{{ log.message }}</div>
            <div v-if="log.data" class="log-data">
              <button class="expand-data-btn" @click.stop="toggleDataExpand(index)">
                {{ expandedLogs.has(index) ? '收起数据' : '查看数据' }}
              </button>
              <pre v-if="expandedLogs.has(index)" class="data-preview">
                {{ formatData(log.data) }}
              </pre>
            </div>
          </div>
          <div class="log-time">{{ formatTime(log.timestamp) }}</div>
        </div>
      </div>
      
      <div class="log-actions">
        <button class="clear-btn" @click="clearLogs">
          🗑️ 清空日志
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useWorkflowStore } from '../stores/workflowStore';

const store = useWorkflowStore();

const isExpanded = ref(false);
const expandedLogs = ref<Set<number>>(new Set());

function toggleExpand() {
  isExpanded.value = !isExpanded.value;
}

function toggleDataExpand(index: number) {
  if (expandedLogs.value.has(index)) {
    expandedLogs.value.delete(index);
  } else {
    expandedLogs.value.add(index);
  }
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

function formatData(data: any): string {
  return JSON.stringify(data, null, 2);
}

function clearLogs() {
  store.executionLogs.splice(0, store.executionLogs.length);
}
</script>

<style scoped>
.execution-log {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: #1e1e2e;
  border-top: 1px solid #313244;
  z-index: 50;
  max-height: 48px;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.execution-log.expanded {
  max-height: 40vh;
}

.log-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  cursor: pointer;
  user-select: none;
  min-height: 48px;
}

.log-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #cdd6f4;
}

.log-count {
  background: #313244;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  color: #89b4fa;
}

.expand-icon {
  font-size: 10px;
  color: #6c7086;
}

.log-content {
  display: flex;
  flex-direction: column;
  height: calc(40vh - 50px);
}

.empty-logs {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c7086;
  font-size: 13px;
}

.log-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 16px;
}

.log-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 12px;
  margin-bottom: 6px;
  background: #313244;
  border-radius: 8px;
  border-left: 3px solid #45475a;
}

.log-item.start {
  border-left-color: #f9e2af;
}

.log-item.success {
  border-left-color: #a6e3a1;
}

.log-item.error {
  border-left-color: #f38ba8;
}

.log-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.log-info {
  flex: 1;
  min-width: 0;
}

.log-node-name {
  font-size: 13px;
  font-weight: 600;
  color: #cdd6f4;
  margin-bottom: 2px;
}

.log-message {
  font-size: 12px;
  color: #9399b2;
}

.log-data {
  margin-top: 6px;
}

.expand-data-btn {
  padding: 2px 8px;
  background: #45475a;
  border: none;
  border-radius: 4px;
  color: #89b4fa;
  font-size: 11px;
  cursor: pointer;
}

.expand-data-btn:hover {
  background: #585b70;
}

.data-preview {
  margin: 6px 0 0 0;
  padding: 8px;
  background: #181825;
  border-radius: 6px;
  font-size: 11px;
  color: #a6adc8;
  max-height: 150px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

.log-time {
  font-size: 11px;
  color: #6c7086;
  flex-shrink: 0;
}

.log-actions {
  padding: 12px 16px;
  border-top: 1px solid #313244;
}

.clear-btn {
  padding: 6px 12px;
  background: #313244;
  border: 1px solid #45475a;
  border-radius: 6px;
  color: #9399b2;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: #45475a;
  color: #f38ba8;
}
</style>
