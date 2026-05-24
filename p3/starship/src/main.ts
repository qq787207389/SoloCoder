import type { GameState, GoodType, Planet } from './types';
import { createNewGame, getCurrentPlanet, startTravel, updateTravel, buyCargo, sellCargo, getTravelDays } from './game/gameState';
import { renderStarmap, renderCombat } from './render/starmap';
import { GOODS } from './data/goods';
import { getCargoCapacity, getUpgradeCost, createFrigate, getFrigatePrice, getFrigateTemplate } from './data/fleet';
import { createCombatState, processCombatTurn, launchCountermeasures, attemptRetreat, applyCombatResults } from './game/combat';
import { saveGame, loadGame, hasSaveGame } from './game/save';
import { getPriceTrend, getProfitMargin } from './game/economy';
import './style.css';

let gameState: GameState;
let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;

function closeModal(): void {
  document.getElementById('modal-overlay')!.classList.add('hidden');
}

function init() {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <div class="game-container">
      <header class="game-header">
        <h1>🚀 星际商人</h1>
        <div class="stats-bar">
          <span id="day-display">第 1 天</span>
          <span id="credits-display">💰 5000</span>
          <span id="cargo-display">📦 0/100</span>
        </div>
      </header>
      <div class="main-content">
        <div class="game-canvas-container">
          <canvas id="gameCanvas" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}"></canvas>
        </div>
        <aside class="sidebar">
          <div id="sidebar-content"></div>
        </aside>
      </div>
      <div id="modal-overlay" class="modal-overlay hidden"></div>
      <div class="message-log">
        <div id="messages"></div>
      </div>
    </div>
  `;

  canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
  ctx = canvas.getContext('2d')!;

  if (hasSaveGame()) {
    showLoadNewGameDialog();
  } else {
    startNewGame();
  }

  setupEventListeners();
  gameLoop(0);
}

function showLoadNewGameDialog() {
  const overlay = document.getElementById('modal-overlay')!;
  overlay.classList.remove('hidden');
  overlay.innerHTML = `
    <div class="modal">
      <h2>欢迎回来，船长！</h2>
      <p>检测到存档，是否继续？</p>
      <div class="modal-buttons">
        <button class="btn btn-primary" id="load-btn">继续游戏</button>
        <button class="btn btn-secondary" id="new-btn">新游戏</button>
      </div>
    </div>
  `;

  document.getElementById('load-btn')!.onclick = () => {
    const saved = loadGame();
    if (saved) {
      gameState = saved;
      updateUI();
    } else {
      startNewGame();
    }
    overlay.classList.add('hidden');
  };

  document.getElementById('new-btn')!.onclick = () => {
    startNewGame();
    overlay.classList.add('hidden');
  };
}

function startNewGame() {
  gameState = createNewGame();
  updateUI();
}

function setupEventListeners() {
  canvas.addEventListener('click', handleCanvasClick);
}

function handleCanvasClick(e: MouseEvent) {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  if (gameState.phase === 'starmap') {
    for (const planet of gameState.planets) {
      const dx = x - planet.x;
      const dy = y - planet.y;
      if (Math.sqrt(dx * dx + dy * dy) < planet.size + 10) {
        if (planet.id === gameState.fleet.currentPlanetId) {
          showTradingDialog(planet);
        } else {
          showTravelDialog(planet);
        }
        return;
      }
    }
  } else if (gameState.phase === 'combat' && gameState.combatState) {
    const combat = gameState.combatState;
    for (const unit of combat.enemyUnits) {
      const dx = x - unit.x;
      const dy = y - unit.y;
      if (Math.sqrt(dx * dx + dy * dy) < 30 && unit.hp > 0) {
        showCombatActionDialog();
        return;
      }
    }
  }
}

function showTradingDialog(planet: Planet) {
  const overlay = document.getElementById('modal-overlay')!;
  overlay.classList.remove('hidden');
  const capacity = getCargoCapacity(gameState.fleet.mothership.engine.level);
  const currentCargo = gameState.fleet.mothership.cargo.reduce((sum, item) => sum + item.quantity, 0);

  overlay.innerHTML = `
    <div class="modal modal-large">
      <h2>🏪 ${planet.name} - 交易市场</h2>
      <p>${planet.description}</p>
      ${planet.activeEvents.length > 0 ? `
        <div class="event-warning">
          ⚠️ 活跃事件: ${planet.activeEvents.map(e => `${e.name} (${e.remainingDays}天)`).join(', ')}
        </div>
      ` : ''}
      <div class="trade-stats">
        <span>信用点: 💰 ${gameState.fleet.credits}</span>
        <span>货舱: 📦 ${currentCargo}/${capacity}</span>
      </div>
      <div class="trade-grid">
        <div class="trade-column">
          <h3>购买</h3>
          ${planet.goods.map(good => {
            const g = GOODS[good.type];
            const trend = getPriceTrend(good);
            const trendIcon = trend === 'rising' ? '📈' : trend === 'falling' ? '📉' : '➡️';
            const maxAfford = Math.floor(gameState.fleet.credits / good.currentPrice);
            const maxSpace = capacity - currentCargo;
            const maxBuy = Math.min(maxAfford, maxSpace, good.supply);
            return `
              <div class="trade-item">
                <div class="trade-item-header">
                  <span>${g.icon} ${g.name}</span>
                  <span class="price">${good.currentPrice} ${trendIcon}</span>
                </div>
                <div class="trade-item-info">
                  <span>库存: ${good.supply}</span>
                </div>
                <div class="trade-controls">
                  <button class="btn btn-small" onclick="buyGood('${good.type}', 1)" ${maxBuy < 1 ? 'disabled' : ''}>+1</button>
                  <button class="btn btn-small" onclick="buyGood('${good.type}', 10)" ${maxBuy < 10 ? 'disabled' : ''}>+10</button>
                  <button class="btn btn-small" onclick="buyGood('${good.type}', ${maxBuy})" ${maxBuy < 1 ? 'disabled' : ''}>最大</button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
        <div class="trade-column">
          <h3>出售 (货舱)</h3>
          ${gameState.fleet.mothership.cargo.length === 0 ? '<p class="empty-text">货舱为空</p>' : ''}
          ${gameState.fleet.mothership.cargo.map(item => {
            const g = GOODS[item.type];
            const planetGood = planet.goods.find(pg => pg.type === item.type);
            const profit = planetGood ? getProfitMargin(planet, item.type, item.buyPrice) : 0;
            const profitColor = profit >= 0 ? 'profit' : 'loss';
            return `
              <div class="trade-item">
                <div class="trade-item-header">
                  <span>${g.icon} ${g.name} (${item.quantity})</span>
                  <span class="price ${profitColor}">${planetGood?.currentPrice || 0} (${profit >= 0 ? '+' : ''}${profit})</span>
                </div>
                <div class="trade-item-info">
                  <span>买入价: ${item.buyPrice}</span>
                </div>
                <div class="trade-controls">
                  <button class="btn btn-small" onclick="sellGood('${item.type}', 1)">-1</button>
                  <button class="btn btn-small" onclick="sellGood('${item.type}', 10)">-10</button>
                  <button class="btn btn-small" onclick="sellGood('${item.type}', ${item.quantity})">全部</button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
      <div class="modal-buttons">
        <button class="btn btn-secondary" onclick="closeModal()">关闭</button>
        <button class="btn btn-primary" onclick="showShipyardDialog()">🔧 造船厂</button>
      </div>
    </div>
  `;
}

(window as any).buyGood = (type: string, quantity: number) => {
  buyCargo(gameState, type as GoodType, quantity);
  showTradingDialog(getCurrentPlanet(gameState)!);
  updateUI();
  saveGame(gameState);
};

(window as any).sellGood = (type: string, quantity: number) => {
  sellCargo(gameState, type as GoodType, quantity);
  showTradingDialog(getCurrentPlanet(gameState)!);
  updateUI();
  saveGame(gameState);
};

(window as any).closeModal = closeModal;

function showTravelDialog(planet: Planet) {
  const days = getTravelDays(gameState, planet.id);
  const overlay = document.getElementById('modal-overlay')!;
  overlay.classList.remove('hidden');
  overlay.innerHTML = `
    <div class="modal">
      <h2>🧭 前往 ${planet.name}</h2>
      <p>预计航行时间: ${days} 天</p>
      <p>在航行中可能会遇到随机事件。</p>
      <div class="modal-buttons">
        <button class="btn btn-secondary" onclick="closeModal()">取消</button>
        <button class="btn btn-primary" onclick="confirmTravel('${planet.id}')">出发</button>
      </div>
    </div>
  `;
}

(window as any).confirmTravel = (planetId: string) => {
  closeModal();
  startTravel(gameState, planetId);
  updateUI();
};

function showShipyardDialog() {
  const overlay = document.getElementById('modal-overlay')!;
  const fleet = gameState.fleet;

  overlay.innerHTML = `
    <div class="modal modal-large">
      <h2>🔧 造船厂</h2>
      <div class="shipyard-grid">
        <div class="shipyard-section">
          <h3>母舰升级</h3>
          <div class="upgrade-item">
            <div class="upgrade-info">
              <span>🛡️ 护盾 (Lv.${fleet.mothership.shield.level}/${fleet.mothership.shield.maxLevel})</span>
              <span class="price">${getUpgradeCost(fleet.mothership.shield)} 💰</span>
            </div>
            <button class="btn btn-small" onclick="upgradeComponent('shield')" ${fleet.mothership.shield.level >= fleet.mothership.shield.maxLevel || gameState.fleet.credits < getUpgradeCost(fleet.mothership.shield) ? 'disabled' : ''}>升级</button>
          </div>
          <div class="upgrade-item">
            <div class="upgrade-info">
              <span>🚀 引擎 (Lv.${fleet.mothership.engine.level}/${fleet.mothership.engine.maxLevel})</span>
              <span class="price">${getUpgradeCost(fleet.mothership.engine)} 💰</span>
            </div>
            <button class="btn btn-small" onclick="upgradeComponent('engine')" ${fleet.mothership.engine.level >= fleet.mothership.engine.maxLevel || gameState.fleet.credits < getUpgradeCost(fleet.mothership.engine) ? 'disabled' : ''}>升级</button>
          </div>
          <div class="upgrade-item">
            <div class="upgrade-info">
              <span>⚔️ 武器 (Lv.${fleet.mothership.weapon.level}/${fleet.mothership.weapon.maxLevel})</span>
              <span class="price">${getUpgradeCost(fleet.mothership.weapon)} 💰</span>
            </div>
            <button class="btn btn-small" onclick="upgradeComponent('weapon')" ${fleet.mothership.weapon.level >= fleet.mothership.weapon.maxLevel || gameState.fleet.credits < getUpgradeCost(fleet.mothership.weapon) ? 'disabled' : ''}>升级</button>
          </div>
        </div>
        <div class="shipyard-section">
          <h3>购买护卫舰</h3>
          ${[0, 1, 2].map(i => {
            const template = getFrigateTemplate(i);
            return `
              <div class="upgrade-item">
                <div class="upgrade-info">
                  <span>${template.name}</span>
                  <span>HP:${template.hp} DMG:${template.damage}</span>
                  <span class="price">${getFrigatePrice(i)} 💰</span>
                </div>
                <button class="btn btn-small" onclick="buyFrigate(${i})" ${gameState.fleet.credits < getFrigatePrice(i) ? 'disabled' : ''}>购买</button>
              </div>
            `;
          }).join('')}
          <h3 style="margin-top: 20px;">当前舰队</h3>
          <p>护卫舰: ${fleet.frigates.length} 艘</p>
          ${fleet.frigates.map(f => `
            <div class="frigate-item">${f.name} - HP: ${f.hp}/${f.maxHp}</div>
          `).join('')}
        </div>
      </div>
      <div class="modal-buttons">
        <button class="btn btn-secondary" onclick="showTradingDialog(getCurrentPlanet(gameState)!)">返回市场</button>
        <button class="btn btn-primary" onclick="closeModal()">关闭</button>
      </div>
    </div>
  `;
}

(window as any).upgradeComponent = (component: string) => {
  const comp = (gameState.fleet.mothership as any)[component];
  const cost = getUpgradeCost(comp);
  if (gameState.fleet.credits >= cost && comp.level < comp.maxLevel) {
    gameState.fleet.credits -= cost;
    comp.level++;
    showShipyardDialog();
    updateUI();
    saveGame(gameState);
  }
};

(window as any).buyFrigate = (index: number) => {
  const price = getFrigatePrice(index);
  if (gameState.fleet.credits >= price) {
    gameState.fleet.credits -= price;
    gameState.fleet.frigates.push(createFrigate(index));
    showShipyardDialog();
    updateUI();
    saveGame(gameState);
  }
};

(window as any).getCurrentPlanet = getCurrentPlanet;

function showCombatActionDialog() {
  const overlay = document.getElementById('modal-overlay')!;
  overlay.classList.remove('hidden');
  overlay.innerHTML = `
    <div class="modal">
      <h2>⚔️ 战斗指令</h2>
      <div class="combat-actions">
        <button class="btn btn-primary" onclick="combatNextTurn()">下一回合</button>
        <button class="btn btn-secondary" onclick="combatCountermeasures()">干扰弹</button>
        <button class="btn btn-warning" onclick="combatRetreat()">撤退</button>
      </div>
    </div>
  `;
}

(window as any).combatNextTurn = () => {
  closeModal();
  if (gameState.combatState) {
    processCombatTurn(gameState.combatState);
    if (!gameState.combatState.isActive) {
      endCombat();
    }
  }
};

(window as any).combatCountermeasures = () => {
  closeModal();
  if (gameState.combatState) {
    launchCountermeasures(gameState.combatState);
  }
};

(window as any).combatRetreat = () => {
  closeModal();
  if (gameState.combatState) {
    attemptRetreat(gameState.combatState);
    if (!gameState.combatState.isActive) {
      endCombat();
    }
  }
};

function endCombat() {
  const result = applyCombatResults(gameState.fleet, gameState.combatState!);
  if (gameState.combatState?.result === 'victory') {
    gameState.messages.push(`战斗胜利！获得 ${result.reward} 信用点！`);
  } else if (gameState.combatState?.result === 'retreat') {
    gameState.messages.push('成功撤离战斗。');
  } else {
    gameState.messages.push('战斗失败，舰队受损严重...');
  }
  gameState.phase = 'starmap';
  gameState.combatState = undefined;
  updateUI();
  saveGame(gameState);
}

function triggerPirateCombat() {
  gameState.phase = 'combat';
  gameState.combatState = createCombatState(gameState.fleet, 2 + Math.floor(Math.random() * 2));
  gameState.messages.push('海盗发起攻击！');
}

function gameLoop(_timestamp: number) {
  if (gameState) {
    if (gameState.phase === 'traveling') {
      const arrived = updateTravel(gameState);
      if (arrived) {
        const planet = getCurrentPlanet(gameState);
        gameState.messages.push(`抵达 ${planet?.name}！`);
        if (Math.random() < 0.3) {
          triggerPirateCombat();
        }
        saveGame(gameState);
      }
    }

    if (gameState.phase === 'combat' || gameState.phase === 'starmap' || gameState.phase === 'traveling') {
      render();
    }

    updateUI();
  }

  requestAnimationFrame(gameLoop);
}

function render() {
  if (gameState.phase === 'combat') {
    renderCombat(ctx, gameState, CANVAS_WIDTH, CANVAS_HEIGHT);
  } else {
    renderStarmap(ctx, gameState, CANVAS_WIDTH, CANVAS_HEIGHT);
  }
}

function updateUI() {
  if (!gameState) return;

  document.getElementById('day-display')!.textContent = `第 ${gameState.day} 天`;
  document.getElementById('credits-display')!.textContent = `💰 ${gameState.fleet.credits}`;

  const capacity = getCargoCapacity(gameState.fleet.mothership.engine.level);
  const currentCargo = gameState.fleet.mothership.cargo.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById('cargo-display')!.textContent = `📦 ${currentCargo}/${capacity}`;

  const sidebar = document.getElementById('sidebar-content')!;
  const currentPlanet = getCurrentPlanet(gameState);

  if (gameState.phase === 'combat' && gameState.combatState) {
    const combat = gameState.combatState;
    sidebar.innerHTML = `
      <div class="sidebar-section">
        <h3>⚔️ 战斗中</h3>
        <p>回合: ${combat.turn}</p>
        <p>点击敌舰选择目标</p>
        <button class="btn btn-primary full-width" onclick="showCombatActionDialog()">战斗指令</button>
      </div>
      <div class="sidebar-section">
        <h4>战斗日志</h4>
        <div class="combat-log">
          ${combat.log.slice(-8).map(log => `<div class="log-item">${log}</div>`).join('')}
        </div>
      </div>
    `;
  } else if (gameState.phase === 'traveling') {
    const targetPlanet = gameState.planets.find(p => p.id === gameState.fleet.targetPlanetId);
    sidebar.innerHTML = `
      <div class="sidebar-section">
        <h3>🚀 航行中</h3>
        <p>目的地: ${targetPlanet?.name}</p>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${gameState.fleet.travelProgress * 100}%"></div>
        </div>
        <p>${Math.round(gameState.fleet.travelProgress * 100)}%</p>
      </div>
    `;
  } else if (currentPlanet) {
    sidebar.innerHTML = `
      <div class="sidebar-section">
        <h3>📍 ${currentPlanet.name}</h3>
        <p class="planet-desc">${currentPlanet.description}</p>
        ${currentPlanet.activeEvents.length > 0 ? `
          <div class="event-warning">
            ⚠️ ${currentPlanet.activeEvents.map(e => e.name).join(', ')}
          </div>
        ` : ''}
        <button class="btn btn-primary full-width" onclick="showTradingDialog(getCurrentPlanet(gameState)!)">进入市场</button>
      </div>
      <div class="sidebar-section">
        <h4>市场价格</h4>
        ${currentPlanet.goods.map(good => {
          const g = GOODS[good.type];
          const trend = getPriceTrend(good);
          const trendIcon = trend === 'rising' ? '📈' : trend === 'falling' ? '📉' : '➡️';
          return `<div class="price-item">${g.icon} ${g.name}: <strong>${good.currentPrice}</strong> ${trendIcon}</div>`;
        }).join('')}
      </div>
      <div class="sidebar-section">
        <h4>舰队状态</h4>
        <div class="fleet-status">
          <div>母舰 HP: ${gameState.fleet.mothership.hp}/${gameState.fleet.mothership.maxHp}</div>
          <div>护卫舰: ${gameState.fleet.frigates.length} 艘</div>
        </div>
      </div>
      <div class="sidebar-section">
        <h4>快捷操作</h4>
        <button class="btn full-width" onclick="quickSave()">💾 存档</button>
      </div>
    `;
  }

  const messagesEl = document.getElementById('messages')!;
  messagesEl.innerHTML = gameState.messages.slice(-5).map(m => `<div class="message">${m}</div>`).join('');
}

(window as any).showCombatActionDialog = showCombatActionDialog;
(window as any).showTradingDialog = showTradingDialog;
(window as any).showShipyardDialog = showShipyardDialog;

(window as any).quickSave = () => {
  saveGame(gameState);
  gameState.messages.push('游戏已保存！');
};

init();
