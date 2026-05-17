import './style.css';
import { SlotMachine } from './SlotMachine';

function createUI(): void {
  const app = document.getElementById('app')!;

  app.innerHTML = `
    <div class="game-container">
      <div class="game-header">
        <h1 class="game-title">🍒 水果老虎机 🍋</h1>
      </div>

      <div class="status-bar">
        <div class="status-item">
          <div class="status-label">余额</div>
          <div class="status-value credits" id="credits">100</div>
        </div>
        <div class="status-item">
          <div class="status-label">赢得</div>
          <div class="status-value win" id="winAmount">0</div>
        </div>
      </div>

      <div class="canvas-container">
        <canvas id="gameCanvas"></canvas>
      </div>

      <div id="messageContainer"></div>

      <div class="controls">
        <div class="bet-controls">
          <button class="bet-btn" id="decreaseBet">-</button>
          <div class="bet-display">
            <div class="bet-amount" id="betAmount">1</div>
            <div class="bet-label">下注金额</div>
          </div>
          <button class="bet-btn" id="increaseBet">+</button>
        </div>

        <div class="action-buttons" style="margin-top: 16px;">
          <button class="spin-btn" id="spinBtn">🎰 旋转</button>
          <button class="auto-btn" id="autoBtn">🔄 自动</button>
        </div>

        <div class="last-win" style="margin-top: 16px;">
          <div class="last-win-label">上次中奖</div>
          <div class="last-win-value" id="lastWin">0</div>
        </div>
      </div>
    </div>
  `;
}

function initGame(): void {
  createUI();

  const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
  const slotMachine = new SlotMachine(canvas);

  const creditsEl = document.getElementById('credits')!;
  const winAmountEl = document.getElementById('winAmount')!;
  const betAmountEl = document.getElementById('betAmount')!;
  const lastWinEl = document.getElementById('lastWin')!;
  const spinBtn = document.getElementById('spinBtn') as HTMLButtonElement;
  const autoBtn = document.getElementById('autoBtn') as HTMLButtonElement;
  const decreaseBtn = document.getElementById('decreaseBet') as HTMLButtonElement;
  const increaseBtn = document.getElementById('increaseBet') as HTMLButtonElement;
  const messageContainer = document.getElementById('messageContainer')!;

  const updateUI = (): void => {
    const gameState = slotMachine.getGameState();

    creditsEl.textContent = gameState.getCredits().toString();
    winAmountEl.textContent = gameState.getLastWinResults().length > 0
      ? gameState.getLastWin().toString()
      : '0';
    betAmountEl.textContent = gameState.getCurrentBet().toString();
    lastWinEl.textContent = gameState.getLastWin().toString();

    const isSpinning = gameState.isSpinningState();
    spinBtn.disabled = isSpinning;
    decreaseBtn.disabled = isSpinning;
    increaseBtn.disabled = isSpinning;

    if (gameState.isAutoSpinState()) {
      autoBtn.classList.add('active');
      autoBtn.textContent = '⏹️ 停止';
    } else {
      autoBtn.classList.remove('active');
      autoBtn.textContent = '🔄 自动';
    }

    const message = slotMachine.getMessage();
    if (message) {
      messageContainer.innerHTML = `
        <div class="message ${message.type}">
          ${message.text}
        </div>
      `;
    } else {
      messageContainer.innerHTML = '';
    }
  };

  slotMachine.setOnStateChange(updateUI);

  spinBtn.addEventListener('click', () => {
    slotMachine.spin();
  });

  autoBtn.addEventListener('click', () => {
    slotMachine.toggleAutoSpin();
  });

  decreaseBtn.addEventListener('click', () => {
    slotMachine.decrementBet();
  });

  increaseBtn.addEventListener('click', () => {
    slotMachine.incrementBet();
  });

  canvas.addEventListener('click', () => {
    if (!slotMachine.getGameState().isSpinningState()) {
      slotMachine.spin();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'Enter') {
      e.preventDefault();
      if (!slotMachine.getGameState().isSpinningState()) {
        slotMachine.spin();
      }
    }
  });

  slotMachine.init();
  updateUI();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGame);
} else {
  initGame();
}