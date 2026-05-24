import { useState, useCallback } from 'react';
import { generateThumbnail, generateThumbnailStrip, imageDataToDataURL } from '../utils/thumbnail';
import { generateWaveformData } from '../utils/waveform';
import { audioProcessor } from '../utils/audioProcessor';

interface AnalysisResult {
  duration: number;
  width: number;
  height: number;
  thumbnailUrl: string;
  thumbnails: ImageData[];
  waveformData: number[];
  audioBuffer: AudioBuffer | null;
}

export const useMediaAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);

  const analyzeMedia = useCallback(
    async (file: File): Promise<AnalysisResult | null> => {
      setIsAnalyzing(true);
      setProgress(0);

      try {
        const url = URL.createObjectURL(file);
        const video = document.createElement('video');
        video.src = url;
        video.crossOrigin = 'anonymous';
        video.muted = true;

        await new Promise<void>((resolve, reject) => {
          video.onloadedmetadata = () => resolve();
          video.onerror = reject;
          video.load();
        });

        setProgress(20);

        const { duration, videoWidth: width, videoHeight: height } = video;

        const firstThumbnail = await generateThumbnail(video, 160, 90);
        const thumbnailUrl = imageDataToDataURL(firstThumbnail);

        setProgress(40);

        const thumbnails = await generateThumbnailStrip(video, 10, 100, 56);

        setProgress(60);

        let audioBuffer: AudioBuffer | null = null;
        let waveformData: number[] = new Array(200).fill(0.5);

        try {
          audioBuffer = await audioProcessor.decodeAudioFile(file);
          waveformData = await generateWaveformData(audioBuffer, 200);
        } catch (e) {
          console.warn('Audio analysis failed:', e);
        }

        setProgress(100);
        URL.revokeObjectURL(url);

        return {
          duration,
          width,
          height,
          thumbnailUrl,
          thumbnails,
          waveformData,
          audioBuffer,
        };
      } catch (error) {
        console.error('Media analysis failed:', error);
        return null;
      } finally {
        setIsAnalyzing(false);
      }
    },
    []
  );

  return {
    analyzeMedia,
    isAnalyzing,
    progress,
  };
};
