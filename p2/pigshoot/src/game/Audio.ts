export class AudioManager {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private initialized: boolean = false;
  private musicGain: GainNode | null = null;

  constructor() {
    this.initializeOnFirstInteraction();
  }

  private initializeOnFirstInteraction(): void {
    const init = () => {
      if (!this.initialized) {
        this.init();
      }
      document.removeEventListener('click', init);
      document.removeEventListener('keydown', init);
    };
    document.addEventListener('click', init);
    document.addEventListener('keydown', init);
  }

  public init(): void {
    if (this.initialized) return;

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 0.3;
      this.masterGain.connect(this.audioContext.destination);
      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = 'square',
    volume: number = 0.3
  ): void {
    if (!this.audioContext || !this.masterGain) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  public playShoot(): void {
    this.playTone(800, 0.1, 'square', 0.2);
    setTimeout(() => this.playTone(600, 0.05, 'square', 0.15), 30);
  }

  public playPop(): void {
    this.playTone(400, 0.15, 'sawtooth', 0.25);
    setTimeout(() => this.playTone(200, 0.1, 'square', 0.2), 50);
  }

  public playScore(): void {
    this.playTone(523, 0.1, 'square', 0.2);
    setTimeout(() => this.playTone(659, 0.1, 'square', 0.2), 100);
    setTimeout(() => this.playTone(784, 0.15, 'square', 0.2), 200);
  }

  public playHit(): void {
    this.playTone(150, 0.2, 'square', 0.3);
  }

  public playBonus(): void {
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.15, 'square', 0.2), i * 100);
    });
  }

  public playGameOver(): void {
    const notes = [392, 349, 330, 262];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.3, 'square', 0.25), i * 250);
    });
  }

  public playWolfHowl(): void {
    this.playTone(300, 0.4, 'sawtooth', 0.15);
    setTimeout(() => this.playTone(400, 0.3, 'sawtooth', 0.1), 200);
  }

  public playRockThrow(): void {
    this.playTone(200, 0.1, 'square', 0.2);
  }

  public playMeatDrop(): void {
    this.playTone(600, 0.1, 'sine', 0.2);
    setTimeout(() => this.playTone(500, 0.15, 'sine', 0.15), 80);
  }

  public playHiddenItem(): void {
    const notes = [523, 659, 784, 880, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.12, 'sine', 0.2), i * 80);
    });
  }

  public startMusic(level: number, isTense: boolean = false): void {
    if (!this.audioContext || !this.masterGain) return;
    this.stopMusic();

    this.musicGain = this.audioContext.createGain();
    this.musicGain.gain.value = 0.08;
    this.musicGain.connect(this.masterGain);

    const baseFreq = level === 3 ? 523 : level === 2 ? 330 : 440;
    const tempo = isTense ? 150 : 250;

    const playNote = () => {
      if (!this.musicGain || !this.audioContext) return;
      
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      
      const variation = Math.random() * 0.5 + 0.75;
      osc.type = 'triangle';
      osc.frequency.value = baseFreq * variation;
      
      gain.gain.value = 0.5;
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
      
      osc.connect(gain);
      gain.connect(this.musicGain);
      osc.start();
      osc.stop(this.audioContext.currentTime + 0.15);
    };

    const musicInterval = setInterval(() => {
      if (this.musicGain) {
        playNote();
      } else {
        clearInterval(musicInterval);
      }
    }, tempo);

    (this.musicGain as any).interval = musicInterval;
  }

  public stopMusic(): void {
    if (this.musicGain) {
      if ((this.musicGain as any).interval) {
        clearInterval((this.musicGain as any).interval);
      }
      this.musicGain.disconnect();
      this.musicGain = null;
    }
  }
}
