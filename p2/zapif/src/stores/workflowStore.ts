import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { WorkflowNode, Connection, ExecutionLog, NodeTemplate } from '../types';
import { generateId, deepClone, hasCycle } from '../utils/helpers';

export const useWorkflowStore = defineStore('workflow', () => {
  const nodes = ref<WorkflowNode[]>([]);
  const connections = ref<Connection[]>([]);
  const selectedNodeId = ref<string | null>(null);
  const selectedConnectionId = ref<string | null>(null);
  const zoom = ref(1);
  const panX = ref(0);
  const panY = ref(0);
  const isRunning = ref(false);
  const executionLogs = ref<ExecutionLog[]>([]);

  const past = ref<{ nodes: WorkflowNode[]; connections: Connection[] }[]>([]);
  const future = ref<{ nodes: WorkflowNode[]; connections: Connection[] }[]>([]);
  const MAX_HISTORY = 50;

  const selectedNode = computed(() => 
    nodes.value.find(n => n.id === selectedNodeId.value) || null
  );

  const selectedConnection = computed(() => 
    connections.value.find(c => c.id === selectedConnectionId.value) || null
  );

  const canUndo = computed(() => past.value.length > 0);
  const canRedo = computed(() => future.value.length > 0);

  function saveHistory() {
    past.value.push({
      nodes: deepClone(nodes.value),
      connections: deepClone(connections.value)
    });
    if (past.value.length > MAX_HISTORY) {
      past.value.shift();
    }
    future.value = [];
  }

  function undo() {
    if (!canUndo.value) return;
    const prev = past.value.pop()!;
    future.value.push({
      nodes: deepClone(nodes.value),
      connections: deepClone(connections.value)
    });
    nodes.value = prev.nodes;
    connections.value = prev.connections;
  }

  function redo() {
    if (!canRedo.value) return;
    const next = future.value.pop()!;
    past.value.push({
      nodes: deepClone(nodes.value),
      connections: deepClone(connections.value)
    });
    nodes.value = next.nodes;
    connections.value = next.connections;
  }

  function addNode(template: NodeTemplate, x: number, y: number) {
    saveHistory();
    const newNode: WorkflowNode = {
      id: generateId(),
      type: template.type,
      subtype: template.subtype,
      name: template.name,
      x,
      y,
      width: 200,
      height: template.type === 'condition' ? 120 : 100,
      inputs: deepClone(template.defaultInputs),
      outputs: deepClone(template.defaultOutputs),
      parameters: deepClone(template.defaultParameters),
      config: deepClone(template.defaultConfig),
      executionStatus: 'idle'
    };
    nodes.value.push(newNode);
    return newNode;
  }

  function updateNode(nodeId: string, updates: Partial<WorkflowNode>) {
    saveHistory();
    const node = nodes.value.find(n => n.id === nodeId);
    if (node) {
      Object.assign(node, updates);
    }
  }

  function deleteNode(nodeId: string) {
    saveHistory();
    nodes.value = nodes.value.filter(n => n.id !== nodeId);
    connections.value = connections.value.filter(
      c => c.sourceNodeId !== nodeId && c.targetNodeId !== nodeId
    );
    if (selectedNodeId.value === nodeId) {
      selectedNodeId.value = null;
    }
  }

  function addConnection(
    sourceNodeId: string,
    sourcePortId: string,
    targetNodeId: string,
    targetPortId: string
  ): boolean {
    const testConnections = [
      ...connections.value,
      {
        id: 'test',
        sourceNodeId,
        sourcePortId,
        targetNodeId,
        targetPortId
      }
    ];
    
    if (hasCycle(nodes.value, testConnections)) {
      return false;
    }

    const existing = connections.value.find(
      c => c.targetNodeId === targetNodeId && c.targetPortId === targetPortId
    );
    if (existing) {
      deleteConnection(existing.id);
    }

    saveHistory();
    connections.value.push({
      id: generateId(),
      sourceNodeId,
      sourcePortId,
      targetNodeId,
      targetPortId
    });
    return true;
  }

  function deleteConnection(connectionId: string) {
    saveHistory();
    connections.value = connections.value.filter(c => c.id !== connectionId);
    if (selectedConnectionId.value === connectionId) {
      selectedConnectionId.value = null;
    }
  }

  function selectNode(nodeId: string | null) {
    selectedNodeId.value = nodeId;
    selectedConnectionId.value = null;
  }

  function selectConnection(connectionId: string | null) {
    selectedConnectionId.value = connectionId;
    selectedNodeId.value = null;
  }

  function setZoom(newZoom: number) {
    zoom.value = Math.max(0.1, Math.min(3, newZoom));
  }

  function setPan(x: number, y: number) {
    panX.value = x;
    panY.value = y;
  }

  function clearSelection() {
    selectedNodeId.value = null;
    selectedConnectionId.value = null;
  }

  function resetExecution() {
    nodes.value.forEach(node => {
      node.executionStatus = 'idle';
      node.executionResult = undefined;
    });
    executionLogs.value = [];
    isRunning.value = false;
  }

  function setNodeExecutionStatus(nodeId: string, status: WorkflowNode['executionStatus'], result?: any) {
    const node = nodes.value.find(n => n.id === nodeId);
    if (node) {
      node.executionStatus = status;
      if (result !== undefined) {
        node.executionResult = result;
      }
    }
  }

  function addExecutionLog(log: ExecutionLog) {
    executionLogs.value.push(log);
  }

  function exportWorkflow(): string {
    return JSON.stringify({
      nodes: nodes.value.map(n => ({
        id: n.id,
        type: n.type,
        subtype: n.subtype,
        name: n.name,
        x: n.x,
        y: n.y,
        width: n.width,
        height: n.height,
        inputs: n.inputs,
        outputs: n.outputs,
        parameters: n.parameters,
        config: n.config
      })),
      connections: connections.value
    }, null, 2);
  }

  function importWorkflow(json: string): boolean {
    try {
      const data = JSON.parse(json);
      if (!data.nodes || !data.connections) return false;
      
      saveHistory();
      nodes.value = data.nodes.map((n: WorkflowNode) => ({
        ...n,
        executionStatus: 'idle'
      }));
      connections.value = data.connections;
      clearSelection();
      resetExecution();
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  }

  function clearWorkflow() {
    saveHistory();
    nodes.value = [];
    connections.value = [];
    clearSelection();
    resetExecution();
  }

  function getNodeById(nodeId: string): WorkflowNode | undefined {
    return nodes.value.find(n => n.id === nodeId);
  }

  function getConnectionById(connId: string): Connection | undefined {
    return connections.value.find(c => c.id === connId);
  }

  function getIncomingConnections(nodeId: string): Connection[] {
    return connections.value.filter(c => c.targetNodeId === nodeId);
  }

  function getOutgoingConnections(nodeId: string): Connection[] {
    return connections.value.filter(c => c.sourceNodeId === nodeId);
  }

  return {
    nodes,
    connections,
    selectedNodeId,
    selectedConnectionId,
    selectedNode,
    selectedConnection,
    zoom,
    panX,
    panY,
    isRunning,
    executionLogs,
    canUndo,
    canRedo,
    addNode,
    updateNode,
    deleteNode,
    addConnection,
    deleteConnection,
    selectNode,
    selectConnection,
    clearSelection,
    setZoom,
    setPan,
    undo,
    redo,
    resetExecution,
    setNodeExecutionStatus,
    addExecutionLog,
    exportWorkflow,
    importWorkflow,
    clearWorkflow,
    getNodeById,
    getConnectionById,
    getIncomingConnections,
    getOutgoingConnections
  };
});
