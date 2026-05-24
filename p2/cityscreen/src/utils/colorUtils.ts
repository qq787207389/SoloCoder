import * as THREE from 'three';
import type { LayerType, BuildingData } from '../types';

const BUILDING_TYPE_COLORS: Record<BuildingData['type'], number> = {
  residential: 0x4a90d9,
  commercial: 0xe74c3c,
  industrial: 0x95a5a6,
  public: 0x2ecc71,
};

export function getBuildingColor(
  building: BuildingData,
  activeLayer: LayerType
): THREE.Color {
  const color = new THREE.Color();

  switch (activeLayer) {
    case 'energy':
      const energyIntensity = Math.min(building.energyConsumption / 200, 1);
      color.setHSL(0.6 - energyIntensity * 0.6, 0.8, 0.4 + energyIntensity * 0.2);
      break;

    case 'traffic':
      color.setHex(BUILDING_TYPE_COLORS[building.type]);
      break;

    case 'environment':
      color.setHex(0x3498db);
      break;

    case 'safety':
      color.setHex(0x9b59b6);
      break;

    default:
      color.setHex(BUILDING_TYPE_COLORS[building.type]);
  }

  return color;
}

export function getEnergyColor(value: number): string {
  const normalized = Math.min(value / 200, 1);
  const hue = 120 - normalized * 120;
  return `hsl(${hue}, 70%, 50%)`;
}

export function getAirQualityColor(aqi: number): string {
  if (aqi < 50) return '#2ecc71';
  if (aqi < 100) return '#f1c40f';
  if (aqi < 150) return '#e67e22';
  return '#e74c3c';
}

export function getTrafficColor(congestion: number): string {
  const normalized = congestion / 100;
  const hue = 120 - normalized * 120;
  return `hsl(${hue}, 70%, 50%)`;
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'low':
      return '#f1c40f';
    case 'medium':
      return '#e67e22';
    case 'high':
      return '#e74c3c';
    default:
      return '#95a5a6';
  }
}
