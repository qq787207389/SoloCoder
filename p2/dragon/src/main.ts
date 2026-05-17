import { Renderer } from './core/Renderer';
import { inputHandler } from './core/InputHandler';
import { getGameState } from './core/GameState';
import { movePlayer, interactWithNPC, advanceDialogue, closeDialogue } from './systems/MapSystem';
import { openMenu, closeMenu } from './systems/MenuSystem';
import { updateHUD } from './systems/BattleSystem';

let renderer: Renderer;

function gameLoop(): void {
  renderer.render();
  requestAnimationFrame(gameLoop);
}

function setupInputHandlers(): void {
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    const state = getGameState();
    
    if (state.gamePhase === 'map') {
      switch (e.key.toLowerCase()) {
        case 'arrowup':
        case 'w':
          movePlayer(0, -1);
          break;
        case 'arrowdown':
        case 's':
          movePlayer(0, 1);
          break;
        case 'arrowleft':
        case 'a':
          movePlayer(-1, 0);
          break;
        case 'arrowright':
        case 'd':
          movePlayer(1, 0);
          break;
        case ' ':
        case 'enter':
          interactWithNPC();
          break;
        case 'escape':
        case 'x':
        case 'm':
          openMenu();
          break;
        case 'q':
          const questText = `当前任务: ${state.currentQuest}`;
          alert(questText);
          break;
      }
    } else if (state.gamePhase === 'dialogue') {
      switch (e.key.toLowerCase()) {
        case ' ':
        case 'enter':
          advanceDialogue();
          break;
        case 'escape':
        case 'x':
          closeDialogue();
          break;
      }
    } else if (state.gamePhase === 'menu') {
      switch (e.key.toLowerCase()) {
        case 'escape':
        case 'x':
        case 'm':
          closeMenu();
          break;
      }
    }
  });
}

function init(): void {
  renderer = new Renderer('game-canvas');
  
  setupInputHandlers();
  
  updateHUD();
  
  gameLoop();
  
  console.log('勇者传说 - 游戏已启动！');
  console.log('操作说明:');
  console.log('- WASD/方向键: 移动');
  console.log('- 空格/回车: 交互/对话');
  console.log('- X/M: 打开菜单');
  console.log('- Q: 查看任务');
  console.log('- ESC: 关闭菜单/对话');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
