import { Renderer } from '../core/Renderer';
import { InputManager } from '../core/Input';
import { PlayerState, ElementType, ELEMENT_COLORS, ELEMENT_NAMES } from '../utils/types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, OVERLOAD_MAX, BOSS_NAMES } from '../utils/constants';

export class UIManager {
  private renderer: Renderer;
  private input: InputManager;
  private menuSelection: number = 0;
  private levelSelection: number = 0;
  private labSelection: number = 0;
  private defeatedBosses: Set<string> = new Set();

  constructor(renderer: Renderer, input: InputManager) {
    this.renderer = renderer;
    this.input = input;
  }

  public renderMainMenu(): string {
    this.renderer.clear('#000033');
    
    const centerX = CANVAS_WIDTH / 2;
    const centerY = CANVAS_HEIGHT / 2;

    this.renderer.drawText(
      '洛克战士',
      centerX - 140,
      centerY - 100,
      '#4488ff',
      48
    );

    this.renderer.drawText(
      'ROCK WARRIOR',
      centerX - 110,
      centerY - 60,
      '#88aaff',
      24
    );

    const menuItems = ['开始游戏', '关卡选择', '实验室', '退出'];
    menuItems.forEach((item, index) => {
      const y = centerY + index * 50;
      const color = index === this.menuSelection ? '#ffff00' : '#ffffff';
      const prefix = index === this.menuSelection ? '> ' : '  ';
      this.renderer.drawText(prefix + item, centerX - 80, y, color, 24);
    });

    this.renderer.drawText(
      '方向键/WASD 移动 | 空格/K 跳跃 | J 射击 | 数字键 切换武器 | O 过载',
      20,
      CANVAS_HEIGHT - 30,
      '#888888',
      14
    );

    if (this.handleMenuInput()) {
      return menuItems[this.menuSelection];
    }
    return '';
  }

  private handleMenuInput(): boolean {
    if (this.input.isKeyPressed('UP')) {
      this.menuSelection = Math.max(0, this.menuSelection - 1);
    }
    if (this.input.isKeyPressed('DOWN')) {
      this.menuSelection = Math.min(3, this.menuSelection + 1);
    }
    if (this.input.isKeyPressed('SELECT')) {
      this.input.update();
      return true;
    }
    this.input.update();
    return false;
  }

  public renderLevelSelect(): string {
    this.renderer.clear('#001133');
    
    const centerX = CANVAS_WIDTH / 2;
    const centerY = CANVAS_HEIGHT / 2;

    this.renderer.drawText('选择关卡', centerX - 80, 80, '#ffffff', 32);

    const levels = Object.keys(BOSS_NAMES);
    const cols = 4;
    const startX = centerX - 300;
    const startY = centerY - 150;

    levels.forEach((level, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = startX + col * 150;
      const y = startY + row * 120;
      
      const isSelected = index === this.levelSelection;
      const isDefeated = this.defeatedBosses.has(level);
      const color = isDefeated ? '#888888' : ELEMENT_COLORS[level as ElementType];
      
      if (isSelected) {
        this.renderer.drawRect(x - 10, y - 10, 100, 100, '#ffff00');
      }
      
      this.renderer.drawRect(x, y, 80, 80, color);
      this.renderer.drawText(
        BOSS_NAMES[level],
        x + 10,
        y + 95,
        isDefeated ? '#888888' : '#ffffff',
        14
      );
      
      if (isDefeated) {
        this.renderer.drawText('✓', x + 30, y + 45, '#00ff00', 24);
      }
    });

    this.renderer.drawText('按 ESC 返回', 20, CANVAS_HEIGHT - 30, '#888888', 14);

    return this.handleLevelSelectInput(levels);
  }

