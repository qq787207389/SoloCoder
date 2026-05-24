import { Game } from './game';

const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const minimap = document.getElementById('minimap') as HTMLCanvasElement;

const game = new Game(canvas, minimap);
game.start();

(window as any).saveGame = () => {
  const save = game.saveGame();
  localStorage.setItem('survivalWildSave', save);
  console.log('游戏已保存');
};

(window as any).loadGame = () => {
  const save = localStorage.getItem('survivalWildSave');
  if (save) {
    Game.loadGame(canvas, minimap, save);
    console.log('游戏已加载');
  } else {
    console.log('没有找到存档');
  }
};

console.log('荒野生存游戏已启动!');
console.log('按 F12 打开控制台, 输入 saveGame() 保存游戏, loadGame() 加载游戏');
