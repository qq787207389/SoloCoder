import { Quality } from '../types'

interface DropItem {
  equipmentId: string
  quality: Quality
  chance: number
}

interface DropTable {
  [key: string]: DropItem[]
}

export const dropTables: DropTable = {
  common: [
    { equipmentId: 'wood_sword', quality: 'common', chance: 0.15 },
    { equipmentId: 'cloth', quality: 'common', chance: 0.15 },
    { equipmentId: 'cloth_shoes', quality: 'common', chance: 0.10 },
    { equipmentId: 'iron_ring', quality: 'uncommon', chance: 0.05 },
    { equipmentId: 'copper_necklace', quality: 'uncommon', chance: 0.05 }
  ],
  uncommon: [
    { equipmentId: 'iron_sword', quality: 'uncommon', chance: 0.12 },
    { equipmentId: 'leather', quality: 'uncommon', chance: 0.12 },
    { equipmentId: 'iron_helmet', quality: 'uncommon', chance: 0.08 },
    { equipmentId: 'blue_necklace', quality: 'rare', chance: 0.04 },
    { equipmentId: 'dragon_ring', quality: 'rare', chance: 0.03 }
  ],
  rare: [
    { equipmentId: 'bronze_axe', quality: 'rare', chance: 0.10 },
    { equipmentId: 'chainmail', quality: 'rare', chance: 0.10 },
    { equipmentId: 'black_helmet', quality: 'rare', chance: 0.08 },
    { equipmentId: 'dragon_sword', quality: 'epic', chance: 0.03 },
    { equipmentId: 'heavy_armor', quality: 'epic', chance: 0.03 }
  ],
  boss: [
    { equipmentId: 'dragon_sword', quality: 'epic', chance: 0.15 },
    { equipmentId: 'dragon_blade', quality: 'legendary', chance: 0.05 },
    { equipmentId: 'heavy_armor', quality: 'epic', chance: 0.12 },
    { equipmentId: 'dragon_armor', quality: 'legendary', chance: 0.04 },
    { equipmentId: 'god_helmet', quality: 'epic', chance: 0.10 },
    { equipmentId: 'holy_necklace', quality: 'legendary', chance: 0.03 },
    { equipmentId: 'holy_ring', quality: 'legendary', chance: 0.03 },
    { equipmentId: 'holy_bracelet', quality: 'legendary', chance: 0.03 }
  ]
}

export const goldDrops: Record<string, { min: number; max: number }> = {
  common: { min: 10, max: 50 },
  uncommon: { min: 50, max: 200 },
  rare: { min: 200, max: 500 },
  boss: { min: 1000, max: 5000 }
}
