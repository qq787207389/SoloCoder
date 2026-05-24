import type { ComponentType } from 'react';
import type { ColumnType, Column } from '../store/types';

export interface CellProps {
  value: unknown;
  onChange: (value: unknown) => void;
  column: Column;
  isEditing: boolean;
  onEditStart: () => void;
  onEditEnd: () => void;
  onRecordClick?: (tableId: string, recordId: string) => void;
}

export interface ColumnTypeConfig {
  type: ColumnType;
  name: string;
  icon: string;
  CellRenderer: ComponentType<CellProps>;
  defaultValue: unknown;
}

const columnRegistry = new Map<ColumnType, ColumnTypeConfig>();

export function registerColumnType(config: ColumnTypeConfig) {
  columnRegistry.set(config.type, config);
}

export function getColumnTypeConfig(type: ColumnType): ColumnTypeConfig | undefined {
  return columnRegistry.get(type);
}

export function getAllColumnTypes(): ColumnTypeConfig[] {
  return Array.from(columnRegistry.values());
}

export function renderCellValue(column: Column, value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  switch (column.type) {
    case 'select': {
      const option = column.options?.selectOptions?.find((o) => o.id === value);
      return option?.name || String(value);
    }
    case 'multiSelect': {
      const ids = Array.isArray(value) ? value : [];
      return ids
        .map((id) => column.options?.selectOptions?.find((o) => o.id === id)?.name)
        .filter(Boolean)
        .join(', ');
    }
    case 'date':
      return String(value);
    case 'number':
      return String(value);
    case 'linkRecord':
      return String(value);
    default:
      return String(value);
  }
}
