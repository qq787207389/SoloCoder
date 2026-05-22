import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, X, ChevronDown } from 'lucide-react';
import { api } from '../services/api';
import { useAppStore } from '../store';
import type { Category } from '../types';
import { CATEGORY_LABELS } from '../types';
import { compressImage } from '../utils';
import Header from '../components/Header';

const categories: Category[] = ['books', 'home', 'digital', 'clothing', 'toys', 'sports', 'other'];

export default function Publish() {
  const navigate = useNavigate();
  const addItem = useAppStore((state) => state.addItem);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category | ''>('');
  const [desiredCategory, setDesiredCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      if (images.length >= 6) break;
      try {
        const compressed = await compressImage(file);
        setImages((prev) => [...prev, compressed]);
      } catch (error) {
        console.error('Failed to compress image:', error);
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !category || images.length === 0) {
      alert('请填写完整信息并上传至少一张图片');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.createItem({
        title: title.trim(),
        description: description.trim(),
        category: category,
        images: images,
        desiredCategory: desiredCategory.trim(),
      });

      if (response.success) {
        addItem(response.data);
        alert('发布成功！');
        navigate('/');
      }
    } catch (error) {
      console.error('Failed to publish item:', error);
      alert('发布失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-28">
      <Header title="发布物品" showBack />

      <div className="max-w-md mx-auto px-4 py-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            物品图片 <span className="text-red-500">*</span>
            <span className="text-gray-400 font-normal ml-2">（最多6张）</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {images.map((img, index) => (
              <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                <img src={img} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ))}
            {images.length < 6 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-primary-500 hover:text-primary-500 transition-colors"
              >
                <Camera className="w-6 h-6" />
                <span className="text-xs">添加图片</span>
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageSelect}
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            物品名称 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例如：Kindle Paperwhite"
            maxLength={30}
            className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            物品分类 <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <button
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 flex items-center justify-between focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
            >
              <span className={category ? 'text-gray-800' : 'text-gray-400'}>
                {category ? CATEGORY_LABELS[category] : '请选择分类'}
              </span>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showCategoryDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-lg z-10 overflow-hidden">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setCategory(cat);
                      setShowCategoryDropdown(false);
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between ${
                      category === cat ? 'text-primary-500' : 'text-gray-800'
                    }`}
                  >
                    {CATEGORY_LABELS[cat]}
                    {category === cat && <span className="text-primary-500">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            物品描述
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="描述一下物品的成色、使用情况等..."
            rows={4}
            maxLength={200}
            className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all resize-none"
          />
          <div className="text-right text-xs text-gray-400 mt-1">
            {description.length}/200
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            想换什么？
          </label>
          <input
            type="text"
            value={desiredCategory}
            onChange={(e) => setDesiredCategory(e.target.value)}
            placeholder="例如：书籍、数码产品等"
            maxLength={50}
            className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-4 bg-primary-500 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/30 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed btn-press transition-all"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              发布中...
            </span>
          ) : (
            '发布物品'
          )}
        </button>
      </div>
    </div>
  );
}
