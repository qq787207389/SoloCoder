import { Cell, Capsule, CapsuleDirection, Color, CellType, LineMatch } from '../types/GameTypes';
import { COLORS, GAME_CONFIG } from '../config/GameConfig';
import { ParticleManager } from './ParticleManager';
import { MatchResult } from '../game/MatchResolver';

interface CellSprite {
    container: Phaser.GameObjects.Container;
    body?: any;
    eye?: Phaser.GameObjects.Rectangle;
    pupil?: Phaser.GameObjects.Rectangle;
    highlight?: Phaser.GameObjects.Rectangle;
    shine?: Phaser.GameObjects.Rectangle;
    originalX: number;
    originalY: number;
}

export class GameRenderer {
    private scene: Phaser.Scene;
    private offsetX: number;
    private offsetY: number;
    private cellSize: number;
    
    private bottleContainer: Phaser.GameObjects.Container;
    private boardSprites: Map<string, CellSprite> = new Map();
    private currentCapsuleContainer: Phaser.GameObjects.Container | null = null;
    private ghostCapsuleContainer: Phaser.GameObjects.Container | null = null;
    private nextCapsuleContainer: Phaser.GameObjects.Container | null = null;
    
    private particleManager: ParticleManager;
    private animatingCells: Set<string> = new Set();
    
    private virusAnimationTimer: number = 0;
    private virusWobbleOffset: Map<string, number> = new Map();

    constructor(scene: Phaser.Scene, offsetX: number, offsetY: number, cellSize: number = GAME_CONFIG.cellSize) {
        this.scene = scene;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.cellSize = cellSize;
        this.particleManager = new ParticleManager(scene);
        
        this.bottleContainer = this.scene.add.container(offsetX, offsetY);
        this.particleManager.createEmitters();
        
        this.createBottleBackground();
        this.initVirusWobbleOffsets();
    }

    private createBottleBackground(): void {
        const width = GAME_CONFIG.bottleWidth * this.cellSize;
        const height = GAME_CONFIG.bottleHeight * this.cellSize;
        
        const bg = this.scene.add.rectangle(
            width / 2,
            height / 2,
            width,
            height,
            COLORS.BOTTLE_BG
        );
        bg.setStrokeStyle(4, COLORS.BOTTLE_GLASS, 0.8);
        this.bottleContainer.add(bg);
        
        const gridGraphics = this.scene.add.graphics();
        gridGraphics.lineStyle(1, COLORS.BOTTLE_GLASS, 0.1);
        
        for (let x = 1; x < GAME_CONFIG.bottleWidth; x++) {
            gridGraphics.beginPath();
            gridGraphics.moveTo(x * this.cellSize, 0);
            gridGraphics.lineTo(x * this.cellSize, height);
            gridGraphics.stroke();
        }
        
        for (let y = 1; y < GAME_CONFIG.bottleHeight; y++) {
            gridGraphics.beginPath();
            gridGraphics.moveTo(0, y * this.cellSize);
            gridGraphics.lineTo(width, y * this.cellSize);
            gridGraphics.stroke();
        }
        
        this.bottleContainer.add(gridGraphics);
        
        const glassReflection = this.scene.add.rectangle(
            8,
            height / 2,
            4,
            height - 8,
            COLORS.BOTTLE_GLASS,
            0.2
        );
        glassReflection.setOrigin(0, 0.5);
        this.bottleContainer.add(glassReflection);
        
        const liquidWave = this.scene.add.graphics();
        this.bottleContainer.add(liquidWave);
        this.animateLiquidWave(liquidWave, height);
        
        const bottleNeck = this.scene.add.rectangle(
            width / 2,
            -8,
            width * 0.6,
            16,
            COLORS.BOTTLE_GLASS,
            0.5
        );
        bottleNeck.setStrokeStyle(2, COLORS.BOTTLE_GLASS, 0.8);
        this.bottleContainer.add(bottleNeck);
    }

