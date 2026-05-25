import { create } from 'zustand';
import type { GameState, Character, Card, Relic, BattleState, GameMap, Enemy } from '../game/types';
import { getCharacter } from '../game/data/characters';
import { createCardInstance } from '../game/data/cards';
import { createRelicInstance } from '../game/data/relics';
import { createEnemy, getRandomEnemy } from '../game/data/enemies';
import { shuffle } from '../game/utils';

interface GameStore extends GameState {
  selectCharacter: (characterId: string) => void;
  startNewGame: () => void;
  setPhase: (phase: GameState['phase']) => void;
  startBattle: (enemyTypes: string[]) => void;
  playCard: (cardId: string, targetId?: string) => void;
  endTurn: () => void;
  selectCard: (card: Card | null) => void;
  selectEnemy: (enemyId: string | null) => void;
  generateMap: () => void;
  selectNode: (nodeId: string) => void;
  addCardToDeck: (card: Card) => void;
  addRelic: (relic: Relic) => void;
  addGold: (amount: number) => void;
  heal: (amount: number) => void;
  takeDamage: (amount: number) => void;
  saveGame: () => void;
  loadGame: () => boolean;
  resetGame: () => void;
}

const initialState: GameState = {
  phase: 'menu',
  character: null,
  playerHp: 0,
  playerMaxHp: 0,
  gold: 0,
  deck: [],
  relics: [],
  map: null,
  battle: null,
  shop: null,
  currentEvent: null,
  rewards: [],
  floor: 0,
  maxFloor: 15
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  selectCharacter: (characterId: string) => {
    const character = getCharacter(characterId);
    if (character) {
      set({ character });
    }
  },

  startNewGame: () => {
    const { character } = get();
    if (!character) return;

    const deck: Card[] = [];
    for (const cardId of character.startingDeck) {
      const card = createCardInstance(cardId);
      if (card) deck.push(card);
    }

    const relic = createRelicInstance(character.startingRelic);
    const relics = relic ? [relic] : [];

    set({
      phase: 'map',
      playerHp: character.maxHp,
      playerMaxHp: character.maxHp,
      gold: character.startingGold,
      deck,
      relics,
      floor: 0,
      battle: null
    });

    get().generateMap();
  },

  setPhase: (phase) => set({ phase }),

  startBattle: (enemyTypes: string[]) => {
    const { playerHp, playerMaxHp, gold, deck, relics } = get();

    const enemies: Enemy[] = [];
    for (const type of enemyTypes) {
      const enemy = createEnemy(type);
      if (enemy) {
        const move = selectNextMove(enemy);
        enemy.intent = {
          type: move.intent,
          moveId: move.id,
          damage: move.damage,
          hits: move.hits,
          block: move.block,
          buffs: move.buffs,
          debuffs: move.debuffs
        };
        enemies.push(enemy);
      }
    }

    const shuffledDeck = shuffle([...deck]);
    const drawPile = shuffledDeck.slice(5);
    const hand = shuffledDeck.slice(0, 5);

    const battle: BattleState = {
      turn: 1,
      phase: 'player',
      player: {
        id: 'player',
        name: get().character?.name || '玩家',
        maxHp: playerMaxHp,
        currentHp: playerHp,
        block: 0,
        statusEffects: [],
        energy: 3,
        maxEnergy: 3,
        gold
      },
      enemies,
      deck: [...deck],
      hand,
      drawPile,
      discardPile: [],
      exhaustPile: [],
      selectedCard: null,
      selectedEnemy: null,
      battleLog: ['战斗开始！'],
      relics
    };

    set({ battle, phase: 'battle' });
  },

  playCard: (cardId: string, targetId?: string) => {
    const { battle } = get();
    if (!battle || battle.phase !== 'player') return;

    const cardIndex = battle.hand.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return;

    const card = battle.hand[cardIndex];
    if (battle.player.energy < card.cost) return;

    if (card.target === 'single' && !targetId && battle.enemies.length > 0) {
      targetId = battle.enemies[0].id;
    }

    const newBattle = { ...battle };
    newBattle.player.energy -= card.cost;
    newBattle.hand = newBattle.hand.filter((_, i) => i !== cardIndex);

    for (const effect of card.effects) {
      applyCardEffect(newBattle, effect, card, targetId);
    }

    if (card.exhausts) {
      newBattle.exhaustPile.push(card);
    } else {
      newBattle.discardPile.push(card);
    }

    newBattle.battleLog.push(`打出了 ${card.name}`);

    checkBattleEnd(newBattle);
    set({ battle: newBattle });
  },

  endTurn: () => {
    const { battle } = get();
    if (!battle || battle.phase !== 'player') return;

    const newBattle = { ...battle };
    newBattle.phase = 'enemy';

    newBattle.discardPile = [...newBattle.discardPile, ...newBattle.hand];
    newBattle.hand = [];

    newBattle.player.block = 0;

    set({ battle: newBattle });

    setTimeout(() => {
      executeEnemyTurn();
    }, 500);
  },

  selectCard: (card) => {
    const { battle } = get();
    if (!battle) return;
    set({ battle: { ...battle, selectedCard: card } });
  },

  selectEnemy: (enemyId) => {
    const { battle } = get();
    if (!battle) return;
    set({ battle: { ...battle, selectedEnemy: enemyId } });
  },

  generateMap: () => {
    const { maxFloor } = get();
    const layers = [];

    for (let layer = 0; layer < maxFloor; layer++) {
      const nodesInLayer = layer === 0 || layer === maxFloor - 1 ? 1 : Math.floor(Math.random() * 3) + 2;
      const nodes = [];

      for (let i = 0; i < nodesInLayer; i++) {
        const x = (i + 1) / (nodesInLayer + 1);
        const y = 1 - layer / (maxFloor - 1);

        let type: string;
        if (layer === maxFloor - 1) {
          type = 'boss';
        } else if (layer === 0) {
          type = 'enemy';
        } else {
          const rand = Math.random();
          if (rand < 0.45) type = 'enemy';
          else if (rand < 0.55) type = 'elite';
          else if (rand < 0.70) type = 'event';
          else if (rand < 0.85) type = 'shop';
          else type = 'campfire';
        }

        nodes.push({
          id: `node_${layer}_${i}`,
          type: type as any,
          x,
          y,
          layer,
          connections: [],
          completed: false,
          accessible: layer === 0,
          visited: false
        });
      }

      layers.push(nodes);
    }

    for (let layer = 0; layer < maxFloor - 1; layer++) {
      for (const node of layers[layer]) {
        const nextLayer = layers[layer + 1];
        const connections = [];
        
        for (const nextNode of nextLayer) {
          if (Math.random() < 0.6 || nextLayer.length === 1) {
            connections.push(nextNode.id);
          }
        }

        if (connections.length === 0) {
          const closestNode = nextLayer.reduce((closest, n) => 
            Math.abs(n.x - node.x) < Math.abs(closest.x - node.x) ? n : closest
          );
          connections.push(closestNode.id);
        }

        node.connections = [...new Set(connections)];
      }
    }

    set({
      map: {
        layers,
        currentLayer: 0,
        currentNodeId: null,
        floor: 0
      }
    });
  },

  selectNode: (nodeId: string) => {
    const { map, startBattle } = get();
    if (!map) return;

    const node = map.layers.flat().find(n => n.id === nodeId);
    if (!node || !node.accessible || node.completed) return;

    const newMap = { ...map };
    for (const layer of newMap.layers) {
      for (const n of layer) {
        n.accessible = false;
        if (n.id === nodeId) {
          n.completed = true;
          n.visited = true;
        }
      }
    }

    for (const nextNodeId of node.connections) {
      const nextNode = newMap.layers.flat().find(n => n.id === nextNodeId);
      if (nextNode) {
        nextNode.accessible = true;
      }
    }

    newMap.currentLayer = node.layer;
    newMap.currentNodeId = nodeId;
    newMap.floor = node.layer + 1;

    set({ map: newMap, floor: node.layer + 1 });

    switch (node.type) {
      case 'enemy':
        startBattle([getRandomEnemy(false, false)]);
        break;
      case 'elite':
        startBattle([getRandomEnemy(true, false)]);
        break;
      case 'boss':
        startBattle([getRandomEnemy(false, true)]);
        break;
      case 'shop':
        set({ phase: 'shop' });
        break;
      case 'campfire':
        set({ phase: 'campfire' });
        break;
      case 'event':
        set({ phase: 'event' });
        break;
      default:
        break;
    }
  },

  addCardToDeck: (card) => {
    set(state => ({ deck: [...state.deck, card] }));
  },

  addRelic: (relic) => {
    set(state => ({ relics: [...state.relics, relic] }));
  },

  addGold: (amount) => {
    set(state => ({ gold: state.gold + amount }));
  },

  heal: (amount) => {
    set(state => ({
      playerHp: Math.min(state.playerHp + amount, state.playerMaxHp)
    }));
  },

  takeDamage: (amount) => {
    set(state => {
      const newHp = state.playerHp - amount;
      if (newHp <= 0) {
        return { playerHp: 0, phase: 'defeat' };
      }
      return { playerHp: newHp };
    });
  },

  saveGame: () => {
    const state = get();
    const saveData = {
      version: '1.0',
      timestamp: Date.now(),
      gameState: state,
      seed: Math.random()
    };
    localStorage.setItem('killtower_save', JSON.stringify(saveData));
  },

  loadGame: () => {
    const saved = localStorage.getItem('killtower_save');
    if (!saved) return false;

    try {
      const saveData = JSON.parse(saved);
      set(saveData.gameState);
      return true;
    } catch {
      return false;
    }
  },

  resetGame: () => {
    set(initialState);
  }
}));

