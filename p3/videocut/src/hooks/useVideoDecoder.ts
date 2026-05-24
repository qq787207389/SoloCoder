import { useRef, useCallback, useEffect } from 'react';

interface FrameCache {
  [key: number]: VideoFrame;
}

export const useVideoDecoder = (videoUrl: string | null) => {
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameCacheRef = useRef<FrameCache>({});
  const lastSeekTimeRef = useRef<number>(0);

  useEffect(() => {
    if (videoUrl) {
      const video = document.createElement('video');
      video.src = videoUrl;
      video.crossOrigin = 'anonymous';
      video.muted = true;
      video.preload = 'auto';
      videoElementRef.current = video;

      const canvas = document.createElement('canvas');
      canvasRef.current = canvas;

      return () => {
        video.pause();
        video.src = '';
        Object.values(frameCacheRef.current).forEach((frame) => frame.close());
        frameCacheRef.current = {};
      };
    }
  }, [videoUrl]);

  const getFrameAtTime = useCallback(
    async (time: number, width: number, height: number): Promise<ImageData | null> => {
      const video = videoElementRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return null;

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      const cacheKey = Math.floor(time * 10) / 10;

      return new Promise((resolve) => {
        const handleSeeked = () => {
          ctx.drawImage(video, 0, 0, width, height);
          const imageData = ctx.getImageData(0, 0, width, height);
          video.onseeked = null;
          resolve(imageData);
        };

        video.onseeked = handleSeeked;
        video.currentTime = Math.min(time, video.duration - 0.1);
        lastSeekTimeRef.current = time;
      });
    },
    []
  );

  const getVideoInfo = useCallback(async (): Promise<{
    duration: number;
    width: number;
    height: number;
    hasAudio: boolean;
  } | null> => {
    const video = videoElementRef.current;
    if (!video) return null;

    return new Promise((resolve) => {
      const handleLoadedMetadata = () => {
        const hasAudio = true;
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        resolve({
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight,
          hasAudio,
        });
      };

      if (video.readyState >= 1) {
        handleLoadedMetadata();
      } else {
        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.load();
      }
    });
  }, []);

  return {
    getFrameAtTime,
    getVideoInfo,
    videoElement: videoElementRef.current,
  };
};
