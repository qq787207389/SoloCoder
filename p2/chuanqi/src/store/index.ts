import { create } from 'zustand'
import { GameState, Character, Monster, Guild, Equipment, PKStatus, InventoryItem } from '../types'
import { classBaseStats, classSkills } from '../data/classes'
import { generateMap } from '../data/map'
import { monsterTemplates, createMonster } from '../data/monsters'
import { generateEquipment } from '../utils/equipmentGenerator'
import { enhanceConfigs, enhanceBonus } from '../data/enhance'
import { dropTables, goldDrops } from '../data/drops'

interface GameStore extends GameState {
  initializePlayer: (name: string, classType: 'warrior' | 'mage' | 'taoist') => void
  updatePlayerPosition: (x: number, y: number) => void
  useSkill: (skillIndex: number, targetId: string | null) => void
  updatePlayerStats: (delta: Partial<Character['stats']>) => void
  addItemToInventory: (item: Equipment) => void
  removeItemFromInventory: (itemId: string) => void
  equipItem: (item: Equipment, slot: string) => void
  unequipItem: (slot: string) => void
  spawnMonsters: () => void
  damageMonster: (monsterId: string, damage: number) => void
  damagePlayer: (damage: number) => void
  updatePKValue: (delta: number) => void
  createGuild: (name: string) => void
  joinGuild: (guildId: string) => void
  leaveGuild: () => void
  addAnnouncement: (message: string) => void
  enhanceEquipment: (inventoryIndex: number, useProtect: boolean) => { success: boolean; broke: boolean }
  rollDrops: (dropTable: string, position: { x: number; y: number }) => void
  pickupItem: (dropId: string) => void
  setGameTime: (time: number) => void
  updateMonsterPositions: (deltaTime: number) => void
  updateSkillCooldowns: (deltaTime: number) => void
}

function createInitialPlayer(): Character {
  const baseStats = classBaseStats.warrior
  return {
    id: 'player_1',
    name: '玩家',
    class: 'warrior',
    level: 1,
    exp: 0,
    position: { x: 2, y: 2 },
    stats: { ...baseStats },
    skills: classSkills.warrior.map(s => ({ ...s, currentCooldown: 0 })),
    equipment: {
      weapon: null,
      armor: null,
      helmet: null,
      necklace: null,
      ring_left: null,
      ring_right: null,
      bracelet_left: null,
      bracelet_right: null,
      shoes: null
    },
    inventory: [],
    gold: 1000,
    pkValue: 0,
    pkStatus: 'white',
    luckyValue: 0,
    isCasting: false,
    castProgress: 0,
    currentSkill: null,
    targetId: null
  }
}

