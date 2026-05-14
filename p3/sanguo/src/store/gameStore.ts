import { create } from 'zustand'
import { Hero, PlayerData, BattleLog, GachaHistory, Equipment } from '../types'
import { HEROES } from '../data/heroes'
import { performGacha } from '../logic/gacha'
import { GACHA_POOLS } from '../data/gacha'
import { simulateBattle } from '../logic/battle'

interface GameState {
  playerData: PlayerData
  currentView: 'home' | 'heroes' | 'formation' | 'gacha' | 'battle' | 'activity' | 'inventory'
  battleLogs: BattleLog[]
  battleResult: 'player' | 'enemy' | null
  isAnimating: boolean
  gachaResults: { hero: Hero; isNew: boolean }[]
  showGachaAnimation: boolean

  setCurrentView: (view: GameState['currentView']) => void
  performGachaPull: (poolId: string, count: number) => void
  closeGachaAnimation: () => void
  startBattle: (enemies: Hero[]) => void
  addHero: (hero: Hero) => void
  removeHero: (heroId: string) => void
  levelUpHero: (heroId: string) => void
  starUpHero: (heroId: string) => void
  setFormation: (position: number, heroId: string | null) => void
  addEquipment: (equipment: Equipment) => void
  unequipItem: (heroId: string, equipmentType: string) => void
  equipItem: (heroId: string, equipment: Equipment) => void
  addCurrency: (type: 'gold' | 'jade', amount: number) => void
  spendCurrency: (type: 'gold' | 'jade', amount: number) => boolean
}

const initialPlayerData: PlayerData = {
  gold: 100000,
  jade: 10000,
  exp: 0,
  level: 1,
  heroes: [
    { ...HEROES.guanyu, level: 50 },
    { ...HEROES.zhangfei, level: 45 },
    { ...HEROES.zhaoyun, level: 40 },
    { ...HEROES.sunshangxiang, level: 35 }
  ],
  formation: ['guanyu', 'zhangfei', 'zhaoyun', null, null],
  inventory: [],
  gachaHistory: [],
  pityCounters: { normal: 0, limited: 0, friend: 0 },
  activityProgress: {}
}

