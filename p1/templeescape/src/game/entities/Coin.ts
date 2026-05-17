import * as THREE from 'three';

export class Coin {
  public mesh: THREE.Group;
  public active: boolean = false;
  public collected: boolean = false;
  public lane: number = 0;
  public baseX: number = 0;

  constructor() {
    this.mesh = new THREE.Group();
    this.createMesh();
  }

  private createMesh(): void {
    const geometry = new THREE.CylinderGeometry(0.3, 0.3, 0.08, 16);
    const material = new THREE.MeshStandardMaterial({ 
      color: 0xffd700,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0xffa500,
      emissiveIntensity: 0.3,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = Math.PI / 2;
    mesh.castShadow = true;
    this.mesh.add(mesh);

    const glowGeometry = new THREE.RingGeometry(0.35, 0.45, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffd700, 
      transparent: true, 
      opacity: 0.4,
      side: THREE.DoubleSide,
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.rotation.x = Math.PI / 2;
    this.mesh.add(glow);
  }

  public activate(lane: number, zPosition: number, yOffset: number = 1): void {
    this.active = true;
    this.collected = false;
    this.lane = lane;
    this.mesh.visible = true;
    this.mesh.position.z = zPosition;
    this.mesh.position.y = yOffset;
  }

  public deactivate(): void {
    this.active = false;
    this.collected = false;
    this.mesh.visible = false;
  }

  public update(deltaTime: number, speed: number): void {
    if (!this.active) return;
    this.mesh.position.z += speed * deltaTime;
    this.mesh.rotation.y += deltaTime * 5;
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
