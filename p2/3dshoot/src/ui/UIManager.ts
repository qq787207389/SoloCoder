export class UIManager {
  private loadingScreen: HTMLDivElement
  private loadingProgress: HTMLDivElement
  private loadingText: HTMLDivElement
  private mainMenu: HTMLDivElement
  private startButton: HTMLButtonElement | null
  private hud: HTMLDivElement
  private crosshair: HTMLDivElement
  private healthBar: HTMLDivElement
  private ammoDisplay: HTMLDivElement
  private minimap: HTMLCanvasElement
  private minimapCtx: CanvasRenderingContext2D
  private killFeed: HTMLDivElement
  private scoreboard: HTMLDivElement
  
  private kills: number
  private deaths: number

  constructor() {
    this.kills = 0
    this.deaths = 0
    this.startButton = null
    
    this.loadingScreen = this.createLoadingScreen()
    this.loadingProgress = this.createLoadingProgress()
    this.loadingText = this.createLoadingText()
    this.hud = this.createHUD()
    this.crosshair = this.createCrosshair()
    this.healthBar = this.createHealthBar()
    this.ammoDisplay = this.createAmmoDisplay()
    this.minimap = this.createMinimap()
    this.minimapCtx = this.minimap.getContext('2d')!
    this.killFeed = this.createKillFeed()
    this.scoreboard = this.createScoreboard()
    this.mainMenu = this.createMainMenu()
    
    this.loadingScreen.appendChild(this.loadingProgress)
    this.loadingScreen.appendChild(this.loadingText)
    
    document.body.appendChild(this.loadingScreen)
    document.body.appendChild(this.mainMenu)
    document.body.appendChild(this.hud)
    this.hud.appendChild(this.crosshair)
    this.hud.appendChild(this.healthBar)
    this.hud.appendChild(this.ammoDisplay)
    this.hud.appendChild(this.minimap)
    this.hud.appendChild(this.killFeed)
    this.hud.appendChild(this.scoreboard)
    
    this.hideAll()
  }

  private createLoadingScreen(): HTMLDivElement {
    const screen = document.createElement('div')
    screen.style.position = 'fixed'
    screen.style.top = '0'
    screen.style.left = '0'
    screen.style.width = '100%'
    screen.style.height = '100%'
    screen.style.backgroundColor = '#1a1a2e'
    screen.style.display = 'flex'
    screen.style.flexDirection = 'column'
    screen.style.justifyContent = 'center'
    screen.style.alignItems = 'center'
    screen.style.zIndex = '9999'
    return screen
  }

  private createLoadingProgress(): HTMLDivElement {
    const progress = document.createElement('div')
    progress.style.width = '300px'
    progress.style.height = '4px'
    progress.style.backgroundColor = '#333'
    progress.style.borderRadius = '2px'
    progress.style.overflow = 'hidden'
    progress.style.marginBottom = '20px'
    
    const bar = document.createElement('div')
    bar.style.width = '0%'
    bar.style.height = '100%'
    bar.style.backgroundColor = '#00d4ff'
    bar.style.transition = 'width 0.3s'
    bar.id = 'loading-bar'
    progress.appendChild(bar)
    
    return progress
  }

  private createLoadingText(): HTMLDivElement {
    const text = document.createElement('div')
    text.style.color = '#fff'
    text.style.fontFamily = 'Arial, sans-serif'
    text.style.fontSize = '14px'
    text.id = 'loading-text'
    text.textContent = 'Initializing...'
    return text
  }

  private createMainMenu(): HTMLDivElement {
    const menu = document.createElement('div')
    menu.style.position = 'fixed'
    menu.style.top = '0'
    menu.style.left = '0'
    menu.style.width = '100%'
    menu.style.height = '100%'
    menu.style.backgroundColor = 'rgba(10, 10, 20, 0.95)'
    menu.style.display = 'flex'
    menu.style.flexDirection = 'column'
    menu.style.justifyContent = 'center'
    menu.style.alignItems = 'center'
    menu.style.zIndex = '9000'
    
    const title = document.createElement('h1')
    title.textContent = '都市风暴'
    title.style.color = '#fff'
    title.style.fontFamily = 'Arial, sans-serif'
    title.style.fontSize = '48px'
    title.style.marginBottom = '10px'
    title.style.textShadow = '0 0 20px #00d4ff'
    menu.appendChild(title)
    
    const subtitle = document.createElement('p')
    subtitle.textContent = 'URBAN STORM'
    subtitle.style.color = '#00d4ff'
    subtitle.style.fontFamily = 'Arial, sans-serif'
    subtitle.style.fontSize = '18px'
    subtitle.style.marginBottom = '50px'
    subtitle.style.letterSpacing = '8px'
    menu.appendChild(subtitle)
    
    this.startButton = document.createElement('button')
    this.startButton.textContent = '开始游戏'
    this.startButton.style.padding = '15px 50px'
    this.startButton.style.fontSize = '18px'
    this.startButton.style.backgroundColor = '#00d4ff'
    this.startButton.style.color = '#000'
    this.startButton.style.border = 'none'
    this.startButton.style.borderRadius = '5px'
    this.startButton.style.cursor = 'pointer'
    this.startButton.style.marginBottom = '20px'
    this.startButton.style.transition = 'all 0.3s'
    this.startButton.onmouseover = () => {
      if (this.startButton) {
        this.startButton.style.transform = 'scale(1.05)'
        this.startButton.style.boxShadow = '0 0 20px #00d4ff'
      }
    }
    this.startButton.onmouseout = () => {
      if (this.startButton) {
        this.startButton.style.transform = 'scale(1)'
        this.startButton.style.boxShadow = 'none'
      }
    }
    menu.appendChild(this.startButton)
    
    const controls = document.createElement('div')
    controls.style.color = '#888'
    controls.style.fontFamily = 'Arial, sans-serif'
    controls.style.fontSize = '14px'
    controls.style.marginTop = '50px'
    controls.style.textAlign = 'center'
    controls.innerHTML = `
      <p>WASD - 移动 | 鼠标 - 瞄准/射击</p>
      <p>空格 - 跳跃 | C - 蹲下 | R - 换弹</p>
      <p>1/2/3 - 切换武器 | Tab - 计分板</p>
    `
    menu.appendChild(controls)
    
    return menu
  }

  private createHUD(): HTMLDivElement {
    const hud = document.createElement('div')
    hud.style.position = 'fixed'
    hud.style.top = '0'
    hud.style.left = '0'
    hud.style.width = '100%'
    hud.style.height = '100%'
    hud.style.pointerEvents = 'none'
    hud.style.zIndex = '8000'
    return hud
  }

  private createCrosshair(): HTMLDivElement {
    const crosshair = document.createElement('div')
    crosshair.style.position = 'absolute'
    crosshair.style.top = '50%'
    crosshair.style.left = '50%'
    crosshair.style.transform = 'translate(-50%, -50%)'
    crosshair.id = 'crosshair'
    
    const h = document.createElement('div')
    h.style.width = '20px'
    h.style.height = '2px'
    h.style.backgroundColor = '#fff'
    h.style.position = 'absolute'
    h.style.top = '50%'
    h.style.left = '50%'
    h.style.transform = 'translate(-50%, -50%)'
    h.style.boxShadow = '0 0 5px rgba(0,0,0,0.5)'
    crosshair.appendChild(h)
    
    const v = document.createElement('div')
    v.style.width = '2px'
    v.style.height = '20px'
    v.style.backgroundColor = '#fff'
    v.style.position = 'absolute'
    v.style.top = '50%'
    v.style.left = '50%'
    v.style.transform = 'translate(-50%, -50%)'
    v.style.boxShadow = '0 0 5px rgba(0,0,0,0.5)'
    crosshair.appendChild(v)
    
    return crosshair
  }

  private createHealthBar(): HTMLDivElement {
    const container = document.createElement('div')
    container.style.position = 'absolute'
    container.style.bottom = '30px'
    container.style.left = '30px'
    
    const label = document.createElement('div')
    label.textContent = 'HP'
    label.style.color = '#fff'
    label.style.fontFamily = 'Arial, sans-serif'
    label.style.fontSize = '12px'
    label.style.marginBottom = '5px'
    container.appendChild(label)
    
    const barBg = document.createElement('div')
    barBg.style.width = '200px'
    barBg.style.height = '15px'
    barBg.style.backgroundColor = 'rgba(0,0,0,0.5)'
    barBg.style.borderRadius = '3px'
    barBg.style.border = '1px solid #444'
    
    const barFill = document.createElement('div')
    barFill.style.width = '100%'
    barFill.style.height = '100%'
    barFill.style.backgroundColor = '#4CAF50'
    barFill.style.borderRadius = '2px'
    barFill.style.transition = 'width 0.3s, background-color 0.3s'
    barFill.id = 'health-bar-fill'
    barBg.appendChild(barFill)
    
    container.appendChild(barBg)
    return container
  }

  private createAmmoDisplay(): HTMLDivElement {
    const ammo = document.createElement('div')
    ammo.style.position = 'absolute'
    ammo.style.bottom = '30px'
    ammo.style.right = '30px'
    ammo.style.color = '#fff'
    ammo.style.fontFamily = 'Arial, sans-serif'
    ammo.style.fontSize = '24px'
    ammo.style.fontWeight = 'bold'
    ammo.style.textAlign = 'right'
    ammo.id = 'ammo-display'
    ammo.textContent = '12 / 12'
    return ammo
  }

  private createMinimap(): HTMLCanvasElement {
    const canvas = document.createElement('canvas')
    canvas.style.position = 'absolute'
    canvas.style.top = '20px'
    canvas.style.right = '20px'
    canvas.style.width = '150px'
    canvas.style.height = '150px'
    canvas.style.borderRadius = '5px'
    canvas.style.border = '2px solid #444'
    canvas.style.backgroundColor = 'rgba(0,0,0,0.7)'
    canvas.width = 150
    canvas.height = 150
    return canvas
  }

  private createKillFeed(): HTMLDivElement {
    const feed = document.createElement('div')
    feed.style.position = 'absolute'
    feed.style.top = '20px'
    feed.style.left = '20px'
    feed.style.maxWidth = '300px'
    feed.id = 'kill-feed'
    return feed
  }

  private createScoreboard(): HTMLDivElement {
    const board = document.createElement('div')
    board.style.position = 'absolute'
    board.style.top = '50%'
    board.style.left = '50%'
    board.style.transform = 'translate(-50%, -50%)'
    board.style.backgroundColor = 'rgba(0,0,0,0.85)'
    board.style.padding = '30px'
    board.style.borderRadius = '10px'
    board.style.minWidth = '400px'
    board.style.display = 'none'
    board.style.pointerEvents = 'auto'
    board.id = 'scoreboard'
    
    const title = document.createElement('h2')
    title.textContent = '得分榜'
    title.style.color = '#fff'
    title.style.fontFamily = 'Arial, sans-serif'
    title.style.marginTop = '0'
    title.style.marginBottom = '20px'
    title.style.textAlign = 'center'
    board.appendChild(title)
    
    const header = document.createElement('div')
    header.style.display = 'flex'
    header.style.justifyContent = 'space-between'
    header.style.color = '#888'
    header.style.fontFamily = 'Arial, sans-serif'
    header.style.fontSize = '12px'
    header.style.paddingBottom = '10px'
    header.style.borderBottom = '1px solid #333'
    header.style.marginBottom = '10px'
    header.innerHTML = '<span>玩家</span><span>击杀</span><span>死亡</span>'
    board.appendChild(header)
    
    const list = document.createElement('div')
    list.id = 'score-list'
    board.appendChild(list)
    
    return board
  }

  public showLoadingScreen() {
    this.loadingScreen.style.display = 'flex'
  }

  public hideLoadingScreen() {
    this.loadingScreen.style.display = 'none'
  }

  public updateLoadingProgress(progress: number, text: string) {
    const bar = document.getElementById('loading-bar')
    const textEl = document.getElementById('loading-text')
    if (bar) bar.style.width = `${progress * 100}%`
    if (textEl) textEl.textContent = text
  }

  public showMainMenu(onStart: () => void) {
    this.mainMenu.style.display = 'flex'
    if (this.startButton) {
      this.startButton.onclick = () => {
        this.mainMenu.style.display = 'none'
        this.hud.style.display = 'block'
        onStart()
      }
    }
  }

  public hideMainMenu() {
    this.mainMenu.style.display = 'none'
  }

  public updateHealth(health: number) {
    const bar = document.getElementById('health-bar-fill')
    if (bar) {
      bar.style.width = `${health}%`
      if (health > 60) {
        bar.style.backgroundColor = '#4CAF50'
      } else if (health > 30) {
        bar.style.backgroundColor = '#FFC107'
      } else {
        bar.style.backgroundColor = '#F44336'
      }
    }
  }

  public updateAmmo(ammo: { current: number; max: number }) {
    this.ammoDisplay.textContent = `${ammo.current} / ${ammo.max}`
  }

  public updateCrosshairSpread(spread: number) {
    const crosshair = document.getElementById('crosshair')
    if (crosshair) {
      const size = 20 + spread * 200
      crosshair.style.width = `${size}px`
      crosshair.style.height = `${size}px`
    }
  }

  public updateMinimap(
    playerPos: { x: number; z: number },
    playerYaw: number,
    enemies: Array<{ x: number; z: number; id: string }>
  ) {
    const ctx = this.minimapCtx
    const centerX = 75
    const centerY = 75
    const scale = 2
    
    ctx.clearRect(0, 0, 150, 150)
    
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 1
    for (let i = 0; i <= 200; i += 20) {
      const screenX = centerX + (i - 100) * scale / 2
      ctx.beginPath()
      ctx.moveTo(screenX, 0)
      ctx.lineTo(screenX, 150)
      ctx.stroke()
      
      const screenY = centerY + (i - 100) * scale / 2
      ctx.beginPath()
      ctx.moveTo(0, screenY)
      ctx.lineTo(150, screenY)
      ctx.stroke()
    }
    
    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate(-playerYaw)
    
    ctx.fillStyle = '#00d4ff'
    ctx.beginPath()
    ctx.moveTo(0, -8)
    ctx.lineTo(-5, 8)
    ctx.lineTo(5, 8)
    ctx.closePath()
    ctx.fill()
    
    ctx.restore()
    
    enemies.forEach(enemy => {
      const relX = (enemy.x - playerPos.x) * scale
      const relZ = (enemy.z - playerPos.z) * scale
      
      const rotatedX = relX * Math.cos(-playerYaw) - relZ * Math.sin(-playerYaw)
      const rotatedZ = relX * Math.sin(-playerYaw) + relZ * Math.cos(-playerYaw)
      
      const screenX = centerX + rotatedX
      const screenY = centerY + rotatedZ
      
      if (screenX > 0 && screenX < 150 && screenY > 0 && screenY < 150) {
        ctx.fillStyle = '#ff4444'
        ctx.beginPath()
        ctx.arc(screenX, screenY, 4, 0, Math.PI * 2)
        ctx.fill()
      }
    })
  }

  public addKill(killer: string, victim: string) {
    const entry = document.createElement('div')
    entry.style.backgroundColor = 'rgba(0,0,0,0.5)'
    entry.style.padding = '5px 10px'
    entry.style.marginBottom = '5px'
    entry.style.borderRadius = '3px'
    entry.style.color = '#fff'
    entry.style.fontFamily = 'Arial, sans-serif'
    entry.style.fontSize = '14px'
    
    const killerSpan = document.createElement('span')
    killerSpan.textContent = killer
    killerSpan.style.color = '#ff6600'
    killerSpan.style.fontWeight = 'bold'
    
    const victimSpan = document.createElement('span')
    victimSpan.textContent = victim
    victimSpan.style.color = '#ff4444'
    victimSpan.style.fontWeight = 'bold'
    
    entry.appendChild(killerSpan)
    entry.appendChild(document.createTextNode(' 击杀了 '))
    entry.appendChild(victimSpan)
    
    this.killFeed.appendChild(entry)
    
    setTimeout(() => {
      entry.style.opacity = '0'
      entry.style.transition = 'opacity 0.5s'
      setTimeout(() => entry.remove(), 500)
    }, 5000)
  }

  public updateScoreboard(players: Array<{ name: string; kills: number; deaths: number }>) {
    const list = document.getElementById('score-list')
    if (!list) return
    
    list.innerHTML = ''
    
    const sorted = [...players].sort((a, b) => b.kills - a.kills)
    
    sorted.forEach((player, index) => {
      const row = document.createElement('div')
      row.style.display = 'flex'
      row.style.justifyContent = 'space-between'
      row.style.color = '#fff'
      row.style.fontFamily = 'Arial, sans-serif'
      row.style.fontSize = '14px'
      row.style.padding = '8px 0'
      row.style.borderBottom = '1px solid #222'
      
      if (index === 0) {
        row.style.color = '#FFD700'
      } else if (index === 1) {
        row.style.color = '#C0C0C0'
      } else if (index === 2) {
        row.style.color = '#CD7F32'
      }
      
      row.innerHTML = `
        <span>${index + 1}. ${player.name}</span>
        <span>${player.kills}</span>
        <span>${player.deaths}</span>
      `
      list.appendChild(row)
    })
  }

  public showScoreboard() {
    this.scoreboard.style.display = 'block'
  }

  public hideScoreboard() {
    this.scoreboard.style.display = 'none'
  }

  public addKillCount() {
    this.kills++
  }

  public addDeathCount() {
    this.deaths++
  }

  public getStats() {
    return { kills: this.kills, deaths: this.deaths }
  }

  private hideAll() {
    this.loadingScreen.style.display = 'none'
    this.mainMenu.style.display = 'none'
    this.hud.style.display = 'none'
  }
}