function selectNextMove(enemy: Enemy) {
  const totalWeight = enemy.moves.reduce((sum, m) => sum + m.weight, 0);
  let random = Math.random() * totalWeight;

  for (const move of enemy.moves) {
    random -= move.weight;
    if (random <= 0) return move;
  }

  return enemy.moves[0];
}

function applyCardEffect(battle: BattleState, effect: any, card: Card, targetId?: string) {
  const value = card.isUpgraded && effect.upgradedValue ? effect.upgradedValue : effect.value;

  switch (effect.type) {
    case 'damage': {
      const strength = battle.player.statusEffects.find(s => s.type === 'strength')?.stacks || 0;
      let damage = value + strength;

      if (effect.target === 'allEnemies') {
        for (const enemy of battle.enemies) {
          dealDamageToEnemy(battle, enemy, damage);
        }
      } else {
        const enemy = battle.enemies.find(e => e.id === targetId);
        if (enemy) {
          dealDamageToEnemy(battle, enemy, damage);
        }
      }
      break;
    }
    case 'block': {
      const dexterity = battle.player.statusEffects.find(s => s.type === 'dexterity')?.stacks || 0;
      battle.player.block += value + dexterity;
      break;
    }
    case 'draw': {
      for (let i = 0; i < value; i++) {
        drawCard(battle);
      }
      break;
    }
    case 'applyStatus': {
      if (effect.target === 'self') {
        addStatusEffect(battle.player.statusEffects, effect.statusType!, value);
      } else {
        const enemy = battle.enemies.find(e => e.id === targetId);
        if (enemy) {
          addStatusEffect(enemy.statusEffects, effect.statusType!, value);
        }
      }
      break;
    }
    case 'heal': {
      battle.player.currentHp = Math.min(
        battle.player.currentHp + value,
        battle.player.maxHp
      );
      break;
    }
    case 'energy': {
      battle.player.energy += value;
      break;
    }
    case 'strength': {
      addStatusEffect(battle.player.statusEffects, 'strength', value);
      break;
    }
    case 'dexterity': {
      addStatusEffect(battle.player.statusEffects, 'dexterity', value);
      break;
    }
  }
}

