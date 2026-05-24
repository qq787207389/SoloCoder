import { memo, useState } from 'react';
import { getColumnTypeConfig } from '../../utils/columnTypes';
import type { Column } from '../../store/types';
import { useTableStore } from '../../store/useTableStore';

interface TableCellProps {
  tableId: string;
  recordId: string;
  column: Column;
  value: unknown;
  onRecordClick?: (tableId: string, recordId: string) => void;
}

export const TableCell = memo(function TableCell({ tableId, recordId, column, value, onRecordClick }: TableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { updateCell, setEditingCell, currentTableId, collaboration, currentUserId } = useTableStore();

  const config = getColumnTypeConfig(column.type);
  const CellRenderer = config?.CellRenderer;

  const editingByOthers = collaboration.editingCells.find(
    (cell) => cell.tableId === currentTableId && cell.recordId === recordId && cell.columnId === column.id && cell.userId !== currentUserId
  );

  const handleChange = (newValue: unknown) => {
    updateCell(tableId, recordId, column.id, newValue);
  };

  const handleEditStart = () => {
    setIsEditing(true);
    setEditingCell(tableId, recordId, column.id);
  };

  const handleEditEnd = () => {
    setIsEditing(false);
    setEditingCell(tableId, recordId, null);
  };

  return (
    <div
      className={`h-full relative ${editingByOthers ? 'ring-2 ring-offset-1' : ''}`}
      style={{
        backgroundColor: editingByOthers ? (editingByOthers.userName === '李四' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)') : undefined,
        boxShadow: editingByOthers ? `0 0 0 2px ${editingByOthers.userName === '李四' ? '#10b981' : '#f59e0b'}` : undefined,
      }}
    >
      {editingByOthers && (
        <div className="absolute -top-5 left-0 text-xs px-1.5 py-0.5 rounded text-white z-10 whitespace-nowrap" style={{ backgroundColor: editingByOthers.userName === '李四' ? '#10b981' : '#f59e0b' }}>
          {editingByOthers.userName} 正在编辑
        </div>
      )}
      {CellRenderer && (
        <CellRenderer
          value={value}
          onChange={handleChange}
          column={column}
          isEditing={isEditing}
          onEditStart={handleEditStart}
          onEditEnd={handleEditEnd}
          onRecordClick={onRecordClick}
        />
      )}
    </div>
  );
});
