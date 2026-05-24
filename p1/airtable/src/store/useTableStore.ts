import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { TableState, Operation, ViewState, Filter, Column, Table, TableRecord, EditingCell } from './types';
import { createMockTables, createMockRecords, initialTableId, mockUsers } from '../data/mockData';
import { createOperation, applyOperation, invertOperation } from '../utils/operations';

interface TableActions {
  updateCell: (tableId: string, recordId: string, columnId: string, newValue: unknown) => void;
  addRecord: (tableId: string, data?: { [key: string]: unknown }) => void;
  deleteRecord: (tableId: string, recordId: string) => void;
  addColumn: (tableId: string, column: Omit<Column, 'id'>) => void;
  modifyColumn: (tableId: string, columnId: string, updates: Partial<Column>) => void;
  deleteColumn: (tableId: string, columnId: string) => void;
  batchUpdate: (tableId: string, updates: { recordId: string; columnId: string; value: unknown }[]) => void;
  setCurrentTable: (tableId: string) => void;
  setViewType: (type: 'table' | 'card') => void;
  setSort: (columnId: string | undefined, direction?: 'asc' | 'desc') => void;
  addFilter: (columnId: string, operator: Filter['operator'], value: unknown) => void;
  removeFilter: (filterId: string) => void;
  setGroupBy: (columnId: string | undefined) => void;
  undo: () => void;
  redo: () => void;
  addTable: (name: string) => void;
  setEditingCell: (tableId: string, recordId: string, columnId: string | null) => void;
  receiveRemoteOperation: (operation: Operation) => void;
}

const tables = createMockTables();
const records = createMockRecords();

const initialState: TableState = {
  tables,
  records,
  currentTableId: initialTableId,
  currentView: { type: 'table' },
  version: 0,
  history: {
    past: [],
    future: [],
  },
  collaboration: {
    users: mockUsers,
    editingCells: [],
  },
  currentUserId: mockUsers[0].id,
};

