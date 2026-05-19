import { useAppStore } from '../store/useAppStore';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import SongCard from '../components/SongCard';

const RecentPage = () => {
  const { recentPlays, clearRecentPlays } = useAppStore();
  const { playSong } = useAudioPlayer();

  const handlePlayAll = () => {
    if (recentPlays.length > 0) {
      playSong(recentPlays[0], recentPlays);
    }
  };

  return (
    <div className="min-h-screen pb-48">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            最近播放
          </h1>
          <p className="text-gray-500">
            {recentPlays.length} 首歌曲
          </p>
        </div>
        {recentPlays.length > 0 && (
          <button
            onClick={clearRecentPlays}
            className="text-sm text-gray-500 hover:text-red-500 transition-colors"
          >
            清空历史
          </button>
        )}
      </div>

      {recentPlays.length > 0 ? (
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
            {recentPlays.map((song, index) => (
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            还没有播放记录
          </h3>
          <p className="text-gray-500">
            开始播放音乐，这里会记录你的播放历史
          </p>
        </div>
      )}
    </div>
  );
};

export default RecentPage;
