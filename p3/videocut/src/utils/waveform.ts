export const generateWaveformData = async (
  audioBuffer: AudioBuffer,
  samples: number = 200
): Promise<number[]> => {
  const channelData = audioBuffer.getChannelData(0);
  const blockSize = Math.floor(channelData.length / samples);
  const waveformData: number[] = [];

  for (let i = 0; i < samples; i++) {
    let sum = 0;
    for (let j = 0; j < blockSize; j++) {
      sum += Math.abs(channelData[i * blockSize + j]);
    }
    waveformData.push(sum / blockSize);
  }

  const max = Math.max(...waveformData);
  return waveformData.map((v) => (max > 0 ? v / max : 0));
};

export const drawWaveform = (
  ctx: CanvasRenderingContext2D,
  waveformData: number[],
  width: number,
  height: number,
  color: string = '#3b82f6'
): void => {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = color;
  const barWidth = width / waveformData.length;
  const centerY = height / 2;

  waveformData.forEach((value, i) => {
    const barHeight = value * height * 0.9;
    const x = i * barWidth;
    ctx.fillRect(x, centerY - barHeight / 2, Math.max(1, barWidth - 1), barHeight);
  });
};

export const createWaveformCanvas = (
  waveformData: number[],
  width: number,
  height: number,
  color: string = '#3b82f6'
): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  drawWaveform(ctx, waveformData, width, height, color);
  return canvas;
};
