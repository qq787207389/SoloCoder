import React, { useCallback, useRef } from 'react';
import { Toolbar } from '@/components/Toolbar/Toolbar';
import { MediaLibrary } from '@/components/MediaLibrary/MediaLibrary';
import { PreviewCanvas } from '@/components/Preview/PreviewCanvas';
import { Timeline } from '@/components/Timeline/Timeline';
import { TextOverlayEditor } from '@/components/TextOverlay/TextOverlayEditor';
import { useMediaAnalysis } from '@/hooks/useMediaAnalysis';
import { useEditorStore } from '@/store/useEditorStore';
import { MediaAsset, generateId } from '@/types';

const Home: React.FC = () => {
  const { analyzeMedia, isAnalyzing, progress } = useMediaAnalysis();
  const {
    addAsset,
    addClip,
    addTextOverlay,
    textOverlays,
    assets,
    tracks,
    clips,
    updateDuration,
    duration,
  } = useEditorStore();

  const handleImport = useCallback(
    async (file: File) => {
      const url = URL.createObjectURL(file);
      const result = await analyzeMedia(file);

      if (result) {
        addAsset({
          name: file.name,
          file,
          url,
          duration: result.duration,
          width: result.width,
          height: result.height,
          thumbnailUrl: result.thumbnailUrl,
          thumbnailData: result.thumbnails[0] || null,
          waveformData: result.waveformData,
          videoTrack: {
            codec: 'h264',
            width: result.width,
            height: result.height,
            duration: result.duration,
            frameRate: 30,
          },
          audioTrack: result.audioBuffer
            ? {
                codec: 'aac',
                sampleRate: result.audioBuffer.sampleRate,
                numberOfChannels: result.audioBuffer.numberOfChannels,
                duration: result.duration,
              }
            : null,
          audioBuffer: result.audioBuffer,
        });
      }
    },
    [analyzeMedia, addAsset]
  );

  const handleAddToTimeline = useCallback(
    (asset: MediaAsset) => {
      const videoTrack = tracks.find((t) => t.type === 'video');
      if (!videoTrack) return;

      const clipDuration = asset.duration;
      const lastClipEnd = clips.reduce(
        (max, c) => Math.max(max, c.startTime + c.duration),
        0
      );

      addClip({
        assetId: asset.id,
        trackId: videoTrack.id,
        startTime: lastClipEnd,
        duration: clipDuration,
        sourceStart: 0,
        sourceEnd: clipDuration,
        volume: 1,
      });
      updateDuration();
    },
    [tracks, clips, addClip, updateDuration]
  );

  const handleAddText = useCallback(() => {
    addTextOverlay({
      text: '新文字',
      startTime: 0,
      endTime: Math.min(5, duration),
      x: 20,
      y: 20,
      fontSize: 32,
      fontFamily: 'Arial',
      color: '#ffffff',
      textAlign: 'left',
    });
  }, [addTextOverlay, duration]);

  const handleSaveProject = useCallback(() => {
    const state = useEditorStore.getState();
    const projectData = {
      assets: state.assets.map((a) => ({
        id: a.id,
        name: a.name,
        duration: a.duration,
        width: a.width,
        height: a.height,
        thumbnailUrl: a.thumbnailUrl,
        waveformData: a.waveformData,
      })),
      tracks: state.tracks,
      clips: state.clips,
      textOverlays: state.textOverlays,
      zoom: state.zoom,
      duration: state.duration,
    };

    const blob = new Blob([JSON.stringify(projectData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'video-editor-project.json';
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleLoadProject = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const projectData = JSON.parse(event.target?.result as string);
            useEditorStore.getState().loadProject(projectData);
          } catch (error) {
            console.error('Failed to load project:', error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, []);

  const handleExport = useCallback(() => {
    alert('导出功能：可以使用 MediaRecorder 将 Canvas 录制为 WebM\n\n（此为演示版本，完整导出需要更多开发）');
  }, []);

  return (
    <div className="h-screen flex flex-col bg-slate-900 text-white overflow-hidden">
      <Toolbar
        onImport={handleImport}
        onAddText={handleAddText}
        onSaveProject={handleSaveProject}
        onLoadProject={handleLoadProject}
        onExport={handleExport}
      />

      {isAnalyzing && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded-lg shadow-xl">
            <p className="text-sm text-slate-300 mb-3">正在分析媒体文件...</p>
            <div className="w-64 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-2 text-right">{progress}%</p>
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        <MediaLibrary onAddToTimeline={handleAddToTimeline} />

        <div className="flex-1 flex flex-col overflow-hidden">
          <PreviewCanvas />
          <div className="h-64">
            <Timeline />
          </div>
        </div>

        <TextOverlayEditor />
      </div>
    </div>
  );
};

export default Home;
