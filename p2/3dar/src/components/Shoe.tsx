import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import type { ShoeConfig } from '../types';

interface ShoeProps {
  config: ShoeConfig;
}

export function Shoe({ config }: ShoeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { colors, visibility, customTexture } = config;

  const texture = useMemo(() => {
    if (customTexture) {
      const loader = new THREE.TextureLoader();
      return loader.load(customTexture);
    }
    return null;
  }, [customTexture]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.02;
    }
  });

  return (
    <group ref={groupRef} rotation={[0, Math.PI / 4, 0]}>
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.8, 1]} />
        <meshStandardMaterial
          color={colors.upper}
          map={texture}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      <mesh position={[0, 0.7, 0.2]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.4, 0.6]} />
        <meshStandardMaterial
          color={colors.upper}
          map={texture}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      <mesh position={[0.8, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 0.6, 1]} />
        <meshStandardMaterial
          color={colors.upper}
          map={texture}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      <mesh position={[-0.8, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 0.6, 1]} />
        <meshStandardMaterial
          color={colors.upper}
          map={texture}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      <mesh position={[0, 0.5, 0.5]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.7, 0.15]} />
        <meshStandardMaterial
          color={colors.upper}
          map={texture}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      <mesh position={[0, -0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.4, 1.1]} />
        <meshStandardMaterial color={colors.sole} roughness={0.9} metalness={0} />
      </mesh>

      <mesh position={[0, -0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 0.15, 1.2]} />
        <meshStandardMaterial color={colors.sole} roughness={0.9} metalness={0} />
      </mesh>

      {visibility.laces && (
        <group position={[0, 0.9, 0.15]}>
          {[-0.5, -0.25, 0, 0.25, 0.5].map((x, i) => (
            <mesh key={i} position={[x, 0, 0]} castShadow>
              <cylinderGeometry args={[0.02, 0.02, 0.6, 8]} />
              <meshStandardMaterial color={colors.laces} roughness={0.5} />
            </mesh>
          ))}
          <mesh position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 1.2, 8]} />
            <meshStandardMaterial color={colors.laces} roughness={0.5} />
          </mesh>
        </group>
      )}

      {visibility.logo && (
        <group>
          <mesh position={[1.05, 0.5, 0]} rotation={[0, 0, Math.PI / 6]} castShadow>
            <boxGeometry args={[0.08, 0.4, 0.15]} />
            <meshStandardMaterial color={colors.logo} roughness={0.3} metalness={0.5} />
          </mesh>
          <mesh position={[0.95, 0.3, 0]} rotation={[0, 0, -Math.PI / 6]} castShadow>
            <boxGeometry args={[0.08, 0.4, 0.15]} />
            <meshStandardMaterial color={colors.logo} roughness={0.3} metalness={0.5} />
          </mesh>
        </group>
      )}

      {visibility.badge && (
        <mesh position={[0, 0.95, -0.45]} castShadow>
          <cylinderGeometry args={[0.15, 0.15, 0.05, 32]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
        </mesh>
      )}

      <mesh position={[0, 0.6, 0.25]}>
        <torusGeometry args={[0.2, 0.02, 8, 32]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
    </group>
  );
}
