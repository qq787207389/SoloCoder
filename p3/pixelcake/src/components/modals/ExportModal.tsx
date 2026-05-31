import { useState, useRef, useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { X, Download, Image, FileImage, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditorStore } from '@/store/useEditorStore';
import { 
  ExportFormat, 
  DEFAULT_EXPORT_SETTINGS,
  EXPORT_FORMAT_LABELS,
  EXPORT_FORMAT_EXTENSIONS 
} from '@/types/export';

interface ExportModalProps {
  onClose: () => void;
}

export default function ExportModal({ onClose }: ExportModalProps) {
  const { project } = useEditorStore(
    useShallow((state) => ({ project: state.project }))
  );
  const [settings, setSettings] = useState(DEFAULT_EXPORT_SETTINGS);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!project || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = project.width;
    canvas.height = project.height;

    const loadAndDraw = async () => {
      ctx.fillStyle = settings.transparent ? 'transparent' : '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (const layer of project.layers) {
        if (!layer.visible || !layer.imageSource) continue;

        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        
        await new Promise((resolve) => {
          img.onload = resolve;
          img.src = layer.imageSource!;
        });

        ctx.save();
        ctx.globalAlpha = layer.opacity;
        ctx.translate(
          layer.x + (layer.width * layer.scaleX) / 2,
          layer.y + (layer.height * layer.scaleY) / 2
        );
        ctx.rotate((layer.rotation * Math.PI) / 180);
        ctx.scale(layer.scaleX, layer.scaleY);
        ctx.translate(-layer.width / 2, -layer.height / 2);
        ctx.drawImage(img, 0, 0, layer.width, layer.height);
        ctx.restore();
      }

      setPreviewUrl(canvas.toDataURL('image/png'));
    };

    loadAndDraw();
  }, [project, settings.transparent]);

  const handleExport = async () => {
    if (!project || !canvasRef.current) return;
    
    setIsExporting(true);

    try {
      const canvas = canvasRef.current;
      const scaledWidth = Math.round(project.width * settings.scale);
      const scaledHeight = Math.round(project.height * settings.scale);

      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = scaledWidth;
      exportCanvas.height = scaledHeight;
      const ctx = exportCanvas.getContext('2d')!;

      ctx.fillStyle = settings.transparent ? 'transparent' : '#ffffff';
      ctx.fillRect(0, 0, scaledWidth, scaledHeight);

      for (const layer of project.layers) {
        if (!layer.visible || !layer.imageSource) continue;

        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        
        await new Promise((resolve) => {
          img.onload = resolve;
          img.src = layer.imageSource!;
        });

        ctx.save();
        ctx.globalAlpha = layer.opacity;
        ctx.translate(
          (layer.x + (layer.width * layer.scaleX) / 2) * settings.scale,
          (layer.y + (layer.height * layer.scaleY) / 2) * settings.scale
        );
        ctx.rotate((layer.rotation * Math.PI) / 180);
        ctx.scale(layer.scaleX * settings.scale, layer.scaleY * settings.scale);
        ctx.translate(-layer.width / 2, -layer.height / 2);
        ctx.drawImage(img, 0, 0, layer.width, layer.height);
        ctx.restore();
      }

      const mimeType = settings.format === 'png' 
        ? 'image/png' 
        : settings.format === 'jpeg' 
          ? 'image/jpeg' 
          : 'image/webp';
      
      const quality = settings.format === 'png' ? undefined : settings.quality;
      const dataUrl = exportCanvas.toDataURL(mimeType, quality);

      const link = document.createElement('a');
      link.download = `${settings.filename}${EXPORT_FORMAT_EXTENSIONS[settings.format]}`;
      link.href = dataUrl;
      link.click();

      onClose();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!project) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
        onClick={handleBackdropClick}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-bg-secondary rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          <div className="flex items-center justify-between p-4 border-b border-border-default">
            <h2 className="text-xl font-semibold font-poppins">导出图片</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-bg-tertiary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-auto p-6">
            <div className="flex gap-6">
              <div className="flex-1">
                <label className="block text-sm text-text-secondary mb-2">预览</label>
                <div className="aspect-video bg-bg-tertiary rounded-lg overflow-hidden flex items-center justify-center canvas-checkerboard">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <div className="text-text-muted">加载中...</div>
                  )}
                </div>
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="w-64 space-y-4">
                <div>
                  <label className="block text-sm text-text-secondary mb-2">
                    <Settings className="w-4 h-4 inline mr-1" />
                    格式
                  </label>
                  <div className="space-y-2">
                    {(['png', 'jpeg', 'webp'] as ExportFormat[]).map((format) => (
                      <button
                        key={format}
                        onClick={() => setSettings((s) => ({ ...s, format }))}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg border transition-colors ${
                          settings.format === format
                            ? 'border-accent-primary bg-accent-primary/10'
                            : 'border-border-default hover:border-border-hover'
                        }`}
                      >
                        {format === 'png' ? (
                          <FileImage className="w-5 h-5 text-accent-secondary" />
                        ) : (
                          <Image className="w-5 h-5 text-accent-secondary" />
                        )}
                        <span className="text-sm">{EXPORT_FORMAT_LABELS[format]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {settings.format !== 'png' && (
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-sm text-text-secondary">质量</label>
                      <span className="text-sm text-text-muted">
                        {Math.round(settings.quality * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.05"
                      value={settings.quality}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, quality: parseFloat(e.target.value) }))
                      }
                      className="w-full"
                    />
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-sm text-text-secondary">缩放</label>
                    <span className="text-sm text-text-muted">
                      {Math.round(settings.scale * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="3"
                    step="0.1"
                    value={settings.scale}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, scale: parseFloat(e.target.value) }))
                    }
                    className="w-full"
                  />
                  <p className="text-xs text-text-muted mt-1">
                    {Math.round(project.width * settings.scale)} × {Math.round(project.height * settings.scale)}px
                  </p>
                </div>

                {settings.format !== 'jpeg' && (
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-text-secondary">透明背景</label>
                    <button
                      onClick={() =>
                        setSettings((s) => ({ ...s, transparent: !s.transparent }))
                      }
                      className={`w-12 h-6 rounded-full transition-colors ${
                        settings.transparent
                          ? 'bg-accent-primary'
                          : 'bg-border-default'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                          settings.transparent ? 'translate-x-6' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-sm text-text-secondary mb-1.5">文件名</label>
                  <input
                    type="text"
                    value={settings.filename}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, filename: e.target.value }))
                    }
                    className="w-full bg-bg-tertiary border border-border-default rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent-primary"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 p-4 border-t border-border-default">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg border border-border-default hover:bg-bg-tertiary transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="px-5 py-2 bg-accent-primary hover:bg-accent-hover disabled:opacity-50 rounded-lg text-white font-medium transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {isExporting ? '导出中...' : '导出'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
