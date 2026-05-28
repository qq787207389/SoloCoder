import Phaser from 'phaser';

export function createPulseTween(
  scene: Phaser.Scene,
  target: Phaser.GameObjects.GameObject,
  minScale: number = 0.95,
  maxScale: number = 1.05,
  duration: number = 1000
): Phaser.Tweens.Tween {
  return scene.tweens.add({
    targets: target,
    scaleX: { from: minScale, to: maxScale },
    scaleY: { from: minScale, to: maxScale },
    duration: duration / 2,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut',
  });
}

export function createFloatTween(
  scene: Phaser.Scene,
  target: Phaser.GameObjects.GameObject,
  offset: number = 10,
  duration: number = 2000
): Phaser.Tweens.Tween {
  const originalY = (target as Phaser.GameObjects.Image).y;
  return scene.tweens.add({
    targets: target,
    y: { from: originalY - offset, to: originalY + offset },
    duration: duration / 2,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut',
  });
}

export function createRotateTween(
  scene: Phaser.Scene,
  target: Phaser.GameObjects.GameObject,
  duration: number = 3000
): Phaser.Tweens.Tween {
  return scene.tweens.add({
    targets: target,
    angle: { from: 0, to: 360 },
    duration: duration,
    repeat: -1,
    ease: 'Linear',
  });
}

export function createBounceInTween(
  scene: Phaser.Scene,
  target: Phaser.GameObjects.GameObject,
  duration: number = 500
): Phaser.Tweens.Tween {
  const imageTarget = target as Phaser.GameObjects.Image;
  const originalScale = imageTarget.scaleX;
  imageTarget.setScale(0);
  
  return scene.tweens.add({
    targets: target,
    scaleX: { from: 0, to: originalScale },
    scaleY: { from: 0, to: originalScale },
    duration: duration,
    ease: 'Back.easeOut',
  });
}

export function createFadeOutTween(
  scene: Phaser.Scene,
  target: Phaser.GameObjects.GameObject,
  duration: number = 300,
  delay: number = 0
): Phaser.Tweens.Tween {
  return scene.tweens.add({
    targets: target,
    alpha: 0,
    duration: duration,
    delay: delay,
    onComplete: () => target.destroy(),
  });
}

export function createDeathSpinTween(
  scene: Phaser.Scene,
  target: Phaser.GameObjects.GameObject,
  duration: number = 1500
): Phaser.Tweens.Tween {
  return scene.tweens.add({
    targets: target,
    angle: { from: 0, to: 720 },
    duration: duration,
    ease: 'Quad.easeIn',
  });
}

export function createTextPopup(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  color: string = '#ffffff',
  fontSize: string = '16px'
): Phaser.GameObjects.Text {
  const popup = scene.add.text(x, y, text, {
    fontSize: fontSize,
    color: color,
    fontFamily: '"Press Start 2P", "Courier New", monospace',
    stroke: '#000000',
    strokeThickness: 4,
  }).setOrigin(0.5);

  scene.tweens.add({
    targets: popup,
    y: y - 40,
    alpha: 0,
    duration: 1000,
    ease: 'Quad.easeOut',
    onComplete: () => popup.destroy(),
  });

  return popup;
}
