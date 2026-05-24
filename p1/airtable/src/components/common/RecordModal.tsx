import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTableStore } from '../../store/useTableStore';
import type { Column } from '../../store/types';
import { getColumnTypeConfig } from '../../utils/columnTypes';

interface RecordModalProps {
  tableId: string;
  recordId: string;
  onClose: () => void;
}

export function RecordModal({ tableId, recordId, onClose }: RecordModalProps) {
  const { tables, records, updateCell } = useTableStore();
  const [columns, setColumns] = useState<Column[]>([]);
  const [editingCell, setEditingCell] = useState<string | null>(null);

  const table = tables[tableId];
  const record = records[tableId]?.[recordId];

  useEffect(() => {
    if (table) {
      setColumns([...table.columns].sort((a, b) => a.order - b.order));
    }
  }, [table]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!table || !record) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-800">记录详情</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-200 transition-colors"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {columns.map((column) => {
              const config = getColumnTypeConfig(column.type);
              const CellRenderer = config?.CellRenderer;
              const value = record.data[column.id];
              const isEditing = editingCell === column.id;

              return (
                <div key={column.id} className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="px-4 py-2 bg-slate-50 border-b border-slate-200">
                    <span className="text-sm font-medium text-slate-600">{column.name}</span>
                    <span className="ml-2 text-xs text-slate-400">({config?.name || column.type})</span>
                  </div>
                  <div className="p-4 min-h-[56px]">
                    {CellRenderer && (
                      <CellRenderer
                        value={value}
                        onChange={(newValue) => updateCell(tableId, recordId, column.id, newValue)}
                        column={column}
                        isEditing={isEditing}
                        onEditStart={() => setEditingCell(column.id)}
                        onEditEnd={() => setEditingCell(null)}
                        onRecordClick={(linkedTableId, linkedRecordId) => {
                          console.log('Link clicked:', linkedTableId, linkedRecordId);
                        }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            创建于 {new Date(record.createdAt).toLocaleString()}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
