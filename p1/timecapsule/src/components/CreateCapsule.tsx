import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import {
  Clock,
  Lock,
  Unlock,
  Image,
  Mic,
  MicOff,
  Play,
  Pause,
  Trash2,
  Send,
  Eye,
  EyeOff,
  X,
  Upload,
} from 'lucide-react';
import { useCapsuleStore } from '../store/useCapsuleStore';
import { useAudioRecorder } from '../hooks/useAudioRecorder';

export const CreateCapsule: React.FC = () => {
  const { addCapsule, setCurrentView, currentUser } = useCapsuleStore();
  const { isRecording, audioUrl, audioDuration, startRecording, stopRecording, clearRecording } = useAudioRecorder();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [unlockDate, setUnlockDate] = useState('');
  const [unlockTime, setUnlockTime] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith('image/')
    );

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImages((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter((file) =>
      file.type.startsWith('image/')
    );

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImages((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('请输入胶囊标题');
      return;
    }

    if (!unlockDate || !unlockTime) {
      alert('请设置解锁时间');
      return;
    }

    const unlockDateTime = new Date(`${unlockDate}T${unlockTime}`).getTime();

    if (unlockDateTime <= Date.now()) {
      alert('解锁时间必须在未来');
      return;
    }

    if (!isPublic && !password.trim()) {
      alert('私密胶囊需要设置密码');
      return;
    }

    addCapsule({
      title: title.trim(),
      content: content.trim(),
      images,
      audio: audioUrl,
      audioDuration,
      unlockTime: unlockDateTime,
      isPublic,
      password: isPublic ? undefined : password,
      authorName: currentUser || '匿名用户',
    });

    alert('胶囊创建成功！');
    setCurrentView('plaza');
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto p-4 pb-24"
    >
      <div className="glass rounded-2xl p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-warm-800 mb-6 flex items-center gap-2">
          <Clock className="w-6 h-6" />
          埋下时间胶囊
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-warm-700 font-medium mb-2">
              胶囊标题 *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="给你的胶囊起个名字..."
              className="w-full px-4 py-3 rounded-xl border-2 border-warm-200 bg-white/50 focus:border-warm-400 focus:outline-none transition-colors text-warm-800 placeholder-warm-400"
              maxLength={50}
            />
          </div>

          <div>
            <label className="block text-warm-700 font-medium mb-2">
              内容 (支持 Markdown)
            </label>
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="# 在这里写下你想说的话...

**粗体文字**
*斜体文字*
> 引用文字

- 列表项1
- 列表项2"
                rows={8}
                className="w-full px-4 py-3 rounded-xl border-2 border-warm-200 bg-white/50 focus:border-warm-400 focus:outline-none transition-colors text-warm-800 placeholder-warm-400 resize-none"
              />
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="absolute top-3 right-3 p-2 rounded-lg bg-warm-100 text-warm-600 hover:bg-warm-200 transition-colors"
              >
                {showPreview ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <AnimatePresence>
              {showPreview && content && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 p-4 rounded-xl bg-warm-50 border border-warm-200 overflow-hidden"
                >
                  <div className="text-sm text-warm-500 mb-2">预览</div>
                  <div className="markdown-content text-warm-700">
                    <ReactMarkdown>{content}</ReactMarkdown>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div>
            <label className="block text-warm-700 font-medium mb-2">
              <Image className="w-5 h-5 inline mr-1" />
              添加图片
            </label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative p-8 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
                isDragging
                  ? 'border-warm-500 bg-warm-100'
                  : 'border-warm-300 bg-white/30 hover:border-warm-400'
              }`}
            >
              <div className="text-center">
                <Upload className="w-8 h-8 mx-auto text-warm-400 mb-2" />
                <p className="text-warm-500">拖拽图片到这里，或点击选择</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                {images.map((img, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative group"
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-warm-700 font-medium mb-2">
              <Mic className="w-5 h-5 inline mr-1" />
              语音留言
            </label>
            <div className="p-4 rounded-xl border-2 border-warm-200 bg-white/30">
              {!audioUrl ? (
                <div className="flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`p-4 rounded-full transition-all ${
                      isRecording
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'bg-warm-500 text-white hover:bg-warm-600'
                    }`}
                  >
                    {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                  </button>
                  <span className="text-warm-600">
                    {isRecording ? '正在录音...点击停止' : '点击开始录音'}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="p-3 rounded-full bg-warm-500 text-white hover:bg-warm-600"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>
                  <audio
                    ref={audioRef}
                    src={audioUrl}
                    onEnded={() => setIsPlaying(false)}
                    className="hidden"
                  />
                  <span className="text-warm-600">
                    录音时长: {audioDuration}秒
                  </span>
                  <button
                    type="button"
                    onClick={clearRecording}
                    className="ml-auto p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-warm-700 font-medium mb-2">
                解锁日期 *
              </label>
              <input
                type="date"
                value={unlockDate}
                onChange={(e) => setUnlockDate(e.target.value)}
                min={minDate}
                className="w-full px-4 py-3 rounded-xl border-2 border-warm-200 bg-white/50 focus:border-warm-400 focus:outline-none transition-colors text-warm-800"
              />
            </div>
            <div>
              <label className="block text-warm-700 font-medium mb-2">
                解锁时间 *
              </label>
              <input
                type="time"
                value={unlockTime}
                onChange={(e) => setUnlockTime(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-warm-200 bg-white/50 focus:border-warm-400 focus:outline-none transition-colors text-warm-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-warm-700 font-medium mb-2">
              可见性
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setIsPublic(true)}
                className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                  isPublic
                    ? 'border-warm-500 bg-warm-500 text-white'
                    : 'border-warm-200 bg-white/50 text-warm-600 hover:border-warm-300'
                }`}
              >
                <Unlock className="w-5 h-5 mx-auto mb-1" />
                <span className="text-sm">公开</span>
              </button>
              <button
                type="button"
                onClick={() => setIsPublic(false)}
                className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                  !isPublic
                    ? 'border-warm-500 bg-warm-500 text-white'
                    : 'border-warm-200 bg-white/50 text-warm-600 hover:border-warm-300'
                }`}
              >
                <Lock className="w-5 h-5 mx-auto mb-1" />
                <span className="text-sm">私密</span>
              </button>
            </div>
          </div>

          {!isPublic && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <label className="block text-warm-700 font-medium mb-2">
                提取密码 *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="设置提取密码"
                  className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-warm-200 bg-white/50 focus:border-warm-400 focus:outline-none transition-colors text-warm-800 placeholder-warm-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-400 hover:text-warm-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </motion.div>
          )}

          <button
            type="submit"
            className="w-full py-4 rounded-xl bg-gradient-to-r from-warm-500 to-warm-600 text-white font-bold text-lg shadow-lg hover:shadow-xl hover:from-warm-600 hover:to-warm-700 transition-all flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
            埋下胶囊
          </button>
        </form>
      </div>
    </motion.div>
  );
};
