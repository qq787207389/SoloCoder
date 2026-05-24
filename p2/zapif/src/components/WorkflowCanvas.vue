<template>
  <div
    ref="canvasContainer"
    class="canvas-container"
    @dragover.prevent="onDragOver"
    @drop="onDrop"
    @wheel="onWheel"
    @mousedown="onCanvasMouseDown"
    @mousemove="onCanvasMouseMove"
    @mouseup="onCanvasMouseUp"
    @mouseleave="onCanvasMouseUp"
    @contextmenu.prevent
  >
    <svg ref="svgElement" class="canvas-svg">
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="#313244" />
        </pattern>
      </defs>
      
      <g :transform="`translate(${panX}, ${panY}) scale(${zoom})`">
        <rect class="grid-background" width="10000" height="10000" fill="url(#grid)" />
        
        <g class="connections-layer">
          <ConnectionLine
            v-for="conn in connections"
            :key="conn.id"
            :startPoint="getConnectionStart(conn)"
            :endPoint="getConnectionEnd(conn)"
            :is-selected="conn.id === selectedConnectionId"
            :is-animating="isConnectionAnimating(conn.id)"
            @select="selectConnection(conn.id)"
            @delete="deleteConnection(conn.id)"
          />
          
          <path
            v-if="isDrawingConnection"
            class="temp-connection"
            :d="tempConnectionPath()"
          />
        </g>
        
        <g class="nodes-layer">
          <WorkflowNode
            v-for="node in nodes"
            :ref="el => setNodeRef(node.id, el)"
            :key="node.id"
            :node="node"
            :is-selected="node.id === selectedNodeId"
            @select="selectNode(node.id)"
            @drag-start="onNodeDragStart"
            @start-connection="onStartConnection"
            @end-connection="onEndConnection"
          />
        </g>
      </g>
    </svg>

    <div class="canvas-controls">
      <button class="control-btn" @click="zoomIn" title="放大">
        +
      </button>
      <button class="control-btn" @click="zoomOut" title="缩小">
        -
      </button>
      <button class="control-btn" @click="resetView" title="重置视图">
        ⌂
      </button>
      <div class="zoom-level">{{ Math.round(zoom * 100) }}%</div>
    </div>

    <div v-if="showDropHint" class="drop-hint">
      释放以添加节点
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useWorkflowStore } from '../stores/workflowStore';
import type { NodeTemplate, Point } from '../types';
import { createBezierPath, snapToGrid } from '../utils/helpers';
import WorkflowNode from './WorkflowNode.vue';
import ConnectionLine from './ConnectionLine.vue';

const store = useWorkflowStore();
const svgElement = ref<SVGSVGElement | null>(null);
const nodeRefs = ref<Map<string, InstanceType<typeof WorkflowNode>>>(new Map());
const { nodes, connections, selectedNodeId, selectedConnectionId, zoom, panX, panY } = storeToRefs(store);
const showDropHint = ref(false);
const isPanning = ref(false);
const isDraggingNode = ref(false);
const draggingNodeId = ref<string | null>(null);
const dragStartPos = ref<Point>({ x: 0, y: 0 });
const nodeStartPos = ref<Point>({ x: 0, y: 0 });
const panStartPos = ref<Point>({ x: 0, y: 0 });
const panStartOffset = ref<Point>({ x: 0, y: 0 });
const isDrawingConnection = ref(false);
const connectionStart = ref<{
  nodeId: string;
  portId: string;
} | null>(null);
const connectionEndPos = ref<Point>({ x: 0, y: 0 });
const animatingConnections = ref<Set<string>>(new Set());

