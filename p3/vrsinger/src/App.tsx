import React, { useEffect, useState } from 'react';
import { ConcertScene } from './components/scene/ConcertScene';
import { ControlPanel } from './components/ui/ControlPanel';
import { DanmakuLayer } from './components/ui/DanmakuLayer';
import { HUD } from './components/ui/HUD';
import { PerformanceMonitor } from './components/performance/PerformanceMonitor';
import { audioEngine } from './audio/AudioEngine';

function App() {
  const [isMobile, setIsMobile] = useState(false);
  const [showStartScreen, setShowStartScreen] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      audioEngine.destroy();
    };
  }, []);

  const handleStart = async () => {
    await audioEngine.init();
    setShowStartScreen(false);
  };

  if (showStartScreen) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 50%, #0a0a1a 100%)',
        position: 'fixed',
        top: 0,
        left: 0,
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)',
          animation: 'pulse 2s ease-in-out infinite',
        }} />
        
        <h1 style={{
          color: 'white',
          fontSize: isMobile ? '36px' : '64px',
          fontWeight: 'bold',
          marginBottom: '16px',
          textShadow: '0 0 40px rgba(99, 102, 241, 0.8)',
          zIndex: 1,
        }}>
          VR SINGER
        </h1>
        
        <p style={{
          color: 'rgba(255,255,255,0.7)',
          fontSize: isMobile ? '14px' : '18px',
          marginBottom: '40px',
          zIndex: 1,
        }}>
          2024 沉浸式虚拟演唱会
        </p>
        
        <button
          onClick={handleStart}
          style={{
            padding: isMobile ? '14px 40px' : '18px 60px',
            fontSize: isMobile ? '16px' : '20px',
            fontWeight: 'bold',
            color: 'white',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            border: 'none',
            borderRadius: '50px',
            cursor: 'pointer',
            boxShadow: '0 8px 30px rgba(99, 102, 241, 0.5)',
            transition: 'all 0.3s ease',
            zIndex: 1,
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(99, 102, 241, 0.6)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(99, 102, 241, 0.5)';
          }}
        >
          🎵 开始观看
        </button>
        
        <div style={{
          marginTop: '40px',
          color: 'rgba(255,255,255,0.5)',
          fontSize: '12px',
          textAlign: 'center',
          zIndex: 1,
          maxWidth: '400px',
          padding: '0 20px',
        }}>
          <p>🎯 正面视角 | 👁️ 侧面视角 | 🔝 俯视视角 | ✨ 自由视角</p>
          <p style={{ marginTop: '8px' }}>💬 弹幕互动 | 👤 虚拟形象 | 🎵 节拍同步</p>
        </div>
        
        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.2); opacity: 0.8; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, overflow: 'hidden' }}>
      <ConcertScene />
      <HUD />
      <DanmakuLayer />
      <ControlPanel />
      <PerformanceMonitor />
      
      <div
        style={{
          position: 'absolute',
          top: isMobile ? '10px' : '20px',
          right: isMobile ? '10px' : '20px',
          zIndex: 100,
          textAlign: 'right',
        }}
      >
        <h1
          style={{
            color: 'white',
            fontSize: isMobile ? '16px' : '24px',
            fontWeight: 'bold',
            textShadow: '0 0 20px rgba(99, 102, 241, 0.8)',
            marginBottom: '4px',
          }}
        >
          VR SINGER
        </h1>
        <p
          style={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: isMobile ? '10px' : '12px',
          }}
        >
          2024 虚拟演唱会
        </p>
      </div>
    </div>
  );
}

export default App;
