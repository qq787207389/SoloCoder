import { getGameState, setGameState } from '../core/GameState';
import { Item, Equipment } from '../types';
import { ITEMS, EQUIPMENT as EQUIPMENT_DATA } from '../data/items';
import { updateHUD } from './BattleSystem';

let menuOverlay: HTMLElement | null = null;
let menuContent: HTMLElement | null = null;

export const openMenu = (): void => {
  const state = getGameState();
  if (state.gamePhase !== 'map') return;
  
  state.gamePhase = 'menu';
  setGameState(state);
  
  menuOverlay = document.getElementById('menu-overlay');
  if (menuOverlay) {
    menuOverlay.style.display = 'block';
  }
  
  menuContent = document.getElementById('menu-content');
  if (!menuContent) {
    menuContent = document.createElement('div');
    menuContent.id = 'menu-content';
    menuOverlay?.appendChild(menuContent);
  }
  
  setupMenuButtons();
};

export const closeMenu = (): void => {
  const state = getGameState();
  state.gamePhase = 'map';
  setGameState(state);
  
  if (menuOverlay) {
    menuOverlay.style.display = 'none';
  }
  if (menuContent) {
    menuContent.innerHTML = '';
  }
};

const setupMenuButtons = (): void => {
  const menuGrid = document.getElementById('menu-grid');
  if (!menuGrid) return;
  
  menuGrid.innerHTML = '';
  
  const menuItems = [
    { id: 'status', name: '状态', action: showStatus },
    { id: 'items', name: '道具', action: showItems },
    { id: 'equip', name: '装备', action: showEquipment },
    { id: 'quest', name: '任务', action: showQuest },
    { id: 'save', name: '存档', action: saveGame },
    { id: 'load', name: '读档', action: loadGame }
  ];
  
  menuItems.forEach(item => {
    const div = document.createElement('div');
    div.className = 'menu-item';
    div.textContent = item.name;
    div.onclick = item.action;
    menuGrid.appendChild(div);
  });
};

const showBackButton = (): void => {
  const menuGrid = document.getElementById('menu-grid');
  if (!menuGrid) return;
  
  menuGrid.innerHTML = '';
  
  const backBtn = document.createElement('div');
  backBtn.className = 'menu-item';
  backBtn.textContent = '返回';
  backBtn.style.background = '#4a2a2a';
  backBtn.onclick = setupMenuButtons;
  menuGrid.appendChild(backBtn);
};

const showStatus = (): void => {
  const state = getGameState();
  const { stats, equipment } = state.player;
  
  showBackButton();
  
  if (menuContent) {
    menuContent.innerHTML = `
      <div style="color: #fff; text-align: center; font-family: monospace;">
        <h3 style="color: #ffd700; margin-bottom: 20px;">角色状态</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; text-align: left; max-width: 400px; margin: 0 auto;">
          <div>等级: ${stats.level}</div>
          <div>经验: ${stats.exp}/${stats.expToNext}</div>
          <div>HP: ${stats.hp}/${stats.maxHp}</div>
          <div>MP: ${stats.mp}/${stats.maxMp}</div>
          <div>攻击力: ${stats.attack + (equipment.weapon?.attack || 0)}</div>
          <div>防御力: ${stats.defense + (equipment.armor?.defense || 0)}</div>
          <div>速度: ${stats.speed}</div>
          <div>金币: ${stats.gold}</div>
          <div>武器: ${equipment.weapon?.name || '无'}</div>
          <div>防具: ${equipment.armor?.name || '无'}</div>
        </div>
      </div>
    `;
  }
};

const showItems = (): void => {
  const state = getGameState();
  
  showBackButton();
  
  if (menuContent) {
    let itemsHtml = `
      <div style="color: #fff; font-family: monospace;">
        <h3 style="color: #ffd700; text-align: center; margin-bottom: 20px;">道具背包</h3>
        <div style="max-height: 250px; overflow-y: auto;">
    `;
    
    state.player.inventory.forEach(({ item, count }) => {
      if (count > 0) {
        itemsHtml += `
          <div style="
            background: #2a2a4a;
            border: 1px solid #4a4a6a;
            padding: 10px;
            margin: 5px 0;
            cursor: pointer;
          " onclick="window.useItemFromMenu('${item.id}')">
            <strong>${item.name}</strong> x${count}
            <br><small style="color: #aaa;">${item.description}</small>
          </div>
        `;
      }
    });
    
    if (state.player.inventory.filter(i => i.count > 0).length === 0) {
      itemsHtml += '<div style="text-align: center; color: #aaa;">背包是空的</div>';
    }
    
    itemsHtml += '</div></div>';
    menuContent.innerHTML = itemsHtml;
  }
};

