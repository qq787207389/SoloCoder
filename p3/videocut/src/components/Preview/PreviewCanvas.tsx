import React, { useRef, useEffect, useCallback } from 'react';
import { useEditorStore } from '../../store/useEditorStore';

interface ActiveClip {
  clipId: string;
  assetId: string;
  video: HTMLVideoElement;
  clipStartTime: number;
  clipDuration: number;
  sourceStart: number;
  sourceEnd: number;
}

export const PreviewCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoElementsRef = useRef<Map<string, HTMLVideoElement>>(new Map());
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const playbackTimeRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(false);
  const activeClipsRef = useRef<Map<string, ActiveClip>>(new Map());
  const lastDrawTimeRef = useRef<number>(0);

  const {
    assets,
    clips,
    textOverlays,
    currentTime,
    isPlaying,
    setCurrentTime,
    setPlaying,
    tracks,
    duration,
  } = useEditorStore();

  const videoTracks = tracks.filter((t) => t.type === 'video');

  const getOrCreateVideoElement = useCallback(
    (assetId: string, url: string): HTMLVideoElement | null => {
      if (videoElementsRef.current.has(assetId)) {
        return videoElementsRef.current.get(assetId)!;
      }

      const video = document.createElement('video');
      video.src = url;
      video.crossOrigin = 'anonymous';
      video.muted = false;
      video.volume = 0.5;
      video.preload = 'auto';
      videoElementsRef.current.set(assetId, video);
      return video;
    },
    []
  );

  const updateActiveClips = useCallback(
    (time: number) => {
      const newActiveClips = new Map<string, ActiveClip>();

      for (const track of videoTracks) {
        if (track.muted) continue;

        for (const clip of clips) {
          if (clip.trackId !== track.id) continue;
          if (time < clip.startTime || time >= clip.startTime + clip.duration) continue;

          const asset = assets.find((a) => a.id === clip.assetId);
          if (!asset) continue;

          const video = getOrCreateVideoElement(asset.id, asset.url);
          if (!video) continue;

          const clipTime = time - clip.startTime;
          const sourceTime = clip.sourceStart + clipTime;

          if (!activeClipsRef.current.has(clip.id)) {
            video.currentTime = Math.min(sourceTime, clip.sourceEnd - 0.05);
            if (isPlayingRef.current) {
              video.play().catch(() => {});
            }
          } else {
            const activeClip = activeClipsRef.current.get(clip.id)!;
            if (activeClip.sourceStart !== clip.sourceStart || activeClip.sourceEnd !== clip.sourceEnd) {
              video.currentTime = Math.min(sourceTime, clip.sourceEnd - 0.05);
            } else if (video.currentTime >= clip.sourceEnd) {
              video.currentTime = clip.sourceStart;
            }
          }

          newActiveClips.set(clip.id, {
            clipId: clip.id,
            assetId: clip.assetId,
            video,
            clipStartTime: clip.startTime,
            clipDuration: clip.duration,
            sourceStart: clip.sourceStart,
            sourceEnd: clip.sourceEnd,
          });
        }
      }

      activeClipsRef.current.forEach((activeClip, clipId) => {
        if (!newActiveClips.has(clipId)) {
          activeClip.video.pause();
        }
      });

      activeClipsRef.current = newActiveClips;
    },
    [videoTracks, clips, assets, getOrCreateVideoElement]
  );

  const renderFrame = useCallback(
    (time: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const { width, height } = canvas;

      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);

      updateActiveClips(time);

      activeClipsRef.current.forEach((activeClip) => {
        const asset = assets.find((a) => a.id === activeClip.assetId);
        if (!asset) return;

        const { video } = activeClip;

        if (video.readyState >= 2) {
          const scale = Math.min(width / asset.width, height / asset.height);
          const drawWidth = asset.width * scale;
          const drawHeight = asset.height * scale;
          const x = (width - drawWidth) / 2;
          const y = (height - drawHeight) / 2;

          try {
            ctx.drawImage(video, x, y, drawWidth, drawHeight);
          } catch (e) {
            console.warn('Failed to draw video frame:', e);
          }
        }
      });

      textOverlays.forEach((overlay) => {
        if (time >= overlay.startTime && time < overlay.endTime) {
          ctx.font = `${overlay.fontSize}px ${overlay.fontFamily}`;
          ctx.fillStyle = overlay.color;
          ctx.textAlign = overlay.textAlign as CanvasTextAlign;
          ctx.textBaseline = 'top';

          let x = overlay.x;
          if (overlay.textAlign === 'center') {
            x = width / 2;
          } else if (overlay.textAlign === 'right') {
            x = width - overlay.x;
          }

          ctx.shadowColor = 'rgba(0,0,0,0.8)';
          ctx.shadowBlur = 4;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;

          ctx.fillText(overlay.text, x, overlay.y);

          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
        }
      });
    },
    [assets, textOverlays, updateActiveClips]
  );

  useEffect(() => {
    if (!isPlaying) {
      isPlayingRef.current = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      activeClipsRef.current.forEach((activeClip) => {
        activeClip.video.pause();
      });

      renderFrame(currentTime);
      return;
    }

    isPlayingRef.current = true;
    playbackTimeRef.current = currentTime;
    lastTimeRef.current = performance.now();

    activeClipsRef.current.forEach((activeClip) => {
      const clipTime = currentTime - activeClip.clipStartTime;
      const sourceTime = activeClip.sourceStart + clipTime;
      activeClip.video.currentTime = Math.min(sourceTime, activeClip.sourceEnd - 0.05);
      activeClip.video.play().catch(() => {});
    });

    const animate = () => {
      if (!isPlayingRef.current) return;

      const now = performance.now();
      const delta = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      playbackTimeRef.current += delta;

      if (playbackTimeRef.current >= duration) {
        playbackTimeRef.current = 0;
        isPlayingRef.current = false;
        setCurrentTime(0);
        setPlaying(false);

        activeClipsRef.current.forEach((activeClip) => {
          activeClip.video.pause();
        });
        return;
      }

      setCurrentTime(playbackTimeRef.current);
      renderFrame(playbackTimeRef.current);

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) {
      renderFrame(currentTime);
    }
  }, [currentTime, isPlaying, renderFrame]);

  useEffect(() => {
    if (!isPlaying && Math.abs(playbackTimeRef.current - currentTime) > 0.01) {
      playbackTimeRef.current = currentTime;
    }
  }, [currentTime, isPlaying]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      videoElementsRef.current.forEach((video) => {
        video.pause();
        video.src = '';
      });
      videoElementsRef.current.clear();
    };
  }, []);

  return (
    <div className="flex-1 flex items-center justify-center bg-slate-950 p-4">
      <div className="relative bg-black shadow-2xl rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          width={640}
          height={360}
          className="block"
        />
        {clips.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 bg-black/80">
            <p className="text-sm mb-2">没有视频片段</p>
            <p className="text-xs">导入视频并添加到时间轴以开始编辑</p>
          </div>
        )}
      </div>
    </div>
  );
};
