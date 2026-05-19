import type { 
  AudioModule, 
  ModuleType, 
  OscillatorParams, 
  FilterParams, 
  EnvelopeParams,
  ReverbParams,
  DelayParams,
  GainParams,
  WaveformType,
  FilterType
} from '../types'

export class AudioEngine {
  private static instance: AudioEngine | null = null
  public audioContext: AudioContext | null = null
  private modules: Map<string, AudioModule> = new Map()
  private masterGain: GainNode | null = null
  private analyser: AnalyserNode | null = null
  private destination: MediaStreamAudioDestinationNode | null = null

  private constructor() {}

  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine()
    }
    return AudioEngine.instance
  }

  public async init(): Promise<void> {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      this.masterGain = this.audioContext.createGain()
      this.masterGain.gain.value = 0.5
      this.analyser = this.audioContext.createAnalyser()
      this.analyser.fftSize = 2048
      this.destination = this.audioContext.createMediaStreamDestination()
      this.masterGain.connect(this.audioContext.destination)
      this.masterGain.connect(this.analyser)
      this.masterGain.connect(this.destination)
    }
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume()
    }
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser
  }

  public getStream(): MediaStream | null {
    return this.destination?.stream || null
  }

  public getMasterGain(): GainNode | null {
    return this.masterGain
  }

  public createModule(type: ModuleType, id: string): AudioModule {
    if (!this.audioContext) {
      throw new Error('AudioContext not initialized')
    }

    let module: AudioModule

    switch (type) {
      case 'oscillator':
        module = new OscillatorModule(this.audioContext, id)
        break
      case 'filter':
        module = new FilterModule(this.audioContext, id)
        break
      case 'envelope':
        module = new EnvelopeModule(this.audioContext, id)
        break
      case 'gain':
        module = new GainModule(this.audioContext, id)
        break
      case 'reverb':
        module = new ReverbModule(this.audioContext, id)
        break
      case 'delay':
        module = new DelayModule(this.audioContext, id)
        break
      case 'output':
        module = new OutputModule(this.audioContext, id, this.masterGain!)
        break
      default:
        throw new Error(`Unknown module type: ${type}`)
    }

    this.modules.set(id, module)
    return module
  }

  public getModule(id: string): AudioModule | undefined {
    return this.modules.get(id)
  }

  public destroyModule(id: string): void {
    const module = this.modules.get(id)
    if (module) {
      module.destroy()
      this.modules.delete(id)
    }
  }

  public connectModules(
    fromId: string, 
    fromPort: string, 
    toId: string, 
    toPort: string
  ): void {
    const fromModule = this.modules.get(fromId)
    const toModule = this.modules.get(toId)
    if (fromModule && toModule) {
      fromModule.connect(fromPort, toModule, toPort)
    }
  }

  public disconnectModules(
    fromId: string, 
    fromPort: string, 
    toId: string, 
    toPort: string
  ): void {
    const fromModule = this.modules.get(fromId)
    const toModule = this.modules.get(toId)
    if (fromModule && toModule) {
      fromModule.disconnect(fromPort, toModule, toPort)
    }
  }

  public destroy(): void {
    this.modules.forEach((module) => module.destroy())
    this.modules.clear()
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
    this.masterGain = null
    this.analyser = null
    this.destination = null
  }
}

class OscillatorModule implements AudioModule {
  public id: string
  public type: ModuleType = 'oscillator'
  public node: OscillatorNode | null = null
  public gainNode: GainNode
  public params: Record<string, AudioParam | number>
  public inputs: Map<string, AudioNode | AudioParam | null> = new Map()
  public outputs: Map<string, AudioNode | null> = new Map()
  private ctx: AudioContext

  constructor(ctx: AudioContext, id: string) {
    this.ctx = ctx
    this.id = id
    this.node = ctx.createOscillator()
    this.gainNode = ctx.createGain()
    this.node.connect(this.gainNode)
    
    this.params = {
      frequency: this.node.frequency,
      detune: this.node.detune,
      gain: this.gainNode.gain
    }
    
    this.inputs.set('fm', this.node.frequency)
    this.inputs.set('detune', this.node.detune)
    this.outputs.set('out', this.gainNode)
    
    this.node.type = 'sawtooth'
    this.node.frequency.value = 440
    this.gainNode.gain.value = 0.3
    this.node.start()
  }

  connect(outputPort: string, targetModule: AudioModule, inputPort: string): void {
    const output = this.outputs.get(outputPort)
    const input = targetModule.inputs.get(inputPort)
    if (output && input) {
      if (input instanceof AudioParam) {
        output.connect(input)
      } else if (input instanceof AudioNode) {
        output.connect(input)
      }
    }
  }

  disconnect(outputPort?: string, targetModule?: AudioModule, inputPort?: string): void {
    const output = this.outputs.get(outputPort || 'out')
    if (output) {
      output.disconnect()
    }
  }

  destroy(): void {
    if (this.node) {
      this.node.stop()
      this.node.disconnect()
      this.node = null
    }
    this.gainNode.disconnect()
  }
}

