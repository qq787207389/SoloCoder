export class AudioManager {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;
  private volume: number = 0.3;

  init(): void {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine'): void {
    if (!this.enabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(this.volume * 0.5, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  playSpin(): void {
    this.playTone(200, 0.1, 'square');
    setTimeout(() => this.playTone(250, 0.1, 'square'), 100);
  }

  playReelStop(): void {
    this.playTone(440, 0.15, 'sine');
  }

  playWin(): void {
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, index) => {
      setTimeout(() => this.playTone(freq, 0.2, 'sine'), index * 150);
    });
  }

  playCoin(): void {
    this.playTone(880, 0.1, 'sine');
    setTimeout(() => this.playTone(1108.73, 0.15, 'sine'), 80);
  }

  playError(): void {
    this.playTone(150, 0.3, 'sawtooth');
  }
}