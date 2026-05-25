import Phaser from 'phaser'
import type { Character, Tile, Position, SmokeCloud, Mine } from '@/types'
import { ISO_TILE_WIDTH, ISO_TILE_HEIGHT, TILE_HEIGHT, COLORS } from '@/config/constants'
import { gridToIso, getDepth } from '@/utils/isometric'
import { useGameStore } from '@/store/gameStore'
import { eventBus, EVENTS } from '@/core/EventBus'

interface TileSprite {
  sprite: Phaser.GameObjects.Graphics
  position: Position
  depth: number
}

interface UnitSprite {
  container: Phaser.GameObjects.Container
  sprite: Phaser.GameObjects.Shape
  hpBar: Phaser.GameObjects.Graphics
  apIndicator: Phaser.GameObjects.Graphics
  unitId: string
  position: Position
  depth: number
}

interface EffectSprite {
  sprite: Phaser.GameObjects.Graphics | Phaser.GameObjects.Shape
  type: 'smoke' | 'mine' | 'move_range' | 'attack_range' | 'selected'
  position: Position
  depth: number
}

export class IsometricScene extends Phaser.Scene {
  private tiles: TileSprite[][] = []
  private unitSprites: Map<string, UnitSprite> = new Map()
  private effectSprites: EffectSprite[] = []
  private isDragging: boolean = false
  private lastPointer: { x: number; y: number } = { x: 0, y: 0 }
  private zoomLevel: number = 1
  private mapWidth: number = 0
  private mapHeight: number = 0
  private isSceneActive: boolean = false

  constructor() {
    super('IsometricScene')
  }

  create(): void {
    const state = useGameStore.getState()
    this.mapWidth = state.mapWidth
    this.mapHeight = state.mapHeight
    this.isSceneActive = true

    this.setupCamera()
    this.setupInput()
    this.renderMap()
    this.renderUnits()
    this.setupEventListeners()

    this.cameras.main.setBackgroundColor(0x1a1a2e)
  }

  private setupCamera(): void {
    const centerGridX = this.mapWidth / 2
    const centerGridY = this.mapHeight / 2
    const centerIso = gridToIso(centerGridX, centerGridY, 0)

    this.cameras.main.setZoom(this.zoomLevel)
    this.cameras.main.scrollX = centerIso.x - this.scale.width / 2 / this.zoomLevel
    this.cameras.main.scrollY = centerIso.y - this.scale.height / 2 / this.zoomLevel
  }

