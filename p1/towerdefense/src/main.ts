import { Game, LevelConfig, MonsterType, TowerType } from './core/Game';

const level1Config: LevelConfig = {
  name: '草原防御',
  width: 16,
  height: 12,
  cellSize: 50,
  startPositions: [{ x: 0, y: 5 }],
  endPosition: { x: 15, y: 5 },
  obstacles: [
    { x: 3, y: 3, destructible: true },
    { x: 3, y: 4, destructible: true },
    { x: 3, y: 6, destructible: true },
    { x: 3, y: 7, destructible: true },
    { x: 7, y: 2, destructible: true },
    { x: 7, y: 3, destructible: true },
    { x: 7, y: 8, destructible: true },
    { x: 7, y: 9, destructible: true },
    { x: 11, y: 4, destructible: true },
    { x: 11, y: 5, destructible: true },
    { x: 11, y: 6, destructible: true },
  ],
  waves: [
    {
      monsters: [
        { type: MonsterType.NORMAL, count: 5, delay: 1 }
      ]
    },
    {
      monsters: [
        { type: MonsterType.NORMAL, count: 8, delay: 0.8 }
      ]
    },
    {
      monsters: [
        { type: MonsterType.NORMAL, count: 5, delay: 1 },
        { type: MonsterType.FLYING, count: 3, delay: 1.2 }
      ]
    },
    {
      monsters: [
        { type: MonsterType.SHIELD, count: 4, delay: 1.5 },
        { type: MonsterType.NORMAL, count: 6, delay: 0.8 }
      ]
    },
    {
      monsters: [
        { type: MonsterType.BURROW, count: 5, delay: 1 },
        { type: MonsterType.FLYING, count: 4, delay: 1.2 }
      ]
    },
    {
      monsters: [
        { type: MonsterType.BOSS, count: 1, delay: 0 }
      ]
    }
  ],
  initialGold: 500,
  initialCrystals: 0,
  initialLives: 20
};

const level2Config: LevelConfig = {
  name: '双路围攻',
  width: 16,
  height: 12,
  cellSize: 50,
  startPositions: [{ x: 0, y: 2 }, { x: 0, y: 9 }],
  endPosition: { x: 15, y: 5 },
  obstacles: [
    { x: 5, y: 5, destructible: true },
    { x: 5, y: 6, destructible: true },
    { x: 6, y: 5, destructible: true },
    { x: 6, y: 6, destructible: true },
    { x: 9, y: 3, destructible: true },
    { x: 9, y: 4, destructible: true },
    { x: 9, y: 7, destructible: true },
    { x: 9, y: 8, destructible: true },
    { x: 12, y: 5, destructible: true },
    { x: 12, y: 6, destructible: true },
  ],
  waves: [
    {
      monsters: [
        { type: MonsterType.NORMAL, count: 8, delay: 0.8 }
      ]
    },
    {
      monsters: [
        { type: MonsterType.NORMAL, count: 6, delay: 1 },
        { type: MonsterType.BURROW, count: 4, delay: 1.2 }
      ]
    },
    {
      monsters: [
        { type: MonsterType.FLYING, count: 8, delay: 0.8 }
      ]
    },
    {
      monsters: [
        { type: MonsterType.SHIELD, count: 6, delay: 1.2 },
        { type: MonsterType.NORMAL, count: 8, delay: 0.7 }
      ]
    },
    {
      monsters: [
        { type: MonsterType.BURROW, count: 6, delay: 1 },
        { type: MonsterType.FLYING, count: 6, delay: 1 },
        { type: MonsterType.SHIELD, count: 4, delay: 1.5 }
      ]
    },
    {
      monsters: [
        { type: MonsterType.BOSS, count: 1, delay: 0 },
        { type: MonsterType.NORMAL, count: 10, delay: 0.5 }
      ]
    }
  ],
  initialGold: 600,
  initialCrystals: 2,
  initialLives: 15
};

let game: Game;
let selectedTowerType: TowerType = TowerType.ARROW;

