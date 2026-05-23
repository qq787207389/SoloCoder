import React, { useState, useRef } from 'react';
import { compressImage, getFilePreview } from '../../utils/image';

interface ImageUploaderProps {
  value?: string;
  onChange?: (url: string) => void;
  multiple?: boolean;
  maxFiles?: number;
  className?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  multiple = false,
  maxFiles = 5,
  className = '',
}) => {
  const [preview, setPreview] = useState<string | undefined>(value);
  const [previews, setPreviews] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (multiple) {
      const newPreviews: string[] = [];
      for (let i = 0; i < Math.min(files.length, maxFiles); i++) {
        const compressed = await compressImage(files[i]);
        newPreviews.push(compressed);
      }
      setPreviews([...previews, ...newPreviews]);
    } else {
      const compressed = await compressImage(files[0]);
      setPreview(compressed);
      onChange?.(compressed);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const removeImage = (index: number) => {
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
  };

  if (multiple) {
    return (
      <div className={className}>
        <div className="flex flex-wrap gap-3">
          {previews.map((img, index) => (
            <div key={index} className="relative">
              <img
                src={img}
                alt={`preview-${index}`}
                className="w-24 h-24 object-cover rounded-xl"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ))}
          {previews.length < maxFiles && (
            <button
              type="button"
              onClick={handleClick}
              className="w-24 h-24 border-2 border-dashed border-pink-300 rounded-xl flex flex-col items-center justify-center text-pink-400 hover:border-pink-400 hover:bg-pink-50 transition-colors"
            >
              <span className="text-2xl">+</span>
              <span className="text-xs mt-1">添加图片</span>
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      {preview ? (
        <div className="relative" onClick={handleClick}>
          <img
            src={preview}
            alt="preview"
            className="w-32 h-32 object-cover rounded-2xl cursor-pointer shadow-md"
          />
          <div className="absolute inset-0 bg-black bg-opacity-30 rounded-2xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
            <span className="text-white text-sm">点击更换</span>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          className="w-32 h-32 border-2 border-dashed border-pink-300 rounded-2xl flex flex-col items-center justify-center text-pink-400 hover:border-pink-400 hover:bg-pink-50 transition-colors"
        >
          <span className="text-3xl">📷</span>
          <span className="text-sm mt-2">上传头像</span>
        </button>
      )}
    </div>
  );
};

export default ImageUploader;
