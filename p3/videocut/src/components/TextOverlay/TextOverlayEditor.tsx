import React from 'react';
import { Trash2, Type, X, Move } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { TextOverlay } from '../../types';

export const TextOverlayEditor: React.FC = () => {
  const { textOverlays, selectedTextId, selectText, updateTextOverlay, removeTextOverlay } =
    useEditorStore();

  const selectedOverlay = textOverlays.find((t) => t.id === selectedTextId);

  const handleChange = (field: keyof TextOverlay, value: string | number) => {
    if (!selectedTextId) return;
    updateTextOverlay(selectedTextId, { [field]: value });
  };

  const fontFamilies = [
    'Arial',
    'Helvetica',
    'Times New Roman',
    'Georgia',
    'Courier New',
    'Verdana',
    'Impact',
  ];

  return (
    <div className="w-64 bg-slate-900 border-l border-slate-700 flex flex-col h-full">
      <div className="px-4 py-3 border-b border-slate-700">
        <h2 className="text-sm font-semibold text-slate-200">文字叠加</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-3 border-b border-slate-700">
          <p className="text-xs text-slate-500 mb-2">已添加的文字</p>
          <div className="space-y-1">
            {textOverlays.length === 0 ? (
              <p className="text-xs text-slate-600 text-center py-4">
                点击"添加文字"按钮
              </p>
            ) : (
              textOverlays.map((overlay) => (
                <div
                  key={overlay.id}
                  className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                    selectedTextId === overlay.id
                      ? 'bg-blue-600/30 border border-blue-500'
                      : 'bg-slate-800 hover:bg-slate-700'
                  }`}
                  onClick={() => selectText(overlay.id)}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Type size={12} className="text-slate-400 flex-shrink-0" />
                    <span className="text-xs text-slate-300 truncate">
                      {overlay.text || '(空文字)'}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTextOverlay(overlay.id);
                    }}
                    className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {selectedOverlay && (
          <div className="p-3 space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">文字内容</label>
              <input
                type="text"
                value={selectedOverlay.text}
                onChange={(e) => handleChange('text', e.target.value)}
                className="w-full px-2 py-1.5 text-sm bg-slate-800 border border-slate-600 rounded text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-slate-400 mb-1">字体</label>
                <select
                  value={selectedOverlay.fontFamily}
                  onChange={(e) => handleChange('fontFamily', e.target.value)}
                  className="w-full px-2 py-1.5 text-sm bg-slate-800 border border-slate-600 rounded text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  {fontFamilies.map((font) => (
                    <option key={font} value={font}>
                      {font}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">字号</label>
                <input
                  type="number"
                  value={selectedOverlay.fontSize}
                  onChange={(e) =>
                    handleChange('fontSize', parseInt(e.target.value) || 24)
                  }
                  min="8"
                  max="200"
                  className="w-full px-2 py-1.5 text-sm bg-slate-800 border border-slate-600 rounded text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">颜色</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={selectedOverlay.color}
                  onChange={(e) => handleChange('color', e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border-0"
                />
                <input
                  type="text"
                  value={selectedOverlay.color}
                  onChange={(e) => handleChange('color', e.target.value)}
                  className="flex-1 px-2 py-1.5 text-sm bg-slate-800 border border-slate-600 rounded text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">对齐方式</label>
              <div className="flex gap-1">
                {(['left', 'center', 'right'] as const).map((align) => (
                  <button
                    key={align}
                    onClick={() => handleChange('textAlign', align)}
                    className={`flex-1 py-1.5 text-xs rounded transition-colors ${
                      selectedOverlay.textAlign === align
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {align === 'left' ? '左' : align === 'center' ? '中' : '右'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-slate-400 mb-1">X 位置</label>
                <input
                  type="number"
                  value={selectedOverlay.x}
                  onChange={(e) => handleChange('x', parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 text-sm bg-slate-800 border border-slate-600 rounded text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Y 位置</label>
                <input
                  type="number"
                  value={selectedOverlay.y}
                  onChange={(e) => handleChange('y', parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 text-sm bg-slate-800 border border-slate-600 rounded text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-slate-400 mb-1">开始时间</label>
                <input
                  type="number"
                  value={selectedOverlay.startTime.toFixed(2)}
                  onChange={(e) =>
                    handleChange('startTime', parseFloat(e.target.value) || 0)
                  }
                  step="0.1"
                  className="w-full px-2 py-1.5 text-sm bg-slate-800 border border-slate-600 rounded text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">结束时间</label>
                <input
                  type="number"
                  value={selectedOverlay.endTime.toFixed(2)}
                  onChange={(e) =>
                    handleChange('endTime', parseFloat(e.target.value) || 0)
                  }
                  step="0.1"
                  className="w-full px-2 py-1.5 text-sm bg-slate-800 border border-slate-600 rounded text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
