import { BattleUnit, BattleLog, Hero, Buff, Stats } from '../types'
import { SKILLS } from '../data/skills'
import { HEROES } from '../data/heroes'

export const FACTION_ADVANTAGE: Record<string, string> = {
  wei: 'shu',
  shu: 'wu',
  wu: 'wei',
  qun: 'qun'
}

export function calculateStats(hero: Hero): Stats {
  const levelBonus = hero.level - 1
  return {
    hp: hero.baseStats.hp + hero.growthStats.hp * levelBonus,
    atk: hero.baseStats.atk + hero.growthStats.atk * levelBonus,
    def: hero.baseStats.def + hero.growthStats.def * levelBonus,
    spd: hero.baseStats.spd + hero.growthStats.spd * levelBonus,
    critRate: hero.baseStats.critRate + hero.growthStats.critRate * levelBonus,
    critDamage: hero.baseStats.critDamage + hero.growthStats.critDamage * levelBonus
  }
}

export function createBattleUnit(hero: Hero, isPlayer: boolean, position: number): BattleUnit {
  const stats = calculateStats(hero)
  return {
    hero,
    currentHp: stats.hp,
    maxHp: stats.hp,
    atb: 0,
    maxAtb: 10000,
    buffs: [],
    isPlayer,
    position
  }
}

export function calculateDamage(
  attacker: BattleUnit,
  defender: BattleUnit,
  skillMultiplier: number,
  isCrit: boolean
): number {
  const attackerStats = calculateStats(attacker.hero)
  const defenderStats = calculateStats(defender.hero)

  let atk = attackerStats.atk
  let def = defenderStats.def

  attacker.buffs.forEach(buff => {
    if (buff.stat === 'atk') atk += atk * buff.value
  })
  defender.buffs.forEach(buff => {
    if (buff.stat === 'def') def += def * buff.value
  })

  if (FACTION_ADVANTAGE[attacker.hero.faction] === defender.hero.faction) {
    atk *= 1.15
  } else if (FACTION_ADVANTAGE[defender.hero.faction] === attacker.hero.faction) {
    atk *= 0.85
  }

  let damage = (atk * skillMultiplier - def * 0.5)

  if (isCrit) {
    let critDamage = attackerStats.critDamage
    attacker.buffs.forEach(buff => {
      if (buff.stat === 'critDamage') critDamage += buff.value
    })
    damage *= (1 + critDamage)
  }

  return Math.max(1, Math.floor(damage))
}

export function applyBuff(unit: BattleUnit, buff: Buff): BattleUnit {
  const existingBuff = unit.buffs.find(b => b.id === buff.id)
  if (existingBuff) {
    existingBuff.duration = existingBuff.maxDuration
    return { ...unit }
  }
  return { ...unit, buffs: [...unit.buffs, buff] }
}

export function updateBuffs(unit: BattleUnit): BattleUnit {
  const buffs = unit.buffs
    .map(buff => ({ ...buff, duration: buff.duration - 1 }))
    .filter(buff => buff.duration > 0 || buff.duration === -1)
  return { ...unit, buffs }
}

export function executeSkill(
  attacker: BattleUnit,
  skillId: string,
  targets: BattleUnit[],
  turn: number
): { updatedUnits: BattleUnit[], logs: BattleLog[] } {
  const skill = SKILLS[skillId]
  if (!skill) return { updatedUnits: targets, logs: [] }

  const logs: BattleLog[] = []
  let updatedUnits = [...targets]

  logs.push({
    turn,
    message: `${attacker.hero.name}使用了【${skill.name}】！`,
    type: 'skill'
  })

  skill.effects?.forEach(effect => {
    if (Math.random() > (effect.chance || 1)) return

    switch (effect.type) {
      case 'damage':
        updatedUnits = updatedUnits.map(target => {
          let isCrit = false
          if (Math.random() < calculateStats(attacker.hero).critRate) {
            isCrit = true
          }
          const damage = calculateDamage(attacker, target, effect.value || 1, isCrit)
          const critText = isCrit ? '（暴击！）' : ''
          logs.push({
            turn,
            message: `对${target.hero.name}造成${damage}点伤害${critText}`,
            type: 'damage'
          })
          return { ...target, currentHp: Math.max(0, target.currentHp - damage) }
        })
        break

      case 'heal':
        updatedUnits = updatedUnits.map(target => {
          const healAmount = Math.floor(calculateStats(attacker.hero).atk * (effect.value || 1))
          logs.push({
            turn,
            message: `${target.hero.name}恢复了${healAmount}点生命值`,
            type: 'heal'
          })
          return { ...target, currentHp: Math.min(target.maxHp, target.currentHp + healAmount) }
        })
        break

      case 'buff':
      case 'debuff':
        if (effect.stat && effect.duration !== undefined) {
          const buffType = effect.type === 'buff' ? '增益' : '减益'
          updatedUnits = updatedUnits.map(target => {
            const buff: Buff = {
              id: skillId,
              name: skill.name,
              type: effect.type,
              stat: effect.stat!,
              value: effect.value || 0,
              duration: effect.duration!,
              maxDuration: effect.duration!
            }
            logs.push({
              turn,
              message: `${target.hero.name}获得了${buffType}效果`,
              type: effect.type
            })
            return applyBuff(target, buff)
          })
        }
        break
    }
  })

  return { updatedUnits, logs }
}

