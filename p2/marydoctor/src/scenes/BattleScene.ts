import Phaser from 'phaser';
import { AudioManager } from '../audio/AudioManager';
import { GameManager, GamePhase } from '../game/GameManager';
import { GameRenderer } from '../rendering/GameRenderer';
import { MatchResult } from '../game/MatchResolver';
import { COLORS, GAME_CONFIG, CONTROLS } from '../config/GameConfig';

interface Player {
    manager: GameManager;
    renderer: GameRenderer;
    controls: { [key: string]: Phaser.Input.Keyboard.Key };
    scoreText: Phaser.GameObjects.Text;
    virusCountText: Phaser.GameObjects.Text;
    lastMoveTime: number;
    boardOffsetX: number;
    boardOffsetY: number;
    gameOverText: Phaser.GameObjects.Text;
    winText: Phaser.GameObjects.Text;
}

export class BattleScene extends Phaser.Scene {
    private audioManager!: AudioManager;
    private player1!: Player;
    private player2!: Player;
    
    private winner: number = 0;
    private battleOver: boolean = false;
    private resultText!: Phaser.GameObjects.Text;

    constructor() {
        super({ key: 'BattleScene' });
    }

    init(): void {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const boardWidth = GAME_CONFIG.bottleWidth * GAME_CONFIG.cellSize;
        const boardHeight = GAME_CONFIG.bottleHeight * GAME_CONFIG.cellSize;
        const spacing = 80;
        const totalWidth = boardWidth * 2 + spacing;
        
        const startX = (width - totalWidth) / 2;
        const startY = (height - boardHeight) / 2;
        
        this.player1 = {
            manager: null as any,
            renderer: null as any,
            controls: {},
            scoreText: null as any,
            virusCountText: null as any,
            lastMoveTime: 0,
            boardOffsetX: startX,
            boardOffsetY: startY,
            gameOverText: null as any,
            winText: null as any
        };
        
        this.player2 = {
            manager: null as any,
            renderer: null as any,
            controls: {},
            scoreText: null as any,
            virusCountText: null as any,
            lastMoveTime: 0,
            boardOffsetX: startX + boardWidth + spacing,
            boardOffsetY: startY,
            gameOverText: null as any,
            winText: null as any
        };
    }

    create(): void {
        this.audioManager = this.registry.get('audioManager');
        this.audioManager.playBattleBGM();
        
        this.createPlayer(this.player1, 1, CONTROLS.P1);
        this.createPlayer(this.player2, 2, CONTROLS.P2);
        
        this.setupGarbageCallbacks();
        
        this.player1.manager.startGame();
        this.player2.manager.startGame();
        
        this.createUI();
    }

    private createPlayer(player: Player, playerId: number, controlScheme: typeof CONTROLS.P1): void {
        player.manager = new GameManager(playerId);
        player.renderer = new GameRenderer(this, player.boardOffsetX, player.boardOffsetY);
        
        player.controls.left = this.input.keyboard!.addKey(controlScheme.LEFT as any)!;
        player.controls.right = this.input.keyboard!.addKey(controlScheme.RIGHT as any)!;
        player.controls.down = this.input.keyboard!.addKey(controlScheme.DOWN as any)!;
        player.controls.rotateCW = this.input.keyboard!.addKey(controlScheme.ROTATE_CW as any)!;
        player.controls.rotateCCW = this.input.keyboard!.addKey(controlScheme.ROTATE_CCW as any)!;
        
        player.manager.setOnMatch((result: MatchResult) => {
            this.onPlayerMatch(player, result);
        });
        
        player.manager.setOnChain((chainLevel: number) => {
            this.onPlayerChain(player, chainLevel);
        });
        
        player.manager.setOnGameOver(() => {
            this.onPlayerGameOver(player);
        });
        
        player.manager.setOnWin(() => {
            this.onPlayerWin(player);
        });
    }

