export interface BuildingData {
  id: string;
  name: string;
  districtId: string;
  position: { x: number; z: number };
  baseHeight: number;
  width: number;
  depth: number;
  energyConsumption: number;
  population: number;
  type: 'residential' | 'commercial' | 'industrial' | 'public';
}

export interface DistrictData {
  id: string;
  name: string;
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  center: { x: number; z: number };
  airQuality: number;
  trafficFlow: number;
  energyUsage: number;
  safetyIndex: number;
}

export interface TrafficData {
  id: string;
  roadId: string;
  position: { x: number; z: number };
  direction: { x: number; z: number };
  speed: number;
  volume: number;
  congestion: number;
}

export interface SafetyEvent {
  id: string;
  type: 'accident' | 'fire' | 'crime' | 'emergency';
  severity: 'low' | 'medium' | 'high';
  position: { x: number; z: number };
  districtId: string;
  timestamp: number;
  description: string;
  status: 'active' | 'resolved';
}

export interface AirQualityData {
  districtId: string;
  aqi: number;
  pm25: number;
  pm10: number;
  no2: number;
  so2: number;
  level: 'good' | 'moderate' | 'unhealthy' | 'hazardous';
}

export interface EnergyData {
  districtId: string;
  usage: number;
  production: number;
  gridLoad: number;
  renewablePercentage: number;
}

export type LayerType = 'traffic' | 'environment' | 'energy' | 'safety' | 'all';

export interface CityState {
  buildings: BuildingData[];
  districts: DistrictData[];
  traffic: TrafficData[];
  safetyEvents: SafetyEvent[];
  airQuality: AirQualityData[];
  energy: EnergyData[];
  selectedBuildingId: string | null;
  selectedDistrictId: string | null;
  activeLayer: LayerType;
  cameraLevel: 'city' | 'district' | 'street';
  timeOfDay: number;
  isPaused: boolean;
}

export interface FloatingPanel {
  id: string;
  buildingId: string;
  position: { x: number; y: number; z: number };
  visible: boolean;
}

export interface ParticleData {
  id: string;
  type: 'traffic' | 'data';
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  color: string;
  life: number;
  maxLife: number;
}
