import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useCityStore } from '../../store/cityStore';
import { InstancedBuildings } from './InstancedBuildings';
import { GroundAndRoads } from './GroundAndRoads';
import { TrafficParticles } from './TrafficParticles';
import { SafetyEventMarkers } from './SafetyEventMarkers';
import { EnvironmentSetup } from './EnvironmentSetup';
import { BuildingSelector } from './BuildingSelector';

export function CityScene() {
  const buildings = useCityStore((state) => state.buildings);
  const traffic = useCityStore((state) => state.traffic);
  const safetyEvents = useCityStore((state) => state.safetyEvents);
  const airQuality = useCityStore((state) => state.airQuality);
  const selectedBuildingId = useCityStore((state) => state.selectedBuildingId);
  const activeLayer = useCityStore((state) => state.activeLayer);
  const timeOfDay = useCityStore((state) => state.timeOfDay);
  const setSelectedBuilding = useCityStore((state) => state.setSelectedBuilding);
  const setCameraLevel = useCityStore((state) => state.setCameraLevel);

  const selectedBuilding = useMemo(() => {
    return buildings.find((b) => b.id === selectedBuildingId);
  }, [buildings, selectedBuildingId]);

  const handleBuildingClick = (buildingId: string | null) => {
    setSelectedBuilding(buildingId);
    if (buildingId) {
      setCameraLevel('street');
    }
  };

  return (
    <Canvas
      shadows
      camera={{ position: [80, 80, 80], fov: 50 }}
      gl={{ antialias: true, alpha: false }}
      dpr={[1, 2]}
    >
      <color attach="background" args={['#0a0a1a']} />

      <EnvironmentSetup timeOfDay={timeOfDay} airQuality={airQuality} />

      <GroundAndRoads />

      <InstancedBuildings
        buildings={buildings}
        activeLayer={activeLayer}
        selectedBuildingId={selectedBuildingId}
        safetyEvents={safetyEvents}
        onBuildingClick={handleBuildingClick}
      />

      <TrafficParticles traffic={traffic} />

      <SafetyEventMarkers events={safetyEvents} />
      <BuildingSelector building={selectedBuilding} />

      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={20}
        maxDistance={150}
        maxPolarAngle={Math.PI / 2.2}
        minPolarAngle={Math.PI / 6}
      />
    </Canvas>
  );
}
