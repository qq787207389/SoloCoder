
import * as PIXI from 'pixi.js';

export class Boss {
  public x: number;
  public y: number;
  public health: number;
  public maxHealth: number;
  public sprite: PIXI.Container;
  public active: boolean = false;
  public attackTimer: number = 0;
  public patternIndex: number = 0;

  private circle: PIXI.Graphics;
  private healthBarBg: PIXI.Graphics;
  private healthBarFill: PIXI.Graphics;
  private nameText: PIXI.Text;

  constructor() {
    this.x = 0;
    this.y = 0;
    this.health = 0;
    this.maxHealth = 0;
    
    this.sprite = new PIXI.Container();
    
    this.circle = new PIXI.Graphics();
    this.sprite.addChild(this.circle);
  }

  init(x: number, y: number, level: number): void {
    this.x = x;
    this.y = y;
    this.maxHealth = 500 + level * 100;
    this.health = this.maxHealth;
    this.active = true;
    this.attackTimer = 0;
    this.patternIndex = 0;

    this.circle.clear();
    this.circle.beginFill(0xff0000);
    this.circle.drawCircle(0, 0, 50);
    this.circle.endFill();
    this.circle.beginFill(0xffff00, 0.3);
    this.circle.drawCircle(0, 0, 60);
    this.circle.endFill();

    if (!this.nameText) {
      this.nameText = new PIXI.Text('BOSS', {
        fontFamily: 'Arial',
        fontSize: 24,
        fill: 0xff0000,
        fontWeight: 'bold'
      });
      this.nameText.anchor.set(0.5);
      this.nameText.position.set(0, -70);
      this.sprite.addChild(this.nameText);
    }

    this.sprite.position.set(x, y);
    this.sprite.visible = true;
  }

  update(delta: number, playerX: number, playerY: number): { shouldShoot: boolean, pattern: number } {
    if (!this.active) return { shouldShoot: false, pattern: 0 };

    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist &gt; 0 &amp;&amp; dist &gt; 150) {
      this.x += (dx / dist) * 60 * delta;
      this.y += (dy / dist) * 60 * delta;
    }

    this.sprite.position.set(this.x, this.y);
    this.circle.rotation += delta;

    this.attackTimer -= delta;
    let shouldShoot = false;
    if (this.attackTimer &lt;= 0) {
      shouldShoot = true;
      this.attackTimer = 1.5;
      this.patternIndex = (this.patternIndex + 1) % 3;
    }

    return { shouldShoot, pattern: this.patternIndex };
  }

  takeDamage(amount: number): boolean {
    this.health -= amount;
    return this.health &lt;= 0;
  }

  getHealthPercent(): number {
    return this.health / this.maxHealth;
  }

  deactivate(): void {
    this.active = false;
    this.sprite.visible = false;
  }

  destroy(): void {
    this.sprite.destroy();
  }
}
