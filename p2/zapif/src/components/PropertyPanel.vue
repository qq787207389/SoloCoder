<template>
  <div class="property-panel">
    <div class="panel-header">
      <h3>属性配置</h3>
    </div>

    <div v-if="!selectedNode" class="empty-state">
      <div class="empty-icon">📋</div>
      <p>选择一个节点查看属性</p>
    </div>

    <div v-else class="property-content">
      <div class="node-info">
        <span class="node-icon">{{ getNodeIcon() }}</span>
        <div class="node-details">
          <input
            v-model="nodeName"
            class="node-name-input"
            @blur="updateName"
            @keyup.enter="updateName"
          />
          <span class="node-type">{{ getNodeTypeLabel() }}</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">参数配置</div>
        <div class="params-list">
          <div
            v-for="param in selectedNode.parameters"
            :key="param.id"
            class="param-item"
          >
            <label class="param-label">{{ param.name }}</label>
            <div class="param-input-wrapper">
              <select
                v-if="param.type === 'select'"
                v-model="param.value"
                @change="updateParams"
              >
                <option v-for="opt in getSelectOptions(param.id)" :key="opt" :value="opt">
                  {{ opt }}
                </option>
              </select>
              <textarea
                v-else-if="param.type === 'text' || param.type === 'code'"
                v-model="param.value"
                :rows="param.type === 'code' ? 4 : 2"
                @blur="updateParams"
              ></textarea>
              <input
                v-else
                v-model="param.value"
                type="text"
                @blur="updateParams"
              />
              <button
                v-if="canMapParam(param.id)"
                class="map-btn"
                @click="toggleMapping(param.id)"
                :class="{ active: param.mappedFrom }"
                title="映射前序节点数据"
              >
                🔗
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="showMapping" class="section mapping-section">
        <div class="section-title">
          数据映射
          <button class="close-btn" @click="showMapping = false">✕</button>
        </div>
        <div class="mapping-tree">
          <div v-if="precedingNodes.length === 0" class="no-data">
            暂无可用的前序节点数据
          </div>
          <div
            v-for="node in precedingNodes"
            :key="node.id"
            class="node-tree-item"
          >
            <div class="tree-node-header" @click="toggleNodeExpand(node.id)">
              <span class="expand-icon">{{ expandedNodes.has(node.id) ? '▼' : '▶' }}</span>
              <span class="tree-icon">{{ getNodeIconForNode(node) }}</span>
              <span class="tree-name">{{ node.name }}</span>
            </div>
            <div v-if="expandedNodes.has(node.id)" class="tree-children">
              <div
                v-for="(value, key) in getMockNodeOutput(node)"
                :key="key"
                class="field-item"
                @click="selectField(node.id, key)"
              >
                <span class="field-key">{{ key }}</span>
                <span class="field-value">{{ formatValue(value) }}</span>
              </div>
            </div>
          </div>
        </div>
        <div v-if="selectedMappingParam" class="mapping-result">
          <div class="mapping-label">映射路径：</div>
          <div class="mapping-path">{{ selectedMappingParam.mappedFrom || '未选择' }}</div>
          <button v-if="selectedMappingParam.mappedFrom" class="clear-mapping-btn" @click="clearMapping">
            清除映射
          </button>
        </div>
      </div>

      <div class="section">
        <div class="section-title">节点信息</div>
        <div class="info-list">
          <div class="info-item">
            <span class="info-label">ID</span>
            <span class="info-value">{{ selectedNode.id }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">位置</span>
            <span class="info-value">X: {{ selectedNode.x }}, Y: {{ selectedNode.y }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">输入端口</span>
            <span class="info-value">{{ selectedNode.inputs.length }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">输出端口</span>
            <span class="info-value">{{ selectedNode.outputs.length }}</span>
          </div>
        </div>
      </div>

      <div class="actions">
        <button class="delete-btn" @click="deleteNode">
          🗑️ 删除节点
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useWorkflowStore } from '../stores/workflowStore';
import { nodeTemplates } from '../data/nodeTemplates';
import type { WorkflowNode, Parameter } from '../types';

const store = useWorkflowStore();
const { selectedNode } = storeToRefs(store);

const nodeName = ref('');
const showMapping = ref(false);
const mappingParamId = ref<string | null>(null);
const expandedNodes = ref<Set<string>>(new Set());

watch(() => store.selectedNode, (node) => {
  if (node) {
    nodeName.value = node.name;
  }
}, { immediate: true });

const selectedMappingParam = computed<Parameter | undefined>(() => {
  if (!selectedNode.value || !mappingParamId.value) return undefined;
  return selectedNode.value.parameters.find((p: Parameter) => p.id === mappingParamId.value);
});

const precedingNodes = computed(() => {
  if (!selectedNode.value) return [];
  const result: WorkflowNode[] = [];
  const visited = new Set<string>();
  
  function traverse(nodeId: string) {
    const incoming = store.getIncomingConnections(nodeId);
    for (const conn of incoming) {
      if (!visited.has(conn.sourceNodeId)) {
        visited.add(conn.sourceNodeId);
        const sourceNode = store.getNodeById(conn.sourceNodeId);
        if (sourceNode) {
          result.push(sourceNode);
          traverse(conn.sourceNodeId);
        }
      }
    }
  }
  
  if (selectedNode.value) {
    traverse(selectedNode.value.id);
  }
  return result;
});

function getNodeIcon(): string {
  const node = selectedNode.value;
  if (!node) return '📦';
  const template = nodeTemplates.find(
    t => t.type === node.type && t.subtype === node.subtype
  );
  return template?.icon || '📦';
}

function getNodeIconForNode(node: WorkflowNode): string {
  const template = nodeTemplates.find(
    t => t.type === node.type && t.subtype === node.subtype
  );
  return template?.icon || '📦';
}

function getNodeTypeLabel(): string {
  const node = selectedNode.value;
  if (!node) return '';
  const labels: Record<string, string> = {
    trigger: '触发器',
    action: '动作',
    condition: '条件分支'
  };
  return labels[node.type] || node.type;
}

function getSelectOptions(_paramId: string): string[] {
  const options: Record<string, string[]> = {
    interval: ['1m', '5m', '15m', '30m', '1h', '2h', '6h', '12h', '1d'],
    method: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    operator: ['==', '!=', '>', '<', '>=', '<=', 'contains', 'startsWith', 'endsWith']
  };
  return options[_paramId] || [];
}

function canMapParam(_paramId: string): boolean {
  const node = selectedNode.value;
  if (!node) return false;
  return node.type !== 'trigger';
}

function toggleMapping(paramId: string) {
  mappingParamId.value = paramId;
  showMapping.value = !showMapping.value;
}

function toggleNodeExpand(nodeId: string) {
  if (expandedNodes.value.has(nodeId)) {
    expandedNodes.value.delete(nodeId);
  } else {
    expandedNodes.value.add(nodeId);
  }
}

function getMockNodeOutput(node: WorkflowNode): Record<string, any> {
  const mockOutputs: Record<string, Record<string, any>> = {
    scheduler: { timestamp: Date.now(), interval: '1h' },
    webhook: { 
      body: { email: 'user@example.com', name: '张三', data: { value: 42 } },
      headers: { 'content-type': 'application/json' },
      method: 'POST'
    },
    file_created: { filename: 'report.pdf', path: '/docs/report.pdf', size: 1024000 },
    send_email: { sent: true, messageId: 'msg_123' },
    write_sheet: { updated: true, range: 'A1:C10' },
    http_request: { status: 200, data: { success: true } },
    slack_message: { ok: true, ts: '1234567890' },
    transform: { result: 'transformed data' }
  };
  return mockOutputs[node.subtype] || { output: 'data' };
}

function formatValue(value: any): string {
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}

function selectField(nodeId: string, fieldPath: string) {
  const node = selectedNode.value;
  if (!node || !mappingParamId.value) return;
  
  const param = node.parameters.find((p: Parameter) => p.id === mappingParamId.value);
  if (param) {
    const sourceNode = store.getNodeById(nodeId);
    const fullPath = `{{ ${sourceNode?.name || nodeId}.${fieldPath} }}`;
    param.mappedFrom = fullPath;
    param.value = fullPath;
    updateParams();
  }
}

function clearMapping() {
  const node = selectedNode.value;
  if (!node || !mappingParamId.value) return;
  
  const param = node.parameters.find((p: Parameter) => p.id === mappingParamId.value);
  if (param) {
    param.mappedFrom = undefined;
    param.value = '';
    updateParams();
  }
}

function updateName() {
  const node = selectedNode.value;
  if (node && nodeName.value) {
    store.updateNode(node.id, { name: nodeName.value });
  }
}

function updateParams() {
  const node = selectedNode.value;
  if (node) {
    store.updateNode(node.id, {
      parameters: [...node.parameters]
    });
  }
}

function deleteNode() {
  const node = selectedNode.value;
  if (node && confirm('确定要删除此节点吗？')) {
    store.deleteNode(node.id);
  }
}
</script>

<style scoped>
.property-panel {
  width: 300px;
  background: #1e1e2e;
  border-left: 1px solid #313244;
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

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #6c7086;
  padding: 40px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.property-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.node-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #313244;
  border-radius: 8px;
  margin-bottom: 16px;
}

.node-icon {
  font-size: 28px;
}

.node-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.node-name-input {
  background: transparent;
  border: none;
  border-bottom: 1px solid transparent;
  color: #cdd6f4;
  font-size: 14px;
  font-weight: 600;
  padding: 2px 0;
  outline: none;
  transition: border-color 0.2s;
}

.node-name-input:hover,
.node-name-input:focus {
  border-bottom-color: #89b4fa;
}

.node-type {
  font-size: 11px;
  color: #6c7086;
}

.section {
  margin-bottom: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 600;
  color: #6c7086;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}

.close-btn {
  background: none;
  border: none;
  color: #6c7086;
  cursor: pointer;
  font-size: 14px;
  padding: 2px 6px;
  border-radius: 4px;
}

.close-btn:hover {
  background: #45475a;
  color: #cdd6f4;
}

.params-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.param-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.param-label {
  font-size: 12px;
  color: #9399b2;
}

.param-input-wrapper {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.param-input-wrapper input,
.param-input-wrapper select,
.param-input-wrapper textarea {
  flex: 1;
  padding: 8px 12px;
  background: #313244;
  border: 1px solid #45475a;
  border-radius: 6px;
  color: #cdd6f4;
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s;
}

.param-input-wrapper input:focus,
.param-input-wrapper select:focus,
.param-input-wrapper textarea:focus {
  border-color: #89b4fa;
}

.param-input-wrapper textarea {
  resize: vertical;
  font-family: monospace;
}

.map-btn {
  padding: 8px 10px;
  background: #313244;
  border: 1px solid #45475a;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.map-btn:hover {
  background: #45475a;
  border-color: #89b4fa;
}

.map-btn.active {
  background: rgba(137, 180, 250, 0.2);
  border-color: #89b4fa;
}

.mapping-section {
  background: #181825;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #313244;
}

.mapping-tree {
  max-height: 200px;
  overflow-y: auto;
}

.no-data {
  padding: 16px;
  text-align: center;
  color: #6c7086;
  font-size: 12px;
}

.node-tree-item {
  margin-bottom: 4px;
}

.tree-node-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  color: #cdd6f4;
}

.tree-node-header:hover {
  background: #313244;
}

.expand-icon {
  font-size: 10px;
  color: #6c7086;
}

.tree-icon {
  font-size: 14px;
}

.tree-name {
  flex: 1;
}

.tree-children {
  padding-left: 20px;
  margin-top: 4px;
}

.field-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
}

.field-item:hover {
  background: rgba(137, 180, 250, 0.2);
}

.field-key {
  color: #89dceb;
}

.field-value {
  color: #a6adc8;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mapping-result {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #313244;
}

.mapping-label {
  font-size: 11px;
  color: #6c7086;
  margin-bottom: 4px;
}

.mapping-path {
  font-family: monospace;
  font-size: 11px;
  color: #a6e3a1;
  background: #1e1e2e;
  padding: 6px 8px;
  border-radius: 4px;
  word-break: break-all;
}

.clear-mapping-btn {
  margin-top: 8px;
  padding: 4px 10px;
  background: #313244;
  border: 1px solid #45475a;
  border-radius: 4px;
  color: #f38ba8;
  font-size: 11px;
  cursor: pointer;
}

.clear-mapping-btn:hover {
  background: #45475a;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #313244;
  border-radius: 6px;
}

.info-label {
  font-size: 12px;
  color: #6c7086;
}

.info-value {
  font-size: 12px;
  color: #cdd6f4;
  font-family: monospace;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.actions {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #313244;
}

.delete-btn {
  width: 100%;
  padding: 10px;
  background: rgba(243, 139, 168, 0.1);
  border: 1px solid #f38ba8;
  border-radius: 8px;
  color: #f38ba8;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.delete-btn:hover {
  background: rgba(243, 139, 168, 0.2);
}
</style>
