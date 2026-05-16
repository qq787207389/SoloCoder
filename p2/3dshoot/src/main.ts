import * as THREE from 'three'
import { SceneManager } from './core/SceneManager'
import { InputManager } from './core/InputManager'
import { PlayerController } from './player/PlayerController'
import { WeaponSystem } from './weapons/WeaponSystem'
import { PhysicsWorld } from './core/PhysicsWorld'
import './style.css'

function initGame() {
  console.log('=== 游戏初始化开始 ===')
  
  // 1. 创建基础 Three.js 对象
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x87ceeb)
  
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  document.body.appendChild(renderer.domElement)
  
  console.log('Three.js 基础对象已创建')
  
  // 2. 创建管理器
  const sceneManager = new SceneManager(scene)
  const physicsWorld = new PhysicsWorld()
  const inputManager = new InputManager()
  
  // 3. 创建场景
  sceneManager.createUrbanEnvironment()
  console.log('场景已创建，对象数量:', scene.children.length)
  
  // 4. 创建玩家和武器系统
  const playerController = new PlayerController(camera, inputManager, physicsWorld)
  const weaponSystem = new WeaponSystem(playerController, inputManager, scene, camera)
  
  // 5. 将相机添加到场景（重要！）
  scene.add(camera)
  console.log('相机已添加到场景')
  
  // 6. 创建简单 UI
  createSimpleUI(inputManager, playerController, weaponSystem)
  
  // 7. 渲染循环
  const clock = new THREE.Clock()
  let isRunning = false
  
  function animate() {
    requestAnimationFrame(animate)
    
    if (isRunning) {
      const deltaTime = Math.min(clock.getDelta(), 0.1)
      playerController.update(deltaTime)
      weaponSystem.update(deltaTime)
      physicsWorld.update(deltaTime)
    }
    
    renderer.render(scene, camera)
  }
  animate()
  
  console.log('渲染循环已启动')
  
  // 8. 点击开始游戏
  const startBtn = document.getElementById('start-btn')
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      console.log('开始游戏!')
      const menu = document.getElementById('main-menu')
      if (menu) menu.style.display = 'none'
      inputManager.lockPointer()
      isRunning = true
    })
  }
  
  // 窗口大小调整
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  })
  
  console.log('=== 游戏初始化完成 ===')
}

function createSimpleUI(
  inputManager: InputManager,
  playerController: PlayerController,
  weaponSystem: WeaponSystem
) {
  // 主菜单
  const menu = document.createElement('div')
  menu.id = 'main-menu'
  menu.style.position = 'fixed'
  menu.style.top = '0'
  menu.style.left = '0'
  menu.style.width = '100%'
  menu.style.height = '100%'
  menu.style.background = 'rgba(10, 10, 30, 0.95)'
  menu.style.display = 'flex'
  menu.style.flexDirection = 'column'
  menu.style.justifyContent = 'center'
  menu.style.alignItems = 'center'
  menu.style.zIndex = '1000'
  
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
  
  const startBtn = document.createElement('button')
  startBtn.id = 'start-btn'
  startBtn.textContent = '开始游戏'
  startBtn.style.padding = '15px 50px'
  startBtn.style.fontSize = '18px'
  startBtn.style.backgroundColor = '#00d4ff'
  startBtn.style.color = '#000'
  startBtn.style.border = 'none'
  startBtn.style.borderRadius = '5px'
  startBtn.style.cursor = 'pointer'
  startBtn.style.marginBottom = '30px'
  menu.appendChild(startBtn)
  
  const controls = document.createElement('div')
  controls.style.color = '#888'
  controls.style.fontFamily = 'Arial, sans-serif'
  controls.style.fontSize = '14px'
  controls.style.textAlign = 'center'
  controls.style.lineHeight = '2'
  controls.innerHTML = `
    <p>WASD - 移动 | 鼠标 - 瞄准</p>
    <p>鼠标左键 - 射击 | 空格 - 跳跃</p>
    <p>R - 换弹 | 1/2/3 - 切换武器</p>
  `
  menu.appendChild(controls)
  
  document.body.appendChild(menu)
  
  // HUD
  const hud = document.createElement('div')
  hud.style.position = 'fixed'
  hud.style.top = '0'
  hud.style.left = '0'
  hud.style.width = '100%'
  hud.style.height = '100%'
  hud.style.pointerEvents = 'none'
  hud.style.zIndex = '100'
  
  // 准星
  const crosshair = document.createElement('div')
  crosshair.style.position = 'absolute'
  crosshair.style.top = '50%'
  crosshair.style.left = '50%'
  crosshair.style.transform = 'translate(-50%, -50%)'
  crosshair.innerHTML = `
    <div style="position: absolute; width: 20px; height: 2px; background: #fff; top: 50%; left: 50%; transform: translate(-50%, -50%);"></div>
    <div style="position: absolute; width: 2px; height: 20px; background: #fff; top: 50%; left: 50%; transform: translate(-50%, -50%);"></div>
  `
  hud.appendChild(crosshair)
  
  // 生命值
  const healthBar = document.createElement('div')
  healthBar.style.position = 'absolute'
  healthBar.style.bottom = '30px'
  healthBar.style.left = '30px'
  healthBar.innerHTML = `
    <div style="color: #fff; font-family: Arial; font-size: 12px; margin-bottom: 5px;">HP</div>
    <div style="width: 200px; height: 15px; background: rgba(0,0,0,0.5); border-radius: 3px; border: 1px solid #444;">
      <div id="health-fill" style="width: 100%; height: 100%; background: #4CAF50; border-radius: 2px;"></div>
    </div>
  `
  hud.appendChild(healthBar)
  
  // 弹药
  const ammoDisplay = document.createElement('div')
  ammoDisplay.id = 'ammo-display'
  ammoDisplay.style.position = 'absolute'
  ammoDisplay.style.bottom = '30px'
  ammoDisplay.style.right = '30px'
  ammoDisplay.style.color = '#fff'
  ammoDisplay.style.fontFamily = 'Arial, sans-serif'
  ammoDisplay.style.fontSize = '24px'
  ammoDisplay.style.fontWeight = 'bold'
  ammoDisplay.textContent = '12 / 12'
  hud.appendChild(ammoDisplay)
  
  document.body.appendChild(hud)
}

window.addEventListener('DOMContentLoaded', initGame)
