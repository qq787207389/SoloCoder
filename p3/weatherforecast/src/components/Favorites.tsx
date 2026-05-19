import { useState } from 'react';
import { useWeatherStore } from '../store/weatherStore';

export function Favorites() {
  const { favoriteCities, selectCity, removeFavorite, reorderFavorites } = useWeatherStore();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  if (favoriteCities.length === 0) return null;

  const sortedFavorites = [...favoriteCities].sort((a, b) => a.order - b.order);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    reorderFavorites(draggedIndex, index);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="bg-white/85 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-2xl">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        收藏城市
        <span className="text-sm font-normal text-gray-400">({sortedFavorites.length}/10)</span>
      </h2>

      <p className="text-sm text-gray-400 mb-4">拖拽调整顺序，点击切换城市</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {sortedFavorites.map((city, index) => (
          <div
            key={city.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`relative group p-4 rounded-2xl cursor-grab active:cursor-grabbing transition-all duration-200 ${
              draggedIndex === index
                ? 'bg-blue-100 scale-105 shadow-lg'
                : 'bg-gray-50 hover:bg-blue-50 hover:shadow-md'
            }`}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeFavorite(city.id);
              }}
              className="absolute top-2 right-2 p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-100 text-gray-400 hover:text-red-500 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div
              onClick={() => selectCity(city)}
              className="text-center"
            >
              <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center text-white text-sm font-bold">
                {city.name.charAt(0)}
              </div>
              <p className="font-medium text-gray-700 text-sm">{city.name}</p>
              <p className="text-xs text-gray-400">{city.country}</p>
            </div>

            <div className="absolute left-1 top-1/2 -translate-y-1/2 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-1 h-1 bg-gray-300 rounded-full" />
              <div className="w-1 h-1 bg-gray-300 rounded-full" />
              <div className="w-1 h-1 bg-gray-300 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
