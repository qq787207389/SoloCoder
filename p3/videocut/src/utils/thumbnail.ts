export const generateThumbnail = async (
  videoElement: HTMLVideoElement,
  width: number = 160,
  height: number = 90
): Promise<ImageData> => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(videoElement, 0, 0, width, height);
  return ctx.getImageData(0, 0, width, height);
};

export const generateThumbnailStrip = async (
  videoElement: HTMLVideoElement,
  numThumbnails: number = 10,
  thumbWidth: number = 100,
  thumbHeight: number = 56
): Promise<ImageData[]> => {
  const canvas = document.createElement('canvas');
  canvas.width = thumbWidth;
  canvas.height = thumbHeight;
  const ctx = canvas.getContext('2d')!;
  const thumbnails: ImageData[] = [];
  const duration = videoElement.duration;

  for (let i = 0; i < numThumbnails; i++) {
    const time = (duration * i) / numThumbnails;
    videoElement.currentTime = time;
    await new Promise((resolve) => {
      videoElement.onseeked = resolve;
    });
    ctx.drawImage(videoElement, 0, 0, thumbWidth, thumbHeight);
    thumbnails.push(ctx.getImageData(0, 0, thumbWidth, thumbHeight));
  }

  return thumbnails;
};

export const imageDataToDataURL = (imageData: ImageData): string => {
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext('2d')!;
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
};

export const createThumbnailCanvas = (
  thumbnails: ImageData[],
  stripHeight: number = 40
): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  const thumbWidth = thumbnails[0]?.width || 100;
  const thumbHeight = thumbnails[0]?.height || 56;
  const scale = stripHeight / thumbHeight;
  const width = thumbnails.length * thumbWidth * scale;
  canvas.width = width;
  canvas.height = stripHeight;
  const ctx = canvas.getContext('2d')!;
  const scaledWidth = thumbWidth * scale;

  thumbnails.forEach((thumb, i) => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = thumb.width;
    tempCanvas.height = thumb.height;
    tempCanvas.getContext('2d')!.putImageData(thumb, 0, 0);
    ctx.drawImage(tempCanvas, i * scaledWidth, 0, scaledWidth, stripHeight);
  });

  return canvas;
};
