import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useConcertStore } from '../../store/useConcertStore';
import * as THREE from 'three';

const cameraViews: Record<string, { position: [number, number, number]; target: [number, number, number] }> = {
  front: {
    position: [0, 3, 12],
    target: [0, 1.5, 0],
  },
  side: {
    position: [15, 4, 5],
    target: [0, 1.5, 0],
  },
  top: {
    position: [0, 18, 5],
    target: [0, 0, 0],
  },
  free: {
    position: [0, 3, 12],
    target: [0, 1.5, 0],
  },
};

export const CameraController: React.FC = () => {
  const { viewMode } = useConcertStore();
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const targetPosition = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());

  useEffect(() => {
    if (viewMode !== 'free') {
      const view = cameraViews[viewMode] || cameraViews.front;
      targetPosition.current.set(...view.position);
      targetLookAt.current.set(...view.target);
    }
  }, [viewMode]);

  useFrame((_, delta) => {
    if (viewMode !== 'free' && controlsRef.current) {
      camera.position.lerp(targetPosition.current, delta * 2);
      controlsRef.current.target.lerp(targetLookAt.current, delta * 2);
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      minDistance={5}
      maxDistance={30}
      minPolarAngle={0.2}
      maxPolarAngle={Math.PI / 2 - 0.1}
      enablePan={viewMode === 'free'}
      enableRotate={viewMode === 'free'}
    />
  );
};