    private animateLiquidWave(graphics: Phaser.GameObjects.Graphics, height: number): void {
        const updateWave = () => {
            graphics.clear();
            graphics.fillStyle(0x00ffff, 0.05);
            
            const waveHeight = 2;
            const waveWidth = GAME_CONFIG.bottleWidth * this.cellSize;
            const baseY = height * 0.95;
            const time = this.scene.time.now / 500;
            
            graphics.beginPath();
            graphics.moveTo(0, height);
            
            for (let x = 0; x <= waveWidth; x += 2) {
                const y = baseY + Math.sin((x / 20) + time) * waveHeight;
                graphics.lineTo(x, y);
            }
            
            graphics.lineTo(waveWidth, height);
            graphics.closePath();
            graphics.fill();
        };
        
        this.scene.time.addEvent({
            delay: 50,
            callback: updateWave,
            loop: true
        });
    }

    private initVirusWobbleOffsets(): void {
        for (let y = 0; y < GAME_CONFIG.bottleHeight; y++) {
            for (let x = 0; x < GAME_CONFIG.bottleWidth; x++) {
                const key = `${x},${y}`;
                this.virusWobbleOffset.set(key, Math.random() * Math.PI * 2);
            }
        }
    }

    public updateBoard(board: Cell[][]): void {
        for (let y = 0; y < GAME_CONFIG.bottleHeight; y++) {
            for (let x = 0; x < GAME_CONFIG.bottleWidth; x++) {
                const cell = board[y][x];
                const key = `${x},${y}`;
                
                if (cell.type === CellType.EMPTY) {
                    this.removeCellSprite(key);
                } else {
                    this.updateCellSprite(x, y, cell);
                }
            }
        }
    }

    private updateCellSprite(x: number, y: number, cell: Cell): void {
        const key = `${x},${y}`;
        const worldX = x * this.cellSize + this.cellSize / 2;
        const worldY = y * this.cellSize + this.cellSize / 2;
        
        if (this.animatingCells.has(key)) {
            return;
        }
        
        let sprite = this.boardSprites.get(key);
        
        if (!sprite) {
            sprite = this.createCellSprite(cell);
            sprite.container.setPosition(worldX, worldY - this.cellSize);
            this.bottleContainer.add(sprite.container);
            this.boardSprites.set(key, sprite);
            
            this.scene.tweens.add({
                targets: sprite.container,
                y: worldY,
                duration: 150,
                ease: 'Bounce.easeOut'
            });
        }
        
        sprite.originalX = worldX;
        sprite.originalY = worldY;
        
        if (cell.isMarkedForRemoval) {
            this.animateCellRemoval(x, y, cell);
        } else if (cell.isFalling) {
            this.animateCellFalling(x, y, sprite);
        } else if (cell.type === CellType.VIRUS) {
            this.animateVirusIdle(x, y, sprite);
        }
        
        this.updateCellAppearance(sprite, cell);
    }

