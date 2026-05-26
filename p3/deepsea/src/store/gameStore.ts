import { create } from 'zustand'
import { GameState, BaseModule, Submersible, Resources, Technology, ModuleType, SubmersibleType, Position } from '../types/game'
import { generateMap } from '../utils/mapGenerator'

const INITIAL_RESOURCES: Resources = {
  ore: 200,
  organic: 100,
  rare_ore: 20,
  crystal: 0,
  fuel: 150,
  biomass: 50,
  alloy: 50,
  electronics: 30
}

const MODULE_CONFIGS: Record<ModuleType, Partial<BaseModule>> = {
  habitat: { powerConsumption: 5, oxygenConsumption: 10, storageCapacity: 0, maxHealth: 100 },
  power: { powerConsumption: 0, powerProduction: 50, oxygenConsumption: 0, storageCapacity: 0, maxHealth: 80 },
  oxygen: { powerConsumption: 10, oxygenProduction: 50, storageCapacity: 0, maxHealth: 80 },
  storage: { powerConsumption: 2, storageCapacity: 200, maxHealth: 100 },
  research: { powerConsumption: 15, storageCapacity: 0, maxHealth: 100 },
  factory: { powerConsumption: 20, storageCapacity: 0, maxHealth: 120 },
  nuclear: { powerConsumption: 0, powerProduction: 200, oxygenConsumption: 0, storageCapacity: 0, maxHealth: 150 },
  bio_lab: { powerConsumption: 25, storageCapacity: 0, maxHealth: 100 },
  defense: { powerConsumption: 15, storageCapacity: 0, maxHealth: 120 }
}

const MODULE_COSTS: Record<ModuleType, Partial<Resources>> = {
  habitat: { ore: 50, alloy: 20 },
  power: { ore: 40, electronics: 10 },
  oxygen: { ore: 30, alloy: 15, electronics: 10 },
  storage: { ore: 60 },
  research: { ore: 80, alloy: 30, electronics: 20 },
  factory: { ore: 100, alloy: 50, electronics: 30 },
  nuclear: { rare_ore: 50, crystal: 20, electronics: 50 },
  bio_lab: { alloy: 40, electronics: 40, biomass: 30 },
  defense: { ore: 60, alloy: 30, electronics: 20 }
}

const SUBMERSIBLE_CONFIGS: Record<SubmersibleType, Partial<Submersible>> = {
  scout: { maxDepth: 300, speed: 3, cargoCapacity: 30, maxHealth: 60, maxFuel: 100 },
  miner: { maxDepth: 400, speed: 1.5, cargoCapacity: 100, maxHealth: 100, maxFuel: 80 },
  research: { maxDepth: 500, speed: 2, cargoCapacity: 50, maxHealth: 80, maxFuel: 120 }
}

const SUBMERSIBLE_COSTS: Record<SubmersibleType, Partial<Resources>> = {
  scout: { ore: 40, alloy: 20, electronics: 15, fuel: 50 },
  miner: { ore: 80, alloy: 40, electronics: 20, fuel: 60 },
  research: { ore: 60, alloy: 30, electronics: 40, fuel: 70 }
}

const INITIAL_TECHNOLOGIES: Technology[] = [
  { id: 'deep_dive', name: '深潜技术', description: '潜水器最大深度+100', cost: { rare_ore: 30, crystal: 10 }, unlocked: false, prerequisites: [] },
  { id: 'advanced_mining', name: '高级采矿', description: '资源采集效率+50%', cost: { alloy: 50, electronics: 30 }, unlocked: false, prerequisites: [] },
  { id: 'bio_scan', name: '生物扫描', description: '可探测深海生物', cost: { biomass: 50, electronics: 40 }, unlocked: false, prerequisites: [] },
  { id: 'nuclear_power', name: '核能技术', description: '解锁核电站', cost: { rare_ore: 100, crystal: 50 }, unlocked: false, prerequisites: ['deep_dive'] },
  { id: 'auto_defense', name: '自动防御', description: '防御炮台自动攻击', cost: { electronics: 60, alloy: 40 }, unlocked: false, prerequisites: [] },
  { id: 'pressure_hull', name: '耐压壳体', description: '基地模块可建在更深区域', cost: { alloy: 80, crystal: 30 }, unlocked: false, prerequisites: ['deep_dive'] }
]

