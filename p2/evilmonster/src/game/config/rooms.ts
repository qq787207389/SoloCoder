import { RoomType } from '../../types/game';

export interface RoomConfig {
  name: string;
  cost: number;
  width: number;
  height: number;
  color: string;
  description: string;
}

export const ROOM_CONFIGS: Record<RoomType, RoomConfig> = {
  training: {
    name: '训练室',
    cost: 100,
    width: 3,
    height: 3,
    color: '#ff8844',
    description: '提升小恶魔等级',
  },
  alchemy: {
    name: '炼金房',
    cost: 150,
    width: 3,
    height: 3,
    color: '#44ff88',
    description: '生产药水',
  },
  hatchery: {
    name: '孵化室',
    cost: 200,
    width: 4,
    height: 3,
    color: '#ff44ff',
    description: '召唤新怪物种类',
  },
  treasury: {
    name: '宝库',
    cost: 80,
    width: 3,
    height: 3,
    color: '#ffd700',
    description: '存储金币',
  },
  lair: {
    name: '巢穴',
    cost: 60,
    width: 2,
    height: 2,
    color: '#884444',
    description: '怪物休息恢复心情',
  },
};
