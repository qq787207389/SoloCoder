export * from './audio'

export interface Point {
  x: number
  y: number
}

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export interface CanvasState {
  zoom: number
  panX: number
  panY: number
}

export type VisualizerMode = 'spectrum' | 'waveform' | 'particles'

export interface VisualizerState {
  mode: VisualizerMode
  enabled: boolean
}
