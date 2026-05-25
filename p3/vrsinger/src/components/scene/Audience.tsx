import React, { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useConcertStore } from '../../store/useConcertStore';
import * as THREE from 'three';

export const Audience: React.FC = () => {
  const { beat, isAvatarEnabled, avatars } = useConcertStore();

  const audienceData = useMemo(() => {
    const data: { position: [number, number, number]; color: string; offset: number }[] = [];
    
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 12; col++) {
        const x = (col - 5.5) * 2;
        const z = 8 + row * 3;
        const hue = Math.random() * 360;
        data.push({
          position: [x, 0, z],
          color: `hsl(${hue}, 70%, 60%)`,
          offset: Math.random() * Math.PI * 2,
        });
      }
    }
    return data;
  }, []);

  const glowstickGeometry = useMemo(() => new THREE.CylinderGeometry(0.05, 0.05, 0.8, 8), []);
  const bodyGeometry = useMemo(() => new THREE.CapsuleGeometry(0.3, 0.8, 4, 8), []);
  const headGeometry = useMemo(() => new THREE.SphereGeometry(0.25, 16, 16), []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
  });

  return (
    <group>
      <mesh position={[0, -0.5, 15]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 20]} />
        <meshStandardMaterial color="#1a1a2a" />
      </mesh>

      {Array.from({ length: 6 }).map((_, row) => (
        <mesh key={`row-${row}`} position={[0, row * 0.3 - 0.5, 9 + row * 2.5]} receiveShadow>
          <boxGeometry args={[28, 0.3, 1.5]} />
          <meshStandardMaterial color="#2a2a4a" />
        </mesh>
      ))}

      {audienceData.map((data, i) => (
        <AudienceMember
          key={i}
          position={data.position}
          color={data.color}
          offset={data.offset}
          beat={beat}
          glowstickGeometry={glowstickGeometry}
          bodyGeometry={bodyGeometry}
          headGeometry={headGeometry}
        />
      ))}

      {isAvatarEnabled && avatars.map((avatar) => (
        <AvatarCharacter
          key={avatar.id}
          position={avatar.position}
          preset={avatar.preset}
          name={avatar.name}
          beat={beat}
        />
      ))}
    </group>
  );
};

interface AudienceMemberProps {
  position: [number, number, number];
  color: string;
  offset: number;
  beat: number;
  glowstickGeometry: THREE.CylinderGeometry;
  bodyGeometry: THREE.CapsuleGeometry;
  headGeometry: THREE.SphereGeometry;
}

const AudienceMember: React.FC<AudienceMemberProps> = ({
  position,
  color,
  offset,
  beat,
  glowstickGeometry,
  bodyGeometry,
  headGeometry,
}) => {
  const groupRef = React.useRef<THREE.Group>(null);
  const glowstickRef = React.useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (groupRef.current) {
      const bounce = Math.abs(Math.sin(time * 2 + offset)) * 0.1;
      const sway = Math.sin(time * 1.5 + offset) * 0.1;
      groupRef.current.position.y = position[1] + bounce;
      groupRef.current.rotation.z = sway;
    }
    if (glowstickRef.current) {
      const waveAngle = Math.sin(time * 4 + offset + beat * Math.PI) * 0.5;
      glowstickRef.current.rotation.z = waveAngle;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh geometry={bodyGeometry} position={[0, 0.7, 0]}>
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh geometry={headGeometry} position={[0, 1.5, 0]}>
        <meshStandardMaterial color="#ffccaa" />
      </mesh>
      <mesh
        ref={glowstickRef}
        geometry={glowstickGeometry}
        position={[0.5, 1.2, 0]}
      >
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={0.5 + Math.sin(beat * Math.PI * 2) * 0.3}
        />
      </mesh>
    </group>
  );
};

interface AvatarCharacterProps {
  position: [number, number, number];
  preset: string;
  name: string;
  beat: number;
}

const AvatarCharacter: React.FC<AvatarCharacterProps> = ({ position, preset, beat }) => {
  const groupRef = React.useRef<THREE.Group>(null);
  
  const presetColors: Record<string, string> = {
    cool: '#4488ff',
    cute: '#ff88cc',
    rock: '#ff4444',
    sweet: '#ffaa00',
  };

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (groupRef.current) {
      const bounce = Math.abs(Math.sin(time * 3)) * 0.15;
      groupRef.current.position.y = position[1] + bounce;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh position={[0, 0.8, 0]}>
        <capsuleGeometry args={[0.35, 1, 4, 8]} />
        <meshStandardMaterial color={presetColors[preset] || '#4488ff'} />
      </mesh>
      <mesh position={[0, 1.8, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#ffddbb" />
      </mesh>
      <mesh position={[0, 1.85, 0.28]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0.7, 1.5, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 1, 8]} />
        <meshStandardMaterial 
          color={presetColors[preset] || '#4488ff'} 
          emissive={presetColors[preset] || '#4488ff'}
          emissiveIntensity={0.6 + Math.sin(beat * Math.PI * 2) * 0.4}
        />
      </mesh>
    </group>
  );
};
