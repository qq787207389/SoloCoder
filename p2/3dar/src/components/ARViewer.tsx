import { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Shoe } from './Shoe';
import type { ShoeConfig } from '../types';
import * as THREE from 'three';

interface ARViewerProps {
  config: ShoeConfig;
  isOpen: boolean;
  onClose: () => void;
}

function ARShoe({ config, placed, position }: {
  config: ShoeConfig;
  placed: boolean;
  position: THREE.Vector3;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current && placed) {
      groupRef.current.rotation.y += delta * 0.3;
    }
  });

  if (!placed) return null;

  return (
    <group ref={groupRef} position={position} scale={0.5}>
      <Shoe config={config} />
    </group>
  );
}

function PlacementHelper({ onPlace }: { onPlace: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <mesh
      position={[0, 0, -2]}
      onClick={onPlace}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <ringGeometry args={[0.15, 0.25, 32]} />
      <meshBasicMaterial
        color={hovered ? '#10b981' : '#3b82f6'}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
}

export function ARViewer({ config, isOpen, onClose }: ARViewerProps) {
  const [placed, setPlaced] = useState(false);
  const [position] = useState(new THREE.Vector3(0, 0, -2));

  const handlePlace = () => {
    setPlaced(true);
  };

  useEffect(() => {
    if (!isOpen) {
      setPlaced(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl px-5 py-3 border border-white/20">
          <h3 className="text-sm font-bold text-white">AR 预览模式</h3>
        </div>
        <button
          onClick={onClose}
          className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white hover:bg-white/30 transition-all border border-white/20"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <Canvas camera={{ position: [0, 1.6, 0] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        
        {!placed && <PlacementHelper onPlace={handlePlace} />}
        <ARShoe config={config} placed={placed} position={position} />
      </Canvas>

      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-5 border border-white/20">
          <div className="text-center">
            <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {placed ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                )}
              </svg>
            </div>
            <p className="text-base font-bold text-white mb-1">
              {placed ? '鞋子已放置成功！' : '点击圆环放置鞋子'}
            </p>
            <p className="text-xs text-white/70">
              {placed ? '在支持WebXR的设备上可以体验真实的AR效果' : '在移动设备上可以体验真实的增强现实'}
            </p>
          </div>

          {placed && (
            <button
              onClick={() => setPlaced(false)}
              className="mt-4 w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:from-blue-600 hover:to-purple-700 transition-all shadow-md shadow-blue-500/30"
            >
              重新放置
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function isARSupported(): boolean {
  return 'xr' in navigator && navigator.xr !== undefined;
}