function createInitialState(): GameState {
  const map = generateMap(120, 80, Date.now())
  const centerX = Math.floor(map.width / 2)
  const centerY = 10

  const initialModules: BaseModule[] = [
    createModule('habitat', centerX, centerY),
    createModule('power', centerX - 2, centerY),
    createModule('oxygen', centerX + 2, centerY),
    createModule('storage', centerX, centerY + 2)
  ]

  const initialSubmersibles: Submersible[] = [
    createSubmersible('scout', '探索者-1', centerX, centerY - 1),
    createSubmersible('miner', '采矿者-1', centerX + 1, centerY - 1)
  ]

  return {
    day: 1,
    time: 0,
    paused: false,
    resources: { ...INITIAL_RESOURCES },
    baseModules: initialModules,
    submersibles: initialSubmersibles,
    creatures: [],
    technologies: INITIAL_TECHNOLOGIES,
    events: [{ id: 'welcome', type: 'resource_discovery', message: '欢迎来到深海探索！从母船获得初始资源，开始建立你的海底基地。', timestamp: 0 }],
    currentPower: 50,
    currentOxygen: 50,
    maxPower: 50,
    maxOxygen: 50,
    maxStorage: 200,
    usedStorage: 0,
    map,
    camera: { x: centerX, y: centerY },
    zoom: 1,
    buildMode: null
  }
}

function createModule(type: ModuleType, x: number, y: number): BaseModule {
  const config = MODULE_CONFIGS[type]
  return {
    id: `module_${Date.now()}_${Math.random()}`,
    type,
    position: { x, y },
    health: config.maxHealth || 100,
    maxHealth: config.maxHealth || 100,
    powerConsumption: config.powerConsumption || 0,
    powerProduction: config.powerProduction || 0,
    oxygenConsumption: config.oxygenConsumption || 0,
    oxygenProduction: config.oxygenProduction || 0,
    storageCapacity: config.storageCapacity || 0,
    connections: []
  }
}

function createSubmersible(type: SubmersibleType, name: string, x: number, y: number): Submersible {
  const config = SUBMERSIBLE_CONFIGS[type]
  return {
    id: `sub_${Date.now()}_${Math.random()}`,
    name,
    type,
    status: 'docked',
    position: { x, y },
    path: [],
    health: config.maxHealth || 100,
    maxHealth: config.maxHealth || 100,
    maxDepth: config.maxDepth || 200,
    speed: config.speed || 2,
    cargoCapacity: config.cargoCapacity || 50,
    cargo: [],
    fuel: config.maxFuel || 100,
    maxFuel: config.maxFuel || 100
  }
}

