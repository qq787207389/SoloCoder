import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, MapPin, User, FileText, Check, AlertCircle } from 'lucide-react';
import { compressImage, validateImageFile, formatFileSize } from '../../utils/imageCompress';
import { getYearToDecade } from '../../types';
import MapComponent from '../Map/MapComponent';

interface PhotoUploadProps {
  onSubmit: (formData: FormData) => void;
  isLoading: boolean;
}

interface UploadState {
  file: File | null;
  preview: string | null;
  title: string;
  description: string;
  year: number;
  location: string;
  author: string;
  lat: number | null;
  lng: number | null;
  isCompressing: boolean;
  compressProgress: number;
  originalSize: number;
  compressedSize: number;
}

const PhotoUpload = ({ onSubmit, isLoading }: PhotoUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    preview: null,
    title: '',
    description: '',
    year: 1990,
    location: '',
    author: '',
    lat: null,
    lng: null,
    isCompressing: false,
    compressProgress: 0,
    originalSize: 0,
    compressedSize: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFile = async (file: File) => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setErrors({ file: validation.message || '图片验证失败' });
      return;
    }

    setErrors({});
    setUploadState(prev => ({
      ...prev,
      isCompressing: true,
      compressProgress: 0,
      originalSize: file.size,
    }));

    try {
      setUploadState(prev => ({ ...prev, compressProgress: 30 }));
      
      const compressedFile = await compressImage(file, 2, 1920);
      
      setUploadState(prev => ({ ...prev, compressProgress: 80 }));

      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadState(prev => ({
          ...prev,
          file: compressedFile,
          preview: e.target?.result as string,
          isCompressing: false,
          compressProgress: 100,
          compressedSize: compressedFile.size,
        }));
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      setErrors({ file: '图片压缩失败，请重试' });
      setUploadState(prev => ({ ...prev, isCompressing: false }));
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const clearFile = () => {
    setUploadState(prev => ({
      ...prev,
      file: null,
      preview: null,
      isCompressing: false,
      compressProgress: 0,
      originalSize: 0,
      compressedSize: 0,
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const decade = getYearToDecade(uploadState.year);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!uploadState.file) newErrors.file = '请选择要上传的照片';
    if (!uploadState.title.trim()) newErrors.title = '请填写照片标题';
    if (!uploadState.description.trim()) newErrors.description = '请填写回忆文字';
    if (!uploadState.location.trim()) newErrors.location = '请选择拍摄位置';
    if (uploadState.lat === null || uploadState.lng === null) newErrors.location = '请在地图上标记位置';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const formData = new FormData();
    formData.append('title', uploadState.title);
    formData.append('description', uploadState.description);
    formData.append('year', uploadState.year.toString());
    formData.append('location', uploadState.location);
    formData.append('author', uploadState.author || '匿名用户');
    formData.append('lat', uploadState.lat!.toString());
    formData.append('lng', uploadState.lng!.toString());
    if (uploadState.file) {
      formData.append('image', uploadState.file);
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="card-vintage p-6">
        <h3 className="text-lg font-display font-semibold text-nostalgic-brown mb-4 flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          选择老照片
        </h3>

        {!uploadState.preview ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-vintage p-12 text-center cursor-pointer transition-all duration-200 ${
              isDragging
                ? 'border-nostalgic-orange bg-nostalgic-orange/5'
                : errors.file
                ? 'border-red-500 bg-red-50'
                : 'border-nostalgic-brownLighter hover:border-nostalgic-brown hover:bg-nostalgic-cream/50'
            }`}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-nostalgic-brownLight" />
            <p className="text-nostalgic-brown font-medium mb-2">
              拖拽照片到这里，或点击选择
            </p>
            <p className="text-sm text-nostalgic-brownLight">
              支持 JPG、PNG、GIF、WebP 格式，最大 10MB
            </p>
            {errors.file && (
              <p className="mt-2 text-sm text-red-500 flex items-center justify-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.file}
              </p>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        ) : (
          <div className="relative">
            <div className="relative photo-frame rounded-vintage overflow-hidden">
              <img
                src={uploadState.preview}
                alt="预览"
                className="w-full h-64 object-contain bg-nostalgic-creamDark sepia-filter"
              />
            </div>
            <button
              type="button"
              onClick={clearFile}
              className="absolute top-2 right-2 p-2 bg-nostalgic-brown/80 rounded-full text-white hover:bg-nostalgic-brown transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            {uploadState.isCompressing && (
              <div className="absolute inset-0 bg-nostalgic-paper/80 flex flex-col items-center justify-center">
                <div className="w-48 h-2 bg-nostalgic-creamDark rounded-full overflow-hidden">
                  <div
                    className="h-full bg-nostalgic-orange transition-all duration-300"
                    style={{ width: `${uploadState.compressProgress}%` }}
                  />
                </div>
                <p className="mt-2 text-sm text-nostalgic-brown">正在压缩图片...</p>
              </div>
            )}
            {!uploadState.isCompressing && uploadState.compressedSize > 0 && (
              <div className="mt-3 flex items-center justify-between text-sm text-nostalgic-brownLight">
                <span>原始大小: {formatFileSize(uploadState.originalSize)}</span>
                <span className="flex items-center gap-1 text-green-600">
                  <Check className="w-4 h-4" />
                  压缩后: {formatFileSize(uploadState.compressedSize)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-vintage p-6 space-y-4">
          <h3 className="text-lg font-display font-semibold text-nostalgic-brown mb-4">
            基本信息
          </h3>

          <div>
            <label className="block text-sm font-medium text-nostalgic-brown mb-2">
              照片标题 *
            </label>
            <input
              type="text"
              value={uploadState.title}
              onChange={(e) => setUploadState(prev => ({ ...prev, title: e.target.value }))}
              placeholder="给这张照片起个名字"
              className={`input-vintage ${errors.title ? 'border-red-500' : ''}`}
            />
            {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-nostalgic-brown mb-2">
              拍摄年份 *
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1970"
                max="2025"
                value={uploadState.year}
                onChange={(e) => setUploadState(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                className="flex-1"
              />
              <span className="w-20 text-center font-mono text-lg text-nostalgic-brown font-bold">
                {uploadState.year}
              </span>
            </div>
            <div className="mt-2">
              <span className="tag-vintage" style={{ backgroundColor: 'var(--decade-color)' }}>
                {decade === '1970s' ? '70年代' : 
                 decade === '1980s' ? '80年代' :
                 decade === '1990s' ? '90年代' :
                 decade === '2000s' ? '00年代' :
                 decade === '2010s' ? '10年代' : '20年代'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-nostalgic-brown mb-2">
              拍摄位置 *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nostalgic-brownLight" />
              <input
                type="text"
                value={uploadState.location}
                onChange={(e) => setUploadState(prev => ({ ...prev, location: e.target.value }))}
                placeholder="在下方地图点击选择位置"
                className={`input-vintage pl-10 ${errors.location ? 'border-red-500' : ''}`}
                readOnly
              />
            </div>
            {errors.location && <p className="mt-1 text-sm text-red-500">{errors.location}</p>}
            {uploadState.lat && uploadState.lng && (
              <p className="mt-1 text-xs text-nostalgic-brownLight">
                坐标: {uploadState.lat.toFixed(4)}, {uploadState.lng.toFixed(4)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-nostalgic-brown mb-2">
              <User className="inline w-4 h-4 mr-1" />
              您的昵称（选填）
            </label>
            <input
              type="text"
              value={uploadState.author}
              onChange={(e) => setUploadState(prev => ({ ...prev, author: e.target.value }))}
              placeholder="留空则显示为匿名用户"
              className="input-vintage"
            />
          </div>
        </div>

        <div className="card-vintage p-6">
          <h3 className="text-lg font-display font-semibold text-nostalgic-brown mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            回忆故事 *
          </h3>
          <textarea
            value={uploadState.description}
            onChange={(e) => setUploadState(prev => ({ ...prev, description: e.target.value }))}
            placeholder="分享这张照片背后的故事...（这张照片是什么时候拍的？当时发生了什么？它为什么让你难忘？）"
            rows={8}
            className={`input-vintage resize-none ${errors.description ? 'border-red-500' : ''}`}
          />
          {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
          <p className="mt-2 text-xs text-nostalgic-brownLight">
            已输入 {uploadState.description.length} 个字符
          </p>
        </div>
      </div>

      <div className="card-vintage p-6">
        <h3 className="text-lg font-display font-semibold text-nostalgic-brown mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          在地图上标记拍摄位置 *
        </h3>
        <div className="h-64 rounded-vintage overflow-hidden border border-nostalgic-brownLighter/30">
          <MapComponent
            photos={[]}
            onMarkerClick={() => {}}
            interactive={true}
            zoom={4}
            onMapClick={(lat, lng) => {
              setUploadState(prev => ({
                ...prev,
                lat,
                lng,
                location: `坐标: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
              }));
            }}
          />
        </div>
        <p className="mt-2 text-sm text-nostalgic-brownLight">
          点击地图上的任意位置来标记照片拍摄地点
        </p>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => {}}
          className="btn-vintage-outline"
        >
          取消
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="btn-vintage disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '上传中...' : '发布记忆'}
        </button>
      </div>
    </form>
  );
};

export default PhotoUpload;
