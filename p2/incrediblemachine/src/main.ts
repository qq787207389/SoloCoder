import { Game } from './Game';
import { GameState, PartType } from './types';

function init() {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  if (!canvas) {
    console.error('Canvas element not found');
    return;
  }

  const game = new Game(canvas);
  (window as any).game = game;
  
  setupCanvasDragDrop(game, canvas);
  const statusText = document.getElementById('status-text');
  const btnPlay = document.getElementById('btn-play') as HTMLButtonElement;
  const btnReset = document.getElementById('btn-reset') as HTMLButtonElement;
  const btnUndo = document.getElementById('btn-undo') as HTMLButtonElement;
  const btnRedo = document.getElementById('btn-redo') as HTMLButtonElement;
  const btnSave = document.getElementById('btn-save') as HTMLButtonElement;
  const btnLoad = document.getElementById('btn-load') as HTMLButtonElement;
  const levelSelect = document.getElementById('level-select') as HTMLSelectElement;
  const toolbox = document.getElementById('toolbox') as HTMLDivElement;

  populateLevelSelect(game, levelSelect);

  game.loadLevel('level_1');
  populateToolbox(game, toolbox);
  updateStatus(statusText, '编辑模式 - 从工具箱拖拽零件');

  game.setStateChangeCallback((state: GameState) => {
    handleStateChange(game, state, btnPlay, btnReset, statusText!);
  });

  btnPlay.addEventListener('click', () => {
    if (game.getGameState() === 'editing') {
      game.start();
    } else if (game.getGameState() === 'running') {
      game.stop();
    }
  });

  btnReset.addEventListener('click', () => {
    game.reset();
    const currentLevel = game.getCurrentLevel();
    if (currentLevel) {
      game.loadLevel(currentLevel.id);
    }
    updateStatus(statusText, '已重置 - 从工具箱拖拽零件');
  });

  btnUndo.addEventListener('click', () => {
    game.undo();
  });

  btnRedo.addEventListener('click', () => {
    game.redo();
  });

  btnSave.addEventListener('click', () => {
    const levelData = game.exportLevel();
    if (levelData) {
      const json = JSON.stringify(levelData, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `level_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      updateStatus(statusText, '关卡已保存');
    }
  });

  btnLoad.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target?.result as string);
            game.importLevel(data);
            updateStatus(statusText, '关卡已加载');
          } catch {
            updateStatus(statusText, '加载失败：无效的关卡文件');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  });

  levelSelect.addEventListener('change', (e) => {
    const levelId = (e.target as HTMLSelectElement).value;
    if (levelId) {
      game.loadLevel(levelId);
      updateToolboxForLevel(game, toolbox);
      updateStatus(statusText, `已加载：${game.getCurrentLevel()?.name}`);
    }
  });

  window.addEventListener('beforeunload', () => {
    game.destroy();
  });
}

function populateLevelSelect(game: Game, select: HTMLSelectElement) {
  game.getLevels().forEach(level => {
    const option = document.createElement('option');
    option.value = level.id;
    option.textContent = level.name;
    select.appendChild(option);
  });
}

function populateToolbox(game: Game, toolbox: HTMLDivElement) {
  toolbox.innerHTML = '';
  const currentLevel = game.getCurrentLevel();
  const availableTools = currentLevel?.availableTools || game.getToolDefinitions().map(t => t.type);

  game.getToolDefinitions().forEach(tool => {
    if (!availableTools.includes(tool.type as PartType)) return;

    const item = document.createElement('div');
    item.className = 'tool-item';
    item.draggable = true;
    item.innerHTML = `
      <span class="tool-icon">${tool.icon}</span>
      <span class="tool-name">${tool.name}</span>
    `;

    item.addEventListener('dragstart', (e) => {
      e.dataTransfer?.setData('text/plain', tool.type);
    });

    item.addEventListener('mousedown', () => {
    });

    toolbox.appendChild(item);
  });
}

function updateToolboxForLevel(game: Game, toolbox: HTMLDivElement) {
  populateToolbox(game, toolbox);
}

function handleStateChange(game: Game, state: GameState, btnPlay: HTMLButtonElement, btnReset: HTMLButtonElement, statusText: HTMLElement) {
  switch (state) {
    case 'editing':
      btnPlay.textContent = '▶ 运行';
      btnPlay.disabled = false;
      btnReset.disabled = false;
      updateStatus(statusText, '编辑模式 - 从工具箱拖拽零件');
      break;
    case 'running':
      btnPlay.textContent = '⏹ 停止';
      btnPlay.disabled = false;
      btnReset.disabled = true;
      updateStatus(statusText, '运行中...');
      break;
    case 'won':
      btnPlay.textContent = '▶ 运行';
      btnPlay.disabled = false;
      btnReset.disabled = false;
      updateStatus(statusText, '🎉 恭喜通关！');
      setTimeout(() => {
        if (game.getGameState() === 'won') {
          game.stop();
        }
      }, 1000);
      break;
    case 'lost':
      btnPlay.textContent = '▶ 运行';
      btnPlay.disabled = false;
      btnReset.disabled = false;
      updateStatus(statusText, '💔 失败了，再试一次！');
      break;
  }
}

function updateStatus(element: HTMLElement | null, text: string) {
  if (element) {
    element.textContent = text;
  }
}

function setupCanvasDragDrop(game: Game, canvas: HTMLCanvasElement) {
  canvas.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer!.dropEffect = 'copy';
  });

  canvas.addEventListener('drop', (e) => {
    e.preventDefault();
    const partType = e.dataTransfer?.getData('text/plain');
    if (partType) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      game.startDraggingNewPart(partType as PartType, x, y);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  init();
});
