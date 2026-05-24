export type ColumnType = 'text' | 'number' | 'select' | 'multiSelect' | 'date' | 'attachment' | 'linkRecord';

export interface SelectOption {
  id: string;
  name: string;
  color: string;
}

export interface ColumnOptions {
  selectOptions?: SelectOption[];
  linkTableId?: string;
  linkDisplayColumnId?: string;
  numberPrecision?: number;
  dateFormat?: string;
}

export interface Column {
  id: string;
  name: string;
  type: ColumnType;
  options?: ColumnOptions;
  width: number;
  order: number;
}

export interface Table {
  id: string;
  name: string;
  columns: Column[];
  createdAt: number;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
}

export interface TableRecord {
  id: string;
  tableId: string;
  data: { [key: string]: unknown };
  createdAt: number;
  updatedAt: number;
}

export type OperationType = 'updateCell' | 'addRecord' | 'deleteRecord' | 'addColumn' | 'modifyColumn' | 'deleteColumn' | 'batchUpdate' | 'addTable' | 'deleteTable';

export interface Operation {
  id: string;
  type: OperationType;
  tableId: string;
  payload: unknown;
  timestamp: number;
  userId: string;
  version: number;
}

export interface UpdateCellPayload {
  recordId: string;
  columnId: string;
  oldValue: unknown;
  newValue: unknown;
}

export interface AddRecordPayload {
  record: TableRecord;
}

export interface DeleteRecordPayload {
  recordId: string;
  record: TableRecord;
}

export interface AddColumnPayload {
  column: Column;
}

export interface ModifyColumnPayload {
  columnId: string;
  oldColumn: Column;
  newColumn: Column;
}

export interface DeleteColumnPayload {
  columnId: string;
  column: Column;
}

export interface BatchUpdatePayload {
  updates: { recordId: string; columnId: string; value: unknown }[];
  oldValues: { recordId: string; columnId: string; value: unknown }[];
}

export interface AddTablePayload {
  table: Table;
}

export interface ViewState {
  type: 'table' | 'card';
  sortBy?: { columnId: string; direction: 'asc' | 'desc' };
  filters?: Filter[];
  groupBy?: string;
}

export type FilterOperator = 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'isEmpty' | 'isNotEmpty';

export interface Filter {
  id: string;
  columnId: string;
  operator: FilterOperator;
  value: unknown;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  color: string;
}

export interface EditingCell {
  tableId: string;
  recordId: string;
  columnId: string;
  userId: string;
  userName: string;
}

export interface CollaborationState {
  users: User[];
  editingCells: EditingCell[];
}

export interface HistoryState {
  past: Operation[];
  future: Operation[];
}

export interface TableState {
  tables: { [key: string]: Table };
  records: { [tableId: string]: { [recordId: string]: TableRecord } };
  currentTableId: string;
  currentView: ViewState;
  version: number;
  history: HistoryState;
  collaboration: CollaborationState;
  currentUserId: string;
}
