import { useShallow } from 'zustand/react/shallow';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { useEditorStore } from '@/store/useEditorStore';

export default function StatusBar() {
  const { project, canvas, setZoom, resetCanvas } = useEditorStore(
    useShallow((state) => ({
      project: state.project,
      canvas: state.canvas,
      setZoom: state.setZoom,
      resetCanvas: state.resetCanvas,
    }))
  );

  const handleZoomIn = () => {
    setZoom(canvas.zoom * 1.2);
  };

  const handleZoomOut = () => {
    setZoom(canvas.zoom * 0.8);
  };

  const handleZoomReset = () => {
    resetCanvas();
  };

  return (
    <footer className="h-8 bg-bg-secondary border-t border-border-default flex items-center justify-between px-4">
      <div className="flex items-center gap-4 text-xs text-text-secondary">
        <span>
          画布: {project?.width} × {project?.height}px
        </span>
        <span className="text-border-default">|</span>
        <span>
          图层: {project?.layers.length}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleZoomOut}
          className="p-1 rounded hover:bg-bg-tertiary transition-colors"
          title="缩小"
        >
          <ZoomOut className="w-3.5 h-3.5 text-text-secondary" />
        </button>
        
        <span className="text-xs text-text-secondary w-16 text-center">
          {Math.round(canvas.zoom * 100)}%
        </span>
        
        <button
          onClick={handleZoomIn}
          className="p-1 rounded hover:bg-bg-tertiary transition-colors"
          title="放大"
        >
          <ZoomIn className="w-3.5 h-3.5 text-text-secondary" />
        </button>
        
        <button
          onClick={handleZoomReset}
          className="p-1 rounded hover:bg-bg-tertiary transition-colors ml-2"
          title="适应画布"
        >
          <Maximize2 className="w-3.5 h-3.5 text-text-secondary" />
        </button>
      </div>
    </footer>
  );
}