    private setupGarbageCallbacks(): void {
        this.player1.manager.setOnGarbageToSend((count: number) => {
            this.player2.manager.addGarbage(count);
        });
        
        this.player2.manager.setOnGarbageToSend((count: number) => {
            this.player1.manager.addGarbage(count);
        });
    }

    private createUI(): void {
        const width = this.cameras.main.width;
        
        const p1Label = this.add.text(
            this.player1.boardOffsetX + GAME_CONFIG.bottleWidth * GAME_CONFIG.cellSize / 2,
            this.player1.boardOffsetY - 50,
            '玩家 1',
            {
                fontFamily: 'monospace',
                fontSize: '28px',
                color: '#ff4444',
                stroke: '#000000',
                strokeThickness: 3
            }
        );
        p1Label.setOrigin(0.5);
        
        const p2Label = this.add.text(
            this.player2.boardOffsetX + GAME_CONFIG.bottleWidth * GAME_CONFIG.cellSize / 2,
            this.player2.boardOffsetY - 50,
            '玩家 2',
            {
                fontFamily: 'monospace',
                fontSize: '28px',
                color: '#4488ff',
                stroke: '#000000',
                strokeThickness: 3
            }
        );
        p2Label.setOrigin(0.5);
        
        const p1Controls = this.add.text(
            this.player1.boardOffsetX + GAME_CONFIG.bottleWidth * GAME_CONFIG.cellSize / 2,
            this.player1.boardOffsetY + GAME_CONFIG.bottleHeight * GAME_CONFIG.cellSize + 30,
            'A/D 移动 | S 下落 | W 顺转 | Q 逆转',
            {
                fontFamily: 'monospace',
                fontSize: '12px',
                color: '#666666',
                align: 'center'
            }
        );
        p1Controls.setOrigin(0.5);
        
        const p2Controls = this.add.text(
            this.player2.boardOffsetX + GAME_CONFIG.bottleWidth * GAME_CONFIG.cellSize / 2,
            this.player2.boardOffsetY + GAME_CONFIG.bottleHeight * GAME_CONFIG.cellSize + 30,
            '←/→ 移动 | ↓ 下落 | ↑ 顺转 | SHIFT 逆转',
            {
                fontFamily: 'monospace',
                fontSize: '12px',
                color: '#666666',
                align: 'center'
            }
        );
        p2Controls.setOrigin(0.5);
        
        this.player1.scoreText = this.add.text(
            this.player1.boardOffsetX - 10,
            this.player1.boardOffsetY + 20,
            '0',
            {
                fontFamily: 'monospace',
                fontSize: '24px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2
            }
        );
        this.player1.scoreText.setOrigin(1, 0);
        
        this.player2.scoreText = this.add.text(
            this.player2.boardOffsetX + GAME_CONFIG.bottleWidth * GAME_CONFIG.cellSize + 10,
            this.player2.boardOffsetY + 20,
            '0',
            {
                fontFamily: 'monospace',
                fontSize: '24px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2
            }
        );
        
        this.player1.virusCountText = this.add.text(
            this.player1.boardOffsetX + GAME_CONFIG.bottleWidth * GAME_CONFIG.cellSize + 10,
            this.player1.boardOffsetY + 20,
            '病毒: 0',
            {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#ff4444'
            }
        );
        
        this.player2.virusCountText = this.add.text(
            this.player2.boardOffsetX - 10,
            this.player2.boardOffsetY + 20,
            '病毒: 0',
            {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#ff4444'
            }
        );
        this.player2.virusCountText.setOrigin(1, 0);
        
        const centerX = (this.player1.boardOffsetX + this.player2.boardOffsetX + GAME_CONFIG.bottleWidth * GAME_CONFIG.cellSize) / 2;
        this.resultText = this.add.text(centerX, this.player1.boardOffsetY + GAME_CONFIG.bottleHeight * GAME_CONFIG.cellSize / 2, '', {
            fontFamily: 'monospace',
            fontSize: '48px',
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 6,
            align: 'center'
        });
        this.resultText.setOrigin(0.5);
        this.resultText.setVisible(false);
        
        const backButton = this.add.text(width / 2, 30, '按 M 返回菜单', {
            fontFamily: 'monospace',
            fontSize: '16px',
            color: '#888888'
        });
        backButton.setOrigin(0.5);
        
        this.player1.gameOverText = this.add.text(
            this.player1.boardOffsetX + GAME_CONFIG.bottleWidth * GAME_CONFIG.cellSize / 2,
            this.player1.boardOffsetY + GAME_CONFIG.bottleHeight * GAME_CONFIG.cellSize / 2,
            '失败',
            {
                fontFamily: 'monospace',
                fontSize: '48px',
                color: '#ff4444',
                stroke: '#000000',
                strokeThickness: 4
            }
        );
        this.player1.gameOverText.setOrigin(0.5);
        this.player1.gameOverText.setVisible(false);
        
        this.player2.gameOverText = this.add.text(
            this.player2.boardOffsetX + GAME_CONFIG.bottleWidth * GAME_CONFIG.cellSize / 2,
            this.player2.boardOffsetY + GAME_CONFIG.bottleHeight * GAME_CONFIG.cellSize / 2,
            '失败',
            {
                fontFamily: 'monospace',
                fontSize: '48px',
                color: '#ff4444',
                stroke: '#000000',
                strokeThickness: 4
            }
        );
        this.player2.gameOverText.setOrigin(0.5);
        this.player2.gameOverText.setVisible(false);
        
        this.player1.winText = this.add.text(
            this.player1.boardOffsetX + GAME_CONFIG.bottleWidth * GAME_CONFIG.cellSize / 2,
            this.player1.boardOffsetY + GAME_CONFIG.bottleHeight * GAME_CONFIG.cellSize / 2,
            '胜利！',
            {
                fontFamily: 'monospace',
                fontSize: '48px',
                color: '#44ff44',
                stroke: '#000000',
                strokeThickness: 4
            }
        );
        this.player1.winText.setOrigin(0.5);
        this.player1.winText.setVisible(false);
        
        this.player2.winText = this.add.text(
            this.player2.boardOffsetX + GAME_CONFIG.bottleWidth * GAME_CONFIG.cellSize / 2,
            this.player2.boardOffsetY + GAME_CONFIG.bottleHeight * GAME_CONFIG.cellSize / 2,
            '胜利！',
            {
                fontFamily: 'monospace',
                fontSize: '48px',
                color: '#44ff44',
                stroke: '#000000',
                strokeThickness: 4
            }
        );
        this.player2.winText.setOrigin(0.5);
        this.player2.winText.setVisible(false);
    }

