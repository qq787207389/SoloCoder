<template>
  <div class="node-panel">
    <div class="panel-header">
      <h3>节点库</h3>
    </div>
    
    <div class="section">
      <div class="section-title">
        <span class="icon trigger-icon">⚡</span>
        触发器
      </div>
      <div class="node-list">
        <div
          v-for="template in triggerTemplates"
          :key="template.subtype"
          class="node-item"
          draggable="true"
          @dragstart="onDragStart($event, template)"
          @dragend="onDragEnd"
        >
          <span class="node-icon">{{ template.icon }}</span>
          <span class="node-name">{{ template.name }}</span>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">
        <span class="icon action-icon">🔧</span>
        动作
      </div>
      <div class="node-list">
        <div
          v-for="template in actionTemplates"
          :key="template.subtype"
          class="node-item"
          draggable="true"
          @dragstart="onDragStart($event, template)"
          @dragend="onDragEnd"
        >
          <span class="node-icon">{{ template.icon }}</span>
          <span class="node-name">{{ template.name }}</span>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">
        <span class="icon condition-icon">🔀</span>
        控制流
      </div>
      <div class="node-list">
        <div
          v-for="template in conditionTemplates"
          :key="template.subtype"
          class="node-item"
          draggable="true"
          @dragstart="onDragStart($event, template)"
          @dragend="onDragEnd"
        >
          <span class="node-icon">{{ template.icon }}</span>
          <span class="node-name">{{ template.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { nodeTemplates } from '../data/nodeTemplates';
import type { NodeTemplate } from '../types';

const emit = defineEmits<{
  (e: 'dragStart', template: NodeTemplate): void;
  (e: 'dragEnd'): void;
}>();

const triggerTemplates = computed(() => 
  nodeTemplates.filter(t => t.type === 'trigger')
);

const actionTemplates = computed(() => 
  nodeTemplates.filter(t => t.type === 'action')
);

const conditionTemplates = computed(() => 
  nodeTemplates.filter(t => t.type === 'condition')
);

function onDragStart(event: DragEvent, template: NodeTemplate) {
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData('application/json', JSON.stringify(template));
  }
  emit('dragStart', template);
}

function onDragEnd() {
  emit('dragEnd');
}
</script>

<style scoped>
.node-panel {
  width: 240px;
  background: #1e1e2e;
  border-right: 1px solid #313244;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.panel-header {
  padding: 16px;
  border-bottom: 1px solid #313244;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #cdd6f4;
}

.section {
  padding: 12px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #6c7086;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.icon {
  font-size: 14px;
}

.node-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.node-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: #313244;
  border: 1px solid #45475a;
  border-radius: 8px;
  cursor: grab;
  transition: all 0.2s ease;
}

.node-item:hover {
  background: #45475a;
  border-color: #585b70;
  transform: translateX(2px);
}

.node-item:active {
  cursor: grabbing;
}

.node-icon {
  font-size: 18px;
}

.node-name {
  font-size: 13px;
  color: #cdd6f4;
  font-weight: 500;
}
</style>
