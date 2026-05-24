import { useCityStore } from '../store/cityStore';
import { mockData } from '../data/mockData';

export class DataService {
  private intervalId: number | null = null;
  private eventIntervalId: number | null = null;

  start() {
    this.initializeData();
    this.startDataUpdates();
    this.startSafetyEvents();
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.eventIntervalId) {
      clearInterval(this.eventIntervalId);
      this.eventIntervalId = null;
    }
  }

  private initializeData() {
    const buildings = mockData.generateBuildings();
    const districts = mockData.generateDistricts();
    const traffic = mockData.generateTraffic();
    const airQuality = mockData.generateAirQuality();
    const energy = mockData.generateEnergy();

    useCityStore.getState().updateBuildings(buildings);
    useCityStore.getState().updateDistricts(districts);
    useCityStore.getState().updateTraffic(traffic);
    useCityStore.getState().updateAirQuality(airQuality);
    useCityStore.getState().updateEnergy(energy);
  }

  private startDataUpdates() {
    this.intervalId = window.setInterval(() => {
      const state = useCityStore.getState();
      if (state.isPaused) return;

      this.updateTraffic();
      this.updateAirQuality();
      this.updateEnergy();
      this.updateBuildingEnergy();
      this.updateTime();
    }, 2000);
  }

  private startSafetyEvents() {
    this.eventIntervalId = window.setInterval(() => {
      const state = useCityStore.getState();
      if (state.isPaused) return;

      if (Math.random() < 0.3) {
        const event = mockData.generateSafetyEvent();
        useCityStore.getState().addSafetyEvent(event);

        setTimeout(() => {
          useCityStore.getState().updateSafetyEvent(event.id, { status: 'resolved' });
        }, 10000 + Math.random() * 10000);
      }

      const oldEvents = state.safetyEvents.filter(
        (e) => Date.now() - e.timestamp > 60000
      );
      if (oldEvents.length > 0) {
        useCityStore.setState((prev) => ({
          safetyEvents: prev.safetyEvents.filter(
            (e) => Date.now() - e.timestamp <= 60000
          ),
        }));
      }
    }, 5000);
  }

  private updateTraffic() {
    const state = useCityStore.getState();
    const updatedTraffic = state.traffic.map((t) => {
      const speedFactor = 0.05;
      const newX = t.position.x + t.direction.x * t.speed * speedFactor;
      const newZ = t.position.z + t.direction.z * t.speed * speedFactor;

      let finalX = newX;
      let finalZ = newZ;
      let newDirX = t.direction.x;
      let newDirZ = t.direction.z;

      if (newX > 50 || newX < -50) {
        newDirX = -t.direction.x;
        finalX = Math.max(-50, Math.min(50, newX));
      }
      if (newZ > 50 || newZ < -50) {
        newDirZ = -t.direction.z;
        finalZ = Math.max(-50, Math.min(50, newZ));
      }

      return {
        ...t,
        position: { x: finalX, z: finalZ },
        direction: { x: newDirX, z: newDirZ },
        congestion: Math.max(0, Math.min(100, t.congestion + (Math.random() - 0.5) * 10)),
      };
    });

    useCityStore.getState().updateTraffic(updatedTraffic);
  }

  private updateAirQuality() {
    const state = useCityStore.getState();
    const updatedAQ = state.airQuality.map((aq) => {
      const newAqi = Math.max(10, Math.min(200, aq.aqi + (Math.random() - 0.5) * 10));
      const level = (
        newAqi < 50 ? 'good' : newAqi < 100 ? 'moderate' : newAqi < 150 ? 'unhealthy' : 'hazardous'
      ) as 'good' | 'moderate' | 'unhealthy' | 'hazardous';

      return {
        ...aq,
        aqi: newAqi,
        pm25: newAqi * 0.5 + Math.random() * 20,
        level,
      };
    });

    useCityStore.getState().updateAirQuality(updatedAQ);
  }

  private updateEnergy() {
    const state = useCityStore.getState();
    const updatedEnergy = state.energy.map((e) => ({
      ...e,
      usage: Math.max(100, e.usage + (Math.random() - 0.5) * 50),
      gridLoad: Math.max(20, Math.min(100, e.gridLoad + (Math.random() - 0.5) * 5)),
    }));

    useCityStore.getState().updateEnergy(updatedEnergy);
  }

  private updateBuildingEnergy() {
    const state = useCityStore.getState();
    const buildings = state.buildings;
    if (buildings.length === 0) return;

    const randomIndex = Math.floor(Math.random() * buildings.length);
    const building = buildings[randomIndex];
    const newEnergy = Math.max(
      20,
      Math.min(200, building.energyConsumption + (Math.random() - 0.5) * 20)
    );

    useCityStore.getState().updateBuildingEnergy(building.id, newEnergy);
  }

  private updateTime() {
    const state = useCityStore.getState();
    const newTime = (state.timeOfDay + 0.05) % 24;
    useCityStore.getState().updateTimeOfDay(newTime);
  }
}

export const dataService = new DataService();