    update(time: number, delta: number): void {
        if (this.input.keyboard!.addKey('M')!.isDown) {
            this.returnToMenu();
            return;
        }
        
        if (this.battleOver) {
            if (this.input.keyboard!.addKey('R')!.isDown) {
                this.restartBattle();
            }
            return;
        }
        
        this.updatePlayer(this.player1, time, delta);
        this.updatePlayer(this.player2, time, delta);
        
        this.updatePlayerUI(this.player1);
        this.updatePlayerUI(this.player2);
        
        this.renderPlayer(this.player1);
        this.renderPlayer(this.player2);
    }

    private updatePlayer(player: Player, time: number, delta: number): void {
        if (player.manager.isGameOver() || player.manager.isWin()) {
            return;
        }
        
        player.manager.update(delta);
        this.handlePlayerInput(player, time);
    }

    private handlePlayerInput(player: Player, time: number): void {
        const moveCooldown = 100;
        if (time - player.lastMoveTime < moveCooldown) return;
        
        if (player.controls.left.isDown) {
            if (player.manager.moveLeft()) {
                this.audioManager.playMove();
                player.lastMoveTime = time;
            }
        }
        
        if (player.controls.right.isDown) {
            if (player.manager.moveRight()) {
                this.audioManager.playMove();
                player.lastMoveTime = time;
            }
        }
        
        if (Phaser.Input.Keyboard.JustDown(player.controls.rotateCW)) {
            if (player.manager.rotateClockwise()) {
                this.audioManager.playRotate();
            }
        }
        
        if (Phaser.Input.Keyboard.JustDown(player.controls.rotateCCW)) {
            if (player.manager.rotateCounterClockwise()) {
                this.audioManager.playRotate();
            }
        }
        
        player.manager.setFastFalling(player.controls.down.isDown);
    }

