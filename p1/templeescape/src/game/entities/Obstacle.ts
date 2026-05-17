import * as THREE from 'three';
import { ObstacleConfig } from '../config/ThemeConfig';

export type ObstacleType = keyof typeof ObstacleConfig;

export class Obstacle {
  public mesh: THREE.Group;
  public type: ObstacleType;
  public active: boolean = false;
  public lane: number = 0;
  public baseX: number = 0;

  constructor(type: ObstacleType) {
    this.type = type;
    this.mesh = new THREE.Group();
    this.createMesh();
  }

  private createMesh(): void {
    const config = ObstacleConfig[this.type];
    let geometry: THREE.BufferGeometry;
    let material: THREE.MeshStandardMaterial;

    switch (this.type) {
      case 'treeStump':
        geometry = new THREE.CylinderGeometry(0.5, 0.6, 1, 8);
        material = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.9 });
        break;
      case 'fence':
        geometry = new THREE.BoxGeometry(0.2, 2, 2);
        material = new THREE.MeshStandardMaterial({ color: 0x8d6e63, roughness: 0.8 });
        break;
      case 'rock':
        geometry = new THREE.DodecahedronGeometry(0.8);
        material = new THREE.MeshStandardMaterial({ color: 0x78909c, roughness: 0.9 });
        break;
      case 'beam':
        geometry = new THREE.BoxGeometry(2, 0.5, 0.5);
        material = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.8 });
        this.mesh.position.y = (config as any).heightOffset || 1.5;
        break;
      case 'branch':
        geometry = new THREE.CylinderGeometry(0.15, 0.25, 1.5, 6);
        material = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.9 });
        this.mesh.position.y = (config as any).heightOffset || 1.8;
        this.mesh.rotation.z = Math.PI / 6;
        break;
      case 'spikes':
        geometry = new THREE.ConeGeometry(0.3, 0.6, 4);
        material = new THREE.MeshStandardMaterial({ color: 0x37474f, roughness: 0.5, metalness: 0.3 });
        for (let i = -1; i <= 1; i++) {
          const spike = new THREE.Mesh(geometry, material);
          spike.position.x = i * 0.5;
          spike.position.y = 0.3;
          spike.castShadow = true;
          this.mesh.add(spike);
        }
        return;
      case 'fire':
        geometry = new THREE.CylinderGeometry(0.3, 0.6, 1.5, 8);
        material = new THREE.MeshStandardMaterial({ 
          color: 0xff5722, 
          emissive: 0xff5722,
          emissiveIntensity: 0.5,
          transparent: true,
          opacity: 0.8,
        });
        break;
      default:
        geometry = new THREE.BoxGeometry(1, 1, 1);
        material = new THREE.MeshStandardMaterial({ color: 0x888888 });
    }

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    this.mesh.add(mesh);
  }

  public activate(lane: number, zPosition: number): void {
    this.active = true;
    this.lane = lane;
    this.mesh.visible = true;
    this.mesh.position.z = zPosition;
  }

  public deactivate(): void {
    this.active = false;
    this.mesh.visible = false;
  }

  public update(deltaTime: number, speed: number): void {
    if (!this.active) return;
    this.mesh.position.z += speed * deltaTime;

    if (this.type === 'fire') {
      const fire = this.mesh.children[0] as THREE.Mesh;
      fire.scale.y = 1 + Math.sin(Date.now() * 0.01) * 0.2;
    }
  }

  public getCollisionBox(): { min: THREE.Vector3; max: THREE.Vector3 } {
    const config = ObstacleConfig[this.type];
    const pos = this.mesh.position;
    const heightOffset = (config as any).heightOffset || 0;

    return {
      min: new THREE.Vector3(
        pos.x - config.width / 2,
        pos.y + heightOffset - config.height / 2,
        pos.z - config.depth / 2
      ),
      max: new THREE.Vector3(
        pos.x + config.width / 2,
        pos.y + heightOffset + config.height / 2,
        pos.z + config.depth / 2
      ),
    };
  }

  public isJumpable(): boolean {
    return ObstacleConfig[this.type].jumpable;
  }

  public isSlideable(): boolean {
    return ObstacleConfig[this.type].slideable;
  }
}
