import { Character, Monster, Skill, Position } from '../types'

export function getDistance(a: Position, b: Position): number {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2))
}

export function isInRange(attacker: Position, target: Position, range: number): boolean {
  return getDistance(attacker, target) <= range
}

export function calculateDamage(
  attacker: { stats: { attack: number; magicAttack: number } },
  defender: { stats: { defense: number; magicDefense: number } },
  skill: Skill,
  isMagic: boolean = false
): number {
  const baseDamage = isMagic ? attacker.stats.magicAttack : attacker.stats.attack
  const defense = isMagic ? defender.stats.magicDefense : defender.stats.defense
  
  const damage = Math.max(1, Math.floor(baseDamage * skill.damage - defense * 0.5))
  
  const variance = damage * 0.1
  return Math.floor(damage - variance + Math.random() * variance * 2)
}

export function processSkillCooldowns(entity: { skills: Skill[] }, deltaTime: number): void {
  entity.skills.forEach(skill => {
    if (skill.currentCooldown > 0) {
      skill.currentCooldown = Math.max(0, skill.currentCooldown - deltaTime)
    }
  })
}

export function canUseSkill(entity: { stats: { mp: number } }, skill: Skill): boolean {
  return skill.currentCooldown === 0 && entity.stats.mp >= skill.mpCost
}

export function moveTowards(current: Position, target: Position, speed: number): Position {
  const dx = target.x - current.x
  const dy = target.y - current.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  
  if (distance <= speed) {
    return { ...target }
  }
  
  return {
    x: current.x + (dx / distance) * speed,
    y: current.y + (dy / distance) * speed
  }
}

export function updateMonsterAI(monster: Monster, player: Character, deltaTime: number): void {
  const distance = getDistance(monster.position, player.position)
  
  if (monster.aiState === 'dead') return

  if (distance <= monster.skills[0].range) {
    monster.aiState = 'attack'
    monster.targetId = player.id
  } else if (distance <= 8) {
    monster.aiState = 'chase'
    monster.targetId = player.id
  } else {
    monster.aiState = 'idle'
    monster.targetId = null
  }

  if (monster.aiState === 'chase') {
    monster.position = moveTowards(monster.position, player.position, monster.stats.speed * deltaTime * 0.002)
  }
}
