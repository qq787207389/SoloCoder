<template>
  <g
    :transform="`translate(${node.x}, ${node.y})`"
    :class="['workflow-node', node.type, { selected: isSelected, running: isRunning }]"
    @mousedown.stop="onNodeMouseDown"
    @click.stop="onNodeClick"
  >
    <rect
      class="node-body"
      :width="node.width"
      :height="node.height"
      :rx="12"
      :ry="12"
    />
    
    <rect
      v-if="isSelected"
      class="selection-border"
      :width="node.width + 6"
      :height="node.height + 6"
      :x="-3"
      :y="-3"
      :rx="15"
      :ry="15"
    />

    <g class="node-header">
      <text class="node-icon" x="16" y="28">{{ getNodeIcon() }}</text>
      <text class="node-title" x="44" y="30">{{ node.name }}</text>
      <circle
        v-if="node.executionStatus === 'running'"
        class="status-indicator running"
        :cx="node.width - 20"
        cy="18"
        r="6"
      />
      <circle
        v-else-if="node.executionStatus === 'success'"
        class="status-indicator success"
        :cx="node.width - 20"
        cy="18"
        r="6"
      />
      <circle
        v-else-if="node.executionStatus === 'error'"
        class="status-indicator error"
        :cx="node.width - 20"
        cy="18"
        r="6"
      />
    </g>

    <line
      class="divider"
      x1="12"
      :x2="node.width - 12"
      y1="40"
      y2="40"
    />

    <g class="input-ports">
      <g
        v-for="(port, index) in node.inputs"
        :key="port.id"
        :transform="`translate(0, ${getInputPortY(index)})`"
        @mousedown.stop
      >
        <circle
          class="port input-port"
          cx="0"
          cy="0"
          r="8"
          @mouseenter="hoveredPort = { type: 'input', portId: port.id, nodeId: node.id }"
          @mouseleave="hoveredPort = null"
          @mouseup.stop="onPortMouseUp('input', port.id)"
        />
        <text class="port-label input-label" x="12" y="4">{{ port.name }}</text>
      </g>
    </g>

    <g class="output-ports">
      <g
        v-for="(port, index) in node.outputs"
        :key="port.id"
        :transform="`translate(${node.width}, ${getOutputPortY(index)})`"
        @mousedown.stop
      >
        <circle
          class="port output-port"
          cx="0"
          cy="0"
          r="8"
          @mouseenter="hoveredPort = { type: 'output', portId: port.id, nodeId: node.id }"
          @mouseleave="hoveredPort = null"
          @mousedown.stop="onOutputPortMouseDown(port.id)"
        />
        <text class="port-label output-label" x="-12" y="4" text-anchor="end">
          {{ port.name }}
        </text>
      </g>
    </g>

    <g v-if="node.executionResult" class="result-badge">
      <rect
        :x="node.width / 2 - 30"
        :y="node.height - 24"
        width="60"
        height="18"
        rx="4"
      />
      <text :x="node.width / 2" :y="node.height - 12" text-anchor="middle">
        已执行
      </text>
    </g>
  </g>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { WorkflowNode as WorkflowNodeType } from '../types';
import { nodeTemplates } from '../data/nodeTemplates';

const props = defineProps<{
  node: WorkflowNodeType;
  isSelected: boolean;
}>();

const emit = defineEmits<{
  (e: 'select', nodeId: string): void;
  (e: 'dragStart', nodeId: string, event: MouseEvent): void;
  (e: 'startConnection', nodeId: string, portId: string, event: MouseEvent): void;
  (e: 'endConnection', nodeId: string, portId: string): void;
}>();

const hoveredPort = ref<{
  type: 'input' | 'output';
  portId: string;
  nodeId: string;
} | null>(null);

const isRunning = computed(() => props.node.executionStatus === 'running');

function getNodeIcon(): string {
  const template = nodeTemplates.find(
    t => t.type === props.node.type && t.subtype === props.node.subtype
  );
  return template?.icon || '📦';
}

function getInputPortY(index: number): number {
  const startY = 60;
  const spacing = 24;
  return startY + index * spacing;
}

function getOutputPortY(index: number): number {
  const startY = 60;
  const spacing = 24;
  return startY + index * spacing;
}

function onNodeClick() {
  emit('select', props.node.id);
}

function onNodeMouseDown(event: MouseEvent) {
  if (event.button === 0) {
    emit('select', props.node.id);
    emit('dragStart', props.node.id, event);
  }
}

function onOutputPortMouseDown(portId: string) {
  const event = window.event as MouseEvent;
  emit('startConnection', props.node.id, portId, event);
}

function onPortMouseUp(portType: 'input', portId: string) {
  if (portType === 'input') {
    emit('endConnection', props.node.id, portId);
  }
}

defineExpose({
  hoveredPort
});
</script>

<style scoped>
.workflow-node {
  cursor: move;
  user-select: none;
}

.selection-border {
  fill: none;
  stroke: #89b4fa;
  stroke-width: 2;
  stroke-dasharray: 5, 5;
  opacity: 0.8;
}

.node-body {
  fill: #313244;
  stroke: #45475a;
  stroke-width: 2;
}

.workflow-node.trigger .node-body {
  fill: #1e293b;
  stroke: #38bdf8;
}

.workflow-node.action .node-body {
  fill: #1a1f2e;
  stroke: #a78bfa;
}

.workflow-node.condition .node-body {
  fill: #1a1a2e;
  stroke: #f97316;
}

.node-header .node-icon {
  font-size: 18px;
  dominant-baseline: middle;
}

.node-header .node-title {
  font-size: 14px;
  font-weight: 600;
  fill: #cdd6f4;
  dominant-baseline: middle;
}

.divider {
  stroke: #45475a;
  stroke-width: 1;
}

.port {
  fill: #45475a;
  stroke: #6c7086;
  stroke-width: 2;
  cursor: crosshair;
  transition: all 0.2s ease;
}

.port:hover {
  fill: #89b4fa;
  stroke: #89b4fa;
  r: 10;
}

.input-port {
  fill: #313244;
}

.output-port {
  fill: #313244;
}

.port-label {
  font-size: 11px;
  fill: #9399b2;
  pointer-events: none;
}

.status-indicator {
  fill: #45475a;
}

.status-indicator.running {
  fill: #f9e2af;
  animation: pulse 1s ease-in-out infinite;
}

.status-indicator.success {
  fill: #a6e3a1;
}

.status-indicator.error {
  fill: #f38ba8;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.result-badge rect {
  fill: #313244;
  stroke: #45475a;
}

.result-badge text {
  font-size: 10px;
  fill: #a6e3a1;
}

.workflow-node.running .node-body {
  filter: drop-shadow(0 0 8px rgba(249, 226, 175, 0.5));
}
</style>
