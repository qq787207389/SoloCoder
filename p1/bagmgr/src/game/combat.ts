import type { Item, Enemy, CombatState, CombatSkill, PlayerState } from './types';
import { getAccessibleItems, InventoryGrid } from './inventory';
import { getTotalEffectiveStats, getItemEffectiveStats } from './adjacency';
import { BASE_DAMAGE_VARIANCE, CRIT_MULTIPLIER } from './constants';

export interface CombatInitParams {
  player: PlayerState;
  enemy: Enemy;
  grid: InventoryGrid;
}

export function createCombatState(params: CombatInitParams): CombatState {
  const accessibleItems = getAccessibleItems(params.grid);
  const effectiveStats = getTotalEffectiveStats(params.grid);

  const skills = generateSkills(accessibleItems, params.grid);

  return {
    player: {
      hp: params.player.hp,
      maxHp: params.player.maxHp,
      stamina: params.player.stamina,
      maxStamina: params.player.maxStamina,
      accessibleItems,
      skills,
      attack: params.player.attack + effectiveStats.attack,
      defense: params.player.defense + effectiveStats.defense,
    },
    enemy: { ...params.enemy },
    turn: 'player',
    log: [`遭遇了 ${params.enemy.name}！`],
    round: 1,
    isOver: false,
    result: null,
  };
}

function generateSkills(accessibleItems: Item[], grid: InventoryGrid): CombatSkill[] {
  const skills: CombatSkill[] = [];

  skills.push({
    id: 'basic-attack',
    name: '普通攻击',
    description: '使用武器进行普通攻击',
    damage: 5,
    type: 'attack',
    cooldown: 0,
    currentCooldown: 0,
    icon: '⚔️',
  });

  skills.push({
    id: 'defend',
    name: '防御',
    description: '本回合防御翻倍',
    damage: 0,
    type: 'buff',
    cooldown: 2,
    currentCooldown: 0,
    icon: '🛡️',
  });

  accessibleItems.forEach((item) => {
    const effectiveStats = getItemEffectiveStats(grid, item);
    const totalAttack = effectiveStats.attack;

    if (item.type === 'weapon' && totalAttack > 0) {
      skills.push({
        id: `attack-${item.id}`,
        name: item.name,
        description: `使用${item.name}攻击`,
        damage: totalAttack,
        type: 'attack',
        itemId: item.id,
        cooldown: 0,
        currentCooldown: 0,
        icon: item.icon,
      });
    }

    if (item.type === 'potion') {
      if (item.stats.hp && item.stats.hp > 0) {
        skills.push({
          id: `heal-${item.id}`,
          name: item.name,
          description: `使用${item.name}恢复生命`,
          damage: -item.stats.hp,
          type: 'heal',
          itemId: item.id,
          cooldown: 0,
          currentCooldown: 0,
          icon: item.icon,
        });
      }
      if (item.stats.stamina && item.stats.stamina > 0) {
        skills.push({
          id: `stamina-${item.id}`,
          name: item.name,
          description: `使用${item.name}恢复体力`,
          damage: 0,
          type: 'buff',
          itemId: item.id,
          cooldown: 0,
          currentCooldown: 0,
          icon: item.icon,
        });
      }
    }

    if (item.type === 'scroll') {
      if (item.stats.attack && item.stats.attack > 0) {
        skills.push({
          id: `scroll-${item.id}`,
          name: item.name,
          description: `施放${item.name}`,
          damage: item.stats.attack * 2,
          type: 'attack',
          itemId: item.id,
          cooldown: 0,
          currentCooldown: 0,
          icon: item.icon,
        });
      }
      if (item.stats.hp && item.stats.hp > 0) {
        skills.push({
          id: `scroll-heal-${item.id}`,
          name: item.name,
          description: `施放${item.name}`,
          damage: -item.stats.hp,
          type: 'heal',
          itemId: item.id,
          cooldown: 0,
          currentCooldown: 0,
          icon: item.icon,
        });
      }
    }

    if (item.type === 'food') {
      skills.push({
        id: `eat-${item.id}`,
        name: item.name,
        description: `食用${item.name}`,
        damage: -(item.stats.hp || 0),
        type: 'heal',
        itemId: item.id,
        cooldown: 0,
        currentCooldown: 0,
        icon: item.icon,
      });
    }
  });

  return skills;
}

