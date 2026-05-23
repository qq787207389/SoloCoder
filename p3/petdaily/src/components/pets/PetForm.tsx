import React, { useState } from 'react';
import type { Pet } from '../../types.ts';
import ImageUploader from '../common/ImageUploader';
import Button from '../common/Button';

interface PetFormProps {
  pet?: Pet;
  userId: string;
  onSubmit: (pet: Omit<Pet, 'id'> | Partial<Pet>) => void;
  onCancel: () => void;
}

const PetForm: React.FC<PetFormProps> = ({ pet, userId, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: pet?.name || '',
    breed: pet?.breed || '',
    birthday: pet?.birthday || '',
    gender: pet?.gender || 'male',
    avatar: pet?.avatar || '',
    tags: pet?.tags || [],
  });
  const [tagInput, setTagInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pet) {
      onSubmit({ ...formData });
    } else {
      onSubmit({ ...formData, userId, tags: formData.tags });
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex justify-center">
        <ImageUploader
          value={formData.avatar}
          onChange={(url) => setFormData({ ...formData, avatar: url })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">名字</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all"
          placeholder="给毛孩子起个名字"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">品种</label>
        <input
          type="text"
          value={formData.breed}
          onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all"
          placeholder="比如：柯基、英短"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">生日</label>
        <input
          type="date"
          value={formData.birthday}
          onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">性别</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="gender"
              value="male"
              checked={formData.gender === 'male'}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' })}
              className="accent-pink-500"
            />
            <span>男孩子 ♂</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="gender"
              value="female"
              checked={formData.gender === 'female'}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' })}
              className="accent-pink-500"
            />
            <span>女孩子 ♀</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">标签</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all text-sm"
            placeholder="输入标签，回车添加"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="px-3 py-2 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 transition-colors"
          >
            添加
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1 bg-pink-50 text-pink-600 rounded-full text-sm"
            >
              #{tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="w-4 h-4 flex items-center justify-center hover:bg-pink-200 rounded-full"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} fullWidth>
          取消
        </Button>
        <Button type="submit" fullWidth>
          {pet ? '保存修改' : '添加宠物'}
        </Button>
      </div>
    </form>
  );
};

export default PetForm;
