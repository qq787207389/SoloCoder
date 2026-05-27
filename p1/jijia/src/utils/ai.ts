
import { BattleState, BattleUnit, HexCoord } from '../types';
import { hexEquals, hexDistance, getMovableRange } from './hexGrid';
import { getEffectiveMobility } from './assembly';
import { moveUnit, performAttack, endTurn } from './battle';

interface AIDecision {
  type: 'move' | 'attack' | 'end';
  target?: HexCoord;
  score: number;
}

export function executeAITurn(state: BattleState): BattleState {
  let currentState = { ...state };
  const maxIterations = 5;
  let iterations = 0;

  while (currentState.phase === 'enemyTurn' && iterations < maxIterations) {
    const decision = makeAIDecision(currentState);

    if (decision.type === 'move' && decision.target) {
      const result = moveUnit(currentState, 'enemy', decision.target);
      currentState = result.state;
    } else if (decision.type === 'attack') {
      const result = performAttack(currentState, 'enemy');
      currentState = result.state;
    } else {
      currentState = endTurn(currentState);
    }

    iterations++;
  }

  if (currentState.phase === 'enemyTurn') {
    currentState = endTurn(currentState);
  }

  return currentState;
}

function makeAIDecision(state: BattleState): AIDecision {
  const enemy = state.enemyUnit;
  const player = state.playerUnit;

  const decisions: AIDecision[] = [];

  if (!enemy.hasAttacked) {
    const attackDecision = evaluateAttack(state, enemy, player);
    decisions.push(attackDecision);
  }

  if (!enemy.hasMoved) {
    const moveDecisions = evaluateMoveOptions(state, enemy, player);
    decisions.push(...moveDecisions);
  }

  if (decisions.length === 0) {
    return { type: 'end', score: 0 };
  }

  decisions.sort((a, b) => b.score - a.score);
  return decisions[0];
}

function evaluateAttack(state: BattleState, attacker: BattleUnit, defender: BattleUnit): AIDecision {
  const range = attacker.mech.baseStats.range || 2;
  const distance = hexDistance(attacker.position, defender.position);

  if (distance > range) {
    return { type: 'attack', score: -100 };
  }

  let score = 50;

  const damage = attacker.mech.baseStats.damage || 10;
  const healthPercent = defender.mech.currentHealth / defender.mech.maxHealth;
  score += damage * 2;

  if (healthPercent < 0.3) {
    score += 30;
  } else if (healthPercent < 0.6) {
    score += 15;
  }

  if (distance <= 2) {
    score += 10;
  }

  if (attacker.hasMoved) {
    score += 20;
  }

  return { type: 'attack', score };
}

function evaluateMoveOptions(state: BattleState, unit: BattleUnit, target: BattleUnit): AIDecision[] {
  const decisions: AIDecision[] = [];
  const mobility = getEffectiveMobility(unit.mech);
  const movableTiles = getMovableRange(unit.position, state.grid, mobility);

  const range = unit.mech.baseStats.range || 2;
  const currentDistance = hexDistance(unit.position, target.position);

  for (const tile of movableTiles) {
    const newDistance = hexDistance(tile, target.position);
    let score = 0;

    if (newDistance <= range && currentDistance > range) {
      score += 80;
    } else if (newDistance < currentDistance) {
      score += 40;
    } else if (newDistance > currentDistance && unit.mech.currentHealth < unit.mech.maxHealth * 0.3) {
      score += 25;
    }

    const flatGrid = state.grid.flat();
    const tileData = flatGrid.find((t) => hexEquals(t.coord, tile));
    if (tileData?.terrain === 'highGround') {
      score += 15;
    } else if (tileData?.terrain === 'cover') {
      score += 20;
    }

    if (newDistance <= 2) {
      score += 10;
    } else if (newDistance <= range) {
      score += 5;
    }

    score += Math.random() * 10;

    decisions.push({ type: 'move', target: tile, score });
  }

  return decisions;
}

export function createEnemyMech(): { mech: any; name: string } {
  const enemies = [
    { name: '新手训练机', head: 'head_basic', torso: 'torso_basic', leftArm: 'arm_left_basic', rightArm: 'arm_right_basic', legs: 'legs_basic', core: 'core_basic' },
    { name: '突击者', head: 'head_targeting', torso: 'torso_basic', leftArm: 'arm_left_basic', rightArm: 'arm_right_plasma', legs: 'legs_scout', core: 'core_basic' },
    { name: '重装守卫', head: 'head_basic', torso: 'torso_armored', leftArm: 'arm_left_shield', rightArm: 'arm_right_basic', legs: 'legs_basic', core: 'core_improved' },
    { name: '精英猎手', head: 'head_sensor', torso: 'torso_shield', leftArm: 'arm_left_shield', rightArm: 'arm_right_railgun', legs: 'legs_assault', core: 'core_high_output' },
    { name: '毁灭者', head: 'head_commander', torso: 'torso_titan', leftArm: 'arm_left_titan', rightArm: 'arm_right_omega', legs: 'legs_hover', core: 'core_fusion' },
  ];

  const enemyConfig = enemies[Math.floor(Math.random() * enemies.length)];

  return {
    mech: enemyConfig,
    name: enemyConfig.name,
  };
}
