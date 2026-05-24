import type { CombatState, CombatUnit, Fleet, Formation } from '../types';
import { getShieldStrength, getWeaponDamage } from '../data/fleet';

export function createCombatState(fleet: Fleet, enemyCount: number): CombatState {
  const playerUnits: CombatUnit[] = [];
  const shieldStrength = getShieldStrength(fleet.mothership.shield.level);
  playerUnits.push({
    id: 'mothership',
    name: '母舰',
    isPlayer: true,
    hp: fleet.mothership.hp,
    maxHp: fleet.mothership.maxHp,
    damage: getWeaponDamage(fleet.mothership.weapon.level),
    accuracy: 0.8,
    shield: shieldStrength,
    maxShield: shieldStrength,
    x: 100,
    y: 200
  });
  fleet.frigates.forEach((frigate, index) => {
    playerUnits.push({
      id: frigate.id,
      name: frigate.name,
      isPlayer: true,
      hp: frigate.hp,
      maxHp: frigate.maxHp,
      damage: frigate.damage,
      accuracy: frigate.accuracy,
      shield: 10,
      maxShield: 10,
      x: 80,
      y: 120 + index * 80
    });
  });
  const enemyUnits: CombatUnit[] = [];
  const enemyNames = ['海盗突袭舰', '海盗炮艇', '海盗旗舰'];
  for (let i = 0; i < enemyCount; i++) {
    const baseHp = 40 + Math.random() * 60;
    enemyUnits.push({
      id: `enemy-${i}`,
      name: enemyNames[Math.min(i, enemyNames.length - 1)],
      isPlayer: false,
      hp: baseHp,
      maxHp: baseHp,
      damage: 8 + Math.random() * 12,
      accuracy: 0.6 + Math.random() * 0.2,
      shield: 5 + Math.random() * 15,
      maxShield: 20,
      x: 500,
      y: 100 + i * 100
    });
  }
  applyFormation(playerUnits, fleet.formation);
  return {
    playerUnits,
    enemyUnits,
    isActive: true,
    turn: 0,
    log: ['战斗开始！'],
    result: undefined
  };
}

function applyFormation(units: CombatUnit[], formation: Formation): void {
  const centerY = 200;
  switch (formation) {
    case 'offensive':
      units.forEach((unit, i) => {
        unit.x = 150 + (units.length - 1 - i) * 30;
        unit.y = centerY - (units.length - 1) * 40 + i * 80;
      });
      break;
    case 'defensive':
      units.forEach((unit, i) => {
        unit.x = 50 + i * 30;
        unit.y = centerY - (units.length - 1) * 40 + i * 80;
      });
      break;
    case 'balanced':
    default:
      units.forEach((unit, i) => {
        unit.x = 100;
        unit.y = centerY - (units.length - 1) * 40 + i * 80;
      });
      break;
  }
}

export function processCombatTurn(combatState: CombatState): void {
  if (!combatState.isActive) return;
  combatState.turn++;
  const allUnits = [...combatState.playerUnits, ...combatState.enemyUnits]
    .filter(u => u.hp > 0)
    .sort(() => Math.random() - 0.5);
  for (const unit of allUnits) {
    if (unit.hp <= 0) continue;
    const enemies = unit.isPlayer 
      ? combatState.enemyUnits.filter(e => e.hp > 0)
      : combatState.playerUnits.filter(p => p.hp > 0);
    if (enemies.length === 0) continue;
    const target = enemies.reduce((lowest, enemy) => 
      enemy.hp < lowest.hp ? enemy : lowest
    , enemies[0]);
    if (Math.random() < unit.accuracy) {
      let damage = unit.damage * (0.8 + Math.random() * 0.4);
      if (target.shield > 0) {
        const shieldDamage = Math.min(target.shield, damage);
        target.shield -= shieldDamage;
        damage -= shieldDamage;
      }
      target.hp = Math.max(0, target.hp - damage);
      combatState.log.push(`${unit.name} 命中 ${target.name}，造成 ${Math.round(damage)} 伤害！`);
      if (target.hp <= 0) {
        combatState.log.push(`${target.name} 被摧毁！`);
      }
    } else {
      combatState.log.push(`${unit.name} 的攻击未命中！`);
    }
  }
  const playerAlive = combatState.playerUnits.some(u => u.hp > 0);
  const enemyAlive = combatState.enemyUnits.some(u => u.hp > 0);
  if (!playerAlive) {
    combatState.isActive = false;
    combatState.result = 'defeat';
    combatState.log.push('战斗失败...');
  } else if (!enemyAlive) {
    combatState.isActive = false;
    combatState.result = 'victory';
    combatState.log.push('战斗胜利！');
  }
  if (combatState.log.length > 20) {
    combatState.log = combatState.log.slice(-20);
  }
}

export function focusFire(combatState: CombatState, targetId: string): void {
  combatState.playerUnits.forEach(unit => {
    if (unit.hp > 0) {
      unit.targetId = targetId;
    }
  });
  combatState.log.push('下达集火指令！');
}

export function launchCountermeasures(combatState: CombatState): void {
  combatState.enemyUnits.forEach(unit => {
    unit.accuracy = Math.max(0.2, unit.accuracy - 0.3);
  });
  combatState.log.push('释放干扰弹！敌方命中率下降！');
}

export function attemptRetreat(combatState: CombatState): boolean {
  const retreatChance = 0.4 + (combatState.playerUnits.length / 10);
  if (Math.random() < retreatChance) {
    combatState.isActive = false;
    combatState.result = 'retreat';
    combatState.log.push('成功撤离！');
    return true;
  }
  combatState.log.push('撤退失败！');
  return false;
}

export function applyCombatResults(fleet: Fleet, combatState: CombatState): { reward: number } {
  const mothershipUnit = combatState.playerUnits.find(u => u.id === 'mothership');
  if (mothershipUnit) {
    fleet.mothership.hp = Math.max(1, mothershipUnit.hp);
  }
  const destroyedFrigates: string[] = [];
  combatState.playerUnits.forEach(unit => {
    if (unit.id !== 'mothership' && unit.hp <= 0) {
      destroyedFrigates.push(unit.id);
    }
  });
  fleet.frigates = fleet.frigates.filter(f => !destroyedFrigates.includes(f.id));
  fleet.frigates.forEach((frigate) => {
    const unit = combatState.playerUnits.find(u => u.id === frigate.id);
    if (unit) {
      frigate.hp = Math.max(1, unit.hp);
    }
  });
  let reward = 0;
  if (combatState.result === 'victory') {
    reward = combatState.enemyUnits.length * 500 + Math.floor(Math.random() * 1000);
    fleet.credits += reward;
  }
  return { reward };
}