(window as any).useItemFromMenu = (itemId: string): void => {
  const state = getGameState();
  const invItem = state.player.inventory.find(i => i.item.id === itemId && i.count > 0);
  
  if (!invItem) return;
  
  const item = invItem.item;
  
  if (item.type === 'equipment' && (item as any).equipmentId) {
    const equipId = (item as any).equipmentId;
    const equipment = EQUIPMENT_DATA[equipId];
    
    if (equipment) {
      if (equipment.type === 'weapon') {
        if (state.player.equipment.weapon) {
          const oldItem = ITEMS[state.player.equipment.weapon.id + 'Item'];
          if (oldItem) {
            const existing = state.player.inventory.find(i => i.item.id === oldItem.id);
            if (existing) {
              existing.count++;
            } else {
              state.player.inventory.push({ item: oldItem, count: 1 });
            }
          }
        }
        state.player.equipment.weapon = equipment;
      } else if (equipment.type === 'armor') {
        if (state.player.equipment.armor) {
          const oldItem = ITEMS[state.player.equipment.armor.id + 'Item'];
          if (oldItem) {
            const existing = state.player.inventory.find(i => i.item.id === oldItem.id);
            if (existing) {
              existing.count++;
            } else {
              state.player.inventory.push({ item: oldItem, count: 1 });
            }
          }
        }
        state.player.equipment.armor = equipment;
      }
      
      invItem.count--;
      alert(`装备了 ${equipment.name}！`);
    }
  } else if (item.type === 'consumable') {
    if (item.effect?.hp) {
      state.player.stats.hp = Math.min(state.player.stats.maxHp, state.player.stats.hp + item.effect.hp);
    }
    if (item.effect?.mp) {
      state.player.stats.mp = Math.min(state.player.stats.maxMp, state.player.stats.mp + item.effect.mp);
    }
    invItem.count--;
    alert(`使用了 ${item.name}！`);
  }
  
  setGameState(state);
  updateHUD();
  showItems();
};

const showEquipment = (): void => {
  const state = getGameState();
  const { equipment } = state.player;
  
  showBackButton();
  
  if (menuContent) {
    menuContent.innerHTML = `
      <div style="color: #fff; font-family: monospace; text-align: center;">
        <h3 style="color: #ffd700; margin-bottom: 20px;">装备栏</h3>
        <div style="display: grid; gap: 15px; max-width: 400px; margin: 0 auto;">
          <div style="background: #2a2a4a; border: 2px solid #4a4a6a; padding: 15px;">
            <strong>武器</strong><br>
            ${equipment.weapon ? `
              ${equipment.weapon.name}<br>
              <small>攻击力 +${equipment.weapon.attack}</small><br>
              <small>${equipment.weapon.description}</small>
            ` : '无'}
          </div>
          <div style="background: #2a2a4a; border: 2px solid #4a4a6a; padding: 15px;">
            <strong>防具</strong><br>
            ${equipment.armor ? `
              ${equipment.armor.name}<br>
              <small>防御力 +${equipment.armor.defense}</small><br>
              <small>${equipment.armor.description}</small>
            ` : '无'}
          </div>
        </div>
      </div>
    `;
  }
};

const showQuest = (): void => {
  const state = getGameState();
  
  showBackButton();
  
  if (menuContent) {
    menuContent.innerHTML = `
      <div style="color: #fff; font-family: monospace; text-align: center;">
        <h3 style="color: #ffd700; margin-bottom: 20px;">当前任务</h3>
        <div style="background: #2a2a4a; border: 2px solid #4a4a6a; padding: 20px; max-width: 400px; margin: 0 auto;">
          <p style="font-size: 16px;">${state.currentQuest}</p>
        </div>
        <div style="margin-top: 20px; text-align: left; max-width: 400px; margin: 20px auto 0;">
          <h4 style="color: #ffd700;">任务进度：</h4>
          <ul style="list-style: none; padding: 0;">
            <li style="padding: 5px 0; color: ${state.flags.hasTalkedToKing ? '#44ff44' : '#aaa'}">
              ${state.flags.hasTalkedToKing ? '✓' : '○'} 与村长对话
            </li>
            <li style="padding: 5px 0; color: ${state.flags.hasBeatenBoss ? '#44ff44' : '#aaa'}">
              ${state.flags.hasBeatenBoss ? '✓' : '○'} 击败洞窟巨兽
            </li>
            <li style="padding: 5px 0; color: ${state.flags.hasHeroProof ? '#44ff44' : '#aaa'}">
              ${state.flags.hasHeroProof ? '✓' : '○'} 获得勇者之证
            </li>
            <li style="padding: 5px 0; color: ${state.flags.hasBeatenDemonLord ? '#44ff44' : '#aaa'}">
              ${state.flags.hasBeatenDemonLord ? '✓' : '○'} 击败魔王
            </li>
          </ul>
        </div>
      </div>
    `;
  }
};

export const saveGame = (): void => {
  const state = getGameState();
  
  try {
    localStorage.setItem('dragonQuestSave', JSON.stringify(state));
    alert('游戏已保存！');
  } catch (e) {
    alert('保存失败！');
  }
};

export const loadGame = (): void => {
  try {
    const saveData = localStorage.getItem('dragonQuestSave');
    if (!saveData) {
      alert('没有找到存档！');
      return;
    }
    
    const savedState = JSON.parse(saveData);
    setGameState(savedState);
    updateHUD();
    alert('游戏已加载！');
    closeMenu();
  } catch (e) {
    alert('加载失败！');
  }
};
