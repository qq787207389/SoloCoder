
export class HUD {
  private container: HTMLDivElement;
  private healthBar: HTMLDivElement;
  private healthFill: HTMLDivElement;
  private expBar: HTMLDivElement;
  private expFill: HTMLDivElement;
  private levelText: HTMLDivElement;
  private killsText: HTMLDivElement;
  private timeText: HTMLDivElement;
  private bossHealthBar: HTMLDivElement;
  private bossHealthFill: HTMLDivElement;
  private bossContainer: HTMLDivElement;

  constructor() {
    this.container = document.createElement('div');
    this.container.style.position = 'absolute';
    this.container.style.top = '0';
    this.container.style.left = '0';
    this.container.style.width = '100%';
    this.container.style.height = '100%';
    this.container.style.pointerEvents = 'none';
    this.container.style.fontFamily = 'Press Start 2P, Arial, sans-serif';

    this.createHealthBar();
    this.createExpBar();
    this.createStats();
    this.createBossHealthBar();

    document.getElementById('game-container')?.appendChild(this.container);
  }

  private createHealthBar(): void {
    const healthContainer = document.createElement('div');
    healthContainer.style.position = 'absolute';
    healthContainer.style.bottom = '30px';
    healthContainer.style.left = '50%';
    healthContainer.style.transform = 'translateX(-50%)';
    healthContainer.style.display = 'flex';
    healthContainer.style.flexDirection = 'column';
    healthContainer.style.alignItems = 'center';
    healthContainer.style.gap = '5px';

    const healthLabel = document.createElement('div');
    healthLabel.style.color = '#ff4444';
    healthLabel.style.fontSize = '12px';
    healthLabel.textContent = 'HP';

    this.healthBar = document.createElement('div');
    this.healthBar.style.width = '300px';
    this.healthBar.style.height = '20px';
    this.healthBar.style.backgroundColor = '#333';
    this.healthBar.style.border = '2px solid #666';
    this.healthBar.style.borderRadius = '4px';
    this.healthBar.style.overflow = 'hidden';

    this.healthFill = document.createElement('div');
    this.healthFill.style.width = '100%';
    this.healthFill.style.height = '100%';
    this.healthFill.style.backgroundColor = '#ff4444';
    this.healthFill.style.transition = 'width 0.1s';

    this.healthBar.appendChild(this.healthFill);
    healthContainer.appendChild(healthLabel);
    healthContainer.appendChild(this.healthBar);
    this.container.appendChild(healthContainer);
  }

  private createExpBar(): void {
    const expContainer = document.createElement('div');
    expContainer.style.position = 'absolute';
    expContainer.style.top = '20px';
    expContainer.style.left = '20px';

    this.levelText = document.createElement('div');
    this.levelText.style.color = '#9d4edd';
    this.levelText.style.fontSize = '16px';
    this.levelText.style.marginBottom = '5px';

    this.expBar = document.createElement('div');
    this.expBar.style.width = '200px';
    this.expBar.style.height = '15px';
    this.expBar.style.backgroundColor = '#333';
    this.expBar.style.border = '2px solid #666';
    this.expBar.style.borderRadius = '4px';
    this.expBar.style.overflow = 'hidden';

    this.expFill = document.createElement('div');
    this.expFill.style.width = '0%';
    this.expFill.style.height = '100%';
    this.expFill.style.backgroundColor = '#9d4edd';
    this.expFill.style.transition = 'width 0.1s';

    this.expBar.appendChild(this.expFill);
    expContainer.appendChild(this.levelText);
    expContainer.appendChild(this.expBar);
    this.container.appendChild(expContainer);
  }

  private createStats(): void {
    const statsContainer = document.createElement('div');
    statsContainer.style.position = 'absolute';
    statsContainer.style.top = '20px';
    statsContainer.style.right = '20px';
    statsContainer.style.textAlign = 'right';
    statsContainer.style.color = '#fff';
    statsContainer.style.fontSize = '14px';

    this.timeText = document.createElement('div');
    this.timeText.style.marginBottom = '10px';

    this.killsText = document.createElement('div');

    statsContainer.appendChild(this.timeText);
    statsContainer.appendChild(this.killsText);
    this.container.appendChild(statsContainer);
  }

  private createBossHealthBar(): void {
    this.bossContainer = document.createElement('div');
    this.bossContainer.style.position = 'absolute';
    this.bossContainer.style.top = '80px';
    this.bossContainer.style.left = '50%';
    this.bossContainer.style.transform = 'translateX(-50%)';
    this.bossContainer.style.display = 'none';
    this.bossContainer.style.flexDirection = 'column';
    this.bossContainer.style.alignItems = 'center';
    this.bossContainer.style.gap = '5px';

    const bossLabel = document.createElement('div');
    bossLabel.style.color = '#ff0000';
    bossLabel.style.fontSize = '14px';
    bossLabel.textContent = 'BOSS';

    this.bossHealthBar = document.createElement('div');
    this.bossHealthBar.style.width = '400px';
    this.bossHealthBar.style.height = '25px';
    this.bossHealthBar.style.backgroundColor = '#333';
    this.bossHealthBar.style.border = '3px solid #ff0000';
    this.bossHealthBar.style.borderRadius = '4px';
    this.bossHealthBar.style.overflow = 'hidden';

    this.bossHealthFill = document.createElement('div');
    this.bossHealthFill.style.width = '100%';
    this.bossHealthFill.style.height = '100%';
    this.bossHealthFill.style.backgroundColor = '#ff0000';
    this.bossHealthFill.style.transition = 'width 0.1s';

    this.bossHealthBar.appendChild(this.bossHealthFill);
    this.bossContainer.appendChild(bossLabel);
    this.bossContainer.appendChild(this.bossHealthBar);
    this.container.appendChild(this.bossContainer);
  }

  update(health: number, maxHealth: number, exp: number, expToLevel: number, level: number, kills: number, time: number): void {
    this.healthFill.style.width = `${(health / maxHealth) * 100}%`;
    this.expFill.style.width = `${(exp / expToLevel) * 100}%`;
    this.levelText.textContent = `LEVEL ${level}`;
    this.killsText.textContent = `KILLS: ${kills}`;
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    this.timeText.textContent = `TIME: ${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  showBossHealth(percent: number): void {
    this.bossContainer.style.display = 'flex';
    this.bossHealthFill.style.width = `${percent * 100}%`;
  }

  hideBossHealth(): void {
    this.bossContainer.style.display = 'none';
  }

  destroy(): void {
    this.container.remove();
  }
}
