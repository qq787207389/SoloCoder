import { useState } from 'react';
import { useEditorStore, useSelectedElements } from '@/stores/useEditorStore';
import type { BlendMode, TextElement, ShapeElement } from '@/types';

const blendModes: BlendMode[] = ['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn'];

export default function Toolbar() {
  const [activeTab, setActiveTab] = useState<'add' | 'text' | 'style' | 'layout'>('add');

  const {
    addElement,
    canvasSize,
    setCanvasSize,
    backgroundColor,
    setBackgroundColor,
    zoom,
    setZoom,
    snapEnabled,
    setSnapEnabled,
    gridSize,
    setGridSize,
    selectedIds,
    removeElement,
    copy,
    paste,
    duplicate,
    lock,
    unlock,
    hide,
    show,
    bringToFront,
    sendToBack,
    bringForward,
    sendBackward,
    setBlendMode,
    updateElement,
  } = useEditorStore();

  const selectedElements = useSelectedElements();
  const hasSelection = selectedIds.length > 0;
  const selectedElement = selectedElements[0];

  const handleAddText = () => {
    const textElement: TextElement = {
      id: `text_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'text',
      name: '新文本',
      left: canvasSize.width / 2 - 100,
      top: canvasSize.height / 2 - 20,
      width: 200,
      height: 40,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      visible: true,
      locked: false,
      zIndex: 0,
      blendMode: 'normal',
      text: '双击编辑',
      fontFamily: 'Arial',
      fontSize: 32,
      fontWeight: 'normal',
      fontStyle: 'normal',
      lineHeight: 1.2,
      letterSpacing: 0,
      textAlign: 'center',
      fill: '#333333',
      stroke: '',
      strokeWidth: 0,
      shadows: [],
      textDecoration: 'none',
    };
    addElement(textElement);
  };

  const handleAddShape = (shapeType: 'rect' | 'circle' | 'triangle' | 'star') => {
    const shapeElement: ShapeElement = {
      id: `shape_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'shape',
      name: '新形状',
      left: canvasSize.width / 2 - 50,
      top: canvasSize.height / 2 - 50,
      width: 100,
      height: 100,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      visible: true,
      locked: false,
      zIndex: 0,
      blendMode: 'normal',
      shapeType,
      fill: '#3b82f6',
      stroke: '',
      strokeWidth: 0,
      strokeLineCap: 'butt',
    };
    addElement(shapeElement);
  };

  const handleDelete = () => {
    selectedIds.forEach((id) => removeElement(id));
  };

  const handleCopy = () => {
    copy(selectedIds);
  };

  const handleDuplicate = () => {
    if (selectedIds.length === 1) {
      duplicate(selectedIds[0]);
    }
  };

  const handleLockToggle = () => {
    if (selectedIds.length === 1) {
      const isLocked = selectedElement?.locked;
      if (isLocked) {
        unlock(selectedIds[0]);
      } else {
        lock(selectedIds[0]);
      }
    }
  };

  const handleVisibilityToggle = () => {
    if (selectedIds.length === 1) {
      const isVisible = selectedElement?.visible;
      if (isVisible) {
        hide(selectedIds[0]);
      } else {
        show(selectedIds[0]);
      }
    }
  };

  return (
    <div className="w-80 bg-white dark:bg-slate-800 border-l border-gray-200 dark:border-slate-700 flex flex-col h-full">
      <div className="flex border-b border-gray-200 dark:border-slate-700">
        {(['add', 'text', 'style', 'layout'] as const).map((tab) => (
          <button
            key={tab}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'add' && '添加'}
            {tab === 'text' && '文本'}
            {tab === 'style' && '样式'}
            {tab === 'layout' && '布局'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
        {activeTab === 'add' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">文本</h3>
              <button
                onClick={handleAddText}
                className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                添加文本
              </button>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">形状</h3>
              <div className="grid grid-cols-2 gap-2">
                {(['rect', 'circle', 'triangle', 'star'] as const).map((shape) => (
                  <button
                    key={shape}
                    onClick={() => handleAddShape(shape)}
                    className="py-2 px-3 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    {shape === 'rect' && '矩形'}
                    {shape === 'circle' && '圆形'}
                    {shape === 'triangle' && '三角形'}
                    {shape === 'star' && '星形'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">画布设置</h3>
              <div className="space-y-3">
                <div className="property-grid">
                  <label className="text-xs text-gray-500 dark:text-gray-400">宽度</label>
                  <input
                    type="number"
                    value={canvasSize.width}
                    onChange={(e) => setCanvasSize({ ...canvasSize, width: Number(e.target.value) })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div className="property-grid">
                  <label className="text-xs text-gray-500 dark:text-gray-400">高度</label>
                  <input
                    type="number"
                    value={canvasSize.height}
                    onChange={(e) => setCanvasSize({ ...canvasSize, height: Number(e.target.value) })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div className="property-grid">
                  <label className="text-xs text-gray-500 dark:text-gray-400">背景色</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-8 h-8 rounded-md border border-gray-300 dark:border-slate-600 cursor-pointer"
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400">{backgroundColor}</span>
                  </div>
                </div>
                <div className="property-grid">
                  <label className="text-xs text-gray-500 dark:text-gray-400">缩放</label>
                  <input
                    type="range"
                    min="25"
                    max="400"
                    value={zoom * 100}
                    onChange={(e) => setZoom(Number(e.target.value) / 100)}
                    className="w-full"
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-400 col-start-2">{Math.round(zoom * 100)}%</span>
                </div>
                <div className="property-grid items-center">
                  <label className="text-xs text-gray-500 dark:text-gray-400">吸附对齐</label>
                  <button
                    onClick={() => setSnapEnabled(!snapEnabled)}
                    className={`w-10 h-5 rounded-full transition-colors ${
                      snapEnabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-slate-600'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${
                        snapEnabled ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'text' && selectedElement?.type === 'text' && (
          <div className="space-y-4">
            <div className="property-grid">
              <label className="text-xs text-gray-500 dark:text-gray-400">内容</label>
              <input
                type="text"
                value={selectedElement.text}
                onChange={(e) => updateElement(selectedElement.id, { text: e.target.value })}
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div className="property-grid">
              <label className="text-xs text-gray-500 dark:text-gray-400">字体</label>
              <select
                value={selectedElement.fontFamily}
                onChange={(e) => updateElement(selectedElement.id, { fontFamily: e.target.value })}
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
              >
                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Georgia">Georgia</option>
                <option value="Verdana">Verdana</option>
                <option value="Courier New">Courier New</option>
              </select>
            </div>
            <div className="property-grid">
              <label className="text-xs text-gray-500 dark:text-gray-400">字号</label>
              <input
                type="number"
                value={selectedElement.fontSize}
                onChange={(e) => updateElement(selectedElement.id, { fontSize: Number(e.target.value) })}
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div className="property-grid items-center">
              <label className="text-xs text-gray-500 dark:text-gray-400">粗体</label>
              <button
                onClick={() =>
                  updateElement(selectedElement.id, {
                    fontWeight: selectedElement.fontWeight === 'bold' ? 'normal' : 'bold',
                  })
                }
                className={`w-8 h-8 rounded border ${
                  selectedElement.fontWeight === 'bold'
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300'
                } font-bold`}
              >
                B
              </button>
            </div>
            <div className="property-grid items-center">
              <label className="text-xs text-gray-500 dark:text-gray-400">斜体</label>
              <button
                onClick={() =>
                  updateElement(selectedElement.id, {
                    fontStyle: selectedElement.fontStyle === 'italic' ? 'normal' : 'italic',
                  })
                }
                className={`w-8 h-8 rounded border ${
                  selectedElement.fontStyle === 'italic'
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300'
                } italic`}
              >
                I
              </button>
            </div>
            <div className="property-grid">
              <label className="text-xs text-gray-500 dark:text-gray-400">对齐</label>
              <select
                value={selectedElement.textAlign}
                onChange={(e) =>
                  updateElement(selectedElement.id, { textAlign: e.target.value as 'left' | 'center' | 'right' | 'justify' })
                }
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
              >
                <option value="left">左对齐</option>
                <option value="center">居中</option>
                <option value="right">右对齐</option>
                <option value="justify">两端对齐</option>
              </select>
            </div>
            <div className="property-grid items-center">
              <label className="text-xs text-gray-500 dark:text-gray-400">颜色</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={typeof selectedElement.fill === 'string' ? selectedElement.fill : '#000000'}
                  onChange={(e) => updateElement(selectedElement.id, { fill: e.target.value })}
                  className="w-8 h-8 rounded-md border border-gray-300 dark:border-slate-600 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'style' && hasSelection && (
          <div className="space-y-4">
            <div className="property-grid">
              <label className="text-xs text-gray-500 dark:text-gray-400">不透明度</label>
              <input
                type="range"
                min="0"
                max="100"
                value={(selectedElement?.opacity || 1) * 100}
                onChange={(e) => updateElement(selectedElement.id, { opacity: Number(e.target.value) / 100 })}
                className="w-full"
              />
              <span className="text-xs text-gray-600 dark:text-gray-400 col-start-2">
                {Math.round((selectedElement?.opacity || 1) * 100)}%
              </span>
            </div>

            <div className="property-grid">
              <label className="text-xs text-gray-500 dark:text-gray-400">混合模式</label>
              <select
                value={selectedElement?.blendMode || 'normal'}
                onChange={(e) => setBlendMode(selectedElement.id, e.target.value as BlendMode)}
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
              >
                {blendModes.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>
            </div>

            {selectedElement?.type === 'shape' && (
              <>
                <div className="property-grid items-center">
                  <label className="text-xs text-gray-500 dark:text-gray-400">填充色</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={typeof selectedElement.fill === 'string' ? selectedElement.fill : '#3b82f6'}
                      onChange={(e) => updateElement(selectedElement.id, { fill: e.target.value })}
                      className="w-8 h-8 rounded-md border border-gray-300 dark:border-slate-600 cursor-pointer"
                    />
                  </div>
                </div>
                <div className="property-grid items-center">
                  <label className="text-xs text-gray-500 dark:text-gray-400">描边色</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={selectedElement.stroke || '#000000'}
                      onChange={(e) => updateElement(selectedElement.id, { stroke: e.target.value })}
                      className="w-8 h-8 rounded-md border border-gray-300 dark:border-slate-600 cursor-pointer"
                    />
                  </div>
                </div>
                <div className="property-grid">
                  <label className="text-xs text-gray-500 dark:text-gray-400">描边宽度</label>
                  <input
                    type="number"
                    min="0"
                    value={selectedElement.strokeWidth}
                    onChange={(e) => updateElement(selectedElement.id, { strokeWidth: Number(e.target.value) })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'layout' && hasSelection && (
          <div className="space-y-4">
            <div className="property-grid">
              <label className="text-xs text-gray-500 dark:text-gray-400">X</label>
              <input
                type="number"
                value={Math.round(selectedElement?.left || 0)}
                onChange={(e) => updateElement(selectedElement.id, { left: Number(e.target.value) })}
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div className="property-grid">
              <label className="text-xs text-gray-500 dark:text-gray-400">Y</label>
              <input
                type="number"
                value={Math.round(selectedElement?.top || 0)}
                onChange={(e) => updateElement(selectedElement.id, { top: Number(e.target.value) })}
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div className="property-grid">
              <label className="text-xs text-gray-500 dark:text-gray-400">宽度</label>
              <input
                type="number"
                value={Math.round((selectedElement?.width || 0) * (selectedElement?.scaleX || 1))}
                onChange={(e) =>
                  updateElement(selectedElement.id, {
                    width: Number(e.target.value) / (selectedElement?.scaleX || 1),
                  })
                }
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div className="property-grid">
              <label className="text-xs text-gray-500 dark:text-gray-400">高度</label>
              <input
                type="number"
                value={Math.round((selectedElement?.height || 0) * (selectedElement?.scaleY || 1))}
                onChange={(e) =>
                  updateElement(selectedElement.id, {
                    height: Number(e.target.value) / (selectedElement?.scaleY || 1),
                  })
                }
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div className="property-grid">
              <label className="text-xs text-gray-500 dark:text-gray-400">旋转</label>
              <input
                type="number"
                value={Math.round(selectedElement?.rotation || 0)}
                onChange={(e) => updateElement(selectedElement.id, { rotation: Number(e.target.value) })}
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div className="border-t border-gray-200 dark:border-slate-700 pt-4 mt-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">图层顺序</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => bringToFront(selectedElement.id)}
                  className="py-2 px-3 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 transition-colors"
                >
                  置于顶层
                </button>
                <button
                  onClick={() => sendToBack(selectedElement.id)}
                  className="py-2 px-3 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 transition-colors"
                >
                  置于底层
                </button>
                <button
                  onClick={() => bringForward(selectedElement.id)}
                  className="py-2 px-3 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 transition-colors"
                >
                  上移一层
                </button>
                <button
                  onClick={() => sendBackward(selectedElement.id)}
                  className="py-2 px-3 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 transition-colors"
                >
                  下移一层
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab !== 'add' && !hasSelection && (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-sm">
            请选择一个元素
          </div>
        )}
      </div>

      {hasSelection && (
        <div className="p-4 border-t border-gray-200 dark:border-slate-700">
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={handleDelete}
              className="py-2 px-3 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
              title="删除 (Delete)"
            >
              删除
            </button>
            <button
              onClick={handleCopy}
              className="py-2 px-3 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm transition-colors"
              title="复制 (Ctrl+C)"
            >
              复制
            </button>
            <button
              onClick={paste}
              className="py-2 px-3 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm transition-colors"
              title="粘贴 (Ctrl+V)"
            >
              粘贴
            </button>
            <button
              onClick={handleDuplicate}
              className="py-2 px-3 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm transition-colors"
              title="克隆 (Ctrl+D)"
            >
              克隆
            </button>
            <button
              onClick={handleLockToggle}
              className={`py-2 px-3 rounded-lg text-sm transition-colors ${
                selectedElement?.locked
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                  : 'bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300'
              }`}
              title={selectedElement?.locked ? '解锁' : '锁定'}
            >
              {selectedElement?.locked ? '解锁' : '锁定'}
            </button>
            <button
              onClick={handleVisibilityToggle}
              className="py-2 px-3 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm transition-colors"
              title={selectedElement?.visible ? '隐藏' : '显示'}
            >
              {selectedElement?.visible ? '隐藏' : '显示'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