  private setupInput(): void {
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.rightButtonDown()) {
        this.isDragging = true
        this.lastPointer = { x: pointer.x, y: pointer.y }
      } else if (pointer.leftButtonDown()) {
        this.handleLeftClick(pointer)
      }
    })

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isDragging) {
        const dx = pointer.x - this.lastPointer.x
        const dy = pointer.y - this.lastPointer.y
        this.cameras.main.scrollX -= dx / this.zoomLevel
        this.cameras.main.scrollY -= dy / this.zoomLevel
        this.lastPointer = { x: pointer.x, y: pointer.y }
      }

      this.handleHover(pointer)
    })

    this.input.on('pointerup', () => {
      this.isDragging = false
    })

    this.input.on('wheel', (_pointer: unknown, _gameObjects: unknown, _x: unknown, _y: unknown, deltaY: number) => {
      const oldZoom = this.zoomLevel
      const newZoom = Phaser.Math.Clamp(oldZoom - deltaY * 0.001, 0.5, 2)
      
      const centerX = this.cameras.main.midPoint.x
      const centerY = this.cameras.main.midPoint.y
      
      this.zoomLevel = newZoom
      this.cameras.main.setZoom(newZoom)
      
      const newCenterX = this.cameras.main.midPoint.x
      const newCenterY = this.cameras.main.midPoint.y
      
      this.cameras.main.scrollX += centerX - newCenterX
      this.cameras.main.scrollY += centerY - newCenterY
    })

    this.input.keyboard?.on('keydown-ESC', () => {
      useGameStore.getState().selectUnit(null)
    })
  }

  private setupEventListeners(): void {
    const unsubscribe = useGameStore.subscribe((state) => {
      if (!this.isSceneActive) return
      this.updateUnits(state.units)
      this.updateHighlights(state.reachableTiles, state.attackableTargets, state.selectedUnitId)
      this.updateSmokeClouds(state.smokeClouds)
      this.updateMines(state.mines)
      this.updateTiles(state.tiles)
    })

    eventBus.on(EVENTS.UNIT_MOVED, () => {
      if (!this.isSceneActive) return
      const state = useGameStore.getState()
      this.updateUnits(state.units)
    })

    eventBus.on(EVENTS.UNIT_DAMAGED, (data: unknown) => {
      if (!this.isSceneActive) return
      const { targetId, damage } = data as { targetId: string; damage: number }
      this.showDamageNumber(targetId, damage)
    })

    eventBus.on(EVENTS.UNIT_HEALED, (data: unknown) => {
      if (!this.isSceneActive) return
      const { targetId, amount } = data as { targetId: string; amount: number }
      this.showHealNumber(targetId, amount)
    })

    eventBus.on(EVENTS.ANIMATION_START, (data: unknown) => {
      if (!this.isSceneActive) return
      const anim = data as { type: string; attackerId?: string; targetId?: string; position?: Position }
      if (anim.type === 'attack' && anim.attackerId && anim.targetId) {
        this.playAttackAnimation(anim.attackerId, anim.targetId)
      } else if (anim.type === 'grenade' && anim.position) {
        this.playGrenadeAnimation(anim.position)
      } else if (anim.type === 'smoke' && anim.position) {
        this.playSmokeAnimation(anim.position)
      }
    })

    this.events.once('shutdown', () => {
      this.isSceneActive = false
      unsubscribe()
    })
  }

  private renderMap(): void {
    const state = useGameStore.getState()
    this.tiles = []

    for (let y = 0; y < this.mapHeight; y++) {
      this.tiles[y] = []
      for (let x = 0; x < this.mapWidth; x++) {
        const tile = state.tiles[y]?.[x]
        if (tile) {
          this.renderTile(tile)
        }
      }
    }
  }

  private renderTile(tile: Tile): void {
    const iso = gridToIso(tile.position.x, tile.position.y, tile.height)
    const depth = getDepth(tile.position.x, tile.position.y, tile.height)

    const graphics = this.add.graphics()
    graphics.setDepth(depth)

    this.drawIsometricTile(graphics, iso.x, iso.y, tile)

    if (tile.height > 0) {
      this.drawTileHeight(graphics, iso.x, iso.y, tile)
    }

    this.tiles[tile.position.y][tile.position.x] = {
      sprite: graphics,
      position: tile.position,
      depth,
    }
  }

  private drawIsometricTile(graphics: Phaser.GameObjects.Graphics, x: number, y: number, tile: Tile): void {
    const halfWidth = ISO_TILE_WIDTH / 2
    const halfHeight = ISO_TILE_HEIGHT / 2

    graphics.clear()

    let color = COLORS.ground
    switch (tile.type) {
      case 'ground':
        color = COLORS.ground
        break
      case 'wall':
        color = COLORS.wall
        break
      case 'half_cover':
        color = COLORS.half_cover
        break
      case 'full_cover':
        color = COLORS.full_cover
        break
      case 'high_ground':
        color = COLORS.high_ground
        break
      case 'rubble':
        color = COLORS.rubble
        break
      case 'water':
        color = COLORS.water
        break
      case 'door':
        color = COLORS.door
        break
      case 'window':
        color = COLORS.window
        break
    }

    graphics.fillStyle(color)
    graphics.lineStyle(1, 0x000000, 0.3)

    graphics.beginPath()
    graphics.moveTo(x, y - halfHeight)
    graphics.lineTo(x + halfWidth, y)
    graphics.lineTo(x, y + halfHeight)
    graphics.lineTo(x - halfWidth, y)
    graphics.closePath()
    graphics.fill()
    graphics.stroke()

    if (tile.type === 'half_cover' || tile.type === 'full_cover') {
      graphics.fillStyle(0x2a2a2a, 0.5)
      graphics.beginPath()
      graphics.moveTo(x, y - halfHeight * 0.7)
      graphics.lineTo(x + halfWidth * 0.7, y - halfHeight * 0.2)
      graphics.lineTo(x, y + halfHeight * 0.3)
      graphics.lineTo(x - halfWidth * 0.7, y - halfHeight * 0.2)
      graphics.closePath()
      graphics.fill()
    }

    if (tile.destructible && tile.hp < tile.maxHp) {
      const hpRatio = tile.hp / tile.maxHp
      graphics.fillStyle(0xff0000)
      graphics.fillRect(x - 15, y - halfHeight - 10, 30, 4)
      graphics.fillStyle(0x00ff00)
      graphics.fillRect(x - 15, y - halfHeight - 10, 30 * hpRatio, 4)
    }
  }

  private drawTileHeight(graphics: Phaser.GameObjects.Graphics, x: number, y: number, tile: Tile): void {
    const halfWidth = ISO_TILE_WIDTH / 2
    const halfHeight = ISO_TILE_HEIGHT / 2
    const height = tile.height * TILE_HEIGHT

    let sideColor = 0x3a3a3a
    if (tile.type === 'high_ground') sideColor = 0x8B4513
    if (tile.type === 'wall') sideColor = 0x2a2a2a

    graphics.fillStyle(sideColor)

    graphics.beginPath()
    graphics.moveTo(x + halfWidth, y)
    graphics.lineTo(x + halfWidth, y + height)
    graphics.lineTo(x, y + height + halfHeight)
    graphics.lineTo(x, y + halfHeight)
    graphics.closePath()
    graphics.fill()

    graphics.fillStyle(Phaser.Display.Color.GetColor(
      Math.floor(Phaser.Display.Color.IntegerToRGB(sideColor).r * 0.8),
      Math.floor(Phaser.Display.Color.IntegerToRGB(sideColor).g * 0.8),
      Math.floor(Phaser.Display.Color.IntegerToRGB(sideColor).b * 0.8)
    ))
    graphics.beginPath()
    graphics.moveTo(x - halfWidth, y)
    graphics.lineTo(x - halfWidth, y + height)
    graphics.lineTo(x, y + height + halfHeight)
    graphics.lineTo(x, y + halfHeight)
    graphics.closePath()
    graphics.fill()
  }

  private renderUnits(): void {
    const state = useGameStore.getState()
    this.unitSprites.clear()

    for (const unit of state.units) {
      if (unit.stats.hp > 0) {
        this.renderUnit(unit)
      }
    }
  }

  private renderUnit(unit: Character): void {
    const iso = gridToIso(unit.position.x, unit.position.y, 0)
    const depth = getDepth(unit.position.x, unit.position.y, 0) + 100

    const container = this.add.container(
      iso.x,
      iso.y - 30
    )
    container.setDepth(depth)

    const color = unit.team === 'player' ? COLORS.player : COLORS.enemy
    const size = unit.class === 'sniper' ? 18 : 22

    const body = this.add.ellipse(0, 0, size, size * 1.3, color)
    body.setStrokeStyle(2, 0x000000)
    container.add(body)

    const head = this.add.circle(0, -size * 0.8, size * 0.5, color)
    head.setStrokeStyle(2, 0x000000)
    container.add(head)

    const classColors: Record<string, number> = {
      assault: 0xff6b6b,
      sniper: 0x4ecdc4,
      medic: 0xffe66d,
      engineer: 0x95e1d3,
    }
    const classIcon = this.add.circle(0, -size * 1.5, 6, classColors[unit.class])
    container.add(classIcon)

    const hpBar = this.add.graphics()
    hpBar.y = size * 0.8
    container.add(hpBar)
    this.updateHpBar(hpBar, unit.stats.hp, unit.stats.maxHp)

    const apIndicator = this.add.graphics()
    apIndicator.y = size * 0.8 + 8
    container.add(apIndicator)
    this.updateApIndicator(apIndicator, unit.ap, unit.maxAp)

    if (unit.isOverwatch) {
      const overwatchIcon = this.add.text(0, -size * 2, '👁️', { fontSize: '16px' })
      overwatchIcon.setOrigin(0.5)
      container.add(overwatchIcon)
    }

    if (unit.isSuppressed) {
      const suppressIcon = this.add.text(size * 0.8, -size * 1.2, '💫', { fontSize: '14px' })
      suppressIcon.setOrigin(0.5)
      container.add(suppressIcon)
    }

    container.setInteractive(
      new Phaser.Geom.Ellipse(0, 0, size * 1.5, size * 2),
      Phaser.Geom.Ellipse.Contains
    )

    this.unitSprites.set(unit.id, {
      container,
      sprite: body,
      hpBar,
      apIndicator,
      unitId: unit.id,
      position: { ...unit.position },
      depth,
    })
  }

  private updateHpBar(graphics: Phaser.GameObjects.Graphics, current: number, max: number): void {
    graphics.clear()
    const width = 30
    const height = 4
    const ratio = current / max

    graphics.fillStyle(0x333333)
    graphics.fillRect(-width / 2, -height / 2, width, height)

    graphics.fillStyle(ratio > 0.5 ? 0x00ff00 : ratio > 0.25 ? 0xffff00 : 0xff0000)
    graphics.fillRect(-width / 2, -height / 2, width * ratio, height)

    graphics.lineStyle(1, 0x000000)
    graphics.strokeRect(-width / 2, -height / 2, width, height)
  }

  private updateApIndicator(graphics: Phaser.GameObjects.Graphics, current: number, max: number): void {
    graphics.clear()
    const size = 5
    const spacing = 2

    for (let i = 0; i < max; i++) {
      const x = (i - (max - 1) / 2) * (size + spacing)
      graphics.fillStyle(i < current ? 0x4169e1 : 0x333333)
      graphics.fillCircle(x, 0, size / 2)
      graphics.lineStyle(1, 0x000000)
      graphics.strokeCircle(x, 0, size / 2)
    }
  }

  private updateUnits(units: Character[]): void {
    for (const unit of units) {
      const unitSprite = this.unitSprites.get(unit.id)
      
      if (unit.stats.hp <= 0) {
        if (unitSprite) {
          this.tweens.add({
            targets: unitSprite.container,
            alpha: 0,
            scale: 0.5,
            duration: 300,
            onComplete: () => {
              unitSprite.container.destroy()
              this.unitSprites.delete(unit.id)
            },
          })
        }
        continue
      }

      if (!unitSprite) {
        this.renderUnit(unit)
        continue
      }

      if (unitSprite.position.x !== unit.position.x || unitSprite.position.y !== unit.position.y) {
        const iso = gridToIso(unit.position.x, unit.position.y, 0)
        const newDepth = getDepth(unit.position.x, unit.position.y, 0) + 100
        
        this.tweens.add({
          targets: unitSprite.container,
          x: iso.x,
          y: iso.y - 30,
          duration: 150,
          ease: 'Linear',
        })
        
        unitSprite.container.setDepth(newDepth)
        unitSprite.position = { ...unit.position }
        unitSprite.depth = newDepth
      }

      this.updateHpBar(unitSprite.hpBar, unit.stats.hp, unit.stats.maxHp)
      this.updateApIndicator(unitSprite.apIndicator, unit.ap, unit.maxAp)

      const state = useGameStore.getState()
      if (state.selectedUnitId === unit.id) {
        unitSprite.sprite.setStrokeStyle(3, COLORS.selected)
      } else {
        unitSprite.sprite.setStrokeStyle(2, 0x000000)
      }
    }
  }

  private updateHighlights(
    reachableTiles: Position[],
    attackableTargets: string[],
    selectedUnitId: string | null
  ): void {
    for (const effect of this.effectSprites) {
      if (effect.type === 'move_range' || effect.type === 'attack_range' || effect.type === 'selected') {
        effect.sprite.destroy()
      }
    }
    this.effectSprites = this.effectSprites.filter(
      (e) => e.type !== 'move_range' && e.type !== 'attack_range' && e.type !== 'selected'
    )

    for (const tile of reachableTiles) {
      this.highlightTile(tile, COLORS.moveRange, 0.3, 'move_range')
    }

    for (const targetId of attackableTargets) {
      const unitSprite = this.unitSprites.get(targetId)
      if (unitSprite) {
        const graphics = this.add.graphics()
        graphics.setDepth(unitSprite.depth + 1)
        
        const iso = gridToIso(unitSprite.position.x, unitSprite.position.y, 0)
        graphics.lineStyle(3, COLORS.attackRange)
        graphics.strokeCircle(
          iso.x,
          iso.y - 30,
          30
        )
        
        this.effectSprites.push({
          sprite: graphics,
          type: 'attack_range',
          position: unitSprite.position,
          depth: unitSprite.depth + 1,
        })
      }
    }

    if (selectedUnitId) {
      const unit = useGameStore.getState().units.find((u) => u.id === selectedUnitId)
      if (unit) {
        this.highlightTile(unit.position, COLORS.selected, 0.5, 'selected')
      }
    }
  }

  private highlightTile(position: Position, color: number, alpha: number, type: 'move_range' | 'selected'): void {
    const iso = gridToIso(position.x, position.y, 0)
    const depth = getDepth(position.x, position.y, 0) + 50

    const graphics = this.add.graphics()
    graphics.setDepth(depth)
    graphics.fillStyle(color, alpha)

    const halfWidth = ISO_TILE_WIDTH / 2
    const halfHeight = ISO_TILE_HEIGHT / 2

    graphics.beginPath()
    graphics.moveTo(iso.x, iso.y - halfHeight)
    graphics.lineTo(iso.x + halfWidth, iso.y)
    graphics.lineTo(iso.x, iso.y + halfHeight)
    graphics.lineTo(iso.x - halfWidth, iso.y)
    graphics.closePath()
    graphics.fill()

    this.effectSprites.push({
      sprite: graphics,
      type,
      position,
      depth,
    })
  }

  private updateSmokeClouds(smokeClouds: SmokeCloud[]): void {
    this.effectSprites = this.effectSprites.filter((e) => {
      if (e.type === 'smoke') {
        e.sprite.destroy()
        return false
      }
      return true
    })

    for (const smoke of smokeClouds) {
      const iso = gridToIso(smoke.position.x, smoke.position.y, 0)
      const depth = getDepth(smoke.position.x, smoke.position.y, 0) + 200

      const graphics = this.add.graphics()
      graphics.setDepth(depth)
      graphics.fillStyle(COLORS.smoke, 0.6)

      const radius = smoke.radius * ISO_TILE_WIDTH * 0.6
      graphics.beginPath()
      graphics.arc(iso.x, iso.y, radius, 0, Math.PI * 2)
      graphics.fill()

      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2
        const dist = radius * 0.7
        graphics.beginPath()
        graphics.arc(
          iso.x + Math.cos(angle) * dist,
          iso.y + Math.sin(angle) * dist * 0.5,
          radius * 0.5,
          0,
          Math.PI * 2
        )
        graphics.fill()
      }

      this.effectSprites.push({
        sprite: graphics,
        type: 'smoke',
        position: smoke.position,
        depth,
      })
    }
  }

  private updateMines(mines: Mine[]): void {
    this.effectSprites = this.effectSprites.filter((e) => {
      if (e.type === 'mine') {
        e.sprite.destroy()
        return false
      }
      return true
    })

    for (const mine of mines) {
      if (mine.team !== 'player') continue

      const iso = gridToIso(mine.position.x, mine.position.y, 0)
      const depth = getDepth(mine.position.x, mine.position.y, 0) + 150

      const mineSprite = this.add.circle(
        iso.x,
        iso.y,
        8,
        0xff0000
      )
      mineSprite.setDepth(depth)
      mineSprite.setStrokeStyle(2, 0xffff00)

      this.effectSprites.push({
        sprite: mineSprite,
        type: 'mine',
        position: mine.position,
        depth,
      })
    }
  }

  private updateTiles(tiles: Tile[][]): void {
    for (let y = 0; y < this.mapHeight; y++) {
      for (let x = 0; x < this.mapWidth; x++) {
        const tile = tiles[y]?.[x]
        const tileSprite = this.tiles[y]?.[x]
        
        if (tile && tileSprite) {
          const iso = gridToIso(x, y, tile.height)
          this.drawIsometricTile(tileSprite.sprite, iso.x, iso.y, tile)
          
          if (tile.height > 0) {
            this.drawTileHeight(tileSprite.sprite, iso.x, iso.y, tile)
          }
        }
      }
    }
  }

  private handleLeftClick(pointer: Phaser.Input.Pointer): void {
    const state = useGameStore.getState()
    if (state.phase !== 'player_turn' || state.isAnimating) return

    const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y)
    const gridX = Math.floor((worldPoint.x / (ISO_TILE_WIDTH / 2) + worldPoint.y / (ISO_TILE_HEIGHT / 2)) / 2)
    const gridY = Math.floor((worldPoint.y / (ISO_TILE_HEIGHT / 2) - worldPoint.x / (ISO_TILE_WIDTH / 2)) / 2)

    const clickedUnit = state.units.find(
      (u) => u.stats.hp > 0 && u.position.x === gridX && u.position.y === gridY
    )

    if (state.turnPhase === 'select_unit' || state.turnPhase === 'select_action') {
      if (clickedUnit && clickedUnit.team === 'player') {
        state.selectUnit(clickedUnit.id)
        return
      }
    }

    if (state.selectedUnitId && state.turnPhase === 'select_target') {
      if (state.selectedSkillId === 'move') {
        const isReachable = state.reachableTiles.some((t) => t.x === gridX && t.y === gridY)
        if (isReachable) {
          void state.moveUnit(state.selectedUnitId, { x: gridX, y: gridY })
          return
        }
      } else if (state.selectedSkillId === 'shoot' || state.selectedSkillId === 'precision_shot') {
        if (clickedUnit && clickedUnit.team === 'enemy') {
          const isAttackable = state.attackableTargets.includes(clickedUnit.id)
          if (isAttackable) {
            void state.attackUnit(state.selectedUnitId, clickedUnit.id)
            return
          }
        }
      } else if (state.selectedSkillId === 'heal' || state.selectedSkillId === 'revive') {
        if (clickedUnit && clickedUnit.team === 'player') {
          void state.useSkill(state.selectedUnitId, state.selectedSkillId, clickedUnit.id)
          return
        }
      } else if (
        state.selectedSkillId === 'frag_grenade' ||
        state.selectedSkillId === 'smoke_grenade' ||
        state.selectedSkillId === 'repair_cover'
      ) {
        void state.useSkill(state.selectedUnitId, state.selectedSkillId, { x: gridX, y: gridY })
        return
      }
    }

    if (clickedUnit && clickedUnit.team === 'player') {
      state.selectUnit(clickedUnit.id)
    } else {
      state.selectUnit(null)
    }
  }

  private handleHover(pointer: Phaser.Input.Pointer): void {
    const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y)
    const gridX = Math.floor((worldPoint.x / (ISO_TILE_WIDTH / 2) + worldPoint.y / (ISO_TILE_HEIGHT / 2)) / 2)
    const gridY = Math.floor((worldPoint.y / (ISO_TILE_HEIGHT / 2) - worldPoint.x / (ISO_TILE_WIDTH / 2)) / 2)

    const state = useGameStore.getState()
    const hoveredUnit = state.units.find(
      (u) => u.stats.hp > 0 && u.position.x === gridX && u.position.y === gridY
    )

    for (const [id, unitSprite] of this.unitSprites) {
      const shape = unitSprite.sprite as Phaser.GameObjects.Ellipse
      if (hoveredUnit && hoveredUnit.id === id) {
        shape.setStrokeStyle(3, 0xffffff)
      } else if (state.selectedUnitId !== id) {
        shape.setStrokeStyle(2, 0x000000)
      }
    }
  }

  private showDamageNumber(targetId: string, damage: number): void {
    if (!this.isSceneActive || !this.add || !this.tweens) return
    
    const unitSprite = this.unitSprites.get(targetId)
    if (!unitSprite) return

    const text = this.add.text(0, 0, `-${damage}`, {
      fontSize: '20px',
      color: '#ff4444',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    })
    text.setOrigin(0.5)
    text.setPosition(unitSprite.container.x, unitSprite.container.y - 50)
    text.setDepth(unitSprite.depth + 200)

    this.tweens.add({
      targets: text,
      y: text.y - 40,
      alpha: 0,
      duration: 800,
      ease: 'Power2.out',
      onComplete: () => text.destroy(),
    })
  }

  private showHealNumber(targetId: string, amount: number): void {
    if (!this.isSceneActive || !this.add || !this.tweens) return
    
    const unitSprite = this.unitSprites.get(targetId)
    if (!unitSprite) return

    const text = this.add.text(0, 0, `+${amount}`, {
      fontSize: '20px',
      color: '#44ff44',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    })
    text.setOrigin(0.5)
    text.setPosition(unitSprite.container.x, unitSprite.container.y - 50)
    text.setDepth(unitSprite.depth + 200)

    this.tweens.add({
      targets: text,
      y: text.y - 40,
      alpha: 0,
      duration: 800,
      ease: 'Power2.out',
      onComplete: () => text.destroy(),
    })
  }

  private playAttackAnimation(attackerId: string, targetId: string): void {
    if (!this.isSceneActive || !this.add || !this.tweens) return
    
    const attacker = this.unitSprites.get(attackerId)
    const target = this.unitSprites.get(targetId)
    
    if (!attacker || !target) return

    this.tweens.add({
      targets: attacker.container,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true,
    })

    const line = this.add.graphics()
    line.lineStyle(3, 0xffff00, 0.8)
    line.setDepth(Math.max(attacker.depth, target.depth) + 300)
    
    line.beginPath()
    line.moveTo(attacker.container.x, attacker.container.y - 20)
    line.lineTo(target.container.x, target.container.y - 20)
    line.stroke()

    this.tweens.add({
      targets: line,
      alpha: 0,
      duration: 200,
      onComplete: () => line.destroy(),
    })

    this.tweens.add({
      targets: target.container,
      x: target.container.x + (target.container.x - attacker.container.x) * 0.1,
      y: target.container.y + (target.container.y - attacker.container.y) * 0.1,
      duration: 100,
      yoyo: true,
    })
  }

  private playGrenadeAnimation(position: Position): void {
    if (!this.isSceneActive || !this.add || !this.tweens) return
    
    const iso = gridToIso(position.x, position.y, 0)
    const x = iso.x
    const y = iso.y

    const explosion = this.add.circle(x, y, 10, 0xff6600)
    explosion.setDepth(10000)

    this.tweens.add({
      targets: explosion,
      scale: 5,
      alpha: 0,
      duration: 500,
      ease: 'Power2.out',
      onComplete: () => explosion.destroy(),
    })

    for (let i = 0; i < 12; i++) {
      const particle = this.add.circle(x, y, 4, 0xffaa00)
      particle.setDepth(10001)
      
      const angle = (i / 12) * Math.PI * 2
      const distance = 60
      
      this.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance * 0.5,
        alpha: 0,
        duration: 400,
        ease: 'Power2.out',
        onComplete: () => particle.destroy(),
      })
    }
  }

  private playSmokeAnimation(position: Position): void {
    if (!this.isSceneActive || !this.add || !this.tweens) return
    
    const iso = gridToIso(position.x, position.y, 0)
    const x = iso.x
    const y = iso.y

    for (let i = 0; i < 15; i++) {
      const smoke = this.add.circle(x, y, 15, 0x888888, 0.6)
      smoke.setDepth(10000)
      
      const angle = Math.random() * Math.PI * 2
      const distance = 30 + Math.random() * 50
      
      this.tweens.add({
        targets: smoke,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance * 0.5 - 30,
        scale: 2 + Math.random(),
        alpha: 0,
        duration: 600 + Math.random() * 400,
        ease: 'Power2.out',
        onComplete: () => smoke.destroy(),
      })
    }
  }
}
