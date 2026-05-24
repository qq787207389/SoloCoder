import { useState } from 'react';
import { Table2, Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { useTableStore } from '../../store/useTableStore';
import { InputModal } from '../common/InputModal';

export function Sidebar() {
  const { tables, currentTableId, setCurrentTable, addTable } = useTableStore();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const tableList = Object.values(tables);

  const handleAddTable = () => {
    setIsModalOpen(true);
  };

  const handleConfirmAddTable = (name: string) => {
    addTable(name);
    setIsModalOpen(false);
  };

  return (
    <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col h-full">
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Table2 size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800">DataBase</h1>
            <p className="text-xs text-slate-500">协作数据表格</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <div className="mb-2">
          <button
            className="w-full flex items-center gap-1 px-2 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded transition-colors"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <span>表格</span>
            <span className="ml-auto text-xs text-slate-400">{tableList.length}</span>
          </button>
        </div>

        {isExpanded && (
          <div className="space-y-0.5">
            {tableList.map((table) => (
              <button
                key={table.id}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded transition-colors ${currentTableId === table.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-100'}`}
                onClick={() => setCurrentTable(table.id)}
              >
                <Table2 size={16} className={currentTableId === table.id ? 'text-blue-500' : 'text-slate-400'} />
                <span className="truncate">{table.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-slate-200">
        <button 
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors"
          onClick={handleAddTable}
        >
          <Plus size={16} />
          <span>新建表格</span>
        </button>
      </div>

      <InputModal
        isOpen={isModalOpen}
        title="新建表格"
        placeholder="请输入表格名称"
        defaultValue={`新表格 ${tableList.length + 1}`}
        onConfirm={handleConfirmAddTable}
        onCancel={() => setIsModalOpen(false)}
      />
    </div>
  );
}
