import { useRef, useMemo, useState, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { TableHeader } from './TableHeader';
import { TableCell } from './TableCell';
import { useTableStore, useFilteredSortedRecords } from '../../store/useTableStore';
import type { TableRecord, Column } from '../../store/types';

interface VirtualTableProps {
  onRecordClick?: (tableId: string, recordId: string) => void;
}

export function VirtualTable({ onRecordClick }: VirtualTableProps) {
  const { currentTableId, tables, modifyColumn, currentView, addRecord } = useTableStore();
  const filteredRecords = useFilteredSortedRecords();
  const parentRef = useRef<HTMLDivElement>(null);
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

  const rowVirtualizer = useVirtualizer({
    count: groupedRecords.reduce((acc, group) => acc + group.records.length + (group.groupKey ? 1 : 0), 0),
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
    overscan: 10,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();

  const handleColumnResize = (columnId: string, width: number) => {
    const table = tables[currentTableId];
    if (!table) return;
    const column = table.columns.find((c) => c.id === columnId);
    if (!column) return;
    modifyColumn(currentTableId, columnId, { ...column, width });
  };

  const renderRow = (record: TableRecord, rowIndex: number) => {
    return (
      <div
        key={record.id}
        className={`flex border-b border-slate-100 hover:bg-blue-50/30`}
        data-index={rowIndex}
      >
        <div className="w-12 flex-shrink-0 flex items-center justify-center border-r border-slate-200 text-slate-400 text-xs font-medium bg-slate-50/50">
          {rowIndex + 1}
        </div>
        {columns.map((column) => (
          <div key={column.id} className="flex-shrink-0 border-r border-slate-100" style={{ width: column.width }}>
            <TableCell
              tableId={currentTableId}
              recordId={record.id}
              column={column}
              value={record.data[column.id]}
              onRecordClick={onRecordClick}
            />
          </div>
        ))}
      </div>
    );
  };

  const renderGroupHeader = (groupKey: string) => {
    const groupColumn = columns.find((c) => c.id === currentView.groupBy);
    let displayValue = groupKey;
    
    if (groupColumn && groupColumn.type === 'select') {
      const option = groupColumn.options?.selectOptions?.find((o) => o.id === groupKey);
      if (option) {
        displayValue = option.name;
      }
    }

    return (
      <div className="flex items-center px-3 py-2 bg-slate-100 border-b border-slate-200 font-medium text-slate-700 sticky left-0">
        <span className="w-12 flex-shrink-0 flex items-center justify-center">
          <span className="text-slate-400">▸</span>
        </span>
        <span>{displayValue || '未分组'}</span>
        <span className="ml-2 text-xs text-slate-400">
          ({groupedRecords.find((g) => g.groupKey === groupKey)?.records.length || 0} 条)
        </span>
      </div>
    );
  };

  const totalWidth = columns.reduce((acc, col) => acc + col.width, 0) + 48;

  return (
    <div className="h-full flex flex-col bg-white">
      <TableHeader columns={columns} onColumnResize={handleColumnResize} />
      <div ref={parentRef} className="flex-1 overflow-auto">
        <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: totalWidth, position: 'relative' }}>
          {(() => {
            let rowOffset = 0;
            const elements: JSX.Element[] = [];
            
            groupedRecords.forEach((group) => {
              if (group.groupKey) {
                const virtualRow = virtualRows.find((r) => r.index === rowOffset);
                if (virtualRow) {
                  elements.push(
                    <div
                    key={`group-${group.groupKey}`}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    className="w-full"
                  >
                    {renderGroupHeader(group.groupKey)}
                  </div>
                  );
                }
                rowOffset++;
              }
              
              group.records.forEach((record, idx) => {
                const virtualRow = virtualRows.find((r) => r.index === rowOffset);
                if (virtualRow) {
                  elements.push(
                    <div
                    key={record.id}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    className="w-full"
                    >
                      {renderRow(record, rowOffset)}
                    </div>
                  );
                }
                rowOffset++;
              });
            });
            
            return elements;
          })()}
        </div>
      </div>
      <div className="border-t border-slate-200 p-2 bg-slate-50">
        <button
          className="px-4 py-1.5 text-sm text-slate-600 hover:bg-slate-200 rounded transition-colors"
          onClick={() => addRecord(currentTableId)}
        >
          + 添加记录
        </button>
      </div>
    </div>
  );
}
