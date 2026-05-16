import * as THREE from 'three'

interface PhysicsBody {
  position: THREE.Vector3
  velocity: THREE.Vector3
  mass: number
  isGrounded: boolean
  collider: {
    type: 'box' | 'capsule'
    size: THREE.Vector3
  }
}

export class PhysicsWorld {
  private gravity: number
  private bodies: Map<string, PhysicsBody>

  constructor() {
    this.gravity = -25
    this.bodies = new Map()
  }

  public addBody(id: string, body: PhysicsBody) {
    this.bodies.set(id, body)
  }

  public removeBody(id: string) {
    this.bodies.delete(id)
  }

  public update(deltaTime: number) {
    this.bodies.forEach(body => {
      this.applyGravity(body, deltaTime)
      this.updatePosition(body, deltaTime)
    })
  }

  private applyGravity(body: PhysicsBody, deltaTime: number) {
    if (!body.isGrounded) {
      body.velocity.y += this.gravity * deltaTime
    }
  }

  private updatePosition(body: PhysicsBody, deltaTime: number) {
    body.position.add(body.velocity.clone().multiplyScalar(deltaTime))
    
    if (body.position.y < 1) {
      body.position.y = 1
      body.velocity.y = 0
      body.isGrounded = true
    } else {
      body.isGrounded = false
    }
  }

  public checkCollision(
    position: THREE.Vector3,
    velocity: THREE.Vector3,
    deltaTime: number,
    collidableObjects: THREE.Mesh[]
  ): { correctedVelocity: THREE.Vector3; isGrounded: boolean } {
    let correctedVelocity = velocity.clone()
    let isGrounded = false
    
    const nextPos = position.clone().add(velocity.clone().multiplyScalar(deltaTime))
    const playerRadius = 0.5
    const playerHeight = 2

    for (const obj of collidableObjects) {
      if (!obj.userData.collidable) continue

      const objPos = obj.position
      const objSize = obj.userData.physics?.size || { x: 2, y: 2, z: 2 }

      const halfSize = {
        x: objSize.x / 2,
        y: objSize.y / 2,
        z: objSize.z / 2
      }

      const closestPoint = new THREE.Vector3(
        Math.max(objPos.x - halfSize.x, Math.min(nextPos.x, objPos.x + halfSize.x)),
        Math.max(objPos.y - halfSize.y, Math.min(nextPos.y + playerHeight / 2, objPos.y + halfSize.y)),
        Math.max(objPos.z - halfSize.z, Math.min(nextPos.z, objPos.z + halfSize.z))
      )

      const distance = nextPos.distanceTo(closestPoint)
      
      if (distance < playerRadius) {
        const pushDir = nextPos.clone().sub(closestPoint).normalize()
        const overlap = playerRadius - distance
        
        if (Math.abs(pushDir.y) > 0.7 && velocity.y <= 0) {
          isGrounded = true
          correctedVelocity.y = 0
        } else {
          correctedVelocity.add(pushDir.multiplyScalar(overlap / deltaTime))
        }
      }
    }

    return { correctedVelocity, isGrounded }
  }

  public raycast(
    origin: THREE.Vector3,
    direction: THREE.Vector3,
    maxDistance: number,
    objects: THREE.Mesh[]
  ): { hit: boolean; distance: number; point: THREE.Vector3; object: THREE.Mesh | null } {
    let closestHit = {
      hit: false,
      distance: maxDistance,
      point: new THREE.Vector3(),
      object: null as THREE.Mesh | null
    }

    const ray = new THREE.Raycaster(origin, direction, 0, maxDistance)

    for (const obj of objects) {
      if (!obj.userData.collidable) continue
      
      const intersects = ray.intersectObject(obj)
      
      if (intersects.length > 0) {
        const hit = intersects[0]
        if (hit.distance < closestHit.distance) {
          closestHit = {
            hit: true,
            distance: hit.distance,
            point: hit.point,
            object: obj
          }
        }
      }
    }

    return closestHit
  }
}
