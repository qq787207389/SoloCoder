import { Piece, PieceType } from './Piece';
import { Board } from './Board';
import { SevenBag } from './SevenBag';
import { RotationSystem } from './RotationSystem';
import { TSpinDetector, TSpinType } from './TSpinDetector';
import { 
  LOCK_DELAY, 
  LEVEL_SPEEDS, 
  SCORE_TABLE,
  CHARGE_PER_LINE,
  ItemType
} from '../constants';

export interface GameState {
  score: number;
  level: number;
  lines: number;
  combo: number;
  b2b: boolean;
  gameOver: boolean;
  paused: boolean;
  isBossMode: boolean;
  bossHP: number;
  playerCharge: number;
}

export class TetrisGame {
  board: Board;
  bag: SevenBag;
  currentPiece: Piece | null;
  nextPieces: PieceType[];
  holdPiece: PieceType | null;
  canHold: boolean;
  
  state: GameState;
  
  private lastMoveTime: number;
  private lockDelayStart: number;
  private lastKickIndex: number;
  private wasRotated: boolean;
  private pieceJustSpawned: boolean;
  
  private onLineClearCallback?: (lines: number, isPerfectClear: boolean, tSpin: TSpinType) => void;
  private onGameOverCallback?: () => void;
  private onPieceLockCallback?: () => void;

  constructor(isBossMode = false) {
    this.board = new Board();
    this.bag = new SevenBag();
    this.currentPiece = null;
    this.nextPieces = [];
    this.holdPiece = null;
    this.canHold = true;
    
    this.state = {
      score: 0,
      level: 1,
      lines: 0,
      combo: -1,
      b2b: false,
      gameOver: false,
      paused: false,
      isBossMode,
      bossHP: 100,
      playerCharge: 0
    };
    
    this.lastMoveTime = 0;
    this.lockDelayStart = 0;
    this.lastKickIndex = -1;
    this.wasRotated = false;
    this.pieceJustSpawned = false;
    
    this.updateNextPieces();
    this.spawnPiece();
  }

  private updateNextPieces(): void {
    this.nextPieces = this.bag.peek(5);
  }

  spawnPiece(): void {
    const type = this.bag.next();
    this.currentPiece = new Piece(type);
    this.updateNextPieces();
    this.canHold = true;
    this.wasRotated = false;
    this.lastKickIndex = -1;
    this.pieceJustSpawned = true;
    
    if (!this.board.isValidPosition(this.currentPiece)) {
      this.state.gameOver = true;
      this.onGameOverCallback?.();
    }
  }

  moveLeft(): boolean {
    if (!this.currentPiece || this.state.gameOver || this.state.paused) return false;
    
    if (this.board.isValidPosition(this.currentPiece, -1, 0)) {
      this.currentPiece.x--;
      this.resetLockDelay();
      this.wasRotated = false;
      return true;
    }
    return false;
  }

  moveRight(): boolean {
    if (!this.currentPiece || this.state.gameOver || this.state.paused) return false;
    
    if (this.board.isValidPosition(this.currentPiece, 1, 0)) {
      this.currentPiece.x++;
      this.resetLockDelay();
      this.wasRotated = false;
      return true;
    }
    return false;
  }

  softDrop(): boolean {
    if (!this.currentPiece || this.state.gameOver || this.state.paused) return false;
    
    if (this.board.isValidPosition(this.currentPiece, 0, 1)) {
      this.currentPiece.y++;
      this.state.score += SCORE_TABLE.SOFT_DROP;
      this.resetLockDelay();
      return true;
    }
    return false;
  }

  hardDrop(): void {
    if (!this.currentPiece || this.state.gameOver || this.state.paused) return;
    
    let dropDistance = 0;
    while (this.board.isValidPosition(this.currentPiece, 0, 1)) {
      this.currentPiece.y++;
      dropDistance++;
    }
    this.state.score += dropDistance * SCORE_TABLE.HARD_DROP;
    this.lockPiece();
  }

  rotate(direction: 1 | -1 = 1): boolean {
    if (!this.currentPiece || this.state.gameOver || this.state.paused) return false;
    
    const result = RotationSystem.tryRotate(this.board, this.currentPiece, direction);
    if (result.success) {
      this.lastKickIndex = result.kickIndex;
      this.wasRotated = true;
      this.resetLockDelay();
      return true;
    }
    return false;
  }

  hold(): boolean {
    if (!this.currentPiece || this.state.gameOver || this.state.paused || !this.canHold) {
      return false;
    }
    
    const currentType = this.currentPiece.type;
    
    if (this.holdPiece) {
      this.currentPiece = new Piece(this.holdPiece);
    } else {
      this.spawnPiece();
      return true;
    }
    
    this.holdPiece = currentType;
    this.canHold = false;
    this.wasRotated = false;
    this.lastKickIndex = -1;
    return true;
  }

  private resetLockDelay(): void {
    this.lockDelayStart = 0;
  }

  private startLockDelay(): void {
    if (this.lockDelayStart === 0) {
      this.lockDelayStart = performance.now();
    }
  }

  private checkLockDelay(): boolean {
    if (this.lockDelayStart === 0) return false;
    return performance.now() - this.lockDelayStart >= LOCK_DELAY;
  }

