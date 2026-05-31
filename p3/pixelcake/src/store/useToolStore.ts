import { create } from 'zustand';
import {
  ToolType,
  BrushSettings,
  EraserSettings,
  StampSettings,
  TextSettings,
  GradientSettings,
  CropSettings,
  SelectionSettings,
  DEFAULT_BRUSH_SETTINGS,
  DEFAULT_ERASER_SETTINGS,
  DEFAULT_STAMP_SETTINGS,
  DEFAULT_TEXT_SETTINGS,
  DEFAULT_GRADIENT_SETTINGS,
  DEFAULT_CROP_SETTINGS,
  DEFAULT_SELECTION_SETTINGS,
} from '@/types/tool';

interface ToolState {
  currentTool: ToolType;
  brush: BrushSettings;
  eraser: EraserSettings;
  stamp: StampSettings;
  text: TextSettings;
  gradient: GradientSettings;
  crop: CropSettings;
  selection: SelectionSettings;
  
  setCurrentTool: (tool: ToolType) => void;
  
  updateBrush: (updates: Partial<BrushSettings>) => void;
  updateEraser: (updates: Partial<EraserSettings>) => void;
  updateStamp: (updates: Partial<StampSettings>) => void;
  updateText: (updates: Partial<TextSettings>) => void;
  updateGradient: (updates: Partial<GradientSettings>) => void;
  updateCrop: (updates: Partial<CropSettings>) => void;
  updateSelection: (updates: Partial<SelectionSettings>) => void;
  
  resetToolSettings: () => void;
}

export const useToolStore = create<ToolState>((set) => ({
  currentTool: 'select',
  brush: { ...DEFAULT_BRUSH_SETTINGS },
  eraser: { ...DEFAULT_ERASER_SETTINGS },
  stamp: { ...DEFAULT_STAMP_SETTINGS },
  text: { ...DEFAULT_TEXT_SETTINGS },
  gradient: { ...DEFAULT_GRADIENT_SETTINGS },
  crop: { ...DEFAULT_CROP_SETTINGS },
  selection: { ...DEFAULT_SELECTION_SETTINGS },

  setCurrentTool: (tool) => set({ currentTool: tool }),

  updateBrush: (updates) =>
    set((state) => ({
      brush: { ...state.brush, ...updates },
    })),

  updateEraser: (updates) =>
    set((state) => ({
      eraser: { ...state.eraser, ...updates },
    })),

  updateStamp: (updates) =>
    set((state) => ({
      stamp: { ...state.stamp, ...updates },
    })),

  updateText: (updates) =>
    set((state) => ({
      text: { ...state.text, ...updates },
    })),

  updateGradient: (updates) =>
    set((state) => ({
      gradient: { ...state.gradient, ...updates },
    })),

  updateCrop: (updates) =>
    set((state) => ({
      crop: { ...state.crop, ...updates },
    })),

  updateSelection: (updates) =>
    set((state) => ({
      selection: { ...state.selection, ...updates },
    })),

  resetToolSettings: () =>
    set({
      brush: { ...DEFAULT_BRUSH_SETTINGS },
      eraser: { ...DEFAULT_ERASER_SETTINGS },
      stamp: { ...DEFAULT_STAMP_SETTINGS },
      text: { ...DEFAULT_TEXT_SETTINGS },
      gradient: { ...DEFAULT_GRADIENT_SETTINGS },
      crop: { ...DEFAULT_CROP_SETTINGS },
      selection: { ...DEFAULT_SELECTION_SETTINGS },
    }),
}));
