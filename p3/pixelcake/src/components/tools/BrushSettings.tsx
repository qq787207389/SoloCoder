import { useShallow } from 'zustand/react/shallow';
import { useToolStore } from '@/store/useToolStore';

export default function BrushSettings() {
  const { currentTool, brush, eraser, updateBrush, updateEraser } = useToolStore(
    useShallow((state) => ({
      currentTool: state.currentTool,
      brush: state.brush,
      eraser: state.eraser,
      updateBrush: state.updateBrush,
      updateEraser: state.updateEraser,
    }))
  );

  const settings = currentTool === 'eraser' ? eraser : brush;
  const updateSettings = currentTool === 'eraser' ? updateEraser : updateBrush;

  return (
    <div className="p-3 space-y-4">
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="text-xs text-text-secondary">大小</label>
          <span className="text-xs text-text-muted">{settings.size}px</span>
        </div>
        <input
          type="range"
          min="1"
          max="500"
          value={settings.size}
          onChange={(e) => updateSettings({ size: parseInt(e.target.value) })}
          className="w-full"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="text-xs text-text-secondary">硬度</label>
          <span className="text-xs text-text-muted">{settings.hardness}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={settings.hardness}
          onChange={(e) => updateSettings({ hardness: parseInt(e.target.value) })}
          className="w-full"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="text-xs text-text-secondary">不透明度</label>
          <span className="text-xs text-text-muted">{settings.opacity}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={settings.opacity}
          onChange={(e) => updateSettings({ opacity: parseInt(e.target.value) })}
          className="w-full"
        />
      </div>

      {currentTool === 'brush' && (
        <div>
          <label className="block text-xs text-text-secondary mb-1.5">颜色</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={brush.color}
              onChange={(e) => updateBrush({ color: e.target.value })}
              className="w-10 h-10 rounded-lg border border-border-default cursor-pointer bg-transparent"
            />
            <input
              type="text"
              value={brush.color}
              onChange={(e) => updateBrush({ color: e.target.value })}
              className="flex-1 bg-bg-tertiary border border-border-default rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent-primary"
            />
          </div>
        </div>
      )}

      {currentTool === 'brush' && (
        <div>
          <label className="block text-xs text-text-secondary mb-1.5">流量</label>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs text-text-muted">{brush.flow}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={brush.flow}
            onChange={(e) => updateBrush({ flow: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>
      )}
    </div>
  );
}
