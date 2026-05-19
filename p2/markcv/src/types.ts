export type ThemeType = 'classic' | 'modern' | 'simple';

export interface ThemeConfig {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  paper: string;
}

export interface StyleSettings {
  fontSize: number;
  lineHeight: number;
  fontFamily: string;
}

export interface DiagnosticIssue {
  type: 'warning' | 'error' | 'info';
  message: string;
  suggestion: string;
}

export interface AppState {
  markdown: string;
  theme: ThemeType;
  styleSettings: StyleSettings;
  previewScale: number;
  showDiagnostics: boolean;
}
