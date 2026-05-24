import React, { useRef, useState, useCallback } from 'react';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { Track } from './Track';
import { Playhead } from './Playhead';
import { formatTime, pixelsToTime, timeToPixels, generateId } from '../../types';

export const Timeline: React.FC = () => {
  const {
    tracks,
    clips,
    assets,
    currentTime,
    zoom,
    setZoom,
    setCurrentTime,
    addClip,
    updateDuration,
  } = useEditorStore();

  const timelineRef = useRef<HTMLDivElement>(null);
  const rulerRef = useRef<HTMLDivElement>(null);
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);
  const [scrollLeft, setScrollLeft] = useState(0);

  const totalDuration = useEditorStore.getState().duration;
  const timelineWidth = timeToPixels(totalDuration, zoom);

  const generateTimeMarkers = useCallback(() => {
    const markers: { time: number; label: string; major: boolean }[] = [];
    const interval = zoom > 2 ? 1 : zoom > 0.5 ? 5 : 10;

    for (let t = 0; t <= totalDuration; t += interval) {
      markers.push({
        time: t,
        label: formatTime(t),
        major: t % (interval * 5) === 0,
      });
    }
    return markers;
  }, [zoom, totalDuration]);

  const handleRulerClick = (e: React.MouseEvent) => {
    if (!rulerRef.current) return;
    const rect = rulerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + scrollLeft;
    const time = pixelsToTime(x, zoom);
    setCurrentTime(Math.max(0, Math.min(time, totalDuration)));
  };

  const handlePlayheadMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDraggingPlayhead(true);
  };

  React.useEffect(() => {
    if (!isDraggingPlayhead) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!rulerRef.current) return;
      const rect = rulerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left + scrollLeft;
      const time = pixelsToTime(x, zoom);
      setCurrentTime(Math.max(0, Math.min(time, totalDuration)));
    };

    const handleMouseUp = () => {
      setIsDraggingPlayhead(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingPlayhead, zoom, totalDuration, scrollLeft, setCurrentTime]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollLeft(e.currentTarget.scrollLeft);
  };

  const handleDrop = (trackId: string, x: number) => {
    const assetId = useEditorStore.getState().assets[0]?.id;
    if (!assetId) return;

    const asset = assets.find((a) => a.id === assetId);
    if (!asset) return;

    const startTime = pixelsToTime(x + scrollLeft, zoom);
    const duration = Math.min(10, asset.duration);

    addClip({
      assetId,
      trackId,
      startTime: Math.max(0, startTime),
      duration,
      sourceStart: 0,
      sourceEnd: duration,
      volume: 1,
    });
    updateDuration();
  };

  const handleAssetDrop = (trackId: string, x: number, assetId: string) => {
    const asset = assets.find((a) => a.id === assetId);
    if (!asset) return;

    const startTime = pixelsToTime(x + scrollLeft, zoom);
    const duration = Math.min(10, asset.duration);

    addClip({
      assetId,
      trackId,
      startTime: Math.max(0, startTime),
      duration,
      sourceStart: 0,
      sourceEnd: duration,
      volume: 1,
    });
    updateDuration();
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-t border-slate-700">
      <div className="flex items-center justify-between px-2 py-1.5 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-400 w-32">轨道</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoom(zoom * 0.7)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
            title="缩小"
          >
            <ZoomOut size={14} />
          </button>
          <span className="text-xs text-slate-400 w-12 text-center">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom(zoom * 1.3)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
            title="放大"
          >
            <ZoomIn size={14} />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
            title="重置缩放"
          >
            <Maximize2 size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex border-b border-slate-700">
          <div className="w-32 flex-shrink-0 bg-slate-800 border-r border-slate-700" />
          <div
            ref={rulerRef}
            className="flex-1 h-8 bg-slate-800 relative overflow-hidden cursor-crosshair"
            onClick={handleRulerClick}
          >
            <div
              className="absolute top-0 left-0 h-full"
              style={{ width: `${timelineWidth}px`, transform: `translateX(-${scrollLeft}px)` }}
            >
              {generateTimeMarkers().map((marker) => (
                <div
                  key={marker.time}
                  className="absolute top-0"
                  style={{ left: `${timeToPixels(marker.time, zoom)}px` }}
                >
                  <div
                    className={`bg-slate-500 ${marker.major ? 'w-px h-3' : 'w-px h-1.5'}`}
                  />
                  {marker.major && (
                    <span className="text-[10px] text-slate-400 mt-0.5 font-mono">
                      {marker.label}
                    </span>
                  )}
                </div>
              ))}
              <div
                className="absolute top-0 z-10 cursor-ew-resize"
                style={{
                  left: `${timeToPixels(currentTime, zoom)}px`,
                  transform: 'translateX(-50%)',
                }}
                onMouseDown={handlePlayheadMouseDown}
              >
                <div
                  className="w-0 h-0"
                  style={{
                    borderLeft: '6px solid transparent',
                    borderRight: '6px solid transparent',
                    borderTop: '6px solid #ef4444',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div
          ref={timelineRef}
          className="flex-1 overflow-x-auto overflow-y-auto"
          onScroll={handleScroll}
        >
          <div className="relative" style={{ minWidth: `${timelineWidth}px` }}>
            <Playhead
              currentTime={currentTime}
              zoom={zoom}
              timelineWidth={timelineWidth}
            />
            {tracks.map((track) => (
              <Track
                key={track.id}
                track={track}
                clips={clips}
                assets={assets}
                zoom={zoom}
                onDrop={(trackId, x) => handleDrop(trackId, x)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