export const useTableStore = create<TableState & TableActions>((set, get) => ({
  ...initialState,

  updateCell: (tableId: string, recordId: string, columnId: string, newValue: unknown) => {
    const state = get();
    const oldValue = state.records[tableId]?.[recordId]?.data[columnId];
    
    if (oldValue === newValue) return;

    const operation = createOperation(
      'updateCell',
      tableId,
      { recordId, columnId, oldValue, newValue },
      state.currentUserId,
      state.version
    );

    set((state) => ({
      ...applyOperation(state, operation),
      history: {
        past: [...state.history.past, operation],
        future: [],
      },
    }));

    broadcastOperation(operation);
  },

  addRecord: (tableId: string, data: { [key: string]: unknown } = {}) => {
    const state = get();
    const now = Date.now();
    const record: TableRecord = {
      id: uuidv4(),
      tableId,
      data,
      createdAt: now,
      updatedAt: now,
    };

    const operation = createOperation(
      'addRecord',
      tableId,
      { record },
      state.currentUserId,
      state.version
    );

    set((state) => ({
      ...applyOperation(state, operation),
      history: {
        past: [...state.history.past, operation],
        future: [],
      },
    }));

    broadcastOperation(operation);
  },

  deleteRecord: (tableId: string, recordId: string) => {
    const state = get();
    const record = state.records[tableId]?.[recordId];
    if (!record) return;

    const operation = createOperation(
      'deleteRecord',
      tableId,
      { recordId, record },
      state.currentUserId,
      state.version
    );

    set((state) => ({
      ...applyOperation(state, operation),
      history: {
        past: [...state.history.past, operation],
        future: [],
      },
    }));

    broadcastOperation(operation);
  },

  addColumn: (tableId: string, column: Omit<Column, 'id'>) => {
    const state = get();
    const newColumn: Column = { ...column, id: uuidv4() };

    const operation = createOperation(
      'addColumn',
      tableId,
      { column: newColumn },
      state.currentUserId,
      state.version
    );

    set((state) => ({
      ...applyOperation(state, operation),
      history: {
        past: [...state.history.past, operation],
        future: [],
      },
    }));

    broadcastOperation(operation);
  },

  modifyColumn: (tableId: string, columnId: string, updates: Partial<Column>) => {
    const state = get();
    const oldColumn = state.tables[tableId]?.columns.find((c) => c.id === columnId);
    if (!oldColumn) return;

    const newColumn = { ...oldColumn, ...updates };

    const operation = createOperation(
      'modifyColumn',
      tableId,
      { columnId, oldColumn, newColumn },
      state.currentUserId,
      state.version
    );

    set((state) => ({
      ...applyOperation(state, operation),
      history: {
        past: [...state.history.past, operation],
        future: [],
      },
    }));

    broadcastOperation(operation);
  },

  deleteColumn: (tableId: string, columnId: string) => {
    const state = get();
    const column = state.tables[tableId]?.columns.find((c) => c.id === columnId);
    if (!column) return;

    const operation = createOperation(
      'deleteColumn',
      tableId,
      { columnId, column },
      state.currentUserId,
      state.version
    );

    set((state) => ({
      ...applyOperation(state, operation),
      history: {
        past: [...state.history.past, operation],
        future: [],
      },
    }));

    broadcastOperation(operation);
  },

  batchUpdate: (tableId: string, updates: { recordId: string; columnId: string; value: unknown }[]) => {
    const state = get();
    const oldValues = updates.map(({ recordId, columnId }) => ({
      recordId,
      columnId,
      value: state.records[tableId]?.[recordId]?.data[columnId],
    }));

    const operation = createOperation(
      'batchUpdate',
      tableId,
      { updates, oldValues },
      state.currentUserId,
      state.version
    );

    set((state) => ({
      ...applyOperation(state, operation),
      history: {
        past: [...state.history.past, operation],
        future: [],
      },
    }));

    broadcastOperation(operation);
  },

  setCurrentTable: (tableId: string) => {
    set({ currentTableId: tableId });
  },

  setViewType: (type: 'table' | 'card') => {
    set((state) => ({
      currentView: { ...state.currentView, type },
    }));
  },

  setSort: (columnId: string | undefined, direction?: 'asc' | 'desc') => {
    set((state) => ({
      currentView: {
        ...state.currentView,
        sortBy: columnId ? { columnId, direction: direction || 'asc' } : undefined,
      },
    }));
  },

  addFilter: (columnId: string, operator: Filter['operator'], value: unknown) => {
    const newFilter: Filter = {
      id: uuidv4(),
      columnId,
      operator,
      value,
    };
    set((state) => ({
      currentView: {
        ...state.currentView,
        filters: [...(state.currentView.filters || []), newFilter],
      },
    }));
  },

  removeFilter: (filterId: string) => {
    set((state) => ({
      currentView: {
        ...state.currentView,
        filters: state.currentView.filters?.filter((f) => f.id !== filterId),
      },
    }));
  },

  setGroupBy: (columnId: string | undefined) => {
    set((state) => ({
      currentView: {
        ...state.currentView,
        groupBy: columnId,
      },
    }));
  },

  undo: () => {
    const state = get();
    const past = state.history.past;
    if (past.length === 0) return;

    const lastOperation = past[past.length - 1];
    const inverted = invertOperation(lastOperation);
    if (!inverted) return;

    set((state) => ({
      ...applyOperation(state, inverted),
      history: {
        past: state.history.past.slice(0, -1),
        future: [lastOperation, ...state.history.future],
      },
    }));

    broadcastOperation(inverted);
  },

  redo: () => {
    const state = get();
    const future = state.history.future;
    if (future.length === 0) return;

    const nextOperation = future[0];

    set((state) => ({
      ...applyOperation(state, nextOperation),
      history: {
        past: [...state.history.past, nextOperation],
        future: state.history.future.slice(1),
      },
    }));

    broadcastOperation(nextOperation);
  },

  addTable: (name: string) => {
    const state = get();
    const now = Date.now();
    const tableId = uuidv4();
    
    const defaultColumns: Column[] = [
      { id: uuidv4(), name: '名称', type: 'text', width: 200, order: 0 },
      { id: uuidv4(), name: '状态', type: 'select', width: 120, order: 1, options: { selectOptions: [
        { id: 'todo', name: '待办', color: '#6b7280' },
        { id: 'progress', name: '进行中', color: '#3b82f6' },
        { id: 'done', name: '已完成', color: '#10b981' },
      ]}},
      { id: uuidv4(), name: '备注', type: 'text', width: 300, order: 2 },
    ];

    const table: Table = {
      id: tableId,
      name,
      columns: defaultColumns,
      createdAt: now,
    };

    const operation = createOperation(
      'addTable',
      tableId,
      { table },
      state.currentUserId,
      state.version
    );

    set((state) => ({
      ...applyOperation(state, operation),
      currentTableId: tableId,
      history: {
        past: [...state.history.past, operation],
        future: [],
      },
    }));

    broadcastOperation(operation);
  },

  setEditingCell: (tableId: string, recordId: string, columnId: string | null) => {
    const state = get();
    const currentUser = state.collaboration.users.find((u) => u.id === state.currentUserId);

    if (columnId) {
      const editingCell: EditingCell = {
        tableId,
        recordId,
        columnId,
        userId: state.currentUserId,
        userName: currentUser?.name || '未知用户',
      };
      broadcastEditingState(editingCell);
    } else {
      broadcastEditingState({ tableId, recordId, columnId: '', userId: state.currentUserId, userName: '' });
    }
  },

  receiveRemoteOperation: (operation: Operation) => {
    set((state) => applyOperation(state, operation));
  },
}));