export function processTurn(playerUnits: BattleUnit[], enemyUnits: BattleUnit[]): {
  playerUnits: BattleUnit[],
  enemyUnits: BattleUnit[],
  logs: BattleLog[],
  winner: 'player' | 'enemy' | null
} {
  const allUnits = [...playerUnits, ...enemyUnits]
    .filter(u => u.currentHp > 0)
    .map(u => ({ ...u, atb: u.atb + calculateStats(u.hero).spd * 100 }))

  allUnits.sort((a, b) => b.atb - a.atb)

  let currentPlayerUnits = allUnits.filter(u => u.isPlayer)
  let currentEnemyUnits = allUnits.filter(u => !u.isPlayer)
  const logs: BattleLog[] = []
  let turn = 1

  const actingUnit = allUnits[0]
  if (actingUnit) {
    actingUnit.atb -= actingUnit.maxAtb

    const activeSkills = actingUnit.hero.skills
      .map(id => SKILLS[id])
      .filter(s => s?.type === 'active')

    if (activeSkills.length > 0) {
      const skillToUse = activeSkills[0]
      let targets: BattleUnit[]

      switch (skillToUse.target) {
        case 'single':
          targets = actingUnit.isPlayer
            ? currentEnemyUnits.filter(u => u.currentHp > 0).slice(0, 1)
            : currentPlayerUnits.filter(u => u.currentHp > 0).slice(0, 1)
          break
        case 'all':
          targets = actingUnit.isPlayer
            ? currentEnemyUnits.filter(u => u.currentHp > 0)
            : currentPlayerUnits.filter(u => u.currentHp > 0)
          break
        case 'ally_all':
          targets = actingUnit.isPlayer
            ? currentPlayerUnits.filter(u => u.currentHp > 0)
            : currentEnemyUnits.filter(u => u.currentHp > 0)
          break
        default:
          targets = [actingUnit]
      }

      const { updatedUnits, logs: skillLogs } = executeSkill(
        actingUnit,
        skillToUse.id,
        targets,
        turn
      )

      logs.push(...skillLogs)

      if (actingUnit.isPlayer) {
        currentPlayerUnits = currentPlayerUnits.map(u =>
          u.hero.id === actingUnit.hero.id ? actingUnit : u
        )
        const targetIds = targets.map(t => t.hero.id)
        currentEnemyUnits = currentEnemyUnits.map(u =>
          targetIds.includes(u.hero.id)
            ? updatedUnits.find(uu => uu.hero.id === u.hero.id) || u
            : u
        )
      } else {
        currentEnemyUnits = currentEnemyUnits.map(u =>
          u.hero.id === actingUnit.hero.id ? actingUnit : u
        )
        const targetIds = targets.map(t => t.hero.id)
        currentPlayerUnits = currentPlayerUnits.map(u =>
          targetIds.includes(u.hero.id)
            ? updatedUnits.find(uu => uu.hero.id === u.hero.id) || u
            : u
        )
      }
    }
  }

  currentPlayerUnits = currentPlayerUnits.map(updateBuffs)
  currentEnemyUnits = currentEnemyUnits.map(updateBuffs)

  const playerAlive = currentPlayerUnits.some(u => u.currentHp > 0)
  const enemyAlive = currentEnemyUnits.some(u => u.currentHp > 0)

  let winner: 'player' | 'enemy' | null = null
  if (!playerAlive) winner = 'enemy'
  else if (!enemyAlive) winner = 'player'

  return { playerUnits: currentPlayerUnits, enemyUnits: currentEnemyUnits, logs, winner }
}

export function simulateBattle(playerHeroes: Hero[], enemyHeroes: Hero[]): {
  logs: BattleLog[],
  winner: 'player' | 'enemy'
} {
  let playerUnits = playerHeroes.map((hero, i) => createBattleUnit(hero, true, i))
  let enemyUnits = enemyHeroes.map((hero, i) => createBattleUnit(hero, false, i))
  const allLogs: BattleLog[] = []

  let winner: 'player' | 'enemy' | null = null
  let iterations = 0

  while (!winner && iterations < 100) {
    const result = processTurn(playerUnits, enemyUnits)
    playerUnits = result.playerUnits
    enemyUnits = result.enemyUnits
    allLogs.push(...result.logs)
    winner = result.winner
    iterations++
  }

  return { logs: allLogs, winner: winner || 'enemy' }
}
