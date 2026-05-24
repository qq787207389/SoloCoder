import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { TrafficData } from '../../types';

interface TrafficParticlesProps {
  traffic: TrafficData[];
}

export function TrafficParticles({ traffic }: TrafficParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(traffic.length * 3);
    const colors = new Float32Array(traffic.length * 3);

    traffic.forEach((t, i) => {
      positions[i * 3] = t.position.x;
      positions[i * 3 + 1] = 0.5;
      positions[i * 3 + 2] = t.position.z;

      const color = new THREE.Color();
      const congestion = t.congestion / 100;
      color.setHSL(0.3 - congestion * 0.3, 1, 0.5);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    });

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [traffic.length]);

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  useFrame(() => {
    if (!pointsRef.current) return;

    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;

    traffic.forEach((t, i) => {
      posAttr.setX(i, t.position.x);
      posAttr.setZ(i, t.position.z);
      posAttr.setY(i, 0.5 + Math.sin(Date.now() * 0.005 + i) * 0.2);
    });

    posAttr.needsUpdate = true;
  });

  if (traffic.length === 0) return null;

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.8}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}
