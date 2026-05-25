import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useConcertStore } from '../../store/useConcertStore';
import * as THREE from 'three';

export const StageLights: React.FC = () => {
  const { lightStates, beat } = useConcertStore();
  const spotLightRef1 = useRef<THREE.SpotLight>(null);
  const spotLightRef2 = useRef<THREE.SpotLight>(null);
  const spotLightRef3 = useRef<THREE.SpotLight>(null);
  const pointLightRef1 = useRef<THREE.PointLight>(null);
  const pointLightRef2 = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const beatPulse = 1 + Math.sin(beat * Math.PI * 2) * 0.3;

    if (spotLightRef1.current) {
      spotLightRef1.current.intensity = (lightStates.main?.intensity || 1) * beatPulse;
      spotLightRef1.current.color.set(lightStates.main?.color || '#ffffff');
      spotLightRef1.current.target.position.set(
        Math.sin(time * 0.5) * 3,
        0,
        Math.cos(time * 0.3) * 2
      );
      spotLightRef1.current.target.updateMatrixWorld();
    }

    if (spotLightRef2.current) {
      spotLightRef2.current.intensity = (lightStates.left?.intensity || 0.8) * beatPulse;
      spotLightRef2.current.color.set(lightStates.left?.color || '#4488ff');
      spotLightRef2.current.target.position.set(
        -3 + Math.sin(time * 0.7) * 2,
        1,
        Math.cos(time * 0.4) * 3
      );
      spotLightRef2.current.target.updateMatrixWorld();
    }

    if (spotLightRef3.current) {
      spotLightRef3.current.intensity = (lightStates.right?.intensity || 0.8) * beatPulse;
      spotLightRef3.current.color.set(lightStates.right?.color || '#ff4488');
      spotLightRef3.current.target.position.set(
        3 + Math.sin(time * 0.6 + 1) * 2,
        1,
        Math.cos(time * 0.5 + 1) * 3
      );
      spotLightRef3.current.target.updateMatrixWorld();
    }

    if (pointLightRef1.current) {
      pointLightRef1.current.intensity = 0.5 + Math.sin(time * 2) * 0.3;
      pointLightRef1.current.position.set(
        Math.sin(time) * 5,
        3 + Math.sin(time * 1.5) * 2,
        Math.cos(time) * 3
      );
    }

    if (pointLightRef2.current) {
      pointLightRef2.current.intensity = 0.5 + Math.cos(time * 2) * 0.3;
      pointLightRef2.current.position.set(
        Math.cos(time + 1) * 5,
        3 + Math.cos(time * 1.5 + 1) * 2,
        Math.sin(time + 1) * 3
      );
    }
  });

  return (
    <group>
      <ambientLight 
        intensity={lightStates.ambient?.intensity || 0.3} 
        color={lightStates.ambient?.color || '#333366'} 
      />

      <spotLight
        ref={spotLightRef1}
        position={[0, 8, -2]}
        angle={0.4}
        penumbra={0.5}
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
      />

      <spotLight
        ref={spotLightRef2}
        position={[-6, 8, -2]}
        angle={0.35}
        penumbra={0.6}
        castShadow
        shadow-mapSize-width={256}
        shadow-mapSize-height={256}
      />

      <spotLight
        ref={spotLightRef3}
        position={[6, 8, -2]}
        angle={0.35}
        penumbra={0.6}
        castShadow
        shadow-mapSize-width={256}
        shadow-mapSize-height={256}
      />

      <pointLight
        ref={pointLightRef1}
        color="#ff00ff"
        distance={15}
        decay={2}
      />

      <pointLight
        ref={pointLightRef2}
        color="#00ffff"
        distance={15}
        decay={2}
      />

      <rectAreaLight
        position={[0, 4, -5.5]}
        width={10}
        height={6}
        intensity={2}
        color="#ffffff"
        rotation={[0, 0, 0]}
      />

      {[-4, 4].map((x, i) => (
        <group key={`rig-${i}`} position={[x, 6, -1]}>
          <mesh>
            <sphereGeometry args={[0.3, 8, 8]} />
            <meshStandardMaterial 
              color={i === 0 ? '#ff6600' : '#00ff66'} 
              emissive={i === 0 ? '#ff6600' : '#00ff66'} 
              emissiveIntensity={0.5}
            />
          </mesh>
          <pointLight 
            color={i === 0 ? '#ff6600' : '#00ff66'} 
            intensity={0.8} 
            distance={10} 
          />
        </group>
      ))}
    </group>
  );
};
