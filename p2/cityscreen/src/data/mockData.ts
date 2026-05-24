import type {
  BuildingData,
  DistrictData,
  TrafficData,
  SafetyEvent,
  AirQualityData,
  EnergyData,
} from '../types';

const DISTRICT_CONFIGS = [
  { id: 'district-1', name: '中央商务区', minX: -40, maxX: 0, minZ: -40, maxZ: 0 },
  { id: 'district-2', name: '科技园区', minX: 0, maxX: 40, minZ: -40, maxZ: 0 },
  { id: 'district-3', name: '住宅区', minX: -40, maxX: 0, minZ: 0, maxZ: 40 },
  { id: 'district-4', name: '工业区', minX: 0, maxX: 40, minZ: 0, maxZ: 40 },
];

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateBuildings(): BuildingData[] {
  const buildings: BuildingData[] = [];
  let buildingIndex = 0;

  DISTRICT_CONFIGS.forEach((district) => {
    const width = district.maxX - district.minX;
    const depth = district.maxZ - district.minZ;
    const gridSize = 8;
    const cols = Math.floor(width / gridSize);
    const rows = Math.floor(depth / gridSize);

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const seed = buildingIndex * 12345;
        const rand1 = seededRandom(seed);
        const rand2 = seededRandom(seed + 1);
        const rand3 = seededRandom(seed + 2);

        if (rand1 < 0.3) {
          buildingIndex++;
          continue;
        }

        const x = district.minX + (i + 0.5) * gridSize + (rand1 - 0.5) * 2;
        const z = district.minZ + (j + 0.5) * gridSize + (rand2 - 0.5) * 2;

        let baseHeight: number;
        let type: BuildingData['type'];

        if (district.id === 'district-1') {
          baseHeight = 20 + rand1 * 60;
          type = rand2 > 0.3 ? 'commercial' : 'public';
        } else if (district.id === 'district-2') {
          baseHeight = 15 + rand1 * 40;
          type = rand2 > 0.5 ? 'commercial' : 'public';
        } else if (district.id === 'district-3') {
          baseHeight = 10 + rand1 * 25;
          type = 'residential';
        } else {
          baseHeight = 8 + rand1 * 20;
          type = 'industrial';
        }

        const buildingWidth = 3 + rand1 * 4;
        const buildingDepth = 3 + rand2 * 4;

        buildings.push({
          id: `building-${buildingIndex}`,
          name: `${district.name}建筑${buildingIndex + 1}`,
          districtId: district.id,
          position: { x, z },
          baseHeight,
          width: buildingWidth,
          depth: buildingDepth,
          energyConsumption: 50 + rand3 * 150,
          population: Math.floor(rand3 * 500),
          type,
        });

        buildingIndex++;
      }
    }
  });

  return buildings;
}

function generateDistricts(): DistrictData[] {
  return DISTRICT_CONFIGS.map((config) => ({
    id: config.id,
    name: config.name,
    bounds: {
      minX: config.minX,
      maxX: config.maxX,
      minZ: config.minZ,
      maxZ: config.maxZ,
    },
    center: {
      x: (config.minX + config.maxX) / 2,
      z: (config.minZ + config.maxZ) / 2,
    },
    airQuality: 30 + Math.random() * 40,
    trafficFlow: 30 + Math.random() * 50,
    energyUsage: 40 + Math.random() * 40,
    safetyIndex: 70 + Math.random() * 30,
  }));
}

function generateTraffic(): TrafficData[] {
  const traffic: TrafficData[] = [];
  const roads = [
    { startX: -50, startZ: 0, endX: 50, endZ: 0 },
    { startX: 0, startZ: -50, endX: 0, endZ: 50 },
    { startX: -25, startZ: -50, endX: -25, endZ: 50 },
    { startX: 25, startZ: -50, endX: 25, endZ: 50 },
    { startX: -50, startZ: -25, endX: 50, endZ: -25 },
    { startX: -50, startZ: 25, endX: 50, endZ: 25 },
  ];

  roads.forEach((road, roadIndex) => {
    const numVehicles = 8 + Math.floor(Math.random() * 12);
    for (let i = 0; i < numVehicles; i++) {
      const t = Math.random();
      const x = road.startX + (road.endX - road.startX) * t;
      const z = road.startZ + (road.endZ - road.startZ) * t;
      const dx = road.endX - road.startX;
      const dz = road.endZ - road.startZ;
      const len = Math.sqrt(dx * dx + dz * dz);

      traffic.push({
        id: `traffic-${roadIndex}-${i}`,
        roadId: `road-${roadIndex}`,
        position: { x, z },
        direction: { x: dx / len, z: dz / len },
        speed: 20 + Math.random() * 40,
        volume: 50 + Math.random() * 100,
        congestion: Math.random() * 100,
      });
    }
  });

  return traffic;
}

function generateAirQuality(): AirQualityData[] {
  return DISTRICT_CONFIGS.map((config) => {
    const aqi =
      config.id === 'district-4'
        ? 80 + Math.random() * 70
        : 20 + Math.random() * 60;
    const level: AirQualityData['level'] =
      aqi < 50 ? 'good' : aqi < 100 ? 'moderate' : aqi < 150 ? 'unhealthy' : 'hazardous';

    return {
      districtId: config.id,
      aqi,
      pm25: aqi * 0.5 + Math.random() * 20,
      pm10: aqi * 0.8 + Math.random() * 30,
      no2: Math.random() * 50,
      so2: Math.random() * 30,
      level,
    };
  });
}

function generateEnergy(): EnergyData[] {
  return DISTRICT_CONFIGS.map((config) => ({
    districtId: config.id,
    usage: config.id === 'district-4' ? 800 + Math.random() * 400 : 300 + Math.random() * 500,
    production: 200 + Math.random() * 300,
    gridLoad: 50 + Math.random() * 30,
    renewablePercentage: 10 + Math.random() * 40,
  }));
}

function generateSafetyEvent(): SafetyEvent {
  const types: SafetyEvent['type'][] = ['accident', 'fire', 'crime', 'emergency'];
  const severities: SafetyEvent['severity'][] = ['low', 'medium', 'high'];
  const district = DISTRICT_CONFIGS[Math.floor(Math.random() * DISTRICT_CONFIGS.length)];

  return {
    id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: types[Math.floor(Math.random() * types.length)],
    severity: severities[Math.floor(Math.random() * severities.length)],
    position: {
      x: district.minX + Math.random() * (district.maxX - district.minX),
      z: district.minZ + Math.random() * (district.maxZ - district.minZ),
    },
    districtId: district.id,
    timestamp: Date.now(),
    description: getEventDescription(types[Math.floor(Math.random() * types.length)]),
    status: 'active',
  };
}

function getEventDescription(type: SafetyEvent['type']): string {
  const descriptions: Record<SafetyEvent['type'], string[]> = {
    accident: ['交通事故', '车辆碰撞', '道路拥堵'],
    fire: ['火灾警报', '烟雾检测', '消防响应'],
    crime: ['治安事件', '可疑人员', '盗窃报告'],
    emergency: ['紧急救援', '医疗急救', '公共应急'],
  };
  const list = descriptions[type];
  return list[Math.floor(Math.random() * list.length)];
}

export const mockData = {
  generateBuildings,
  generateDistricts,
  generateTraffic,
  generateAirQuality,
  generateEnergy,
  generateSafetyEvent,
};
