export class ResourceManager {
  private textures: Map<string, HTMLImageElement>
  private models: Map<string, any>
  private sounds: Map<string, HTMLAudioElement>

  constructor() {
    this.textures = new Map()
    this.models = new Map()
    this.sounds = new Map()
  }

  public async loadAll(onProgress?: (progress: number, message: string) => void) {
    if (onProgress) {
      onProgress(0.3, '加载资源...')
    }
    
    await this.loadTextures(onProgress)
    await this.loadSounds(onProgress)
    
    if (onProgress) {
      onProgress(1, '完成')
    }
  }

  private async loadTextures(onProgress?: (progress: number, message: string) => void) {
    const textureList = [
      { id: 'wall', url: '' },
      { id: 'ground', url: '' },
      { id: 'player', url: '' }
    ]
    
    for (const tex of textureList) {
      this.textures.set(tex.id, await this.loadTexture(tex.url))
    }
    
    if (onProgress) {
      onProgress(0.6, '加载纹理完成')
    }
  }

  private loadTexture(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => resolve(img)
      img.src = url || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
      setTimeout(() => resolve(img), 100)
    })
  }

  private async loadSounds(onProgress?: (progress: number, message: string) => void) {
    const soundList = [
      { id: 'pistol_shot', url: '' },
      { id: 'rifle_shot', url: '' },
      { id: 'sniper_shot', url: '' },
      { id: 'reload', url: '' },
      { id: 'hit', url: '' },
      { id: 'footstep', url: '' }
    ]
    
    for (const snd of soundList) {
      this.sounds.set(snd.id, await this.loadSound(snd.url))
    }
    
    if (onProgress) {
      onProgress(0.9, '加载音效完成')
    }
  }

  private loadSound(url: string): Promise<HTMLAudioElement> {
    return new Promise((resolve) => {
      const audio = new Audio()
      audio.onloadeddata = () => resolve(audio)
      audio.onerror = () => resolve(audio)
      audio.src = url || ''
      setTimeout(() => resolve(audio), 100)
    })
  }

  public getTexture(id: string): HTMLImageElement | undefined {
    return this.textures.get(id)
  }

  public getSound(id: string): HTMLAudioElement | undefined {
    return this.sounds.get(id)
  }

  public playSound(id: string, volume: number = 1) {
    const sound = this.sounds.get(id)
    if (sound) {
      sound.volume = volume
      sound.currentTime = 0
      sound.play().catch(() => {})
    }
  }
}
