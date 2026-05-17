import { Enemy } from '../types';

export const ENEMIES: Record<string, Enemy> = {
  slime: {
    id: 'slime',
    name: '史莱姆',
    hp: 20,
    maxHp: 20,
    attack: 5,
    defense: 2,
    speed: 3,
    exp: 10,
    gold: 5,
    color: '#44ff44',
    skills: []
  },
  bat: {
    id: 'bat',
    name: '蝙蝠',
    hp: 15,
    maxHp: 15,
    attack: 7,
    defense: 1,
    speed: 8,
    exp: 12,
    gold: 8,
    color: '#884488',
    skills: []
  },
  goblin: {
    id: 'goblin',
    name: '哥布林',
    hp: 35,
    maxHp: 35,
    attack: 10,
    defense: 3,
    speed: 5,
    exp: 20,
    gold: 15,
    color: '#44aa44',
    skills: [
      { name: '重击', damage: 15, hpThreshold: 0.5 }
    ]
  },
  skeleton: {
    id: 'skeleton',
    name: '骷髅兵',
    hp: 45,
    maxHp: 45,
    attack: 12,
    defense: 5,
    speed: 4,
    exp: 30,
    gold: 25,
    color: '#eeeeee',
    skills: [
      { name: '骨刃斩', damage: 18, hpThreshold: 0.6 }
    ]
  },
  wolf: {
    id: 'wolf',
    name: '野狼',
    hp: 40,
    maxHp: 40,
    attack: 14,
    defense: 4,
    speed: 9,
    exp: 28,
    gold: 20,
    color: '#888888',
    skills: []
  },
  caveBoss: {
    id: 'caveBoss',
    name: '洞窟巨兽',
    hp: 120,
    maxHp: 120,
    attack: 20,
    defense: 10,
    speed: 6,
    exp: 150,
    gold: 100,
    color: '#ff4444',
    skills: [
      { name: '狂暴冲击', damage: 30, hpThreshold: 0.8 },
      { name: '咆哮', damage: 20, hpThreshold: 0.4 }
    ]
  },
  demonLord: {
    id: 'demonLord',
    name: '魔王',
    hp: 300,
    maxHp: 300,
    attack: 35,
    defense: 20,
    speed: 10,
    exp: 1000,
    gold: 500,
    color: '#aa0000',
    skills: [
      { name: '暗影打击', damage: 45, hpThreshold: 0.9 },
      { name: '地狱火焰', damage: 60, hpThreshold: 0.6 },
      { name: '毁灭', damage: 80, hpThreshold: 0.3 }
    ]
  }
};
