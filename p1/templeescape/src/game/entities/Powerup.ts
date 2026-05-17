import * as THREE from 'three';

export type PowerupType = 'magnet' | 'shield' | 'doubleScore';

export class Powerup {
  public mesh: THREE.Group;
  public type: PowerupType;
  public active: boolean = false;
  public collected: boolean = false;
  public lane: number = 0;
  public baseX: number = 0;

  constructor(type: PowerupType) {
    this.type = type;
    this.mesh = new THREE.Group();
    this.createMesh();
  }

  private createMesh(): void {
    let color: number;

    switch (this.type) {
      case 'magnet':
        color = 0x2196f3;
        break;
      case 'shield':
        color = 0x4caf50;
        break;
      case 'doubleScore':
        color = 0xff9800;
        break;
      default:
        color = 0xffffff;
    }

    const geometry = new THREE.OctahedronGeometry(0.5);
    const material = new THREE.MeshStandardMaterial({ 
      color,
      metalness: 0.5,
      roughness: 0.3,
      emissive: color,
      emissiveIntensity: 0.4,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    this.mesh.add(mesh);

    const ringGeometry = new THREE.TorusGeometry(0.7, 0.05, 8, 16);
    const ringMaterial = new THREE.MeshBasicMaterial({ 
      color, 
      transparent: true, 
      opacity: 0.6 
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    this.mesh.add(ring);
  }

  public activate(lane: number, zPosition: number): void {
    this.active = true;
    this.collected = false;
    this.lane = lane;
    this.mesh.visible = true;
    this.mesh.position.z = zPosition;
    this.mesh.position.y = 1.5;
  }

  public deactivate(): void {
    this.active = false;
    this.collected = false;
    this.mesh.visible = false;
  }

  public update(deltaTime: number, speed: number): void {
    if (!this.active) return;
    this.mesh.position.z += speed * deltaTime;
    this.mesh.rotation.y += deltaTime * 3;
    this.mesh.position.y = 1.5 + Math.sin(Date.now() * 0.003) * 0.2;
  }

  public collect(): void {
    this.collected = true;
    this.active = false;
    this.mesh.visible = false;
  }

  public getPosition(): THREE.Vector3 {
    return this.mesh.position.clone();
  }
}