    private updatePlayerUI(player: Player): void {
        const state = player.manager.getGameState();
        player.scoreText.setText(state.score.toString());
        player.virusCountText.setText(`病毒: ${state.virusesRemaining}`);
    }

    private renderPlayer(player: Player): void {
        const board = player.manager.getGameBoard().getBoard();
        const currentCapsule = player.manager.getCapsuleController().getCurrentCapsule();
        const ghostY = player.manager.getGhostY();
        
        player.renderer.updateBoard(board);
        player.renderer.updateCurrentCapsule(currentCapsule, ghostY);
    }

    private onPlayerMatch(player: Player, result: MatchResult): void {
        this.audioManager.playClear();
        player.renderer.animateMatchResult(result, player.boardOffsetX, player.boardOffsetY);
        
        if (result.matches.length > 0 && result.matches[0].cells.length > 0) {
            const firstCell = result.matches[0].cells[0];
            player.renderer.emitScore(firstCell.x, firstCell.y, result.score, result.isChain);
        }
    }

    private onPlayerChain(player: Player, chainLevel: number): void {
        this.audioManager.playChain(chainLevel);
        player.renderer.animateChain(chainLevel, player.boardOffsetX, player.boardOffsetY);
        
        const camera = this.cameras.main;
        camera.shake(100, 0.005);
    }

    private onPlayerGameOver(player: Player): void {
        if (this.battleOver) return;
        
        this.audioManager.playLose();
        player.gameOverText.setVisible(true);
        
        const winner = player === this.player1 ? this.player2 : this.player1;
        winner.winText.setVisible(true);
        
        this.battleOver = true;
        this.winner = winner.manager.getPlayerId();
        
        this.showBattleResult();
    }

    private onPlayerWin(player: Player): void {
        if (this.battleOver) return;
        
        this.audioManager.playWin();
        player.winText.setVisible(true);
        
        const loser = player === this.player1 ? this.player2 : this.player1;
        loser.gameOverText.setVisible(true);
        
        this.battleOver = true;
        this.winner = player.manager.getPlayerId();
        
        this.showBattleResult();
    }

    private showBattleResult(): void {
        const centerX = (this.player1.boardOffsetX + this.player2.boardOffsetX + GAME_CONFIG.bottleWidth * GAME_CONFIG.cellSize) / 2;
        const centerY = this.player1.boardOffsetY + GAME_CONFIG.bottleHeight * GAME_CONFIG.cellSize / 2;
        
        this.resultText.setText(`玩家 ${this.winner} 获胜！\n\n按 R 重新开始\n按 M 返回菜单`);
        this.resultText.setVisible(true);
        
        this.tweens.add({
            targets: this.resultText,
            scale: { from: 0, to: 1 },
            duration: 500,
            ease: 'Back.easeOut'
        });
        
        this.cameras.main.flash(1000, 255, 215, 0);
    }

    private restartBattle(): void {
        this.battleOver = false;
        this.winner = 0;
        
        this.player1.gameOverText.setVisible(false);
        this.player1.winText.setVisible(false);
        this.player2.gameOverText.setVisible(false);
        this.player2.winText.setVisible(false);
        this.resultText.setVisible(false);
        
        this.player1.renderer.clear();
        this.player2.renderer.clear();
        
        this.player1.manager.startGame();
        this.player2.manager.startGame();
        
        this.audioManager.playBattleBGM();
    }

    private returnToMenu(): void {
        this.audioManager.stopAll();
        this.player1.renderer.destroy();
        this.player2.renderer.destroy();
        this.scene.start('MenuScene');
    }
}
