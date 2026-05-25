import type { Character, AttackResult, Weapon, Tile, Position, SmokeCloud, Mine } from '@/types'
import { CoverSystem } from './CoverSystem'
import { eventBus, EVENTS } from './EventBus'
import { euclideanDistance, generateId, getDirection } from '@/utils/math'
import { EXP_PER_KILL, EXP_PER_DAMAGE } from '@/config/constants'

export class CombatSystem {
  private coverSystem: CoverSystem
  private tiles: Tile[][]

  constructor(coverSystem: CoverSystem, tiles: Tile[][]) {
    this.coverSystem = coverSystem
    this.tiles = tiles
  }

  calculateHitChance(
    attacker: Character,
    target: Character,
    weapon: Weapon,
    smokePositions: Position[] = []
  ): number {
    const distance = euclideanDistance(attacker.position, target.position)
    
    if (distance < weapon.minRange || distance > weapon.range) {
      return 0
    }

    const cover = this.coverSystem.calculateCover(attacker.position, target, smokePositions)
    
    let hitChance = attacker.stats.aim + weapon.accuracy
    hitChance -= cover.defenseBonus
    hitChance -= cover.dodgeBonus
    hitChance -= target.stats.dodge

    const distancePenalty = Math.max(0, (distance - weapon.minRange) * 2)
    hitChance -= distancePenalty

    const attackerTile = this.tiles[attacker.position.y][attacker.position.x]
    const targetTile = this.tiles[target.position.y][target.position.x]

    if (attackerTile.type === 'high_ground' && targetTile.type !== 'high_ground') {
      hitChance += 10
    }

    if (target.isSuppressed) {
      hitChance += 15
    }

    return Math.max(5, Math.min(95, hitChance))
  }

  executeAttack(
    attacker: Character,
    target: Character,
    isPrecisionShot: boolean = false,
    smokePositions: Position[] = []
  ): AttackResult {
    const weapon = attacker.weapons[attacker.currentWeaponIndex]

    if (weapon.ammo <= 0) {
      eventBus.emit(EVENTS.LOG_MESSAGE, {
        id: generateId(),
        timestamp: Date.now(),
        message: `${attacker.name} 的 ${weapon.name} 没有弹药了！`,
        type: 'info',
      })
      return {
        hit: false,
        crit: false,
        damage: 0,
        coverBonus: 0,
        flanked: false,
        targetId: target.id,
      }
    }

    weapon.ammo--

    const cover = this.coverSystem.calculateCover(attacker.position, target, smokePositions)
    let hitChance = this.calculateHitChance(attacker, target, weapon, smokePositions)

    if (isPrecisionShot) {
      hitChance = Math.min(98, hitChance + 30)
    }

    const roll = Math.random() * 100
    const hit = roll <= hitChance
    let crit = false
    let damage = 0

    if (hit) {
      let critChance = weapon.critChance
      if (isPrecisionShot) critChance += 20
      if (cover.flanked) critChance += 25

      crit = Math.random() * 100 < critChance

      damage = weapon.damage
      if (crit) damage = Math.floor(damage * weapon.critMultiplier)

      const armor = Math.max(0, target.stats.armor - weapon.armorPiercing)
      damage = Math.max(1, damage - armor)

      if (cover.flanked) {
        damage = Math.floor(damage * 1.25)
      }

      const attackerTile = this.tiles[attacker.position.y][attacker.position.x]
      if (attackerTile.type === 'high_ground') {
        damage = Math.floor(damage * 1.1)
      }

      this.applyDamage(target, damage, attacker)

      eventBus.emit(EVENTS.UNIT_DAMAGED, {
        targetId: target.id,
        damage,
        attackerId: attacker.id,
        crit,
        flanked: cover.flanked,
      })

      eventBus.emit(EVENTS.LOG_MESSAGE, {
        id: generateId(),
        timestamp: Date.now(),
        message: `${attacker.name} 对 ${target.name} 造成 ${damage} 点伤害${crit ? '（暴击！）' : ''}${cover.flanked ? '（侧翼！）' : ''}`,
        type: 'damage',
      })

      if (target.stats.hp <= 0) {
        this.handleKill(attacker, target)
      } else if (damage >= target.stats.maxHp * 0.3) {
        target.isSuppressed = true
        target.suppressionTurns = 1
      }
    } else {
      eventBus.emit(EVENTS.LOG_MESSAGE, {
        id: generateId(),
        timestamp: Date.now(),
        message: `${attacker.name} 的射击未命中 ${target.name}（命中率 ${Math.floor(hitChance)}%）`,
        type: 'info',
      })
    }

    target.facing = getDirection(target.position, attacker.position)

    return {
      hit,
      crit,
      damage,
      coverBonus: cover.defenseBonus,
      flanked: cover.flanked,
      targetId: target.id,
    }
  }

