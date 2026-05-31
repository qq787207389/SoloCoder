import type { GameState, GameMode } from '../types/game';
import { CANVAS_WIDTH, CANVAS_HEIGHT, COLORS } from '../config/constants';
import { drawRoundedRect, getGradientColor } from '../utils/render';

export class HUD {
  private animationFrame: number = 0;

  render(
    ctx: CanvasRenderingContext2D,
    state: GameState,
    ballsRemaining: { player1: number; player2: number },
    isAITurn: boolean,
    aiThinking: boolean,
    aiProgress: number
  ): void {
    this.animationFrame++;

    this.renderTopBar(ctx, state, ballsRemaining);
    this.renderPlayerIndicator(ctx, state, isAITurn);
    
    if (aiThinking) {
      this.renderAIThinking(ctx, aiProgress);
    }

    if (state.isAiming || state.isCharging) {
      this.renderPowerBar(ctx, state.chargePower);
    }

    if (state.foul && state.foulTimer > 0) {
      this.renderFoulMessage(ctx, state.foul, state.foulTimer);
    }

    if (state.isGameOver) {
      this.renderGameOver(ctx, state);
    }
  }

  private renderTopBar(
    ctx: CanvasRenderingContext2D,
    state: GameState,
    ballsRemaining: { player1: number; player2: number }
  ): void {
    const barHeight = 50;
    const barY = 0;

    const bgGrad = ctx.createLinearGradient(0, barY, 0, barY + barHeight);
    bgGrad.addColorStop(0, '#2a2a4a');
    bgGrad.addColorStop(1, '#1a1a3a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, barY, CANVAS_WIDTH, barHeight);

    ctx.strokeStyle = '#4a4a6a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, barHeight);
    ctx.lineTo(CANVAS_WIDTH, barHeight);
    ctx.stroke();

    const centerX = CANVAS_WIDTH / 2;
    const player1X = 80;
    const player2X = CANVAS_WIDTH - 80;

    this.renderPlayerScore(
      ctx,
      player1X,
      barHeight / 2,
      '玩家',
      state.player1Score,
      state.currentPlayer === 1 && !state.isGameOver,
      state.player1Type,
      ballsRemaining.player1
    );

    this.renderPlayerScore(
      ctx,
      player2X,
      barHeight / 2,
      'AI',
      state.player2Score,
      state.currentPlayer === 2 && !state.isGameOver,
      state.player2Type,
      ballsRemaining.player2
    );

    ctx.font = 'bold 14px "Noto Sans SC"';
    ctx.fillStyle = COLORS.TEXT_DARK;
    ctx.textAlign = 'center';
    ctx.fillText(`第 ${state.frame} 局`, centerX, 18);

    const modeNames: Record<GameMode, string> = {
      'eight-ball': '8球制',
      'nine-ball': '9球制',
      'irregular': '异形桌',
    };
    ctx.font = '12px "Noto Sans SC"';
    ctx.fillStyle = COLORS.ACCENT;
    ctx.fillText(modeNames[state.mode], centerX, 36);
  }

  private renderPlayerScore(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    name: string,
    score: number,
    isActive: boolean,
    ballType: 'solid' | 'stripe' | null,
    remaining: number
  ): void {
    if (isActive) {
      const pulse = Math.sin(this.animationFrame * 0.1) * 0.3 + 0.7;
      ctx.shadowColor = COLORS.ACCENT;
      ctx.shadowBlur = 10 * pulse;
    }

    ctx.font = 'bold 14px "Noto Sans SC"';
    ctx.fillStyle = isActive ? COLORS.ACCENT : COLORS.TEXT;
    ctx.textAlign = 'center';
    ctx.fillText(name, x, y - 10);

    ctx.font = 'bold 20px "Press Start 2P"';
    ctx.fillStyle = isActive ? COLORS.ACCENT : COLORS.TEXT;
    ctx.fillText(score.toString(), x, y + 10);

    ctx.shadowBlur = 0;

    if (ballType) {
      const ballX = x + 40;
      const ballY = y;
      const r = 8;

      ctx.beginPath();
      ctx.arc(ballX, ballY, r, 0, Math.PI * 2);
      if (ballType === 'solid') {
        ctx.fillStyle = '#FFD700';
        ctx.fill();
      } else {
        const grad = ctx.createLinearGradient(ballX - r, ballY, ballX + r, ballY);
        grad.addColorStop(0, '#FFFFFF');
        grad.addColorStop(0.3, '#FFFFFF');
        grad.addColorStop(0.35, '#FFD700');
        grad.addColorStop(0.65, '#FFD700');
        grad.addColorStop(0.7, '#FFFFFF');
        grad.addColorStop(1, '#FFFFFF');
        ctx.fillStyle = grad;
        ctx.fill();
      }
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.font = '10px "Noto Sans SC"';
      ctx.fillStyle = COLORS.TEXT_DARK;
      ctx.textAlign = 'left';
      ctx.fillText(`剩${remaining}`, ballX + 14, ballY + 4);
    }
  }

  private renderPlayerIndicator(
    ctx: CanvasRenderingContext2D,
    state: GameState,
    isAITurn: boolean
  ): void {
    if (state.isGameOver) return;

    const text = isAITurn ? 'AI 思考中...' : '你的回合';
    const color = isAITurn ? '#FF6B6B' : COLORS.ACCENT;

    ctx.font = 'bold 16px "Noto Sans SC"';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.fillText(text, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 25);
  }

  private renderAIThinking(
    ctx: CanvasRenderingContext2D,
    progress: number
  ): void {
    const barWidth = 200;
    const barHeight = 8;
    const x = (CANVAS_WIDTH - barWidth) / 2;
    const y = CANVAS_HEIGHT - 60;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    drawRoundedRect(ctx, x, y, barWidth, barHeight, 4);
    ctx.fill();

    const fillWidth = barWidth * progress;
    const grad = ctx.createLinearGradient(x, y, x + barWidth, y);
    grad.addColorStop(0, '#FF6B6B');
    grad.addColorStop(1, '#FF8E8E');
    ctx.fillStyle = grad;
    drawRoundedRect(ctx, x, y, fillWidth, barHeight, 4);
    ctx.fill();

    const dots = Math.floor(this.animationFrame * 0.05) % 4;
    const dotText = '.'.repeat(dots);
    ctx.font = '14px "Noto Sans SC"';
    ctx.fillStyle = '#FF6B6B';
    ctx.textAlign = 'center';
    ctx.fillText(`AI 正在计算最佳球路${dotText}`, CANVAS_WIDTH / 2, y - 8);
  }

  private renderPowerBar(
    ctx: CanvasRenderingContext2D,
    power: number
  ): void {
    const barWidth = 400;
    const barHeight = 16;
    const x = (CANVAS_WIDTH - barWidth) / 2;
    const y = CANVAS_HEIGHT - 100;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    drawRoundedRect(ctx, x - 2, y - 2, barWidth + 4, barHeight + 4, 8);
    ctx.fill();

    ctx.fillStyle = '#1a1a2a';
    drawRoundedRect(ctx, x, y, barWidth, barHeight, 6);
    ctx.fill();

    const fillWidth = barWidth * power;
    const color = getGradientColor('#00FF00', '#FF0000', power);
    const grad = ctx.createLinearGradient(x, y, x + barWidth, y);
    grad.addColorStop(0, '#00FF00');
    grad.addColorStop(0.5, '#FFFF00');
    grad.addColorStop(1, '#FF0000');
    ctx.fillStyle = grad;
    drawRoundedRect(ctx, x, y, fillWidth, barHeight, 6);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    drawRoundedRect(ctx, x, y, barWidth, barHeight, 6);
    ctx.stroke();

    ctx.font = 'bold 14px "Noto Sans SC"';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    const powerPercent = Math.round(power * 100);
    ctx.fillText(`力度: ${powerPercent}%`, CANVAS_WIDTH / 2, y - 12);
  }

  private renderFoulMessage(
    ctx: CanvasRenderingContext2D,
    foul: string,
    timer: number
  ): void {
    const alpha = Math.min(1, timer / 500);
    const flash = Math.sin(this.animationFrame * 0.3) > 0;

    ctx.save();
    ctx.globalAlpha = alpha;

    const textWidth = 400;
    const textHeight = 60;
    const x = (CANVAS_WIDTH - textWidth) / 2;
    const y = (CANVAS_HEIGHT - textHeight) / 2 - 50;

    ctx.fillStyle = flash ? 'rgba(255, 0, 0, 0.9)' : 'rgba(200, 0, 0, 0.8)';
    drawRoundedRect(ctx, x, y, textWidth, textHeight, 10);
    ctx.fill();

    ctx.strokeStyle = '#FF6666';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.font = 'bold 20px "Noto Sans SC"';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`犯规: ${foul}`, CANVAS_WIDTH / 2, y + textHeight / 2);

    ctx.font = '14px "Noto Sans SC"';
    ctx.fillStyle = '#FFCCCC';
    ctx.fillText('对手获得自由球', CANVAS_WIDTH / 2, y + textHeight + 20);

    ctx.restore();
  }

