import { useState, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { GripVertical, Eye, EyeOff, Lock, Unlock, Image, Type } from 'lucide-react';
import { motion } from 'framer-motion';
import { Layer } from '@/types/layer';
import { useEditorStore } from '@/store/useEditorStore';

interface LayerItemProps {
  layer: Layer;
  isActive: boolean;
  layerIndex: number;
  onSelect: () => void;
}

export default function LayerItem({ layer, isActive, layerIndex, onSelect }: LayerItemProps) {
  const { updateLayer } = useEditorStore(
    useShallow((state) => ({
      updateLayer: state.updateLayer,
    }))
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(layer.name);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDoubleClick = () => {
    if (!layer.locked) {
      setIsEditing(true);
      setEditName(layer.name);
      setTimeout(() => inputRef.current?.select(), 0);
    }
  };

  const handleNameSubmit = () => {
    if (editName.trim()) {
      updateLayer(layer.id, { name: editName.trim() });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSubmit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  const toggleVisibility = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateLayer(layer.id, { visible: !layer.visible });
  };

  const toggleLock = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateLayer(layer.id, { locked: !layer.locked });
  };

  const getLayerIcon = () => {
    switch (layer.type) {
      case 'text':
        return <Type className="w-4 h-4" />;
      default:
        return <Image className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      onClick={onSelect}
      onDoubleClick={handleDoubleClick}
      className={`group relative flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-all duration-150 ${
        isActive ? 'layer-item-selected' : 'hover:bg-bg-tertiary/50'
      } ${layer.locked ? 'opacity-60' : ''}`}
    >
      <div className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
        <GripVertical className="w-3 h-3 text-text-muted" />
      </div>

      <div className="w-10 h-10 rounded-lg bg-bg-tertiary flex items-center justify-center overflow-hidden">
        {layer.imageSource ? (
          <img
            src={layer.imageSource}
            alt={layer.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-text-muted">{getLayerIcon()}</div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleNameSubmit}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-transparent border-b border-accent-primary outline-none text-sm"
            autoFocus
          />
        ) : (
          <div>
            <p className="text-sm font-medium truncate">{layer.name}</p>
            <p className="text-xs text-text-muted">
              {Math.round(layer.width)} × {Math.round(layer.height)}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={toggleVisibility}
          className="p-1 rounded hover:bg-bg-tertiary/50 transition-colors"
          title={layer.visible ? '隐藏图层' : '显示图层'}
        >
          {layer.visible ? (
            <Eye className="w-3.5 h-3.5 text-text-secondary" />
          ) : (
            <EyeOff className="w-3.5 h-3.5 text-text-muted" />
          )}
        </button>
        
        <button
          onClick={toggleLock}
          className="p-1 rounded hover:bg-bg-tertiary/50 transition-colors"
          title={layer.locked ? '解锁图层' : '锁定图层'}
        >
          {layer.locked ? (
            <Lock className="w-3.5 h-3.5 text-accent-primary" />
          ) : (
            <Unlock className="w-3.5 h-3.5 text-text-muted" />
          )}
        </button>
      </div>
    </motion.div>
  );
}
