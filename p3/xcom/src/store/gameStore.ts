import { create } from 'zustand'
import type { Character, Tile, GamePhase, TurnPhase, Position, ActionLog, SmokeCloud, Mine, LevelData, AIAction, SkillType } from '@/types'
import { MAP_WIDTH, MAP_HEIGHT, TILE_PROPERTIES } from '@/config/constants'
import { generateId, getDirection } from '@/utils/math'
import { CoverSystem } from '@/core/CoverSystem'
import { Pathfinding } from '@/core/Pathfinding'
import { CombatSystem } from '@/core/CombatSystem'
import { AISystem } from '@/core/AISystem'
import { CharacterFactory } from '@/core/CharacterFactory'
import { eventBus, EVENTS } from '@/core/EventBus'

interface GameState {
  phase: GamePhase
  turnPhase: TurnPhase
  currentTurn: number
  currentTeam: 'player' | 'enemy'
  
  tiles: Tile[][]
  mapWidth: number
  mapHeight: number
  
  units: Character[]
  selectedUnitId: string | null
  selectedSkillId: SkillType | null
  
  reachableTiles: Position[]
  attackableTargets: string[]
  
  actionLogs: ActionLog[]
  smokeClouds: SmokeCloud[]
  mines: Mine[]
  
  coverSystem: CoverSystem | null
  pathfinding: Pathfinding | null
  combatSystem: CombatSystem | null
  aiSystem: AISystem | null
  
  isAnimating: boolean
  currentLevel: LevelData | null
  
  setPhase: (phase: GamePhase) => void
  setTurnPhase: (phase: TurnPhase) => void
  
  initializeGame: (levelData: LevelData) => void
  startGame: () => void
  
  selectUnit: (unitId: string | null) => void
  selectSkill: (skillId: SkillType | null) => void
  
  moveUnit: (unitId: string, position: Position) => Promise<void>
  attackUnit: (attackerId: string, targetId: string) => Promise<void>
  useSkill: (unitId: string, skillId: SkillType, target?: Position | string) => Promise<void>
  
  endTurn: () => void
  executeEnemyTurn: () => Promise<void>
  
  addActionLog: (log: Omit<ActionLog, 'id' | 'timestamp'>) => void
  
  resetGame: () => void
}

const createEmptyMap = (width: number, height: number): Tile[][] => {
  const tiles: Tile[][] = []
  for (let y = 0; y < height; y++) {
    tiles[y] = []
    for (let x = 0; x < width; x++) {
      const props = TILE_PROPERTIES.ground
      tiles[y][x] = {
        id: generateId(),
        type: 'ground',
        position: { x, y },
        height: 0,
        destructible: props.destructible,
        hp: props.hp,
        maxHp: props.hp,
      }
    }
  }
  return tiles
}

