import * as THREE from 'three'
import { PlayerController } from '../player/PlayerController'
import { InputManager } from '../core/InputManager'
import { WEAPON_CONFIG, WeaponConfig } from '../config/WeaponConfig'

type WeaponState = 'idle' | 'firing' | 'reloading' | 'swapping'

export class WeaponSystem {
  private playerController: PlayerController
  private inputManager: InputManager
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  
  private currentWeapon: string
  private weapons: string[]
  private weaponState: WeaponState
  private weaponMesh: THREE.Group
  private muzzleFlash: THREE.Mesh
  
  private ammo: number
  private maxAmmo: number
  private lastFireTime: number
  private currentSpread: number
  private recoilOffset: THREE.Vector2
  private targetRecoilOffset: THREE.Vector2
  
  private shellCasings: THREE.Mesh[]
  private bulletTrails: THREE.Line[]
  
  private stateMachine: Map<string, () => void>

  constructor(
    playerController: PlayerController,
    inputManager: InputManager,
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera
  ) {
    this.playerController = playerController
    this.inputManager = inputManager
    this.scene = scene
    this.camera = camera
    
    this.currentWeapon = 'pistol'
    this.weapons = ['pistol', 'rifle', 'sniper']
    this.weaponState = 'idle'
    this.weaponMesh = new THREE.Group()
    
    this.ammo = WEAPON_CONFIG[this.currentWeapon].magazineSize
    this.maxAmmo = WEAPON_CONFIG[this.currentWeapon].magazineSize
    this.lastFireTime = 0
    this.currentSpread = 0
    this.recoilOffset = new THREE.Vector2()
    this.targetRecoilOffset = new THREE.Vector2()
    
    this.shellCasings = []
    this.bulletTrails = []
    
    this.stateMachine = new Map()
    this.setupStateMachine()
    this.createWeaponMesh()
    this.createMuzzleFlash()
  }

  private setupStateMachine() {
    this.stateMachine.set('idle', () => this.updateIdle())
    this.stateMachine.set('firing', () => this.updateFiring())
    this.stateMachine.set('reloading', () => this.updateReloading())
    this.stateMachine.set('swapping', () => this.updateSwapping())
  }

