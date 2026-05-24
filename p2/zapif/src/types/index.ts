export type NodeType = 'trigger' | 'action' | 'condition';

export interface Port {
  id: string;
  name: string;
  type: 'input' | 'output';
  dataType: string;
}

export interface Parameter {
  id: string;
  name: string;
  type: string;
  value?: any;
  mappedFrom?: string;
  expression?: string;
}

export interface WorkflowNode {
  id: string;
  type: NodeType;
  subtype: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  inputs: Port[];
  outputs: Port[];
  parameters: Parameter[];
  config: Record<string, any>;
  executionStatus?: 'idle' | 'running' | 'success' | 'error';
  executionResult?: any;
}

export interface Connection {
  id: string;
  sourceNodeId: string;
  sourcePortId: string;
  targetNodeId: string;
  targetPortId: string;
  color?: string;
}

export interface NodeTemplate {
  type: NodeType;
  subtype: string;
  name: string;
  icon: string;
  description: string;
  defaultInputs: Port[];
  defaultOutputs: Port[];
  defaultParameters: Parameter[];
  defaultConfig: Record<string, any>;
}

export interface ExecutionLog {
  timestamp: number;
  nodeId: string;
  nodeName: string;
  status: 'start' | 'success' | 'error';
  message: string;
  data?: any;
}

export interface WorkflowState {
  nodes: WorkflowNode[];
  connections: Connection[];
  selectedNodeId: string | null;
  selectedConnectionId: string | null;
  zoom: number;
  panX: number;
  panY: number;
  history: {
    past: { nodes: WorkflowNode[]; connections: Connection[] }[];
    future: { nodes: WorkflowNode[]; connections: Connection[] }[];
  };
  isRunning: boolean;
  executionLogs: ExecutionLog[];
}

export interface Point {
  x: number;
  y: number;
}
