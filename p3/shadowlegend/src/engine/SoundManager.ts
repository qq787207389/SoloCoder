export class SoundManager {
  private ctx: AudioContext | null = null;
  private bossInterval: number | null = null;

  private ensureCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  private createNoise(duration: number): AudioBufferSourceNode {
    const ctx = this.ensureCtx();
    const sampleRate = ctx.sampleRate;
    const length = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    return source;
  }

  playSwordSlash(): void {
    const ctx = this.ensureCtx();
    const noise = this.createNoise(0.12);
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 3000;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(ctx.currentTime);
    noise.stop(ctx.currentTime + 0.12);
  }

  playShurikenThrow(): void {
    const ctx = this.ensureCtx();
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.15);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  }

  playHit(): void {
    const ctx = this.ensureCtx();
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
    const distortion = ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
      const x = (i * 2) / 256 - 1;
      curve[i] = (Math.PI + 4) * x / (Math.PI + 4 * Math.abs(x));
    }
    distortion.curve = curve;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.connect(distortion);
    distortion.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  }

  playEnemyDeath(): void {
    const ctx = this.ensureCtx();
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(220, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(55, ctx.currentTime + 0.5);
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(330, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(82.5, ctx.currentTime + 0.5);
    const osc3 = ctx.createOscillator();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(440, ctx.currentTime);
    osc3.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.4);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc1.connect(gain);
    osc2.connect(gain);
    osc3.connect(gain);
    gain.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc2.start(ctx.currentTime);
    osc3.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.5);
    osc2.stop(ctx.currentTime + 0.5);
    osc3.stop(ctx.currentTime + 0.4);
  }

  playPickup(): void {
    const ctx = this.ensureCtx();
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const gain = ctx.createGain();
      const start = ctx.currentTime + i * 0.08;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.2, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, start + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.2);
    });
  }

  playJump(): void {
    const ctx = this.ensureCtx();
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(520, ctx.currentTime + 0.1);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  }

  playBossMusic(): void {
    const ctx = this.ensureCtx();
    let beat = 0;
    const bpm = 140;
    const interval = 60000 / bpm;

    const playBeat = () => {
      const now = ctx.currentTime;

      if (beat % 4 === 0) {
        const kick = ctx.createOscillator();
        kick.type = 'sine';
        kick.frequency.setValueAtTime(150, now);
        kick.frequency.exponentialRampToValueAtTime(30, now + 0.15);
        const kickGain = ctx.createGain();
        kickGain.gain.setValueAtTime(0.35, now);
        kickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        kick.connect(kickGain);
        kickGain.connect(ctx.destination);
        kick.start(now);
        kick.stop(now + 0.15);
      }

      if (beat % 4 === 2) {
        const noise = this.createNoise(0.05);
        const hihatGain = ctx.createGain();
        hihatGain.gain.setValueAtTime(0.1, now);
        hihatGain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        const hpf = ctx.createBiquadFilter();
        hpf.type = 'highpass';
        hpf.frequency.value = 8000;
        noise.connect(hpf);
        hpf.connect(hihatGain);
        hihatGain.connect(ctx.destination);
        noise.start(now);
        noise.stop(now + 0.05);
      }

      if (beat % 8 === 0) {
        const pulse = ctx.createOscillator();
        pulse.type = 'square';
        pulse.frequency.value = 55;
        const pulseGain = ctx.createGain();
        pulseGain.gain.setValueAtTime(0.15, now);
        pulseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        pulse.connect(pulseGain);
        pulseGain.connect(ctx.destination);
        pulse.start(now);
        pulse.stop(now + 0.2);
      }

      beat++;
    };

    playBeat();
    this.bossInterval = window.setInterval(playBeat, interval);
  }

  stopBossMusic(): void {
    if (this.bossInterval !== null) {
      clearInterval(this.bossInterval);
      this.bossInterval = null;
    }
  }

  destroy(): void {
    this.stopBossMusic();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}
