import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Layers, Plus, Trash2, Copy, ChevronDown, ChevronUp, Eye, EyeOff, Lock, Unlock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditorStore } from '@/store/useEditorStore';
import LayerItem from '@/components/layers/LayerItem';

export default function LeftPanel() {
  const { project, activeLayerId, setActiveLayer, addLayer, duplicateLayer, removeLayer } = useEditorStore(
    useShallow((state) => ({
      project: state.project,
      activeLayerId: state.project?.activeLayerId,
      setActiveLayer: state.setActiveLayer,
      addLayer: state.addLayer,
      duplicateLayer: state.duplicateLayer,
      removeLayer: state.removeLayer,
    }))
  );
  const [layersExpanded, setLayersExpanded] = useState(true);
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  const handleAddLayer = () => {
    if (!project) return;
    
    addLayer({
      name: `图层 ${project.layers.length + 1}`,
      type: 'image',
      x: 0,
      y: 0,
      width: project.width,
      height: project.height,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      blendMode: 'normal',
      visible: true,
      locked: false,
      filters: [],
    });
  };

  const handleDuplicateLayer = () => {
    if (activeLayerId) {
      duplicateLayer(activeLayerId);
    }
  };

  const handleDeleteLayer = () => {
    if (activeLayerId && project && project.layers.length > 1) {
      removeLayer(activeLayerId);
    }
  };

  const reversedLayers = project ? [...project.layers].reverse() : [];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-3 border-b border-border-default">
        <button
          onClick={() => setLayersExpanded(!layersExpanded)}
          className="w-full flex items-center justify-between hover:bg-bg-tertiary/50 rounded-lg px-2 py-1.5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-accent-primary" />
            <span className="font-medium text-sm">图层</span>
            <span className="text-xs text-text-muted">
              ({project?.layers.length || 0})
            </span>
          </div>
          {layersExpanded ? (
            <ChevronUp className="w-4 h-4 text-text-muted" />
          ) : (
            <ChevronDown className="w-4 h-4 text-text-muted" />
          )}
        </button>
      </div>

      <AnimatePresence>
        {layersExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto p-2">
              {reversedLayers.length === 0 ? (
                <div className="text-center text-text-muted text-sm py-8">
                  暂无图层
                </div>
              ) : (
                <div className="space-y-1">
                  {reversedLayers.map((layer, index) => (
                    <LayerItem
                      key={layer.id}
                      layer={layer}
                      isActive={layer.id === activeLayerId}
                      layerIndex={project!.layers.length - 1 - index}
                      onSelect={() => setActiveLayer(layer.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="p-2 border-t border-border-default flex items-center gap-1">
              <div className="relative">
                <button
                  onClick={() => setShowLayerMenu(!showLayerMenu)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-bg-tertiary transition-colors text-accent-primary"
                  title="添加图层"
                >
                  <Plus className="w-4 h-4" />
                </button>
                
                {showLayerMenu && (
                  <div className="absolute bottom-full left-0 mb-1 bg-bg-secondary border border-border-default rounded-lg shadow-xl py-1 min-w-32 z-50">
                    <button
                      onClick={() => {
                        handleAddLayer();
                        setShowLayerMenu(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-bg-tertiary"
                    >
                      新建图层
                    </button>
                    <button
                      onClick={() => setShowLayerMenu(false)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-bg-tertiary"
                    >
                      从文件添加
                    </button>
                  </div>
                )}
              </div>
              
              <button
                onClick={handleDuplicateLayer}
                disabled={!activeLayerId}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-bg-tertiary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="复制图层"
              >
                <Copy className="w-4 h-4" />
              </button>
              
              <button
                onClick={handleDeleteLayer}
                disabled={!activeLayerId || (project && project.layers.length <= 1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-bg-tertiary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="删除图层"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              
              <div className="flex-1" />
              
              <button
                onClick={() => {
                  if (activeLayerId) {
                    useEditorStore.getState().toggleLayerVisibility(activeLayerId);
                  }
                }}
                disabled={!activeLayerId}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-bg-tertiary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="显示/隐藏"
              >
                {project?.layers.find(l => l.id === activeLayerId)?.visible ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </button>
              
              <button
                onClick={() => {
                  if (activeLayerId) {
                    useEditorStore.getState().toggleLayerLock(activeLayerId);
                  }
                }}
                disabled={!activeLayerId}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-bg-tertiary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="锁定/解锁"
              >
                {project?.layers.find(l => l.id === activeLayerId)?.locked ? (
                  <Lock className="w-4 h-4" />
                ) : (
                  <Unlock className="w-4 h-4" />
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