class FilterModule implements AudioModule {
  public id: string
  public type: ModuleType = 'filter'
  public node: BiquadFilterNode
  public params: Record<string, AudioParam | number>
  public inputs: Map<string, AudioNode | AudioParam | null> = new Map()
  public outputs: Map<string, AudioNode | null> = new Map()

  constructor(ctx: AudioContext, id: string) {
    this.id = id
    this.node = ctx.createBiquadFilter()
    
    this.params = {
      frequency: this.node.frequency,
      resonance: this.node.Q,
      gain: this.node.gain
    }
    
    this.inputs.set('in', this.node)
    this.inputs.set('fm', this.node.frequency)
    this.outputs.set('out', this.node)
    
    this.node.type = 'lowpass'
    this.node.frequency.value = 2000
    this.node.Q.value = 1
  }

  connect(outputPort: string, targetModule: AudioModule, inputPort: string): void {
    const output = this.outputs.get(outputPort)
    const input = targetModule.inputs.get(inputPort)
    if (output && input) {
      if (input instanceof AudioParam) {
        output.connect(input)
      } else if (input instanceof AudioNode) {
        output.connect(input)
      }
    }
  }

  disconnect(outputPort?: string, targetModule?: AudioModule, inputPort?: string): void {
    const output = this.outputs.get(outputPort || 'out')
    if (output) {
      output.disconnect()
    }
  }

  destroy(): void {
    this.node.disconnect()
  }
}

class EnvelopeModule implements AudioModule {
  public id: string
  public type: ModuleType = 'envelope'
  public node: null = null
  public gainNode: GainNode
  public params: Record<string, AudioParam | number> = {}
  public inputs: Map<string, AudioNode | AudioParam | null> = new Map()
  public outputs: Map<string, AudioNode | null> = new Map()
  private ctx: AudioContext
  public attack: number = 0.01
  public decay: number = 0.1
  public sustain: number = 0.5
  public releaseTime: number = 0.3

  constructor(ctx: AudioContext, id: string) {
    this.ctx = ctx
    this.id = id
    this.gainNode = ctx.createGain()
    this.gainNode.gain.value = 0
    
    this.params = {
      attack: this.attack,
      decay: this.decay,
      sustain: this.sustain,
      release: this.releaseTime
    }
    
    this.inputs.set('in', this.gainNode)
    this.inputs.set('gate', null)
    this.outputs.set('out', this.gainNode)
  }

  trigger(velocity: number = 1): void {
    const now = this.ctx.currentTime
    const gain = this.gainNode.gain
    gain.cancelScheduledValues(now)
    gain.setValueAtTime(0, now)
    gain.linearRampToValueAtTime(velocity, now + this.attack)
    gain.linearRampToValueAtTime(this.sustain * velocity, now + this.attack + this.decay)
  }

  releaseGate(): void {
    const now = this.ctx.currentTime
    const gain = this.gainNode.gain
    gain.cancelScheduledValues(now)
    gain.setValueAtTime(gain.value, now)
    gain.linearRampToValueAtTime(0, now + this.releaseTime)
  }

  connect(outputPort: string, targetModule: AudioModule, inputPort: string): void {
    const output = this.outputs.get(outputPort)
    const input = targetModule.inputs.get(inputPort)
    if (output && input) {
      if (input instanceof AudioParam) {
        output.connect(input)
      } else if (input instanceof AudioNode) {
        output.connect(input)
      }
    }
  }

  disconnect(outputPort?: string, targetModule?: AudioModule, inputPort?: string): void {
    const output = this.outputs.get(outputPort || 'out')
    if (output) {
      output.disconnect()
    }
  }

  destroy(): void {
    this.gainNode.disconnect()
  }
}

class GainModule implements AudioModule {
  public id: string
  public type: ModuleType = 'gain'
  public node: GainNode
  public params: Record<string, AudioParam | number>
  public inputs: Map<string, AudioNode | AudioParam | null> = new Map()
  public outputs: Map<string, AudioNode | null> = new Map()

  constructor(ctx: AudioContext, id: string) {
    this.id = id
    this.node = ctx.createGain()
    
    this.params = {
      gain: this.node.gain
    }
    
    this.inputs.set('in', this.node)
    this.outputs.set('out', this.node)
    
    this.node.gain.value = 0.5
  }

  connect(outputPort: string, targetModule: AudioModule, inputPort: string): void {
    const output = this.outputs.get(outputPort)
    const input = targetModule.inputs.get(inputPort)
    if (output && input) {
      if (input instanceof AudioParam) {
        output.connect(input)
      } else if (input instanceof AudioNode) {
        output.connect(input)
      }
    }
  }

  disconnect(outputPort?: string, targetModule?: AudioModule, inputPort?: string): void {
    const output = this.outputs.get(outputPort || 'out')
    if (output) {
      output.disconnect()
    }
  }

  destroy(): void {
    this.node.disconnect()
  }
}

