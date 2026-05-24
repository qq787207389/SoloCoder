import { memo, useState } from 'react';
import { ChevronUp, ChevronDown, Filter, GripVertical, MoreHorizontal } from 'lucide-react';
import type { Column } from '../../store/types';
import { useTableStore } from '../../store/useTableStore';

interface TableHeaderProps {
  columns: Column[];
  onColumnResize: (columnId: string, width: number) => void;
}

export const TableHeader = memo(function TableHeader({ columns, onColumnResize }: TableHeaderProps) {
  const { currentView, setSort, setGroupBy } = useTableStore();
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const handleMouseDown = (e: React.MouseEvent, columnId: string) => {
    e.preventDefault();
    setResizingColumn(columnId);
    const startX = e.clientX;
    const column = columns.find((c) => c.id === columnId);
    const startWidth = column?.width || 150;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const diff = moveEvent.clientX - startX;
      const newWidth = Math.max(80, startWidth + diff);
      onColumnResize(columnId, newWidth);
    };

    const handleMouseUp = () => {
      setResizingColumn(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleSort = (columnId: string) => {
    const currentSort = currentView.sortBy;
    if (currentSort?.columnId === columnId) {
      if (currentSort.direction === 'asc') {
        setSort(columnId, 'desc');
      } else {
        setSort(undefined);
      }
    } else {
      setSort(columnId, 'asc');
    }
    setOpenMenu(null);
  };

  const handleGroup = (columnId: string) => {
    if (currentView.groupBy === columnId) {
      setGroupBy(undefined);
    } else {
      setGroupBy(columnId);
    }
    setOpenMenu(null);
  };

  return (
    <div className="flex bg-slate-50 border-b border-slate-200 sticky top-0 z-20">
      <div className="w-12 flex-shrink-0 flex items-center justify-center border-r border-slate-200 text-slate-400 text-xs font-medium py-2">
        #
      </div>
      {columns.map((column) => (
        <div
          key={column.id}
          className="relative flex-shrink-0 border-r border-slate-200 group"
          style={{ width: column.width }}
        >
          <div
            className="h-full flex items-center px-3 py-2 cursor-pointer hover:bg-slate-100"
            onClick={() => handleSort(column.id)}
          >
            <span className="text-sm font-medium text-slate-700 flex-1 truncate">{column.name}</span>
            {currentView.sortBy?.columnId === column.id && (
              currentView.sortBy.direction === 'asc' ? (
                <ChevronUp size={16} className="text-blue-500 flex-shrink-0" />
              ) : (
                <ChevronDown size={16} className="text-blue-500 flex-shrink-0" />
              )
            )}
            <button
              className="ml-1 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-slate-200 transition-opacity flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenu(openMenu === column.id ? null : column.id);
              }}
            >
              <MoreHorizontal size={14} className="text-slate-500" />
            </button>
          </div>

          {openMenu === column.id && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50 min-w-[160px]">
              <button
                className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
                onClick={() => handleSort(column.id)}
              >
                {currentView.sortBy?.columnId === column.id ? (
                  currentView.sortBy.direction === 'asc' ? (
                    <>
                      <ChevronDown size={14} />
                      <span>降序</span>
                    </>
                  ) : (
                    <>
                      <ChevronUp size={14} />
                      <span>取消排序</span>
                    </>
                  )
                ) : (
                  <>
                    <ChevronUp size={14} />
                    <span>升序</span>
                  </>
                )}
              </button>
              <button
                className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
                onClick={() => handleGroup(column.id)}
              >
                <Filter size={14} />
                <span>{currentView.groupBy === column.id ? '取消分组' : '按此列分组'}</span>
              </button>
            </div>
          )}

          <div
            className={`absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 ${resizingColumn === column.id ? 'bg-blue-500' : ''}`}
            onMouseDown={(e) => handleMouseDown(e, column.id)}
          />
        </div>
      ))}
    </div>
  );
});
