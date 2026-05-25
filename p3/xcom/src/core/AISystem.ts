import type { Character, Position, AIAction, Tile, SmokeCloud, SkillType } from '@/types'
import { CoverSystem } from './CoverSystem'
import { Pathfinding } from './Pathfinding'
import { CombatSystem } from './CombatSystem'
import { euclideanDistance } from '@/utils/math'
import { isInBounds } from '@/utils/isometric'
import { SKILL_DEFINITIONS } from '@/config/constants'

interface UtilityScore {
  action: AIAction
  score: number
}

export class AISystem {
  private coverSystem: CoverSystem
  private pathfinding: Pathfinding
  private combatSystem: CombatSystem
  private tiles: Tile[][]
  private width: number
  private height: number

  constructor(
    coverSystem: CoverSystem,
    pathfinding: Pathfinding,
    combatSystem: CombatSystem,
    tiles: Tile[][],
    width: number,
    height: number
  ) {
    this.coverSystem = coverSystem
    this.pathfinding = pathfinding
    this.combatSystem = combatSystem
    this.tiles = tiles
    this.width = width
    this.height = height
  }

  getBestAction(
    aiUnit: Character,
    allUnits: Character[],
    smokeClouds: SmokeCloud[]
  ): AIAction | null {
    if (aiUnit.stats.hp <= 0 || aiUnit.ap <= 0) return null

    const smokePositions = smokeClouds.map((s) => s.position)
    const enemies = allUnits.filter((u) => u.team !== aiUnit.team && u.stats.hp > 0)

    if (enemies.length === 0) {
      return { type: 'overwatch', utility: 0.1 }
    }

    const utilityScores: UtilityScore[] = []

    const attackScores = this.evaluateAttackOptions(aiUnit, enemies, smokePositions)
    utilityScores.push(...attackScores)

    const moveScores = this.evaluateMoveOptions(aiUnit, enemies, allUnits, smokePositions)
    utilityScores.push(...moveScores)

    const grenadeScores = this.evaluateGrenadeOptions(aiUnit, enemies, smokePositions)
    utilityScores.push(...grenadeScores)

    const overwatchScore = this.evaluateOverwatch(aiUnit, enemies, smokePositions)
    utilityScores.push(overwatchScore)

    const skillScores = this.evaluateSkillOptions(aiUnit, enemies, allUnits, smokePositions)
    utilityScores.push(...skillScores)

    if (utilityScores.length === 0) {
      if (aiUnit.ap > 0 && moveScores.length === 0) {
        const nearestEnemy = this.findNearestEnemy(aiUnit.position, enemies)
        if (nearestEnemy) {
          const direction = {
            x: Math.sign(nearestEnemy.position.x - aiUnit.position.x),
            y: Math.sign(nearestEnemy.position.y - aiUnit.position.y),
          }
          const moveTarget = {
            x: aiUnit.position.x + direction.x,
            y: aiUnit.position.y + direction.y,
          }
          if (isInBounds(moveTarget.x, moveTarget.y, this.width, this.height)) {
            const tile = this.tiles[moveTarget.y]?.[moveTarget.x]
            if (tile && (tile.type === 'ground' || tile.type === 'high_ground' || tile.type === 'rubble')) {
              return {
                type: 'move',
                position: moveTarget,
                utility: 0.06,
              }
            }
          }
        }
      }
      return { type: 'overwatch', utility: 0.1 }
    }

    utilityScores.sort((a, b) => b.score - a.score)

    const bestScore = utilityScores[0].score
    const topOptions = utilityScores.filter((s) => s.score >= bestScore * 0.9)
    const selected = topOptions[Math.floor(Math.random() * topOptions.length)]

    if (selected.score < 0 && aiUnit.ap > 0) {
      const nearestEnemy = this.findNearestEnemy(aiUnit.position, enemies)
      if (nearestEnemy) {
        const direction = {
          x: Math.sign(nearestEnemy.position.x - aiUnit.position.x),
          y: Math.sign(nearestEnemy.position.y - aiUnit.position.y),
        }
        const moveTarget = {
          x: aiUnit.position.x + direction.x,
          y: aiUnit.position.y + direction.y,
        }
        if (isInBounds(moveTarget.x, moveTarget.y, this.width, this.height)) {
          const tile = this.tiles[moveTarget.y]?.[moveTarget.x]
          if (tile && (tile.type === 'ground' || tile.type === 'high_ground' || tile.type === 'rubble')) {
            return {
              type: 'move',
              position: moveTarget,
              utility: 0.06,
            }
          }
        }
      }
      return { type: 'overwatch', utility: 0.1 }
    }

    return selected.action
  }

