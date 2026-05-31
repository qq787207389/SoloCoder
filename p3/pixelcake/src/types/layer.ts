export type LayerType = 'image' | 'text' | 'shape' | 'adjustment' | 'group';

export type BlendMode = 
  | 'normal' 
  | 'multiply' 
  | 'screen' 
  | 'overlay' 
  | 'darken' 
  | 'lighten' 
  | 'color-dodge' 
  | 'color-burn' 
  | 'hard-light' 
  | 'soft-light';

export interface TextProperties {
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold' | 'lighter';
  color: string;
  textAlign: 'left' | 'center' | 'right';
  lineHeight: number;
  letterSpacing: number;
  strokeColor?: string;
  strokeWidth?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffset?: { x: number; y: number };
}

export interface LayerMask {
  type: 'selection' | 'gradient';
  enabled: boolean;
  data?: string;
  feather: number;
  inverted: boolean;
}

export interface FilterEffect {
  id: string;
  type: FilterType;
  params: FilterParams;
  enabled: boolean;
}

export type FilterType = 
  | 'brightness' 
  | 'contrast' 
  | 'saturation' 
  | 'hue' 
  | 'temperature'
  | 'tint'
  | 'blur' 
  | 'sharpen' 
  | 'noise' 
  | 'vignette' 
  | 'sepia'
  | 'invert';

export interface FilterParams {
  value?: number;
  radius?: number;
  amount?: number;
  intensity?: number;
}

export interface Layer {
  id: string;
  name: string;
  type: LayerType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
  blendMode: BlendMode;
  visible: boolean;
  locked: boolean;
  parentId?: string;
  imageSource?: string;
  filters: FilterEffect[];
  mask?: LayerMask;
  textProps?: TextProperties;
}

export interface Project {
  id: string;
  name: string;
  width: number;
  height: number;
  layers: Layer[];
  activeLayerId: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface CanvasState {
  zoom: number;
  panX: number;
  panY: number;
}

export const DEFAULT_FILTER_PARAMS: Record<FilterType, FilterParams> = {
  brightness: { value: 0 },
  contrast: { value: 0 },
  saturation: { value: 0 },
  hue: { value: 0 },
  temperature: { value: 0 },
  tint: { value: 0 },
  blur: { radius: 0 },
  sharpen: { amount: 0 },
  noise: { amount: 0 },
  vignette: { intensity: 0 },
  sepia: { value: 0 },
  invert: { value: 0 },
};

export const FILTER_LABELS: Record<FilterType, string> = {
  brightness: '亮度',
  contrast: '对比度',
  saturation: '饱和度',
  hue: '色相',
  temperature: '色温',
  tint: '色调分离',
  blur: '高斯模糊',
  sharpen: '锐化',
  noise: '噪点',
  vignette: '暗角',
  sepia: '复古',
  invert: '反色',
};

export const FILTER_RANGES: Record<FilterType, { min: number; max: number; step: number }> = {
  brightness: { min: -100, max: 100, step: 1 },
  contrast: { min: -100, max: 100, step: 1 },
  saturation: { min: -100, max: 100, step: 1 },
  hue: { min: -180, max: 180, step: 1 },
  temperature: { min: -100, max: 100, step: 1 },
  tint: { min: -100, max: 100, step: 1 },
  blur: { min: 0, max: 50, step: 0.5 },
  sharpen: { min: 0, max: 100, step: 1 },
  noise: { min: 0, max: 100, step: 1 },
  vignette: { min: 0, max: 100, step: 1 },
  sepia: { min: 0, max: 100, step: 1 },
  invert: { min: 0, max: 100, step: 1 },
};

export const BLEND_MODES: { value: BlendMode; label: string }[] = [
  { value: 'normal', label: '正常' },
  { value: 'multiply', label: '正片叠底' },
  { value: 'screen', label: '滤色' },
  { value: 'overlay', label: '叠加' },
  { value: 'darken', label: '变暗' },
  { value: 'lighten', label: '变亮' },
  { value: 'color-dodge', label: '颜色减淡' },
  { value: 'color-burn', label: '颜色加深' },
  { value: 'hard-light', label: '强光' },
  { value: 'soft-light', label: '柔光' },
];
