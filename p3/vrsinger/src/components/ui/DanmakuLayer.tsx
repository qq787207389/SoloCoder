import React, { useState, useEffect, useRef } from 'react';
import { useConcertStore } from '../../store/useConcertStore';

interface DanmakuItem {
  id: string;
  text: string;
  color: string;
  top: number;
  left: number;
  speed: number;
}

export const DanmakuLayer: React.FC = () => {
  const { isDanmakuEnabled, danmakuList, addDanmaku, isPlaying } = useConcertStore();
  const [activeDanmaku, setActiveDanmaku] = useState<DanmakuItem[]>([]);
  const [inputText, setInputText] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  const sampleDanmaku = [
    '太好听了!',
    '我爱VR Singer!',
    '666666',
    '前排打卡',
    '演唱会太棒了',
    '♪♪♪',
    '虚拟偶像万岁',
    '一起打call',
    '舞美太炫了',
    '声控福利',
  ];

  useEffect(() => {
    if (!isDanmakuEnabled || !isPlaying) return;

    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const text = sampleDanmaku[Math.floor(Math.random() * sampleDanmaku.length)];
        const colors = ['#ffffff', '#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3', '#f38181'];
        addDanmaku({
          text,
          color: colors[Math.floor(Math.random() * colors.length)],
          userId: `user_${Math.random()}`,
          userName: '观众',
        });
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [isDanmakuEnabled, isPlaying, addDanmaku]);

  useEffect(() => {
    if (!isDanmakuEnabled || danmakuList.length === 0) return;

    const latestDanmaku = danmakuList[danmakuList.length - 1];
    const newItem: DanmakuItem = {
      id: latestDanmaku.id,
      text: latestDanmaku.text,
      color: latestDanmaku.color,
      top: Math.random() * 60 + 10,
      left: 100,
      speed: 0.3 + Math.random() * 0.4,
    };

    setActiveDanmaku((prev) => [...prev.slice(-20), newItem]);
  }, [danmakuList.length, isDanmakuEnabled]);

  useEffect(() => {
    if (!isDanmakuEnabled) {
      setActiveDanmaku([]);
      return;
    }

    const animate = () => {
      setActiveDanmaku((prev) =>
        prev
          .map((item) => ({ ...item, left: item.left - item.speed }))
          .filter((item) => item.left > -50)
      );
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isDanmakuEnabled]);

  const handleSendDanmaku = () => {
    if (!inputText.trim()) return;
    
    addDanmaku({
      text: inputText,
      color: '#00ffff',
      userId: 'me',
      userName: '我',
    });
    setInputText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendDanmaku();
    }
  };

  if (!isDanmakuEnabled) return null;

  return (
    <>
      <div
        ref={containerRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: '150px',
          pointerEvents: 'none',
          overflow: 'hidden',
          zIndex: 50,
        }}
      >
        {activeDanmaku.map((item) => (
          <div
            key={item.id}
            style={{
              position: 'absolute',
              top: `${item.top}%`,
              left: `${item.left}%`,
              color: item.color,
              fontSize: '18px',
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
              whiteSpace: 'nowrap',
              transform: 'translateX(-50%)',
            }}
          >
            {item.text}
          </div>
        ))}
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: '140px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '10px',
          zIndex: 100,
        }}
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="发送弹幕..."
          maxLength={50}
          style={{
            width: '300px',
            padding: '10px 16px',
            borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.3)',
            background: 'rgba(0,0,0,0.6)',
            color: 'white',
            fontSize: '14px',
            outline: 'none',
            backdropFilter: 'blur(10px)',
          }}
        />
        <button
          onClick={handleSendDanmaku}
          style={{
            padding: '10px 24px',
            borderRadius: '24px',
            border: 'none',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: 'white',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
          }}
        >
          发送
        </button>
      </div>
    </>
  );
};
