import * as THREE from 'three'
import { WEAPON_CONFIG } from '../config/WeaponConfig'

export class SceneManager {
  private scene: THREE.Scene

  constructor(scene: THREE.Scene) {
    this.scene = scene
  }

  public createUrbanEnvironment() {
    this.scene.fog = new THREE.Fog(0x87ceeb, 50, 200)
    
    this.setupLighting()
    this.createGround()
    this.createBuildings()
    this.createWalls()
    this.createDestructibles()
    this.createDecorations()
  }

  private setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
    this.scene.add(ambientLight)

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.5)
    sunLight.position.set(50, 100, 50)
    sunLight.castShadow = true
    sunLight.shadow.mapSize.width = 2048
    sunLight.shadow.mapSize.height = 2048
    sunLight.shadow.camera.near = 0.5
    sunLight.shadow.camera.far = 500
    sunLight.shadow.camera.left = -100
    sunLight.shadow.camera.right = 100
    sunLight.shadow.camera.top = 100
    sunLight.shadow.camera.bottom = -100
    this.scene.add(sunLight)

    const pointLight1 = new THREE.PointLight(0xffaa00, 0.8, 20)
    pointLight1.position.set(0, 5, 0)
    pointLight1.castShadow = true
    this.scene.add(pointLight1)

    const pointLight2 = new THREE.PointLight(0x00aaff, 0.6, 15)
    pointLight2.position.set(20, 3, 15)
    this.scene.add(pointLight2)
  }

  private createGround() {
    const groundGeometry = new THREE.PlaneGeometry(200, 200)
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x666666,
      roughness: 0.8,
      metalness: 0.2
    })
    const ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    ground.userData.collidable = true
    ground.userData.physics = { type: 'static' }
    this.scene.add(ground)

    for (let i = 0; i < 20; i++) {
      const lineGeometry = new THREE.PlaneGeometry(0.2, 5)
      const lineMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff })
      const line = new THREE.Mesh(lineGeometry, lineMaterial)
      line.rotation.x = -Math.PI / 2
      line.position.set(
        (Math.random() - 0.5) * 180,
        0.01,
        (Math.random() - 0.5) * 180
      )
      this.scene.add(line)
    }
  }

  private createBuildings() {
    const buildingPositions = [
      { x: -40, z: -40, w: 20, h: 30, d: 20 },
      { x: 40, z: -40, w: 25, h: 25, d: 25 },
      { x: -40, z: 40, w: 15, h: 40, d: 15 },
      { x: 40, z: 40, w: 30, h: 20, d: 30 },
      { x: 0, z: -60, w: 40, h: 15, d: 20 },
    ]

    buildingPositions.forEach(building => {
      const geometry = new THREE.BoxGeometry(building.w, building.h, building.d)
      const material = new THREE.MeshStandardMaterial({
        color: 0x555555 + Math.random() * 0x222222,
        roughness: 0.7,
        metalness: 0.3
      })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.set(building.x, building.h / 2, building.z)
      mesh.castShadow = true
      mesh.receiveShadow = true
      mesh.userData.collidable = true
      mesh.userData.physics = { type: 'static', size: { x: building.w, y: building.h, z: building.d } }
      this.scene.add(mesh)

      this.addWindows(mesh, building)
    })
  }

  private addWindows(building: THREE.Mesh, buildingData: any) {
    const windowRows = Math.floor(buildingData.h / 3)
    const windowCols = Math.floor(buildingData.w / 4)
    
    for (let row = 0; row < windowRows; row++) {
      for (let col = 0; col < windowCols; col++) {
        const windowGeometry = new THREE.PlaneGeometry(2, 2)
        const windowMaterial = new THREE.MeshStandardMaterial({
          color: Math.random() > 0.5 ? 0xffffaa : 0x333333,
          emissive: Math.random() > 0.5 ? 0xffffaa : 0x000000,
          emissiveIntensity: 0.5
        })
        
        const frontWindow = new THREE.Mesh(windowGeometry, windowMaterial.clone())
        frontWindow.position.set(
          building.position.x + (col - windowCols / 2 + 0.5) * 4,
          row * 3 + 2,
          building.position.z + buildingData.d / 2 + 0.01
        )
        this.scene.add(frontWindow)
        
        const backWindow = new THREE.Mesh(windowGeometry, windowMaterial.clone())
        backWindow.position.set(
          building.position.x + (col - windowCols / 2 + 0.5) * 4,
          row * 3 + 2,
          building.position.z - buildingData.d / 2 - 0.01
        )
        backWindow.rotation.y = Math.PI
        this.scene.add(backWindow)
      }
    }
  }

  private createWalls() {
    const wallPositions = [
      { x: 0, z: -80, w: 160, h: 8, d: 1 },
      { x: 0, z: 80, w: 160, h: 8, d: 1 },
      { x: -80, z: 0, w: 1, h: 8, d: 160 },
      { x: 80, z: 0, w: 1, h: 8, d: 160 },
    ]

    wallPositions.forEach(wall => {
      const geometry = new THREE.BoxGeometry(wall.w, wall.h, wall.d)
      const material = new THREE.MeshStandardMaterial({
        color: 0x444444,
        roughness: 0.9
      })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.set(wall.x, wall.h / 2, wall.z)
      mesh.castShadow = true
      mesh.receiveShadow = true
      mesh.userData.collidable = true
      mesh.userData.physics = { type: 'static', size: { x: wall.w, y: wall.h, z: wall.d } }
      this.scene.add(mesh)
    })
  }

  private createDestructibles() {
    this.createCrates()
    this.createGlassPanels()
  }

  private createCrates() {
    const cratePositions = [
      { x: -20, z: 0 }, { x: -18, z: 0 },
      { x: 20, z: -20 }, { x: 20, z: -17 },
      { x: 0, z: 20 },
    ]

    cratePositions.forEach((pos, index) => {
      const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5)
      const material = new THREE.MeshStandardMaterial({
        color: 0x8B4513,
        roughness: 0.9
      })
      const crate = new THREE.Mesh(geometry, material)
      crate.position.set(pos.x, 0.75, pos.z)
      crate.castShadow = true
      crate.receiveShadow = true
      crate.userData.collidable = true
      crate.userData.destructible = true
      crate.userData.health = 50
      crate.userData.id = `crate_${index}`
      crate.userData.physics = { type: 'dynamic', mass: 10, size: { x: 1.5, y: 1.5, z: 1.5 } }
      this.scene.add(crate)
    })
  }

  private createGlassPanels() {
    const glassPositions = [
      { x: -10, z: -10, rx: 0 },
      { x: 10, z: -10, rx: 0 },
      { x: 0, z: 30, rx: Math.PI / 2 },
    ]

    glassPositions.forEach((pos, index) => {
      const geometry = new THREE.BoxGeometry(5, 3, 0.1)
      const material = new THREE.MeshStandardMaterial({
        color: 0xaaddff,
        transparent: true,
        opacity: 0.4,
        roughness: 0.1,
        metalness: 0.9
      })
      const glass = new THREE.Mesh(geometry, material)
      glass.position.set(pos.x, 1.5, pos.z)
      glass.rotation.y = pos.rx
      glass.castShadow = true
      glass.receiveShadow = true
      glass.userData.collidable = true
      glass.userData.destructible = true
      glass.userData.health = 10
      glass.userData.id = `glass_${index}`
      this.scene.add(glass)
    })
  }

  private createDecorations() {
    this.createLamps()
    this.createBarrels()
  }

  private createLamps() {
    const lampPositions = [
      { x: -30, z: -30 }, { x: 30, z: -30 },
      { x: -30, z: 30 }, { x: 30, z: 30 },
    ]

    lampPositions.forEach(pos => {
      const poleGeometry = new THREE.CylinderGeometry(0.1, 0.15, 6, 8)
      const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 })
      const pole = new THREE.Mesh(poleGeometry, poleMaterial)
      pole.position.set(pos.x, 3, pos.z)
      pole.castShadow = true
      this.scene.add(pole)

      const lampGeometry = new THREE.SphereGeometry(0.4, 16, 16)
      const lampMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffaa,
        emissive: 0xffffaa,
        emissiveIntensity: 0.8
      })
      const lamp = new THREE.Mesh(lampGeometry, lampMaterial)
      lamp.position.set(pos.x, 6.2, pos.z)
      this.scene.add(lamp)

      const pointLight = new THREE.PointLight(0xffffaa, 0.5, 15)
      pointLight.position.copy(lamp.position)
      this.scene.add(pointLight)
    })
  }

  private createBarrels() {
    const barrelPositions = [
      { x: 15, z: 5 }, { x: 17, z: 5 },
      { x: -25, z: 15 },
    ]

    barrelPositions.forEach(pos => {
      const geometry = new THREE.CylinderGeometry(0.4, 0.4, 1.2, 16)
      const material = new THREE.MeshStandardMaterial({
        color: 0xcc3333,
        roughness: 0.6,
        metalness: 0.4
      })
      const barrel = new THREE.Mesh(geometry, material)
      barrel.position.set(pos.x, 0.6, pos.z)
      barrel.castShadow = true
      barrel.receiveShadow = true
      barrel.userData.collidable = true
      barrel.userData.physics = { type: 'dynamic', mass: 30, size: { x: 0.8, y: 1.2, z: 0.8 } }
      this.scene.add(barrel)
    })
  }
}
