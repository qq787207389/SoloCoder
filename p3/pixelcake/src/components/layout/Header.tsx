import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { 
  Image, 
  FileDown, 
  Undo2, 
  Redo2, 
  Home, 
  Save, 
  FolderOpen,
  ChevronDown
} from 'lucide-react';
import { useEditorStore } from '@/store/useEditorStore';
import { useHistoryStore } from '@/store/useHistoryStore';

interface HeaderProps {
  onExport: () => void;
}

export default function Header({ onExport }: HeaderProps) {
  const navigate = useNavigate();
  const { project, closeProject } = useEditorStore(
    useShallow((state) => ({
      project: state.project,
      closeProject: state.closeProject,
    }))
  );
  const { canUndo, canRedo, undo, redo } = useHistoryStore(
    useShallow((state) => ({
      canUndo: state.canUndo,
      canRedo: state.canRedo,
      undo: state.undo,
      redo: state.redo,
    }))
  );
  const [showFileMenu, setShowFileMenu] = useState(false);
  const fileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (fileMenuRef.current && !fileMenuRef.current.contains(e.target as Node)) {
        setShowFileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSaveProject = () => {
    if (!project) return;
    
    const projectData = {
      version: '1.0',
      project: {
        id: project.id,
        name: project.name,
        width: project.width,
        height: project.height,
        activeLayerId: project.activeLayerId,
      },
      layers: project.layers,
      images: {} as Record<string, string>,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
    
    project.layers.forEach((layer) => {
      if (layer.imageSource) {
        projectData.images[layer.id] = layer.imageSource;
      }
    });
    
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name}.pixelcake`;
    a.click();
    URL.revokeObjectURL(url);
    setShowFileMenu(false);
  };

  const handleOpenProject = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pixelcake,.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          const loadedProject = {
            ...data.project,
            layers: data.layers.map((layer: any) => ({
              ...layer,
              imageSource: data.images[layer.id],
            })),
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          };
          useEditorStore.getState().loadProject(loadedProject);
          navigate('/editor');
        } catch (err) {
          console.error('Failed to load project:', err);
        }
      };
      reader.readAsText(file);
    };
    input.click();
    setShowFileMenu(false);
  };

  const handleGoHome = () => {
    closeProject();
    navigate('/');
  };

  return (
    <header className="h-14 bg-bg-secondary border-b border-border-default flex items-center px-4 justify-between">
      <div className="flex items-center gap-6">
        <button
          onClick={handleGoHome}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center">
            <Image className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold font-poppins">
            Pixel<span className="text-accent-primary">Cake</span>
          </span>
        </button>

        <div className="relative" ref={fileMenuRef}>
          <button
            onClick={() => setShowFileMenu(!showFileMenu)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-bg-tertiary transition-colors text-sm"
          >
            <span>文件</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          
          {showFileMenu && (
            <div className="absolute top-full left-0 mt-1 bg-bg-secondary border border-border-default rounded-lg shadow-xl py-1 min-w-40 z-50">
              <button
                onClick={handleOpenProject}
                className="w-full px-4 py-2 text-left text-sm hover:bg-bg-tertiary flex items-center gap-2"
              >
                <FolderOpen className="w-4 h-4" />
                打开项目
              </button>
              <button
                onClick={handleSaveProject}
                className="w-full px-4 py-2 text-left text-sm hover:bg-bg-tertiary flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                保存项目
              </button>
              <div className="border-t border-border-default my-1" />
              <button
                onClick={onExport}
                className="w-full px-4 py-2 text-left text-sm hover:bg-bg-tertiary flex items-center gap-2"
              >
                <FileDown className="w-4 h-4" />
                导出图片
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => undo()}
            disabled={!canUndo()}
            className="p-2 rounded-lg hover:bg-bg-tertiary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="撤销 (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => redo()}
            disabled={!canRedo()}
            className="p-2 rounded-lg hover:bg-bg-tertiary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="重做 (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-text-secondary">
          {project?.name}
        </span>
        <span className="text-sm text-text-muted">
          {project?.width} × {project?.height}
        </span>
      </div>

      <button
        onClick={onExport}
        className="px-4 py-2 bg-accent-primary hover:bg-accent-hover rounded-lg text-white text-sm font-medium transition-colors flex items-center gap-2"
      >
        <FileDown className="w-4 h-4" />
        导出
      </button>
    </header>
  );
}
