import React from 'react';
import * as THREE from 'three';

export const Stage: React.FC = () => {
  return (
    <group>
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[20, 1, 12]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.3} />
      </mesh>

      <mesh position={[0, -0.01, 0]} receiveShadow>
        <boxGeometry args={[18, 0.02, 10]} />
        <meshStandardMaterial 
          color="#0a0a1a" 
          emissive="#0066ff" 
          emissiveIntensity={0.2}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {[-8, -4, 0, 4, 8].map((x, i) => (
        <mesh key={`light-${i}`} position={[x, 0.01, -4]}>
          <cylinderGeometry args={[0.3, 0.3, 0.05, 32]} />
          <meshStandardMaterial 
            color="#00ffff" 
            emissive="#00ffff" 
            emissiveIntensity={0.5 + Math.sin(i) * 0.2}
          />
        </mesh>
      ))}

      <mesh position={[-10, 3, 0]} castShadow>
        <boxGeometry args={[1, 6, 1]} />
        <meshStandardMaterial color="#2d2d44" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[10, 3, 0]} castShadow>
        <boxGeometry args={[1, 6, 1]} />
        <meshStandardMaterial color="#2d2d44" metalness={0.7} roughness={0.3} />
      </mesh>

      <mesh position={[0, 6, 0]} castShadow>
        <boxGeometry args={[22, 0.5, 1]} />
        <meshStandardMaterial color="#2d2d44" metalness={0.7} roughness={0.3} />
      </mesh>

      <group position={[0, 0, -5.5]}>
        <mesh>
          <boxGeometry args={[12, 7, 0.5]} />
          <meshStandardMaterial color="#111122" />
        </mesh>
      </group>

      {[-7, 7].map((x, i) => (
        <mesh key={`speaker-${i}`} position={[x, 1.5, 5]} castShadow>
          <boxGeometry args={[1.5, 3, 1.5]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.5} roughness={0.5} />
        </mesh>
      ))}

      <group position={[0, -1, -3]}>
        {Array.from({ length: 6 }).map((_, i) => (
          <mesh key={`stair-${i}`} position={[0, i * 0.2, i * 1.2]}>
            <boxGeometry args={[16 - i * 2, 0.2, 1]} />
            <meshStandardMaterial color="#2a2a3e" metalness={0.6} roughness={0.4} />
          </mesh>
        ))}
      </group>
    </group>
  );
};
