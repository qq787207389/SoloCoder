import type { GameMode, Difficulty } from '../types/game';
import { CANVAS_WIDTH, CANVAS_HEIGHT, COLORS } from '../config/constants';
import { drawRoundedRect, drawGlowText } from '../utils/render';

interface MenuButton {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  value: string;
  selected: boolean;
  hovered: boolean;
}

export class Menu {
  private modeButtons: MenuButton[] = [];
  private difficultyButtons: MenuButton[] = [];
  private startButton: MenuButton | null = null;
  private rulesButton: MenuButton | null = null;
  private showRules: boolean = false;
  private selectedMode: GameMode = 'eight-ball';
  private selectedDifficulty: Difficulty = 'medium';
  private animationFrame: number = 0;

  constructor() {
    this.initButtons();
  }

  private initButtons(): void {
    const centerX = CANVAS_WIDTH / 2;
    const startY = 180;
    const spacing = 90;

    const modes: { label: string; value: GameMode }[] = [
      { label: '8球制', value: 'eight-ball' },
      { label: '9球制', value: 'nine-ball' },
      { label: '异形桌', value: 'irregular' },
    ];

    this.modeButtons = modes.map((mode, i) => ({
      x: centerX - 300 + i * 210,
      y: startY,
      width: 190,
      height: 70,
      label: mode.label,
      value: mode.value,
      selected: mode.value === this.selectedMode,
      hovered: false,
    }));

    const difficulties: { label: string; value: Difficulty }[] = [
      { label: '新手', value: 'easy' },
      { label: '中等', value: 'medium' },
      { label: '高级', value: 'hard' },
    ];

    this.difficultyButtons = difficulties.map((diff, i) => ({
      x: centerX - 220 + i * 160,
      y: startY + spacing,
      width: 140,
      height: 55,
      label: diff.label,
      value: diff.value,
      selected: diff.value === this.selectedDifficulty,
      hovered: false,
    }));

    this.startButton = {
      x: centerX - 100,
      y: startY + spacing * 2,
      width: 200,
      height: 60,
      label: '开始游戏',
      value: 'start',
      selected: false,
      hovered: false,
    };

    this.rulesButton = {
      x: centerX - 80,
      y: startY + spacing * 2 + 80,
      width: 160,
      height: 45,
      label: '游戏规则',
      value: 'rules',
      selected: false,
      hovered: false,
    };
  }

  handleClick(mouseX: number, mouseY: number): 'start' | 'rules' | null {
    if (this.showRules) {
      this.showRules = false;
      return null;
    }

    for (const btn of this.modeButtons) {
      if (this.isPointInButton(mouseX, mouseY, btn)) {
        this.selectedMode = btn.value as GameMode;
        this.updateButtonSelection();
        return null;
      }
    }

    for (const btn of this.difficultyButtons) {
      if (this.isPointInButton(mouseX, mouseY, btn)) {
        this.selectedDifficulty = btn.value as Difficulty;
        this.updateButtonSelection();
        return null;
      }
    }

    if (this.startButton && this.isPointInButton(mouseX, mouseY, this.startButton)) {
      return 'start';
    }

    if (this.rulesButton && this.isPointInButton(mouseX, mouseY, this.rulesButton)) {
      this.showRules = true;
      return 'rules';
    }

    return null;
  }

  handleMouseMove(mouseX: number, mouseY: number): void {
    for (const btn of this.modeButtons) {
      btn.hovered = this.isPointInButton(mouseX, mouseY, btn);
    }
    for (const btn of this.difficultyButtons) {
      btn.hovered = this.isPointInButton(mouseX, mouseY, btn);
    }
    if (this.startButton) {
      this.startButton.hovered = this.isPointInButton(mouseX, mouseY, this.startButton);
    }
    if (this.rulesButton) {
      this.rulesButton.hovered = this.isPointInButton(mouseX, mouseY, this.rulesButton);
    }
  }

  private isPointInButton(x: number, y: number, btn: MenuButton): boolean {
    return x >= btn.x && x <= btn.x + btn.width && y >= btn.y && y <= btn.y + btn.height;
  }

