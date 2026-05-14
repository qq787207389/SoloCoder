import { GachaPool, Hero, Rarity } from '../types'
import { HEROES } from '../data/heroes'

export function rollRarity(pool: GachaPool, pityCount: number): Rarity {
  let rates = [...pool.rates]

  if (pool.hardPity > 0 && pityCount >= pool.hardPity) {
    const highestRarity = rates.reduce((a, b) =>
      getRarityWeight(a.rarity) > getRarityWeight(b.rarity) ? a : b
    )
    return highestRarity.rarity
  }

  if (pool.softPity > 0 && pityCount >= pool.softPity) {
    const softPityBonus = (pityCount - pool.softPity) * 0.02
    rates = rates.map(r => {
      if (r.rarity === 'SSR' || r.rarity === 'UR') {
        return { ...r, rate: r.rate + softPityBonus / 2 }
      }
      return r
    })
  }

  const totalRate = rates.reduce((sum, r) => sum + r.rate, 0)
  let random = Math.random() * totalRate

  for (const rate of rates) {
    random -= rate.rate
    if (random <= 0) {
      return rate.rarity
    }
  }

  return rates[rates.length - 1].rarity
}

function getRarityWeight(rarity: Rarity): number {
  const weights: Record<Rarity, number> = {
    'N': 1,
    'R': 2,
    'SR': 3,
    'SSR': 4,
    'UR': 5
  }
  return weights[rarity]
}

export function selectHero(rarity: Rarity, featured?: string[]): Hero {
  const heroesByRarity = Object.values(HEROES).filter(h => h.rarity === rarity)

  if (featured && featured.length > 0) {
    const featuredHeroes = heroesByRarity.filter(h => featured.includes(h.id))
    if (featuredHeroes.length > 0 && Math.random() < 0.5) {
      return { ...featuredHeroes[Math.floor(Math.random() * featuredHeroes.length)] }
    }
  }

  if (heroesByRarity.length > 0) {
    return { ...heroesByRarity[Math.floor(Math.random() * heroesByRarity.length)] }
  }

  const fallbackHeroes = Object.values(HEROES).filter(h => h.rarity === 'R')
  return { ...fallbackHeroes[Math.floor(Math.random() * fallbackHeroes.length)] }
}

export interface GachaResult {
  hero: Hero
  isNew: boolean
  isGuaranteed: boolean
}

export function performGacha(
  pool: GachaPool,
  pityCount: number,
  ownedHeroIds: string[],
  count: number = 1
): { results: GachaResult[], newPityCount: number } {
  const results: GachaResult[] = []
  let currentPity = pityCount
  let hasPurpleOrAbove = false

  for (let i = 0; i < count; i++) {
    currentPity++
    let isGuaranteed = false

    if (count === 10 && i === 9 && !hasPurpleOrAbove) {
      const guaranteedRarity: Rarity = Math.random() < 0.3 ? 'SSR' : 'SR'
      const hero = selectHero(guaranteedRarity, pool.featured)
      isGuaranteed = true
      if (getRarityWeight(guaranteedRarity) >= 3) {
        hasPurpleOrAbove = true
        currentPity = 0
      }
      results.push({
        hero,
        isNew: !ownedHeroIds.includes(hero.id),
        isGuaranteed
      })
    } else {
      const rarity = rollRarity(pool, currentPity)
      if (getRarityWeight(rarity) >= 4) {
        currentPity = 0
      }
      if (getRarityWeight(rarity) >= 3) {
        hasPurpleOrAbove = true
      }
      const hero = selectHero(rarity, pool.featured)
      results.push({
        hero,
        isNew: !ownedHeroIds.includes(hero.id),
        isGuaranteed
      })
    }
  }

  return { results, newPityCount: currentPity }
}
