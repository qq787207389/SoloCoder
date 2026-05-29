import Phaser from 'phaser';
import { AudioManager } from '../audio/AudioManager';
import { COLORS } from '../config/GameConfig';

export class MenuScene extends Phaser.Scene {
    private audioManager!: AudioManager;
    private selectedIndex: number = 0;
    private menuItems: string[] = ['单人模式', '双人对战', '游戏说明'];
    private menuTexts: Phaser.GameObjects.Text[] = [];
    private titleText!: Phaser.GameObjects.Text;
    private controls: { [key: string]: Phaser.Input.Keyboard.Key } = {};

    constructor() {
        super({ key: 'MenuScene' });
    }

    create(): void {
        this.audioManager = this.registry.get('audioManager');
        this.audioManager.stopAll();
        
        this.createBackground();
        this.createTitle();
        this.createMenu();
        this.createControls();
    }

    private createBackground(): void {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const bg = this.add.rectangle(width / 2, height / 2, width, height, COLORS.BACKGROUND);
        bg.setScrollFactor(0);
        
        const gridGraphics = this.add.graphics();
        gridGraphics.lineStyle(1, COLORS.BOTTLE_GLASS, 0.1);
        
        for (let x = 0; x < width; x += 32) {
            gridGraphics.beginPath();
            gridGraphics.moveTo(x, 0);
            gridGraphics.lineTo(x, height);
            gridGraphics.stroke();
        }
        
        for (let y = 0; y < height; y += 32) {
            gridGraphics.beginPath();
            gridGraphics.moveTo(0, y);
            gridGraphics.lineTo(width, y);
            gridGraphics.stroke();
        }
        
        this.createFloatingViruses();
    }

    private createFloatingViruses(): void {
        const colors = [COLORS.RED, COLORS.BLUE, COLORS.YELLOW];
        
        for (let i = 0; i < 15; i++) {
            const x = Math.random() * this.cameras.main.width;
            const y = Math.random() * this.cameras.main.height;
            const size = 8 + Math.random() * 16;
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            const virus = this.add.circle(x, y, size, color, 0.1);
            virus.setStrokeStyle(1, color, 0.3);
            
            const eye1 = this.add.rectangle(x - size * 0.3, y - size * 0.1, size * 0.2, size * 0.3, 0xffffff, 0.2);
            const eye2 = this.add.rectangle(x + size * 0.3, y - size * 0.1, size * 0.2, size * 0.3, 0xffffff, 0.2);
            
            this.tweens.add({
                targets: virus,
                y: y + 20,
                x: x + Math.sin(Math.random() * Math.PI) * 30,
                duration: 3000 + Math.random() * 2000,
                ease: 'Sine.easeInOut',
                yoyo: true,
                loop: -1
            });
        }
    }

    private createTitle(): void {
        const width = this.cameras.main.width;
        
        this.titleText = this.add.text(width / 2, 120, '玛丽医生', {
            fontFamily: 'monospace',
            fontSize: '64px',
            color: '#ffffff',
            stroke: '#ff4444',
            strokeThickness: 4
        });
        this.titleText.setOrigin(0.5);
        
        this.tweens.add({
            targets: this.titleText,
            scale: { from: 0.9, to: 1.1 },
            duration: 1000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            loop: -1
        });
        
        const subtitle = this.add.text(width / 2, 180, 'DR. MARY', {
            fontFamily: 'monospace',
            fontSize: '24px',
            color: '#4488ff'
        });
        subtitle.setOrigin(0.5);
    }

