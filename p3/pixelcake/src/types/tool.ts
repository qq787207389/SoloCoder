export type ToolType = 
  | 'select'
  | 'crop'
  | 'brush'
  | 'eraser'
  | 'stamp'
  | 'text'
  | 'rect-select'
  | 'ellipse-select'
  | 'lasso-select'
  | 'magic-wand'
  | 'gradient'
  | 'move'
  | 'hand';

export interface BrushSettings {
  size: number;
  hardness: number;
  flow: number;
  opacity: number;
  color: string;
  blendMode: 'normal' | 'multiply' | 'screen' | 'overlay';
}

export interface EraserSettings {
  size: number;
  hardness: number;
  opacity: number;
}

export interface StampSettings {
  size: number;
  hardness: number;
  opacity: number;
  samplePoint: { x: number; y: number } | null;
  isSampling: boolean;
}

export interface TextSettings {
  fontFamily: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold' | 'lighter';
  color: string;
  textAlign: 'left' | 'center' | 'right';
}

export interface GradientSettings {
  type: 'linear' | 'radial';
  colors: { stop: number; color: string }[];
  angle: number;
}

export interface CropSettings {
  ratio: 'free' | '1:1' | '4:3' | '16:9' | '3:2' | '2:3';
  isCropping: boolean;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export interface SelectionSettings {
  feather: number;
  tolerance: number;
  antiAlias: boolean;
  contiguous: boolean;
}

export interface ToolState {
  currentTool: ToolType;
  brush: BrushSettings;
  eraser: EraserSettings;
  stamp: StampSettings;
  text: TextSettings;
  gradient: GradientSettings;
  crop: CropSettings;
  selection: SelectionSettings;
}

export const DEFAULT_BRUSH_SETTINGS: BrushSettings = {
  size: 20,
  hardness: 50,
  flow: 100,
  opacity: 100,
  color: '#000000',
  blendMode: 'normal',
};

export const DEFAULT_ERASER_SETTINGS: EraserSettings = {
  size: 20,
  hardness: 50,
  opacity: 100,
};

export const DEFAULT_STAMP_SETTINGS: StampSettings = {
  size: 20,
  hardness: 50,
  opacity: 100,
  samplePoint: null,
  isSampling: false,
};

export const DEFAULT_TEXT_SETTINGS: TextSettings = {
  fontFamily: 'Inter',
  fontSize: 32,
  fontWeight: 'normal',
  color: '#000000',
  textAlign: 'left',
};

export const DEFAULT_GRADIENT_SETTINGS: GradientSettings = {
  type: 'linear',
  colors: [
    { stop: 0, color: '#ffffff' },
    { stop: 1, color: '#000000' },
  ],
  angle: 0,
};

export const DEFAULT_CROP_SETTINGS: CropSettings = {
  ratio: 'free',
  isCropping: false,
  startX: 0,
  startY: 0,
  endX: 0,
  endY: 0,
};

export const DEFAULT_SELECTION_SETTINGS: SelectionSettings = {
  feather: 0,
  tolerance: 32,
  antiAlias: true,
  contiguous: true,
};

export const TOOL_LABELS: Record<ToolType, string> = {
  select: '选择',
  crop: '裁剪',
  brush: '画笔',
  eraser: '橡皮擦',
  stamp: '图章',
  text: '文字',
  'rect-select': '矩形选区',
  'ellipse-select': '椭圆选区',
  'lasso-select': '套索',
  'magic-wand': '魔法棒',
  gradient: '渐变',
  move: '移动',
  hand: '抓手',
};
