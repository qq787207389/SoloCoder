import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, Image, FolderOpen, Sparkles, Palette, Layers, Wand2 } from 'lucide-react';
import { useEditorStore } from '@/store/useEditorStore';

const sampleImages = [
  {
    id: 1,
    name: '风景照片',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
  },
  {
    id: 2,
    name: '城市夜景',
    url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&h=600&fit=crop',
  },
  {
    id: 3,
    name: '人像摄影',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=600&fit=crop',
  },
  {
    id: 4,
    name: '自然风景',
    url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=600&fit=crop',
  },
];

const features = [
  { icon: Layers, title: '图层系统', desc: '多图层编辑，支持混合模式' },
  { icon: Palette, title: '丰富滤镜', desc: '10+ 专业滤镜，实时预览' },
  { icon: Wand2, title: '智能选区', desc: '魔法棒、套索等多种工具' },
];

export default function Home() {
  const navigate = useNavigate();
  const { createProject, addLayer } = useEditorStore();
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          createProject(img.width, img.height, file.name.replace(/\.[^/.]+$/, ''));
          
          addLayer({
            name: file.name,
            type: 'image',
            x: 0,
            y: 0,
            width: img.width,
            height: img.height,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            opacity: 1,
            blendMode: 'normal',
            visible: true,
            locked: false,
            imageSource: e.target?.result as string,
            filters: [],
          });
          
          navigate('/editor');
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    },
    [createProject, addLayer, navigate]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      
      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileUpload(file);
      }
    },
    [handleFileUpload]
  );

  const handleSampleClick = useCallback(
    (sample: typeof sampleImages[0]) => {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        createProject(img.width, img.height, sample.name);
        
        addLayer({
          name: sample.name,
          type: 'image',
          x: 0,
          y: 0,
          width: img.width,
          height: img.height,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          opacity: 1,
          blendMode: 'normal',
          visible: true,
          locked: false,
          imageSource: sample.url,
          filters: [],
        });
        
        navigate('/editor');
      };
      img.src = sample.url;
    },
    [createProject, addLayer, navigate]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileUpload(file);
      }
    },
    [handleFileUpload]
  );

  const handleNewProject = useCallback(() => {
    createProject(1920, 1080, '新画布');
    navigate('/editor');
  }, [createProject, navigate]);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col">
      <header className="p-6 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center">
            <Image className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold font-poppins">
            Pixel<span className="text-accent-primary">Cake</span>
          </span>
        </motion.div>
        
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={handleNewProject}
          className="px-5 py-2.5 bg-bg-secondary hover:bg-bg-tertiary rounded-lg transition-colors flex items-center gap-2 border border-border-default"
        >
          <FolderOpen className="w-4 h-4" />
          <span>新建画布</span>
        </motion.button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold font-poppins mb-4">
            在线图像编辑器
            <span className="inline-flex items-center ml-3">
              <Sparkles className="w-10 h-10 text-accent-primary" />
            </span>
          </h1>
          <p className="text-text-secondary text-xl max-w-2xl mx-auto">
            轻量但功能扎实的修图工具，所有处理在浏览器端完成，无需安装，即刻开始创作
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-3xl mb-12"
        >
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`relative rounded-2xl border-2 border-dashed p-16 text-center transition-all duration-300 ${
              isDragging
                ? 'border-accent-primary bg-accent-primary/10 scale-105'
                : 'border-border-default bg-bg-secondary/50 hover:border-border-hover'
            }`}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center gap-4 pointer-events-none">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                isDragging ? 'bg-accent-primary' : 'bg-bg-tertiary'
              }`}>
                <Upload className={`w-10 h-10 transition-colors duration-300 ${
                  isDragging ? 'text-white' : 'text-accent-primary'
                }`} />
              </div>
              <div>
                <p className="text-xl font-semibold mb-1">
                  {isDragging ? '释放以上传图片' : '拖拽图片到此处'}
                </p>
                <p className="text-text-secondary">或点击选择文件</p>
              </div>
              <p className="text-sm text-text-muted">
                支持 JPG, PNG, WebP 等格式
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-5xl"
        >
          <h2 className="text-lg font-semibold mb-4 text-text-secondary">快速体验</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {sampleImages.map((sample, index) => (
              <motion.div
                key={sample.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                onClick={() => handleSampleClick(sample)}
                className="group relative aspect-4/3 rounded-xl overflow-hidden cursor-pointer"
              >
                <img
                  src={sample.url}
                  alt={sample.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white font-medium text-sm">{sample.name}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-20 grid grid-cols-3 gap-8 max-w-4xl"
        >
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-bg-secondary flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-7 h-7 text-accent-primary" />
              </div>
              <h3 className="font-semibold mb-1">{feature.title}</h3>
              <p className="text-text-secondary text-sm">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </main>

      <footer className="p-6 text-center text-text-muted text-sm">
        <p>PixelCake · 所有图像处理在浏览器本地完成</p>
      </footer>
    </div>
  );
}