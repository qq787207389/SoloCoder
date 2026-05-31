export class AudioManager {
  private ctx: AudioContext | null = null;
  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private musicPlaying = false;
  private musicNodes: AudioNode[] = [];

  init() {
    try {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.3;
      this.masterGain.connect(this.ctx.destination);
    } catch {
      // Audio not supported
    }
  }

  startEngine() {
    if (!this.ctx || this.engineOsc) return;
    this.engineOsc = this.ctx.createOscillator();
    this.engineGain = this.ctx.createGain();
    this.engineOsc.type = 'sawtooth';
    this.engineOsc.frequency.value = 80;
    this.engineGain.gain.value = 0.08;
    this.engineOsc.connect(this.engineGain);
    this.engineGain.connect(this.masterGain!);
    this.engineOsc.start();
  }

  updateEngine(speed: number, crashed: boolean) {
    if (!this.engineOsc || !this.engineGain) return;
    if (crashed) {
      this.engineGain.gain.value = 0.01;
      return;
    }
    const freq = 60 + Math.abs(speed) * 80;
    this.engineOsc.frequency.value = freq;
    this.engineGain.gain.value = 0.04 + Math.abs(speed) * 0.03;
  }

  stopEngine() {
    if (this.engineOsc) {
      this.engineOsc.stop();
      this.engineOsc.disconnect();
      this.engineOsc = null;
    }
    if (this.engineGain) {
      this.engineGain.disconnect();
      this.engineGain = null;
    }
  }

  playCrash() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = 100;
    gain.gain.value = 0.15;
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
    osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);

    const noise = this.createNoise(0.2, 0.1);
    noise.connect(this.masterGain!);
  }

  playLand() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = 200;
    gain.gain.value = 0.12;
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
    osc.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  playJump() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 200;
    gain.gain.value = 0.06;
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
    osc.frequency.linearRampToValueAtTime(400, this.ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  playPickup() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = 440;
    gain.gain.value = 0.08;
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.setValueAtTime(660, this.ctx.currentTime + 0.05);
    osc.frequency.setValueAtTime(880, this.ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  playStartBeep() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = 660;
    gain.gain.value = 0.1;
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  playFinish() {
    if (!this.ctx) return;
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      gain.gain.value = 0.08;
      gain.gain.setValueAtTime(0.08, this.ctx!.currentTime + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + i * 0.15 + 0.3);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(this.ctx!.currentTime + i * 0.15);
      osc.stop(this.ctx!.currentTime + i * 0.15 + 0.3);
    });
  }

  startMusic() {
    if (!this.ctx || this.musicPlaying) return;
    this.musicPlaying = true;
    this.playMusicLoop();
  }

  stopMusic() {
    this.musicPlaying = false;
    this.musicNodes.forEach(n => {
      try { (n as OscillatorNode).stop(); } catch { /* ignore */ }
      try { n.disconnect(); } catch { /* ignore */ }
    });
    this.musicNodes = [];
  }

  private playMusicLoop() {
    if (!this.ctx || !this.musicPlaying) return;

    const bpm = 140;
    const beatLen = 60 / bpm;
    const barLen = beatLen * 4;
    const totalBars = 4;
    const totalLen = barLen * totalBars;

    const bassLine = [65, 65, 82, 73, 65, 65, 98, 82];
    const melody = [130, 0, 165, 196, 220, 196, 165, 147, 130, 0, 110, 130, 147, 130, 110, 98];

    for (let bar = 0; bar < totalBars; bar++) {
      for (let beat = 0; beat < 8; beat++) {
        const time = this.ctx.currentTime + bar * barLen + beat * beatLen / 2;
        const bassFreq = bassLine[beat % bassLine.length];
        if (bassFreq > 0) {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'square';
          osc.frequency.value = bassFreq;
          gain.gain.value = 0.04;
          gain.gain.setValueAtTime(0.04, time);
          gain.gain.exponentialRampToValueAtTime(0.001, time + beatLen / 2 - 0.01);
          osc.connect(gain);
          gain.connect(this.masterGain!);
          osc.start(time);
          osc.stop(time + beatLen / 2);
          this.musicNodes.push(osc);
        }

        const melIdx = (bar * 8 + beat) % melody.length;
        const melFreq = melody[melIdx];
        if (melFreq > 0 && beat % 2 === 0) {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'square';
          osc.frequency.value = melFreq;
          gain.gain.value = 0.03;
          gain.gain.setValueAtTime(0.03, time);
          gain.gain.exponentialRampToValueAtTime(0.001, time + beatLen / 2 - 0.02);
          osc.connect(gain);
          gain.connect(this.masterGain!);
          osc.start(time);
          osc.stop(time + beatLen / 2);
          this.musicNodes.push(osc);
        }

        if (beat % 2 === 0) {
          const noise = this.createNoise(0.05, 0.03);
          noise.connect(this.masterGain!);
        }
      }
    }

    setTimeout(() => {
      this.musicNodes = [];
      if (this.musicPlaying) this.playMusicLoop();
    }, totalLen * 1000);
  }

  private createNoise(duration: number, volume: number): AudioNode {
    const bufferSize = this.ctx!.sampleRate * duration;
    const buffer = this.ctx!.createBuffer(1, bufferSize, this.ctx!.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }
    const source = this.ctx!.createBufferSource();
    source.buffer = buffer;
    const gain = this.ctx!.createGain();
    gain.gain.value = volume;
    source.connect(gain);
    source.start();
    source.stop(this.ctx!.currentTime + duration);
    return gain;
  }
}
