export type ExportFormat = 'png' | 'jpeg' | 'webp';

export interface ExportSettings {
  format: ExportFormat;
  quality: number;
  scale: number;
  transparent: boolean;
  filename: string;
}

export interface ExportProgress {
  percent: number;
  stage: string;
}

export interface ProjectFile {
  version: string;
  project: {
    id: string;
    name: string;
    width: number;
    height: number;
    activeLayerId: string | null;
  };
  layers: SerializedLayer[];
  images: Record<string, string>;
  createdAt: number;
  updatedAt: number;
}

export interface SerializedLayer {
  id: string;
  name: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
  blendMode: string;
  visible: boolean;
  locked: boolean;
  parentId?: string;
  imageId?: string;
  filters: SerializedFilter[];
  mask?: SerializedMask;
  textProps?: SerializedTextProps;
}

export interface SerializedFilter {
  id: string;
  type: string;
  params: Record<string, number>;
  enabled: boolean;
}

export interface SerializedMask {
  type: string;
  enabled: boolean;
  feather: number;
  inverted: boolean;
}

export interface SerializedTextProps {
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  color: string;
  textAlign: string;
  lineHeight: number;
  letterSpacing: number;
}

export const DEFAULT_EXPORT_SETTINGS: ExportSettings = {
  format: 'png',
  quality: 0.9,
  scale: 1,
  transparent: true,
  filename: 'pixelcake-export',
};

export const EXPORT_FORMAT_LABELS: Record<ExportFormat, string> = {
  png: 'PNG',
  jpeg: 'JPEG',
  webp: 'WebP',
};

export const EXPORT_FORMAT_EXTENSIONS: Record<ExportFormat, string> = {
  png: '.png',
  jpeg: '.jpg',
  webp: '.webp',
};
