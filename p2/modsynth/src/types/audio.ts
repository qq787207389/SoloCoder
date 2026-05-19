export type WaveformType = 'sine' | 'sawtooth' | 'square' | 'triangle'

export type FilterType = 'lowpass' | 'highpass' | 'bandpass' | 'notch'

export type ModuleType = 
  | 'oscillator' 
  | 'filter' 
  | 'envelope' 
  | 'gain' 
  | 'reverb' 
  | 'delay' 
  | 'output' 
  | 'sequencer'
  | 'keyboard'

export type PortType = 'audio' | 'control' | 'gate'

export interface Port {
  id: string
  name: string
  type: PortType
  direction: 'input' | 'output'
}

export interface ModulePort extends Port {
  moduleId: string
}

export interface Connection {
  id: string
  from: { moduleId: string; portId: string }
  to: { moduleId: string; portId: string }
}

export interface ModuleBase {
  id: string
  type: ModuleType
  name: string
  x: number
  y: number
  width: number
  height: number
  inputs: Port[]
  outputs: Port[]
  params: Record<string, number | string | boolean>
}

export interface OscillatorParams {
  frequency: number
  waveform: WaveformType
  detune: number
  gain: number
}

export interface FilterParams {
  frequency: number
  resonance: number
  type: FilterType
  gain: number
}

export interface EnvelopeParams {
  attack: number
  decay: number
  sustain: number
  release: number
}

export interface ReverbParams {
  wet: number
  decay: number
}

export interface DelayParams {
  time: number
  feedback: number
  wet: number
}

export interface GainParams {
  gain: number
}

export interface Note {
  frequency: number
  duration: number
  velocity: number
}

export interface SequencerTrack {
  id: string
  name: string
  steps: (Note | null)[]
  stepCount: number
}

export interface Preset {
  name: string
  modules: ModuleBase[]
  connections: Connection[]
  tracks: SequencerTrack[]
  bpm: number
}

export interface AudioModule {
  id: string
  type: ModuleType
  node: AudioNode | null
  params: Record<string, AudioParam | number>
  inputs: Map<string, AudioNode | AudioParam | null>
  outputs: Map<string, AudioNode | null>
  connect: (outputPort: string, targetModule: AudioModule, inputPort: string) => void
  disconnect: (outputPort?: string, targetModule?: AudioModule, inputPort?: string) => void
  destroy: () => void
}