  private createWeaponMesh() {
    const bodyGeometry = new THREE.BoxGeometry(0.1, 0.15, 0.5)
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x333333,
      metalness: 0.8,
      roughness: 0.3
    })
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
    body.position.z = -0.25
    this.weaponMesh.add(body)

    const barrelGeometry = new THREE.CylinderGeometry(0.02, 0.025, 0.4, 8)
    const barrelMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x1a1a1a,
      metalness: 0.9,
      roughness: 0.2
    })
    const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial)
    barrel.rotation.x = Math.PI / 2
    barrel.position.z = -0.65
    this.weaponMesh.add(barrel)

    const gripGeometry = new THREE.BoxGeometry(0.08, 0.2, 0.12)
    const gripMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x2d1810,
      roughness: 0.7
    })
    const grip = new THREE.Mesh(gripGeometry, gripMaterial)
    grip.position.set(0, -0.15, -0.1)
    this.weaponMesh.add(grip)

    this.weaponMesh.position.set(0.2, -0.2, -0.5)
    this.camera.add(this.weaponMesh)
  }

  private createMuzzleFlash() {
    const flashGeometry = new THREE.ConeGeometry(0.08, 0.2, 8)
    const flashMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffffaa,
      transparent: true,
      opacity: 0
    })
    this.muzzleFlash = new THREE.Mesh(flashGeometry, flashMaterial)
    this.muzzleFlash.rotation.x = Math.PI
    this.muzzleFlash.position.z = -0.85
    this.weaponMesh.add(this.muzzleFlash)
  }

  public update(deltaTime: number) {
    const stateUpdate = this.stateMachine.get(this.weaponState)
    if (stateUpdate) stateUpdate()

    this.updateRecoil(deltaTime)
    this.updateSpread(deltaTime)
    this.updateShellCasings(deltaTime)
    this.updateBulletTrails(deltaTime)
    this.updateWeaponPosition(deltaTime)
  }

  private updateIdle() {
    const config = WEAPON_CONFIG[this.currentWeapon]

    if (this.inputManager.isMousePressed('left') && this.ammo > 0) {
      this.weaponState = 'firing'
      this.fire()
      return
    }

    if (this.inputManager.isKeyDown('KeyR') && this.ammo < this.maxAmmo) {
      this.weaponState = 'reloading'
      setTimeout(() => {
        this.ammo = this.maxAmmo
        this.weaponState = 'idle'
      }, config.reloadTime * 1000)
      return
    }

    for (let i = 1; i <= this.weapons.length; i++) {
      if (this.inputManager.isKeyDown(`Digit${i}`)) {
        this.swapWeapon(this.weapons[i - 1])
        return
      }
    }
  }

  private updateFiring() {
    const config = WEAPON_CONFIG[this.currentWeapon]
    const now = performance.now() / 1000

    if (now - this.lastFireTime >= config.fireRate) {
      if (this.inputManager.isMousePressed('left') && this.ammo > 0) {
        this.fire()
      } else {
        this.weaponState = 'idle'
      }
    }
  }

  private updateReloading() {
  }

  private updateSwapping() {
  }

  private fire() {
    const config = WEAPON_CONFIG[this.currentWeapon]
    const now = performance.now() / 1000
    
    this.lastFireTime = now
    this.ammo--

    this.applyRecoil(config)
    this.applySpread(config)
    
    if (config.muzzleFlash) {
      this.showMuzzleFlash()
    }
    
    if (config.shellsEject) {
      this.ejectShell()
    }
    
    this.shootRaycast(config)
    this.shakeScreen()
  }

  private applyRecoil(config: WeaponConfig) {
    this.targetRecoilOffset.x += config.recoil.x
    this.targetRecoilOffset.y += (Math.random() - 0.5) * config.recoil.y
  }

  private updateRecoil(deltaTime: number) {
    const config = WEAPON_CONFIG[this.currentWeapon]
    this.recoilOffset.lerp(this.targetRecoilOffset, 10 * deltaTime)
    this.targetRecoilOffset.multiplyScalar(1 - config.recoilRecovery)
    
    this.weaponMesh.position.x = 0.2 + this.recoilOffset.y * 0.1
    this.weaponMesh.position.y = -0.2 + this.recoilOffset.x * 0.1
    this.weaponMesh.rotation.x = this.recoilOffset.x * 0.3
  }

  private applySpread(config: WeaponConfig) {
    this.currentSpread = Math.min(0.2, this.currentSpread + config.spreadPerShot)
  }

  private updateSpread(deltaTime: number) {
    const config = WEAPON_CONFIG[this.currentWeapon]
    this.currentSpread = Math.max(
      config.spread,
      this.currentSpread - config.spreadRecovery * deltaTime
    )
  }

  private showMuzzleFlash() {
    const material = this.muzzleFlash.material as THREE.MeshBasicMaterial
    material.opacity = 1
    material.color.setHSL(Math.random() * 0.1 + 0.1, 1, 0.7)
    
    setTimeout(() => {
      material.opacity = 0
    }, 50)
  }

  private ejectShell() {
    const shellGeometry = new THREE.CylinderGeometry(0.015, 0.015, 0.05, 6)
    const shellMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xdaa520,
      metalness: 0.5,
      roughness: 0.5
    })
    const shell = new THREE.Mesh(shellGeometry, shellMaterial)
    
    const worldPos = new THREE.Vector3()
    this.weaponMesh.getWorldPosition(worldPos)
    shell.position.copy(worldPos)
    shell.position.x += 0.2
    shell.position.y -= 0.05
    
    shell.userData.velocity = new THREE.Vector3(
      (Math.random() + 0.5) * 3,
      (Math.random() + 0.5) * 2,
      -Math.random() * 2
    )
    shell.userData.rotationVelocity = new THREE.Vector3(
      Math.random() * 10,
      Math.random() * 10,
      Math.random() * 10
    )
    shell.userData.life = 2
    
    this.scene.add(shell)
    this.shellCasings.push(shell)
  }

  private updateShellCasings(deltaTime: number) {
    for (let i = this.shellCasings.length - 1; i >= 0; i--) {
      const shell = this.shellCasings[i]
      shell.userData.velocity.y -= 10 * deltaTime
      shell.position.add(shell.userData.velocity.clone().multiplyScalar(deltaTime))
      shell.rotation.x += shell.userData.rotationVelocity.x * deltaTime
      shell.rotation.y += shell.userData.rotationVelocity.y * deltaTime
      shell.rotation.z += shell.userData.rotationVelocity.z * deltaTime
      
      shell.userData.life -= deltaTime
      if (shell.userData.life <= 0) {
        this.scene.remove(shell)
        this.shellCasings.splice(i, 1)
      }
    }
  }

  private shootRaycast(config: WeaponConfig) {
    const direction = new THREE.Vector3(0, 0, -1)
    direction.applyQuaternion(this.camera.quaternion)
    
    const spreadX = (Math.random() - 0.5) * 2 * this.currentSpread
    const spreadY = (Math.random() - 0.5) * 2 * this.currentSpread
    direction.x += spreadX
    direction.y += spreadY
    direction.normalize()
    
    const origin = this.camera.position.clone()
    
    this.createBulletTrail(origin, direction, config.bulletDistance)
    
    const raycaster = new THREE.Raycaster(origin, direction, 0, config.bulletDistance)
    const targets = this.scene.children.filter(
      child => child instanceof THREE.Mesh && child.userData.collidable
    ) as THREE.Mesh[]
    
    const hits = raycaster.intersectObjects(targets)
    
    if (hits.length > 0) {
      const hit = hits[0]
      this.createImpactEffect(hit.point, hit.face?.normal || new THREE.Vector3(0, 1, 0))
      
      if (hit.object.userData.destructible) {
        hit.object.userData.health -= config.damage
        if (hit.object.userData.health <= 0) {
          this.destroyObject(hit.object)
        }
      }
    }
  }

  private createBulletTrail(origin: THREE.Vector3, direction: THREE.Vector3, distance: number) {
    const endPoint = origin.clone().add(direction.clone().multiplyScalar(distance))
    const points = [origin.clone(), endPoint]
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    const material = new THREE.LineBasicMaterial({ 
      color: 0xffffaa,
      transparent: true,
      opacity: 0.8
    })
    const trail = new THREE.Line(geometry, material)
    trail.userData.life = 0.1
    this.scene.add(trail)
    this.bulletTrails.push(trail)
  }

  private updateBulletTrails(deltaTime: number) {
    for (let i = this.bulletTrails.length - 1; i >= 0; i--) {
      const trail = this.bulletTrails[i]
      trail.userData.life -= deltaTime
      const material = trail.material as THREE.LineBasicMaterial
      material.opacity = trail.userData.life * 8
      
      if (trail.userData.life <= 0) {
        this.scene.remove(trail)
        this.bulletTrails.splice(i, 1)
      }
    }
  }

  private createImpactEffect(point: THREE.Vector3, normal: THREE.Vector3) {
    for (let i = 0; i < 8; i++) {
      const particleGeometry = new THREE.SphereGeometry(0.02, 4, 4)
      const particleMaterial = new THREE.MeshBasicMaterial({ color: 0x888888 })
      const particle = new THREE.Mesh(particleGeometry, particleMaterial)
      particle.position.copy(point)
      
      particle.userData.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 5 + normal.x * 2,
        (Math.random() - 0.5) * 5 + normal.y * 2,
        (Math.random() - 0.5) * 5 + normal.z * 2
      )
      particle.userData.life = 0.5
      
      this.scene.add(particle)
      
      setTimeout(() => {
        this.scene.remove(particle)
      }, 500)
    }
  }

  private destroyObject(object: THREE.Mesh) {
    for (let i = 0; i < 15; i++) {
      const debrisGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1)
      const debrisMaterial = new THREE.MeshStandardMaterial({ 
        color: (object.material as THREE.MeshStandardMaterial).color
      })
      const debris = new THREE.Mesh(debrisGeometry, debrisMaterial)
      debris.position.copy(object.position)
      debris.userData.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        Math.random() * 8,
        (Math.random() - 0.5) * 10
      )
      this.scene.add(debris)
      
      const animateDebris = () => {
        debris.userData.velocity.y -= 15 * 0.016
        debris.position.add(debris.userData.velocity.clone().multiplyScalar(0.016))
        debris.rotation.x += 0.1
        debris.rotation.y += 0.1
        
        if (debris.position.y > 0.05) {
          requestAnimationFrame(animateDebris)
        } else {
          this.scene.remove(debris)
        }
      }
      animateDebris()
    }
    this.scene.remove(object)
  }

  private shakeScreen() {
    const shake = () => {
      this.camera.position.x += (Math.random() - 0.5) * 0.02
      this.camera.position.y += (Math.random() - 0.5) * 0.02
    }
    shake()
    setTimeout(shake, 20)
  }

  private swapWeapon(weapon: string) {
    if (weapon === this.currentWeapon) return
    
    this.weaponState = 'swapping'
    this.currentWeapon = weapon
    this.ammo = WEAPON_CONFIG[weapon].magazineSize
    this.maxAmmo = WEAPON_CONFIG[weapon].magazineSize
    this.currentSpread = WEAPON_CONFIG[weapon].spread
    
    setTimeout(() => {
      this.weaponState = 'idle'
    }, 500)
  }

  private updateWeaponPosition(deltaTime: number) {
    const velocity = this.playerController.getVelocity()
    const horizontalSpeed = Math.sqrt(velocity.x ** 2 + velocity.z ** 2)
    
    const swayAmount = horizontalSpeed * 0.002
    const swayOffset = new THREE.Vector3(
      Math.sin(performance.now() * 0.003) * swayAmount,
      Math.cos(performance.now() * 0.002) * swayAmount * 0.5,
      0
    )
    
    this.weaponMesh.position.x = 0.2 + this.recoilOffset.y * 0.1 + swayOffset.x
    this.weaponMesh.position.y = -0.2 + this.recoilOffset.x * 0.05 + swayOffset.y
  }

  public getCurrentAmmo(): { current: number; max: number } {
    return { current: this.ammo, max: this.maxAmmo }
  }

  public getSpread(): number {
    return this.currentSpread
  }

  public getCurrentWeapon(): string {
    return this.currentWeapon
  }
}
