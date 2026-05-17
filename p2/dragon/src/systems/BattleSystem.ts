import { getGameState, setGameState, getPlayerStats } from '../core/GameState';
import { Enemy, Spell, Item } from '../types';
import { ITEMS, EQUIPMENT } from '../data/items';

let battleMenuElement: HTMLElement | null = null;

export const startBattle = (enemy: Enemy, isBoss: boolean = false): void => {
  const state = getGameState();
  
  state.gamePhase = 'battle';
  state.battleState = {
    enemy,
    turn: getPlayerStats().speed >= enemy.speed ? 'player' : 'enemy',
    playerAction: null,
    selectedSpell: null,
    selectedItem: null,
    log: [`遭遇了 ${enemy.name}！`],
    isOver: false,
    victory: false
  };
  
  setGameState(state);
  showBattleMenu();
  
  if (state.battleState.turn === 'enemy') {
    setTimeout(() => enemyTurn(), 1000);
  }
};

export const playerAttack = (): void => {
  const state = getGameState();
  const battle = state.battleState;
  if (!battle || battle.turn !== 'player') return;
  
  const stats = getPlayerStats();
  const damage = Math.max(1, stats.attack - battle.enemy.defense + Math.floor(Math.random() * 5));
  battle.enemy.hp -= damage;
  battle.log.push(`你攻击造成了 ${damage} 点伤害！`);
  
  checkBattleEnd();
  setGameState(state);
  
  if (!battle.isOver) {
    battle.turn = 'enemy';
    setTimeout(() => enemyTurn(), 800);
  }
};

export const useSpell = (spell: Spell): void => {
  const state = getGameState();
  const battle = state.battleState;
  if (!battle || battle.turn !== 'player') return;
  
  if (state.player.stats.mp < spell.mpCost) {
    battle.log.push('MP不足！');
    setGameState(state);
    return;
  }
  
  state.player.stats.mp -= spell.mpCost;
  
  if (spell.damage) {
    battle.enemy.hp -= spell.damage;
    battle.log.push(`${spell.name}造成了 ${spell.damage} 点伤害！`);
  }
  
  if (spell.heal) {
    state.player.stats.hp = Math.min(
      state.player.stats.maxHp,
      state.player.stats.hp + spell.heal
    );
    battle.log.push(`${spell.name}恢复了 ${spell.heal} 点HP！`);
  }
  
  checkBattleEnd();
  setGameState(state);
  updateHUD();
  
  if (!battle.isOver) {
    battle.turn = 'enemy';
    setTimeout(() => enemyTurn(), 800);
  }
};

export const useBattleItem = (item: Item): void => {
  const state = getGameState();
  const battle = state.battleState;
  if (!battle || battle.turn !== 'player') return;
  
  const invItem = state.player.inventory.find(i => i.item.id === item.id && i.count > 0);
  if (!invItem) {
    battle.log.push('没有这个道具！');
    setGameState(state);
    return;
  }
  
  invItem.count--;
  
  if (item.effect?.hp) {
    state.player.stats.hp = Math.min(
      state.player.stats.maxHp,
      state.player.stats.hp + item.effect.hp
    );
    battle.log.push(`使用了${item.name}，恢复了 ${item.effect.hp} 点HP！`);
  }
  
  if (item.effect?.mp) {
    state.player.stats.mp = Math.min(
      state.player.stats.maxMp,
      state.player.stats.mp + item.effect.mp
    );
    battle.log.push(`使用了${item.name}，恢复了 ${item.effect.mp} 点MP！`);
  }
  
  checkBattleEnd();
  setGameState(state);
  updateHUD();
  
  if (!battle.isOver) {
    battle.turn = 'enemy';
    setTimeout(() => enemyTurn(), 800);
  }
};

export const tryEscape = (): void => {
  const state = getGameState();
  const battle = state.battleState;
  if (!battle || battle.turn !== 'player') return;
  
  const escapeChance = 0.5 + (getPlayerStats().speed - battle.enemy.speed) * 0.05;
  
  if (Math.random() < escapeChance) {
    battle.log.push('成功逃跑了！');
    battle.isOver = true;
    battle.victory = false;
    setGameState(state);
    setTimeout(() => endBattle(), 1000);
  } else {
    battle.log.push('逃跑失败！');
    setGameState(state);
    battle.turn = 'enemy';
    setTimeout(() => enemyTurn(), 800);
  }
};

