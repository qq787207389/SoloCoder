<template>
  <g :class="['connection-line', { selected: isSelected }]">
    <path
      class="connection-path-bg"
      :d="pathData"
      @click.stop="onClick"
    />
    <path
      class="connection-path"
      :d="pathData"
      @click.stop="onClick"
    />
    <path
      v-if="isAnimating"
      class="connection-flow"
      :d="pathData"
    />
    <circle
      v-if="isSelected"
      class="connection-handle"
      :cx="startPoint.x"
      :cy="startPoint.y"
      r="6"
    />
    <circle
      v-if="isSelected"
      class="connection-handle"
      :cx="endPoint.x"
      :cy="endPoint.y"
      r="6"
    />
    <path
      v-if="isSelected"
      class="delete-btn-bg"
      :d="deleteBtnPath"
      @click.stop="onDelete"
    />
    <text
      v-if="isSelected"
      class="delete-btn-text"
      :x="midPoint.x"
      :y="midPoint.y + 4"
      text-anchor="middle"
      @click.stop="onDelete"
    >
      ✕
    </text>
  </g>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { createBezierPath } from '../utils/helpers';
import type { Point } from '../types';

const props = defineProps<{
  startPoint: Point;
  endPoint: Point;
  isSelected?: boolean;
  isAnimating?: boolean;
}>();

const emit = defineEmits<{
  (e: 'select'): void;
  (e: 'delete'): void;
}>();

const pathData = computed(() => 
  createBezierPath(props.startPoint, props.endPoint)
);

const midPoint = computed(() => ({
  x: (props.startPoint.x + props.endPoint.x) / 2,
  y: (props.startPoint.y + props.endPoint.y) / 2
}));

const deleteBtnPath = computed(() => {
  const cx = midPoint.value.x;
  const cy = midPoint.value.y;
  const r = 12;
  return `M ${cx - r} ${cy} a ${r} ${r} 0 1 0 ${r * 2} 0 a ${r} ${r} 0 1 0 ${-r * 2} 0`;
});

function onClick() {
  emit('select');
}

function onDelete() {
  emit('delete');
}
</script>

<style scoped>
.connection-path-bg {
  fill: none;
  stroke: transparent;
  stroke-width: 20;
  cursor: pointer;
}

.connection-path {
  fill: none;
  stroke: #585b70;
  stroke-width: 2;
  cursor: pointer;
  transition: stroke 0.2s ease;
}

.connection-line:hover .connection-path {
  stroke: #89b4fa;
}

.connection-line.selected .connection-path {
  stroke: #89b4fa;
  stroke-width: 3;
}

.connection-flow {
  fill: none;
  stroke: #a6e3a1;
  stroke-width: 3;
  stroke-dasharray: 8, 8;
  animation: flowAnimation 1s linear infinite;
}

@keyframes flowAnimation {
  from {
    stroke-dashoffset: 16;
  }
  to {
    stroke-dashoffset: 0;
  }
}

.connection-handle {
  fill: #89b4fa;
  stroke: #fff;
  stroke-width: 2;
}

.delete-btn-bg {
  fill: #f38ba8;
  stroke: #fff;
  stroke-width: 2;
  cursor: pointer;
  opacity: 0.9;
}

.delete-btn-bg:hover {
  fill: #eba0ac;
}

.delete-btn-text {
  font-size: 12px;
  font-weight: bold;
  fill: #fff;
  cursor: pointer;
  pointer-events: none;
}
</style>
