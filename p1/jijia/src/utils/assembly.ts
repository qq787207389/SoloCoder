
import { Mech, Part, PartType, PartStats, AssemblyValidation, PART_TYPES } from '../types';
import { getPartById } from '../data/parts';

export function createEmptyMech(): Mech {
  return {
    id: `mech_${Date.now()}`,
    name: '新机甲',
    parts: {
      head: null,
      torso: null,
      leftArm: null,
      rightArm: null,
      legs: null,
      core: null,
    },
    currentHealth: 100,
    maxHealth: 100,
    currentShield: 0,
    maxShield: 0,
    currentEnergy: 0,
    maxEnergy: 0,
    totalWeight: 0,
    actionPoints: 0,
    maxActionPoints: 0,
    baseStats: {},
  };
}

export function calculateMechStats(mech: Mech): {
  stats: PartStats;
  totalWeight: number;
  totalEnergyCost: number;
  maxEnergy: number;
} {
  const stats: PartStats = {
    armor: 0,
    damage: 0,
    accuracy: 0,
    range: 0,
    mobility: 0,
    evasion: 0,
    maxEnergy: 0,
    shield: 0,
    maxHealth: 0,
    actionPoints: 0,
  };

  let totalWeight = 0;
  let totalEnergyCost = 0;
  let maxEnergy = 0;

  for (const partType of PART_TYPES) {
    const part = mech.parts[partType];
    if (part) {
      totalWeight += part.weight;
      totalEnergyCost += part.energyCost;
      maxEnergy = Math.max(maxEnergy, part.stats.maxEnergy || 0);

      for (const [key, value] of Object.entries(part.stats)) {
        if (value !== undefined && key !== 'maxEnergy') {
          (stats as Record<string, number>)[key] = ((stats as Record<string, number>)[key] || 0) + value;
        }
      }

      for (const affix of part.affixes) {
        switch (affix.type) {
          case 'weight':
            totalWeight += affix.value;
            break;
          case 'energy':
            totalEnergyCost += affix.value;
            break;
          case 'damage':
            stats.damage = (stats.damage || 0) + affix.value;
            break;
          case 'defense':
            stats.armor = (stats.armor || 0) + affix.value;
            break;
          case 'mobility':
            stats.mobility = (stats.mobility || 0) + affix.value;
            break;
        }
      }
    }
  }

  stats.maxEnergy = maxEnergy;

  return { stats, totalWeight, totalEnergyCost, maxEnergy };
}

export function validateAssembly(mech: Mech): AssemblyValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  const { totalWeight, totalEnergyCost, maxEnergy, stats } = calculateMechStats(mech);

  const equippedCount = PART_TYPES.filter((t) => mech.parts[t] !== null).length;
  if (equippedCount < 6) {
    warnings.push(`还有 ${6 - equippedCount} 个部件槽位未装备`);
  }

  if (!mech.parts.core) {
    errors.push('必须装备核心引擎');
  }

  if (totalEnergyCost > maxEnergy) {
    errors.push(`能量不足！消耗 ${totalEnergyCost}，最大能量 ${maxEnergy}`);
  }

  const weightPenaltyThreshold = 80;
  if (totalWeight > weightPenaltyThreshold) {
    const penalty = Math.floor((totalWeight - weightPenaltyThreshold) / 10) * 5;
    warnings.push(`超重！机动性降低 ${penalty}%，战斗行动顺序延后`);
  }

  if ((stats.mobility || 0) <= 0 && totalWeight > 0) {
    errors.push('机甲机动性过低，无法行动');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function equipPart(mech: Mech, part: Part): Mech {
  const newMech = { ...mech };
  newMech.parts = { ...mech.parts, [part.type]: part };

  const { stats, totalWeight, maxEnergy } = calculateMechStats(newMech);

  const BASE_HEALTH = 100;
  newMech.baseStats = stats;
  newMech.totalWeight = totalWeight;
  newMech.maxEnergy = maxEnergy;
  newMech.currentEnergy = maxEnergy;
  newMech.maxHealth = BASE_HEALTH + (stats.maxHealth || 0);
  newMech.currentHealth = newMech.maxHealth;
  newMech.maxShield = stats.shield || 0;
  newMech.currentShield = newMech.maxShield;
  newMech.maxActionPoints = stats.actionPoints || 3;
  newMech.actionPoints = newMech.maxActionPoints;

  return newMech;
}

export function unequipPart(mech: Mech, partType: PartType): Mech {
  const newMech = { ...mech };
  newMech.parts = { ...mech.parts, [partType]: null };

  const { stats, totalWeight, maxEnergy } = calculateMechStats(newMech);

  const BASE_HEALTH = 100;
  newMech.baseStats = stats;
  newMech.totalWeight = totalWeight;
  newMech.maxEnergy = maxEnergy;
  newMech.currentEnergy = maxEnergy;
  newMech.maxHealth = BASE_HEALTH + (stats.maxHealth || 0);
  newMech.currentHealth = newMech.maxHealth;
  newMech.maxShield = stats.shield || 0;
  newMech.currentShield = newMech.maxShield;
  newMech.maxActionPoints = stats.actionPoints || 3;
  newMech.actionPoints = newMech.maxActionPoints;

  return newMech;
}

export function createStarterMech(): Mech {
  let mech = createEmptyMech();
  mech.name = '新手机甲';

  const starterPartIds = [
    'head_basic',
    'torso_basic',
    'arm_left_basic',
    'arm_right_basic',
    'legs_basic',
    'core_basic',
  ];

  for (const partId of starterPartIds) {
    const part = getPartById(partId);
    if (part) {
      mech = equipPart(mech, part);
    }
  }

  return mech;
}

export function getEffectiveMobility(mech: Mech): number {
  const baseMobility = mech.baseStats.mobility || 0;
  const weightPenaltyThreshold = 80;

  if (mech.totalWeight > weightPenaltyThreshold) {
    const penalty = Math.floor((mech.totalWeight - weightPenaltyThreshold) / 10) * 0.05;
    return Math.max(0, Math.floor(baseMobility * (1 - penalty)));
  }

  return baseMobility;
}

export function getInitiative(mech: Mech): number {
  const mobility = getEffectiveMobility(mech);
  const evasion = mech.baseStats.evasion || 0;
  return mobility * 2 + evasion + Math.random() * 10;
}
