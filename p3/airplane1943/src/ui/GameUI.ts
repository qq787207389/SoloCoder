import Phaser from 'phaser';
import { COLORS } from '../config/gameConfig';
import { WeaponType, FormationType } from '../types/game';

export class GameUI {
  private scene: Phaser.Scene;
  private scoreText: Phaser.GameObjects.Text;
  private fuelGauge: Phaser.GameObjects.Graphics;
  private fuelNeedle: Phaser.GameObjects.Graphics;
  private fuelText: Phaser.GameObjects.Text;
  private weaponLevelText: Phaser.GameObjects.Text;
  private formationText: Phaser.GameObjects.Text;
  private bossHealthBar: Phaser.GameObjects.Graphics;
  private bossHealthBg: Phaser.GameObjects.Graphics;
  private energyCapsules: Phaser.GameObjects.Container;
  private levelText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.scoreText = this.createScoreText();
    this.fuelGauge = this.createFuelGauge();
    this.fuelNeedle = this.createFuelNeedle();
    this.fuelText = this.createFuelText();
    this.weaponLevelText = this.createWeaponLevelText();
    this.formationText = this.createFormationText();
    this.energyCapsules = this.createEnergyCapsules();
    this.levelText = this.createLevelText();
    this.bossHealthBg = this.createBossHealthBg();
    this.bossHealthBar = this.createBossHealthBar();
  }

  private createScoreText(): Phaser.GameObjects.Text {
    return this.scene.add.text(10, 10, '得分: 0', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 2
    }).setScrollFactor(0).setDepth(100);
  }

  private createFuelGauge(): Phaser.GameObjects.Graphics {
    const gauge = this.scene.add.graphics().setScrollFactor(0).setDepth(100);
    gauge.fillStyle(0x333333, 1);
    gauge.fillCircle(70, this.scene.scale.height - 70, 50);
    gauge.lineStyle(3, 0xFFFFFF, 1);
    gauge.beginPath();
    gauge.arc(70, this.scene.scale.height - 70, 45, Phaser.Math.DegToRad(45), Phaser.Math.DegToRad(315));
    gauge.strokePath();

    for (let i = 0; i <= 10; i++) {
      const angle = Phaser.Math.DegToRad(45 + i * 27);
      const innerRadius = i % 2 === 0 ? 35 : 40;
      gauge.lineBetween(
        70 + Math.cos(angle) * innerRadius,
        this.scene.scale.height - 70 + Math.sin(angle) * innerRadius,
        70 + Math.cos(angle) * 45,
        this.scene.scale.height - 70 + Math.sin(angle) * 45
      );
    }

    return gauge;
  }

  private createFuelNeedle(): Phaser.GameObjects.Graphics {
    return this.scene.add.graphics().setScrollFactor(0).setDepth(101);
  }

  private createFuelText(): Phaser.GameObjects.Text {
    return this.scene.add.text(70, this.scene.scale.height - 40, 'FUEL', {
      fontFamily: 'Arial',
      fontSize: '12px',
      color: '#FF0000',
      stroke: '#000000',
      strokeThickness: 1
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
  }

  private createWeaponLevelText(): Phaser.GameObjects.Text {
    return this.scene.add.text(
      this.scene.scale.width - 10,
      10,
      '武器: Lv.1\n机枪',
      {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 2,
        align: 'right'
      }
    ).setOrigin(1, 0).setScrollFactor(0).setDepth(100);
  }

  private createFormationText(): Phaser.GameObjects.Text {
    return this.scene.add.text(
      this.scene.scale.width - 10,
      55,
      '阵型: 散开',
      {
        fontFamily: 'Arial',
        fontSize: '12px',
        color: '#00FF00',
        stroke: '#000000',
        strokeThickness: 2
      }
    ).setOrigin(1, 0).setScrollFactor(0).setDepth(100);
  }

  private createEnergyCapsules(): Phaser.GameObjects.Container {
    const container = this.scene.add.container(10, 40).setScrollFactor(0).setDepth(100);
    const colors = ['red', 'blue', 'green'];
    const colorHex = [0xFF0000, 0x0000FF, 0x00FF00];

    colors.forEach((color, index) => {
      const bg = this.scene.add.graphics();
      bg.fillStyle(0x333333, 0.7);
      bg.fillRect(0, index * 22, 80, 18);
      
      const capsule = this.scene.add.graphics();
      capsule.fillStyle(colorHex[index], 1);
      capsule.fillRect(2, 2 + index * 22, 0, 14);

      const text = this.scene.add.text(5, index * 22 + 3, `${color.toUpperCase()}: 0/5`, {
        fontFamily: 'Arial',
        fontSize: '10px',
        color: '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 1
      });

      container.add([bg, capsule, text]);
    });

    return container;
  }

  private createLevelText(): Phaser.GameObjects.Text {
    return this.scene.add.text(
      this.scene.scale.width / 2,
      10,
      '',
      {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#FFFF00',
        stroke: '#000000',
        strokeThickness: 2
      }
    ).setOrigin(0.5, 0).setScrollFactor(0).setDepth(100);
  }

  private createBossHealthBg(): Phaser.GameObjects.Graphics {
    const bg = this.scene.add.graphics().setScrollFactor(0).setDepth(99);
    bg.visible = false;
    return bg;
  }

  private createBossHealthBar(): Phaser.GameObjects.Graphics {
    const bar = this.scene.add.graphics().setScrollFactor(0).setDepth(100);
    bar.visible = false;
    return bar;
  }

  public updateScore(score: number): void {
    this.scoreText.setText(`得分: ${score}`);
  }

  public updateFuel(fuel: number, maxFuel: number): void {
    const fuelPercent = fuel / maxFuel;
    const angle = Phaser.Math.DegToRad(45 + fuelPercent * 270);
    
    this.fuelNeedle.clear();
    this.fuelNeedle.lineStyle(3, fuelPercent > 0.3 ? 0x00FF00 : fuelPercent > 0.15 ? 0xFFFF00 : 0xFF0000, 1);
    this.fuelNeedle.lineBetween(
      70,
      this.scene.scale.height - 70,
      70 + Math.cos(angle) * 35,
      this.scene.scale.height - 70 + Math.sin(angle) * 35
    );
  }

  public updateWeaponLevel(level: number, weapon: WeaponType): void {
    const weaponNames: Record<WeaponType, string> = {
      machinegun: '机枪',
      torpedo: '鱼雷',
      rocket: '火箭'
    };
    this.weaponLevelText.setText(`武器: Lv.${level}\n${weaponNames[weapon]}`);
  }

  public updateFormation(formation: FormationType): void {
    const formationNames: Record<FormationType, string> = {
      focus: '集中',
      spread: '散开'
    };
    this.formationText.setText(`阵型: ${formationNames[formation]}`);
  }

  public updateEnergyCapsules(capsules: Record<string, number>): void {
    const items = this.energyCapsules.getAll();
    const colors = ['red', 'blue', 'green'];
    
    colors.forEach((color, index) => {
      const capsule = items[index * 3 + 1] as Phaser.GameObjects.Graphics;
      const text = items[index * 3 + 2] as Phaser.GameObjects.Text;
      const count = capsules[color] || 0;
      
      capsule.clear();
      capsule.fillStyle(color === 'red' ? 0xFF0000 : color === 'blue' ? 0x0000FF : 0x00FF00, 1);
      capsule.fillRect(2, 2 + index * 22, count * 15.2, 14);
      
      text.setText(`${color.toUpperCase()}: ${count}/5`);
    });
  }

  public updateLevelName(name: string): void {
    this.levelText.setText(name);
  }

  public showBossHealth(): void {
    this.bossHealthBg.visible = true;
    this.bossHealthBar.visible = true;
  }

  public hideBossHealth(): void {
    this.bossHealthBg.visible = false;
    this.bossHealthBar.visible = false;
  }

  public updateBossHealth(percent: number): void {
    const barWidth = 300;
    const barHeight = 20;
    const x = (this.scene.scale.width - barWidth) / 2;
    const y = 50;

    this.bossHealthBg.clear();
    this.bossHealthBg.fillStyle(0x333333, 1);
    this.bossHealthBg.fillRect(x - 2, y - 2, barWidth + 4, barHeight + 4);

    this.bossHealthBar.clear();
    this.bossHealthBar.fillStyle(percent > 0.5 ? 0x00FF00 : percent > 0.25 ? 0xFFFF00 : 0xFF0000, 1);
    this.bossHealthBar.fillRect(x, y, barWidth * percent, barHeight);
  }

  public destroy(): void {
    this.scoreText.destroy();
    this.fuelGauge.destroy();
    this.fuelNeedle.destroy();
    this.fuelText.destroy();
    this.weaponLevelText.destroy();
    this.formationText.destroy();
    this.energyCapsules.destroy();
    this.levelText.destroy();
    this.bossHealthBg.destroy();
    this.bossHealthBar.destroy();
  }
}
