import { songs } from '../data/songs';
import { useAppStore } from '../store/useAppStore';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import SongCard from '../components/SongCard';

const FavoritesPage = () => {
  const { favorites } = useAppStore();
  const { playSong } = useAudioPlayer();

  const favoriteSongs = songs.filter((song) => favorites.includes(song.id));

  const handlePlayAll = () => {
    if (favoriteSongs.length > 0) {
      playSong(favoriteSongs[0], favoriteSongs);
    }
  };

  return (
    <div className="min-h-screen pb-48">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          我喜欢的音乐
        </h1>
        <p className="text-gray-500">
          {favoriteSongs.length} 首歌曲
        </p>
      </div>

      {favoriteSongs.length > 0 ? (
        <>
          <div className="mb-6">
            <button
              onClick={handlePlayAll}
              className="px-6 py-2.5 bg-purple-500 text-white rounded-full font-medium hover:bg-purple-600 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              播放全部
            </button>
          </div>
          <div className="space-y-2">
            {favoriteSongs.map((song, index) => (
              <SongCard key={song.id} song={song} index={index + 1} showIndex />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            还没有喜欢的歌曲
          </h3>
          <p className="text-gray-500 mb-6">
            点击歌曲旁的爱心按钮，添加你喜欢的音乐
          </p>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
