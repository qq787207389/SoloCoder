import { Monster, BaseStats } from '../types'

interface MonsterTemplate {
  name: string
  level: number
  stats: Partial<BaseStats>
  isBoss: boolean
  dropTable: string
}

export const monsterTemplates: MonsterTemplate[] = [
  {
    name: '稻草人',
    level: 1,
    stats: { hp: 100, maxHp: 100, attack: 10, defense: 5 },
    isBoss: false,
    dropTable: 'common'
  },
  {
    name: '钉耙猫',
    level: 3,
    stats: { hp: 150, maxHp: 150, attack: 15, defense: 8 },
    isBoss: false,
    dropTable: 'common'
  },
  {
    name: '多钩猫',
    level: 5,
    stats: { hp: 200, maxHp: 200, attack: 20, defense: 10 },
    isBoss: false,
    dropTable: 'uncommon'
  },
  {
    name: '半兽人',
    level: 10,
    stats: { hp: 400, maxHp: 400, attack: 35, defense: 20 },
    isBoss: false,
    dropTable: 'uncommon'
  },
  {
    name: '骷髅战士',
    level: 15,
    stats: { hp: 600, maxHp: 600, attack: 50, defense: 30 },
    isBoss: false,
    dropTable: 'rare'
  },
  {
    name: '僵尸',
    level: 20,
    stats: { hp: 800, maxHp: 800, attack: 65, defense: 40 },
    isBoss: false,
    dropTable: 'rare'
  },
  {
    name: '沃玛教主',
    level: 35,
    stats: { hp: 5000, maxHp: 5000, attack: 150, defense: 80 },
    isBoss: true,
    dropTable: 'boss'
  },
  {
    name: '祖玛教主',
    level: 45,
    stats: { hp: 8000, maxHp: 8000, attack: 200, defense: 120 },
    isBoss: true,
    dropTable: 'boss'
  },
  {
    name: '赤月恶魔',
    level: 55,
    stats: { hp: 12000, maxHp: 12000, attack: 300, defense: 150 },
    isBoss: true,
    dropTable: 'boss'
  }
]

export function createMonster(template: MonsterTemplate, x: number, y: number): Monster {
  const baseStats: BaseStats = {
    hp: template.stats.hp || 100,
    maxHp: template.stats.maxHp || 100,
    mp: template.stats.mp || 0,
    maxMp: template.stats.maxMp || 0,
    attack: template.stats.attack || 10,
    defense: template.stats.defense || 5,
    magicAttack: template.stats.magicAttack || 0,
    magicDefense: template.stats.magicDefense || 5,
    accuracy: template.stats.accuracy || 10,
    dodge: template.stats.dodge || 5,
    speed: template.stats.speed || 1.0
  }

  return {
    id: `monster_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: template.name,
    level: template.level,
    position: { x, y },
    stats: baseStats,
    skills: [{
      id: 'monster_attack',
      name: '攻击',
      damage: 1.0,
      cooldown: 1500,
      currentCooldown: 0,
      castTime: 200,
      range: 1,
      mpCost: 0
    }],
    isBoss: template.isBoss,
    aiState: 'idle',
    targetId: null,
    attackCooldown: 0,
    dropTable: template.dropTable
  }
}
