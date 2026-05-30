import Phaser from 'phaser';
import { Player } from '../src/entities/Player';
import { Enemy } from '../src/entities/Enemy';
import { LAYER_PLATFORMS, PLATFORM_Y, GAME_WIDTH, GAME_HEIGHT } from '../src/config/gameConfig';

class TestScene extends Phaser.Scene {
  results: { name: string; pass: boolean; detail: string }[] = [];

  constructor() {
    super({ key: 'TestScene' });
  }

  preload(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0xff0000); g.fillRect(0, 0, 24, 32);
    g.generateTexture('player_idle', 24, 32);
    g.generateTexture('player_run1', 24, 32);
    g.generateTexture('player_run2', 24, 32);
    g.generateTexture('player_jump', 24, 32);
    g.generateTexture('player_headbutt', 24, 32);

    g.fillStyle(0x00ff00); g.fillRect(0, 0, 26, 30);
    g.generateTexture('turtle_walk1', 26, 30);
    g.generateTexture('turtle_walk2', 26, 30);
    g.generateTexture('turtle_flipped', 26, 20);

    g.fillStyle(0x0000ff); g.fillRect(0, 0, 28, 26);
    g.generateTexture('crab_walk1', 28, 26);
    g.generateTexture('crab_walk2', 28, 26);
    g.generateTexture('crab_flipped', 28, 18);

    g.fillStyle(0xff00ff); g.fillRect(0, 0, 22, 24);
    g.generateTexture('flybug_fly1', 22, 24);
    g.generateTexture('flybug_fly2', 22, 24);
    g.generateTexture('flybug_flipped', 22, 16);

    g.fillStyle(0xff8800); g.fillRect(0, 0, 14, 14);
    g.generateTexture('fireball', 14, 14);

    g.fillStyle(0x8b4513); g.fillRect(0, 0, 32, 16);
    g.generateTexture('platform', 32, 16);

    g.fillStyle(0x888888); g.fillRect(0, 0, 48, 64);
    g.generateTexture('pipe', 48, 64);
    g.generateTexture('pipe_top', 56, 20);
    g.generateTexture('valve', 16, 16);
    g.generateTexture('brick', 32, 32);
    g.destroy();
  }

  create(): void {
    this.testColliderCallbackFiresOnHeadbutt();
    this.testEnemyScreenEdgeReversal();
    this.testFlipEnemiesOnPlatform();

    const passed = this.results.filter(r => r.pass).length;
    const total = this.results.length;
    console.log(`\n========== RESULTS: ${passed}/${total} PASSED ==========`);
    for (const r of this.results) {
      const s = r.pass ? '✅' : '❌';
      console.log(`  ${s} ${r.name}: ${r.detail}`);
    }
    console.log('===========================================');

    (this.game as any)._testResults = { passed, total, results: this.results };
    this.game.destroy(true);
  }

  private assert(name: string, condition: boolean, detail: string): void {
    this.results.push({ name, pass: condition, detail });
  }

  private testColliderCallbackFiresOnHeadbutt(): void {
    const platforms = this.physics.add.staticGroup();
    const plat = platforms.create(400, 300, 'platform') as Phaser.Physics.Arcade.Sprite;
    plat.setOrigin(0.5, 0);
    plat.refreshBody();

    const player = new Player(this, 400, 400);
    let callbackFired = false;
    let touchingUpDetected = false;

    this.physics.add.collider(player, platforms, (_p, _plat) => {
      callbackFired = true;
      const pb = player.body as Phaser.Physics.Arcade.Body;
      touchingUpDetected = pb.touching.up;
    });

    const body = player.body as Phaser.Physics.Arcade.Body;
    body.setVelocityY(-600);
    body.setAccelerationY(0);

    for (let i = 0; i < 10; i++) {
      this.physics.world.step(16);
    }

    const pb = player.body as Phaser.Physics.Arcade.Body;

    this.assert(
      'Collider callback fires on head collision',
      callbackFired,
      `fired=${callbackFired}`
    );
    this.assert(
      'touching.up in callback',
      touchingUpDetected,
      `touchingUp=${touchingUpDetected}, blocked.up=${pb.blocked.up}`
    );
    this.assert(
      'blocked.up set after collision',
      pb.blocked.up,
      `blocked.up=${pb.blocked.up}, player.y=${player.y.toFixed(1)}`
    );

    player.destroy();
    platforms.clear(true, true);
  }

  private testEnemyScreenEdgeReversal(): void {
    const enemy = new Enemy(this, 5, 300, 'turtle', 5000, 40);
    enemy.direction = -1;
    if (enemy.x < 20) { enemy.direction = 1; }
    this.assert(
      'Enemy reverses at left screen edge',
      enemy.direction === 1,
      `direction=${enemy.direction}`
    );

    enemy.x = GAME_WIDTH - 5;
    enemy.direction = 1;
    if (enemy.x > GAME_WIDTH - 20) { enemy.direction = -1; }
    this.assert(
      'Enemy reverses at right screen edge',
      enemy.direction === -1,
      `direction=${enemy.direction}`
    );
    enemy.destroy();
  }

  private testFlipEnemiesOnPlatform(): void {
    const enemy = new Enemy(this, 400, PLATFORM_Y.layer2 - 30, 'turtle', 5000, 40);
    this.assert('Enemy starts walking', enemy.state === 'walk', `state=${enemy.state}`);

    enemy.flip();
    this.assert('Enemy flips to flipped state', enemy.state === 'flipped', `state=${enemy.state}`);
    this.assert('Flip timer set correctly', enemy.flipTimer === 5000, `timer=${enemy.flipTimer}`);

    enemy.destroy();
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.HEADLESS,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  physics: {
    default: 'arcade',
    arcade: { gravity: { x: 0, y: 700 } },
  },
  scene: [TestScene],
  banner: false,
  audio: { noAudio: true },
};

const game = new Phaser.Game(config);

setTimeout(() => {
  const results = (game as any)._testResults;
  if (results) {
    console.log(`\nFINAL: ${results.passed}/${results.total} tests passed`);
    process.exit(results.passed === results.total ? 0 : 1);
  } else {
    console.log('Test results not available');
    process.exit(1);
  }
}, 5000);