function initGame() {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  const config = window.location.hash === '#level2' ? level2Config : level1Config;
  
  canvas.width = config.width * config.cellSize;
  canvas.height = config.height * config.cellSize;
  
  game = new Game(canvas, config);
  
  canvas.addEventListener('click', handleCanvasClick);
  createUI();
  
  let lastTime = 0;
  function gameLoop(currentTime: number) {
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;
    
    game.update(deltaTime);
    game.render();
    
    requestAnimationFrame(gameLoop);
  }
  
  requestAnimationFrame(gameLoop);
}

function handleCanvasClick(e: MouseEvent) {
  const canvas = e.target as HTMLCanvasElement;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  if (y < 50) {
    if (x > canvas.width - 150 && !game.waveInProgress) {
      game.startNextWave();
    }
    return;
  }
  
  const gridX = Math.floor(x / game.grid.cellSize);
  const gridY = Math.floor(y / game.grid.cellSize);
  
  if (gridX >= 0 && gridX < game.grid.width && gridY >= 0 && gridY < game.grid.height) {
    if (game.gold >= game.getTowerCost(selectedTowerType)) {
      game.spawnTower(gridX, gridY, selectedTowerType);
    }
  }
}

function createUI() {
  const overlay = document.getElementById('ui-overlay')!;
  
  const towerPanel = document.createElement('div');
  towerPanel.style.cssText = `
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 10px;
    padding: 10px;
    background: rgba(0, 0, 0, 0.8);
    border-radius: 10px;
  `;
  
  const towers = [
    { type: TowerType.ARROW, name: '箭塔', color: '#228B22' },
    { type: TowerType.CANNON, name: '炮塔', color: '#2F4F4F' },
    { type: TowerType.ICE, name: '冰塔', color: '#00CED1' },
    { type: TowerType.ANTI_AIR, name: '防空塔', color: '#4B0082' }
  ];
  
  towers.forEach(tower => {
    const btn = document.createElement('button');
    btn.textContent = `${tower.name} (${game.getTowerCost(tower.type)})`;
    btn.style.cssText = `
      padding: 10px 20px;
      background: ${tower.color};
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: bold;
      transition: transform 0.2s;
    `;
    
    btn.onmouseover = () => btn.style.transform = 'scale(1.05)';
    btn.onmouseout = () => btn.style.transform = 'scale(1)';
    btn.onclick = () => {
      selectedTowerType = tower.type;
      document.querySelectorAll('#ui-overlay button').forEach(b => {
        (b as HTMLElement).style.boxShadow = 'none';
      });
      btn.style.boxShadow = '0 0 10px #fff';
    };
    
    towerPanel.appendChild(btn);
  });
  
  overlay.appendChild(towerPanel);
  
  const levelSelector = document.createElement('div');
  levelSelector.style.cssText = `
    position: absolute;
    top: 70px;
    right: 20px;
    display: flex;
    gap: 10px;
  `;
  
  const level1Btn = document.createElement('button');
  level1Btn.textContent = '关卡1';
  level1Btn.style.cssText = `
    padding: 8px 16px;
    background: #e74c3c;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  `;
  level1Btn.onclick = () => {
    window.location.hash = '';
    window.location.reload();
  };
  
  const level2Btn = document.createElement('button');
  level2Btn.textContent = '关卡2';
  level2Btn.style.cssText = `
    padding: 8px 16px;
    background: #3498db;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  `;
  level2Btn.onclick = () => {
    window.location.hash = 'level2';
    window.location.reload();
  };
  
  levelSelector.appendChild(level1Btn);
  levelSelector.appendChild(level2Btn);
  overlay.appendChild(levelSelector);
  
  const helpText = document.createElement('div');
  helpText.textContent = '点击空白格子放置防御塔 | 点击右上角开始波次';
  helpText.style.cssText = `
    position: absolute;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    color: #aaa;
    font-size: 14px;
  `;
  overlay.appendChild(helpText);
}

window.addEventListener('load', initGame);
