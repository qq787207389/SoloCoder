import type { Character, CharacterClass, Weapon, Skill, Position } from '@/types'
import { BASE_STATS, CLASS_SKILLS, SKILL_DEFINITIONS, WEAPON_TEMPLATES, EXP_PER_LEVEL } from '@/config/constants'
import { generateId } from '@/utils/math'

export class CharacterFactory {
  static createCharacter(
    characterClass: CharacterClass,
    team: 'player' | 'enemy',
    position: Position,
    name?: string,
    level: number = 1
  ): Character {
    const baseStats = BASE_STATS[characterClass]
    const classNames: Record<CharacterClass, string[]> = {
      assault: ['突击兵', '冲锋队员', '猎手'],
      sniper: ['狙击手', '神射手', '侦察兵'],
      medic: ['医疗兵', '医护员', '战地医师'],
      engineer: ['工兵', '工程师', '技师'],
    }

    const characterName = name || classNames[characterClass][Math.floor(Math.random() * classNames[characterClass].length)]

    const weapons = this.createWeaponsForClass(characterClass)
    const skills = this.createSkillsForClass(characterClass)

    const levelBonus = (level - 1) * 0.1

    return {
      id: generateId(),
      name: characterName,
      team,
      class: characterClass,
      position,
      facing: 'south',
      stats: {
        maxHp: Math.floor(baseStats.maxHp * (1 + levelBonus)),
        hp: Math.floor(baseStats.maxHp * (1 + levelBonus)),
        moveRange: baseStats.moveRange,
        aim: Math.floor(baseStats.aim * (1 + levelBonus * 0.5)),
        defense: Math.floor(baseStats.defense * (1 + levelBonus * 0.5)),
        will: Math.floor(baseStats.will * (1 + levelBonus * 0.3)),
        dodge: Math.floor(baseStats.dodge * (1 + levelBonus * 0.3)),
        armor: baseStats.armor,
      },
      weapons,
      currentWeaponIndex: 0,
      skills,
      ap: 2,
      maxAp: 2,
      level,
      exp: 0,
      expToNext: EXP_PER_LEVEL * level,
      isOverwatch: false,
      isSuppressed: false,
      suppressionTurns: 0,
      statusEffects: [],
      inventory: [],
    }
  }

  private static createWeaponsForClass(characterClass: CharacterClass): Weapon[] {
    const weapons: Weapon[] = []

    switch (characterClass) {
      case 'assault':
        weapons.push(this.createWeapon('assault_rifle'))
        weapons.push(this.createWeapon('pistol'))
        break
      case 'sniper':
        weapons.push(this.createWeapon('sniper_rifle'))
        weapons.push(this.createWeapon('pistol'))
        break
      case 'medic':
        weapons.push(this.createWeapon('smg'))
        weapons.push(this.createWeapon('pistol'))
        break
      case 'engineer':
        weapons.push(this.createWeapon('shotgun'))
        weapons.push(this.createWeapon('pistol'))
        break
    }

    return weapons
  }

  private static createWeapon(templateKey: string): Weapon {
    const template = WEAPON_TEMPLATES[templateKey]
    return {
      ...template,
      id: generateId(),
    }
  }

  private static createSkillsForClass(characterClass: CharacterClass): Skill[] {
    const skillTypes = CLASS_SKILLS[characterClass]
    return skillTypes.map((type) => ({
      id: type,
      name: SKILL_DEFINITIONS[type].name,
      description: SKILL_DEFINITIONS[type].description,
      apCost: SKILL_DEFINITIONS[type].apCost,
      cooldown: SKILL_DEFINITIONS[type].cooldown,
      currentCooldown: 0,
      range: SKILL_DEFINITIONS[type].range,
      icon: SKILL_DEFINITIONS[type].icon,
    }))
  }

  static createEnemySquad(positions: Position[], types: CharacterClass[]): Character[] {
    return positions.map((pos, index) => {
      const type = types[index] || 'assault'
      return this.createCharacter(type, 'enemy', pos, undefined, 1)
    })
  }

  static createPlayerSquad(positions: Position[]): Character[] {
    const classes: CharacterClass[] = ['assault', 'sniper', 'medic', 'engineer']
    return positions.slice(0, 4).map((pos, index) => {
      return this.createCharacter(classes[index], 'player', pos, undefined, 1)
    })
  }
}
