import { useRef, useMemo, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { BuildingData, LayerType, SafetyEvent } from '../../types';
import { getBuildingColor } from '../../utils/colorUtils';

interface InstancedBuildingsProps {
  buildings: BuildingData[];
  activeLayer: LayerType;
  selectedBuildingId: string | null;
  safetyEvents: SafetyEvent[];
  onBuildingClick: (buildingId: string | null) => void;
}

export function InstancedBuildings({
  buildings,
  activeLayer,
  selectedBuildingId,
  safetyEvents,
  onBuildingClick,
}: InstancedBuildingsProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const { raycaster, camera, gl } = useThree();
  const mouse = useMemo(() => new THREE.Vector2(), []);
  const buildingsRef = useRef(buildings);

  useEffect(() => {
    buildingsRef.current = buildings;
  }, [buildings]);

  const handleCanvasClick = useCallback(
    (event: MouseEvent) => {
      if (!meshRef.current || buildingsRef.current.length === 0) return;

      const rect = gl.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObject(meshRef.current);
      if (intersects.length > 0 && intersects[0].instanceId !== undefined) {
        const instanceId = intersects[0].instanceId;
        if (buildingsRef.current[instanceId]) {
          onBuildingClick(buildingsRef.current[instanceId].id);
          return;
        }
      }
      onBuildingClick(null);
    },
    [camera, gl, mouse, onBuildingClick, raycaster]
  );

  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener('click', handleCanvasClick);
    return () => {
      canvas.removeEventListener('click', handleCanvasClick);
    };
  }, [gl, handleCanvasClick]);

  const buildingEventsMap = useMemo(() => {
    const map = new Map<string, SafetyEvent[]>();
    safetyEvents.forEach((event) => {
      buildings.forEach((building) => {
        const dx = building.position.x - event.position.x;
        const dz = building.position.z - event.position.z;
        if (Math.sqrt(dx * dx + dz * dz) < 10) {
          if (!map.has(building.id)) {
            map.set(building.id, []);
          }
          map.get(building.id)!.push(event);
        }
      });
    });
    return map;
  }, [safetyEvents, buildings]);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.elapsedTime;

    buildings.forEach((building, index) => {
      const color = getBuildingColor(building, activeLayer);
      const events = buildingEventsMap.get(building.id);

      if (events && events.length > 0) {
        const pulse = (Math.sin(time * 4) + 1) / 2;
        color.lerp(new THREE.Color(0xff0000), pulse * 0.5);
      }

      if (building.id === selectedBuildingId) {
        color.multiplyScalar(1.5);
      }

      meshRef.current!.setColorAt(index, color);
    });

    meshRef.current.instanceColor!.needsUpdate = true;
  });

  useEffect(() => {
    if (!meshRef.current) return;

    buildings.forEach((building, index) => {
      dummy.position.set(
        building.position.x,
        building.baseHeight / 2,
        building.position.z
      );
      dummy.scale.set(building.width, building.baseHeight, building.depth);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(index, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [buildings, dummy]);

  if (buildings.length === 0) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, buildings.length]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial roughness={0.7} metalness={0.3} transparent opacity={0.9} />
    </instancedMesh>
  );
}