    private createMenu(): void {
        const width = this.cameras.main.width;
        const startY = 300;
        const spacing = 60;
        
        this.menuItems.forEach((item, index) => {
            const text = this.add.text(width / 2, startY + index * spacing, item, {
                fontFamily: 'monospace',
                fontSize: '28px',
                color: '#888888',
                stroke: '#000000',
                strokeThickness: 2
            });
            text.setOrigin(0.5);
            text.setData('index', index);
            
            text.setInteractive({ useHandCursor: true });
            text.on('pointerover', () => this.selectItem(index));
            text.on('pointerout', () => this.deselectItem(index));
            text.on('pointerdown', () => this.confirmSelection());
            
            this.menuTexts.push(text);
        });
        
        this.selectItem(0);
        
        const footer = this.add.text(width / 2, this.cameras.main.height - 50, 
            '使用 方向键/WASD 选择 | 空格/回车 确认', {
            fontFamily: 'monospace',
            fontSize: '16px',
            color: '#666666'
        });
        footer.setOrigin(0.5);
    }

    private createControls(): void {
        this.controls.up = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.UP)!;
        this.controls.down = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN)!;
        this.controls.w = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W)!;
        this.controls.s = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S)!;
        this.controls.space = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)!;
        this.controls.enter = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)!;
    }

    update(): void {
        if (Phaser.Input.Keyboard.JustDown(this.controls.up) || Phaser.Input.Keyboard.JustDown(this.controls.w)) {
            this.moveSelection(-1);
        }
        
        if (Phaser.Input.Keyboard.JustDown(this.controls.down) || Phaser.Input.Keyboard.JustDown(this.controls.s)) {
            this.moveSelection(1);
        }
        
        if (Phaser.Input.Keyboard.JustDown(this.controls.space) || Phaser.Input.Keyboard.JustDown(this.controls.enter)) {
            this.confirmSelection();
        }
    }

    private moveSelection(direction: number): void {
        this.deselectItem(this.selectedIndex);
        this.selectedIndex = (this.selectedIndex + direction + this.menuItems.length) % this.menuItems.length;
        this.selectItem(this.selectedIndex);
        this.audioManager.playMenuMove();
    }

    private selectItem(index: number): void {
        const text = this.menuTexts[index];
        text.setColor('#ffffff');
        text.setStroke('#ff4444', 4);
        text.setScale(1.1);
        
        this.tweens.add({
            targets: text,
            x: text.x + 10,
            duration: 200,
            ease: 'Back.easeOut'
        });
    }

    private deselectItem(index: number): void {
        const text = this.menuTexts[index];
        text.setColor('#888888');
        text.setStroke('#000000', 2);
        text.setScale(1);
        text.setX(this.cameras.main.width / 2);
    }

    private confirmSelection(): void {
        this.audioManager.playMenuSelect();
        
        switch (this.selectedIndex) {
            case 0:
                this.scene.start('GameScene', { mode: 'single' });
                break;
            case 1:
                this.scene.start('BattleScene', { mode: 'battle' });
                break;
            case 2:
                this.showInstructions();
                break;
        }
    }

    private showInstructions(): void {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);
        overlay.setInteractive();
        
        const instructions = this.add.text(width / 2, height / 2 - 100, 
            '游戏说明\n\n' +
            '【目标】\n' +
            '消除所有病毒即可获胜\n\n' +
            '【操作】\n' +
            'P1: A/D 左右移动 | S 加速下落 | W 顺时针旋转 | Q 逆时针旋转\n' +
            'P2: ←/→ 左右移动 | ↓ 加速下落 | ↑ 顺时针旋转 | SHIFT 逆时针旋转\n\n' +
            '【规则】\n' +
            '四个同色方块连成一线即可消除\n' +
            '胶囊消除一半后，另一半会悬空下落\n' +
            '连续消除会触发连锁加分\n\n' +
            '【对战模式】\n' +
            '消除病毒会向对手投放垃圾块\n' +
            '先堆满瓶子的一方失败\n\n' +
            '按 空格/回车 返回',
            {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#ffffff',
                align: 'center'
            });
        instructions.setOrigin(0.5);
        
        const closeOnKey = (event: KeyboardEvent) => {
            if (event.code === 'Space' || event.code === 'Enter') {
                overlay.destroy();
                instructions.destroy();
                this.input.keyboard!.off('keydown', closeOnKey);
            }
        };
        
        this.input.keyboard!.on('keydown', closeOnKey);
    }
}
