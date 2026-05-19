import { useState } from 'react';
import { songs, moods } from '../data/songs';
import { useAppStore } from '../store/useAppStore';
import { useAudioPlayer } from '../hooks/useAudioPlayer';

const HomePage = () => {
  const { selectedMood, setSelectedMood } = useAppStore();
  const { playSong } = useAudioPlayer();

  const filteredSongs = selectedMood
    ? songs.filter((song) => song.mood.includes(selectedMood))
    : songs;

  const featuredSongs = songs.slice(0, 4);

  const handlePlayAll = () => {
    playSong(filteredSongs[0], filteredSongs);
  };

  return (
    <div className="homepage">
      <div className="hero">
        <div className="hero-content">
          <h1>欢迎来到情绪电台</h1>
          <p>根据你的心情选择音乐，让声音陪伴你的每一刻时光</p>
          <button onClick={handlePlayAll} className="hero-btn">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            播放全部
          </button>
        </div>
      </div>

      <div className="mood-filter-section">
        <h2>按心情筛选</h2>
        <div className="mood-filters">
          <button
            onClick={() => setSelectedMood(null)}
            className={`mood-btn ${!selectedMood ? 'active' : ''}`}
          >
            全部
          </button>
          {moods.map((mood) => (
            <button
              key={mood}
              onClick={() => setSelectedMood(mood)}
              className={`mood-btn ${selectedMood === mood ? 'active' : ''}`}
            >
              {mood}
            </button>
          ))}
        </div>
      </div>

      <div className="featured-section">
        <h2>热门推荐</h2>
        <div className="song-grid">
          {featuredSongs.map((song) => (
            <div
              key={song.id}
              className="song-card"
              onClick={() => playSong(song, songs)}
            >
              <img src={song.cover} alt={song.title} />
              <h3>{song.title}</h3>
              <p>{song.artist}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="all-songs-section">
        <h2>全部歌曲</h2>
        <div className="song-list">
          {filteredSongs.map((song, index) => (
            <div
              key={song.id}
              className="song-item"
              onClick={() => playSong(song, filteredSongs)}
            >
              <img src={song.cover} alt={song.title} />
              <div className="song-item-info">
                <h4>{song.title}</h4>
                <p>{song.artist}</p>
              </div>
              <div className="song-mood-tags">
                {song.mood.slice(0, 2).map((mood) => (
                  <span key={mood} className="song-mood-tag">{mood}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
