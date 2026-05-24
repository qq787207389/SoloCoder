<template>
  <div class="toolbar">
    <div class="toolbar-left">
      <h1 class="app-title">⚡ Zapif Flow</h1>
      <span class="app-subtitle">工作流编辑器</span>
    </div>
    
    <div class="toolbar-center">
      <button 
        class="tool-btn" 
        @click="undo" 
        :disabled="!canUndo"
        title="撤销 (Ctrl+Z)"
      >
        ↩️ 撤销
      </button>
      <button 
        class="tool-btn" 
        @click="redo" 
        :disabled="!canRedo"
        title="重做 (Ctrl+Y)"
      >
        ↪️ 重做
      </button>
      <div class="divider"></div>
      <button class="tool-btn" @click="exportWorkflow" title="导出 JSON">
        📤 导出
      </button>
      <label class="tool-btn file-label" title="导入 JSON">
        📥 导入
        <input type="file" accept=".json" @change="importWorkflow" hidden />
      </label>
      <button class="tool-btn danger" @click="clearWorkflow" title="清空画布">
        🗑️ 清空
      </button>
    </div>

    <div class="toolbar-right">
      <button 
        v-if="!isRunning"
        class="run-btn" 
        @click="startExecution"
        :disabled="nodes.length === 0"
      >
        ▶️ 测试运行
      </button>
      <button 
        v-else
        class="run-btn running" 
        @click="stopExecution"
      >
        ⏹️ 停止
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useWorkflowStore } from '../stores/workflowStore';
import { WorkflowExecutionEngine } from '../utils/executionEngine';

const store = useWorkflowStore();
const { canUndo, canRedo, nodes, isRunning } = storeToRefs(store);

const engine = ref<WorkflowExecutionEngine | null>(null);

function undo() {
  store.undo();
}

function redo() {
  store.redo();
}

function exportWorkflow() {
  const json = store.exportWorkflow();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `workflow-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importWorkflow(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target?.result as string;
    const success = store.importWorkflow(content);
    if (!success) {
      alert('导入失败：无效的工作流文件');
    }
  };
  reader.readAsText(file);
  input.value = '';
}

function clearWorkflow() {
  if (confirm('确定要清空所有节点和连线吗？此操作可以撤销。')) {
    store.clearWorkflow();
  }
}

async function startExecution() {
  if (nodes.value.length === 0) return;
  
  store.resetExecution();
  store.isRunning = true;
  
  engine.value = new WorkflowExecutionEngine(
    JSON.parse(JSON.stringify(nodes.value)),
    JSON.parse(JSON.stringify(store.connections)),
    {
      onLog: (log) => {
        store.addExecutionLog(log);
      }
    }
  );

  try {
    for await (const event of engine.value.execute()) {
      if (!store.isRunning) break;
      
      switch (event.type) {
        case 'nodeStart':
          store.setNodeExecutionStatus(event.nodeId, 'running');
          break;
        case 'nodeComplete':
          store.setNodeExecutionStatus(event.nodeId, 'success', event.data);
          break;
        case 'nodeError':
          store.setNodeExecutionStatus(event.nodeId, 'error', event.data);
          break;
        case 'complete':
          store.isRunning = false;
          break;
      }
    }
  } catch (error) {
    console.error('Execution error:', error);
    store.isRunning = false;
  } finally {
    engine.value = null;
  }
}

function stopExecution() {
  if (engine.value) {
    engine.value.abort();
  }
  store.isRunning = false;
}
</script>

<style scoped>
.toolbar {
  height: 56px;
  background: #1e1e2e;
  border-bottom: 1px solid #313244;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  gap: 16px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.app-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #cdd6f4;
}

.app-subtitle {
  font-size: 12px;
  color: #6c7086;
}

.toolbar-center {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tool-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: #313244;
  border: 1px solid #45475a;
  border-radius: 8px;
  color: #cdd6f4;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tool-btn:hover:not(:disabled) {
  background: #45475a;
  border-color: #585b70;
}

.tool-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tool-btn.danger {
  background: rgba(243, 139, 168, 0.1);
  border-color: rgba(243, 139, 168, 0.3);
  color: #f38ba8;
}

.tool-btn.danger:hover:not(:disabled) {
  background: rgba(243, 139, 168, 0.2);
  border-color: #f38ba8;
}

.file-label {
  cursor: pointer;
}

.divider {
  width: 1px;
  height: 24px;
  background: #45475a;
  margin: 0 8px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.run-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #a6e3a1 0%, #89b4fa 100%);
  border: none;
  border-radius: 10px;
  color: #1e1e2e;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.run-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(166, 227, 161, 0.3);
}

.run-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.run-btn.running {
  background: linear-gradient(135deg, #f38ba8 0%, #f9e2af 100%);
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(243, 139, 168, 0.4);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(243, 139, 168, 0);
  }
}
</style>