const enemyTurn = (): void => {
  const state = getGameState();
  const battle = state.battleState;
  if (!battle || battle.isOver) return;
  
  const stats = getPlayerStats();
  
  const hpPercent = battle.enemy.hp / battle.enemy.maxHp;
  const availableSkills = battle.enemy.skills.filter(s => hpPercent <= s.hpThreshold);
  
  if (availableSkills.length > 0 && Math.random() < 0.4) {
    const skill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
    const damage = Math.max(1, skill.damage - stats.defense / 2);
    state.player.stats.hp -= damage;
    battle.log.push(`${battle.enemy.name}使用了${skill.name}，造成了 ${Math.floor(damage)} 点伤害！`);
  } else {
    const damage = Math.max(1, battle.enemy.attack - stats.defense + Math.floor(Math.random() * 5));
    state.player.stats.hp -= damage;
    battle.log.push(`${battle.enemy.name}攻击造成了 ${damage} 点伤害！`);
  }
  
  checkBattleEnd();
  setGameState(state);
  updateHUD();
  
  if (!battle.isOver) {
    battle.turn = 'player';
    setGameState(state);
  }
};

const checkBattleEnd = (): void => {
  const state = getGameState();
  const battle = state.battleState;
  if (!battle) return;
  
  if (battle.enemy.hp <= 0) {
    battle.enemy.hp = 0;
    battle.isOver = true;
    battle.victory = true;
    battle.log.push(`击败了 ${battle.enemy.name}！`);
    
    state.player.stats.exp += battle.enemy.exp;
    state.player.stats.gold += battle.enemy.gold;
    battle.log.push(`获得了 ${battle.enemy.exp} 经验值和 ${battle.enemy.gold} 金币！`);
    
    if (battle.enemy.id === 'caveBoss') {
      state.flags.hasBeatenBoss = true;
      battle.log.push('洞窟巨兽被击败了！回去找村长吧！');
    }
    
    if (battle.enemy.id === 'demonLord') {
      state.flags.hasBeatenDemonLord = true;
      battle.log.push('恭喜！你击败了魔王，拯救了世界！');
    }
    
    checkLevelUp();
    setTimeout(() => endBattle(), 2000);
  }
  
  if (state.player.stats.hp <= 0) {
    state.player.stats.hp = 0;
    battle.isOver = true;
    battle.victory = false;
    battle.log.push('你被击败了...');
    setTimeout(() => {
      state.player.stats.hp = Math.floor(state.player.stats.maxHp * 0.5);
      state.player.stats.mp = Math.floor(state.player.stats.maxMp * 0.5);
      state.player.position = { x: 12, y: 16 };
      state.currentMap = 'village';
      state.player.mapName = 'village';
      setGameState(state);
      endBattle();
    }, 2000);
  }
  
  setGameState(state);
  updateHUD();
};

const checkLevelUp = (): void => {
  const state = getGameState();
  const { stats } = state.player;
  
  while (stats.exp >= stats.expToNext) {
    stats.exp -= stats.expToNext;
    stats.level++;
    stats.expToNext = Math.floor(stats.expToNext * 1.5);
    
    stats.maxHp += 15;
    stats.hp = stats.maxHp;
    stats.maxMp += 8;
    stats.mp = stats.maxMp;
    stats.attack += 3;
    stats.defense += 2;
    stats.speed += 1;
    
    state.battleState?.log.push(`升级了！现在是 Lv.${stats.level}！`);
  }
  
  setGameState(state);
  updateHUD();
};

const endBattle = (): void => {
  const state = getGameState();
  state.gamePhase = 'map';
  state.battleState = null;
  setGameState(state);
  hideBattleMenu();
  updateHUD();
};

const showBattleMenu = (): void => {
  if (battleMenuElement) return;
  
  const menu = document.createElement('div');
  menu.id = 'battle-menu-overlay';
  menu.style.cssText = `
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 10px;
    z-index: 100;
  `;
  
  const createBtn = (text: string, onClick: () => void) => {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.style.cssText = `
      background: #2a2a4a;
      border: 2px solid #4a4a6a;
      color: #fff;
      padding: 10px 20px;
      cursor: pointer;
      font-family: monospace;
      font-size: 14px;
    `;
    btn.onmouseover = () => btn.style.borderColor = '#ffd700';
    btn.onmouseout = () => btn.style.borderColor = '#4a4a6a';
    btn.onclick = onClick;
    return btn;
  };
  
  menu.appendChild(createBtn('攻击', () => {
    hideSubMenus();
    playerAttack();
  }));
  
  menu.appendChild(createBtn('魔法', () => showSpellMenu()));
  menu.appendChild(createBtn('道具', () => showItemMenu()));
  menu.appendChild(createBtn('逃跑', tryEscape));
  
  document.getElementById('game-container')?.appendChild(menu);
  battleMenuElement = menu;
};

