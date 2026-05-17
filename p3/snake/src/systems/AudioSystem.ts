import gameConfig from '../config/gameConfig.json';

export class AudioSystem {
  private audioContext: AudioContext | null = null;
  private masterVolume: number = gameConfig.audio.masterVolume;
  private initialized: boolean = false;

  public init(): void {
    if (this.initialized) return;

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  public ensureInitialized(): void {
    if (!this.initialized) {
      this.init();
    }
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  public playEffect(
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume: number = 1
  ): void {
    this.ensureInitialized();
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

    gainNode.gain.setValueAtTime(this.masterVolume * volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  public playEat(): void {
    const config = gameConfig.audio.effects.eat;
    this.playEffect(config.frequency, config.duration, config.type as OscillatorType);
  }

  public playDeath(): void {
    const config = gameConfig.audio.effects.death;
    this.playEffect(config.frequency, config.duration, config.type as OscillatorType);
    setTimeout(() => {
      this.playEffect(config.frequency * 0.75, config.duration, config.type as OscillatorType);
    }, 100);
  }

  public playPowerUp(): void {
    const config = gameConfig.audio.effects.powerup;
    this.playEffect(config.frequency, config.duration, config.type as OscillatorType);
    setTimeout(() => {
      this.playEffect(config.frequency * 1.5, config.duration, config.type as OscillatorType);
    }, 100);
  }

  public playClick(): void {
    const config = gameConfig.audio.effects.click;
    this.playEffect(config.frequency, config.duration, config.type as OscillatorType);
  }

  public setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  public getMasterVolume(): number {
    return this.masterVolume;
  }
}