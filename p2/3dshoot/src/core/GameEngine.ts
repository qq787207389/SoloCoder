import * as THREE from 'three'
import { PlayerController } from '../player/PlayerController'
import { SceneManager } from './SceneManager'
import { WeaponSystem } from '../weapons/WeaponSystem'
import { InputManager } from './InputManager'
import { PhysicsWorld } from './PhysicsWorld'
import { NetworkClient } from '../network/NetworkClient'

export class GameEngine {
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer
  private clock: THREE.Clock
  private isRunning: boolean
  
  private playerController: PlayerController
  private sceneManager: SceneManager
  private weaponSystem: WeaponSystem
  private inputManager: InputManager
  private physicsWorld: PhysicsWorld
  private networkClient: NetworkClient | null

  constructor() {
    console.log('GameEngine 初始化...')
    
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x87ceeb)
    
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.clock = new THREE.Clock()
    this.isRunning = false
    
    this.setupRenderer()
    this.setupManagers()
    
    window.addEventListener('resize', () => this.onResize())
    
    console.log('GameEngine 初始化完成')
  }

  private setupRenderer() {
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    document.body.appendChild(this.renderer.domElement)
    console.log('渲染器已添加到 DOM')
  }

  private setupManagers() {
    this.sceneManager = new SceneManager(this.scene)
    this.physicsWorld = new PhysicsWorld()
    this.inputManager = new InputManager()
    this.playerController = new PlayerController(this.camera, this.inputManager, this.physicsWorld)
    this.weaponSystem = new WeaponSystem(this.playerController, this.inputManager, this.scene, this.camera)
    
    this.sceneManager.createUrbanEnvironment()
    this.scene.add(this.camera)
    console.log('场景和管理器创建完成，场景对象数量:', this.scene.children.length)
    console.log('相机已添加到场景')
  }

  public setNetworkClient(client: NetworkClient) {
    this.networkClient = client
    this.playerController.setNetworkClient(client)
  }

  public start() {
    console.log('游戏开始，启动渲染循环...')
    this.isRunning = true
    this.inputManager.lockPointer()
    this.gameLoop()
  }

  public stop() {
    this.isRunning = false
  }

  private gameLoop() {
    if (!this.isRunning) return
    
    requestAnimationFrame(() => this.gameLoop())
    
    const deltaTime = Math.min(this.clock.getDelta(), 0.1)
    
    this.update(deltaTime)
    this.render()
  }

  private update(deltaTime: number) {
    this.playerController.update(deltaTime)
    this.weaponSystem.update(deltaTime)
    this.physicsWorld.update(deltaTime)
  }

  private render() {
    this.renderer.render(this.scene, this.camera)
  }

  private onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }
}