const hideBattleMenu = (): void => {
  if (battleMenuElement) {
    battleMenuElement.remove();
    battleMenuElement = null;
  }
  hideSubMenus();
};

let subMenuElement: HTMLElement | null = null;

const showSpellMenu = (): void => {
  hideSubMenus();
  const state = getGameState();
  
  const menu = document.createElement('div');
  menu.id = 'spell-menu';
  menu.style.cssText = `
    position: absolute;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0,0,0,0.9);
    border: 2px solid #ffd700;
    padding: 10px;
    z-index: 101;
  `;
  
  state.player.spells.forEach(spell => {
    const btn = document.createElement('button');
    btn.textContent = `${spell.name} (MP:${spell.mpCost})`;
    btn.style.cssText = `
      display: block;
      width: 100%;
      margin: 5px 0;
      padding: 8px 15px;
      background: #2a2a4a;
      border: 2px solid #4a4a6a;
      color: #fff;
      cursor: pointer;
    `;
    btn.onclick = () => {
      useSpell(spell);
      hideSubMenus();
    };
    menu.appendChild(btn);
  });
  
  const backBtn = document.createElement('button');
  backBtn.textContent = '返回';
  backBtn.style.cssText = `
    display: block;
    width: 100%;
    margin: 5px 0;
    padding: 8px 15px;
    background: #4a2a2a;
    border: 2px solid #6a4a4a;
    color: #fff;
    cursor: pointer;
  `;
  backBtn.onclick = hideSubMenus;
  menu.appendChild(backBtn);
  
  document.getElementById('game-container')?.appendChild(menu);
  subMenuElement = menu;
};

const showItemMenu = (): void => {
  hideSubMenus();
  const state = getGameState();
  
  const menu = document.createElement('div');
  menu.id = 'item-menu';
  menu.style.cssText = `
    position: absolute;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0,0,0,0.9);
    border: 2px solid #ffd700;
    padding: 10px;
    z-index: 101;
    max-height: 200px;
    overflow-y: auto;
  `;
  
  const usableItems = state.player.inventory.filter(i => 
    i.count > 0 && i.item.type === 'consumable'
  );
  
  if (usableItems.length === 0) {
    const text = document.createElement('div');
    text.textContent = '没有可用的道具';
    text.style.color = '#fff';
    menu.appendChild(text);
  } else {
    usableItems.forEach(({ item, count }) => {
      const btn = document.createElement('button');
      btn.textContent = `${item.name} x${count}`;
      btn.style.cssText = `
        display: block;
        width: 100%;
        margin: 5px 0;
        padding: 8px 15px;
        background: #2a2a4a;
        border: 2px solid #4a4a6a;
        color: #fff;
        cursor: pointer;
      `;
      btn.onclick = () => {
        useBattleItem(item);
        hideSubMenus();
      };
      menu.appendChild(btn);
    });
  }
  
  const backBtn = document.createElement('button');
  backBtn.textContent = '返回';
  backBtn.style.cssText = `
    display: block;
    width: 100%;
    margin: 5px 0;
    padding: 8px 15px;
    background: #4a2a2a;
    border: 2px solid #6a4a4a;
    color: #fff;
    cursor: pointer;
  `;
  backBtn.onclick = hideSubMenus;
  menu.appendChild(backBtn);
  
  document.getElementById('game-container')?.appendChild(menu);
  subMenuElement = menu;
};

const hideSubMenus = (): void => {
  if (subMenuElement) {
    subMenuElement.remove();
    subMenuElement = null;
  }
};

export const updateHUD = (): void => {
  const state = getGameState();
  const { stats } = state.player;
  
  const levelEl = document.getElementById('player-level');
  const goldEl = document.getElementById('player-gold');
  const hpBar = document.getElementById('hp-bar');
  const hpText = document.getElementById('hp-text');
  const mpBar = document.getElementById('mp-bar');
  const mpText = document.getElementById('mp-text');
  
  if (levelEl) levelEl.textContent = String(stats.level);
  if (goldEl) goldEl.textContent = String(stats.gold);
  if (hpBar) hpBar.style.width = `${(stats.hp / stats.maxHp) * 100}%`;
  if (hpText) hpText.textContent = `${stats.hp}/${stats.maxHp}`;
  if (mpBar) mpBar.style.width = `${(stats.mp / stats.maxMp) * 100}%`;
  if (mpText) mpText.textContent = `${stats.mp}/${stats.maxMp}`;
};
