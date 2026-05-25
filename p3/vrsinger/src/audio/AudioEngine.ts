import { useConcertStore } from '../store/useConcertStore';

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private gainNode: GainNode | null = null;
  private source: AudioBufferSourceNode | null = null;
  private audioBuffer: AudioBuffer | null = null;
  private isPlaying = false;
  private startTime = 0;
  private pauseTime = 0;
  private animationFrameId: number | null = null;
  private bpm = 128;
  private lastBeatTime = 0;
  private beatCount = 0;

  async init() {
    this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    this.gainNode = this.audioContext.createGain();
    
    this.analyser.connect(this.gainNode);
    this.gainNode.connect(this.audioContext.destination);

    this.generateDemoAudio();
  }

  private generateDemoAudio() {
    if (!this.audioContext) return;

    const duration = 180;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(2, sampleRate * duration, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const channelData = buffer.getChannelData(channel);
      
      for (let i = 0; i < buffer.length; i++) {
        const time = i / sampleRate;
        const beat = (time * this.bpm) / 60;
        const beatPosition = beat % 1;
        
        let sample = 0;
        
        const kickFreq = 60 + Math.sin(beatPosition * Math.PI) * 40;
        const kick = Math.sin(2 * Math.PI * kickFreq * time) * Math.exp(-beatPosition * 10) * 0.5;
        
        const bassFreq = 55 * Math.pow(2, Math.floor(beat / 4) % 4 / 12);
        const bass = Math.sin(2 * Math.PI * bassFreq * time) * 0.3;
        
        const melodyNotes = [0, 4, 7, 12, 7, 4, 0, -2];
        const melodyIndex = Math.floor(beat / 2) % melodyNotes.length;
        const melodyFreq = 220 * Math.pow(2, melodyNotes[melodyIndex] / 12);
        const melody = Math.sin(2 * Math.PI * melodyFreq * time) * Math.sin(beatPosition * Math.PI) * 0.2;
        
        const hihat = (Math.random() - 0.5) * Math.exp(-(beatPosition % 0.5) * 20) * 0.15;
        
        sample = kick + bass + melody + hihat;
        channelData[i] = sample * 0.5;
      }
    }

    this.audioBuffer = buffer;
  }

  play() {
    if (!this.audioContext || !this.audioBuffer) return;

    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    this.source = this.audioContext.createBufferSource();
    this.source.buffer = this.audioBuffer;
    this.source.connect(this.analyser!);
    
    const offset = this.pauseTime % this.audioBuffer.duration;
    this.source.start(0, offset);
    this.startTime = this.audioContext.currentTime - offset;
    this.isPlaying = true;
    this.lastBeatTime = this.audioContext.currentTime;

    this.startAnalysis();
    useConcertStore.getState().setPlaying(true);
  }

  pause() {
    if (this.source && this.isPlaying) {
      this.source.stop();
      this.pauseTime = this.getCurrentTime();
      this.isPlaying = false;
      this.source = null;
      
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
      }
      
      useConcertStore.getState().setPlaying(false);
    }
  }

  seekTo(time: number) {
    const wasPlaying = this.isPlaying;
    
    if (this.isPlaying) {
      this.pause();
    }
    
    this.pauseTime = time;
    
    if (wasPlaying) {
      this.play();
    }
  }

  setVolume(volume: number) {
    if (this.gainNode) {
      this.gainNode.gain.value = volume;
    }
  }

  getCurrentTime(): number {
    if (!this.audioContext || !this.isPlaying) {
      return this.pauseTime;
    }
    return this.audioContext.currentTime - this.startTime;
  }

  private startAnalysis() {
    const analyze = () => {
      if (!this.isPlaying || !this.analyser) return;

      const currentTime = this.getCurrentTime();
      useConcertStore.getState().setCurrentTime(currentTime);

      const beatDuration = 60 / this.bpm;
      if (currentTime - this.lastBeatTime >= beatDuration) {
        this.beatCount++;
        this.lastBeatTime = currentTime;
        useConcertStore.getState().setBeat(this.beatCount);
      }

      this.animationFrameId = requestAnimationFrame(analyze);
    };

    analyze();
  }

  getBeatIntensity(): number {
    if (!this.analyser) return 0;
    
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    
    const lowFreqData = dataArray.slice(0, 10);
    const average = lowFreqData.reduce((a, b) => a + b, 0) / lowFreqData.length;
    
    return average / 255;
  }

  getFrequencyData(): Uint8Array {
    if (!this.analyser) return new Uint8Array();
    
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    
    return dataArray;
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.source) {
      try {
        this.source.stop();
      } catch (e) {
        // ignore
      }
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

export const audioEngine = new AudioEngine();
