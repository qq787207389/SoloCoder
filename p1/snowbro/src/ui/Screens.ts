import { CANVAS_W, CANVAS_H, COLOR, PlatformData, IcePillarData, PowerUp, GameState, FLOAT_SPEED, FLOAT_RANGE } from '../types'
import { Player } from '../entities/Player'

export class HUD {
  draw(ctx: CanvasRenderingContext2D, player: Player, level: number, chainMax: number, gameState: GameState, stageClearTimer: number) {
    if (gameState === 'title') return

    ctx.fillStyle = COLOR.HUD_BG
    ctx.fillRect(0, 0, CANVAS_W, 14)

    ctx.fillStyle = COLOR.HUD_TEXT
    ctx.font = '8px monospace'
    ctx.fillText(`SCORE ${player.score}`, 4, 10)

    ctx.fillStyle = COLOR.HUD_ACCENT
    ctx.fillText(`STAGE ${level}`, 160, 10)

    for (let i = 0; i < player.lives; i++) {
      ctx.fillStyle = COLOR.PLAYER_BODY
      ctx.beginPath()
      ctx.arc(280 + i * 12, 7, 4, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = COLOR.PLAYER_HAT
      ctx.fillRect(278 + i * 12, 1, 6, 3)
    }

    this.drawPowerUpIcons(ctx, player)

    if (chainMax > 1) {
      ctx.fillStyle = COLOR.HUD_ACCENT
      ctx.font = '8px monospace'
      ctx.fillText(`${chainMax}CHAIN`, 420, 10)
    }
  }

  private drawPowerUpIcons(ctx: CanvasRenderingContext2D, player: Player) {
    let px = 340
    for (const pu of player.powerUps) {
      const ratio = pu.timer / pu.maxTimer
      const blink = ratio < 0.3 && Math.floor(pu.timer / 8) % 2 === 0

      if (!blink) {
        let color: string
        switch (pu.type) {
          case 'red': color = COLOR.RED_POTION; break
          case 'blue': color = COLOR.BLUE_POTION; break
          case 'yellow': color = COLOR.YELLOW_POTION; break
        }
        ctx.fillStyle = color
        ctx.fillRect(px, 3, 8, 8)

        ctx.fillStyle = '#000'
        ctx.globalAlpha = 0.5
        const barW = 8
        ctx.fillRect(px, 12, barW, 2)
        ctx.globalAlpha = 1
        ctx.fillStyle = '#40ff40'
        ctx.fillRect(px, 12, barW * ratio, 2)
      }

      px += 12
    }
  }
}

export class TitleScreen {
  animFrame: number = 0

  update() {
    this.animFrame++
  }

  draw(ctx: CanvasRenderingContext2D) {
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_H)
    gradient.addColorStop(0, COLOR.SKY_TOP)
    gradient.addColorStop(1, COLOR.SKY_BOT)
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

    for (let i = 0; i < 30; i++) {
      const sx = (i * 73 + this.animFrame * 0.5) % CANVAS_W
      const sy = (i * 47 + this.animFrame * (0.3 + (i % 3) * 0.1)) % CANVAS_H
      ctx.fillStyle = 'rgba(255,255,255,0.6)'
      ctx.fillRect(Math.round(sx), Math.round(sy), 2, 2)
    }

    ctx.fillStyle = COLOR.SNOW
    ctx.fillRect(0, CANVAS_H - 32, CANVAS_W, 32)

    ctx.fillStyle = COLOR.ICE
    for (let i = 0; i < CANVAS_W; i += 8) {
      const h = 2 + Math.sin(i * 0.1) * 2
      ctx.fillRect(i, CANVAS_H - 32 - h, 8, h + 4)
    }

