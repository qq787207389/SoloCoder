import { GameController } from './core/GameController'
import { GameRenderer } from './renderer/GameRenderer'

class GameApp {
  private controller: GameController
  private renderer: GameRenderer
  private scoreEl: HTMLElement
  private movesEl: HTMLElement
  private comboEl: HTMLElement

  constructor() {
    this.controller = new GameController()
    
    const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement
    this.renderer = new GameRenderer(canvas, this.controller)
    
    this.controller.onStateChange = () => {
      this.renderer.refresh()
    }
    
    this.scoreEl = document.getElementById('score')!
    this.movesEl = document.getElementById('moves')!
    this.comboEl = document.getElementById('combo')!
    
    this.setupControls()
    this.startGameLoop()
    this.renderer.start()
  }

  private setupControls(): void {
    document.getElementById('hintBtn')!.addEventListener('click', () => {
      const hint = this.controller.useHint()
      if (hint) {
        this.renderer.setHintCells(hint)
        setTimeout(() => {
          this.renderer.setHintCells([])
        }, 2000)
      }
    })

    document.getElementById('shuffleBtn')!.addEventListener('click', () => {
      this.controller.shuffle()
      this.renderer.refresh()
    })

    document.getElementById('resetBtn')!.addEventListener('click', () => {
      this.controller.resetGame()
      this.renderer.refresh()
      this.updateUI()
    })
  }

  private startGameLoop(): void {
    const update = () => {
      this.updateUI()
      requestAnimationFrame(update)
    }
    update()
  }

  private updateUI(): void {
    const state = this.controller.state
    this.scoreEl.textContent = state.score.toString()
    this.movesEl.textContent = (state.maxMoves - state.moves).toString()
    this.comboEl.textContent = state.combo.toString()
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new GameApp()
})
