
import * as PIXI from 'pixi.js';

console.log('Testing Pixi.js...');

async function test() {
  const app = new PIXI.Application();
  await app.init({
    width: 800,
    height: 600,
    backgroundColor: 0x1a1a2e
  });
  
  const container = document.getElementById('game-container');
  if (container) {
    container.appendChild(app.canvas);
  }
  
  const text = new PIXI.Text({
    text: 'Hello Pixi.js!',
    style: {
      fontSize: 36,
      fill: 0xffffff
    }
  });
  
  text.x = 200;
  text.y = 250;
  app.stage.addChild(text);
  
  console.log('Test success!');
}

test().catch(console.error);
