import { CanvasRenderer } from './renderer/CanvasRenderer'
import useGameStore from './store'
import { getDistance, calculateDamage } from './utils/battle'
import { generateEquipment } from './utils/equipmentGenerator'

class Game {
  private renderer: CanvasRenderer
  private lastTime: number = 0
  private keys: Set<string> = new Set()
  private selectedTarget: string | null = null
  private castStartTime: number = 0

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new CanvasRenderer(canvas)
    this.renderer.setScale(1.5)
    this.setupEventListeners()
    this.initGame()
  }

  private initGame(): void {
    const store = useGameStore.getState()
    store.spawnMonsters()
    
    store.addItemToInventory(generateEquipment('iron_sword', 'rare'))
    store.addItemToInventory(generateEquipment('cloth', 'uncommon'))
    store.addItemToInventory(generateEquipment('iron_helmet', 'rare'))
  }

  private setupEventListeners(): void {
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.key.toLowerCase())
      
      const skillIndex = parseInt(e.key) - 1
      if (skillIndex >= 0 && skillIndex <= 9) {
        this.useSkill(skillIndex)
      }
    })
    
    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.key.toLowerCase())
    })

    const canvas = document.querySelector('canvas')
    if (canvas) {
      canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect()
        this.handleClick(e.clientX - rect.left, e.clientY - rect.top)
      })
    }
  }

  private handleClick(mouseX: number, mouseY: number): void {
    const state = useGameStore.getState()
    const player = state.player
    
    const scale = 1.5
    const cameraX = player.position.x * 32 - mouseX / scale
    const cameraY = player.position.y * 32 - mouseY / scale
    
    const worldX = (mouseX / scale + cameraX) / 32
    const worldY = (mouseY / scale + cameraY) / 32
    
    state.monsters.forEach(monster => {
      const dist = Math.sqrt(
        Math.pow(monster.position.x - worldX, 2) + 
        Math.pow(monster.position.y - worldY, 2)
      )
      if (dist < 0.5) {
        this.selectedTarget = monster.id
      }
    })
    
    state.droppedItems.forEach(drop => {
      const dist = Math.sqrt(
        Math.pow(drop.position.x - worldX, 2) + 
        Math.pow(drop.position.y - worldY, 2)
      )
      if (dist < 0.5) {
        state.pickupItem(drop.id)
      }
    })
  }

  private useSkill(index: number): void {
    const state = useGameStore.getState()
    const skill = state.player.skills[index]
    
    if (!skill || skill.currentCooldown > 0) return
    
    if (this.selectedTarget) {
      const monster = state.monsters.find(m => m.id === this.selectedTarget)
      if (monster) {
        const dist = getDistance(state.player.position, monster.position)
        if (dist <= skill.range) {
          state.useSkill(index, this.selectedTarget)
          
          setTimeout(() => {
            const isMagic = state.player.class === 'mage' || state.player.class === 'taoist'
            const damage = calculateDamage(state.player, monster, skill, isMagic)
            state.damageMonster(this.selectedTarget!, damage)
            
            if (Math.random() < 0.05) {
              state.updatePKValue(5)
            }
          }, skill.castTime)
        }
      }
    } else {
      if (skill.id === 'heal' && state.player.class === 'taoist') {
        state.useSkill(index, null)
        setTimeout(() => {
          const healAmount = Math.floor(state.player.stats.maxHp * 0.3)
          state.updatePlayerStats({
            hp: Math.min(state.player.stats.maxHp, state.player.stats.hp + healAmount)
          })
        }, skill.castTime)
      }
    }
  }

  private handleMovement(deltaTime: number): void {
    const speed = 0.003 * deltaTime
    const state = useGameStore.getState()
    let dx = 0
    let dy = 0
    
    if (this.keys.has('w') || this.keys.has('arrowup')) dy -= speed
    if (this.keys.has('s') || this.keys.has('arrowdown')) dy += speed
    if (this.keys.has('a') || this.keys.has('arrowleft')) dx -= speed
    if (this.keys.has('d') || this.keys.has('arrowright')) dx += speed
    
    if (dx !== 0 || dy !== 0) {
      const newX = state.player.position.x + dx
      const newY = state.player.position.y + dy
      
      const mapData = state.mapData
      const cellX = Math.floor(newX)
      const cellY = Math.floor(newY)
      
      if (cellX >= 0 && cellX < mapData[0].length && 
          cellY >= 0 && cellY < mapData.length && 
          mapData[cellY][cellX].walkable) {
        state.updatePlayerPosition(newX, newY)
      }
    }
  }

  private updateMonsterAI(deltaTime: number): void {
    const state = useGameStore.getState()
    
    state.monsters.forEach(monster => {
      if (monster.aiState === 'attack' && monster.targetId === state.player.id) {
        if (Math.random() < 0.02) {
          const damage = Math.floor(monster.stats.attack * 0.5 - state.player.stats.defense * 0.2)
          state.damagePlayer(Math.max(1, damage))
        }
      }
    })
  }

  public update(currentTime: number): void {
    const deltaTime = currentTime - this.lastTime
    this.lastTime = currentTime

    const state = useGameStore.getState()
    
    this.handleMovement(deltaTime)
    state.updateMonsterPositions(deltaTime)
    state.updateSkillCooldowns(deltaTime)
    this.updateMonsterAI(deltaTime)
    
    const newMp = Math.min(
      state.player.stats.maxMp,
      state.player.stats.mp + 0.01 * deltaTime
    )
    state.updatePlayerStats({ mp: newMp })
    
    const newHp = Math.min(
      state.player.stats.maxHp,
      state.player.stats.hp + 0.005 * deltaTime
    )
    state.updatePlayerStats({ hp: newHp })

    if (state.monsters.length < 5 && Math.random() < 0.001) {
      state.spawnMonsters()
    }
  }

  public render(): void {
    const state = useGameStore.getState()
    
    this.renderer.updateCamera(state.player.position.x, state.player.position.y)
    this.renderer.clear()
    
    this.renderer.renderMap(state.mapData)
    this.renderer.renderDroppedItems(state.droppedItems)
    this.renderer.renderMonsters(state.monsters)
    this.renderer.renderPlayer(state.player)
    
    this.renderer.renderUI(state.player)
    this.renderer.renderMinimap(state.player, state.mapData, state.monsters)
    this.renderer.renderSkillBar(state.player)
    this.renderer.renderAnnouncements(state.announcements)
    this.renderer.renderStats(state.player)
  }

  public start(): void {
    const gameLoop = (currentTime: number) => {
      this.update(currentTime)
      this.render()
      requestAnimationFrame(gameLoop)
    }
    
    requestAnimationFrame(gameLoop)
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement
  if (canvas) {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    
    const game = new Game(canvas)
    game.start()

    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    })
  }
})

export default Game
