import { Calendar, MapPin, User, MessageCircle } from 'lucide-react';
import { Photo } from '../../types';
import { getRelativeTime } from '../../utils/dateFormat';

interface PhotoCardProps {
  photo: Photo;
  onClick: (photo: Photo) => void;
  variant?: 'default' | 'timeline' | 'compact';
}

const PhotoCard = ({ photo, onClick, variant = 'default' }: PhotoCardProps) => {
  const isTimeline = variant === 'timeline';
  const isCompact = variant === 'compact';

  if (isCompact) {
    return (
      <div
        onClick={() => onClick(photo)}
        className="cursor-pointer photo-frame rounded-vintage overflow-hidden hover:scale-105 transition-all duration-300 group"
      >
        <div className="relative">
          <img
            src={photo.imageUrl}
            alt={photo.title}
            className="w-full h-32 object-cover sepia-filter group-hover:sepia-0 transition-all duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-nostalgic-brown/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onClick(photo)}
      className={`cursor-pointer card-vintage overflow-hidden group ${
        isTimeline ? 'animate-fade-in' : ''
      }`}
    >
      <div className="relative overflow-hidden">
        <img
          src={photo.imageUrl}
          alt={photo.title}
          className="w-full h-48 object-cover sepia-filter group-hover:scale-105 group-hover:sepia-0 transition-all duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-nostalgic-brown/70 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex items-center justify-between">
            <span className="tag-vintage bg-nostalgic-orange text-white">
              {photo.year}年
            </span>
            <span className="text-white/90 text-sm flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {photo.location.split('市')[0]}市
            </span>
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-display font-semibold text-lg text-nostalgic-brown mb-2 line-clamp-1">
          {photo.title}
        </h3>
        <p className="text-nostalgic-brownLight text-sm line-clamp-2 mb-3">
          {photo.description}
        </p>
        <div className="flex items-center justify-between text-xs text-nostalgic-brownLight">
          <span className="flex items-center gap-1">
          <User className="w-3 h-3" />
          {photo.author}
        </span>
          <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {getRelativeTime(photo.createdAt)}
        </span>
        </div>
      </div>
    </div>
  );
};

export default PhotoCard;
