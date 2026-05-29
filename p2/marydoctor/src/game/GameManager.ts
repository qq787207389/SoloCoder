import { GameState, AnimationState, GarbageBlock, Capsule } from '../types/GameTypes';
import { GameBoard } from './GameBoard';
import { CapsuleController } from './CapsuleController';
import { VirusGenerator } from './VirusGenerator';
import { MatchResolver, MatchResult } from './MatchResolver';
import { GAME_CONFIG } from '../config/GameConfig';

export enum GamePhase {
    IDLE = 'idle',
    SPAWNING = 'spawning',
    PLAYING = 'playing',
    MATCHING = 'matching',
    FALLING = 'falling',
    GAME_OVER = 'game_over',
    WIN = 'win'
}

export class GameManager {
    private playerId: number;
    private gameBoard: GameBoard;
    private capsuleController: CapsuleController;
    private virusGenerator: VirusGenerator;
    private matchResolver: MatchResolver;
    
    private gameState: GameState;
    private animationState: AnimationState;
    private phase: GamePhase = GamePhase.IDLE;
    
    private pendingGarbage: GarbageBlock[] = [];
    private onMatchCallback?: (result: MatchResult) => void;
    private onChainCallback?: (chainLevel: number) => void;
    private onGameOverCallback?: () => void;
    private onWinCallback?: () => void;
    private onGarbageToSendCallback?: (count: number) => void;

    constructor(playerId: number, virusCount: number = GAME_CONFIG.initialVirusCount) {
        this.playerId = playerId;
        this.gameBoard = new GameBoard();
        this.capsuleController = new CapsuleController(this.gameBoard);
        this.virusGenerator = new VirusGenerator(this.gameBoard);
        this.matchResolver = new MatchResolver(this.gameBoard);
        
        this.gameState = {
            score: 0,
            level: 1,
            virusesRemaining: virusCount,
            combo: 0,
            isGameOver: false,
            isPaused: false,
            isWin: false
        };
        
        this.animationState = {
            isAnimating: false,
            isClearing: false,
            isFalling: false
        };
        
        this.capsuleController.setOnCapsuleLanded(this.onCapsuleLanded.bind(this));
        this.capsuleController.setOnGameOver(this.onCapsuleGameOver.bind(this));
    }

    private onCapsuleGameOver(): void {
        this.phase = GamePhase.GAME_OVER;
        this.gameState.isGameOver = true;
        if (this.onGameOverCallback) {
            this.onGameOverCallback();
        }
    }

    public startGame(): void {
        this.reset();
        this.virusGenerator.generateViruses(this.gameState.virusesRemaining);
        this.phase = GamePhase.SPAWNING;
        this.spawnCapsule();
    }

    public reset(): void {
        this.gameBoard.reset();
        this.capsuleController.reset();
        this.matchResolver.resetChain();
        this.pendingGarbage = [];
        this.phase = GamePhase.IDLE;
        
        this.gameState = {
            score: 0,
            level: 1,
            virusesRemaining: GAME_CONFIG.initialVirusCount,
            combo: 0,
            isGameOver: false,
            isPaused: false,
            isWin: false
        };
        
        this.animationState = {
            isAnimating: false,
            isClearing: false,
            isFalling: false
        };
    }

    private spawnCapsule(): void {
        this.addPendingGarbage();

        if (this.gameBoard.isGameOver()) {
            this.phase = GamePhase.GAME_OVER;
            this.gameState.isGameOver = true;
            if (this.onGameOverCallback) {
                this.onGameOverCallback();
            }
            return;
        }

        const success = this.capsuleController.spawnNewCapsule();
        if (!success) {
            this.phase = GamePhase.GAME_OVER;
            this.gameState.isGameOver = true;
            if (this.onGameOverCallback) {
                this.onGameOverCallback();
            }
            return;
        }

        this.phase = GamePhase.PLAYING;
    }

    private addPendingGarbage(): void {
        if (this.pendingGarbage.length === 0) return;

        const garbageToAdd = this.pendingGarbage.shift();
        if (garbageToAdd) {
            const positions = this.virusGenerator.generateGarbagePositions(garbageToAdd.count);
            positions.forEach(pos => {
                this.gameBoard.placeGarbage(pos.x, pos.y);
            });
        }
    }

    private onCapsuleLanded(capsule: Capsule): void {
        if (this.phase !== GamePhase.PLAYING) return;
        
        this.phase = GamePhase.MATCHING;
        this.processMatches();
    }