    private createCellSprite(cell: Cell): CellSprite {
        const container = this.scene.add.container(0, 0);
        const size = this.cellSize - 2;
        const color = this.getColorValue(cell.color);
        
        let body: Phaser.GameObjects.Rectangle | undefined;
        let eye: Phaser.GameObjects.Rectangle | undefined;
        let pupil: Phaser.GameObjects.Rectangle | undefined;
        let highlight: Phaser.GameObjects.Rectangle | undefined;
        let shine: Phaser.GameObjects.Rectangle | undefined;
        
        if (cell.type === CellType.VIRUS) {
            body = this.scene.add.circle(0, 0, size / 2, color) as any;
            body!.setStrokeStyle(2, 0x000000, 0.8);
            
            eye = this.scene.add.rectangle(-6, -2, 8, 10, 0xffffff);
            pupil = this.scene.add.rectangle(-5, -1, 4, 6, 0x000000);
            
            const eye2 = this.scene.add.rectangle(6, -2, 8, 10, 0xffffff);
            const pupil2 = this.scene.add.rectangle(7, -1, 4, 6, 0x000000);
            
            highlight = this.scene.add.rectangle(-4, -size / 3, 6, 4, 0xffffff, 0.5);
            
            container.add([body!, eye!, eye2, pupil!, pupil2, highlight!]);
        } else if (cell.type === CellType.CAPSULE_HALF) {
            body = this.scene.add.rectangle(0, 0, size, size, color);
            body.setStrokeStyle(2, 0x000000, 0.5);
            
            highlight = this.scene.add.rectangle(-size / 4, -size / 4, size / 2, size / 4, 0xffffff, 0.4);
            shine = this.scene.add.rectangle(size / 4, size / 4, size / 3, 2, 0x000000, 0.3);
            
            container.add([body, highlight, shine]);
        } else if (cell.type === CellType.GARBAGE) {
            body = this.scene.add.rectangle(0, 0, size, size, COLORS.GRAY);
            body.setStrokeStyle(2, 0x000000, 0.8);
            
            const line1 = this.scene.add.line(0, -5, -10, 0, 10, 0, 0x000000, 0.5);
            const line2 = this.scene.add.line(0, 0, -10, 0, 10, 0, 0x000000, 0.5);
            const line3 = this.scene.add.line(0, 5, -10, 0, 10, 0, 0x000000, 0.5);
            
            container.add([body, line1, line2, line3]);
        }
        
        return { container, body, eye, pupil, highlight, shine, originalX: 0, originalY: 0 };
    }

    private updateCellAppearance(sprite: CellSprite, cell: Cell): void {
        if (sprite.body && cell.type !== CellType.EMPTY) {
            const color = this.getColorValue(cell.color);
            (sprite.body as Phaser.GameObjects.Rectangle).fillColor = color;
        }
    }

    private animateVirusIdle(x: number, y: number, sprite: CellSprite): void {
        const time = this.scene.time.now / 300;
        const offset = this.virusWobbleOffset.get(`${x},${y}`) || 0;
        const wobble = Math.sin(time + offset) * 2;
        
        sprite.container.y = sprite.originalY + wobble;
        
        if (sprite.pupil) {
            const lookX = Math.sin(time * 0.5) * 2;
            sprite.pupil.x = -5 + lookX;
        }
    }

    private animateCellFalling(x: number, y: number, sprite: CellSprite): void {
        const targetY = y * this.cellSize + this.cellSize / 2;
        
        this.scene.tweens.add({
            targets: sprite.container,
            y: targetY,
            duration: 100,
            ease: 'Linear'
        });
    }