  private renderGameOver(
    ctx: CanvasRenderingContext2D,
    state: GameState
  ): void {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const isPlayerWin = state.winner === 1;
    const title = isPlayerWin ? '🎉 胜利！' : '😔 失败';
    const color = isPlayerWin ? COLORS.ACCENT : '#FF6B6B';

    const bounce = Math.sin(this.animationFrame * 0.08) * 5;

    ctx.font = 'bold 48px "Press Start 2P"';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.shadowColor = color;
    ctx.shadowBlur = 20;
    ctx.fillText(title, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 80 + bounce);
    ctx.shadowBlur = 0;

    ctx.font = '20px "Noto Sans SC"';
    ctx.fillStyle = COLORS.TEXT;
    ctx.fillText(
      `最终比分: 玩家 ${state.player1Score} - ${state.player2Score} AI`,
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2 - 20
    );

    if (isPlayerWin) {
      for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2 + this.animationFrame * 0.02;
        const radius = 80 + Math.sin(this.animationFrame * 0.05 + i) * 20;
        const px = CANVAS_WIDTH / 2 + Math.cos(angle) * radius;
        const py = CANVAS_HEIGHT / 2 - 80 + Math.sin(angle) * radius;
        
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        const hue = (i * 18 + this.animationFrame) % 360;
        ctx.fillStyle = `hsl(${hue}, 100%, 60%)`;
        ctx.fill();
      }
    }