  private evaluateAttackOptions(
    aiUnit: Character,
    enemies: Character[],
    smokePositions: Position[]
  ): UtilityScore[] {
    const scores: UtilityScore[] = []
    const weapon = aiUnit.weapons[aiUnit.currentWeaponIndex]

    for (const enemy of enemies) {
      const distance = euclideanDistance(aiUnit.position, enemy.position)

      if (distance < weapon.minRange || distance > weapon.range) continue

      const hasLOS = this.coverSystem.hasLineOfSight(aiUnit.position, enemy.position, smokePositions)
      if (!hasLOS) continue

      const hitChance = this.combatSystem.calculateHitChance(aiUnit, enemy, weapon, smokePositions)
      const cover = this.coverSystem.calculateCover(aiUnit.position, enemy, smokePositions)

      let score = hitChance * 0.6

      if (enemy.stats.hp <= weapon.damage) score += 30
      else if (enemy.stats.hp <= weapon.damage * 2) score += 15

      if (cover.flanked) score += 20
      if (cover.coverLevel === 'none') score += 10

      const threatLevel = this.getThreatLevel(enemy)
      score += threatLevel * 5

      if (enemy.class === 'medic') score += 10
      if (enemy.class === 'sniper') score += 15

      if (weapon.ammo < weapon.maxAmmo * 0.2) score -= 10

      scores.push({
        action: {
          type: 'attack',
          target: enemy.id,
          utility: score / 100,
        },
        score,
      })
    }

    return scores
  }

  private evaluateMoveOptions(
    aiUnit: Character,
    enemies: Character[],
    allUnits: Character[],
    smokePositions: Position[]
  ): UtilityScore[] {
    const scores: UtilityScore[] = []
    const reachableTiles = this.pathfinding.getReachableTiles(
      aiUnit.position,
      aiUnit.stats.moveRange,
      allUnits
    )

    for (const tile of reachableTiles) {
      let score = 0

      const nearestEnemy = this.findNearestEnemy(tile, enemies)
      if (nearestEnemy) {
        const dist = euclideanDistance(tile, nearestEnemy.position)
        const idealRange = this.getIdealRange(aiUnit)
        const rangeDiff = Math.abs(dist - idealRange)
        score -= rangeDiff * 3

        const weapon = aiUnit.weapons[aiUnit.currentWeaponIndex]
        if (dist >= weapon.minRange && dist <= weapon.range) {
          const hasLOS = this.coverSystem.hasLineOfSight(tile, nearestEnemy.position, smokePositions)
          if (hasLOS) {
            score += 25
          }
        }
      }

      const coverPositions = this.coverSystem.getCoverPositions(tile, aiUnit.team, allUnits)
      const isInCover = coverPositions.some(
        (c) => c.x === tile.x && c.y === tile.y
      )
      if (isInCover) score += 30

      const cover = this.coverSystem.calculateCover(
        this.getAverageEnemyPosition(enemies),
        { ...aiUnit, position: tile } as Character,
        smokePositions
      )
      if (cover.coverLevel === 'full') score += 20
      else if (cover.coverLevel === 'half') score += 10

      const tileData = this.tiles[tile.y][tile.x]
      if (tileData.type === 'high_ground') score += 15

      const suppressedEnemies = enemies.filter((e) => e.isSuppressed).length
      if (suppressedEnemies > 0) score += 5

      const path = this.pathfinding.findPath(aiUnit.position, tile, allUnits)
      if (path && path.length > 0) {
        score -= path.length * 0.5
      }

      if (nearestEnemy && euclideanDistance(tile, nearestEnemy.position) <= 3) {
        if (aiUnit.class !== 'assault') score -= 20
        else score += 10
      }

      scores.push({
        action: {
          type: 'move',
          position: tile,
          utility: score / 100,
        },
        score,
      })
    }

    return scores
  }