    ctx.fillStyle = COLOR.PLAYER_BODY
    ctx.beginPath()
    ctx.arc(CANVAS_W / 2 - 60, CANVAS_H / 2 + 20, 16, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = COLOR.PLAYER_HAT
    ctx.fillRect(CANVAS_W / 2 - 76, CANVAS_H / 2 - 4, 28, 8)
    ctx.fillRect(CANVAS_W / 2 - 70, CANVAS_H / 2 - 14, 16, 12)
    ctx.fillStyle = COLOR.PLAYER_HAT_BAND
    ctx.fillRect(CANVAS_W / 2 - 76, CANVAS_H / 2 + 2, 28, 4)
    ctx.fillStyle = COLOR.PLAYER_EYES
    ctx.fillRect(CANVAS_W / 2 - 56, CANVAS_H / 2 + 16, 3, 3)
    ctx.fillStyle = COLOR.PLAYER_NOSE
    ctx.fillRect(CANVAS_W / 2 - 48, CANVAS_H / 2 + 18, 5, 3)

    ctx.fillStyle = COLOR.SNOWBALL
    ctx.beginPath()
    ctx.arc(CANVAS_W / 2 + 50, CANVAS_H / 2 + 24, 12, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = COLOR.SNOWBALL_SHINE
    ctx.beginPath()
    ctx.arc(CANVAS_W / 2 + 46, CANVAS_H / 2 + 20, 3, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = COLOR.HUD_ACCENT
    ctx.font = 'bold 24px monospace'
    ctx.textAlign = 'center'
    ctx.fillText('SNOW BROS', CANVAS_W / 2, CANVAS_H / 2 - 40)

    ctx.fillStyle = COLOR.ICE_LIGHT
    ctx.font = 'bold 10px monospace'
    ctx.fillText('雪人兄弟', CANVAS_W / 2, CANVAS_H / 2 - 22)

    ctx.fillStyle = COLOR.HUD_TEXT
    ctx.font = '8px monospace'
    const blink = Math.floor(this.animFrame / 30) % 2 === 0
    if (blink) {
      ctx.fillText('PRESS ENTER TO START', CANVAS_W / 2, CANVAS_H / 2 + 60)
    }

    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.font = '7px monospace'
    ctx.fillText('← → Move   ↑ Jump   Z Shoot   X Kick', CANVAS_W / 2, CANVAS_H - 16)
    ctx.textAlign = 'left'
  }
}

export class GameOverScreen {
  animFrame: number = 0

  update() {
    this.animFrame++
  }

  draw(ctx: CanvasRenderingContext2D, score: number) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)'
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

    ctx.fillStyle = COLOR.ENEMY_PATROL
    ctx.font = 'bold 20px monospace'
    ctx.textAlign = 'center'
    ctx.fillText('GAME OVER', CANVAS_W / 2, CANVAS_H / 2 - 20)

    ctx.fillStyle = COLOR.HUD_TEXT
    ctx.font = '10px monospace'
    ctx.fillText(`SCORE: ${score}`, CANVAS_W / 2, CANVAS_H / 2 + 10)

    const blink = Math.floor(this.animFrame / 30) % 2 === 0
    if (blink) {
      ctx.fillStyle = COLOR.HUD_ACCENT
      ctx.font = '8px monospace'
      ctx.fillText('PRESS ENTER TO RETRY', CANVAS_W / 2, CANVAS_H / 2 + 40)
    }
    ctx.textAlign = 'left'
  }
}

export class StageClearScreen {
  animFrame: number = 0

  update() {
    this.animFrame++
  }

  draw(ctx: CanvasRenderingContext2D, score: number, chainMax: number) {
    ctx.fillStyle = 'rgba(0,20,60,0.6)'
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

    ctx.fillStyle = COLOR.ICE_LIGHT
    ctx.font = 'bold 16px monospace'
    ctx.textAlign = 'center'
    ctx.fillText('STAGE CLEAR!', CANVAS_W / 2, CANVAS_H / 2 - 30)

    ctx.fillStyle = COLOR.HUD_TEXT
    ctx.font = '10px monospace'
    ctx.fillText(`SCORE: ${score}`, CANVAS_W / 2, CANVAS_H / 2)

    if (chainMax > 1) {
      ctx.fillStyle = COLOR.HUD_ACCENT
      ctx.fillText(`MAX CHAIN: ${chainMax}`, CANVAS_W / 2, CANVAS_H / 2 + 18)
    }

    const blink = Math.floor(this.animFrame / 30) % 2 === 0
    if (blink && this.animFrame > 60) {
      ctx.fillStyle = COLOR.HUD_ACCENT
      ctx.font = '8px monospace'
      ctx.fillText('PRESS ENTER FOR NEXT STAGE', CANVAS_W / 2, CANVAS_H / 2 + 44)
    }
    ctx.textAlign = 'left'
  }
}
