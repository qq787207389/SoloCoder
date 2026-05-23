import React, { useState, useRef } from 'react';
import type { Post, Pet } from '../../types.ts';
import { compressImage } from '../../utils/image';
import Button from '../common/Button';
import Avatar from '../common/Avatar';

interface PostFormProps {
  pet: Pet;
  onSubmit: (post: Omit<Post, 'id' | 'likes' | 'comments' | 'createdAt'>) => void;
  onCancel: () => void;
}

const PostForm: React.FC<PostFormProps> = ({ pet, onSubmit, onCancel }) => {
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [weight, setWeight] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [showBubble, setShowBubble] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];
    for (let i = 0; i < Math.min(files.length, 5 - images.length); i++) {
      const compressed = await compressImage(files[i]);
      newImages.push(compressed);
    }
    setImages([...images, ...newImages]);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowBubble(true);
    setTimeout(() => {
      onSubmit({
        petId: pet.id,
        userId: pet.userId,
        content,
        images,
        weight: weight ? parseFloat(weight) : undefined,
        tags,
      });
    }, 500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="relative">
          <Avatar src={pet.avatar} alt={pet.name} size="md" />
          {showBubble && (
            <div className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs px-2 py-1 rounded-full bubble">
              喵~
            </div>
          )}
        </div>
        <div className="flex-1">
          <p className="font-medium text-gray-800">{pet.name}</p>
          <p className="text-sm text-gray-500">记录今天的小美好~</p>
        </div>
      </div>

      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="今天发生了什么有趣的事？"
          className="w-full h-32 px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 resize-none transition-all"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          📸 上传照片
        </label>
        <div className="flex flex-wrap gap-2">
          {images.map((img, index) => (
            <div key={index} className="relative">
              <img
                src={img}
                alt={`upload-${index}`}
                className="w-20 h-20 object-cover rounded-xl"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ))}
          {images.length < 5 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-20 h-20 border-2 border-dashed border-pink-300 rounded-xl flex flex-col items-center justify-center text-pink-400 hover:border-pink-400 hover:bg-pink-50 transition-colors"
            >
              <span className="text-xl">+</span>
              <span className="text-xs">添加</span>
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ⚖️ 今日体重 (kg)
        </label>
        <input
          type="number"
          step="0.1"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="可选，记录体重变化"
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          🏷️ 标签
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 text-sm transition-all"
            placeholder="输入标签，回车添加"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="px-3 py-2 bg-pink-100 text-pink-600 rounded-lg text-sm hover:bg-pink-200 transition-colors"
          >
            添加
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1 bg-pink-50 text-pink-600 rounded-full text-sm"
            >
              #{tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="w-4 h-4 flex items-center justify-center hover:bg-pink-200 rounded-full"
              >
                ×
              </button>
            </span>
          ))}
          {pet.tags.slice(0, 3).map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => !tags.includes(tag) && setTags([...tags, tag])}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                tags.includes(tag)
                  ? 'bg-pink-100 text-pink-600'
                  : 'bg-gray-100 text-gray-500 hover:bg-pink-50'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} fullWidth>
          取消
        </Button>
        <Button type="submit" fullWidth>
          发布动态
        </Button>
      </div>
    </form>
  );
};

export default PostForm;
