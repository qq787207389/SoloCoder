import { useMemo, useState, useEffect } from 'react';
import { RecordCard } from './RecordCard';
import { useTableStore, useFilteredSortedRecords } from '../../store/useTableStore';
import type { TableRecord, Column } from '../../store/types';

interface CardViewProps {
  onRecordClick?: (tableId: string, recordId: string) => void;
}

export function CardView({ onRecordClick }: CardViewProps) {
  const { currentTableId, tables, currentView, addRecord } = useTableStore();
  const filteredRecords = useFilteredSortedRecords();
  const [columns, setColumns] = useState<Column[]>([]);

  useEffect(() => {
    const table = tables[currentTableId];
    if (table) {
      setColumns([...table.columns].sort((a, b) => a.order - b.order));
    }
  }, [currentTableId, tables]);

  const groupedRecords = useMemo(() => {
    if (!currentView.groupBy) {
      return [{ groupKey: null, records: filteredRecords }];
    }

    const groups: { [key: string]: TableRecord[] } = {};
    const groupColumn = columns.find((c) => c.id === currentView.groupBy);
    
    filteredRecords.forEach((record) => {
      const value = record.data[currentView.groupBy!];
      const key = String(value || '未分组');
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(record);
    });

    return Object.entries(groups).map(([key, records]) => ({
      groupKey: key,
      records,
    }));
  }, [filteredRecords, currentView.groupBy, columns]);

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-auto">
      <div className="flex-1 p-4">
        {groupedRecords.map((group) => (
          <div key={group.groupKey || 'all'} className="mb-6">
            {group.groupKey && (
              <h2 className="text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2">
                <span className="text-slate-400">▸</span>
                {(() => {
                  const groupColumn = columns.find((c) => c.id === currentView.groupBy);
                  let displayValue = group.groupKey;
                  
                  if (groupColumn && groupColumn.type === 'select') {
                    const option = groupColumn.options?.selectOptions?.find((o) => o.id === group.groupKey);
                    if (option) {
                      displayValue = option.name;
                    }
                  }
                  
                  return (
                    <>
                      <span>{displayValue || '未分组'}</span>
                      <span className="text-xs text-slate-400 font-normal">
                        ({group.records.length} 条)
                      </span>
                    </>
                  );
                })()}
              </h2>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {group.records.map((record) => (
                <RecordCard
                  key={record.id}
                  record={record}
                  columns={columns}
                  onClick={() => onRecordClick?.(currentTableId, record.id)}
                />
              ))}
              <button
                className="aspect-video border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
                onClick={() => addRecord(currentTableId)}
              >
                <span className="text-sm">+ 添加记录</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
