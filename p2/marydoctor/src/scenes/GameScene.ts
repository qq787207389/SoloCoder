import Phaser from 'phaser';
import { AudioManager } from '../audio/AudioManager';
import { GameManager, GamePhase } from '../game/GameManager';
import { GameRenderer } from '../rendering/GameRenderer';
import { MatchResult } from '../game/MatchResolver';
import { COLORS, GAME_CONFIG, CONTROLS } from '../config/GameConfig';
import { Capsule } from '../types/GameTypes';

export class GameScene extends Phaser.Scene {
    private audioManager!: AudioManager;
    private gameManager!: GameManager;
    private gameRenderer!: GameRenderer;
    
    private controls: { [key: string]: Phaser.Input.Keyboard.Key } = {};
    private scoreText!: Phaser.GameObjects.Text;
    private virusCountText!: Phaser.GameObjects.Text;
    private levelText!: Phaser.GameObjects.Text;
    private nextCapsuleLabel!: Phaser.GameObjects.Text;
    private pauseText!: Phaser.GameObjects.Text;
    private gameOverText!: Phaser.GameObjects.Text;
    private winText!: Phaser.GameObjects.Text;
    
    private lastMoveTime: number = 0;
    private moveCooldown: number = 100;
    
    private boardOffsetX: number = 0;
    private boardOffsetY: number = 0;

    constructor() {
        super({ key: 'GameScene' });
    }

    init(): void {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const boardWidth = GAME_CONFIG.bottleWidth * GAME_CONFIG.cellSize;
        this.boardOffsetX = (width - boardWidth) / 2;
        this.boardOffsetY = (height - GAME_CONFIG.bottleHeight * GAME_CONFIG.cellSize) / 2;
    }

    create(): void {
        this.audioManager = this.registry.get('audioManager');
        this.audioManager.playNormalBGM();
        
        this.gameManager = new GameManager(1);
        this.gameRenderer = new GameRenderer(this, this.boardOffsetX, this.boardOffsetY);
        
        this.createUI();
        this.createControls();
        this.setupGameCallbacks();
        
        this.gameManager.startGame();
    }

