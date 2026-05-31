import { create } from 'zustand';
import { 
  Layer, 
  Project, 
  CanvasState, 
  FilterEffect, 
  FilterType, 
  DEFAULT_FILTER_PARAMS,
  BlendMode 
} from '@/types/layer';

interface EditorState {
  project: Project | null;
  canvas: CanvasState;
  isDrawing: boolean;
  isDragging: boolean;
  clipboard: Layer | null;
  
  createProject: (width: number, height: number, name?: string) => void;
  loadProject: (project: Project) => void;
  closeProject: () => void;
  
  addLayer: (layer: Omit<Layer, 'id'>, index?: number) => void;
  removeLayer: (layerId: string) => void;
  updateLayer: (layerId: string, updates: Partial<Layer>) => void;
  duplicateLayer: (layerId: string) => void;
  reorderLayers: (fromIndex: number, toIndex: number) => void;
  setActiveLayer: (layerId: string) => void;
  toggleLayerVisibility: (layerId: string) => void;
  toggleLayerLock: (layerId: string) => void;
  
  addFilter: (layerId: string, type: FilterType) => void;
  updateFilter: (layerId: string, filterId: string, params: Record<string, number>) => void;
  toggleFilter: (layerId: string, filterId: string) => void;
  removeFilter: (layerId: string, filterId: string) => void;
  
  setZoom: (zoom: number) => void;
  setPan: (panX: number, panY: number) => void;
  resetCanvas: () => void;
  
  setDrawing: (drawing: boolean) => void;
  setDragging: (dragging: boolean) => void;
  copyLayer: (layerId: string) => void;
  pasteLayer: () => void;
  