  private handleLevelSelectInput(levels: string[]): string {
    if (this.input.isKeyPressed('LEFT')) {
      this.levelSelection = Math.max(0, this.levelSelection - 1);
    }
    if (this.input.isKeyPressed('RIGHT')) {
      this.levelSelection = Math.min(levels.length - 1, this.levelSelection + 1);
    }
    if (this.input.isKeyPressed('UP')) {
      this.levelSelection = Math.max(0, this.levelSelection - 4);
    }
    if (this.input.isKeyPressed('DOWN')) {
      this.levelSelection = Math.min(levels.length - 1, this.levelSelection + 4);
    }
    if (this.input.isKeyPressed('SELECT')) {
      this.input.update();
      return levels[this.levelSelection];
    }
    if (this.input.isKeyPressed('BACK')) {
      this.input.update();
      return 'back';
    }
    this.input.update();
    return '';
  }

  public renderLab(playerState: PlayerState): string {
    this.renderer.clear('#111133');
    
    const centerX = CANVAS_WIDTH / 2;
    const centerY = CANVAS_HEIGHT / 2;

    this.renderer.drawText('实验室', centerX - 60, 80, '#00ffaa', 32);
    this.renderer.drawText(`齿轮: ${playerState.gears}`, 650, 80, '#ffff00', 20);

    const upgrades = [
      { name: '血量上限 +20', cost: 100, current: playerState.healthUpgrades, action: 'health' },
      { name: '能量上限 +20', cost: 100, current: playerState.energyUpgrades, action: 'energy' }
    ];

    upgrades.forEach((upgrade, index) => {
      const y = centerY - 50 + index * 80;
      const isSelected = index === this.labSelection;
      const canAfford = playerState.gears >= upgrade.cost;
      const color = isSelected ? '#ffff00' : '#ffffff';
      
      this.renderer.drawRect(centerX - 200, y - 30, 400, 60, isSelected ? '#333366' : '#222255');
      
      this.renderer.drawText(
        `${upgrade.name} (Lv.${upgrade.current})`,
        centerX - 180,
        y,
        color,
        20
      );
      this.renderer.drawText(
        `费用: ${upgrade.cost}`,
        centerX + 100,
        y,
        canAfford ? '#00ff00' : '#ff6666',
        18
      );
    });

    this.renderer.drawText('按 ESC 返回', 20, CANVAS_HEIGHT - 30, '#888888', 14);

    return this.handleLabInput(playerState, upgrades);
  }

  private handleLabInput(playerState: PlayerState, upgrades: any[]): string {
    if (this.input.isKeyPressed('UP')) {
      this.labSelection = Math.max(0, this.labSelection - 1);
    }
    if (this.input.isKeyPressed('DOWN')) {
      this.labSelection = Math.min(upgrades.length - 1, this.labSelection + 1);
    }
    if (this.input.isKeyPressed('SELECT')) {
      if (playerState.gears >= upgrades[this.labSelection].cost) {
        this.input.update();
        return upgrades[this.labSelection].action;
      }
    }
    if (this.input.isKeyPressed('BACK')) {
      this.input.update();
      return 'back';
    }
    this.input.update();
    return '';
  }

