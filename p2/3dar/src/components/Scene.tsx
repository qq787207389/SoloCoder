import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import { Shoe } from './Shoe';
import type { ShoeConfig } from '../types';
import * as THREE from 'three';

interface SceneProps {
  config: ShoeConfig;
  autoRotate: boolean;
}

function RotatingShoe({ config, autoRotate }: SceneProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group ref={groupRef}>
      <Shoe config={config} />
    </group>
  );
}

function Loader() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#3b82f6" wireframe />
    </mesh>
  );
}

export function Scene({ config, autoRotate }: SceneProps) {
  return (
    <Canvas
      shadows
      camera={{ position: [5, 3, 5], fov: 50 }}
      gl={{ preserveDrawingBuffer: true }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <spotLight
        position={[-10, 10, -10]}
        angle={0.3}
        penumbra={1}
        intensity={0.6}
        castShadow
      />
      <pointLight position={[0, 5, 0]} intensity={0.5} />

      <Suspense fallback={<Loader />}>
        <RotatingShoe config={config} autoRotate={autoRotate} />
      </Suspense>

      <ContactShadows
        position={[0, -0.8, 0]}
        opacity={0.5}
        scale={10}
        blur={2}
        far={4}
      />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.8, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <shadowMaterial transparent opacity={0.3} />
      </mesh>

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={3}
        maxDistance={15}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2.1}
      />
    </Canvas>
  );
}
