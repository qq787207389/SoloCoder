export class AudioManager {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private enabled: boolean = true;

  constructor() {
    this.initAudio();
  }

  private initAudio(): void {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioContext = new AudioContextClass();
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = 0.3;
        this.masterGain.connect(this.audioContext.destination);
      }
    } catch (e) {
      console.warn('Web Audio API not supported');
      this.enabled = false;
    }
  }

  private ensureContext(): void {
    if (!this.audioContext) return;
    
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  playHit(power: number = 0.5): void {
    if (!this.enabled || !this.audioContext || !this.masterGain) return;
    this.ensureContext();

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    const baseFreq = 800 + power * 600;
    osc.type = 'square';
    osc.frequency.setValueAtTime(baseFreq, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.08);
    
    gain.gain.setValueAtTime(0.3 + power * 0.4, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.1);
  }

  playWallHit(power: number = 0.5): void {
    if (!this.enabled || !this.audioContext || !this.masterGain) return;
    this.ensureContext();

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150 + power * 100, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, this.audioContext.currentTime + 0.15);
    
    gain.gain.setValueAtTime(0.2 + power * 0.3, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.2);
  }

  playPocket(): void {
    if (!this.enabled || !this.audioContext || !this.masterGain) return;
    this.ensureContext();

    const osc1 = this.audioContext.createOscillator();
    const osc2 = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(200, this.audioContext.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.2);
    
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(100, this.audioContext.currentTime + 0.05);
    osc2.frequency.exponentialRampToValueAtTime(30, this.audioContext.currentTime + 0.25);
    
    gain.gain.setValueAtTime(0.4, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain);
    
    osc1.start();
    osc2.start(this.audioContext.currentTime + 0.05);
    osc1.stop(this.audioContext.currentTime + 0.3);
    osc2.stop(this.audioContext.currentTime + 0.3);
  }

  playFoul(): void {
    if (!this.enabled || !this.audioContext || !this.masterGain) return;
    this.ensureContext();

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, this.audioContext.currentTime);
    osc.frequency.setValueAtTime(300, this.audioContext.currentTime + 0.1);
    osc.frequency.setValueAtTime(200, this.audioContext.currentTime + 0.2);
    
    gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.3);
  }

  playVictory(): void {
    if (!this.enabled || !this.audioContext || !this.masterGain) return;
    this.ensureContext();

    const notes = [523.25, 659.25, 783.99, 1046.50, 783.99, 1046.50];
    const startTime = this.audioContext.currentTime;

    notes.forEach((freq, i) => {
      const osc = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, startTime + i * 0.12);
      
      gain.gain.setValueAtTime(0.15, startTime + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + i * 0.12 + 0.15);
      
      osc.connect(gain);
      gain.connect(this.masterGain!);
      
      osc.start(startTime + i * 0.12);
      osc.stop(startTime + i * 0.12 + 0.15);
    });
  }

  setVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  toggle(): boolean {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}
