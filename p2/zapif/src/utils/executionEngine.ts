import type { WorkflowNode, Connection, ExecutionLog } from '../types';
import { topologicalSort, getValueByPath } from './helpers';

export interface ExecutionContext {
  nodeResults: Map<string, any>;
  logs: ExecutionLog[];
  onNodeStart?: (nodeId: string) => void;
  onNodeComplete?: (nodeId: string, result: any) => void;
  onNodeError?: (nodeId: string, error: Error) => void;
  onLog?: (log: ExecutionLog) => void;
}

export class WorkflowExecutionEngine {
  private nodes: WorkflowNode[];
  private connections: Connection[];
  private context: ExecutionContext;
  private abortController: AbortController | null = null;

  constructor(
    nodes: WorkflowNode[],
    connections: Connection[],
    context: Partial<ExecutionContext> = {}
  ) {
    this.nodes = nodes;
    this.connections = connections;
    this.context = {
      nodeResults: new Map(),
      logs: [],
      ...context
    };
  }

  async *execute(): AsyncGenerator<{ type: string; nodeId: string; data?: any }, void, unknown> {
    this.abortController = new AbortController();
    const sortedNodes = topologicalSort(this.nodes, this.connections);
    
    if (sortedNodes.length !== this.nodes.length) {
      const error = new Error('工作流存在循环依赖，无法执行');
      throw error;
    }

    for (const node of sortedNodes) {
      if (this.abortController.signal.aborted) {
        break;
      }

      yield { type: 'nodeStart', nodeId: node.id };
      this.context.onNodeStart?.(node.id);
      
      this.addLog({
        timestamp: Date.now(),
        nodeId: node.id,
        nodeName: node.name,
        status: 'start',
        message: `开始执行节点: ${node.name}`
      });

      try {
        await this.delay(500 + Math.random() * 500);
        
        const inputData = this.getInputData(node);
        const result = await this.executeNode(node, inputData);
        
        this.context.nodeResults.set(node.id, result);
        
        yield { type: 'nodeComplete', nodeId: node.id, data: result };
        this.context.onNodeComplete?.(node.id, result);
        
        this.addLog({
          timestamp: Date.now(),
          nodeId: node.id,
          nodeName: node.name,
          status: 'success',
          message: `节点执行成功: ${node.name}`,
          data: result
        });

      } catch (error) {
        yield { type: 'nodeError', nodeId: node.id, data: error };
        this.context.onNodeError?.(node.id, error as Error);
        
        this.addLog({
          timestamp: Date.now(),
          nodeId: node.id,
          nodeName: node.name,
          status: 'error',
          message: `节点执行失败: ${(error as Error).message}`,
          data: error
        });
        
        throw error;
      }
    }

    yield { type: 'complete', nodeId: '' };
  }

  abort() {
    if (this.abortController) {
      this.abortController.abort();
    }
  }

  private getInputData(node: WorkflowNode): Record<string, any> {
    const inputData: Record<string, any> = {};
    
    for (const param of node.parameters) {
      if (param.mappedFrom) {
        const match = param.mappedFrom.match(/\{\{\s*([^.]+)\.(.+?)\s*\}\}/);
        if (match) {
          const [, nodeName, fieldPath] = match;
          const sourceNode = this.nodes.find(n => n.name === nodeName || n.id === nodeName);
          if (sourceNode) {
            const sourceResult = this.context.nodeResults.get(sourceNode.id);
            if (sourceResult) {
              inputData[param.id] = getValueByPath(sourceResult, fieldPath);
            }
          }
        }
      } else {
        inputData[param.id] = param.value;
      }
    }
    
    return inputData;
  }

  private async executeNode(node: WorkflowNode, inputData: Record<string, any>): Promise<any> {
    switch (node.subtype) {
      case 'scheduler':
        return {
          timestamp: Date.now(),
          interval: inputData.interval || '1h',
          triggeredAt: new Date().toISOString()
        };

      case 'webhook':
        return {
          method: inputData.method || 'POST',
          path: inputData.path || '/webhook',
          body: {
            email: 'user@example.com',
            name: '张三',
            data: { value: 42 }
          },
          headers: { 'content-type': 'application/json' },
          receivedAt: new Date().toISOString()
        };

      case 'file_created':
        return {
          filename: 'report.pdf',
          path: inputData.directory || '/docs/report.pdf',
          size: 1024000,
          created: new Date().toISOString()
        };

      case 'send_email':
        return {
          sent: true,
          to: inputData.to || 'recipient@example.com',
          subject: inputData.subject || 'Test Email',
          messageId: `msg_${Date.now()}`
        };

      case 'write_sheet':
        return {
          updated: true,
          sheetId: inputData.sheetId || 'sheet_123',
          range: inputData.range || 'A1',
          rowsWritten: 5
        };

      case 'http_request':
        return {
          status: 200,
          url: inputData.url || 'https://api.example.com',
          method: inputData.method || 'GET',
          data: { success: true, message: 'Request completed' },
          duration: 123
        };

      case 'slack_message':
        return {
          ok: true,
          channel: inputData.channel || '#general',
          ts: Date.now().toString()
        };

      case 'transform':
        try {
          const transformFn = new Function('input', `
            ${inputData.expression || 'return input;'}
          `);
          const result = transformFn(inputData);
          return { result, transformed: true };
        } catch (e) {
          return { result: inputData, error: (e as Error).message };
        }

      case 'if_else':
        const fieldValue = inputData.field || '';
        const operator = inputData.operator || '==';
        const compareValue = inputData.value || '';
        
        let conditionMet = false;
        switch (operator) {
          case '==':
            conditionMet = String(fieldValue) === String(compareValue);
            break;
          case '!=':
            conditionMet = String(fieldValue) !== String(compareValue);
            break;
          case '>':
            conditionMet = Number(fieldValue) > Number(compareValue);
            break;
          case '<':
            conditionMet = Number(fieldValue) < Number(compareValue);
            break;
          case '>=':
            conditionMet = Number(fieldValue) >= Number(compareValue);
            break;
          case '<=':
            conditionMet = Number(fieldValue) <= Number(compareValue);
            break;
          case 'contains':
            conditionMet = String(fieldValue).includes(String(compareValue));
            break;
          case 'startsWith':
            conditionMet = String(fieldValue).startsWith(String(compareValue));
            break;
          case 'endsWith':
            conditionMet = String(fieldValue).endsWith(String(compareValue));
            break;
        }
        
        return {
          conditionMet,
          field: fieldValue,
          operator,
          compareValue,
          branch: conditionMet ? 'true' : 'false'
        };

      default:
        return { executed: true, input: inputData };
    }
  }

  private addLog(log: ExecutionLog) {
    this.context.logs.push(log);
    this.context.onLog?.(log);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getLogs(): ExecutionLog[] {
    return this.context.logs;
  }

  getResults(): Map<string, any> {
    return this.context.nodeResults;
  }
}
