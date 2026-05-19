import type { Song } from '../types';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { usePlayerStore } from '../store/usePlayerStore';
import { useAppStore } from '../store/useAppStore';
import { formatTime } from '../utils/formatTime';

interface SongCardProps {
  song: Song;
  index?: number;
  showIndex?: boolean;
}

const SongCard = ({ song, index, showIndex = false }: SongCardProps) => {
  const { playSong } = useAudioPlayer();
  const { currentSong, isPlaying, playlist } = usePlayerStore();
  const { favorites, toggleFavorite } = useAppStore();

  const isCurrentSong = currentSong?.id === song.id;
  const isFavorite = favorites.includes(song.id);

  const handlePlay = () => {
    playSong(song, playlist.length > 0 ? playlist : undefined);
  };

  return (
    <div
      className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors ${
        isCurrentSong
          ? 'bg-purple-50 dark:bg-purple-900/20'
          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
      }`}
    >
      {showIndex && (
        <span className="w-6 text-center text-gray-500 text-sm">
          {index}
        </span>
      )}
      <div className="relative group">
        <img
          src={song.cover}
          alt={song.title}
          className="w-12 h-12 rounded-lg object-cover"
        />
        <button
          onClick={handlePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {isCurrentSong && isPlaying ? (
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className={`font-medium text-sm truncate ${
          isCurrentSong ? 'text-purple-500' : 'text-gray-900 dark:text-white'
        }`}>
          {song.title}
        </h4>
        <p className="text-gray-500 text-xs truncate">{song.artist}</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {song.mood.slice(0, 2).map((mood) => (
            <span
              key={mood}
              className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full"
            >
              {mood}
            </span>
          ))}
        </div>
        <span className="text-gray-500 text-xs w-10 text-right">
          {formatTime(song.duration)}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(song.id);
          }}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
        >
          <svg
            className={`w-4 h-4 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'}`}
            fill={isFavorite ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SongCard;