let broadcastChannel: BroadcastChannel | null = null;

export function initCollaboration() {
  if (typeof window === 'undefined') return;

  broadcastChannel = new BroadcastChannel('airtable-collaboration');

  broadcastChannel.onmessage = (event) => {
    const { type, data } = event.data;
    
    if (type === 'operation' && data.userId !== useTableStore.getState().currentUserId) {
      useTableStore.getState().receiveRemoteOperation(data);
    }
    
    if (type === 'editing' && data.userId !== useTableStore.getState().currentUserId) {
      set((state) => {
        const existingIndex = state.collaboration.editingCells.findIndex(
          (c) => c.tableId === data.tableId && c.recordId === data.recordId && c.userId === data.userId
        );

        if (!data.columnId) {
          if (existingIndex >= 0) {
            return {
              collaboration: {
                ...state.collaboration,
                editingCells: state.collaboration.editingCells.filter((_, i) => i !== existingIndex),
              },
            };
          }
          return state;
        }

        const newCell = { ...data };
        if (existingIndex >= 0) {
          return {
            collaboration: {
              ...state.collaboration,
              editingCells: state.collaboration.editingCells.map((c, i) =>
                i === existingIndex ? newCell : c
              ),
            },
          };
        }

        return {
          collaboration: {
            ...state.collaboration,
            editingCells: [...state.collaboration.editingCells, newCell],
          },
        };
      });
    }
  };
}

function broadcastOperation(operation: Operation) {
  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: 'operation', data: operation });
  }
}

function broadcastEditingState(cell: EditingCell) {
  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: 'editing', data: cell });
  }
}

export function useCurrentTable() {
  return useTableStore((state) => state.tables[state.currentTableId]);
}

export function useCurrentRecords() {
  return useTableStore((state) => {
    const records = state.records[state.currentTableId];
    return records ? Object.values(records) : [];
  });
}

export function useFilteredSortedRecords(): TableRecord[] {
  const currentTableId = useTableStore((state) => state.currentTableId);
  const table = useTableStore((state) => state.tables[currentTableId]);
  const records = useTableStore((state) => state.records[currentTableId]);
  const filters = useTableStore((state) => state.currentView.filters);
  const sortBy = useTableStore((state) => state.currentView.sortBy);

  if (!table || !records) return [];

  let result: TableRecord[] = Object.values(records) as TableRecord[];

  if (filters && filters.length > 0) {
    result = result.filter((record) => {
      return filters!.every((filter) => {
        const value = record.data[filter.columnId];
        switch (filter.operator) {
          case 'equals':
            return value === filter.value;
          case 'contains':
            return String(value || '').includes(String(filter.value));
          case 'greaterThan':
            return Number(value) > Number(filter.value);
          case 'lessThan':
            return Number(value) < Number(filter.value);
          case 'isEmpty':
            return value === undefined || value === null || value === '';
          case 'isNotEmpty':
            return value !== undefined && value !== null && value !== '';
          default:
            return true;
        }
      });
    });
  }

  if (sortBy) {
    const { columnId, direction } = sortBy;
    result = [...result].sort((a, b) => {
      const aVal = a.data[columnId];
      const bVal = b.data[columnId];
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return direction === 'asc' ? cmp : -cmp;
    });
  }

  return result;
}

function set(arg0: (state: TableState) => { collaboration: { editingCells: EditingCell[]; users: any[]; }; } | { collaboration: { editingCells: EditingCell[]; users: any[]; }; } | { collaboration: { editingCells: EditingCell[]; users: any[]; }; } | TableState) {
  useTableStore.setState(arg0(useTableStore.getState()));
}