interface GameActions {
  update: (deltaTime: number) => void
  setPaused: (paused: boolean) => void
  setCamera: (pos: Position) => void
  setZoom: (zoom: number) => void
  setBuildMode: (mode: ModuleType | null) => void
  buildModule: (x: number, y: number) => boolean
  demolishModule: (id: string) => void
  selectSubmersible: (id: string | undefined) => void
  dispatchSubmersible: (id: string, target: Position) => void
  recallSubmersible: (id: string) => void
  buildSubmersible: (type: SubmersibleType, name: string) => boolean
  unlockTech: (techId: string) => boolean
  addEvent: (message: string, type: string) => void
  canAfford: (cost: Partial<Resources>) => boolean
  spendResources: (cost: Partial<Resources>) => void
  saveGame: () => void
  loadGame: () => boolean
}

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  ...createInitialState(),

  update: (deltaTime: number) => {
    const state = get()
    if (state.paused) return

    let newTime = state.time + deltaTime * 0.1
    let newDay = state.day
    if (newTime >= 100) {
      newTime = 0
      newDay++
    }

    let totalPowerProduction = 0
    let totalPowerConsumption = 0
    let totalOxygenProduction = 0
    let totalOxygenConsumption = 0
    let totalStorage = 0

    state.baseModules.forEach(module => {
      totalPowerProduction += module.powerProduction
      totalPowerConsumption += module.powerConsumption
      totalOxygenProduction += module.oxygenProduction
      totalOxygenConsumption += module.oxygenConsumption
      totalStorage += module.storageCapacity
    })

    const netPower = totalPowerProduction - totalPowerConsumption
    const netOxygen = totalOxygenProduction - totalOxygenConsumption

    let newCurrentPower = Math.min(Math.max(0, state.currentPower + netPower * deltaTime * 0.5), state.maxPower)
    let newCurrentOxygen = Math.min(Math.max(0, state.currentOxygen + netOxygen * deltaTime * 0.5), state.maxOxygen)
    let newMaxPower = Math.max(totalPowerProduction, 50)
    let newMaxOxygen = Math.max(totalOxygenProduction, 50)

    const updatedSubmersibles = state.submersibles.map(sub => {
      if (sub.status === 'exploring' || sub.status === 'returning') {
        if (sub.path.length > 0) {
          const target = sub.path[0]
          const dx = target.x - sub.position.x
          const dy = target.y - sub.position.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < sub.speed * deltaTime) {
            const newPos = { ...target }
            const newPath = sub.path.slice(1)

            const tile = state.map.tiles[Math.floor(target.y)]?.[Math.floor(target.x)]
            if (tile) {
              tile.discovered = true
              tile.resources.forEach(r => r.discovered = true)
            }

            if (newPath.length === 0) {
              if (sub.status === 'returning') {
                return { ...sub, position: newPos, path: newPath, status: 'docked' as const }
              }
              return { ...sub, position: newPos, path: newPath, status: 'exploring' as const }
            }
            return { ...sub, position: newPos, path: newPath }
          } else {
            return {
              ...sub,
              position: {
                x: sub.position.x + (dx / dist) * sub.speed * deltaTime,
                y: sub.position.y + (dy / dist) * sub.speed * deltaTime
              },
              fuel: Math.max(0, sub.fuel - deltaTime * 0.1)
            }
          }
        }
      }
      return sub
    })

    set({
      day: newDay,
      time: newTime,
      currentPower: newCurrentPower,
      currentOxygen: newCurrentOxygen,
      maxPower: newMaxPower,
      maxOxygen: newMaxOxygen,
      maxStorage: totalStorage,
      submersibles: updatedSubmersibles
    })
  },

  setPaused: (paused) => set({ paused }),
  setCamera: (pos) => set({ camera: pos }),
  setZoom: (zoom) => set({ zoom: Math.max(0.5, Math.min(3, zoom)) }),
  setBuildMode: (mode) => set({ buildMode: mode }),

  buildModule: (x, y) => {
    const state = get()
    if (!state.buildMode) return false

    const cost = MODULE_COSTS[state.buildMode]
    if (!state.canAfford(cost)) return false

    const existing = state.baseModules.find(m => Math.floor(m.position.x) === x && Math.floor(m.position.y) === y)
    if (existing) return false

    state.spendResources(cost)
    const newModule = createModule(state.buildMode, x, y)
    set({ baseModules: [...state.baseModules, newModule], buildMode: null })
    return true
  },

  demolishModule: (id) => {
    const state = get()
    set({ baseModules: state.baseModules.filter(m => m.id !== id) })
  },

  selectSubmersible: (id) => set({ selectedSubmersible: id }),

  dispatchSubmersible: (id, target) => {
    const state = get()
    const sub = state.submersibles.find(s => s.id === id)
    if (!sub || sub.status !== 'docked') return

    const path = [target]
    set({
      submersibles: state.submersibles.map(s =>
        s.id === id ? { ...s, status: 'exploring' as const, targetPosition: target, path } : s
      )
    })
  },

  recallSubmersible: (id) => {
    const state = get()
    const dockModule = state.baseModules[0]
    if (!dockModule) return

    set({
      submersibles: state.submersibles.map(s =>
        s.id === id ? { ...s, status: 'returning' as const, path: [dockModule.position], targetPosition: dockModule.position } : s
      )
    })
  },

  buildSubmersible: (type, name) => {
    const state = get()
    const cost = SUBMERSIBLE_COSTS[type]
    if (!state.canAfford(cost)) return false

    const dock = state.baseModules[0]
    if (!dock) return false

    state.spendResources(cost)
    const newSub = createSubmersible(type, name, dock.position.x, dock.position.y - 1)
    set({ submersibles: [...state.submersibles, newSub] })
    return true
  },

  unlockTech: (techId) => {
    const state = get()
    const tech = state.technologies.find(t => t.id === techId)
    if (!tech || tech.unlocked) return false

    const prereqsMet = tech.prerequisites.every(p => state.technologies.find(t => t.id === p)?.unlocked)
    if (!prereqsMet) return false
    if (!state.canAfford(tech.cost)) return false

    state.spendResources(tech.cost)
    set({
      technologies: state.technologies.map(t => t.id === techId ? { ...t, unlocked: true } : t)
    })
    return true
  },

  addEvent: (message, type) => {
    const state = get()
    set({
      events: [...state.events.slice(-49), {
        id: `evt_${Date.now()}`,
        type: type as any,
        message,
        timestamp: Date.now()
      }]
    })
  },

  canAfford: (cost) => {
    const state = get()
    for (const [key, value] of Object.entries(cost)) {
      if ((state.resources as any)[key] < (value || 0)) return false
    }
    return true
  },

  spendResources: (cost) => {
    const state = get()
    const newResources = { ...state.resources }
    for (const [key, value] of Object.entries(cost)) {
      (newResources as any)[key] -= value || 0
    }
    set({ resources: newResources })
  },

  saveGame: () => {
    const state = get()
    const saveData = JSON.stringify(state)
    localStorage.setItem('deepsea_save', saveData)
  },

  loadGame: () => {
    const saved = localStorage.getItem('deepsea_save')
    if (saved) {
      try {
        const data = JSON.parse(saved)
        set(data)
        return true
      } catch {
        return false
      }
    }
    return false
  }
}))
