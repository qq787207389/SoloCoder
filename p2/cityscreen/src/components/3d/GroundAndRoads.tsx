import { useMemo } from 'react';
import * as THREE from 'three';

export function GroundAndRoads() {
  const roadData = useMemo(() => {
    return [
      { x1: -50, z1: 0, x2: 50, z2: 0, width: 4 },
      { x1: 0, z1: -50, x2: 0, z2: 50, width: 4 },
      { x1: -25, z1: -50, x2: -25, z2: 50, width: 3 },
      { x1: 25, z1: -50, x2: 25, z2: 50, width: 3 },
      { x1: -50, z1: -25, x2: 50, z2: -25, width: 3 },
      { x1: -50, z1: 25, x2: 50, z2: 25, width: 3 },
    ];
  }, []);

  const districtData = useMemo(() => {
    return [
      { minX: -40, maxX: 0, minZ: -40, maxZ: 0, color: 0x4a90d9 },
      { minX: 0, maxX: 40, minZ: -40, maxZ: 0, color: 0x2ecc71 },
      { minX: -40, maxX: 0, minZ: 0, maxZ: 40, color: 0xf39c12 },
      { minX: 0, maxX: 40, minZ: 0, maxZ: 40, color: 0xe74c3c },
    ];
  }, []);

  const roads = useMemo(() => {
    return roadData.map((road, index) => {
      const dx = road.x2 - road.x1;
      const dz = road.z2 - road.z1;
      const length = Math.sqrt(dx * dx + dz * dz);
      const angle = Math.atan2(dz, dx);
      const posX = (road.x1 + road.x2) / 2;
      const posZ = (road.z1 + road.z2) / 2;

      return (
        <mesh
          key={index}
          position={[posX, 0.02, posZ]}
          rotation={[-Math.PI / 2, angle, 0]}
        >
          <planeGeometry args={[length, road.width]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
      );
    });
  }, [roadData]);

  const districts = useMemo(() => {
    return districtData.map((d, i) => {
      const centerX = (d.minX + d.maxX) / 2;
      const centerZ = (d.minZ + d.maxZ) / 2;
      const sizeX = d.maxX - d.minX;
      const sizeZ = d.maxZ - d.minZ;

      return (
        <group key={i} position={[centerX, 0.01, centerZ]}>
          <mesh>
            <boxGeometry args={[sizeX, 0.1, sizeZ]} />
            <meshBasicMaterial color={d.color} transparent opacity={0.1} />
          </mesh>
          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(sizeX, 0.1, sizeZ)]} />
            <lineBasicMaterial color={d.color} transparent opacity={0.5} />
          </lineSegments>
        </group>
      );
    });
  }, [districtData]);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>

      {districts}
      {roads}

      <gridHelper args={[100, 50, '#2a2a4a', '#1f1f3a']} position={[0, 0.03, 0]} />
    </group>
  );
}
