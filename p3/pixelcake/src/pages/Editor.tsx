import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { useEditorStore } from '@/store/useEditorStore';
import { useHistoryStore } from '@/store/useHistoryStore';
import { useToolStore } from '@/store/useToolStore';
import Header from '@/components/layout/Header';
import LeftPanel from '@/components/layout/LeftPanel';
import RightPanel from '@/components/layout/RightPanel';
import Toolbar from '@/components/tools/Toolbar';
import CanvasView from '@/components/canvas/CanvasView';
import StatusBar from '@/components/layout/StatusBar';
import ExportModal from '@/components/modals/ExportModal';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

export default function Editor() {
  const navigate = useNavigate();
  const { project } = useEditorStore(useShallow((state) => ({ project: state.project })));
  const [showExport, setShowExport] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useKeyboardShortcuts();

  useEffect(() => {
    if (!project) {
      navigate('/');
    }
  }, [project, navigate]);

  if (!project) return null;

  return (
    <div className="h-screen flex flex-col bg-bg-primary text-text-primary overflow-hidden">
      <Header onExport={() => setShowExport(true)} />
      
      <div className="flex-1 flex overflow-hidden">
        <div className="w-64 border-r border-border-default flex flex-col">
          <Toolbar />
          <LeftPanel />
        </div>
        
        <div 
          ref={containerRef}
          className="flex-1 relative overflow-hidden bg-bg-secondary/50"
        >
          <CanvasView containerRef={containerRef} />
        </div>
        
        <div className="w-72 border-l border-border-default">
          <RightPanel />
        </div>
      </div>
      
      <StatusBar />
      
      {showExport && (
        <ExportModal onClose={() => setShowExport(false)} />
      )}
    </div>
  );
}
