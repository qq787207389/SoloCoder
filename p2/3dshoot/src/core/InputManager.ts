export class InputManager {
  private keys: Map<string, boolean>
  private mouseX: number
  private mouseY: number
  private mouseDeltaX: number
  private mouseDeltaY: number
  private isPointerLocked: boolean
  private mousePressed: { left: boolean; right: boolean; middle: boolean }

  constructor() {
    this.keys = new Map()
    this.mouseX = 0
    this.mouseY = 0
    this.mouseDeltaX = 0
    this.mouseDeltaY = 0
    this.isPointerLocked = false
    this.mousePressed = { left: false, right: false, middle: false }
    
    this.setupEventListeners()
  }

  private setupEventListeners() {
    document.addEventListener('keydown', (e) => {
      this.keys.set(e.code, true)
    })

    document.addEventListener('keyup', (e) => {
      this.keys.set(e.code, false)
    })

    document.addEventListener('mousemove', (e) => {
      if (this.isPointerLocked) {
        this.mouseDeltaX += e.movementX
        this.mouseDeltaY += e.movementY
      }
      this.mouseX = e.clientX
      this.mouseY = e.clientY
    })

    document.addEventListener('mousedown', (e) => {
      if (e.button === 0) this.mousePressed.left = true
      if (e.button === 1) this.mousePressed.middle = true
      if (e.button === 2) this.mousePressed.right = true
    })

    document.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.mousePressed.left = false
      if (e.button === 1) this.mousePressed.middle = false
      if (e.button === 2) this.mousePressed.right = false
    })

    document.addEventListener('contextmenu', (e) => e.preventDefault())

    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = document.pointerLockElement !== null
    })
  }

  public lockPointer() {
    document.body.requestPointerLock()
  }

  public isKeyDown(code: string): boolean {
    return this.keys.get(code) || false
  }

  public getMouseDelta(): { x: number; y: number } {
    const delta = { x: this.mouseDeltaX, y: this.mouseDeltaY }
    this.mouseDeltaX = 0
    this.mouseDeltaY = 0
    return delta
  }

  public isMousePressed(button: 'left' | 'right' | 'middle'): boolean {
    return this.mousePressed[button]
  }

  public getMousePosition(): { x: number; y: number } {
    return { x: this.mouseX, y: this.mouseY }
  }
}
