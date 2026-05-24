import type { WorkflowNode, Connection, Point } from '../types';

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function hasCycle(nodes: WorkflowNode[], connections: Connection[]): boolean {
  const visited = new Set<string>();
  const recStack = new Set<string>();

  function dfs(nodeId: string): boolean {
    visited.add(nodeId);
    recStack.add(nodeId);

    const outgoingConnections = connections.filter(c => c.sourceNodeId === nodeId);
    for (const conn of outgoingConnections) {
      if (!visited.has(conn.targetNodeId)) {
        if (dfs(conn.targetNodeId)) return true;
      } else if (recStack.has(conn.targetNodeId)) {
        return true;
      }
    }

    recStack.delete(nodeId);
    return false;
  }

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      if (dfs(node.id)) return true;
    }
  }

  return false;
}

export function topologicalSort(nodes: WorkflowNode[], connections: Connection[]): WorkflowNode[] {
  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();

  nodes.forEach(node => {
    inDegree.set(node.id, 0);
    adjacency.set(node.id, []);
  });

  connections.forEach(conn => {
    inDegree.set(conn.targetNodeId, (inDegree.get(conn.targetNodeId) || 0) + 1);
    adjacency.get(conn.sourceNodeId)?.push(conn.targetNodeId);
  });

  const queue: string[] = [];
  inDegree.forEach((degree, nodeId) => {
    if (degree === 0) queue.push(nodeId);
  });

  const result: WorkflowNode[] = [];
  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    const node = nodes.find(n => n.id === nodeId);
    if (node) result.push(node);

    adjacency.get(nodeId)?.forEach(neighbor => {
      const newDegree = (inDegree.get(neighbor) || 1) - 1;
      inDegree.set(neighbor, newDegree);
      if (newDegree === 0) queue.push(neighbor);
    });
  }

  return result;
}

export function getNodeOutputData(
  node: WorkflowNode,
  _portId: string,
  _connections: Connection[],
  nodeResults: Map<string, any>
): any {
  return nodeResults.get(node.id);
}

export function evaluateExpression(expression: string, context: Record<string, any>): any {
  try {
    const fn = new Function(...Object.keys(context), `return ${expression}`);
    return fn(...Object.values(context));
  } catch (e) {
    console.error('Expression evaluation error:', e);
    return null;
  }
}

export function getValueByPath(obj: any, path: string): any {
  if (!path) return obj;
  const keys = path.split('.');
  let result = obj;
  for (const key of keys) {
    if (result == null) return undefined;
    result = result[key];
  }
  return result;
}

export function createBezierPath(start: Point, end: Point): string {
  const dx = Math.abs(end.x - start.x);
  const controlOffset = Math.max(50, dx * 0.5);
  
  const cp1x = start.x + controlOffset;
  const cp1y = start.y;
  const cp2x = end.x - controlOffset;
  const cp2y = end.y;

  return `M ${start.x} ${start.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${end.x} ${end.y}`;
}

export function snapToGrid(value: number, gridSize: number = 10): number {
  return Math.round(value / gridSize) * gridSize;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
