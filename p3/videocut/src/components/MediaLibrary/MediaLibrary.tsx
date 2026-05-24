import React from 'react';
import { Trash2, Film } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { MediaAsset, formatTime } from '../../types';

interface MediaLibraryProps {
  onAddToTimeline: (asset: MediaAsset) => void;
}

export const MediaLibrary: React.FC<MediaLibraryProps> = ({ onAddToTimeline }) => {
  const { assets, removeAsset } = useEditorStore();

  return (
    <div className="w-56 bg-slate-900 border-r border-slate-700 flex flex-col h-full">
      <div className="px-4 py-3 border-b border-slate-700">
        <h2 className="text-sm font-semibold text-slate-200">媒体库</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {assets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center px-4">
            <Film size={40} className="mb-2 opacity-50" />
            <p className="text-xs">点击"导入视频"按钮添加媒体文件</p>
          </div>
        ) : (
          <div className="space-y-2">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className="group relative bg-slate-800 rounded overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer"
                onClick={() => onAddToTimeline(asset)}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('assetId', asset.id);
                  e.dataTransfer.effectAllowed = 'copy';
                }}
              >
                <div className="aspect-video relative">
                  <img
                    src={asset.thumbnailUrl}
                    alt={asset.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1 right-1 text-xs font-mono bg-black/70 text-white px-1.5 py-0.5 rounded">
                    {formatTime(asset.duration)}
                  </span>
                </div>
                <div className="p-2">
                  <p className="text-xs text-slate-300 truncate">{asset.name}</p>
                  <p className="text-xs text-slate-500">
                    {asset.width} × {asset.height}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeAsset(asset.id);
                  }}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  title="删除"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
