export const compressImage = (
  file: File,
  maxSizeMB: number = 2,
  maxWidthOrHeight: number = 1920
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = URL.createObjectURL(file);
    
    image.onload = () => {
      const canvas = document.createElement('canvas');
      let width = image.width;
      let height = image.height;

      if (width > maxWidthOrHeight || height > maxWidthOrHeight) {
        if (width > height) {
          height = (height * maxWidthOrHeight) / width;
          width = maxWidthOrHeight;
        } else {
          width = (width * maxWidthOrHeight) / height;
          height = maxWidthOrHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('无法获取canvas上下文'));
        return;
      }

      ctx.drawImage(image, 0, 0, width, height);

      let quality = 0.9;
      const maxSizeBytes = maxSizeMB * 1024 * 1024;

      const tryCompress = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('压缩失败'));
              return;
            }

            if (blob.size > maxSizeBytes && quality > 0.1) {
              quality -= 0.1;
              tryCompress();
            } else {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              URL.revokeObjectURL(image.src);
              resolve(compressedFile);
            }
          },
          'image/jpeg',
          quality
        );
      };

      tryCompress();
    };

    image.onerror = () => {
      URL.revokeObjectURL(image.src);
      reject(new Error('图片加载失败'));
    };
  });
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

export const validateImageFile = (file: File): { valid: boolean; message?: string } => {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return { valid: false, message: '不支持的图片格式，请上传 JPG、PNG、GIF 或 WebP 格式的图片' };
  }

  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, message: '图片大小不能超过 10MB' };
  }

  return { valid: true };
};