  private updateButtonSelection(): void {
    for (const btn of this.modeButtons) {
      btn.selected = btn.value === this.selectedMode;
    }
    for (const btn of this.difficultyButtons) {
      btn.selected = btn.value === this.selectedDifficulty;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    this.animationFrame++;

    const bgGrad = ctx.createRadialGradient(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
      0,
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
      CANVAS_WIDTH
    );
    bgGrad.addColorStop(0, '#1a1a2e');
    bgGrad.addColorStop(1, '#0f0f1a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (this.showRules) {
      this.renderRules(ctx);
      return;
    }

    const titleY = 80 + Math.sin(this.animationFrame * 0.02) * 3;
    drawGlowText(
      ctx,
      '花式撞球',
      CANVAS_WIDTH / 2,
      titleY,
      COLORS.ACCENT,
      'rgba(255, 215, 0, 0.5)',
      48,
      'Press Start 2P'
    );

    ctx.font = '16px "Noto Sans SC"';
    ctx.fillStyle = COLORS.TEXT_DARK;
    ctx.textAlign = 'center';
    ctx.fillText('复古街机风格 · 纯物理驱动', CANVAS_WIDTH / 2, 130);

    this.renderSectionTitle(ctx, '游戏模式', 160);
    for (const btn of this.modeButtons) {
      this.renderButton(ctx, btn);
    }

    this.renderSectionTitle(ctx, 'AI难度', 250);
    for (const btn of this.difficultyButtons) {
      this.renderButton(ctx, btn);
    }

    if (this.startButton) {
      this.renderActionButton(ctx, this.startButton, true);
    }
    if (this.rulesButton) {
      this.renderActionButton(ctx, this.rulesButton, false);
    }

    ctx.font = '14px "Noto Sans SC"';
    ctx.fillStyle = COLORS.TEXT_DARK;
    ctx.textAlign = 'center';
    ctx.fillText('← → 瞄准  |  空格 蓄力/击球  |  ESC 暂停', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 40);
  }

  private renderSectionTitle(ctx: CanvasRenderingContext2D, text: string, y: number): void {
    ctx.font = 'bold 18px "Noto Sans SC"';
    ctx.fillStyle = COLORS.TEXT;
    ctx.textAlign = 'left';
    ctx.fillText(text, CANVAS_WIDTH / 2 - 300, y);
  }

  private renderButton(ctx: CanvasRenderingContext2D, btn: MenuButton): void {
    const scale = btn.hovered ? 1.05 : 1;
    const offsetX = btn.width * (1 - scale) / 2;
    const offsetY = btn.height * (1 - scale) / 2;

    ctx.save();
    ctx.translate(btn.x + offsetX, btn.y + offsetY);
    ctx.scale(scale, scale);

    drawRoundedRect(ctx, 0, 0, btn.width, btn.height, 8);
    
    if (btn.selected) {
      const grad = ctx.createLinearGradient(0, 0, 0, btn.height);
      grad.addColorStop(0, '#2d5a27');
      grad.addColorStop(1, '#1e3d1a');
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = COLORS.ACCENT;
      ctx.lineWidth = 3;
      ctx.stroke();
      
      ctx.shadowColor = 'rgba(255, 215, 0, 0.3)';
      ctx.shadowBlur = 15;
      ctx.stroke();
    } else if (btn.hovered) {
      const grad = ctx.createLinearGradient(0, 0, 0, btn.height);
      grad.addColorStop(0, '#3a3a5a');
      grad.addColorStop(1, '#2a2a4a');
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = COLORS.TEXT;
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      const grad = ctx.createLinearGradient(0, 0, 0, btn.height);
      grad.addColorStop(0, '#2a2a4a');
      grad.addColorStop(1, '#1a1a3a');
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = '#4a4a6a';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.shadowBlur = 0;
    ctx.font = `bold ${btn.height > 50 ? 20 : 16}px "Noto Sans SC"`;
    ctx.fillStyle = btn.selected ? COLORS.ACCENT : COLORS.TEXT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(btn.label, btn.width / 2, btn.height / 2);

    ctx.restore();
  }

  private renderActionButton(
    ctx: CanvasRenderingContext2D,
    btn: MenuButton,
    isPrimary: boolean
  ): void {
    const scale = btn.hovered ? 1.05 : 1;
    const offsetX = btn.width * (1 - scale) / 2;
    const offsetY = btn.height * (1 - scale) / 2;

    ctx.save();
    ctx.translate(btn.x + offsetX, btn.y + offsetY);
    ctx.scale(scale, scale);

    drawRoundedRect(ctx, 0, 0, btn.width, btn.height, 10);

    if (isPrimary) {
      const grad = ctx.createLinearGradient(0, 0, 0, btn.height);
      grad.addColorStop(0, '#FFD700');
      grad.addColorStop(0.5, '#FFA500');
      grad.addColorStop(1, '#FF8C00');
      ctx.fillStyle = grad;
      ctx.fill();
      
      ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
      ctx.shadowBlur = btn.hovered ? 25 : 15;
      ctx.strokeStyle = '#FFE066';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = 'bold 22px "Noto Sans SC"';
      ctx.fillStyle = '#1a1a1a';
    } else {
      const grad = ctx.createLinearGradient(0, 0, 0, btn.height);
      grad.addColorStop(0, '#4a4a6a');
      grad.addColorStop(1, '#3a3a5a');
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = '#6a6a8a';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.font = '16px "Noto Sans SC"';
      ctx.fillStyle = COLORS.TEXT;
    }

    ctx.shadowBlur = 0;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(btn.label, btn.width / 2, btn.height / 2);

    ctx.restore();
  }

  private renderRules(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    drawRoundedRect(ctx, 100, 60, CANVAS_WIDTH - 200, CANVAS_HEIGHT - 120, 15);
    const bgGrad = ctx.createLinearGradient(0, 60, 0, CANVAS_HEIGHT - 60);
    bgGrad.addColorStop(0, '#2a2a4a');
    bgGrad.addColorStop(1, '#1a1a3a');
    ctx.fillStyle = bgGrad;
    ctx.fill();
    ctx.strokeStyle = COLORS.ACCENT;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = 'bold 28px "Noto Sans SC"';
    ctx.fillStyle = COLORS.ACCENT;
    ctx.textAlign = 'center';
    ctx.fillText('游戏规则', CANVAS_WIDTH / 2, 110);

    const rules = [
      {
        title: '8球制',
        items: [
          '· 开球后根据首先入袋的球确定花色（单色/花色）',
          '· 打完自己花色的7个球后，击打黑八获胜',
          '· 必须先击打己方花色的球，否则犯规',
          '· 黑八入袋时必须已清完己方球，否则直接输',
          '· 母球落袋或未击中任何球均为犯规',
        ],
      },
      {
        title: '9球制',
        items: [
          '· 只使用1-9号球，按号码顺序击打',
          '· 母球必须先碰到台面上最小号码的球',
          '· 9号球入袋即获胜，无需清台',
          '· 可通过组合球直接将9号球撞入袋中获胜',
        ],
      },
      {
        title: '异形桌',
        items: [
          '· L形桌：台面呈L形，反弹路径更复杂',
          '· 环形桌：圆环形台面，中心有柱子',
          '· 障碍桌：台面上有固定障碍物',
          '· 规则同8球制，但需要重新计算反弹',
        ],
      },
      {
        title: '操作说明',
        items: [
          '· ← → 方向键：旋转球杆瞄准',
          '· 空格：按住蓄力，松开击球',
          '· 蓄力时间越长，击球力度越大',
          '· 辅助虚线显示击球方向和力度',
        ],
      },
    ];

    let y = 160;
    for (const rule of rules) {
      ctx.font = 'bold 18px "Noto Sans SC"';
      ctx.fillStyle = COLORS.ACCENT;
      ctx.textAlign = 'left';
      ctx.fillText(rule.title, 140, y);
      y += 30;

      ctx.font = '14px "Noto Sans SC"';
      ctx.fillStyle = COLORS.TEXT;
      for (const item of rule.items) {
        ctx.fillText(item, 140, y);
        y += 24;
      }
      y += 10;
    }

    ctx.font = '16px "Noto Sans SC"';
    ctx.fillStyle = COLORS.TEXT_DARK;
    ctx.textAlign = 'center';
    ctx.fillText('点击任意位置返回', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 90);
  }

  getSelectedMode(): GameMode {
    return this.selectedMode;
  }

  getSelectedDifficulty(): Difficulty {
    return this.selectedDifficulty;
  }

  reset(): void {
    this.showRules = false;
  }
}
