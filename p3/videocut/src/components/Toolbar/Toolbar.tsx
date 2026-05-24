import React, { useRef } from 'react';
import {
  Upload,
  Save,
  FolderOpen,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Download,
  Type,
  Plus,
} from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { formatTime } from '../../types';

interface ToolbarProps {
  onImport: (file: File) => void;
  onAddText: () => void;
  onSaveProject: () => void;
  onLoadProject: () => void;
  onExport: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onImport,
  onAddText,
  onSaveProject,
  onLoadProject,
  onExport,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const projectInputRef = useRef<HTMLInputElement>(null);
  const { currentTime, isPlaying, setPlaying, setCurrentTime, duration } =
    useEditorStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
    }
    e.target.value = '';
  };

  const handleProjectLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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
    e.target.value = '';
  };

  const handleRewind = () => {
    setCurrentTime(Math.max(0, currentTime - 5));
  };

  const handleForward = () => {
    setCurrentTime(Math.min(duration, currentTime + 5));
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 pr-4 border-r border-slate-600">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
          >
            <Upload size={16} />
            导入视频
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            onClick={onAddText}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white bg-slate-700 rounded hover:bg-slate-600 transition-colors"
          >
            <Type size={16} />
            添加文字
          </button>

          <button
            onClick={() => useEditorStore.getState().addTrack('video')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white bg-slate-700 rounded hover:bg-slate-600 transition-colors"
            title="添加视频轨道"
          >
            <Plus size={16} />
            视频
          </button>

          <button
            onClick={() => useEditorStore.getState().addTrack('audio')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white bg-slate-700 rounded hover:bg-slate-600 transition-colors"
            title="添加音频轨道"
          >
            <Plus size={16} />
            音频
          </button>
        </div>

        <div className="flex items-center gap-1 pl-2">
          <button
            onClick={onSaveProject}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
            title="保存项目"
          >
            <Save size={18} />
          </button>

          <button
            onClick={() => projectInputRef.current?.click()}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
            title="加载项目"
          >
            <FolderOpen size={18} />
          </button>
          <input
            ref={projectInputRef}
            type="file"
            accept=".json"
            onChange={handleProjectLoad}
            className="hidden"
          />

          <button
            onClick={onExport}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
            title="导出视频"
          >
            <Download size={18} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <button
            onClick={handleRewind}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
            title="后退5秒"
          >
            <SkipBack size={18} />
          </button>

          <button
            onClick={() => setPlaying(!isPlaying)}
            className="p-2 text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
            title={isPlaying ? '暂停' : '播放'}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>

          <button
            onClick={handleForward}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
            title="前进5秒"
          >
            <SkipForward size={18} />
          </button>
        </div>

        <div className="text-sm font-mono text-slate-300 bg-slate-900 px-3 py-1 rounded">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>
    </div>
  );
};