  private evaluateGrenadeOptions(
    aiUnit: Character,
    enemies: Character[],
    _smokePositions: Position[]
  ): UtilityScore[] {
    const scores: UtilityScore[] = []
    const fragSkill = aiUnit.skills.find((s) => s.id === 'frag_grenade')
    const smokeSkill = aiUnit.skills.find((s) => s.id === 'smoke_grenade')

    if (fragSkill && fragSkill.currentCooldown === 0 && aiUnit.ap >= fragSkill.apCost) {
      const range = SKILL_DEFINITIONS.frag_grenade.range
      const tilesInRange = this.coverSystem.getTilesInRange(aiUnit.position, range)

      for (const tile of tilesInRange) {
        if (!isInBounds(tile.x, tile.y, this.width, this.height)) continue

        let score = 0
        let enemiesHit = 0
        let totalDamagePotential = 0

        for (const enemy of enemies) {
          const dist = euclideanDistance(tile, enemy.position)
          if (dist <= 2) {
            enemiesHit++
            const damageFalloff = 1 - dist / 3
            totalDamagePotential += 40 * damageFalloff

            if (enemy.stats.hp <= 40 * damageFalloff) score += 25
          }
        }

        if (enemiesHit === 0) continue

        score += enemiesHit * 20
        score += totalDamagePotential * 0.3

        const alliesInRange = enemies.filter((e) => e.team === aiUnit.team)
          .filter((ally) => euclideanDistance(tile, ally.position) <= 2).length
        score -= alliesInRange * 30

        scores.push({
          action: {
            type: 'grenade',
            position: tile,
            skill: 'frag_grenade',
            utility: score / 100,
          },
          score,
        })
      }
    }

    if (smokeSkill && smokeSkill.currentCooldown === 0 && aiUnit.ap >= smokeSkill.apCost) {
      const range = SKILL_DEFINITIONS.smoke_grenade.range
      const tilesInRange = this.coverSystem.getTilesInRange(aiUnit.position, range)

      for (const tile of tilesInRange) {
        if (!isInBounds(tile.x, tile.y, this.width, this.height)) continue

        let score = 0

        const alliesInSmoke = enemies.filter((e) => e.team === aiUnit.team)
          .filter((ally) => euclideanDistance(tile, ally.position) <= 3).length
        score += alliesInSmoke * 15

        const woundedAllies = enemies.filter((e) => e.team === aiUnit.team && e.stats.hp < e.stats.maxHp * 0.5)
          .filter((ally) => euclideanDistance(tile, ally.position) <= 3).length
        score += woundedAllies * 20

        if (alliesInSmoke > 0) {
          scores.push({
            action: {
              type: 'grenade',
              position: tile,
              skill: 'smoke_grenade',
              utility: score / 100,
            },
            score,
          })
        }
      }
    }

    return scores
  }

  private evaluateOverwatch(
    aiUnit: Character,
    enemies: Character[],
    _smokePositions: Position[]
  ): UtilityScore {
    let score = 15

    const weapon = aiUnit.weapons[aiUnit.currentWeaponIndex]
    if (weapon.ammo < 3) score -= 5

    const visibleEnemies = enemies.filter((e) => {
      const dist = euclideanDistance(aiUnit.position, e.position)
      if (dist < weapon.minRange || dist > weapon.range) return false
      return this.coverSystem.hasLineOfSight(aiUnit.position, e.position, _smokePositions)
    })

    if (visibleEnemies.length > 0) score += 15

    if (aiUnit.ap === 1) score += 5

    if (aiUnit.class === 'sniper') score += 10
    if (aiUnit.class === 'assault') score -= 5

    return {
      action: {
        type: 'overwatch',
        utility: Math.max(0.1, score / 100),
      },
      score: Math.max(10, score),
    }
  }

  private evaluateSkillOptions(
    aiUnit: Character,
    enemies: Character[],
    allUnits: Character[],
    _smokePositions: Position[]
  ): UtilityScore[] {
    const scores: UtilityScore[] = []

    if (aiUnit.class === 'medic') {
      const healSkill = aiUnit.skills.find((s) => s.id === 'heal')
      if (healSkill && healSkill.currentCooldown === 0 && aiUnit.ap >= healSkill.apCost) {
        const woundedAllies = allUnits.filter(
          (u) => u.team === aiUnit.team && 
                 u.stats.hp > 0 && 
                 u.stats.hp < u.stats.maxHp * 0.7 &&
                 euclideanDistance(aiUnit.position, u.position) <= healSkill.range
        )

        for (const ally of woundedAllies) {
          const healAmount = ally.stats.maxHp - ally.stats.hp
          let score = healAmount * 0.5

          if (ally.stats.hp < ally.stats.maxHp * 0.3) score += 30
          if (ally.class === 'sniper') score += 10

          scores.push({
            action: {
              type: 'skill',
              target: ally.id,
              skill: 'heal' as SkillType,
              utility: score / 100,
            },
            score,
          })
        }
      }
    }

    if (aiUnit.class === 'engineer') {
      const mineSkill = aiUnit.skills.find((s) => s.id === 'place_mine')
      if (mineSkill && mineSkill.currentCooldown === 0 && aiUnit.ap >= mineSkill.apCost) {
        const nearbyEnemies = enemies.filter(
          (e) => euclideanDistance(aiUnit.position, e.position) <= 5
        )

        if (nearbyEnemies.length > 0) {
          let score = 15

          const chokepoint = this.isNearChokepoint(aiUnit.position)
          if (chokepoint) score += 20

          scores.push({
            action: {
              type: 'skill',
              position: aiUnit.position,
              skill: 'place_mine' as SkillType,
              utility: score / 100,
            },
            score,
          })
        }
      }
    }

    return scores
  }