  private lockPiece(): void {
    if (!this.currentPiece) return;
    
    this.board.placePiece(this.currentPiece);
    this.onPieceLockCallback?.();
    
    const tSpinType = TSpinDetector.detect(
      this.currentPiece, 
      this.board, 
      this.lastKickIndex, 
      this.wasRotated
    );
    
    const { linesCleared } = this.board.clearLines();
    const isPerfectClear = this.board.isEmpty();
    
    this.calculateScore(linesCleared, tSpinType, isPerfectClear);
    
    if (linesCleared > 0) {
      this.state.combo++;
      this.state.playerCharge += linesCleared * CHARGE_PER_LINE;
      this.onLineClearCallback?.(linesCleared, isPerfectClear, tSpinType);
      
      if (linesCleared >= 4 || tSpinType !== 'none') {
        this.state.b2b = true;
      } else {
        this.state.b2b = false;
      }
    } else {
      this.state.combo = -1;
      if (tSpinType === 'none') {
        this.state.b2b = false;
      }
    }
    
    this.state.lines += linesCleared;
    this.state.level = Math.floor(this.state.lines / 10) + 1;
    
    this.spawnPiece();
  }

  private calculateScore(lines: number, tSpin: TSpinType, isPerfectClear: boolean): void {
    let baseScore = 0;
    const level = this.state.level;
    
    const tSpinName = TSpinDetector.getTSpinName(tSpin, lines);
    
    if (tSpinName && SCORE_TABLE[tSpinName as keyof typeof SCORE_TABLE]) {
      baseScore = SCORE_TABLE[tSpinName as keyof typeof SCORE_TABLE] * level;
    } else if (lines === 1) {
      baseScore = SCORE_TABLE.SINGLE * level;
    } else if (lines === 2) {
      baseScore = SCORE_TABLE.DOUBLE * level;
    } else if (lines === 3) {
      baseScore = SCORE_TABLE.TRIPLE * level;
    } else if (lines === 4) {
      baseScore = SCORE_TABLE.TETRIS * level;
    }
    
    if (this.state.b2b && (lines >= 4 || tSpin !== 'none')) {
      baseScore = Math.floor(baseScore * 1.5);
    }
    
    if (this.state.combo > 0) {
      baseScore += SCORE_TABLE.COMBO_MULTIPLIER * this.state.combo * level;
    }
    
    if (isPerfectClear) {
      if (lines === 4) {
        baseScore += SCORE_TABLE.PERFECT_CLEAR * level;
      } else {
        baseScore += Math.floor(SCORE_TABLE.PERFECT_CLEAR * 0.5 * level);
      }
    }
    
    this.state.score += baseScore;
  }

  update(currentTime: number): void {
    if (this.state.gameOver || this.state.paused || !this.currentPiece) return;
    
    const speedIndex = Math.min(this.state.level - 1, LEVEL_SPEEDS.length - 1);
    const fallSpeed = LEVEL_SPEEDS[speedIndex];
    
    if (currentTime - this.lastMoveTime >= fallSpeed) {
      if (this.board.isValidPosition(this.currentPiece, 0, 1)) {
        this.currentPiece.y++;
        this.lastMoveTime = currentTime;
        this.resetLockDelay();
      } else {
        this.startLockDelay();
        if (this.checkLockDelay()) {
          this.lockPiece();
        }
      }
    }
    
    if (!this.board.isValidPosition(this.currentPiece, 0, 1)) {
      this.startLockDelay();
    }
  }

  useItem(itemType: ItemType): boolean {
    if (!this.state.isBossMode || this.state.playerCharge < 50) {
      return false;
    }
    
    this.state.playerCharge -= 50;
    
    switch (itemType) {
      case 'HEAL':
        this.state.bossHP = Math.max(0, this.state.bossHP - 25);
        break;
      case 'ADD_LINES':
        this.state.bossHP = Math.max(0, this.state.bossHP - 15);
        break;
      case 'SPEED_UP':
        this.state.bossHP = Math.max(0, this.state.bossHP - 5);
        break;
      case 'SHUFFLE':
        this.state.bossHP = Math.max(0, this.state.bossHP - 20);
        break;
    }
    
    return true;
  }

  bossAttack(itemType: ItemType): void {
    switch (itemType) {
      case 'ADD_LINES':
        this.board.addGarbageLines(2);
        break;
      case 'SPEED_UP':
        this.state.level += 2;
        break;
      case 'SHUFFLE':
        for (let y = this.board.height - 5; y < this.board.height; y++) {
          for (let x = 0; x < this.board.width; x++) {
            if (Math.random() > 0.7 && y >= 0) {
              const temp = this.board.grid[y][x];
              const nx = Math.floor(Math.random() * this.board.width);
              this.board.grid[y][x] = this.board.grid[y][nx];
              this.board.grid[y][nx] = temp;
            }
          }
        }
        break;
    }
  }

  setOnLineClearCallback(callback: (lines: number, isPerfectClear: boolean, tSpin: TSpinType) => void): void {
    this.onLineClearCallback = callback;
  }

  setOnGameOverCallback(callback: () => void): void {
    this.onGameOverCallback = callback;
  }

  setOnPieceLockCallback(callback: () => void): void {
    this.onPieceLockCallback = callback;
  }

  togglePause(): void {
    this.state.paused = !this.state.paused;
  }

  reset(): void {
    this.board.reset();
    this.bag.reset();
    this.holdPiece = null;
    this.canHold = true;
    this.state = {
      score: 0,
      level: 1,
      lines: 0,
      combo: -1,
      b2b: false,
      gameOver: false,
      paused: false,
      isBossMode: this.state.isBossMode,
      bossHP: 100,
      playerCharge: 0
    };
    this.updateNextPieces();
    this.spawnPiece();
  }
}
