export class AudioManager {
  private static instance: AudioManager
  private ctx: AudioContext | null = null

  private constructor() {}

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager()
    }
    return AudioManager.instance
  }

  init(): void {
    if (!this.ctx) {
      this.ctx = new AudioContext()
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext()
    }
    return this.ctx
  }

  private createGain(attack: number, decay: number, peak: number): GainNode {
    const ctx = this.getCtx()
    const gain = ctx.createGain()
    const now = ctx.currentTime
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(peak, now + attack)
    gain.gain.linearRampToValueAtTime(0, now + attack + decay)
    gain.connect(ctx.destination)
    return gain
  }

  playShoot(): void {
    const ctx = this.getCtx()
    const osc = ctx.createOscillator()
    const gain = this.createGain(0.01, 0.08, 0.15)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(150, ctx.currentTime)
    osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.09)
    osc.connect(gain)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.1)
  }

  playKick(): void {
    const ctx = this.getCtx()
    const osc = ctx.createOscillator()
    const gain = this.createGain(0.01, 0.1, 0.2)
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(300, ctx.currentTime)
    osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.12)
    osc.connect(gain)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.12)
  }

  playCrash(): void {
    const ctx = this.getCtx()
    const bufferSize = ctx.sampleRate * 0.2
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }
    const source = ctx.createBufferSource()
    source.buffer = buffer
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(4000, ctx.currentTime)
    filter.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.15)
    filter.Q.value = 1.5
    const gain = this.createGain(0.005, 0.15, 0.25)
    source.connect(filter)
    filter.connect(gain)
    source.start(ctx.currentTime)
    source.stop(ctx.currentTime + 0.2)
  }

  playChain(pitch: number): void {
    const ctx = this.getCtx()
    const osc = ctx.createOscillator()
    const gain = this.createGain(0.01, 0.06, 0.2)
    const baseFreq = 400 * Math.max(0.5, Math.min(pitch, 4))
    osc.type = 'square'
    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime)
    osc.frequency.linearRampToValueAtTime(baseFreq * 1.5, ctx.currentTime + 0.07)
    osc.connect(gain)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.08)
  }

  playRoll(): void {
    const ctx = this.getCtx()
    const bufferSize = ctx.sampleRate * 0.15
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }
    const source = ctx.createBufferSource()
    source.buffer = buffer
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 200
    filter.Q.value = 1
    const gain = this.createGain(0.01, 0.1, 0.1)
    source.connect(filter)
    filter.connect(gain)
    source.start(ctx.currentTime)
    source.stop(ctx.currentTime + 0.15)
  }

  playPowerUp(): void {
    const ctx = this.getCtx()
    const notes = [523, 659, 784, 1047]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const start = ctx.currentTime + i * 0.06
      gain.gain.setValueAtTime(0, start)
      gain.gain.linearRampToValueAtTime(0.15, start + 0.01)
      gain.gain.linearRampToValueAtTime(0, start + 0.08)
      gain.connect(ctx.destination)
      osc.type = 'square'
      osc.frequency.value = freq
      osc.connect(gain)
      osc.start(start)
      osc.stop(start + 0.09)
    })
  }

  playHurt(): void {
    const ctx = this.getCtx()
    const osc = ctx.createOscillator()
    const gain = this.createGain(0.01, 0.2, 0.2)
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(400, ctx.currentTime)
    osc.frequency.linearRampToValueAtTime(150, ctx.currentTime + 0.22)
    osc.connect(gain)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.25)
  }

  playGameOver(): void {
    const ctx = this.getCtx()
    const notes = [392, 349, 330, 262]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const start = ctx.currentTime + i * 0.2
      gain.gain.setValueAtTime(0, start)
      gain.gain.linearRampToValueAtTime(0.2, start + 0.02)
      gain.gain.linearRampToValueAtTime(0, start + 0.2)
      gain.connect(ctx.destination)
      osc.type = 'triangle'
      osc.frequency.value = freq
      osc.connect(gain)
      osc.start(start)
      osc.stop(start + 0.22)
    })
  }

  playStageClear(): void {
    const ctx = this.getCtx()
    const notes = [523, 659, 784, 1047, 1319]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const start = ctx.currentTime + i * 0.08
      gain.gain.setValueAtTime(0, start)
      gain.gain.linearRampToValueAtTime(0.18, start + 0.01)
      gain.gain.linearRampToValueAtTime(0, start + 0.12)
      gain.connect(ctx.destination)
      osc.type = 'square'
      osc.frequency.value = freq
      osc.connect(gain)
      osc.start(start)
      osc.stop(start + 0.14)
    })
  }
}