  private getThreatLevel(enemy: Character): number {
    let threat = 1

    const weapon = enemy.weapons[enemy.currentWeaponIndex]
    threat += weapon.damage / 20

    if (enemy.class === 'sniper') threat += 1
    if (enemy.class === 'medic') threat += 0.5

    if (enemy.stats.hp < enemy.stats.maxHp * 0.3) threat += 0.5

    return threat
  }

  private getIdealRange(unit: Character): number {
    const weapon = unit.weapons[unit.currentWeaponIndex]
    switch (unit.class) {
      case 'sniper':
        return weapon.range * 0.8
      case 'assault':
        return weapon.range * 0.3
      case 'medic':
        return weapon.range * 0.5
      case 'engineer':
        return weapon.range * 0.4
      default:
        return weapon.range * 0.5
    }
  }

  private findNearestEnemy(pos: Position, enemies: Character[]): Character | null {
    if (enemies.length === 0) return null

    let nearest = enemies[0]
    let minDist = euclideanDistance(pos, nearest.position)

    for (const enemy of enemies) {
      const dist = euclideanDistance(pos, enemy.position)
      if (dist < minDist) {
        minDist = dist
        nearest = enemy
      }
    }

    return nearest
  }

  private getAverageEnemyPosition(enemies: Character[]): Position {
    if (enemies.length === 0) return { x: 0, y: 0 }

    let x = 0
    let y = 0

    for (const enemy of enemies) {
      x += enemy.position.x
      y += enemy.position.y
    }

    return {
      x: Math.floor(x / enemies.length),
      y: Math.floor(y / enemies.length),
    }
  }

  private isNearChokepoint(pos: Position): boolean {
    let openDirections = 0
    const directions = [
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 1, y: 0 },
    ]

    for (const dir of directions) {
      const nx = pos.x + dir.x
      const ny = pos.y + dir.y
      if (isInBounds(nx, ny, this.width, this.height)) {
        const tile = this.tiles[ny][nx]
        if (tile.type === 'ground' || tile.type === 'high_ground') {
          openDirections++
        }
      }
    }

    return openDirections <= 2
  }

  executeAITurn(
    aiUnit: Character,
    allUnits: Character[],
    smokeClouds: SmokeCloud[],
    onAction: (action: AIAction) => Promise<void>
  ): Promise<void> {
    return new Promise((resolve) => {
      let consecutiveNoAction = 0
      
      const executeNextAction = async () => {
        if (aiUnit.ap <= 0 || aiUnit.stats.hp <= 0) {
          aiUnit.isOverwatch = false
          resolve()
          return
        }

        const action = this.getBestAction(aiUnit, allUnits, smokeClouds)
        
        if (!action) {
          consecutiveNoAction++
          if (consecutiveNoAction >= 3) {
            aiUnit.isOverwatch = aiUnit.ap > 0
            resolve()
            return
          }
          setTimeout(executeNextAction, 200)
          return
        }

        if (action.utility < 0.05 && consecutiveNoAction > 0) {
          consecutiveNoAction++
          if (consecutiveNoAction >= 3) {
            aiUnit.isOverwatch = aiUnit.ap > 0
            resolve()
            return
          }
        }

        consecutiveNoAction = 0

        try {
          await onAction(action)
        } catch (e) {
          console.error('AI action failed:', e)
        }

        setTimeout(executeNextAction, 500)
      }

      setTimeout(executeNextAction, 300)
    })
  }
}
