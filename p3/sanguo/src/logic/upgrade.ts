import { Hero, Equipment } from '../types'
import { FATES } from '../data/fates'

export function levelUpHero(hero: Hero, levels: number = 1): Hero {
  const newLevel = Math.min(hero.level + levels, 100)
  return { ...hero, level: newLevel }
}

export function starUpHero(hero: Hero): Hero {
  if (hero.star >= hero.maxStar) return hero
  return { ...hero, star: hero.star + 1 }
}

export function equipItem(hero: Hero, equipment: Equipment): Hero {
  const newEquipment = hero.equipment.filter(e => e.type !== equipment.type)
  return { ...hero, equipment: [...newEquipment, equipment] }
}

export function unequipItem(hero: Hero, equipmentType: string): Hero {
  return { ...hero, equipment: hero.equipment.filter(e => e.type !== equipmentType) }
}

export function checkActiveFates(heroIds: string[]): string[] {
  const activeFates: string[] = []

  Object.values(FATES).forEach(fate => {
    const hasAllHeroes = fate.heroes.every(heroId => heroIds.includes(heroId))
    if (hasAllHeroes) {
      activeFates.push(fate.id)
    }
  })

  return activeFates
}

export function getFateBonuses(activeFateIds: string[]): Record<string, number> {
  const bonuses: Record<string, number> = {}

  activeFateIds.forEach(fateId => {
    const fate = FATES[fateId]
    if (fate) {
      Object.entries(fate.effect).forEach(([stat, value]) => {
        bonuses[stat] = (bonuses[stat] || 0) + (value as number)
      })
    }
  })

  return bonuses
}

export function calculateUpgradeCost(hero: Hero, type: 'level' | 'star'): { gold: number, jade: number } {
  if (type === 'level') {
    const baseCost = hero.level * 100
    return { gold: baseCost, jade: Math.floor(baseCost / 10) }
  } else {
    const baseCost = (hero.star + 1) * 1000
    return { gold: baseCost, jade: Math.floor(baseCost / 5) }
  }
}
