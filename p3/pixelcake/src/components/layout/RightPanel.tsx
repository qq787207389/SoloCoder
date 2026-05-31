import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { 
  Sliders, 
  Palette, 
  Settings, 
  ChevronDown, 
  ChevronUp,
  Layers,
  Eye,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditorStore } from '@/store/useEditorStore';
import { useToolStore } from '@/store/useToolStore';
import { BLEND_MODES } from '@/types/layer';
import FilterPanel from '@/components/filters/FilterPanel';
import BrushSettings from '@/components/tools/BrushSettings';
import { TOOL_LABELS } from '@/types/tool';

export default function RightPanel() {
  const { project, activeLayerId, updateLayer } = useEditorStore(
    useShallow((state) => ({
      project: state.project,
      activeLayerId: state.project?.activeLayerId,
      updateLayer: state.updateLayer,
    }))
  );
  const { currentTool } = useToolStore(
    useShallow((state) => ({
      currentTool: state.currentTool,
    }))
  );
  
  const [propertiesExpanded, setPropertiesExpanded] = useState(true);
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  const [toolSettingsExpanded, setToolSettingsExpanded] = useState(true);

  const activeLayer = project?.layers.find(l => l.id === activeLayerId);

  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (activeLayerId) {
      updateLayer(activeLayerId, { opacity: parseFloat(e.target.value) });
    }
  };

  const handleBlendModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (activeLayerId) {
      updateLayer(activeLayerId, { blendMode: e.target.value as any });
    }
  };

  const handleRotationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (activeLayerId) {
      updateLayer(activeLayerId, { rotation: parseFloat(e.target.value) });
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-3 border-b border-border-default">
        <button
          onClick={() => setToolSettingsExpanded(!toolSettingsExpanded)}
          className="w-full flex items-center justify-between hover:bg-bg-tertiary/50 rounded-lg px-2 py-1.5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-accent-secondary" />
            <span className="font-medium text-sm">{TOOL_LABELS[currentTool]}设置</span>
          </div>
          {toolSettingsExpanded ? (
            <ChevronUp className="w-4 h-4 text-text-muted" />
          ) : (
            <ChevronDown className="w-4 h-4 text-text-muted" />
          )}
        </button>
      </div>

      <AnimatePresence>
        {toolSettingsExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-border-default"
          >
            {(currentTool === 'brush' || currentTool === 'eraser' || currentTool === 'stamp') && (
              <BrushSettings />
            )}
            {currentTool === 'text' && (
              <div className="p-3">
                <p className="text-sm text-text-secondary">文字工具设置</p>
              </div>
            )}
            {currentTool === 'select' && (
              <div className="p-3">
                <p className="text-sm text-text-secondary">点击图层进行选择和变换</p>
              </div>
            )}
            {currentTool === 'crop' && (
              <div className="p-3">
                <p className="text-sm text-text-secondary">拖拽裁剪框调整大小</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-3 border-b border-border-default">
        <button
          onClick={() => setPropertiesExpanded(!propertiesExpanded)}
          className="w-full flex items-center justify-between hover:bg-bg-tertiary/50 rounded-lg px-2 py-1.5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-accent-primary" />
            <span className="font-medium text-sm">图层属性</span>
          </div>
          {propertiesExpanded ? (
            <ChevronUp className="w-4 h-4 text-text-muted" />
          ) : (
            <ChevronDown className="w-4 h-4 text-text-muted" />
          )}
        </button>
      </div>

      <AnimatePresence>
        {propertiesExpanded && activeLayer && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 border-b border-border-default space-y-4"
          >
            <div>
              <label className="block text-xs text-text-secondary mb-1.5">
                混合模式
              </label>
              <select
                value={activeLayer.blendMode}
                onChange={handleBlendModeChange}
                className="w-full bg-bg-tertiary border border-border-default rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent-primary"
              >
                {BLEND_MODES.map((mode) => (
                  <option key={mode.value} value={mode.value}>
                    {mode.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs text-text-secondary">不透明度</label>
                <span className="text-xs text-text-muted">
                  {Math.round(activeLayer.opacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={activeLayer.opacity}
                onChange={handleOpacityChange}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs text-text-secondary">旋转</label>
                <span className="text-xs text-text-muted">
                  {activeLayer.rotation.toFixed(1)}°
                </span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                step="0.1"
                value={activeLayer.rotation}
                onChange={handleRotationChange}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-text-secondary mb-1">X</label>
                <input
                  type="number"
                  value={Math.round(activeLayer.x)}
                  onChange={(e) => updateLayer(activeLayerId!, { x: parseFloat(e.target.value) })}
                  className="w-full bg-bg-tertiary border border-border-default rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-accent-primary"
                />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1">Y</label>
                <input
                  type="number"
                  value={Math.round(activeLayer.y)}
                  onChange={(e) => updateLayer(activeLayerId!, { y: parseFloat(e.target.value) })}
                  className="w-full bg-bg-tertiary border border-border-default rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-accent-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-text-secondary mb-1">宽度</label>
                <input
                  type="number"
                  value={Math.round(activeLayer.width * activeLayer.scaleX)}
                  onChange={(e) => {
                    const newWidth = parseFloat(e.target.value);
                    updateLayer(activeLayerId!, { 
                      scaleX: newWidth / activeLayer.width 
                    });
                  }}
                  className="w-full bg-bg-tertiary border border-border-default rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-accent-primary"
                />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1">高度</label>
                <input
                  type="number"
                  value={Math.round(activeLayer.height * activeLayer.scaleY)}
                  onChange={(e) => {
                    const newHeight = parseFloat(e.target.value);
                    updateLayer(activeLayerId!, { 
                      scaleY: newHeight / activeLayer.height 
                    });
                  }}
                  className="w-full bg-bg-tertiary border border-border-default rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-accent-primary"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-3 border-b border-border-default">
        <button
          onClick={() => setFiltersExpanded(!filtersExpanded)}
          className="w-full flex items-center justify-between hover:bg-bg-tertiary/50 rounded-lg px-2 py-1.5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-accent-primary" />
            <span className="font-medium text-sm">滤镜</span>
            {activeLayer && (
              <span className="text-xs text-text-muted">
                ({activeLayer.filters.length})
              </span>
            )}
          </div>
          {filtersExpanded ? (
            <ChevronUp className="w-4 h-4 text-text-muted" />
          ) : (
            <ChevronDown className="w-4 h-4 text-text-muted" />
          )}
        </button>
      </div>

      <AnimatePresence>
        {filtersExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex-1 overflow-hidden"
          >
            <FilterPanel />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