function tempConnectionPath(): string {
  const start = connectionStart.value;
  if (!start || !isDrawingConnection.value) return '';
  const startNode = store.getNodeById(start.nodeId);
  if (!startNode) return '';
  const portIndex = startNode.outputs.findIndex(p => p.id === start.portId);
  const startY = 60 + portIndex * 24;
  const startPoint = {
    x: startNode.x + startNode.width,
    y: startNode.y + startY
  };
  return createBezierPath(startPoint, connectionEndPos.value);
}
function setNodeRef(nodeId: string, el: any) {
 if (el) {
 nodeRefs.value.set(nodeId, el);
 }
 else {
 nodeRefs.value.delete(nodeId);
 }
}
function getConnectionStart(conn: any): Point {
 const sourceNode = store.getNodeById(conn.sourceNodeId);
 if (!sourceNode)
 return { x: 0, y: 0 };
 const portIndex = sourceNode.outputs.findIndex(p => p.id === conn.sourcePortId);
 const startY = 60 + (portIndex >= 0 ? portIndex : 0) * 24;
 return {
 x: sourceNode.x + sourceNode.width,
 y: sourceNode.y + startY
 };
}
function getConnectionEnd(conn: any): Point {
 const targetNode = store.getNodeById(conn.targetNodeId);
 if (!targetNode)
 return { x: 0, y: 0 };
 const portIndex = targetNode.inputs.findIndex(p => p.id === conn.targetPortId);
 const endY = 60 + (portIndex >= 0 ? portIndex : 0) * 24;
 return {
 x: targetNode.x,
 y: targetNode.y + endY
 };
}
function isConnectionAnimating(connId: string): boolean {
 return animatingConnections.value.has(connId);
}
function selectNode(nodeId: string) {
 store.selectNode(nodeId);
}
function selectConnection(connId: string) {
 store.selectConnection(connId);
}
function deleteConnection(connId: string) {
 store.deleteConnection(connId);
}
function zoomIn() {
  store.setZoom(Math.min(3, zoom.value + 0.1));
}

function zoomOut() {
  store.setZoom(Math.max(0.1, zoom.value - 0.1));
}

function resetView() {
  store.setZoom(1);
  store.setPan(0, 0);
}