  public renderHUD(playerState: PlayerState, bossHealth: number = -1, bossMaxHealth: number = -1, bossElement: ElementType = ElementType.NEUTRAL): void {
    this.renderer.drawRect(20, 20, 200, 20, '#333333', false);
    this.renderer.drawRect(22, 22, (playerState.health / playerState.maxHealth) * 196, 16, '#ff4444', false);
    this.renderer.drawText(`HP: ${Math.floor(playerState.health)}/${playerState.maxHealth}`, 25, 36, '#ffffff', 12);

    this.renderer.drawRect(20, 50, 200, 20, '#333333', false);
    this.renderer.drawRect(22, 52, (playerState.energy / playerState.maxEnergy) * 196, 16, '#44aaff', false);
    this.renderer.drawText(`能量: ${Math.floor(playerState.energy)}/${playerState.maxEnergy}`, 25, 66, '#ffffff', 12);

    this.renderer.drawRect(20, 80, 200, 12, '#333333', false);
    this.renderer.drawRect(22, 82, (playerState.overload / OVERLOAD_MAX) * 196, 8, '#ffaa00', false);
    this.renderer.drawText('过载', 25, 90, '#ffffff', 10);

    const weaponColor = ELEMENT_COLORS[playerState.currentWeapon];
    this.renderer.drawRect(CANVAS_WIDTH - 100, 20, 80, 40, '#333333', false);
    this.renderer.drawRect(CANVAS_WIDTH - 98, 22, 76, 36, weaponColor, false);
    this.renderer.drawText(ELEMENT_NAMES[playerState.currentWeapon], CANVAS_WIDTH - 90, 45, '#ffffff', 12);

    this.renderer.drawText(`齿轮: ${playerState.gears}`, CANVAS_WIDTH - 150, 80, '#ffff00', 16);

    if (bossHealth >= 0) {
        const bossBarWidth = 400;
        const bossBarX = (CANVAS_WIDTH - bossBarWidth) / 2;
        
        this.renderer.drawRect(bossBarX, CANVAS_HEIGHT - 60, bossBarWidth, 30, '#333333', false);
        this.renderer.drawRect(bossBarX + 4, CANVAS_HEIGHT - 56, (bossHealth / bossMaxHealth) * (bossBarWidth - 8), 22, ELEMENT_COLORS[bossElement], false);
        this.renderer.drawText(
            BOSS_NAMES[bossElement] || 'BOSS',
            bossBarX + bossBarWidth / 2 - 40,
            CANVAS_HEIGHT - 38,
            '#ffffff',
            18
          );
        }
      }

  public renderPauseMenu(): string {
    this.renderer.drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, 'rgba(0, 0, 0, 0.7)', false);
    
    const centerX = CANVAS_WIDTH / 2;
    const centerY = CANVAS_HEIGHT / 2;

    this.renderer.drawText('暂停', centerX - 48, centerY - 80, '#ffffff', 40);

    const items = ['继续游戏', '重新开始', '返回主菜单'];
    items.forEach((item, index) => {
      const y = centerY + index * 50;
      const color = index === this.menuSelection ? '#ffff00' : '#ffffff';
      this.renderer.drawText(item, centerX - 60, y, color, 24);
    });

    return this.handlePauseInput(items);
  }

  private handlePauseInput(items: string[]): string {
    if (this.input.isKeyPressed('UP')) {
      this.menuSelection = Math.max(0, this.menuSelection - 1);
    }
    if (this.input.isKeyPressed('DOWN')) {
      this.menuSelection = Math.min(items.length - 1, this.menuSelection + 1);
    }
    if (this.input.isKeyPressed('SELECT') || this.input.isKeyPressed('PAUSE')) {
      this.input.update();
      return items[this.menuSelection];
    }
    this.input.update();
    return '';
  }

  public renderVictory(): boolean {
    this.renderer.clear('#003300');
    
    const centerX = CANVAS_WIDTH / 2;
    const centerY = CANVAS_HEIGHT / 2;

    this.renderer.drawText('胜利！', centerX - 80, centerY - 50, '#00ff00', 48);
    this.renderer.drawText('获得新武器！', centerX - 100, centerY + 20, '#ffff00', 28);
    this.renderer.drawText('按任意键继续', centerX - 100, centerY + 80, '#888888', 16);

    const result = this.input.isKeyPressed('SELECT') || this.input.isKeyPressed('BACK');
    this.input.update();
    return result;
  }

  public renderGameOver(): boolean {
    this.renderer.clear('#330000');
    
    const centerX = CANVAS_WIDTH / 2;
    const centerY = CANVAS_HEIGHT / 2;

    this.renderer.drawText('游戏结束', centerX - 100, centerY - 50, '#ff4444', 48);
    this.renderer.drawText('按任意键重新开始', centerX - 120, centerY + 50, '#888888', 16);

    const result = this.input.isKeyPressed('SELECT') || this.input.isKeyPressed('BACK');
    this.input.update();
    return result;
  }

  public setDefeatedBosses(bosses: Set<string>): void {
    this.defeatedBosses = bosses;
  }

  public resetSelections(): void {
    this.menuSelection = 0;
    this.levelSelection = 0;
    this.labSelection = 0;
  }
}