class ReverbModule implements AudioModule {
  public id: string
  public type: ModuleType = 'reverb'
  public node: ConvolverNode
  public wetGain: GainNode
  public dryGain: GainNode
  public params: Record<string, AudioParam | number>
  public inputs: Map<string, AudioNode | AudioParam | null> = new Map()
  public outputs: Map<string, AudioNode | null> = new Map()
  private ctx: AudioContext

  constructor(ctx: AudioContext, id: string) {
    this.ctx = ctx
    this.id = id
    this.node = ctx.createConvolver()
    this.wetGain = ctx.createGain()
    this.dryGain = ctx.createGain()
    
    this.params = {
      wet: this.wetGain.gain,
      decay: 2
    }
    
    this.inputs.set('in', this.dryGain)
    this.outputs.set('out', this.wetGain)
    
    this.dryGain.connect(this.node)
    this.node.connect(this.wetGain)
    this.dryGain.connect(this.wetGain)
    
    this.wetGain.gain.value = 0.3
    this.generateImpulseResponse(2)
  }

  private generateImpulseResponse(duration: number): void {
    const sampleRate = this.ctx.sampleRate
    const length = sampleRate * duration
    const impulse = this.ctx.createBuffer(2, length, sampleRate)
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel)
      for (let i = 0; i < length; i++) {
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2)
      }
    }
    
    this.node.buffer = impulse
  }

  connect(outputPort: string, targetModule: AudioModule, inputPort: string): void {
    const output = this.outputs.get(outputPort)
    const input = targetModule.inputs.get(inputPort)
    if (output && input) {
      if (input instanceof AudioParam) {
        output.connect(input)
      } else if (input instanceof AudioNode) {
        output.connect(input)
      }
    }
  }

  disconnect(outputPort?: string, targetModule?: AudioModule, inputPort?: string): void {
    const output = this.outputs.get(outputPort || 'out')
    if (output) {
      output.disconnect()
    }
  }

  destroy(): void {
    this.node.disconnect()
    this.wetGain.disconnect()
    this.dryGain.disconnect()
  }
}

class DelayModule implements AudioModule {
  public id: string
  public type: ModuleType = 'delay'
  public node: DelayNode
  public feedbackGain: GainNode
  public wetGain: GainNode
  public dryGain: GainNode
  public params: Record<string, AudioParam | number>
  public inputs: Map<string, AudioNode | AudioParam | null> = new Map()
  public outputs: Map<string, AudioNode | null> = new Map()

  constructor(ctx: AudioContext, id: string) {
    this.id = id
    this.node = ctx.createDelay(5)
    this.feedbackGain = ctx.createGain()
    this.wetGain = ctx.createGain()
    this.dryGain = ctx.createGain()
    
    this.params = {
      time: this.node.delayTime,
      feedback: this.feedbackGain.gain,
      wet: this.wetGain.gain
    }
    
    this.inputs.set('in', this.dryGain)
    this.outputs.set('out', this.wetGain)
    
    this.dryGain.connect(this.node)
    this.node.connect(this.feedbackGain)
    this.feedbackGain.connect(this.node)
    this.node.connect(this.wetGain)
    this.dryGain.connect(this.wetGain)
    
    this.node.delayTime.value = 0.3
    this.feedbackGain.gain.value = 0.4
    this.wetGain.gain.value = 0.5
  }

  connect(outputPort: string, targetModule: AudioModule, inputPort: string): void {
    const output = this.outputs.get(outputPort)
    const input = targetModule.inputs.get(inputPort)
    if (output && input) {
      if (input instanceof AudioParam) {
        output.connect(input)
      } else if (input instanceof AudioNode) {
        output.connect(input)
      }
    }
  }

  disconnect(outputPort?: string, targetModule?: AudioModule, inputPort?: string): void {
    const output = this.outputs.get(outputPort || 'out')
    if (output) {
      output.disconnect()
    }
  }

  destroy(): void {
    this.node.disconnect()
    this.feedbackGain.disconnect()
    this.wetGain.disconnect()
    this.dryGain.disconnect()
  }
}

class OutputModule implements AudioModule {
  public id: string
  public type: ModuleType = 'output'
  public node: GainNode
  public params: Record<string, AudioParam | number>
  public inputs: Map<string, AudioNode | AudioParam | null> = new Map()
  public outputs: Map<string, AudioNode | null> = new Map()
  private masterGain: GainNode

  constructor(ctx: AudioContext, id: string, masterGain: GainNode) {
    this.id = id
    this.masterGain = masterGain
    this.node = ctx.createGain()
    
    this.params = {
      volume: this.node.gain
    }
    
    this.inputs.set('in', this.node)
    this.outputs.set('out', this.node)
    
    this.node.gain.value = 0.8
    this.node.connect(this.masterGain)
  }

  connect(outputPort: string, targetModule: AudioModule, inputPort: string): void {
  }

  disconnect(outputPort?: string, targetModule?: AudioModule, inputPort?: string): void {
  }

  destroy(): void {
    this.node.disconnect()
  }
}
