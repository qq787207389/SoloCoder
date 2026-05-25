import React from 'react';
import { useConcertStore } from '../../store/useConcertStore';

export const HUD: React.FC = () => {
  const { beat, isPlaying, currentTime } = useConcertStore();
  const beatIntensity = Math.sin(beat * Math.PI * 2) * 0.5 + 0.5;

  return (
    <div
      style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        zIndex: 100,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          padding: '16px 20px',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <div style={{ color: 'white', fontSize: '14px', marginBottom: '8px', opacity: 0.7 }}>
          🎵 VR Singer 2024 演唱会
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: isPlaying ? '#10b981' : '#6b7280',
              boxShadow: isPlaying ? `0 0 ${10 + beatIntensity * 10}px #10b981` : 'none',
              transition: 'all 0.1s',
            }}
          />
          <span style={{ color: 'white', fontSize: '12px' }}>
            {isPlaying ? 'LIVE' : 'PAUSED'}
          </span>
        </div>

        {isPlaying && (
          <div style={{ marginTop: '12px' }}>
            <div style={{ color: 'white', fontSize: '11px', opacity: 0.6, marginBottom: '4px' }}>
              节拍
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    width: '8px',
                    height: `${12 + beatIntensity * 16}px`,
                    borderRadius: '4px',
                    background: beat % 4 === i
                      ? `rgba(99, 102, 241, ${0.5 + beatIntensity * 0.5})`
                      : 'rgba(255,255,255,0.2)',
                    transition: 'all 0.1s',
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          position: 'absolute',
          top: '0',
          right: '-100px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          border: `2px solid rgba(99, 102, 241, ${0.3 + beatIntensity * 0.5})`,
          boxShadow: `0 0 ${20 + beatIntensity * 30}px rgba(99, 102, 241, ${beatIntensity * 0.5})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
        }}
      >
        🎤
      </div>
    </div>
  );
};
