import { GameState, Player } from '../types';
import { MAPS } from '../data/maps';
import { SPELLS } from '../data/spells';
import { ITEMS } from '../data/items';

const createInitialPlayer = (): Player => ({
  position: { x: 12, y: 16 },
  direction: 'down',
  stats: {
    level: 1,
    exp: 0,
    expToNext: 50,
    hp: 100,
    maxHp: 100,
    mp: 50,
    maxMp: 50,
    attack: 10,
    defense: 5,
    speed: 6,
    gold: 0
  },
  equipment: {
    weapon: null,
    armor: null
  },
  inventory: [
    { item: ITEMS.herb, count: 3 },
    { item: ITEMS.magicWater, count: 2 }
  ],
  spells: [SPELLS.fireball, SPELLS.heal],
  mapName: 'village'
});

export const createInitialGameState = (): GameState => ({
  player: createInitialPlayer(),
  currentMap: 'village',
  maps: JSON.parse(JSON.stringify(MAPS)),
  flags: {
    hasTalkedToKing: false,
    hasTalkedToGirl: false,
    hasBeatenBoss: false,
    hasHeroProof: false,
    hasBeatenDemonLord: false
  },
  gamePhase: 'map',
  battleState: null,
  dialogueBox: {
    visible: false,
    text: [],
    currentIndex: 0,
    npcId: null
  },
  questLog: [],
  currentQuest: '与村长对话'
});

let gameState: GameState = createInitialGameState();

export const getGameState = (): GameState => gameState;

export const setGameState = (newState: GameState): void => {
  gameState = newState;
};

export const resetGameState = (): void => {
  gameState = createInitialGameState();
};

export const getCurrentMap = () => {
  return gameState.maps[gameState.currentMap];
};

export const getPlayerStats = () => {
  const { stats, equipment } = gameState.player;
  return {
    ...stats,
    attack: stats.attack + (equipment.weapon?.attack || 0),
    defense: stats.defense + (equipment.armor?.defense || 0)
  };
};
