import { useState } from 'react';
import { songs } from '../data/songs';
import { useAppStore } from '../store/useAppStore';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import SongCard from '../components/SongCard';

const LibraryPage = () => {
  const { playlists, createPlaylist, deletePlaylist, addSongToPlaylist, removeSongFromPlaylist } = useAppStore();
  const { playSong } = useAudioPlayer();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [showAddSongModal, setShowAddSongModal] = useState(false);

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      const cover = `https://picsum.photos/seed/${Date.now()}/300/300`;
      createPlaylist(newPlaylistName.trim(), cover);
      setNewPlaylistName('');
      setShowCreateModal(false);
    }
  };

  const handlePlayPlaylist = (playlistId: string) => {
    const playlist = playlists.find((p) => p.id === playlistId);
    if (playlist && playlist.songs.length > 0) {
      const playlistSongs = songs.filter((s) => playlist.songs.includes(s.id));
      if (playlistSongs.length > 0) {
        playSong(playlistSongs[0], playlistSongs);
      }
    }
  };

  const selectedPlaylistData = playlists.find((p) => p.id === selectedPlaylist);
  const playlistSongs = selectedPlaylistData
    ? songs.filter((s) => selectedPlaylistData.songs.includes(s.id))
    : [];

  const availableSongs = songs.filter(
    (s) => !selectedPlaylistData?.songs.includes(s.id)
  );

  return (
    <div className="min-h-screen pb-48">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            我的歌单
          </h1>
          <p className="text-gray-500">
            {playlists.length} 个歌单
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-purple-500 text-white rounded-full font-medium hover:bg-purple-600 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          创建歌单
        </button>
      </div>

      {selectedPlaylistData ? (
        <div>
          <button
            onClick={() => setSelectedPlaylist(null)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回歌单列表
          </button>

          <div className="flex items-center gap-6 mb-8">
            <img
              src={selectedPlaylistData.cover}
              alt={selectedPlaylistData.name}
              className="w-32 h-32 rounded-xl object-cover shadow-lg"
            />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {selectedPlaylistData.name}
              </h2>
              <p className="text-gray-500 mb-4">
                {playlistSongs.length} 首歌曲
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handlePlayPlaylist(selectedPlaylistData.id)}
                  className="px-6 py-2 bg-purple-500 text-white rounded-full font-medium hover:bg-purple-600 transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  播放全部
                </button>
                <button
                  onClick={() => setShowAddSongModal(true)}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-full font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  添加歌曲
                </button>
                <button
                  onClick={() => {
                    deletePlaylist(selectedPlaylistData.id);
                    setSelectedPlaylist(null);
                  }}
                  className="px-6 py-2 text-red-500 rounded-full font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  删除歌单
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {playlistSongs.map((song, index) => (
              <div key={song.id} className="flex items-center gap-4">
                <div className="flex-1">
                  <SongCard song={song} index={index + 1} showIndex />
                </div>
                <button
                  onClick={() => removeSongFromPlaylist(selectedPlaylistData.id, song.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {playlistSongs.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500">歌单还是空的，快去添加歌曲吧</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {playlists.map((playlist) => {
            const playlistSongCount = songs.filter((s) => playlist.songs.includes(s.id)).length;
            return (
              <div
                key={playlist.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedPlaylist(playlist.id)}
              >
                <img
                  src={playlist.cover}
                  alt={playlist.name}
                  className="w-full aspect-square rounded-lg object-cover mb-3"
                />
                <h3 className="font-medium text-gray-900 dark:text-white truncate">
                  {playlist.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {playlistSongCount} 首歌曲
                </p>
              </div>
            );
          })}

          {playlists.length === 0 && (
            <div className="col-span-full text-center py-16">
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
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                还没有创建歌单
              </h3>
              <p className="text-gray-500 mb-6">
                创建你的第一个歌单，收藏喜欢的音乐
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-2 bg-purple-500 text-white rounded-full font-medium hover:bg-purple-600 transition-colors"
              >
                创建歌单
              </button>
            </div>
          )}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              创建新歌单
            </h3>
            <input
              type="text"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="输入歌单名称"
              className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 outline-none mb-6"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-full font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCreatePlaylist}
                className="flex-1 px-4 py-2.5 bg-purple-500 text-white rounded-full font-medium hover:bg-purple-600 transition-colors"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddSongModal && selectedPlaylistData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              添加歌曲到 "{selectedPlaylistData.name}"
            </h3>
            <div className="flex-1 overflow-y-auto space-y-2">
              {availableSongs.map((song) => (
                <div
                  key={song.id}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => addSongToPlaylist(selectedPlaylistData.id, song.id)}
                >
                  <img
                    src={song.cover}
                    alt={song.title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                      {song.title}
                    </h4>
                    <p className="text-gray-500 text-xs truncate">{song.artist}</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              ))}
              {availableSongs.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  所有歌曲都已添加到歌单中
                </p>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowAddSongModal(false)}
                className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                完成
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryPage;
