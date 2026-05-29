import { Capsule, Color, CapsuleDirection } from '../types/GameTypes';
import { GameBoard } from './GameBoard';
import { GAME_CONFIG } from '../config/GameConfig';

export class CapsuleController {
    private gameBoard: GameBoard;
    private currentCapsule: Capsule | null = null;
    private nextCapsule: Capsule | null = null;
    private capsuleIdCounter: number = 0;
    private gravityTimer: number = 0;
    private isFastFalling: boolean = false;
    private lastMoveCooldown: number = 0;
    private onCapsuleLandedCallback?: (capsule: Capsule) => void;
    private onGameOverCallback?: () => void;

    constructor(gameBoard: GameBoard) {
        this.gameBoard = gameBoard;
    }

    public setOnCapsuleLanded(callback: (capsule: Capsule) => void): void {
        this.onCapsuleLandedCallback = callback;
    }

    public setOnGameOver(callback: () => void): void {
        this.onGameOverCallback = callback;
    }

    public generateRandomCapsule(): Capsule {
        const colors = [Color.RED, Color.BLUE, Color.YELLOW];
        const color1 = colors[Math.floor(Math.random() * colors.length)];
        let color2 = colors[Math.floor(Math.random() * colors.length)];
        
        return {
            id: this.capsuleIdCounter++,
            x: Math.floor(this.gameBoard.getWidth() / 2) - 1,
            y: -1,
            color1,
            color2,
            direction: CapsuleDirection.HORIZONTAL
        };
    }

    public spawnNewCapsule(): boolean {
        this.currentCapsule = this.nextCapsule || this.generateRandomCapsule();
        this.nextCapsule = this.generateRandomCapsule();

        return this.gameBoard.canPlaceCapsule(this.currentCapsule);
    }

    public getCurrentCapsule(): Capsule | null {
        return this.currentCapsule;
    }

    public getNextCapsule(): Capsule | null {
        return this.nextCapsule;
    }

    public moveLeft(): boolean {
        if (!this.currentCapsule) return false;
        if (this.gameBoard.canMoveCapsule(this.currentCapsule, -1, 0)) {
            this.currentCapsule.x--;
            return true;
        }
        return false;
    }

    public moveRight(): boolean {
        if (!this.currentCapsule) return false;
        if (this.currentCapsule.direction === CapsuleDirection.HORIZONTAL) {
            if (this.gameBoard.canMoveCapsule(this.currentCapsule, 1, 0)) {
                this.currentCapsule.x++;
                return true;
            }
        } else {
            if (this.gameBoard.canMoveCapsule(this.currentCapsule, 1, 0)) {
                this.currentCapsule.x++;
                return true;
            }
        }
        return false;
    }

    public moveDown(): boolean {
        if (!this.currentCapsule) return false;
        if (this.gameBoard.canMoveCapsule(this.currentCapsule, 0, 1)) {
            this.currentCapsule.y++;
            return true;
        }
        return false;
    }

    public rotateClockwise(): boolean {
        if (!this.currentCapsule) return false;
        if (this.gameBoard.canRotateCapsule(this.currentCapsule, true)) {
            this.currentCapsule = this.gameBoard.getRotatedCapsule(this.currentCapsule, true);
            return true;
        }
        return false;
    }

    public rotateCounterClockwise(): boolean {
        if (!this.currentCapsule) return false;
        if (this.gameBoard.canRotateCapsule(this.currentCapsule, false)) {
            this.currentCapsule = this.gameBoard.getRotatedCapsule(this.currentCapsule, false);
            return true;
        }
        return false;
    }

    public hardDrop(): void {
        if (!this.currentCapsule) return;
        
        while (this.moveDown()) {
        }
        
        this.landCapsule();
    }

    public setFastFalling(fast: boolean): void {
        this.isFastFalling = fast;
    }

    public update(deltaTime: number): boolean {
        if (!this.currentCapsule) return false;

        const interval = this.isFastFalling ? GAME_CONFIG.fastGravityInterval : GAME_CONFIG.gravityInterval;
        this.gravityTimer += deltaTime;

        if (this.gravityTimer >= interval) {
            this.gravityTimer = 0;
            
            if (!this.moveDown()) {
                this.landCapsule();
                return true;
            }
        }

        return false;
    }

    private landCapsule(): void {
        if (this.currentCapsule) {
            if (this.currentCapsule.y < 0) {
                this.currentCapsule = null;
                if (this.onGameOverCallback) {
                    this.onGameOverCallback();
                }
                return;
            }
            this.gameBoard.placeCapsule(this.currentCapsule);
            if (this.onCapsuleLandedCallback) {
                this.onCapsuleLandedCallback(this.currentCapsule);
            }
            this.currentCapsule = null;
        }
    }

    public reset(): void {
        this.currentCapsule = null;
        this.nextCapsule = null;
        this.gravityTimer = 0;
        this.isFastFalling = false;
    }

    public getGhostY(): number {
        if (!this.currentCapsule) return 0;
        
        let ghostY = this.currentCapsule.y;
        const testCapsule = { ...this.currentCapsule };
        
        while (this.gameBoard.canMoveCapsule(testCapsule, 0, 1)) {
            testCapsule.y++;
            ghostY++;
        }
        
        return ghostY;
    }

    public hasActiveCapsule(): boolean {
        return this.currentCapsule !== null;
    }
}
