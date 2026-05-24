import { useState, useEffect } from 'react';
import { LayoutGrid, Table2, Undo2, Redo2, Filter, Users } from 'lucide-react';
import { useTableStore } from '../../store/useTableStore';
import type { FilterOperator } from '../../store/types';

export function Toolbar() {
  const { currentTableId, tables, currentView, setViewType, setSort, undo, redo, history, collaboration, currentUserId, addFilter, removeFilter } = useTableStore();
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showUsers, setShowUsers] = useState(false);

  const currentTable = tables[currentTableId];
  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'y' || ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'z')) {
        e.preventDefault();
        redo();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const handleAddFilter = (columnId: string, operator: FilterOperator, value: unknown) => {
    addFilter(columnId, operator, value);
    setShowFilterMenu(false);
  };

  return (
    <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          <button
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${currentView.type === 'table' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
            onClick={() => setViewType('table')}
          >
            <Table2 size={16} />
            表格
          </button>
          <button
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${currentView.type === 'card' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
            onClick={() => setViewType('card')}
          >
            <LayoutGrid size={16} />
            卡片
          </button>
        </div>

        <div className="h-6 w-px bg-slate-200 mx-2" />

        <div className="flex items-center gap-1">
          <button
            className={`p-2 rounded-lg transition-colors ${canUndo ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-300 cursor-not-allowed'}`}
            onClick={undo}
            disabled={!canUndo}
            title="撤销 (Ctrl+Z)"
          >
            <Undo2 size={18} />
          </button>
          <button
            className={`p-2 rounded-lg transition-colors ${canRedo ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-300 cursor-not-allowed'}`}
            onClick={redo}
            disabled={!canRedo}
            title="重做 (Ctrl+Y)"
          >
            <Redo2 size={18} />
          </button>
        </div>

        <div className="h-6 w-px bg-slate-200 mx-2" />

        <div className="relative">
          <button
            className={`p-2 rounded-lg transition-colors flex items-center gap-1 ${currentView.filters && currentView.filters.length > 0 ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-100'}`}
            onClick={() => setShowFilterMenu(!showFilterMenu)}
          >
            <Filter size={18} />
            <span className="text-sm font-medium">筛选</span>
            {currentView.filters && currentView.filters.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                {currentView.filters.length}
              </span>
            )}
          </button>

          {showFilterMenu && (
            <div className="absolute top-full left-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg py-2 z-50 min-w-[280px]">
              <div className="px-3 py-2 border-b border-slate-100">
                <h3 className="text-sm font-medium text-slate-700">筛选条件</h3>
              </div>
              {currentView.filters && currentView.filters.length > 0 && (
                <div className="p-2 space-y-2 border-b border-slate-100">
                  {currentView.filters.map((filter) => {
                    const column = currentTable?.columns.find((c) => c.id === filter.columnId);
                    return (
                      <div key={filter.id} className="flex items-center gap-2 text-sm">
                        <span className="text-slate-600 truncate flex-1">{column?.name || filter.columnId}</span>
                        <span className="text-slate-400">{filter.operator}</span>
                        <span className="text-slate-600 truncate max-w-[80px]">{String(filter.value)}</span>
                        <button
                          className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600"
                          onClick={() => removeFilter(filter.id)}
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="p-2">
                <p className="text-xs text-slate-400 text-center">点击列标题菜单添加筛选</p>
              </div>
            </div>
          )}
        </div>

        {currentView.sortBy && (
          <div className="flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-lg">
            <span className="text-xs text-slate-500">排序:</span>
            <span className="text-sm font-medium text-slate-700">
              {currentTable?.columns.find((c) => c.id === currentView.sortBy?.columnId)?.name}
            </span>
            <span className="text-xs text-slate-500">
              {currentView.sortBy.direction === 'asc' ? '↑' : '↓'}
            </span>
          </div>
        )}

        {currentView.groupBy && (
          <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-lg">
            <span className="text-xs text-blue-500">分组:</span>
            <span className="text-sm font-medium text-blue-700">
              {currentTable?.columns.find((c) => c.id === currentView.groupBy)?.name}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 transition-colors"
            onClick={() => setShowUsers(!showUsers)}
          >
            <div className="flex -space-x-2">
              {collaboration.users.slice(0, 3).map((user) => (
                <div
                  key={user.id}
                  className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-sm"
                  style={{ backgroundColor: user.id === currentUserId ? '#3b82f6' : user.color }}
                  title={user.name}
                >
                  <span className="text-white text-xs">{user.avatar}</span>
                </div>
              ))}
              {collaboration.users.length > 3 && (
                <div className="w-7 h-7 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-xs text-slate-600">
                  +{collaboration.users.length - 3}
                </div>
              )}
            </div>
            <Users size={16} className="text-slate-400" />
          </button>

          {showUsers && (
            <div className="absolute top-full right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg py-2 z-50 min-w-[200px]">
              <div className="px-3 py-2 border-b border-slate-100">
                <h3 className="text-sm font-medium text-slate-700">在线用户</h3>
              </div>
              {collaboration.users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                    style={{ backgroundColor: user.id === currentUserId ? '#3b82f6' : user.color }}
                  >
                    <span className="text-white">{user.avatar}</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-700">{user.name}</div>
                    <div className="text-xs text-slate-400">
                      {user.id === currentUserId ? '你' : '在线'}
                    </div>
                  </div>
                  {user.id === currentUserId && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                      当前
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
