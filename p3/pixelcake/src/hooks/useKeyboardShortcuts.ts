import { useEffect } from 'react';
import { useHistoryStore } from '@/store/useHistoryStore';
import { useEditorStore } from '@/store/useEditorStore';
import { useToolStore } from '@/store/useToolStore';

export function useKeyboardShortcuts() {
  const { undo, redo } = useHistoryStore();
  const { setZoom, project, copyLayer, pasteLayer } = useEditorStore();
  const { setCurrentTool } = useToolStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case 'y':
            e.preventDefault();
            redo();
            break;
          case 'c':
            if (e.altKey) {
              e.preventDefault();
              const activeLayerId = useEditorStore.getState().project?.activeLayerId;
              if (activeLayerId) {
                copyLayer(activeLayerId);
              }
            }
            break;
          case 'v':
            e.preventDefault();
            pasteLayer();
            break;
          case '+':
          case '=':
            e.preventDefault();
            setZoom(useEditorStore.getState().canvas.zoom * 1.2);
            break;
          case '-':
            e.preventDefault();
            setZoom(useEditorStore.getState().canvas.zoom * 0.8);
            break;
          case '0':
            e.preventDefault();
            useEditorStore.getState().resetCanvas();
            break;
        }
      } else {
        switch (e.key.toLowerCase()) {
          case 'v':
            setCurrentTool('select');
            break;
          case 'b':
            setCurrentTool('brush');
            break;
          case 'e':
            setCurrentTool('eraser');
            break;
          case 'h':
            setCurrentTool('hand');
            break;
          case 'c':
            setCurrentTool('crop');
            break;
          case 't':
            setCurrentTool('text');
            break;
          case 's':
            if (e.altKey) {
              setCurrentTool('stamp');
            }
            break;
          case 'm':
            setCurrentTool('rect-select');
            break;
          case 'w':
            setCurrentTool('magic-wand');
            break;
          case 'l':
            setCurrentTool('lasso-select');
            break;
          case 'g':
            setCurrentTool('gradient');
            break;
          case 'delete':
          case 'backspace':
            const activeLayerId = useEditorStore.getState().project?.activeLayerId;
            const layers = useEditorStore.getState().project?.layers || [];
            if (activeLayerId && layers.length > 1) {
              useEditorStore.getState().removeLayer(activeLayerId);
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, setZoom, setCurrentTool, copyLayer, pasteLayer, project]);

  return null;
}