  applyDamage(target: Character, damage: number, attacker?: Character): void {
    target.stats.hp = Math.max(0, target.stats.hp - damage)

    if (attacker) {
      attacker.exp += EXP_PER_DAMAGE * damage
    }
  }

  heal(healer: Character, target: Character, amount: number): void {
    const actualHeal = Math.min(amount, target.stats.maxHp - target.stats.hp)
    target.stats.hp += actualHeal

    eventBus.emit(EVENTS.UNIT_HEALED, {
      targetId: target.id,
      amount: actualHeal,
      healerId: healer.id,
    })

    eventBus.emit(EVENTS.LOG_MESSAGE, {
      id: generateId(),
      timestamp: Date.now(),
      message: `${healer.name} 治疗了 ${target.name} ${actualHeal} 点生命值`,
      type: 'heal',
    })

    healer.exp += actualHeal
  }

  revive(reviver: Character, target: Character): void {
    if (target.stats.hp > 0) return

    target.stats.hp = Math.floor(target.stats.maxHp * 0.3)
    target.statusEffects = []
    target.isSuppressed = false

    eventBus.emit(EVENTS.LOG_MESSAGE, {
      id: generateId(),
      timestamp: Date.now(),
      message: `${reviver.name} 复活了 ${target.name}！`,
      type: 'heal',
    })

    reviver.exp += 100
  }

  private handleKill(killer: Character, victim: Character): void {
    killer.exp += EXP_PER_KILL

    eventBus.emit(EVENTS.UNIT_KILLED, {
      victimId: victim.id,
      killerId: killer.id,
    })

    eventBus.emit(EVENTS.LOG_MESSAGE, {
      id: generateId(),
      timestamp: Date.now(),
      message: `${killer.name} 击杀了 ${victim.name}！`,
      type: 'kill',
    })
  }

  throwGrenade(
    thrower: Character,
    position: Position,
    type: 'frag' | 'smoke',
    units: Character[]
  ): { damage: number; smoke?: SmokeCloud } {
    const radius = type === 'frag' ? 2 : 3
    const affectedTiles = this.coverSystem.getTilesInRange(position, radius)
    let totalDamage = 0

    if (type === 'frag') {
      const baseDamage = 40

      for (const unit of units) {
        if (unit.stats.hp <= 0) continue

        const dist = euclideanDistance(unit.position, position)
        if (dist <= radius) {
          const damageFalloff = 1 - dist / (radius + 1)
          const damage = Math.floor(baseDamage * damageFalloff)
          
          this.applyDamage(unit, damage, thrower)
          totalDamage += damage

          eventBus.emit(EVENTS.UNIT_DAMAGED, {
            targetId: unit.id,
            damage,
            attackerId: thrower.id,
            crit: false,
            flanked: false,
          })

          if (unit.stats.hp <= 0) {
            this.handleKill(thrower, unit)
          }
        }
      }

      for (const tile of affectedTiles) {
        const tileData = this.tiles[tile.y][tile.x]
        if (tileData.destructible && tileData.hp > 0) {
          tileData.hp -= 20
          if (tileData.hp <= 0) {
            tileData.type = 'rubble'
            tileData.destructible = false
            eventBus.emit(EVENTS.COVER_DESTROYED, { tile })
          }
        }
      }

      eventBus.emit(EVENTS.LOG_MESSAGE, {
        id: generateId(),
        timestamp: Date.now(),
        message: `${thrower.name} 投掷了手雷，造成 ${totalDamage} 点伤害`,
        type: 'damage',
      })

      return { damage: totalDamage }
    } else {
      const smoke: SmokeCloud = {
        id: generateId(),
        position,
        radius: 3,
        turnsRemaining: 3,
      }

      eventBus.emit(EVENTS.SMOKE_ADDED, smoke)
      eventBus.emit(EVENTS.LOG_MESSAGE, {
        id: generateId(),
        timestamp: Date.now(),
        message: `${thrower.name} 投掷了烟雾弹`,
        type: 'info',
      })

      return { damage: 0, smoke }
    }
  }

