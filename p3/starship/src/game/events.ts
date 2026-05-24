import type { Planet, GameEvent, GoodType, EventType } from '../types';
import { GOODS } from '../data/goods';

const PLANET_EVENTS: { type: EventType; name: string; description: string; demandMultiplier?: number; supplyMultiplier?: number; duration: number }[] = [
  { type: 'storm', name: '风暴灾害', description: '严重的风暴影响了农业生产', supplyMultiplier: 0.3, duration: 5 },
  { type: 'festival', name: '科技博览会', description: '大量游客涌入，物资需求激增', demandMultiplier: 2, duration: 4 },
  { type: 'shortage', name: '物资短缺', description: '供应链断裂，物资严重不足', supplyMultiplier: 0.4, duration: 6 },
  { type: 'surplus', name: '丰收季节', description: '产量大增，市场供应充足', supplyMultiplier: 2, duration: 5 }
];

export function generatePlanetEvent(planet: Planet): boolean {
  if (Math.random() > 0.15) return false;
  if (planet.activeEvents.length >= 2) return false;
  const eventTemplate = PLANET_EVENTS[Math.floor(Math.random() * PLANET_EVENTS.length)];
  const goodTypes = Object.keys(GOODS) as GoodType[];
  const affectedGood = goodTypes[Math.floor(Math.random() * goodTypes.length)];
  const event = {
    id: `event-${Date.now()}`,
    type: eventTemplate.type,
    name: eventTemplate.name,
    description: eventTemplate.description,
    affectedGood,
    demandMultiplier: eventTemplate.demandMultiplier,
    supplyMultiplier: eventTemplate.supplyMultiplier,
    duration: eventTemplate.duration,
    remainingDays: eventTemplate.duration
  };
  planet.activeEvents.push(event);
  return true;
}

export function generateTravelEvent(): GameEvent | null {
  const roll = Math.random();
  if (roll < 0.15) {
    return {
      id: `event-${Date.now()}`,
      type: 'pirate',
      title: '⚠️ 海盗来袭！',
      description: '一群海盗截住了你的航线，要求你交出货物和信用点。',
      choices: []
    };
  } else if (roll < 0.25) {
    return {
      id: `event-${Date.now()}`,
      type: 'distress',
      title: '📡 求救信号',
      description: '附近有一艘货船发出求救信号，看起来遭遇了机械故障。',
      choices: []
    };
  } else if (roll < 0.35) {
    return {
      id: `event-${Date.now()}`,
      type: 'inspection',
      title: '🛃 海关检查',
      description: '一艘巡逻舰要求登船检查，他们正在搜捕走私犯。',
      choices: []
    };
  }
  return null;
}
