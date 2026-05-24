import React from 'react';
import { Trash2, Volume2, VolumeX, Video, Music, Lock, Unlock } from 'lucide-react';
import { Track as TrackType, Clip as ClipType, MediaAsset, pixelsToTime } from '../../types';
import { ClipComponent } from './Clip';
import { useEditorStore } from '../../store/useEditorStore';

interface TrackProps {
  track: TrackType;
  clips: ClipType[];
  assets: MediaAsset[];
  zoom: number;
  onDrop: (trackId: string, x: number) => void;
}

export const Track: React.FC<TrackProps> = ({ track, clips, assets, zoom, onDrop }) => {
  const {
    selectedClipId,
    selectClip,
    updateClip,
    removeClip,
    tracks,
    updateDuration,
  } = useEditorStore();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    onDrop(track.id, x);
  };

  const handleClipMove = (clipId: string, deltaX: number) => {
    const clip = clips.find((c) => c.id === clipId);
    if (!clip) return;

    const deltaTime = pixelsToTime(deltaX, zoom);
    const newStartTime = Math.max(0, clip.startTime + deltaTime);
    updateClip(clipId, { startTime: newStartTime });
  };

  const handleResizeLeft = (clipId: string, deltaX: number) => {
    const clip = clips.find((c) => c.id === clipId);
    if (!clip) return;

    const asset = assets.find((a) => a.id === clip.assetId);
    if (!asset) return;

    const deltaTime = pixelsToTime(deltaX, zoom);
    const newStartTime = Math.max(0, clip.startTime + deltaTime);
    const newDuration = clip.duration - deltaTime;
    const newSourceStart = clip.sourceStart + deltaTime;

    if (newDuration > 0.1 && newSourceStart >= 0) {
      updateClip(clipId, {
        startTime: newStartTime,
        duration: newDuration,
        sourceStart: newSourceStart,
      });
    }
  };

  const handleResizeRight = (clipId: string, deltaX: number) => {
    const clip = clips.find((c) => c.id === clipId);
    if (!clip) return;

    const asset = assets.find((a) => a.id === clip.assetId);
    if (!asset) return;

    const deltaTime = pixelsToTime(deltaX, zoom);
    const newDuration = clip.duration + deltaTime;
    const newSourceEnd = clip.sourceEnd + deltaTime;

    if (newDuration > 0.1 && newSourceEnd <= asset.duration) {
      updateClip(clipId, {
        duration: newDuration,
        sourceEnd: newSourceEnd,
      });
      updateDuration();
    }
  };

  const handleToggleMute = (trackId: string) => {
    const trackIndex = tracks.findIndex((t) => t.id === trackId);
    if (trackIndex === -1) return;
    const newTracks = [...tracks];
    newTracks[trackIndex] = { ...newTracks[trackIndex], muted: !newTracks[trackIndex].muted };
    useEditorStore.setState({ tracks: newTracks });
  };

  const handleToggleLock = (trackId: string) => {
    const trackIndex = tracks.findIndex((t) => t.id === trackId);
    if (trackIndex === -1) return;
    const newTracks = [...tracks];
    newTracks[trackIndex] = { ...newTracks[trackIndex], locked: !newTracks[trackIndex].locked };
    useEditorStore.setState({ tracks: newTracks });
  };

  const handleDeleteTrack = (trackId: string) => {
    useEditorStore.getState().removeTrack(trackId);
  };

  const trackClips = clips.filter((c) => c.trackId === track.id);

  return (
    <div className="flex border-b border-slate-700">
      <div className="flex-shrink-0 w-32 bg-slate-800 border-r border-slate-700 p-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {track.type === 'video' ? (
            <Video size={14} className="text-blue-400" />
          ) : (
            <Music size={14} className="text-green-400" />
          )}
          <span className="text-xs text-slate-300 truncate">{track.name}</span>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => handleToggleMute(track.id)}
            className="p-1 text-slate-400 hover:text-white transition-colors"
          >
            {track.muted ? <VolumeX size={12} /> : <Volume2 size={12} />}
          </button>
          <button
            onClick={() => handleToggleLock(track.id)}
            className="p-1 text-slate-400 hover:text-white transition-colors"
          >
            {track.locked ? <Lock size={12} /> : <Unlock size={12} />}
          </button>
          <button
            onClick={() => handleDeleteTrack(track.id)}
            className="p-1 text-slate-400 hover:text-red-400 transition-colors"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      <div
        className="flex-1 relative bg-slate-900/50"
        style={{ height: `${track.height}px` }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {trackClips.map((clip) => (
          <ClipComponent
            key={clip.id}
            clip={clip}
            asset={assets.find((a) => a.id === clip.assetId)}
            isSelected={selectedClipId === clip.id}
            zoom={zoom}
            trackHeight={track.height}
            onSelect={() => selectClip(clip.id)}
            onMove={(deltaX) => handleClipMove(clip.id, deltaX)}
            onResizeLeft={(deltaX) => handleResizeLeft(clip.id, deltaX)}
            onResizeRight={(deltaX) => handleResizeRight(clip.id, deltaX)}
            onDelete={() => removeClip(clip.id)}
            onToggleMute={() =>
              updateClip(clip.id, { volume: clip.volume === 0 ? 1 : 0 })
            }
          />
        ))}
      </div>
    </div>
  );
};
