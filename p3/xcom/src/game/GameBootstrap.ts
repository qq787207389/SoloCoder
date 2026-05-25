import Phaser from 'phaser'
import { IsometricScene } from './IsometricScene'

let gameInstance: Phaser.Game | null = null

export const createGame = (container: HTMLElement): Phaser.Game => {
  if (gameInstance) {
    gameInstance.destroy(true)
  }

  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: container.clientWidth,
    height: container.clientHeight,
    parent: container,
    scene: [IsometricScene],
    backgroundColor: '#1a1a2e',
    pixelArt: false,
    roundPixels: false,
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.NO_CENTER,
    },
    render: {
      antialias: true,
      antialiasGL: true,
      pixelArt: false,
    },
    input: {
      mouse: {
        target: container,
      },
      touch: {
        target: container,
      },
    },
  }

  gameInstance = new Phaser.Game(config)

  window.addEventListener('resize', () => {
    if (gameInstance) {
      gameInstance.scale.resize(container.clientWidth, container.clientHeight)
    }
  })

  return gameInstance
}

export const destroyGame = (): void => {
  if (gameInstance) {
    gameInstance.destroy(true)
    gameInstance = null
  }
}

export const getGameInstance = (): Phaser.Game | null => {
  return gameInstance
}
