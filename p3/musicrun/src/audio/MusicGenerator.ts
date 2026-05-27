export class MusicGenerator {
  private audioContext: AudioContext | null = null;
  
  async init(): Promise<void> {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  
  generateMusic(bpm: number, duration: number): AudioBuffer {
    if (!this.audioContext) {
      throw new Error('AudioContext not initialized');
    }
    
    const sampleRate = this.audioContext.sampleRate;
    const totalSamples = Math.floor(sampleRate * duration);
    const audioBuffer = this.audioContext.createBuffer(2, totalSamples, sampleRate);
    
    const leftChannel = audioBuffer.getChannelData(0);
    const rightChannel = audioBuffer.getChannelData(1);
    
    const beatInterval = 60 / bpm;
    
    const melodyNotes = [261.63, 329.63, 392.00, 523.25, 392.00, 329.63, 261.63, 196.00];
    const bassNotes = [65.41, 82.41, 98.00, 82.41];
    
    for (let i = 0; i < totalSamples; i++) {
      const time = i / sampleRate;
      const beatIndex = Math.floor(time / beatInterval);
      const beatProgress = (time % beatInterval) / beatInterval;
      
      let sample = 0;
      
      if (beatIndex % 1 === 0 && beatProgress < 0.1) {
        const kickEnv = Math.pow(1 - beatProgress * 10, 2);
        sample += this.generateKick(beatProgress) * kickEnv * 0.8;
      }
      
      if (beatIndex % 2 === 1 && beatProgress < 0.15) {
        const snareEnv = Math.pow(1 - beatProgress * 6.67, 1.5);
        sample += this.generateSnare(beatProgress) * snareEnv * 0.5;
      }
      
      const hihatEnv = Math.exp(-beatProgress * 20);
      sample += this.generateHiHat(beatProgress) * hihatEnv * 0.15;
      
      const melodyIndex = Math.floor(beatIndex / 2) % melodyNotes.length;
      const melodyFreq = melodyNotes[melodyIndex];
      sample += this.generateSynth(melodyFreq, beatProgress) * 0.3;
      
      const bassIndex = Math.floor(beatIndex / 4) % bassNotes.length;
      const bassFreq = bassNotes[bassIndex];
      sample += this.generateBass(bassFreq, beatProgress) * 0.4;
      
      const padFreq = 130.81;
      sample += this.generatePad(padFreq, time) * 0.15;
      
      leftChannel[i] = Math.max(-1, Math.min(1, sample));
      rightChannel[i] = Math.max(-1, Math.min(1, sample));
    }
    
    return audioBuffer;
  }
  
  private generateKick(progress: number): number {
    const freq = 150 * Math.exp(-progress * 30) + 50;
    const phase = progress * freq * Math.PI * 2;
    return Math.sin(phase) * (1 - progress);
  }
  
  private generateSnare(progress: number): number {
    const noise = (Math.random() * 2 - 1);
    const tone = Math.sin(progress * 200 * Math.PI) * (1 - progress);
    return noise * 0.7 + tone * 0.3;
  }
  
  private generateHiHat(progress: number): number {
    return (Math.random() * 2 - 1) * (1 - progress);
  }
  
  private generateSynth(freq: number, progress: number): number {
    const env = Math.sin(progress * Math.PI) * Math.exp(-progress * 2);
    const detune = Math.sin(progress * 5) * 0.01;
    const wave1 = Math.sin(progress * freq * Math.PI * 2 * (1 + detune));
    const wave2 = Math.sin(progress * freq * Math.PI * 4 * (1 + detune)) * 0.3;
    return (wave1 + wave2) * env;
  }
  
  private generateBass(freq: number, progress: number): number {
    const env = (1 - Math.exp(-progress * 10)) * Math.exp(-progress * 3);
    const wave = Math.sin(progress * freq * Math.PI * 2);
    const square = wave > 0 ? 1 : -1;
    return (wave * 0.7 + square * 0.3) * env;
  }
  
  private generatePad(freq: number, time: number): number {
    const lfo = Math.sin(time * 0.5) * 0.5 + 0.5;
    const wave1 = Math.sin(time * freq * Math.PI * 2);
    const wave2 = Math.sin(time * freq * 1.5 * Math.PI * 2);
    const wave3 = Math.sin(time * freq * 2 * Math.PI * 2);
    return (wave1 * 0.5 + wave2 * 0.3 + wave3 * 0.2) * (0.5 + lfo * 0.5);
  }
  
  createMusicUrl(audioBuffer: AudioBuffer): string {
    const wavBlob = this.audioBufferToWav(audioBuffer);
    return URL.createObjectURL(wavBlob);
  }
  
  private audioBufferToWav(buffer: AudioBuffer): Blob {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1;
    const bitDepth = 16;
    
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    
    const dataLength = buffer.length * blockAlign;
    const bufferLength = 44 + dataLength;
    
    const arrayBuffer = new ArrayBuffer(bufferLength);
    const view = new DataView(arrayBuffer);
    
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    this.writeString(view, 8, 'WAVE');
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    this.writeString(view, 36, 'data');
    view.setUint32(40, dataLength, true);
    
    const channels: Float32Array[] = [];
    for (let i = 0; i < numChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }
    
    let offset = 44;
    for (let i = 0; i < buffer.length; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        const sample = Math.max(-1, Math.min(1, channels[ch][i]));
        const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
        view.setInt16(offset, intSample, true);
        offset += 2;
      }
    }
    
    return new Blob([arrayBuffer], { type: 'audio/wav' });
  }
  
  private writeString(view: DataView, offset: number, str: string): void {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }
  
  dispose(): void {
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}
