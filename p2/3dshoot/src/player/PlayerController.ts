import * as THREE from 'three'
import { InputManager } from '../core/InputManager'
import { PhysicsWorld } from '../core/PhysicsWorld'
import { NetworkClient } from '../network/NetworkClient'

export class PlayerController {
  private camera: THREE.PerspectiveCamera
  private inputManager: InputManager
  private physicsWorld: PhysicsWorld
  private networkClient: NetworkClient | null
  
  private position: THREE.Vector3
  private velocity: THREE.Vector3
  private rotation: THREE.Vector2
  private isGrounded: boolean
  private isCrouching: boolean
  private health: number
  private maxHealth: number
  
  private walkSpeed: number
  private runSpeed: number
  private crouchSpeed: number
  private jumpForce: number
  private mouseSensitivity: number
  
  private bobCycle: number
  private bobAmplitude: number
  private bobFrequency: number
  private originalCameraHeight: number

  constructor(
    camera: THREE.PerspectiveCamera,
    inputManager: InputManager,
    physicsWorld: PhysicsWorld
  ) {
    this.camera = camera
    this.inputManager = inputManager
    this.physicsWorld = physicsWorld
    this.networkClient = null
    
    this.position = new THREE.Vector3(0, 2, 30)
    this.velocity = new THREE.Vector3()
    this.rotation = new THREE.Vector2()
    this.isGrounded = true
    this.isCrouching = false
    this.health = 100
    this.maxHealth = 100
    
    this.walkSpeed = 8
    this.runSpeed = 14
    this.crouchSpeed = 4
    this.jumpForce = 12
    this.mouseSensitivity = 0.002
    
    this.bobCycle = 0
    this.bobAmplitude = 0.08
    this.bobFrequency = 12
    this.originalCameraHeight = 1.7
    
    this.camera.position.copy(this.position)
    this.camera.position.y += this.originalCameraHeight
  }

  public setNetworkClient(client: NetworkClient) {
    this.networkClient = client
  }

  public update(deltaTime: number) {
    this.updateRotation()
    this.updateMovement(deltaTime)
    this.updateHeadBob(deltaTime)
    this.camera.position.copy(this.position)
    this.camera.position.y += this.isCrouching ? 0.8 : this.originalCameraHeight
  }

  private updateRotation() {
    const mouseDelta = this.inputManager.getMouseDelta()
    
    this.rotation.x -= mouseDelta.y * this.mouseSensitivity
    this.rotation.y -= mouseDelta.x * this.mouseSensitivity
    
    this.rotation.x = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, this.rotation.x))
    
    this.camera.rotation.order = 'YXZ'
    this.camera.rotation.x = this.rotation.x
    this.camera.rotation.y = this.rotation.y
  }

  private updateMovement(deltaTime: number) {
    const forward = new THREE.Vector3(
      -Math.sin(this.rotation.y),
      0,
      -Math.cos(this.rotation.y)
    )
    const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize()
    
    let moveDir = new THREE.Vector3()
    
    if (this.inputManager.isKeyDown('KeyW')) moveDir.add(forward)
    if (this.inputManager.isKeyDown('KeyS')) moveDir.sub(forward)
    if (this.inputManager.isKeyDown('KeyA')) moveDir.sub(right)
    if (this.inputManager.isKeyDown('KeyD')) moveDir.add(right)
    
    if (moveDir.length() > 0) {
      moveDir.normalize()
    }
    
    const isRunning = this.inputManager.isKeyDown('ShiftLeft')
    const speed = this.isCrouching ? this.crouchSpeed : (isRunning ? this.runSpeed : this.walkSpeed)
    
    this.velocity.x = moveDir.x * speed
    this.velocity.z = moveDir.z * speed
    
    if (this.inputManager.isKeyDown('KeyC')) {
      this.isCrouching = true
    } else if (!this.inputManager.isKeyDown('KeyC')) {
      this.isCrouching = false
    }
    
    if (this.inputManager.isKeyDown('Space') && this.isGrounded && !this.isCrouching) {
      this.velocity.y = this.jumpForce
      this.isGrounded = false
    }
    
    if (!this.isGrounded) {
      this.velocity.y -= 25 * deltaTime
    }
    
    const scene = this.camera.parent as THREE.Scene
    if (scene) {
      const collidables = scene.children.filter(
        child => child instanceof THREE.Mesh && child.userData.collidable
      ) as THREE.Mesh[]
      
      const collisionResult = this.physicsWorld.checkCollision(
        this.position,
        this.velocity,
        deltaTime,
        collidables
      )
      
      this.velocity.copy(collisionResult.correctedVelocity)
      this.isGrounded = collisionResult.isGrounded
    }
    
    this.position.add(this.velocity.clone().multiplyScalar(deltaTime))
    
    this.position.x = Math.max(-75, Math.min(75, this.position.x))
    this.position.z = Math.max(-75, Math.min(75, this.position.z))
  }

  private updateHeadBob(deltaTime: number) {
    const horizontalSpeed = Math.sqrt(this.velocity.x ** 2 + this.velocity.z ** 2)
    
    if (horizontalSpeed > 0.5 && this.isGrounded) {
      this.bobCycle += deltaTime * this.bobFrequency * (horizontalSpeed / this.walkSpeed)
      const bobX = Math.sin(this.bobCycle) * this.bobAmplitude
      const bobY = Math.abs(Math.cos(this.bobCycle)) * this.bobAmplitude * 0.5
      this.camera.position.x += bobX
      this.camera.position.y += bobY
    } else {
      this.bobCycle = 0
    }
  }

  public getPosition(): THREE.Vector3 {
    return this.position.clone()
  }

  public getRotation(): { x: number; y: number } {
    return { x: this.rotation.x, y: this.rotation.y }
  }

  public getVelocity(): THREE.Vector3 {
    return this.velocity.clone()
  }

  public getHealth(): number {
    return this.health
  }

  public takeDamage(amount: number) {
    this.health = Math.max(0, this.health - amount)
  }

  public heal(amount: number) {
    this.health = Math.min(this.maxHealth, this.health + amount)
  }
}
