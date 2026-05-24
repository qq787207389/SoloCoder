import { v4 as uuidv4 } from 'uuid';
import type { Operation, OperationType, TableState, TableRecord, UpdateCellPayload, AddRecordPayload, DeleteRecordPayload, AddColumnPayload, ModifyColumnPayload, DeleteColumnPayload, BatchUpdatePayload, AddTablePayload } from '../store/types';

export function createOperation(type: OperationType, tableId: string, payload: unknown, userId: string, version: number): Operation {
  return {
    id: uuidv4(),
    type,
    tableId,
    payload,
    timestamp: Date.now(),
    userId,
    version,
  };
}

export function applyOperation(state: TableState, operation: Operation): TableState {
  const { type, tableId, payload } = operation;

  switch (type) {
    case 'updateCell': {
      const { recordId, columnId, newValue } = payload as UpdateCellPayload;
      return {
        ...state,
        records: {
          ...state.records,
          [tableId]: {
            ...state.records[tableId],
            [recordId]: {
              ...state.records[tableId][recordId],
              data: {
                ...state.records[tableId][recordId].data,
                [columnId]: newValue,
              },
              updatedAt: Date.now(),
            },
          },
        },
        version: state.version + 1,
      };
    }
    case 'addRecord': {
      const { record } = payload as AddRecordPayload;
      return {
        ...state,
        records: {
          ...state.records,
          [tableId]: {
            ...state.records[tableId],
            [record.id]: record,
          },
        },
        version: state.version + 1,
      };
    }
    case 'deleteRecord': {
      const { recordId } = payload as DeleteRecordPayload;
      const newRecords = { ...state.records[tableId] };
      delete newRecords[recordId];
      return {
        ...state,
        records: {
          ...state.records,
          [tableId]: newRecords,
        },
        version: state.version + 1,
      };
    }
    case 'addColumn': {
      const { column } = payload as AddColumnPayload;
      return {
        ...state,
        tables: {
          ...state.tables,
          [tableId]: {
            ...state.tables[tableId],
            columns: [...state.tables[tableId].columns, column].sort((a, b) => a.order - b.order),
          },
        },
        version: state.version + 1,
      };
    }
    case 'modifyColumn': {
      const { columnId, newColumn } = payload as ModifyColumnPayload;
      return {
        ...state,
        tables: {
          ...state.tables,
          [tableId]: {
            ...state.tables[tableId],
            columns: state.tables[tableId].columns.map((c) =>
              c.id === columnId ? newColumn : c
            ),
          },
        },
        version: state.version + 1,
      };
    }
    case 'deleteColumn': {
      const { columnId } = payload as DeleteColumnPayload;
      const tableRecords = state.records[tableId];
      const newTableRecords: { [key: string]: TableRecord } = {};
      Object.entries(tableRecords).forEach(([id, record]) => {
        const newData = { ...record.data };
        delete newData[columnId];
        newTableRecords[id] = { ...record, data: newData };
      });
      return {
        ...state,
        tables: {
          ...state.tables,
          [tableId]: {
            ...state.tables[tableId],
            columns: state.tables[tableId].columns.filter((c) => c.id !== columnId),
          },
        },
        records: {
          ...state.records,
          [tableId]: newTableRecords,
        },
        version: state.version + 1,
      };
    }
    case 'batchUpdate': {
      const { updates } = payload as BatchUpdatePayload;
      const updatedRecords = { ...state.records[tableId] };
      updates.forEach(({ recordId, columnId, value }) => {
        if (updatedRecords[recordId]) {
          updatedRecords[recordId] = {
            ...updatedRecords[recordId],
            data: {
              ...updatedRecords[recordId].data,
              [columnId]: value,
            },
            updatedAt: Date.now(),
          };
        }
      });
      return {
        ...state,
        records: {
          ...state.records,
          [tableId]: updatedRecords,
        },
        version: state.version + 1,
      };
    }
    case 'addTable': {
      const { table } = payload as AddTablePayload;
      return {
        ...state,
        tables: {
          ...state.tables,
          [table.id]: table,
        },
        records: {
          ...state.records,
          [table.id]: {},
        },
        version: state.version + 1,
      };
    }
    case 'deleteTable': {
      const newTables = { ...state.tables };
      delete newTables[tableId];
      const newRecords = { ...state.records };
      delete newRecords[tableId];
      return {
        ...state,
        tables: newTables,
        records: newRecords,
        version: state.version + 1,
      };
    }
    default:
      return state;
  }
}

export function invertOperation(operation: Operation): Operation | null {
  const { type, tableId, payload, userId, version } = operation;

  switch (type) {
    case 'updateCell': {
      const { recordId, columnId, oldValue, newValue } = payload as UpdateCellPayload;
      return {
        ...operation,
        id: uuidv4(),
        payload: { recordId, columnId, oldValue: newValue, newValue: oldValue },
        version: version + 1,
      };
    }
    case 'addRecord': {
      const { record } = payload as AddRecordPayload;
      return {
        ...operation,
        id: uuidv4(),
        type: 'deleteRecord',
        payload: { recordId: record.id, record },
        version: version + 1,
      };
    }
    case 'deleteRecord': {
      const { record } = payload as DeleteRecordPayload;
      return {
        ...operation,
        id: uuidv4(),
        type: 'addRecord',
        payload: { record },
        version: version + 1,
      };
    }
    case 'addColumn': {
      const { column } = payload as AddColumnPayload;
      return {
        ...operation,
        id: uuidv4(),
        type: 'deleteColumn',
        payload: { columnId: column.id, column },
        version: version + 1,
      };
    }
    case 'modifyColumn': {
      const { columnId, oldColumn, newColumn } = payload as ModifyColumnPayload;
      return {
        ...operation,
        id: uuidv4(),
        payload: { columnId, oldColumn: newColumn, newColumn: oldColumn },
        version: version + 1,
      };
    }
    case 'deleteColumn': {
      const { column } = payload as DeleteColumnPayload;
      return {
        ...operation,
        id: uuidv4(),
        type: 'addColumn',
        payload: { column },
        version: version + 1,
      };
    }
    case 'batchUpdate': {
      const { updates, oldValues } = payload as BatchUpdatePayload;
      return {
        ...operation,
        id: uuidv4(),
        payload: {
          updates: oldValues,
          oldValues: updates,
        },
        version: version + 1,
      };
    }
    case 'addTable': {
      const { table } = payload as AddTablePayload;
      return {
        ...operation,
        id: uuidv4(),
        type: 'deleteTable',
        version: version + 1,
      };
    }
    case 'deleteTable': {
      return {
        ...operation,
        id: uuidv4(),
        type: 'addTable',
        version: version + 1,
      };
    }
    default:
      return null;
  }
}

export function detectConflict(localOp: Operation, remoteOp: Operation): boolean {
  if (localOp.tableId !== remoteOp.tableId) return false;
  if (localOp.type !== 'updateCell' || remoteOp.type !== 'updateCell') return false;

  const localPayload = localOp.payload as UpdateCellPayload;
  const remotePayload = remoteOp.payload as UpdateCellPayload;

  return localPayload.recordId === remotePayload.recordId && localPayload.columnId === remotePayload.columnId;
}
