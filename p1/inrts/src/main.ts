import { GameEngine } from './engine/GameEngine';
import type { BuildingType, UnitType } from './types';
import unitsConfig from './config/units.json';
import buildingsConfig from './config/buildings.json';

let gameEngine: GameEngine;

function setupUI(engine: GameEngine) {
  const buildingPanel = document.getElementById('building-panel');
  const unitPanel = document.getElementById('unit-panel');

  if (buildingPanel) {
    const title = document.createElement('div');
    title.className = 'panel-title';
    title.textContent = '建筑';
    buildingPanel.appendChild(title);

    const buildings: BuildingType[] = ['barracks', 'tower', 'blacksmith'];
    for (const type of buildings) {
      const config = buildingsConfig[type as keyof typeof buildingsConfig];
      const btn = document.createElement('button');
      btn.className = 'action-btn';
      btn.innerHTML = `
        <span class="btn-icon">${getBuildingIcon(type)}</span>
        <span class="btn-name">${config.name}</span>
        <span class="btn-cost">${config.cost.gold}金 ${config.cost.wood}木</span>
      `;
      btn.onclick = () => {
        engine.setBuildingPlacement(type);
        document.querySelectorAll('.action-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      };
      buildingPanel.appendChild(btn);
    }
  }

  if (unitPanel) {
    const title = document.createElement('div');
    title.className = 'panel-title';
    title.textContent = '单位';
    unitPanel.appendChild(title);

    const units: UnitType[] = ['worker', 'infantry', 'archer', 'cavalry'];
    for (const type of units) {
      const config = unitsConfig[type as keyof typeof unitsConfig];
      const btn = document.createElement('button');
      btn.className = 'action-btn';
      btn.innerHTML = `
        <span class="btn-icon">${getUnitIcon(type)}</span>
        <span class="btn-name">${config.name}</span>
        <span class="btn-cost">${config.cost.gold}金 ${config.cost.wood}木</span>
      `;
      btn.onclick = () => {
        trainUnit(engine, type);
      };
      unitPanel.appendChild(btn);
    }
  }

  const restartBtn = document.getElementById('restart-btn');
  if (restartBtn) {
    restartBtn.onclick = () => {
      engine.restart();
    };
  }
}

function getBuildingIcon(type: string): string {
  const icons: Record<string, string> = {
    barracks: '⚔️',
    tower: '🗼',
    blacksmith: '🔨'
  };
  return icons[type] || '?';
}

function getUnitIcon(type: string): string {
  const icons: Record<string, string> = {
    worker: '👷',
    infantry: '🗡️',
    archer: '🏹',
    cavalry: '🐴'
  };
  return icons[type] || '?';
}

function trainUnit(engine: GameEngine, unitType: UnitType) {
  const success = engine.trainUnit(unitType);
  if (!success) {
    console.log(`无法训练 ${unitType}: 资源不足或没有对应建筑`);
  }
}

function init() {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  const miniMapCanvas = document.getElementById('minimap') as HTMLCanvasElement;

  const container = canvas.parentElement;
  if (container) {
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
  }

  miniMapCanvas.width = 200;
  miniMapCanvas.height = 200;

  gameEngine = new GameEngine(canvas, miniMapCanvas);
  setupUI(gameEngine);
  gameEngine.start();

  window.addEventListener('resize', () => {
    const container = canvas.parentElement;
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
