import { BeatData, Beatmap } from '../types';

export class AudioSystem {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private gainNode: GainNode | null = null;
  private source: AudioBufferSourceNode | null = null;
  private audioBuffer: AudioBuffer | null = null;
  private isPlaying = false;
  private startTime = 0;
  private pauseTime = 0;
  
  private onBeatCallbacks: Array<(beat: BeatData) => void> = [];
  private onUpdateCallbacks: Array<(data: { spectrum: Uint8Array; time: number }) => void> = [];
  
  private currentBeatIndex = 0;
  private beatmap: Beatmap | null = null;
  
  private frequencyData: Uint8Array = new Uint8Array(256);
  
  constructor() {}
  
  async init(): Promise<void> {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 512;
    this.gainNode = this.audioContext.createGain();
    
    this.analyser.connect(this.gainNode);
    this.gainNode.connect(this.audioContext.destination);
    
    this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
  }
  
  async loadMusic(url: string): Promise<void> {
    if (!this.audioContext) await this.init();
    
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    this.audioBuffer = await this.audioContext!.decodeAudioData(arrayBuffer);
  }
  
  setBeatmap(beatmap: Beatmap): void {
    this.beatmap = beatmap;
    this.currentBeatIndex = 0;
  }
  
  generateBeatmap(bpm: number, duration: number, name: string = 'generated'): Beatmap {
    const beats: BeatData[] = [];
    const beatInterval = 60 / bpm;
    const totalBeats = Math.floor(duration / beatInterval);
    
    for (let i = 0; i < totalBeats; i++) {
      beats.push({
        time: i * beatInterval,
        intensity: 0.5 + Math.random() * 0.5,
      });
    }
    
    return {
      id: `beatmap_${Date.now()}`,
      name,
      bpm,
      beats,
      duration,
      musicUrl: '',
    };
  }
  
  async analyzeAudioAndGenerateBeatmap(): Promise<Beatmap | null> {
    if (!this.audioBuffer) return null;
    
    const channelData = this.audioBuffer.getChannelData(0);
    const sampleRate = this.audioBuffer.sampleRate;
    const duration = this.audioBuffer.duration;
    
    const windowSize = Math.floor(sampleRate * 0.05);
    const hopSize = Math.floor(windowSize / 2);
    
    const energies: { time: number; energy: number }[] = [];
    
    for (let i = 0; i < channelData.length - windowSize; i += hopSize) {
      let energy = 0;
      for (let j = 0; j < windowSize; j++) {
        energy += channelData[i + j] * channelData[i + j];
      }
      energy /= windowSize;
      energies.push({
        time: i / sampleRate,
        energy,
      });
    }
    
    const avgEnergy = energies.reduce((sum, e) => sum + e.energy, 0) / energies.length;
    const threshold = avgEnergy * 1.5;
    
    const beats: BeatData[] = [];
    let lastBeatTime = -1;
    const minBeatInterval = 60 / 200;
    
    for (const e of energies) {
      if (e.energy > threshold && e.time - lastBeatTime > minBeatInterval) {
        const intensity = Math.min(1, (e.energy - threshold) / (avgEnergy * 2));
        beats.push({
          time: e.time,
          intensity,
        });
        lastBeatTime = e.time;
      }
    }
    
    if (beats.length < 10) {
      return this.generateBeatmap(120, duration);
    }
    
    const intervals = [];
    for (let i = 1; i < beats.length; i++) {
      intervals.push(beats[i].time - beats[i - 1].time);
    }
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const estimatedBPM = Math.round(60 / avgInterval);
    
    return {
      id: `analyzed_${Date.now()}`,
      name: 'Analyzed Beatmap',
      bpm: estimatedBPM,
      beats,
      duration,
      musicUrl: '',
    };
  }
  
  play(): void {
    if (!this.audioContext || !this.audioBuffer || this.isPlaying) return;
    
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    
    this.source = this.audioContext.createBufferSource();
    this.source.buffer = this.audioBuffer;
    this.source.connect(this.analyser!);
    
    const offset = this.pauseTime;
    this.source.start(0, offset);
    this.startTime = this.audioContext.currentTime - offset;
    this.isPlaying = true;
    this.startUpdateLoop();
  }
  
