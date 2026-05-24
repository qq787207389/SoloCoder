import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { BuildingData } from '../../types';

interface BuildingSelectorProps {
  building: BuildingData | undefined;
}

export function BuildingSelector({ building }: BuildingSelectorProps) {
  const ringRef = useRef<THREE.Mesh>(null);
  const boxRef = useRef<THREE.LineSegments>(null);

  useFrame((state) => {
    if (!building) return;

    const time = state.clock.elapsedTime;
    const pulse = 1 + Math.sin(time * 3) * 0.1;

    if (ringRef.current) {
      ringRef.current.scale.setScalar(pulse);
    }

    if (boxRef.current) {
      boxRef.current.scale.setScalar(pulse);
    }
  });

  if (!building) return null;

  const height = building.baseHeight;
  const width = building.width;
  const depth = building.depth;

  return (
    <group position={[building.position.x, 0, building.position.z]}>
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
        <ringGeometry args={[Math.max(width, depth) * 0.6, Math.max(width, depth) * 0.8, 32]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>

      <lineSegments ref={boxRef} position={[0, height / 2, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(width + 0.5, height + 0.5, depth + 0.5)]} />
        <lineBasicMaterial color="#00ffff" transparent opacity={0.8} />
      </lineSegments>
    </group>
  );
}
