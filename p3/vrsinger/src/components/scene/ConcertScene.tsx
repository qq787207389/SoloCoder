import React, { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sky, Stars } from '@react-three/drei';
import { Stage } from './Stage';
import { StageLights } from './StageLights';
import { BigScreen } from './BigScreen';
import { VirtualSinger } from './VirtualSinger';
import { Audience } from './Audience';
import { ParticleEffects } from './ParticleEffects';
import { CameraController } from './CameraController';
import { useConcertStore } from '../../store/useConcertStore';
import { timelineEngine } from '../../timeline/TimelineEngine';

const SceneUpdater: React.FC = () => {
  const { isPlaying, currentTime } = useConcertStore();

  useEffect(() => {
    if (isPlaying) {
      timelineEngine.start();
    } else {
      timelineEngine.stop();
    }
  }, [isPlaying]);

  useEffect(() => {
    timelineEngine.update(currentTime);
  }, [currentTime]);

  return null;
};

export const ConcertScene: React.FC = () => {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 3, 12], fov: 60, near: 0.1, far: 1000 }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      dpr={[1, 2]}
      performance={{ min: 0.5 }}
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <fog attach="fog" args={['#0a0a1a', 10, 40]} />
      <color attach="background" args={['#0a0a1a']} />

      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
      <Sky sunPosition={[100, 20, 100]} turbidity={0} rayleigh={0} mieCoefficient={0} mieDirectionalG={0} />

      <CameraController />
      <SceneUpdater />

      <Stage />
      <StageLights />
      <BigScreen />
      <VirtualSinger />
      <Audience />
      <ParticleEffects />
    </Canvas>
  );
};