    private async processMatches(): Promise<void> {
        const result = this.matchResolver.resolveMatches();
        
        if (!result) {
            this.matchResolver.resetChain();
            this.spawnCapsule();
            return;
        }

        this.gameState.score += result.score;
        this.gameState.virusesRemaining -= result.virusesRemoved;

        if (result.isChain && this.onChainCallback) {
            this.onChainCallback(result.chainLevel);
        }

        if (this.onMatchCallback) {
            this.onMatchCallback(result);
        }

        const garbageToSend = result.virusesRemoved + Math.floor(result.capsulesRemoved / 2);
        if (garbageToSend > 0 && this.onGarbageToSendCallback) {
            this.onGarbageToSendCallback(garbageToSend);
        }

        if (this.gameState.virusesRemaining <= 0) {
            this.phase = GamePhase.WIN;
            this.gameState.isWin = true;
            if (this.onWinCallback) {
                this.onWinCallback();
            }
            return;
        }

        await this.delay(300);
        
        this.matchResolver.removeMatchedCells();
        
        this.phase = GamePhase.FALLING;
        await this.processFalling();
    }

    private async processFalling(): Promise<void> {
        let hasFallen = this.matchResolver.applyGravity();
        
        while (hasFallen) {
            await this.delay(100);
            this.matchResolver.clearFallingFlags();
            hasFallen = this.matchResolver.applyGravity();
        }

        await this.delay(200);

        if (this.matchResolver.hasMoreMatches()) {
            this.phase = GamePhase.MATCHING;
            this.processMatches();
        } else {
            this.matchResolver.resetChain();
            this.spawnCapsule();
        }
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    public update(deltaTime: number): void {
        if (this.phase === GamePhase.PLAYING && !this.gameState.isPaused) {
            this.capsuleController.update(deltaTime);
        }
    }

    public moveLeft(): boolean {
        if (this.phase !== GamePhase.PLAYING) return false;
        return this.capsuleController.moveLeft();
    }

    public moveRight(): boolean {
        if (this.phase !== GamePhase.PLAYING) return false;
        return this.capsuleController.moveRight();
    }

    public moveDown(): boolean {
        if (this.phase !== GamePhase.PLAYING) return false;
        return this.capsuleController.moveDown();
    }

    public rotateClockwise(): boolean {
        if (this.phase !== GamePhase.PLAYING) return false;
        return this.capsuleController.rotateClockwise();
    }

    public rotateCounterClockwise(): boolean {
        if (this.phase !== GamePhase.PLAYING) return false;
        return this.capsuleController.rotateCounterClockwise();
    }

    public hardDrop(): void {
        if (this.phase !== GamePhase.PLAYING) return;
        this.capsuleController.hardDrop();
    }

    public setFastFalling(fast: boolean): void {
        this.capsuleController.setFastFalling(fast);
    }

    public addGarbage(count: number): void {
        const colors = [1, 2, 3];
        this.pendingGarbage.push({
            count,
            color: colors[Math.floor(Math.random() * colors.length)]
        });
    }

    public getGameBoard(): GameBoard {
        return this.gameBoard;
    }

    public getCapsuleController(): CapsuleController {
        return this.capsuleController;
    }

    public getGameState(): GameState {
        return { ...this.gameState };
    }

    public getPhase(): GamePhase {
        return this.phase;
    }

    public getPlayerId(): number {
        return this.playerId;
    }

    public setOnMatch(callback: (result: MatchResult) => void): void {
        this.onMatchCallback = callback;
    }

    public setOnChain(callback: (chainLevel: number) => void): void {
        this.onChainCallback = callback;
    }

    public setOnGameOver(callback: () => void): void {
        this.onGameOverCallback = callback;
    }

    public setOnWin(callback: () => void): void {
        this.onWinCallback = callback;
    }

    public setOnGarbageToSend(callback: (count: number) => void): void {
        this.onGarbageToSendCallback = callback;
    }

    public togglePause(): void {
        this.gameState.isPaused = !this.gameState.isPaused;
    }

    public isPaused(): boolean {
        return this.gameState.isPaused;
    }

    public isGameOver(): boolean {
        return this.phase === GamePhase.GAME_OVER;
    }

    public isWin(): boolean {
        return this.phase === GamePhase.WIN;
    }

    public getGhostY(): number {
        return this.capsuleController.getGhostY();
    }
}