function dealDamageToEnemy(battle: BattleState, enemy: Enemy, damage: number) {
  const vulnerable = enemy.statusEffects.find(s => s.type === 'vulnerable');
  if (vulnerable) {
    damage = Math.floor(damage * 1.5);
  }

  if (enemy.block > 0) {
    if (enemy.block >= damage) {
      enemy.block -= damage;
      return;
    }
    damage -= enemy.block;
    enemy.block = 0;
  }

  enemy.currentHp -= damage;
  battle.battleLog.push(`对 ${enemy.name} 造成 ${damage} 点伤害`);
}

function addStatusEffect(effects: any[], type: string, stacks: number) {
  const existing = effects.find(e => e.type === type);
  if (existing) {
    existing.stacks += stacks;
  } else {
    effects.push({ type, stacks });
  }
}

function drawCard(battle: BattleState) {
  if (battle.drawPile.length === 0) {
    battle.drawPile = shuffle([...battle.discardPile]);
    battle.discardPile = [];
  }

  if (battle.drawPile.length > 0) {
    const card = battle.drawPile.shift()!;
    battle.hand.push(card);
  }
}

function checkBattleEnd(battle: BattleState) {
  battle.enemies = battle.enemies.filter(e => e.currentHp > 0);

  if (battle.enemies.length === 0) {
    setTimeout(() => {
      useGameStore.getState().setPhase('reward');
      useGameStore.getState().addGold(15 + Math.floor(Math.random() * 10));
    }, 1000);
  }

  if (battle.player.currentHp <= 0) {
    setTimeout(() => {
      useGameStore.getState().setPhase('defeat');
    }, 1000);
  }
}

