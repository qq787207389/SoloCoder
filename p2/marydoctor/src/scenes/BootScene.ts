import Phaser from 'phaser';
import { AudioManager } from '../audio/AudioManager';

export class BootScene extends Phaser.Scene {
    private audioManager!: AudioManager;

    constructor() {
        super({ key: 'BootScene' });
    }

    preload(): void {
        this.audioManager = new AudioManager(this);
        this.audioManager.preload();
    }

    create(): void {
        this.audioManager.createSounds();
        this.registry.set('audioManager', this.audioManager);
        
        this.createPixelTextures();
        
        this.scene.start('MenuScene');
    }

    private createPixelTextures(): void {
        const graphics = this.make.graphics({ add: false } as any);
        
        graphics.fillStyle(0xff4444, 1);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('capsule_red', 32, 32);
        
        graphics.clear();
        graphics.fillStyle(0x4488ff, 1);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('capsule_blue', 32, 32);
        
        graphics.clear();
        graphics.fillStyle(0xffdd44, 1);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('capsule_yellow', 32, 32);
        
        graphics.clear();
        graphics.fillStyle(0xff4444, 1);
        graphics.fillCircle(16, 16, 14);
        graphics.generateTexture('virus_red', 32, 32);
        
        graphics.clear();
        graphics.fillStyle(0x4488ff, 1);
        graphics.fillCircle(16, 16, 14);
        graphics.generateTexture('virus_blue', 32, 32);
        
        graphics.clear();
        graphics.fillStyle(0xffdd44, 1);
        graphics.fillCircle(16, 16, 14);
        graphics.generateTexture('virus_yellow', 32, 32);
        
        graphics.clear();
        graphics.fillStyle(0x888888, 1);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('garbage', 32, 32);
        
        graphics.destroy();
    }
}
