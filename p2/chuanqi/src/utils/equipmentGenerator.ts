import { Equipment, Quality, Affix, BaseStats } from '../types'
import { affixPool, qualityAffixCount, qualityMultiplier } from '../data/affixes'
import { equipmentTemplates } from '../data/equipment'

export function generateEquipment(templateId: string, quality: Quality): Equipment {
  const template = equipmentTemplates.find(t => t.id === templateId)
  if (!template) {
    throw new Error(`Equipment template ${templateId} not found`)
  }

  const multiplier = qualityMultiplier[quality]
  const affixCountRange = qualityAffixCount[quality]
  const affixCount = Math.floor(Math.random() * (affixCountRange.max - affixCountRange.min + 1)) + affixCountRange.min

  const affixes = generateAffixes(affixCount)

  const baseStats: Partial<BaseStats> = {}
  Object.entries(template.baseStats).forEach(([stat, value]) => {
    baseStats[stat as keyof BaseStats] = Math.floor(value * multiplier)
  })

  return {
    id: `equip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: template.name,
    type: template.type,
    quality,
    level: template.level,
    baseStats,
    affixes,
    enhanceLevel: 0,
    setId: template.setId,
    luck: Math.floor(Math.random() * 3) - 1,
    curse: Math.random() < 0.1 ? Math.floor(Math.random() * 2) + 1 : 0
  }
}

function generateAffixes(count: number): Affix[] {
  const result: Affix[] = []
  const usedStats = new Set<string>()

  for (let i = 0; i < count; i++) {
    const available = affixPool.filter(a => !usedStats.has(a.stat))
    if (available.length === 0) break

    const selected = available[Math.floor(Math.random() * available.length)]
    usedStats.add(selected.stat)

    result.push({
      id: `affix_${Date.now()}_${i}`,
      name: selected.name,
      stat: selected.stat,
      value: Math.floor(selected.value * (0.8 + Math.random() * 0.4))
    })
  }

  return result
}

export function getEquipmentTotalStats(equipment: Equipment): Partial<BaseStats> {
  const stats: Partial<BaseStats> = { ...equipment.baseStats }

  equipment.affixes.forEach(affix => {
    stats[affix.stat] = (stats[affix.stat] || 0) + affix.value
  })

  return stats
}

export function getRandomQuality(): Quality {
  const roll = Math.random()
  if (roll < 0.5) return 'common'
  if (roll < 0.8) return 'uncommon'
  if (roll < 0.95) return 'rare'
  if (roll < 0.99) return 'epic'
  return 'legendary'
}
