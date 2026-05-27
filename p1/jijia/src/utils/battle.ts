
import {
  BattleState,
  BattleUnit,
  HexCoord,
  HexTile,
  Mech,
  DamageType,
  BattleLog,
} from '../types';
import { hexEquals, hexDistance, getMovableRange, getAttackRange, createHexGrid } from './hexGrid';
import { getEffectiveMobility, getInitiative } from './assembly';

const GRID_RADIUS = 5;

export function createBattleState(playerMech: Mech, enemyMech: Mech): BattleState {
  const grid = createHexGrid(GRID_RADIUS);

  const flatGrid = grid.flat();
  const playerStart = flatGrid.find((t) => t.coord.q === -3 && t.coord.r === 0);
  const enemyStart = flatGrid.find((t) => t.coord.q === 3 && t.coord.r === 0);

  if (playerStart) playerStart.occupiedBy = 'player';
  if (enemyStart) enemyStart.occupiedBy = 'enemy';

  const playerUnit: BattleUnit = {
    id: 'player',
    mech: { ...playerMech, currentHealth: playerMech.maxHealth, currentShield: playerMech.maxShield },
    position: playerStart?.coord || { q: -3, r: 0 },
    team: 'player',
    hasMoved: false,
    hasAttacked: false,
    remainingAP: playerMech.maxActionPoints,
  };

  const enemyUnit: BattleUnit = {
    id: 'enemy',
    mech: { ...enemyMech, currentHealth: enemyMech.maxHealth, currentShield: enemyMech.maxShield },
    position: enemyStart?.coord || { q: 3, r: 0 },
    team: 'enemy',
    hasMoved: false,
    hasAttacked: false,
    remainingAP: enemyMech.maxActionPoints,
  };

  const playerFirst = getInitiative(playerMech) > getInitiative(enemyMech);

  return {
    playerUnit,
    enemyUnit,
    grid,
    phase: playerFirst ? 'playerTurn' : 'enemyTurn',
    turn: 1,
    logs: [
      {
        id: '1',
        message: playerFirst ? '玩家先手！' : '敌方先手！',
        type: 'move',
        timestamp: Date.now(),
      },
    ],
    selectedAction: null,
    highlightedTiles: [],
  };
}

export function calculateDamage(
  attacker: BattleUnit,
  defender: BattleUnit,
  grid: HexTile[][]
): { damage: number; hit: boolean; critical: boolean } {
  const baseDamage = attacker.mech.baseStats.damage || 10;
  const accuracyBonus = attacker.mech.baseStats.accuracy || 0;
  const BASE_HIT_CHANCE = 70;
  const evasion = defender.mech.baseStats.evasion || 0;
  const defenderArmor = defender.mech.baseStats.armor || 0;

  const flatGrid = grid.flat();
  const attackerTile = flatGrid.find((t) => hexEquals(t.coord, attacker.position));
  const defenderTile = flatGrid.find((t) => hexEquals(t.coord, defender.position));

  let hitChance = BASE_HIT_CHANCE + accuracyBonus - evasion;
  if (attackerTile?.terrain === 'highGround') hitChance += 15;
  if (defenderTile?.terrain === 'cover') hitChance -= 20;
  hitChance = Math.max(10, Math.min(95, hitChance));

  const roll = Math.random() * 100;
  if (roll > hitChance) {
    return { damage: 0, hit: false, critical: false };
  }

  const critical = Math.random() < 0.1;
  let finalDamage = baseDamage;
  if (critical) finalDamage *= 1.5;

  const damageType = getDamageTypeFromMech(attacker.mech);
  const armorReduction = calculateArmorReduction(defenderArmor, damageType);
  finalDamage = Math.max(1, Math.floor(finalDamage * (1 - armorReduction)));

  return { damage: finalDamage, hit: true, critical };
}

function getDamageTypeFromMech(mech: Mech): DamageType {
  const rightArm = mech.parts.rightArm;
  return rightArm?.damageType || 'kinetic';
}

function calculateArmorReduction(armor: number, damageType: DamageType): number {
  let reduction = armor / (armor + 100);
  switch (damageType) {
    case 'kinetic':
      reduction *= 1.0;
      break;
    case 'energy':
      reduction *= 0.7;
      break;
    case 'thermal':
      reduction *= 0.5;
      break;
  }
  return Math.min(0.8, reduction);
}

export function applyDamage(unit: BattleUnit, damage: number): BattleUnit {
  const newUnit = { ...unit, mech: { ...unit.mech } };

  if (newUnit.mech.currentShield > 0) {
    if (newUnit.mech.currentShield >= damage) {
      newUnit.mech.currentShield -= damage;
      return newUnit;
    }
    damage -= newUnit.mech.currentShield;
    newUnit.mech.currentShield = 0;
  }

  newUnit.mech.currentHealth = Math.max(0, newUnit.mech.currentHealth - damage);
  return newUnit;
}

