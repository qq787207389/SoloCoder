import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Trash2, Volume2, VolumeX } from 'lucide-react';
import { Clip as ClipType, MediaAsset, timeToPixels } from '../../types';
import { drawWaveform } from '../../utils/waveform';
import { imageDataToDataURL } from '../../utils/thumbnail';

interface ClipProps {
  clip: ClipType;
  asset: MediaAsset | undefined;
  isSelected: boolean;
  zoom: number;
  trackHeight: number;
  onSelect: () => void;
  onMove: (deltaX: number) => void;
  onResizeLeft: (deltaX: number) => void;
  onResizeRight: (deltaX: number) => void;
  onDelete: () => void;
  onToggleMute: () => void;
}

export const ClipComponent: React.FC<ClipProps> = ({
  clip,
  asset,
  isSelected,
  zoom,
  trackHeight,
  onSelect,
  onMove,
  onResizeLeft,
  onResizeRight,
  onDelete,
  onToggleMute,
}) => {
  const clipRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<'move' | 'left' | 'right' | null>(null);
  const [startX, setStartX] = useState(0);

  const width = timeToPixels(clip.duration, zoom);
  const left = timeToPixels(clip.startTime, zoom);
  const isMuted = clip.volume === 0;

  useEffect(() => {
    if (!asset || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = trackHeight - 4;

    if (asset.waveformData && asset.waveformData.length > 0) {
      drawWaveform(ctx, asset.waveformData, width, trackHeight - 4, isSelected ? '#60a5fa' : '#3b82f6');
    } else if (asset.thumbnailUrl) {
      const thumbWidth = (trackHeight - 4) * (16 / 9);
      const numThumbs = Math.max(1, Math.floor(width / thumbWidth));
      
      for (let i = 0; i < numThumbs; i++) {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(i * thumbWidth, 0, thumbWidth, trackHeight - 4);
        ctx.drawImage(
          canvas.ownerDocument.createElement('img'),
          i * thumbWidth,
          0,
          thumbWidth,
          trackHeight - 4
        );
      }
    }
  }, [asset, width, trackHeight, isSelected]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, type: 'move' | 'left' | 'right') => {
      e.stopPropagation();
      setDragType(type);
      setIsDragging(true);
      setStartX(e.clientX);
      onSelect();
    },
    [onSelect]
  );

  useEffect(() => {
    if (!isDragging || !dragType) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      if (dragType === 'move') {
        onMove(deltaX);
      } else if (dragType === 'left') {
        onResizeLeft(deltaX);
      } else if (dragType === 'right') {
        onResizeRight(deltaX);
      }
      setStartX(e.clientX);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDragType(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragType, startX, onMove, onResizeLeft, onResizeRight]);

  return (
    <div
      ref={clipRef}
      className={`absolute top-0.5 rounded cursor-move transition-shadow ${
        isSelected ? 'ring-2 ring-blue-400 shadow-lg' : 'hover:ring-1 hover:ring-blue-300'
      }`}
      style={{
        left: `${left}px`,
        width: `${width}px`,
        height: `${trackHeight - 4}px`,
        backgroundColor: isSelected ? '#1e3a5f' : '#1e293b',
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onMouseDown={(e) => handleMouseDown(e, 'move')}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 rounded opacity-60"
        style={{ pointerEvents: 'none' }}
      />

      <div className="absolute inset-x-1 top-1 flex items-center justify-between text-xs">
        <span className="text-white truncate max-w-[60%] bg-black/50 px-1 rounded">
          {asset?.name || clip.id.slice(0, 6)}
        </span>
        <div className="flex items-center gap-0.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleMute();
            }}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-600 rounded transition-colors"
          >
            {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 text-slate-400 hover:text-red-400 hover:bg-slate-600 rounded transition-colors"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      <div
        className="absolute left-0 top-0 w-2 h-full cursor-ew-resize hover:bg-blue-400/30 rounded-l transition-colors z-10"
        onMouseDown={(e) => handleMouseDown(e, 'left')}
      />
      <div
        className="absolute right-0 top-0 w-2 h-full cursor-ew-resize hover:bg-blue-400/30 rounded-r transition-colors z-10"
        onMouseDown={(e) => handleMouseDown(e, 'right')}
      />
    </div>
  );
};
