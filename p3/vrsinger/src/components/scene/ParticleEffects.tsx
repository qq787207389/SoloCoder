import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useConcertStore } from '../../store/useConcertStore';
import * as THREE from 'three';

export const ParticleEffects: React.FC = () => {
  const { particleConfig, beat } = useConcertStore();
  const glowstickRef = useRef<THREE.Points>(null);
  const sparkleRef = useRef<THREE.Points>(null);
  const confettiRef = useRef<THREE.Points>(null);

  const maxParticles = 500;

  const glowstickData = useMemo(() => {
    const positions = new Float32Array(maxParticles * 3);
    const colors = new Float32Array(maxParticles * 3);
    const velocities = new Float32Array(maxParticles * 3);
    const offsets = new Float32Array(maxParticles);

    for (let i = 0; i < maxParticles; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 5 + Math.random() * 10;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = 1 + Math.random() * 2;
      positions[i * 3 + 2] = 5 + Math.random() * 10;

      velocities[i * 3] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;

      offsets[i] = Math.random() * Math.PI * 2;
    }

    return { positions, colors, velocities, offsets };
  }, []);

  const sparkleData = useMemo(() => {
    const positions = new Float32Array(maxParticles * 3);
    const velocities = new Float32Array(maxParticles * 3);
    const lifetimes = new Float32Array(maxParticles);

    for (let i = 0; i < maxParticles; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = 3 + Math.random() * 5;
      positions[i * 3 + 2] = -3 + Math.random() * 6;
      velocities[i * 3] = (Math.random() - 0.5) * 0.05;
      velocities[i * 3 + 1] = Math.random() * 0.05;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.05;
      lifetimes[i] = Math.random();
    }

    return { positions, velocities, lifetimes };
  }, []);

  const confettiData = useMemo(() => {
    const positions = new Float32Array(maxParticles * 3);
    const velocities = new Float32Array(maxParticles * 3);
    const rotations = new Float32Array(maxParticles * 3);
    const colors = new Float32Array(maxParticles * 3);

    for (let i = 0; i < maxParticles; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = 8 + Math.random() * 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

      velocities[i * 3] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 1] = -0.02 - Math.random() * 0.03;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;

      rotations[i * 3] = Math.random() * Math.PI;
      rotations[i * 3 + 1] = Math.random() * Math.PI;
      rotations[i * 3 + 2] = Math.random() * Math.PI;

      const hue = Math.random() * 360;
      const color = new THREE.Color(`hsl(${hue}, 100%, 60%)`);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    return { positions, velocities, rotations, colors };
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const beatPulse = 0.5 + Math.sin(beat * Math.PI * 2) * 0.5;

    if (glowstickRef.current) {
      const positions = glowstickRef.current.geometry.attributes.position.array as Float32Array;
      const colors = glowstickRef.current.geometry.attributes.color.array as Float32Array;

      const baseColor = new THREE.Color(particleConfig.color);

      for (let i = 0; i < particleConfig.count && i < maxParticles; i++) {
        const offset = glowstickData.offsets[i];
        positions[i * 3 + 1] = 1.5 + Math.sin(time * 3 + offset) * 0.3 + beatPulse * 0.2;

        const intensity = 0.5 + Math.sin(time * 2 + offset) * 0.3 + beatPulse * 0.3;
        colors[i * 3] = baseColor.r * intensity;
        colors[i * 3 + 1] = baseColor.g * intensity;
        colors[i * 3 + 2] = baseColor.b * intensity;
      }

      glowstickRef.current.geometry.attributes.position.needsUpdate = true;
      glowstickRef.current.geometry.attributes.color.needsUpdate = true;
    }

    if (sparkleRef.current) {
      const positions = sparkleRef.current.geometry.attributes.position.array as Float32Array;

      for (let i = 0; i < Math.min(particleConfig.count / 2, maxParticles); i++) {
        sparkleData.lifetimes[i] += 0.01 * particleConfig.speed;

        if (sparkleData.lifetimes[i] > 1) {
          sparkleData.lifetimes[i] = 0;
          positions[i * 3] = (Math.random() - 0.5) * 10;
          positions[i * 3 + 1] = 2 + Math.random() * 3;
          positions[i * 3 + 2] = -2 + Math.random() * 4;
        }

        positions[i * 3] += sparkleData.velocities[i * 3] * particleConfig.speed;
        positions[i * 3 + 1] += sparkleData.velocities[i * 3 + 1] * particleConfig.speed;
        positions[i * 3 + 2] += sparkleData.velocities[i * 3 + 2] * particleConfig.speed;
      }

      sparkleRef.current.geometry.attributes.position.needsUpdate = true;
    }

    if (confettiRef.current && particleConfig.type === 'confetti') {
      const positions = confettiRef.current.geometry.attributes.position.array as Float32Array;

      for (let i = 0; i < Math.min(particleConfig.count, maxParticles); i++) {
        positions[i * 3] += confettiData.velocities[i * 3] * particleConfig.speed;
        positions[i * 3 + 1] += confettiData.velocities[i * 3 + 1] * particleConfig.speed;
        positions[i * 3 + 2] += confettiData.velocities[i * 3 + 2] * particleConfig.speed;

        if (positions[i * 3 + 1] < 0) {
          positions[i * 3] = (Math.random() - 0.5) * 20;
          positions[i * 3 + 1] = 10;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
        }
      }

      confettiRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group>
      <points ref={glowstickRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={maxParticles}
            array={glowstickData.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={maxParticles}
            array={glowstickData.colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.15}
          vertexColors
          transparent
          opacity={0.8}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>

      <points ref={sparkleRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={maxParticles}
            array={sparkleData.positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.08}
          color="#ffffff"
          transparent
          opacity={0.9}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>

      {particleConfig.type === 'confetti' && (
        <points ref={confettiRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={maxParticles}
              array={confettiData.positions}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-color"
              count={maxParticles}
              array={confettiData.colors}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.12}
            vertexColors
            transparent
            opacity={0.9}
            sizeAttenuation
          />
        </points>
      )}

      <StageLaser />
    </group>
  );
};

const StageLaser: React.FC = () => {
  const { beat } = useConcertStore();
  const laserRefs = useRef<THREE.Mesh[]>([]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const beatPulse = Math.sin(beat * Math.PI * 2) * 0.5 + 0.5;

    laserRefs.current.forEach((laser, i) => {
      if (laser) {
        const angle = time * (i % 2 === 0 ? 1 : -1) * 0.5;
        laser.rotation.y = angle;
        laser.scale.y = 0.5 + beatPulse * 0.5;
        const material = laser.material as THREE.MeshBasicMaterial;
        material.opacity = 0.3 + beatPulse * 0.4;
      }
    });
  });

  const laserColors = ['#ff0066', '#00ffff', '#ffff00', '#ff00ff'];

  return (
    <group>
      {[-4, -2, 2, 4].map((x, i) => (
        <mesh
          key={`laser-${i}`}
          ref={(el) => {
            if (el) laserRefs.current[i] = el;
          }}
          position={[x, 6, -1]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.02, 0.2, 10, 8, 1, true]} />
          <meshBasicMaterial
            color={laserColors[i]}
            transparent
            opacity={0.5}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
};
