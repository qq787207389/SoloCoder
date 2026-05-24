import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { SafetyEvent } from '../../types';
import { getSeverityColor } from '../../utils/colorUtils';

interface SafetyEventMarkersProps {
  events: SafetyEvent[];
}

export function SafetyEventMarkers({ events }: SafetyEventMarkersProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.elapsedTime;

    groupRef.current.children.forEach((child, index) => {
      const event = events[index];
      if (!event || event.status === 'resolved') return;

      const pulseScale = 1 + Math.sin(time * 3 + index) * 0.3;
      child.scale.setScalar(pulseScale);

      const rotation = child.rotation;
      rotation.y += 0.02;
    });
  });

  if (events.length === 0) return null;

  return (
    <group ref={groupRef}>
      {events.map((event) => (
        <group
          key={event.id}
          position={[event.position.x, 2, event.position.z]}
          visible={event.status === 'active'}
        >
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[3, 5, 32]} />
            <meshBasicMaterial
              color={getSeverityColor(event.severity)}
              transparent
              opacity={0.6}
              side={THREE.DoubleSide}
            />
          </mesh>

          <mesh position={[0, 5, 0]}>
            <sphereGeometry args={[0.8, 16, 16]} />
            <meshBasicMaterial
              color={getSeverityColor(event.severity)}
              transparent
              opacity={0.8}
            />
          </mesh>

          <mesh position={[0, 5, 0]}>
            <sphereGeometry args={[1.2, 16, 16]} />
            <meshBasicMaterial
              color={getSeverityColor(event.severity)}
              transparent
              opacity={0.3}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
