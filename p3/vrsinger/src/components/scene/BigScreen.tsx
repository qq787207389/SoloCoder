import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useConcertStore } from '../../store/useConcertStore';
import * as THREE from 'three';

export const BigScreen: React.FC = () => {
  const { screenContent, beat } = useConcertStore();
  const meshRef = useRef<THREE.Mesh>(null);

  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    return new THREE.CanvasTexture(canvas);
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const canvas = texture.image as HTMLCanvasElement;
    const ctx = canvas.getContext('2d')!;

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#0a0a2e');
    gradient.addColorStop(0.5, '#1a1a4e');
    gradient.addColorStop(1, '#0a0a2e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const pulseIntensity = 0.5 + Math.sin(beat * Math.PI * 2) * 0.3;
    for (let i = 0; i < 50; i++) {
      const x = (i * 73 + time * 100) % canvas.width;
      const y = (i * 47 + Math.sin(time + i) * 50 + 256);
      const size = 2 + Math.sin(time * 2 + i) * 1;
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 255, 255, ${0.3 * pulseIntensity})`;
      ctx.fill();
    }

    for (let i = 0; i < 64; i++) {
      const barHeight = 30 + Math.sin(time * 3 + i * 0.3) * 20 + pulseIntensity * 30;
      const hue = (i * 5 + time * 50) % 360;
      
      ctx.fillStyle = `hsla(${hue}, 100%, 60%, 0.8)`;
      ctx.fillRect(
        i * 16,
        canvas.height - barHeight - 50,
        12,
        barHeight
      );
    }

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2 - 50);
    
    const scale = 1 + Math.sin(beat * Math.PI * 2) * 0.1;
    ctx.scale(scale, scale);

    if (screenContent.type === 'text' && screenContent.text) {
      const glowSize = 20 + Math.sin(time * 2) * 10;
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = glowSize * pulseIntensity;
      ctx.font = 'bold 72px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(screenContent.text, 0, 0);
      
      ctx.shadowBlur = 0;
      ctx.font = 'bold 72px Arial';
      ctx.strokeStyle = `rgba(0, 255, 255, ${pulseIntensity})`;
      ctx.lineWidth = 3;
      ctx.strokeText(screenContent.text, 0, 0);
    } else if (screenContent.effect === 'rainbow') {
      const hue = (time * 50) % 360;
      ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
      ctx.shadowBlur = 30;
      ctx.font = 'bold 80px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = `hsl(${hue}, 100%, 70%)`;
      ctx.fillText('🌈 VR SINGER 🌈', 0, 0);
    } else if (screenContent.effect === 'pulse') {
      ctx.shadowColor = '#ff00ff';
      ctx.shadowBlur = 40 * pulseIntensity;
      ctx.font = 'bold 90px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ff00ff';
      ctx.fillText('♪ MUSIC ♪', 0, 0);
    }

    ctx.restore();

    const barCount = 128;
    const barWidth = canvas.width / barCount;
    for (let i = 0; i < barCount; i++) {
      const freqHeight = 20 + Math.sin(time * 4 + i * 0.2) * 15 + Math.random() * 10;
      const hue = (i / barCount) * 360;
      
      ctx.fillStyle = `hsla(${hue}, 80%, 50%, 0.6)`;
      ctx.fillRect(
        i * barWidth,
        10,
        barWidth - 2,
        freqHeight
      );
      ctx.fillRect(
        i * barWidth,
        canvas.height - freqHeight - 10,
        barWidth - 2,
        freqHeight
      );
    }

    texture.needsUpdate = true;
  });

  return (
    <mesh ref={meshRef} position={[0, 4, -5.3]}>
      <planeGeometry args={[11, 6.5]} />
      <meshBasicMaterial 
        map={texture}
        toneMapped={false}
      />
    </mesh>
  );
};