    private animateCellRemoval(x: number, y: number, cell: Cell): void {
        const key = `${x},${y}`;
        const sprite = this.boardSprites.get(key);
        
        if (!sprite) return;
        
        this.animatingCells.add(key);
        
        const worldX = this.offsetX + x * this.cellSize + this.cellSize / 2;
        const worldY = this.offsetY + y * this.cellSize + this.cellSize / 2;
        
        if (cell.type === CellType.VIRUS) {
            if (sprite.eye) sprite.eye.fillColor = 0x000000;
            if (sprite.pupil) sprite.pupil.setVisible(false);
            
            this.particleManager.emitVirusDestroyed(worldX, worldY, cell.color);
        } else {
            this.particleManager.emitClearParticles(worldX, worldY, cell.color);
        }
        
        this.scene.tweens.add({
            targets: sprite.container,
            alpha: 0,
            scale: 1.5,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                this.removeCellSprite(key);
                this.animatingCells.delete(key);
            }
        });
    }

    private removeCellSprite(key: string): void {
        const sprite = this.boardSprites.get(key);
        if (sprite) {
            sprite.container.destroy();
            this.boardSprites.delete(key);
        }
    }

    public updateCurrentCapsule(capsule: Capsule | null, ghostY: number): void {
        if (this.currentCapsuleContainer) {
            this.currentCapsuleContainer.destroy();
            this.currentCapsuleContainer = null;
        }
        
        if (this.ghostCapsuleContainer) {
            this.ghostCapsuleContainer.destroy();
            this.ghostCapsuleContainer = null;
        }
        
        if (!capsule) return;
        
        this.ghostCapsuleContainer = this.createCapsuleSprite(capsule, ghostY, 0.2);
        this.bottleContainer.add(this.ghostCapsuleContainer);
        
        this.currentCapsuleContainer = this.createCapsuleSprite(capsule, capsule.y, 1);
        this.bottleContainer.add(this.currentCapsuleContainer);
        
        this.addCapsuleTrail(capsule);
    }

    private createCapsuleSprite(capsule: Capsule, y: number, alpha: number): Phaser.GameObjects.Container {
        const container = this.scene.add.container(0, 0);
        const size = this.cellSize - 2;
        const color1 = this.getColorValue(capsule.color1);
        const color2 = this.getColorValue(capsule.color2);
        
        if (capsule.direction === CapsuleDirection.HORIZONTAL) {
            const half1 = this.createCapsuleHalf(color1, -size / 2 - 1, 0, size, alpha);
            const half2 = this.createCapsuleHalf(color2, size / 2 + 1, 0, size, alpha);
            
            const connector = this.scene.add.rectangle(0, 0, 4, size * 0.8, 
                (color1 + color2) / 2, alpha * 0.8);
            connector.setStrokeStyle(2, 0x000000, alpha * 0.5);
            
            container.add([half1, half2, connector]);
        } else {
            const half1 = this.createCapsuleHalf(color1, 0, -size / 2 - 1, size, alpha);
            const half2 = this.createCapsuleHalf(color2, 0, size / 2 + 1, size, alpha);
            
            const connector = this.scene.add.rectangle(0, 0, size * 0.8, 4, 
                (color1 + color2) / 2, alpha * 0.8);
            connector.setStrokeStyle(2, 0x000000, alpha * 0.5);
            
            container.add([half1, half2, connector]);
        }
        
        const x = capsule.x * this.cellSize + this.cellSize / 2;
        const yPos = y * this.cellSize + this.cellSize / 2;
        
        container.setPosition(x, yPos);
        container.setAlpha(alpha);
        
        return container;
    }

    private createCapsuleHalf(color: number, x: number, y: number, size: number, alpha: number): Phaser.GameObjects.Container {
        const half = this.scene.add.container(x, y);
        
        const body = this.scene.add.rectangle(0, 0, size, size, color, alpha);
        body.setStrokeStyle(2, 0x000000, alpha * 0.5);
        
        const highlight = this.scene.add.rectangle(-size / 4, -size / 4, size / 2, size / 4, 0xffffff, alpha * 0.4);
        const shine = this.scene.add.rectangle(size / 4, size / 4, size / 3, 2, 0x000000, alpha * 0.3);
        
        half.add([body, highlight, shine]);
        return half;
    }

    private addCapsuleTrail(capsule: Capsule): void {
        const x = capsule.x * this.cellSize + this.cellSize;
        const y = capsule.y * this.cellSize + this.cellSize / 2;
        const color = this.getColorValue(capsule.color1);
        
        const trail = this.scene.add.circle(x, y, 4, color, 0.3);
        trail.setBlendMode('ADD');
        
        this.scene.tweens.add({
            targets: trail,
            alpha: 0,
            scale: 0,
            duration: 200,
            onComplete: () => trail.destroy()
        });
    }

    public updateNextCapsule(capsule: Capsule | null, x: number, y: number): void {
        if (this.nextCapsuleContainer) {
            this.nextCapsuleContainer.destroy();
            this.nextCapsuleContainer = null;
        }
        
        if (!capsule) return;
        
        const previewSize = this.cellSize * 0.7;
        const container = this.scene.add.container(x, y);
        
        const size = previewSize - 2;
        const color1 = this.getColorValue(capsule.color1);
        const color2 = this.getColorValue(capsule.color2);
        
        const half1 = this.scene.add.rectangle(-size / 2 - 1, 0, size, size, color1);
        half1.setStrokeStyle(2, 0x000000, 0.5);
        
        const half2 = this.scene.add.rectangle(size / 2 + 1, 0, size, size, color2);
        half2.setStrokeStyle(2, 0x000000, 0.5);
        
        const connector = this.scene.add.rectangle(0, 0, 4, size * 0.8, (color1 + color2) / 2, 0.8);
        
        container.add([half1, half2, connector]);
        this.nextCapsuleContainer = container;
    }

    public animateMatchResult(result: MatchResult, boardOffsetX: number, boardOffsetY: number): void {
        result.matches.forEach((match, index) => {
            this.scene.time.delayedCall(index * 50, () => {
                match.cells.forEach(({ x, y }) => {
                    const worldX = boardOffsetX + x * this.cellSize + this.cellSize / 2;
                    const worldY = boardOffsetY + y * this.cellSize + this.cellSize / 2;
                    
                    const flash = this.scene.add.rectangle(worldX, worldY, this.cellSize, this.cellSize, 0xffffff, 0.8);
                    flash.setBlendMode('ADD');
                    
                    this.scene.tweens.add({
                        targets: flash,
                        alpha: 0,
                        scale: 1.2,
                        duration: 150,
                        yoyo: true,
                        repeat: 1,
                        onComplete: () => flash.destroy()
                    });
                });
            });
        });
    }

    public animateChain(chainLevel: number, centerX: number, centerY: number): void {
        const width = GAME_CONFIG.bottleWidth * this.cellSize;
        const height = GAME_CONFIG.bottleHeight * this.cellSize;
        
        this.particleManager.emitChainFlash(centerX + width / 2, centerY + height / 2, width, height);
        this.particleManager.emitChainText(centerX + width / 2, centerY + height / 2, chainLevel);
        
        this.scene.cameras.main.shake(200, 0.01 * chainLevel);
    }

    public animateLand(x: number, y: number): void {
        const worldX = this.offsetX + x * this.cellSize + this.cellSize / 2;
        const worldY = this.offsetY + y * this.cellSize + this.cellSize / 2;
        this.particleManager.emitLandParticles(worldX, worldY);
        
        const bounce = this.scene.add.rectangle(worldX, worldY, this.cellSize - 2, this.cellSize - 2, 0xffffff, 0.3);
        bounce.setBlendMode('ADD');
        
        this.scene.tweens.add({
            targets: bounce,
            scaleY: 0.5,
            scaleX: 1.2,
            alpha: 0,
            duration: 150,
            ease: 'Power2',
            onComplete: () => bounce.destroy()
        });
    }

    public emitScore(x: number, y: number, score: number, isChain: boolean): void {
        const worldX = this.offsetX + x * this.cellSize + this.cellSize / 2;
        const worldY = this.offsetY + y * this.cellSize;
        this.particleManager.emitScorePopup(worldX, worldY, score, isChain);
    }

    private getColorValue(color: Color): number {
        switch (color) {
            case Color.RED: return COLORS.RED;
            case Color.BLUE: return COLORS.BLUE;
            case Color.YELLOW: return COLORS.YELLOW;
            case Color.GRAY: return COLORS.GRAY;
            default: return 0xffffff;
        }
    }

    public clear(): void {
        this.boardSprites.forEach(sprite => sprite.container.destroy());
        this.boardSprites.clear();
        this.animatingCells.clear();
        
        if (this.currentCapsuleContainer) {
            this.currentCapsuleContainer.destroy();
            this.currentCapsuleContainer = null;
        }
        
        if (this.ghostCapsuleContainer) {
            this.ghostCapsuleContainer.destroy();
            this.ghostCapsuleContainer = null;
        }
        
        if (this.nextCapsuleContainer) {
            this.nextCapsuleContainer.destroy();
            this.nextCapsuleContainer = null;
        }
    }

    public destroy(): void {
        this.clear();
        this.bottleContainer.destroy();
        this.particleManager.destroy();
    }

    public getOffsetX(): number {
        return this.offsetX;
    }

    public getOffsetY(): number {
        return this.offsetY;
    }
}
