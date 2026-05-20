import { useEditorStore } from '@/stores/useEditorStore';
import type { CanvasElement } from '@/types';

export default function LayerPanel() {
  const { elements, selectedIds, setSelectedIds, bringToFront, sendToBack, bringForward, sendBackward } = useEditorStore();

  const sortedElements = [...elements].sort((a, b) => b.zIndex - a.zIndex);

  const toggleSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (e.ctrlKey || e.metaKey) {
      if (selectedIds.includes(id)) {
        setSelectedIds(selectedIds.filter((i) => i !== id));
      } else {
        setSelectedIds([...selectedIds, id]);
      }
    } else {
      setSelectedIds([id]);
    }
  };

  const getElementIcon = (element: CanvasElement) => {
    switch (element.type) {
      case 'text':
        return (
          <div className="w-6 h-6 flex items-center justify-center bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded text-xs font-bold">
            T
          </div>
        );
      case 'image':
        return (
          <div className="w-6 h-6 flex items-center justify-center bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded text-xs">
            🖼
          </div>
        );
      case 'shape':
        return (
          <div className="w-6 h-6 flex items-center justify-center bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 rounded text-xs">
            ⬜
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">图层</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">共 {elements.length} 个元素</p>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {sortedElements.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400 text-sm">
            暂无图层
          </div>
        ) : (
          <div className="py-2">
            {sortedElements.map((element) => (
              <div
                key={element.id}
                onClick={(e) => toggleSelection(element.id, e)}
                className={`layer-item flex items-center gap-3 px-4 py-3 cursor-pointer ${
                  selectedIds.includes(element.id) ? 'selected' : ''
                } ${!element.visible ? 'opacity-50' : ''}`}
              >
                {getElementIcon(element)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {element.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {element.type === 'text' && '文本'}
                    {element.type === 'image' && '图片'}
                    {element.type === 'shape' && '形状'}
                    {element.locked && ' · 已锁定'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-slate-700">
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => selectedIds.forEach((id) => bringToFront(id))}
            disabled={selectedIds.length === 0}
            className="py-2 px-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded text-xs text-gray-700 dark:text-gray-300 transition-colors"
            title="置于顶层"
          >
            ↑↑
          </button>
          <button
            onClick={() => selectedIds.forEach((id) => bringForward(id))}
            disabled={selectedIds.length === 0}
            className="py-2 px-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded text-xs text-gray-700 dark:text-gray-300 transition-colors"
            title="上移一层"
          >
            ↑
          </button>
          <button
            onClick={() => selectedIds.forEach((id) => sendBackward(id))}
            disabled={selectedIds.length === 0}
            className="py-2 px-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded text-xs text-gray-700 dark:text-gray-300 transition-colors"
            title="下移一层"
          >
            ↓
          </button>
          <button
            onClick={() => selectedIds.forEach((id) => sendToBack(id))}
            disabled={selectedIds.length === 0}
            className="py-2 px-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded text-xs text-gray-700 dark:text-gray-300 transition-colors"
            title="置于底层"
          >
            ↓↓
          </button>
        </div>
      </div>
    </div>
  );
}