  placeMine(engineer: Character, position: Position): Mine {
    const mine: Mine = {
      id: generateId(),
      position,
      team: engineer.team,
      damage: 50,
      radius: 1,
    }

    eventBus.emit(EVENTS.LOG_MESSAGE, {
      id: generateId(),
      timestamp: Date.now(),
      message: `${engineer.name} 埋设了地雷`,
      type: 'info',
    })

    return mine
  }

  triggerMine(mine: Mine, units: Character[]): number {
    let totalDamage = 0
    const affectedTiles = this.coverSystem.getTilesInRange(mine.position, mine.radius)

    for (const unit of units) {
      if (unit.stats.hp <= 0 || unit.team === mine.team) continue

      const isAffected = affectedTiles.some(
        (t) => t.x === unit.position.x && t.y === unit.position.y
      )

      if (isAffected) {
        const damage = mine.damage
        this.applyDamage(unit, damage)
        totalDamage += damage

        if (unit.stats.hp <= 0) {
          eventBus.emit(EVENTS.UNIT_KILLED, {
            victimId: unit.id,
            killerId: 'mine',
          })
        }
      }
    }

    eventBus.emit(EVENTS.MINE_TRIGGERED, { mineId: mine.id })
    eventBus.emit(EVENTS.LOG_MESSAGE, {
      id: generateId(),
      timestamp: Date.now(),
      message: `地雷爆炸，造成 ${totalDamage} 点伤害`,
      type: 'damage',
    })

    return totalDamage
  }

  repairCover(engineer: Character, position: Position): boolean {
    const tile = this.tiles[position.y][position.x]
    
    if (tile.type === 'rubble') {
      tile.type = 'half_cover'
      tile.hp = 50
      tile.maxHp = 50
      tile.destructible = true
      
      eventBus.emit(EVENTS.LOG_MESSAGE, {
        id: generateId(),
        timestamp: Date.now(),
        message: `${engineer.name} 修复了掩体`,
        type: 'info',
      })
      
      return true
    }
    
    if (tile.destructible && tile.hp < tile.maxHp) {
      tile.hp = Math.min(tile.maxHp, tile.hp + 30)
      
      eventBus.emit(EVENTS.LOG_MESSAGE, {
        id: generateId(),
        timestamp: Date.now(),
        message: `${engineer.name} 修复了掩体`,
        type: 'info',
      })
      
      return true
    }
    
    return false
  }

  checkOverwatch(
    movingUnit: Character,
    toPosition: Position,
    units: Character[],
    smokePositions: Position[]
  ): AttackResult[] {
    const results: AttackResult[] = []
    const enemies = units.filter(
      (u) => u.team !== movingUnit.team && u.isOverwatch && u.stats.hp > 0
    )

    for (const enemy of enemies) {
      const weapon = enemy.weapons[enemy.currentWeaponIndex]
      const distance = euclideanDistance(enemy.position, toPosition)

      if (distance >= weapon.minRange && distance <= weapon.range) {
        const hasLOS = this.coverSystem.hasLineOfSight(enemy.position, toPosition, smokePositions)
        
        if (hasLOS && weapon.ammo > 0) {
          const target = { ...movingUnit, position: toPosition } as Character
          const result = this.executeAttack(enemy, target, false, smokePositions)
          
          if (result.hit && movingUnit.stats.hp > 0) {
            movingUnit.stats.hp = Math.max(0, movingUnit.stats.hp - result.damage)
          }
          
          results.push(result)
          enemy.isOverwatch = false
        }
      }
    }

    return results
  }

  levelUp(character: Character): boolean {
    if (character.exp < character.expToNext) return false

    character.exp -= character.expToNext
    character.level++
    character.expToNext = Math.floor(character.expToNext * 1.5)

    character.stats.maxHp = Math.floor(character.stats.maxHp * 1.1)
    character.stats.hp = character.stats.maxHp
    character.stats.aim = Math.floor(character.stats.aim * 1.05)
    character.stats.defense = Math.floor(character.stats.defense * 1.05)

    eventBus.emit(EVENTS.LOG_MESSAGE, {
      id: generateId(),
      timestamp: Date.now(),
      message: `${character.name} 升级到 ${character.level} 级！`,
      type: 'info',
    })

    return true
  }
}