    const buttonY = CANVAS_HEIGHT / 2 + 40;
    
    this.renderMenuButton(ctx, CANVAS_WIDTH / 2 - 110, buttonY, '再来一局', true);
    this.renderMenuButton(ctx, CANVAS_WIDTH / 2 + 10, buttonY, '返回菜单', false);

    ctx.font = '14px "Noto Sans SC"';
    ctx.fillStyle = COLORS.TEXT_DARK;
    ctx.fillText('按 Enter 再来一局  |  按 ESC 返回菜单', CANVAS_WIDTH / 2, buttonY + 80);
  }

  private renderMenuButton(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    label: string,
    isPrimary: boolean
  ): void {
    const width = 100;
    const height = 45;

    drawRoundedRect(ctx, x, y, width, height, 8);

    if (isPrimary) {
      const grad = ctx.createLinearGradient(x, y, x, y + height);
      grad.addColorStop(0, '#FFD700');
      grad.addColorStop(1, '#FFA500');
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.font = 'bold 16px "Noto Sans SC"';
      ctx.fillStyle = '#1a1a1a';
    } else {
      const grad = ctx.createLinearGradient(x, y, x, y + height);
      grad.addColorStop(0, '#4a4a6a');
      grad.addColorStop(1, '#3a3a5a');
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.font = '14px "Noto Sans SC"';
      ctx.fillStyle = COLORS.TEXT;
    }

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x + width / 2, y + height / 2);
  }

  handleGameOverClick(x: number, y: number): 'restart' | 'menu' | null {
    const buttonY = CANVAS_HEIGHT / 2 + 40;
    const btn1X = CANVAS_WIDTH / 2 - 110;
    const btn2X = CANVAS_WIDTH / 2 + 10;
    const width = 100;
    const height = 45;

    if (x >= btn1X && x <= btn1X + width && y >= buttonY && y <= buttonY + height) {
      return 'restart';
    }
    if (x >= btn2X && x <= btn2X + width && y >= buttonY && y <= buttonY + height) {
      return 'menu';
    }
    return null;
  }
}
