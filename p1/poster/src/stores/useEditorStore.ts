import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { CanvasElement, CanvasSize, HistoryState, BlendMode } from '@/types';

interface EditorState {
  elements: CanvasElement[];
  selectedIds: string[];
  canvasSize: CanvasSize;
  backgroundColor: string;
  zoom: number;
  snapEnabled: boolean;
  gridSize: number;
  darkMode: boolean;
  currentTemplate: string | null;
  clipboard: CanvasElement[];
  historyIndex: number;
  historyStack: HistoryState[];
}

interface EditorActions {
  addElement: (element: CanvasElement) => void;
  removeElement: (id: string) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  setSelectedIds: (ids: string[]) => void;
  setCanvasSize: (size: CanvasSize) => void;
  setBackgroundColor: (color: string) => void;
  setZoom: (zoom: number) => void;
  setSnapEnabled: (enabled: boolean) => void;
  setGridSize: (size: number) => void;
  setDarkMode: (enabled: boolean) => void;
  setElements: (elements: CanvasElement[]) => void;
  setCurrentTemplate: (templateId: string | null) => void;
  copy: (ids: string[]) => void;
  paste: () => void;
  duplicate: (id: string) => void;
  lock: (id: string) => void;
  unlock: (id: string) => void;
  hide: (id: string) => void;
  show: (id: string) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
  setBlendMode: (id: string, mode: BlendMode) => void;
  undo: () => void;
  redo: () => void;
  saveHistory: () => void;
  clearHistory: () => void;
}

const initialCanvasSize: CanvasSize = {
  width: 1080,
  height: 1080,
  name: '1080×1080',
};

const createInitialState = (): EditorState => ({
  elements: [],
  selectedIds: [],
  canvasSize: initialCanvasSize,
  backgroundColor: '#ffffff',
  zoom: 1,
  snapEnabled: true,
  gridSize: 10,
  darkMode: false,
  currentTemplate: null,
  clipboard: [],
  historyIndex: -1,
  historyStack: [],
});

