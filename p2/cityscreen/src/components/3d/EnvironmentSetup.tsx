import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, ToneMapping } from '@react-three/postprocessing';
import * as THREE from 'three';
import type { AirQualityData } from '../../types';

interface EnvironmentSetupProps {
  timeOfDay: number;
  airQuality: AirQualityData[];
}

export function EnvironmentSetup({ timeOfDay, airQuality }: EnvironmentSetupProps) {
  const directionalLightRef = useRef<THREE.DirectionalLight>(null);
  const ambientLightRef = useRef<THREE.AmbientLight>(null);
  const { scene } = useThree();

  const avgAqi = useMemo(() => {
    if (airQuality.length === 0) return 50;
    return airQuality.reduce((sum, aq) => sum + aq.aqi, 0) / airQuality.length;
  }, [airQuality]);

  const fogDensity = useMemo(() => {
    return 0.005 + (avgAqi / 200) * 0.03;
  }, [avgAqi]);

  const fogColor = useMemo(() => {
    const intensity = Math.min(avgAqi / 150, 1);
    const color = new THREE.Color();
    color.setRGB(0.7 + intensity * 0.2, 0.65 + intensity * 0.1, 0.55 + intensity * 0.1);
    return color;
  }, [avgAqi]);

  useFrame(() => {
    if (directionalLightRef.current) {
      const angle = ((timeOfDay - 6) / 24) * Math.PI * 2;
      const radius = 100;
      directionalLightRef.current.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius + 30,
        50
      );

      const dayIntensity = Math.max(0, Math.sin(angle)) * 1.5;
      directionalLightRef.current.intensity = dayIntensity;
    }

    if (ambientLightRef.current) {
      const dayFactor = Math.max(0, Math.sin(((timeOfDay - 6) / 24) * Math.PI * 2));
      ambientLightRef.current.intensity = 0.2 + dayFactor * 0.4;

      const nightColor = new THREE.Color(0x1a1a3a);
      const dayColor = new THREE.Color(0xffffff);
      ambientLightRef.current.color.lerpColors(nightColor, dayColor, dayFactor);
    }

    if (scene.fog) {
      (scene.fog as THREE.FogExp2).density = fogDensity;
      (scene.fog as THREE.FogExp2).color.copy(fogColor);
    }
  });

  return (
    <>
      <fogExp2 attach="fog" args={[fogColor, fogDensity]} />

      <ambientLight ref={ambientLightRef} intensity={0.4} color={0xffffff} />

      <directionalLight
        ref={directionalLightRef}
        position={[50, 80, 50]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
      />

      <pointLight position={[0, 50, 0]} intensity={0.5} color={0x4488ff} />

      <EffectComposer>
        <Bloom
          intensity={0.5}
          luminanceThreshold={0.8}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
        <ToneMapping adaptive />
      </EffectComposer>
    </>
  );
}