    private createUI(): void {
        const width = this.cameras.main.width;
        const boardWidth = GAME_CONFIG.bottleWidth * GAME_CONFIG.cellSize;
        
        const leftPanelX = this.boardOffsetX - 150;
        const rightPanelX = this.boardOffsetX + boardWidth + 100;
        const centerY = this.boardOffsetY + GAME_CONFIG.cellSize * 4;
        
        const scoreLabel = this.add.text(leftPanelX, centerY, '分数', {
            fontFamily: 'monospace',
            fontSize: '20px',
            color: '#88ccff'
        });
        
        this.scoreText = this.add.text(leftPanelX, centerY + 30, '0', {
            fontFamily: 'monospace',
            fontSize: '32px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        });
        
        const virusLabel = this.add.text(leftPanelX, centerY + 100, '病毒', {
            fontFamily: 'monospace',
            fontSize: '20px',
            color: '#88ccff'
        });
        
        this.virusCountText = this.add.text(leftPanelX, centerY + 130, '0', {
            fontFamily: 'monospace',
            fontSize: '32px',
            color: '#ff4444',
            stroke: '#000000',
            strokeThickness: 2
        });
        
        const levelLabel = this.add.text(leftPanelX, centerY + 200, '关卡', {
            fontFamily: 'monospace',
            fontSize: '20px',
            color: '#88ccff'
        });
        
        this.levelText = this.add.text(leftPanelX, centerY + 230, '1', {
            fontFamily: 'monospace',
            fontSize: '32px',
            color: '#ffdd44',
            stroke: '#000000',
            strokeThickness: 2
        });
        
        this.nextCapsuleLabel = this.add.text(rightPanelX, centerY, '下一个', {
            fontFamily: 'monospace',
            fontSize: '20px',
            color: '#88ccff'
        });
        
        const backButton = this.add.text(width - 100, 30, '返回菜单', {
            fontFamily: 'monospace',
            fontSize: '16px',
            color: '#888888'
        });
        backButton.setOrigin(1, 0);
        backButton.setInteractive({ useHandCursor: true });
        backButton.on('pointerdown', () => this.returnToMenu());
        
        this.pauseText = this.add.text(width / 2, this.boardOffsetY - 40, '暂停中 - 按 P 继续', {
            fontFamily: 'monospace',
            fontSize: '24px',
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 3
        });
        this.pauseText.setOrigin(0.5);
        this.pauseText.setVisible(false);
        
        this.gameOverText = this.add.text(width / 2, this.boardOffsetY + GAME_CONFIG.bottleHeight * GAME_CONFIG.cellSize / 2, 
            '游戏结束\n按 R 重新开始\n按 M 返回菜单', {
            fontFamily: 'monospace',
            fontSize: '32px',
            color: '#ff4444',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center'
        });
        this.gameOverText.setOrigin(0.5);
        this.gameOverText.setVisible(false);
        
        this.winText = this.add.text(width / 2, this.boardOffsetY + GAME_CONFIG.bottleHeight * GAME_CONFIG.cellSize / 2, 
            '胜利！\n按 R 重新开始\n按 M 返回菜单', {
            fontFamily: 'monospace',
            fontSize: '32px',
            color: '#44ff44',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center'
        });
        this.winText.setOrigin(0.5);
        this.winText.setVisible(false);
    }

    private createControls(): void {
        const p1 = CONTROLS.P1;
        
        this.controls.left = this.input.keyboard!.addKey(p1.LEFT as any)!;
        this.controls.right = this.input.keyboard!.addKey(p1.RIGHT as any)!;
        this.controls.down = this.input.keyboard!.addKey(p1.DOWN as any)!;
        this.controls.rotateCW = this.input.keyboard!.addKey(p1.ROTATE_CW as any)!;
        this.controls.rotateCCW = this.input.keyboard!.addKey(p1.ROTATE_CCW as any)!;
        this.controls.pause = this.input.keyboard!.addKey('P')!;
        this.controls.restart = this.input.keyboard!.addKey('R')!;
        this.controls.menu = this.input.keyboard!.addKey('M')!;
        this.controls.hardDrop = this.input.keyboard!.addKey('SPACE')!;
    }

    private setupGameCallbacks(): void {
        this.gameManager.setOnMatch((result: MatchResult) => {
            this.onMatch(result);
        });
        
        this.gameManager.setOnChain((chainLevel: number) => {
            this.onChain(chainLevel);
        });
        
        this.gameManager.setOnGameOver(() => {
            this.onGameOver();
        });
        
        this.gameManager.setOnWin(() => {
            this.onWin();
        });
    }

    update(time: number, delta: number): void {
        if (this.gameManager.isGameOver() || this.gameManager.isWin()) {
            if (Phaser.Input.Keyboard.JustDown(this.controls.restart)) {
                this.restartGame();
            }
            if (Phaser.Input.Keyboard.JustDown(this.controls.menu)) {
                this.returnToMenu();
            }
            return;
        }
        
        if (Phaser.Input.Keyboard.JustDown(this.controls.pause)) {
            this.togglePause();
        }
        
        if (this.gameManager.isPaused()) {
            return;
        }
        
        this.gameManager.update(delta);
        this.handleInput(time);
        this.updateUI();
        this.render();
    }

    private handleInput(time: number): void {
        if (time - this.lastMoveTime < this.moveCooldown) return;
        
        if (this.controls.left.isDown) {
            if (this.gameManager.moveLeft()) {
                this.audioManager.playMove();
                this.lastMoveTime = time;
            }
        }
        
        if (this.controls.right.isDown) {
            if (this.gameManager.moveRight()) {
                this.audioManager.playMove();
                this.lastMoveTime = time;
            }
        }
        
        if (Phaser.Input.Keyboard.JustDown(this.controls.rotateCW)) {
            if (this.gameManager.rotateClockwise()) {
                this.audioManager.playRotate();
            }
        }
        
        if (Phaser.Input.Keyboard.JustDown(this.controls.rotateCCW)) {
            if (this.gameManager.rotateCounterClockwise()) {
                this.audioManager.playRotate();
            }
        }
        
        if (Phaser.Input.Keyboard.JustDown(this.controls.hardDrop)) {
            this.gameManager.hardDrop();
            this.audioManager.playLand();
        }
        
        this.gameManager.setFastFalling(this.controls.down.isDown);
    }

    private updateUI(): void {
        const state = this.gameManager.getGameState();
        
        const oldScore = parseInt(this.scoreText.text);
        const newScore = state.score;
        if (oldScore !== newScore) {
            this.tweens.add({
                targets: this.scoreText,
                scale: { from: 1.2, to: 1 },
                duration: 200,
                ease: 'Back.easeOut'
            });
        }
        this.scoreText.setText(newScore.toString());
        
        this.virusCountText.setText(state.virusesRemaining.toString());
        this.levelText.setText(state.level.toString());
        
        const nextCapsule = this.gameManager.getCapsuleController().getNextCapsule();
        const nextPreviewX = this.boardOffsetX + GAME_CONFIG.bottleWidth * GAME_CONFIG.cellSize + 100;
        const nextPreviewY = this.boardOffsetY + GAME_CONFIG.cellSize * 6;
        this.gameRenderer.updateNextCapsule(nextCapsule, nextPreviewX, nextPreviewY);
    }

    private render(): void {
        const board = this.gameManager.getGameBoard().getBoard();
        const currentCapsule = this.gameManager.getCapsuleController().getCurrentCapsule();
        const ghostY = this.gameManager.getGhostY();
        
        this.gameRenderer.updateBoard(board);
        this.gameRenderer.updateCurrentCapsule(currentCapsule, ghostY);
    }

    private onMatch(result: MatchResult): void {
        this.audioManager.playClear();
        
        this.gameRenderer.animateMatchResult(result, this.boardOffsetX, this.boardOffsetY);
        
        if (result.matches.length > 0 && result.matches[0].cells.length > 0) {
            const firstCell = result.matches[0].cells[0];
            this.gameRenderer.emitScore(firstCell.x, firstCell.y, result.score, result.isChain);
        }
    }

    private onChain(chainLevel: number): void {
        this.audioManager.playChain(chainLevel);
        this.gameRenderer.animateChain(chainLevel, this.boardOffsetX, this.boardOffsetY);
    }

    private onGameOver(): void {
        this.audioManager.playLose();
        this.gameOverText.setVisible(true);
        this.cameras.main.flash(500, 255, 0, 0);
    }

    private onWin(): void {
        this.audioManager.playWin();
        this.winText.setVisible(true);
        this.cameras.main.flash(500, 0, 255, 0);
    }

    private togglePause(): void {
        this.gameManager.togglePause();
        this.pauseText.setVisible(this.gameManager.isPaused());
        
        if (this.gameManager.isPaused()) {
            this.audioManager.stopMusic();
        } else {
            this.audioManager.playNormalBGM();
        }
    }

    private restartGame(): void {
        this.gameOverText.setVisible(false);
        this.winText.setVisible(false);
        this.gameRenderer.clear();
        this.gameManager.startGame();
        this.audioManager.playNormalBGM();
    }

    private returnToMenu(): void {
        this.audioManager.stopAll();
        this.gameRenderer.destroy();
        this.scene.start('MenuScene');
    }
}