export interface PlayerActionResult {
  newState: CombatState;
  consumedItemIds: string[];
}

export function executePlayerAction(
  state: CombatState,
  skillId: string
): PlayerActionResult {
  if (state.isOver || state.turn !== 'player') {
    return { newState: state, consumedItemIds: [] };
  }

  const skill = state.player.skills.find((s) => s.id === skillId);
  if (!skill || skill.currentCooldown > 0) {
    return { newState: state, consumedItemIds: [] };
  }

  const newState: CombatState = JSON.parse(JSON.stringify(state));
  const consumedItemIds: string[] = [];

  switch (skill.type) {
    case 'attack': {
      const baseDamage = skill.damage + newState.player.attack;
      const variance = 1 + (Math.random() * 2 - 1) * BASE_DAMAGE_VARIANCE;
      const isCrit = Math.random() < 0.15;
      let damage = Math.floor(baseDamage * variance * (isCrit ? CRIT_MULTIPLIER : 1));
      damage = Math.max(1, damage - newState.enemy.defense);

      newState.enemy.hp -= damage;
      newState.log.push(
        isCrit
          ? `暴击！对 ${newState.enemy.name} 造成 ${damage} 点伤害！`
          : `使用 ${skill.name} 对 ${newState.enemy.name} 造成 ${damage} 点伤害`
      );
      break;
    }
    case 'heal': {
      const healAmount = Math.abs(skill.damage);
      newState.player.hp = Math.min(newState.player.maxHp, newState.player.hp + healAmount);
      newState.log.push(`使用 ${skill.name} 恢复了 ${healAmount} 点生命`);
      break;
    }
    case 'buff': {
      if (skill.id === 'defend') {
        newState.player.defense *= 2;
        newState.log.push('进入防御姿态，防御力翻倍');
      }
      break;
    }
    case 'debuff': {
      newState.enemy.defense = Math.max(0, newState.enemy.defense - skill.damage);
      newState.log.push(`使用 ${skill.name} 降低了敌人的防御`);
      break;
    }
  }

  if (skill.itemId) {
    consumedItemIds.push(skill.itemId);
  }

  if (newState.enemy.hp <= 0) {
    newState.enemy.hp = 0;
    newState.isOver = true;
    newState.result = 'win';
    newState.log.push(`击败了 ${newState.enemy.name}！`);
    return { newState, consumedItemIds };
  }

  newState.player.skills = newState.player.skills.map((s) => ({
    ...s,
    currentCooldown: Math.max(0, s.currentCooldown - 1),
  }));

  if (skill.cooldown > 0) {
    const skillIndex = newState.player.skills.findIndex((s) => s.id === skill.id);
    if (skillIndex >= 0) {
      newState.player.skills[skillIndex].currentCooldown = skill.cooldown;
    }
  }

  newState.turn = 'enemy';
  return { newState, consumedItemIds };
}

export function executeEnemyTurn(state: CombatState): CombatState {
  if (state.isOver || state.turn !== 'enemy') {
    return state;
  }

  const newState: CombatState = JSON.parse(JSON.stringify(state));
  const enemy = newState.enemy;

  const skillIndex = Math.floor(Math.random() * enemy.skills.length);
  const skill = enemy.skills[skillIndex];

  const baseDamage = skill.damage + enemy.attack;
  const variance = 1 + (Math.random() * 2 - 1) * BASE_DAMAGE_VARIANCE;
  let damage = Math.floor(baseDamage * variance);
  damage = Math.max(1, damage - newState.player.defense);

  newState.player.hp -= damage;
  newState.log.push(`${enemy.name} 使用 ${skill.name}，造成 ${damage} 点伤害`);

  if (newState.player.hp <= 0) {
    newState.player.hp = 0;
    newState.isOver = true;
    newState.result = 'lose';
    newState.log.push('你被击败了...');
    return newState;
  }

  newState.turn = 'player';
  newState.round++;
  return newState;
}

export function generateEnemyLoot(enemy: Enemy): string[] {
  const count = Math.floor(
    Math.random() * (enemy.lootCount.max - enemy.lootCount.min + 1) + enemy.lootCount.min
  );
  const loot: string[] = [];
  for (let i = 0; i < count; i++) {
    if (enemy.loot.length > 0) {
      const itemId = enemy.loot[Math.floor(Math.random() * enemy.loot.length)];
      loot.push(itemId);
    }
  }
  return loot;
}
