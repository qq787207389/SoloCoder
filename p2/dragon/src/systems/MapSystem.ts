import { getGameState, setGameState, getCurrentMap } from '../core/GameState';
import { ITEMS, EQUIPMENT } from '../data/items';
import { ENEMIES } from '../data/enemies';

export const checkCollision = (x: number, y: number): boolean => {
  const map = getCurrentMap();
  
  if (x < 0 || x >= map.width || y < 0 || y >= map.height) {
    return true;
  }
  
  const tile = map.tiles[y][x];
  return map.collisionTiles.includes(tile);
};

export const movePlayer = (dx: number, dy: number): void => {
  const state = getGameState();
  
  if (state.gamePhase !== 'map') return;
  
  const newX = state.player.position.x + dx;
  const newY = state.player.position.y + dy;
  
  if (dx < 0) state.player.direction = 'left';
  if (dx > 0) state.player.direction = 'right';
  if (dy < 0) state.player.direction = 'up';
  if (dy > 0) state.player.direction = 'down';
  
  if (!checkCollision(newX, newY)) {
    state.player.position.x = newX;
    state.player.position.y = newY;
    
    checkPortal();
    checkChest();
    checkRandomEncounter();
    checkBossEncounter();
  }
  
  setGameState(state);
};

export const checkPortal = (): void => {
  const state = getGameState();
  const map = getCurrentMap();
  
  const portal = map.portals.find(p => 
    p.position.x === state.player.position.x && 
    p.position.y === state.player.position.y
  );
  
  if (portal) {
    state.currentMap = portal.targetMap;
    state.player.position = { ...portal.targetPosition };
    state.player.mapName = portal.targetMap;
    setGameState(state);
  }
};

export const checkChest = (): void => {
  const state = getGameState();
  const map = getCurrentMap();
  
  const chest = map.chests.find(c => 
    !c.opened &&
    c.position.x === state.player.position.x && 
    c.position.y === state.player.position.y
  );
  
  if (chest) {
    chest.opened = true;
    
    const item = ITEMS[chest.itemId];
    if (item) {
      const existingItem = state.player.inventory.find(i => i.item.id === item.id);
      if (existingItem) {
        existingItem.count++;
      } else {
        state.player.inventory.push({ item, count: 1 });
      }
    }
    
    if (chest.gold) {
      state.player.stats.gold += chest.gold;
    }
    
    setGameState(state);
    
    let message = `获得了 ${item?.name || '物品'}！`;
    if (chest.gold) {
      message += ` 获得 ${chest.gold} 金币！`;
    }
    showMessage(message);
  }
};

export const checkRandomEncounter = (): void => {
  const state = getGameState();
  const map = getCurrentMap();
  
  if (map.encounterRate <= 0 || map.encounterTable.length === 0) return;
  
  if (Math.random() < map.encounterRate) {
    const enemyId = map.encounterTable[Math.floor(Math.random() * map.encounterTable.length)];
    const enemy = { ...ENEMIES[enemyId] };
    startBattle(enemy);
  }
};

export const checkBossEncounter = (): void => {
  const state = getGameState();
  
  if (state.currentMap === 'cave' && 
      state.player.position.x === 9 && 
      state.player.position.y === 12 &&
      !state.flags.hasBeatenBoss) {
    const boss = { ...ENEMIES.caveBoss };
    startBattle(boss, true);
  }
  
  if (state.currentMap === 'castle' && 
      state.player.position.x === 9 && 
      state.player.position.y === 10 &&
      !state.flags.hasBeatenDemonLord &&
      state.flags.hasHeroProof) {
    const demonLord = { ...ENEMIES.demonLord };
    startBattle(demonLord, true);
  }
};

export const interactWithNPC = (): void => {
  const state = getGameState();
  const map = getCurrentMap();
  
  if (state.gamePhase !== 'map') return;
  
  const directions = [
    { x: 0, y: -1 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 }
  ];
  
  for (const dir of directions) {
    const checkX = state.player.position.x + dir.x;
    const checkY = state.player.position.y + dir.y;
    
    const npc = map.npcs.find(n => 
      n.position.x === checkX && n.position.y === checkY
    );
    
    if (npc) {
      if (npc.questFlag) {
        state.flags[npc.questFlag] = true;
        
        if (npc.questFlag === 'hasTalkedToKing') {
          state.currentQuest = '去洞窟击败巨兽';
        }
        if (npc.questFlag === 'hasTalkedToGirl') {
          const herb = ITEMS.herb;
          const existingItem = state.player.inventory.find(i => i.item.id === herb.id);
          if (existingItem) {
            existingItem.count++;
          } else {
            state.player.inventory.push({ item: herb, count: 1 });
          }
        }
      }
      
      if (npc.id === 'king' && state.flags.hasBeatenBoss && !state.flags.hasHeroProof) {
        state.flags.hasHeroProof = true;
        const heroProof = ITEMS.heroProof;
        state.player.inventory.push({ item: heroProof, count: 1 });
        
        state.maps.castle.portals.push({
          position: { x: 9, y: 0 },
          targetMap: 'field',
          targetPosition: { x: 25, y: 5 }
        });
        state.maps.field.portals.push({
          position: { x: 25, y: 5 },
          targetMap: 'castle',
          targetPosition: { x: 9, y: 1 }
        });
        
        state.currentQuest = '前往魔王城击败魔王！';
        showDialogue([
          '你击败了洞窟的巨兽！',
          '你是真正的勇者！',
          '我现在授予你勇者之证！',
          '魔王城就在野外的东北方，去击败魔王吧！'
        ]);
      } else {
        showDialogue(npc.dialogues);
      }
      
      setGameState(state);
      return;
    }
  }
};

export const showDialogue = (texts: string[]): void => {
  const state = getGameState();
  state.gamePhase = 'dialogue';
  state.dialogueBox = {
    visible: true,
    text: texts,
    currentIndex: 0,
    npcId: null
  };
  setGameState(state);
  updateMessageBox(texts[0]);
};

export const advanceDialogue = (): void => {
  const state = getGameState();
  
  if (state.dialogueBox.currentIndex < state.dialogueBox.text.length - 1) {
    state.dialogueBox.currentIndex++;
    updateMessageBox(state.dialogueBox.text[state.dialogueBox.currentIndex]);
    setGameState(state);
  } else {
    closeDialogue();
  }
};

export const closeDialogue = (): void => {
  const state = getGameState();
  state.gamePhase = 'map';
  state.dialogueBox = {
    visible: false,
    text: [],
    currentIndex: 0,
    npcId: null
  };
  setGameState(state);
  hideMessageBox();
};

const updateMessageBox = (text: string): void => {
  const messageBox = document.getElementById('message-box');
  if (messageBox) {
    messageBox.style.display = 'block';
    messageBox.textContent = text;
  }
};

const hideMessageBox = (): void => {
  const messageBox = document.getElementById('message-box');
  if (messageBox) {
    messageBox.style.display = 'none';
  }
};

const showMessage = (text: string): void => {
  updateMessageBox(text);
  setTimeout(() => {
    hideMessageBox();
  }, 2000);
};

import { startBattle } from './BattleSystem';