export const useEditorStore = create<EditorState & EditorActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...createInitialState(),

        addElement: (element) => {
          set((state) => {
            const newElement = {
              ...element,
              zIndex: state.elements.length,
            };
            return {
              elements: [...state.elements, newElement],
              selectedIds: [element.id],
            };
          });
          get().saveHistory();
        },

        removeElement: (id) => {
          set((state) => ({
            elements: state.elements.filter((e) => e.id !== id),
            selectedIds: state.selectedIds.filter((i) => i !== id),
          }));
          get().saveHistory();
        },

        updateElement: (id, updates) => {
          set((state) => ({
            elements: state.elements.map((e) =>
              e.id === id ? { ...e, ...updates } : e
            ),
          }));
        },

        setSelectedIds: (ids) => {
          set({ selectedIds: ids });
        },

        setCanvasSize: (size) => {
          set({ canvasSize: size });
          get().saveHistory();
        },

        setBackgroundColor: (color) => {
          set({ backgroundColor: color });
          get().saveHistory();
        },

        setZoom: (zoom) => {
          set({ zoom: Math.max(0.25, Math.min(4, zoom)) });
        },

        setSnapEnabled: (enabled) => {
          set({ snapEnabled: enabled });
        },

        setGridSize: (size) => {
          set({ gridSize: size });
        },

        setDarkMode: (enabled) => {
          set({ darkMode: enabled });
        },

        setElements: (elements) => {
          set({ elements });
          get().saveHistory();
        },

        setCurrentTemplate: (templateId) => {
          set({ currentTemplate: templateId });
        },

        copy: (ids) => {
          const elements = get().elements.filter((e) =>
            ids.includes(e.id)
          );
          set({ clipboard: elements });
        },

        paste: () => {
          const { clipboard } = get();
          if (clipboard.length === 0) return;

          const newElements = clipboard.map((element) => ({
            ...element,
            id: `${element.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            left: element.left + 20,
            top: element.top + 20,
          }));

          set((state) => ({
            elements: [...state.elements, ...newElements],
            selectedIds: newElements.map((e) => e.id),
          }));
          get().saveHistory();
        },

        duplicate: (id) => {
          const element = get().elements.find((e) => e.id === id);
          if (!element) return;

          const newElement = {
            ...element,
            id: `${element.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            left: element.left + 20,
            top: element.top + 20,
          };

          set((state) => ({
            elements: [...state.elements, newElement],
            selectedIds: [newElement.id],
          }));
          get().saveHistory();
        },

        lock: (id) => {
          set((state) => ({
            elements: state.elements.map((e) =>
              e.id === id ? { ...e, locked: true } : e
            ),
          }));
        },

        unlock: (id) => {
          set((state) => ({
            elements: state.elements.map((e) =>
              e.id === id ? { ...e, locked: false } : e
            ),
          }));
        },

        hide: (id) => {
          set((state) => ({
            elements: state.elements.map((e) =>
              e.id === id ? { ...e, visible: false } : e
            ),
          }));
        },

        show: (id) => {
          set((state) => ({
            elements: state.elements.map((e) =>
              e.id === id ? { ...e, visible: true } : e
            ),
          }));
        },

        bringToFront: (id) => {
          set((state) => {
            const maxZ = Math.max(...state.elements.map((e) => e.zIndex));
            return {
              elements: state.elements.map((e) =>
                e.id === id ? { ...e, zIndex: maxZ + 1 } : e
              ),
            };
          });
        },

        sendToBack: (id) => {
          set((state) => {
            const minZ = Math.min(...state.elements.map((e) => e.zIndex));
            return {
              elements: state.elements.map((e) =>
                e.id === id ? { ...e, zIndex: minZ - 1 } : e
              ),
            };
          });
        },

        bringForward: (id) => {
          set((state) => {
            const element = state.elements.find((e) => e.id === id);
            if (!element) return state;

            const currentZ = element.zIndex;
            const nextZ = Math.min(
              ...state.elements
                .filter((e) => e.zIndex > currentZ)
                .map((e) => e.zIndex)
            );

            if (nextZ === Infinity) return state;

            return {
              elements: state.elements.map((e) => {
                if (e.id === id) return { ...e, zIndex: nextZ };
                if (e.zIndex === nextZ) return { ...e, zIndex: currentZ };
                return e;
              }),
            };
          });
        },

        sendBackward: (id) => {
          set((state) => {
            const element = state.elements.find((e) => e.id === id);
            if (!element) return state;

            const currentZ = element.zIndex;
            const prevZ = Math.max(
              ...state.elements
                .filter((e) => e.zIndex < currentZ)
                .map((e) => e.zIndex)
            );

            if (prevZ === -Infinity) return state;

            return {
              elements: state.elements.map((e) => {
                if (e.id === id) return { ...e, zIndex: prevZ };
                if (e.zIndex === prevZ) return { ...e, zIndex: currentZ };
                return e;
              }),
            };
          });
        },

        setBlendMode: (id, mode) => {
          set((state) => ({
            elements: state.elements.map((e) =>
              e.id === id ? { ...e, blendMode: mode } : e
            ),
          }));
        },

        saveHistory: () => {
          const state = get();
          const currentState: HistoryState = {
            elements: JSON.parse(JSON.stringify(state.elements)),
            canvasSize: { ...state.canvasSize },
            backgroundColor: state.backgroundColor,
            selectedIds: [...state.selectedIds],
          };

          set((prev) => {
            const newStack = prev.historyStack.slice(0, prev.historyIndex + 1);
            newStack.push(currentState);
            return {
              historyStack: newStack,
              historyIndex: newStack.length - 1,
            };
          });
        },

        undo: () => {
          const state = get();
          if (state.historyIndex <= 0) return;

          const newIndex = state.historyIndex - 1;
          const historyState = state.historyStack[newIndex];

          set({
            elements: JSON.parse(JSON.stringify(historyState.elements)),
            canvasSize: { ...historyState.canvasSize },
            backgroundColor: historyState.backgroundColor,
            selectedIds: [...historyState.selectedIds],
            historyIndex: newIndex,
          });
        },

        redo: () => {
          const state = get();
          if (state.historyIndex >= state.historyStack.length - 1) return;

          const newIndex = state.historyIndex + 1;
          const historyState = state.historyStack[newIndex];

          set({
            elements: JSON.parse(JSON.stringify(historyState.elements)),
            canvasSize: { ...historyState.canvasSize },
            backgroundColor: historyState.backgroundColor,
            selectedIds: [...historyState.selectedIds],
            historyIndex: newIndex,
          });
        },

        clearHistory: () => {
          set({
            historyStack: [],
            historyIndex: -1,
          });
        },
      }),
      {
        name: 'poster-sprite-storage',
        partialize: (state) => ({
          darkMode: state.darkMode,
        }),
      }
    )
  )
);

export const useSelectedElements = () => {
  const { elements, selectedIds } = useEditorStore();
  return elements.filter((e) => selectedIds.includes(e.id));
};

export const useCanvasDimensions = () => {
  const { canvasSize, zoom } = useEditorStore();
  return {
    width: canvasSize.width * zoom,
    height: canvasSize.height * zoom,
  };
};