export const useGameStore = create<GameState>((set, get) => ({
  phase: 'menu',
  turnPhase: 'select_unit',
  currentTurn: 1,
  currentTeam: 'player',
  
  tiles: createEmptyMap(MAP_WIDTH, MAP_HEIGHT),
  mapWidth: MAP_WIDTH,
  mapHeight: MAP_HEIGHT,
  
  units: [],
  selectedUnitId: null,
  selectedSkillId: null,
  
  reachableTiles: [],
  attackableTargets: [],
  
  actionLogs: [],
  smokeClouds: [],
  mines: [],
  
  coverSystem: null,
  pathfinding: null,
  combatSystem: null,
  aiSystem: null,
  
  isAnimating: false,
  currentLevel: null,
  
  setPhase: (phase) => {
    set({ phase })
    eventBus.emit(EVENTS.PHASE_CHANGE, phase)
  },
  
  setTurnPhase: (turnPhase) => set({ turnPhase }),
  
  initializeGame: (levelData) => {
    const tiles: Tile[][] = []
    for (let y = 0; y < levelData.height; y++) {
      tiles[y] = []
      for (let x = 0; x < levelData.width; x++) {
        const tile = levelData.tiles.find((t) => t.position.x === x && t.position.y === y)
        if (tile) {
          tiles[y][x] = { ...tile }
        } else {
          const props = TILE_PROPERTIES.ground
          tiles[y][x] = {
            id: generateId(),
            type: 'ground',
            position: { x, y },
            height: 0,
            destructible: props.destructible,
            hp: props.hp,
            maxHp: props.hp,
          }
        }
      }
    }
    
    const coverSystem = new CoverSystem(tiles, levelData.width, levelData.height)
    const pathfinding = new Pathfinding(tiles, levelData.width, levelData.height)
    const combatSystem = new CombatSystem(coverSystem, tiles)
    const aiSystem = new AISystem(coverSystem, pathfinding, combatSystem, tiles, levelData.width, levelData.height)
    
    const playerUnits = CharacterFactory.createPlayerSquad(levelData.playerStartPositions)
    const enemyUnits = CharacterFactory.createEnemySquad(levelData.enemySpawns, levelData.enemyTypes)
    
    set({
      tiles,
      mapWidth: levelData.width,
      mapHeight: levelData.height,
      units: [...playerUnits, ...enemyUnits],
      coverSystem,
      pathfinding,
      combatSystem,
      aiSystem,
      currentLevel: levelData,
      smokeClouds: [],
      mines: [],
      actionLogs: [],
      selectedUnitId: null,
      selectedSkillId: null,
      reachableTiles: [],
      attackableTargets: [],
      currentTurn: 1,
      currentTeam: 'player',
    })
    
    eventBus.emit(EVENTS.LOG_MESSAGE, {
      id: generateId(),
      timestamp: Date.now(),
      message: `关卡开始：${levelData.name}`,
      type: 'info',
    })
  },
  
  startGame: () => {
    set({ phase: 'player_turn', turnPhase: 'select_unit' })
    eventBus.emit(EVENTS.GAME_START)
    eventBus.emit(EVENTS.TURN_START, { team: 'player', turn: 1 })
  },
  
  selectUnit: (unitId) => {
    const { phase, units, pathfinding, combatSystem, smokeClouds, coverSystem } = get()
    
    if (phase !== 'player_turn') return
    
    if (!unitId) {
      set({
        selectedUnitId: null,
        selectedSkillId: null,
        reachableTiles: [],
        attackableTargets: [],
        turnPhase: 'select_unit',
      })
      return
    }
    
    const unit = units.find((u) => u.id === unitId)
    if (!unit || unit.team !== 'player' || unit.stats.hp <= 0) return
    
    let reachableTiles: Position[] = []
    let attackableTargets: string[] = []
    
    if (pathfinding && unit.ap > 0) {
      reachableTiles = pathfinding.getReachableTiles(unit.position, unit.stats.moveRange, units)
    }
    
    if (combatSystem && unit.ap > 0 && coverSystem) {
      const smokePositions = smokeClouds.map((s) => s.position)
      
      attackableTargets = units
        .filter((u) => u.team !== unit.team && u.stats.hp > 0)
        .filter((target) => {
          const weapon = unit.weapons[unit.currentWeaponIndex]
          const distance = Math.max(
            Math.abs(target.position.x - unit.position.x),
            Math.abs(target.position.y - unit.position.y)
          )
          if (distance < weapon.minRange || distance > weapon.range) return false
          return coverSystem.hasLineOfSight(unit.position, target.position, smokePositions)
        })
        .map((u) => u.id)
    }
    
    set({
      selectedUnitId: unitId,
      selectedSkillId: null,
      reachableTiles,
      attackableTargets,
      turnPhase: 'select_action',
    })
    
    eventBus.emit(EVENTS.UNIT_SELECTED, unitId)
  },
  
  selectSkill: (skillId) => {
    const { selectedUnitId, units, phase, turnPhase } = get()
    if (phase !== 'player_turn' || turnPhase === 'execute_action' || !selectedUnitId) return
    
    const unit = units.find((u) => u.id === selectedUnitId)
    if (!unit) return
    
    const skill = unit.skills.find((s) => s.id === skillId)
    if (!skill || skill.currentCooldown > 0 || unit.ap < skill.apCost) return
    
    if (skillId === 'move') {
      set({ selectedSkillId: skillId, turnPhase: 'select_target' })
    } else if (skillId === 'shoot' || skillId === 'precision_shot') {
      set({ selectedSkillId: skillId, turnPhase: 'select_target' })
    } else if (skillId === 'heal' || skillId === 'revive') {
      set({ selectedSkillId: skillId, turnPhase: 'select_target' })
    } else if (skillId === 'overwatch') {
      void get().useSkill(selectedUnitId, skillId)
    } else {
      set({ selectedSkillId: skillId, turnPhase: 'select_target' })
    }
  },
  
  moveUnit: async (unitId, position) => {
    const { units, pathfinding, combatSystem, smokeClouds, mines } = get()
    const unit = units.find((u) => u.id === unitId)
    if (!unit || !pathfinding || !combatSystem) return
    
    set({ isAnimating: true, turnPhase: 'execute_action' })
    
    try {
      const path = pathfinding.findPath(unit.position, position, units)
      if (!path || path.length === 0) {
        return
      }
      
      const moveSkill = unit.skills.find((s) => s.id === 'move')
      if (moveSkill) {
        unit.ap -= moveSkill.apCost
      }
      
      for (const pos of path.slice(1)) {
        const overwatchResults = combatSystem.checkOverwatch(unit, pos, units, smokeClouds.map((s) => s.position))
        
        for (const result of overwatchResults) {
          if (result.hit && result.damage > 0) {
            unit.stats.hp = Math.max(0, unit.stats.hp - result.damage)
          }
        }
        
        if (unit.stats.hp <= 0) {
          break
        }
        
        unit.position = pos
        unit.facing = getDirection(unit.position, pos)
        
        const triggeredMine = mines.find(
          (m) => m.position.x === pos.x && m.position.y === pos.y && m.team !== unit.team
        )
        if (triggeredMine) {
          combatSystem.triggerMine(triggeredMine, units)
          set({ mines: get().mines.filter((m) => m.id !== triggeredMine.id) })
        }
        
        eventBus.emit(EVENTS.UNIT_MOVED, { unitId, position: pos })
        
        await new Promise((resolve) => setTimeout(resolve, 150))
      }
      
      for (const u of units) {
        combatSystem.levelUp(u)
      }
      
      eventBus.emit(EVENTS.ACTION_PERFORMED, { type: 'move', unitId })
      
      const { selectedUnitId } = get()
      if (selectedUnitId === unitId) {
        get().selectUnit(unitId)
      }
    } catch (e) {
      console.error('Move unit failed:', e)
    } finally {
      set({ isAnimating: false })
    }
  },
  
  attackUnit: async (attackerId, targetId) => {
    const { units, combatSystem, smokeClouds, selectedSkillId } = get()
    const attacker = units.find((u) => u.id === attackerId)
    const target = units.find((u) => u.id === targetId)
    
    if (!attacker || !target || !combatSystem) return
    
    set({ isAnimating: true, turnPhase: 'execute_action' })
    
    try {
      const skill = attacker.skills.find((s) => s.id === (selectedSkillId || 'shoot'))
      if (skill) {
        attacker.ap -= skill.apCost
        skill.currentCooldown = skill.cooldown
      }
      
      const isPrecision = selectedSkillId === 'precision_shot'
      const smokePositions = smokeClouds.map((s) => s.position)
      
      eventBus.emit(EVENTS.ANIMATION_START, { type: 'attack', attackerId, targetId })
      
      await new Promise((resolve) => setTimeout(resolve, 300))
      
      const result = combatSystem.executeAttack(attacker, target, isPrecision, smokePositions)
      
      for (const u of units) {
        combatSystem.levelUp(u)
      }
      
      eventBus.emit(EVENTS.UNIT_ATTACKED, { attackerId, targetId, result })
      eventBus.emit(EVENTS.ANIMATION_COMPLETE)
      
      const playerAlive = units.some((u) => u.team === 'player' && u.stats.hp > 0)
      const enemyAlive = units.some((u) => u.team === 'enemy' && u.stats.hp > 0)
      
      if (!playerAlive) {
        set({ phase: 'game_over' })
        eventBus.emit(EVENTS.GAME_OVER)
      } else if (!enemyAlive) {
        set({ phase: 'victory' })
        eventBus.emit(EVENTS.VICTORY)
      }
      
      const { selectedUnitId } = get()
      if (selectedUnitId === attackerId) {
        get().selectUnit(attackerId)
      }
    } catch (e) {
      console.error('Attack unit failed:', e)
    } finally {
      set({ isAnimating: false, selectedSkillId: null })
    }
  },
  
  useSkill: async (unitId, skillId, target) => {
    const { units, combatSystem, coverSystem } = get()
    const unit = units.find((u) => u.id === unitId)
    if (!unit || !combatSystem) return
    
    const skill = unit.skills.find((s) => s.id === skillId)
    if (!skill || skill.currentCooldown > 0 || unit.ap < skill.apCost) return
    
    set({ isAnimating: true, turnPhase: 'execute_action' })
    
    try {
      unit.ap -= skill.apCost
      skill.currentCooldown = skill.cooldown
      
      switch (skillId) {
        case 'overwatch': {
          unit.isOverwatch = true
          eventBus.emit(EVENTS.LOG_MESSAGE, {
            id: generateId(),
            timestamp: Date.now(),
            message: `${unit.name} 进入警戒状态`,
            type: 'info',
          })
          break
        }
        
        case 'dash': {
          if (target && typeof target !== 'string') {
            await get().moveUnit(unitId, target)
            unit.ap++
          }
          break
        }
        
        case 'heal': {
          if (typeof target === 'string') {
            const targetUnit = units.find((u) => u.id === target)
            if (targetUnit) {
              combatSystem.heal(unit, targetUnit, 40)
            }
          }
          break
        }
        
        case 'revive': {
          if (typeof target === 'string') {
            const targetUnit = units.find((u) => u.id === target)
            if (targetUnit) {
              combatSystem.revive(unit, targetUnit)
            }
          }
          break
        }
        
        case 'frag_grenade': {
          if (target && typeof target !== 'string') {
            eventBus.emit(EVENTS.ANIMATION_START, { type: 'grenade', position: target })
            await new Promise((resolve) => setTimeout(resolve, 500))
            combatSystem.throwGrenade(unit, target, 'frag', units)
            eventBus.emit(EVENTS.ANIMATION_COMPLETE)
          }
          break
        }
        
        case 'smoke_grenade': {
          if (target && typeof target !== 'string') {
            eventBus.emit(EVENTS.ANIMATION_START, { type: 'smoke', position: target })
            await new Promise((resolve) => setTimeout(resolve, 500))
            const result = combatSystem.throwGrenade(unit, target, 'smoke', units)
            if (result.smoke) {
              set({ smokeClouds: [...get().smokeClouds, result.smoke] })
            }
            eventBus.emit(EVENTS.ANIMATION_COMPLETE)
          }
          break
        }
        
        case 'place_mine': {
          const mine = combatSystem.placeMine(unit, unit.position)
          set({ mines: [...get().mines, mine] })
          break
        }
        
        case 'repair_cover': {
          if (target && typeof target !== 'string' && coverSystem) {
            combatSystem.repairCover(unit, target)
            set({ tiles: [...get().tiles] })
          }
          break
        }
      }
      
      for (const u of units) {
        combatSystem.levelUp(u)
      }
      
      const playerAlive = units.some((u) => u.team === 'player' && u.stats.hp > 0)
      const enemyAlive = units.some((u) => u.team === 'enemy' && u.stats.hp > 0)
      
      if (!playerAlive) {
        set({ phase: 'game_over' })
        eventBus.emit(EVENTS.GAME_OVER)
      } else if (!enemyAlive) {
        set({ phase: 'victory' })
        eventBus.emit(EVENTS.VICTORY)
      }
      
      eventBus.emit(EVENTS.ACTION_PERFORMED, { type: 'skill', skillId, unitId })
      
      const { selectedUnitId } = get()
      if (selectedUnitId === unitId) {
        get().selectUnit(unitId)
      }
    } catch (e) {
      console.error('Use skill failed:', e)
    } finally {
      set({ isAnimating: false, selectedSkillId: null })
    }
  },
  
  endTurn: () => {
    const { currentTeam, currentTurn, units, smokeClouds } = get()
    
    for (const unit of units) {
      if (unit.team === currentTeam) {
        for (const skill of unit.skills) {
          if (skill.currentCooldown > 0) {
            skill.currentCooldown--
          }
        }
        
        if (unit.isSuppressed) {
          unit.suppressionTurns--
          if (unit.suppressionTurns <= 0) {
            unit.isSuppressed = false
          }
        }
      }
    }
    
    const updatedSmoke = smokeClouds
      .map((s) => ({ ...s, turnsRemaining: s.turnsRemaining - 1 }))
      .filter((s) => s.turnsRemaining > 0)
    set({ smokeClouds: updatedSmoke })
    
    eventBus.emit(EVENTS.TURN_END, { team: currentTeam, turn: currentTurn })
    
    if (currentTeam === 'player') {
      set({
        currentTeam: 'enemy',
        phase: 'enemy_turn',
        selectedUnitId: null,
        selectedSkillId: null,
        reachableTiles: [],
        attackableTargets: [],
      })
      eventBus.emit(EVENTS.TURN_START, { team: 'enemy', turn: currentTurn })
      
      void get().executeEnemyTurn()
    } else {
      const newTurn = currentTurn + 1
      
      for (const unit of units) {
        if (unit.team === 'player') {
          unit.ap = unit.maxAp
          unit.isOverwatch = false
        }
      }
      
      set({
        currentTeam: 'player',
        currentTurn: newTurn,
        phase: 'player_turn',
        turnPhase: 'select_unit',
        selectedUnitId: null,
        selectedSkillId: null,
        reachableTiles: [],
        attackableTargets: [],
      })
      
      eventBus.emit(EVENTS.TURN_START, { team: 'player', turn: newTurn })
      eventBus.emit(EVENTS.LOG_MESSAGE, {
        id: generateId(),
        timestamp: Date.now(),
        message: `第 ${newTurn} 回合 - 玩家回合`,
        type: 'info',
      })
    }
  },
  
  executeEnemyTurn: async () => {
    const { units, aiSystem, smokeClouds, combatSystem } = get()
    if (!aiSystem || !combatSystem) return
    
    const enemies = units.filter((u) => u.team === 'enemy' && u.stats.hp > 0)
    
    for (const enemy of enemies) {
      if (enemy.stats.hp <= 0) continue
      
      enemy.ap = enemy.maxAp
      enemy.isOverwatch = false
      
      const handleAction = async (action: AIAction) => {
        try {
          if (action.type === 'move' && action.position) {
            await get().moveUnit(enemy.id, action.position)
          } else if (action.type === 'attack' && typeof action.target === 'string') {
            await get().attackUnit(enemy.id, action.target)
          } else if (action.type === 'grenade' && action.position && action.skill) {
            await get().useSkill(enemy.id, action.skill, action.position)
          } else if (action.type === 'skill' && action.skill) {
            await get().useSkill(enemy.id, action.skill, action.target || action.position)
          } else if (action.type === 'overwatch') {
            await get().useSkill(enemy.id, 'overwatch')
          }
        } catch (e) {
          console.error('Enemy action failed:', e)
        }
      }
      
      try {
        await aiSystem.executeAITurn(enemy, units, smokeClouds, handleAction)
      } catch (e) {
        console.error('AI turn failed for enemy:', e)
      }
      
      if (enemy.ap > 0) {
        enemy.isOverwatch = true
      }
    }
    
    try {
      get().endTurn()
    } catch (e) {
      console.error('End turn failed:', e)
    }
  },
  
  addActionLog: (log) => {
    set({
      actionLogs: [
        ...get().actionLogs,
        { ...log, id: generateId(), timestamp: Date.now() },
      ].slice(-50),
    })
  },
  
  resetGame: () => {
    set({
      phase: 'menu',
      turnPhase: 'select_unit',
      currentTurn: 1,
      currentTeam: 'player',
      units: [],
      selectedUnitId: null,
      selectedSkillId: null,
      reachableTiles: [],
      attackableTargets: [],
      actionLogs: [],
      smokeClouds: [],
      mines: [],
      isAnimating: false,
      currentLevel: null,
    })
    eventBus.clear()
  },
}))

eventBus.on(EVENTS.LOG_MESSAGE, (log) => {
  useGameStore.getState().actionLogs.push(log as ActionLog)
})
