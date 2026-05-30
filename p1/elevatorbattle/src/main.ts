import { Game } from './Game';

const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;

if (canvas) {
  const game = new Game(canvas);
  game.start();

  console.log('电梯大战 - Elevator Battle');
  console.log('============================');
  console.log('操作说明:');
  console.log('  WASD / 方向键 - 移动');
  console.log('  J / 空格 - 射击');
  console.log('  K - 踢人');
  console.log('  F - 交互/收集文件');
  console.log('  Q - 电梯上行');
  console.log('  E - 电梯下行');
  console.log('  ESC / P - 暂停');
  console.log('  R - 重新开始');
  console.log('============================');
  console.log('游戏目标:');
  console.log('  1. 收集所有红色房间内的机密文件');
  console.log('  2. 所有文件收集完毕后，车库出口会开启');
  console.log('  3. 到达出口即可过关');
  console.log('============================');
  console.log('提示:');
  console.log('  - 用电梯轿厢可以压扁敌人');
  console.log('  - 趁敌人进电梯时踢飞他们');
  console.log('  - 消音手枪不会惊动太多敌人');
  console.log('  - 冲锋枪火力猛但会引起注意');
  console.log('  - 避开监控摄像头的视线');
} else {
  console.error('无法找到游戏画布元素');
}
