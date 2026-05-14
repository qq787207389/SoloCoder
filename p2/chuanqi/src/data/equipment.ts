import { ItemType } from '../types'

export interface EquipmentTemplate {
  id: string
  name: string
  type: ItemType
  level: number
  baseStats: Record<string, number>
  setId?: string
}

export const equipmentTemplates: EquipmentTemplate[] = [
  { id: 'wood_sword', name: '木剑', type: 'weapon', level: 1, baseStats: { attack: 5 } },
  { id: 'iron_sword', name: '铁剑', type: 'weapon', level: 10, baseStats: { attack: 15 } },
  { id: 'bronze_axe', name: '青铜斧', type: 'weapon', level: 20, baseStats: { attack: 25 } },
  { id: 'dragon_sword', name: '裁决之杖', type: 'weapon', level: 30, baseStats: { attack: 40 } },
  { id: 'dragon_blade', name: '屠龙刀', type: 'weapon', level: 40, baseStats: { attack: 60 } },
  
  { id: 'wand', name: '魔杖', type: 'weapon', level: 10, baseStats: { magicAttack: 12 } },
  { id: 'silver_ staff', name: '银蛇剑', type: 'weapon', level: 20, baseStats: { magicAttack: 20 } },
  { id: 'bone_ staff', name: '骨玉权杖', type: 'weapon', level: 30, baseStats: { magicAttack: 35 } },
  { id: 'blood_drink', name: '血饮', type: 'weapon', level: 40, baseStats: { magicAttack: 55 } },
  
  { id: 'cloth', name: '布衣', type: 'armor', level: 1, baseStats: { defense: 3, maxHp: 20 } },
  { id: 'leather', name: '皮甲', type: 'armor', level: 10, baseStats: { defense: 10, maxHp: 50 } },
  { id: 'chainmail', name: '锁子甲', type: 'armor', level: 20, baseStats: { defense: 18, maxHp: 100 } },
  { id: 'heavy_armor', name: '重盔甲', type: 'armor', level: 30, baseStats: { defense: 30, maxHp: 180 } },
  { id: 'dragon_armor', name: '天魔神甲', type: 'armor', level: 40, baseStats: { defense: 50, maxHp: 300 } },
  
  { id: 'iron_helmet', name: '铁头盔', type: 'helmet', level: 10, baseStats: { defense: 5, maxHp: 20 } },
  { id: 'black_helmet', name: '黑铁头盔', type: 'helmet', level: 25, baseStats: { defense: 15, maxHp: 60 } },
  { id: 'god_helmet', name: '圣战头盔', type: 'helmet', level: 40, baseStats: { defense: 25, maxHp: 120 } },
  
  { id: 'copper_necklace', name: '铜项链', type: 'necklace', level: 5, baseStats: { attack: 3 } },
  { id: 'blue_necklace', name: '蓝翡翠项链', type: 'necklace', level: 20, baseStats: { attack: 10, accuracy: 3 } },
  { id: 'holy_necklace', name: '圣战项链', type: 'necklace', level: 40, baseStats: { attack: 20, accuracy: 8 } },
  
  { id: 'iron_ring', name: '铁戒指', type: 'ring', level: 5, baseStats: { attack: 2, defense: 1 } },
  { id: 'dragon_ring', name: '龙戒', type: 'ring', level: 25, baseStats: { attack: 12, defense: 5 } },
  { id: 'holy_ring', name: '圣战戒指', type: 'ring', level: 40, baseStats: { attack: 22, defense: 10 } },
  
  { id: 'leather_bracelet', name: '皮手套', type: 'bracelet', level: 5, baseStats: { defense: 2, dodge: 1 } },
  { id: 'gold_bracelet', name: '金手镯', type: 'bracelet', level: 20, baseStats: { defense: 8, dodge: 3 } },
  { id: 'holy_bracelet', name: '圣战手镯', type: 'bracelet', level: 40, baseStats: { defense: 18, dodge: 6 } },
  
  { id: 'cloth_shoes', name: '布鞋', type: 'shoes', level: 1, baseStats: { dodge: 2 } },
  { id: 'leather_shoes', name: '皮靴', type: 'shoes', level: 15, baseStats: { dodge: 5, speed: 0.1 } },
  { id: 'war_shoes', name: '战争之靴', type: 'shoes', level: 35, baseStats: { dodge: 12, speed: 0.2 } }
]

export const slotNames: Record<string, string> = {
  weapon: '武器',
  armor: '衣服',
  helmet: '头盔',
  necklace: '项链',
  ring_left: '戒指(左)',
  ring_right: '戒指(右)',
  bracelet_left: '手镯(左)',
  bracelet_right: '手镯(右)',
  shoes: '鞋子'
}
