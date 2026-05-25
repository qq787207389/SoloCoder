import React, { useState, useEffect, useRef } from 'react';

export const PerformanceMonitor: React.FC = () => {
  const [fps, setFps] = useState(60);
  const [show, setShow] = useState(false);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  useEffect(() => {
    let animationId: number;

    const measure = () => {
      frameCount.current++;
      const now = performance.now();
      
      if (now - lastTime.current >= 1000) {
        setFps(frameCount.current);
        frameCount.current = 0;
        lastTime.current = now;
      }
      
      animationId = requestAnimationFrame(measure);
    };

    animationId = requestAnimationFrame(measure);

    return () => cancelAnimationFrame(animationId);
  }, []);

  if (!show) {
    return (
      <button
        onClick={() => setShow(true)}
        style={{
          position: 'absolute',
          bottom: '130px',
          right: '20px',
          padding: '6px 12px',
          fontSize: '11px',
          background: 'rgba(0,0,0,0.5)',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          zIndex: 200,
        }}
      >
        ⚡ 性能
      </button>
    );
  }

  const getFpsColor = () => {
    if (fps >= 50) return '#10b981';
    if (fps >= 30) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '130px',
        right: '20px',
        padding: '12px 16px',
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(10px)',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.1)',
        color: 'white',
        fontSize: '12px',
        zIndex: 200,
        minWidth: '150px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontWeight: 'bold' }}>性能监控</span>
        <button
          onClick={() => setShow(false)}
          style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '14px' }}
        >
          ✕
        </button>
      </div>
      
      <div style={{ marginBottom: '6px' }}>
        <span style={{ opacity: 0.7 }}>帧率: </span>
        <span style={{ color: getFpsColor(), fontWeight: 'bold', fontSize: '16px' }}>{fps}</span>
        <span style={{ opacity: 0.7 }}> FPS</span>
      </div>
      
      <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', overflow: 'hidden' }}>
        <div
          style={{
            width: `${Math.min((fps / 60) * 100, 100)}%`,
            height: '100%',
            background: getFpsColor(),
            transition: 'width 0.3s',
          }}
        />
      </div>
    </div>
  );
};
