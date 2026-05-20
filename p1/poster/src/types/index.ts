export type ElementType = 'text' | 'image' | 'shape' | 'line';

export type ShapeType = 'rect' | 'circle' | 'triangle' | 'star' | 'polygon';

export type BlendMode = 
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn';

export interface GradientStop {
  offset: number;
  color: string;
}

export interface Gradient {
  type: 'linear' | 'radial';
  angle: number;
  stops: GradientStop[];
}

export interface Shadow {
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
}

export interface BaseElement {
  id: string;
  type: ElementType;
  name: string;
  left: number;
  top: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  zIndex: number;
  groupId?: string;
  blendMode: BlendMode;
}

export interface TextElement extends BaseElement {
  type: 'text';
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold' | 'lighter';
  fontStyle: 'normal' | 'italic';
  lineHeight: number;
  letterSpacing: number;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  fill: string | Gradient;
  stroke: string;
  strokeWidth: number;
  shadows: Shadow[];
  textDecoration: 'none' | 'underline' | 'line-through';
}

export interface ImageFilter {
  type: 'blur' | 'brightness' | 'contrast' | 'grayscale' | 'hue-rotate' | 'invert' | 'saturate' | 'sepia';
  value: number;
}

export interface MaskShape {
  type: 'circle' | 'rect' | 'star' | 'polygon';
  points?: number[];
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  crossOrigin?: string;
  filters: ImageFilter[];
  cropArea?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  mask?: MaskShape;
}

export interface ShapeElement extends BaseElement {
  type: 'shape';
  shapeType: ShapeType;
  fill: string | Gradient;
  stroke: string;
  strokeWidth: number;
  strokeDashArray?: number[];
  strokeLineCap: 'butt' | 'round' | 'square';
  cornerRadius?: number | number[];
  points?: number[];
}

export interface LineElement extends BaseElement {
  type: 'line';
  stroke: string;
  strokeWidth: number;
  strokeDashArray?: number[];
  strokeLineCap: 'butt' | 'round' | 'square';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export type CanvasElement = TextElement | ImageElement | ShapeElement | LineElement;

export interface CanvasSize {
  width: number;
  height: number;
  name: string;
}

export interface Template {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  canvasSize: CanvasSize;
  backgroundColor: string;
  elements: CanvasElement[];
}

export interface HistoryState {
  elements: CanvasElement[];
  canvasSize: CanvasSize;
  backgroundColor: string;
  selectedIds: string[];
}

export interface HistoryCommand {
  id: string;
  type: string;
  label: string;
  timestamp: number;
  beforeState: HistoryState;
  afterState: HistoryState;
}

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: string;
  description: string;
}

export interface Asset {
  id: string;
  name: string;
  type: 'image' | 'font';
  url: string;
  thumbnail?: string;
  category?: string;
  createdAt: number;
}

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface AISuggestion {
  id: string;
  type: 'color' | 'text' | 'layout';
  content: string;
  confidence: number;
}

export interface LayoutScore {
  balance: number;
  contrast: number;
  alignment: number;
  suggestions: string[];
  total: number;
}
