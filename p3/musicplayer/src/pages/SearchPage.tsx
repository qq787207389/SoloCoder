import { useEffect } from 'react';
import { songs } from '../data/songs';
import { useAppStore } from '../store/useAppStore';
import SongCard from '../components/SongCard';

const SearchPage = () => {
  const { searchQuery, setSearchQuery } = useAppStore();

  useEffect(() => {
    return () => setSearchQuery('');
  }, [setSearchQuery]);

  const filteredSongs = songs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.album.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.mood.some((m) => m.includes(searchQuery))
  );

  return (
    <div className="min-h-screen pb-48">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          搜索
        </h1>
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索歌曲、艺术家、专辑或心情..."
            className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-gray-800 border-0 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {searchQuery ? (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            搜索结果 ({filteredSongs.length})
          </h2>
          {filteredSongs.length > 0 ? (
            <div className="space-y-2">
              {filteredSongs.map((song, index) => (
                <SongCard key={song.id} song={song} index={index + 1} showIndex />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-gray-500">没有找到相关歌曲</p>
            </div>
          )}
        </div>
      ) : (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            热门搜索
          </h2>
          <div className="flex flex-wrap gap-2">
            {['放松', '快乐', '专注', '能量', '浪漫', '宁静', '天籁之音', '活力乐队'].map(
              (tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchQuery(tag)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  {tag}
                </button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
