import { usePlayerStore } from '../store/usePlayerStore';
import { useAppStore } from '../store/useAppStore';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { formatTime } from '../utils/formatTime';

const PlayerBar = () => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    playMode,
    setIsPlaying,
    setVolume,
    setPlayMode,
    playNext,
    playPrev,
  } = usePlayerStore();
  const { seek } = useAudioPlayer();
  const { favorites, toggleFavorite } = useAppStore();

  if (!currentSong) {
    return (
      <div className="player-bar">
        <p style={{ color: '#6b7280', width: '100%', textAlign: 'center' }}>
          选择一首歌曲开始播放
        </p>
      </div>
    );
  }

  const isFavorite = favorites.includes(currentSong.id);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    seek(percent * duration);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  const getPlayModeLabel = () => {
    switch (playMode) {
      case 'sequence': return '顺序播放';
      case 'loop': return '单曲循环';
      case 'shuffle': return '随机播放';
      default: return '顺序播放';
    }
  };

  const cyclePlayMode = () => {
    const modes: ('sequence' | 'loop' | 'shuffle')[] = ['sequence', 'loop', 'shuffle'];
    const currentIndex = modes.indexOf(playMode);
    setPlayMode(modes[(currentIndex + 1) % modes.length]);
  };

  return (
    <div className="player-bar">
      <div className="player-song-info">
        <img
          src={currentSong.cover}
          alt={currentSong.title}
          className={isPlaying ? 'animate-spin-slow' : ''}
        />
        <div>
          <h4>{currentSong.title}</h4>
          <p>{currentSong.artist}</p>
        </div>
        <button
          onClick={() => toggleFavorite(currentSong.id)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
        >
          <svg
            width="20"
            height="20"
            fill={isFavorite ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ color: isFavorite ? '#ef4444' : '#9ca3af' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      <div className="player-controls">
        <div className="player-buttons">
          <button onClick={cyclePlayMode} title={getPlayModeLabel()}>
            {playMode === 'shuffle' ? (
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            ) : (
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
          </button>
          <button onClick={playPrev}>
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="play-btn"
          >
            {isPlaying ? (
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          <button onClick={playNext}>
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </button>
        </div>

        <div className="progress-container">
          <span className="progress-time">{formatTime(currentTime)}</span>
          <div
            className="progress-bar"
            onClick={handleProgressClick}
          >
            <div
              className="progress-fill"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            >
              <div className="progress-thumb" />
            </div>
          </div>
          <span className="progress-time">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="player-volume">
        <button>
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          className="volume-slider"
        />
      </div>
    </div>
  );
};

export default PlayerBar;
