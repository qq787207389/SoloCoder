import { memo } from 'react';
import type { TableRecord, Column } from '../../store/types';
import { renderCellValue } from '../../utils/columnTypes';

interface RecordCardProps {
  record: TableRecord;
  columns: Column[];
  onClick?: () => void;
}

export const RecordCard = memo(function RecordCard({ record, columns, onClick }: RecordCardProps) {
  const titleColumn = columns[0];
  const titleValue = titleColumn ? record.data[titleColumn.id] : '';

  return (
    <div
      className="bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
      onClick={onClick}
    >
      <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <h3 className="font-medium text-slate-800 truncate">
          {String(titleValue || '未命名记录')}
        </h3>
      </div>
      <div className="p-3 space-y-2">
        {columns.slice(1, 5).map((column) => {
          const value = record.data[column.id];
          const displayValue = renderCellValue(column, value);
          
          if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
            return null;
          }

          return (
            <div key={column.id} className="flex items-start gap-2">
              <span className="text-xs text-slate-400 flex-shrink-0 w-16 truncate">
                {column.name}
              </span>
              <div className="flex-1 text-sm text-slate-700 truncate">
                {column.type === 'select' ? (
                  (() => {
                    const option = column.options?.selectOptions?.find((o) => o.id === value);
                    return option ? (
                      <span
                        className="inline-block px-2 py-0.5 rounded-full text-xs text-white"
                        style={{ backgroundColor: option.color }}
                      >
                        {option.name}
                      </span>
                    ) : null;
                  })()
                ) : column.type === 'multiSelect' ? (
                  <div className="flex flex-wrap gap-1">
                    {Array.isArray(value) && value.slice(0, 3).map((id) => {
                      const option = column.options?.selectOptions?.find((o) => o.id === id);
                      return option ? (
                        <span
                          key={id}
                          className="px-1.5 py-0.5 rounded-full text-xs text-white"
                          style={{ backgroundColor: option.color }}
                        >
                          {option.name}
                        </span>
                      ) : null;
                    })}
                    {Array.isArray(value) && value.length > 3 && (
                      <span className="text-xs text-slate-400">+{value.length - 3}</span>
                    )}
                  </div>
                ) : (
                  <span className="truncate">{displayValue}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
