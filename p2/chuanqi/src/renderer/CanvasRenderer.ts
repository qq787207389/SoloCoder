import { Character, Monster, MapCell } from '../types'
import { CELL_SIZE, MAP_WIDTH, MAP_HEIGHT, terrainColors } from '../data/map'
import { qualityColor } from '../data/affixes'
import { classNameMap } from '../data/classes'

export class CanvasRenderer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private cameraX: number = 0
  private cameraY: number = 0
  private scale: number = 1

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
  }

  setScale(scale: number): void {
    this.scale = scale
  }

  updateCamera(playerX: number, playerY: number): void {
    this.cameraX = playerX * CELL_SIZE - this.canvas.width / (2 * this.scale)
    this.cameraY = playerY * CELL_SIZE - this.canvas.height / (2 * this.scale)
  }

  clear(): void {
    this.ctx.fillStyle = '#1a1a1a'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }

  renderMap(mapData: MapCell[][]): void {
    this.ctx.save()
    this.ctx.scale(this.scale, this.scale)
    this.ctx.translate(-this.cameraX, -this.cameraY)

    for (let y = 0; y < mapData.length; y++) {
      for (let x = 0; x < mapData[y].length; x++) {
        const cell = mapData[y][x]
        this.ctx.fillStyle = terrainColors[cell.terrain]
        this.ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE)
        
        this.ctx.strokeStyle = 'rgba(0,0,0,0.2)'
        this.ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE)
      }
    }

    this.ctx.restore()
  }

  renderPlayer(player: Character): void {
    this.ctx.save()
    this.ctx.scale(this.scale, this.scale)
    this.ctx.translate(-this.cameraX, -this.cameraY)

    const x = player.position.x * CELL_SIZE
    const y = player.position.y * CELL_SIZE
    const size = CELL_SIZE * 0.8

    let playerColor = '#3498db'
    if (player.class === 'warrior') playerColor = '#e74c3c'
    if (player.class === 'mage') playerColor = '#9b59b6'
    if (player.class === 'taoist') playerColor = '#2ecc71'

    this.ctx.beginPath()
    this.ctx.arc(x, y, size / 2, 0, Math.PI * 2)
    this.ctx.fillStyle = playerColor
    this.ctx.fill()
    this.ctx.strokeStyle = '#fff'
    this.ctx.lineWidth = 2
    this.ctx.stroke()

    this.ctx.fillStyle = '#fff'
    this.ctx.font = '10px Arial'
    this.ctx.textAlign = 'center'
    this.ctx.fillText(player.name, x, y - size / 2 - 8)

    const hpPercent = player.stats.hp / player.stats.maxHp
    this.ctx.fillStyle = '#333'
    this.ctx.fillRect(x - 15, y - size / 2 - 20, 30, 5)
    this.ctx.fillStyle = hpPercent > 0.3 ? '#2ecc71' : '#e74c3c'
    this.ctx.fillRect(x - 15, y - size / 2 - 20, 30 * hpPercent, 5)

    this.ctx.restore()
  }

  renderMonsters(monsters: Monster[]): void {
    this.ctx.save()
    this.ctx.scale(this.scale, this.scale)
    this.ctx.translate(-this.cameraX, -this.cameraY)

    monsters.forEach(monster => {
      const x = monster.position.x * CELL_SIZE
      const y = monster.position.y * CELL_SIZE
      const size = monster.isBoss ? CELL_SIZE * 1.2 : CELL_SIZE * 0.7

      this.ctx.beginPath()
      this.ctx.arc(x, y, size / 2, 0, Math.PI * 2)
      this.ctx.fillStyle = monster.isBoss ? '#8e44ad' : '#c0392b'
      this.ctx.fill()
      this.ctx.strokeStyle = monster.isBoss ? '#ffd700' : '#000'
      this.ctx.lineWidth = 2
      this.ctx.stroke()

      this.ctx.fillStyle = '#fff'
      this.ctx.font = '9px Arial'
      this.ctx.textAlign = 'center'
      this.ctx.fillText(monster.name, x, y - size / 2 - 6)

      const hpPercent = monster.stats.hp / monster.stats.maxHp
      this.ctx.fillStyle = '#333'
      this.ctx.fillRect(x - 15, y - size / 2 - 16, 30, 4)
      this.ctx.fillStyle = '#e74c3c'
      this.ctx.fillRect(x - 15, y - size / 2 - 16, 30 * hpPercent, 4)
    })

    this.ctx.restore()
  }

  renderDroppedItems(items: { id: string; item: any; position: any }[]): void {
    this.ctx.save()
    this.ctx.scale(this.scale, this.scale)
    this.ctx.translate(-this.cameraX, -this.cameraY)

    items.forEach(drop => {
      const x = drop.position.x * CELL_SIZE
      const y = drop.position.y * CELL_SIZE

      this.ctx.beginPath()
      this.ctx.arc(x, y, 8, 0, Math.PI * 2)
      this.ctx.fillStyle = qualityColor[drop.item.quality as keyof typeof qualityColor] || '#999'
      this.ctx.fill()
      this.ctx.strokeStyle = '#fff'
      this.ctx.lineWidth = 1
      this.ctx.stroke()

      this.ctx.fillStyle = '#fff'
      this.ctx.font = '8px Arial'
      this.ctx.textAlign = 'center'
      this.ctx.fillText('!', x, y + 3)
    })

    this.ctx.restore()
  }

  renderUI(player: Character): void {
    this.ctx.save()

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
    this.ctx.fillRect(10, 10, 180, 50)

    this.ctx.fillStyle = '#333'
    this.ctx.fillRect(20, 20, 160, 14)
    this.ctx.fillStyle = '#e74c3c'
    this.ctx.fillRect(20, 20, 160 * (player.stats.hp / player.stats.maxHp), 14)
    this.ctx.fillStyle = '#fff'
    this.ctx.font = '10px Arial'
    this.ctx.textAlign = 'center'
    this.ctx.fillText(`HP: ${player.stats.hp}/${player.stats.maxHp}`, 100, 30)

    this.ctx.fillStyle = '#333'
    this.ctx.fillRect(20, 38, 160, 14)
    this.ctx.fillStyle = '#3498db'
    this.ctx.fillRect(20, 38, 160 * (player.stats.mp / player.stats.maxMp), 14)
    this.ctx.fillStyle = '#fff'
    this.ctx.fillText(`MP: ${player.stats.mp}/${player.stats.maxMp}`, 100, 48)

    this.ctx.restore()
  }

  renderMinimap(player: Character, mapData: MapCell[][], monsters: Monster[]): void {
    const minimapSize = 120
    const cellScale = minimapSize / Math.max(MAP_WIDTH, MAP_HEIGHT)
    
    this.ctx.save()
    
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
    this.ctx.fillRect(this.canvas.width - minimapSize - 15, 10, minimapSize, minimapSize)
    
    for (let y = 0; y < mapData.length; y++) {
      for (let x = 0; x < mapData[y].length; x++) {
        const cell = mapData[y][x]
        this.ctx.fillStyle = cell.walkable 
          ? (cell.terrain === 'water' ? '#3498db55' : '#4a7c3955')
          : '#333'
        this.ctx.fillRect(
          this.canvas.width - minimapSize - 15 + x * cellScale,
          10 + y * cellScale,
          cellScale,
          cellScale
        )
      }
    }

    monsters.forEach(monster => {
      this.ctx.fillStyle = monster.isBoss ? '#ffd700' : '#ff0000'
      this.ctx.fillRect(
        this.canvas.width - minimapSize - 15 + monster.position.x * cellScale - 1,
        10 + monster.position.y * cellScale - 1,
        3,
        3
      )
    })

    this.ctx.fillStyle = '#00ff00'
    this.ctx.fillRect(
      this.canvas.width - minimapSize - 15 + player.position.x * cellScale - 2,
      10 + player.position.y * cellScale - 2,
      5,
      5
    )

    this.ctx.strokeStyle = '#666'
    this.ctx.strokeRect(this.canvas.width - minimapSize - 15, 10, minimapSize, minimapSize)
    
    this.ctx.restore()
  }

  renderSkillBar(player: Character): void {
    this.ctx.save()
    
    const skillCount = player.skills.length
    const barWidth = skillCount * 45 + 10
    const startX = (this.canvas.width - barWidth) / 2
    const startY = this.canvas.height - 60

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
    this.ctx.fillRect(startX, startY, barWidth, 50)

    player.skills.forEach((skill, index) => {
      const x = startX + 5 + index * 45
      const y = startY + 5

      this.ctx.fillStyle = skill.currentCooldown > 0 ? '#444' : '#2c3e50'
      this.ctx.fillRect(x, y, 40, 40)

      this.ctx.strokeStyle = skill.currentCooldown > 0 ? '#666' : '#3498db'
      this.ctx.lineWidth = 2
      this.ctx.strokeRect(x, y, 40, 40)

      this.ctx.fillStyle = '#fff'
      this.ctx.font = 'bold 14px Arial'
      this.ctx.textAlign = 'center'
      this.ctx.fillText(String(index + 1), x + 20, y + 25)

      this.ctx.font = '9px Arial'
      this.ctx.fillText(skill.name.substring(0, 4), x + 20, y + 38)

      if (skill.currentCooldown > 0) {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
        const cooldownPercent = skill.currentCooldown / skill.cooldown
        this.ctx.fillRect(x, y, 40, 40 * cooldownPercent)
        
        this.ctx.fillStyle = '#fff'
        this.ctx.font = 'bold 12px Arial'
        this.ctx.fillText((skill.currentCooldown / 1000).toFixed(1) + 's', x + 20, y + 25)
      }
    })

    this.ctx.restore()
  }

  renderAnnouncements(announcements: { id: number; message: string; time: number }[]): void {
    this.ctx.save()
    
    announcements.forEach((ann, index) => {
      const alpha = 1 - index * 0.1
      this.ctx.fillStyle = `rgba(255, 200, 0, ${alpha})`
      this.ctx.font = 'bold 14px Arial'
      this.ctx.textAlign = 'center'
      this.ctx.fillText(ann.message, this.canvas.width / 2, 80 + index * 20)
    })
    
    this.ctx.restore()
  }

  renderStats(player: Character): void {
    this.ctx.save()
    
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
    this.ctx.fillRect(10, 70, 180, 100)
    
    this.ctx.fillStyle = '#fff'
    this.ctx.font = '12px Arial'
    this.ctx.textAlign = 'left'
    
    let y = 85
    const stats = [
      `等级: ${player.level}`,
      `职业: ${classNameMap[player.class]}`,
      `攻击: ${player.stats.attack}`,
      `防御: ${player.stats.defense}`,
      `魔攻: ${player.stats.magicAttack}`,
      `魔防: ${player.stats.magicDefense}`,
      `金币: ${player.gold}`,
      `PK: ${player.pkStatus === 'red' ? '红名' : player.pkStatus === 'gray' ? '灰名' : '白名'} (${player.pkValue})`
    ]
    
    stats.forEach(stat => {
      this.ctx.fillText(stat, 20, y)
      y += 12
    })
    
    this.ctx.restore()
  }
}