export function moveUnit(
  state: BattleState,
  unitId: string,
  target: HexCoord
): { state: BattleState; success: boolean; message: string } {
  const unit = unitId === 'player' ? state.playerUnit : state.enemyUnit;
  const isPlayer = unitId === 'player';

  if (unit.hasMoved) {
    return { state, success: false, message: '本回合已移动' };
  }

  const distance = hexDistance(unit.position, target);
  const mobility = getEffectiveMobility(unit.mech);

  if (distance > mobility) {
    return { state, success: false, message: '超出移动范围' };
  }

  const flatGrid = state.grid.flat();
  const targetTile = flatGrid.find((t) => hexEquals(t.coord, target));

  if (!targetTile || targetTile.terrain === 'obstacle' || targetTile.occupiedBy) {
    return { state, success: false, message: '无法移动到该位置' };
  }

  const newGrid = state.grid.map((row) =>
    row.map((tile) => {
      if (hexEquals(tile.coord, unit.position)) {
        return { ...tile, occupiedBy: undefined };
      }
      if (hexEquals(tile.coord, target)) {
        return { ...tile, occupiedBy: unitId };
      }
      return tile;
    })
  );

  const updatedUnit = { ...unit, position: target, hasMoved: true };

  const newState: BattleState = {
    ...state,
    grid: newGrid,
    playerUnit: isPlayer ? updatedUnit : state.playerUnit,
    enemyUnit: isPlayer ? state.enemyUnit : updatedUnit,
    logs: [
      ...state.logs,
      {
        id: Date.now().toString(),
        message: `${isPlayer ? '玩家' : '敌方'}移动到新位置`,
        type: 'move',
        timestamp: Date.now(),
      },
    ],
  };

  return { state: newState, success: true, message: '移动成功' };
}

export function performAttack(
  state: BattleState,
  attackerId: string
): { state: BattleState; success: boolean; message: string } {
  const attacker = attackerId === 'player' ? state.playerUnit : state.enemyUnit;
  const defender = attackerId === 'player' ? state.enemyUnit : state.playerUnit;
  const isPlayer = attackerId === 'player';

  if (attacker.hasAttacked) {
    return { state, success: false, message: '本回合已攻击' };
  }

  const range = attacker.mech.baseStats.range || 2;
  const distance = hexDistance(attacker.position, defender.position);

  if (distance > range) {
    return { state, success: false, message: '目标超出攻击范围' };
  }

  const result = calculateDamage(attacker, defender, state.grid);
  let message = '';

  if (!result.hit) {
    message = `${isPlayer ? '玩家' : '敌方'}攻击未命中！`;
  } else if (result.critical) {
    message = `${isPlayer ? '玩家' : '敌方'}暴击！造成 ${result.damage} 点伤害`;
  } else {
    message = `${isPlayer ? '玩家' : '敌方'}攻击命中！造成 ${result.damage} 点伤害`;
  }

  const updatedDefender = applyDamage(defender, result.damage);
  const updatedAttacker = { ...attacker, hasAttacked: true };

  let phase = state.phase;
  if (updatedDefender.mech.currentHealth <= 0) {
    phase = isPlayer ? 'victory' : 'defeat';
    message += isPlayer ? ' 敌方机甲被摧毁！' : ' 玩家机甲被摧毁！';
  }

  const newState: BattleState = {
    ...state,
    playerUnit: isPlayer ? updatedAttacker : updatedDefender,
    enemyUnit: isPlayer ? updatedDefender : updatedAttacker,
    phase,
    logs: [
      ...state.logs,
      {
        id: Date.now().toString(),
        message,
        type: 'attack',
        timestamp: Date.now(),
      },
    ],
  };

  return { state: newState, success: true, message };
}

export function endTurn(state: BattleState): BattleState {
  const isPlayerTurn = state.phase === 'playerTurn';

  const resetUnit = (unit: BattleUnit): BattleUnit => ({
    ...unit,
    hasMoved: false,
    hasAttacked: false,
    remainingAP: unit.mech.maxActionPoints,
    mech: {
      ...unit.mech,
      currentEnergy: Math.min(unit.mech.maxEnergy, unit.mech.currentEnergy + Math.floor(unit.mech.maxEnergy * 0.3)),
    },
  });

  const newState: BattleState = {
    ...state,
    phase: isPlayerTurn ? 'enemyTurn' : 'playerTurn',
    turn: isPlayerTurn ? state.turn : state.turn + 1,
    playerUnit: isPlayerTurn ? { ...state.playerUnit, hasMoved: false, hasAttacked: false } : resetUnit(state.playerUnit),
    enemyUnit: isPlayerTurn ? resetUnit(state.enemyUnit) : { ...state.enemyUnit, hasMoved: false, hasAttacked: false },
    logs: [
      ...state.logs,
      {
        id: Date.now().toString(),
        message: isPlayerTurn ? '敌方回合开始' : '玩家回合开始',
        type: 'move',
        timestamp: Date.now(),
      },
    ],
  };

  return newState;
}

export function getHighlightedTilesForAction(
  state: BattleState,
  action: 'move' | 'attack' | null
): HexCoord[] {
  if (!action) return [];

  const unit = state.phase === 'playerTurn' ? state.playerUnit : state.enemyUnit;

  if (action === 'move') {
    if (unit.hasMoved) return [];
    const mobility = getEffectiveMobility(unit.mech);
    return getMovableRange(unit.position, state.grid, mobility);
  }

  if (action === 'attack') {
    if (unit.hasAttacked) return [];
    const range = unit.mech.baseStats.range || 2;
    return getAttackRange(unit.position, state.grid, 1, range);
  }

  return [];
}
