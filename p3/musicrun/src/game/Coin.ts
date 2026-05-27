import * as THREE from 'three';
import { GAME_CONFIG, COLORS } from '../config';

export class Coin {
  private mesh: THREE.Group;
  private isActive = true;
  private isCollected = false;
  private worldPosition: number = 0;
  private lane: number = 0;
  private rotationSpeed: number = 2;
  
  constructor(scene: THREE.Scene) {
    this.mesh = this.createMesh();
    scene.add(this.mesh);
  }
  
  private createMesh(): THREE.Group {
    const group = new THREE.Group();
    
    const torusGeometry = new THREE.TorusGeometry(0.3, 0.08, 8, 16);
    const torusMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.ACCENT,
      emissive: COLORS.ACCENT,
      emissiveIntensity: 0.5,
      metalness: 0.9,
      roughness: 0.1,
    });
    const torus = new THREE.Mesh(torusGeometry, torusMaterial);
    torus.rotation.x = Math.PI / 2;
    group.add(torus);
    
    const innerGeometry = new THREE.CircleGeometry(0.15, 16);
    const innerMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
    });
    const inner = new THREE.Mesh(innerGeometry, innerMaterial);
    inner.rotation.x = -Math.PI / 2;
    inner.position.y = 0.01;
    group.add(inner);
    
    const glowGeometry = new THREE.SphereGeometry(0.4, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: COLORS.ACCENT,
      transparent: true,
      opacity: 0.1,
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    group.add(glow);
    
    return group;
  }
  
  update(delta: number, playerZ: number): void {
    if (!this.isActive) return;
    
    this.mesh.rotation.y += delta * this.rotationSpeed;
    
    const floatOffset = Math.sin(Date.now() * 0.003) * 0.1;
    this.mesh.position.y = 1 + floatOffset;
    
    const distance = this.worldPosition - playerZ;
    this.mesh.position.z = -distance;
    
    if (distance > GAME_CONFIG.VISIBLE_TRACK_LENGTH) {
      this.mesh.visible = false;
    } else if (distance < -5) {
      this.isActive = false;
      this.mesh.visible = false;
    } else {
      this.mesh.visible = true;
    }
  }
  
  setPosition(lane: number, worldZ: number): void {
    this.lane = lane;
    this.worldPosition = worldZ;
    
    const laneX = this.getLaneX(lane);
    this.mesh.position.x = laneX;
    this.mesh.position.z = -worldZ;
    this.mesh.position.y = 1;
    
    this.isActive = true;
    this.isCollected = false;
    this.mesh.visible = true;
  }
  
  private getLaneX(lane: number): number {
    const totalWidth = (GAME_CONFIG.LANE_COUNT - 1) * GAME_CONFIG.LANE_WIDTH;
    return lane * GAME_CONFIG.LANE_WIDTH - totalWidth / 2;
  }
  
  getWorldPosition(): number {
    return this.worldPosition;
  }
  
  getLane(): number {
    return this.lane;
  }
  
  getIsActive(): boolean {
    return this.isActive && !this.isCollected;
  }
  
  getBoundingBox(): THREE.Box3 {
    return new THREE.Box3().setFromObject(this.mesh);
  }
  
  collect(): void {
    this.isCollected = true;
    this.isActive = false;
    this.mesh.visible = false;
  }
  
  reset(): void {
    this.isActive = false;
    this.isCollected = false;
    this.mesh.visible = false;
  }
  
  dispose(scene: THREE.Scene): void {
    scene.remove(this.mesh);
    this.mesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
  }
}