const useGameStore = create<GameStore>((set, get) => ({
  player: createInitialPlayer(),
  monsters: [],
  otherPlayers: [],
  guilds: [],
  currentMap: 'main',
  mapData: generateMap(),
  droppedItems: [],
  announcements: [],
  gameTime: 0,
  sabakState: {
    isWar: false,
    startTime: 0,
    occupyingGuildId: null
  },

  initializePlayer: (name: string, classType: 'warrior' | 'mage' | 'taoist') => {
    const baseStats = classBaseStats[classType]
    const skills = classSkills[classType]
    
    set(state => ({
      player: {
        ...state.player,
        name,
        class: classType,
        stats: { ...baseStats },
        skills: skills.map(s => ({ ...s, currentCooldown: 0 }))
      }
    }))
  },

  updatePlayerPosition: (x: number, y: number) => {
    const { mapData } = get()
    const cellX = Math.floor(x)
    const cellY = Math.floor(y)
    
    if (cellX >= 0 && cellX < mapData[0].length && cellY >= 0 && cellY < mapData.length) {
      if (mapData[cellY][cellX].walkable) {
        set(state => ({
          player: { ...state.player, position: { x, y } }
        }))
      }
    }
  },

  useSkill: (skillIndex: number, targetId: string | null) => {
    const { player, monsters } = get()
    const skill = player.skills[skillIndex]
    
    if (!skill || skill.currentCooldown > 0 || player.stats.mp < skill.mpCost) {
      return
    }

    set(state => {
      const newSkills = [...state.player.skills]
      newSkills[skillIndex] = { ...newSkills[skillIndex], currentCooldown: newSkills[skillIndex].cooldown }
      
      return {
        player: {
          ...state.player,
          skills: newSkills,
          stats: {
            ...state.player.stats,
            mp: state.player.stats.mp - skill.mpCost
          },
          isCasting: true,
          currentSkill: skill,
          targetId
        }
      }
    })
  },

  updatePlayerStats: (delta) => {
    set(state => ({
      player: {
        ...state.player,
        stats: {
          ...state.player.stats,
          ...delta
        }
      }
    }))
  },

  addItemToInventory: (item: Equipment) => {
    set(state => {
      if (state.player.inventory.length >= 30) {
        return state
      }
      
      const newInventoryItem: InventoryItem = {
        item,
        count: 1,
        slot: state.player.inventory.length
      }
      
      return {
        player: {
          ...state.player,
          inventory: [...state.player.inventory, newInventoryItem]
        }
      }
    })
  },

  removeItemFromInventory: (itemId: string) => {
    set(state => ({
      player: {
        ...state.player,
        inventory: state.player.inventory.filter(i => i.item.id !== itemId)
      }
    }))
  },

  equipItem: (item: Equipment, slot: string) => {
    set(state => {
      const currentEquipped = state.player.equipment[slot]
      const newInventory = state.player.inventory.filter(i => i.item.id !== item.id)
      
      if (currentEquipped) {
        newInventory.push({
          item: currentEquipped,
          count: 1,
          slot: newInventory.length
        })
      }
      
      return {
        player: {
          ...state.player,
          equipment: {
            ...state.player.equipment,
            [slot]: item
          },
          inventory: newInventory
        }
      }
    })
  },

  unequipItem: (slot: string) => {
    set(state => {
      const item = state.player.equipment[slot]
      if (!item || state.player.inventory.length >= 30) return state
      
      return {
        player: {
          ...state.player,
          equipment: {
            ...state.player.equipment,
            [slot]: null
          },
          inventory: [...state.player.inventory, { item, count: 1, slot: state.player.inventory.length }]
        }
      }
    })
  },

  spawnMonsters: () => {
    const { mapData } = get()
    const newMonsters: Monster[] = []
    
    for (let i = 0; i < 8; i++) {
      const template = monsterTemplates[Math.floor(Math.random() * 4)]
      let x, y
      do {
        x = Math.floor(Math.random() * (mapData[0].length - 2)) + 1
        y = Math.floor(Math.random() * (mapData.length - 2)) + 1
      } while (!mapData[y][x].walkable)
      
      newMonsters.push(createMonster(template, x + 0.5, y + 0.5))
    }
    
    for (let i = 0; i < 3; i++) {
      const template = monsterTemplates[4 + Math.floor(Math.random() * 3)]
      let x, y
      do {
        x = Math.floor(Math.random() * (mapData[0].length - 2)) + 1
        y = Math.floor(Math.random() * (mapData.length - 2)) + 1
      } while (!mapData[y][x].walkable)
      
      newMonsters.push(createMonster(template, x + 0.5, y + 0.5))
    }
    
    set({ monsters: newMonsters })
  },

  damageMonster: (monsterId: string, damage: number) => {
    set(state => {
      const monster = state.monsters.find(m => m.id === monsterId)
      if (!monster) return state
      
      const newHp = monster.stats.hp - damage
      
      if (newHp <= 0) {
        setTimeout(() => {
          get().rollDrops(monster.dropTable, monster.position)
        }, 0)
        
        return {
          monsters: state.monsters.filter(m => m.id !== monsterId)
        }
      }
      
      return {
        monsters: state.monsters.map(m => 
          m.id === monsterId 
            ? { ...m, stats: { ...m.stats, hp: newHp } }
            : m
        )
      }
    })
  },

  damagePlayer: (damage: number) => {
    set(state => {
      const newHp = Math.max(0, state.player.stats.hp - damage)
      return {
        player: {
          ...state.player,
          stats: {
            ...state.player.stats,
            hp: newHp
          }
        }
      }
    })
  },

  updatePKValue: (delta: number) => {
    set(state => {
      const newPkValue = Math.max(0, state.player.pkValue + delta)
      let newPkStatus: PKStatus = 'white'
      
      if (newPkValue >= 100) {
        newPkStatus = 'red'
      } else if (newPkValue > 0) {
        newPkStatus = 'gray'
      }
      
      return {
        player: {
          ...state.player,
          pkValue: newPkValue,
          pkStatus: newPkStatus
        }
      }
    })
  },

  createGuild: (name: string) => {
    const { player } = get()
    
    const newGuild: Guild = {
      id: `guild_${Date.now()}`,
      name,
      leaderId: player.id,
      members: [{
        characterId: player.id,
        name: player.name,
        rank: 'leader',
        joinTime: Date.now()
      }],
      warehouse: [],
      gold: 0,
      createdAt: Date.now()
    }
    
    set(state => ({
      guilds: [...state.guilds, newGuild]
    }))
  },

  joinGuild: (guildId: string) => {
    const { player } = get()
    
    set(state => ({
      guilds: state.guilds.map(g => {
        if (g.id === guildId) {
          return {
            ...g,
            members: [...g.members, {
              characterId: player.id,
              name: player.name,
              rank: 'member',
              joinTime: Date.now()
            }]
          }
        }
        return g
      })
    }))
  },

  leaveGuild: () => {
    const { player } = get()
    
    set(state => ({
      guilds: state.guilds.map(g => ({
        ...g,
        members: g.members.filter(m => m.characterId !== player.id)
      })).filter(g => g.members.length > 0)
    }))
  },

  addAnnouncement: (message: string) => {
    set(state => ({
      announcements: [...state.announcements.slice(-9), {
        id: Date.now(),
        message,
        time: Date.now()
      }]
    }))
  },

  enhanceEquipment: (inventoryIndex: number, useProtect: boolean) => {
    const { player } = get()
    const inventoryItem = player.inventory[inventoryIndex]
    
    if (!inventoryItem || inventoryItem.item.enhanceLevel >= 15) {
      return { success: false, broke: false }
    }
    
    const config = enhanceConfigs[inventoryItem.item.enhanceLevel]
    const roll = Math.random()
    
    let success = false
    let broke = false
    let newLevel = inventoryItem.item.enhanceLevel
    
    if (roll < config.successRate) {
      success = true
      newLevel += 1
    } else if (roll < config.successRate + config.degradeRate) {
      newLevel = Math.max(0, newLevel - 1)
    } else if (roll < config.successRate + config.degradeRate + config.breakRate) {
      if (!useProtect) {
        broke = true
      } else {
        newLevel = Math.max(0, newLevel - 1)
      }
    }
    
    if (broke) {
      set(state => ({
        player: {
          ...state.player,
          inventory: state.player.inventory.filter((_, i) => i !== inventoryIndex)
        }
      }))
    } else {
      set(state => ({
        player: {
          ...state.player,
          inventory: state.player.inventory.map((item, i) => 
            i === inventoryIndex
              ? {
                  ...item,
                  item: {
                    ...item.item,
                    enhanceLevel: newLevel
                  }
                }
              : item
          )
        }
      }))
    }
    
    return { success, broke }
  },

  rollDrops: (dropTable: string, position: { x: number; y: number }) => {
    const table = dropTables[dropTable]
    if (!table) return
    
    const goldRange = goldDrops[dropTable]
    const gold = Math.floor(Math.random() * (goldRange.max - goldRange.min) + goldRange.min)
    
    set(state => ({
      player: {
        ...state.player,
        gold: state.player.gold + gold
      }
    }))
    
    table.forEach(drop => {
      if (Math.random() < drop.chance) {
        const equipment = generateEquipment(drop.equipmentId, drop.quality)
        
        if (drop.quality === 'legendary' || drop.quality === 'epic') {
          get().addAnnouncement(`恭喜获得 ${drop.quality === 'legendary' ? '传说' : '史诗'} 装备: ${equipment.name}!`)
        }
        
        set(state => ({
          droppedItems: [...state.droppedItems, {
            id: `drop_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            item: equipment,
            position: {
              x: position.x + (Math.random() - 0.5),
              y: position.y + (Math.random() - 0.5)
            }
          }]
        }))
      }
    })
  },

  pickupItem: (dropId: string) => {
    const { player, droppedItems } = get()
    
    if (player.inventory.length >= 30) return
    
    const drop = droppedItems.find(d => d.id === dropId)
    if (!drop) return
    
    set(state => ({
      player: {
        ...state.player,
        inventory: [...state.player.inventory, {
          item: drop.item,
          count: 1,
          slot: state.player.inventory.length
        }]
      },
      droppedItems: state.droppedItems.filter(d => d.id !== dropId)
    }))
  },

  setGameTime: (time: number) => {
    set({ gameTime: time })
  },

  updateMonsterPositions: (deltaTime: number) => {
    const { player, monsters } = get()
    
    set(state => ({
      monsters: monsters.map(monster => {
        if (monster.aiState === 'dead') return monster
        
        let newState = monster.aiState
        let targetId = monster.targetId
        
        const dx = player.position.x - monster.position.x
        const dy = player.position.y - monster.position.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance <= monster.skills[0].range) {
          newState = 'attack'
          targetId = player.id
        } else if (distance <= 8) {
          newState = 'chase'
          targetId = player.id
        } else {
          newState = 'idle'
          targetId = null
        }
        
        let newPosition = { ...monster.position }
        if (newState === 'chase') {
          const speed = monster.stats.speed * deltaTime * 0.002
          newPosition = {
            x: monster.position.x + (dx / distance) * speed,
            y: monster.position.y + (dy / distance) * speed
          }
        }
        
        return {
          ...monster,
          position: newPosition,
          aiState: newState,
          targetId
        }
      })
    }))
  },

  updateSkillCooldowns: (deltaTime: number) => {
    set(state => ({
      player: {
        ...state.player,
        skills: state.player.skills.map(skill => ({
          ...skill,
          currentCooldown: Math.max(0, skill.currentCooldown - deltaTime)
        }))
      }
    }))
  }
}))

export default useGameStore
