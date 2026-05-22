import { MapPin, Star, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Item, User as UserType } from '../types';
import { CATEGORY_LABELS } from '../types';
import { cn } from '../utils';
import { useEffect, useState } from 'react';

interface ItemCardProps {
  item: Item;
  user?: UserType;
}

export default function ItemCard({ item, user }: ItemCardProps) {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div
      onClick={() => navigate(`/item/${item.id}`)}
      className="bg-white rounded-2xl overflow-hidden shadow-sm card-hover animate-fade-in"
    >
      <div className="relative aspect-square bg-gray-100">
        {item.images[0] && (
          <img
            src={item.images[0]}
            alt={item.title}
            className={cn(
              'w-full h-full object-cover transition-opacity duration-300',
              imageLoaded ? 'opacity-100' : 'opacity-0'
            )}
            onLoad={() => setImageLoaded(true)}
          />
        )}
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <div className="absolute top-2 left-2">
          <span className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700">
            {CATEGORY_LABELS[item.category]}
          </span>
        </div>
      </div>

      <div className="p-3">
        <h3 className="font-medium text-gray-900 line-clamp-1 mb-1">
          {item.title}
        </h3>
        <p className="text-xs text-gray-500 line-clamp-2 mb-2 h-8">
          {item.description}
        </p>

        <div className="flex items-center justify-between">
          {user ? (
            <div className="flex items-center gap-1">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-5 h-5 rounded-full"
              />
              <span className="text-xs text-gray-600 line-clamp-1 max-w-[80px]">
                {user.name}
              </span>
              <div className="flex items-center gap-0.5">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <span className="text-xs text-gray-500">{user.rating}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <User className="w-5 h-5 text-gray-400" />
              <span className="text-xs text-gray-400">加载中...</span>
            </div>
          )}

          {item.distance && (
            <div className="flex items-center gap-0.5 text-xs text-gray-400">
              <MapPin className="w-3 h-3" />
              {item.distance}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
