
import { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { Mech, PartType } from '../types';

interface MechPartProps {
  position: [number, number, number];
  scale?: [number, number, number];
  color: string;
  isEquipped: boolean;
}

function MechPart({ position, scale = [1, 1, 1], color, isEquipped }: MechPartProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.02;
    }
  });

  if (!isEquipped) {
    return (
      <mesh position={position} scale={scale}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#333" wireframe opacity={0.3} transparent />
      </mesh>
    );
  }

  return (
    <mesh ref={meshRef} position={position} scale={scale} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={color}
        metalness={0.8}
        roughness={0.2}
        emissive={color}
        emissiveIntensity={0.1}
      />
    </mesh>
  );
}

interface MechModelProps {
  mech: Mech;
}

function MechModel({ mech }: MechModelProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  const getPartColor = (partType: PartType): string => {
    const part = mech.parts[partType];
    if (!part) return '#333';

    const colors: Record<string, string> = {
      common: '#6b7280',
      uncommon: '#22c55e',
      rare: '#3b82f6',
      epic: '#a855f7',
      legendary: '#f59e0b',
    };
    return colors[part.rarity] || '#6b7280';
  };

  return (
    <group ref={groupRef}>
      <MechPart
        position={[0, 2.5, 0]}
        scale={[0.8, 0.8, 0.8]}
        color={getPartColor('head')}
        isEquipped={!!mech.parts.head}
      />

      <MechPart
        position={[0, 1.2, 0]}
        scale={[1.2, 1.5, 0.8]}
        color={getPartColor('torso')}
        isEquipped={!!mech.parts.torso}
      />

      <MechPart
        position={[-1.2, 1.2, 0]}
        scale={[0.5, 1.2, 0.5]}
        color={getPartColor('leftArm')}
        isEquipped={!!mech.parts.leftArm}
      />

      <MechPart
        position={[1.2, 1.2, 0]}
        scale={[0.5, 1.2, 0.5]}
        color={getPartColor('rightArm')}
        isEquipped={!!mech.parts.rightArm}
      />

      <MechPart
        position={[-0.5, -0.5, 0]}
        scale={[0.5, 1.5, 0.5]}
        color={getPartColor('legs')}
        isEquipped={!!mech.parts.legs}
      />

      <MechPart
        position={[0.5, -0.5, 0]}
        scale={[0.5, 1.5, 0.5]}
        color={getPartColor('legs')}
        isEquipped={!!mech.parts.legs}
      />

      <mesh position={[0, 1.2, 0.5]} scale={0.3}>
        <cylinderGeometry args={[0.5, 0.5, 0.3, 8]} />
        <meshStandardMaterial
          color="#00f5d4"
          emissive="#00f5d4"
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
}

interface Mech3DViewerProps {
  mech: Mech;
}

export default function Mech3DViewer({ mech }: Mech3DViewerProps) {
  return (
    <Canvas
      camera={{ position: [5, 3, 5], fov: 50 }}
      shadows
      gl={{ antialias: true }}
      onCreated={(state) => {
        state.gl.toneMapping = THREE.ACESFilmicToneMapping;
        state.gl.toneMappingExposure = 1.2;
      }}
    >
      <color attach="background" args={['#0a0a0f']} />
      <fog attach="fog" args={['#0a0a0f', 10, 25]} />

      <ambientLight intensity={0.3} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-5, 5, -5]} intensity={0.5} color="#00f5d4" />
      <pointLight position={[5, 5, 5]} intensity={0.3} color="#f72585" />

      <MechModel mech={mech} />

      <ContactShadows
        position={[0, -1.5, 0]}
        opacity={0.5}
        scale={10}
        blur={2}
        far={4}
      />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.5} roughness={0.8} />
      </mesh>

      <OrbitControls
        enablePan={false}
        minDistance={4}
        maxDistance={12}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2}
      />

      <hemisphereLight args={['#00f5d4', '#1a1a2e', 0.4]} />
      <pointLight position={[0, 8, 0]} intensity={0.6} color="#ffffff" />
    </Canvas>
  );
}
