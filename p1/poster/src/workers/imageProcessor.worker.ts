interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  type?: 'image/jpeg' | 'image/png' | 'image/webp';
}

interface ProcessResult {
  dataUrl: string;
  width: number;
  height: number;
  size: number;
}

self.onmessage = async (e: MessageEvent<{ imageData: string; options?: CompressOptions }>) => {
  try {
    const { imageData, options } = e.data;
    const result = await processImage(imageData, options);
    self.postMessage({ success: true, data: result });
  } catch (error) {
    self.postMessage({ success: false, error: (error as Error).message });
  }
};

async function processImage(imageData: string, options: CompressOptions = {}): Promise<ProcessResult> {
  const {
    maxWidth = 2000,
    maxHeight = 2000,
    quality = 0.8,
    type = 'image/jpeg',
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = new OffscreenCanvas(width, height);
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas
        .convertToBlob({ type, quality })
        .then((blob) => {
          if (!blob) {
            reject(new Error('Failed to convert canvas to blob'));
            return;
          }

          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              dataUrl: reader.result as string,
              width,
              height,
              size: blob.size,
            });
          };
          reader.onerror = () => reject(new Error('Failed to read blob'));
          reader.readAsDataURL(blob);
        })
        .catch(reject);
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageData;
  });
}

export {};
