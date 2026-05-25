import React, { useState, useEffect, useRef } from 'react';
import { useConcertStore } from '../../store/useConcertStore';
import { audioEngine } from '../../audio/AudioEngine';

type ViewMode = 'front' | 'side' | 'top' | 'free';

export const ControlPanel: React.FC = () => {
  const {
    isPlaying,
    currentTime,
    duration,
    viewMode,
    isDanmakuEnabled,
    isAvatarEnabled,
    volume,
    setPlaying,
    setViewMode,
    toggleDanmaku,
    toggleAvatar,
    setVolume,
    reset,
  } = useConcertStore();

  const [isInitialized, setIsInitialized] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleMouseMove = () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      
      setShowControls(true);
      
      if (isPlaying) {
        hideTimeoutRef.current = setTimeout(() => {
          setShowControls(false);
        }, 8000);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        setShowControls((prev) => !prev);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('keydown', handleKeyDown);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [isPlaying]);

  const handlePlayPause = async () => {
    if (!isInitialized) {
      await audioEngine.init();
      setIsInitialized(true);
    }
    
    if (isPlaying) {
      audioEngine.pause();
    } else {
      audioEngine.play();
    }
  };

  const handleReset = () => {
    audioEngine.pause();
    audioEngine.seekTo(0);
    reset();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    audioEngine.seekTo(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    audioEngine.setVolume(vol);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const viewModes: { key: ViewMode; label: string; icon: string }[] = [
    { key: 'front', label: '正面', icon: '🎯' },
    { key: 'side', label: '侧面', icon: '👁️' },
    { key: 'top', label: '俯视', icon: '🔝' },
    { key: 'free', label: '自由', icon: '✨' },
  ];

  return (
    <>
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '100px',
          zIndex: 99,
        }}
        onMouseEnter={() => setShowControls(true)}
      />
      <div
        className="control-panel"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '20px',
          background: 'linear-gradient(transparent, rgba(0,0,0,0.9))',
          transition: 'opacity 0.3s, transform 0.3s',
          opacity: showControls ? 1 : 0,
          transform: showControls ? 'translateY(0)' : 'translateY(20px)',
          pointerEvents: showControls ? 'auto' : 'none',
          zIndex: 100,
        }}
      >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        marginBottom: '15px',
      }}>
        <button
          onClick={handlePlayPause}
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            border: 'none',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: 'white',
            fontSize: '20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
            transition: 'transform 0.2s',
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>

        <button
          onClick={handleReset}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.3)',
            background: 'rgba(255,255,255,0.1)',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          ↺
        </button>

        <span style={{ color: 'white', fontFamily: 'monospace', minWidth: '100px' }}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        <input
          type="range"
          min="0"
          max={duration}
          step="0.1"
          value={currentTime}
          onChange={handleSeek}
          style={{
            flex: 1,
            height: '6px',
            borderRadius: '3px',
            background: 'rgba(255,255,255,0.2)',
            appearance: 'none',
            cursor: 'pointer',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'white' }}>🔊</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            style={{
              width: '80px',
              height: '4px',
              borderRadius: '2px',
              background: 'rgba(255,255,255,0.2)',
              appearance: 'none',
              cursor: 'pointer',
            }}
          />
        </div>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          {viewModes.map((mode) => (
            <button
              key={mode.key}
              onClick={() => setViewMode(mode.key)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: viewMode === mode.key ? 'none' : '1px solid rgba(255,255,255,0.3)',
                background: viewMode === mode.key
                  ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                  : 'rgba(255,255,255,0.1)',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s',
              }}
            >
              {mode.icon} {mode.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={toggleDanmaku}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: isDanmakuEnabled ? 'none' : '1px solid rgba(255,255,255,0.3)',
              background: isDanmakuEnabled
                ? 'linear-gradient(135deg, #10b981, #059669)'
                : 'rgba(255,255,255,0.1)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            💬 弹幕 {isDanmakuEnabled ? '开' : '关'}
          </button>

          <button
            onClick={toggleAvatar}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: isAvatarEnabled ? 'none' : '1px solid rgba(255,255,255,0.3)',
              background: isAvatarEnabled
                ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                : 'rgba(255,255,255,0.1)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            👤 虚拟形象 {isAvatarEnabled ? '开' : '关'}
          </button>
        </div>
      </div>
    </div>
    </>
  );
};
