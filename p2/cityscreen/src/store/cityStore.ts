import { create } from 'zustand';
import type {
  CityState,
  BuildingData,
  DistrictData,
  TrafficData,
  SafetyEvent,
  AirQualityData,
  EnergyData,
  LayerType,
} from '../types';

interface CityStore extends CityState {
  setSelectedBuilding: (id: string | null) => void;
  setSelectedDistrict: (id: string | null) => void;
  setActiveLayer: (layer: LayerType) => void;
  setCameraLevel: (level: 'city' | 'district' | 'street') => void;
  togglePause: () => void;
  updateTimeOfDay: (time: number) => void;
  updateBuildings: (buildings: BuildingData[]) => void;
  updateDistricts: (districts: DistrictData[]) => void;
  updateTraffic: (traffic: TrafficData[]) => void;
  addSafetyEvent: (event: SafetyEvent) => void;
  updateSafetyEvent: (id: string, updates: Partial<SafetyEvent>) => void;
  updateAirQuality: (airQuality: AirQualityData[]) => void;
  updateEnergy: (energy: EnergyData[]) => void;
  updateBuildingEnergy: (buildingId: string, energy: number) => void;
}

export const useCityStore = create<CityStore>((set) => ({
  buildings: [],
  districts: [],
  traffic: [],
  safetyEvents: [],
  airQuality: [],
  energy: [],
  selectedBuildingId: null,
  selectedDistrictId: null,
  activeLayer: 'all',
  cameraLevel: 'city',
  timeOfDay: 12,
  isPaused: false,

  setSelectedBuilding: (id) => set({ selectedBuildingId: id }),
  setSelectedDistrict: (id) => set({ selectedDistrictId: id }),
  setActiveLayer: (layer) => set({ activeLayer: layer }),
  setCameraLevel: (level) => set({ cameraLevel: level }),
  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
  updateTimeOfDay: (time) => set({ timeOfDay: time }),

  updateBuildings: (buildings) => set({ buildings }),
  updateDistricts: (districts) => set({ districts }),
  updateTraffic: (traffic) => set({ traffic }),

  addSafetyEvent: (event) =>
    set((state) => ({
      safetyEvents: [...state.safetyEvents, event],
    })),

  updateSafetyEvent: (id, updates) =>
    set((state) => ({
      safetyEvents: state.safetyEvents.map((e) =>
        e.id === id ? { ...e, ...updates } : e
      ),
    })),

  updateAirQuality: (airQuality) => set({ airQuality }),
  updateEnergy: (energy) => set({ energy }),

  updateBuildingEnergy: (buildingId, energy) =>
    set((state) => ({
      buildings: state.buildings.map((b) =>
        b.id === buildingId ? { ...b, energyConsumption: energy } : b
      ),
    })),
}));
