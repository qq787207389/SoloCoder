export interface ShoeColors {
  upper: string;
  laces: string;
  sole: string;
  logo: string;
}

export interface PartVisibility {
  laces: boolean;
  logo: boolean;
  badge: boolean;
}

export interface ShoeConfig {
  colors: ShoeColors;
  visibility: PartVisibility;
  customTexture: string | null;
}

export const COLOR_PRESETS: Record<string, ShoeColors> = {
  classic: {
    upper: '#2563eb',
    laces: '#ffffff',
    sole: '#ffffff',
    logo: '#ffffff',
  },
  sunset: {
    upper: '#f97316',
    laces: '#fef08a',
    sole: '#1f2937',
    logo: '#fef08a',
  },
  forest: {
    upper: '#16a34a',
    laces: '#052e16',
    sole: '#052e16',
    logo: '#86efac',
  },
  midnight: {
    upper: '#1e1b4b',
    laces: '#a5b4fc',
    sole: '#312e81',
    logo: '#a5b4fc',
  },
  rose: {
    upper: '#be123c',
    laces: '#fecdd3',
    sole: '#4c0519',
    logo: '#fecdd3',
  },
};
