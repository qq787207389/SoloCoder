import { Color } from '../types/GameTypes';
import { COLORS, GAME_CONFIG } from '../config/GameConfig';

export class ParticleManager {
    private scene: Phaser.Scene;
    private particles: Phaser.GameObjects.Particles.ParticleEmitter[] = [];

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    public createEmitters(): void {
        const colors = [COLORS.RED, COLORS.BLUE, COLORS.YELLOW];
        
        colors.forEach(color => {
            const textureKey = `particle_${color}`;
            this.createParticleTexture(textureKey, color);
            
            const emitter = this.scene.add.particles(0, 0, textureKey, {
                lifespan: 800,
                speed: { min: 50, max: 150 },
                angle: { min: -90, max: -45 },
                gravityY: 200,
                scale: { start: 1, end: 0 },
                quantity: 0,
                blendMode: Phaser.BlendModes.ADD
            });
            
            this.particles.push(emitter);
        });

        const sparkleEmitter = this.scene.add.particles(0, 0, this.createSparkleTexture(), {
            lifespan: 600,
            speed: { min: 30, max: 80 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 0 },
            quantity: 0,
            blendMode: Phaser.BlendModes.ADD
        });
        this.particles.push(sparkleEmitter);
    }

    private createParticleTexture(key: string, color: number): void {
        const graphics = this.scene.make.graphics({ add: false } as any);
        graphics.fillStyle(color, 1);
        graphics.fillRect(0, 0, 8, 8);
        graphics.generateTexture(key, 8, 8);
        graphics.destroy();
    }

    private createSparkleTexture(): string {
        const graphics = this.scene.make.graphics({ add: false } as any);
        graphics.fillStyle(0xffffff, 1);
        graphics.fillRect(0, 0, 4, 4);
        graphics.generateTexture('sparkle', 4, 4);
        graphics.destroy();
        return 'sparkle';
    }

    public emitClearParticles(x: number, y: number, color: Color): void {
        const colorHex = this.getColorHex(color);
        const emitterIndex = [COLORS.RED, COLORS.BLUE, COLORS.YELLOW].indexOf(colorHex);
        
        if (emitterIndex >= 0 && emitterIndex < this.particles.length - 1) {
            const emitter = this.particles[emitterIndex];
            emitter.emitParticleAt(x, y, 8);
        }
    }

    public emitVirusDestroyed(x: number, y: number, color: Color): void {
        const colorHex = this.getColorHex(color);
        const emitterIndex = [COLORS.RED, COLORS.BLUE, COLORS.YELLOW].indexOf(colorHex);
        
        if (emitterIndex >= 0 && emitterIndex < this.particles.length - 1) {
            const emitter = this.particles[emitterIndex];
            emitter.emitParticleAt(x, y, 15);
        }
        
        const sparkleEmitter = this.particles[this.particles.length - 1];
        sparkleEmitter.emitParticleAt(x, y, 10);
    }

    public emitLandParticles(x: number, y: number): void {
        const sparkleEmitter = this.particles[this.particles.length - 1];
        sparkleEmitter.emitParticleAt(x, y + GAME_CONFIG.cellSize / 2, 5);
    }

    public emitChainFlash(centerX: number, centerY: number, width: number, height: number): void {
        const flash = this.scene.add.rectangle(centerX, centerY, width, height, 0xffffff, 0.8);
        flash.setBlendMode('ADD');
        
        this.scene.tweens.add({
            targets: flash,
            alpha: 0,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                flash.destroy();
            }
        });
    }

    public emitScorePopup(x: number, y: number, score: number, isChain: boolean = false): void {
        const text = this.scene.add.text(x, y, `+${score}`, {
            fontFamily: 'monospace',
            fontSize: isChain ? '24px' : '16px',
            color: isChain ? '#ffff00' : '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        });
        text.setOrigin(0.5);
        text.setScrollFactor(0);

        this.scene.tweens.add({
            targets: text,
            y: y - 50,
            alpha: 0,
            scale: isChain ? 1.5 : 1.2,
            duration: 800,
            ease: 'Power2',
            onComplete: () => {
                text.destroy();
            }
        });
    }

    public emitChainText(x: number, y: number, chainLevel: number): void {
        const text = this.scene.add.text(x, y, `CHAIN x${chainLevel}!`, {
            fontFamily: 'monospace',
            fontSize: '32px',
            color: '#ffff00',
            stroke: '#ff6600',
            strokeThickness: 4
        });
        text.setOrigin(0.5);
        text.setScale(0);
        text.setScrollFactor(0);

        this.scene.tweens.add({
            targets: text,
            scale: { from: 0, to: 1.5 },
            duration: 300,
            ease: 'Back.easeOut',
            yoyo: true,
            hold: 500,
            onComplete: () => {
                text.destroy();
            }
        });
    }

    private getColorHex(color: Color): number {
        switch (color) {
            case Color.RED: return COLORS.RED;
            case Color.BLUE: return COLORS.BLUE;
            case Color.YELLOW: return COLORS.YELLOW;
            default: return 0xffffff;
        }
    }

    public destroy(): void {
        this.particles.forEach(emitter => emitter.destroy());
        this.particles = [];
    }
}
