import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useConcertStore } from '../../store/useConcertStore';
import * as THREE from 'three';

export const VirtualSinger: React.FC = () => {
  const { characterState, beat } = useConcertStore();
  const groupRef = useRef<THREE.Group>(null);
  const targetPosition = useRef(new THREE.Vector3(...characterState.position));
  const currentPosition = useRef(new THREE.Vector3(...characterState.position));

  const [animations] = useState(() => ({
    body: { y: 0, rotation: 0 },
    head: { y: 0, rotation: 0 },
    leftArm: { rotation: 0 },
    rightArm: { rotation: 0 },
    leftLeg: { rotation: 0 },
    rightLeg: { rotation: 0 },
  }));

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    
    targetPosition.current.set(...characterState.position);
    currentPosition.current.lerp(targetPosition.current, delta * 3);

    if (groupRef.current) {
      groupRef.current.position.copy(currentPosition.current);
      groupRef.current.rotation.y = characterState.rotation[1];
    }

    const beatPulse = Math.sin(beat * Math.PI * 2) * 0.5 + 0.5;

    switch (characterState.animation) {
      case 'idle':
        animations.body.y = Math.sin(time * 2) * 0.05;
        animations.body.rotation = Math.sin(time * 1.5) * 0.05;
        animations.leftArm.rotation = Math.sin(time * 2) * 0.2;
        animations.rightArm.rotation = -Math.sin(time * 2) * 0.2;
        break;

      case 'walk':
        animations.body.y = Math.abs(Math.sin(time * 8)) * 0.1;
        animations.leftLeg.rotation = Math.sin(time * 8) * 0.4;
        animations.rightLeg.rotation = -Math.sin(time * 8) * 0.4;
        animations.leftArm.rotation = -Math.sin(time * 8) * 0.3;
        animations.rightArm.rotation = Math.sin(time * 8) * 0.3;
        break;

      case 'dance':
        animations.body.y = beatPulse * 0.2;
        animations.body.rotation = Math.sin(time * 6) * 0.15;
        animations.head.rotation = Math.sin(time * 5) * 0.1;
        animations.leftArm.rotation = -0.5 + Math.sin(time * 8 + beat * Math.PI) * 0.6;
        animations.rightArm.rotation = -0.5 + Math.sin(time * 8 + beat * Math.PI + 0.5) * 0.6;
        animations.leftLeg.rotation = Math.sin(time * 6) * 0.2;
        animations.rightLeg.rotation = -Math.sin(time * 6 + 0.5) * 0.2;
        break;

      case 'wave':
        animations.body.y = Math.sin(time * 2) * 0.05;
        animations.rightArm.rotation = -1 + Math.sin(time * 6) * 0.4;
        animations.leftArm.rotation = 0.2;
        break;

      case 'sing':
        animations.body.y = beatPulse * 0.12;
        animations.head.y = Math.sin(time * 4) * 0.03;
        animations.head.rotation = Math.sin(time * 3) * 0.08;
        animations.leftArm.rotation = -0.3 + Math.sin(time * 5 + beat * Math.PI * 0.5) * 0.3;
        animations.rightArm.rotation = -0.3 + Math.sin(time * 5 + beat * Math.PI * 0.5 + 1) * 0.3;
        break;
    }
  });

  return (
    <group ref={groupRef} position={characterState.position}>
      <group position={[0, animations.body.y, 0]} rotation={[0, 0, animations.body.rotation]}>
        <mesh position={[0, 1.2, 0]} castShadow>
          <capsuleGeometry args={[0.35, 1, 4, 8]} />
          <meshStandardMaterial color="#6366f1" metalness={0.3} roughness={0.5} />
        </mesh>

        <mesh position={[0, 2.2, 0]} castShadow>
          <sphereGeometry args={[0.35, 16, 16]} />
          <meshStandardMaterial color="#ffd4c4" metalness={0.1} roughness={0.7} />
        </mesh>

        <mesh position={[0, 2.3, 0.25]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>
        <mesh position={[-0.1, 2.32, 0.28]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0.1, 2.32, 0.28]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>

        <mesh position={[0, 2.55, 0]}>
          <sphereGeometry args={[0.38, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#8b5cf6" metalness={0.2} roughness={0.6} />
        </mesh>

        <group position={[-0.5, 1.5, 0]} rotation={[0, 0, animations.leftArm.rotation]}>
          <mesh position={[0, -0.4, 0]} castShadow>
            <capsuleGeometry args={[0.1, 0.6, 4, 8]} />
            <meshStandardMaterial color="#ffd4c4" />
          </mesh>
        </group>

        <group position={[0.5, 1.5, 0]} rotation={[0, 0, animations.rightArm.rotation]}>
          <mesh position={[0, -0.4, 0]} castShadow>
            <capsuleGeometry args={[0.1, 0.6, 4, 8]} />
            <meshStandardMaterial color="#ffd4c4" />
          </mesh>
        </group>

        <group position={[-0.18, 0.5, 0]} rotation={[animations.leftLeg.rotation, 0, 0]}>
          <mesh position={[0, -0.4, 0]} castShadow>
            <capsuleGeometry args={[0.12, 0.6, 4, 8]} />
            <meshStandardMaterial color="#4f46e5" />
          </mesh>
        </group>

        <group position={[0.18, 0.5, 0]} rotation={[animations.rightLeg.rotation, 0, 0]}>
          <mesh position={[0, -0.4, 0]} castShadow>
            <capsuleGeometry args={[0.12, 0.6, 4, 8]} />
            <meshStandardMaterial color="#4f46e5" />
          </mesh>
        </group>

        <mesh position={[0, 0.85, 0.3]}>
          <torusGeometry args={[0.4, 0.05, 8, 16]} />
          <meshStandardMaterial 
            color="#a855f7" 
            emissive="#a855f7" 
            emissiveIntensity={0.3 + Math.sin(beat * Math.PI * 2) * 0.2}
          />
        </mesh>
      </group>

      <pointLight 
        position={[0, 2.5, 0.5]} 
        color="#ffffff" 
        intensity={0.3 + Math.sin(beat * Math.PI * 2) * 0.2} 
        distance={3} 
      />
    </group>
  );
};