export const useGameStore = create<GameState>((set, get) => ({
  playerData: initialPlayerData,
  currentView: 'home',
  battleLogs: [],
  battleResult: null,
  isAnimating: false,
  gachaResults: [],
  showGachaAnimation: false,

  setCurrentView: (view) => set({ currentView: view }),

  performGachaPull: (poolId, count) => {
    const { playerData } = get()
    const pool = GACHA_POOLS[poolId]
    if (!pool) return

    const cost = poolId === 'friend' ? count * 100 : count * 160
    const currencyType = poolId === 'friend' ? 'gold' : 'jade'

    if (playerData[currencyType] < cost) {
      alert(`${currencyType === 'gold' ? '金币' : '玉石'}不足！`)
      return
    }

    const ownedHeroIds = playerData.heroes.map(h => h.id)
    const pityCount = playerData.pityCounters[poolId] || 0

    const { results, newPityCount } = performGacha(pool, pityCount, ownedHeroIds, count)

    const newHeroes = [...playerData.heroes]
    const gachaResults: { hero: Hero; isNew: boolean }[] = []

    results.forEach(result => {
      gachaResults.push({ hero: result.hero, isNew: result.isNew })
      if (result.isNew) {
        newHeroes.push(result.hero)
      }
    })

    const historyEntry: GachaHistory = {
      timestamp: Date.now(),
      results: results.map(r => ({
        rarity: r.hero.rarity,
        heroId: r.hero.id,
        isNew: r.isNew
      }))
    }

    set(state => ({
      playerData: {
        ...state.playerData,
        [currencyType]: state.playerData[currencyType] - cost,
        heroes: newHeroes,
        gachaHistory: [...state.playerData.gachaHistory, historyEntry],
        pityCounters: {
          ...state.playerData.pityCounters,
          [poolId]: newPityCount
        }
      },
      gachaResults,
      showGachaAnimation: true
    }))
  },

  closeGachaAnimation: () => set({ showGachaAnimation: false, gachaResults: [] }),

  startBattle: (enemies) => {
    const { playerData } = get()
    const playerHeroes = playerData.formation
      .filter(id => id !== null)
      .map(id => playerData.heroes.find(h => h.id === id))
      .filter((h): h is Hero => h !== undefined)

    const result = simulateBattle(playerHeroes, enemies)

    set({
      battleLogs: result.logs,
      battleResult: result.winner,
      currentView: 'battle'
    })
  },

  addHero: (hero) => set(state => ({
    playerData: {
      ...state.playerData,
      heroes: [...state.playerData.heroes, hero]
    }
  })),

  removeHero: (heroId) => set(state => ({
    playerData: {
      ...state.playerData,
      heroes: state.playerData.heroes.filter(h => h.id !== heroId),
      formation: state.playerData.formation.map(id => id === heroId ? null : id)
    }
  })),

  levelUpHero: (heroId) => set(state => {
    const hero = state.playerData.heroes.find(h => h.id === heroId)
    if (!hero || hero.level >= 100) return state

    const cost = hero.level * 100
    if (state.playerData.gold < cost) return state

    return {
      playerData: {
        ...state.playerData,
        gold: state.playerData.gold - cost,
        heroes: state.playerData.heroes.map(h =>
          h.id === heroId ? { ...h, level: h.level + 1 } : h
        )
      }
    }
  }),

  starUpHero: (heroId) => set(state => {
    const hero = state.playerData.heroes.find(h => h.id === heroId)
    if (!hero || hero.star >= hero.maxStar) return state

    const cost = (hero.star + 1) * 1000
    if (state.playerData.jade < cost) return state

    return {
      playerData: {
        ...state.playerData,
        jade: state.playerData.jade - cost,
        heroes: state.playerData.heroes.map(h =>
          h.id === heroId ? { ...h, star: h.star + 1 } : h
        )
      }
    }
  }),

  setFormation: (position, heroId) => set(state => {
    const newFormation = [...state.playerData.formation]
    newFormation[position] = heroId
    return {
      playerData: {
        ...state.playerData,
        formation: newFormation
      }
    }
  }),

  addEquipment: (equipment) => set(state => ({
    playerData: {
      ...state.playerData,
      inventory: [...state.playerData.inventory, equipment]
    }
  })),

  unequipItem: (heroId, equipmentType) => set(state => {
    const hero = state.playerData.heroes.find(h => h.id === heroId)
    if (!hero) return state

    const equipment = hero.equipment.find(e => e.type === equipmentType)
    if (!equipment) return state

    return {
      playerData: {
        ...state.playerData,
        heroes: state.playerData.heroes.map(h =>
          h.id === heroId
            ? { ...h, equipment: h.equipment.filter(e => e.type !== equipmentType) }
            : h
        ),
        inventory: [...state.playerData.inventory, equipment]
      }
    }
  }),

  equipItem: (heroId, equipment) => set(state => {
    const hero = state.playerData.heroes.find(h => h.id === heroId)
    if (!hero) return state

    const existingEquipment = hero.equipment.find(e => e.type === equipment.type)
    const newInventory = state.playerData.inventory.filter(e => e.id !== equipment.id)
    if (existingEquipment) {
      newInventory.push(existingEquipment)
    }

    return {
      playerData: {
        ...state.playerData,
        heroes: state.playerData.heroes.map(h =>
          h.id === heroId
            ? {
                ...h,
                equipment: [...h.equipment.filter(e => e.type !== equipment.type), equipment]
              }
            : h
        ),
        inventory: newInventory
      }
    }
  }),

  addCurrency: (type, amount) => set(state => ({
    playerData: {
      ...state.playerData,
      [type]: state.playerData[type] + amount
    }
  })),

  spendCurrency: (type, amount) => {
    const { playerData } = get()
    if (playerData[type] < amount) return false

    set(state => ({
      playerData: {
        ...state.playerData,
        [type]: state.playerData[type] - amount
      }
    }))
    return true
  }
}))
