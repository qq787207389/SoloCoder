import { TrapConfig, TrapType } from '../../types/game';

export const TRAP_CONFIGS: Record<TrapType, TrapConfig> = {
  spike: {
    name: '尖刺陷阱',
    damage: 30,
    cooldown: 5,
    cost: 30,
    color: '#888888',
  },
  gas: {
    name: '毒气喷口',
    damage: 10,
    cooldown: 10,
    cost: 50,
    color: '#44ff44',
    effect: {
      type: 'poison',
      duration: 5,
      damagePerSecond: 10,
    },
  },
  boulder: {
    name: '落石机关',
    damage: 80,
    cooldown: 15,
    cost: 80,
    color: '#886644',
    effect: {
      type: 'stunned',
      duration: 2,
      damagePerSecond: 0,
    },
  },
  pressure_plate: {
    name: '压力板',
    damage: 0,
    cooldown: 3,
    cost: 20,
    color: '#aaaaaa',
  },
};