function executeEnemyTurn() {
  const { battle } = useGameStore.getState();
  if (!battle) return;

  const newBattle = { ...battle };

  for (const enemy of newBattle.enemies) {
    const move = enemy.moves.find(m => m.id === enemy.intent.moveId);
    if (!move) continue;

    if (move.block) {
      enemy.block += move.block;
    }

    if (move.damage) {
      const weak = enemy.statusEffects.find(s => s.type === 'weak');
      let damage = move.damage;
      if (weak) damage = Math.floor(damage * 0.75);

      const strength = enemy.statusEffects.find(s => s.type === 'strength');
      if (strength) damage += strength.stacks;

      const hits = move.hits || 1;
      for (let i = 0; i < hits; i++) {
        if (newBattle.player.block > 0) {
          if (newBattle.player.block >= damage) {
            newBattle.player.block -= damage;
            continue;
          }
          damage -= newBattle.player.block;
          newBattle.player.block = 0;
        }
        newBattle.player.currentHp -= damage;
      }

      newBattle.battleLog.push(`${enemy.name} 造成 ${move.damage * (move.hits || 1)} 点伤害`);
    }

    if (move.buffs) {
      for (const buff of move.buffs) {
        addStatusEffect(enemy.statusEffects, buff.type, buff.stacks);
      }
    }

    if (move.debuffs) {
      for (const debuff of move.debuffs) {
        addStatusEffect(newBattle.player.statusEffects, debuff.type, debuff.stacks);
      }
    }

    enemy.block = 0;

    const poison = enemy.statusEffects.find(s => s.type === 'poison');
    if (poison && poison.stacks > 0) {
      enemy.currentHp -= poison.stacks;
      poison.stacks--;
    }

    const nextMove = selectNextMove(enemy);
    enemy.intent = {
      type: nextMove.intent,
      moveId: nextMove.id,
      damage: nextMove.damage,
      hits: nextMove.hits,
      block: nextMove.block,
      buffs: nextMove.buffs,
      debuffs: nextMove.debuffs
    };
  }

  const weak = newBattle.player.statusEffects.find(s => s.type === 'weak');
  if (weak) weak.stacks--;
  const vulnerable = newBattle.player.statusEffects.find(s => s.type === 'vulnerable');
  if (vulnerable) vulnerable.stacks--;

  newBattle.enemies = newBattle.enemies.filter(e => e.currentHp > 0);

  if (newBattle.enemies.length === 0) {
    useGameStore.setState({ battle: newBattle, phase: 'reward' });
    useGameStore.getState().addGold(15 + Math.floor(Math.random() * 10));
    return;
  }

  if (newBattle.player.currentHp <= 0) {
    useGameStore.setState({ battle: newBattle, phase: 'defeat' });
    return;
  }

  setTimeout(() => {
    startPlayerTurn();
  }, 500);
}

function startPlayerTurn() {
  const { battle } = useGameStore.getState();
  if (!battle) return;

  const newBattle = { ...battle };
  newBattle.turn++;
  newBattle.phase = 'player';
  newBattle.player.energy = newBattle.player.maxEnergy;

  for (let i = 0; i < 5; i++) {
    drawCard(newBattle);
  }

  const poison = newBattle.player.statusEffects.find(s => s.type === 'poison');
  if (poison && poison.stacks > 0) {
    newBattle.player.currentHp -= poison.stacks;
    poison.stacks--;
  }

  if (newBattle.player.currentHp <= 0) {
    useGameStore.setState({ battle: newBattle, phase: 'defeat' });
    return;
  }

  useGameStore.setState({ battle: newBattle });
}