  updateProjectSize: (width: number, height: number) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useEditorStore = create<EditorState>((set, get) => ({
  project: null,
  canvas: {
    zoom: 1,
    panX: 0,
    panY: 0,
  },
  isDrawing: false,
  isDragging: false,
  clipboard: null,

  createProject: (width, height, name = 'Untitled') => {
    const now = Date.now();
    set({
      project: {
        id: generateId(),
        name,
        width,
        height,
        layers: [],
        activeLayerId: null,
        createdAt: now,
        updatedAt: now,
      },
      canvas: {
        zoom: Math.min(
          Math.min(800 / width, 600 / height),
          1
        ),
        panX: 0,
        panY: 0,
      },
    });
  },

  loadProject: (project) => {
    set({ 
      project: { ...project, updatedAt: Date.now() },
      canvas: {
        zoom: Math.min(
          Math.min(800 / project.width, 600 / project.height),
          1
        ),
        panX: 0,
        panY: 0,
      },
    });
  },

  closeProject: () => {
    set({ 
      project: null,
      canvas: { zoom: 1, panX: 0, panY: 0 },
    });
  },

  addLayer: (layer, index) => {
    set((state) => {
      if (!state.project) return state;
      
      const newLayer: Layer = {
        ...layer,
        id: generateId(),
      };
      
      const newLayers = [...state.project.layers];
      if (index !== undefined) {
        newLayers.splice(index, 0, newLayer);
      } else {
        newLayers.push(newLayer);
      }
      
      return {
        project: {
          ...state.project,
          layers: newLayers,
          activeLayerId: newLayer.id,
          updatedAt: Date.now(),
        },
      };
    });
  },

  removeLayer: (layerId) => {
    set((state) => {
      if (!state.project) return state;
      
      const newLayers = state.project.layers.filter((l) => l.id !== layerId);
      const activeIndex = state.project.layers.findIndex((l) => l.id === layerId);
      const newActiveId = newLayers.length > 0
        ? newLayers[Math.min(activeIndex, newLayers.length - 1)]?.id
        : null;
      
      return {
        project: {
          ...state.project,
          layers: newLayers,
          activeLayerId: newActiveId,
          updatedAt: Date.now(),
        },
      };
    });
  },

  updateLayer: (layerId, updates) => {
    set((state) => {
      if (!state.project) return state;
      
      return {
        project: {
          ...state.project,
          layers: state.project.layers.map((layer) =>
            layer.id === layerId ? { ...layer, ...updates } : layer
          ),
          updatedAt: Date.now(),
        },
      };
    });
  },

  duplicateLayer: (layerId) => {
    set((state) => {
      if (!state.project) return state;
      
      const layerIndex = state.project.layers.findIndex((l) => l.id === layerId);
      const layer = state.project.layers[layerIndex];
      if (!layer) return state;
      
      const duplicatedLayer: Layer = {
        ...layer,
        id: generateId(),
        name: `${layer.name} 副本`,
        x: layer.x + 20,
        y: layer.y + 20,
      };
      
      const newLayers = [...state.project.layers];
      newLayers.splice(layerIndex + 1, 0, duplicatedLayer);
      
      return {
        project: {
          ...state.project,
          layers: newLayers,
          activeLayerId: duplicatedLayer.id,
          updatedAt: Date.now(),
        },
      };
    });
  },

  reorderLayers: (fromIndex, toIndex) => {
    set((state) => {
      if (!state.project) return state;
      
      const newLayers = [...state.project.layers];
      const [removed] = newLayers.splice(fromIndex, 1);
      newLayers.splice(toIndex, 0, removed);
      
      return {
        project: {
          ...state.project,
          layers: newLayers,
          updatedAt: Date.now(),
        },
      };
    });
  },

  setActiveLayer: (layerId) => {
    set((state) => {
      if (!state.project) return state;
      return {
        project: {
          ...state.project,
          activeLayerId: layerId,
        },
      };
    });
  },

  toggleLayerVisibility: (layerId) => {
    set((state) => {
      if (!state.project) return state;
      
      return {
        project: {
          ...state.project,
          layers: state.project.layers.map((layer) =>
            layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
          ),
          updatedAt: Date.now(),
        },
      };
    });
  },

  toggleLayerLock: (layerId) => {
    set((state) => {
      if (!state.project) return state;
      
      return {
        project: {
          ...state.project,
          layers: state.project.layers.map((layer) =>
            layer.id === layerId ? { ...layer, locked: !layer.locked } : layer
          ),
          updatedAt: Date.now(),
        },
      };
    });
  },

  addFilter: (layerId, type) => {
    set((state) => {
      if (!state.project) return state;
      
      const newFilter: FilterEffect = {
        id: generateId(),
        type,
        params: { ...DEFAULT_FILTER_PARAMS[type] },
        enabled: true,
      };
      
      return {
        project: {
          ...state.project,
          layers: state.project.layers.map((layer) =>
            layer.id === layerId
              ? { ...layer, filters: [...layer.filters, newFilter] }
              : layer
          ),
          updatedAt: Date.now(),
        },
      };
    });
  },

  updateFilter: (layerId, filterId, params) => {
    set((state) => {
      if (!state.project) return state;
      
      return {
        project: {
          ...state.project,
          layers: state.project.layers.map((layer) =>
            layer.id === layerId
              ? {
                  ...layer,
                  filters: layer.filters.map((filter) =>
                    filter.id === filterId
                      ? { ...filter, params: { ...filter.params, ...params } }
                      : filter
                  ),
                }
              : layer
          ),
          updatedAt: Date.now(),
        },
      };
    });
  },

  toggleFilter: (layerId, filterId) => {
    set((state) => {
      if (!state.project) return state;
      
      return {
        project: {
          ...state.project,
          layers: state.project.layers.map((layer) =>
            layer.id === layerId
              ? {
                  ...layer,
                  filters: layer.filters.map((filter) =>
                    filter.id === filterId
                      ? { ...filter, enabled: !filter.enabled }
                      : filter
                  ),
                }
              : layer
          ),
          updatedAt: Date.now(),
        },
      };
    });
  },

  removeFilter: (layerId, filterId) => {
    set((state) => {
      if (!state.project) return state;
      
      return {
        project: {
          ...state.project,
          layers: state.project.layers.map((layer) =>
            layer.id === layerId
              ? { ...layer, filters: layer.filters.filter((f) => f.id !== filterId) }
              : layer
          ),
          updatedAt: Date.now(),
        },
      };
    });
  },

  setZoom: (zoom) => {
    set((state) => ({
      canvas: { ...state.canvas, zoom: Math.max(0.1, Math.min(10, zoom)) },
    }));
  },

  setPan: (panX, panY) => {
    set((state) => ({
      canvas: { ...state.canvas, panX, panY },
    }));
  },

  resetCanvas: () => {
    const { project } = get();
    if (!project) return;
    
    set({
      canvas: {
        zoom: Math.min(Math.min(800 / project.width, 600 / project.height), 1),
        panX: 0,
        panY: 0,
      },
    });
  },

  setDrawing: (drawing) => set({ isDrawing: drawing }),
  setDragging: (dragging) => set({ isDragging: dragging }),

  copyLayer: (layerId) => {
    const { project } = get();
    if (!project) return;
    
    const layer = project.layers.find((l) => l.id === layerId);
    if (layer) {
      set({ clipboard: { ...layer } });
    }
  },

  pasteLayer: () => {
    const { clipboard, addLayer } = get();
    if (!clipboard) return;
    
    addLayer({
      ...clipboard,
      name: `${clipboard.name} 粘贴`,
      x: clipboard.x + 20,
      y: clipboard.y + 20,
    });
  },

  updateProjectSize: (width, height) => {
    set((state) => {
      if (!state.project) return state;
      
      return {
        project: {
          ...state.project,
          width,
          height,
          updatedAt: Date.now(),
        },
      };
    });
  },
}));