function screenToCanvas(clientX: number, clientY: number): Point {
  if (!svgElement.value) return { x: 0, y: 0 };
  const rect = svgElement.value.getBoundingClientRect();
  return {
    x: (clientX - rect.left - panX.value) / zoom.value,
    y: (clientY - rect.top - panY.value) / zoom.value
  };
}
function onDragOver(event: DragEvent) {
 showDropHint.value = true;
 if (event.dataTransfer) {
 event.dataTransfer.dropEffect = 'copy';
 }
}
function onDrop(event: DragEvent) {
 showDropHint.value = false;
 const data = event.dataTransfer?.getData('application/json');
 if (!data)
 return;
 try {
 const template: NodeTemplate = JSON.parse(data);
 const pos = screenToCanvas(event.clientX, event.clientY);
 store.addNode(template, snapToGrid(pos.x - 100), snapToGrid(pos.y - 50));
 }
 catch (e) {
 console.error('Failed to parse dropped node:', e);
 }
}
function onWheel(event: WheelEvent) {
  event.preventDefault();
  const delta = event.deltaY > 0 ? -0.1 : 0.1;
  const newZoom = Math.max(0.1, Math.min(3, zoom.value + delta));
  if (event.ctrlKey || event.metaKey) {
    const mousePos = screenToCanvas(event.clientX, event.clientY);
    const zoomRatio = newZoom / zoom.value;
    store.setPan(
      panX.value - mousePos.x * (zoomRatio - 1) * zoom.value,
      panY.value - mousePos.y * (zoomRatio - 1) * zoom.value
    );
  }
  store.setZoom(newZoom);
}
function onCanvasMouseDown(event: MouseEvent) {
 if (event.button === 0) {
 store.clearSelection();
 }
 if (event.button === 1 || (event.button === 0 && event.altKey)) {
 isPanning.value = true;
 panStartPos.value = { x: event.clientX, y: event.clientY };
 panStartOffset.value = { x: panX.value, y: panY.value };
 event.preventDefault();
 }
}
function onCanvasMouseMove(event: MouseEvent) {
 if (isPanning.value) {
 const dx = event.clientX - panStartPos.value.x;
 const dy = event.clientY - panStartPos.value.y;
 store.setPan(panStartOffset.value.x + dx, panStartOffset.value.y + dy);
 return;
 }
 if (isDraggingNode.value && draggingNodeId.value) {
 const dx = (event.clientX - dragStartPos.value.x) / zoom.value;
 const dy = (event.clientY - dragStartPos.value.y) / zoom.value;
 store.updateNode(draggingNodeId.value, {
 x: snapToGrid(nodeStartPos.value.x + dx),
 y: snapToGrid(nodeStartPos.value.y + dy)
 });
 return;
 }
 if (isDrawingConnection.value) {
 const pos = screenToCanvas(event.clientX, event.clientY);
 connectionEndPos.value = pos;
 }
}
function onCanvasMouseUp() {
 isPanning.value = false;
 isDraggingNode.value = false;
 draggingNodeId.value = null;
 if (isDrawingConnection.value) {
 isDrawingConnection.value = false;
 connectionStart.value = null;
 }
}
function onNodeDragStart(nodeId: string, event: MouseEvent) {
 isDraggingNode.value = true;
 draggingNodeId.value = nodeId;
 dragStartPos.value = { x: event.clientX, y: event.clientY };
 const node = store.getNodeById(nodeId);
 if (node) {
 nodeStartPos.value = { x: node.x, y: node.y };
 }
}
function onStartConnection(nodeId: string, portId: string, event: MouseEvent) {
 isDrawingConnection.value = true;
 connectionStart.value = { nodeId, portId };
 const pos = screenToCanvas(event.clientX, event.clientY);
 connectionEndPos.value = pos;
}
function onEndConnection(nodeId: string, portId: string) {
  if (!connectionStart.value || !isDrawingConnection.value) return;
  if (connectionStart.value.nodeId === nodeId) {
    isDrawingConnection.value = false;
    connectionStart.value = null;
    return;
  }
  const success = store.addConnection(
    connectionStart.value.nodeId,
    connectionStart.value.portId,
    nodeId,
    portId
  );
  if (success) {
    const conns = connections.value;
    const newConn = conns[conns.length - 1];
    if (newConn) {
      animatingConnections.value.add(newConn.id);
      setTimeout(() => {
        animatingConnections.value.delete(newConn.id);
      }, 1000);
    }
  }
  isDrawingConnection.value = false;
  connectionStart.value = null;
}
function handleKeyDown(event: KeyboardEvent) {
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
    return;
  }
  if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
    event.preventDefault();
    if (event.shiftKey) {
      store.redo();
    } else {
      store.undo();
    }
  }
  if ((event.ctrlKey || event.metaKey) && event.key === 'y') {
    event.preventDefault();
    store.redo();
  }
  if ((event.key === 'Delete' || event.key === 'Backspace') && !event.ctrlKey && !event.metaKey) {
    if (selectedNodeId.value) {
      store.deleteNode(selectedNodeId.value);
    } else if (selectedConnectionId.value) {
      store.deleteConnection(selectedConnectionId.value);
    }
  }
  if (event.key === 'Escape') {
    store.clearSelection();
    if (isDrawingConnection.value) {
      isDrawingConnection.value = false;
      connectionStart.value = null;
    }
  }
}
onMounted(() => {
 window.addEventListener('keydown', handleKeyDown);
});
onUnmounted(() => {
 window.removeEventListener('keydown', handleKeyDown);
});
</script>

<style scoped>
.canvas-container {
  flex: 1;
  position: relative;
  background: #11111b;
  overflow: hidden;
}

.canvas-svg {
  width: 100%;
  height: 100%;
  display: block;
}

.grid-background {
  fill: #11111b;
}

.nodes-layer {
  pointer-events: all;
}

.connections-layer {
  pointer-events: all;
}

.temp-connection {
  fill: none;
  stroke: #89b4fa;
  stroke-width: 2;
  stroke-dasharray: 5, 5;
  pointer-events: none;
}

.canvas-controls {
  position: absolute;
  bottom: 68px;
  right: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  background: rgba(30, 30, 46, 0.95);
  padding: 8px;
  border-radius: 12px;
  border: 1px solid #313244;
  backdrop-filter: blur(8px);
  z-index: 10;
}

.control-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: #313244;
  color: #cdd6f4;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.control-btn:hover {
  background: #45475a;
  color: #89b4fa;
}

.zoom-level {
  font-size: 11px;
  color: #6c7086;
  min-width: 50px;
  text-align: center;
}

.drop-hint {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 20px 40px;
  background: rgba(137, 180, 250, 0.2);
  border: 2px dashed #89b4fa;
  border-radius: 12px;
  color: #89b4fa;
  font-size: 16px;
  font-weight: 500;
  pointer-events: none;
  z-index: 100;
}
</style>
