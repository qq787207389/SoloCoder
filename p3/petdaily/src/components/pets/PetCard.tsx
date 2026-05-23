import React from 'react';
import { Link } from 'react-router-dom';
import type { Pet } from '../../types.ts';

interface PetCardProps {
  pet: Pet;
  showEdit?: boolean;
  onEdit?: () => void;
}

const PetCard: React.FC<PetCardProps> = ({ pet, showEdit = false, onEdit }) => {
  const getAge = (birthday: string) => {
    const birth = new Date(birthday);
    const now = new Date();
    const diffMonth = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    if (diffMonth < 12) {
      return `${diffMonth}个月`;
    }
    const years = Math.floor(diffMonth / 12);
    const months = diffMonth % 12;
    return months > 0 ? `${years}岁${months}个月` : `${years}岁`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-soft overflow-hidden transition-all hover:shadow-soft-hover hover:-translate-y-1">
      <Link to={`/pet/${pet.id}`}>
        <div className="relative">
          <img
            src={pet.avatar}
            alt={pet.name}
            className="w-full h-40 object-cover"
          />
          <div className="absolute top-3 right-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              pet.gender === 'male' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'
            }`}>
              {pet.gender === 'male' ? '♂ 男孩' : '♀ 女孩'}
            </span>
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-gray-800">{pet.name}</h3>
            <span className="text-sm text-gray-500">{getAge(pet.birthday)}</span>
          </div>
          <p className="text-sm text-gray-500 mb-3">{pet.breed}</p>
          <div className="flex flex-wrap gap-1">
            {(pet.tags || []).slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-pink-50 text-pink-500 rounded-full text-xs"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </Link>
      {showEdit && (
        <div className="px-4 pb-4">
          <button
            onClick={onEdit}
            className="w-full py-2 text-sm text-gray-500 hover:text-pink-500 transition-colors"
          >
            编辑信息
          </button>
        </div>
      )}
    </div>
  );
};

export default PetCard;