  pause(): void {
    if (!this.isPlaying || !this.source) return;
    
    this.pauseTime = this.getCurrentTime();
    this.source.stop();
    this.source.disconnect();
    this.source = null;
    this.isPlaying = false;
  }
  
  stop(): void {
    if (this.source) {
      try {
        this.source.stop();
        this.source.disconnect();
      } catch (e) {}
      this.source = null;
    }
    this.isPlaying = false;
    this.pauseTime = 0;
    this.currentBeatIndex = 0;
  }
  
  seek(time: number): void {
    const wasPlaying = this.isPlaying;
    if (this.isPlaying) {
      this.stop();
    }
    this.pauseTime = time;
    this.currentBeatIndex = 0;
    if (this.beatmap) {
      while (this.currentBeatIndex < this.beatmap.beats.length &&
             this.beatmap.beats[this.currentBeatIndex].time < time) {
        this.currentBeatIndex++;
      }
    }
    if (wasPlaying) {
      this.play();
    }
  }
  
  getCurrentTime(): number {
    if (!this.audioContext) return 0;
    if (!this.isPlaying) return this.pauseTime;
    return this.audioContext.currentTime - this.startTime;
  }
  
  getSpectrum(): Uint8Array {
    if (this.analyser) {
      this.analyser.getByteFrequencyData(this.frequencyData as Uint8Array<ArrayBuffer>);
    }
    return this.frequencyData;
  }
  
  getAverageFrequency(): number {
    const spectrum = this.getSpectrum();
    let sum = 0;
    for (let i = 0; i < spectrum.length; i++) {
      sum += spectrum[i];
    }
    return sum / spectrum.length;
  }
  
  getBassEnergy(): number {
    const spectrum = this.getSpectrum();
    let sum = 0;
    const bassEnd = Math.floor(spectrum.length * 0.1);
    for (let i = 0; i < bassEnd; i++) {
      sum += spectrum[i];
    }
    return sum / bassEnd;
  }
  
  onBeat(callback: (beat: BeatData) => void): () => void {
    this.onBeatCallbacks.push(callback);
    return () => {
      const index = this.onBeatCallbacks.indexOf(callback);
      if (index > -1) this.onBeatCallbacks.splice(index, 1);
    };
  }
  
  onUpdate(callback: (data: { spectrum: Uint8Array; time: number }) => void): () => void {
    this.onUpdateCallbacks.push(callback);
    return () => {
      const index = this.onUpdateCallbacks.indexOf(callback);
      if (index > -1) this.onUpdateCallbacks.splice(index, 1);
    };
  }
  
  private startUpdateLoop(): void {
    const update = () => {
      if (!this.isPlaying) return;
      
      const currentTime = this.getCurrentTime();
      const spectrum = this.getSpectrum();
      
      if (this.beatmap && this.currentBeatIndex < this.beatmap.beats.length) {
        const nextBeat = this.beatmap.beats[this.currentBeatIndex];
        if (currentTime >= nextBeat.time) {
          for (const callback of this.onBeatCallbacks) {
            callback(nextBeat);
          }
          this.currentBeatIndex++;
        }
      }
      
      for (const callback of this.onUpdateCallbacks) {
        callback({ spectrum, time: currentTime });
      }
      
      requestAnimationFrame(update);
    };
    
    requestAnimationFrame(update);
  }
  
  setVolume(volume: number): void {
    if (this.gainNode) {
      this.gainNode.gain.value = Math.max(0, Math.min(1, volume));
    }
  }
  
  getIsPlaying(): boolean {
    return this.isPlaying;
  }
  
  getDuration(): number {
    return this.audioBuffer?.duration || 0;
  }
  
  dispose(): void {
    this.stop();
    if (this.audioContext) {
      this.audioContext.close();
    }
    this.onBeatCallbacks = [];
    this.onUpdateCallbacks = [];
  }
}
