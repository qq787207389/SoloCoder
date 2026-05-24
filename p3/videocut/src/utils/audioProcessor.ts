export class AudioProcessor {
  private audioContext: AudioContext | null = null;

  async init(): Promise<AudioContext> {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
    return this.audioContext;
  }

  async decodeAudioFile(file: File): Promise<AudioBuffer> {
    const ctx = await this.init();
    const arrayBuffer = await file.arrayBuffer();
    return ctx.decodeAudioData(arrayBuffer);
  }

  extractAudioBuffer(
    sourceBuffer: AudioBuffer,
    startTime: number,
    duration: number
  ): AudioBuffer {
    const ctx = this.audioContext!;
    const sampleRate = sourceBuffer.sampleRate;
    const startSample = Math.floor(startTime * sampleRate);
    const endSample = Math.floor((startTime + duration) * sampleRate);
    const frameCount = endSample - startSample;

    const newBuffer = ctx.createBuffer(
      sourceBuffer.numberOfChannels,
      frameCount,
      sampleRate
    );

    for (let channel = 0; channel < sourceBuffer.numberOfChannels; channel++) {
      const sourceData = sourceBuffer.getChannelData(channel);
      const destData = newBuffer.getChannelData(channel);
      destData.set(sourceData.slice(startSample, endSample));
    }

    return newBuffer;
  }

  close(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

export const audioProcessor = new AudioProcessor();
